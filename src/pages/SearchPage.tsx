import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';
import MiniSearch from 'minisearch';
import { siteConfig } from '@/config';
import { getDisplayPosts } from '@/utils/posts';

export default function SearchPage() {
	const posts = useMemo(() => getDisplayPosts(), []);

	const miniSearch = useMemo(() => {
		const ms = new MiniSearch({
			fields: ['title', 'description', 'content'],
			storeFields: ['title', 'description', 'slug', 'published'],
			searchOptions: {
				boost: { title: 3, description: 1.5 },
				prefix: true,
				fuzzy: 0.2
			}
		});
		ms.addAll(posts.map(p => ({
			id: p.slug,
			title: p.metadata.title,
			description: p.metadata.description,
			content: p.rawContent,
			slug: p.slug,
			published: p.metadata.published
		})));
		return ms;
	}, [posts]);

	const [query, setQuery] = useState('');

	const results = useMemo(() => {
		const q = query.trim();
		if (!q) return [];
		return miniSearch.search(q).map(r => ({
			slug: r.slug,
			title: r.title,
			description: r.description,
			published: r.published
		}));
	}, [miniSearch, query]);

	return (
		<>
			<Helmet>
				<title>{`搜索 - ${siteConfig.title}`}</title>
				<link rel="canonical" href={`${siteConfig.url}/search/`} />
			</Helmet>
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
						results.map(r => (
							<li key={r.slug}>
								<Link
									className="pm-entry-link"
									to={`/posts/${r.slug}?highlight=${encodeURIComponent(query)}`}
									aria-label={`文章链接：${r.title}`}
								></Link>
								<div>
									<h2>{r.title}</h2>
									<p>{r.description}</p>
								</div>
								<span>»</span>
							</li>
						))
					)}
				</ul>
			</main>
		</>
	);
}