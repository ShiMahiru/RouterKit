import type { Post } from '@/types/post';
import { markdownToPlainText } from '../lib/text-utils';

export function createPostSearchText(post: Post): string {
  return markdownToPlainText(
    [post.metadata.title, post.metadata.description, post.slug, post.rawContent].join(' ')
  ).toLowerCase();
}
