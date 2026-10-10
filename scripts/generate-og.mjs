// Regenerates public/og-image.png (1200x630) from the voxel clinic scene.
// Run: node scripts/generate-og.mjs
// Node >= 22.18 strips TypeScript types natively, so the app's own
// `src/graphics/*.ts` modules are imported directly (no build step).

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { toSvgString } from "../src/graphics/voxel.ts";
import { clinicScene } from "../src/graphics/scenes.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200;
const H = 630;

const art = clinicScene().render(18);
const artW = 600;
const artH = Math.round((art.height / art.width) * artW);
const artSvg = toSvgString(art)
  .replace(/width="\d+" height="\d+"/, `width="${artW}" height="${artH}"`)
  .replace("<svg ", `<svg x="${W - artW - 10}" y="${(H - artH) / 2}" `);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#a8e0f0"/>
  <g fill="#ffffff" opacity="0.18">
    ${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 96}" y="0" width="48" height="${H}"/>`).join("")}
  </g>
  <rect x="48" y="86" width="520" height="458" fill="#16324a" transform="translate(10 10)"/>
  <rect x="48" y="86" width="520" height="458" fill="#ffffff" stroke="#16324a" stroke-width="6"/>
  <rect x="48" y="86" width="520" height="22" fill="#ffc93c" stroke="#16324a" stroke-width="6"/>
  <text x="84" y="206" font-family="'Courier New', monospace" font-weight="700" font-size="30" fill="#1f4361" letter-spacing="3">MERIDIAN, ID</text>
  <text x="84" y="290" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="58" fill="#16324a">Willow Bend</text>
  <text x="84" y="364" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="58" fill="#16324a">Family Clinic</text>
  <text x="84" y="414" font-family="Arial, sans-serif" font-size="26" fill="#3b5a72">Unhurried, whole-person</text>
  <text x="84" y="448" font-family="Arial, sans-serif" font-size="26" fill="#3b5a72">primary care for every age.</text>
  <rect x="84" y="476" width="250" height="52" fill="#ff6b3d" stroke="#16324a" stroke-width="5"/>
  <text x="209" y="511" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="26" fill="#16110c">Book a visit</text>
  ${artSvg}
</svg>`;

const out = join(root, "public", "og-image.png");
writeFileSync(out, await sharp(Buffer.from(svg)).png().toBuffer());
console.log("wrote", out);
