import { Outlet } from 'react-router';

/**
 * PostRenderer is a layout route that simply renders the child route (PostDetailPage).
 * Image path resolution is handled entirely by PostDetailPage during Markdown rendering.
 */
export default function PostRenderer() {
	return <Outlet />;
}
