import { useLoaderData } from "react-router";
import PaperPostList from "@/components/common/PaperPostList";
import { siteConfig } from "@/config";
import { loadAllPosts } from "../../lib/posts-loader";
import type { Post } from "@/types/post";
import { resolvePostAssetPath } from "@/utils/markdown";

export const meta = () => [{ title: siteConfig.title }];

export async function clientLoader() {
  const posts = loadAllPosts();

  const displayPosts: Post[] = posts.map(p => ({
    slug: p.slug,
    metadata: {
      ...p.metadata,
      image: resolvePostAssetPath(p.metadata.image),
    },
    html: "",
    rawContent: "",
  }));

  return { posts: displayPosts };
}

export default function Home() {
  const { posts } = useLoaderData<typeof clientLoader>();
  return (
    <main className="pm-main pm-list-main">
      <PaperPostList posts={posts} />
    </main>
  );
}