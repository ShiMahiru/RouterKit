import { describe, it, expect } from "vitest";
import { preprocessMarkdown } from "../src/lib/markdown-preprocess";

describe("preprocessMarkdown", () => {
  it("converts ::github syntax to anchor", () => {
    const input = "::github{repo=\"user/repo\"}";
    const result = preprocessMarkdown(input);
    expect(result).toContain("pm-github-card");
    expect(result).toContain("https://github.com/user/repo");
  });

  it("converts :spoiler syntax", () => {
    const input = ":spoiler[surprise]";
    const result = preprocessMarkdown(input);
    expect(result).toContain("pm-spoiler");
    expect(result).toContain("surprise");
  });

  it("converts admonition with title", () => {
    const input = ":::tip[Pro Tip]\nsome content\n:::";
    const result = preprocessMarkdown(input);
    expect(result).toContain("pm-admonition");
    expect(result).toContain("tip");
    expect(result).toContain("Pro Tip");
  });

  it("converts admonition without title", () => {
    const input = ":::note\ncontent\n:::";
    const result = preprocessMarkdown(input);
    expect(result).toContain("pm-admonition");
    expect(result).toContain("NOTE");
  });

  it("converts simple Pandoc table", () => {
    const input = "Header1  Header2\n-----------------\ncell1    cell2\n";
    const result = preprocessMarkdown(input);
    expect(result).toContain("| Header1 | Header2 |");
    expect(result).toContain("| cell1 | cell2 |");
  });
});
