import { useEffect } from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

export default function ImageViewer() {
	useEffect(() => {
		const lightbox = new PhotoSwipeLightbox({
			gallery: '.pm-post-content',
			children: 'img',
			pswpModule: () => import('photoswipe')
		});

		lightbox.addFilter('itemData', (itemData) => {
			const img = itemData.element as HTMLImageElement | undefined;
			return {
				src: img?.src || '',
				width: img?.naturalWidth || 800,
				height: img?.naturalHeight || 600,
				alt: img?.alt || ''
			};
		});

		lightbox.on('uiRegister', () => {
			const images = document.querySelectorAll<HTMLImageElement>('.pm-post-content img');
			images.forEach(img => { img.style.cursor = 'pointer'; });
		});

		lightbox.init();

		return () => { lightbox.destroy(); };
	}, []);

	return null;
}
