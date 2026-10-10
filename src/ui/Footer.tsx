import { Link } from "react-router-dom";
import { LogoMark } from "./Header";

const LINK_COLUMNS: {
  title: string;
  links: { to: string; label: string }[];
}[] = [
  {
    title: "Care",
    links: [
      { to: "/services", label: "Services" },
      { to: "/request", label: "Request Appointment" },
      { to: "/testimonials", label: "Testimonials" },
    ],
  },
  {
    title: "Patients",
    links: [
      { to: "/patient", label: "Patient portal" },
      { to: "/patient/calendar", label: "My calendar" },
      { to: "/login", label: "Login" },
    ],
  },
  {
    title: "Clinic",
    links: [
      { to: "/contact", label: "Contact + Map" },
      { to: "/help", label: "Ask Willow" },
      { to: "/admin", label: "Admin" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="border-t-4"
      style={{
        borderColor: "var(--line)",
        background: "var(--panel)",
        color: "var(--ink)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <div className="leading-tight">
                <div className="font-display text-[15px] font-bold">
                  Willow Bend
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  Family Clinic
                </div>
              </div>
            </div>

            <p className="text-sm max-w-xs" style={{ color: "var(--muted)" }}>
              Unhurried, whole-person primary care for every stage of life —
              right here in your neighborhood.
            </p>

            <div className="text-sm space-y-1" style={{ color: "var(--muted)" }}>
              <div>480 Willow Bend Dr, Suite 100</div>
              <div>Meridian, ID 83642</div>
              <div>
                <a
                  className="underline underline-offset-4"
                  href="tel:+12085550142"
                >
                  (208) 555-0142
                </a>
              </div>
              <div>
                <a
                  className="underline underline-offset-4"
                  href="mailto:hello@willowbendclinic.example"
                >
                  hello@willowbendclinic.example
                </a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {LINK_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <div className="text-sm font-semibold">{col.title}</div>
              <ul className="space-y-2 text-sm">
                {col.links.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="transition hover:text-[color:var(--ink)]"
                      style={{ color: "var(--muted)" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pt-6"
          style={{ borderTop: "3px solid var(--line)" }}
        >
          <div className="text-xs" style={{ color: "var(--muted2)" }}>
            © {new Date().getFullYear()} Willow Bend Family Clinic. All rights
            reserved. Not for emergencies — in an emergency, call 911.
          </div>

          <div className="text-xs" style={{ color: "var(--muted2)" }}>
            Built by M3n0ko0g of classHuman AI
          </div>
        </div>
      </div>
    </footer>
  );
}
