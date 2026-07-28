

import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import markdownItFootnote from 'markdown-it-footnote';
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
import diff from 'highlight.js/lib/languages/diff';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('jsx', javascript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);

hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('diff', diff);

function cleanLang(rawLang: string): string {
	if (!rawLang) return rawLang;
	const m = rawLang.match(/^[\w.#-]+/);
	return m ? m[0] : rawLang;
}
import type { PostMetadata, LoadedPost } from '../src/types/post.ts';
import { parseFrontmatter, comparePostByPinnedAndDate } from '../src/utils/frontmatter.ts';

const POSTS_DIR = path.resolve('src/content/posts');

let _postsCache: LoadedPost[] | null = null;

export function createMarkdownRenderer() {
	return new MarkdownIt({
		html: true,
		linkify: true,
		breaks: true,
		highlight: (str: string, lang: string) => {
			const l = cleanLang(lang);
			if (l && hljs.getLanguage(l)) {
				try { return hljs.highlight(str, { language: l }).value; } catch {}
			}
			try { return hljs.highlightAuto(str).value; } catch {}
			return '';
		},
	}).use(markdownItFootnote);
}

function toPostMetadata(raw: Record<string, unknown>): PostMetadata {
	return {
		title: (raw.title as string) || '',
		published: (raw.published as string) || '',
		description: (typeof raw.description === 'string' ? raw.description : '') || '',
		image: (typeof raw.image === 'string' ? raw.image : '') || '',
		pinned: raw.pinned === true,
		toc: typeof raw.toc === 'boolean' ? raw.toc : undefined,
	};
}

export function loadAllPosts(): LoadedPost[] {
	if (_postsCache) return _postsCache;

	if (!fs.existsSync(POSTS_DIR)) return [];

	const files = fs.readdirSync(POSTS_DIR).filter(name => {
		const f = path.join(POSTS_DIR, name);
		return name.endsWith('.md') && fs.statSync(f).isFile();
	});

	const posts: LoadedPost[] = [];

	for (const file of files) {
		const slug = file.replace(/\.md$/, '');
		const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
		const { metadata: rawMeta, content } = parseFrontmatter(raw);
		if (rawMeta.draft) continue;

		const metadata = toPostMetadata(rawMeta);

		posts.push({ slug, metadata, content });
	}

	posts.sort((a, b) => comparePostByPinnedAndDate(a.metadata, b.metadata));
	_postsCache = posts;
	return posts;
}

export function loadPostBySlug(slug: string): LoadedPost | undefined {
	const filePath = path.join(POSTS_DIR, `${slug}.md`);
	if (!fs.existsSync(filePath)) return undefined;

	const raw = fs.readFileSync(filePath, 'utf8');
	const { metadata: rawMeta, content } = parseFrontmatter(raw);
	if (rawMeta.draft) return undefined;

	const metadata = toPostMetadata(rawMeta);
	return { slug, metadata, content };
}

export function renderPostHtml(content: string, slug: string, md?: MarkdownIt): string {
	const renderer = md || createMarkdownRenderer();
	let html = renderer.render(preprocessMarkdown(content));

	html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/g, '');

	html = html.replace(
		/(<img\s[^>]*?\bsrc=)("|')(?!\/|https?:\/\/)([^"']+)\2/gi,
		(_m: string, before: string, quote: string, src: string) =>
			`${before}${quote}/posts/${src}${quote}`
	);

	// Add loading="lazy" to images that don't already have a loading attribute
	html = html.replace(
		/<img\s(?!.*?\bloading\b)([^>]*?)>/gi,
		'<img loading="lazy" $1>'
	);

	html = enhanceCodeBlocks(html);

	return html;
}

const COPY_SVG = `<svg class="copy-icon" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M368.37-237.37q-34.48 0-58.74-24.26-24.26-24.26-24.26-58.74v-474.26q0-34.48 24.26-58.74 24.26-24.26 58.74-24.26h378.26q34.48 0 58.74 24.26 24.26 24.26 24.26 58.74v474.26q0 34.48-24.26 58.74-24.26 24.26-58.74 24.26H368.37Zm0-83h378.26v-474.26H368.37v474.26Zm-155 238q-34.48 0-58.74-24.26-24.26-24.26-24.26-58.74v-515.76q0-17.45 11.96-29.48 11.97-12.02 29.33-12.02t29.54 12.02q12.17 12.03 12.17 29.48v515.76h419.76q17.45 0 29.48 11.96 12.02 11.97 12.02 29.33t-12.02 29.54q-12.03 12.17-29.48 12.17H213.37Zm155-238v-474.26 474.26Z"/></svg>`;
const SUCCESS_SVG = `<svg class="success-icon" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="m389-377.13 294.7-294.7q12.58-12.67 29.52-12.67 16.93 0 29.61 12.67 12.67 12.68 12.67 29.53 0 16.86-12.28 29.14L419.07-288.41q-12.59 12.67-29.52 12.67-16.94 0-29.62-12.67L217.41-430.93q-12.67-12.68-12.79-29.45-.12-16.77 12.55-29.45 12.68-12.67 29.62-12.67 16.93 0 29.28 12.67L389-377.13Z"/></svg>`;

function enhanceCodeBlocks(html: string): string {
return html.replace(
	/<pre><code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g,
	(_full: string, cls: string | undefined, codeText: string) => {
		const classAttr = cls ? ` class="${cls}"` : '';
		const lang = cls ? cls.replace(/^language-/, '') : '';
		const dataLang = lang ? ` data-language="${lang}"` : '';
		const lines = codeText
			.replace(/\n$/, '')
			.split('\n')
			.map((line, i) =>
				`<div class="ec-line"><div class="gutter"><div class="ln" aria-hidden="true">${i + 1}</div></div><div class="code">${line || ' '}</div></div>`
			)
			.join('');
		return `<div class="expressive-code"><figure class="frame"><pre class="pm-code-block"${dataLang}>`
			+ `<button class="pm-code-copy" title="复制" aria-label="复制代码">${COPY_SVG}${SUCCESS_SVG}</button>`
			+ `<code${classAttr}>${lines}</code></pre></figure></div>`;
	}
);
}

function preprocessMarkdown(content: string): string {
content = content.replace(
	/^::github\{repo="([^"]+)"\}$/gm,
	(_, repo: string) =>
		`<a href="https://github.com/${repo}" class="pm-github-card" target="_blank" rel="noopener">${repo}</a>`
);

content = content.replace(
	/:spoiler\[([^\]]*)\]/g,
	'<span class="pm-spoiler" tabindex="0">$1</span>'
);

const adTypes = ['note', 'tip', 'important', 'warning', 'caution'] as const;
for (const type of adTypes) {
	content = content.replace(
		new RegExp(`^:::${type}\\[([^\\]]*)\\]\\s*$`, 'gm'),
		`<div class="pm-admonition ${type}"><p class="pm-admonition-title">$1</p>`
	);
	content = content.replace(
		new RegExp(`^:::${type}\\s*$`, 'gm'),
		`<div class="pm-admonition ${type}"><p class="pm-admonition-title">${type.toUpperCase()}</p>`
	);
}
content = content.replace(/^:::\s*$/gm, '</div>');

content = convertPandocTables(content);

return content;
}

function convertPandocTables(content: string): string {
const lines = content.split('\n');
const out: string[] = [];
let i = 0;

while (i < lines.length) {
	const cur = lines[i].trim();
	if (!cur || cur.includes(':') || cur.startsWith('#')) {
		out.push(lines[i]); i++; continue;
	}

	const words = cur.split(/\s+/);
	if (words.length < 2) { out.push(lines[i]); i++; continue; }

	// Find separator skipping blank lines
	let s = i + 1;
	while (s < lines.length && !lines[s].trim()) s++;
	if (s >= lines.length || !/^-{2,}\s*$/.test(lines[s].trim())) {
		out.push(lines[i]); i++; continue;
	}

	const colCount = words.length;
	const body: string[] = [];
	let j = s + 1;
	while (j < lines.length) {
		const t = lines[j].trim();
		if (!t || /^Table:/.test(t)) { j++; continue; }
		if (/^-{2,}\s*$/.test(t)) break;
		if (t.split(/\s+/).length >= colCount) { body.push(lines[j]); j++; continue; }
		break;
	}
	if (body.length === 0) { out.push(lines[i]); i++; continue; }

	while (j < lines.length && (!lines[j].trim() || /^Table:/.test(lines[j].trim()))) j++;

	const toRow = (l: string) => {
		const w = l.trim().split(/\s+/);
		const cells = w.slice(0, colCount - 1);
		cells.push(w.slice(colCount - 1).join(' '));
		return '| ' + cells.join(' | ') + ' |';
	};
	out.push(toRow(lines[i]), '|' + Array(colCount).fill('---').join('|') + '|');
	body.forEach(b => out.push(toRow(b)));
	out.push('');
	i = j;
}
return out.join('\n');
}
