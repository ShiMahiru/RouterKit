// 通过 jsdelivr CDN 加载 mermaid，按需挂到 window.mermaid

const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11.14.0/dist/mermaid.min.js';
const DEBUG = false;

interface MermaidLike {
	initialize(opts: Record<string, unknown>): void;
	render(id: string, text: string): Promise<{ svg: string }>;
}
declare global {
	interface Window {
		mermaid?: MermaidLike;
	}
}

let mermaidPromise: Promise<MermaidLike> | null = null;
let initialized = false;

function log(...args: unknown[]) {
	if (DEBUG) console.debug(...args);
}

function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (document.querySelector(`script[data-mermaid-src="${src}"]`)) {
			resolve();
			return;
		}
		const s = document.createElement('script');
		s.src = src;
		s.async = true;
		s.setAttribute('data-mermaid-src', src);
		s.onload = () => { log('[mermaid] script loaded:', src); resolve(); };
		s.onerror = (e) => { console.error('[mermaid] script failed:', src, e); reject(e); };
		document.head.appendChild(s);
	});
}

async function getMermaid(): Promise<MermaidLike> {
	if (window.mermaid) return window.mermaid;
	if (!mermaidPromise) {
		log('[mermaid] loading core...');
		mermaidPromise = loadScript(MERMAID_CDN).then(() => {
			if (!window.mermaid) throw new Error('window.mermaid not present after script load');
			return window.mermaid;
		});
	}
	return mermaidPromise;
}

function decodeText(pre: HTMLElement): string {
	const lines = pre.querySelectorAll('span[data-line]');
	if (lines.length === 0) return (pre.textContent ?? '').trim();
	return Array.from(lines)
		.map((l) => (l.textContent ?? '').replace(/\u00a0/g, ' '))
		.join('\n')
		.trim();
}

export async function renderMermaidIn(container: HTMLElement | null | undefined) {
	if (!container) return;

	const candidates = new Set<HTMLElement>();
	for (const el of Array.from(
		container.querySelectorAll<HTMLElement>('pre[data-language="mermaid"]')
	))
		candidates.add(el);
	for (const code of Array.from(
		container.querySelectorAll<HTMLElement>('code.language-mermaid, code[class*="language-mermaid"]')
	)) {
		const pre = code.closest('pre') as HTMLElement | null;
		if (pre) candidates.add(pre);
	}
	if (candidates.size === 0) return;
	log(`[mermaid] found ${candidates.size} blocks in container`);

	const mermaid = await getMermaid();
	if (!initialized) {
		const isDark = document.documentElement.classList.contains('dark');
		mermaid.initialize({
			startOnLoad: false,
			theme: isDark ? 'dark' : 'default',
			securityLevel: 'strict',
			fontFamily: 'inherit'
		});
		initialized = true;
	}

	let i = 0;
	for (const pre of candidates) {
		const code = decodeText(pre);
		if (!code) continue;
		const id = `mermaid-${Date.now()}-${i++}`;
		try {
			const { svg } = await mermaid.render(id, code);
			const wrapper = document.createElement('div');
			wrapper.className = 'mermaid-rendered';
			wrapper.innerHTML = svg;
			pre.replaceWith(wrapper);
			log(`[mermaid] block ${i}: rendered`);
		} catch (err) {
			console.error('[mermaid] render failed:', err);
			const errEl = document.createElement('pre');
			errEl.className = 'mermaid-error';
			errEl.textContent = `Mermaid 渲染失败: ${(err as Error).message}\n\n${code}`;
			pre.replaceWith(errEl);
		}
	}
}
