import { describe, it, expect } from 'vitest';
import { resolvePostAssetPath } from './markdown';

describe('resolvePostAssetPath', () => {
	it('returns empty string for empty input', () => {
		expect(resolvePostAssetPath('slug', '')).toBe('');
	});

	it('returns absolute path unchanged', () => {
		expect(resolvePostAssetPath('post', '/images/hero.webp')).toBe('/images/hero.webp');
	});

	it('returns https URL unchanged', () => {
		expect(resolvePostAssetPath('post', 'https://example.com/img.webp'))
			.toBe('https://example.com/img.webp');
	});

	it('returns http URL unchanged', () => {
		expect(resolvePostAssetPath('post', 'http://example.com/img.webp'))
			.toBe('http://example.com/img.webp');
	});

	it('prefixes relative path with /posts/:slug/', () => {
		expect(resolvePostAssetPath('my-post', 'img/cover.webp'))
			.toBe('/posts/my-post/img/cover.webp');
	});

	it('handles nested relative paths', () => {
		expect(resolvePostAssetPath('my-post', 'assets/images/photo.webp'))
			.toBe('/posts/my-post/assets/images/photo.webp');
	});

	it('handles filename-only relative path', () => {
		expect(resolvePostAssetPath('slug', 'screenshot.png'))
			.toBe('/posts/slug/screenshot.png');
	});
});