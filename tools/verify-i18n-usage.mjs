// Audit i18n key usage in the Angular frontend.
//
// The loader falls back to printing the raw key when a lookup misses, so a typo
// like `os.limitsTitel` ships as visible "os.limitsTitel" text instead of failing
// the build. This script extracts the *statically known* keys referenced from
// templates and components and checks them against the en-US dictionary.
//
// Usage: node tools/verify-i18n-usage.mjs [srcDir] [i18nDir]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Default to this repository's own sources so the script works from any working
// directory: <repo>/tools/ -> <repo>/src/app and <repo>/public/assets/i18n.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.resolve(process.argv[2] ?? path.join(repoRoot, 'src', 'app'));
const i18nDir = path.resolve(process.argv[3] ?? path.join(repoRoot, 'public', 'assets', 'i18n'));

const flatten = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, child]) =>
    child && typeof child === 'object' && !Array.isArray(child)
      ? flatten(child, `${prefix}${key}.`)
      : [[`${prefix}${key}`, child]],
  );

const dictionaries = {};
for (const lang of ['en-US', 'zh-CN', 'ja-JP']) {
  const pairs = flatten(JSON.parse(fs.readFileSync(path.join(i18nDir, `${lang}.json`), 'utf8')));
  // flatten() yields [key, value] pairs, so map the keys out — Object.keys() here
  // would hand back array indices and every lookup would look missing.
  dictionaries[lang] = new Set(pairs.map(([key]) => key));
}

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    // Test fixtures contain file names and expectation strings, not shipped UI lookups.
    else if (!entry.name.endsWith('.spec.ts') && /\.(ts|html)$/.test(entry.name)) files.push(full);
  }
};
walk(srcDir);

// Static lookups: t('some.key') with no concatenation. The lookbehind stops the
// regex from matching the trailing `t(` of unrelated calls such as
// createElement('textarea') or params.get('version'), which otherwise show up as
// phantom missing keys. Keys built at runtime (e.g. t('home.platforms.' + key))
// cannot be resolved here and are handled by the dynamic-prefix pass below.
const staticCall = /(?<![\w$.])(?:i18n\.)?t\(\s*'([A-Za-z0-9_.]+)'\s*\)/g;
const keyLike = /'([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)+)'/g;

// Comments contain illustrative keys such as `{ a: { b: 'x' } }`; strip them so
// documentation examples are never mistaken for real lookups.
const stripComments = (text, isTemplate) => {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, '');
  if (isTemplate) {
    out = out.replace(/<!--[\s\S]*?-->/g, '');
  } else {
    // Remove line comments, but not the `//` inside a string such as "https://".
    out = out.replace(/^\s*\/\/.*$/gm, '').replace(/([^:'"`])\/\/[^\n]*$/gm, '$1');
  }
  return out;
};

const referenced = new Map(); // key -> Set(file)
const record = (key, file) => {
  if (!referenced.has(key)) referenced.set(key, new Set());
  referenced.get(key).add(file);
};

// Only harvest quoted dot-paths from files that actually configure i18n keys,
// to avoid sweeping unrelated strings such as CSS class names or urls.
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const isTemplate = file.endsWith('.html');
  const looksLikeI18nSource = isTemplate || /i18n|titleKey|textKey|labelKey|Key\s*:|statusItems|cardKeys/.test(raw);
  if (!looksLikeI18nSource) continue;

  const text = stripComments(raw, isTemplate);

  for (const match of text.matchAll(staticCall)) record(match[1], path.relative(srcDir, file));

  if (!isTemplate) {
    for (const match of text.matchAll(keyLike)) {
      const key = match[1];
      // Ignore obvious non-i18n namespaces (file paths, urls, css-ish tokens).
      if (/^(https?|www|assets|node_modules)/.test(key)) continue;
      if (/\.(ts|html|scss|json|png|svg|ico|js)$/.test(key)) continue;
      record(key, path.relative(srcDir, file));
    }
  }
}

// Keys assembled from a prefix plus a runtime value. Prefix matching verifies
// that at least one concrete key exists under the namespace.
const dynamicPrefixes = new Map();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/(?:i18n\.)?t\(\s*'([A-Za-z0-9_.]+\.)'\s*\+/g)) {
    dynamicPrefixes.set(match[1], path.relative(srcDir, file));
  }
}

let problems = 0;
const missing = [];
for (const [key, sources] of [...referenced].sort()) {
  if (!dictionaries['en-US'].has(key)) {
    missing.push(`  MISSING ${key}   (${[...sources].join(', ')})`);
    problems += 1;
  }
}
if (missing.length) {
  console.log('keys referenced in code but absent from en-US.json:');
  console.log(missing.join('\n'));
} else {
  console.log(`all ${referenced.size} statically referenced keys exist in en-US.json`);
}

for (const lang of ['zh-CN', 'ja-JP']) {
  const gaps = [...referenced.keys()].filter((key) => dictionaries['en-US'].has(key) && !dictionaries[lang].has(key));
  if (gaps.length) {
    console.log(`${lang} is missing referenced keys: ${gaps.join(', ')}`);
    problems += 1;
  }
}

for (const [prefix, file] of dynamicPrefixes) {
  const hits = [...dictionaries['en-US']].filter((key) => key.startsWith(prefix));
  if (hits.length === 0) {
    console.log(`dynamic prefix '${prefix}' (${file}) has no matching keys in en-US.json`);
    problems += 1;
  } else {
    console.log(`dynamic prefix '${prefix}' -> ${hits.length} keys`);
  }
}

console.log('');
console.log(problems === 0 ? 'OK: i18n usage is clean' : `FAILED: ${problems} problem(s)`);
process.exitCode = problems === 0 ? 0 : 1;
