export interface PortalMessage {
  id?: string;

  toEmail: string;
  toUid?: string;

  fromEmail?: string; // admin email
  fromRole: "admin" | "system";

  appointmentId?: string;

  subject: string;
  body: string;

  createdAt: number;

  // optional
  readAt?: number;
}
