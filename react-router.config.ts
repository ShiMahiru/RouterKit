import type { Config } from "@react-router/dev/config";
import { loadAllPosts } from "./lib/posts-loader";

export default {
  ssr: true,
  routeDiscovery: { mode: "initial" },
  async prerender() {
    const posts = loadAllPosts();
    return [
      "/",
      "/posts",
      "/archives",
      "/search",
      ...posts.map(p => `/posts/${p.slug}`),
    ];
  },
} satisfies Config;
