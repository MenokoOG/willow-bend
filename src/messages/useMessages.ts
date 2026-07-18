import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import type { PortalMessage } from "./types";
import { useAsync } from "../hooks";

export function useInbox(toEmail?: string) {
  const fetchInbox = async () => {
    if (!toEmail) return [];

    // No composite index needed without orderBy
    const q = query(
      collection(db, "messages"),
      where("toEmail", "==", toEmail)
    );

    const snap = await getDocs(q);

    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as PortalMessage[];

    // Sort in memory instead
    rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

    return rows;
  };

  const { value, loading, execute } = useAsync(fetchInbox, [toEmail]);

  const markRead = async (id: string) => {
    await updateDoc(doc(db, "messages", id), { readAt: Date.now() });
    await execute();
  };

  return { messages: value ?? [], loading, refresh: execute, markRead };
}

export function useSendMessage() {
  const send = async (msg: Omit<PortalMessage, "id" | "createdAt">) => {
    await addDoc(collection(db, "messages"), {
      ...msg,
      createdAt: Date.now(),
    });
  };

  return { send };
}

/** Admin: full message management (list all, edit, delete). */
export function useAdminMessages() {
  const fetchAll = async () => {
    const snap = await getDocs(collection(db, "messages"));
    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as PortalMessage[];
    rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return rows;
  };

  const { value, loading, execute } = useAsync(fetchAll, []);

  const updateMessage = async (
    id: string,
    patch: Pick<PortalMessage, "subject" | "body">
  ) => {
    await updateDoc(doc(db, "messages", id), {
      subject: patch.subject,
      body: patch.body,
      editedAt: Date.now(),
    });
    await execute();
  };

  const deleteMessage = async (id: string) => {
    await deleteDoc(doc(db, "messages", id));
    await execute();
  };

  return {
    messages: value ?? [],
    loading,
    refresh: execute,
    updateMessage,
    deleteMessage,
  };
}
