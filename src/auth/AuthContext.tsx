import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, googleProvider } from "../firebase/auth";
import { db } from "../firebase/firestore";
import type { AppRole, UserProfile } from "./types";
import { isAdminEmail } from "./adminEmails";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  role: AppRole | null;
  loading: boolean;

  // Email/password (optional)
  login: (email: string, password: string) => Promise<void>;
  signup: (args: {
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<void>;

  // Google (recommended)
  loginWithGoogle: () => Promise<void>;

  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveRole(email?: string | null, existing?: AppRole): AppRole {
  // Hard guarantee: Jeff is always admin when using that email.
  if (isAdminEmail(email)) return "admin";
  return existing ?? "user";
}

async function ensureUserProfile(u: User): Promise<UserProfile> {
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);

  const desiredRole = deriveRole(u.email, undefined);

  if (snap.exists()) {
    const data = snap.data() as Partial<UserProfile>;
    const role = deriveRole(u.email, data.role as AppRole | undefined);

    const merged: UserProfile = {
      uid: u.uid,
      email: u.email ?? "",
      displayName: (u.displayName ?? data.displayName) || undefined,
      role,
      createdAt:
        typeof data.createdAt === "number" ? data.createdAt : Date.now(),
    };

    // If the stored doc role is not admin but this email should be admin, elevate it.
    // (Requires rules allowing the user to write their own profile doc.)
    if (data.role !== role) {
      await setDoc(
        ref,
        {
          role,
          updatedAtServer: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return merged;
  }

  const profile: UserProfile = {
    uid: u.uid,
    email: u.email ?? "",
    displayName: u.displayName ?? undefined,
    role: desiredRole,
    createdAt: Date.now(),
  };

  await setDoc(
    ref,
    {
      ...profile,
      createdAtServer: serverTimestamp(),
    },
    { merge: true }
  );

  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const p = await ensureUserProfile(u);
        setProfile(p);
      } catch (err) {
        // Auth can still be valid even if Firestore rules block profile writes.
        // In that case: keep user, but role/profile may be null.
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signup = async (args: {
    email: string;
    password: string;
    displayName?: string;
  }) => {
    const email = args.email.trim();
    const password = args.password;

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (args.displayName?.trim()) {
      await updateProfile(cred.user, { displayName: args.displayName.trim() });
    }

    try {
      const p = await ensureUserProfile(cred.user);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      login,
      signup,
      loginWithGoogle,
      logout,
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
