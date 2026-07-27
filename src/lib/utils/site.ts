/// <reference types="vite/client" />

const FALLBACK_SITE_URL = 'https://2x.nz';

export const SITE_LANGUAGE = 'zh-CN';

export function getSiteUrl(): string {
	const url = import.meta.env.PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;
	return url.replace(/\/+$/, '');
}

export function toAbsoluteUrl(value: string): string {
	if (!value) return '';
	if (/^https?:\/\//i.test(value)) return value;
	if (value.startsWith('//')) return `https:${value}`;
	const path = value.startsWith('/') ? value : `/${value}`;
	return `${getSiteUrl()}${path}`;
}
