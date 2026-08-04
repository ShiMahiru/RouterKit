import YAML from 'yaml';

export function parseFrontmatter(raw: string): { metadata: Record<string, unknown>; content: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)---(?:\r?\n|$)/);
	if (!match) return { metadata: {}, content: raw };

	const content = raw.slice(match[0].length).trim();
	const parsed = YAML.parse(match[1]);

	const rawMeta: Record<string, unknown> =
		parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? { ...parsed as Record<string, unknown> }
			: {};

	const metadata: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(rawMeta)) {
		metadata[key] = value instanceof Date ? value.toISOString().slice(0, 10) : value;
	}

	return { metadata, content };
}

export function comparePostByPinnedAndDate(
	a: { pinned: boolean; published: string },
	b: { pinned: boolean; published: string }
): number {
	if (a.pinned && !b.pinned) return -1;
	if (!a.pinned && b.pinned) return 1;
	const ta = new Date(a.published).getTime();
	const tb = new Date(b.published).getTime();
	if (isNaN(ta) && isNaN(tb)) return 0;
	if (isNaN(ta)) return 1;
	if (isNaN(tb)) return -1;
	return tb - ta;
}
