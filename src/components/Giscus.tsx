import { useEffect, useRef } from 'react';
import { siteConfig } from '@/config';

const giscus = siteConfig.giscus;
const maxAttempts = 5;

function resolvedTheme() {
	const theme = document.documentElement.dataset.theme;
	if (theme === 'dark' || theme === 'light') return theme;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Giscus() {
	const containerRef = useRef<HTMLDivElement>(null);
	const attemptsRef = useRef(0);
	const retryTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const watchdogTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const observerRef = useRef<MutationObserver>(undefined);
	const mediaQueryRef = useRef<MediaQueryList>(undefined);

	function updateTheme() {
		const iframe = containerRef.current?.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
		if (!iframe?.contentWindow) return;
		iframe.contentWindow.postMessage(
			{ giscus: { setConfig: { theme: resolvedTheme() } } },
			'https://giscus.app'
		);
	}

	function clearGiscus() {
		if (containerRef.current) containerRef.current.replaceChildren();
	}

	function scheduleRetry() {
		if (!containerRef.current || attemptsRef.current >= maxAttempts) return;
		if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
		retryTimerRef.current = setTimeout(() => {
			if (containerRef.current?.querySelector('iframe.giscus-frame')) return;
			loadGiscus(true);
		}, 2200);
	}

	function startWatchdog() {
		if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
		watchdogTimerRef.current = setTimeout(() => {
			const iframe = containerRef.current?.querySelector('iframe.giscus-frame');
			if (iframe) { updateTheme(); return; }
			scheduleRetry();
		}, 3000);
	}

	function loadGiscus(force = false) {
		const container = containerRef.current;
		if (!container) return;
		if (!force && container.querySelector('iframe.giscus-frame')) { updateTheme(); return; }
		if (!force && container.querySelector('script')) return;
		attemptsRef.current += 1;
		clearGiscus();

		const script = document.createElement('script');
		script.src = giscus.src;
		script.setAttribute('data-repo', giscus.repo);
		script.setAttribute('data-repo-id', giscus.repoId);
		script.setAttribute('data-category', giscus.category);
		script.setAttribute('data-category-id', giscus.categoryId);
		script.setAttribute('data-mapping', giscus.mapping);
		script.setAttribute('data-strict', giscus.strict);
		script.setAttribute('data-reactions-enabled', giscus.reactionsEnabled);
		script.setAttribute('data-emit-metadata', giscus.emitMetadata);
		script.setAttribute('data-input-position', giscus.inputPosition);
		script.setAttribute('data-theme', resolvedTheme());
		script.setAttribute('data-lang', giscus.lang);
		script.setAttribute('data-loading', giscus.loading);
		script.setAttribute('crossorigin', 'anonymous');
		script.async = true;
		script.onload = startWatchdog;
		script.onerror = scheduleRetry;
		container.appendChild(script);
		startWatchdog();
	}

	useEffect(() => {
		observerRef.current = new MutationObserver(() => updateTheme());
		observerRef.current.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme', 'class']
		});

		mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQueryRef.current.addEventListener('change', updateTheme);

		requestAnimationFrame(() => loadGiscus());

		return () => {
			if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
			if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
			observerRef.current?.disconnect();
			mediaQueryRef.current?.removeEventListener('change', updateTheme);
		};
	}, []);

	return <div id="giscus-container" ref={containerRef} className="pm-comments"></div>;
}
