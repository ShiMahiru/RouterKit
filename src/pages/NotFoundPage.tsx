import { useEffect } from 'react';
import { Link } from 'react-router';
import { siteConfig } from '@/config';

export default function NotFoundPage() {
	useEffect(() => {
	document.title = `页面不存在 - ${siteConfig.title}`;
	const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
	if (canonical) canonical.href = siteConfig.url;
}, []);

	return (
		<main className="pm-main">
			<div className="pm-empty" style={{ paddingTop: '80px' }}>
				<h1 style={{ fontSize: '72px', margin: '0 0 16px', fontWeight: 700 }}>404</h1>
				<p style={{ fontSize: '18px', margin: '0 0 32px' }}>页面不存在</p>
				<Link to="/" style={{ textDecoration: 'underline', textUnderlineOffset: '0.3rem' }}>
					返回首页
				</Link>
			</div>
		</main>
	);
}