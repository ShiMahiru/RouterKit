import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { siteConfig } from '@/config';
import PaperPostList from '@/components/common/PaperPostList';
import { getDisplayPosts } from '@/utils/posts';

export default function PostsPage() {
	const posts = useMemo(() => getDisplayPosts(), []);
	const { pathname } = useLocation();
	const isHome = pathname === '/';

	const pageTitle = isHome ? siteConfig.title : `文章列表 - ${siteConfig.title}`;
	const pageUrl = isHome ? siteConfig.url : `${siteConfig.url}/posts/`;

	return (
		<>
			<Helmet>
				<title>{pageTitle}</title>
				<link rel="canonical" href={pageUrl} />
			</Helmet>
			<main className="pm-main pm-list-main">
				<PaperPostList posts={posts} />
			</main>
		</>
	);
}