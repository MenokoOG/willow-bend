import type { BotAnswer, ChatRole, QuickReply } from "./types";

function qr(id: string, label: string, payload: string): QuickReply {
  return { id, label, payload };
}

// Keep this content “relative to the program” (no medical advice).
export const KB = {
  brand: "Willow Bend Family Clinic",
  portalPaths: {
    request: "/request",
    login: "/login",
    signup: "/signup",
    forgot: "/forgot", // if you add a route for it later
    patient: "/patient",
    patientCalendar: "/patient/calendar",
    admin: "/admin",
    adminAppointments: "/admin/appointments",
    adminContent: "/admin/content",
    help: "/help",
  },

  // You can tune these later
  clinicInfo: {
    // If you don’t want to show these, leave them blank.
    hoursText:
      "Clinic hours vary. For the prototype, please use the Contact page to reach the office for availability.",
    locationText:
      "For directions and address, please use the Contact page (map + address).",
    servicesText:
      "For available services, see the Services page. This chatbot can help you navigate the portal and scheduling flow.",
    insuranceText:
      "For insurance and billing questions, please contact the clinic directly via the Contact page.",
    privacyText:
      "Prototype portal only. Do not submit sensitive medical information. Use Contact for official requests.",
    emergencyText:
      "If this is a medical emergency, call 911 (or your local emergency number). This chatbot is for navigation and scheduling help only.",
  },
};

export function baseQuickReplies(role: ChatRole) {
  const common = [
    qr("qr_request", "Request appointment", "I want to request an appointment"),
    qr("qr_status", "My appointment status", "Check my appointment status"),
    qr("qr_login", "Login help", "I need help logging in"),
    qr("qr_reset", "Reset password", "I forgot my password"),
    qr("qr_contact", "Contact clinic", "How do I contact the clinic?"),
  ];

  if (role === "staff") {
    return [
      ...common,
      qr("qr_admin_appts", "Manage appointments", "How do I manage appointments?"),
      qr("qr_admin_content", "Edit website content", "How do I edit website content?"),
    ];
  }

  return common;
}

export function answerCard(
  text: string,
  quickReplies?: QuickReply[],
  nextState?: string
): BotAnswer {
  return { text, quickReplies, nextState };
}