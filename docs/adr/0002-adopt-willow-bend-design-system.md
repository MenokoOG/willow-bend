# 2. Adopt the Willow Bend design system

Date: 2026-07-17

## Status

Accepted

## Context

The design handoff (six HTML mockups + HANDOFF.md) defines a full visual
redesign: a warm sage/cream palette with light and dark themes, Bricolage
Grotesque + Figtree typography, and the chatbot reframed as "Willow." The
existing app used a different CSS-variable vocabulary (`--text`, `--border`,
`--panel`) referenced heavily via inline styles, and several classes
(`.pill`, `.dot`) and tokens (`--brand`, `--ok`) were referenced but never
defined.

## Decision

1. **Token names follow the handoff** (`--ink`, `--line`, `--surface`,
   `--primary-hover`, tints, band/field tokens) as the single source of truth
   in `src/styles.css`, with light as the default theme.
2. **Legacy token names are kept as aliases** (`--text: var(--ink)` etc.) so
   pages not rebuilt in this pass (Contact, auth, admin, Testimonials)
   restyle automatically without churn.
3. **Component class names are stable** — `.card`, `.btn-hero`, `.btn-ghost`,
   `.input` keep their names but are restyled to the mockup specs; missing
   classes (`.pill--*`, `.dot--*`, `.chip`, `.eyebrow`, badges) are now
   defined.
4. **Calendar deviation:** the mockup's time-slot "Confirm" booking flow is
   intentionally not implemented. Appointments are requested via `/request`
   and always approved by a human (a hard project rule); the patient calendar
   remains a view of real appointment data, not a self-booking surface.
5. **Willow is presentation only.** The chat surfaces (full page `/help` and
   floating widget) were rebuilt visually; replies still come from the
   deterministic offline engine in `src/chatbot/engine.ts`.

## Consequences

- Future visual changes happen through the token block and shared classes,
  not per-component inline colors.
- Pages rebuilt later should migrate from legacy alias tokens to handoff
  names; the aliases can be removed once no code references them.
- Wiring Willow to a real AI backend, and persisting the request form's
  extra fields (patient type, reason, notes) into the appointment model,
  are future decisions that would get their own ADRs.
