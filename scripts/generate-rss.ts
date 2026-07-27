// Build-time static file generation: RSS, sitemap.xml, robots.txt
import { Feed } from 'feed';
import MarkdownIt from 'markdown-it';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { siteConfig } from '../src/config.ts';
import { parseFrontmatter, comparePostByPinnedAndDate } from '../src/utils/frontmatter.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const SITE_URL = siteConfig.url;
const SITE_TITLE = siteConfig.title;
const SITE_DESC = siteConfig.description;
const SITE_LANG = 'zh-CN';

const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

// ---- Strip invalid XML chars ----
function stripInvalidXmlChars(str: string): string {
	return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g, '');
}

// ---- Load posts ----
const postsDir = path.join(projectRoot, 'src/content/posts');
const postDirs = fs.readdirSync(postsDir).filter(name => {
	const d = path.join(postsDir, name);
	return fs.statSync(d).isDirectory() && fs.existsSync(path.join(d, 'index.md'));
});

// 扁平化的文章结构，与 src/types/post.ts 的 Post 保持字段对应
interface FlatPost {
	slug: string;
	title: string;
	description: string;
	published: string;
	pinned: boolean;
	content: string;
	image: string;
}

const posts: FlatPost[] = [];
for (const slug of postDirs) {
	const raw = fs.readFileSync(path.join(postsDir, slug, 'index.md'), 'utf8');
	const { metadata, content } = parseFrontmatter(raw);
	if (metadata.draft) continue;
	posts.push({
		slug,
		title: (metadata.title as string) || slug,
		description: (metadata.description as string) || '',
		published: (metadata.published as string) || new Date(0).toISOString(),
		pinned: (metadata.pinned as boolean) ?? false,
		content,
		image: (metadata.image as string) || ''
	});
}

posts.sort((a, b) => comparePostByPinnedAndDate(a, b));

// ---- Generate RSS ----
const feed = new Feed({
	title: SITE_TITLE,
	description: SITE_DESC,
	id: SITE_URL,
	link: SITE_URL,
	language: SITE_LANG,
	favicon: siteConfig.icon,
	copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.headerTitle}`,
	feedLinks: { rss: `${SITE_URL}/rss.xml` },
	author: { name: siteConfig.headerTitle, link: SITE_URL }
});

for (const post of posts) {
	const safeContent = stripInvalidXmlChars(post.content);
	let html = md.render(safeContent);
	html = html.replace(
		/(<img[^>]+src=")(?!\/|https?:\/\/)([^"]+)(")/g,
		(_, b, s, a) => `${b}${SITE_URL}/posts/${post.slug}/${s}${a}`
	);

	feed.addItem({
	title: post.title,
	id: `${SITE_URL}/posts/${post.slug}/`,
	link: `${SITE_URL}/posts/${post.slug}/`,
	description: post.description || post.title,
	content: html,
	date: new Date(post.published || 0)
});
}

const buildDir = path.join(projectRoot, 'build');
fs.mkdirSync(buildDir, { recursive: true });
fs.writeFileSync(path.join(buildDir, 'rss.xml'), feed.rss2(), 'utf8');
console.log('[generate-static] rss.xml generated');

// ---- Generate sitemap.xml ----
const staticPages = [
	{ loc: SITE_URL, priority: '1.0', changefreq: 'daily' },
	{ loc: `${SITE_URL}/posts`, priority: '0.9', changefreq: 'daily' },
	{ loc: `${SITE_URL}/archives`, priority: '0.8', changefreq: 'weekly' },
	{ loc: `${SITE_URL}/search`, priority: '0.5', changefreq: 'monthly' }
];

const sitemapEntries = [
	...staticPages,
	...posts.map(post => ({
		loc: `${SITE_URL}/posts/${post.slug}/`,
		lastmod: post.published,
		priority: '0.7',
		changefreq: 'weekly' as const
	}))
];

function escapeXml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(e => {
	const parts = [
		`\t<loc>${escapeXml(e.loc)}</loc>`,
	];
	if ('lastmod' in e && e.lastmod) {
		parts.push(`\t<lastmod>${escapeXml(e.lastmod)}</lastmod>`);
	}
	parts.push(
		`\t<changefreq>${escapeXml(e.changefreq)}</changefreq>`,
		`\t<priority>${escapeXml(e.priority)}</priority>`,
	);
	return `\t<url>\n${parts.join('\n')}\n\t</url>`;
}).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), sitemap, 'utf8');
console.log('[generate-static] sitemap.xml generated');

// ---- Generate robots.txt ----
const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;

fs.writeFileSync(path.join(buildDir, 'robots.txt'), robots, 'utf8');
console.log('[generate-static] robots.txt generated');