import { describe, it, expect } from "vitest";
import { createPostSearchTextFromLoaded } from "../src/lib/posts-loader";

describe("createPostSearchTextFromLoaded", () => {
  it("combines title, description, slug, and content", () => {
    const post = {
      slug: "my-post",
      metadata: {
        title: "Hello World",
        image: "",
        published: "2026-01-01",
        pinned: false,
        description: "A test post",
      },
      content: "This is the body.",
    };
    const result = createPostSearchTextFromLoaded(post);
    expect(result).toContain("hello world");
    expect(result).toContain("a test post");
    expect(result).toContain("my");
    expect(result).toContain("this is the body");
  });

  it("handles markdown in content", () => {
    const post = {
      slug: "test",
      metadata: {
        title: "Test",
        image: "",
        published: "2026-01-01",
        pinned: false,
        description: "",
      },
      content: "some **bold** text",
    };
    const result = createPostSearchTextFromLoaded(post);
    expect(result).toContain("some bold text");
    expect(result).not.toContain("**");
  });
});
