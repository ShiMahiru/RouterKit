import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import type { Post } from '@/types/post';
import { countPostWords } from '@/utils/posts';
import { formatDate } from '@/utils/date';

interface Props {
	posts: Post[];
}

const POSTS_PER_PAGE = 10;

export default function PaperPostList({ posts }: Props) {
	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
	const paginatedPosts = useMemo(
		() => posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE),
		[posts, currentPage]
	);

	if (posts.length === 0) {
		return <div className="pm-empty">暂无文章</div>;
	}

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
				<footer className="pm-page-footer">
					<nav className="pm-pagination" aria-label="分页">
						{currentPage > 1 && (
							<button className="pm-prev" type="button" onClick={() => setCurrentPage(p => p - 1)}>
								«&nbsp;&nbsp;上一页
							</button>
						)}
						{currentPage < totalPages && (
							<button className="pm-next" type="button" onClick={() => setCurrentPage(p => p + 1)}>
								下一页&nbsp;&nbsp;»
							</button>
						)}
					</nav>
				</footer>
			)}
		</>
	);
}
