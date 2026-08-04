import { useEffect, useRef, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import MiniSearch from "minisearch";
import { siteConfig } from "@/config";
import { loadAllPosts } from "../../lib/posts-loader";
import { createPostSearchText } from "@/utils/posts";

export const meta = () => [{ title: `搜索 - ${siteConfig.title}` }];

export async function clientLoader() {
  const posts = loadAllPosts();
  const searchItems = posts.map(p => ({
    slug: p.slug,
    title: p.metadata.title,
    description: p.metadata.description,
    searchText: createPostSearchText({
      slug: p.slug,
      metadata: p.metadata,
      html: "",
      rawContent: p.content,
    }),
  }));

  const ms = new MiniSearch({
    fields: ["title", "description", "searchText"],
    storeFields: ["title", "description", "slug"],
    searchOptions: { prefix: true, fuzzy: 0.2 },
  });
  ms.addAll(searchItems.map((p, i) => ({ ...p, id: i })));

  return { searchIndex: ms.toJSON() };
}

export default function Search() {
  const { searchIndex } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ slug: string; title: string; description: string }[]>([]);

  const searcher = useRef<MiniSearch | null>(null);
  useEffect(() => {
    searcher.current = MiniSearch.loadJSON(JSON.stringify(searchIndex), {
      fields: ["title", "description", "searchText"],
      storeFields: ["title", "description", "slug"],
      searchOptions: { prefix: true, fuzzy: 0.2 },
    });
  }, [searchIndex]);

  useEffect(() => {
    if (!query.trim() || !searcher.current) {
      setResults([]);
      return;
    }
    setResults(
      searcher.current.search(query).map(r => ({
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
      <header className="pm-page-header"><h1>搜索</h1></header>
      <div className="pm-searchbox">
        <input
          ref={inputRef}
          type="search"
          placeholder="搜索文章"
          aria-label="搜索文章"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && results.length > 0) {
              navigate(`/posts/${results[0].slug}?highlight=${encodeURIComponent(query)}`);
            }
          }}
        />
      </div>
      {query.trim() && results.length > 0 && (
        <ul className="pm-search-results">
          {results.map(r => (
            <li key={r.slug}>
              <Link to={`/posts/${r.slug}?highlight=${encodeURIComponent(query)}`}>
                <strong>{r.title}</strong>
                {r.description && <span> — {r.description}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {query.trim() && results.length === 0 && (
        <div className="pm-empty">未找到相关文章</div>
      )}
    </main>
  );
}