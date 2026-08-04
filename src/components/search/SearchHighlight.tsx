import { useEffect } from 'react';

interface Props {
	container: HTMLElement | null;
	terms: string[];
}

function parseQueryTerms(query: string): string[] {
	const terms: string[] = [];
	const re = /"([^"]+)"|(\S+)/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(query)) !== null) {
		const t = (m[1] ?? m[2] ?? '').trim().toLowerCase();
		if (t) terms.push(t);
	}
	return terms;
}

export default function SearchHighlight({ container, terms }: Props) {

	useEffect(() => {
		if (!container || terms.length === 0) return;

		container.querySelectorAll('mark.search-highlight').forEach(mark => {
			mark.replaceWith(document.createTextNode(mark.textContent || ''));
		});

		const escaped = terms
			.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
			.sort((a, b) => b.length - a.length);
		const regex = new RegExp(`(${escaped.join('|')})`, 'gi');

		const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
			acceptNode: (node) => {
				const parent = node.parentElement;
				if (!parent) return NodeFilter.FILTER_REJECT;
				if (
					parent.tagName === 'MARK' ||
					parent.tagName === 'SCRIPT' ||
					parent.tagName === 'STYLE' ||
					parent.closest('pre, code')
				) {
					return NodeFilter.FILTER_REJECT;
				}
				return NodeFilter.FILTER_ACCEPT;
			}
		});

		const textNodes: Text[] = [];
		let node: Node | null;
		while ((node = walker.nextNode())) textNodes.push(node as Text);

		for (const textNode of textNodes) {
			const text = textNode.textContent || '';
			if (!regex.test(text)) continue;
			regex.lastIndex = 0;

			const frag = document.createDocumentFragment();
			let lastIdx = 0;
			let match: RegExpExecArray | null;
			while ((match = regex.exec(text)) !== null) {
				if (match.index > lastIdx) {
					frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
				}
				const mark = document.createElement('mark');
				mark.className = 'search-highlight';
				mark.textContent = match[0];
				frag.appendChild(mark);
				lastIdx = regex.lastIndex;
			}
			if (lastIdx < text.length) {
				frag.appendChild(document.createTextNode(text.slice(lastIdx)));
			}
			textNode.replaceWith(frag);
		}

		setTimeout(() => {
			const firstMark = container.querySelector('mark.search-highlight');
			if (firstMark) {
				const top = (firstMark as HTMLElement).getBoundingClientRect().top + window.scrollY - 100;
				window.scrollTo({ top, behavior: 'smooth' });
			}
		}, 100);
	}, [container, terms]);

	return null;
}

export { parseQueryTerms };
