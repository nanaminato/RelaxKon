# RelaxKon website client

`RelaxKon/` is the Angular client for the official RelaxKon website. It owns every piece of browser UI: layouts, routes, pages, theme switching, runtime UI language switching and typed API clients.

The site is deliberately **not** a dashboard. It is a product website for RelaxKonOS, and the visual language is documented as design tokens in `src/styles.scss`.

## Requirements

- **Node.js ≥ 22.22.3, ≥ 24.15.0 or ≥ 26** (Angular 22 enforces this minimum) and npm 11+
- A running `RelaxKonServer` instance for documentation, releases, downloads and FAQ content

```bash
npm install
npm start          # http://localhost:4200, with the development API proxy
npm run build      # production bundle in dist/RelaxKon
npm run watch      # development build in watch mode
npm test           # unit tests
```

## Structure

```text
src/app/
├── core/
│   ├── api/          # documentation-api.service.ts, content-api.service.ts
│   ├── config/       # API_BASE_URL injection token
│   ├── i18n/         # runtime UI language service
│   ├── models/       # API response models
│   ├── seo/          # title, meta description and canonical management
│   ├── services/     # markdown renderer
│   └── theme/        # system / light / dark preference
├── layout/
│   ├── header/       # product dropdown, search entry, theme and language controls
│   ├── footer/
│   └── search/       # documentation search overlay
└── features/
    ├── home/         # landing page
    ├── products/     # product index
    ├── relaxkonos/   # RelaxKonOS product page
    ├── docs/         # documentation shell: sidebar, content, table of contents
    ├── downloads/
    ├── releases/     # list and detail
    ├── faq/
    ├── about/
    └── not-found/
```

## API connection

Every request goes through a typed service and uses the **relative** `/api` base URL from `src/environments/`. No component or service may hard-code an API host.

`npm start` loads `proxy.conf.json`, which forwards `/api` to the backend HTTPS development endpoint (`https://localhost:7252` by default — check `RelaxKonServer/Properties/launchSettings.json` if it changes). Certificate validation is disabled **for local development only**.

Production serves the Angular build and the API from the same origin, so the `/api` path is unchanged and only the reverse proxy configuration differs.

## Theme

`ThemeService` supports `system`, `light` and `dark`, persists the choice in LocalStorage and listens to `prefers-color-scheme` in system mode. `src/index.html` applies the resolved theme before the first paint to avoid a flash.

All colours, spacing, radii and shadows are CSS custom properties (`--rk-*`) defined in `src/styles.scss`. **Add a theme** by overriding those tokens under a new selector such as `:root[data-theme='relaxkon-dark']`, and extend `ThemePreference` plus the header options. Components never hard-code colours.

## UI languages

Runtime translations live in `public/assets/i18n/{en-US,zh-CN,ja-JP}.json` as nested objects and are flattened to dotted keys (`t('home.hero.title')`). Switching language never reloads the page and the choice is stored in LocalStorage, falling back to the browser language and finally to `en-US`.

**Add a UI language** by:

1. Adding `public/assets/i18n/<code>.json`
2. Extending the `SiteLanguage` union and `SITE_LANGUAGES` in `core/i18n/i18n.service.ts`

Documentation and FAQ languages are **content** languages, supplied by the API. Japanese documentation currently falls back to English for pages that are not translated yet; the fallback is surfaced in the UI.

## Project boundary

This project is the only home for the website frontend. Do not add website UI to `RelaxKonServer`; it is an API-only application. See [`../WEBSITE_ARCHITECTURE.md`](../WEBSITE_ARCHITECTURE.md) for the workspace-wide boundary rules.
