import { describe, it, expect } from 'vitest';
import { countPostWords, createPostSearchText } from './posts';
import type { Post } from '@/types/post';

function makePost(overrides: Partial<Post> = {}): Post {
	return {
		slug: 'test-post',
		metadata: {
			title: 'Test Title',
			image: '',
			published: '2026-01-01',
			pinned: false,
			description: 'A test description',
		},
		html: '<p>Hello</p>',
		rawContent: 'Hello world',
		...overrides,
	};
}

describe('countPostWords', () => {
	it('counts Chinese characters', () => {
		const post = makePost({
			rawContent: '你好世界',
			metadata: { ...makePost().metadata, title: '标题', description: '描述' },
		});

		expect(countPostWords(post)).toBe(8);
	});

	it('counts English words', () => {
		const post = makePost({
			rawContent: 'hello world from the blog',
			metadata: { ...makePost().metadata, title: 'My Title', description: 'A desc' },
		});

		expect(countPostWords(post)).toBe(9);
	});

	it('counts mixed Chinese and English', () => {
		const post = makePost({
			rawContent: '这是一篇 blog 文章 about React',
			metadata: { ...makePost().metadata, title: '测试', description: '' },
		});

		expect(countPostWords(post)).toBe(11);
	});

	it('strips markdown syntax before counting', () => {
		const post = makePost({
			rawContent: '**bold** `code` [link](url) ![img](url)',
			metadata: { ...makePost().metadata, title: 'Test', description: '' },
		});

		expect(countPostWords(post)).toBe(4);
	});

	it('strips code blocks entirely', () => {
		const post = makePost({
			rawContent: 'before ```js\nconst x = 1;\n``` after',
			metadata: { ...makePost().metadata, title: 'T', description: '' },
		});

		expect(countPostWords(post)).toBe(3);
	});
});

describe('createPostSearchText', () => {
	it('combines title, description, slug, and content into lowercase', () => {
		const post = makePost({
			slug: 'My-Slug',
			metadata: {
				...makePost().metadata,
				title: 'Hello World',
				description: 'A Great Post',
			},
			rawContent: 'This is the body.',
		});
		const text = createPostSearchText(post);
		expect(text).toContain('hello world');
		expect(text).toContain('a great post');
		expect(text).toContain('my');
		expect(text).toContain('slug');
		expect(text).toContain('this is the body');
	});

	it('strips markdown formatting', () => {
		const post = makePost({
			rawContent: '**bold** and `code`',
		});
		const text = createPostSearchText(post);
		expect(text).toContain('bold');
		expect(text).toContain('code');
		expect(text).not.toContain('**');
		expect(text).not.toContain('`');
	});

	it('strips HTML tags', () => {
		const post = makePost({
			rawContent: '<div>hello</div> <span>world</span>',
		});
		const text = createPostSearchText(post);
		expect(text).toContain('hello');
		expect(text).toContain('world');
		expect(text).not.toContain('<div>');
	});
});
