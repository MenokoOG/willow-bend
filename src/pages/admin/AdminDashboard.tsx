import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import usePageMeta from "../../seo/usePageMeta";

export default function AdminDashboard() {
  usePageMeta({
    title: "Admin Dashboard | Willow Bend Family Clinic",
    description:
      "Admin dashboard for managing site content and appointment requests.",
    canonicalPath: "/admin",
  });

  const { user, logout } = useAuth();

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      {/* Top header card (this is the “upper card” you’re missing) */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: "var(--text)" }}>
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Signed in as <span className="font-semibold">{user?.email}</span>
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted2)" }}>
              Manage site content and appointment requests.
            </p>
          </div>

          <button className="btn-hero px-4 py-2" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/admin/content"
          className="card p-6 block transition focus:outline-none focus-visible:ring-2"
          style={{
            boxShadow: "none",
            color: "var(--text)",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--panel2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--panel)";
          }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text)" }}>
            Edit Website Content
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Update text on every page of the site. No coding required.
          </p>
          <div className="mt-4 text-sm font-semibold" style={{ color: "var(--primary2)" }}>
            Open editor →
          </div>
        </Link>

        <Link
          to="/admin/appointments"
          className="card p-6 block transition focus:outline-none focus-visible:ring-2"
          style={{
            boxShadow: "none",
            color: "var(--text)",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--panel2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--panel)";
          }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text)" }}>
            Manage Appointments
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Review, approve, and reject appointment requests.
          </p>
          <div className="mt-4 text-sm font-semibold" style={{ color: "var(--warn)" }}>
            Review requests →
          </div>
        </Link>

        <Link
          to="/admin/messages"
          className="card p-6 block transition focus:outline-none focus-visible:ring-2"
          style={{
            boxShadow: "none",
            color: "var(--text)",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--panel2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--panel)";
          }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text)" }}>
            Messages &amp; Archives
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            See, edit, and delete portal messages. Clear old appointment
            archives.
          </p>
          <div className="mt-4 text-sm font-semibold" style={{ color: "var(--primary2)" }}>
            Manage messages →
          </div>
        </Link>
      </div>
    </section>
  );
}
