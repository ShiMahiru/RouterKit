import type { Config } from "@react-router/dev/config";
import fs from "fs";
import path from "path";

export default {
  ssr: true,
  routeDiscovery: { mode: "initial" },
  async prerender() {
    const postsDir = path.resolve("src/content/posts");
    const slugs = fs.existsSync(postsDir)
      ? fs.readdirSync(postsDir)
          .filter(f => f.endsWith(".md"))
          .map(f => f.replace(/\.md$/, ""))
      : [];
    return [
      "/",
      "/posts",
      "/archives",
      "/search",
      "/about",
      "/thoughts",
      "/404",
      ...slugs.map(s => `/posts/${s}`),
    ];
  },
} satisfies Config;