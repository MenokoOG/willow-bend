// Voxel scenes that replace the old grey image placeholders. Every scene is a
// pure function returning a VoxelGrid so it renders identically in the app,
// in tests and in the OG-image script.

import { VoxelGrid } from "./voxel.ts";

const C = {
  navy: "#16324a",
  white: "#ffffff",
  cream: "#fff3d6",
  plinth: "#cfe3ee",
  orange: "#ff6b3d",
  orangeLight: "#ff9166",
  orangeDark: "#e04f22",
  yellow: "#ffc93c",
  green: "#2fbf71",
  greenDark: "#1f8f54",
  leaf: "#57d68d",
  grassA: "#7bdc82",
  grassB: "#6ccf77",
  path: "#f1e4c3",
  pathB: "#e6d5aa",
  glass: "#bfeaf7",
  door: "#2b7fb0",
  wood: "#8b5a2b",
  pink: "#ff7aa8",
  blue: "#4aa8e0",
  red: "#e5484d",
  teal: "#2aa7a0",
  skinA: "#f6cfa8",
  skinB: "#c98b5c",
  skinC: "#8d5a3b",
  hairA: "#3a2a22",
  hairB: "#b4552a",
  hairC: "#1c1c28",
} as const;

function tree(g: VoxelGrid, x: number, y: number, trunk: number) {
  g.box(x, y, 1, 1, 1, trunk, C.wood);
  g.box(x - 1, y - 1, 1 + trunk, 3, 3, 2, C.leaf);
  g.box(x, y, 1 + trunk + 2, 1, 1, 1, C.green);
  g.set(x + 1, y + 1, trunk, C.leaf);
}

function person(
  g: VoxelGrid,
  x: number,
  y: number,
  o: { legs: string; torso: string; skin: string; hair: string; tall?: boolean },
) {
  const base = o.tall === false ? 1 : 2;
  if (o.tall !== false) g.set(x, y, 1, o.legs);
  g.set(x, y, base, o.torso);
  g.set(x, y, base + 1, o.skin);
  g.set(x, y, base + 2, o.hair);
}

/** Hero diorama: the clinic, a willow-green garden, a doctor and two kids. */
export function clinicScene(): VoxelGrid {
  const g = new VoxelGrid();
  const W = 14;
  const D = 12;

  for (let x = 0; x < W; x++)
    for (let y = 0; y < D; y++) g.set(x, y, 0, (x + y) % 2 ? C.grassA : C.grassB);
  for (let x = 6; x <= 7; x++)
    for (let y = 7; y < D; y++) g.set(x, y, 0, y % 2 ? C.path : C.pathB);

  // Building: plinth, tall cream walls, door, awning, windows.
  g.box(3, 1, 1, 8, 6, 1, C.plinth);
  g.box(3, 1, 2, 8, 6, 5, C.cream);
  for (let z = 2; z <= 3; z++) for (let x = 6; x <= 7; x++) g.set(x, 6, z, C.door);
  g.set(7, 6, 2, C.yellow);
  [5, 7].forEach((x) => g.set(x, 7, 4, C.green));
  [6, 8].forEach((x) => g.set(x, 7, 4, C.white));
  [4, 9].forEach((x) => {
    g.set(x, 6, 4, C.glass);
    g.set(x, 6, 5, C.glass);
  });
  [2, 4].forEach((y) => {
    g.set(10, y, 4, C.glass);
    g.set(10, y, 5, C.glass);
  });

  // Stepped roof + rooftop medical cross.
  g.box(2, 0, 7, 10, 8, 1, C.orange);
  g.box(3, 1, 8, 8, 6, 1, C.orangeLight);
  g.box(4, 2, 9, 6, 4, 1, C.orange);
  g.box(5, 3, 10, 4, 2, 1, C.orangeDark);
  g.set(6, 3, 11, C.green);
  g.set(6, 3, 12, C.white);
  g.set(6, 3, 13, C.green);
  g.set(5, 3, 12, C.green);
  g.set(7, 3, 12, C.green);

  // Garden.
  tree(g, 12, 9, 3);
  tree(g, 1, 9, 2);
  [3, 4, 9, 10].forEach((x) => g.set(x, 7, 1, C.greenDark));
  g.set(3, 7, 2, C.yellow);
  g.set(10, 7, 2, C.pink);
  g.box(5, 9, 1, 1, 1, 3, C.navy);
  g.set(5, 9, 4, C.yellow);

  // People.
  person(g, 9, 9, { legs: C.navy, torso: C.white, skin: C.skinB, hair: C.hairC });
  person(g, 3, 10, { legs: C.navy, torso: C.orange, skin: C.skinA, hair: C.hairB, tall: false });
  person(g, 10, 11, { legs: C.blue, torso: C.green, skin: C.skinC, hair: C.hairA, tall: false });

  // Clouds.
  g.box(0, 0, 8, 3, 2, 1, C.white);
  g.box(1, 0, 9, 1, 2, 1, C.white);
  return g;
}

export type BustOptions = {
  skin: string;
  hair: string;
  coat: string;
  accent: string;
  plinth: string;
  style: "short" | "long" | "bun";
  glasses?: boolean;
};

function bust(o: BustOptions): VoxelGrid {
  const g = new VoxelGrid();
  for (let x = 1; x < 8; x++)
    for (let y = 1; y < 8; y++) g.set(x, y, 0, (x + y) % 2 ? o.plinth : C.white);

  g.box(3, 3, 1, 3, 3, 2, o.coat); // torso
  g.box(2, 3, 3, 5, 3, 1, o.coat); // shoulders
  g.set(4, 4, 4, o.skin); // neck
  g.box(3, 3, 5, 3, 3, 3, o.skin); // head
  g.box(3, 3, 8, 3, 3, 1, o.hair); // hair cap

  if (o.style === "long") {
    g.box(2, 3, 4, 1, 3, 5, o.hair);
    g.box(6, 3, 4, 1, 3, 5, o.hair);
  } else if (o.style === "bun") {
    g.set(4, 4, 9, o.hair);
    g.box(6, 3, 6, 1, 3, 2, o.hair);
  } else {
    g.box(6, 3, 7, 1, 3, 1, o.hair);
    g.box(2, 3, 7, 1, 3, 1, o.hair);
  }

  // Face: eyes, optional glasses bar, mouth.
  g.set(3, 5, 6, C.navy);
  g.set(5, 5, 6, C.navy);
  g.set(4, 5, 5, C.red);

  // Coat details: collar, badge.
  g.set(4, 5, 3, o.accent);
  g.set(4, 5, 2, o.accent);
  g.set(3, 5, 3, C.white);
  g.set(5, 5, 3, C.white);
  g.set(5, 5, 1, C.yellow);
  return g;
}

export function physicianBust(): VoxelGrid {
  return bust({
    skin: C.skinB,
    hair: C.hairC,
    coat: C.white,
    accent: C.green,
    plinth: C.leaf,
    style: "short",
    glasses: true,
  });
}

export function nurseBust(): VoxelGrid {
  return bust({
    skin: C.skinA,
    hair: C.hairB,
    coat: C.teal,
    accent: C.white,
    plinth: C.orangeLight,
    style: "bun",
  });
}

export function coordinatorBust(): VoxelGrid {
  return bust({
    skin: C.skinC,
    hair: C.hairC,
    coat: C.yellow,
    accent: C.navy,
    plinth: C.glass,
    style: "long",
    glasses: true,
  });
}

// ---------- Service icons ----------
// Heart / ball / cross / stethoscope live in sprites.ts (flat pixel art).

export type ServiceIcon = "blocks" | "flower" | "pill" | "house";

function blocks(): VoxelGrid {
  const g = new VoxelGrid();
  g.box(0, 0, 0, 3, 3, 3, C.yellow);
  g.set(1, 2, 1, C.orange);
  g.set(1, 2, 0, C.orange);
  g.set(1, 2, 2, C.orange);
  g.box(1, 0, 3, 2, 2, 2, C.blue);
  g.set(1, 1, 4, C.white);
  g.box(3, 1, 0, 2, 2, 2, C.green);
  g.set(3, 2, 1, C.white);
  return g;
}

function flower(): VoxelGrid {
  const g = new VoxelGrid();
  g.box(2, 2, 0, 3, 3, 1, C.orange);
  g.box(3, 3, 1, 1, 1, 4, C.greenDark);
  g.set(4, 3, 2, C.leaf);
  g.set(2, 3, 3, C.leaf);
  [
    [2, 3],
    [4, 3],
    [3, 2],
    [3, 4],
  ].forEach(([x, y]) => g.set(x, y, 5, C.pink));
  g.set(3, 3, 5, C.yellow);
  g.set(3, 3, 6, C.yellow);
  return g;
}

function pill(): VoxelGrid {
  const g = new VoxelGrid();
  g.box(0, 0, 0, 7, 3, 1, C.plinth);
  g.box(1, 0, 1, 3, 2, 2, C.orange);
  g.box(4, 0, 1, 3, 2, 2, C.white);
  g.set(1, 0, 2, C.orangeLight);
  g.set(4, 0, 2, C.cream);
  g.set(2, 2, 1, C.green);
  return g;
}

function house(): VoxelGrid {
  const g = new VoxelGrid();
  g.box(0, 0, 0, 5, 4, 4, C.cream);
  g.set(2, 3, 0, C.door);
  g.set(2, 3, 1, C.door);
  g.set(4, 3, 1, C.glass);
  g.set(0, 3, 1, C.glass);
  g.set(4, 3, 2, C.glass);
  g.set(0, 3, 2, C.glass);
  g.box(-1, -1, 4, 7, 6, 1, C.orange);
  g.box(0, 0, 5, 5, 4, 1, C.orangeLight);
  g.box(1, 1, 6, 3, 2, 1, C.orange);
  g.set(2, 1, 7, C.green);
  return g;
}

export function serviceIcon(kind: ServiceIcon): VoxelGrid {
  switch (kind) {
    case "blocks":
      return blocks();
    case "flower":
      return flower();
    case "pill":
      return pill();
    case "house":
      return house();
  }
}

/** Brand mark: an orange cube with a white medical cross on its top face. */
export function logoCube(): VoxelGrid {
  const g = new VoxelGrid();
  g.box(0, 0, 0, 3, 3, 3, C.orange);
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [0, 1],
    [2, 1],
  ].forEach(([x, y]) => g.set(x, y, 2, C.white));
  return g;
}

/** Willow mascot: a blocky weeping-willow tree with a friendly face. */
export function willowMascot(): VoxelGrid {
  const g = new VoxelGrid();
  g.box(2, 2, 0, 3, 3, 5, C.wood);
  g.set(2, 4, 3, C.white);
  g.set(4, 4, 3, C.white);
  g.set(2, 4, 2, C.navy);
  g.set(4, 4, 2, C.navy);
  g.set(3, 4, 1, C.yellow);
  g.box(0, 0, 5, 7, 7, 1, C.leaf);
  g.box(1, 1, 6, 5, 5, 1, C.green);
  g.box(2, 2, 7, 3, 3, 1, C.leaf);
  for (let i = 0; i < 7; i++) g.set(i, 0, 4, C.leaf);
  for (let i = 0; i < 4; i++) {
    g.set(0, i, 4, C.green);
    g.set(6, i, 4, C.green);
  }
  [0, 6].forEach((x) => {
    g.set(x, 0, 3, C.leaf);
    g.set(x, 2, 3, C.leaf);
  });
  g.set(3, 0, 3, C.green);
  return g;
}

/** Wide "map card" art used on the contact page. */
export function mapScene(): VoxelGrid {
  const g = new VoxelGrid();
  for (let x = 0; x < 14; x++)
    for (let y = 0; y < 8; y++) g.set(x, y, 0, (x + y) % 2 ? C.grassA : C.grassB);
  for (let x = 0; x < 14; x++) g.set(x, 4, 0, C.pathB);
  for (let y = 0; y < 8; y++) g.set(9, y, 0, C.pathB);
  g.box(3, 1, 1, 3, 2, 2, C.white);
  g.box(3, 1, 3, 3, 2, 1, C.orange);
  g.box(11, 5, 1, 2, 2, 2, C.cream);
  g.box(11, 5, 3, 2, 2, 1, C.blue);
  tree(g, 1, 6, 2);
  tree(g, 7, 6, 2);
  // Location pin.
  g.box(5, 5, 1, 1, 1, 3, C.red);
  g.box(5, 5, 4, 1, 1, 1, C.red);
  g.set(5, 5, 5, C.white);
  return g;
}
