import { parseFrontmatter } from "../utils/frontmatter";
import type { Thought, ThoughtMetadata } from "../types/thought";

// Lazy glob — each .md file is a separate code-split chunk.
const modules = import.meta.glob("/content/thoughts/*.md") as Record<
  string,
  () => Promise<{ default: string }>
>;

function toThoughtMetadata(raw: Record<string, unknown>): ThoughtMetadata {
  return {
    date: (raw.date as string) || "",
    images: Array.isArray(raw.images)
      ? raw.images.filter((i): i is string => typeof i === "string")
      : undefined,
    audio: typeof raw.audio === "string" ? raw.audio : undefined,
  };
}

let _cache: Thought[] | null = null;
let _loadPromise: Promise<Thought[]> | null = null;

export async function loadAllThoughts(): Promise<Thought[]> {
  if (_cache) return _cache;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    const entries = Object.entries(modules);
    const results = await Promise.all(
      entries.map(async ([filePath, loader]) => {
        const mod = await loader();
        const raw = mod.default;
        const slug = filePath
          .replace(/^\/content\/thoughts\//, "")
          .replace(/\.md$/, "");
        const { metadata: rawMeta, content } = parseFrontmatter(raw);
        const metadata = toThoughtMetadata(rawMeta);
        return { slug, metadata, content: content.trim() };
      })
    );

    results.sort((a, b) => {
      const ta = new Date(a.metadata.date).getTime();
      const tb = new Date(b.metadata.date).getTime();
      if (isNaN(ta) && isNaN(tb)) return 0;
      if (isNaN(ta)) return 1;
      if (isNaN(tb)) return -1;
      return tb - ta;
    });

    _cache = results;
    return results;
  })();

  return _loadPromise;
}
