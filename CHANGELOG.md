# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Admin **Messages & Archives** page (`/admin/messages`): view all sent
  portal messages with full bodies, filter by recipient/subject/text,
  edit or permanently delete messages, and view archived appointments
  with per-entry delete plus clear-older-than-30/90-days and clear-all
  (all destructive actions require confirmation).

### Changed

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
