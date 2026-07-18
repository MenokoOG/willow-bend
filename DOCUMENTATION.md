# Documentation Policy — classHuman

**Owner:** Lawrence Jefferson II (CTO), classHuman AI
**Last updated:** 2026-05-07
**Applies to:** every classHuman repo

This file is the canonical documentation policy. Drop a copy into every classHuman repo root. When the policy changes, edit the canonical at `~/development/claude-mds/standards/DOCUMENTATION.md` first, then propagate.

Documentation is not optional. Lawrence has TBI; Nicale has Wernicke's; future contractors are unknown. Code without docs is code that walks out the door when memory fades. Write the why down once.

---

## Tools by surface (the locked stack)

| Surface | Tool | Notes |
|---|---|---|
| **Nest.js backends** | Compodoc | Generates from TS decorators + JSDoc. Run on CI. |
| **REST/HTTP APIs** (any language) | Swagger / OpenAPI 3.x | Spec lives in code, served at `/docs`, `/redoc`, `/openapi.json` |
| **FastAPI backends** | Built-in (`/docs` + `/redoc` + `/openapi.json`) | Auto-generated. Don't disable the catch-all conflict — see classHuman-pm Phase 0 brief for the fix pattern. |
| **Express backends** | `swagger-jsdoc` + `swagger-ui-express` | Same Swagger family — keeps API docs consistent across Node and Python |
| **Frontend components** (React, Vite, Next.js) | Storybook | Visual + interactive. Stories live next to components: `Foo.tsx` → `Foo.stories.tsx` |
| **Project documentation** (architecture, guides, runbooks) | MkDocs Material | Markdown-native. Deploys cleanly on Coolify. Theme: `mkdocs-material`. |
| **TypeScript code/library reference** | TypeDoc | Auto-generated from TS types + JSDoc. Run when shipping a library. |
| **Python code reference** | pdoc | Lightweight, auto-generated from docstrings. Use Sphinx ONLY when shipping a public Python library. |
| **COBOL kernel** (Ag3nt24) | Inline source comments + hand-written `kernel/REFERENCE.md` | No COBOL auto-doc tools worth using — treat the kernel like ASM. |
| **Database schema** | `sqlite3 .schema > docs/schema/schema.sql` (or `pg_dump --schema-only`) | Versioned per release. Diffable in PRs. |
| **ADRs** (architecture decisions) | Markdown in `docs/adr/`, numbered `0001-*.md`, `0002-*.md` | **Required.** See ADR section below. |

---

## Required repo file standard

Every classHuman repo gets these at root:

| File | Purpose |
|---|---|
| `README.md` | Entry point — what the project is, how to run it, how to test |
| `CHANGELOG.md` | Version history (Keep a Changelog format — see VERSIONING.md) |
| `LICENSE` | License terms |
| `AGENTS.md` and/or `CLAUDE.md` | AI agent instructions (some tools read AGENTS.md, some read CLAUDE.md — include both, mirror content) |
| `VERSIONING.md` | Copy of canonical versioning policy |
| `DOCUMENTATION.md` | Copy of this file |

And these directories where applicable:

| Directory | Purpose |
|---|---|
| `docs/adr/` | Architecture decision records |
| `docs/schema/` | Database schema dumps (one per release) |
| `briefs/` | Claude Code handoff briefs (`phase-N-handoff.md`) — matches classHuman-pm pattern |

---

## ADRs (Architecture Decision Records)

ADRs are the non-negotiable companion to code. Without them, "why we built it this way" gets lost the moment it leaves the original author's head.

### Template

```markdown
# 0042 — Use SQLite, not Postgres, for classHuman-pm MVP

Date: 2026-05-07
Status: Accepted

## Context

Two-user internal tool deployed via Coolify on a home server. Data volume is small. Operational overhead of a separate Postgres container is real.

## Decision

Use SQLite with a named volume mount in docker-compose. Postgres becomes a Phase 5 decision if scale demands it.

## Consequences

- Pros: simpler ops, single-container deploy, no separate DB service to manage
- Cons: limited concurrent writes (acceptable at 2 users), need to migrate to Postgres if user count grows past ~50
- Migration path: Coolify can provision Postgres; SQLAlchemy abstracts the dialect; estimated 1-day swap when needed
```

### Rules

1. **One file per decision.** Keep them short — one page max.
2. **Numbered sequentially:** `0001-record-architecture-decisions.md`, `0002-...`, etc. Don't skip numbers.
3. **Status values:** `Proposed`, `Accepted`, `Deprecated`, `Superseded by ADR-NNNN`.
4. **First ADR in every repo** is `0001-record-architecture-decisions.md` documenting *why* you record ADRs (Michael Nygard pattern).
5. Reference ADRs from PRs that implement the decision: `Implements ADR-0042`.

### When to write one

Write an ADR when:
- Choosing between technologies (SQLite vs Postgres, REST vs gRPC, OpenAPI vs gRPC reflection)
- Making a non-obvious architectural cut (where does the Harness live, how does HADES auth)
- Deciding doctrine that affects multiple components (citizen identity model, signing format)
- Locking a name, brand, or convention that future contributors might want to relitigate

Don't write one for:
- Trivial code style choices
- Bug fixes
- Routine version bumps

---

## Documentation deploy targets

### Internal (over Tailscale)
MkDocs Material site for each project, deployed to Coolify on `forge`. Subdomain or path per project — `forge/docs/classHuman-pm`, `forge/docs/alfheim`, etc.

### Public (when shipping)
- Ag3nt24 SDK reference: TypeDoc + pdoc → public site (TBD domain)
- Yggdrasil platform docs: MkDocs Material → public site

Public docs only ship for products that have public consumers. Internal-only tools (classHuman-pm) deploy to `forge` only.

---

## How to apply

### When opening a new project
1. Copy `~/development/claude-mds/standards/VERSIONING.md` and `DOCUMENTATION.md` to repo root
2. Initialize `CHANGELOG.md` with `## [Unreleased]` section
3. Create `docs/adr/0001-record-architecture-decisions.md` (Michael Nygard's text, adapted)
4. Pin doc tools per the surface table in your `package.json` / `pyproject.toml` upfront
5. Add `docs:build` and `docs:serve` scripts so anyone can preview docs locally

### When reviewing existing projects
- Bring repos into compliance gradually — start with VERSIONING.md + DOCUMENTATION.md + a backfilled CHANGELOG
- Don't blow up working code to chase compliance — incremental adoption beats none

### When making a non-trivial decision
**Write an ADR.** Even one paragraph beats nothing. Don't wait until you have time to write it well — write it now, polish later.

---

## Why this is non-negotiable

Lawrence has TBI. Nicale has Wernicke's. Future contractors are unknown.

Code without docs is code that walks out the door when memory fades. ADRs and CHANGELOGs are the trail back. They're cheaper to write than to reconstruct.

LAHA — Love All Humans Always — applies to your future self too.
