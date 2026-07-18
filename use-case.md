# Willow Bend Family Clinic — Use Case

**One-liner:** A modern, SEO-conscious website for a local clinic with appointment booking, a calendar, a chatbot, and lightweight CMS-style content management.
**Status:** Active development (client project)
**Stack:** React 18, TypeScript, Vite 7, Tailwind CSS, Firebase (including Data Connect with generated client code), EmailJS, Vitest + Testing Library, Netlify

## Problem
A small local clinic needs what large health systems get from expensive platforms — online appointment requests, findability in search, and quick answers to common questions — on a small-business budget. This project delivers that with a fast static-first React site and Firebase as the managed backend, so there is no server to maintain.

## What I Built
I built a feature-sliced React + TypeScript app with dedicated modules for appointments, calendar, chatbot, CMS content, messages, auth, and SEO. Firebase provides the backend, including Firebase Data Connect with generated typed client code (src/dataconnect-generated). EmailJS handles contact/notification email without exposing a server. The public/ folder ships robots.txt, sitemap.xml, and security headers (_headers) for search and hardening, and the SEO module manages per-page metadata. The project has a Vitest + Testing Library test setup and deploys via Netlify.

## Skills Demonstrated
React, TypeScript, Vite, Tailwind CSS, Firebase (Auth, Data Connect), typed codegen workflows, EmailJS integration, SEO fundamentals (sitemap, robots, metadata), security headers, component testing with Vitest and Testing Library, Netlify deployment, client delivery

## Outcome / Evidence
In active development for a real client. The architecture (serverless Firebase backend, static-first frontend) is chosen deliberately so the clinic can run it with near-zero ops burden after handoff. No README yet — this use case doubles as the project's first summary document.

## Interview Talking Points
- Feature-sliced structure (appointments, calendar, chatbot, cms, seo as first-class modules) keeps a client site maintainable as it grows, instead of one components/ junk drawer.
- Firebase Data Connect with generated typed clients gives backend type safety without me running a backend for the client.
- SEO and security headers were built in from the start because for a local clinic, being found on Google is the core business requirement.

---
LAHA — Love All Humans Always.
