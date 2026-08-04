import { useEffect, useRef, useState, useMemo } from 'react';

interface Heading {
	id: string;
	text: string;
	level: number;
}

interface Props {
	container?: HTMLElement | null;
	trigger?: unknown;
}

function slugify(text: string): string {
	return (
		text
			.trim()
			.toLowerCase()
			.replace(/[\s　]+/g, '-')
			.replace(/[^\p{L}\p{N}\-]/gu, '')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '') || 'section'
	);
}

export default function PostToc({ container, trigger }: Props) {
	const [headings, setHeadings] = useState<Heading[]>([]);
	const [activeId, setActiveId] = useState('');
	const observerRef = useRef<IntersectionObserver>(undefined);
	const retryTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	const minLevel = useMemo(
		() => headings.length ? Math.min(...headings.map(h => h.level)) : 1,
		[headings]
	);

	function rebuild(remainingRetries = 4) {
		if (!container) return;

		observerRef.current?.disconnect();
		const els = Array.from(
			container.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6')
		);

		if (els.length === 0 && remainingRetries > 0) {
			retryTimerRef.current = setTimeout(() => rebuild(remainingRetries - 1), 120);
			return;
		}

		const seen = new Map<string, number>();
		const list: Heading[] = [];
		for (const el of els) {
			const text = (el.textContent || '').trim();
			if (!text) continue;
			let id = el.id || slugify(text);
			if (seen.has(id)) {
				const n = (seen.get(id) || 1) + 1;
				seen.set(id, n);
				id = `${id}-${n}`;
			} else {
				seen.set(id, 1);
			}
			el.id = id;
			list.push({ id, text, level: Number(el.tagName.slice(1)) });
		}
		setHeadings(list);

		if (list.length === 0) return;

		observerRef.current = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter(e => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length > 0) {
					setActiveId((visible[0].target as HTMLElement).id);
				}
			},
			{ rootMargin: '-80px 0px -60% 0px', threshold: 0 }
		);
		for (const el of els) observerRef.current.observe(el);

		const firstVisible = els.find(el => {
			const r = el.getBoundingClientRect();
			return r.bottom > 80;
		});
		setActiveId((firstVisible || els[0]).id);
	}

	useEffect(() => {
		rebuild();
		return () => {
			if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
			observerRef.current?.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [container, trigger]);

	function handleClick(e: React.MouseEvent, id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		e.preventDefault();
		const top = el.getBoundingClientRect().top + window.scrollY - 72;
		window.scrollTo({ top, behavior: 'smooth' });
		history.replaceState(history.state, '', `#${id}`);
	}

	if (headings.length === 0) return null;

	return (
		<details className="pm-toc">
			<summary title="目录">
				<span className="title">目录</span>
			</summary>
			<div className="inner">
				<ul>
					{headings.map(h => (
						<li key={h.id} className={`pm-toc-level-${Math.max(1, h.level - minLevel + 1)}`}>
							<a
								href={`#${h.id}`}
								aria-label={h.text}
								className={activeId === h.id ? 'active' : ''}
								onClick={(e) => handleClick(e, h.id)}
							>
								{h.text}
							</a>
						</li>
					))}
				</ul>
			</div>
		</details>
	);
}
