import { useState, useEffect } from 'react';

export default function BackToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		function handleScroll() {
			setVisible(window.scrollY > 100);
		}
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	function scrollToTop(e: React.MouseEvent) {
		e.preventDefault();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	return (
		<a
			href="#top"
			id="top-link"
			className={`pm-top-link${visible ? '' : ' hidden'}`}
			aria-label="回到顶部"
			title="回到顶部"
			onClick={scrollToTop}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none" stroke="currentColor" strokeWidth="2"
				strokeLinecap="round" strokeLinejoin="round"
				aria-hidden="true"
			>
				<polyline points="5 12 12 5 19 12" />
				<line x1="12" y1="19" x2="12" y2="5" />
			</svg>
		</a>
	);
}
