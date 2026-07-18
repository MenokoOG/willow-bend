import { useEffect, useMemo, useRef, useState } from "react";
import usePageMeta from "../../seo/usePageMeta";
import { respond } from "../../chatbot/engine";
import type { ChatMessage, ChatRole } from "../../chatbot/types";
import { clearHistory, loadHistory, loadState, saveHistory, saveState } from "../../chatbot/storage";
import { useAuth } from "../../auth/AuthContext";

const STATE_SCOPE = "help";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function deriveRole(args: { userEmail?: string; role?: string | null }): ChatRole {
  if (args.role === "admin") return "staff";
  if (args.userEmail) return "patient";
  return "guest";
}

export default function HelpBot() {
  usePageMeta({
    title: "Help Chat • Willow Bend Family Clinic",
    description: "Offline help chatbot for patients and staff.",
    canonicalPath: "/help",
  });

  const { user, role } = useAuth();

  const chatRole = useMemo(
    () => deriveRole({ userEmail: user?.email ?? undefined, role: role ?? null }),
    [user?.email, role]
  );

  // ✅ shared history
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  // ✅ separate state from widget
  const [state, setState] = useState<string | undefined>(() => loadState(STATE_SCOPE));
  const [text, setText] = useState("");

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (messages.length > 0) return;

    const seed: ChatMessage[] = [
      {
        id: uid(),
        sender: "bot",
        ts: Date.now(),
        text: "Hi 👋 I’m the offline help bot.\n\nI can help you navigate scheduling, portal login, and admin tools (staff).",
        quickReplies: [
          { id: "qr_help", label: "What can you do?", payload: "help" },
          { id: "qr_request", label: "Request appointment", payload: "request appointment" },
          { id: "qr_status", label: "Check status", payload: "check my appointment status" },
        ],
      },
    ];

    setMessages(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    saveState(state, STATE_SCOPE);
  }, [state]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  function pushMessage(m: ChatMessage) {
    setMessages((prev) => [...prev, m].slice(-200));
  }

  function onSend(payload?: string) {
    const raw = (payload ?? text).trim();
    if (!raw) return;

    pushMessage({ id: uid(), sender: "user", ts: Date.now(), text: raw });
    setText("");

    const ans = respond(raw, {
      role: chatRole,
      userEmail: user?.email ?? undefined,
      userUid: user?.uid ?? undefined,
      state,
    });

    if (ans.nextState !== undefined) setState(ans.nextState);

    pushMessage({
      id: uid(),
      sender: "bot",
      ts: Date.now(),
      text: ans.text,
      quickReplies: ans.quickReplies ?? [],
    });
  }

  function onClear() {
    clearHistory();
    saveState(undefined, STATE_SCOPE);
    setState(undefined);

    setMessages([
      {
        id: uid(),
        sender: "bot",
        ts: Date.now(),
        text: "Chat cleared ✅ How can I help?",
        quickReplies: [
          { id: "qr_help", label: "What can you do?", payload: "help" },
          { id: "qr_request", label: "Request appointment", payload: "request appointment" },
          { id: "qr_status", label: "Check status", payload: "check my appointment status" },
        ],
      },
    ]);

    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const quickReplies = useMemo(() => {
    const lastBot = [...messages].reverse().find((m) => m.sender === "bot");
    return lastBot?.quickReplies ?? [];
  }, [messages]);

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Help Chat</h1>
        <p className="text-[1.05rem]" style={{ color: "var(--muted)" }}>
          Offline help assistant (no external APIs). Role: <strong>{chatRole}</strong>
        </p>

        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" type="button" onClick={onClear}>
            Clear Chat
          </button>
          <button className="btn-ghost" type="button" onClick={() => onSend("help")}>
            What can you do?
          </button>
          <button className="btn-ghost" type="button" onClick={() => onSend("request appointment")}>
            Request Appointment
          </button>
          <button className="btn-ghost" type="button" onClick={() => onSend("check my appointment status")}>
            Check Status
          </button>
        </div>
      </header>

      <div className="card p-5 sm:p-6">
        <div ref={listRef} className="space-y-3 max-h-[55vh] overflow-auto pr-1" aria-live="polite">
          {messages.map((m) => (
            <div
              key={m.id}
              className={[
                "rounded-2xl border px-4 py-3 text-sm whitespace-pre-wrap",
                m.sender === "user" ? "ml-10" : "mr-10",
              ].join(" ")}
              style={{
                borderColor: "var(--border)",
                background: m.sender === "user" ? "var(--panel2)" : "var(--panel)",
                color: "var(--text)",
              }}
            >
              <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                {m.sender === "user" ? "You" : "Bot"}
              </div>
              {m.text}
            </div>
          ))}
        </div>

        {quickReplies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {quickReplies.slice(0, 10).map((q) => (
              <button key={q.id} type="button" className="btn-ghost text-sm" onClick={() => onSend(q.payload)}>
                {q.label}
              </button>
            ))}
          </div>
        )}

        <form
          className="mt-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          <input
            ref={inputRef}
            className="input flex-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a question…"
            aria-label="Chat input"
          />
          <button type="submit" className="btn-hero px-5">
            Send
          </button>
        </form>

        <div className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
          This bot is for navigation + scheduling help only. No medical advice.
        </div>
      </div>
    </section>
  );
}