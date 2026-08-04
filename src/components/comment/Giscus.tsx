import { useEffect, useRef } from 'react';
import { siteConfig } from '@/config';
import { getResolvedTheme } from '@/utils/theme';

const giscus = siteConfig.giscus;
const maxAttempts = 5;

interface Props {
  slug?: string;
}

export default function Giscus({ slug }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const attemptsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const observerRef = useRef<MutationObserver>(undefined);
  const mediaQueryRef = useRef<MediaQueryList>(undefined);
  const loadedRef = useRef(false);

  function updateTheme() {
    const iframe = containerRef.current?.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: getResolvedTheme() } } },
      'https://giscus.app'
    );
  }

  function loadGiscus() {
    const container = containerRef.current;
    if (!container) return;
    if (attemptsRef.current >= maxAttempts) return;

    if (container.querySelector('iframe.giscus-frame')) {
      loadedRef.current = true;
      updateTheme();
      return;
    }

    attemptsRef.current += 1;
    container.replaceChildren();

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
    script.setAttribute('data-theme', getResolvedTheme());
    script.setAttribute('data-lang', giscus.lang);
    script.setAttribute('data-loading', giscus.loading);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    const retry = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!container.querySelector('iframe.giscus-frame')) {
          loadGiscus();
        } else {
          loadedRef.current = true;
          updateTheme();
        }
      }, 2200);
    };

    script.onload = retry;
    script.onerror = retry;
    container.appendChild(script);
  }

  useEffect(() => {
    attemptsRef.current = 0;
    loadedRef.current = false;

    observerRef.current = new MutationObserver(() => updateTheme());
    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });

    mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryRef.current.addEventListener('change', updateTheme);

    requestAnimationFrame(() => loadGiscus());

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      observerRef.current?.disconnect();
      mediaQueryRef.current?.removeEventListener('change', updateTheme);
    };
  }, []);

  // When slug changes, tell Giscus to update the discussion without rebuilding
  useEffect(() => {
    if (!slug || !loadedRef.current) return;
    const iframe = containerRef.current?.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { term: `/${slug}/` } } },
      'https://giscus.app'
    );
  }, [slug]);

  return <div id="giscus-container" ref={containerRef} className="pm-comments"></div>;
}
