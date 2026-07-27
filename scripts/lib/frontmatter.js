/**
 * Parse YAML-like frontmatter from raw markdown.
 * Shared between Vite runtime (posts.ts) and build scripts.
 */
export function parseFrontmatter(raw) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { metadata: {}, content: raw };

	const body = raw.slice(match[0].length).trim();
	const meta = {};

	for (const line of match[1].split('\n')) {
		const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
		if (!kv) continue;
		const key = kv[1].trim();
		let val = kv[2].trim();

		if (val === 'true' || val === 'false') {
			meta[key] = val === 'true';
			continue;
		}
		if (val.startsWith('[') && val.endsWith(']')) {
			meta[key] = val
				.slice(1, -1)
				.split(',')
				.map((s) => s.trim().replace(/^["']|["']$/g, ''))
				.filter(Boolean);
			continue;
		}
		if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
			val = val.slice(1, -1);
		}
		meta[key] = val;
	}

	return { metadata: meta, content: body };
}
