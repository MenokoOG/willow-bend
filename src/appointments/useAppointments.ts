import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  runTransaction,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import type { Appointment, ArchivedAppointment } from "./types";
import { useAsync } from "../hooks";

type Actor =
  | { role: "admin"; uid?: string; email?: string }
  | { role: "patient"; uid?: string; email: string }
  | { role: "system"; uid?: string; email?: string };

function toAppointmentDateTimeMs(a: Pick<Appointment, "date" | "time">) {
  const [y, m, d] = a.date.split("-").map(Number);
  const [hh, mm] = a.time.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0).getTime();
}

function uniqKey(a: Appointment) {
  // Prefer Firestore id
  if (a.id) return a.id;
  // fallback key
  return `${a.patientEmail}-${a.date}-${a.time}-${a.createdAt}`;
}

export function useAppointments() {
  // Admin / internal: fetch everything (existing behavior)
  const fetchAll = async () => {
    const snap = await getDocs(collection(db, "appointments"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Appointment[];
  };

  const { value, loading, execute } = useAsync(fetchAll, []);

  // Create appointment request (public)
  const request = async (
    data: Omit<Appointment, "id" | "status" | "createdAt">
  ) => {
    await addDoc(collection(db, "appointments"), {
      ...data,
      status: "requested",
      createdAt: Date.now(),
    });
    await execute();
  };

  // Admin updates status
  const updateStatus = async (id: string, status: Appointment["status"]) => {
    await updateDoc(doc(db, "appointments", id), { status });
    await execute();
  };

  /**
   * Archive + delete (transaction)
   * - Writes full appointment into appointments_archive/{id}
   * - Deletes appointments/{id}
   * - Adds flags if deleted before scheduled date/time
   */
  const archiveAndDelete = async (id: string, actor: Actor) => {
    const srcRef = doc(db, "appointments", id);
    const dstRef = doc(db, "appointments_archive", id);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(srcRef);
      if (!snap.exists()) {
        throw new Error("Appointment not found (already deleted).");
      }

      const appt = { id: snap.id, ...(snap.data() as any) } as Appointment;
      const now = Date.now();
      const apptMs = toAppointmentDateTimeMs(appt);

      const deletedBeforeAppointment = now < apptMs;
      const deletedWhileApproved = appt.status === "approved";

      const archive: ArchivedAppointment = {
        ...appt,
        archivedAt: now,
        archivedBy: {
          uid: actor.uid,
          email: actor.email,
          role: actor.role,
        },
        archiveReason:
          actor.role === "admin"
            ? "admin_deleted"
            : actor.role === "patient"
            ? "patient_deleted"
            : "cleanup",
        flags: {
          deletedBeforeAppointment,
          deletedWhileApproved,
        },
      };

      tx.set(dstRef, archive);
      tx.delete(srcRef);
    });

    await execute();
  };

  /**
   * Patient portal: LIVE subscribe (UID-first + email fallback)
   *
   * This calls cb(rows) every time the database changes.
   * Returns an unsubscribe function.
   */
  const subscribeForPatient = (
    args: { uid?: string | null; email?: string | null },
    cb: (rows: Appointment[]) => void,
    onError?: (err: unknown) => void
  ) => {
    const uid = args.uid ?? undefined;
    const email = args.email?.trim() ?? undefined;

    const unsubscribers: Array<() => void> = [];
    const map = new Map<string, Appointment>();

    const emit = () => {
      const out = Array.from(map.values());
      out.sort((a, b) => toAppointmentDateTimeMs(a) - toAppointmentDateTimeMs(b));
      cb(out);
    };

    // UID subscription
    if (uid) {
      const qUid = query(
        collection(db, "appointments"),
        where("patientUid", "==", uid)
      );

      const unsub = onSnapshot(
        qUid,
        (snap) => {
          // Remove previous UID items before re-adding? Not needed:
          // We'll just upsert based on doc id.
          snap.docs.forEach((d) => {
            const a = { id: d.id, ...(d.data() as any) } as Appointment;
            map.set(uniqKey(a), a);
          });
          emit();
        },
        (err) => onError?.(err)
      );

      unsubscribers.push(unsub);
    }

    // Email subscription (fallback / legacy requests)
    if (email) {
      const qEmail = query(
        collection(db, "appointments"),
        where("patientEmail", "==", email)
      );

      const unsub = onSnapshot(
        qEmail,
        (snap) => {
          snap.docs.forEach((d) => {
            const a = { id: d.id, ...(d.data() as any) } as Appointment;
            map.set(uniqKey(a), a);
          });
          emit();
        },
        (err) => onError?.(err)
      );

      unsubscribers.push(unsub);
    }

    // If neither exists, just emit empty list
    if (!uid && !email) cb([]);

    return () => {
      unsubscribers.forEach((u) => u());
    };
  };

  return {
    // Admin list
    appointments: value ?? [],
    loading,
    refresh: execute,

    // Writes
    request,
    updateStatus,
    archiveAndDelete,

    // Live subscribe
    subscribeForPatient,
  };
}