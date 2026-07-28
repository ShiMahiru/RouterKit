

import { JSDOM } from "jsdom";
import mermaid from "mermaid";

class MockFontFace {
  constructor(
    _family: string,
    _source: string | BufferSource,
    _descriptors?: FontFaceDescriptors
  ) {}
  load() {
    return Promise.resolve(this as any);
  }
}

export async function renderMermaidInHtml(html: string): Promise<string> {
  const re = /<pre><code(?:\s+class="[^"]*language-mermaid[^"]*")?>([\s\S]*?)<\/code><\/pre>/g;
  const matches: { full: string; code: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    matches.push({ full: m[0], code: m[1] });
  }
  if (matches.length === 0) return html;

  const prevDocument = (globalThis as any).document;
  const prevFontFace = (globalThis as any).FontFace;

  try {
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    (globalThis as any).document = dom.window.document;
    (globalThis as any).FontFace = MockFontFace;

    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "strict",
      fontFamily: "inherit",
    });

    let result = html;
    let idx = 0;
    for (const { full, code } of matches) {
      const decoded = code
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      try {
        const { svg } = await mermaid.render(`mermaid-${idx++}`, decoded.trim());
        result = result.replace(full, `<div class="mermaid-rendered">${svg}</div>`);
      } catch (err) {
        console.error("[mermaid] render failed:", (err as Error).message);
        result = result.replace(
          full,
          `<pre class="mermaid-error">Mermaid 渲染失败: ${escapeHtml((err as Error).message)}\n\n${decoded.trim()}</pre>`
        );
      }
    }
    return result;
  } finally {
    (globalThis as any).document = prevDocument;
    (globalThis as any).FontFace = prevFontFace;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
