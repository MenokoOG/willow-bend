import { Link } from "react-router-dom";
import usePageMeta from "../../seo/usePageMeta";
import { SERVICES } from "./servicesData";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="pill" style={{ color: "var(--text)" }}>
      {children}
    </span>
  );
}

export default function Services() {
  usePageMeta({
    title: "Services | Willow Bend Family Clinic",
    description:
      "Services offered including medication review, DOT exams, house calls, medical marijuana evaluations, advocacy, and upcoming functional medicine.",
    canonicalPath: "/services",
  });

  return (
    <section className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto">
      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--text)" }}>
          Services
        </h1>
        <p className="text-base sm:text-lg" style={{ color: "var(--muted)" }}>
          Clear pricing, respectful care, and a practical approach. If you’re not
          sure what you need, contact the clinic and we’ll point you in the right direction.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/request" className="btn-hero inline-flex">
            Request an Appointment
          </Link>
          <Link to="/contact" className="btn-ghost inline-flex">
            Contact + Map
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {SERVICES.map((s) => (
          <div key={s.id} className="card p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--text)" }}>
                  {s.title}
                </h2>
                <div className="text-sm" style={{ color: "var(--muted)" }}>
                  {s.summary}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge>{s.price}</Badge>
                {s.pending && (
                  <span
                    className="pill"
                    style={{
                      borderColor: "color-mix(in srgb, var(--warn) 40%, var(--border))",
                    }}
                  >
                    Pending
                  </span>
                )}
              </div>
            </div>

            <ul className="text-sm space-y-2 list-disc pl-5" style={{ color: "var(--muted)" }}>
              {s.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link to={s.ctaTo || "/contact"} className="btn-hero inline-flex">
                {s.ctaLabel || "Contact"}
              </Link>

              <Link to="/contact" className="btn-ghost inline-flex">
                Questions? Contact the clinic
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 text-sm space-y-2" style={{ color: "var(--muted)" }}>
        <div className="font-semibold" style={{ color: "var(--text)" }}>
          Important note
        </div>
        <p>
          This site is for general information and appointment requests. It is not intended for emergencies.
        </p>
        <p style={{ color: "var(--muted2)" }}>
          In an emergency, call 911 or go to the nearest emergency department.
        </p>
      </div>
    </section>
  );
}