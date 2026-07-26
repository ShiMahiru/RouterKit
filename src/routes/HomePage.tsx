import { useEffect, useMemo } from 'react';
import { siteConfig } from '../config';
import PaperPostList from '$lib/components/PaperPostList';
import { getDisplayPosts } from '$lib/utils/posts';

export default function HomePage() {
	const posts = useMemo(() => getDisplayPosts(), []);

	useEffect(() => {
		document.title = siteConfig.title;
	}, []);

	return (
		<main id="top" className="pm-main pm-list-main">
			<PaperPostList posts={posts} />
		</main>
	);
}
