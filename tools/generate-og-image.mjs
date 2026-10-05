// Render tools/og-card.html to public/og-image.png — the 1200×630 card that
// og:image and twitter:image point at.
//
// Chrome (or Edge) is used instead of an image library so the card picks up the
// same font stack the site declares. Set CHROME_PATH to override the lookup.
// The temporary profile is intentionally not deleted: Chrome may still hold
// handles on it, and removing a large profile directory is not worth the risk.
//
// Usage: node tools/generate-og-image.mjs [outputFile]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cardFile = path.join(repoRoot, 'tools', 'og-card.html');
const outputFile = path.resolve(process.argv[2] ?? path.join(repoRoot, 'public', 'og-image.png'));

const WIDTH = 1200;
const HEIGHT = 630;

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const browser = CANDIDATES.find(candidate => fs.existsSync(candidate));
if (!browser) {
  console.error('no Chrome or Edge found; set CHROME_PATH to a browser executable');
  process.exit(1);
}

const profile = path.join(os.tmpdir(), 'relaxkon-og-profile');
fs.mkdirSync(profile, { recursive: true });
fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const toFileUrl = (value) => `file:///${value.replace(/\\/g, '/')}`;

execFileSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    // Pin the scale factor: a scaled display would otherwise emit a 2× bitmap.
    '--force-device-scale-factor=1',
    `--user-data-dir=${profile}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    '--virtual-time-budget=4000',
    `--screenshot=${outputFile}`,
    toFileUrl(cardFile),
  ],
  { stdio: 'inherit' },
);

const png = fs.readFileSync(outputFile);
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width !== WIDTH || height !== HEIGHT) {
  console.error(`expected ${WIDTH}×${HEIGHT} but rendered ${width}×${height}`);
  process.exit(1);
}

console.log(`wrote ${path.relative(repoRoot, outputFile)} (${width}×${height}, ${png.length} bytes)`);
