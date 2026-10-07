// Generate public/sitemap.xml for the RelaxKon website.
//
// The static routes are always emitted. Documentation URLs are enumerated from
// the RelaxKonServer content tree, which lives in a sibling repository: pass
// RELAXKON_DOCS_ROOT to point at it, otherwise the default relative location is
// used. A missing tree is not an error — the script then emits the static routes
// alone and says so, so a standalone checkout still produces a valid sitemap.
//
// Documentation is the only part of the site whose URL carries the language
// (`/docs/<language>/<version>/<slug>`), so `xhtml:link` alternates are attached
// there and nowhere else: `/about` is one URL for every UI language and claiming
// hreflang alternates for it would be wrong.
//
// Usage: node tools/generate-sitemap.mjs [outputFile]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputFile = path.resolve(process.argv[2] ?? path.join(repoRoot, 'public', 'sitemap.xml'));

const ORIGIN = 'https://relaxkon.com';
const LANGUAGES = ['en-US', 'zh-CN', 'ja-JP'];
const DEFAULT_LANGUAGE = 'en-US';

/** Public, language-neutral pages. */
const STATIC_ROUTES = ['/', '/products', '/products/relaxkonos', '/downloads', '/releases', '/faq', '/about'];

const docsRoot = path.resolve(
  process.env.RELAXKON_DOCS_ROOT ??
    path.join(repoRoot, '..', 'RelaxKonServer', 'RelaxKonServer', 'Content', 'Docs'),
);

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `<language>/<version>` -> slug -> lastmod (YYYY-MM-DD). */
function collectDocuments() {
  const documents = new Map();
  for (const language of LANGUAGES) {
    const languageRoot = path.join(docsRoot, language);
    if (!fs.existsSync(languageRoot)) continue;
    for (const version of fs.readdirSync(languageRoot, { withFileTypes: true })) {
      if (!version.isDirectory()) continue;
      const slugs = new Map();
      collectSlugs(path.join(languageRoot, version.name), '', slugs);
      if (slugs.size) documents.set(`${language}/${version.name}`, slugs);
    }
  }
  return documents;
}

function collectSlugs(dir, prefix, slugs) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSlugs(full, prefix ? `${prefix}/${entry.name}` : entry.name, slugs);
    } else if (entry.name.endsWith('.md')) {
      const slug = [...(prefix ? prefix.split('/') : []), entry.name.replace(/\.md$/, '')].join('/');
      slugs.set(slug, fs.statSync(full).mtime.toISOString().slice(0, 10));
    }
  }
}

function renderUrl(url, alternates, lastmod) {
  const lines = [`  <url>`, `    <loc>${escapeXml(url)}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  for (const [language, href] of alternates) {
    lines.push(`    <xhtml:link rel="alternate" hreflang="${language}" href="${escapeXml(href)}"/>`);
  }
  lines.push('  </url>');
  return lines.join('\n');
}

function buildSitemap() {
  const entries = STATIC_ROUTES.map(route => renderUrl(`${ORIGIN}${route}`, [], null));
  const releaseRoot = path.resolve(docsRoot, '..', 'Releases');
  if (fs.existsSync(releaseRoot)) {
    for (const file of fs.readdirSync(releaseRoot).filter(file => /^\d+(?:\.\d+)*(?:-[A-Za-z0-9.-]+)?\.md$/.test(file)).sort()) {
      entries.push(renderUrl(`${ORIGIN}/releases/${file.slice(0, -3)}`, [], fs.statSync(path.join(releaseRoot, file)).mtime.toISOString().slice(0, 10)));
    }
  }

  const documents = collectDocuments();
  if (documents.size === 0) {
    console.warn(`note: no documentation content found under ${docsRoot}`);
    console.warn('      sitemap will list the static routes only; set RELAXKON_DOCS_ROOT to include articles');
    return entries;
  }

  // Only translations of the same document version are language alternates.
  const bySlug = new Map(); // slug -> [{ language, version, lastmod }]
  for (const [key, slugs] of documents) {
    const [language, version] = key.split('/');
    for (const [slug, lastmod] of slugs) {
      const documentKey = `${version}/${slug}`;
      if (!bySlug.has(documentKey)) bySlug.set(documentKey, []);
      bySlug.get(documentKey).push({ language, version, lastmod, slug });
    }
  }

  for (const documentKey of [...bySlug.keys()].sort()) {
    const variants = bySlug.get(documentKey).sort((a, b) => a.language.localeCompare(b.language));
    const slug = variants[0].slug;
    const alternates = variants.map(variant => [
      variant.language,
      `${ORIGIN}/docs/${variant.language}/${variant.version}/${slug}`,
    ]);
    const defaultVariant = variants.find(variant => variant.language === DEFAULT_LANGUAGE);
    if (defaultVariant) {
      alternates.push(['x-default', `${ORIGIN}/docs/${defaultVariant.language}/${defaultVariant.version}/${slug}`]);
    }
    for (const variant of variants) {
      const url = `${ORIGIN}/docs/${variant.language}/${variant.version}/${slug}`;
      entries.push(renderUrl(url, alternates, variant.lastmod));
    }
  }

  return entries;
}

const entries = buildSitemap();
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...entries,
  '</urlset>',
  '',
].join('\n');

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, sitemap, 'utf8');
console.log(`wrote ${path.relative(repoRoot, outputFile)} with ${entries.length} url entries`);
