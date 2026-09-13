# RelaxKon website client

[中文](./README.md) · [日本語](./README.ja.md)

`RelaxKon/` is the **Angular 22** client for the official RelaxKon website. It owns every piece of browser UI: layouts, routes, pages, theme switching, runtime UI language switching and typed API clients.

The site is deliberately **not** a dashboard. It is a product website for RelaxKonOS, and the visual language is documented as design tokens in `src/styles.scss`.

## Requirements

- **Node.js ≥ 22.22.3, ≥ 24.15.0 or ≥ 26** (the Angular 22 CLI enforces this minimum, so a 22.22.x release must be at least 22.22.3) and npm 11+
- A running `RelaxKonServer` instance for documentation, releases, downloads and FAQ content

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
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

The three dictionaries must stay key-for-key identical (321 keys each today); a missing key renders as the key itself. **Add a UI language** by:

1. Adding `public/assets/i18n/<code>.json`
2. Extending the `SiteLanguage` union and `SITE_LANGUAGES` in `core/i18n/i18n.service.ts`

## Content languages and documentation fallback

Documentation and FAQ use **content** languages supplied by the API, which are independent of the UI language.

`RelaxKonServer/Content/Docs/{en-US,zh-CN,ja-JP}` currently holds 26 documents per language, so all three are fully aligned and normal browsing never falls back. The fallback mechanism itself remains: when a slug is missing in the requested language it is served from `en-US` and the response sets `isFallback` so the UI can say so. **Keep the three languages in step when you add or remove content files**, otherwise fallback entries appear in the navigation.

## Conventions

- **One component, three files**: `x.component.ts` / `x.component.html` / `x.component.scss`, with `templateUrl` and `styleUrl` (singular) in `@Component`. Never inline `template:` / `styles:`.
- **Native `<select>` always uses `[ngModel]` + `[ngValue]`, never `[value]`**: `[value]` is written before `@for` has produced the `<option>` elements, fails, and never retries because the bound expression has not changed.
- **Never use Angular's `DatePipe`**: its `LOCALE_ID` is fixed and does not follow the site language. Use the `rkDate` pipe (`core/pipes/localized-date.pipe.ts`) and pass the active language; it formats with `timeZone: 'UTC'` so a calendar date never shifts across time zones.
- **All SEO goes through `SeoService.apply({ title, description, path })`** — do not touch `document.title` or meta tags directly.
- **The brand mark is an image, not a letter**: the header and footer use `<img class="brand__mark" src="brand-mark.png" …>` (the source file lives in `public/`). Do not fall back to the "gradient rounded square plus white R" placeholder.

## Project boundary

This project is the only home for the website frontend. Do not add website UI to `RelaxKonServer`; it is an API-only application. See [`../WEBSITE_ARCHITECTURE.en.md`](../WEBSITE_ARCHITECTURE.en.md) for the workspace-wide boundary rules.
