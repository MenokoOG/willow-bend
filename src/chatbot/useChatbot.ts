import { useEffect, useMemo, useState } from "react";
import type { BotContext, ChatMessage } from "./types";
import { respond } from "./engine";

const STORAGE_KEY = "wbc_chat_history_v1";

function id() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function load(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(arr)) return [];
    return arr.filter(Boolean);
  } catch {
    return [];
  }
}

function save(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-80)));
  } catch {
    // ignore storage errors
  }
}

export function useChatbot(ctx: BotContext) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const history = load();
    if (history.length) return history;

    // first-run welcome
    return [
      {
        id: id(),
        role: "bot",
        ts: Date.now(),
        text:
          "Hi 👋 I’m the SRAM helper bot.\n\nAsk me about appointments, portal/login, admin pages, or accessibility.",
      },
    ];
  });

  useEffect(() => {
    save(messages);
  }, [messages]);

  const send = async (text: string) => {
    const clean = (text || "").trim();
    if (!clean) return;

    const userMsg: ChatMessage = { id: id(), role: "user", ts: Date.now(), text: clean };
    setMessages((m) => [...m, userMsg]);

    // old-school “thinking” pause (still instant enough)
    const answer = respond(clean, ctx);

    const botMsg: ChatMessage = {
      id: id(),
      role: "bot",
      ts: Date.now(),
      text: answer.text,
    };

    setMessages((m) => [...m, botMsg]);
  };

  const clear = () => {
    const welcome: ChatMessage = {
      id: id(),
      role: "bot",
      ts: Date.now(),
      text:
        "Chat cleared ✅\n\nAsk me about appointments, portal/login, admin pages, or accessibility.",
    };
    setMessages([welcome]);
  };

  const quickReplies = useMemo(() => {
    // Use last bot response followups if available
    const lastBot = [...messages].reverse().find((m) => m.role === "bot");
    if (!lastBot) return [];

    // We can’t reliably map back to intent here without re-classifying,
    // so we offer evergreen quick options.
    return [
      "How do I request an appointment?",
      "What do appointment statuses mean?",
      "I can't log in",
      "Reset my password",
      "Accessibility help",
    ];
  }, [messages]);

  return { messages, send, clear, quickReplies };
}