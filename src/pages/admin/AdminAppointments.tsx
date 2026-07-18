import { useAppointments } from "../../appointments/useAppointments";
import Calendar from "../../calendar/Calendar";
import usePageMeta from "../../seo/usePageMeta";
import { useMemo, useState } from "react";
import type { AppointmentStatus } from "../../appointments/types";
import { useAuth } from "../../auth/AuthContext";
import { useSendMessage } from "../../messages/useMessages";

function pillFor(status: AppointmentStatus) {
  if (status === "approved") return "pill pill--approved";
  if (status === "rejected") return "pill pill--rejected";
  if (status === "canceled") return "pill pill--canceled";
  return "pill pill--requested";
}

export default function AdminAppointments() {
  usePageMeta({
    title: "Manage Appointments | Admin | Willow Bend Family Clinic",
    description:
      "Admin appointment management: review requests and approve, reject, cancel, delete, and message patients.",
    canonicalPath: "/admin/appointments",
  });

  const { profile } = useAuth();
  const { appointments, loading, updateStatus, archiveAndDelete } =
    useAppointments();

  const { send } = useSendMessage();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // message modal-ish state
  const [msgForId, setMsgForId] = useState<string | null>(null);
  const [subject, setSubject] = useState("Reschedule request");
  const [body, setBody] = useState(
    "Hi — we need to reschedule your appointment. Please reply with 2–3 times that work for you."
  );

  const list = useMemo(() => {
    return selectedDate
      ? appointments.filter((a) => a.date === selectedDate)
      : appointments;
  }, [appointments, selectedDate]);

  async function onDelete(id: string) {
    setError(null);
    const ok = window.confirm(
      "Delete this appointment? This will ARCHIVE it and remove it from the active calendar."
    );
    if (!ok) return;

    try {
      setBusyId(id);
      await archiveAndDelete(id, {
        role: "admin",
        email: profile?.email ?? undefined,
        uid: profile?.uid ?? undefined,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to delete appointment.");
    } finally {
      setBusyId(null);
    }
  }

  async function onSendMessage(apptId: string, toEmail: string) {
    setError(null);
    if (!subject.trim() || !body.trim()) {
      setError("Subject and message body are required.");
      return;
    }

    try {
      setBusyId(apptId);
      await send({
        toEmail,
        fromEmail: profile?.email ?? undefined,
        fromRole: "admin",
        appointmentId: apptId,
        subject: subject.trim(),
        body: body.trim(),
      });
      setMsgForId(null);
    } catch (e: any) {
      setError(e?.message || "Failed to send message.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className="p-8">Loading…</div>;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Appointments</h1>
        <p className="text-[1.05rem]" style={{ color: "var(--muted)" }}>
          Select a day on the calendar to filter appointments. Admin can
          approve, reject, cancel, delete (archive), and message patients to
          reschedule.
        </p>

        {error && (
          <div className="card p-4" style={{ borderColor: "var(--danger)" }}>
            <div className="font-semibold" style={{ color: "var(--danger)" }}>
              Error
            </div>
            <div style={{ color: "var(--muted)" }}>{error}</div>
          </div>
        )}
      </header>

      <Calendar
        appointments={appointments}
        onSelect={(date) => setSelectedDate(date)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {selectedDate
            ? `Appointments for ${selectedDate}`
            : "All appointments"}
        </h2>

        {selectedDate && (
          <button
            className="btn-ghost"
            type="button"
            onClick={() => setSelectedDate(null)}
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="space-y-4" aria-live="polite">
        {list.length === 0 && (
          <div className="card p-5">No appointments found.</div>
        )}

        {list.map((a) => {
          const isBusy = busyId === a.id;

          return (
            <div key={a.id} className="card p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-lg font-semibold">{a.patientName}</div>

                  <div className="text-sm" style={{ color: "var(--muted)" }}>
                    {a.date} @ {a.time}
                  </div>

                  <div className={pillFor(a.status)}>
                    Status: <span className="font-semibold">{a.status}</span>
                  </div>

                  <div className="text-sm" style={{ color: "var(--muted)" }}>
                    {a.patientEmail}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className="btn-hero"
                      type="button"
                      disabled={isBusy}
                      onClick={() => updateStatus(a.id!, "approved")}
                    >
                      Approve
                    </button>

                    <button
                      className="btn-ghost"
                      type="button"
                      disabled={isBusy}
                      onClick={() => updateStatus(a.id!, "rejected")}
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--warn) 40%, var(--border))",
                      }}
                    >
                      Reject
                    </button>

                    <button
                      className="btn-ghost"
                      type="button"
                      disabled={isBusy}
                      onClick={() => updateStatus(a.id!, "canceled")}
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--danger) 40%, var(--border))",
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className="btn-ghost"
                      type="button"
                      disabled={isBusy}
                      onClick={() => setMsgForId(a.id!)}
                    >
                      Message patient (reschedule)
                    </button>

                    <button
                      className="btn-ghost"
                      type="button"
                      disabled={isBusy}
                      onClick={() => onDelete(a.id!)}
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--danger) 55%, var(--border))",
                      }}
                    >
                      Delete (Archive)
                    </button>
                  </div>
                </div>
              </div>

              {msgForId === a.id && (
                <div className="mt-5 card p-4">
                  <div className="text-sm font-semibold">Send message</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    This will appear inside the patient portal (and can later be
                    emailed too).
                  </div>

                  <div className="mt-3 space-y-3">
                    <label className="block space-y-2">
                      <div
                        className="text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        Subject
                      </div>
                      <input
                        className="input"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </label>

                    <label className="block space-y-2">
                      <div
                        className="text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        Message
                      </div>
                      <textarea
                        className="input"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                      />
                    </label>

                    <div className="flex gap-2">
                      <button
                        className="btn-hero"
                        type="button"
                        disabled={isBusy}
                        onClick={() => onSendMessage(a.id!, a.patientEmail)}
                      >
                        Send
                      </button>
                      <button
                        className="btn-ghost"
                        type="button"
                        onClick={() => setMsgForId(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
