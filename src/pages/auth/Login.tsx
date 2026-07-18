import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import usePageMeta from "../../seo/usePageMeta";

export default function Login() {
  usePageMeta({
    title: "Login • Willow Bend Family Clinic",
    description: "Secure login for patients and clinic admin.",
    noIndex: true,
  });

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as any)?.from as string | undefined;

  const canSubmit = useMemo(() => {
    return email.trim().includes("@") && password.length >= 6;
  }, [email, password]);

  async function onGoogle() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await loginWithGoogle();
      navigate(from || "/patient", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed.");
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
      await login(email.trim(), password);
      navigate(from || "/patient", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Unable to log in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-xl font-semibold text-theme">Log in</h1>
        <p className="mt-2 text-sm text-muted">
          Use Google sign-in for the most reliable prototype experience.
        </p>

        <div className="mt-5">
          <button
            onClick={onGoogle}
            className="btn-ghost w-full px-4 py-2 text-sm"
            disabled={busy}
            aria-label="Continue with Google"
          >
            {busy ? "Signing in…" : "Continue with Google"}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "var(--border)" }} />
          <span className="text-xs text-muted2">or</span>
          <div className="h-px flex-1" style={{ background: "var(--border)" }} />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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

          <label className="space-y-2 block">
            <span className="text-xs text-muted">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
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
                Login error
              </div>
              <div className="text-muted">{error}</div>
            </div>
          )}

          <button className="btn-hero w-full py-2" disabled={!canSubmit || busy}>
            {busy ? "Logging in…" : "Log in with Email"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/signup"
              className="underline underline-offset-4 text-muted hover:opacity-90"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              Create account
            </Link>

            <Link
              to="/forgot"
              className="underline underline-offset-4 text-muted hover:opacity-90"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              Forgot password
            </Link>
          </div>

          <div className="pt-2 text-sm">
            <Link
              to="/"
              className="underline underline-offset-4"
              style={{ color: "var(--muted2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted2)")}
            >
              Back to site
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}