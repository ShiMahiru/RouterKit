// Build-time script: generate RSS, sitemap, robots.txt, and copy post images
import { Feed } from 'feed';
import MarkdownIt from 'markdown-it';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import os from 'os';
import crypto from 'crypto';

const md = new MarkdownIt({ html: true, linkify: true });

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://blog.2x.nz';
const SITE_TITLE = 'Yuln';
const SITE_LANGUAGE = 'zh-CN';
const SITE_ICON = 'https://q2.qlogo.cn/headimg_dl?dst_uin=242531778&spec=0';

// ---- Parse frontmatter ----
function parseFrontmatter(raw) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { metadata: {}, content: raw };
	const body = raw.slice(match[0].length).trim();
	const meta = {};
	for (const line of match[1].split('\n')) {
		const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
		if (!kv) continue;
		const key = kv[1].trim();
		let val = kv[2].trim();
		if (val === 'true' || val === 'false') { meta[key] = val === 'true'; continue; }
		if (val.startsWith('[') && val.endsWith(']')) {
			meta[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
			continue;
		}
		if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
		meta[key] = val;
	}
	return { metadata: meta, content: body };
}

// ---- Load posts ----
const postsDir = path.join(process.cwd(), 'src/posts');
const postDirs = fs.readdirSync(postsDir).filter(name => {
	const d = path.join(postsDir, name);
	return fs.statSync(d).isDirectory() && fs.existsSync(path.join(d, 'index.md'));
});

const posts = [];
for (const slug of postDirs) {
	const raw = fs.readFileSync(path.join(postsDir, slug, 'index.md'), 'utf8');
	const { metadata, content } = parseFrontmatter(raw);
	posts.push({
		slug,
		metadata: {
			title: metadata.title || slug,
			image: metadata.image || '',
			published: metadata.published || new Date(0).toISOString(),
			pinned: metadata.pinned ?? false,
			description: metadata.description || '',
			draft: metadata.draft,
			updated: metadata.updated,
			toc: metadata.toc,
			tags: metadata.tags || [],
			categories: metadata.categories || []
		},
		content
	});
}

posts.sort((a, b) => {
	if (a.metadata.pinned && !b.metadata.pinned) return -1;
	if (!a.metadata.pinned && b.metadata.pinned) return 1;
	return new Date(b.metadata.published) - new Date(a.metadata.published);
});

// ---- RSS ----
const publishedPosts = posts.filter(p => !p.metadata.draft);

const feed = new Feed({
	title: SITE_TITLE,
	description: SITE_TITLE,
	id: SITE_URL,
	link: SITE_URL,
	language: SITE_LANGUAGE,
	favicon: SITE_ICON || undefined,
	copyright: `All rights reserved ${new Date().getFullYear()}, ${SITE_TITLE}`,
	feedLinks: { rss: `${SITE_URL}/rss.xml` },
	author: { name: SITE_TITLE, link: SITE_URL }
});

for (const post of publishedPosts) {
	const safe = (s) => (typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') : '');
	const safeTitle = safe(post.metadata.title) || post.slug;
	const safeDesc = safe(post.metadata.description);
	const pubDate = new Date(post.metadata.published);
	const safeDate = isNaN(pubDate.getTime()) ? new Date() : pubDate;

	feed.addItem({
		title: safeTitle,
		id: `${SITE_URL}/posts/${post.slug}/`,
		link: `${SITE_URL}/posts/${post.slug}/`,
		description: safeDesc || safeTitle,
		date: safeDate,
		categories: []   // 强制不输出 <category> 标签
	});
}

const buildDir = path.join(process.cwd(), 'build');
fs.writeFileSync(path.join(buildDir, 'rss.xml'), feed.rss2(), 'utf8');
console.log('[build-static] rss.xml generated');

// ---- Sitemap ----
const staticPages = [
	{ url: '/', priority: '1.0', changefreq: 'daily' },
	{ url: '/posts', priority: '0.9', changefreq: 'daily' },
	{ url: '/archives', priority: '0.7', changefreq: 'weekly' },
	{ url: '/tags', priority: '0.7', changefreq: 'weekly' },
	{ url: '/search', priority: '0.5', changefreq: 'monthly' }
];

const postPages = posts.map(p => ({
	url: `/posts/${p.slug}/`,
	priority: '0.8',
	changefreq: 'weekly',
	lastmod: p.metadata.updated || p.metadata.published
}));

const allPages = [...staticPages, ...postPages];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    ${p.lastmod ? `<lastmod>${new Date(p.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), sitemap, 'utf8');
console.log('[build-static] sitemap.xml generated');

// ---- Robots.txt ----
const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(buildDir, 'robots.txt'), robots, 'utf8');
console.log('[build-static] robots.txt generated');

// ---- Copy post images ----
const CONVERTIBLE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const COPY_EXTS = new Set(['.gif', '.svg', '.ico', '.bmp', '.tiff', '.avif']);

for (const post of posts) {
	const imgDir = path.join(postsDir, post.slug, 'img');
	if (!fs.existsSync(imgDir)) continue;

	const outputImgDir = path.join(buildDir, 'posts', post.slug, 'img');
	fs.mkdirSync(outputImgDir, { recursive: true });

	const images = fs.readdirSync(imgDir).filter(f => !f.startsWith('.'));
	for (const image of images) {
		const srcPath = path.join(imgDir, image);
		if (!fs.statSync(srcPath).isFile()) continue;
		const ext = path.extname(image).toLowerCase();

		if (CONVERTIBLE_EXTS.has(ext)) {
			const baseName = path.basename(image, ext);
			const destPath = path.join(outputImgDir, `${baseName}.avif`);
			try {
				await sharp(srcPath, { failOn: 'none' }).rotate().avif({ quality: 50, effort: 4 }).toFile(destPath);
				console.log(`[build-static] converted ${post.slug}/img/${image} → ${baseName}.avif`);
			} catch (err) {
				fs.copyFileSync(srcPath, destPath);
				console.warn(`[build-static] fallback copy ${post.slug}/img/${image}: ${err.message}`);
			}
		} else {
			const destPath = path.join(outputImgDir, image);
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

console.log('[build-static] done');
