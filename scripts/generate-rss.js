/**
 * Build-time RSS feed generator.
 * Reads site config from src/config.ts, posts from content/posts/.
 *
 * Output:   dist/rss.xml
 * Invoked:  node scripts/generate-rss.js
 */

import fs from "fs";
import path from "path";
import YAML from "yaml";
import { getSiteConfig } from "./shared-config.js";

const { url: SITE_URL, title: SITE_TITLE, description: SITE_DESCRIPTION } = getSiteConfig();
const POSTS_DIR = path.resolve("content/posts");
const OUTPUT = path.resolve("dist/rss.xml");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)---(?:\r?\n|$)/);
  if (!match) return { metadata: {}, content: raw };
  const content = raw.slice(match[0].length).trim();
  const parsed = YAML.parse(match[1]);
  const metadata = (parsed && typeof parsed === "object" && !Array.isArray(parsed))
    ? { ...parsed }
    : {};
  return { metadata, content };
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log("  content/posts/ not found, skipping RSS generation.");
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

  const posts = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { metadata } = parseFrontmatter(raw);
    if (metadata.draft) continue;
    const slug = file.replace(/\.md$/, "");
    posts.push({
      title: metadata.title || slug,
      description: metadata.description || "",
      published: metadata.published || "",
      url: `${SITE_URL}/posts/${slug}`,
    });
  }

  posts.sort((a, b) => {
    const ta = new Date(a.published).getTime();
    const tb = new Date(b.published).getTime();
    if (isNaN(ta)) return 1;
    if (isNaN(tb)) return -1;
    return tb - ta;
  });

  const now = new Date().toUTCString();

  const items = posts.map((p) => {
    const date = new Date(p.published);
    const pubDate = isNaN(date.getTime()) ? now : date.toUTCString();
    return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${p.url}</link>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${p.url}</guid>
    </item>`;
  }).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-cn</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, rss);
  console.log(`  RSS feed generated: dist/rss.xml (${posts.length} items)`);
}

main();
