import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targetDirs = ['apps', 'libs'];
const fileExtensions = new Set(['.vue', '.ts', '.tsx']);

const uiKeys = [
  'title',
  'label',
  'header',
  'headerName',
  'placeholder',
  'subtitle',
  'hint',
  'emptyText',
  'noRowsText',
  'message',
  'summary'
];
const uiKeyRegex = new RegExp(
  `\\b(${uiKeys.join('|')})\\b\\s*:\\s*(['"\`])([^'"\`]+)\\2`,
  'g'
);
const templateAttrRegex = new RegExp(
  `(^|\\s)(:?|v-bind:)?(${uiKeys.join('|')})\\s*=\\s*(['"\`])([^'"\`]+)\\4`,
  'g'
);
const englishRegex = /[A-Za-z]/;

const violations = [];

const shouldScan = (filePath) => fileExtensions.has(path.extname(filePath));

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile() && shouldScan(fullPath)) {
      await scanFile(fullPath);
    }
  }
}

function scanTemplateText(filePath, template) {
  const textOnly = template
    .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (textOnly && englishRegex.test(textOnly)) {
    violations.push({ filePath, reason: 'متن نمایشی انگلیسی در قالب' });
  }

  const attrMatches = template.matchAll(templateAttrRegex);
  for (const match of attrMatches) {
    const bindingPrefix = match[2];
    if (bindingPrefix === ':' || bindingPrefix === 'v-bind:') {
      continue;
    }
    const value = match[5].replace(/\$\{[^}]*\}/g, '');
    if (englishRegex.test(value)) {
      violations.push({ filePath, reason: `رشته انگلیسی در ویژگی ${match[3]}` });
    }
  }
}

async function scanFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  if (filePath.endsWith('.vue')) {
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
    if (templateMatch) {
      scanTemplateText(filePath, templateMatch[1]);
    }
  }

  const matches = content.matchAll(uiKeyRegex);
  for (const match of matches) {
    const value = match[3].replace(/\$\{[^}]*\}/g, '');
    if (englishRegex.test(value)) {
      violations.push({ filePath, reason: `رشته انگلیسی در کلید ${match[1]}` });
    }
  }
}

for (const dir of targetDirs) {
  await walk(path.join(rootDir, dir));
}

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`${violation.filePath}: ${violation.reason}`);
  }
  process.exit(1);
}
