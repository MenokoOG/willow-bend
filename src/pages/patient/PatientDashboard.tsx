import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import usePageMeta from "../../seo/usePageMeta";
import { useInbox } from "../../messages/useMessages";
import { useAppointments } from "../../appointments/useAppointments";
import { useEffect, useMemo, useState } from "react";

function initials(text: string) {
  const parts = text.trim().split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function todayISO() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const QUICK_ACTIONS = [
  {
    to: "/request",
    title: "Book a visit",
    desc: "Submit a new appointment request.",
    tint: "sage" as const,
  },
  {
    to: "/patient/calendar",
    title: "My calendar",
    desc: "See your appointments by month.",
    tint: "clay" as const,
  },
  {
    to: "#messages",
    title: "Messages",
    desc: "Read notes from the care team.",
    tint: "sage" as const,
  },
  {
    to: "/help",
    title: "Ask Willow",
    desc: "Instant answers, day or night.",
    tint: "clay" as const,
  },
];

export default function PatientDashboard() {
  usePageMeta({
    title: "Patient Portal • Willow Bend Family Clinic",
    description: "Patient portal dashboard.",
    noIndex: true,
  });

  const { profile, logout } = useAuth();
  const email = profile?.email ?? "";
  const firstName =
    profile?.displayName?.trim().split(/\s+/)[0] || email.split("@")[0] || "there";

  const { messages, loading: msgLoading, markRead } = useInbox(email);
  const { subscribeForPatient, archiveAndDelete } = useAppointments();

  const [myAppts, setMyAppts] = useState<any[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Live sync — same subscription the calendar uses
  useEffect(() => {
    setErr(null);
    setApptLoading(true);

    const unsub = subscribeForPatient(
      { uid: profile?.uid ?? null, email: email || null },
      (rows) => {
        setMyAppts(rows);
        setApptLoading(false);
      },
      (e) => {
        setErr((e as any)?.message || "Failed to load appointments.");
        setApptLoading(false);
      }
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, profile?.uid]);

  const unreadCount = useMemo(
    () => (messages || []).filter((m) => !m.readAt).length,
    [messages]
  );

  const nextAppt = useMemo(() => {
    const today = todayISO();
    return (
      [...myAppts]
        .filter(
          (a) =>
            (a.status === "approved" || a.status === "requested") &&
            a.date >= today
        )
        .sort((a, b) =>
          `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
        )[0] ?? null
    );
  }, [myAppts]);

  async function onDelete(id: string) {
    setErr(null);
    const ok = window.confirm(
      "Delete this appointment? This will remove it from your view and archive it."
    );
    if (!ok) return;

    try {
      await archiveAndDelete(id, {
        role: "patient",
        email,
        uid: profile?.uid,
      });
      // Live subscription picks up the removal automatically.
    } catch (e: any) {
      setErr(e?.message || "Failed to delete appointment.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-start">
      {/* ============ SIDEBAR (desktop) ============ */}
      <aside className="hidden lg:flex flex-col gap-1 sticky top-24">
        <Link
          to="/patient"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: "var(--sage-tint)",
            color: "var(--link)",
            border: "1px solid var(--line)",
          }}
        >
          Dashboard
        </Link>
        <Link
          to="/patient/calendar"
          className="px-3 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-[color:var(--sage-tint)]"
          style={{ color: "var(--ink2)" }}
        >
          My calendar
        </Link>
        <a
          href="#messages"
          className="px-3 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-[color:var(--sage-tint)]"
          style={{ color: "var(--ink2)" }}
        >
          Messages{unreadCount ? ` (${unreadCount})` : ""}
        </a>
        <a
          href="#appointments"
          className="px-3 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-[color:var(--sage-tint)]"
          style={{ color: "var(--ink2)" }}
        >
          Appointments
        </a>

        <div
          className="my-3"
          style={{ borderTop: "1px solid var(--line2)" }}
        />
        <button
          onClick={logout}
          className="px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition hover:bg-[color:var(--sage-tint)]"
          style={{ color: "var(--ink2)" }}
        >
          Log out
        </button>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="space-y-8 min-w-0">
        {/* Greeting */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Hi, {firstName} 👋
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              Signed in as{" "}
              <span className="font-medium" style={{ color: "var(--ink)" }}>
                {email}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="font-display grid place-items-center h-10 w-10 rounded-full font-bold"
              style={{ background: "var(--sage-tint)", color: "var(--link)" }}
              aria-hidden
            >
              {initials(profile?.displayName || email)}
            </span>
            <button onClick={logout} className="btn-ghost text-sm !px-4 !py-2 lg:hidden">
              Log out
            </button>
          </div>
        </section>

        {err && (
          <div className="card p-4" style={{ borderColor: "var(--danger)" }}>
            <div className="font-semibold" style={{ color: "var(--danger)" }}>
              Error
            </div>
            <div className="text-muted">{err}</div>
          </div>
        )}

        {/* Next appointment */}
        <section className="band--gradient p-6 sm:p-8">
          {nextAppt ? (
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="space-y-2">
                <div
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--yellow)" }}
                >
                  Next appointment
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {nextAppt.date} at {nextAppt.time}
                </div>
                <span className={`pill pill--${nextAppt.status}`}>
                  {nextAppt.status === "approved"
                    ? "Confirmed by the clinic"
                    : "Awaiting clinic approval"}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/patient/calendar"
                  className="btn-hero"
                >
                  View calendar
                </Link>
                <Link
                  to="/request"
                  className="btn-ghost"
                >
                  Request another
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="text-xl sm:text-2xl font-bold">
                  No upcoming visits
                </div>
                <p className="text-sm" style={{ color: "var(--band-muted)" }}>
                  {apptLoading
                    ? "Loading your appointments…"
                    : "Ready when you are — request a time that works for you."}
                </p>
              </div>
              <Link
                to="/request"
                className="btn-hero"
              >
                Book a visit
              </Link>
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((qa) => (
            <Link
              key={qa.title}
              to={qa.to}
              className="card card--hover p-5 space-y-2.5 focus:outline-none focus-visible:ring-2"
              style={{ borderRadius: 18 }}
            >
              <div
                className="grid place-items-center h-10 w-10 rounded-xl"
                style={{
                  background:
                    qa.tint === "sage" ? "var(--sage-tint)" : "var(--clay-tint)",
                  color: qa.tint === "sage" ? "var(--primary)" : "var(--clay)",
                }}
                aria-hidden
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21c-4-2.5-7-5.8-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.2-3 7.5-7 10Z" />
                </svg>
              </div>
              <div className="text-sm font-bold">{qa.title}</div>
              <div className="text-sm" style={{ color: "var(--muted)" }}>
                {qa.desc}
              </div>
            </Link>
          ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] items-start">
          {/* Messages */}
          <section id="messages" className="card p-6 space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Messages</h2>
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {msgLoading
                  ? "Loading…"
                  : unreadCount
                  ? `${unreadCount} unread`
                  : "All caught up"}
              </span>
            </div>

            {(messages || []).length === 0 && !msgLoading && (
              <div className="text-muted text-sm">No messages yet.</div>
            )}

            <div className="space-y-2">
              {(messages || []).slice(0, 10).map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 rounded-2xl p-3.5 transition hover:bg-[color:var(--sage-tint)]"
                >
                  <span
                    className="font-display grid place-items-center h-9 w-9 rounded-full text-sm font-bold shrink-0"
                    style={{
                      background: "var(--sage-tint)",
                      color: "var(--link)",
                    }}
                    aria-hidden
                  >
                    {initials(m.subject || "Clinic")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {m.subject}
                      </span>
                      {!m.readAt && (
                        <span
                          className="dot dot--requested shrink-0"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted2)" }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                    <p
                      className="mt-1 text-sm break-words"
                      style={{ color: "var(--muted)" }}
                    >
                      {m.body}
                    </p>
                  </div>

                  {!m.readAt && (
                    <button
                      className="btn-ghost text-xs !px-3 !py-1.5 shrink-0"
                      onClick={() => markRead(m.id!)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Appointments */}
          <section id="appointments" className="card p-6 space-y-4 scroll-mt-24">
            <div>
              <h2 className="text-lg font-bold">My appointments</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {apptLoading ? "Loading…" : "Appointments tied to your email."}
              </p>
            </div>

            {myAppts.length === 0 && !apptLoading && (
              <div className="text-muted text-sm">
                No appointments found for your email.
              </div>
            )}

            <div className="space-y-2.5">
              {myAppts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl p-4"
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--panel-line)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="font-semibold text-sm">
                        {a.date} @ {a.time}
                      </div>
                      <span className={`pill pill--${a.status}`}>
                        {a.status}
                      </span>
                    </div>

                    <button
                      className="btn-ghost text-xs !px-3 !py-1.5"
                      onClick={() => onDelete(a.id)}
                    >
                      Delete (Archive)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
