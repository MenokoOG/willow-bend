import type { BotAnswer, BotContext, BotIntent, BotTurn, QuickReply } from "./types";
import { KB, answerCard, baseQuickReplies } from "./kb";

function normalize(s: string) {
  return (s ?? "").trim().toLowerCase();
}

function includesAny(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

function scoreIntent(text: string, intent: BotIntent): number {
  // Very simple deterministic scoring.
  // If you want, we can later make this “weighted” per token.
  const t = normalize(text);

  const rules: Record<BotIntent, { words: string[]; score: number }[]> = {
    greeting: [
      { words: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"], score: 0.9 },
    ],
    help: [
      { words: ["help", "support", "what can you do", "how does this work"], score: 0.85 },
    ],
    hours: [{ words: ["hours", "open", "close", "when are you open"], score: 0.8 }],
    location: [{ words: ["address", "location", "directions", "where are you"], score: 0.8 }],
    services: [{ words: ["services", "treat", "do you offer", "primary care"], score: 0.7 }],
    insurance: [{ words: ["insurance", "billing", "payment", "copay"], score: 0.7 }],
    contact: [{ words: ["contact", "phone", "email", "call", "reach you"], score: 0.75 }],

    appointment_request: [
      { words: ["request appointment", "book", "schedule", "make an appointment", "appointment request"], score: 0.9 },
    ],
    appointment_status: [
      { words: ["status", "approved", "rejected", "canceled", "requested", "my appointment"], score: 0.8 },
    ],
    appointment_reschedule: [
      { words: ["reschedule", "change time", "change date", "move appointment"], score: 0.85 },
    ],
    appointment_cancel: [{ words: ["cancel appointment", "cancel", "delete appointment"], score: 0.8 }],

    portal_login: [{ words: ["login", "log in", "sign in"], score: 0.75 }],
    portal_signup: [{ words: ["sign up", "signup", "create account", "register"], score: 0.75 }],
    portal_password_reset: [{ words: ["forgot password", "reset password", "password reset"], score: 0.9 }],

    admin_appointments: [
      { words: ["admin appointments", "manage appointments", "approve", "reject", "admin schedule"], score: 0.9 },
    ],
    admin_content: [{ words: ["edit content", "admin content", "update website", "content editor"], score: 0.9 }],

    privacy: [{ words: ["privacy", "hipaa", "sensitive", "secure"], score: 0.7 }],
    emergency: [{ words: ["emergency", "chest pain", "stroke", "call 911"], score: 0.95 }],

    unknown: [{ words: [""], score: 0.0 }],
  };

  const candidates = rules[intent] ?? [];
  let best = 0;
  for (const r of candidates) {
    if (r.words.some((w) => w && t.includes(w))) best = Math.max(best, r.score);
  }

  // Boost phrase combos
  if (intent === "appointment_request" && includesAny(t, ["appointment", "schedule", "book"])) best = Math.max(best, 0.75);
  if (intent === "portal_login" && includesAny(t, ["login", "sign in"])) best = Math.max(best, 0.7);

  return best;
}

export function classifyTurn(text: string): BotTurn {
  const intents: BotIntent[] = [
    "emergency",
    "greeting",
    "help",
    "portal_password_reset",
    "portal_signup",
    "portal_login",
    "appointment_request",
    "appointment_reschedule",
    "appointment_cancel",
    "appointment_status",
    "admin_appointments",
    "admin_content",
    "contact",
    "hours",
    "location",
    "services",
    "insurance",
    "privacy",
  ];

  let bestIntent: BotIntent = "unknown";
  let bestScore = 0;

  for (const i of intents) {
    const s = scoreIntent(text, i);
    if (s > bestScore) {
      bestScore = s;
      bestIntent = i;
    }
  }

  return { intent: bestIntent, confidence: bestScore };
}

function quickNavReplies(extra?: QuickReply[]) {
  return [
    ...(extra ?? []),
    ...baseQuickReplies("guest"),
  ].slice(0, 8);
}

export function respond(text: string, ctx: BotContext): BotAnswer {
  const t = normalize(text);

  // === Simple flow state support ===
  // Example: if user says “status” without context, ask where to check.
  if (ctx.state === "awaiting_status_detail") {
    // Any response: point them to portal calendar and dashboard
    return answerCard(
      [
        "To check your appointment status:",
        `1) Go to the Patient Portal: ${KB.portalPaths.patient}`,
        `2) Open Calendar: ${KB.portalPaths.patientCalendar}`,
        "",
        "You’ll see each appointment with a status like **requested / approved / rejected / canceled**.",
        "If you don’t see anything, make sure you used the same email you requested the appointment with.",
      ].join("\n"),
      baseQuickReplies(ctx.role),
      undefined
    );
  }

  const turn = classifyTurn(t);

  // Emergency always wins if detected strongly
  if (turn.intent === "emergency" && turn.confidence >= 0.8) {
    return answerCard(KB.clinicInfo.emergencyText, baseQuickReplies(ctx.role));
  }

  switch (turn.intent) {
    case "greeting":
      return answerCard(
        `Hi, I’m Willow 🌿 the ${KB.brand} care assistant.\n\nI can help you navigate scheduling, login, and the portal.`,
        baseQuickReplies(ctx.role)
      );

    case "help":
      return answerCard(
        [
          "Here’s what I can help with:",
          "• Requesting an appointment",
          "• Checking appointment status in the portal",
          "• Login / signup / password reset navigation",
          ctx.role === "staff" ? "• Admin: managing appointments and editing site content" : "",
          "",
          "Pick a button below or type what you need 👇",
        ]
          .filter(Boolean)
          .join("\n"),
        baseQuickReplies(ctx.role)
      );

    case "hours":
      return answerCard(KB.clinicInfo.hoursText, baseQuickReplies(ctx.role));

    case "location":
      return answerCard(KB.clinicInfo.locationText, baseQuickReplies(ctx.role));

    case "services":
      return answerCard(KB.clinicInfo.servicesText, baseQuickReplies(ctx.role));

    case "insurance":
      return answerCard(KB.clinicInfo.insuranceText, baseQuickReplies(ctx.role));

    case "privacy":
      return answerCard(KB.clinicInfo.privacyText, baseQuickReplies(ctx.role));

    case "contact":
      return answerCard(
        [
          "To contact the clinic:",
          "• Use the Contact page: /contact",
          "",
          "For the prototype, the Contact page is the safest place for official communication.",
        ].join("\n"),
        baseQuickReplies(ctx.role)
      );

    case "portal_login":
      return answerCard(
        [
          "Login help:",
          `1) Go to: ${KB.portalPaths.login}`,
          "2) Google Sign-In is recommended for the most reliable prototype experience.",
          "",
          "If Light Mode text is invisible, that’s a theme-token bug — we can fix it in the theme pass.",
        ].join("\n"),
        baseQuickReplies(ctx.role)
      );

    case "portal_signup":
      return answerCard(
        [
          "Create account:",
          `1) Go to: ${KB.portalPaths.signup}`,
          "2) Use Google Sign-In (recommended) or Email/Password.",
          "",
          "After signup, you’ll land in the Patient Portal.",
        ].join("\n"),
        baseQuickReplies(ctx.role)
      );

    case "portal_password_reset":
      return answerCard(
        [
          "Password reset:",
          "If your app has a reset page, use it from the Login screen.",
          "",
          "If you don’t have a route yet, we can add `/forgot` and wire Firebase password reset.",
          "For now: use Google Sign-In if you can.",
        ].join("\n"),
        baseQuickReplies(ctx.role)
      );

    case "appointment_request":
      return answerCard(
        [
          "Requesting an appointment ✅",
          `1) Go to: ${KB.portalPaths.request}`,
          "2) Enter your name, email, date, and time.",
          "3) Submit the request.",
          "",
          "After an admin reviews it, your status will change in the portal.",
        ].join("\n"),
        baseQuickReplies(ctx.role)
      );

    case "appointment_status":
      return answerCard(
        "Do you want to check your appointment status in the Patient Portal calendar/dashboard?",
        [
          { id: "qr_status_yes", label: "Yes, show me where", payload: "show appointment status" },
          { id: "qr_status_no", label: "No, something else", payload: "help" },
        ],
        "awaiting_status_detail"
      );

    case "appointment_reschedule":
      return answerCard(
        [
          "Rescheduling:",
          "• If staff requests rescheduling, they may message you inside the portal.",
          "• You can also submit a new request and mention you’re rescheduling.",
          "",
          "If you want, we can add a portal feature to request reschedule directly.",
        ].join("\n"),
        baseQuickReplies(ctx.role)
      );

    case "appointment_cancel":
      return answerCard(
        [
          "Canceling an appointment:",
          "For the current MVP:",
          "• Staff can cancel via Admin → Appointments",
          "• Patients can request cancellation by messaging staff (or submit a note via Contact)",
          "",
          "If you want patient self-cancel, we can add a button that archives + deletes with proper audit flags (like your admin flow).",
        ].join("\n"),
        baseQuickReplies(ctx.role)
      );

    case "admin_appointments":
      if (ctx.role !== "staff") {
        return answerCard(
          `That’s an admin function. If you’re staff, sign in with an admin email and go to: ${KB.portalPaths.adminAppointments}`,
          baseQuickReplies(ctx.role)
        );
      }
      return answerCard(
        [
          "Admin → Manage Appointments:",
          `Open: ${KB.portalPaths.adminAppointments}`,
          "",
          "You can:",
          "• Approve / Reject / Cancel",
          "• Delete (Archive)",
          "• Message the patient to reschedule",
        ].join("\n"),
        baseQuickReplies(ctx.role)
      );

    case "admin_content":
      if (ctx.role !== "staff") {
        return answerCard(
          `That’s an admin function. If you’re staff, go to: ${KB.portalPaths.adminContent}`,
          baseQuickReplies(ctx.role)
        );
      }
      return answerCard(
        [
          "Admin → Edit Website Content:",
          `Open: ${KB.portalPaths.adminContent}`,
          "",
          "You can update page text without editing code.",
        ].join("\n"),
        baseQuickReplies(ctx.role)
      );

    default:
      return answerCard(
        [
          "I can help with navigation + scheduling inside this app.",
          "Try one of these:",
        ].join("\n"),
        baseQuickReplies(ctx.role)
      );
  }
}