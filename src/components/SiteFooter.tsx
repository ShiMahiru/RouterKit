import { Link } from 'react-router';

export default function SiteFooter() {
	return (
		<footer className="pm-footer">
			<span>&copy; {new Date().getFullYear()} <Link to="/">Yuln的博客</Link> · 由 React 和 Vite 驱动</span>
		</footer>
	);
}
