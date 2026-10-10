// Voxel graphics engine: culling, ordering and determinism. These scenes
// replace the image placeholders, so a regression here blanks the hero art.

import { describe, expect, it } from "vitest";
import { VoxelGrid, toSvgString } from "../src/graphics/voxel";
import {
  clinicScene,
  coordinatorBust,
  logoCube,
  mapScene,
  nurseBust,
  physicianBust,
  serviceIcon,
  willowMascot,
} from "../src/graphics/scenes";
import { renderSprite, sprite } from "../src/graphics/sprites";

describe("VoxelGrid", () => {
  it("renders the three visible faces of a single cube", () => {
    const r = new VoxelGrid().set(0, 0, 0, "#ff0000").render(10);
    expect(r.polys).toHaveLength(3);
  });

  it("culls faces hidden by neighbouring voxels", () => {
    const g = new VoxelGrid().box(0, 0, 0, 2, 1, 1, "#00ff00");
    // 2 cubes side by side along x: shared face is hidden, so 3 + 3 - 1.
    expect(g.render(10).polys).toHaveLength(5);
  });

  it("is deterministic", () => {
    expect(toSvgString(clinicScene().render(10))).toBe(
      toSvgString(clinicScene().render(10)),
    );
  });

  it("produces a finite, positive viewBox", () => {
    const r = logoCube().render(10);
    const nums = r.viewBox.split(" ").map(Number);
    expect(nums.every(Number.isFinite)).toBe(true);
    expect(r.width).toBeGreaterThan(0);
    expect(r.height).toBeGreaterThan(0);
  });

  it("stamps sprites onto the x-z plane with y depth", () => {
    const g = new VoxelGrid().sprite(["X.", "XX"], { X: "#123456" }, 2);
    expect(g.size).toBe(6);
    expect(g.has(0, 1, 1)).toBe(true);
    expect(g.has(1, 0, 1)).toBe(false);
  });
});

describe("scenes", () => {
  const scenes = {
    clinic: clinicScene(),
    physician: physicianBust(),
    nurse: nurseBust(),
    coordinator: coordinatorBust(),
    logo: logoCube(),
    willow: willowMascot(),
    map: mapScene(),
    blocks: serviceIcon("blocks"),
    flower: serviceIcon("flower"),
    pill: serviceIcon("pill"),
    house: serviceIcon("house"),
  };

  it.each(Object.entries(scenes))("%s is non-empty", (_name, grid) => {
    expect(grid.size).toBeGreaterThan(0);
    expect(grid.render(10).polys.length).toBeGreaterThan(0);
  });
});

describe("pixel sprites", () => {
  it("adds a one-pixel outline around the artwork", () => {
    const r = renderSprite(sprite("cross"));
    const outline = r.rects.filter((p) => p.fill === "#16324a");
    expect(outline.length).toBeGreaterThan(0);
    expect(r.size).toBe(9);
  });
});
