import { useMemo } from 'react';
import { siteConfig } from '../config';
import PaperPostList from '$lib/components/PaperPostList';
import { getDisplayPosts } from '$lib/utils/posts';

export default function PostsPage() {
	const posts = useMemo(() => getDisplayPosts(), []);

	return (
		<>
			<title>文章列表 - {siteConfig.title}</title>
			<meta name="description" content="浏览所有文章" />
			<main className="pm-main pm-list-main">
				<PaperPostList posts={posts} />
			</main>
		</>
	);
}
