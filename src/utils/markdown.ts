

export function resolvePostAssetPath(path: string): string {
	if (!path) return '';

	if (path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://')) {
		return path;
	}

	return `/posts/${path}`;
}
