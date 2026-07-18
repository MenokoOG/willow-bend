import { useMemo, useState } from "react";
import { useAppointments } from "../../appointments/useAppointments";
import { useAuth } from "../../auth/AuthContext";
import usePageMeta from "../../seo/usePageMeta";

export default function RequestAppointment() {
  usePageMeta({
    title: "Request Appointment • Willow Bend Family Clinic",
    description: "Submit an appointment request.",
    canonicalPath: "/request",
  });

  const { request } = useAppointments();
  const { user, profile } = useAuth();

  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const isAuthed = !!user;

  const defaultName = useMemo(() => {
    const n =
      profile?.displayName?.trim() ||
      user?.displayName?.trim() ||
      "";
    return n;
  }, [profile?.displayName, user?.displayName]);

  const defaultEmail = useMemo(() => {
    return (profile?.email || user?.email || "").trim();
  }, [profile?.email, user?.email]);

  const lockedEmail = isAuthed && !!defaultEmail;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");
    setSent(false);

    try {
      const form = e.target as HTMLFormElement;
      const data = Object.fromEntries(new FormData(form)) as any;

      const patientName = String(data.name || "").trim();
      const patientEmail = lockedEmail
        ? defaultEmail
        : String(data.email || "").trim();

      const date = String(data.date || "").trim();
      const time = String(data.time || "").trim();

      if (!patientName) throw new Error("Name is required.");
      if (!patientEmail || !patientEmail.includes("@"))
        throw new Error("A valid email is required.");
      if (!date) throw new Error("Date is required.");
      if (!time) throw new Error("Time is required.");

      await request({
        patientName,
        patientEmail,
        patientUid: isAuthed ? user?.uid : undefined, // ✅ Sync key for portal
        date,
        time,
      });

      setSent(true);
      form.reset();

      // Restore locked defaults after reset if logged in
      if (isAuthed) {
        const nameEl = form.querySelector<HTMLInputElement>('input[name="name"]');
        const emailEl = form.querySelector<HTMLInputElement>('input[name="email"]');
        if (nameEl && defaultName) nameEl.value = defaultName;
        if (emailEl && defaultEmail) emailEl.value = defaultEmail;
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="max-w-xl mx-auto space-y-5">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold" style={{ color: "var(--text)" }}>
          Request Appointment
        </h1>
        <p className="text-[1.05rem]" style={{ color: "var(--muted)" }}>
          Submit a request and our team will follow up.
        </p>

        {isAuthed ? (
          <div className="pill pill--approved" role="status">
            Signed in — your portal will track status automatically.
          </div>
        ) : (
          <div className="pill pill--requested" role="status">
            Tip: Create an account to track your appointment status.
          </div>
        )}
      </header>

      <div className="card p-6 sm:p-7">
        {sent && (
          <div className="mb-4 pill pill--approved" role="status">
            Request submitted.
          </div>
        )}

        {error && (
          <div className="mb-4 card p-4" style={{ borderColor: "var(--danger)" }}>
            <div className="font-semibold" style={{ color: "var(--danger)" }}>
              Error
            </div>
            <div style={{ color: "var(--muted)" }}>{error}</div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-5" aria-busy={busy}>
          <div className="space-y-2">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--muted)" }}
            >
              Name
            </label>
            <input
              name="name"
              required
              placeholder="Your name"
              className="input"
              defaultValue={defaultName}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--muted)" }}
            >
              Email
            </label>
            <input
              name="email"
              required
              placeholder="you@example.com"
              className="input"
              defaultValue={defaultEmail}
              autoComplete="email"
              inputMode="email"
              readOnly={lockedEmail}
              aria-readonly={lockedEmail}
              title={lockedEmail ? "Email locked to your signed-in account." : undefined}
              style={
                lockedEmail
                  ? {
                      cursor: "not-allowed",
                      opacity: 0.95,
                      background: "color-mix(in srgb, var(--panel2) 70%, transparent)",
                    }
                  : undefined
              }
            />
            {lockedEmail && (
              <div className="text-xs" style={{ color: "var(--muted2)" }}>
                Email is locked to keep your portal perfectly in sync.
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                className="text-sm font-semibold"
                style={{ color: "var(--muted)" }}
              >
                Date
              </label>
              <input name="date" required type="date" className="input" />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-semibold"
                style={{ color: "var(--muted)" }}
              >
                Time
              </label>
              <input name="time" required type="time" className="input" />
            </div>
          </div>

          <button className="btn-hero w-full sm:w-auto" disabled={busy}>
            {busy ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </section>
  );
}