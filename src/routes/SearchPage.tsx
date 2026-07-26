import { useEffect, useMemo, useRef, useState } from 'react';
import { siteConfig } from '../config';
import { getDisplayPosts, createPostSearchText } from '$lib/utils/posts';

export default function SearchPage() {
	const posts = useMemo(() => getDisplayPosts(), []);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [expanded, setExpanded] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		document.title = `搜索 - ${siteConfig.title}`;
	}, []);

	useEffect(() => {
		if (open) inputRef.current?.focus();
	}, [open]);

	const results = useMemo(() => {
		const term = query.trim().toLowerCase();
		if (!term) return [];
		return posts.filter(post => {
			const haystack = createPostSearchText(post);
			return haystack.includes(term);
		});
	}, [posts, query]);

	return (
		<main className="pm-main">
			<header className="pm-page-header">
				<button
					className={`pm-search-toggle${open ? ' open' : ''}`}
					onClick={() => { setOpen(!open); if (open) { setQuery(''); setExpanded(null); } }}
					aria-expanded={open}
				>
					<h1>搜索</h1>
					<span className="pm-search-arrow">{open ? '▾' : '▸'}</span>
				</button>
			</header>

			{open && (
				<div className="pm-searchbox">
					<input
						ref={inputRef}
						value={query}
						onChange={(e) => { setQuery(e.target.value); setExpanded(null); }}
						type="search"
						placeholder="输入关键词搜索文章..."
						aria-label="搜索文章"
					/>
				</div>
			)}

			{open && (
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
										onClick={() => setExpanded(prev => prev === post.slug ? null : post.slug)}
										aria-expanded={isOpen}
									>
										<span className="pm-search-title">{post.metadata.title}</span>
										<span className="pm-search-arrow">{isOpen ? '▾' : '▸'}</span>
									</button>
									{isOpen && (
										<div className="pm-search-detail">
											{post.metadata.description && <p>{post.metadata.description}</p>}
											<a href={`/posts/${post.slug}`} className="pm-search-link">阅读全文 →</a>
										</div>
									)}
								</li>
							);
						})
					)}
				</ul>
			)}
		</main>
	);
}
