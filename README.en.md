# RelaxKon website client

[中文](./README.md) · [日本語](./README.ja.md)

Website <https://relaxkon.com> · Product source repository <https://github.com/nanaminato/RelaxKonOS>

`RelaxKon/` is the **Angular 22.2.1** client for the official RelaxKon website. Everything that runs in the browser lives here: layouts, routes, pages, theme switching, runtime UI language switching and typed API clients. Documentation, release notes, download listings and FAQ text come from `RelaxKonServer`; this repository only renders them.

Design tokens for colours, spacing, radii and shadows are defined once in `src/styles.scss`.

## Requirements

- **Node.js ≥ 22.22.3, ≥ 24.15.0 or ≥ 26** (the Angular 22 CLI enforces this minimum, so a 22.22.x release must be at least 22.22.3) and npm ≥ 11.19.1 (`packageManager` pins 11.19.1)
- A running `RelaxKonServer` instance for documentation, release notes, downloads and FAQ content; without it the pages still load, but documentation text is replaced by a warning notice

The site is a plain CSR application with no SSR or prerendering: the first HTML response carries no article text, so indexing relies on `sitemap.xml` plus the meta tags written at runtime.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the lockfile |
| `npm start` | Dev server on <http://localhost:4200>, proxying `/api` and `/relaxkonos` via `proxy.conf.json` |
| `npm run build` | Production build into `dist/RelaxKon/browser`; `prebuild` regenerates `sitemap.xml` first |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests (Vitest via `@angular/build:unit-test`); watches by default, add `-- --watch=false` for one run |
| `npm run verify:i18n` | Dictionary alignment plus referenced-key checks (runs both verify-i18n scripts) |
| `npm run verify:doc-images` | Tutorial screenshot inventory and language alignment |
| `npm run assets:sitemap` | Regenerate `public/sitemap.xml` |
| `npm run assets:og-image` | Re-render `public/og-image.png` (needs a local Chrome or Edge; `CHROME_PATH` overrides) |

> `ng serve` reads `proxy.conf.json` once, at startup. **After editing the proxy configuration you must restart `npm start`** — hot reload does not reload it, and `/api/*` will answer 502 until you do.

> `npm run build` runs `prebuild` (`tools/generate-sitemap.mjs`) first, so every build ships a fresh sitemap; when the `RelaxKonServer` content tree is missing it emits the static routes only and does not fail.

Production budgets: initial 500 kB warning and 1 MB error; a single component stylesheet 8 kB warning and 16 kB error.

The full workflow is covered by the [development tutorial](https://relaxkon.com/docs/en-US/latest/getting-started/development).

## Structure

```text
src/
├── app/
│   ├── app.ts / app.html / app.config.ts / app.routes.ts   # root component, bootstrap config, route table
│   ├── core/
│   │   ├── api/          # documentation-api.service.ts, content-api.service.ts
│   │   ├── config/       # api-base-url.token.ts (API_BASE_URL injection token)
│   │   ├── docs/         # docs-link.ts (docsUrl() builds language-aware documentation links)
│   │   ├── i18n/         # i18n.service.ts (runtime UI language)
│   │   ├── models/       # content.models.ts (every API response model)
│   │   ├── pipes/        # localized-date.pipe.ts (rkDate)
│   │   ├── seo/          # seo.service.ts (title, description, canonical, share card, og:*)
│   │   ├── services/     # markdown.service.ts (Markdown rendering)
│   │   └── theme/        # theme.service.ts (system / light / dark)
│   ├── layout/
│   │   ├── header/       # product dropdown, search entry, theme and language controls
│   │   ├── footer/
│   │   └── search/       # search-overlay.component.* (documentation search overlay)
│   ├── shared/           # cross-page components (github-link)
│   └── features/
│       ├── home/         # landing page
│       ├── products/     # product index
│       ├── relaxkonos/   # RelaxKonOS product page
│       ├── docs/         # documentation shell: sidebar, content, table of contents
│       ├── downloads/
│       ├── releases/     # releases.component.* list + release-detail.component.* detail
│       ├── faq/
│       ├── about/
│       └── not-found/
├── environments/         # environment.ts (production) / environment.development.ts
├── index.html            # theme and language pre-resolution script (with dictionary preload), favicon and og defaults
├── main.ts
└── styles.scss           # all --rk-* design tokens, light and dark values
public/
├── assets/i18n/                  # three dictionaries (en-US / zh-CN / ja-JP)
├── assets/docs/screenshots/      # tutorial screenshots, one directory per language + manifest.json
├── assets/tutorials/             # tutorial diagram SVGs, one directory per language
├── brand-mark.png                # brand mark used by the header and footer
├── og-image.png                  # share card, generated
├── robots.txt
├── sitemap.xml                   # generated
└── site.webmanifest
tools/
├── verify-i18n-keys.mjs / verify-i18n-usage.mjs   # dictionary alignment, referenced-key checks
├── verify-doc-screenshots.mjs                     # screenshot inventory and language alignment
├── generate-sitemap.mjs / generate-og-image.mjs   # sitemap and share-card generation
├── og-card.html                                   # share-card source
└── generate-brand-assets.py                       # generates brand icons and the share image
```

Route table (`app.routes.ts`): `/`, `/products`, `/products/relaxkonos`, `/docs` (redirects to `getting-started/introduction` in the active UI language), `/docs/:language/:version/**`, `/downloads`, `/releases`, `/releases/:version`, `/faq`, `/about`, and a catch-all 404. Every page is a lazy-loaded standalone component.

## API connection

Every request goes through a typed service and uses the **relative** `/api` base URL from `src/environments/`. No component or service may hard-code an API host.

`npm start` loads `proxy.conf.json`, which forwards both `/api` and `/relaxkonos` to the backend HTTPS development endpoint (`https://localhost:7252` by default — check `RelaxKonServer/Properties/launchSettings.json` if it changes). `/relaxkonos` is the download artifact prefix (`/relaxkonos/<channel>/<version>/…`); without the proxy the download links go nowhere. Certificate validation is disabled **for local development only**.

Production serves the Angular build and the API from the same origin, so the `/api` path is unchanged and only the reverse proxy configuration differs.

## Theme

`ThemeService` supports `system`, `light` and `dark`, persists the choice under the `rk-theme` LocalStorage key and listens to `prefers-color-scheme` in system mode. An inline script in `src/index.html` resolves the theme before the first paint so the palette never flashes.

All colours, spacing, radii and shadows are CSS custom properties (`--rk-*`) defined in `src/styles.scss`; the light and dark sets are selected through `data-theme` on `document.documentElement`. **Add a theme** by overriding those tokens under a new selector such as `:root[data-theme='relaxkon-dark']`, and extend `ThemePreference` plus the header options. Components never hard-code colours.

## UI languages

Runtime translations live in `public/assets/i18n/{en-US,zh-CN,ja-JP}.json` as nested objects. They are flattened to dotted keys at load time, so templates call `t('home.hero.title')`, with `{placeholder}` interpolation. Until a visitor manually selects a language, the UI follows the browser/system preferred language: Chinese becomes `zh-CN`, Japanese becomes `ja-JP`, and every other language becomes `en-US`; it also follows a browser `languagechange` event. Only a manual header selection is persisted under the `rk-language` LocalStorage key and takes precedence.

The three dictionaries must stay key-for-key identical (390 keys each today); a missing key renders as the key itself. Re-check with `npm run verify:i18n`, which first compares the three dictionaries and then confirms every key referenced from templates and components actually exists — a missing key never fails the build, it just shows up as the key name on the page. **Add a UI language** by:

1. Adding `public/assets/i18n/<code>.json`
2. Extending the `SiteLanguage` union and `SITE_LANGUAGES` in `core/i18n/i18n.service.ts`

## Content languages and documentation fallback

Documentation and FAQ use **content** languages supplied by the API, using the active website language.

`RelaxKonServer/Content/Docs/{en-US,zh-CN,ja-JP}` currently holds 49 documents per language (12 getting-started + 9 concepts + 28 applications), so all three are fully aligned and normal browsing never falls back. The fallback mechanism itself remains: when a slug is missing in the requested language it is served from `en-US` and the response sets `isFallback` so the UI can say so. **Keep the three languages in step when you add or remove content files**, otherwise fallback entries appear in the navigation.

The website and documentation share the header language setting. Opening a localized documentation URL synchronizes the interface language; switching languages preserves the document path, version and anchor. `<html lang>` follows the interface. Missing translations fall back to English, with an explicit notice and the actual language on `<article lang>`; fallback pages are excluded from search indexing. The API echoes the requested language in `DocumentResponse.language`, so use `isFallback` to identify an English fallback.

## Content and static assets

Documentation, FAQ, release notes and download listings all live in `RelaxKonServer/Content/`; this repository does not keep a copy: `Docs/<lang>/<version>/…`, `Faq/*.json`, `Releases/`, `Downloads/downloads.json`. Change the backend content tree first, then verify the three languages in this UI.

Tutorial screenshots live under `public/assets/docs/screenshots/{zh-CN,en-US,ja-JP}/` with the inventory in `manifest.json` next to them (currently 20 screenshot slots × 3 languages). **All 60 entries are still `status: placeholder`**; see the [screenshot workflow](./docs/documentation-screenshots.md) (in Chinese) for replacing them with real captures. Tutorial diagram SVGs live in `public/assets/tutorials/<lang>/`. Run `npm run verify:doc-images` after touching either.

Editorial rule: the site separates "what the source can do", "what was actually verified" and "what was published", and never presents source support as a shipped feature. The 0.1.2 release record was reconstructed from the download listing at the time and makes no claim about later source features; Android details belong to `Client/RelaxKonOS.Client.Android/docs/` in the product repository, and the site keeps only user-facing summaries and links.

## Upgrading dependencies

Angular requires TypeScript `>=6.0 <6.1`. Current baseline: Angular 22.2.1, TypeScript 6.0.3, RxJS 7.8.2, Vitest 5.0.3, jsdom 30.1.2.

1. `npm outdated` to see what is behind;
2. Edit `package.json`, then run `npm update`;
3. **Commit the lockfile together with `package.json`** — otherwise `npm ci` fails on the mismatch;
4. Run `npm run build` and `npm test -- --watch=false` to confirm budgets and tests still pass.

## Conventions

- **One component, three files**: `x.component.ts` / `x.component.html` / `x.component.scss`, with `templateUrl` and `styleUrl` (singular) in `@Component`. Never inline `template:` / `styles:`.
- **Native `<select>` always uses `[ngModel]` + `[ngValue]`, never `[value]`**: `[value]` is written before `@for` has produced the `<option>` elements, fails, and never retries because the bound expression has not changed.
- **Never use Angular's `DatePipe`**: its `LOCALE_ID` is fixed and does not follow the site language. Use the `rkDate` pipe (`core/pipes/localized-date.pipe.ts`) and pass the active language; it formats with `timeZone: 'UTC'` so a calendar date never shifts across time zones.
- **Build documentation links with `docsUrl(language, slug)`** from `core/docs/docs-link.ts`, never by string-concatenating `/docs/zh-CN/…`: documentation routes are language-first, so a hard-coded language sends Chinese and Japanese readers to English pages.
- **All SEO goes through `SeoService.apply(...)`** — titles and descriptions are resolved from the dictionaries through `titleKey` / `descriptionKey` (`pageTitles.*` / `pageDescriptions.*`); only pages whose text comes from the API pass a literal `description`. The share image, canonical link and every `og:*` tag are written there too, so do not scatter them across pages, and do not touch `document.title` or meta tags directly.
- **The brand mark is an image, not a letter**: the header and footer use `<img class="brand__mark" src="brand-mark.png" …>` (the source file lives in `public/`). Do not fall back to the "gradient rounded square plus white R" placeholder.

## Share card and crawler files

These files under `public/` are generated or static sharing and crawling assets — **do not edit them by hand**:

- `og-image.png` (1200×630): the card behind `og:image` and `twitter:image`. Its source is `tools/og-card.html`; re-render it with `npm run assets:og-image` (a local Chrome or Edge).
- `sitemap.xml`: built by `npm run assets:sitemap` from the static routes plus `RelaxKonServer/Content/Docs`. Point `RELAXKON_DOCS_ROOT` at the content tree when it is not in the default relative location. Documentation is the only part whose URL carries the language, so `hreflang` alternates appear there and nowhere else.
- `robots.txt`: static, points at the sitemap.

`src/index.html` carries a static default set for crawlers that do not run JavaScript.

## Project boundary

This project is the only home for the website frontend. Do not add website UI to `RelaxKonServer`; it is an API-only application. See [`../WEBSITE_ARCHITECTURE.en.md`](../WEBSITE_ARCHITECTURE.en.md) for the workspace-wide boundary rules.

## Pre-commit checks

```bash
npm run verify:i18n          # dictionary alignment + referenced keys
npm run verify:doc-images    # screenshot inventory and language alignment
npm test -- --watch=false    # unit tests
npm run build                # production build (regenerates the sitemap)
```
