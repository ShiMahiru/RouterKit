import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/common/SEO";
import { loadAllPosts } from "@/lib/posts-loader";

export default function Archives() {
  const [posts, setPosts] = useState<
    { slug: string; title: string; published: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    loadAllPosts().then((all) => {
      if (cancelled) return;
      setPosts(
        all.map((p) => ({
          slug: p.slug,
          title: p.metadata.title,
          published: p.metadata.published,
        }))
      );
    });
    return () => { cancelled = true; };
  }, []);

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
      <SEO title="归档" />
      <header className="pm-page-header">
        <h1>归档</h1>
      </header>
      <div className="pm-archive-posts">
        {Array.from(groups.entries()).map(([year, months]) => {
          const count = Array.from(months.values()).reduce(
            (s, p) => s + p.length,
            0
          );
          return (
            <section key={year} className="pm-archive-year">
              <h2>
                {year}
                <sup className="pm-archive-count">{count}</sup>
              </h2>
              {Array.from(months.entries()).map(([month, monthPosts]) => (
                <div key={month} className="pm-archive-month">
                  <h3 className="pm-archive-month-header">{month}</h3>
                  <div className="pm-archive-entries">
                    {monthPosts.map((post) => {
                      const day = new Date(post.published).toLocaleDateString(
                        "zh-CN",
                        { day: "2-digit" }
                      );
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
