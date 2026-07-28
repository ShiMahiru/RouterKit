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
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const page = rawPage;

  const paginatedPosts = useMemo(
    () => posts.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE),
    [posts, page]
  );

  if (posts.length === 0) {
    return <div className="pm-empty">暂无文章</div>;
  }

  const prevTo = page === 1 ? '/posts' : `/posts?page=${page - 1}`;
  const nextTo = `/posts?page=${page + 1}`;

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
            <span>{post.wordCount ?? countPostWords(post)} 字</span>
          </footer>

          <Link className="pm-entry-link" aria-label={`文章链接：${post.metadata.title}`} to={`/posts/${post.slug}`}></Link>
        </article>
      ))}

      {totalPages > 1 && (
        <nav className="pm-pagination" aria-label="分页">
          {page > 0 && (
            <Link to={prevTo} className="pm-page-btn">
              ← 上一页
            </Link>
          )}

          <span className="pm-page-indicator">{page + 1} / {totalPages}</span>

          {page < totalPages - 1 && (
            <Link to={nextTo} className="pm-page-btn">
              下一页 →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}