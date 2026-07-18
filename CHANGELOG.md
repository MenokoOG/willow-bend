# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

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
