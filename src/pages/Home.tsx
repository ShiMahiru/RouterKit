import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PaperPostList from "@/components/common/PaperPostList";
import { siteConfig } from "@/config";
import type { Post } from "@/types/post";
import { loadAllPosts } from "@/lib/posts-loader";

export default function Home() {
  const { pathname } = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (pathname !== "/") {
      document.title = `文章列表 - ${siteConfig.title}`;
    }
  }, [pathname]);

  useEffect(() => {
    const all = loadAllPosts();
    setPosts(
      all.map((p) => ({
        slug: p.slug,
        metadata: { ...p.metadata },
        html: "",
        rawContent: "",
      }))
    );
  }, []);

  return (
    <main className="pm-main pm-list-main">
      <PaperPostList posts={posts} />
    </main>
  );
}
