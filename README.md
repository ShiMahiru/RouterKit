# RouterKit

基于 **React 19 + React Router v8 + Vite 8 + TypeScript 6** 的纯静态博客。构建时通过 React Router `prerender()` 全量预渲染为静态 HTML，部署到 Vercel。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | React 19、React Router v8 |
| 构建 | Vite 8、TypeScript 6 |
| Markdown | markdown-it、markdown-it-footnote、YAML（frontmatter） |
| 代码高亮 | highlight.js（40 种语言） |
| 搜索 | MiniSearch（客户端索引） |
| 图片 | PhotoSwipe 5 |
| 评论 | Giscus |
| 部署 | Vercel |

## 快速开始

Node.js >= 22，pnpm。

```bash
pnpm install
pnpm run dev          # 开发服务器
pnpm run build        # 生产构建
pnpm run preview      # 预览构建产物
pnpm run check        # TypeScript 类型检查
```

## 站点配置

编辑 `src/config.ts`：

```typescript
export const siteConfig = {
  lang: 'zh-CN',
  url: 'https://你的域名',
  title: '你的名字 | 博客',
  headerTitle: '你的名字',
  description: '博客简介',
  icon: '头像 URL',
  giscus: {
    src: 'https://giscus.app/client.js',
    repo: '你的/Giscus 仓库',
    repoId: '...',
    category: 'Announcements',
    categoryId: '...',
    mapping: 'pathname',
    strict: '1',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top',
    theme: 'preferred_color_scheme',
    lang: 'zh-CN',
    loading: 'lazy'
  }
} as const;
```

## 写文章

在 `src/content/posts/` 下新建 `.md` 文件。

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

图片放在 `public/` 目录下，Markdown 中用绝对路径引用：

```markdown
![](/img/screenshot.png)
```

## 写闲言

在 `src/content/thoughts/` 下新建 `.md` 文件：

```yaml
---
date: 2026-07-20
images:
  - https://example.com/photo.jpg
---
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `date` | 是 | 日期（YYYY-MM-DD） |
| `images` | 否 | 图片 URL 数组，最多 9 张 |

## 构建

```bash
pnpm run build
```

预渲染所有路由为静态 HTML，产物输出到 `build/client/`。

## 部署

### Vercel

```json
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm run build",
  "outputDirectory": "build/client"
}
```

## 目录结构

```text
app/
├── root.tsx                 # HTML 文档壳，主题闪烁防护
├── layout.tsx               # 页面布局（导航栏 + 页脚 + 回顶）
├── routes.ts                # 路由配置
└── routes/
    ├── home.tsx             # 首页 /
    ├── posts.tsx            # 文章列表 /posts
    ├── post-detail.tsx      # 文章详情 /posts/:slug
    ├── archives.tsx         # 归档 /archives
    ├── search.tsx           # 搜索 /search
    ├── about.tsx            # 关于 /about
    ├── thoughts.tsx         # 闲言 /thoughts
    └── not-found.tsx        # 404

lib/                         # 服务端逻辑
├── posts-loader.ts          # 文章加载、Markdown 渲染
├── markdown-renderer.ts     # markdown-it + highlight.js 代码块增强
├── markdown-preprocess.ts   # 自定义语法预处理
├── thoughts-loader.ts       # 闲言加载
└── text-utils.ts            # Markdown 转纯文本

src/
├── config.ts                # 站点配置
├── content/
│   ├── posts/               # Markdown 文章
│   └── thoughts/            # Markdown 闲言
├── components/
│   ├── article/             # ArticleHeader、ImageViewer、PostToc
│   ├── comment/             # Giscus
│   ├── common/              # PaperPostList
│   ├── layout/              # NavBar、SiteFooter、BackToTop
│   └── search/              # SearchHighlight
├── utils/
│   ├── date.ts              # 日期格式化
│   ├── frontmatter.ts       # YAML frontmatter 解析、排序
│   ├── markdown.ts          # 资源路径解析
│   ├── posts.ts             # 搜索文本生成
│   └── theme.ts             # 主题偏好读取
├── styles/
│   ├── theme.css            # CSS 变量（亮/暗色主题）
│   ├── base.css             # 基础样式
│   ├── layout.css           # 布局
│   ├── markdown.css         # 文章正文 + 代码块 + 目录
│   ├── components.css       # 组件样式
│   └── hljs-theme.css       # 代码高亮主题
└── types/                   # TypeScript 类型定义
```

## License

MIT