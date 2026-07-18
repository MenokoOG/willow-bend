import { useMemo, useRef, useState, useEffect } from "react";
import usePageMeta from "../../seo/usePageMeta";
import { useAuth } from "../../auth/AuthContext";
import { useChatbot } from "../../chatbot/useChatbot";

export default function HelpChatBot() {
  usePageMeta({
    title: "Help • Willow Bend Family Clinic",
    description: "Offline help chatbot for patients and staff (no external APIs).",
    canonicalPath: "/help",
  });

  const { role, profile } = useAuth();

  const ctx = useMemo(
    () => ({
      role: role ?? null,
      email: profile?.email ?? null,
    }),
    [role, profile?.email]
  );

  const { messages, send, clear, quickReplies } = useChatbot(ctx);
  const [text, setText] = useState("");

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // auto-scroll to bottom on new messages
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text;
    setText("");
    await send(t);
  };

  return (
    <section className="max-w-3xl mx-auto space-y-5">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Help Chat</h1>
        <p className="text-[1.05rem]" style={{ color: "var(--muted)" }}>
          Offline helper bot (no external APIs). Good for quick guidance on
          portal/admin workflows.
        </p>
      </header>

      <div className="card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            Mode:{" "}
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {role === "admin" ? "Staff" : "Patient"}
            </span>
          </div>

          <button type="button" className="btn-ghost text-sm" onClick={clear}>
            Clear chat
          </button>
        </div>

        <div
          ref={listRef}
          className="rounded-2xl border p-4 sm:p-5"
          style={{
            borderColor: "var(--border)",
            background: "var(--panel)",
            maxHeight: 420,
            overflowY: "auto",
          }}
          aria-label="Chat transcript"
        >
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={[
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                ].join(" ")}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap"
                  style={{
                    background:
                      m.role === "user"
                        ? "color-mix(in srgb, var(--brand, #22c55e) 25%, var(--panel))"
                        : "color-mix(in srgb, var(--text) 6%, var(--panel))",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              className="btn-ghost text-xs"
              onClick={() => send(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            className="input flex-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask a question… (ex: What does requested mean?)"
            aria-label="Chat message"
          />
          <button className="btn-hero px-4" type="submit">
            Send
          </button>
        </form>

        <p className="text-xs" style={{ color: "var(--muted2)" }}>
          Note: Prototype support bot. Do not share sensitive medical information.
        </p>
      </div>
    </section>
  );
}