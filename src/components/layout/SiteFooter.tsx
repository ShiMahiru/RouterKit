import { Link } from 'react-router-dom';
import { siteConfig } from '@/config';

export default function SiteFooter() {
	return (
		<footer className="pm-footer">
			<span>&copy; {new Date().getFullYear()} <Link to="/">{siteConfig.headerTitle}的博客</Link> · <Link to="/rss.xml">RSS</Link> · 由 React 和 Vite 驱动</span>
		</footer>
	);
}
