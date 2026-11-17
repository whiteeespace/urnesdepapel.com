// Builds the site's favicons from the logo's own U (src/components/Logo/paths.ts):
//   src/app/icon.svg       white rounded square, for browsers that take SVG icons
//   src/app/favicon.ico    16, 32 and 48 px renders of the same, for everything else
//   src/app/apple-icon.png 180 px, full-bleed white (iOS rounds the corners itself)
// Run with: node scripts/favicon/build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = fileURLToPath(new URL("../../", import.meta.url));
const INK = "#2a2926";

// The U is the first of the mark's paths; the two after it are the fibres, too fine to survive at icon sizes.
const paths = readFileSync(`${root}src/components/Logo/paths.ts`, "utf8");
const markBlock = paths.match(/LOGO_MARK_PATHS = \[([\s\S]*?)\];/)[1];
const uPath = markBlock.match(/"([^"]+)"/)[1];

// The U spans x 81.33–160.69, y 70.45–174.25 of the artwork. Scale it to SIZE of the 100-unit tile's height.
const U = { x: 81.33, y: 70.45, w: 79.36, h: 103.8 };
const SIZE = 0.7;
const scale = (100 * SIZE) / U.h;
const tx = 50 - (U.x + U.w / 2) * scale;
const ty = 50 - (U.y + U.h / 2) * scale;
const u = `<path fill="${INK}" transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(5)})" d="${uPath}"/>`;

const tile = (radius) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="${radius}" fill="#fff"/>${u}</svg>\n`;

const rounded = tile(22);
writeFileSync(`${root}src/app/icon.svg`, rounded);

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: (72 * size) / 100 })
    .resize(size, size)
    .png()
    .toBuffer();

writeFileSync(`${root}src/app/apple-icon.png`, await png(tile(0), 180));

// An ICO is a directory of embedded PNGs.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => png(rounded, size)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
writeFileSync(`${root}src/app/favicon.ico`, Buffer.concat([header, ...images]));
console.log("Wrote src/app/icon.svg, src/app/favicon.ico, src/app/apple-icon.png");
