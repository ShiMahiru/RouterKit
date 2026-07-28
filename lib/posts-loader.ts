

import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import sql from 'highlight.js/lib/languages/sql';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('sql', sql);
import type { PostMetadata, LoadedPost } from '../src/types/post.ts';
import { parseFrontmatter, comparePostByPinnedAndDate } from '../src/utils/frontmatter.ts';

const POSTS_DIR = path.resolve('src/content/posts');

export function createMarkdownRenderer() {
	return new MarkdownIt({
		html: true,
		linkify: true,
		breaks: true,
		highlight: (str: string, lang: string) => {
			if (lang === 'mermaid') return '';
			if (lang && hljs.getLanguage(lang)) {
				try { return hljs.highlight(str, { language: lang }).value; } catch {}
			}
			try { return hljs.highlightAuto(str).value; } catch {}
			return '';
		},
	});
}

function validatePostMetadata(raw: Record<string, unknown>, slug: string): PostMetadata {
	const errors: string[] = [];

	const title = raw.title;
	if (!title || typeof title !== 'string' || !title.trim()) {
		errors.push('title is required and must be a non-empty string');
	}

	const published = raw.published;
	if (!published || typeof published !== 'string') {
		errors.push('published is required and must be a string');
	} else if (isNaN(new Date(published).getTime())) {
		errors.push(`published "${published}" is not a valid date`);
	}

	if (errors.length > 0) {
		throw new Error(`[${slug}] invalid frontmatter:\n${errors.map(e => `  - ${e}`).join('\n')}`);
	}

	return {
		title: title as string,
		published: published as string,
		description: (typeof raw.description === 'string' ? raw.description : '') || '',
		image: (typeof raw.image === 'string' ? raw.image : '') || '',
		pinned: raw.pinned === true,
		toc: typeof raw.toc === 'boolean' ? raw.toc : undefined,
	};
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

		const metadata = validatePostMetadata(rawMeta, slug);

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
		/<picture>[\s\S]*?<\/picture>|<img\s[^>]*\bsrc=("|')([^"']*\.(png|jpg|jpeg))\1[^>]*>/gi,
		(fullMatch: string, _q?: string, src?: string) => {
			if (fullMatch.startsWith('<picture>')) return fullMatch;
			const webpSrc = src!.replace(/\.(png|jpg|jpeg)$/i, '.webp');
			return `<picture><source srcset="${webpSrc}" type="image/webp">${fullMatch}</picture>`;
		}
	);
	return html;
}
