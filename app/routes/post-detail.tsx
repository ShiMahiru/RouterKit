import { useLoaderData, useSearchParams } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useCallback, useState, useMemo } from "react";
import { Link } from "react-router";
import { siteConfig } from "@/config";
import ArticleHeader from "@/components/article/ArticleHeader";
import ImageViewer from "@/components/article/ImageViewer";
import Giscus from "@/components/comment/Giscus";
import PostToc from "@/components/article/PostToc";
import SearchHighlight, { parseQueryTerms } from "@/components/search/SearchHighlight";
import { resolvePostAssetPath } from "@/utils/markdown";
import { loadPostBySlug, renderPostHtml, createMarkdownRenderer } from "../../lib/posts-loader";
import NotFound from "./not-found";

export async function loader({ params }: LoaderFunctionArgs) {
  const post = loadPostBySlug(params.slug!);
  if (!post) return { notFound: true as const };

  const md = createMarkdownRenderer();
  const html = renderPostHtml(post.content, post.slug, md);

  return {
    notFound: false as const,
    post: {
      slug: post.slug,
      metadata: {
        ...post.metadata,
        image: resolvePostAssetPath(post.metadata.image),
      },
      html,
      rawContent: post.content,
    },
  };
}

export const meta = ({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) => {
  if (!loaderData || loaderData.notFound) return [{ title: `404 - ${siteConfig.title}` }];
  const post = loaderData.post;
  return [{ title: `${post.metadata.title} - ${siteConfig.title}` }];
};

export default function PostDetail() {
  const data = useLoaderData<typeof loader>();
  if (data.notFound) return <NotFound />;
  const { post } = data;
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
    <main className="pm-main">
      <article className="pm-post-single">
        <ArticleHeader post={post} />

        {post.metadata.image && (
          <figure className="pm-entry-cover">
            <img loading="eager" fetchPriority="high" src={post.metadata.image} alt="" sizes="100vw" />
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
      <ImageViewer key={post.slug} />
    </main>
  );
}
