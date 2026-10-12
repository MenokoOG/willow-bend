# Willow Bend Family Clinic

A production-level **demo** website for Willow Bend Family Clinic — a
**fictional** family-practice clinic in Meridian, ID. All clinic data in this
repository (name, address, phone number, email, testimonials) is fictional and
for demonstration only.

The site demonstrates what a small clinic gets from a modern static-first
stack: public marketing pages with SEO (sitemap, robots, per-page metadata,
security headers), online appointment requests (always human-approved), a
patient portal with live status sync, an admin portal (appointments, CMS-style
content editing, messages & archive cleanup), and **Willow** — an AI care
assistant with a built-in offline fallback — all with no server to maintain.

## Stack

- **Frontend:** React 18, TypeScript, Vite 7, Tailwind CSS
- **Backend:** Firebase (Auth, Firestore, Data Connect codegen)
- **AI:** OpenAI via a Netlify Function (`netlify/functions/willow.ts`);
  falls back to an offline keyword engine when unavailable
- **Email:** EmailJS (contact form, no server)
- **Testing:** Vitest + Testing Library (jsdom)
- **Hosting:** Netlify (`netlify.toml`, SPA redirect + `/api/*` functions)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your own Firebase/EmailJS keys
npm run dev            # start the Vite dev server
```

Real keys live only in `.env`, which is gitignored — never commit them.
`.env.example` documents every required key.

## Willow AI (optional)

Willow answers with a real LLM when `OPENAI_API_KEY` is set (server-side only,
never bundled into the client). Run the site with the function locally:

```bash
npm run dev:ai   # netlify dev — serves Vite + /api/willow with .env loaded
```

Without a key (or with plain `npm run dev`), Willow automatically falls back
to the deterministic offline engine — the demo always works. Guardrails:
navigation/scheduling help only, no medical advice, emergencies get an instant
offline 911 response, and Willow never claims to book an appointment —
approval always stays with clinic staff.

## Scripts

| Command           | What it does                    |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the Vite dev server       |
| `npm run dev:ai`  | Vite + Willow AI function (netlify dev) |
| `npm run build`   | Production build to `dist/`     |
| `npm run preview` | Preview the production build    |
| `npm test`        | Run the Vitest suite            |
| `npm run test:ui` | Run Vitest with the UI          |
| `npm run lint`    | ESLint over the project         |

## Project conventions

- `CHANGELOG.md` — every PR adds an entry under `[Unreleased]`
  (Keep a Changelog; see `VERSIONING.md`)
- `DOCUMENTATION.md` — documentation standards
- Appointment approval is always human-approved — never automated.
