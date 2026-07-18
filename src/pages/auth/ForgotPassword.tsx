import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import usePageMeta from "../../seo/usePageMeta";
import { firebaseAuth } from "../../firebase/auth"; // adjust if your file is named differently

export default function ForgotPassword() {
  usePageMeta({
    title: "Reset Password • Willow Bend Family Clinic",
    description: "Request a password reset email.",
    noIndex: true,
  });

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const canSend = useMemo(() => email.trim().length >= 6 && email.includes("@"), [email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend || status === "sending") return;

    setStatus("sending");
    setMessage("");

    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      setStatus("sent");
      setMessage("If an account exists for that email, a reset link has been sent.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? "Unable to send reset email.");
    }
  }

  const isError = status === "error";
  const noticeBorder = isError
    ? "color-mix(in srgb, var(--danger) 45%, var(--border))"
    : "color-mix(in srgb, var(--primary) 45%, var(--border))";
  const noticeBg = isError
    ? "color-mix(in srgb, var(--danger) 16%, transparent)"
    : "color-mix(in srgb, var(--primary) 14%, transparent)";

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-xl font-semibold text-theme">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your email and we will send a password reset link.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <label className="space-y-2 block">
            <span className="text-xs text-muted">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />
          </label>

          {message && (
            <div
              className="rounded-xl border px-3 py-2 text-sm"
              style={{
                borderColor: noticeBorder,
                background: noticeBg,
                color: "var(--text)",
              }}
              role="status"
              aria-live="polite"
            >
              <div className="font-semibold" style={{ color: isError ? "var(--danger)" : "var(--primary)" }}>
                {isError ? "Reset error" : "Reset requested"}
              </div>
              <div className="text-muted">{message}</div>
            </div>
          )}

          <button type="submit" className="btn-hero w-full py-2" disabled={!canSend || status === "sending"}>
            {status === "sending" ? "Sending…" : "Send reset link"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/login"
              className="underline underline-offset-4"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              Back to login
            </Link>

            <Link
              to="/signup"
              className="underline underline-offset-4"
              style={{ color: "var(--muted2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted2)")}
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}