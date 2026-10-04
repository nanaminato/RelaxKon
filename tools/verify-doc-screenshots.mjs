// Check every documentation screenshot against public assets and the capture inventory.
// Usage: node tools/verify-doc-screenshots.mjs [backend Docs directory]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(frontend, 'public');
const docs = path.resolve(process.argv[2] ?? path.join(frontend, '../RelaxKonServer/RelaxKonServer/Content/Docs'));
const inventory = JSON.parse(fs.readFileSync(path.join(publicRoot, 'assets/docs/screenshots/manifest.json'), 'utf8'));
const languages = ['zh-CN', 'en-US', 'ja-JP'];
const problems = [];
const seen = new Set();
const referenced = new Set();
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});

if (inventory.schemaVersion !== 1) problems.push('Unsupported screenshot inventory schema');
for (const item of inventory.images) {
  if (seen.has(item.url)) problems.push(`Duplicate capture URL: ${item.url}`);
  seen.add(item.url);
  if (!languages.includes(item.language) || !['placeholder', 'screenshot'].includes(item.status)) problems.push(`Invalid capture metadata: ${item.url}`);
  if (!item.caption?.trim()) problems.push(`Missing capture instructions: ${item.url}`);
  const expectedPrefix = `/assets/docs/screenshots/${item.language}/`;
  if (!item.url.startsWith(expectedPrefix) || item.url.includes('..')) problems.push(`Unsafe capture URL: ${item.url}`);
  const image = path.resolve(publicRoot, `.${item.url}`);
  if (!image.startsWith(publicRoot + path.sep) || !fs.existsSync(image)) problems.push(`Missing capture asset: ${item.url}`);
  const document = path.join(docs, item.language, 'latest', item.document + '.md');
  if (!fs.existsSync(document) || !fs.readFileSync(document, 'utf8').includes(`](${item.url})`)) problems.push(`Capture absent from its document: ${item.url}`);
}

for (const lang of languages) {
  for (const document of walk(path.join(docs, lang, 'latest')).filter(file => file.endsWith('.md'))) {
    const markdown = fs.readFileSync(document, 'utf8');
    for (const match of markdown.matchAll(/!\[([^\]]*)\]\((\/assets\/docs\/screenshots\/[^)\s]+)\)/g)) {
      if (!match[1].trim()) problems.push(`Missing image alt text: ${document}`);
      if (!seen.has(match[2])) problems.push(`Unregistered screenshot: ${match[2]}`);
      referenced.add(match[2]);
    }
  }
  const slots = inventory.images.filter(item => item.language === lang).map(item => `${item.document}:${item.slot}`).sort();
  const baseline = inventory.images.filter(item => item.language === languages[0]).map(item => `${item.document}:${item.slot}`).sort();
  if (JSON.stringify(slots) !== JSON.stringify(baseline)) problems.push(`Capture slots differ for ${lang}`);
}

const screenshotRoot = path.join(publicRoot, 'assets/docs/screenshots');
for (const image of walk(screenshotRoot).filter(file => /\.(svg|png|jpe?g|webp)$/i.test(file))) {
  const url = '/' + path.relative(publicRoot, image).replaceAll('\\', '/');
  if (!seen.has(url)) problems.push(`Unregistered asset: ${url}`);
}

for (const problem of problems) console.error(problem);
console.log(`${inventory.images.length} capture entries; ${referenced.size} referenced assets; ${languages.length} aligned languages.`);
console.log(problems.length ? `FAILED: ${problems.length} problem(s)` : 'OK: screenshot assets, captions and document references match.');
process.exitCode = problems.length ? 1 : 0;
