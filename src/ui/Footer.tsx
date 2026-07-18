import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in srgb, var(--bg) 92%, transparent)",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand / clinic blurb */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="h-10 w-10 rounded-xl grid place-items-center"
                style={{
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
                aria-hidden
              >
                <span className="text-sm font-bold">WB</span>
              </div>

              <div className="leading-tight">
                <div className="text-sm font-semibold text-[color:var(--text)]">
                  Willow Bend Family Clinic
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  Meridian, Idaho
                </div>
              </div>
            </div>

            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Respectful, human-centered care with a practical approach. Built
              for clarity, accessibility, and a smooth experience for patients
              and staff.
            </p>

            <div className="text-sm" style={{ color: "var(--muted)" }}>
              <div className="font-medium text-[color:var(--text)]">
                Business Email
              </div>
              <a
                className="underline underline-offset-4"
                style={{ color: "var(--text)" }}
                href="mailto:hello@willowbendclinic.example"
              >
                hello@willowbendclinic.example
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-[color:var(--text)]">
              Explore
            </div>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/services", label: "Services" },
                { to: "/testimonials", label: "Testimonials" },
                { to: "/contact", label: "Contact + Map" },
                { to: "/request", label: "Request Appointment" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="transition"
                    style={{ color: "var(--muted)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--text)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--muted)")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Small disclaimer + staff */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-[color:var(--text)]">
              Notes
            </div>

            <div
              className="rounded-xl p-4 text-sm space-y-2"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--muted)",
              }}
            >
              <p>
                This site is for general information and appointment requests.
                It is not intended for emergencies.
              </p>
              <p style={{ color: "var(--muted2)" }}>
                In an emergency, call 911 or go to the nearest emergency
                department.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-ghost text-sm px-4 py-2">
                 Login
              </Link>

              <Link to="/admin" className="btn-ghost text-sm px-4 py-2">
                Admin
              </Link>
            </div>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pt-6"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="text-xs" style={{ color: "var(--muted2)" }}>
            © {new Date().getFullYear()} Willow Bend Family Clinic. All rights
            reserved.
          </div>

          <div className="text-xs" style={{ color: "var(--muted2)" }}>
            Built by M3n0ko0g of Crimson Obsidain Industries, 2025
          </div>
        </div>
      </div>
    </footer>
  );
}
