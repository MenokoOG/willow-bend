export type ChatRole = "patient" | "staff" | "guest";

export type ChatSender = "user" | "bot" | "system";

export type QuickReply = {
  id: string;
  label: string;
  payload: string;
};

export type ChatMessage = {
  id: string;
  sender: ChatSender;
  text: string;
  ts: number;
  quickReplies?: QuickReply[];
};

export type BotAnswer = {
  text: string;
  quickReplies?: QuickReply[];
  nextState?: string;
};

export type BotContext = {
  role: ChatRole;
  userEmail?: string;
  userUid?: string;
  state?: string;
};

export type BotIntent =
  | "greeting"
  | "help"
  | "hours"
  | "location"
  | "services"
  | "insurance"
  | "contact"
  | "appointment_request"
  | "appointment_status"
  | "appointment_reschedule"
  | "appointment_cancel"
  | "portal_login"
  | "portal_signup"
  | "portal_password_reset"
  | "admin_appointments"
  | "admin_content"
  | "privacy"
  | "emergency"
  | "unknown";

export type BotTurn = {
  intent: BotIntent;
  confidence: number;
  entities?: Record<string, string>;
};