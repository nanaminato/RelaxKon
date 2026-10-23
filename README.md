# RelaxKon 官网前端

[English](./README.en.md) · [日本語](./README.ja.md)

官网 <https://relaxkon.com> · 产品源码仓库 <https://github.com/nanaminato/RelaxKonOS>

`RelaxKon/` 是 RelaxKon 官网的 **Angular 22.2.1** 客户端，浏览器侧的一切都在这里：布局、路由、页面、主题切换、运行时 UI 语言切换与类型化 API 客户端。文档、发布说明、下载清单和 FAQ 的正文由 `RelaxKonServer` 提供，本仓库只负责渲染。

颜色、间距、圆角与阴影等设计令牌统一定义在 `src/styles.scss`。

## 环境要求

- **Node.js ≥ 22.22.3、≥ 24.15.0 或 ≥ 26**（Angular 22 CLI 会强制校验该下限，22.22.x 必须 ≥ 22.22.3）与 npm ≥ 11.19.1（`packageManager` 锁在 11.19.1）
- 一个运行中的 `RelaxKonServer` 实例，用于提供文档、发布说明、下载与 FAQ 内容；后端不可用时页面仍能打开，文档正文会换成警告提示

站点是纯 CSR，没有 SSR 或预渲染：首屏 HTML 不含正文，收录依赖 `sitemap.xml` 与运行时写入的 meta。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm ci` | 按锁文件安装依赖 |
| `npm start` | 开发服务器 <http://localhost:4200>，按 `proxy.conf.json` 代理 `/api` 与 `/relaxkonos` |
| `npm run build` | 生产构建，输出到 `dist/RelaxKon/browser`；`prebuild` 会先重建 `sitemap.xml` |
| `npm run watch` | 以开发配置监听构建 |
| `npm test` | 单元测试（Vitest，`@angular/build:unit-test`）；默认监听，跑一次加 `-- --watch=false` |
| `npm run verify:i18n` | 三语词典对齐 + 模板引用键校验（依次运行两个 verify-i18n 脚本） |
| `npm run verify:doc-images` | 教程截图清单与三语引用校验 |
| `npm run assets:sitemap` | 重新生成 `public/sitemap.xml` |
| `npm run assets:og-image` | 重新渲染 `public/og-image.png`（需本机 Chrome/Edge，可用 `CHROME_PATH` 指定） |

> `ng serve` 只在启动时读取 `proxy.conf.json`。**改过代理配置必须重启 `npm start`**，热重载不会重载代理，否则 `/api/*` 会返回 502。

> `npm run build` 会先跑 `prebuild`（`tools/generate-sitemap.mjs`），所以每次构建的 sitemap 都是新的；找不到 `RelaxKonServer` 内容目录时只写入静态路由，不算失败。

生产构建预算：initial 500 kB 警告、1 MB 失败；单个组件样式 8 kB 警告、16 kB 失败。

完整开发步骤见官网的[开发教程](https://relaxkon.com/docs/zh-CN/latest/getting-started/development)。

## 目录结构

```text
src/
├── app/
│   ├── app.ts / app.html / app.config.ts / app.routes.ts   # 根组件、启动配置、路由表
│   ├── core/
│   │   ├── api/          # documentation-api.service.ts、content-api.service.ts
│   │   ├── config/       # api-base-url.token.ts（API_BASE_URL 注入令牌）
│   │   ├── docs/         # docs-link.ts（docsUrl() 生成带语言的文档链接）
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
│   ├── shared/           # 跨页面复用组件（github-link）
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
public/
├── assets/i18n/                  # 三语词典（en-US / zh-CN / ja-JP）
├── assets/docs/screenshots/      # 教程截图，三语目录 + manifest.json
├── assets/tutorials/             # 教程图解 SVG，三语目录
├── brand-mark.png                # 品牌标（页头/页脚用）
├── og-image.png                  # 分享卡片，由脚本生成
├── robots.txt
├── sitemap.xml                   # 由脚本生成
└── site.webmanifest
tools/
├── verify-i18n-keys.mjs / verify-i18n-usage.mjs   # 词典对齐、引用键校验
├── verify-doc-screenshots.mjs                     # 截图清单与三语引用校验
├── generate-sitemap.mjs / generate-og-image.mjs   # sitemap 与分享卡片生成
├── og-card.html                                   # 分享卡片源文件
└── generate-brand-assets.py                       # 品牌图标与分享图的源文件生成
```

路由表（`app.routes.ts`）：`/`、`/products`、`/products/relaxkonos`、`/docs`（按当前 UI 语言重定向到 `getting-started/introduction`）、`/docs/:language/:version/**`、`/downloads`、`/releases`、`/releases/:version`、`/faq`、`/about`，以及兜底的 404。所有页面均为懒加载的 standalone 组件。

## 与 API 的连接

每个请求都经过类型化服务，基地址取自 `src/environments/` 的**相对** `/api`。任何组件或服务都不得硬编码 API 主机。

`npm start` 加载 `proxy.conf.json`，把 `/api` 与 `/relaxkonos` 一并转发到后端 HTTPS 开发端点（默认 `https://localhost:7252`，改动见 `RelaxKonServer/Properties/launchSettings.json`）。`/relaxkonos` 是下载产物的路径前缀（`/relaxkonos/<channel>/<version>/…`），不代理它下载链接就点不动。证书校验**仅在本地开发时**关闭。

生产环境由同一源站提供 Angular 构建产物与 API，`/api` 路径不变，区别只在反向代理配置。

## 主题

`ThemeService` 支持 `system` / `light` / `dark`，把选择保存在 LocalStorage 的 `rk-theme` 键，并在 system 模式下监听 `prefers-color-scheme`。`src/index.html` 中的内联脚本会在首次绘制前解析主题，避免闪烁。

所有颜色、间距、圆角与阴影都是定义在 `src/styles.scss` 的 CSS 自定义属性（`--rk-*`），亮暗两套通过 `document.documentElement` 上的 `data-theme` 切换。**新增主题**的做法是在新的选择器（例如 `:root[data-theme='relaxkon-dark']`）下覆盖这些令牌，并扩展 `ThemePreference` 与页头选项。组件中不允许硬编码颜色。

## UI 语言

运行时词条位于 `public/assets/i18n/{en-US,zh-CN,ja-JP}.json`，以嵌套对象书写，加载时被压平成点号键，模板里用 `t('home.hero.title')` 取值，支持 `{placeholder}` 插值。未手动选择时，UI 语言跟随浏览器/系统首选语言：中文为 `zh-CN`、日文为 `ja-JP`、其余语言一律为 `en-US`；浏览器触发 `languagechange` 时也会同步。用户在页头手动选择后，选择才保存到 LocalStorage 的 `rk-language` 键并优先使用。

三份词典的键必须完全对齐（当前各 390 条），缺键会直接显示键名。改完用 `npm run verify:i18n` 复核：前半段检查三语是否对齐，后半段确认模板与组件里引用的键都真的存在（缺键不会让构建失败，只会在页面上显示成键名）。**新增一种 UI 语言**需要：

1. 添加 `public/assets/i18n/<code>.json`；
2. 扩展 `core/i18n/i18n.service.ts` 中的 `SiteLanguage` 联合类型与 `SITE_LANGUAGES` 常量。

## 内容语言与文档回退

文档与 FAQ 的译文由 API 提供，使用官网当前语言。

`RelaxKonServer/Content/Docs/{en-US,zh-CN,ja-JP}` 当前各 49 篇（入门 12 + 概念 9 + 应用 28），三种语言已完全对齐，因此正常浏览不会触发回退。回退机制本身仍然存在：某个 slug 在目标语言缺失时会取 `en-US` 的版本，并把响应的 `isFallback` 置为 `true`，由界面提示读者。**改动内容文件数量时必须让三种语言保持一致**，否则导航会出现回退项。

官网和文档共用页头的语言设置。打开带语言的文档链接时，界面同步到该语言；切换语言会保留文档路径、版本和锚点。`<html lang>` 使用界面语言。缺少译文时，正文回退到英文，`<article lang>` 标明实际语言，并显示回退提示；回退页面不参与搜索索引。API 的 `DocumentResponse.language` 回显请求语言，因此用 `isFallback` 判断正文是否为英文。

## 内容与静态资源

文档、FAQ、发布说明与下载清单的正文都在 `RelaxKonServer/Content/`，本仓库不复制一份：`Docs/<lang>/<version>/…`、`Faq/*.json`、`Releases/`、`Downloads/downloads.json`。改内容的流程是先改后端内容树，再用本仓库的界面验证三语显示。

教程截图位于 `public/assets/docs/screenshots/{zh-CN,en-US,ja-JP}/`，清单写在同目录的 `manifest.json`（当前 20 个截图位 × 3 语言）。**目前 60 条记录全部是 `status: placeholder`**，换成真图的做法见[截图维护说明](./docs/documentation-screenshots.md)（中文）。教程图解 SVG 在 `public/assets/tutorials/<lang>/`。两者改完都跑 `npm run verify:doc-images`。

文案口径：官网区分「当前源码能力 / 实际验收 / 已发布包」，不把源码支持写成已发布。0.1.2 的发行记录由当时的下载目录清单补齐，不推断它包含之后的源码功能；Android 细节以产品工程的 `Client/RelaxKonOS.Client.Android/docs/` 为准，官网只留用户向摘要与链接。

## 升级依赖

Angular 要求 TypeScript `>=6.0 <6.1`。当前基线：Angular 22.2.1、TypeScript 6.0.3、RxJS 7.8.2、Vitest 5.0.3、jsdom 30.1.2。

1. `npm outdated` 看差距；
2. 改 `package.json` 后执行 `npm update`；
3. **锁文件与 `package.json` 一起提交**，否则 `npm ci` 会因两者不一致而失败；
4. 跑 `npm run build` 与 `npm test -- --watch=false`，确认预算与用例都没破。

## 代码约定

- **一个组件三个文件**：`x.component.ts` / `x.component.html` / `x.component.scss`，`@Component` 使用 `templateUrl` 与 `styleUrl`（单数）。不要内联 `template:` / `styles:`。
- **原生 `<select>` 一律用 `[ngModel]` + `[ngValue]`，不要用 `[value]`**：`[value]` 会在 `@for` 生成 `<option>` 之前写入并失败，而且因为表达式值没变而永远不会重试。
- **日期不要用 Angular 的 `DatePipe`**：它的 `LOCALE_ID` 固定，切语言后不会变。改用 `rkDate` 管道（`core/pipes/localized-date.pipe.ts`）并以当前语言作为参数；它内部按 `timeZone: 'UTC'` 格式化，日历日不会因时区偏移。
- **文档链接用 `docsUrl(language, slug)`**（`core/docs/docs-link.ts`）生成，不要手拼 `/docs/zh-CN/…`：文档路由是语言在前，写死语言会把中日读者送到英文页。
- **SEO 统一走 `SeoService.apply(...)`**，标题与描述用 `titleKey` / `descriptionKey` 走词典（`pageTitles.*` / `pageDescriptions.*`），只有正文由 API 提供的页面才传字面量 `description`。分享图、canonical 与 `og:*` 全部由它写入，不要在页面里散写；`document.title` 与 meta 标签也不要直接操作。
- **品牌标是图片不是字母**：页头/页脚使用 `<img class="brand__mark" src="brand-mark.png" …>`（源文件在 `public/`），不要再回退成「渐变方块 + 字母 R」的占位实现。

## 分享图与收录文件

`public/` 下的这几个文件是生成物或静态资产，**不要手改**：

- `og-image.png`（1200×630）：`og:image` 与 `twitter:image` 指向的分享卡片。源文件是 `tools/og-card.html`，用 `npm run assets:og-image` 重新渲染（本机 Chrome 或 Edge）。
- `sitemap.xml`：由 `npm run assets:sitemap` 从静态路由 + `RelaxKonServer/Content/Docs` 生成。内容不在默认相对位置时用 `RELAXKON_DOCS_ROOT` 指定。文档是唯一「一个语言一个 URL」的部分，所以 `hreflang` 只写在文档条目上。
- `robots.txt`：静态文件，指向 sitemap。

`src/index.html` 里另有一份静态默认值，供不执行 JavaScript 的抓取器（例如微信）使用。

## 项目边界

本项目是官网前端的唯一归属地。不要把官网 UI 加到 `RelaxKonServer`（那里只有 API）。工作区级的边界规则见 [`../WEBSITE_ARCHITECTURE.md`](../WEBSITE_ARCHITECTURE.md)。

## 提交前校验

```bash
npm run verify:i18n          # 词典三语对齐 + 引用键存在
npm run verify:doc-images    # 截图清单与三语引用
npm test -- --watch=false    # 单元测试
npm run build                # 生产构建（含 sitemap 重建）
```
