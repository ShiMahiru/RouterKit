import { Link } from 'react-router';
import type { Post } from '@/types/post';
import { formatDate } from '@/utils/date';

interface Props {
	post: Post;
}

export default function ArticleHeader({ post }: Props) {
	return (
		<header className="pm-post-header">
			<nav className="pm-breadcrumbs" aria-label="Breadcrumb">
				<Link to="/posts" aria-label="返回文章列表">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
						strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<polyline points="15 18 9 12 15 6" />
					</svg>
				</Link>
				<span>{formatDate(post.metadata.published).replace(
					/^(\d{4})-(\d{2})-(\d{2})$/,
					'$1年$2月$3日'
				)}</span>
			</nav>
			<h1 className="pm-post-title pm-entry-hint-parent">{post.metadata.title}</h1>
			<div className="pm-post-description">{post.metadata.description}</div>
		</header>
	);
}