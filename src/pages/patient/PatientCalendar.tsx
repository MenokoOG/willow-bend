import { useEffect, useMemo, useState } from "react";
import usePageMeta from "../../seo/usePageMeta";
import { useAuth } from "../../auth/AuthContext";
import { useAppointments } from "../../appointments/useAppointments";
import type { Appointment, AppointmentStatus } from "../../appointments/types";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, months: number) {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function statusPriority(s: AppointmentStatus): number {
  // Higher = more visually urgent
  if (s === "canceled") return 4;
  if (s === "rejected") return 3;
  if (s === "requested") return 2;
  return 1; // approved
}

function dotStyleFor(status: AppointmentStatus) {
  if (status === "approved") return { background: "var(--primary)" };
  if (status === "requested") return { background: "var(--clay)" };
  return { background: "var(--danger)" }; // rejected / canceled
}

function pillClassFor(status: AppointmentStatus) {
  if (status === "approved") return "pill pill--approved";
  if (status === "requested") return "pill pill--requested";
  if (status === "rejected") return "pill pill--rejected";
  return "pill pill--canceled";
}

export default function PatientCalendar() {
  usePageMeta({
    title: "Calendar • Patient Portal",
    description: "Accessible calendar view of your appointments.",
    canonicalPath: "/patient/calendar",
  });

  const { user, profile } = useAuth();
  const { subscribeForPatient } = useAppointments();

  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => ymd(new Date()));
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [error, setError] = useState<string>("");

  const today = useMemo(() => new Date(), []);
  const todayId = useMemo(() => ymd(today), [today]);

  const patientUid = user?.uid ?? null;
  const patientEmail = (profile?.email || user?.email || "").trim() || null;

  const { label, days } = useMemo(() => {
    const first = startOfMonth(cursor);

    const monthLabel = first.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });

    const grid: Array<{ date: Date; inMonth: boolean }> = [];
    const startDayIndex = first.getDay();
    const startGrid = new Date(first);
    startGrid.setDate(first.getDate() - startDayIndex);

    for (let i = 0; i < 42; i++) {
      const d = new Date(startGrid);
      d.setDate(startGrid.getDate() + i);
      grid.push({ date: d, inMonth: d.getMonth() === cursor.getMonth() });
    }

    return { label: monthLabel, days: grid };
  }, [cursor]);

  // ✅ LIVE SYNC: subscribe to Firestore updates
  useEffect(() => {
    setError("");

    const unsub = subscribeForPatient(
      { uid: patientUid, email: patientEmail },
      (rows) => setAppts(rows),
      (err) => setError((err as any)?.message ?? "Live sync failed.")
    );

    return () => unsub();
  }, [subscribeForPatient, patientUid, patientEmail]);

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appts) {
      const arr = map.get(a.date) ?? [];
      arr.push(a);
      map.set(a.date, arr);
    }
    return map;
  }, [appts]);

  const selectedList = useMemo(() => {
    const list = byDate.get(selectedDate) ?? [];
    return list.slice().sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [byDate, selectedDate]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My calendar
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Live sync: status updates appear automatically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="icon-btn"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            type="button"
            aria-label="Previous month"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>

          <span className="font-display text-lg font-bold min-w-[10rem] text-center">
            {label}
          </span>

          <button
            className="icon-btn"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            type="button"
            aria-label="Next month"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <button
            className="btn-ghost text-sm !px-4 !py-2"
            onClick={() => {
              const now = new Date();
              setCursor(now);
              setSelectedDate(ymd(now));
            }}
            type="button"
          >
            Today
          </button>
        </div>
      </div>

      {error && (
        <div className="card p-4" style={{ borderColor: "var(--danger)" }}>
          <div className="font-semibold" style={{ color: "var(--danger)" }}>
            Error
          </div>
          <div style={{ color: "var(--muted)" }}>{error}</div>
        </div>
      )}

      {/* Calendar grid card */}
      <div className="card p-5">
        <div className="grid grid-cols-7 gap-2 text-xs mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-2" style={{ color: "var(--muted)" }}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map(({ date, inMonth }) => {
            const id = ymd(date);
            const isToday = id === todayId;
            const isSelected = id === selectedDate;

            const dayAppts = byDate.get(id) ?? [];
            const topStatus =
              dayAppts.length === 0
                ? null
                : dayAppts
                    .slice()
                    .sort((a, b) => statusPriority(b.status) - statusPriority(a.status))[0].status;

            const ringStyle: React.CSSProperties =
              isToday && !isSelected
                ? {
                    boxShadow:
                      "0 0 0 2px color-mix(in srgb, var(--primary) 45%, transparent)",
                  }
                : { boxShadow: "none" };

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedDate(id)}
                className={[
                  "h-14 sm:h-16 rounded-xl border text-left px-2 py-1 transition focus:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-0",
                  inMonth ? "hover:-translate-y-px" : "opacity-45",
                ].join(" ")}
                style={{
                  borderColor: isSelected ? "var(--primary)" : "var(--line2)",
                  background: isSelected
                    ? "var(--primary)"
                    : dayAppts.length > 0
                    ? "var(--sage-tint)"
                    : "var(--surface)",
                  color: isSelected
                    ? "var(--on-primary)"
                    : inMonth
                    ? "var(--ink)"
                    : "var(--muted2)",
                  ...ringStyle,
                }}
                aria-label={`Calendar day ${date.toDateString()}${
                  dayAppts.length ? ` with ${dayAppts.length} appointment(s)` : ""
                }`}
                aria-current={isToday ? "date" : undefined}
                title={id}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold">{date.getDate()}</div>

                  {topStatus && (
                    <span
                      aria-hidden
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        ...dotStyleFor(topStatus),
                        boxShadow:
                          "0 0 0 2px color-mix(in srgb, var(--panel) 85%, transparent)",
                        marginTop: 2,
                      }}
                    />
                  )}
                </div>

                {dayAppts.length > 0 && (
                  <div
                    className="mt-1 text-[11px]"
                    style={{
                      color: isSelected ? "var(--on-primary)" : "var(--muted)",
                    }}
                  >
                    {dayAppts.length} appt{dayAppts.length === 1 ? "" : "s"}
                  </div>
                )}

                {isToday && (
                  <div
                    className="mt-1 text-[11px] font-semibold"
                    style={{
                      color: isSelected ? "var(--on-primary)" : "var(--primary)",
                    }}
                  >
                    Today
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill pill--approved">Approved</span>
          <span className="pill pill--requested">Requested</span>
          <span className="pill pill--rejected">Rejected</span>
          <span className="pill pill--canceled">Canceled</span>
        </div>
      </div>

      {/* Selected day details */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              {selectedDate}
            </div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              {selectedList.length === 0
                ? "No appointments on this day."
                : "Appointments for this day:"}
            </div>
          </div>

          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => setSelectedDate(todayId)}
          >
            Jump to today
          </button>
        </div>

        {selectedList.length > 0 && (
          <div className="mt-4 space-y-3" aria-live="polite">
            {selectedList.map((a) => (
              <div key={a.id ?? `${a.date}-${a.time}-${a.createdAt}`} className="card p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-semibold" style={{ color: "var(--text)" }}>
                      {a.time} • {a.patientName}
                    </div>
                    <div className="text-sm" style={{ color: "var(--muted)" }}>
                      Status: <span className="font-semibold">{a.status}</span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--muted2)" }}>
                      {a.patientEmail}
                    </div>
                  </div>

                  <div className={pillClassFor(a.status)} aria-label={`Status ${a.status}`}>
                    {a.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}