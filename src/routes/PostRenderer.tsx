import { useEffect, useRef } from 'react';
import { useParams, Outlet } from 'react-router';
import { resolvePostAssetPath } from '$lib/utils/markdown';

export default function PostRenderer() {
	const { slug } = useParams<{ slug: string }>();

	useEffect(() => {
		if (!slug) return;
		requestAnimationFrame(() => {
			const proseElement = document.querySelector('.pm-post-content');
			if (!proseElement) return;
			const images = proseElement.querySelectorAll('img');
			images.forEach(img => {
				const src = img.getAttribute('src');
				if (src && !src.startsWith('/') && !src.startsWith('http')) {
					img.src = resolvePostAssetPath(slug, src);
				}
			});
		});
	}, [slug]);

	return <Outlet />;
}
