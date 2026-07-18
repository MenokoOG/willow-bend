import { useEffect, useMemo, useRef, useState } from "react";
import { respond } from "../chatbot/engine";
import type { ChatMessage, ChatRole } from "../chatbot/types";
import { clearHistory, loadHistory, loadState, saveHistory, saveState } from "../chatbot/storage";
import { useAuth } from "../auth/AuthContext";

const STATE_SCOPE = "widget";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function deriveRole(args: { userEmail?: string; role?: string | null }): ChatRole {
  if (args.role === "admin") return "staff";
  if (args.userEmail) return "patient";
  return "guest";
}

export default function ChatWidget() {
  const { user, role } = useAuth();

  const chatRole = useMemo(
    () => deriveRole({ userEmail: user?.email ?? undefined, role: role ?? null }),
    [user?.email, role]
  );

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  // ✅ shared history across surfaces
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  // ✅ scoped state so widget flow doesn't collide with /help page
  const [state, setState] = useState<string | undefined>(() => loadState(STATE_SCOPE));

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-seed greeting if empty
  useEffect(() => {
    if (messages.length > 0) return;

    const seed: ChatMessage[] = [
      {
        id: uid(),
        sender: "bot",
        ts: Date.now(),
        text: "Hi 👋 I’m the site helper bot. Ask me about appointments, portal login, or admin tools.",
        quickReplies: [
          { id: "qr_request", label: "Request appointment", payload: "request appointment" },
          { id: "qr_status", label: "Check status", payload: "check my appointment status" },
          { id: "qr_login", label: "Login help", payload: "login help" },
        ],
      },
    ];

    setMessages(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist history
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  // Persist scoped state
  useEffect(() => {
    saveState(state, STATE_SCOPE);
  }, [state]);

  // Scroll to bottom on open/new messages
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [messages, open]);

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

    // ✅ Store quickReplies on the bot message (no recompute drift)
    pushMessage({
      id: uid(),
      sender: "bot",
      ts: Date.now(),
      text: ans.text,
      quickReplies: ans.quickReplies ?? [],
    });
  }

  function onClear() {
    clearHistory(); // shared history clear
    saveState(undefined, STATE_SCOPE);
    setState(undefined);

    setMessages([
      {
        id: uid(),
        sender: "bot",
        ts: Date.now(),
        text: "Chat cleared ✅ How can I help?",
        quickReplies: [
          { id: "qr_request", label: "Request appointment", payload: "request appointment" },
          { id: "qr_status", label: "Check status", payload: "check my appointment status" },
          { id: "qr_login", label: "Login help", payload: "login help" },
        ],
      },
    ]);
  }

  const lastBotQuickReplies = useMemo(() => {
    const lastBot = [...messages].reverse().find((m) => m.sender === "bot");
    return lastBot?.quickReplies ?? [];
  }, [messages]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          className="btn-hero px-4 py-3 rounded-2xl shadow-lg"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="wbc-chatbot-panel"
        >
          {open ? "Close Help" : "Help Chat"}
        </button>
      </div>

      {open && (
        <div id="wbc-chatbot-panel" className="fixed bottom-20 right-4 z-50 w-[min(420px,calc(100vw-2rem))]">
          <div className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Help Chat</div>
                <div className="text-sm" style={{ color: "var(--muted)" }}>
                  Offline assistant • Role: <span className="font-semibold">{chatRole}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" className="btn-ghost text-sm" onClick={onClear}>
                  Clear
                </button>
                <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)}>
                  X
                </button>
              </div>
            </div>

            <div ref={listRef} className="mt-4 space-y-3 max-h-[50vh] overflow-auto pr-1" aria-live="polite">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    "rounded-2xl border px-3 py-2 text-sm whitespace-pre-wrap",
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

            {lastBotQuickReplies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {lastBotQuickReplies.slice(0, 6).map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    className="btn-ghost text-sm"
                    onClick={() => onSend(q.payload)}
                    aria-label={q.label}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            <form
              className="mt-4 flex gap-2"
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
              <button type="submit" className="btn-hero px-4">
                Send
              </button>
            </form>

            <div className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
              Tip: ask “request appointment”, “check status”, “login help”, or “manage appointments”.
            </div>
          </div>
        </div>
      )}
    </>
  );
}