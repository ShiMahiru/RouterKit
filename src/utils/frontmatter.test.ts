import { describe, it, expect } from 'vitest';
import { parseFrontmatter, comparePostByPinnedAndDate } from './frontmatter';

describe('parseFrontmatter', () => {
	it('parses basic key-value pairs', () => {
		const raw = `---
title: Hello World
published: 2026-01-15
pinned: false
description: A test post
---
# Content here`;

		const { metadata, content } = parseFrontmatter(raw);
		expect(metadata.title).toBe('Hello World');
		expect(metadata.published).toBe('2026-01-15');
		expect(metadata.pinned).toBe(false);
		expect(metadata.description).toBe('A test post');
		expect(content).toBe('# Content here');
	});

	it('converts YAML dates to ISO date strings', () => {
		const raw = `---
published: 2026-05-06
---
content`;

		const { metadata } = parseFrontmatter(raw);
		expect(metadata.published).toBe('2026-05-06');
	});

	it('parses YAML list as tags', () => {
		const raw = `---
title: Tagged Post
tags:
  - tech
  - javascript
  - web
---
content`;

		const { metadata } = parseFrontmatter(raw);
		expect(metadata.tags).toEqual(['tech', 'javascript', 'web']);
	});

	it('parses inline YAML list', () => {
		const raw = `---
tags: [a, b, c]
---
content`;

		const { metadata } = parseFrontmatter(raw);
		expect(metadata.tags).toEqual(['a', 'b', 'c']);
	});

	it('returns empty metadata for content without frontmatter', () => {
		const raw = '# Just markdown\n\nNo frontmatter here.';
		const { metadata, content } = parseFrontmatter(raw);
		expect(metadata).toEqual({});
		expect(content).toBe(raw);
	});

	it('parses quoted strings', () => {
		const raw = `---
title: "Hello, World!"
description: 'A description with special chars: #'
---
content`;

		const { metadata } = parseFrontmatter(raw);
		expect(metadata.title).toBe('Hello, World!');
		expect(metadata.description).toBe('A description with special chars: #');
	});

	it('handles boolean values', () => {
		const raw = `---
pinned: true
draft: false
toc: true
---
content`;

		const { metadata } = parseFrontmatter(raw);
		expect(metadata.pinned).toBe(true);
		expect(metadata.draft).toBe(false);
		expect(metadata.toc).toBe(true);
	});

	it('handles CRLF line endings', () => {
		const raw = '---\r\ntitle: Test\r\n---\r\ncontent';
		const { metadata } = parseFrontmatter(raw);
		expect(metadata.title).toBe('Test');
	});

	it('handles empty frontmatter', () => {
		const raw = '---\n---\ncontent';
		const { metadata, content } = parseFrontmatter(raw);
		expect(metadata).toEqual({});
		expect(content).toBe('content');
	});
});

describe('comparePostByPinnedAndDate', () => {
	it('pinned posts come first', () => {
		const pinned = { pinned: true, published: '2026-01-01' };
		const notPinned = { pinned: false, published: '2026-06-01' };
		expect(comparePostByPinnedAndDate(pinned, notPinned)).toBe(-1);
		expect(comparePostByPinnedAndDate(notPinned, pinned)).toBe(1);
	});

	it('both pinned: sorted by date descending', () => {
		const a = { pinned: true, published: '2026-06-01' };
		const b = { pinned: true, published: '2026-01-01' };
		expect(comparePostByPinnedAndDate(a, b)).toBeLessThan(0);
	});

	it('both not pinned: sorted by date descending', () => {
		const a = { pinned: false, published: '2026-06-01' };
		const b = { pinned: false, published: '2026-01-01' };
		expect(comparePostByPinnedAndDate(a, b)).toBeLessThan(0);
	});

	it('same pinned and date: returns 0', () => {
		const a = { pinned: false, published: '2026-01-01' };
		const b = { pinned: false, published: '2026-01-01' };
		expect(comparePostByPinnedAndDate(a, b)).toBe(0);
	});

	it('handles invalid dates gracefully', () => {
		const a = { pinned: false, published: 'invalid' };
		const b = { pinned: false, published: '2026-01-01' };
		expect(comparePostByPinnedAndDate(a, b)).toBe(1);
		expect(comparePostByPinnedAndDate(b, a)).toBe(-1);
	});
});