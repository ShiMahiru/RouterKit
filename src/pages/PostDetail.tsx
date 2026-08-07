import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { siteConfig } from "@/config";
import ArticleHeader from "@/components/article/ArticleHeader";
import ImageViewer from "@/components/article/ImageViewer";
import Giscus from "@/components/comment/Giscus";
import PostToc from "@/components/article/PostToc";
import SearchHighlight, {
  parseQueryTerms,
} from "@/components/search/SearchHighlight";
import SEO from "@/components/common/SEO";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { loadPostBySlug, renderPostHtml, createMarkdownRenderer } from "@/lib/posts-loader";
import NotFound from "./NotFound";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<
    | { notFound: true }
    | { notFound: false; post: { slug: string; metadata: any; html: string; rawContent: string } }
    | null
  >(null);

  const [proseElement, setProseElement] = useState<HTMLDivElement | null>(null);
  const proseCallbackRef = useCallback((el: HTMLDivElement | null) => {
    setProseElement(el);
  }, []);

  const highlightTerms = useMemo(() => {
    const h = searchParams.get("highlight");
    return h ? parseQueryTerms(h) : [];
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setData({ notFound: true });
      return;
    }
    loadPostBySlug(slug).then((post) => {
      if (cancelled) return;
      if (!post) {
        setData({ notFound: true });
        return;
      }
      const md = createMarkdownRenderer();
      const html = renderPostHtml(post.content, md, post.metadata.title);
      setData({
        notFound: false,
        post: {
          slug: post.slug,
          metadata: { ...post.metadata },
          html,
          rawContent: post.content,
        },
      });
    });
    return () => { cancelled = true; };
  }, [slug]);

  if (!data) return null;
  if (data.notFound) return <NotFound />;

  const { post } = data;
  const showToc = post.metadata.toc === true;

  return (
    <main className="pm-main">
      <SEO
        title={post.metadata.title}
        description={post.metadata.description || undefined}
        image={post.metadata.image || undefined}
        url={`${siteConfig.url}/posts/${post.slug}`}
        type="article"
        published={post.metadata.published}
      />
      <ErrorBoundary>
        <article className="pm-post-single">
          <ArticleHeader post={post} />

          {post.metadata.image && (
            <figure className="pm-entry-cover">
              <img
                loading="eager"
                fetchPriority="high"
                src={post.metadata.image}
                alt=""
                sizes="100vw"
              />
            </figure>
          )}

          {showToc && <PostToc container={proseElement} trigger={post.slug} />}

          <div ref={proseCallbackRef} className="pm-post-content">
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>

          {highlightTerms.length > 0 && (
            <SearchHighlight
              container={proseElement}
              terms={highlightTerms}
            />
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
            <ErrorBoundary fallback={<div className="pm-error-boundary"><p>评论加载失败</p></div>}>
              <Giscus slug={post.slug} />
            </ErrorBoundary>
          </div>
        </article>
        <ImageViewer key={post.slug} />
      </ErrorBoundary>
    </main>
  );
}
