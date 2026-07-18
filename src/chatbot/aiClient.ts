import type { ChatMessage, ChatRole } from "./types";

/** Client for the Willow AI endpoint (Netlify Function).
 *  Throws on any failure — callers catch and fall back to the offline
 *  engine (src/chatbot/engine.ts). Payload contains message texts and the
 *  coarse chat role only; never emails, uids, or other PII. */

const ENDPOINT = "/api/willow";
const HISTORY_LIMIT = 12;
const TIMEOUT_MS = 15_000;

export async function askWillow(
  history: ChatMessage[],
  chatRole: ChatRole
): Promise<string> {
  const messages = history
    .filter((m) => m.sender === "user" || m.sender === "bot")
    .slice(-HISTORY_LIMIT)
    .map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, chatRole }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`willow_ai_${res.status}`);
    }

    const data = (await res.json()) as { text?: string };
    if (!data.text || !data.text.trim()) {
      throw new Error("willow_ai_empty");
    }

    return data.text.trim();
  } finally {
    clearTimeout(timer);
  }
}
