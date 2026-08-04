import type { PostMetadata, LoadedPost } from '../src/types/post.ts';
import { parseFrontmatter, comparePostByPinnedAndDate } from '../src/utils/frontmatter.ts';
import { createMarkdownRenderer, enhanceCodeBlocks } from './markdown-renderer.ts';
import { preprocessMarkdown } from './markdown-preprocess.ts';

// Re-export so existing imports continue to work
export { createMarkdownRenderer } from './markdown-renderer.ts';

// Vite bundles all .md files into the client bundle at build time.
const modules = import.meta.glob('/src/content/posts/*.md', { query: '?raw', eager: true });

let _postsCache: LoadedPost[] | null = null;

function toPostMetadata(raw: Record<string, unknown>): PostMetadata {
  return {
    title: (raw.title as string) || '',
    published: (raw.published as string) || '',
    description: (typeof raw.description === 'string' ? raw.description : '') || '',
    image: (typeof raw.image === 'string' ? raw.image : '') || '',
    pinned: raw.pinned === true,
    toc: typeof raw.toc === 'boolean' ? raw.toc : undefined,
  };
}

export function loadAllPosts(): LoadedPost[] {
  if (_postsCache) return _postsCache;

  const posts: LoadedPost[] = [];

  for (const [filePath, raw] of Object.entries(modules)) {
    const slug = filePath.replace(/^\/src\/content\/posts\//, '').replace(/\.md$/, '');
    const { metadata: rawMeta, content } = parseFrontmatter(raw);
    if (rawMeta.draft) continue;

    const metadata = toPostMetadata(rawMeta);
    posts.push({ slug, metadata, content });
  }

  posts.sort((a, b) => comparePostByPinnedAndDate(a.metadata, b.metadata));
  _postsCache = posts;
  return posts;
}

export function loadPostBySlug(slug: string): LoadedPost | undefined {
  return loadAllPosts().find(p => p.slug === slug);
}

export function renderPostHtml(content: string, slug: string, md?: ReturnType<typeof createMarkdownRenderer>): string {
  const renderer = md || createMarkdownRenderer();
  let html = renderer.render(preprocessMarkdown(content));

  html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/g, '');

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