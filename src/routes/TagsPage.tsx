import { useEffect, useMemo } from 'react';
import { siteConfig } from '../config';
import { getAllTags, getDisplayPosts } from '$lib/utils/posts';

export default function TagsPage() {
	const posts = useMemo(() => getDisplayPosts(), []);
	const tags = useMemo(() => getAllTags(posts), [posts]);

	useEffect(() => {
		document.title = `标签 - ${siteConfig.title}`;
	}, []);

	return (
		<main className="pm-main">
			<header className="pm-page-header">
				<h1>标签</h1>
			</header>
			{tags.length === 0 ? (
				<div className="pm-empty">暂无标签</div>
			) : (
				<ul className="pm-terms-tags">
					{tags.map(tag => (
						<li key={tag.name}>
							<a href={`/tags/${encodeURIComponent(tag.name)}`}>
								{tag.name} <sup>{tag.count}</sup>
							</a>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
