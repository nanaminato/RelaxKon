# RelaxKon website client

`RelaxKon/` is the Angular 22 client for the official RelaxKon website. It contains all browser UI: layouts, routes, pages, theme switching, runtime UI language switching, and typed API clients.

## Requirements and commands

- Node.js compatible with Angular 22 and npm 11+
- `npm install`
- `npm start` — serves `http://localhost:4200`
- `npm run build` — creates the production build in `dist/RelaxKon`

## API and local proxy

All client requests use the relative `/api` base URL supplied by `src/environments/`. `npm start` loads `proxy.conf.json`, which forwards `/api` to the backend HTTPS development endpoint at `https://localhost:7252`. The proxy disables certificate validation only for local development.

Do not hard-code an API host in a component or service. A production reverse proxy should expose the same `/api` path on `relaxkon.com`.

## Theme and UI languages

`ThemeService` supports system, light, and dark preferences, persists the choice in LocalStorage, and watches `prefers-color-scheme` in system mode. Theme values are CSS design tokens in `src/styles.scss`.

UI translations are runtime-loaded from `public/assets/i18n/`. To add a UI language, add its JSON dictionary, extend `SiteLanguage`, and add it to the header selector. Documentation language is URL-based and comes from the API.

## Project boundary

This project is the only home for the website frontend. Do not add website UI to `RelaxKonServer`; it is an API-only application. See [`../WEBSITE_ARCHITECTURE.md`](../WEBSITE_ARCHITECTURE.md) for the workspace-wide boundary rules.
