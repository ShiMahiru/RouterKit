import { createBrowserRouter } from 'react-router';
import Layout from '@/pages/Layout';
import PostsPage from '@/pages/PostsPage';
import PostDetailPage from '@/pages/PostDetailPage';
import ArchivesPage from '@/pages/ArchivesPage';
import SearchPage from '@/pages/SearchPage';
import NotFoundPage from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
	{
		element: <Layout />,
		children: [
			{ index: true, element: <PostsPage /> },
			{ path: 'posts', element: <PostsPage /> },
			{ path: 'posts/:slug', element: <PostDetailPage /> },
			{ path: 'archives', element: <ArchivesPage /> },
			{ path: 'search', element: <SearchPage /> },
			{ path: '*', element: <NotFoundPage /> }
		]
	}
]);
