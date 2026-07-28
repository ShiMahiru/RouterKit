import type { Post } from '@/types/post';
import { markdownToPlainText, countPostWords as _countPostWords } from '../../lib/text-utils';

/** 统计文章字数 */
export function countPostWords(post: Post): number {
  return _countPostWords(post.metadata.title, post.metadata.description, post.rawContent);
}

/** 生成文章搜索文本 */
export function createPostSearchText(post: Post): string {
  return markdownToPlainText(
    [post.metadata.title, post.metadata.description, post.slug, post.rawContent].join(' ')
  ).toLowerCase();
}