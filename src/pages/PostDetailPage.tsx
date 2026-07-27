import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Navigate, useSearchParams, Link } from 'react-router';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { siteConfig } from '@/config';
import ArticleHeader from '@/components/article/ArticleHeader';
import ImageViewer from '@/components/article/ImageViewer';
import Giscus from '@/components/comment/Giscus';
import PostToc from '@/components/article/PostToc';
import SearchHighlight, { parseQueryTerms } from '@/components/search/SearchHighlight';
import { highlightCodeBlocksIn } from '@/utils/highlight';
import { renderMermaidIn } from '@/utils/mermaid';
import { getPostBySlug } from '@/utils/posts';
import { resolvePostAssetPath } from '@/utils/markdown';

export default function PostDetailPage() {
	const { slug } = useParams<{ slug: string }>();
	const [searchParams] = useSearchParams();
	const proseRef = useRef<HTMLDivElement>(null);
	const [proseElement, setProseElement] = useState<HTMLDivElement | null>(null);
	const proseCallbackRef = useCallback((el: HTMLDivElement | null) => {
		(proseRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
		setProseElement(el);
	}, []);

	const post = useMemo(() => {
		if (!slug) return undefined;
		const p = getPostBySlug(slug);
		if (!p) return undefined;
		return {
			...p,
			metadata: {
				...p.metadata,
				image: resolvePostAssetPath(slug, p.metadata.image)
			}
		};
	}, [slug]);

	// 预编译 HTML 已存储在 post.html 中，直接使用（经过 DOMPurify 清洗）
	const sanitizedHtml = useMemo(() => {
		if (!post) return '';
		return DOMPurify.sanitize(post.html, {
			ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'img', 'ul', 'ol', 'li',
				'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
				'hr', 'br', 'strong', 'em', 'del', 'sup', 'sub', 'figure', 'figcaption',
				'div', 'span', 'input', 'details', 'summary'
			],
			ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
				'loading', 'width', 'height', 'type', 'checked', 'disabled'
			]
		});
	}, [post]);

	const [contentReady, setContentReady] = useState(false);

	useEffect(() => {
		if (!post || !slug) return;
		setContentReady(true);
	}, [post, slug]);

	// 客户端后处理：Mermaid + 代码高亮 + 搜索高亮
	useEffect(() => {
		if (!contentReady || !proseRef.current) return;
		(async () => {
			await renderMermaidIn(proseRef.current);
			await highlightCodeBlocksIn(proseRef.current);

			const highlight = searchParams.get('highlight');
			if (highlight && proseRef.current) {
				const terms = parseQueryTerms(highlight);
				if (terms.length > 0) {
					// SearchHighlight 组件会处理
				}
			}
		})();
	}, [contentReady, slug, searchParams.toString()]);

	// 搜索高亮
	const highlightTerms = useMemo(() => {
		const h = searchParams.get('highlight');
		return h ? parseQueryTerms(h) : [];
	}, [searchParams]);

	// SEO 元数据
	const pageTitle = post ? `${post.metadata.title} - ${siteConfig.title}` : siteConfig.title;
	const pageUrl = post ? `${siteConfig.url}/posts/${slug}/` : siteConfig.url;
	const pageImage = post?.metadata.image || siteConfig.icon;
	const pageDescription = post?.metadata.description || siteConfig.description;
	const pagePublished = post?.metadata.published;

	if (!post) return <Navigate to="/posts" replace />;

	const showToc = post.metadata.toc === true;

	return (
		<>
			<Helmet>
				<title>{pageTitle}</title>
				<meta name="description" content={pageDescription} />
				<link rel="canonical" href={pageUrl} />
				<meta property="og:title" content={pageTitle} />
				<meta property="og:description" content={pageDescription} />
				<meta property="og:type" content="article" />
				<meta property="og:url" content={pageUrl} />
				<meta property="og:image" content={pageImage} />
				<meta name="twitter:card" content="summary_large_image" />
				{pagePublished && <meta property="article:published_time" content={pagePublished} />}
				<script type="application/ld+json">
					{JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'Article',
						headline: post.metadata.title,
						description: pageDescription,
						image: pageImage,
						datePublished: pagePublished,
						url: pageUrl,
						author: {
							'@type': 'Person',
							name: siteConfig.headerTitle
						}
					})}
				</script>
			</Helmet>

			<main className="pm-main">
				<article className="pm-post-single">
					<ArticleHeader post={post} />

					{post.metadata.image && (
						<figure className="pm-entry-cover">
							<img loading="eager" fetchPriority="high" src={post.metadata.image} alt="" />
						</figure>
					)}

					{showToc && <PostToc container={proseElement} trigger={slug} />}

					<div ref={proseCallbackRef} className="pm-post-content">
						{contentReady ? (
							<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
						) : (
							<p>加载中...</p>
						)}
					</div>

					{highlightTerms.length > 0 && (
						<SearchHighlight container={proseElement} terms={highlightTerms} />
					)}

					<footer className="pm-post-footer">
						<nav className="pm-paginav">
							<Link className="pm-prev" to="/posts">
								<span className="title">« 返回</span>
								<span>文章列表</span>
							</Link>
						</nav>
					</footer>

					<div id="comments">
						<Giscus key={slug} />
					</div>
				</article>
			</main>
			<ImageViewer />
		</>
	);
}