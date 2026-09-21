// Verify the three dictionaries stay in lockstep. The loader flattens nested
// objects to dot-keys, so a key present in one language but not another only
// shows up here — the UI silently renders the raw key instead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Default to this repository's own dictionary directory so the script works from
// any working directory: <repo>/tools/ -> <repo>/public/assets/i18n.
const defaultDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'i18n');
const dir = path.resolve(process.argv[2] ?? defaultDir);
const LANGS = ['en-US', 'zh-CN', 'ja-JP'];

const flatten = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, child]) =>
    child && typeof child === 'object' && !Array.isArray(child)
      ? flatten(child, `${prefix}${key}.`)
      : [[`${prefix}${key}`, child]],
  );

const maps = {};
for (const lang of LANGS) {
  const parsed = JSON.parse(fs.readFileSync(path.join(dir, `${lang}.json`), 'utf8'));
  maps[lang] = Object.fromEntries(flatten(parsed));
  console.log(`${lang}: keys=${Object.keys(maps[lang]).length} appNames=${Object.keys(parsed.appNames ?? {}).length}`);
}

const reference = Object.keys(maps['en-US']);
let problems = 0;
for (const lang of LANGS.filter((l) => l !== 'en-US')) {
  const missing = reference.filter((key) => !(key in maps[lang]));
  const extra = Object.keys(maps[lang]).filter((key) => !(key in maps['en-US']));
  if (missing.length || extra.length) {
    console.log(`${lang}: missing=[${missing.join(', ')}] extra=[${extra.join(', ')}]`);
    problems += 1;
  } else {
    console.log(`${lang}: in sync with en-US`);
  }
}

console.log(problems === 0 ? 'OK: dictionaries aligned' : `FAILED: ${problems} language(s) out of sync`);
process.exitCode = problems === 0 ? 0 : 1;
