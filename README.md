# RelaxKon 官网前端

[English](./README.en.md) · [日本語](./README.ja.md)

官网 <https://relaxkon.com> · 产品源码仓库 <https://github.com/nanaminato/RelaxKonOS>

`RelaxKon/` 是 RelaxKon 官方网站的 **Angular 22.2.1** 客户端，负责全部浏览器侧 UI：布局、路由、页面、主题切换、运行时 UI 语言切换以及类型化 API 客户端。

站点刻意**不做成后台面板**：它是 RelaxKonOS 的产品官网，视觉语言以设计令牌的形式集中定义在 `src/styles.scss`。

## 环境要求

- **Node.js ≥ 22.22.3、≥ 24.15.0 或 ≥ 26**（Angular 22 CLI 会强制校验该下限；22.22.x 必须 ≥ 22.22.3）以及 npm 11.19.1
- 一个正在运行的 `RelaxKonServer` 实例，用于提供文档、发布说明、下载与 FAQ 内容

## 常用命令

教程图片位于 `public/assets/docs/screenshots/`，截图清单与三语位置由 `npm run verify:doc-images` 检查。真实截图替换方式见[截图维护说明](./docs/documentation-screenshots.md)。文档正文由后端提供，部署教程图片时同步更新官网前端静态资源。

依赖基线：Angular 22.2.1、TypeScript 6.0.3、RxJS 7.8.2、Vitest 5.0.3、jsdom 30.1.2。Angular 要求 TypeScript `>=6.0 <6.1`。新检出使用 `npm ci`；维护版本时先执行 `npm outdated`，修改 `package.json` 后执行 `npm update`，同时更新锁文件，并运行 `npm run build` 与 `npm test -- --watch=false`。完整步骤见[官网开发教程](https://relaxkon.com/docs/zh-CN/latest/getting-started/development)。

| 命令 | 作用 |
| --- | --- |
| `npm ci` | 安装依赖 |
| `npm start` | 开发服务器 <http://localhost:4200>，并按 `proxy.conf.json` 代理 `/api` |
| `npm run build` | 生产构建，输出到 `dist/RelaxKon` |
| `npm run watch` | 以开发配置监听构建 |
| `npm test` | 单元测试（Vitest，`@angular/build:unit-test`） |
| `npm run verify:i18n` | 三语词典对齐 + 引用键校验 |
| `npm run verify:doc-images` | 文档截图清单与三语引用校验 |
| `npm run assets:sitemap` | 重新生成 `public/sitemap.xml` |
| `npm run assets:og-image` | 重新渲染 `public/og-image.png`（需本机 Chrome/Edge） |

> `ng serve` 只在启动时读取 `proxy.conf.json`。**改过代理配置必须重启 `npm start`**，热重载不会重载代理，否则 `/api/*` 会返回 502。

## 目录结构

```text
src/
├── app/
│   ├── app.ts / app.html / app.config.ts / app.routes.ts   # 根组件、启动配置、路由表
│   ├── core/
│   │   ├── api/          # documentation-api.service.ts、content-api.service.ts
│   │   ├── config/       # api-base-url.token.ts（API_BASE_URL 注入令牌）
│   │   ├── i18n/         # i18n.service.ts（运行时 UI 语言）
│   │   ├── models/       # content.models.ts（全部 API 响应模型）
│   │   ├── pipes/        # localized-date.pipe.ts（rkDate）
│   │   ├── seo/          # seo.service.ts（标题/描述/canonical/分享卡片与 og:*）
│   │   ├── services/     # markdown.service.ts（Markdown 渲染）
│   │   └── theme/        # theme.service.ts（system / light / dark）
│   ├── layout/
│   │   ├── header/       # 产品下拉、搜索入口、主题与语言控件
│   │   ├── footer/
│   │   └── search/       # search-overlay.component.*（文档搜索浮层）
│   └── features/
│       ├── home/         # 首页
│       ├── products/     # 产品索引
│       ├── relaxkonos/   # RelaxKonOS 产品页
│       ├── docs/         # 文档外壳：侧边导航 + 正文 + 目录
│       ├── downloads/
│       ├── releases/     # releases.component.* 列表 + release-detail.component.* 详情
│       ├── faq/
│       ├── about/
│       └── not-found/
├── environments/         # environment.ts（生产）/ environment.development.ts
├── index.html            # 主题与语言的预解析脚本（含词典 preload）、favicon 与 og 默认值
├── main.ts
└── styles.scss           # 全部 --rk-* 设计令牌，含亮/暗两套取值
public/                   # favicon 全套、brand-mark.png、og-image.png、robots.txt、sitemap.xml、site.webmanifest、assets/i18n/*.json
tools/                    # i18n 与截图校验、sitemap 生成、分享卡片源文件与渲染脚本
```

路由表（`app.routes.ts`）：`/`、`/products`、`/products/relaxkonos`、`/docs`（按当前 UI 语言重定向到 `getting-started/introduction`）、`/docs/:language/:version/**`、`/downloads`、`/releases`、`/releases/:version`、`/faq`、`/about`，以及兜底的 404。所有页面均为懒加载的 standalone 组件。

## 与 API 的连接

每个请求都经过类型化服务，并使用 `src/environments/` 中的**相对** `/api` 基地址。任何组件或服务都不得硬编码 API 主机。

`npm start` 会加载 `proxy.conf.json`，把 `/api` 转发到后端 HTTPS 开发端点（默认 `https://localhost:7252`，若改动请查看 `RelaxKonServer/Properties/launchSettings.json`）。证书校验**仅在本地开发时**关闭。

生产环境由同一源站提供 Angular 构建产物与 API，`/api` 路径不变，区别只在反向代理配置。

## 主题

`ThemeService` 支持 `system` / `light` / `dark`，把选择保存在 LocalStorage 的 `rk-theme` 键，并在 system 模式下监听 `prefers-color-scheme`。`src/index.html` 中的内联脚本会在首次绘制前解析主题，避免闪烁。

所有颜色、间距、圆角与阴影都是定义在 `src/styles.scss` 的 CSS 自定义属性（`--rk-*`），亮暗两套通过 `document.documentElement` 上的 `data-theme` 切换。**新增主题**的做法是在新的选择器（例如 `:root[data-theme='relaxkon-dark']`）下覆盖这些令牌，并扩展 `ThemePreference` 与页头选项。组件中不允许硬编码颜色。

## UI 语言

运行时词条位于 `public/assets/i18n/{en-US,zh-CN,ja-JP}.json`，以嵌套对象书写，加载时被压平成点号键，模板里用 `t('home.hero.title')` 取值；支持 `{placeholder}` 插值。未手动选择时，UI 语言跟随浏览器/系统首选语言：中文为 `zh-CN`、日文为 `ja-JP`、其余语言一律为 `en-US`；浏览器触发 `languagechange` 时也会同步。用户在页头手动选择后，选择才保存到 LocalStorage 的 `rk-language` 键并优先使用。

三份词典的键必须完全对齐（当前各 376 条），缺键会直接显示键名。改完用 `node tools/verify-i18n-keys.mjs` 复核，再用 `node tools/verify-i18n-usage.mjs` 确认模板里引用的键都真的存在（缺键不会让构建失败，只会在页面上显示成键名）。**新增一种 UI 语言**需要：

1. 添加 `public/assets/i18n/<code>.json`；
2. 扩展 `core/i18n/i18n.service.ts` 中的 `SiteLanguage` 联合类型与 `SITE_LANGUAGES` 常量。

## 内容语言与文档回退

文档与 FAQ 使用的是**内容语言**，由 API 提供，与 UI 语言相互独立。

`RelaxKonServer/Content/Docs/{en-US,zh-CN,ja-JP}` 当前各 49 篇（入门 12 + 概念 9 + 应用 28），三种语言已完全对齐，因此正常浏览不会触发回退。回退机制本身仍然存在：某个 slug 在目标语言缺失时会取 `en-US` 的版本，并把响应的 `isFallback` 置为 `true`，由界面提示读者。**改动内容语言的文件数时必须让三种语言保持一致**，否则导航会出现回退项。

因此**正文语言与界面语言可以不同**。`<html lang>` 由 `I18nService` 的 `htmlLanguage`（`contentLanguage ?? language`）决定，文档页通过 `i18n.setContentLanguage(...)` 把它指向正文**实际**使用的语言——回退时按实际语言上报，而不是路由上请求的语言；离开 `/docs` 时清空，恢复为 UI 语言。`<article>` 元素另外单独挂了 `lang`，因为外壳（导航、侧栏）始终是 UI 语言。这套机制是为了让屏幕阅读器按正确语言朗读正文，**改动文档页时不要绕过这两个写入点**。注意 API 的 `DocumentResponse.language` 回显的是请求的语言，判断实际语言要用 `isFallback`。

## 代码约定

- **一个组件三个文件**：`x.component.ts` / `x.component.html` / `x.component.scss`，`@Component` 使用 `templateUrl` 与 `styleUrl`（单数）。不要内联 `template:` / `styles:`。
- **原生 `<select>` 一律用 `[ngModel]` + `[ngValue]`，不要用 `[value]`**：`[value]` 会在 `@for` 生成 `<option>` 之前写入并失败，而且因为表达式值没变而永远不会重试。
- **日期不要用 Angular 的 `DatePipe`**：它的 `LOCALE_ID` 固定，切语言后不会变。改用 `rkDate` 管道（`core/pipes/localized-date.pipe.ts`）并以当前语言作为参数；它内部按 `timeZone: 'UTC'` 格式化，日历日不会因时区偏移。
- **SEO 统一走 `SeoService.apply(...)`**，标题与描述用 `titleKey` / `descriptionKey` 走词典（`pageTitles.*` / `pageDescriptions.*`），只有正文由 API 提供的页面才传字面量 `description`。分享图、canonical 与 `og:*` 全部由它写入，不要在页面里散写；`document.title` 与 meta 标签也不要直接操作。
- **品牌标是图片不是字母**：页头/页脚使用 `<img class="brand__mark" src="brand-mark.png" …>`（源文件在 `public/`），不要再回退成「渐变方块 + 字母 R」的占位实现。

## 分享图与收录文件

`public/` 下的三个文件是分享与收录用的生成物或静态资产，**不要手改**：

- `og-image.png`（1200×630）：`og:image` 与 `twitter:image` 指向的分享卡片。源文件是 `tools/og-card.html`，用 `npm run assets:og-image` 重新渲染（本机 Chrome 或 Edge，可用 `CHROME_PATH` 指定）。
- `sitemap.xml`：由 `npm run assets:sitemap` 从静态路由 + `RelaxKonServer/Content/Docs` 生成。内容不在默认相对位置时用 `RELAXKON_DOCS_ROOT` 指定；找不到内容时只输出静态路由，不算失败。文档是唯一「一个语言一个 URL」的部分，所以 `hreflang` 只写在文档条目上。
- `robots.txt`：静态文件，指向 sitemap。

分享图、canonical 与全部 `og:*` / `twitter:*` 由 `SeoService` 在每个路由上写入；`src/index.html` 里另有一份静态默认值，供不执行 JavaScript 的抓取器使用。

## 项目边界

本项目是官网前端的唯一归属地。不要把官网 UI 加到 `RelaxKonServer`（那里只有 API）。工作区级的边界规则见 [`../WEBSITE_ARCHITECTURE.md`](../WEBSITE_ARCHITECTURE.md)。

## 内容更新与验证

官网指南区分当前源码能力、实际验收和已发布包。Android 详细规范以产品工程 `Client/RelaxKonOS.Client.Android/docs/` 为准；官网只保留用户向摘要与链接。当前新增 Android、账户登录、上传续传、事件告警、备份恢复指南，FAQ 共 16 项。0.1.2 发行记录来自现有四个发布包的清单，不推断该包包含近期源码功能。

```bash
node tools/verify-i18n-keys.mjs
node tools/verify-i18n-usage.mjs
npm test -- --watch=false
npm run build
```
