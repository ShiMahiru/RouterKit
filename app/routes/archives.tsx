import { useLoaderData } from "react-router";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { siteConfig } from "@/config";
import { loadAllPosts } from "../../lib/posts-loader";

export const meta: MetaFunction = () => [
  { title: `归档 - ${siteConfig.title}` },
  { name: "description", content: `文章归档 - ${siteConfig.description}` },
  { property: "og:title", content: `归档 - ${siteConfig.title}` },
  { property: "og:url", content: `${siteConfig.url}/archives/` },
  { tagName: "link", rel: "canonical", href: `${siteConfig.url}/archives/` },
];

export async function loader() {
  const posts = loadAllPosts();
  return { posts: posts.map(p => ({
    slug: p.slug,
    title: p.metadata.title,
    published: p.metadata.published,
  })) };
}

export default function Archives() {
  const { posts } = useLoaderData<typeof loader>();

  // 按年-月分组
  const groups = new Map<number, Map<string, typeof posts>>();
  for (const post of posts) {
    const d = new Date(post.published);
    if (isNaN(d.getTime())) continue;
    const year = d.getFullYear();
    const month = d.toLocaleDateString("zh-CN", { month: "long" });
    if (!groups.has(year)) groups.set(year, new Map());
    const months = groups.get(year)!;
    if (!months.has(month)) months.set(month, []);
    months.get(month)!.push(post);
  }

  return (
    <main className="pm-main">
      <header className="pm-page-header"><h1>归档</h1></header>
      <div className="pm-archive-posts">
        {Array.from(groups.entries()).map(([year, months]) => {
          const count = Array.from(months.values()).reduce((s, p) => s + p.length, 0);
          return (
            <section key={year} className="pm-archive-year">
              <h2>{year}<sup className="pm-archive-count">{count}</sup></h2>
              {Array.from(months.entries()).map(([month, monthPosts]) => (
                <div key={month} className="pm-archive-month">
                  <h3 className="pm-archive-month-header">{month}</h3>
                  <div className="pm-archive-entries">
                    {monthPosts.map(post => {
                      const day = new Date(post.published).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
                      return (
                        <article key={post.slug} className="pm-archive-entry">
                          <div className="pm-archive-meta">{day}</div>
                          <h4 className="pm-archive-entry-title">
                            <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                          </h4>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}