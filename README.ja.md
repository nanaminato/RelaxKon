# RelaxKon 公式サイト フロントエンド

[中文](./README.md) · [English](./README.en.md)

ウェブサイト <https://relaxkon.com> · 製品ソースリポジトリ <https://github.com/nanaminato/RelaxKonOS>

`RelaxKon/` は RelaxKon 公式サイトの **Angular 22.2.1** クライアントです。ブラウザー側で動くものはすべてここにあります。レイアウト、ルーティング、ページ、テーマ切り替え、実行時の UI 言語切り替え、型付き API クライアントが含まれます。ドキュメント、リリースノート、ダウンロード一覧、FAQ の本文は `RelaxKonServer` が提供し、このリポジトリは描画だけを担当します。

色、余白、角丸、影などのデザイントークンは `src/styles.scss` にまとめています。

## 必要な環境

- **Node.js ≥ 22.22.3、≥ 24.15.0 または ≥ 26**（Angular 22 の CLI がこの下限を強制します。22.22.x 系は 22.22.3 以上が必要）と npm ≥ 11.19.1（`packageManager` は 11.19.1 固定）
- ドキュメント、リリースノート、ダウンロード、FAQ のコンテンツを提供する `RelaxKonServer` の起動インスタンス。バックエンドが無くてもページは開きますが、ドキュメント本文は警告表示に変わります

サイトは純粋な CSR で、SSR もプリレンダリングもありません。初回 HTML に本文は含まれないため、収録は `sitemap.xml` と実行時に書き込まれる meta に依存します。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm ci` | ロックファイルどおりに依存関係をインストール |
| `npm start` | 開発サーバー <http://localhost:4200>。`proxy.conf.json` で `/api` と `/relaxkonos` をプロキシ |
| `npm run build` | 本番ビルド。`dist/RelaxKon/browser` に出力し、`prebuild` が先に `sitemap.xml` を再生成 |
| `npm run watch` | 開発構成のウォッチビルド |
| `npm test` | 単体テスト（Vitest、`@angular/build:unit-test`）。既定は監視モード、1 回だけなら `-- --watch=false` |
| `npm run verify:i18n` | 3 言語辞書の整合と参照キーの検証（2 つの verify-i18n スクリプトを順に実行） |
| `npm run verify:doc-images` | チュートリアル画像の一覧と 3 言語の参照検証 |
| `npm run assets:sitemap` | `public/sitemap.xml` の再生成 |
| `npm run assets:og-image` | `public/og-image.png` の再レンダリング（ローカルの Chrome か Edge が必要。`CHROME_PATH` で指定可） |

> `ng serve` が `proxy.conf.json` を読むのは起動時の一度だけです。**プロキシ設定を変更したら `npm start` を再起動してください。** ホットリロードでは再読み込みされず、再起動するまで `/api/*` は 502 を返します。

> `npm run build` は最初に `prebuild`（`tools/generate-sitemap.mjs`）を実行するため、ビルド成果物の sitemap は常に最新です。`RelaxKonServer` のコンテンツディレクトリが見つからない場合は静的ルートのみを出力し、失敗にはしません。

本番ビルドの予算は initial が 500 kB 警告／1 MB エラー、単一コンポーネントのスタイルが 8 kB 警告／16 kB エラーです。

開発手順の全体は[開発チュートリアル](https://relaxkon.com/docs/ja-JP/latest/getting-started/development)を参照してください。

## ディレクトリ構成

```text
src/
├── app/
│   ├── app.ts / app.html / app.config.ts / app.routes.ts   # ルートコンポーネント、起動設定、ルート定義
│   ├── core/
│   │   ├── api/          # documentation-api.service.ts、content-api.service.ts
│   │   ├── config/       # api-base-url.token.ts（API_BASE_URL 注入トークン）
│   │   ├── docs/         # docs-link.ts（docsUrl() が言語付きドキュメントリンクを生成）
│   │   ├── i18n/         # i18n.service.ts（実行時の UI 言語）
│   │   ├── models/       # content.models.ts（API レスポンスモデル一式）
│   │   ├── pipes/        # localized-date.pipe.ts（rkDate）
│   │   ├── seo/          # seo.service.ts（title、description、canonical、共有カード、og:*）
│   │   ├── services/     # markdown.service.ts（Markdown レンダリング）
│   │   └── theme/        # theme.service.ts（system / light / dark）
│   ├── layout/
│   │   ├── header/       # 製品ドロップダウン、検索入口、テーマと言語のコントロール
│   │   ├── footer/
│   │   └── search/       # search-overlay.component.*（ドキュメント検索オーバーレイ）
│   ├── shared/           # ページ横断の共通コンポーネント（github-link）
│   └── features/
│       ├── home/         # トップページ
│       ├── products/     # 製品一覧
│       ├── relaxkonos/   # RelaxKonOS 製品ページ
│       ├── docs/         # ドキュメントシェル：サイドバー、本文、目次
│       ├── downloads/
│       ├── releases/     # releases.component.* 一覧 + release-detail.component.* 詳細
│       ├── faq/
│       ├── about/
│       └── not-found/
├── environments/         # environment.ts（本番）/ environment.development.ts
├── index.html            # テーマと言語の事前解決スクリプト（辞書の preload を含む）、favicon と og の既定値
├── main.ts
└── styles.scss           # `--rk-*` 設計トークン一式（ライト／ダーク両方の値）
public/
├── assets/i18n/                  # 3 言語辞書（en-US / zh-CN / ja-JP）
├── assets/docs/screenshots/      # チュートリアル画像。言語ごとのディレクトリ + manifest.json
├── assets/tutorials/             # チュートリアル図解 SVG。言語ごとのディレクトリ
├── brand-mark.png                # ヘッダーとフッターで使うブランドマーク
├── og-image.png                  # 共有カード（生成物）
├── robots.txt
├── sitemap.xml                   # 生成物
└── site.webmanifest
tools/
├── verify-i18n-keys.mjs / verify-i18n-usage.mjs   # 辞書の整合、参照キーの検証
├── verify-doc-screenshots.mjs                     # 画像一覧と 3 言語の整合検証
├── generate-sitemap.mjs / generate-og-image.mjs   # sitemap と共有カードの生成
├── og-card.html                                   # 共有カードの原本
└── generate-brand-assets.py                       # ブランドアイコンと共有画像の生成
```

ルート定義（`app.routes.ts`）：`/`、`/products`、`/products/relaxkonos`、`/docs`（現在の UI 言語の `getting-started/introduction` へリダイレクト）、`/docs/:language/:version/**`、`/downloads`、`/releases`、`/releases/:version`、`/faq`、`/about`、および 404 のフォールバック。すべてのページは遅延読み込みの standalone コンポーネントです。

## API との接続

すべてのリクエストは型付きサービスを通り、`src/environments/` にある**相対**パス `/api` をベース URL として使います。コンポーネントやサービスが API ホストをハードコードしてはいけません。

`npm start` は `proxy.conf.json` を読み込み、`/api` と `/relaxkonos` の両方をバックエンドの HTTPS 開発エンドポイント（既定は `https://localhost:7252`。変更された場合は `RelaxKonServer/Properties/launchSettings.json` を確認）へ転送します。`/relaxkonos` はダウンロード成果物のパス接頭辞（`/relaxkonos/<channel>/<version>/…`）で、これをプロキシしないとダウンロードリンクが機能しません。証明書の検証を無効化するのは**ローカル開発時に限ります**。

本番環境では Angular のビルド成果物と API を同一オリジンから配信するため、`/api` のパスは変わらず、違いはリバースプロキシの設定だけです。

## テーマ

`ThemeService` は `system` / `light` / `dark` を扱い、選択を LocalStorage の `rk-theme` キーに保存し、system モードでは `prefers-color-scheme` を監視します。`src/index.html` のインラインスクリプトが初回描画前にテーマを解決するため、ちらつきは発生しません。

色、余白、角丸、影はすべて `src/styles.scss` に定義された CSS カスタムプロパティ（`--rk-*`）で、ライト／ダークの 2 組を `document.documentElement` の `data-theme` で切り替えます。**テーマを追加する**場合は、`:root[data-theme='relaxkon-dark']` のような新しいセレクターでトークンを上書きし、`ThemePreference` とヘッダーの選択肢を拡張します。コンポーネントで色をハードコードしてはいけません。

## UI 言語

実行時の文言は `public/assets/i18n/{en-US,zh-CN,ja-JP}.json` にネストしたオブジェクトとして置かれ、読み込み時にドット区切りのキーへ平坦化されるため、テンプレートでは `t('home.hero.title')` で参照します（`{placeholder}` の補間に対応）。手動選択前は UI がブラウザー／システムの優先言語に従い、中国語は `zh-CN`、日本語は `ja-JP`、それ以外はすべて `en-US` になります。ブラウザーの `languagechange` にも追従します。ヘッダーで手動選択した場合だけ LocalStorage の `rk-language` キーへ保存され、以後はこちらが優先されます。

3 つの辞書はキーが完全に一致している必要があります（現在は各 390 件）。欠けたキーはキー名がそのまま表示されます。変更後は `npm run verify:i18n` で再確認してください。前半が 3 言語の整合、後半がテンプレートやコンポーネントが参照するキーの実在確認です。欠けたキーはビルドを失敗させず、ページ上にキー名として現れるだけです。**UI 言語を追加する**には：

1. `public/assets/i18n/<code>.json` を追加する
2. `core/i18n/i18n.service.ts` の `SiteLanguage` ユニオン型と `SITE_LANGUAGES` を拡張する

## コンテンツ言語とドキュメントのフォールバック

ドキュメントと FAQ の翻訳は API が提供し、公式サイトの現在の言語を使用します。

`RelaxKonServer/Content/Docs/{en-US,zh-CN,ja-JP}` は現在どの言語も 49 件（はじめに 12 + 概念 9 + アプリケーション 28）で、3 言語が揃っているため通常の閲覧でフォールバックは発生しません。ただしフォールバックの仕組み自体は残っています。要求された言語に slug が無い場合は `en-US` の版が返り、レスポンスの `isFallback` が `true` になるので UI 側でその旨を伝えられます。**コンテンツファイルを増減するときは 3 言語の件数を揃えてください。** 揃っていないとナビゲーションにフォールバック項目が現れます。

公式サイトとドキュメントは、ヘッダーの言語設定を共有します。言語付きのドキュメント URL を開くと、画面もその言語に切り替わります。言語を変更しても文書のパス、バージョン、アンカーを保持します。`<html lang>` は画面の言語に従います。翻訳がない場合は英語の本文を表示し、案内と `<article lang>` で実際の言語を示します。フォールバックページは検索インデックスから除外します。API の `DocumentResponse.language` は要求した言語を返すため、英語へのフォールバックは `isFallback` で判断します。

## コンテンツと静的アセット

ドキュメント、FAQ、リリースノート、ダウンロード一覧の本文はすべて `RelaxKonServer/Content/` にあり、このリポジトリには複製しません（`Docs/<lang>/<version>/…`、`Faq/*.json`、`Releases/`、`Downloads/downloads.json`）。まずバックエンドのコンテンツを変更し、この UI で 3 言語の表示を確認します。

チュートリアル画像は `public/assets/docs/screenshots/{zh-CN,en-US,ja-JP}/` に、一覧は同じ階層の `manifest.json` にあります（現在 20 か所 × 3 言語）。**60 件すべてがまだ `status: placeholder`** です。実画像への差し替えは[画像メンテナンス手順](./docs/documentation-screenshots.md)（中国語）を参照してください。チュートリアル図解 SVG は `public/assets/tutorials/<lang>/` にあります。どちらも変更後に `npm run verify:doc-images` を実行します。

記述の方針として、サイトは「現在のソースの能力 / 実際の検証 / 公開済みパッケージ」を区別し、ソース上の対応を公開済み機能として書きません。0.1.2 のリリース記録は当時のダウンロード一覧から作成したもので、それ以降のソース機能を含むとは主張しません。Android の詳細は製品側の `Client/RelaxKonOS.Client.Android/docs/` が正本で、サイトには利用者向け要約とリンクだけを置きます。

## 依存関係の更新

Angular は TypeScript `>=6.0 <6.1` を要求します。現在のベースラインは Angular 22.2.1、TypeScript 6.0.3、RxJS 7.8.2、Vitest 5.0.3、jsdom 30.1.2 です。

1. `npm outdated` で差分を確認する
2. `package.json` を編集してから `npm update` を実行する
3. **`package.json` とロックファイルを一緒にコミットする**（不一致だと `npm ci` が失敗します）
4. `npm run build` と `npm test -- --watch=false` を実行し、予算とテストに影響がないことを確認する

## コーディング規約

- **1 コンポーネント = 3 ファイル**：`x.component.ts` / `x.component.html` / `x.component.scss`。`@Component` では `templateUrl` と `styleUrl`（単数）を使います。`template:` / `styles:` のインライン記述は禁止です。
- **ネイティブの `<select>` は必ず `[ngModel]` + `[ngValue]` を使い、`[value]` は使わない**：`[value]` は `@for` が `<option>` を生成する前に書き込まれて失敗し、バインディング式の値が変わらないため再試行もされません。
- **Angular の `DatePipe` は使わない**：`LOCALE_ID` が固定でサイト言語に追従しません。`rkDate` パイプ（`core/pipes/localized-date.pipe.ts`）に現在の言語を渡して使います。内部で `timeZone: 'UTC'` として整形するため、暦日がタイムゾーンでずれません。
- **ドキュメントリンクは `docsUrl(language, slug)`**（`core/docs/docs-link.ts`）で生成し、`/docs/zh-CN/…` のような手組みをしない：ドキュメントのルートは言語が先頭なので、言語を固定すると中国語・日本語の読者を英語ページへ送ってしまいます。
- **SEO は必ず `SeoService.apply(...)` を通す**：タイトルと説明は `titleKey` / `descriptionKey`（`pageTitles.*` / `pageDescriptions.*`）で辞書から解決し、リテラルの `description` は本文を API から受け取るページだけが渡します。共有画像・canonical・`og:*` もすべてそこで書き込むため、ページ側に散らばせないでください。`document.title` や meta タグの直接操作も禁止です。
- **ブランドマークは画像であり、文字ではありません**：ヘッダーとフッターは `<img class="brand__mark" src="brand-mark.png" …>`（ソースは `public/`）を使います。「グラデーションの角丸ブロック + 白い R」というプレースホルダー実装へ戻さないでください。

## 共有画像とクローラー向けファイル

`public/` の次のファイルは共有・クロール用の生成物または静的アセットです。**手で編集しないでください。**

- `og-image.png`（1200×630）：`og:image` と `twitter:image` が指す共有カード。原本は `tools/og-card.html` で、`npm run assets:og-image` で再生成します（ローカルの Chrome か Edge）。
- `sitemap.xml`：`npm run assets:sitemap` が静的ルートと `RelaxKonServer/Content/Docs` から生成します。コンテンツが既定の相対位置にない場合は `RELAXKON_DOCS_ROOT` を指定してください。言語ごとに URL が変わるのはドキュメントだけなので、`hreflang` はドキュメントのエントリにのみ付けます。
- `robots.txt`：静的ファイルで、sitemap を指します。

`src/index.html` には、JavaScript を実行しないクローラー向けの静的な既定値も置いてあります。

## プロジェクト境界

このプロジェクトは公式サイトのフロントエンドを置く唯一の場所です。`RelaxKonServer` にサイト UI を追加しないでください（あちらは API 専用です）。ワークスペース全体の境界ルールは [`../WEBSITE_ARCHITECTURE.ja.md`](../WEBSITE_ARCHITECTURE.ja.md) を参照してください。

## コミット前のチェック

```bash
npm run verify:i18n          # 3 言語辞書の整合 + 参照キーの実在
npm run verify:doc-images    # 画像一覧と 3 言語の整合
npm test -- --watch=false    # 単体テスト
npm run build                # 本番ビルド（sitemap も再生成）
```
