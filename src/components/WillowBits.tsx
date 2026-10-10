import type { ChatMessage } from "../chatbot/types";
import { VoxelSvg } from "../graphics/VoxelArt";
import { willowMascot } from "../graphics/scenes";

const MASCOT = willowMascot();

/** Shared presentational pieces for the Willow chat surfaces
 *  (full page at /help and the floating widget). Engine logic lives
 *  in src/chatbot/engine.ts and is unchanged. */

export const WILLOW_DISCLAIMER =
  "Willow can make mistakes and is not a substitute for medical advice. For emergencies, call 911.";

export function SparkleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l1.9 5.8L20 9.7l-5 3.8 1.9 6L12 15.8 7.1 19.5l1.9-6-5-3.8 6.1-1.9L12 2Z" />
    </svg>
  );
}

export function WillowAvatar({ size = 34 }: { size?: number }) {
  return (
    <span
      className="logo-mark shrink-0 p-0.5"
      style={{ height: size, width: size }}
      aria-hidden
    >
      <VoxelSvg grid={MASCOT} unit={8} className="h-full w-full" />
    </span>
  );
}

export function TypingDots() {
  return (
    <div className="flex items-end gap-2" aria-label="Willow is typing">
      <WillowAvatar />
      <div
        className="flex items-center gap-1 px-4 py-3.5"
        style={{ background: "var(--sage-tint)", border: "2px solid var(--line)" }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[78%] px-4 py-3 text-sm whitespace-pre-wrap"
          style={{
            background: "var(--primary)",
            color: "var(--on-primary)",
            border: "2px solid var(--line)",
          }}
        >
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <WillowAvatar />
      <div
        className="max-w-[82%] px-4 py-3 text-sm whitespace-pre-wrap"
        style={{
          background: "var(--sage-tint)",
          color: "var(--ink2)",
          border: "2px solid var(--line)",
        }}
      >
        {message.text}
      </div>
    </div>
  );
}
