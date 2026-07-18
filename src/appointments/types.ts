export type AppointmentStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "canceled";

export interface Appointment {
  id?: string;

  patientName: string;
  patientEmail: string;

  // Optional: if patient is logged in when requesting
  patientUid?: string;

  date: string; // YYYY-MM-DD
  time: string; // HH:mm

  status: AppointmentStatus;
  createdAt: number;
}

/** Stored only in archive collection */
export interface ArchivedAppointment extends Appointment {
  archivedAt: number;

  // Who did it
  archivedBy: {
    uid?: string;
    email?: string;
    role: "admin" | "patient" | "system";
  };

  // Why / how
  archiveReason: "deleted" | "patient_deleted" | "admin_deleted" | "cleanup";

  // “Error handling” signals
  flags: {
    deletedBeforeAppointment: boolean;
    deletedWhileApproved: boolean;
  };
}
