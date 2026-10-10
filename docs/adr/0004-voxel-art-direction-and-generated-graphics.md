# 4. Voxel Art direction with code-generated graphics

Date: 2026-10-10

## Status

Accepted. Supersedes the palette and typography choices of
[ADR 0002](0002-adopt-willow-bend-design-system.md); its token-naming and
class-stability decisions still stand.

## Context

The MVP still showed grey "Warm photo — clinician with a patient…" boxes in
place of imagery, and the sage/cream look had no distinctive identity. The
requested art direction is **Voxel Art**: bright toy-like palette, chunky
outlines, hard offset "cube shadows", zero border radius, `steps()` easing,
Press Start 2P / Space Grotesk / VT323 type.

For imagery we considered (a) a free photo/illustration API, (b) bundled
stock images, and (c) generating artwork in code.

## Decision

1. **Re-skin through tokens.** `src/styles.css` keeps the ADR 0002 token
   names (`--bg`, `--ink`, `--primary`, …) but remaps them to the Voxel
   palette, with a night variant for `data-theme="dark"`. Shared classes
   (`.card`, `.btn-hero`, `.btn-ghost`, `.input`, `.chip`, `.pill`, `.band`)
   gain the outline + hard-shadow treatment, so pages restyle without churn.
2. **Square everywhere.** `tailwind.config.ts` overrides (not extends) the
   `borderRadius` scale to `0px`, so every `rounded-*` utility is square.
3. **`--primary` is a fill, `--link` is text.** The spec's orange `#ff6b3d`
   is ~2.9:1 on white, so coloured text uses the new `--link` token (≈7:1);
   buttons keep orange fills with dark `--on-primary` text.
4. **Artwork is generated, not fetched.** `src/graphics/voxel.ts` is a
   ~150-line isometric renderer (painter's algorithm with face culling) that
   emits inline SVG; `scenes.ts` defines the hero diorama, team busts, brand
   cube, Willow mascot and service icons as code; `sprites.ts` holds four
   flat pixel icons that read poorly when sheared isometrically.
5. **OG image is built by script**, `scripts/generate-og.mjs`, importing the
   same TypeScript modules (Node ≥ 22.18 type stripping) and `sharp`.

## Consequences

- No third-party image requests: no API keys, no rate limits, no tracking,
  no licence attribution, identical rendering offline and in tests.
- Art is theme-safe and tiny (hero scene ≈ 480 polygons), and changes are
  reviewable as code diffs. The trade-off is that it is illustrative, not
  photographic; real staff photography can later replace `VoxelFrame`
  content without touching layout.
- Graphics modules must stay free of enums/parameter properties and use
  explicit `.ts` import specifiers (`allowImportingTsExtensions` is on) so
  Node can run them directly.
- The pixel display face is wide: `h1` size is clamped in CSS with
  `!important` to defeat Tailwind `text-*` utilities. Prefer Space Grotesk
  for anything longer than a short title.
- Tailwind remains v3 (pinned in PR #6); the spec's `@theme` (v4) guidance
  is expressed as CSS custom properties instead.
