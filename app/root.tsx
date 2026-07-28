import {
  Outlet,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "@/styles/hljs-theme.css";

import "@/styles/theme.css";
import "@/styles/base.css";
import "@/styles/layout.css";
import "@/styles/markdown.css";
import "@/styles/components.css";

import { siteConfig } from "@/config";

export default function Root() {
  return (
    <html lang={siteConfig.lang}>
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
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener('click',function(e){var b=e.target.closest('.pm-code-copy');if(!b)return;var code=b.parentElement.querySelector('code');if(!code)return;var text=Array.from(code.querySelectorAll('.ec-line .code')).map(function(l){return l.textContent||''}).join('\\n');navigator.clipboard.writeText(text).then(function(){b.classList.add('copied');setTimeout(function(){b.classList.remove('copied')},2000)}).catch(function(){})});`,
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
