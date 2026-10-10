# Willow Bend Family Clinic — Use Case

**One-liner:** A production-level demo website for a fictional family-practice clinic — appointment requests with human approval, a patient portal, lightweight CMS content, admin tooling, and an AI care assistant that degrades gracefully to an offline engine.
**Status:** Active demo (all clinic data is fictional)
**Stack:** React 18, TypeScript, Vite 7, Tailwind CSS, Firebase (Auth, Firestore, Data Connect codegen), Netlify (hosting + Functions), OpenAI (Willow AI), EmailJS, Vitest + Testing Library

## Problem

A small local clinic needs what large health systems get from expensive platforms — online appointment requests, findability in search, quick answers to common questions — on a small-business budget. This project demonstrates that with a static-first React site, Firebase as the managed backend, and one serverless function for AI, so there is no server to maintain.

## What I Built

This started as a real client build, then was rebranded and fully sanitized into the fictional **Willow Bend Family Clinic** (Meridian, ID) so it can be shown publicly. On top of that base:

- **Design system:** implemented a full design handoff — Voxel Art token system (sky/orange/green, chunky outlines, hard cube shadows) with light and dark themes, Press Start 2P + Space Grotesk typography, and code-generated isometric voxel artwork in place of stock imagery, and rebuilt Home, Services, Request, Patient Portal, and Calendar pages. Token aliases let legacy pages restyle without churn.
- **Appointments, human-approved:** patients request a time at `/request`; clinic staff approve, reject, cancel, or archive from the admin portal. Approval is never automated — that's a hard project rule.
- **Patient portal:** live Firestore sync of appointment status, portal messages from staff, and a month calendar view.
- **Admin tooling:** appointment management, CMS-style page content editing, and a Messages & Archives page — view/edit/delete sent portal messages and clear old appointment archives with audit flags.
- **Willow, the AI care assistant:** a full-page chat surface plus a floating widget. A Netlify Function keeps the OpenAI key server-side and wraps it in guardrails (navigation/scheduling help only, no medical advice, never claims to book — staff approve everything). Emergencies short-circuit to an instant offline 911 answer, and if no key is configured the whole thing falls back to a deterministic keyword engine, so the demo always works.
- **Engineering standards:** Keep-a-Changelog discipline, mirrored AGENTS.md/CLAUDE.md agent rules, ADRs (Nygard pattern), versioning and documentation standards, and a sanitized `.env.example`.

## Skills Demonstrated

React, TypeScript, Vite, Tailwind, design-token systems and theming, Firebase (Auth, Firestore live subscriptions, transactions for archive audit trails), serverless functions on Netlify, LLM integration with guardrails and graceful degradation, SEO fundamentals (sitemap, robots, per-page metadata), accessibility (skip links, focus rings, reduced motion, ARIA), client sanitization and rebranding, documentation and changelog discipline

## Outcome / Evidence

A public-safe, production-shaped demo: every trace of the original client removed, a cohesive design system across the site, and an AI assistant that is safe by construction — the model can't approve an appointment, can't give medical advice, and the site works identically with the AI turned off.

## Interview Talking Points

- The AI fallback design: any failure (no key, timeout, upstream error) silently drops to the offline keyword engine — the demo never breaks in front of an audience, and emergency inputs never wait on a network round-trip.
- Human-in-the-loop by architecture, not policy: the LLM has no write path to appointments; approval only exists in the admin UI.
- Token-alias strategy: rebranding a themed app without touching every file — new design tokens with legacy names aliased, so unrebuilt pages inherit the new look.
- Archive deletes use Firestore transactions with audit flags (deleted-before-appointment, deleted-while-approved) — small clinic, real accountability.

---
LAHA — Love All Humans Always.
