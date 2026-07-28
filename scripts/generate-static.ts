// Build-time static file generation: RSS, sitemap.xml, robots.txt, llms.txt, _headers
import { Feed } from 'feed';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { siteConfig } from '../src/config.ts';
import {
	loadAllPosts,
	createMarkdownRenderer,
	renderPostHtml,
} from '../lib/posts-loader.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const SITE_URL = siteConfig.url;
const SITE_TITLE = siteConfig.title;
const SITE_DESC = siteConfig.description;
const SITE_LANG = 'zh-CN';

// ---- Strip invalid XML chars ----
function stripInvalidXmlChars(str: string): string {
	return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g, '');
}

// ---- Load posts via shared module ----
const posts = loadAllPosts();
const md = createMarkdownRenderer();

const buildDir = path.join(projectRoot, 'build', 'client');
fs.mkdirSync(buildDir, { recursive: true });

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
	let html = renderPostHtml(safeContent, post.slug, md);
	// RSS 中的图片需要完整 URL
	html = html.replace(
		/(<img\s[^>]*?\bsrc=)("|')(?!\/|https?:\/\/)([^"']+)\2/gi,
		(_, b, q, s) => `${b}${q}${SITE_URL}/posts/${post.slug}/${s}${q}`
	);

	feed.addItem({
		title: post.metadata.title,
		id: `${SITE_URL}/posts/${post.slug}/`,
		link: `${SITE_URL}/posts/${post.slug}/`,
		description: post.metadata.description || post.metadata.title,
		content: html,
		date: new Date(post.metadata.published || 0)
	});
}

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
		lastmod: post.metadata.published,
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
		parts.push(`\t<lastmod>${escapeXml(e.lastmod as string)}</lastmod>`);
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

// ---- Generate llms.txt ----
const llmsLines = [
	`# ${SITE_TITLE}`,
	`> ${SITE_DESC}`,
	'',
	`- [首页](${SITE_URL})`,
	`- [文章列表](${SITE_URL}/posts/)`,
	`- [归档](${SITE_URL}/archives/)`,
	'',
	'## 文章',
	'',
	...posts.map(post => {
		const date = post.metadata.published ? new Date(post.metadata.published).toISOString().slice(0, 10) : '';
		return `- [${post.metadata.title}](${SITE_URL}/posts/${post.slug}/) (${date})`;
	}),
	'',
	'## 关于',
	`本博客由 ${siteConfig.headerTitle} 维护，使用 React Router + Vite 构建。`,
	`RSS: ${SITE_URL}/rss.xml`,
	`Sitemap: ${SITE_URL}/sitemap.xml`,
	''
];

fs.writeFileSync(path.join(buildDir, 'llms.txt'), llmsLines.join('\n'), 'utf8');
console.log('[generate-static] llms.txt generated');