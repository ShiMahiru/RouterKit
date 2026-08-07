import { useEffect, useState } from "react";
import { siteConfig } from "@/config";
import { createMarkdownRenderer } from "@/lib/markdown-renderer";

// Vite bundles .md files into the client bundle at build time.
const modules = import.meta.glob("/content/about.md", {
  eager: true,
}) as Record<string, { default: string }>;

function getAboutContent(): string {
  for (const mod of Object.values(modules)) {
    return mod.default;
  }
  return "";
}

export default function About() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    document.title = `关于 - ${siteConfig.title}`;
  }, []);

  useEffect(() => {
    const raw = getAboutContent();
    const md = createMarkdownRenderer();
    const rendered = md.render(raw);
    setHtml(rendered);
  }, []);

  return (
    <main className="pm-main">
      <article className="pm-post-single">
        <header className="pm-post-header">
          <h1 className="pm-post-title">关于</h1>
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
