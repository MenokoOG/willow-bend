import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "./config";

export const firebaseAuth = getAuth(firebaseApp);

// Keep BOTH names so older imports work:
export const auth = firebaseAuth;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
