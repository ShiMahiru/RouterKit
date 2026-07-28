import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';
import { siteConfig } from '@/config';
import { getPreferredTheme } from '@/utils/theme';

const navItems = [
	{ label: '搜索', href: '/search' },
	{ label: '归档', href: '/archives' },
	{ label: 'RSS', href: '/rss.xml', external: true }
] as const;

function applyTheme(theme: 'light' | 'dark') {
	document.documentElement.dataset.theme = theme;
	document.documentElement.classList.toggle('dark', theme === 'dark');
	const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
	if (meta) meta.content = theme === 'dark' ? '#1d1e20' : '#ffffff';
}

export default function NavBar() {
	const [theme, setTheme] = useState<'light' | 'dark'>(getPreferredTheme);

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	useEffect(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem('pref-theme')) {
				setTheme(e.matches ? 'dark' : 'light');
			}
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(current => {
			const next = current === 'dark' ? 'light' : 'dark';
			localStorage.setItem('pref-theme', next);
			return next;
		});
	}, []);

	return (
		<header>
			<nav className="pm-header-nav">
				<div className="pm-logo">
					<Link to="/" title={siteConfig.headerTitle}>{siteConfig.headerTitle}</Link>
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
							<svg
								className="pm-moon"
								width="18" height="18" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" strokeWidth="2"
								strokeLinecap="round" strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
							</svg>
							<svg
								className="pm-sun"
								width="18" height="18" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" strokeWidth="2"
								strokeLinecap="round" strokeLinejoin="round"
								aria-hidden="true"
							>
								<circle cx="12" cy="12" r="5" />
								<line x1="12" y1="1" x2="12" y2="3" />
								<line x1="12" y1="21" x2="12" y2="23" />
								<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
								<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
								<line x1="1" y1="12" x2="3" y2="12" />
								<line x1="21" y1="12" x2="23" y2="12" />
								<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
								<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
							</svg>
						</button>
					</li>
					{navItems.map(item => (
						<li key={item.href}>
							{'external' in item && item.external ? (
								<a href={item.href} title={item.label}><span>{item.label}</span></a>
							) : (
								<Link to={item.href} title={item.label}><span>{item.label}</span></Link>
							)}
						</li>
					))}
				</ul>
			</nav>
		</header>
	);
}
