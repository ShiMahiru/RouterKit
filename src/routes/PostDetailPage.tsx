import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Navigate, useSearchParams } from 'react-router';
import { siteConfig } from '../config';
import ImageViewer from '$lib/components/ImageViewer';
import Giscus from '$lib/components/Giscus';
import PostToc from '$lib/components/PostToc';
import { highlightCodeBlocksIn } from '$lib/utils/highlight';
import { renderMermaidIn } from '$lib/utils/mermaid';
import { countPostWords, getPostReadTime, getPostBySlug } from '$lib/utils/posts';
import { resolvePostAssetPath } from '$lib/utils/markdown';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

function formatDate(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleDateString('zh-CN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

function parseQueryTerms(query: string): string[] {
	const terms: string[] = [];
	const re = /"([^"]+)"|(\S+)/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(query)) !== null) {
		const t = (m[1] ?? m[2] ?? '').trim().toLowerCase();
		if (t) terms.push(t);
	}
	return terms;
}

export default function PostDetailPage() {
	const { slug } = useParams<{ slug: string }>();
	const [searchParams] = useSearchParams();
	const proseRef = useRef<HTMLDivElement>(null);

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

	const [htmlContent, setHtmlContent] = useState('');
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (!post || !slug) return;
		let html = md.render(post.content);
		html = html.replace(
			/(<img[^>]+src=")(?!\/|https?:\/\/)([^"]+)(")/g,
			(_m: string, before: string, src: string, after: string) =>
				`${before}/posts/${slug}/${src}${after}`
		);
		setHtmlContent(html);
		setLoaded(true);
	}, [post, slug]);

	useEffect(() => {
		if (!loaded || !proseRef.current) return;
		(async () => {
			await renderMermaidIn(proseRef.current);
			highlightCodeBlocksIn(proseRef.current);

			const highlight = searchParams.get('highlight');
			if (highlight && proseRef.current) {
				const terms = parseQueryTerms(highlight);
				if (terms.length > 0) {
					highlightSearchTermsIn(proseRef.current, terms);
					setTimeout(() => {
						const firstMark = proseRef.current?.querySelector('mark.search-highlight');
						if (firstMark) {
							const top = (firstMark as HTMLElement).getBoundingClientRect().top + window.scrollY - 100;
							window.scrollTo({ top, behavior: 'smooth' });
						}
					}, 100);
				}
			}
		})();
	}, [loaded, slug, searchParams]);

	if (!post) return <Navigate to="/posts" replace />;

	const showToc = post.metadata.toc === true;

	useEffect(() => {
		if (post) document.title = `${post.metadata.title} - ${siteConfig.title}`;
	}, [post]);

	return (
		<>
			<main className="pm-main">
				<article className="pm-post-single">
					<header className="pm-post-header">
						<nav className="pm-breadcrumbs" aria-label="Breadcrumb">
							<a href="/">主页</a>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
								strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<polyline points="9 18 15 12 9 6" />
							</svg>
							<a href="/posts">文章</a>
						</nav>
						<h1 className="pm-post-title pm-entry-hint-parent">{post.metadata.title}</h1>
						<div className="pm-post-description">{post.metadata.description}</div>
						<div className="pm-post-meta">
							<span title={post.metadata.published}>{formatDate(post.metadata.published)}</span>
							&nbsp;·&nbsp;
							<span>{getPostReadTime(post)} 分钟</span>
							&nbsp;·&nbsp;
							<span>{countPostWords(post)} 字</span>
						</div>
					</header>

					{post.metadata.image && (
						<figure className="pm-entry-cover">
							<img loading="eager" src={post.metadata.image} alt="" />
						</figure>
					)}

					{showToc && <PostToc container={proseRef.current} trigger={slug} />}

					<div ref={proseRef} className="pm-post-content">
						{loaded ? (
							<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
						) : (
							<p>加载中...</p>
						)}
					</div>

					<footer className="pm-post-footer">
						<nav className="pm-paginav">
							<a className="pm-prev" href="/posts">
								<span className="title">« 返回</span>
								<span>文章列表</span>
							</a>
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

function highlightSearchTermsIn(container: HTMLElement, terms: string[]) {
	const escaped = terms
		.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.sort((a, b) => b.length - a.length);
	const regex = new RegExp(`(${escaped.join('|')})`, 'gi');

	const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
		acceptNode: (node) => {
			const parent = node.parentElement;
			if (!parent) return NodeFilter.FILTER_REJECT;
			if (
				parent.tagName === 'MARK' ||
				parent.tagName === 'SCRIPT' ||
				parent.tagName === 'STYLE' ||
				parent.closest('pre, code')
			) {
				return NodeFilter.FILTER_REJECT;
			}
			return NodeFilter.FILTER_ACCEPT;
		}
	});

	const textNodes: Text[] = [];
	let node: Node | null;
	while ((node = walker.nextNode())) textNodes.push(node as Text);

	for (const textNode of textNodes) {
		const text = textNode.textContent || '';
		if (!regex.test(text)) continue;
		regex.lastIndex = 0;

		const frag = document.createDocumentFragment();
		let lastIdx = 0;
		let match: RegExpExecArray | null;
		while ((match = regex.exec(text)) !== null) {
			if (match.index > lastIdx) {
				frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
			}
			const mark = document.createElement('mark');
			mark.className = 'search-highlight';
			mark.textContent = match[0];
			frag.appendChild(mark);
			lastIdx = regex.lastIndex;
		}
		if (lastIdx < text.length) {
			frag.appendChild(document.createTextNode(text.slice(lastIdx)));
		}
		textNode.replaceWith(frag);
	}
}
