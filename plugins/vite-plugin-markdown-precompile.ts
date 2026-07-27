/**
 * Vite 插件：在构建时将 markdown 预编译为 HTML。
 * 生成虚拟模块 virtual:posts-data，导出所有文章的预编译数据。
 */
import type { Plugin, ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import { parseFrontmatter, comparePostByPinnedAndDate } from '../src/utils/frontmatter';

const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

const POSTS_DIR = path.resolve('src/content/posts');
const VIRTUAL_ID = 'virtual:posts-data';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

interface PrecompiledPost {
	slug: string;
	metadata: {
		title: string;
		image: string;
		published: string;
		pinned: boolean;
		description: string;
		draft?: boolean;
		toc?: boolean;
	};
	html: string;
	rawContent: string;
}

function loadAllPosts(): PrecompiledPost[] {
	if (!fs.existsSync(POSTS_DIR)) return [];

	const dirs = fs.readdirSync(POSTS_DIR).filter(name => {
		const d = path.join(POSTS_DIR, name);
		return fs.statSync(d).isDirectory() && fs.existsSync(path.join(d, 'index.md'));
	});

	const posts: PrecompiledPost[] = [];

	for (const slug of dirs) {
		const raw = fs.readFileSync(path.join(POSTS_DIR, slug, 'index.md'), 'utf8');
		const { metadata: rawMeta, content } = parseFrontmatter(raw);
		if (rawMeta.draft) continue;

		const metadata = {
			title: (rawMeta.title as string) || slug,
			image: (rawMeta.image as string) || '',
			published: (rawMeta.published as string) || new Date(0).toISOString(),
			pinned: (rawMeta.pinned as boolean) ?? false,
			description: (rawMeta.description as string) || '',
			draft: undefined as boolean | undefined,
			toc: rawMeta.toc as boolean | undefined
		};

		// 渲染 markdown → HTML
		let html = md.render(content);
		// 去掉第一个 h1（文章标题在组件中另外渲染）
		html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '');
		// 替换相对图片路径为绝对路径
		html = html.replace(
			/(<img[^>]+src=")(?!\/|https?:\/\/)([^"]+)(")/g,
			(_m: string, before: string, src: string, after: string) =>
				`${before}/posts/${slug}/${src}${after}`
		);

		posts.push({
			slug,
			metadata,
			html,
			rawContent: content
		});
	}

	// 排序：置顶优先，然后按发布日期降序
	posts.sort((a, b) => comparePostByPinnedAndDate(a.metadata, b.metadata));
	return posts;
}

function generateModuleCode(posts: PrecompiledPost[]): string {
	const serialized = JSON.stringify(posts);
	return `export const posts = ${serialized};`;
}

export function markdownPrecompilePlugin(): Plugin {
	let server: ViteDevServer | undefined;

	return {
		name: 'vite-plugin-markdown-precompile',
		enforce: 'pre',

		resolveId(id: string) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
		},

		load(id: string) {
			if (id === RESOLVED_ID) {
				const posts = loadAllPosts();
				return generateModuleCode(posts);
			}
		},

		// HMR: 监听 markdown 文件变化，触发虚拟模块更新
		configureServer(s) {
			server = s;
			const watcher = s.watcher;

			const reloadVirtual = () => {
				const mod = server?.moduleGraph.getModuleById(RESOLVED_ID);
				if (mod) {
					server?.moduleGraph.invalidateModule(mod);
					server?.ws.send({ type: 'full-reload' });
				}
			};

			watcher.add(POSTS_DIR);
			watcher.on('add', (file: string) => {
				if (file.includes('content/posts') && file.endsWith('.md')) reloadVirtual();
			});
			watcher.on('change', (file: string) => {
				if (file.includes('content/posts') && file.endsWith('.md')) reloadVirtual();
			});
			watcher.on('unlink', (file: string) => {
				if (file.includes('content/posts') && file.endsWith('.md')) reloadVirtual();
			});
		}
	};
}
