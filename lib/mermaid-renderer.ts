/**
 * 构建时 Mermaid 渲染器。
 * 在 loader 中调用，将 HTML 中的 mermaid 代码块替换为 SVG。
 * 使用 jsdom 为 mermaid 提供 DOM 环境，渲染完成后恢复全局变量。
 */
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

/**
 * 将 HTML 中的 mermaid 代码块替换为渲染后的 SVG。
 * 查找 `<pre><code class="language-mermaid">...</code></pre>` 并替换。
 */
export async function renderMermaidInHtml(html: string): Promise<string> {
  const re = /<pre><code(?:\s+class="[^"]*language-mermaid[^"]*")?>([\s\S]*?)<\/code><\/pre>/g;
  const matches: { full: string; code: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    matches.push({ full: m[0], code: m[1] });
  }
  if (matches.length === 0) return html;

  // 保存原始全局变量，渲染完成后恢复
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