// Flat pixel sprites for icons that read poorly when sheared into isometric
// (heart, cross, ball, stethoscope). Rows are top-to-bottom; "." is empty.
// An outline is generated automatically around every filled pixel.

export type Sprite = { rows: string[]; palette: Record<string, string> };

export type SpriteIcon = "heart" | "ball" | "cross" | "stethoscope";

const NAVY = "#16324a";

const SPRITES: Record<SpriteIcon, Sprite> = {
  heart: {
    rows: [
      ".XXX.XXX.",
      "XWWXXXXXX",
      "XWXXXXXXX",
      "XXXXXXXXX",
      ".XXXXXXX.",
      "..XXXXX..",
      "...XXX...",
      "....X....",
    ],
    palette: { X: "#ff6b3d", W: "#ffb199" },
  },
  ball: {
    rows: [
      "..XXXXX..",
      ".XWXNXXX.",
      "XWXXNXXXX",
      "XXXXNXXXX",
      "NNNNNNNNN",
      "XXXXNXXXX",
      "XXXXNXXXX",
      ".XXXNXXX.",
      "..XXNXX..",
    ],
    palette: { X: "#ff8a3d", W: "#ffc08f", N: NAVY },
  },
  cross: {
    rows: [
      "..GGG..",
      "..GWG..",
      "GGGWGGG",
      "GWWWWWG",
      "GGGWGGG",
      "..GWG..",
      "..GGG..",
    ],
    palette: { G: "#2fbf71", W: "#a6efc5" },
  },
  stethoscope: {
    rows: [
      "S.......S",
      "T.......T",
      "TT.....TT",
      ".TT...TT.",
      "..TT.TT..",
      "...TTT...",
      "....T....",
      "....T....",
      "..TTTTT..",
      "..TYYYT..",
      "..TYWYT..",
      "..TTTTT..",
    ],
    palette: { T: "#2aa7a0", S: "#c9e3ef", Y: "#ffc93c", W: "#fff3d6" },
  },
};

export function sprite(kind: SpriteIcon): Sprite {
  return SPRITES[kind];
}

export type SpriteRender = {
  size: number;
  rects: { x: number; y: number; fill: string }[];
};

/** Expand a sprite by one pixel on every side and add the navy outline. */
export function renderSprite(s: Sprite): SpriteRender {
  const h = s.rows.length;
  const w = Math.max(...s.rows.map((r) => r.length));
  const filled = (x: number, y: number) =>
    y >= 0 && y < h && x >= 0 && x < w && !!s.palette[s.rows[y][x] ?? "."] && s.rows[y][x] !== ".";

  const rects: SpriteRender["rects"] = [];
  for (let y = -1; y <= h; y++) {
    for (let x = -1; x <= w; x++) {
      if (filled(x, y)) {
        rects.push({ x: x + 1, y: y + 1, fill: s.palette[s.rows[y][x]] });
      } else if (
        filled(x - 1, y) ||
        filled(x + 1, y) ||
        filled(x, y - 1) ||
        filled(x, y + 1)
      ) {
        rects.push({ x: x + 1, y: y + 1, fill: NAVY });
      }
    }
  }
  return { size: Math.max(w, h) + 2, rects };
}
