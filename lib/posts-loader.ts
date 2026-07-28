

import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import type { PostMetadata, LoadedPost } from '../src/types/post.ts';
import { parseFrontmatter, comparePostByPinnedAndDate } from '../src/utils/frontmatter.ts';

const POSTS_DIR = path.resolve('src/content/posts');

export function createMarkdownRenderer() {
	return new MarkdownIt({ html: true, linkify: true, breaks: true });
}

export function loadAllPosts(): LoadedPost[] {
	if (!fs.existsSync(POSTS_DIR)) return [];

	const dirs = fs.readdirSync(POSTS_DIR).filter(name => {
		const d = path.join(POSTS_DIR, name);
		return fs.statSync(d).isDirectory() && fs.existsSync(path.join(d, 'index.md'));
	});

	const posts: LoadedPost[] = [];

	for (const slug of dirs) {
		const raw = fs.readFileSync(path.join(POSTS_DIR, slug, 'index.md'), 'utf8');
		const { metadata: rawMeta, content } = parseFrontmatter(raw);
		if (rawMeta.draft) continue;

		const metadata: PostMetadata = {
			title: (rawMeta.title as string) || slug,
			image: (rawMeta.image as string) || '',
			published: (rawMeta.published as string) || new Date(0).toISOString(),
			pinned: (rawMeta.pinned as boolean) ?? false,
			description: (rawMeta.description as string) || '',
			toc: rawMeta.toc as boolean | undefined,
		};

		posts.push({ slug, metadata, content });
	}

	posts.sort((a, b) => comparePostByPinnedAndDate(a.metadata, b.metadata));
	return posts;
}

export function renderPostHtml(content: string, slug: string, md?: MarkdownIt): string {
	const renderer = md || createMarkdownRenderer();
	let html = renderer.render(content);

	html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/g, '');

	html = html.replace(
		/(<img\s[^>]*?\bsrc=)("|')(?!\/|https?:\/\/)([^"']+)\2/gi,
		(_m: string, before: string, quote: string, src: string) =>
			`${before}${quote}/posts/${slug}/${src}${quote}`
	);

	html = html.replace(
		/<img\s[^>]*\bsrc=("|')([^"']*\.(png|jpg|jpeg))\1[^>]*>/gi,
		(fullMatch: string, _q: string, src: string) => {
			const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
			return `<picture><source srcset="${webpSrc}" type="image/webp">${fullMatch}</picture>`;
		}
	);
	return html;
}
