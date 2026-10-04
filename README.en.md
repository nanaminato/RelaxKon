# RelaxKon website client

[中文](./README.md) · [日本語](./README.ja.md)

Website <https://relaxkon.com> · Product source repository <https://github.com/nanaminato/RelaxKonOS>

`RelaxKon/` is the **Angular 22.2.1** client for the official RelaxKon website. It owns every piece of browser UI: layouts, routes, pages, theme switching, runtime UI language switching and typed API clients.

The site is deliberately **not** a dashboard. It is a product website for RelaxKonOS, and the visual language is documented as design tokens in `src/styles.scss`.

## Requirements

- **Node.js ≥ 22.22.3, ≥ 24.15.0 or ≥ 26** (the Angular 22 CLI enforces this minimum, so a 22.22.x release must be at least 22.22.3) and npm 11.19.1
- A running `RelaxKonServer` instance for documentation, releases, downloads and FAQ content

## Commands

Tutorial images live under `public/assets/docs/screenshots/`. Run `npm run verify:doc-images` to validate their inventory and language alignment. See the [capture and replacement workflow](./docs/documentation-screenshots.md). Documentation text comes from the backend; deploy frontend static assets together with image-bearing tutorial updates.

Dependency baseline: Angular 22.2.1, TypeScript 6.0.3, RxJS 7.8.2, Vitest 5.0.3 and jsdom 30.1.2. Angular requires TypeScript `>=6.0 <6.1`. Use `npm ci` for fresh checkouts. For upgrades, run `npm outdated`, edit `package.json`, run `npm update`, commit the updated lockfile, then run `npm run build` and `npm test -- --watch=false`. See the [website development tutorial](https://relaxkon.com/docs/en-US/latest/getting-started/development).

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies |
| `npm start` | Dev server on <http://localhost:4200> with the `/api` proxy from `proxy.conf.json` |
| `npm run build` | Production bundle in `dist/RelaxKon` |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests (Vitest via `@angular/build:unit-test`) |

> `ng serve` reads `proxy.conf.json` once, at startup. **After editing the proxy configuration you must restart `npm start`** — hot reload does not reload it, and `/api/*` will answer 502 until you do.

## Structure

```text
src/
├── app/
│   ├── app.ts / app.html / app.config.ts / app.routes.ts   # root component, bootstrap config, route table
│   ├── core/
│   │   ├── api/          # documentation-api.service.ts, content-api.service.ts
│   │   ├── config/       # api-base-url.token.ts (API_BASE_URL injection token)
│   │   ├── i18n/         # i18n.service.ts (runtime UI language)
│   │   ├── models/       # content.models.ts (every API response model)
│   │   ├── pipes/        # localized-date.pipe.ts (rkDate)
│   │   ├── seo/          # seo.service.ts (title, description, canonical)
│   │   ├── services/     # markdown.service.ts (Markdown rendering)
│   │   └── theme/        # theme.service.ts (system / light / dark)
│   ├── layout/
│   │   ├── header/       # product dropdown, search entry, theme and language controls
│   │   ├── footer/
│   │   └── search/       # search-overlay.component.* (documentation search overlay)
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
├── index.html            # theme and language pre-resolution script, favicon links
├── main.ts
└── styles.scss           # all --rk-* design tokens, light and dark values
public/                   # favicon set, brand-mark.png, site.webmanifest, assets/i18n/*.json
```

Route table (`app.routes.ts`): `/`, `/products`, `/products/relaxkonos`, `/docs` (redirects to `getting-started/introduction` in the active UI language), `/docs/:language/:version/**`, `/downloads`, `/releases`, `/releases/:version`, `/faq`, `/about`, and a catch-all 404. Every page is a lazy-loaded standalone component.

## API connection

Every request goes through a typed service and uses the **relative** `/api` base URL from `src/environments/`. No component or service may hard-code an API host.

`npm start` loads `proxy.conf.json`, which forwards `/api` to the backend HTTPS development endpoint (`https://localhost:7252` by default — check `RelaxKonServer/Properties/launchSettings.json` if it changes). Certificate validation is disabled **for local development only**.

Production serves the Angular build and the API from the same origin, so the `/api` path is unchanged and only the reverse proxy configuration differs.

## Theme

`ThemeService` supports `system`, `light` and `dark`, persists the choice under the `rk-theme` LocalStorage key and listens to `prefers-color-scheme` in system mode. An inline script in `src/index.html` resolves the theme before the first paint so the palette never flashes.

All colours, spacing, radii and shadows are CSS custom properties (`--rk-*`) defined in `src/styles.scss`; the light and dark sets are selected through `data-theme` on `document.documentElement`. **Add a theme** by overriding those tokens under a new selector such as `:root[data-theme='relaxkon-dark']`, and extend `ThemePreference` plus the header options. Components never hard-code colours.

## UI languages

Runtime translations live in `public/assets/i18n/{en-US,zh-CN,ja-JP}.json` as nested objects. They are flattened to dotted keys at load time, so templates call `t('home.hero.title')`, with `{placeholder}` interpolation. Until a visitor manually selects a language, the UI follows the browser/system preferred language: Chinese becomes `zh-CN`, Japanese becomes `ja-JP`, and every other language becomes `en-US`; it also follows a browser `languagechange` event. Only a manual header selection is persisted under the `rk-language` LocalStorage key and takes precedence.

The three dictionaries must stay key-for-key identical (367 keys each today); a missing key renders as the key itself. After changing them, re-check with `node tools/verify-i18n-keys.mjs`, then run `node tools/verify-i18n-usage.mjs` to confirm every key referenced from the templates actually exists — a missing key never fails the build, it just shows up as the key name on the page. **Add a UI language** by:

1. Adding `public/assets/i18n/<code>.json`
2. Extending the `SiteLanguage` union and `SITE_LANGUAGES` in `core/i18n/i18n.service.ts`

## Content languages and documentation fallback

Documentation and FAQ use **content** languages supplied by the API, which are independent of the UI language.

`RelaxKonServer/Content/Docs/{en-US,zh-CN,ja-JP}` currently holds 42 documents per language (6 getting-started + 9 concepts + 27 applications), so all three are fully aligned and normal browsing never falls back. The fallback mechanism itself remains: when a slug is missing in the requested language it is served from `en-US` and the response sets `isFallback` so the UI can say so. **Keep the three languages in step when you add or remove content files**, otherwise fallback entries appear in the navigation.

The body language can therefore differ from the UI language. `<html lang>` comes from `I18nService.htmlLanguage` (`contentLanguage ?? language`); documentation pages call `i18n.setContentLanguage(...)` to point it at the language the article is **actually** written in — for a fallback page that is the served language, not the one requested in the route — and clear it when leaving `/docs`, which restores the UI language. The `<article>` element carries its own `lang` as well, because the surrounding chrome (navigation, sidebar) stays in the UI language. This is what lets a screen reader pronounce the body correctly, so **do not bypass either write point when changing documentation pages**. Note that the API's `DocumentResponse.language` echoes the requested language; use `isFallback` to detect the real one.

## Conventions

- **One component, three files**: `x.component.ts` / `x.component.html` / `x.component.scss`, with `templateUrl` and `styleUrl` (singular) in `@Component`. Never inline `template:` / `styles:`.
- **Native `<select>` always uses `[ngModel]` + `[ngValue]`, never `[value]`**: `[value]` is written before `@for` has produced the `<option>` elements, fails, and never retries because the bound expression has not changed.
- **Never use Angular's `DatePipe`**: its `LOCALE_ID` is fixed and does not follow the site language. Use the `rkDate` pipe (`core/pipes/localized-date.pipe.ts`) and pass the active language; it formats with `timeZone: 'UTC'` so a calendar date never shifts across time zones.
- **All SEO goes through `SeoService.apply({ title, description, path })`** — do not touch `document.title` or meta tags directly.
- **The brand mark is an image, not a letter**: the header and footer use `<img class="brand__mark" src="brand-mark.png" …>` (the source file lives in `public/`). Do not fall back to the "gradient rounded square plus white R" placeholder.

## Project boundary

This project is the only home for the website frontend. Do not add website UI to `RelaxKonServer`; it is an API-only application. See [`../WEBSITE_ARCHITECTURE.en.md`](../WEBSITE_ARCHITECTURE.en.md) for the workspace-wide boundary rules.

## Content updates and verification

Guides distinguish current source, actual verification and published packages. Detailed Android specifications remain in the product project at `Client/RelaxKonOS.Client.Android/docs/`; the website provides user-facing summaries and links. Android, account sign-in, upload resumption, alerts and recovery guides are included, with 16 FAQ entries. The 0.1.2 release record derives from four existing artifacts, not an inferred changelog for recent source features.

```bash
node tools/verify-i18n-keys.mjs
node tools/verify-i18n-usage.mjs
npm test -- --watch=false
npm run build
```
