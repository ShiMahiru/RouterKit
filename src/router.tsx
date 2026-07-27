import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import Layout from '@/pages/Layout';

const PostsPage = lazy(() => import('@/pages/PostsPage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const ArchivesPage = lazy(() => import('@/pages/ArchivesPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageLoader() {
	return (
		<main className="pm-main">
			<div className="pm-empty" style={{ paddingTop: '80px' }}>
				<p>加载中...</p>
			</div>
		</main>
	);
}

export const router = createBrowserRouter([
	{
		element: <Layout />,
		children: [
			{
				index: true,
				element: (
					<Suspense fallback={<PageLoader />}>
						<PostsPage />
					</Suspense>
				)
			},
			{
				path: 'posts',
				element: (
					<Suspense fallback={<PageLoader />}>
						<PostsPage />
					</Suspense>
				)
			},
			{
				path: 'posts/:slug',
				element: (
					<Suspense fallback={<PageLoader />}>
						<PostDetailPage />
					</Suspense>
				)
			},
			{
				path: 'archives',
				element: (
					<Suspense fallback={<PageLoader />}>
						<ArchivesPage />
					</Suspense>
				)
			},
			{
				path: 'search',
				element: (
					<Suspense fallback={<PageLoader />}>
						<SearchPage />
					</Suspense>
				)
			},
			{
				path: '*',
				element: (
					<Suspense fallback={<PageLoader />}>
						<NotFoundPage />
					</Suspense>
				)
			}
		]
	}
]);