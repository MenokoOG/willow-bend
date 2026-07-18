import type { ChatMessage, ChatSender } from "./types";

const HISTORY_KEY = "wbc_chat_history_v1";

// ✅ State is per-surface to prevent Widget + /help from colliding
function stateKey(scope: string) {
  return `wbc_chat_state_v1:${scope}`;
}

function isSender(x: any): x is ChatSender {
  return x === "user" || x === "bot" || x === "system";
}

/**
 * Migration support:
 * - New format: { sender: "user"|"bot", text, ts }
 * - Old format:  { role: "user"|"bot", text, ts }  (from earlier hook version)
 */
function normalizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];

  const out: ChatMessage[] = [];

  for (const m of raw as any[]) {
    if (!m || typeof m.text !== "string") continue;

    const id = typeof m.id === "string" ? m.id : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const ts = typeof m.ts === "number" ? m.ts : Date.now();

    // Prefer sender, fallback to role -> sender
    let sender: ChatSender | null = null;

    if (isSender(m.sender)) sender = m.sender;
    else if (m.role === "user") sender = "user";
    else if (m.role === "bot") sender = "bot";
    else if (m.role === "system") sender = "system";

    if (!sender) continue;

    const quickReplies = Array.isArray(m.quickReplies) ? m.quickReplies : undefined;

    out.push({
      id,
      sender,
      text: m.text,
      ts,
      quickReplies,
    });
  }

  return out.slice(-200);
}

export function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return normalizeMessages(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveHistory(messages: ChatMessage[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-200)));
  } catch {
    // ignore
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

export function loadState(scope = "default"): string | undefined {
  try {
    return localStorage.getItem(stateKey(scope)) ?? undefined;
  } catch {
    return undefined;
  }
}

export function saveState(state?: string, scope = "default") {
  try {
    const key = stateKey(scope);
    if (!state) localStorage.removeItem(key);
    else localStorage.setItem(key, state);
  } catch {
    // ignore
  }
}