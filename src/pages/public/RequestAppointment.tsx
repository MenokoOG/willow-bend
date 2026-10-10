import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppointments } from "../../appointments/useAppointments";
import { useAuth } from "../../auth/AuthContext";
import usePageMeta from "../../seo/usePageMeta";

const PATIENT_TYPES = ["New patient", "Existing patient", "My child / dependent"];
const TIME_PREFS = ["Morning", "Afternoon", "Evening", "No preference"];
const REASONS = [
  "Primary care / checkup",
  "Sick visit",
  "Pediatric visit",
  "Sports or school physical",
  "Medication refill / review",
  "Chronic care follow-up",
  "Something else",
];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`chip ${active ? "chip--active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function StepLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold">
      <span style={{ color: "var(--link)" }}>{n} ·</span>
      <span>{children}</span>
    </div>
  );
}

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

  // Mockup chip selectors — presentation/preference state only; the
  // appointment record itself stays {name, email, date, time} for now.
  const [patientType, setPatientType] = useState(PATIENT_TYPES[0]);
  const [timePref, setTimePref] = useState(TIME_PREFS[3]);

  const isAuthed = !!user;

  const defaultName = useMemo(() => {
    return profile?.displayName?.trim() || user?.displayName?.trim() || "";
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
    <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
      {/* ============ FORM COLUMN ============ */}
      <section className="space-y-6">
        <header className="space-y-3">
          <div className="eyebrow">Request an appointment</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Let's find a time that works
          </h1>
          <p className="text-base" style={{ color: "var(--muted)" }}>
            Submit a request and our team will follow up to confirm — every
            appointment is reviewed and approved by clinic staff.
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

        <div className="card p-6 sm:p-8">
          {sent && (
            <div className="mb-4 pill pill--approved" role="status">
              Request submitted. We reply within one business day.
            </div>
          )}

          {error && (
            <div
              className="mb-4 card p-4"
              style={{ borderColor: "var(--danger)" }}
            >
              <div className="font-semibold" style={{ color: "var(--danger)" }}>
                Error
              </div>
              <div style={{ color: "var(--muted)" }}>{error}</div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-7" aria-busy={busy}>
            {/* Step 1 */}
            <fieldset className="space-y-3">
              <legend className="contents">
                <StepLabel n="1">Who is this visit for?</StepLabel>
              </legend>
              <div className="flex flex-wrap gap-2">
                {PATIENT_TYPES.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    active={patientType === t}
                    onClick={() => setPatientType(t)}
                  />
                ))}
              </div>
            </fieldset>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="req-name"
                  className="text-sm font-semibold"
                  style={{ color: "var(--muted)" }}
                >
                  Name
                </label>
                <input
                  id="req-name"
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
                  htmlFor="req-email"
                  className="text-sm font-semibold"
                  style={{ color: "var(--muted)" }}
                >
                  Email
                </label>
                <input
                  id="req-email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="input"
                  defaultValue={defaultEmail}
                  autoComplete="email"
                  inputMode="email"
                  readOnly={lockedEmail}
                  aria-readonly={lockedEmail}
                  title={
                    lockedEmail
                      ? "Email locked to your signed-in account."
                      : undefined
                  }
                  style={
                    lockedEmail
                      ? {
                          cursor: "not-allowed",
                          opacity: 0.95,
                          background: "var(--sage-tint)",
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
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <StepLabel n="2">What do you need?</StepLabel>
              <div className="relative">
                <label htmlFor="req-reason" className="sr-only">
                  Reason for visit
                </label>
                <select
                  id="req-reason"
                  name="reason"
                  className="input appearance-none pr-10"
                  defaultValue={REASONS[0]}
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <fieldset className="space-y-3">
              <legend className="contents">
                <StepLabel n="3">When works best?</StepLabel>
              </legend>
              <div className="flex flex-wrap gap-2">
                {TIME_PREFS.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    active={timePref === t}
                    onClick={() => setTimePref(t)}
                  />
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2">
                  <label
                    htmlFor="req-date"
                    className="text-sm font-semibold"
                    style={{ color: "var(--muted)" }}
                  >
                    Preferred date
                  </label>
                  <input
                    id="req-date"
                    name="date"
                    required
                    type="date"
                    className="input"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="req-time"
                    className="text-sm font-semibold"
                    style={{ color: "var(--muted)" }}
                  >
                    Preferred time
                  </label>
                  <input
                    id="req-time"
                    name="time"
                    required
                    type="time"
                    className="input"
                  />
                </div>
              </div>
            </fieldset>

            <div className="space-y-2">
              <label
                htmlFor="req-notes"
                className="text-sm font-semibold"
                style={{ color: "var(--muted)" }}
              >
                Anything else we should know? (optional)
              </label>
              <textarea
                id="req-notes"
                name="notes"
                className="input"
                rows={4}
                placeholder="Symptoms, questions, scheduling constraints…"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button className="btn-hero" disabled={busy}>
                {busy ? "Submitting…" : "Submit request"}
              </button>
              <span className="text-sm" style={{ color: "var(--muted2)" }}>
                We reply within one business day.
              </span>
            </div>
          </form>
        </div>
      </section>

      {/* ============ ASIDE RAIL ============ */}
      <aside className="space-y-5 lg:sticky lg:top-24">
        <div
          className="rounded-3xl p-6 space-y-4"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--panel-line)",
          }}
        >
          <h2 className="text-lg font-bold">What to expect</h2>
          {[
            "We review your request — a real person, not an algorithm.",
            "You'll get a reply within one business day to confirm a time.",
            "Come on in — we'll greet you by name.",
          ].map((step, i) => (
            <div key={step} className="flex gap-3">
              <span
                className="font-display grid place-items-center h-[30px] w-[30px] rounded-full text-sm font-extrabold shrink-0"
                style={{
                  background: "var(--sage-tint)",
                  color: "var(--link)",
                }}
                aria-hidden
              >
                {i + 1}
              </span>
              <p className="text-sm pt-1" style={{ color: "var(--muted)" }}>
                {step}
              </p>
            </div>
          ))}
        </div>

        <div className="band--gradient p-6 space-y-3">
          <h2 className="text-lg font-bold">Prefer to just ask?</h2>
          <p className="text-sm" style={{ color: "var(--band-muted)" }}>
            Willow, our care assistant, can answer questions and walk you
            through scheduling any time.
          </p>
          <Link
            to="/help"
            className="btn-hero"
          >
            Chat with Willow
          </Link>
        </div>

        <div
          className="rounded-2xl p-4 text-sm"
          style={{
            background: "var(--clay-tint)",
            border: "1px solid var(--panel-line)",
            color: "var(--muted)",
          }}
        >
          This form is not for emergencies. In an emergency, call 911 or go to
          the nearest emergency department.
        </div>
      </aside>
    </div>
  );
}
