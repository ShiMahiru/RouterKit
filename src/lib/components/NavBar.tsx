import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		applyTheme(preferredTheme());
	}, []);

	useEffect(() => {
		if (searchOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
		} else {
			setQuery('');
		}
	}, [searchOpen]);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') setSearchOpen(false);
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
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
		<>
			<header className="pm-header">
				<nav className="pm-header-nav">
					<div className="pm-logo">
						<a href="/" title={siteConfig.headerTitle}>{siteConfig.headerTitle}</a>
					</div>

					<ul id="menu" className="pm-menu">
						<li>
							<button
								id="theme-toggle"
								className="pm-theme-toggle"
								title="切换主题"
								aria-label="切换主题"
								onClick={toggleTheme}
							>
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
						<li>
							<button className="pm-search-btn" title="搜索 (Ctrl+K)" aria-label="搜索" onClick={() => setSearchOpen(true)}>
								<span>搜索</span>
							</button>
						</li>
						{navItems.map(item => (
							<li key={item.href}><a href={item.href} title={item.label}><span>{item.label}</span></a></li>
						))}
					</ul>
				</nav>
			</header>

			{searchOpen && (
				<div className="pm-search-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
					<div className="pm-search-modal">
						<div className="pm-searchbox">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pm-search-icon">
								<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
							</svg>
							<input
								ref={inputRef}
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								type="search"
								placeholder="搜索文章..."
								aria-label="搜索文章"
							/>
							<button className="pm-search-close" onClick={() => setSearchOpen(false)} aria-label="关闭搜索">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						{query.trim() && (
							<ul className="pm-search-results">
								{results.length === 0 ? (
									<li className="pm-search-empty">未找到匹配的文章</li>
								) : (
									results.slice(0, 10).map(post => (
										<li key={post.slug}>
											<a href={`/posts/${post.slug}`} onClick={() => setSearchOpen(false)}>
												<span className="pm-search-title">{post.metadata.title}</span>
												{post.metadata.description && (
													<span className="pm-search-desc">{post.metadata.description}</span>
												)}
											</a>
										</li>
									))
								)}
							</ul>
						)}
					</div>
				</div>
			)}
		</>
	);
}
