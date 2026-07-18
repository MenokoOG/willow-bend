# 1. Record architecture decisions

Date: 2026-07-17

## Status

Accepted

## Context

We need to record the architectural decisions made on this project so that
future contributors (human or AI agent) can understand why the system is the
way it is, not just how it is.

## Decision

We will use Architecture Decision Records, as described by Michael Nygard in
[Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

ADRs live in `docs/adr/`, are numbered sequentially (`NNNN-title-with-dashes.md`),
and are never deleted — a superseded decision is marked "Superseded by
[ADR-NNNN]" and left in place.

## Consequences

Anyone working on the project can see the motivation behind past decisions.
Each significant architectural change requires a short ADR, which adds a small
amount of writing overhead in exchange for durable context.
