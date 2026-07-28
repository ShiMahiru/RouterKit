import { useLoaderData, useSearchParams } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useCallback, useState, useMemo } from "react";
import { Link } from "react-router";
import DOMPurify from "isomorphic-dompurify";
import { siteConfig } from "@/config";
import ArticleHeader from "@/components/article/ArticleHeader";
import ImageViewer from "@/components/article/ImageViewer";
import Giscus from "@/components/comment/Giscus";
import PostToc from "@/components/article/PostToc";
import SearchHighlight, { parseQueryTerms } from "@/components/search/SearchHighlight";
import { resolvePostAssetPath } from "@/utils/markdown";
import { loadAllPosts, renderPostHtml, createMarkdownRenderer } from "../../lib/posts-loader";
import { renderMermaidInHtml } from "../../lib/mermaid-renderer";

export async function loader({ params }: LoaderFunctionArgs) {
  const posts = loadAllPosts();
  const post = posts.find(p => p.slug === params.slug);
  if (!post) throw new Response("Not Found", { status: 404 });

  const md = createMarkdownRenderer();
  let html = renderPostHtml(post.content, post.slug, md);

  html = await renderMermaidInHtml(html);

  html = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "img", "ul", "ol", "li",
      "blockquote", "pre", "code", "table", "thead", "tbody", "tr", "th", "td",
      "hr", "br", "strong", "em", "del", "sup", "sub", "figure", "figcaption",
      "div", "span", "input", "details", "summary", "picture", "source",
      "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline",
      "polygon", "text", "tspan", "defs", "marker",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "id", "target", "rel",
      "loading", "width", "height", "type", "checked", "disabled", "srcset",
      "viewBox", "fill", "stroke", "stroke-width", "d", "x", "y", "cx", "cy",
      "r", "rx", "ry", "x1", "y1", "x2", "y2", "points", "transform",
      "text-anchor", "dominant-baseline", "font-size", "font-family",
      "marker-end", "marker-start", "xmlns",
    ],
  });

  return {
    post: {
      slug: post.slug,
      metadata: {
        ...post.metadata,
        image: resolvePostAssetPath(post.slug, post.metadata.image),
      },
      html,
      rawContent: post.content,
    },
  };
}

function PostMeta({ post }: { post: { slug: string; metadata: { title: string; description: string; published: string; image: string } } }) {
  const title = `${post.metadata.title} - ${siteConfig.title}`;
  const url = `${siteConfig.url}/posts/${post.slug}/`;
  const image = post.metadata.image || siteConfig.icon;
  const description = post.metadata.description || siteConfig.description;
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="article:published_time" content={post.metadata.published} />
      <link rel="canonical" href={url} />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.metadata.title,
          description,
          image,
          datePublished: post.metadata.published,
          url,
          author: { "@type": "Person", name: siteConfig.headerTitle },
        })}
      </script>
    </>
  );
}

export default function PostDetail() {
  const { post } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [proseElement, setProseElement] = useState<HTMLDivElement | null>(null);
  const proseCallbackRef = useCallback((el: HTMLDivElement | null) => {
    setProseElement(el);
  }, []);

  const highlightTerms = useMemo(() => {
    const h = searchParams.get("highlight");
    return h ? parseQueryTerms(h) : [];
  }, [searchParams]);

  const showToc = post.metadata.toc === true;

  return (
    <>
      <PostMeta post={post} />
      <main className="pm-main">
        <article className="pm-post-single">
          <ArticleHeader post={post} />

          {post.metadata.image && (
            <figure className="pm-entry-cover">
              <img loading="eager" fetchPriority="high" src={post.metadata.image} alt="" />
            </figure>
          )}

          {showToc && <PostToc container={proseElement} trigger={post.slug} />}

          <div ref={proseCallbackRef} className="pm-post-content">
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>

          {highlightTerms.length > 0 && (
            <SearchHighlight container={proseElement} terms={highlightTerms} />
          )}

          <footer className="pm-post-footer">
            <nav className="pm-paginav">
              <Link to="/posts">
                <span className="title">« 返回</span>
                <span>文章列表</span>
              </Link>
            </nav>
          </footer>

          <div id="comments">
            <Giscus slug={post.slug} />
          </div>
        </article>
      </main>
      <ImageViewer />
    </>
  );
}
