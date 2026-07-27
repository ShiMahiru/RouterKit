# Yuln 的博客

基于 React 19 + React Router 7 + Vite 8 的静态博客项目。文章使用 Markdown 编写，构建后输出为纯静态文件，可部署到 Vercel、Cloudflare Pages 或 Cloudflare Workers Static Assets。

## 技术栈

- React 19
- React Router 7
- Vite 8
- TypeScript
- markdown-it
- PhotoSwipe
- Giscus

## 目录

```text
src/
├── config.ts              # 站点标题、图标、Giscus 配置
├── content/posts/         # Markdown 文章（每篇一个目录）
├── components/            # 页面组件
├── pages/                 # 路由页面
├── utils/                 # 文章、Markdown、渲染工具
└── types/                 # TypeScript 类型定义
```

## 开发

```bash
pnpm install
pnpm run dev
```

本地开发默认地址 `http://localhost:5173/`。

## 构建

```bash
pnpm run build
```

构建产物生成到 `build/`，包含 RSS、sitemap、robots.txt。

## 部署

### Vercel

项目已提供 `vercel.json`，导入 GitHub 仓库后即可部署。

### Cloudflare Pages

- Build command: `pnpm run build`
- Output directory: `build`
