/// <reference types="vite/client" />

declare module 'virtual:posts-data' {
	import type { PrecompiledPost } from '@/types/post';
	export const posts: PrecompiledPost[];
}