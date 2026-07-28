import { Link } from 'react-router';
import type { Post } from '@/types/post';
import { formatDate } from '@/utils/date';
import { countPostWords } from '@/utils/posts';

interface Props {
	post: Post;
}

export default function ArticleHeader({ post }: Props) {
	return (
		<header className="pm-post-header">
			<nav className="pm-breadcrumbs" aria-label="Breadcrumb">
				<Link to="/">主页</Link>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
					strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
					<polyline points="9 18 15 12 9 6" />
				</svg>
				<Link to="/posts">文章</Link>
			</nav>
			<h1 className="pm-post-title pm-entry-hint-parent">{post.metadata.title}</h1>
			<div className="pm-post-description">{post.metadata.description}</div>
			<div className="pm-post-meta">
				<span title={post.metadata.published}>{formatDate(post.metadata.published)}</span>
				&nbsp;·&nbsp;
				<span>{post.wordCount ?? countPostWords(post)} 字</span>
			</div>
		</header>
	);
}