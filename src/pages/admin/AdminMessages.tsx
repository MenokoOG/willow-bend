import { useMemo, useState } from "react";
import usePageMeta from "../../seo/usePageMeta";
import { useAdminMessages } from "../../messages/useMessages";
import { useArchives } from "../../appointments/useArchives";
import type { PortalMessage } from "../../messages/types";

function fmt(ts?: number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

/* ============================ MESSAGES ============================ */

function MessageRow({
  m,
  busy,
  onSave,
  onDelete,
}: {
  m: PortalMessage;
  busy: boolean;
  onSave: (id: string, subject: string, body: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(m.subject);
  const [body, setBody] = useState(m.body);

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--panel-line)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm">{m.subject}</span>
            {!m.readAt ? (
              <span className="pill pill--requested">Unread</span>
            ) : (
              <span className="pill pill--approved">Read</span>
            )}
            {m.editedAt && <span className="pill">Edited</span>}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted2)" }}>
            To {m.toEmail} • Sent {fmt(m.createdAt)}
            {m.readAt ? ` • Read ${fmt(m.readAt)}` : ""}
            {m.appointmentId ? ` • Appt ${m.appointmentId}` : ""}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            className="btn-ghost text-xs !px-3 !py-1.5"
            disabled={busy}
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            className="btn-ghost text-xs !px-3 !py-1.5"
            disabled={busy}
            onClick={() => onDelete(m.id!)}
            style={{
              borderColor:
                "color-mix(in srgb, var(--danger) 55%, var(--line3))",
              color: "var(--danger)",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              Subject
            </span>
            <input
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              Body
            </span>
            <textarea
              className="input"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn-hero text-sm !px-4 !py-2"
            disabled={busy || !subject.trim() || !body.trim()}
            onClick={() => {
              onSave(m.id!, subject.trim(), body.trim());
              setEditing(false);
            }}
          >
            Save changes
          </button>
        </div>
      ) : (
        <p
          className="text-sm whitespace-pre-wrap break-words"
          style={{ color: "var(--muted)" }}
        >
          {m.body}
        </p>
      )}
    </div>
  );
}

/* ============================ PAGE ============================ */

export default function AdminMessages() {
  usePageMeta({
    title: "Messages & Archives | Admin | Willow Bend Family Clinic",
    description:
      "Admin message management and archived appointment cleanup.",
    canonicalPath: "/admin/messages",
    noIndex: true,
  });

  const {
    messages,
    loading: msgLoading,
    updateMessage,
    deleteMessage,
  } = useAdminMessages();
  const {
    archives,
    loading: arcLoading,
    deleteArchive,
    clearOlderThan,
  } = useArchives();

  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return messages;
    return messages.filter(
      (m) =>
        m.toEmail.toLowerCase().includes(f) ||
        m.subject.toLowerCase().includes(f) ||
        m.body.toLowerCase().includes(f)
    );
  }, [messages, filter]);

  async function run(label: string, fn: () => Promise<unknown>) {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await fn();
      setNotice(label);
    } catch (e: any) {
      setError(e?.message || "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  function onDeleteMessage(id: string) {
    if (!window.confirm("Permanently delete this message from the patient's portal?"))
      return;
    run("Message deleted.", () => deleteMessage(id));
  }

  function onSaveMessage(id: string, subject: string, body: string) {
    run("Message updated.", () => updateMessage(id, { subject, body }));
  }

  function onDeleteArchive(id: string) {
    if (!window.confirm("Permanently delete this archive entry? This cannot be undone."))
      return;
    run("Archive entry deleted.", () => deleteArchive(id));
  }

  function onClearArchives(days: number) {
    const what =
      days === 0 ? "ALL archived appointments" : `archives older than ${days} days`;
    if (
      !window.confirm(
        `Permanently delete ${what}? This cannot be undone.`
      )
    )
      return;
    run("Archives cleared.", async () => {
      const n = await clearOlderThan(days);
      setNotice(`Deleted ${n} archive entr${n === 1 ? "y" : "ies"}.`);
    });
  }

  return (
    <section className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Messages &amp; Archives
        </h1>
        <p className="text-[1.05rem]" style={{ color: "var(--muted)" }}>
          Review, edit, and delete portal messages, and clear out old
          appointment archives.
        </p>

        {error && (
          <div className="card p-4" style={{ borderColor: "var(--danger)" }}>
            <div className="font-semibold" style={{ color: "var(--danger)" }}>
              Error
            </div>
            <div style={{ color: "var(--muted)" }}>{error}</div>
          </div>
        )}
        {notice && (
          <div className="pill pill--approved" role="status">
            {notice}
          </div>
        )}
      </header>

      {/* ============ MESSAGES ============ */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Sent messages</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {msgLoading
                ? "Loading…"
                : `${filtered.length} of ${messages.length} message${
                    messages.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>
          <input
            className="input !w-auto min-w-[240px]"
            placeholder="Filter by email, subject, or text…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter messages"
          />
        </div>

        {!msgLoading && filtered.length === 0 && (
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            No messages{filter ? " match your filter" : " sent yet"}.
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((m) => (
            <MessageRow
              key={m.id}
              m={m}
              busy={busy}
              onSave={onSaveMessage}
              onDelete={onDeleteMessage}
            />
          ))}
        </div>
      </div>

      {/* ============ ARCHIVES ============ */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Appointment archives</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {arcLoading
                ? "Loading…"
                : `${archives.length} archived entr${
                    archives.length === 1 ? "y" : "ies"
                  }. Deleting is permanent.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-ghost text-sm !px-4 !py-2"
              disabled={busy || archives.length === 0}
              onClick={() => onClearArchives(90)}
            >
              Clear older than 90 days
            </button>
            <button
              type="button"
              className="btn-ghost text-sm !px-4 !py-2"
              disabled={busy || archives.length === 0}
              onClick={() => onClearArchives(30)}
            >
              Clear older than 30 days
            </button>
            <button
              type="button"
              className="btn-ghost text-sm !px-4 !py-2"
              disabled={busy || archives.length === 0}
              onClick={() => onClearArchives(0)}
              style={{
                borderColor:
                  "color-mix(in srgb, var(--danger) 55%, var(--line3))",
                color: "var(--danger)",
              }}
            >
              Clear all
            </button>
          </div>
        </div>

        {!arcLoading && archives.length === 0 && (
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            The archive is empty.
          </div>
        )}

        <div className="space-y-3">
          {archives.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl p-4 flex flex-wrap items-start justify-between gap-3"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--panel-line)",
              }}
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm">
                    {a.patientName} — {a.date} @ {a.time}
                  </span>
                  <span className={`pill pill--${a.status}`}>{a.status}</span>
                </div>
                <div className="text-xs" style={{ color: "var(--muted2)" }}>
                  {a.patientEmail} • Archived {fmt(a.archivedAt)} by{" "}
                  {a.archivedBy?.email || a.archivedBy?.role || "unknown"} (
                  {a.archiveReason})
                </div>
                {(a.flags?.deletedBeforeAppointment ||
                  a.flags?.deletedWhileApproved) && (
                  <div className="flex flex-wrap gap-2">
                    {a.flags.deletedBeforeAppointment && (
                      <span className="badge-soon">
                        Deleted before appointment
                      </span>
                    )}
                    {a.flags.deletedWhileApproved && (
                      <span className="badge-soon">Deleted while approved</span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn-ghost text-xs !px-3 !py-1.5 shrink-0"
                disabled={busy}
                onClick={() => onDeleteArchive(a.id!)}
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--danger) 55%, var(--line3))",
                  color: "var(--danger)",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
