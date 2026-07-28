import {
  Outlet,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "highlight.js/styles/github-dark.css";

import "@/styles/theme.css";
import "@/styles/base.css";
import "@/styles/layout.css";
import "@/styles/markdown.css";
import "@/styles/components.css";

export default function Root() {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('pref-theme');if(!t)t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;if(t==='dark'){document.documentElement.classList.add('dark');var m=document.querySelector('meta[name="theme-color"]');if(m)m.content='#1d1e20'}})();`,
          }}
        />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
