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

  // All hooks must come BEFORE any conditional return (React rules of hooks)
  const [proseElement, setProseElement] = useState<HTMLDivElement | null>(null);
  const proseCallbackRef = useCallback((el: HTMLDivElement | null) => {
    setProseElement(el);
  }, []);

  const highlightTerms = useMemo(() => {
    const h = searchParams.get("highlight");
    return h ? parseQueryTerms(h) : [];
  }, [searchParams]);

  useEffect(() => {
    if (!slug) {
      setData({ notFound: true });
      return;
    }
    const post = loadPostBySlug(slug);
    if (!post) {
      setData({ notFound: true });
      return;
    }
    const md = createMarkdownRenderer();
    const html = renderPostHtml(post.content, md);
    setData({
      notFound: false,
      post: {
        slug: post.slug,
        metadata: { ...post.metadata },
        html,
        rawContent: post.content,
      },
    });
  }, [slug]);

  useEffect(() => {
    if (!data) return;
    if (data.notFound) {
      document.title = `404 - ${siteConfig.title}`;
    } else {
      document.title = `${data.post.metadata.title} - ${siteConfig.title}`;
    }
  }, [data]);

  if (!data) return null;
  if (data.notFound) return <NotFound />;

  const { post } = data;
  const showToc = post.metadata.toc === true;

  return (
    <main className="pm-main">
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
          <Giscus slug={post.slug} />
        </div>
      </article>
      <ImageViewer key={post.slug} />
    </main>
  );
}
