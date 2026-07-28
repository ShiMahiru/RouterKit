import YAML from 'yaml';

/**
 * 解析 markdown frontmatter（YAML 格式）。
 * 使用 yaml 库替代手写解析器，更健壮地处理各种 YAML 语法。
 */
export function parseFrontmatter(raw: string): { metadata: Record<string, unknown>; content: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)---(?:\r?\n|$)/);
	if (!match) return { metadata: {}, content: raw };

	const content = raw.slice(match[0].length).trim();
	const parsed = YAML.parse(match[1]);

	// YAML 解析可能返回 null 或非对象
	const rawMeta: Record<string, unknown> =
		parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? { ...parsed as Record<string, unknown> }
			: {};

	// 将 Date 对象转为 ISO 日期字符串（如 published: 2026-05-06）
	const metadata: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(rawMeta)) {
		metadata[key] = value instanceof Date ? value.toISOString().slice(0, 10) : value;
	}

	return { metadata, content };
}

/** 文章排序比较器：置顶优先，然后按发布日期降序 */
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