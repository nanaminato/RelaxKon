# RelaxKon 官网前端

[English](./README.en.md) · [日本語](./README.ja.md)

`RelaxKon/` 是 RelaxKon 官方网站的 **Angular 22** 客户端，负责全部浏览器侧 UI：布局、路由、页面、主题切换、运行时 UI 语言切换以及类型化 API 客户端。

站点刻意**不做成后台面板**：它是 RelaxKonOS 的产品官网，视觉语言以设计令牌的形式集中定义在 `src/styles.scss`。

## 环境要求

- **Node.js ≥ 22.22.3、≥ 24.15.0 或 ≥ 26**（Angular 22 CLI 会强制校验该下限；22.22.x 必须 ≥ 22.22.3）以及 npm 11+
- 一个正在运行的 `RelaxKonServer` 实例，用于提供文档、发布说明、下载与 FAQ 内容

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm start` | 开发服务器 <http://localhost:4200>，并按 `proxy.conf.json` 代理 `/api` |
| `npm run build` | 生产构建，输出到 `dist/RelaxKon` |
| `npm run watch` | 以开发配置监听构建 |
| `npm test` | 单元测试（Vitest，`@angular/build:unit-test`） |

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
│   │   ├── seo/          # seo.service.ts（标题/描述/canonical）
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
├── index.html            # 主题与语言的预解析脚本、favicon 引用
├── main.ts
└── styles.scss           # 全部 --rk-* 设计令牌，含亮/暗两套取值
public/                   # favicon 全套、brand-mark.png、site.webmanifest、assets/i18n/*.json
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

三份词典的键必须完全对齐（当前各 321 条），缺键会直接显示键名。**新增一种 UI 语言**需要：

1. 添加 `public/assets/i18n/<code>.json`；
2. 扩展 `core/i18n/i18n.service.ts` 中的 `SiteLanguage` 联合类型与 `SITE_LANGUAGES` 常量。

## 内容语言与文档回退

文档与 FAQ 使用的是**内容语言**，由 API 提供，与 UI 语言相互独立。

`RelaxKonServer/Content/Docs/{en-US,zh-CN,ja-JP}` 当前各 26 篇，三种语言已完全对齐，因此正常浏览不会触发回退。回退机制本身仍然存在：某个 slug 在目标语言缺失时会取 `en-US` 的版本，并把响应的 `isFallback` 置为 `true`，由界面提示读者。**改动内容语言的文件数时必须让三种语言保持一致**，否则导航会出现回退项。

## 代码约定

- **一个组件三个文件**：`x.component.ts` / `x.component.html` / `x.component.scss`，`@Component` 使用 `templateUrl` 与 `styleUrl`（单数）。不要内联 `template:` / `styles:`。
- **原生 `<select>` 一律用 `[ngModel]` + `[ngValue]`，不要用 `[value]`**：`[value]` 会在 `@for` 生成 `<option>` 之前写入并失败，而且因为表达式值没变而永远不会重试。
- **日期不要用 Angular 的 `DatePipe`**：它的 `LOCALE_ID` 固定，切语言后不会变。改用 `rkDate` 管道（`core/pipes/localized-date.pipe.ts`）并以当前语言作为参数；它内部按 `timeZone: 'UTC'` 格式化，日历日不会因时区偏移。
- **SEO 统一走 `SeoService.apply({ title, description, path })`**，不要直接操作 `document.title` 或 meta 标签。
- **品牌标是图片不是字母**：页头/页脚使用 `<img class="brand__mark" src="brand-mark.png" …>`（源文件在 `public/`），不要再回退成「渐变方块 + 字母 R」的占位实现。

## 项目边界

本项目是官网前端的唯一归属地。不要把官网 UI 加到 `RelaxKonServer`（那里只有 API）。工作区级的边界规则见 [`../WEBSITE_ARCHITECTURE.md`](../WEBSITE_ARCHITECTURE.md)。
