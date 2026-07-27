// Build-time RSS generation — auto-reads config from siteConfig
import { Feed } from 'feed';
import MarkdownIt from 'markdown-it';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { siteConfig } from '../src/config.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const SITE_URL = siteConfig.url;
const SITE_TITLE = siteConfig.title;
const SITE_DESC = siteConfig.description;
const SITE_LANG = 'zh-CN';

const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

// ---- Parse frontmatter ----
function parseFrontmatter(raw: string): { metadata: Record<string, unknown>; content: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { metadata: {}, content: raw };
	const body = raw.slice(match[0].length).trim();
	const meta: Record<string, unknown> = {};
	const lines = match[1].split('\n');
	let collectingKey: string | null = null;
	let collectingList: string[] = [];

	for (const line of lines) {
		if (collectingKey) {
			const listItem = line.match(/^\s+-\s+(.*)$/);
			if (listItem) {
				const item = listItem[1].trim().replace(/^["']|["']$/g, '');
				if (item) collectingList.push(item);
				continue;
			}
			meta[collectingKey] = collectingList;
			collectingKey = null;
			collectingList = [];
		}
		const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
		if (!kv) continue;
		const key = kv[1].trim();
		let val: unknown = kv[2].trim();
		if (val === 'true' || val === 'false') { meta[key] = val === 'true'; continue; }
		if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
			meta[key] = (val as string).slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
			continue;
		}
		if (val === '') { collectingKey = key; collectingList = []; continue; }
		if (typeof val === 'string' && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) val = (val as string).slice(1, -1);
		meta[key] = val;
	}
	if (collectingKey) meta[collectingKey] = collectingList;
	return { metadata: meta, content: body };
}

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

interface Post {
	slug: string;
	title: string;
	description: string;
	published: string;
	updated?: string;
	pinned: boolean;
	content: string;
	image: string;
	tags: string[];
}

const posts: Post[] = [];
for (const slug of postDirs) {
	const raw = fs.readFileSync(path.join(postsDir, slug, 'index.md'), 'utf8');
	const { metadata, content } = parseFrontmatter(raw);
	if (metadata.draft) continue;
	posts.push({
		slug,
		title: (metadata.title as string) || slug,
		description: (metadata.description as string) || '',
		published: (metadata.published as string) || new Date(0).toISOString(),
		updated: metadata.updated as string | undefined,
		pinned: (metadata.pinned as boolean) ?? false,
		content,
		image: (metadata.image as string) || '',
		tags: [...(metadata.tags as string[] || []), ...(metadata.categories as string[] || [])]
	});
}

posts.sort((a, b) => {
	if (a.pinned && !b.pinned) return -1;
	if (!a.pinned && b.pinned) return 1;
	return new Date(b.published).getTime() - new Date(a.published).getTime();
});

// ---- Generate RSS ----
const feed = new Feed({
	title: SITE_TITLE,
	description: SITE_DESC,
	id: SITE_URL,
	link: SITE_URL,
	language: SITE_LANG,
	favicon: siteConfig.icon,
	copyright: `All rights reserved ${new Date().getFullYear()}, Yuln`,
	feedLinks: { rss: `${SITE_URL}/rss.xml` },
	author: { name: 'Yuln', link: SITE_URL }
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
		date: new Date(post.published),
		categories: post.tags
	});
}

const buildDir = path.join(projectRoot, 'build');
fs.mkdirSync(buildDir, { recursive: true });
fs.writeFileSync(path.join(buildDir, 'rss.xml'), feed.rss2(), 'utf8');
console.log('[generate-rss] rss.xml generated');