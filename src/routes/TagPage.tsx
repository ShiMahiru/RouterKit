import { useEffect, useMemo } from 'react';
import { useParams, Navigate } from 'react-router';
import { siteConfig } from '../config';
import PaperPostList from '$lib/components/PaperPostList';
import { getDisplayPosts, getPostsByTag } from '$lib/utils/posts';

export default function TagPage() {
	const { tag } = useParams<{ tag: string }>();
	const decodedTag = decodeURIComponent(tag || '');

	const allPosts = useMemo(() => getDisplayPosts(), []);
	const posts = useMemo(() => getPostsByTag(decodedTag, allPosts), [decodedTag, allPosts]);

	useEffect(() => {
		if (posts.length > 0) {
			document.title = `${decodedTag} - ${siteConfig.title}`;
		}
	}, [decodedTag, posts.length]);

	if (posts.length === 0) return <Navigate to="/tags" replace />;

	return (
		<main className="pm-main pm-list-main">
			<header className="pm-page-header">
				<h1>{decodedTag}</h1>
			</header>
			<PaperPostList posts={posts} />
		</main>
	);
}
