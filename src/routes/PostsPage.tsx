import { useEffect, useMemo } from 'react';
import { siteConfig } from '../config';
import PaperPostList from '$lib/components/PaperPostList';
import { getDisplayPosts } from '$lib/utils/posts';

export default function PostsPage() {
	const posts = useMemo(() => getDisplayPosts(), []);

	useEffect(() => {
		document.title = `文章列表 - ${siteConfig.title}`;
	}, []);

	return (
		<main className="pm-main pm-list-main">
			<PaperPostList posts={posts} />
		</main>
	);
}
