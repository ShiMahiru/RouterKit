# Yuln 的博客

基于 React 19 + React Router 8 + Vite 8 的静态博客项目。文章使用 Markdown 编写，构建后输出为纯静态文件，可部署到 Vercel、Cloudflare Pages。

## 技术栈

- React 19
- React Router 8 (framework mode, prerender)
- Vite 8
- TypeScript
- markdown-it
- highlight.js (build-time)
- mermaid (build-time)
- PhotoSwipe
- Giscus

## 目录

```text
app/
├── root.tsx                # 文档壳
├── routes.ts               # 路由配置
├── layout.tsx              # 页面布局（导航 + 页脚）
└── routes/
    ├── home.tsx            # 首页 & /posts
    ├── post-detail.tsx     # 文章详情
    ├── archives.tsx        # 归档
    ├── search.tsx          # 搜索
    ├── not-found.tsx       # 404
    └── posts.tsx           # 重导出

lib/                        # 共享逻辑
├── posts-loader.ts         # 文章加载（loader & 构建脚本共用）
├── text-utils.ts           # 文本处理
└── mermaid-renderer.ts     # 构建时 Mermaid 渲染

src/
├── config.ts               # 站点配置
├── content/posts/          # Markdown 文章
├── components/             # 组件
├── utils/                  # 工具函数
└── types/                  # TypeScript 类型

scripts/
├── generate-static.ts      # RSS / sitemap / robots.txt / llms.txt
└── optimize-images.ts      # 图片压缩 & WebP
```

## 开发

```bash
pnpm install
pnpm run dev
```

## 构建

```bash
pnpm run build
```

构建产物生成到 `build/client/`，包含 RSS、sitemap、robots.txt、llms.txt。

## 部署

### Vercel

```json
{ "outputDirectory": "build/client" }
```

### Cloudflare Pages

- Build command: `pnpm run build`
- Output directory: `build/client`