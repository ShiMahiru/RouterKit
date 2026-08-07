/**
 * Build-time image optimizer.
 * Converts jpg/png/gif → webp, then compresses everything to fit 1920px.
 *
 * Source:   public/images/
 * Output:   public/images/  (overwrites in place, keeps only .webp)
 * Invoked:  pnpm optimize-images
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const DIR = path.resolve("public/images");
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 80;

function humanSize(bytes) {
  if (bytes > 1_000_000) return (bytes / 1_000_000).toFixed(1) + " MB";
  if (bytes > 1_000) return (bytes / 1_000).toFixed(1) + " KB";
  return bytes + " B";
}

async function optimizeFile(filePath) {
  const before = fs.statSync(filePath).size;
  const ext = path.extname(filePath).toLowerCase();

  let pipeline = sharp(filePath).resize(MAX_WIDTH, MAX_WIDTH, {
    fit: "inside",
    withoutEnlargement: true,
  });

  // Already webp → just re-encode at target quality.  Other formats → convert.
  pipeline = pipeline.webp({ quality: WEBP_QUALITY, effort: 4 });

  const tmpPath = filePath + ".tmp";
  await pipeline.toFile(tmpPath);

  const after = fs.statSync(tmpPath).size;

  // Replace original even if already .webp
  const outPath = ext === ".webp" ? filePath : filePath.replace(ext, ".webp");
  fs.renameSync(tmpPath, outPath);

  // If we converted from another format, delete original
  if (ext !== ".webp") {
    fs.unlinkSync(filePath);
  }

  return { before, after };
}

async function main() {
  if (!fs.existsSync(DIR)) {
    console.log("  public/images/ not found, skipping image optimization.");
    return;
  }

  const files = fs
    .readdirSync(DIR)
    .filter((f) => /\.(png|jpe?g|gif|webp)$/i.test(f))
    .map((f) => path.join(DIR, f));

  if (files.length === 0) {
    console.log("  No images to optimize.");
    return;
  }

  console.log(`  Optimizing ${files.length} images …`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const { before, after } = await optimizeFile(file);
    totalBefore += before;
    totalAfter += after;
    const pct = Math.round(((before - after) / before) * 100);
    console.log(
      `    ${path.basename(file)}  ${humanSize(before)} → ${humanSize(after)}  (-${pct}%)`
    );
  }

  console.log(`  Done: ${humanSize(totalBefore)} → ${humanSize(totalAfter)}  (-${Math.round(((totalBefore - totalAfter) / totalBefore) * 100)}%)`);
}

main();
