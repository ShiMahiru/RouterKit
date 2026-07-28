

export function resolvePostAssetPath(slug: string, path: string): string {
	if (!path) return '';

	if (path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://')) {
		return path;
	}

	return `/posts/${slug}/${path}`;
}
