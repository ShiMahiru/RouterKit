// Build-time script: generate RSS, sitemap, robots.txt, and copy post images
import { Feed } from 'feed';
import MarkdownIt from 'markdown-it';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import os from 'os';
import crypto from 'crypto';

const md = new MarkdownIt({ html: true, linkify: true });

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://2x.nz';
const SITE_TITLE = '博客 | Yuln';
const SITE_DESC = '《Yuln》是一个专注于 IT / 互联网技术分享与实践的个人技术博客。';
const SITE_LANGUAGE = 'zh-CN';
const SITE_ICON = 'https://q2.qlogo.cn/headimg_dl?dst_uin=242531778&spec=0';
const SITE_EMAIL = '242531778@qq.com';
const SITE_AUTHOR = 'Yuln';

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
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const postsDir = path.join(projectRoot, 'src/posts');
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
	description: SITE_DESC,
	id: SITE_URL,
	link: SITE_URL,
	language: SITE_LANGUAGE,
	favicon: SITE_ICON || undefined,
	copyright: `All rights reserved ${new Date().getFullYear()}, ${SITE_AUTHOR}`,
	feedLinks: { rss: `${SITE_URL}/rss.xml` },
	author: { name: SITE_AUTHOR, link: SITE_URL, email: SITE_EMAIL }
});

for (const post of publishedPosts) {
	const safe = (s) => (typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') : '');
	const safeTitle = safe(post.metadata.title)?.trim() || post.slug;
	const safeDesc = safe(post.metadata.description)?.trim();
	const safeContent = safe(post.content)?.trim() || safeDesc || safeTitle;
	const pubDate = new Date(post.metadata.published);
	const safeDate = isNaN(pubDate.getTime()) ? new Date() : pubDate;

	// 渲染 Markdown 为 HTML，修复相对图片路径
	let html = md.render(safeContent);
	html = html.replace(/(<img[^>]+src=")(?!\/|https?:\/\/)([^"]+)(")/g,
		(_, b, s, a) => `${b}${SITE_URL}/posts/${post.slug}/${s}${a}`);

	feed.addItem({
		title: safeTitle,
		id: `${SITE_URL}/posts/${post.slug}/`,
		link: `${SITE_URL}/posts/${post.slug}/`,
		description: safeDesc || safeTitle,
		content: html,
		date: safeDate,
		image: post.metadata.image ? `${SITE_URL}/posts/${post.slug}/${post.metadata.image}` : undefined,
		categories: []
	});
}

// Post-process RSS: remove unwanted tags, add managingEditor/webMaster, add enclosure
let rssXml = feed.rss2();

// Remove xmlns:dc namespace
rssXml = rssXml.replace(' xmlns:dc="http://purl.org/dc/elements/1.1/"', '');

// Remove <docs>, <generator>, <copyright>, <language>, <lastBuildDate>
rssXml = rssXml.replace(/\s*<docs>[^<]*<\/docs>\n?/g, '');
rssXml = rssXml.replace(/\s*<generator>[^<]*<\/generator>\n?/g, '');
rssXml = rssXml.replace(/\s*<copyright>[^<]*<\/copyright>\n?/g, '');
rssXml = rssXml.replace(/\s*<language>[^<]*<\/language>\n?/g, '');
rssXml = rssXml.replace(/\s*<lastBuildDate>[^<]*<\/lastBuildDate>\n?/g, '');

// Remove <pubDate> from items
rssXml = rssXml.replace(/\s*<pubDate>[^<]*<\/pubDate>\n?/g, '');
// Keep guid but strip isPermaLink attribute
rssXml = rssXml.replace(/<guid isPermaLink="true">/g, '<guid>');
rssXml = rssXml.replace(/<guid isPermaLink="false">/g, '<guid>');
// Remove auto-generated enclosures
rssXml = rssXml.replace(/\s*<enclosure[^>]+\/>\n?/g, '');

// Remove <atom:link> tag
rssXml = rssXml.replace(/\s*<atom:link[^>]+\/>\n?/g, '');

// Remove all <link> tags, then re-add channel <link>
rssXml = rssXml.replace(/\s*<link>[^<]*<\/link>\n?/g, '');
rssXml = rssXml.replace(
	/(<description>[^<]*<\/description>)/,
	'$1\n        <link>' + SITE_URL + '</link>'
);

// Inject managingEditor + webMaster after description + link
rssXml = rssXml.replace(
	/(<description>[^<]*<\/description>)/,
	'$1\n        <managingEditor>' + SITE_EMAIL + ' (Yuln)</managingEditor>\n        <webMaster>' + SITE_EMAIL + ' (Yuln)</webMaster>'
);

const buildDir = path.join(projectRoot, 'build');
fs.writeFileSync(path.join(buildDir, 'rss.xml'), rssXml, 'utf8');
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
