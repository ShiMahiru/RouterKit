#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const name = process.argv[2];
if (!name) {
	console.error('Usage: pnpm new-post <name>');
	process.exit(1);
}

const now = new Date();
const published = now.toISOString().slice(0, 19);

const dir = resolve('src/posts', name);
const file = join(dir, 'index.md');
const imgDir = join(dir, 'img');
const keepFile = join(imgDir, '.gitkeep');

if (existsSync(dir)) {
	console.error(`Already exists: ${dir}`);
	process.exit(1);
}

mkdirSync(dir, { recursive: true });
mkdirSync(imgDir, { recursive: true });
writeFileSync(keepFile, '', 'utf8');

const content = `---
title: ${JSON.stringify(name)}
image: ""
published: ${published}
pinned: false
description: ""
toc: true
tags: []
draft: false
---
`;

writeFileSync(file, content, 'utf8');
console.log(`Created: ${file}`);
