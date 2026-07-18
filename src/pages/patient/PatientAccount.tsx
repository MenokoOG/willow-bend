import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import usePageMeta from "../../seo/usePageMeta";
import useLocalStorage from "../../hooks/useLocalStorage";

type DemoPrefs = {
  preferredName: string;
  phone: string;
  emailUpdates: boolean;
  smsUpdates: boolean;
};

const STORAGE_KEY = "sr-demo-patient-prefs-v1";

export default function PatientAccount() {
  usePageMeta({
    title: "Account • Patient Portal",
    description: "Patient account preferences (demo).",
    noIndex: true,
  });

  const { profile, logout } = useAuth();

  const [prefs, setPrefs] = useLocalStorage<DemoPrefs>(STORAGE_KEY, {
    preferredName: "",
    phone: "",
    emailUpdates: true,
    smsUpdates: false,
  });

  const [savedAt, setSavedAt] = useState<number | null>(null);

  const initials = useMemo(() => {
    const name = (prefs.preferredName || profile?.email || "").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (!parts.length) return "SR";
    const a = parts[0]?.[0] ?? "S";
    const b = parts[1]?.[0] ?? "R";
    return `${a}${b}`.toUpperCase();
  }, [prefs.preferredName, profile?.email]);

  function update<K extends keyof DemoPrefs>(key: K, value: DemoPrefs[K]) {
    setPrefs({ ...prefs, [key]: value });
    setSavedAt(Date.now());
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center font-semibold"
              style={{
                background: "var(--panel2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              aria-hidden
            >
              {initials}
            </div>

            <div>
              <h1 className="text-xl font-semibold text-theme">Account (Demo)</h1>
              <p className="mt-1 text-sm text-muted">
                Signed in as{" "}
                <span className="font-medium text-theme">{profile?.email}</span>
              </p>
              <p className="mt-1 text-xs text-muted2">
                Demo-only settings stored locally in your browser. Do not enter sensitive
                information.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={logout} className="btn-ghost px-4 py-2 text-sm">
              Log out
            </button>
            <Link to="/patient" className="btn-hero px-4 py-2 text-sm">
              Back to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-theme">Preferences</h2>
          {savedAt && (
            <p className="text-xs text-muted2">
              Saved {new Date(savedAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs text-muted">Preferred name</span>
            <input
              value={prefs.preferredName}
              onChange={(e) => update("preferredName", e.target.value)}
              className="input"
              placeholder="Example: Alex"
              autoComplete="off"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs text-muted">Phone (optional)</span>
            <input
              value={prefs.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="input"
              placeholder="(555) 555-5555"
              autoComplete="off"
              inputMode="tel"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label
            className="rounded-xl p-4 flex items-start gap-3"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel)",
            }}
          >
            <input
              type="checkbox"
              checked={prefs.emailUpdates}
              onChange={(e) => update("emailUpdates", e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <div>
              <div className="text-sm font-medium text-theme">Email updates</div>
              <div className="text-xs text-muted">
                Receive appointment reminders via email (demo).
              </div>
            </div>
          </label>

          <label
            className="rounded-xl p-4 flex items-start gap-3"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel)",
            }}
          >
            <input
              type="checkbox"
              checked={prefs.smsUpdates}
              onChange={(e) => update("smsUpdates", e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <div>
              <div className="text-sm font-medium text-theme">SMS updates</div>
              <div className="text-xs text-muted">Receive reminders via SMS (demo).</div>
            </div>
          </label>
        </div>
      </section>
    </div>
  );
}