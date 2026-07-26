import { useMemo } from 'react';
import { siteConfig } from '../config';
import PaperPostList from '$lib/components/PaperPostList';
import { getDisplayPosts } from '$lib/utils/posts';

export default function HomePage() {
	const posts = useMemo(() => getDisplayPosts(), []);

	return (
		<>
			<title>{siteConfig.title}</title>
			<main id="top" className="pm-main pm-list-main">
				<PaperPostList posts={posts} />
			</main>
		</>
	);
}
