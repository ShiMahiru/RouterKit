import { useEffect, useState, useCallback, useMemo } from 'react';
import { siteConfig } from '../../config';
import { getDisplayPosts, createPostSearchText } from '$lib/utils/posts';

const navItems = [
	{ label: '归档', href: '/archives' },
	{ label: 'RSS', href: '/rss.xml' }
] as const;

function preferredTheme(): 'light' | 'dark' {
	const stored = localStorage.getItem('pref-theme');
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: 'light' | 'dark') {
	document.documentElement.dataset.theme = theme;
	document.documentElement.classList.toggle('dark', theme === 'dark');
}

export default function NavBar() {
	const [, forceUpdate] = useState(0);
	const [query, setQuery] = useState('');

	useEffect(() => {
		applyTheme(preferredTheme());
	}, []);

	const toggleTheme = useCallback(() => {
		const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
		const next = current === 'dark' ? 'light' : 'dark';
		localStorage.setItem('pref-theme', next);
		applyTheme(next);
		forceUpdate(n => n + 1);
	}, []);

	const allPosts = useMemo(() => getDisplayPosts(), []);
	const results = useMemo(() => {
		const term = query.trim().toLowerCase();
		if (!term) return [];
		return allPosts.filter(p => createPostSearchText(p).includes(term));
	}, [allPosts, query]);

	return (
		<header className="pm-header">
			<nav className="pm-header-nav">
				<div className="pm-logo">
					<a href="/" title={siteConfig.headerTitle}>{siteConfig.headerTitle}</a>
				</div>

				<ul id="menu" className="pm-menu">
					<li>
						<button id="theme-toggle" className="pm-theme-toggle" title="切换主题" aria-label="切换主题" onClick={toggleTheme}>
							<svg className="pm-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
							</svg>
							<svg className="pm-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<circle cx="12" cy="12" r="5" />
								<line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
								<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
								<line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
								<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
							</svg>
						</button>
					</li>
					{navItems.map(item => (
						<li key={item.href}><a href={item.href} title={item.label}><span>{item.label}</span></a></li>
					))}
					<li>
						<div className="pm-nav-search">
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								type="search"
								placeholder="搜索"
								aria-label="搜索"
							/>
						</div>
					</li>
				</ul>
			</nav>
		</header>

		{query && (
			<div className="pm-search-dropdown">
				<ul className="pm-search-results" style={{ maxWidth: 'calc(var(--pm-main-width) + var(--pm-gap) * 2)', margin: 'auto', listStyle: 'none', padding: '0 var(--pm-gap)' }}>
					{results.length === 0 ? (
						<li className="pm-search-empty">未找到匹配的文章</li>
					) : (
						results.slice(0, 10).map(post => (
							<li key={post.slug} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', background: 'var(--pm-code-bg)', border: '1px solid var(--pm-border)', borderRadius: 'var(--pm-radius)', fontWeight: 500, marginBottom: 6 }}>
								<a className="pm-entry-link" href={`/posts/${post.slug}`} style={{ position: 'absolute', inset: 0, borderRadius: 'var(--pm-radius)' }} onClick={() => setQuery('')}></a>
								<div><h2 style={{ margin: 0, fontSize: 20, lineHeight: 1.3 }}>{post.metadata.title}</h2></div>
								<span>»</span>
							</li>
						))
					)}
				</ul>
			</div>
		)}
	</>
);
}
