import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { usePageContent } from "../../hooks/index";
import EditableBlock from "../../cms/EditableBlock";
import { VoxelFrame, VoxelSvg, VoxelTile } from "../../graphics/VoxelArt";
import {
  clinicScene,
  coordinatorBust,
  nurseBust,
  physicianBust,
  serviceIcon,
  willowMascot,
} from "../../graphics/scenes";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

// Scenes are built once at module load; rendering reuses the same grids.
const HERO_ART = clinicScene();
const TEAM_ART = {
  physician: physicianBust(),
  nurse: nurseBust(),
  coordinator: coordinatorBust(),
};
const SERVICE_ART = {
  blocks: serviceIcon("blocks"),
  flower: serviceIcon("flower"),
  pill: serviceIcon("pill"),
  house: serviceIcon("house"),
};
const WILLOW_ART = willowMascot();

const HOME_SERVICES = [
  {
    title: "Primary care",
    desc: "Checkups, prevention, and everyday health for adults and kids.",
    tint: "sage" as const,
    art: "heart" as const,
    kind: "sprite" as const,
  },
  {
    title: "Pediatrics",
    desc: "Gentle, thorough care for infants through teens.",
    tint: "clay" as const,
    art: "blocks" as const,
    kind: "voxel" as const,
  },
  {
    title: "Women's health",
    desc: "Wellness exams, screenings, and personalized guidance.",
    tint: "sage" as const,
    art: "flower" as const,
    kind: "voxel" as const,
  },
  {
    title: "Sports & school physicals",
    desc: "Quick, careful exams to keep the whole family active.",
    tint: "clay" as const,
    art: "ball" as const,
    kind: "sprite" as const,
  },
  {
    title: "Chronic care",
    desc: "Long-term support for diabetes, blood pressure, and more.",
    tint: "sage" as const,
    art: "pill" as const,
    kind: "voxel" as const,
  },
  {
    title: "House calls",
    desc: "In-home assessments for loved ones who can't come in.",
    tint: "clay" as const,
    art: "house" as const,
    kind: "voxel" as const,
  },
];

const CARE_TEAM = [
  {
    name: "Dr. Ana Reyes, MD",
    role: "Family Medicine",
    bio: "Believes the best medicine starts with listening. 12 years caring for families.",
    art: "physician" as const,
    imgLabel: "Illustration: voxel-art physician in a white coat and glasses",
    bg: "#bdeccd",
  },
  {
    name: "Jordan Blake, FNP",
    role: "Pediatrics & Wellness",
    bio: "Makes even the most nervous kids feel at ease during visits.",
    art: "nurse" as const,
    imgLabel: "Illustration: voxel-art nurse practitioner in teal scrubs",
    bg: "#ffd9c7",
  },
  {
    name: "Maria Santos, RN",
    role: "Care Coordinator",
    bio: "Your first call for questions, refills, and getting the right appointment.",
    art: "coordinator" as const,
    imgLabel: "Illustration: voxel-art care coordinator in a yellow cardigan",
    bg: "#fff1c7",
  },
];

const CARE_STEPS = [
  {
    n: "1",
    title: "Tell us about you",
    desc: "A few quick questions so we can match you with the right visit.",
  },
  {
    n: "2",
    title: "Pick a time",
    desc: "Same-week openings, with mornings, afternoons, and some evenings.",
  },
  {
    n: "3",
    title: "Come on in",
    desc: "We'll greet you by name and take it from there.",
  },
];

export default function Home() {
  const { role, user } = useAuth();
  const { data, loading, save } = usePageContent("home");

  if (loading || !data) return <div className="p-8">Loading…</div>;

  const isAuthed = !!user;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* ============ HERO ============ */}
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="pill">
            <span className="dot dot--approved" aria-hidden />
            Accepting new patients
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.05] tracking-tight">
            <EditableBlock
              value={data.heroTitle}
              isAdmin={role === "admin"}
              onSave={(v) => save({ heroTitle: v })}
            />
          </h1>

          <p
            className="text-lg max-w-xl leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            <EditableBlock
              value={data.heroSubtitle}
              isAdmin={role === "admin"}
              onSave={(v) => save({ heroSubtitle: v })}
            />
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {!isAuthed ? (
              <Link to="/request" className="btn-hero">
                Book a visit
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <Link to="/patient" className="btn-hero">
                Go to your portal
                <span aria-hidden>→</span>
              </Link>
            )}
            <Link to="/services" className="btn-ghost">
              Explore services
            </Link>
          </div>

          <dl className="flex flex-wrap gap-8 pt-4">
            {[
              { value: "12k+", label: "Patients cared for" },
              { value: "4.9★", label: "Average rating" },
              { value: "15 yrs", label: "Serving the valley" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-bold">{s.value}</dd>
                <dd className="text-sm" style={{ color: "var(--muted)" }}>
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <VoxelFrame
            grid={HERO_ART}
            label="Illustration: the Willow Bend clinic building with a garden, a doctor and two kids out front"
            ratio="1 / 1"
            unit={10}
          />
          <div
            className="card absolute -bottom-4 left-4 right-4 sm:left-8 sm:right-auto flex items-center gap-3 px-4 py-3"
            style={{ boxShadow: "0 18px 34px -22px rgba(43,58,46,0.5)" }}
          >
            <VoxelTile sprite="heart" size={48} tint="clay" />
            <div>
              <div className="text-sm font-bold">Same-week visits</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                Often next-day for urgent needs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section
        className="card px-6 py-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ background: "var(--panel)" }}
      >
        {[
          "Most insurance accepted",
          "Easy online scheduling",
          "Warm, unhurried visits",
          "Care for all ages",
        ].map((t) => (
          <div key={t} className="flex items-center gap-3">
            <span
              className="grid place-items-center h-8 w-8 rounded-full shrink-0"
              style={{
                background: "var(--accent)",
                color: "#0a2416",
                border: "2px solid var(--line)",
              }}
              aria-hidden
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-sm font-semibold">{t}</span>
          </div>
        ))}
      </section>

      {/* ============ SERVICES ============ */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Eyebrow>Our services</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything your family needs, under one roof
            </h2>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold"
            style={{ color: "var(--link)" }}
          >
            View all services →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_SERVICES.map((s) => (
            <div key={s.title} className="card card--hover p-6 space-y-3">
              {s.kind === "sprite" ? (
                <VoxelTile sprite={s.art} size={68} tint={s.tint} />
              ) : (
                <VoxelTile grid={SERVICE_ART[s.art]} size={68} tint={s.tint} />
              )}
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CARE TEAM ============ */}
      <section className="space-y-8">
        <div className="space-y-2">
          <Eyebrow>Meet the team</Eyebrow>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Real people who care for your whole family
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARE_TEAM.map((p) => (
            <div key={p.name} className="card card--hover overflow-hidden">
              <VoxelFrame
                grid={TEAM_ART[p.art]}
                label={p.imgLabel}
                ratio="5 / 4"
                background={p.bg}
                unit={10}
                className="!border-0 !border-b-[3px] !border-b-[color:var(--line)] !shadow-none"
              />
              <div className="p-6 space-y-1.5">
                <h3 className="text-lg font-bold">{p.name}</h3>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "var(--link)" }}
                >
                  {p.role}
                </div>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  {p.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CARE STEPS (dark band) ============ */}
      <section className="band px-6 py-10 sm:px-10 sm:py-14 space-y-8">
        <div className="space-y-2">
          <div
            className="eyebrow"
            style={{ color: "var(--yellow)" }}
          >
            Getting started is easy
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Three steps to your first visit
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {CARE_STEPS.map((s) => (
            <div
              key={s.n}
              className="p-6 space-y-3"
              style={{ border: "3px solid var(--band-line)" }}
            >
              <span
                className="font-display grid place-items-center h-10 w-10 text-lg font-extrabold"
                style={{
                  background: "var(--yellow)",
                  color: "#16324a",
                  border: "3px solid var(--line)",
                }}
                aria-hidden
              >
                {s.n}
              </span>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="text-sm" style={{ color: "var(--band-muted)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ WILLOW (AI ASSISTANT) PROMO ============ */}
      <section
        className="card p-6 sm:p-10 grid gap-10 lg:grid-cols-2 lg:items-center"
        style={{ background: "var(--ai-grad)", boxShadow: "var(--shadow-lg)" }}
      >
        <div className="space-y-5">
          <span className="pill">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 2l1.9 5.8L20 9.7l-5 3.8 1.9 6L12 15.8 7.1 19.5l1.9-6-5-3.8 6.1-1.9L12 2Z" />
            </svg>
            New — Willow, your care assistant
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Answers any time, day or night
          </h2>
          <p className="text-base max-w-md" style={{ color: "var(--muted)" }}>
            Willow can help you request appointments, find your way around the
            patient portal, and answer common clinic questions — instantly.
          </p>
          <Link to="/help" className="btn-hero">
            Chat with Willow
          </Link>
        </div>

        <div className="card p-5 space-y-4" aria-hidden>
          <div
            className="flex items-center gap-3 pb-3"
            style={{ borderBottom: "3px solid var(--line)" }}
          >
            <span className="logo-mark h-11 w-11 p-0.5">
              <VoxelSvg grid={WILLOW_ART} unit={8} className="h-full w-full" />
            </span>
            <div>
              <div className="text-sm font-bold">Willow</div>
              <div className="text-xs font-semibold" style={{ color: "var(--link)" }}>
                ● Online
              </div>
            </div>
          </div>
          <div
            className="px-4 py-3 text-sm max-w-[85%]"
            style={{ background: "var(--sage-tint)", color: "var(--ink2)", border: "2px solid var(--line)" }}
          >
            Hi! I can help you book a visit, refill a request, or answer clinic
            questions. What do you need?
          </div>
          <div
            className="px-4 py-3 text-sm max-w-[85%] ml-auto"
            style={{ background: "var(--primary)", color: "var(--on-primary)", border: "2px solid var(--line)" }}
          >
            Can I get a sports physical this week?
          </div>
          <div
            className="px-4 py-3 text-sm max-w-[85%]"
            style={{ background: "var(--sage-tint)", color: "var(--ink2)", border: "2px solid var(--line)" }}
          >
            Yes! Use the request page and we'll follow up with same-week
            options.
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="band--gradient px-6 py-12 sm:px-10 sm:py-16 text-center space-y-5">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Your family deserves better care
        </h2>
        <p className="max-w-xl mx-auto" style={{ color: "var(--band-muted)" }}>
          New patients are welcome, and same-week appointments are usually
          available. Let's get you on the schedule.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/request" className="btn-hero">
            Book a visit
          </Link>
          <a href="tel:+12085550142" className="btn-ghost">
            Call (208) 555-0142
          </a>
        </div>
      </section>
    </div>
  );
}
