import { describe, it, expect } from "vitest";
import { markdownToPlainText } from "../src/lib/text-utils";

describe("markdownToPlainText", () => {
  it("strips bold/italic markers", () => {
    expect(markdownToPlainText("**bold** and *italic*")).toBe("bold and italic");
  });

  it("strips inline code and code blocks", () => {
    const input = "use `const x = 1` here.\n```\ncode block\n```\nend.";
    const result = markdownToPlainText(input);
    expect(result).not.toContain("```");
    expect(result).not.toContain("code block");
    expect(result).toContain("use");
    expect(result).toContain("here");
  });

  it("strips image syntax", () => {
    expect(markdownToPlainText("![alt](/img.png)")).toBe("");
  });

  it("strips link syntax but keeps text", () => {
    expect(markdownToPlainText("[click here](https://example.com)")).toBe("click here");
  });

  it("strips HTML tags", () => {
    expect(markdownToPlainText("<div>hello</div>")).toBe("hello");
  });

  it("collapses multiple whitespace", () => {
    expect(markdownToPlainText("hello    world\n\ntest")).toBe("hello world test");
  });

  it("handles empty string", () => {
    expect(markdownToPlainText("")).toBe("");
  });

  it("strips heading markers", () => {
    expect(markdownToPlainText("# Heading")).toBe("Heading");
  });
});
