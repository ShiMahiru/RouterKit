// 通过 cdnjs 加载 highlight.js + 主题 CSS，按需加载语言 <script>
// 不打包任何 hljs 代码到本地 bundle

const VER = '11.11.1';
const BASE = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${VER}`;
const THEME_URL = `${BASE}/styles/github.min.css`;
const CORE_URL = `${BASE}/highlight.min.js`;
const DEBUG = false;

// cdnjs 的 highlight.min.js 已内置以下 common 语言
const BUILTIN_LANGS = new Set([
	'bash', 'c', 'cpp', 'csharp', 'css', 'diff', 'go', 'graphql', 'ini',
	'java', 'javascript', 'json', 'kotlin', 'less', 'lua', 'makefile',
	'markdown', 'objectivec', 'perl', 'php', 'php-template', 'plaintext',
	'python', 'python-repl', 'r', 'ruby', 'rust', 'scss', 'shell', 'sql',
	'swift', 'typescript', 'vbnet', 'wasm', 'xml', 'yaml'
]);

const PRELOAD_LANGS = [
	'bash', 'shell', 'go', 'rust', 'python', 'json', 'yaml', 'xml',
	'css', 'sql', 'cpp', 'csharp', 'java', 'javascript', 'typescript',
	'php', 'ruby', 'kotlin', 'swift', 'dockerfile', 'ini', 'powershell'
];

interface HljsResult {
	value: string;
	language?: string;
	relevance?: number;
}
interface HljsLike {
	highlight(code: string, opts: { language: string }): HljsResult;
	highlightAuto(code: string, languages?: string[]): HljsResult;
	getLanguage(name: string): unknown;
}
declare global {
	interface Window {
		hljs?: HljsLike;
	}
}

let corePromise: Promise<HljsLike> | null = null;
let langsPromise: Promise<void> | null = null;
let themeInjected = false;
const loadedLangs = new Set<string>();

function log(...args: unknown[]) {
	if (DEBUG) console.debug(...args);
}

const LANG_ALIASES: Record<string, string> = {
	js: 'javascript', ts: 'typescript', sh: 'bash', zsh: 'bash',
	yml: 'yaml', md: 'markdown', html: 'xml', htm: 'xml', svg: 'xml',
	'c++': 'cpp', 'c#': 'csharp'
};

function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (document.querySelector(`script[data-hljs-src="${src}"]`)) {
			resolve();
			return;
		}
		const s = document.createElement('script');
		s.src = src;
		s.async = true;
		s.setAttribute('data-hljs-src', src);
		s.onload = () => { log('[hljs] loaded script:', src); resolve(); };
		s.onerror = (e) => { console.error('[hljs] failed script:', src, e); reject(e); };
		document.head.appendChild(s);
	});
}

function ensureTheme() {
	if (themeInjected) return;
	if (document.querySelector('link[data-hljs-theme]')) {
		themeInjected = true;
		return;
	}
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = THEME_URL;
	link.setAttribute('data-hljs-theme', 'github');
	link.onload = () => log('[hljs] theme CSS loaded');
	link.onerror = (e) => console.error('[hljs] theme CSS failed', e);
	document.head.appendChild(link);
	themeInjected = true;
}

async function getCore(): Promise<HljsLike> {
	if (window.hljs) return window.hljs;
	if (!corePromise) {
		log('[hljs] loading core...');
		corePromise = loadScript(CORE_URL).then(() => {
			if (!window.hljs) throw new Error('window.hljs not present after script load');
			log('[hljs] core ready');
			return window.hljs;
		});
	}
	return corePromise;
}

async function ensureLang(name: string): Promise<boolean> {
	const real = LANG_ALIASES[name] || name;
	if (loadedLangs.has(real)) return true;
	if (window.hljs?.getLanguage(real)) {
		loadedLangs.add(real);
		return true;
	}
	if (BUILTIN_LANGS.has(real)) {
		loadedLangs.add(real);
		return true;
	}
	try {
		await loadScript(`${BASE}/languages/${real}.min.js`);
		loadedLangs.add(real);
		return true;
	} catch {
		return false;
	}
}

async function preloadLangs() {
	if (!langsPromise) {
		langsPromise = Promise.all(PRELOAD_LANGS.map(ensureLang)).then(() => {
			log(`[hljs] preloaded ${loadedLangs.size} langs`);
		});
	}
	return langsPromise;
}

export async function highlightCodeBlocksIn(container: HTMLElement | null | undefined) {
	log('[hljs] highlightCodeBlocksIn called, container:', container);
	if (!container) return;

	const blocks = container.querySelectorAll<HTMLElement>('pre > code');
	log(`[hljs] selector "pre > code" matched ${blocks.length} blocks`);
	if (blocks.length === 0) return;

	ensureTheme();
	const hljs = await getCore();
	await preloadLangs();

	let i = 0;
	for (const code of Array.from(blocks)) {
		i++;
		if ((code as HTMLElement).dataset.hljsRendered === '1') continue;

		const cls = code.className || '';
		const m = cls.match(/language-([\w+#-]+)/i);
		const requested = (m && m[1].toLowerCase()) || ((code as HTMLElement).dataset.language || '').toLowerCase();
		const text = code.textContent || '';

		try {
			let result: HljsResult;
			if (requested) {
				const ok = await ensureLang(requested);
				const real = LANG_ALIASES[requested] || requested;
				if (ok && hljs.getLanguage(real)) {
					result = hljs.highlight(text, { language: real });
					code.classList.add(`language-${real}`);
				} else {
					result = hljs.highlightAuto(text, PRELOAD_LANGS);
					if (result.language) code.classList.add(`language-${result.language}`);
				}
			} else {
				result = hljs.highlightAuto(text, PRELOAD_LANGS);
				if (result.language) code.classList.add(`language-${result.language}`);
			}
			code.innerHTML = result.value;
			code.classList.add('hljs');
			(code as HTMLElement).dataset.hljsRendered = '1';
		} catch (err) {
			console.error(`[hljs] block ${i}: highlight failed`, err);
		}
	}
	log(`[hljs] done, processed ${i} blocks`);
}
