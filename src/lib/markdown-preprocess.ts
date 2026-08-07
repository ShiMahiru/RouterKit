/**
 * Markdown 预处理：自定义语法（admonition / spoiler / GitHub 卡片 / Pandoc 表格）
 * 在 markdown-it 渲染之前执行
 */

export function preprocessMarkdown(content: string): string {
  content = content.replace(
    /^::github\{repo="([^"]+)"\}$/gm,
    (_, repo: string) =>
      `<a href="https://github.com/${repo}" class="pm-github-card" target="_blank" rel="noopener">${repo}</a>`
  );

  content = content.replace(
    /:spoiler\[([^\]]*)\]/g,
    '<span class="pm-spoiler" tabindex="0">$1</span>'
  );

  const adTypes = ["note", "tip", "important", "warning", "caution"] as const;
  for (const type of adTypes) {
    content = content.replace(
      new RegExp(`^:::${type}\\[([^\\]]*)\\]\\s*$`, "gm"),
      `<div class="pm-admonition ${type}"><p class="pm-admonition-title">$1</p>`
    );
    content = content.replace(
      new RegExp(`^:::${type}\\s*$`, "gm"),
      `<div class="pm-admonition ${type}"><p class="pm-admonition-title">${type.toUpperCase()}</p>`
    );
  }
  content = content.replace(/^:::\s*$/gm, "</div>");

  content = convertPandocTables(content);

  return content;
}

function convertPandocTables(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const cur = lines[i].trim();
    if (!cur || cur.includes(":") || cur.startsWith("#")) {
      out.push(lines[i]);
      i++;
      continue;
    }

    const words = cur.split(/\s+/);
    if (words.length < 2) {
      out.push(lines[i]);
      i++;
      continue;
    }

    // Find separator skipping blank lines
    let s = i + 1;
    while (s < lines.length && !lines[s].trim()) s++;
    if (s >= lines.length || !/^-{2,}\s*$/.test(lines[s].trim())) {
      out.push(lines[i]);
      i++;
      continue;
    }

    const colCount = words.length;
    const body: string[] = [];
    let j = s + 1;
    while (j < lines.length) {
      const t = lines[j].trim();
      if (!t || /^Table:/.test(t)) {
        j++;
        continue;
      }
      if (/^-{2,}\s*$/.test(t)) break;
      if (t.split(/\s+/).length >= colCount) {
        body.push(lines[j]);
        j++;
        continue;
      }
      break;
    }
    if (body.length === 0) {
      out.push(lines[i]);
      i++;
      continue;
    }

    while (
      j < lines.length &&
      (!lines[j].trim() || /^Table:/.test(lines[j].trim()))
    )
      j++;

    const toRow = (l: string) => {
      const w = l.trim().split(/\s+/);
      const cells = w.slice(0, colCount - 1);
      cells.push(w.slice(colCount - 1).join(" "));
      return "| " + cells.join(" | ") + " |";
    };
    out.push(toRow(lines[i]), "|" + Array(colCount).fill("---").join("|") + "|");
    body.forEach((b) => out.push(toRow(b)));
    out.push("");
    i = j;
  }
  return out.join("\n");
}
