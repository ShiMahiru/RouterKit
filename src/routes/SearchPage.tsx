import { useEffect, useMemo, useState } from 'react';
import { siteConfig } from '../config';
import { getDisplayPosts, createPostSearchText } from '$lib/utils/posts';

export default function SearchPage() {
	const posts = useMemo(() => getDisplayPosts(), []);
	const [query, setQuery] = useState('');
	const [expanded, setExpanded] = useState<string | null>(null);

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

	function toggle(slug: string) {
		setExpanded(prev => prev === slug ? null : slug);
	}

	return (
		<main className="pm-main">
			<header className="pm-page-header">
				<h1>搜索</h1>
			</header>
			<div className="pm-searchbox">
				<input
					value={query}
					onChange={(e) => { setQuery(e.target.value); setExpanded(null); }}
					type="search"
					placeholder="输入关键词搜索文章..."
					aria-label="搜索文章"
				/>
			</div>
			<ul className="pm-search-results" aria-live="polite">
				{query.trim() && results.length === 0 ? (
					<li className="pm-search-empty">未找到匹配的文章</li>
				) : (
					results.map(post => {
						const isOpen = expanded === post.slug;
						return (
							<li key={post.slug}>
								<button
									className={`pm-search-item${isOpen ? ' open' : ''}`}
									onClick={() => toggle(post.slug)}
									aria-expanded={isOpen}
								>
									<span className="pm-search-title">{post.metadata.title}</span>
									<span className="pm-search-arrow">{isOpen ? '▾' : '▸'}</span>
								</button>
								{isOpen && (
									<div className="pm-search-detail">
										{post.metadata.description && (
											<p>{post.metadata.description}</p>
										)}
										<a href={`/posts/${post.slug}`} className="pm-search-link">
											阅读全文 →
										</a>
									</div>
								)}
							</li>
						);
					})
				)}
			</ul>
		</main>
	);
}
