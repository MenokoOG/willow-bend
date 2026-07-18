# 3. Willow AI backend: Netlify Function with offline fallback

Date: 2026-07-17

## Status

Accepted

## Context

Willow (the clinic care assistant) answered from a deterministic keyword
engine (`src/chatbot/engine.ts`). We want real LLM answers without exposing an
API key in the client bundle, without adding a server to maintain, and without
weakening two hard project rules: appointments are always human-approved, and
the assistant never gives medical advice. The demo must also keep working for
anyone who clones the repo with no key configured.

## Decision

1. **Server layer = Netlify Function** (`netlify/functions/willow.ts`),
   reached at `/api/willow` via a redirect placed before the SPA catch-all.
   `OPENAI_API_KEY` (and optional `WILLOW_MODEL`, default `gpt-4o-mini`) are
   read from server env only — deliberately not `VITE_`-prefixed. The OpenAI
   Chat Completions API is called with plain `fetch`; no SDK dependency.
2. **Guardrails live in the system prompt**, assembled from the same
   `src/chatbot/kb.ts` facts the offline engine uses: navigation/scheduling
   help only, no medical advice or triage, emergencies → 911, and appointments
   are requested at `/request` and always approved by human staff — the model
   must never claim to book, confirm, move, or cancel one. The model has no
   write path to any data; approval exists only in the admin UI.
3. **Fallback by design**: the client (`src/chatbot/aiClient.ts`) throws on
   any non-200 or 15s timeout, and both chat surfaces catch and answer from
   the offline engine instead. No key → 501 → fallback; the demo is never
   broken.
4. **Emergency short-circuit on the client**: `classifyTurn` runs locally
   before any network call; a high-confidence emergency gets the offline 911
   answer instantly.
5. **No PII in prompts**: the payload is message texts plus a coarse role
   (`guest`/`patient`/`staff`) — never emails or uids. Input is capped
   (≤20 messages, ≤1000 chars each; client sends the last 12).

## Consequences

- Local AI development needs `netlify dev` (`npm run dev:ai`); plain
  `npm run dev` runs the site in offline-assistant mode.
- AI replies are stateless per request (last-12-message window); the offline
  engine still owns multi-step flows (e.g. status walkthrough).
- Streaming responses, rate limiting beyond input caps, and a provider switch
  are future decisions; this ADR intentionally keeps the surface minimal.
