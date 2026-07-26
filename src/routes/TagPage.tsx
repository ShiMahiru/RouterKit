import { useMemo } from 'react';
import { useParams, Navigate } from 'react-router';
import { siteConfig } from '../config';
import PaperPostList from '$lib/components/PaperPostList';
import { getDisplayPosts, getPostsByTag } from '$lib/utils/posts';

export default function TagPage() {
	const { tag } = useParams<{ tag: string }>();
	const decodedTag = decodeURIComponent(tag || '');

	const allPosts = useMemo(() => getDisplayPosts(), []);
	const posts = useMemo(() => getPostsByTag(decodedTag, allPosts), [decodedTag, allPosts]);

	if (posts.length === 0) return <Navigate to="/tags" replace />;

	return (
		<>
			<title>{decodedTag} - {siteConfig.title}</title>
			<meta name="description" content={`标签：${decodedTag}`} />
			<main className="pm-main pm-list-main">
				<header className="pm-page-header">
					<h1>{decodedTag}</h1>
				</header>
				<PaperPostList posts={posts} />
			</main>
		</>
	);
}
