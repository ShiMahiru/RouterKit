import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import { siteConfig } from '@/config';
import PaperPostList from '@/components/PaperPostList';
import { getDisplayPosts } from '@/utils/posts';

export default function PostsPage() {
	const posts = useMemo(() => getDisplayPosts(), []);
	const { pathname } = useLocation();
	const isHome = pathname === '/';

	useEffect(() => {
		document.title = isHome ? siteConfig.title : `文章列表 - ${siteConfig.title}`;
	}, [isHome]);

	return (
		<main className="pm-main pm-list-main">
			<PaperPostList posts={posts} />
		</main>
	);
}
