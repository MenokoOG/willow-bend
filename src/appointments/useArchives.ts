import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import type { ArchivedAppointment } from "./types";
import { useAsync } from "../hooks";

const ARCHIVE_COLLECTION = "appointments_archive";
const BATCH_LIMIT = 450; // Firestore batch cap is 500

/** Admin: view and clear archived (deleted) appointments. */
export function useArchives() {
  const fetchAll = async () => {
    const snap = await getDocs(collection(db, ARCHIVE_COLLECTION));
    const rows = snap.docs.map((d) => ({
      ...(d.data() as ArchivedAppointment),
      id: d.id,
    }));
    rows.sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0));
    return rows;
  };

  const { value, loading, execute } = useAsync(fetchAll, []);

  const deleteArchive = async (id: string) => {
    await deleteDoc(doc(db, ARCHIVE_COLLECTION, id));
    await execute();
  };

  /** Permanently delete archives older than `days` (0 = clear everything).
   *  Returns the number of entries deleted. */
  const clearOlderThan = async (days: number) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const rows = (value ?? []).filter(
      (a) => days === 0 || (a.archivedAt ?? 0) < cutoff
    );

    for (let i = 0; i < rows.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      for (const row of rows.slice(i, i + BATCH_LIMIT)) {
        if (row.id) batch.delete(doc(db, ARCHIVE_COLLECTION, row.id));
      }
      await batch.commit();
    }

    await execute();
    return rows.length;
  };

  return {
    archives: value ?? [],
    loading,
    refresh: execute,
    deleteArchive,
    clearOlderThan,
  };
}
