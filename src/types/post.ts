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

/** 从文件系统加载的文章原始数据（markdown 正文，不含 frontmatter） */
export interface LoadedPost {
	slug: string;
	metadata: PostMetadata;
	content: string;
}