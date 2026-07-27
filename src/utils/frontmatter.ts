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

/**
 * 解析 markdown frontmatter（YAML 子集）。
 * 提取在 posts.ts 和 generate-rss.ts 之间共享。
 */
export function parseFrontmatter(raw: string): { metadata: Record<string, unknown>; content: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { metadata: {}, content: raw };
	const body = raw.slice(match[0].length).trim();
	const meta: Record<string, unknown> = {};
	const lines = match[1].split('\n');
	let collectingKey: string | null = null;
	let collectingList: string[] = [];

	for (const line of lines) {
		// 多行列表收集
		if (collectingKey) {
			const listItem = line.match(/^\s+-\s+(.*)$/);
			if (listItem) {
				let item = listItem[1].trim();
				item = item.replace(/^["']|["']$/g, '');
				if (item) collectingList.push(item);
				continue;
			}
			// 列表结束
			meta[collectingKey] = collectingList;
			collectingKey = null;
			collectingList = [];
		}

		const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
		if (!kv) continue;
		const key = kv[1].trim();
		let val = kv[2].trim();

		if (val === 'true' || val === 'false') { meta[key] = val === 'true'; continue; }
		if (val.startsWith('[') && val.endsWith(']')) {
			meta[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
			continue;
		}
		// 值为空 → 可能是多行列表的起始
		if (val === '') {
			collectingKey = key;
			collectingList = [];
			continue;
		}
		if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
		meta[key] = val;
	}
	if (collectingKey) {
		meta[collectingKey] = collectingList;
	}
	return { metadata: meta, content: body };
}