import { Link } from "react-router-dom";
import usePageMeta from "../../seo/usePageMeta";
import { SERVICES } from "./servicesData";
import { VoxelTile } from "../../graphics/VoxelArt";
import { serviceIcon, type ServiceIcon } from "../../graphics/scenes";
import type { SpriteIcon } from "../../graphics/sprites";

const ICON_FOR: Record<string, SpriteIcon | ServiceIcon> = {
  "sick-visit": "cross",
  physicals: "ball",
  "med-review": "pill",
  "chronic-care": "stethoscope",
  "house-calls": "house",
  functional: "flower",
};
const SPRITE_KINDS: SpriteIcon[] = ["heart", "ball", "cross", "stethoscope"];
const VOXEL_ICONS = Object.fromEntries(
  (["blocks", "flower", "pill", "house"] as ServiceIcon[]).map((k) => [
    k,
    serviceIcon(k),
  ]),
);

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--link)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Services() {
  usePageMeta({
    title: "Services | Willow Bend Family Clinic",
    description:
      "Family-practice services with clear pricing: same-day sick visits, physicals, medication review, chronic care, and house calls.",
    canonicalPath: "/services",
  });

  return (
    <div className="space-y-12">
      {/* Page head */}
      <header className="space-y-4 max-w-2xl">
        <div className="eyebrow">Our services</div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">
          Clear pricing, respectful care, a practical approach
        </h1>
        <p className="text-base sm:text-lg" style={{ color: "var(--muted)" }}>
          If you're not sure what you need, contact the clinic — or ask Willow —
          and we'll point you in the right direction.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link to="/request" className="btn-hero">
            Request an appointment
          </Link>
          <Link to="/contact" className="btn-ghost">
            Contact + map
          </Link>
        </div>
      </header>

      {/* Service cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {SERVICES.map((s) => (
          <div
            key={s.id}
            className="card card--hover p-6 sm:p-7 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              {SPRITE_KINDS.includes(ICON_FOR[s.id] as SpriteIcon) ? (
                <VoxelTile
                  sprite={ICON_FOR[s.id] as SpriteIcon}
                  size={68}
                  tint={s.tint}
                />
              ) : (
                <VoxelTile
                  grid={VOXEL_ICONS[ICON_FOR[s.id]]}
                  size={68}
                  tint={s.tint}
                />
              )}

              <div className="flex flex-col items-end gap-2">
                <span className="badge-price">{s.price}</span>
                {s.pending && <span className="badge-soon">Coming soon</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold">{s.title}</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {s.summary}
              </p>
            </div>

            <ul className="text-sm space-y-2" style={{ color: "var(--ink2)" }}>
              {s.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <CheckIcon />
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 mt-auto">
              <Link
                to={s.ctaTo || "/contact"}
                className={s.pending ? "btn-ghost w-full" : "btn-hero w-full"}
              >
                {s.ctaLabel || "Contact"}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Insurance + emergencies */}
      <div className="grid gap-5 md:grid-cols-2">
        <div
          className="card p-6 sm:p-8 space-y-3"
          style={{ background: "var(--panel)" }}
        >
          <h2 className="text-xl font-bold">Insurance &amp; payment</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            We accept most major insurance plans for standard visits, and offer
            simple cash-pay pricing for the services listed above. Questions
            about coverage? Send us a message and we'll check before you book.
          </p>
          <Link
            to="/contact"
            className="inline-block text-sm font-semibold"
            style={{ color: "var(--link)" }}
          >
            Ask about your plan →
          </Link>
        </div>

        <div className="band--gradient p-6 sm:p-8 space-y-3">
          <h2 className="text-xl font-bold">A note on emergencies</h2>
          <p className="text-sm" style={{ color: "var(--band-muted)" }}>
            This site is for general information and appointment requests — it
            is not intended for emergencies. In an emergency, call 911 or go to
            the nearest emergency department.
          </p>
        </div>
      </div>
    </div>
  );
}
