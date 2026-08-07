import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MiniSearch from "minisearch";
import SEO from "@/components/common/SEO";
import { loadAllPosts, createPostSearchTextFromLoaded } from "@/lib/posts-loader";

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { slug: string; title: string; description: string }[]
  >([]);
  const searcherRef = useRef<MiniSearch | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadAllPosts().then((posts) => {
      if (cancelled) return;
      const searchItems = posts.map((p) => ({
        slug: p.slug,
        title: p.metadata.title,
        description: p.metadata.description,
        searchText: createPostSearchTextFromLoaded(p),
      }));

      const ms = new MiniSearch({
        fields: ["title", "description", "searchText"],
        storeFields: ["title", "description", "slug"],
        searchOptions: { prefix: true, fuzzy: 0.2 },
      });
      ms.addAll(searchItems.map((p, i) => ({ ...p, id: i })));
      searcherRef.current = ms;
      setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!query.trim() || !searcherRef.current) {
      setResults([]);
      return;
    }
    setResults(
      searcherRef.current.search(query).map((r) => ({
        slug: r.slug,
        title: r.title,
        description: r.description,
      }))
    );
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <main className="pm-main">
      <SEO title="搜索" />
      <header className="pm-page-header">
        <h1>搜索</h1>
      </header>
      <div className="pm-searchbox">
        <input
          ref={inputRef}
          type="search"
          placeholder="搜索文章"
          aria-label="搜索文章"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) {
              navigate(
                `/posts/${results[0].slug}?highlight=${encodeURIComponent(query)}`
              );
            }
          }}
        />
      </div>
      {query.trim() && results.length > 0 && (
        <ul className="pm-search-results">
          {results.map((r) => (
            <li key={r.slug}>
              <Link
                to={`/posts/${r.slug}?highlight=${encodeURIComponent(query)}`}
              >
                <strong>{r.title}</strong>
                {r.description && <span> — {r.description}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {query.trim() && results.length === 0 && ready && (
        <div className="pm-empty">未找到相关文章</div>
      )}
    </main>
  );
}
