import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import usePageMeta from "../../seo/usePageMeta";

export default function Signup() {
  usePageMeta({
    title: "Create Account • Willow Bend Family Clinic",
    description: "Create a patient portal account.",
    noIndex: true,
  });

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return email.trim().includes("@") && password.length >= 6;
  }, [email, password]);

  async function onGoogle() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await loginWithGoogle();
      navigate("/patient", { replace: true });
    } catch (e: any) {
      setError(e?.message ?? "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;

    setBusy(true);
    setError("");
    try {
      await signup({
        email: email.trim(),
        password,
        displayName: displayName.trim() || undefined,
      });
      navigate("/patient", { replace: true });
    } catch (e: any) {
      setError(e?.message ?? "Signup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-xl font-semibold text-theme">Create account</h1>
        <p className="mt-2 text-sm text-muted">
          Prototype portal. Do not submit sensitive medical information.
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            className="btn-ghost w-full px-4 py-2 text-sm"
          >
            {busy ? "Working…" : "Continue with Google"}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "var(--border)" }} />
          <span className="text-xs text-muted2">or</span>
          <div className="h-px flex-1" style={{ background: "var(--border)" }} />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs text-muted">Display name (optional)</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
              placeholder="Your name"
              autoComplete="name"
            />
          </label>

          <label className="block space-y-2">
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

          <label className="block space-y-2">
            <span className="text-xs text-muted">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Minimum 6 characters"
              type="password"
              autoComplete="new-password"
            />
          </label>

          {error && (
            <div
              className="rounded-xl border px-3 py-2 text-sm"
              style={{
                borderColor: "color-mix(in srgb, var(--danger) 45%, var(--border))",
                background: "color-mix(in srgb, var(--danger) 16%, transparent)",
                color: "var(--text)",
              }}
              role="alert"
            >
              <div className="font-semibold" style={{ color: "var(--danger)" }}>
                Signup error
              </div>
              <div className="text-muted">{error}</div>
            </div>
          )}

          <button type="submit" disabled={busy || !canSubmit} className="btn-hero w-full py-2">
            {busy ? "Creating…" : "Create account (Email/Password)"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link
              className="underline underline-offset-4"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              to="/login"
            >
              Already have an account?
            </Link>
            <Link
              className="underline underline-offset-4"
              style={{ color: "var(--muted2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted2)")}
              to="/"
            >
              Back to site
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}