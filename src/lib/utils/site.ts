const FALLBACK_SITE_URL = 'https://blog.2x.nz';

export const SITE_LANGUAGE = 'zh-CN';

export function getSiteUrl() {
	const url = (import.meta as any).env?.PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;
	return url.replace(/\/+$/, '');
}

export function toAbsoluteUrl(value: string) {
	if (!value) return '';
	if (/^https?:\/\//i.test(value)) return value;
	if (value.startsWith('//')) return `https:${value}`;
	const path = value.startsWith('/') ? value : `/${value}`;
	return `${getSiteUrl()}${path}`;
}
