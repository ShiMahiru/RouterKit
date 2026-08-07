import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PaperPostList from "@/components/common/PaperPostList";
import SEO from "@/components/common/SEO";
import type { Post } from "@/types/post";
import { loadAllPosts } from "@/lib/posts-loader";

export default function Home() {
  const { pathname } = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadAllPosts().then((all) => {
      if (cancelled) return;
      setPosts(
        all.map((p) => ({
          slug: p.slug,
          metadata: { ...p.metadata },
          html: "",
          rawContent: "",
        }))
      );
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="pm-main pm-list-main">
      <SEO title={pathname !== "/" ? "文章列表" : undefined} />
      <PaperPostList posts={posts} />
    </main>
  );
}
