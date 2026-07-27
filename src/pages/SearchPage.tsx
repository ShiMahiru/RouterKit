import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { siteConfig } from '@/config';
import { getDisplayPosts, createPostSearchText } from '@/utils/posts';

function normalize(v: string) { return v.trim().toLowerCase(); }

export default function SearchPage() {
	const posts = useMemo(() => getDisplayPosts(), []);
	// 预计算每篇文章的搜索文本，避免每次过滤时重复计算
	const indexedPosts = useMemo(
		() => posts.map(post => ({ post, searchText: createPostSearchText(post) })),
		[posts]
	);
	const [query, setQuery] = useState('');

	useEffect(() => {
	document.title = `搜索 - ${siteConfig.title}`;
	const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
	if (canonical) canonical.href = `${siteConfig.url}/search/`;
}, []);

	const term = normalize(query);

	const results = useMemo(() => {
		if (!term) return [];
		return indexedPosts
			.filter(({ searchText }) => searchText.includes(term))
			.map(({ post }) => post);
	}, [indexedPosts, term]);

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
							<Link
								className="pm-entry-link"
								to={`/posts/${post.slug}`}
								aria-label={`文章链接：${post.metadata.title}`}
							></Link>
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
