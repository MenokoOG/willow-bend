export const ADMIN_EMAILS = [
  "jefftkddan@gmail.com",
] as const;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((a) => a.toLowerCase() === e);
}
