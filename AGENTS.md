# AGENTS.md

Guidance for AI agents and human contributors working in this repository.
(`CLAUDE.md` mirrors this file — keep them in sync.)

## Project purpose

A **production-level demo** clinic website for **Willow Bend Family Clinic**,
a fictional family-practice clinic in Meridian, ID. All clinic data (name,
address, phone, email, testimonials) is fictional. The project demonstrates a
real-world small-clinic site: public marketing pages, SEO, appointment
requests, a patient portal, an admin portal with lightweight CMS content
editing, and a help chatbot.

## Stack

- React 18 + TypeScript, Vite 7, Tailwind CSS (design tokens in
  `src/styles.css`, light default + dark theme)
- Firebase (Auth, Firestore, Data Connect codegen in
  `src/dataconnect-generated/`)
- Willow AI: OpenAI via Netlify Function (`netlify/functions/willow.ts`),
  offline keyword-engine fallback in `src/chatbot/engine.ts`
- EmailJS for the contact form (no server)
- Vitest + Testing Library (jsdom) for tests
- Netlify for deployment (`netlify.toml`, `/api/*` → functions, SPA redirect)

## Rules

- **Every PR gets a `CHANGELOG.md` entry** under `[Unreleased]`
  (Keep a Changelog format — see `VERSIONING.md`).
- **Appointment approval always stays human-approved.** No feature, agent, or
  automation may auto-approve, auto-confirm, or auto-schedule appointments —
  an admin must explicitly approve every appointment request.
- **Willow (the AI assistant) is navigation/scheduling help only.** It must
  never give medical advice and never claim to book, confirm, move, or cancel
  an appointment; those guardrails live in the system prompt in
  `netlify/functions/willow.ts` and must be preserved. Emergencies always get
  the instant offline 911 response (client-side short-circuit).
- Follow `VERSIONING.md` for versioning/release practice and
  `DOCUMENTATION.md` for documentation practice.
- Record significant architectural decisions as ADRs in `docs/adr/`
  (see `docs/adr/0001-record-architecture-decisions.md`).
- Never commit secrets. Real keys live only in the gitignored `.env`;
  `.env.example` documents the required keys.
- Keep all clinic data fictional — no real patient, staff, or client
  information may enter this repository.
