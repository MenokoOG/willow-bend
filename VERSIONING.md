# Versioning Policy — classHuman

**Owner:** Lawrence Jefferson II (CTO), classHuman AI
**Last updated:** 2026-05-07
**Applies to:** every classHuman repo (Ag3nt24, HADES, Harness, Alfheim, classHuman-pm, Ag3nt24 SDK, future products)

This file is the canonical version policy. Drop a copy into every classHuman repo root. When the policy changes, edit the canonical at `F:\classHuman\menoko-og-prompt-md-library\rune-library\references\``versioning.md` first, then propagate.

---

## Three-tier versioning

classHuman projects carry **three independent version identifiers**. Don't conflate them.

### Tier 1 — Product version (semver)

Format: `MAJOR.MINOR.PATCH` (e.g., `1.3.0`)

| Bump | When |
|---|---|
| **Patch** (`1.3.0` → `1.3.1`) | Bug fixes only. No behavior change for working flows. |
| **Minor** (`1.3.0` → `1.4.0`) | New features. Backward-compatible. |
| **Major** (`1.3.0` → `2.0.0`) | Breaking changes — API contract, data model, configuration, or user-visible behavior |

Stored in `package.json`, `pyproject.toml`, or equivalent. Updated on every release that ships.

### Tier 2 — API version (URI prefix)

Format: `vN` (e.g., `v1`, `v2`)

Bumps **only on breaking changes to the API contract** — external OR internal consumers. Adding optional fields or new endpoints does NOT bump the API version.

The same product can ship `1.3.0 / v1` and `2.0.0 / v2` simultaneously during a transition window. Customer URLs `api.product.com/v1/...` and `/v2/...` coexist.

API version gets pinned in:
- URL path (`/api/v1/...`)
- OpenAPI spec (`info.version: "v1"`)
- SDK package version (`Ag3nt24-sdk@v1.x.x` for v1 contract)

### Tier 3 — Release tag and Build tag (calendar)

Used for marketing, customer comms, and CI artifacts. Independent of semver.

| Tag | Format | Purpose |
|---|---|---|
| **Release tag** | `YYYY.MM` (e.g., `2026.05`) | Year-month. Used in changelog headers, blog posts, customer announcements. |
| **Build tag** | `YYYY.MM.DD` (e.g., `2026.05.07`) | Year-month-day. Used in CI artifact names, staging deploys, debug logs. |

A single release tag can include multiple builds: `2026.05` release ships builds `2026.05.07`, `2026.05.14`, `2026.05.28`.

---

## CHANGELOG.md format

Every repo has `CHANGELOG.md` at the root. Format follows [Keep a Changelog](https://keepachangelog.com/).

### Section header per release

```markdown
## [2026.05] - 2026-05-07 — 1.3.0 / v1

### Added
- New feature X

### Changed
- Behavior of Y now uses Z

### Deprecated
- Feature W will be removed in 2.0.0

### Removed
- Old endpoint /api/v0/legacy

### Fixed
- Bug in handler N

### Security
- CVE-2026-XXXX patched
```

Top of file always has an `## [Unreleased]` section with pending entries. When you cut a release, rename `Unreleased` to the new release tag and add a new empty `Unreleased` above it.

### One CHANGELOG line per merged PR

Discipline rule: a PR is not mergeable until its CHANGELOG entry is included in the diff. This makes every release writable in 5 minutes by reading the changes-since-last-release.

---

## Bump rules — quick reference

| Change type | Patch | Minor | Major | API |
|---|---|---|---|---|
| Bug fix in existing feature | ✓ | | | |
| New optional config option | | ✓ | | |
| New endpoint (additive) | | ✓ | | |
| New required config option | | | ✓ | |
| Removed/renamed endpoint | | | ✓ | ✓ |
| Changed response shape | | | ✓ | ✓ |
| Changed default behavior | | | ✓ | maybe |
| Performance improvement (no behavior change) | ✓ | | | |
| Documentation only | (no version bump — note in CHANGELOG under Changed) | | | |
| Internal refactor (no behavior change) | (no version bump) | | | |

---

## Release workflow (the discipline)

1. PRs land on `main` with CHANGELOG entries under `## [Unreleased]`
2. When ready to release:
   - Bump `package.json` / `pyproject.toml` version (tier 1)
   - If API contract changed: bump tier 2 in code (URL prefix, OpenAPI spec)
   - In CHANGELOG.md: rename `Unreleased` → `## [YYYY.MM] - YYYY-MM-DD — N.N.N / vN`
   - Add new empty `## [Unreleased]` above
3. Tag the commit: `git tag -a v1.3.0 -m "Release 2026.05 / 1.3.0 / v1"`
4. Build artifact carries tier 4 build tag (CI sets `BUILD_TAG=$(date +%Y.%m.%d)`)
5. Push, deploy, write release note referencing the release tag (tier 3) for customer-facing content

---

## What goes in `package.json` / `pyproject.toml`

Only **tier 1 (semver)** lives in these files. Tier 2 (API version) lives in code. Tiers 3-4 (calendar) live in CHANGELOG and CI.

```json
{
  "name": "alfheim",
  "version": "1.3.0",
  ...
}
```

---

## When in doubt

- If a downstream consumer would have to change anything → **major bump**
- If a new capability appears that they could ignore → **minor bump**
- If the same code does the same thing more reliably → **patch bump**
- If you're not sure, ask: would a customer read this and need to act? If yes, write it down in CHANGELOG and bump.

LAHA — Love All Humans Always — applies to consumers of your software too. Don't break their day without telling them.
