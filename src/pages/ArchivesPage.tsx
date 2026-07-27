import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { siteConfig } from '@/config';
import { getDisplayPosts } from '@/utils/posts';

function yearOf(dateString: string) { return new Date(dateString).getFullYear(); }
function monthOf(dateString: string) {
	return new Date(dateString).toLocaleDateString('zh-CN', { month: 'long' });
}
function dayOf(dateString: string) {
	return new Date(dateString).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

export default function ArchivesPage() {
	const posts = useMemo(() => getDisplayPosts(), []);

	useEffect(() => {
		document.title = `归档 - ${siteConfig.title}`;
	}, []);

	const groups = useMemo(() => {
		const years = new Map<number, Map<string, typeof posts>>();
		for (const post of posts) {
			const year = yearOf(post.metadata.published);
			const month = monthOf(post.metadata.published);
			if (!years.has(year)) years.set(year, new Map());
			const months = years.get(year)!;
			if (!months.has(month)) months.set(month, []);
			months.get(month)!.push(post);
		}
		return Array.from(years.entries()).map(([year, months]) => ({
			year,
			count: Array.from(months.values()).reduce((sum, p) => sum + p.length, 0),
			months: Array.from(months.entries()).map(([month, p]) => ({ month, posts: p }))
		}));
	}, [posts]);

	return (
		<main className="pm-main">
			<header className="pm-page-header">
				<h1>归档</h1>
			</header>
			{posts.length === 0 ? (
				<div className="pm-empty">暂无文章</div>
			) : (
				<div className="pm-archive-posts">
					{groups.map(group => (
						<section key={group.year} className="pm-archive-year">
							<h2>
								{group.year}
								<sup className="pm-archive-count">{group.count}</sup>
							</h2>
							{group.months.map(m => (
								<div key={m.month} className="pm-archive-month">
									<h3 className="pm-archive-month-header">{m.month}</h3>
									<div className="pm-archive-entries">
										{m.posts.map(post => (
											<article key={post.slug} className="pm-archive-entry">
												<div className="pm-archive-meta">{dayOf(post.metadata.published)}</div>
												<h4 className="pm-archive-entry-title">
													<Link to={`/posts/${post.slug}`}>{post.metadata.title}</Link>
												</h4>
											</article>
										))}
									</div>
								</div>
							))}
						</section>
					))}
				</div>
			)}
		</main>
	);
}
