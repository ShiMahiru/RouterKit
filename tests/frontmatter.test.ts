import { describe, it, expect } from "vitest";
import { parseFrontmatter, comparePostByPinnedAndDate } from "../src/utils/frontmatter";

describe("parseFrontmatter", () => {
  it("parses YAML frontmatter and returns content", () => {
    const input = `---
title: "Hello"
published: 2026-01-01
pinned: true
---
This is the content.`;

    const { metadata, content } = parseFrontmatter(input);
    expect(metadata.title).toBe("Hello");
    expect(metadata.published).toBe("2026-01-01");
    expect(metadata.pinned).toBe(true);
    expect(content).toBe("This is the content.");
  });

  it("returns empty metadata when no frontmatter present", () => {
    const input = "Just plain text, no frontmatter.";
    const { metadata, content } = parseFrontmatter(input);
    expect(metadata).toEqual({});
    expect(content).toBe(input);
  });

  it("handles CRLF line endings in frontmatter", () => {
    const input = "---\r\ntitle: Test\r\n---\r\nBody text";
    const { metadata, content } = parseFrontmatter(input);
    expect(metadata.title).toBe("Test");
    expect(content).toBe("Body text");
  });

  it("handles Date objects in frontmatter", () => {
    const input = `---
title: Test
published: 2026-07-15
---
content`;
    const { metadata } = parseFrontmatter(input);
    expect(typeof metadata.published).toBe("string");
  });

  it("handles complex YAML with arrays", () => {
    const input = `---
title: Gallery
images:
  - /img/1.webp
  - /img/2.webp
---
content`;
    const { metadata } = parseFrontmatter(input);
    expect(metadata.title).toBe("Gallery");
    expect(Array.isArray(metadata.images)).toBe(true);
    expect(metadata.images).toHaveLength(2);
  });
});

describe("comparePostByPinnedAndDate", () => {
  it("pinned posts come before unpinned", () => {
    const a = { pinned: true, published: "2026-01-01" };
    const b = { pinned: false, published: "2026-06-01" };
    expect(comparePostByPinnedAndDate(a, b)).toBe(-1);
    expect(comparePostByPinnedAndDate(b, a)).toBe(1);
  });

  it("both pinned: newer published date comes first", () => {
    const a = { pinned: true, published: "2026-06-01" };
    const b = { pinned: true, published: "2026-01-01" };
    expect(comparePostByPinnedAndDate(a, b)).toBeLessThan(0);
  });

  it("both unpinned: newer published date comes first", () => {
    const a = { pinned: false, published: "2026-06-01" };
    const b = { pinned: false, published: "2026-01-01" };
    expect(comparePostByPinnedAndDate(a, b)).toBeLessThan(0);
  });

  it("returns 0 when both have invalid dates", () => {
    const a = { pinned: false, published: "invalid" };
    const b = { pinned: false, published: "nope" };
    expect(comparePostByPinnedAndDate(a, b)).toBe(0);
  });
});
