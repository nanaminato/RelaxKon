# 官网前端优化追踪

2026-10-05 对 `RelaxKon/`（Angular 22 + SCSS）做了一次只读体检。基线本身健康：三个校验脚本通过，
生产构建 initial **358.09 kB raw / 95.76 kB transfer**（500 kB 预算内），代码统一使用新控制流、无 `any`、
无内联模板/样式、`<img>` 全部带 `alt`、模板里没有硬编码 URL。

下表是体检发现的可优化点与处理状态。

| # | 问题 | 影响 | 落点 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | 全站没有任何 `og:image` / `twitter:image` / `og:url` / `og:locale` | 社交平台分享一律是纯文字卡片 | `core/seo/seo.service.ts`, `src/index.html`, `public/og-image.png` | 已修 |
| 2 | 没有 `robots.txt`，没有 `sitemap.xml` | 纯 CSR 站点首页 HTML 无正文，爬虫缺少发现路径 | `public/robots.txt`, `tools/generate-sitemap.mjs` | 已修 |
| 3 | 各页 meta description 是组件里的英文字面量 | 三语站点的搜索摘要恒为英文 | 三份 `public/assets/i18n/*.json` + 各 feature 组件 | 已修 |
| 4 | 文档页每次 `NavigationEnd` 都重发 versions + navigation + document | 文档内换文章多发 2 个无用请求；旧响应会覆盖新状态 | `features/docs/docs.component.ts` | 已修 |
| 5 | i18n 词典在 app initializer 里 await 且 `cache: 'no-cache'` | 首屏必须等一轮串行往返才出内容 | `src/index.html`（preload） | 已修 |
| 6 | `setTimeout` 等渲染后绑事件；搜索空结果时高亮索引为 -1 | 复制按钮可能静默漏绑；键盘上下键落到负索引 | `features/docs/docs.component.ts`, `layout/search/search-overlay.component.ts` | 已修 |
| 7 | 三份 README 的计数与实际不符：词典写 367（实测 368）、文档写 42 篇（实测 49） | 文档漂移，后续按 README 加键/加文章会算错 | `README*.md` | 已修 |

## 逐项说明

### 1. 分享卡片与本地化 meta

`SeoService` 原先只设置 title、description、canonical、`og:title`、`og:description`、`og:type`、
`og:site_name`、`twitter:card`。现在补齐 `og:image`（含 `width`/`height`/`alt`）、`twitter:image`、
`og:url`、`og:locale` 与两条 `og:locale:alternate`。

- 分享图 `public/og-image.png`（1200×630）由 `tools/og-card.html` 设计，用
  `node tools/generate-og-image.mjs` 经 Chrome headless 渲染生成，改设计改 HTML 后重跑即可，不要手改 PNG。
- `og:locale:alternate` 有两条且内容不同，`Meta.updateTag` 会重复命中同一个节点，所以这两条由
  `SeoService` 直接管理 DOM（先删后建）。
- `src/index.html` 同时写了一份静态默认值，供不执行 JS 的抓取器（微信等）使用。

### 2. 收录

- `public/robots.txt` 允许全站抓取并指向 sitemap。
- `tools/generate-sitemap.mjs` 生成 `public/sitemap.xml`：静态路由 + 三语文档页。
  文档 slug 从 RelaxKonServer 的 `Content/Docs/<lang>/<version>/**.md` 枚举，默认相对路径
  `../RelaxKonServer/RelaxKonServer/Content/Docs`，可用 `RELAXKON_DOCS_ROOT` 覆盖；
  目录不存在时只输出静态路由并给出提示，不会失败。
- 文档页是唯一「一个语言一个 URL」的页面，因此 **hreflang alternate 只写在文档条目上**；
  其余页面的 URL 与 UI 语言无关，写 hreflang 是错的。

### 3. 三语 description

新增 `pageDescriptions.*`（home / about / products / relaxkonos / downloads / releases / faq / notFound），
`PageMeta` 支持 `descriptionKey`，`SeoService` 在 effect 里解析，因此切换语言时 description 会一起更新。
en-US 的值逐字等于原字面量，零渲染变化；zh-CN 与 ja-JP 为新译。

### 4. 文档页请求

`versions` 按 language、`navigation` 按 `language/version` 记忆化；`load()` 引入请求代次
（`requestGeneration`），过期响应直接丢弃。文档内换文章时只剩 1 个请求。

### 5. 词典预载

`src/index.html` 的内联脚本已经解析出语言，顺手插入
`<link rel="preload" as="fetch" crossorigin href="assets/i18n/<lang>.json">`，让词典与 JS bundle 并行下载。
保留 `cache: 'no-cache'`：词典文件名没有内容哈希，改用长缓存会在发布后读到旧文案，而带 ETag 的
协商缓存本来就只有一次 304（不含正文）。同源 `as=fetch` 的 preload 与默认 fetch 都是
`same-origin` 凭据模式，不会重复下载。

### 6. 渲染时序与键盘索引

- 文档操作绑定改用 `afterNextRender`（原 `setTimeout` 在渲染慢于定时器时会静默漏绑），
  同时用 `viewChild` 取文章节点，不再全局 `document.querySelector`。
- 搜索浮层在无结果时直接跳过上下键，不再把 `active` 算成 `-1`。

### 7. README

三份 README 的计数按实际值更新：词典键数改为 376（本次新增 8 条 `pageDescriptions.*` 之后由脚本确认），
文档篇数改为 49 篇（入门 12 + 概念 9 + 应用 28）——后者原本写 42 篇（入门 6 + 概念 9 + 应用 27），
与 `Content/Docs/<lang>/latest/**` 的实际文件数不符。同时补上了 `og-image.png` / `sitemap.xml` /
`robots.txt` 的说明与三个新 npm 脚本。

## 验收方式

```bash
cd RelaxKon
NODE="/c/Program Files/nodejs/node.exe"

"$NODE" tools/verify-i18n-keys.mjs      # 三语对齐 + 输出真实键数
"$NODE" tools/verify-i18n-usage.mjs     # 模板/组件引用的键都存在
"$NODE" tools/verify-doc-screenshots.mjs
"$NODE" tools/generate-sitemap.mjs      # 重新生成 public/sitemap.xml
"$NODE" ./node_modules/@angular/cli/bin/ng.js build --configuration production
```

构建必须用系统 Node（项目要求 ≥ 22.22.3，托管 Node 是 22.22.2）。

## 验证结果

| 项目 | 结果 |
| --- | --- |
| `verify-i18n-keys.mjs` | 三语各 376 键，对齐 |
| `verify-i18n-usage.mjs` | 279 个静态引用键全部存在 |
| `verify-doc-screenshots.mjs` | 60 条目 × 3 语言对齐 |
| 生产构建 | initial 358.13 kB raw / 95.74 kB transfer，无预算告警 |
| `robots.txt` / `sitemap.xml` / `og-image.png` | 构建产物中均存在且 HTTP 200；sitemap 共 154 条 URL（7 静态 + 147 文档），浏览器解析无错误 |
| 运行时 head（`/faq`，`--lang=ja-JP`） | description 与 og:title 为日文，`og:locale=ja_JP`，alternate 为 `en_US` + `zh_CN`，`og:url` 指向 `/faq`，`og:image` 指向 1200×630 卡片 |
| 运行时 head（`/about`，`--lang=zh-CN`） | description 为中文，`og:locale=zh_CN`，canonical 指向 `/about` |
| 词典 preload | 首屏已注入 `<link rel="preload" as="fetch" crossorigin href="assets/i18n/ja-JP.json">` |
| 文档页错误分支 | 内容 API 未启动时走 `notice--warning`，不崩溃；`setContentLanguage` 按路由写入 `<html lang>` |

`afterNextRender` 事件绑定与「过期响应丢弃」未做端到端验证：本机没有运行内容 API，复制按钮与滚动
高亮只在真实文章渲染后才生效。需要在 API 可用时手工确认一次。

## 尚未处理（超出本次范围）

- 非文档页面的 URL 不随语言变化，无法给出 hreflang；如需多语言收录，需要引入语言路径前缀（例如 `/zh-CN/about`）。
- 站点为纯 CSR，首屏 HTML 无正文。若要让爬虫拿到完整内容，需要开启预渲染（`@angular/build` 的
  `prerender` 选项）或 SSR。
- `SeoService.apply()` 会先直接调用一次 `update()`，`effect` 里再调用一次，同一批 meta 被设置两次（幂等但多余）。
