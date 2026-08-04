import { useEffect } from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

interface Props {
	gallery?: string;
}

export default function ImageViewer({ gallery = '.pm-post-content' }: Props) {
	useEffect(() => {
		const lightbox = new PhotoSwipeLightbox({
			gallery,
			children: 'img',
			pswpModule: () => import('photoswipe')
		});

		lightbox.addFilter('itemData', (itemData) => {
			const img = itemData.element as HTMLImageElement | undefined;
			return {
				...itemData,
				src: img?.src || itemData.src || '',
				width: img?.naturalWidth || itemData.width || 800,
				height: img?.naturalHeight || itemData.height || 600,
				alt: img?.alt || itemData.alt || ''
			};
		});

		lightbox.init();

		return () => { lightbox.destroy(); };
	}, [gallery]);

	return null;
}
