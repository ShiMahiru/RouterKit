/**
 * Build-time image optimizer.
 * Converts jpg/png/gif → webp, then compresses everything to fit 1920px.
 * Skips images that haven't changed since last run (hash-based cache).
 *
 * Source:   public/images/
 * Output:   public/images/  (overwrites in place, keeps only .webp)
 * Cache:    .image-cache/   (file hashes to skip unchanged images)
 * Invoked:  pnpm optimize-images
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DIR = path.resolve("public/images");
const CACHE_DIR = path.resolve(".image-cache");
const CACHE_FILE = path.join(CACHE_DIR, "hashes.json");
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 80;

function humanSize(bytes) {
  if (bytes > 1_000_000) return (bytes / 1_000_000).toFixed(1) + " MB";
  if (bytes > 1_000) return (bytes / 1_000).toFixed(1) + " KB";
  return bytes + " B";
}

function fileHash(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function optimizeFile(filePath) {
  const before = fs.statSync(filePath).size;
  const ext = path.extname(filePath).toLowerCase();

  let pipeline = sharp(filePath).resize(MAX_WIDTH, MAX_WIDTH, {
    fit: "inside",
    withoutEnlargement: true,
  });

  pipeline = pipeline.webp({ quality: WEBP_QUALITY, effort: 4 });

  const tmpPath = filePath + ".tmp";
  await pipeline.toFile(tmpPath);

  const after = fs.statSync(tmpPath).size;

  const outPath = ext === ".webp" ? filePath : filePath.replace(ext, ".webp");
  fs.renameSync(tmpPath, outPath);

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

  const cache = loadCache();
  const newCache = {};
  const toOptimize = [];

  for (const file of files) {
    const hash = fileHash(file);
    newCache[path.basename(file)] = hash;
    if (cache[path.basename(file)] === hash) {
      continue; // unchanged
    }
    toOptimize.push(file);
  }

  if (toOptimize.length === 0) {
    console.log("  All images up to date (cached).");
    saveCache(newCache);
    return;
  }

  console.log(`  Optimizing ${toOptimize.length} images (${files.length - toOptimize.length} cached) …`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of toOptimize) {
    const { before, after } = await optimizeFile(file);
    totalBefore += before;
    totalAfter += after;
    const pct = Math.round(((before - after) / before) * 100);
    console.log(
      `    ${path.basename(file)}  ${humanSize(before)} → ${humanSize(after)}  (-${pct}%)`
    );
  }

  if (totalBefore > 0) {
    console.log(`  Done: ${humanSize(totalBefore)} → ${humanSize(totalAfter)}  (-${Math.round(((totalBefore - totalAfter) / totalBefore) * 100)}%)`);
  }

  saveCache(newCache);
}

main();
