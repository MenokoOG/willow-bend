import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { usePageContent } from "../../hooks/index";
import EditableBlock from "../../cms/EditableBlock";

export default function Home() {
  const { role, user } = useAuth();
  const { data, loading, save } = usePageContent("home");

  if (loading || !data) return <div className="p-8">Loading…</div>;

  // MVP logic:
  // - New patients: Request initial appointment
  // - Existing patients: login + use portal scheduling
  const isAuthed = !!user;

  return (
    <section className="p-10 space-y-8">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold leading-tight">
          <EditableBlock
            value={data.heroTitle}
            isAdmin={role === "admin"}
            onSave={(v) => save({ heroTitle: v })}
          />
        </h1>

        <p className="text-lg" style={{ color: "var(--muted)" }}>
          <EditableBlock
            value={data.heroSubtitle}
            isAdmin={role === "admin"}
            onSave={(v) => save({ heroSubtitle: v })}
          />
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Primary CTA */}
        {!isAuthed ? (
          <Link to="/request" className="btn-hero inline-flex">
            Request an Initial Appointment
          </Link>
        ) : (
          <Link to="/patient" className="btn-hero inline-flex">
            Existing Patient: Go to Portal
          </Link>
        )}

        {/* Secondary CTA */}
        <Link to="/contact" className="btn-ghost inline-flex">
          Contact the Clinic
        </Link>
      </div>

      <div
        className="card p-6 sm:p-7 text-sm"
        style={{ color: "var(--muted)" }}
      >
        <div className="font-semibold" style={{ color: "var(--text)" }}>
          Appointment guidance
        </div>
        <ul className="mt-2 space-y-2 list-disc pl-5">
          <li>
            If you are not yet a patient, request an initial appointment so
            staff can follow up.
          </li>
          <li>
            If you are an existing patient, log in and schedule through the
            portal.
          </li>
        </ul>
      </div>
    </section>
  );
}
