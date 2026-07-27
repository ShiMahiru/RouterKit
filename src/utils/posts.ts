import type { Post, PostMetadata, PrecompiledPost } from '@/types/post';
import { resolvePostAssetPath } from '@/utils/markdown';

// 从虚拟模块导入预编译的文章数据（HTML 已在构建时渲染）
import { posts as precompiledPosts } from 'virtual:posts-data';

function normalizeMetadata(metadata: PrecompiledPost['metadata']): PostMetadata {
	return {
		title: metadata.title,
		image: metadata.image,
		published: metadata.published,
		pinned: metadata.pinned,
		description: metadata.description,
		draft: metadata.draft,
		toc: metadata.toc
	};
}

/** 获取所有文章（带缓存，模块级单例） */
let _allPostsCache: Post[] | null = null;

function getAllPosts(): Post[] {
	if (_allPostsCache) return _allPostsCache;
	_allPostsCache = (precompiledPosts as PrecompiledPost[]).map(p => ({
		slug: p.slug,
		metadata: normalizeMetadata(p.metadata),
		html: p.html,
		rawContent: p.rawContent
	}));
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

export function getPostBySlug(slug: string): Post | undefined {
	return getAllPosts().find((post) => post.slug === slug);
}

// ---- 搜索相关 ----

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
		`${post.metadata.title} ${post.metadata.description} ${post.rawContent}`
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
			post.rawContent
		].join(' ')
	).toLowerCase();
}