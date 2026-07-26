import { createBrowserRouter } from 'react-router';
import Layout from './routes/Layout';
import HomePage from './routes/HomePage';
import PostsPage from './routes/PostsPage';
import PostDetailPage from './routes/PostDetailPage';
import ArchivesPage from './routes/ArchivesPage';
import TagsPage from './routes/TagsPage';
import TagPage from './routes/TagPage';
import PostRenderer from './routes/PostRenderer';

export const router = createBrowserRouter([
	{
		element: <Layout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: 'posts', element: <PostsPage /> },
			{
				path: 'posts/:slug',
				element: <PostRenderer />,
				children: [{ index: true, element: <PostDetailPage /> }]
			},
			{ path: 'archives', element: <ArchivesPage /> },
			{ path: 'tags', element: <TagsPage /> },
			{ path: 'tags/:tag', element: <TagPage /> }
		]
	}
]);
