export type AppRole = "user" | "admin";

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  role: AppRole;
  createdAt: number;
};
