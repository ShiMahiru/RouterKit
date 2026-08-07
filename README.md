# yuln-blog

[![Deploy](https://github.com/ShiMahiru/Yuln-blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/ShiMahiru/Yuln-blog/actions)

基于 **Vite 8 + React 19 + react-router-dom v7 + TypeScript 6** 的纯静态博客。所有 `.md` 内容通过 `import.meta.glob` 按需懒加载为独立 code-split chunk，客户端渲染（CSR），零服务端运行时。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | React 19、react-router-dom v7 |
| 构建 | Vite 8、TypeScript 6 |
| Markdown | markdown-it、markdown-it-footnote、YAML（frontmatter） |
| 代码高亮 | highlight.js（40 种语言） |
| 搜索 | MiniSearch（客户端全文索引，fuzzy 0.2 + prefix） |
| 图片 | PhotoSwipe 5（灯箱）、sharp（构建时 webp 压缩） |
| 音频 | 自定义 AudioPlayer（进度条 + 拖拽 + 实时时间） |
| 评论 | Giscus（GitHub Discussions） |
| 测试 | vitest（6 文件 / 33 条） |
| 部署 | Cloudflare Workers / Vercel / Cloudflare Pages |

## 快速开始

要求 Node.js ≥ 22，pnpm。

```bash
pnpm install
pnpm run dev           # 开发服务器 → http://localhost:5173
pnpm run check         # TypeScript 类型检查
pnpm run test          # 运行单元测试
pnpm run build         # 生产构建 → dist/
pnpm run preview       # 预览构建产物
```

## 站点配置

编辑 `src/config.ts`，RSS、sitemap、robots.txt 构建脚本自动读取此处，无需另外修改。

```ts
export const siteConfig = {
  lang: "zh-CN",
  url: "https://blog.242531778.xyz",
  title: "Yuln | 博客",
  headerTitle: "Yuln",
  description: "...",
  icon: "https://...",
  giscus: { /* GitHub Discussions 配置 */ },
  analytics: {
    umamiUrl: "",   // Umami 部署地址，留空不启用
    umamiId: "",    // Umami 网站 ID
  },
} as const;
```

## 写文章

在 `content/posts/` 下新建 `.md` 文件。

### Frontmatter

```yaml
---
title: "文章标题"
published: 2026-08-08
pinned: false
description: "文章摘要"
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
| `description` | 否 | 文章摘要，用于列表展示、SEO 和 RSS |
| `image` | 否 | 封面图 URL，支持本地路径（`/images/xxx`）和外部链接（`https://`） |
| `toc` | 否 | 是否显示目录 |
| `draft` | 否 | 草稿，`true` 时从列表、RSS、sitemap 中排除 |

### 自定义 Markdown 语法

| 语法 | 效果 |
|------|------|
| `:spoiler[内容]` | 点击/悬停才显示的遮蔽文字 |
| `::github{repo="owner/repo"}` | GitHub 仓库卡片 |
| `:::note[标题]` | 提示框，支持 note / tip / important / warning / caution |
| 空格分隔表格 | Pandoc 风格表格 → 自动转 GFM 管表 |
| 脚注 | 通过 markdown-it-footnote 插件支持 `[^1]` |

### 代码高亮

highlight.js 注册了 40 种语言。代码块会自动增强为"expressive code"：左侧行号、右上角语言标签、右上角复制按钮（点击后显示对勾/叉叉反馈）。

### 插入图片

图片放在 `public/images/`，Markdown 用绝对路径引用：

```markdown
![](/images/photo.png)
```

外部链接图片可直接使用 URL：

```markdown
![](https://example.com/photo.jpg)
```

构建时 `public/images/` 内的本地图片会自动将 png/jpg/gif 转为 webp、压缩到 1920px，未变图片通过 SHA-256 hash 缓存跳过。外部链接图片不受影响。

## 写闲言

在 `content/thoughts/` 下新建 `.md` 文件：

```yaml
---
date: 2026-08-08
images:                   # 可选，最多 9 张
  - /images/photo.jpg
audio: "/audio/song.mp3"  # 可选
---
```

显示为朋友圈风格时间线：头像 + 文字 + 图片网格 + 可拖拽进度条音频播放器 + 相对时间（刚刚 / N 分钟前 / N 小时前 / 昨天 / 绝对日期）。

图片灯箱通过 PhotoSwipe 5 集成。

## 搜索

客户端全文搜索，基于 MiniSearch。首次访问 `/search` 时构建索引，支持模糊匹配（fuzzy 0.2）和前缀搜索。搜索结果链接到文章详情页并自动传递 `?highlight=` 参数，在正文中高亮匹配词（支持引号短语）。

## SEO

运行时通过 `<SEO>` 组件动态设置 `document.title` 和 Open Graph `<meta>` 标签：

- `og:title`、`og:description`、`og:type`、`og:image`、`og:url`、`og:locale`、`og:site_name`
- 文章页额外设置 `article:published_time`
- 404 回退为站点默认标题

`index.html` 中预设了 RSS discovery 标签和主题色 meta：

- `<link rel="alternate" type="application/rss+xml" href="/rss.xml">`
- `<link rel="sitemap" type="application/xml" href="/sitemap.xml">`
- `<meta name="theme-color">`

构建时生成：

- **`dist/rss.xml`** — RSS 2.0 + Atom self-link，每篇文章 title/link/description/pubDate/guid
- **`dist/sitemap.xml`** — 6 个静态页 + 所有非草稿文章，含 priority/changefreq/lastmod
- **`dist/robots.txt`** — 允许所有爬虫，指向 sitemap 地址

## 主题

CSS 变量实现亮/暗双主题。暗色主题使用 OKLCH 色彩空间（`--hue: 250`）。主题初始化和切换通过 `index.html` 内联脚本实现，在 `<html data-theme>` 上设置，**无闪烁**，避免白/黑闪。

- 手动切换：NavBar 中的太阳/月亮图标
- 自动跟随：通过 `matchMedia('prefers-color-scheme: dark')` 监听系统主题变化
- 持久化：`localStorage` 记忆用户选择
- Giscus 评论框通过 `postMessage` 同步主题

## 部署

### Cloudflare Workers（当前使用）

`wrangler.toml` 已配置 SPA fallback（`not_found_handling = "single-page-application"`）。

GitHub 仓库设置 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` secret，push 到 `main` 分支自动触发 GitHub Actions 构建部署。

### Cloudflare Pages

1. Dashboard → Workers & Pages → Pages → 创建项目
2. 连接 GitHub 仓库，框架预设选 "None" 或 "Vite"
3. 构建命令：`pnpm run build`，输出目录：`dist`

### Vercel

`vercel.json` 已配置 SPA rewrite 规则，直接 import 仓库即可。

## 错误处理

`<ErrorBoundary>` 类组件包裹文章详情页的正文区域和评论区域。渲染崩溃时显示回退 UI（含"重试"按钮），评论加载失败单独显示"评论加载失败"提示，不影响页面其他部分。

## 分析

Umami 分析脚本集成在 `<Analytics>` 组件中。默认禁用（`umamiUrl` 和 `umamiId` 为空），启用时在 `src/config.ts` 填写即可。

## CI/CD

push 到 `main` 分支自动触发（`.github/workflows/deploy.yml`）：

```
checkout → pnpm install --frozen-lockfile → tsc --noEmit → pnpm run build → wrangler deploy
```

## 目录结构

```text
content/                     # 内容（与代码分离）
├── about.md                 # 关于页面
├── posts/                   # 文章（.md）
└── thoughts/                # 闲言（.md）

public/
├── images/                  # 静态图片（构建时自动转 webp + hash 缓存）
└── audio/                   # 音频文件

scripts/
├── optimize-images.js       # 构建时图片优化（webp + hash 缓存）
├── generate-rss.js          # 构建时 RSS feed 生成
├── generate-sitemap.js      # 构建时 sitemap.xml + robots.txt 生成
└── shared-config.js         # 构建脚本共享配置（读取 src/config.ts）

src/
├── main.tsx                 # 应用入口 + 路由配置
├── config.ts                # 站点配置（单一数据源）
├── pages/                   # 页面组件（一路由一文件，7 个）
│   ├── Home.tsx             # 文章列表 + 分页（10 篇/页）
│   ├── PostDetail.tsx       # 文章详情 + 目录 + 搜索高亮 + 评论 + 灯箱 + 错误边界
│   ├── Archives.tsx         # 归档（年/月/日，中文 locale）
│   ├── Search.tsx           # 全文搜索（MiniSearch）
│   ├── About.tsx            # 关于页面（frontmatter + markdown 渲染）
│   ├── Thoughts.tsx         # 闲言（朋友圈风格时间线）
│   └── NotFound.tsx         # 404
├── components/              # UI 组件（14 个）
│   ├── layout/              # Layout, NavBar, SiteFooter, BackToTop
│   ├── article/             # ArticleHeader, ImageViewer, PostToc, AudioPlayer
│   ├── common/              # PaperPostList, SEO, ErrorBoundary, Analytics
│   ├── comment/             # Giscus
│   └── search/              # SearchHighlight
├── lib/                     # 纯函数（5 个）
│   ├── posts-loader.ts      # 文章懒加载 + HTML 渲染 + 搜索文本生成
│   ├── thoughts-loader.ts   # 闲言懒加载
│   ├── markdown-renderer.ts # markdown-it + highlight.js + 代码块增强
│   ├── markdown-preprocess.ts # 自定义语法预处理
│   └── text-utils.ts        # Markdown → 纯文本
├── utils/                   # 工具函数（3 个）
│   ├── date.ts              # 日期格式化
│   ├── frontmatter.ts       # YAML frontmatter 解析 + 排序
│   └── theme.ts             # 主题检测
├── styles/                  # CSS（6 文件，CSS 变量 + OKLCH 暗色主题）
└── types/                   # TypeScript 类型定义

tests/                       # 单元测试（vitest，6 文件 / 33 条）
├── date.test.ts
├── frontmatter.test.ts
├── markdown-preprocess.test.ts
├── markdown-renderer.test.ts
├── posts.test.ts
└── text-utils.test.ts

index.html                   # SPA 入口（flash-free 主题 + 代码复制 + RSS/sitemap 标签）
vite.config.ts               # Vite 配置（React + md-loader + @ 别名）
tsconfig.json                # TypeScript 配置（strict，bundler）
wrangler.toml                # Cloudflare Workers（SPA fallback）
vercel.json                  # Vercel（SPA rewrite）
.github/workflows/deploy.yml # CI/CD（push main → check → build → deploy）
```

## License

MIT
