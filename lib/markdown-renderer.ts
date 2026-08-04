/**
 * Markdown 渲染器：highlight.js 代码高亮 + 代码块增强（行号 + 复制按钮）
 */

import MarkdownIt from 'markdown-it';
import markdownItFootnote from 'markdown-it-footnote';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import less from 'highlight.js/lib/languages/less';
import stylus from 'highlight.js/lib/languages/stylus';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import toml from 'highlight.js/lib/languages/ini';
import markdown from 'highlight.js/lib/languages/markdown';
import sql from 'highlight.js/lib/languages/sql';
import graphql from 'highlight.js/lib/languages/graphql';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import java from 'highlight.js/lib/languages/java';
import kotlin from 'highlight.js/lib/languages/kotlin';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import perl from 'highlight.js/lib/languages/perl';
import scala from 'highlight.js/lib/languages/scala';
import swift from 'highlight.js/lib/languages/swift';
import dart from 'highlight.js/lib/languages/dart';
import lua from 'highlight.js/lib/languages/lua';
import groovy from 'highlight.js/lib/languages/groovy';
import vim from 'highlight.js/lib/languages/vim';
import protobuf from 'highlight.js/lib/languages/protobuf';
import diff from 'highlight.js/lib/languages/diff';

// 前端
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('jsx', javascript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('less', less);
hljs.registerLanguage('stylus', stylus);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);

// 后端
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('go', go);
hljs.registerLanguage('golang', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('rs', rust);
hljs.registerLanguage('java', java);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('kt', kotlin);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c++', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cs', csharp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rb', ruby);
hljs.registerLanguage('perl', perl);
hljs.registerLanguage('scala', scala);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('dart', dart);

// 脚本
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('pwsh', powershell);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('groovy', groovy);
hljs.registerLanguage('vim', vim);

// 数据
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('toml', toml);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('graphql', graphql);
hljs.registerLanguage('gql', graphql);
hljs.registerLanguage('protobuf', protobuf);
hljs.registerLanguage('proto', protobuf);

// 标记 & 其他
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('diff', diff);

function cleanLang(rawLang: string): string {
  if (!rawLang) return rawLang;
  const m = rawLang.match(/^[\w.#-]+/);
  return m ? m[0] : rawLang;
}

export function createMarkdownRenderer() {
  return new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
    highlight: (str: string, lang: string) => {
      const l = cleanLang(lang);
      if (l && hljs.getLanguage(l)) {
        try { return hljs.highlight(str, { language: l }).value; } catch {}
      }
      try { return hljs.highlightAuto(str).value; } catch {}
      return '';
    },
  }).use(markdownItFootnote);
}

const COPY_SVG = `<svg class="copy-icon" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M368.37-237.37q-34.48 0-58.74-24.26-24.26-24.26-24.26-58.74v-474.26q0-34.48 24.26-58.74 24.26-24.26 58.74-24.26h378.26q34.48 0 58.74 24.26 24.26 24.26 24.26 58.74v474.26q0 34.48-24.26 58.74-24.26 24.26-58.74 24.26H368.37Zm0-83h378.26v-474.26H368.37v474.26Zm-155 238q-34.48 0-58.74-24.26-24.26-24.26-24.26-58.74v-515.76q0-17.45 11.96-29.48 11.97-12.02 29.33-12.02t29.54 12.02q12.17 12.03 12.17 29.48v515.76h419.76q17.45 0 29.48 11.96 12.02 11.97 12.02 29.33t-12.02 29.54q-12.03 12.17-29.48 12.17H213.37Zm155-238v-474.26 474.26Z"/></svg>`;
const SUCCESS_SVG = `<svg class="success-icon" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="m389-377.13 294.7-294.7q12.58-12.67 29.52-12.67 16.93 0 29.61 12.67 12.67 12.68 12.67 29.53 0 16.86-12.28 29.14L419.07-288.41q-12.59 12.67-29.52 12.67-16.94 0-29.62-12.67L217.41-430.93q-12.67-12.68-12.79-29.45-.12-16.77 12.55-29.45 12.68-12.67 29.62-12.67 16.93 0 29.28 12.67L389-377.13Z"/></svg>`;

export function enhanceCodeBlocks(html: string): string {
  return html.replace(
    /<pre><code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_full: string, cls: string | undefined, codeText: string) => {
      const classAttr = cls ? ` class="${cls}"` : '';
      const lang = cls ? cls.replace(/^language-/, '') : '';
      const dataLang = lang ? ` data-language="${lang}"` : '';
      const lines = codeText
        .replace(/\n$/, '')
        .split('\n')
        .map((line, i) =>
          `<div class="ec-line"><div class="gutter"><div class="ln" aria-hidden="true">${i + 1}</div></div><div class="code">${line || ' '}</div></div>`
        )
        .join('');
      return `<div class="expressive-code"><figure class="frame"><pre class="pm-code-block"${dataLang}>`
        + `<button class="pm-code-copy" title="复制" aria-label="复制代码">${COPY_SVG}${SUCCESS_SVG}</button>`
        + `<code${classAttr}>${lines}</code></pre></figure></div>`;
    }
  );
}