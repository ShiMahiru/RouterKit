import type { Post } from '@/types/post';
import { markdownToPlainText, countPostWords as _countPostWords } from '../../lib/text-utils';

export function countPostWords(post: Post): number {
  return _countPostWords(post.metadata.title, post.metadata.description, post.rawContent);
}

export function createPostSearchText(post: Post): string {
  return markdownToPlainText(
    [post.metadata.title, post.metadata.description, post.slug, post.rawContent].join(' ')
  ).toLowerCase();
}
