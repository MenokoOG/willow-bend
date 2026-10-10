import { useMemo } from "react";
import type { VoxelGrid } from "./voxel.ts";
import { renderSprite, sprite, type SpriteIcon } from "./sprites.ts";

type VoxelSvgProps = {
  grid: VoxelGrid;
  /** Accessible description. Omit for purely decorative art (aria-hidden). */
  label?: string;
  unit?: number;
  className?: string;
  style?: React.CSSProperties;
};

/** Inline SVG rendering of a voxel scene; scales to its container width. */
export function VoxelSvg({
  grid,
  label,
  unit = 10,
  className,
  style,
}: VoxelSvgProps) {
  const r = useMemo(() => grid.render(unit), [grid, unit]);
  return (
    <svg
      viewBox={r.viewBox}
      className={className}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      <g
        stroke={r.stroke}
        strokeWidth={r.strokeWidth}
        strokeLinejoin="round"
      >
        {r.polys.map((p, i) => (
          <polygon key={i} points={p.points} fill={p.fill} />
        ))}
      </g>
    </svg>
  );
}

type FrameProps = {
  grid: VoxelGrid;
  label: string;
  ratio: string;
  unit?: number;
  className?: string;
  /** Tile colour behind the scene; defaults to the themed image background. */
  background?: string;
};

/** Bordered, hard-shadowed picture frame: the drop-in image replacement. */
export function VoxelFrame({
  grid,
  label,
  ratio,
  unit,
  className = "",
  background,
}: FrameProps) {
  return (
    <div
      className={`voxel-frame ${className}`}
      style={{ aspectRatio: ratio, background: background ?? "var(--img-bg)" }}
    >
      <VoxelSvg grid={grid} label={label} unit={unit} className="voxel-frame__art" />
    </div>
  );
}

/** Flat pixel-art icon (auto-outlined). */
export function PixelSprite({
  kind,
  className,
}: {
  kind: SpriteIcon;
  className?: string;
}) {
  const r = useMemo(() => renderSprite(sprite(kind)), [kind]);
  return (
    <svg
      viewBox={`0 0 ${r.size} ${r.size}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
    >
      {r.rects.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={1} height={1} fill={p.fill} />
      ))}
    </svg>
  );
}

/** Square icon tile holding a voxel object or a pixel sprite. */
export function VoxelTile({
  grid,
  sprite: spriteKind,
  size = 64,
  tint = "sage",
  className = "",
}: {
  grid?: VoxelGrid;
  sprite?: SpriteIcon;
  size?: number;
  tint?: "sage" | "clay";
  className?: string;
}) {
  return (
    <div
      className={`voxel-tile ${className}`}
      style={{
        height: size,
        width: size,
        background: tint === "sage" ? "var(--sage-tint)" : "var(--clay-tint)",
      }}
      aria-hidden
    >
      {grid ? (
        <VoxelSvg grid={grid} unit={8} className="voxel-tile__art" />
      ) : spriteKind ? (
        <PixelSprite kind={spriteKind} className="voxel-tile__art" />
      ) : null}
    </div>
  );
}
