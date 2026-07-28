import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { Post } from '@/types/post';
import { countPostWords } from '@/utils/posts';
import { formatDate } from '@/utils/date';

interface Props {
  posts: Post[];
}

const POSTS_PER_PAGE = 10;

export default function PaperPostList({ posts }: Props) {
  const [searchParams] = useSearchParams();
  const rawPage = Number(searchParams.get('page') || '0');
  const currentPage = Number.isFinite(rawPage) && rawPage >= 0 ? rawPage : 0;
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages - 1);

  const paginatedPosts = useMemo(
    () => posts.slice(safePage * POSTS_PER_PAGE, (safePage + 1) * POSTS_PER_PAGE),
    [posts, safePage]
  );

  if (posts.length === 0) {
    return <div className="pm-empty">暂无文章</div>;
  }

  const prevTo = safePage === 1 ? '/posts' : `/posts?page=${safePage - 1}`;
  const nextTo = `/posts?page=${safePage + 1}`;

  return (
    <>
      {paginatedPosts.map(post => (
        <article key={post.slug} className="pm-post-entry">
          {post.metadata.image && (
            <figure className="pm-entry-cover">
              <img loading="lazy" src={post.metadata.image} alt="" />
            </figure>
          )}

          <header className="pm-entry-header">
            <h2 className="pm-entry-hint-parent">{post.metadata.title}</h2>
          </header>

          <div className="pm-entry-content">
            <p>{post.metadata.description}</p>
          </div>

          <footer className="pm-entry-footer">
            {post.metadata.pinned && <span className="pm-entry-pinned">置顶</span>}
            {post.metadata.pinned && <>&nbsp;·&nbsp;</>}
            <span title={post.metadata.published}>{formatDate(post.metadata.published)}</span>
            &nbsp;·&nbsp;
            <span>{countPostWords(post)} 字</span>
          </footer>

          <Link className="pm-entry-link" aria-label={`文章链接：${post.metadata.title}`} to={`/posts/${post.slug}`}></Link>
        </article>
      ))}

      {totalPages > 1 && (
        <nav className="pm-pagination" aria-label="分页">
          {safePage > 0 ? (
            <Link to={prevTo} className="pm-page-btn">
              ← 上一页
            </Link>
          ) : (
            <span className="pm-page-btn pm-page-btn--disabled">← 上一页</span>
          )}

          <span className="pm-page-indicator">{safePage + 1} / {totalPages}</span>

          {safePage < totalPages - 1 ? (
            <Link to={nextTo} className="pm-page-btn">
              下一页 →
            </Link>
          ) : (
            <span className="pm-page-btn pm-page-btn--disabled">下一页 →</span>
          )}
        </nav>
      )}
    </>
  );
}