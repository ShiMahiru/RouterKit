# Yuln 的博客

一个基于 SvelteKit 和 Vite 的静态博客项目。文章使用 Markdown 编写，构建后输出为纯静态文件，可部署到 Vercel、Cloudflare Pages 或 Cloudflare Workers Static Assets。

## 功能

- Markdown 文章与 frontmatter 元数据
- 首页文章列表、文章详情、归档、标签、搜索
- RSS、sitemap、robots.txt
- Giscus 评论
- 深色 / 浅色主题切换
- 代码高亮、Mermaid 渲染、图片查看器
- 静态构建输出到 `build/`

## 技术栈

- SvelteKit
- Vite
- mdsvex
- TypeScript
- @sveltejs/adapter-static
- Giscus

## 目录

```text
src/
├── config.ts              # 站点标题、图标、Giscus 配置
├── posts/                 # Markdown 文章
├── lib/
│   ├── components/        # 页面组件
│   └── utils/             # 文章、Markdown、渲染工具
└── routes/                # 页面路由、RSS、sitemap、robots
```

## 站点配置 src/config.ts

站点配置文件在 `src/config.ts`。这里改的是整个网站的基础信息。

### 基础字段

| 字段 | 怎么填 |
| --- | --- |
| `title` | 网站标题。 |
| `headerTitle` | 顶部导航栏显示的名字。 |
| `icon` | 图片链接，例如 `'https://q2.qlogo.cn/headimg_dl?dst_uin=QQ号&spec=0'`。 |

## 文章目录

文章放在 `src/posts/` 下。

结构示例：

```text
src/posts/
└── hello-world/
    ├── index.md
    └── img/
        ├── cover.jpg
        └── detail.png
```

说明：

- `hello-world` 是文章 slug。
- 文章访问地址是 `/posts/hello-world/`。
- 正文写在 `index.md`。
- 这篇文章用到的图片放在自己的 `img/` 文件夹。

新建文章：

```bash
npm run new-post -- hello-world
```

## 文章配置

文章配置写在 `index.md` 最上面，两条 `---` 中间的部分叫 frontmatter。

```md
---
title: "文章标题"
image: "img/cover.jpg"
published: 2026-05-06T12:00:00
updated: 2026-05-06T18:00:00
pinned: false
description: "文章摘要"
toc: true
tags: []
categories: []
draft: false
---
```

### 字段说明

| 字段 | 必填 | 怎么填 | 说明 |
| --- | --- | --- | --- |
| `title` | 建议填 | `"文章标题"` | 文章标题。 |
| `image` | 可空 | `"img/cover.jpg"` | 封面图。 |
| `published` | 建议填 | `2026-05-06T12:00:00` | 发布时间。 |
| `updated` | 可不写 | `2026-05-06T18:00:00` | 更新时间。 |
| `pinned` | 建议填 | `true` 或 `false` | 是否置顶。 |
| `description` | 建议填 | `"文章摘要"` | 文章摘要。 |
| `toc` | 可不写 | `true` 或 `false` | 是否显示文章目录。 |
| `tags` | 可空 | 数组 | 标签。没有标签可以写 `tags: []`。 |
| `categories` | 可空 | 数组 | 分类。没有分类可以不写，或写 `categories: []`。 |
| `draft` | 可不写 | `true` 或 `false` | 是否草稿。 |

## 开发

```bash
pnpm install
pnpm dev
```

本地开发默认地址：

```text
http://localhost:5173/
```

## 构建

```bash
pnpm build
```

构建产物会生成到 `build/`。

## 检查

```bash
pnpm check
```

## 部署

### Vercel

项目已提供 `vercel.json`：

- Build Command: `pnpm run build`
- Output Directory: `build`

导入 GitHub 仓库后即可部署。

### Cloudflare Pages

- Build command: `pnpm run build`
- Output directory: `build`

### Cloudflare Workers

项目已提供 `wrangler.jsonc`，使用 Workers Static Assets 部署 `build/`。

```bash
pnpm deploy:workers
```
