export interface PostMetadata {
	title: string;
	image: string;
	published: string;
	pinned: boolean;
	description: string;
	draft?: boolean;
	toc?: boolean;
}

export interface Post {
	slug: string;
	metadata: PostMetadata;
	html: string;
	rawContent: string;
}

/** 虚拟模块 virtual:posts-data 导出的预编译文章结构 */
export interface PrecompiledPost {
	slug: string;
	metadata: PostMetadata;
	html: string;
	rawContent: string;
}