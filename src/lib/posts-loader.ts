import type { PostMetadata, LoadedPost } from "../types/post";
import { parseFrontmatter, comparePostByPinnedAndDate } from "../utils/frontmatter";
import { createMarkdownRenderer, enhanceCodeBlocks } from "./markdown-renderer";
import { preprocessMarkdown } from "./markdown-preprocess";

export { createMarkdownRenderer } from "./markdown-renderer";

// Vite bundles all .md files into the client bundle at build time.
const modules = import.meta.glob("/content/posts/*.md", {
  eager: true,
}) as Record<string, { default: string }>;

let _postsCache: LoadedPost[] | null = null;

function toPostMetadata(raw: Record<string, unknown>): PostMetadata {
  return {
    title: (raw.title as string) || "",
    published: (raw.published as string) || "",
    description:
      (typeof raw.description === "string" ? raw.description : "") || "",
    image: (typeof raw.image === "string" ? raw.image : "") || "",
    pinned: raw.pinned === true,
    toc: typeof raw.toc === "boolean" ? raw.toc : undefined,
  };
}

export function loadAllPosts(): LoadedPost[] {
  if (_postsCache) return _postsCache;

  const posts: LoadedPost[] = [];

  for (const [filePath, mod] of Object.entries(modules)) {
    const raw = mod.default;
    const slug = filePath
      .replace(/^\/content\/posts\//, "")
      .replace(/\.md$/, "");
    const { metadata: rawMeta, content } = parseFrontmatter(raw);
    if (rawMeta.draft) continue;

    const metadata = toPostMetadata(rawMeta);
    posts.push({ slug, metadata, content });
  }

  posts.sort((a, b) =>
    comparePostByPinnedAndDate(a.metadata, b.metadata)
  );
  _postsCache = posts;
  return posts;
}

export function loadPostBySlug(
  slug: string
): LoadedPost | undefined {
  return loadAllPosts().find((p) => p.slug === slug);
}

export function renderPostHtml(
  content: string,
  md?: ReturnType<typeof createMarkdownRenderer>
): string {
  const renderer = md || createMarkdownRenderer();
  let html = renderer.render(preprocessMarkdown(content));

  html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/g, "");

  // Fix image paths for any remaining <img> tags not handled by renderer rule
  html = html.replace(
    /(<img\s[^>]*?\bsrc=)("|')(?!\/|https?:\/\/)([^"']+)\2/gi,
    (_m: string, before: string, quote: string, src: string) =>
      `${before}${quote}/posts/${src}${quote}`
  );

  // Add loading="lazy" decoding="async" fetchpriority="low" to images that don't already have a loading attribute
  html = html.replace(
    /<img\s(?!.*?\bloading\b)([^>]*?)>/gi,
    '<img loading="lazy" decoding="async" fetchpriority="low" $1>'
  );

  html = enhanceCodeBlocks(html);

  return html;
}
