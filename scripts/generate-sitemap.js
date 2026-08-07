/**
 * Build-time sitemap.xml generator.
 * Reads site config from src/config.ts, pages inferred from routing.
 *
 * Output:   dist/sitemap.xml
 * Invoked:  node scripts/generate-sitemap.js
 */

import fs from "fs";
import path from "path";
import YAML from "yaml";
import { getSiteConfig } from "./shared-config.js";

const { url: SITE_URL } = getSiteConfig();
const POSTS_DIR = path.resolve("content/posts");
const OUTPUT = path.resolve("dist/sitemap.xml");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)---(?:\r?\n|$)/);
  if (!match) return {};
  const parsed = YAML.parse(match[1]);
  return (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ? parsed : {};
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
  const urls = [
    { loc: SITE_URL, priority: "1.0", changefreq: "daily" },
    { loc: `${SITE_URL}/posts`, priority: "0.9", changefreq: "daily" },
    { loc: `${SITE_URL}/archives`, priority: "0.7", changefreq: "weekly" },
    { loc: `${SITE_URL}/about`, priority: "0.5", changefreq: "monthly" },
    { loc: `${SITE_URL}/thoughts`, priority: "0.6", changefreq: "weekly" },
    { loc: `${SITE_URL}/search`, priority: "0.3", changefreq: "monthly" },
  ];

  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      const fm = parseFrontmatter(raw);
      if (fm.draft) continue;
      const slug = file.replace(/\.md$/, "");
      urls.push({
        loc: `${SITE_URL}/posts/${slug}`,
        priority: "0.8",
        changefreq: "monthly",
        lastmod: fm.published || undefined,
      });
    }
  }

  const entries = urls.map((u) => {
    const lastmod = u.lastmod ? `    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n` : "";
    return `  <url>
    <loc>${escapeXml(u.loc)}</loc>${lastmod ? "\n" + lastmod : ""}    <priority>${u.priority}</priority>
    <changefreq>${u.changefreq}</changefreq>
  </url>`;
  }).join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, sitemap);
  console.log(`  Sitemap generated: dist/sitemap.xml (${urls.length} URLs)`);

  // Generate robots.txt pointing to sitemap
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  fs.writeFileSync(path.resolve("dist/robots.txt"), robots);
  console.log(`  robots.txt generated: dist/robots.txt`);
}

main();
