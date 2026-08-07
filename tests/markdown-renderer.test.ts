import { describe, it, expect } from "vitest";
import { createMarkdownRenderer, enhanceCodeBlocks } from "../src/lib/markdown-renderer";

describe("createMarkdownRenderer", () => {
  it("renders basic markdown to HTML", () => {
    const md = createMarkdownRenderer();
    const html = md.render("# Hello");
    expect(html).toContain("<h1>");
    expect(html).toContain("Hello");
  });

  it("renders links", () => {
    const md = createMarkdownRenderer();
    const html = md.render("[click](https://example.com)");
    expect(html).toContain('<a href="https://example.com"');
  });

  it("renders code blocks with highlight.js", () => {
    const md = createMarkdownRenderer();
    const html = md.render("```js\nconst x = 1;\n```");
    expect(html).toContain("hljs");
  });

  it("renders tables", () => {
    const md = createMarkdownRenderer();
    const html = md.render("| A | B |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });
});

describe("enhanceCodeBlocks", () => {
  it("adds line numbers and copy button", () => {
    const html = '<pre><code class="language-js">const x = 1;\nconst y = 2;</code></pre>';
    const result = enhanceCodeBlocks(html);
    expect(result).toContain("ec-line");
    expect(result).toContain("pm-code-copy");
    expect(result).toContain("data-language=\"js\"");
  });

  it("handles code blocks without language class", () => {
    const html = "<pre><code>plain text</code></pre>";
    const result = enhanceCodeBlocks(html);
    expect(result).toContain("ec-line");
    expect(result).not.toContain("data-language");
  });
});
