import { useLoaderData, useSearchParams } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
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

export async function loader({ params }: LoaderFunctionArgs) {
  const post = loadPostBySlug(params.slug!);
  if (!post) throw new Response("Not Found", { status: 404 });

  const md = createMarkdownRenderer();
  const html = renderPostHtml(post.content, post.slug, md);

  return {
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

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
  if (!loaderData) return [{ title: `404 - ${siteConfig.title}` }];
  const post = loaderData.post;
  const title = `${post.metadata.title} - ${siteConfig.title}`;
  const url = `${siteConfig.url}/posts/${post.slug}/`;
  const image = post.metadata.image || siteConfig.icon;
  const description = post.metadata.description || siteConfig.description;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "article:published_time", content: post.metadata.published },
    { tagName: "link", rel: "canonical", href: url },
  ];
};

function PostStructuredData({ post }: { post: { slug: string; metadata: { title: string; description: string; published: string; image: string } } }) {
  const url = `${siteConfig.url}/posts/${post.slug}/`;
  const image = post.metadata.image || siteConfig.icon;
  const description = post.metadata.description || siteConfig.description;
  return (
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
      <PostStructuredData post={post} />
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
      <ImageViewer key={post.slug} />
    </>
  );
}
