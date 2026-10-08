# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Willow reports to Heimdall**: `netlify/lib/heimdall.ts` sends one
  counts-only event per chat request (mode, degraded, latency band, error
  class) to the Heimdall sink. Visitor text is never sent; the sink rejects
  unknown fields. Off unless `HEIMDALL_URL` and `HEIMDALL_KEY` are set in
  Netlify. Waits at most 800ms, never throws. Sink:
  github.com/MenokoOG/heimdall.
- Firestore security rules are now version-controlled:
  `firestore.rules.example` (placeholder admin emails) is committed, the
  real `firestore.rules` is gitignored and deployed with
  `firebase deploy --only firestore:rules` (`firebase.json` /
  `.firebaserc` added). The rules include fixes over the
  previously console-only version:
  - patients can no longer change `status` (or `patientEmail`) on their
    own appointments — approval stays admin-only, per project policy;
    `status` must be `"requested"` on create;
  - admin checks require a verified email (`email_verified`), so an
    unverified email/password signup with an admin's address can't
    gain access;
  - patients can read their appointments by `patientUid` (the portal's
    live subscription queries on it — previously that query was always
    permission-denied);
  - patients can create the archive copy of their own appointment on
    cancel (the app archives via a transaction — previously admin-only,
    which broke patient cancellation entirely).
- `.gitattributes` normalizing all text files to LF — stops the
  CRLF/LF whole-file diff churn from mixed Windows/WSL git usage
  (renormalized `LICENSE`, `CHANGELOG.md`, `package.json`,
  `package-lock.json`).

### Security

- `npm audit fix`: resolved all reported advisories (critical
  `protobufjs` chain pulled in via Firebase tooling) — `npm audit` is
  now clean.

### Changed

- Admin allowlist now reads from the `VITE_ADMIN_EMAILS` env var
  (comma-separated) instead of hardcoded emails in the source, keeping
  real addresses out of the repo. Removed the unused duplicate allowlist
  `src/auth/admin.ts`. Note: the env var gates the UI only — Firestore
  security rules must list the same emails in `isAdminEmail()` for admin
  access to actually work server-side, and the var must also be set in
  Netlify's build environment.

### Fixed

- Netlify build ran with a stale cached `node_modules` still containing
  tailwindcss v4 from the pre-pin era, failing with the v4 PostCSS error
  even though `package.json`/lockfile pin v3. The build command is now
  `npm ci && npm run build` so every build installs exactly from the
  lockfile.
- Netlify build failed secrets scanning after `.firebaserc` gained the
  Firebase project id: all `VITE_FIREBASE_*` client-config keys are now
  in `SECRETS_SCAN_OMIT_KEYS` (they ship in the JS bundle by design and
  are not secrets); `OPENAI_API_KEY` remains scanned.
- `useAppointments`: the post-write refresh (`request`,
  `archiveAndDelete`) re-fetches the full appointments list, which
  Firestore rules only permit for admins — a patient's successful
  request/cancel surfaced as an error. The refresh is now best-effort
  and no longer fails the write.
- Untracked `.claude/settings.local.json` and added it to `.gitignore` —
  it is a per-machine Claude Code settings file that changes constantly
  and was causing merge conflicts on every pull.
- Netlify build failure after Dependabot bumped Tailwind CSS to v4: pinned
  `tailwindcss` back to `^3.4.17`, since the project uses the v3 PostCSS
  plugin setup (`postcss.config`, `tailwind.config.ts`, `@tailwind`
  directives). A future v4 migration should use `@tailwindcss/postcss`.

### Added

- `LICENSE` file: proprietary, all-rights-reserved terms — the code is
  public for portfolio review only and may not be copied or reused without
  written permission (`package.json` now declares `"license": "UNLICENSED"`).
- Fictional `testadmin@example.com` test admin account in the admin
  allowlists for MVP testing (create the matching user in Firebase Auth).

- **Willow AI**: OpenAI-backed replies via a Netlify Function
  (`/api/willow`) with the key kept server-side. Emergency inputs
  short-circuit to an instant offline 911 answer, and any AI failure
  (no key, timeout, upstream error) silently falls back to the offline
  keyword engine — the assistant works with zero configuration.
  New `npm run dev:ai` script (netlify dev) for local AI development.
  Guardrails in the system prompt: navigation/scheduling only, no medical
  advice, never claims to book — appointments stay human-approved
  (ADR 0003).

- Admin **Messages & Archives** page (`/admin/messages`): view all sent
  portal messages with full bodies, filter by recipient/subject/text,
  edit or permanently delete messages, and view archived appointments
  with per-entry delete plus clear-older-than-30/90-days and clear-all
  (all destructive actions require confirmation).

### Changed

- Removed the maintainer's real email address from the admin allowlists
  (`src/auth/admin.ts`, `src/auth/adminEmails.ts`); admin emails should be
  configured locally instead of committed to the repository.
- Implemented the Willow Bend design system from the design handoff:
  warm sage/cream palette with full light + dark themes, Bricolage
  Grotesque + Figtree typography, and rebuilt UI primitives
  (buttons, cards, chips, badges, status pills, calendar day states).
- Redesigned Home, Services, Request Appointment, Patient Dashboard,
  Patient Calendar, Header, and Footer to the mockup layouts. Light theme
  is now the default.
- Reframed the help chatbot as **Willow**, the clinic care assistant:
  full-page chat surface at `/help` (empty state, suggestion chips, typing
  indicator) plus a restyled floating widget. Reply engine is unchanged.
- Replaced the service menu with a fictional cash-pay family-practice menu
  (the previous menu reproduced the former client's real services/prices).
- Fixed hardcoded dark-theme colors (EditableBlock, Suspense fallback,
  Unauthorized page) and wired up the skip-to-content link.
- Footer builder credit updated to classHuman AI.

### Removed (redesign)

- Dead duplicate chatbot stack (`useChatbot.ts`, `knowledgeBase.ts`,
  `HelpChatBot.tsx`) which still carried legacy brand strings, and the
  legacy `srams-*` background images.

- Rebranded the project from the former client branding to the fictional demo
  brand **Willow Bend Family Clinic** (package name is now `willow-bend-clinic`).
- Replaced all real-world contact data with fictional demo values:
  phone (208) 555-0142, address 480 Willow Bend Dr, Suite 100, Meridian, ID 83642,
  email hello@willowbendclinic.example.
- Updated site metadata, sitemap, and robots.txt to the fictional
  `willowbendclinic.example` domain.
- Shifted adult-medicine-specific copy to family-practice wording.
- Renamed brand-derived localStorage keys and DOM ids (`srams_*` → `wbc_*`).

### Removed

- Real client email addresses and staff names from admin allowlists,
  code comments, and UI placeholders.

### Added

- `.env.example` with all required environment keys (real values live only in
  the gitignored `.env`).
- Standards files: `VERSIONING.md`, `DOCUMENTATION.md`, `CHANGELOG.md`,
  `AGENTS.md`, `CLAUDE.md`, and `docs/adr/0001-record-architecture-decisions.md`.
- `README.md` describing the project, setup, and testing.
