# yuln-blog

基于 **Vite + React 19 + react-router-dom + TypeScript 6** 的纯静态博客。`.md` 文章在构建时经由 `import.meta.glob` 打包进 JS bundle，客户端渲染，零服务端运行时。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | React 19、react-router-dom |
| 构建 | Vite 8、TypeScript 6 |
| Markdown | markdown-it、markdown-it-footnote、YAML（frontmatter） |
| 代码高亮 | highlight.js（40 种语言） |
| 搜索 | MiniSearch（客户端索引） |
| 图片 | PhotoSwipe 5 |
| 评论 | Giscus |
| 部署 | Cloudflare Workers / Vercel / Cloudflare Pages |

## 快速开始

Node.js >= 22，pnpm。

```bash
pnpm install
pnpm run dev          # 开发服务器
pnpm run build        # 生产构建 → dist/
pnpm run preview      # 预览构建产物
pnpm run check        # TypeScript 类型检查
```

## 站点配置

编辑 `src/config.ts`。

## 写文章

在 `content/posts/` 下新建 `.md` 文件。

### Frontmatter

```yaml
---
title: "你好，世界"
published: 2026-07-28
pinned: false
description: "这是我的第一篇文章。"
image: ""
toc: true
draft: false
---
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 文章标题 |
| `published` | 是 | 发布日期（YYYY-MM-DD） |
| `pinned` | 否 | 置顶，默认 `false` |
| `description` | 否 | 文章摘要，用于列表展示和 SEO |
| `image` | 否 | 封面图 URL |
| `toc` | 否 | 是否显示目录 |
| `draft` | 否 | 草稿，设为 `true` 时构建和列表都不会包含此文 |

### 插入图片

图片放在 `public/images/` 目录下，Markdown 中用绝对路径引用：

```markdown
![](/images/screenshot.png)
```

## 写闲言

在 `content/thoughts/` 下新建 `.md` 文件：

```yaml
---
date: 2026-07-20
images:
  - /images/photo.jpg
---
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `date` | 是 | 日期（YYYY-MM-DD） |
| `images` | 否 | 图片 URL 数组，最多 9 张 |

## 部署

### Cloudflare Workers

在 GitHub 仓库设置 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 两个 Secrets，push 到 `main` 分支自动构建部署。

### Cloudflare Pages（推荐）

1. 在 Cloudflare Dashboard → Workers & Pages → Pages → 创建项目
2. 连接 GitHub 仓库，框架预设选 "None" 或 "Vite"
3. 构建命令：`pnpm run build`，输出目录：`dist`
4. push 即自动部署，零 CI 配置

### Vercel

`vercel.json` 已配置，直接 import GitHub 仓库即可。

## 目录结构

```text
content/                     # 内容（与代码分离）
├── posts/                   # Markdown 文章
└── thoughts/                # Markdown 闲言

public/
└── images/                  # 静态图片

src/
├── main.tsx                 # 应用入口 + 路由配置
├── config.ts                # 站点配置
├── pages/                   # 页面组件（一个路由一个文件）
│   ├── Home.tsx
│   ├── Posts.tsx
│   ├── PostDetail.tsx
│   ├── Archives.tsx
│   ├── Search.tsx
│   ├── About.tsx
│   ├── Thoughts.tsx
│   └── NotFound.tsx
├── components/              # UI 组件（按功能域分组）
│   ├── layout/              # Layout, NavBar, SiteFooter, BackToTop
│   ├── article/             # ArticleHeader, ImageViewer, PostToc
│   ├── common/              # PaperPostList
│   ├── comment/             # Giscus
│   └── search/              # SearchHighlight
├── lib/                     # 纯函数（Markdown 渲染、数据加载）
│   ├── posts-loader.ts
│   ├── thoughts-loader.ts
│   ├── markdown-renderer.ts
│   ├── markdown-preprocess.ts
│   └── text-utils.ts
├── utils/                   # 工具函数
│   ├── date.ts
│   ├── frontmatter.ts
│   ├── markdown.ts
│   ├── posts.ts
│   └── theme.ts
├── styles/                  # CSS
│   ├── theme.css            # CSS 变量（亮/暗色主题）
│   ├── base.css             # 基础样式
│   ├── layout.css           # 布局
│   ├── markdown.css         # 文章正文 + 代码块 + 目录
│   ├── components.css       # 组件样式
│   └── hljs-theme.css       # 代码高亮主题
└── types/                   # TypeScript 类型定义

├── index.html               # SPA HTML 入口
├── vite.config.ts
├── tsconfig.json
├── wrangler.toml
├── vercel.json
└── .github/workflows/
    └── deploy.yml           # GitHub Actions CI/CD
```

## License

MIT
