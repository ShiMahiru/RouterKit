import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from '../src/utils/frontmatter.ts';
import type { Thought, ThoughtMetadata } from '../src/types/thought.ts';

const THOUGHTS_DIR = path.resolve('src/content/thoughts');

function toThoughtMetadata(raw: Record<string, unknown>): ThoughtMetadata {
  return {
    date: (raw.date as string) || '',
    images: Array.isArray(raw.images)
      ? raw.images.filter((i): i is string => typeof i === 'string')
      : undefined,
  };
}

export function loadAllThoughts(): Thought[] {
  if (!fs.existsSync(THOUGHTS_DIR)) return [];

  const files = fs.readdirSync(THOUGHTS_DIR).filter(name => {
    const f = path.join(THOUGHTS_DIR, name);
    return name.endsWith('.md') && fs.statSync(f).isFile();
  });

  const thoughts: Thought[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(THOUGHTS_DIR, file), 'utf8');
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