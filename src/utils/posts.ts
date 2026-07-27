import type { Post, PostMetadata } from '@/types/post';
import { resolvePostAssetPath } from '@/utils/markdown';
import { parseFrontmatter, comparePostByPinnedAndDate } from '@/utils/frontmatter';

// Load raw markdown files
const rawModules = import.meta.glob('/src/content/posts/*/index.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

function getSlugFromPostPath(path: string): string {
	const parts = path.split('/');
	return parts[parts.length - 2] ?? '';
}

function normalizePostMetadata(slug: string, metadata: Partial<PostMetadata>): PostMetadata {
	return {
		title: metadata.title || slug,
		image: metadata.image || '',
		published: metadata.published || new Date(0).toISOString(),
		pinned: metadata.pinned ?? false,
		description: metadata.description || '',
		draft: metadata.draft,
		toc: metadata.toc
	};
}

function markdownToPlainText(value: string): string {
	return value
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/[#>*_~|[\]()-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function countPostWords(post: Post): number {
	const text = markdownToPlainText(
		`${post.metadata.title} ${post.metadata.description} ${post.content}`
	);
	const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
	const englishWords = text.match(/[a-zA-Z]+/g) || [];
	return chineseChars.length + englishWords.length;
}

export function createPostSearchText(post: Post): string {
	return markdownToPlainText(
		[
			post.metadata.title,
			post.metadata.description,
			post.slug,
			post.content
		].join(' ')
	).toLowerCase();
}

let _allPostsCache: Post[] | null = null;

/**
 * 获取所有文章（模块级缓存，避免重复解析）
 */
function getAllPosts(): Post[] {
	if (_allPostsCache) return _allPostsCache;

	const posts: Post[] = [];

	for (const [path, raw] of Object.entries(rawModules)) {
		const slug = getSlugFromPostPath(path);
		const rawStr = raw as string;
		const { metadata: rawMeta, content } = parseFrontmatter(rawStr);
		const metadata = normalizePostMetadata(slug, rawMeta);
		if (metadata.draft) continue;

		posts.push({
			slug,
			metadata,
			content
		});
	}

	// 按发布日期排序，置顶文章优先
	_allPostsCache = posts.sort((a, b) => comparePostByPinnedAndDate(a.metadata, b.metadata));
	return _allPostsCache;
}

export function getDisplayPosts(): Post[] {
	return getAllPosts().map((post) => ({
		...post,
		metadata: {
			...post.metadata,
			image: resolvePostAssetPath(post.slug, post.metadata.image)
		}
	}));
}

/**
 * 根据 slug 获取单篇文章
 */
export function getPostBySlug(slug: string): Post | undefined {
	return getAllPosts().find((post) => post.slug === slug);
}
