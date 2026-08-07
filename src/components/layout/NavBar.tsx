import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '@/config';
import { getPreferredTheme } from '@/utils/theme';

const navItems = [
	{ label: '文章', href: '/posts' },
	{ label: '归档', href: '/archives' },
	{ label: '闲言', href: '/thoughts' },
	{ label: '关于', href: '/about' },
] as const;

function applyTheme(theme: 'light' | 'dark') {
	document.documentElement.dataset.theme = theme;
	document.documentElement.classList.toggle('dark', theme === 'dark');
	const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
	if (meta) meta.content = theme === 'dark' ? '#1d1e20' : '#ffffff';
}

export default function NavBar() {
	const [theme, setTheme] = useState<'light' | 'dark'>(getPreferredTheme);
	const [menuOpen, setMenuOpen] = useState(false);
	const [hidden, setHidden] = useState(false);

	useEffect(() => {
		let lastScroll = 0;
		const onScroll = () => {
			const y = window.scrollY;
			if (y < 60) { setHidden(false); lastScroll = y; return; }
			if (y > lastScroll && y > 60) { setHidden(true); setMenuOpen(false); }
			else if (y < lastScroll) setHidden(false);
			lastScroll = y;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => { applyTheme(theme); }, [theme]);

	useEffect(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem('pref-theme')) setTheme(e.matches ? 'dark' : 'light');
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(c => {
			const n = c === 'dark' ? 'light' : 'dark';
			localStorage.setItem('pref-theme', n);
			return n;
		});
	}, []);

	return (
		<header className={`pm-site-header ${hidden ? 'is-hidden' : ''}`}>
			<div className="pm-site-header-inner">
				<Link to="/" className="pm-site-brand" title={siteConfig.headerTitle}>
					<img src={siteConfig.icon} alt="" className="pm-site-icon" />
					{siteConfig.headerTitle}
				</Link>
				<div className="pm-header-actions">
					<Link to="/search" className="pm-search-btn" title="搜索" onClick={() => setMenuOpen(false)}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
					</Link>
					<button className="pm-theme-toggle" title="切换主题" aria-label="切换主题" onClick={toggleTheme}>
						<svg className="pm-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
						<svg className="pm-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
					</button>
					<button className="pm-menu-toggle" aria-label="菜单" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
					</button>
				</div>
			</div>
			<nav className={`pm-menu-panel ${menuOpen ? 'open' : ''}`}>
				<ul>
					{navItems.map(item => (
						<li key={item.href}><Link to={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link></li>
					))}
				</ul>
			</nav>
		</header>
	);
}