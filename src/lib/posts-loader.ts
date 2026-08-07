import type { PostMetadata, LoadedPost } from "../types/post";
import { parseFrontmatter, comparePostByPinnedAndDate } from "../utils/frontmatter";
import { createMarkdownRenderer, enhanceCodeBlocks } from "./markdown-renderer";
import { preprocessMarkdown } from "./markdown-preprocess";
import { markdownToPlainText } from "./text-utils";

export { createMarkdownRenderer } from "./markdown-renderer";

// Lazy glob: each .md file is a separate code-split chunk,
// loaded only when first accessed (not in initial bundle).
const modules = import.meta.glob("/content/posts/*.md") as Record<
  string,
  () => Promise<{ default: string }>
>;

let _postsCache: LoadedPost[] | null = null;
let _loadPromise: Promise<LoadedPost[]> | null = null;

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

export async function loadAllPosts(): Promise<LoadedPost[]> {
  if (_postsCache) return _postsCache;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    const entries = Object.entries(modules);
    const posts: LoadedPost[] = [];

    // Load all metadata in parallel (each file is a separate chunk)
    const results = await Promise.all(
      entries.map(async ([filePath, loader]) => {
        const mod = await loader();
        const raw = mod.default;
        const slug = filePath
          .replace(/^\/content\/posts\//, "")
          .replace(/\.md$/, "");
        const { metadata: rawMeta } = parseFrontmatter(raw);
        if (rawMeta.draft) return null;
        return { slug, metadata: toPostMetadata(rawMeta), content: raw };
      })
    );

    for (const r of results) {
      if (r) posts.push(r);
    }

    posts.sort((a, b) =>
      comparePostByPinnedAndDate(a.metadata, b.metadata)
    );
    _postsCache = posts;
    return posts;
  })();

  return _loadPromise;
}

export async function loadPostBySlug(
  slug: string
): Promise<LoadedPost | undefined> {
  const posts = await loadAllPosts();
  return posts.find((p) => p.slug === slug);
}

export function renderPostHtml(
  content: string,
  md?: ReturnType<typeof createMarkdownRenderer>,
  title?: string
): string {
  const renderer = md || createMarkdownRenderer();

  // Strip frontmatter before rendering
  const body = content.replace(/^---\r?\n[\s\S]*?---(?:\r?\n|$)/, "");

  let html = renderer.render(preprocessMarkdown(body));

  // Remove the first h1 only if it duplicates the frontmatter title
  if (title) {
    const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (m) {
      const h1Text = m[1].replace(/<[^>]+>/g, "").trim();
      if (h1Text === title || h1Text.includes(title) || title.includes(h1Text)) {
        html = html.replace(m[0], "");
      }
    }
  }

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

/** Build a plain-text search corpus string for a post (no full html render needed). */
export function createPostSearchTextFromLoaded(post: LoadedPost): string {
  return markdownToPlainText(
    [post.metadata.title, post.metadata.description, post.slug, post.content].join(" ")
  ).toLowerCase();
}
