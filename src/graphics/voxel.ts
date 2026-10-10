// Tiny isometric voxel renderer: pure TypeScript (no JSX, no enums, no
// parameter properties) so both the React app and Node scripts can import it.
//
// Projection: viewer looks from (+x, +y, +z). Three faces of every cube can be
// visible: top (+z), left (+y) and right (+x). Cubes are painted far-to-near
// (ascending x+y+z) and hidden faces are culled.

export type Poly = { points: string; fill: string };

export type VoxelRender = {
  polys: Poly[];
  viewBox: string;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
};

const OUTLINE = "#16324a";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function mix(hex: string, towards: string, amount: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(towards);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export class VoxelGrid {
  private cells = new Map<string, string>();

  private key(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }

  set(x: number, y: number, z: number, color: string): this {
    this.cells.set(this.key(x, y, z), color);
    return this;
  }

  has(x: number, y: number, z: number): boolean {
    return this.cells.has(this.key(x, y, z));
  }

  remove(x: number, y: number, z: number): this {
    this.cells.delete(this.key(x, y, z));
    return this;
  }

  /** Fill a w × d × h cuboid whose lowest corner is (x, y, z). */
  box(
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    h: number,
    color: string,
  ): this {
    for (let i = 0; i < w; i++)
      for (let j = 0; j < d; j++)
        for (let k = 0; k < h; k++) this.set(x + i, y + j, z + k, color);
    return this;
  }

  /**
   * Stamp a pixel sprite onto the x–z plane (faces the +y side of the
   * viewer). `rows[0]` is the top row; "." is empty; other characters are
   * looked up in `palette`. The sprite is extruded `depth` voxels along y.
   */
  sprite(
    rows: string[],
    palette: Record<string, string>,
    depth = 1,
    ox = 0,
    oy = 0,
    oz = 0,
  ): this {
    const h = rows.length;
    rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const color = palette[row[c]];
        if (!color || row[c] === ".") continue;
        for (let d = 0; d < depth; d++) this.set(ox + c, oy + d, oz + (h - 1 - r), color);
      }
    });
    return this;
  }

  get size(): number {
    return this.cells.size;
  }

  render(unit = 10): VoxelRender {
    const kx = 0.866 * unit;
    const ky = 0.5 * unit;
    const kz = unit;
    const sx = (x: number, y: number) => (x - y) * kx;
    const sy = (x: number, y: number, z: number) => (x + y) * ky - z * kz;

    const entries = [...this.cells.entries()].map(([k, color]) => {
      const [x, y, z] = k.split(",").map(Number);
      return { x, y, z, color };
    });
    entries.sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z) || a.z - b.z);

    const polys: Poly[] = [];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const pt = (x: number, y: number, z: number): [number, number] => {
      const px = sx(x, y);
      const py = sy(x, y, z);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
      return [px, py];
    };
    const fmt = (pts: [number, number][]) =>
      pts.map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`).join(" ");

    for (const { x, y, z, color } of entries) {
      if (!this.has(x + 1, y, z)) {
        polys.push({
          points: fmt([
            pt(x + 1, y, z + 1),
            pt(x + 1, y + 1, z + 1),
            pt(x + 1, y + 1, z),
            pt(x + 1, y, z),
          ]),
          fill: mix(color, OUTLINE, 0.3),
        });
      }
      if (!this.has(x, y + 1, z)) {
        polys.push({
          points: fmt([
            pt(x, y + 1, z + 1),
            pt(x + 1, y + 1, z + 1),
            pt(x + 1, y + 1, z),
            pt(x, y + 1, z),
          ]),
          fill: color,
        });
      }
      if (!this.has(x, y, z + 1)) {
        polys.push({
          points: fmt([
            pt(x, y, z + 1),
            pt(x + 1, y, z + 1),
            pt(x + 1, y + 1, z + 1),
            pt(x, y + 1, z + 1),
          ]),
          fill: mix(color, "#ffffff", 0.38),
        });
      }
    }

    const strokeWidth = Math.max(0.5, unit * 0.07);
    const pad = strokeWidth * 2;
    const width = maxX - minX + pad * 2;
    const height = maxY - minY + pad * 2;
    return {
      polys,
      viewBox: `${(minX - pad).toFixed(2)} ${(minY - pad).toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)}`,
      width,
      height,
      stroke: OUTLINE,
      strokeWidth,
    };
  }
}

/** Serialize a rendered grid to a standalone SVG string (for scripts/OG art). */
export function toSvgString(r: VoxelRender): string {
  const body = r.polys
    .map((p) => `<polygon points="${p.points}" fill="${p.fill}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r.viewBox}" width="${r.width.toFixed(0)}" height="${r.height.toFixed(0)}"><g stroke="${r.stroke}" stroke-width="${r.strokeWidth}" stroke-linejoin="round">${body}</g></svg>`;
}
