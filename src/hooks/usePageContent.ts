import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { useAsync } from ".";
import { pageSchemas } from "../data/pageSchemas";
import { auth } from "../firebase/auth";

export default function usePageContent(pageId: string) {
  const ref = doc(db, "content", "pages", "pages", pageId);

  const { value, loading, error } = useAsync(async () => {
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    // ✅ No write on public load. Use defaults locally.
    return pageSchemas[pageId];
  }, [pageId]);

  const save = async (data: Record<string, string>) => {
    // Admin-only should be allowed by rules.
    await setDoc(ref, data, { merge: true });
  };

  return { data: value, loading, error, save };
}
