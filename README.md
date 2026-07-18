# Willow Bend Family Clinic

A production-level **demo** website for Willow Bend Family Clinic — a
**fictional** family-practice clinic in Meridian, ID. All clinic data in this
repository (name, address, phone number, email, testimonials) is fictional and
for demonstration only.

The site demonstrates what a small clinic gets from a modern static-first
stack: public marketing pages with SEO (sitemap, robots, per-page metadata,
security headers), online appointment requests, a patient portal, an admin
portal with lightweight CMS-style content editing, and a help chatbot —
all with no server to maintain.

## Stack

- **Frontend:** React 18, TypeScript, Vite 7, Tailwind CSS
- **Backend:** Firebase (Auth, Data Connect with generated typed client code)
- **Email:** EmailJS (contact form, no server)
- **Testing:** Vitest + Testing Library (jsdom)
- **Hosting:** Netlify (`netlify.toml`)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your own Firebase/EmailJS keys
npm run dev            # start the Vite dev server
```

Real keys live only in `.env`, which is gitignored — never commit them.
`.env.example` documents every required key.

## Scripts

| Command           | What it does                    |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the Vite dev server       |
| `npm run build`   | Production build to `dist/`     |
| `npm run preview` | Preview the production build    |
| `npm test`        | Run the Vitest suite            |
| `npm run test:ui` | Run Vitest with the UI          |
| `npm run lint`    | ESLint over the project         |

## Project conventions

- `AGENTS.md` / `CLAUDE.md` — rules for contributors and AI agents
- `CHANGELOG.md` — every PR adds an entry under `[Unreleased]`
  (Keep a Changelog; see `VERSIONING.md`)
- `DOCUMENTATION.md` — documentation standards
- `docs/adr/` — architecture decision records
- Appointment approval is always human-approved — never automated.
