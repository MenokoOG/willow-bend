import type { BotAnswer, IntentRule } from "./types";

export const INTENT_RULES: IntentRule[] = [
  {
    key: "greeting",
    audience: "any",
    score: 10,
    patterns: [/^\s*(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/i],
  },
  {
    key: "hours",
    audience: "any",
    score: 7,
    patterns: [/hours|open|closing|when.*open|when.*close/i],
  },
  {
    key: "location",
    audience: "any",
    score: 7,
    patterns: [/location|address|where.*(located|location)|directions/i],
  },
  {
    key: "contact",
    audience: "any",
    score: 7,
    patterns: [/contact|phone|email|call|reach you|message you/i],
  },
  {
    key: "services",
    audience: "any",
    score: 6,
    patterns: [/services|what do you treat|treatments|care|primary care|adult medicine/i],
  },
  {
    key: "request_appointment",
    audience: "patient",
    score: 9,
    patterns: [/request.*appointment|book.*appointment|schedule.*appointment|make.*appointment|appointment request/i],
  },
  {
    key: "appointment_status",
    audience: "patient",
    score: 9,
    patterns: [/status|approved|rejected|canceled|cancelled|requested|pending/i],
  },
  {
    key: "approve_reject_cancel",
    audience: "staff",
    score: 9,
    patterns: [/approve|reject|cancel|manage appointments|admin appointments/i],
  },
  {
    key: "login_help",
    audience: "any",
    score: 8,
    patterns: [/login|log in|sign in|cant log|can't log|unable to log|error logging/i],
  },
  {
    key: "signup_help",
    audience: "any",
    score: 8,
    patterns: [/signup|sign up|create account|register/i],
  },
  {
    key: "password_reset",
    audience: "any",
    score: 8,
    patterns: [/forgot password|reset password|password reset|recover password/i],
  },
  {
    key: "admin_dashboard",
    audience: "staff",
    score: 8,
    patterns: [/admin dashboard|admin|content editor|edit website content/i],
  },
  {
    key: "patient_portal",
    audience: "patient",
    score: 8,
    patterns: [/patient portal|my portal|my appointments|my account/i],
  },
  {
    key: "calendar_help",
    audience: "any",
    score: 7,
    patterns: [/calendar|month view|today highlight|glow|date picker/i],
  },
  {
    key: "theme_help",
    audience: "any",
    score: 6,
    patterns: [/theme|dark mode|light mode|colors|contrast/i],
  },
  {
    key: "accessibility",
    audience: "any",
    score: 9,
    patterns: [/accessibility|accessible|screen reader|keyboard|large text|contrast|vision|nystagmus|triple/i],
  },
  {
    key: "privacy",
    audience: "any",
    score: 7,
    patterns: [/privacy|hipaa|sensitive|medical info|security/i],
  },
  {
    key: "handoff",
    audience: "any",
    score: 8,
    patterns: [/human|person|staff|help me|contact support|talk to someone|real person/i],
  },
];

export const ANSWERS: Record<string, BotAnswer> = {
  greeting: {
    key: "greeting",
    text:
      "Hi 👋 I’m the SRAM helper bot. I can help with appointments, portal/login issues, and where to find things in the admin/patient pages.\n\nTry: “How do I request an appointment?” or “What does requested vs approved mean?”",
    followUps: [
      "How do I request an appointment?",
      "What do appointment statuses mean?",
      "I can't log in",
      "How do I reset my password?",
    ],
  },

  hours: {
    key: "hours",
    text:
      "Clinic hours can vary. If your site has an Hours section on the Home/Contact page, that’s the source of truth.\n\nIf you tell me what page you’re looking at (Home / Contact), I can guide you to the exact section.",
    followUps: ["Where is the Contact page?", "How do I request an appointment?"],
  },

  location: {
    key: "location",
    text:
      "For location and directions, check the Contact page (and the map section if included). That page should always be the official address.\n\nWant me to walk you there in the menu?",
    followUps: ["Take me to Contact", "Where is the map?"],
  },

  contact: {
    key: "contact",
    text:
      "You can contact the clinic from the Contact page.\n\nIf this is about an appointment request, you can also submit a request in “Request Appointment” and staff will follow up.",
    followUps: ["How do I request an appointment?", "I need help logging in"],
  },

  services: {
    key: "services",
    text:
      "Services are listed on the Services page. If you tell me what you’re looking for (primary care, adult medicine, follow-up, etc.), I can point you to the right section.",
    followUps: ["Take me to Services", "How do I request an appointment?"],
  },

  request_appointment: {
    key: "request_appointment",
    text:
      "To request an appointment:\n1) Open “Request Appointment”\n2) Fill in your name, email, date, time\n3) Submit\n\nAfter that, your appointment will show as **requested** until staff reviews it.\n\nIf you create an account using the SAME email, your portal/calendar can show your appointment and its status.",
    followUps: ["What does requested mean?", "How do I create an account?"],
  },

  appointment_status: {
    key: "appointment_status",
    text:
      "Appointment status meanings:\n- **requested** = received, waiting for staff review\n- **approved** = confirmed\n- **rejected** = cannot be scheduled as requested\n- **canceled** = canceled after approval or by staff\n\nIf your portal is live-synced, these updates should appear automatically in your calendar.",
    followUps: ["Why do I not see my appointment?", "How do I log in?"],
  },

  approve_reject_cancel: {
    key: "approve_reject_cancel",
    text:
      "Staff workflow:\n1) Go to **Admin → Appointments**\n2) Select a day on the calendar to filter\n3) Approve / Reject / Cancel\n4) Optional: Message patient for reschedule\n\nPatients should see status changes in their portal if the appointment is linked to their account (UID/email match).",
    followUps: ["How do patients sync appointments?", "How do I send a message?"],
  },

  login_help: {
    key: "login_help",
    text:
      "Login help:\n- Try **Google sign-in** first (most reliable for the prototype)\n- If using email/password, confirm your password is 6+ characters\n- If the page looks blank on Light theme, the fix is to use theme tokens (var(--text), var(--panel), etc.) instead of hard-coded white text.\n\nIf you forgot your password, use “Reset Password”.",
    followUps: ["Reset my password", "Create account", "Theme looks broken"],
  },

  signup_help: {
    key: "signup_help",
    text:
      "Signup help:\n- Use **Continue with Google** (recommended)\n- If using email/password: password must be 6+ characters\n- Use the same email you used for appointment requests so the portal can match your appointments.",
    followUps: ["I can’t log in", "What does requested mean?"],
  },

  password_reset: {
    key: "password_reset",
    text:
      "Password reset:\n1) Go to the “Forgot Password / Reset Password” page\n2) Enter your email\n3) Submit\n\nYou’ll see a confirmation message. (For security, it may not tell you whether an account exists.)",
    followUps: ["Back to login", "Create account"],
  },

  admin_dashboard: {
    key: "admin_dashboard",
    text:
      "Admin dashboard:\n- **Edit Website Content** = update text across site pages\n- **Manage Appointments** = approve/reject/cancel and message patients\n\nIf cards disappear in Light mode, the fix is: cards must use your CSS theme variables for background + border + text (not white-only styling).",
    followUps: ["Manage appointments workflow", "Why are cards invisible on light theme?"],
  },

  patient_portal: {
    key: "patient_portal",
    text:
      "Patient portal:\n- View your calendar\n- See appointment statuses\n- (Optional) See messages from staff\n\nKey requirement: your appointment request must match your signed-in identity (same email, and ideally store patientUid).",
    followUps: ["Why do I not see my appointment?", "What does approved mean?"],
  },

  calendar_help: {
    key: "calendar_help",
    text:
      "Calendar tips:\n- The current day can be highlighted with a glow (aria-current='date')\n- Days with appointments can show a colored dot based on the most urgent status\n- Clicking a day can show appointment details below\n\nIf your app uses Firestore onSnapshot, status updates appear instantly without refresh.",
    followUps: ["What do the dots mean?", "My status didn’t update"],
  },

  theme_help: {
    key: "theme_help",
    text:
      "Theme help:\nIf Light mode is breaking on login/signup/admin pages, it usually means components are hard-coded with text-white/bg-white/… instead of using theme tokens.\n\nBest practice:\n- text: var(--text)\n- background: var(--panel)\n- border: var(--border)\n- muted text: var(--muted)\n\nThat guarantees both themes render correctly.",
    followUps: ["Why are login cards invisible?", "How do we fix all pages?"],
  },

  accessibility: {
    key: "accessibility",
    text:
      "Accessibility support (built-in):\n- High contrast theme tokens (works in light/dark)\n- Keyboard navigation (Tab/Shift+Tab)\n- Clear focus rings\n- Large click targets\n\nTip: Keep font sizes at least 16px for body, and ensure text uses var(--text)/var(--muted) so it stays readable in both themes.",
    followUps: ["Theme looks broken", "Help me request an appointment"],
  },

  privacy: {
    key: "privacy",
    text:
      "Privacy note:\nThis portal is a prototype. Avoid submitting sensitive medical details in free-text fields.\n\nAppointments and messages should contain only scheduling info unless the clinic explicitly enables secure messaging with proper policies.",
    followUps: ["How do I request an appointment?", "Contact the clinic"],
  },

  handoff: {
    key: "handoff",
    text:
      "If you need a human:\n- Use the Contact page to reach staff\n- Or submit an appointment request and staff can respond\n\nIf you tell me what you’re stuck on, I’ll try to guide you to the exact page/step.",
    followUps: ["I can't log in", "I don't see my appointment", "Where is Contact?"],
  },

  unknown: {
    key: "unknown",
    text:
      "I’m not sure I understood that. Try one of these:\n- “How do I request an appointment?”\n- “What does requested mean?”\n- “I can’t log in”\n- “Reset my password”\n- “Where is the admin dashboard?”",
    followUps: ["How do I request an appointment?", "I can't log in", "What does approved mean?"],
  },
};