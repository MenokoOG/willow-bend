// Admin allowlist, read from the VITE_ADMIN_EMAILS env var
// (comma-separated, e.g. "admin1@example.com,admin2@example.com").
// This only gates the client UI — real enforcement is the Firestore
// security rules, which must list the same emails in isAdminEmail().
export const ADMIN_EMAILS: readonly string[] = (
  import.meta.env.VITE_ADMIN_EMAILS ?? ""
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(e);
}
