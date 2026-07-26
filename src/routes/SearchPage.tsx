import { useEffect, useMemo, useState } from 'react';
import { siteConfig } from '../config';
import { getDisplayPosts, createPostSearchText } from '$lib/utils/posts';

export default function SearchPage() {
	const posts = useMemo(() => getDisplayPosts(), []);
	const [query, setQuery] = useState('');

	useEffect(() => {
		document.title = `搜索 - ${siteConfig.title}`;
	}, []);

	const normalize = (v: string) => v.trim().toLowerCase();
	const term = normalize(query);

	const results = useMemo(() => {
		if (!term) return [];
		return posts.filter(post => {
			const haystack = createPostSearchText(post);
			return haystack.includes(term);
		});
	}, [posts, term]);

	return (
		<main className="pm-main">
			<header className="pm-page-header">
				<h1>搜索</h1>
			</header>
			<div className="pm-searchbox">
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					type="search"
					placeholder="搜索文章"
					aria-label="搜索文章"
				/>
			</div>
			<ul className="pm-search-results" aria-live="polite">
				{query.trim() && results.length === 0 ? (
					<li className="pm-search-empty">未找到匹配的文章</li>
				) : (
					results.map(post => (
						<li key={post.slug}>
							<a
								className="pm-entry-link"
								href={`/posts/${post.slug}`}
								aria-label={`文章链接：${post.metadata.title}`}
							></a>
							<div>
								<h2>{post.metadata.title}</h2>
								<p>{post.metadata.description}</p>
							</div>
							<span>»</span>
						</li>
					))
				)}
			</ul>
		</main>
	);
}
