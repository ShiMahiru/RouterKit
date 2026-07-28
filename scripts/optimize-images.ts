// Build-time image optimization: compress originals, generate WebP variants.
// Scans src/content/posts/*/ for images, writes optimized copies to build/posts/*/.
// Uses .image-cache/ to skip unchanged files across builds.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const POSTS_DIR = path.join(projectRoot, 'src', 'content', 'posts');
const BUILD_DIR = path.join(projectRoot, 'build', 'client');
const CACHE_DIR = path.join(projectRoot, '.image-cache');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
const RASTER_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif']);

const WEBP_QUALITY = 80;
const JPEG_QUALITY = 85;
const MAX_WIDTH = 2400;

interface ImageFile {
	fullPath: string;
	slug: string;
	filename: string;
	ext: string;
}

// ---- helpers ----

function hashFile(filePath: string): string {
	const buf = fs.readFileSync(filePath);
	return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

function readCache(): Map<string, string> {
	const cacheFile = path.join(CACHE_DIR, 'manifest.json');
	if (!fs.existsSync(cacheFile)) return new Map();
	try {
		const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
		return new Map(Object.entries(data));
	} catch {
		return new Map();
	}
}

function writeCache(cache: Map<string, string>) {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	fs.writeFileSync(
		path.join(CACHE_DIR, 'manifest.json'),
		JSON.stringify(Object.fromEntries(cache), null, 2),
		'utf8'
	);
}

function findImages(): ImageFile[] {
	if (!fs.existsSync(POSTS_DIR)) return [];

	const results: ImageFile[] = [];
	const slugs = fs.readdirSync(POSTS_DIR).filter(name => {
		const d = path.join(POSTS_DIR, name);
		return fs.statSync(d).isDirectory();
	});

	for (const slug of slugs) {
		walkDir(path.join(POSTS_DIR, slug), slug, results);
	}

	return results;
}

function walkDir(dir: string, slug: string, results: ImageFile[]) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walkDir(fullPath, slug, results);
		} else if (entry.isFile()) {
			const ext = path.extname(entry.name).toLowerCase();
			if (IMAGE_EXTS.has(ext)) {
				results.push({ fullPath, slug, filename: entry.name, ext });
			}
		}
	}
}

// ---- processing ----

async function processImage(img: ImageFile, cache: Map<string, string>): Promise<boolean> {
	const relativeDir = path.dirname(path.relative(
		path.join(POSTS_DIR, img.slug),
		img.fullPath
	));
	const outputDir = path.join(BUILD_DIR, 'posts', img.slug, relativeDir);
	fs.mkdirSync(outputDir, { recursive: true });

	const baseName = path.parse(img.filename).name;
	const fileHash = hashFile(img.fullPath);

	// Skip if unchanged since last build
	const cacheKey = `${img.slug}/${img.filename}`;
	if (cache.get(cacheKey) === fileHash) {
		// Still need to copy to build (build dir is cleaned by vite)
		if (RASTER_EXTS.has(img.ext)) {
			const webpPath = path.join(outputDir, `${baseName}.webp`);
			if (!fs.existsSync(webpPath)) {
				// WebP was cached but not in build — regenerate
				await generateWebP(img.fullPath, webpPath);
			}
		}
		const outPath = path.join(outputDir, img.filename);
		if (!fs.existsSync(outPath)) {
			fs.copyFileSync(img.fullPath, outPath);
		}
		return false; // skipped (cached)
	}

	const pipeline = sharp(img.fullPath);
	const metadata = await pipeline.metadata();
	if (metadata.width && metadata.width > MAX_WIDTH) {
		pipeline.resize(MAX_WIDTH);
	}

	// WebP
	if (RASTER_EXTS.has(img.ext)) {
		const webpPath = path.join(outputDir, `${baseName}.webp`);
		await generateWebP(img.fullPath, webpPath);
	}

	// Compress original
	const outPath = path.join(outputDir, img.filename);
	if (img.ext === '.png') {
		await pipeline.clone().png({ palette: true, quality: 90 }).toFile(outPath);
	} else if (img.ext === '.jpg' || img.ext === '.jpeg') {
		await pipeline.clone().jpeg({ quality: JPEG_QUALITY, progressive: true }).toFile(outPath);
	} else {
		fs.copyFileSync(img.fullPath, outPath);
	}

	cache.set(cacheKey, fileHash);
	return true; // processed
}

async function generateWebP(srcPath: string, destPath: string) {
	await sharp(srcPath)
		.webp({ quality: WEBP_QUALITY, effort: 4 })
		.toFile(destPath);
}

// ---- main ----

async function main() {
	const images = findImages();

	if (images.length === 0) {
		console.log('[optimize-images] no images found');
		return;
	}

	const cache = readCache();
	console.log(`[optimize-images] ${images.length} image(s) (${cache.size} cached)`);

	let done = 0;
	let skipped = 0;
	let errors = 0;

	const results = await Promise.allSettled(
		images.map(async (img) => {
			const processed = await processImage(img, cache);
			done++;
			if (processed) {
				console.log(`  [${done}/${images.length}] ${img.slug}/${img.filename}`);
			} else {
				skipped++;
			}
		})
	);

	for (const r of results) {
		if (r.status === 'rejected') {
			console.error('[optimize-images] error:', r.reason);
			errors++;
		}
	}

	writeCache(cache);

	const processed = images.length - skipped - errors;
	console.log(
		`[optimize-images] done — ${processed} processed, ${skipped} cached, ` +
		(errors ? `${errors} failed` : '0 errors')
	);
}

main().catch(err => {
	console.error('[optimize-images] fatal:', err);
	process.exit(1);
});