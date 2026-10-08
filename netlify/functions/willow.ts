import { KB } from "../../src/chatbot/kb";
import { report, type Outcome } from "../lib/heimdall";

/** Willow AI — Netlify Function (v2).
 *  Keeps OPENAI_API_KEY server-side. The client falls back to the offline
 *  keyword engine on ANY non-200 from this endpoint, so failures here are
 *  never user-visible errors. No PII is accepted or forwarded. */

type InMessage = { role: "user" | "assistant"; content: string };
type ChatRole = "guest" | "patient" | "staff";

const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 1000;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function systemPrompt(chatRole: ChatRole): string {
  return [
    `You are Willow, the care assistant for ${KB.brand} — a FICTIONAL demo`,
    `family-practice clinic in Meridian, ID (this site is a product demo; all`,
    `clinic data is fictional).`,
    ``,
    `You help visitors navigate the website and its scheduling flow. The user`,
    `you are talking to has the role: ${chatRole}.`,
    ``,
    `HARD RULES — never break these:`,
    `- Navigation and scheduling help ONLY. Never give medical advice,`,
    `  diagnosis, triage, or medication guidance of any kind.`,
    `- If anything sounds like a medical emergency, tell the user to call 911`,
    `  immediately and say nothing else.`,
    `- Appointments are REQUESTED at ${KB.portalPaths.request} and are always`,
    `  reviewed and approved by human clinic staff. NEVER claim to book,`,
    `  confirm, move, or cancel an appointment yourself.`,
    `- Keep answers short: 2–6 sentences, plain language, no markdown headers.`,
    `- If you are not sure, say so and point the user to the Contact page`,
    `  (/contact).`,
    ``,
    `Site facts you may use:`,
    `- Routes: request an appointment ${KB.portalPaths.request}, login`,
    `  ${KB.portalPaths.login}, signup ${KB.portalPaths.signup}, patient portal`,
    `  ${KB.portalPaths.patient}, patient calendar ${KB.portalPaths.patientCalendar},`,
    `  services /services, contact + map /contact, this chat ${KB.portalPaths.help}.`,
    chatRole === "staff"
      ? `- Staff routes: manage appointments ${KB.portalPaths.adminAppointments},` +
        ` edit site content ${KB.portalPaths.adminContent}.`
      : ``,
    `- Hours: ${KB.clinicInfo.hoursText}`,
    `- Location: ${KB.clinicInfo.locationText} (480 Willow Bend Dr, Suite 100,`,
    `  Meridian, ID 83642 — phone (208) 555-0142).`,
    `- Insurance/billing: ${KB.clinicInfo.insuranceText}`,
    `- Privacy: ${KB.clinicInfo.privacyText}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  const startedAt = Date.now();
  // Report once, then respond. Malformed requests (4xx) are not agent traffic
  // and are not reported. Counts only: see netlify/lib/heimdall.ts.
  const done = async (res: Response, outcome: Outcome): Promise<Response> => {
    await report(outcome, startedAt);
    return res;
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Intentional keyless deployment: the client runs its offline engine.
    return done(json(501, { error: "ai_unconfigured" }), {
      mode: "offline",
      degraded: false,
      error: "none",
    });
  }

  let body: { messages?: unknown; chatRole?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const chatRole: ChatRole =
    body.chatRole === "patient" || body.chatRole === "staff"
      ? body.chatRole
      : "guest";

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json(400, { error: "messages_required" });
  }
  if (body.messages.length > MAX_MESSAGES) {
    return json(413, { error: "too_many_messages" });
  }

  const messages: InMessage[] = [];
  for (const m of body.messages as any[]) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      !m.content.trim()
    ) {
      return json(400, { error: "invalid_message" });
    }
    if (m.content.length > MAX_CONTENT_CHARS) {
      return json(413, { error: "message_too_long" });
    }
    messages.push({ role: m.role, content: m.content });
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.WILLOW_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 300,
        messages: [
          { role: "system", content: systemPrompt(chatRole) },
          ...messages,
        ],
      }),
    });

    if (!upstream.ok) {
      return done(json(502, { error: "upstream_error", status: upstream.status }), {
        mode: "offline",
        degraded: true,
        error: "upstream",
      });
    }

    const data = await upstream.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    if (!text || !text.trim()) {
      return done(json(502, { error: "empty_completion" }), {
        mode: "offline",
        degraded: true,
        error: "upstream",
      });
    }

    return done(json(200, { text: text.trim() }), {
      mode: "live",
      degraded: false,
      error: "none",
    });
  } catch {
    return done(json(502, { error: "upstream_unreachable" }), {
      mode: "offline",
      degraded: true,
      error: "upstream",
    });
  }
}
