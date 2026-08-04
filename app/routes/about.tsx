import { siteConfig } from "@/config";

export const meta = () => [{ title: `关于 - ${siteConfig.title}` }];

export default function About() {
  return (
    <main className="pm-main">
      <article className="pm-post-single">
        <header className="pm-post-header">
          <h1 className="pm-post-title">关于</h1>
        </header>
        <div className="pm-post-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <img
              src={siteConfig.icon}
              alt=""
              style={{ width: '64px', height: '64px', borderRadius: '50%' }}
            />
            <div>
              <h2 style={{ margin: 0 }}>{siteConfig.headerTitle}</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                {siteConfig.description}
              </p>
            </div>
          </div>

          <p>
            欢迎来到我的博客。这里主要记录我在 IT / 互联网技术方面的学习笔记、实践经验和一些个人思考。
          </p>
          <p>
            博客使用 <a href="https://github.com/ShiMahiru/RouterKit" target="_blank" rel="noopener">RouterKit</a> 构建，
            基于 React 19 + React Router v7 + Vite 8，纯静态生成，零运行时依赖。
          </p>
        </div>
      </article>
    </main>
  );
}