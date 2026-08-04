import { parseFrontmatter } from '../src/utils/frontmatter.ts';
import type { Thought, ThoughtMetadata } from '../src/types/thought.ts';

// Vite bundles all .md files into the client bundle at build time.
const modules = import.meta.glob('/src/content/thoughts/*.md', { eager: true }) as Record<string, { default: string }>;

function toThoughtMetadata(raw: Record<string, unknown>): ThoughtMetadata {
  return {
    date: (raw.date as string) || '',
    images: Array.isArray(raw.images)
      ? raw.images.filter((i): i is string => typeof i === 'string')
      : undefined,
  };
}

export function loadAllThoughts(): Thought[] {
  const thoughts: Thought[] = [];

  for (const [filePath, mod] of Object.entries(modules)) {
    const raw = mod.default;
    const slug = filePath.replace(/^\/src\/content\/thoughts\//, '').replace(/\.md$/, '');
    const { metadata: rawMeta, content } = parseFrontmatter(raw);
    const metadata = toThoughtMetadata(rawMeta);
    thoughts.push({ slug, metadata, content: content.trim() });
  }

  thoughts.sort((a, b) => {
    const ta = new Date(a.metadata.date).getTime();
    const tb = new Date(b.metadata.date).getTime();
    if (isNaN(ta) && isNaN(tb)) return 0;
    if (isNaN(ta)) return 1;
    if (isNaN(tb)) return -1;
    return tb - ta;
  });

  return thoughts;
}