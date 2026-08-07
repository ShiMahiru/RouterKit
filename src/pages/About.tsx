import { useState } from "react";
import SEO from "@/components/common/SEO";
import { siteConfig } from "@/config";
import { createMarkdownRenderer } from "@/lib/markdown-renderer";
import { parseFrontmatter } from "@/utils/frontmatter";

const modules = import.meta.glob("/content/about.md", {
  eager: true,
}) as Record<string, { default: string }>;

function getAboutData() {
  for (const mod of Object.values(modules)) {
    const raw = mod.default;
    const { metadata, content } = parseFrontmatter(raw);
    const md = createMarkdownRenderer();
    const html = md.render(content);
    return {
      title: (metadata.title as string) || "关于",
      description: (metadata.description as string) || siteConfig.description,
      html,
    };
  }
  return {
    title: "关于",
    description: siteConfig.description,
    html: "",
  };
}

export default function About() {
  const [{ html, title, description }] = useState(getAboutData);

  return (
    <main className="pm-main">
      <SEO title={title} description={description} />
      <article className="pm-post-single">
        <header className="pm-post-header">
          <h1 className="pm-post-title">{title}</h1>
        </header>
        <div className="pm-post-content">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <img
              src={siteConfig.icon}
              alt=""
              style={{ width: "64px", height: "64px", borderRadius: "50%" }}
            />
            <div>
              <h2 style={{ margin: 0 }}>{siteConfig.headerTitle}</h2>
              <p
                style={{
                  margin: "4px 0 0",
                  color: "var(--text-secondary)",
                }}
              >
                {siteConfig.description}
              </p>
            </div>
          </div>

          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </article>
    </main>
  );
}
