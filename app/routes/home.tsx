import { useLoaderData } from "react-router";
import type { MetaFunction } from "react-router";
import PaperPostList from "@/components/common/PaperPostList";
import { siteConfig } from "@/config";
import { loadAllPosts } from "../../lib/posts-loader";
import type { Post } from "@/types/post";
import { resolvePostAssetPath } from "@/utils/markdown";

export const meta: MetaFunction = ({ location }) => {
  const isHome = location.pathname === "/";
  const title = isHome ? siteConfig.title : `文章列表 - ${siteConfig.title}`;
  const url = isHome ? siteConfig.url : `${siteConfig.url}/posts/`;
  return [
    { title },
    { name: "description", content: siteConfig.description },
    { property: "og:title", content: title },
    { property: "og:description", content: siteConfig.description },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:image", content: siteConfig.icon },
    { name: "twitter:card", content: "summary" },
    { tagName: "link", rel: "canonical", href: url },
    { tagName: "link", rel: "alternate", type: "application/rss+xml", title: siteConfig.title, href: `${siteConfig.url}/rss.xml` },
  ];
};

export async function loader() {
  const posts = loadAllPosts();

  const displayPosts: Post[] = posts.map(p => ({
    slug: p.slug,
    metadata: {
      ...p.metadata,
      image: resolvePostAssetPath(p.slug, p.metadata.image),
    },
    html: "",
    rawContent: p.content,
  }));

  return { posts: displayPosts };
}

export default function Home() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <main className="pm-main pm-list-main">
      <PaperPostList posts={posts} />
    </main>
  );
}