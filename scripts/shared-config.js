/**
 * Shared config reader for build scripts.
 * Extracts site metadata from src/config.ts without requiring TypeScript compilation.
 */

import fs from "fs";
import path from "path";

const CONFIG_PATH = path.resolve("src/config.ts");

let _cached = null;

export function getSiteConfig() {
  if (_cached) return _cached;

  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");

  const extract = (key) => {
    const m = raw.match(new RegExp(`${key}:\\s*'([^']*)'`));
    return m ? m[1] : "";
  };

  _cached = {
    url: extract("url"),
    title: extract("title"),
    description: extract("description"),
  };

  return _cached;
}
