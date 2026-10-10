import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import usePageMeta from "../../seo/usePageMeta";
import { classifyTurn, respond } from "../../chatbot/engine";
import { askWillow } from "../../chatbot/aiClient";
import { baseQuickReplies } from "../../chatbot/kb";
import type { ChatMessage, ChatRole } from "../../chatbot/types";
import {
  clearHistory,
  loadHistory,
  loadState,
  saveHistory,
  saveState,
} from "../../chatbot/storage";
import { useAuth } from "../../auth/AuthContext";
import {
  ChatBubble,
  SparkleIcon,
  TypingDots,
  WILLOW_DISCLAIMER,
  WillowAvatar,
} from "../../components/WillowBits";

const STATE_SCOPE = "help";
const MIN_TYPING_MS = 400;

const SUGGESTIONS = [
  { label: "Request an appointment", payload: "request appointment" },
  { label: "Check my appointment status", payload: "check my appointment status" },
  { label: "How do I log in?", payload: "login help" },
  { label: "How do I contact the clinic?", payload: "how do I contact the clinic" },
];

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
    title: "Willow • Willow Bend Family Clinic",
    description: "Willow, the clinic care assistant, for patients and staff.",
    canonicalPath: "/help",
  });

  const { user, role } = useAuth();

  const chatRole = useMemo(
    () => deriveRole({ userEmail: user?.email ?? undefined, role: role ?? null }),
    [user?.email, role]
  );

  // ✅ shared history (with the floating widget)
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  // ✅ separate flow state from widget
  const [state, setState] = useState<string | undefined>(() => loadState(STATE_SCOPE));
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendSeq = useRef(0);

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
  }, [messages, typing]);

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

  function onNewChat() {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    sendSeq.current++;
    setTyping(false);
    clearHistory();
    saveState(undefined, STATE_SCOPE);
    setState(undefined);
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const quickReplies = useMemo(() => {
    const lastBot = [...messages].reverse().find((m) => m.sender === "bot");
    return lastBot?.quickReplies ?? [];
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
      {/* ============ CONVERSATION RAIL ============ */}
      <aside className="hidden lg:flex flex-col gap-3 sticky top-24">
        <button type="button" className="btn-hero w-full" onClick={onNewChat}>
          <SparkleIcon size={14} />
          New chat
        </button>

        <div
          className="rounded-2xl p-4 text-sm space-y-2"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--panel-line)",
            color: "var(--muted)",
          }}
        >
          <div className="font-semibold" style={{ color: "var(--ink)" }}>
            About Willow
          </div>
          <p>
            Willow helps with scheduling, portal navigation, and common clinic
            questions. Chats are stored only in your browser.
          </p>
        </div>

        <Link
          to={chatRole === "patient" ? "/patient" : "/"}
          className="text-sm font-semibold px-1"
          style={{ color: "var(--link)" }}
        >
          ← Back to {chatRole === "patient" ? "portal" : "home"}
        </Link>
      </aside>

      {/* ============ CHAT COLUMN ============ */}
      <section
        className="card flex flex-col overflow-hidden"
        style={{ minHeight: "calc(100vh - 220px)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--line2)" }}
        >
          <div className="flex items-center gap-3">
            <WillowAvatar size={36} />
            <div>
              <div className="font-display text-sm font-bold">Willow</div>
              <div className="text-xs" style={{ color: "var(--link)" }}>
                ● Online — care assistant
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost text-sm !px-4 !py-2 lg:hidden"
            onClick={onNewChat}
          >
            New chat
          </button>
        </div>

        {/* Messages / empty state */}
        <div
          ref={listRef}
          className="flex-1 overflow-auto px-5 py-6 space-y-4"
          aria-live="polite"
        >
          {isEmpty ? (
            <div className="h-full grid place-items-center">
              <div className="text-center space-y-4 max-w-md mx-auto py-10">
                <div className="flex justify-center">
                  <WillowAvatar size={60} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Hi, I'm Willow 🌿
                </h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  I can help you request appointments, find your way around the
                  patient portal, and answer common clinic questions.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.payload}
                      type="button"
                      className="chip !rounded-2xl w-full"
                      onClick={() => onSend(s.payload)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              {typing && <TypingDots />}
            </>
          )}
        </div>

        {/* Quick replies */}
        {!isEmpty && !typing && quickReplies.length > 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {quickReplies.slice(0, 6).map((q) => (
              <button
                key={q.id}
                type="button"
                className="chip text-sm"
                onClick={() => onSend(q.payload)}
              >
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div
          className="px-5 py-4 space-y-2"
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
            <button type="submit" className="btn-hero !px-5" disabled={typing}>
              Send
            </button>
          </form>
          <p className="text-xs text-center" style={{ color: "var(--muted2)" }}>
            {WILLOW_DISCLAIMER}
          </p>
        </div>
      </section>
    </div>
  );
}
