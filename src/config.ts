export const siteConfig = {
	lang: 'zh-CN',
	url: 'https://blog.242531778.xyz',
	title: 'Yuln | 博客',
	headerTitle: 'Yuln',
	description: 'Yuln 的个人技术博客，专注于 IT / 互联网技术分享与实践。',
	icon: 'https://q2.qlogo.cn/headimg_dl?dst_uin=242531778&spec=0',
	giscus: {
		src: 'https://giscus.app/client.js',
		repo: 'ShiMahiru/blog-Giscus',
		repoId: 'R_kgDOR_rqPw',
		category: 'Announcements',
		categoryId: 'DIC_kwDOR_rqP84C6l8B',
		mapping: 'pathname',
		strict: '1',
		reactionsEnabled: '1',
		emitMetadata: '0',
		inputPosition: 'top',
		theme: 'preferred_color_scheme',
		lang: 'zh-CN',
		loading: 'lazy'
	}
} as const;
