import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { classifyTurn, respond } from "../chatbot/engine";
import { askWillow } from "../chatbot/aiClient";
import { baseQuickReplies } from "../chatbot/kb";
import type { ChatMessage, ChatRole } from "../chatbot/types";
import {
  clearHistory,
  loadHistory,
  loadState,
  saveHistory,
  saveState,
} from "../chatbot/storage";
import { useAuth } from "../auth/AuthContext";
import {
  ChatBubble,
  SparkleIcon,
  TypingDots,
  WILLOW_DISCLAIMER,
  WillowAvatar,
} from "./WillowBits";

const STATE_SCOPE = "widget";
const MIN_TYPING_MS = 400;

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
  const location = useLocation();

  const chatRole = useMemo(
    () => deriveRole({ userEmail: user?.email ?? undefined, role: role ?? null }),
    [user?.email, role]
  );

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  // ✅ shared history across surfaces
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  // ✅ scoped state so widget flow doesn't collide with /help page
  const [state, setState] = useState<string | undefined>(() => loadState(STATE_SCOPE));

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendSeq = useRef(0);

  // Auto-seed greeting if empty
  useEffect(() => {
    if (messages.length > 0) return;

    const seed: ChatMessage[] = [
      {
        id: uid(),
        sender: "bot",
        ts: Date.now(),
        text: "Hi, I'm Willow 🌿 I can help with appointments, portal login, and finding your way around the clinic site.",
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
  }, [messages, open, typing]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  function pushMessage(m: ChatMessage) {
    setMessages((prev) => [...prev, m].slice(-200));
  }

  async function onSend(payload?: string) {
    const raw = (payload ?? text).trim();
    if (!raw || typing) return;

    const userMsg: ChatMessage = {
      id: uid(),
      sender: "user",
      ts: Date.now(),
      text: raw,
    };
    pushMessage(userMsg);
    setText("");

    const ctx = {
      role: chatRole,
      userEmail: user?.email ?? undefined,
      userUid: user?.uid ?? undefined,
      state,
    };

    const answerOffline = () => {
      const ans = respond(raw, ctx);
      if (ans.nextState !== undefined) setState(ans.nextState);
      return { text: ans.text, quickReplies: ans.quickReplies ?? [] };
    };

    // Emergency short-circuit: instant offline answer, no network round-trip.
    const turn = classifyTurn(raw);
    if (turn.intent === "emergency" && turn.confidence >= 0.8) {
      const ans = answerOffline();
      pushMessage({ id: uid(), sender: "bot", ts: Date.now(), ...ans });
      return;
    }

    const seq = ++sendSeq.current;
    setTyping(true);
    const started = Date.now();

    let reply: { text: string; quickReplies: ChatMessage["quickReplies"] };
    if (state) {
      // Mid-flow (e.g. awaiting_status_detail): stay on the offline engine.
      reply = answerOffline();
    } else {
      try {
        const text = await askWillow([...messages, userMsg], chatRole);
        reply = { text, quickReplies: baseQuickReplies(chatRole) };
      } catch {
        reply = answerOffline();
      }
    }

    const wait = Math.max(0, MIN_TYPING_MS - (Date.now() - started));
    typingTimer.current = setTimeout(() => {
      if (seq !== sendSeq.current) return;
      setTyping(false);
      pushMessage({ id: uid(), sender: "bot", ts: Date.now(), ...reply });
    }, wait);
  }

  function onClear() {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    sendSeq.current++;
    setTyping(false);
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

  // The full-page Willow surface has its own chat UI
  if (location.pathname === "/help") return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          className="btn-hero !px-4 !py-3"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="wbc-chatbot-panel"
        >
          <SparkleIcon size={16} />
          {open ? "Close" : "Ask Willow"}
        </button>
      </div>

      {open && (
        <div
          id="wbc-chatbot-panel"
          className="fixed bottom-20 right-4 z-50 w-[min(420px,calc(100vw-2rem))]"
        >
          <div className="card overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid var(--line2)" }}
            >
              <div className="flex items-center gap-2.5">
                <WillowAvatar size={34} />
                <div>
                  <div className="font-display text-sm font-bold">Willow</div>
                  <div className="text-xs" style={{ color: "var(--link)" }}>
                    ● Online — care assistant
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  to="/help"
                  className="text-xs font-semibold px-2"
                  style={{ color: "var(--link)" }}
                  onClick={() => setOpen(false)}
                >
                  Full chat
                </Link>
                <button
                  type="button"
                  className="btn-ghost text-xs !px-3 !py-1.5"
                  onClick={onClear}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="icon-btn !h-8 !w-8"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="px-4 py-4 space-y-3 max-h-[50vh] overflow-auto"
              aria-live="polite"
            >
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              {typing && <TypingDots />}
            </div>

            {/* Quick replies */}
            {!typing && lastBotQuickReplies.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {lastBotQuickReplies.slice(0, 6).map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    className="chip text-xs !px-3.5 !py-2"
                    onClick={() => onSend(q.payload)}
                    aria-label={q.label}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <div
              className="px-4 py-3 space-y-2"
              style={{ borderTop: "1px solid var(--line2)" }}
            >
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSend();
                }}
              >
                <input
                  ref={inputRef}
                  className="input flex-1 !rounded-2xl"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ask Willow anything…"
                  aria-label="Chat input"
                />
                <button type="submit" className="btn-hero !px-4" disabled={typing}>
                  Send
                </button>
              </form>
              <p className="text-[11px]" style={{ color: "var(--muted2)" }}>
                {WILLOW_DISCLAIMER}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
