# RelaxKon 公式サイト フロントエンド

[中文](./README.md) · [English](./README.en.md)

ウェブサイト <https://relaxkon.com> · 製品ソースリポジトリ <https://github.com/nanaminato/RelaxKonOS>

`RelaxKon/` は RelaxKon 公式サイトの **Angular 22.2.1** クライアントです。レイアウト、ルーティング、ページ、テーマ切り替え、実行時の UI 言語切り替え、型付き API クライアントなど、ブラウザー側の UI をすべて所有します。

このサイトは意図的に**管理画面ではありません**。RelaxKonOS の製品サイトであり、視覚言語は `src/styles.scss` に設計トークンとして集約されています。

## 必要な環境

- **Node.js ≥ 22.22.3、≥ 24.15.0 または ≥ 26**（Angular 22 の CLI がこの下限を強制します。22.22.x 系は 22.22.3 以上が必要）と npm 11.19.1
- ドキュメント、リリースノート、ダウンロード、FAQ のコンテンツを提供する `RelaxKonServer` の起動インスタンス

## コマンド

教程画像は `public/assets/docs/screenshots/` に置き、`npm run verify:doc-images` で一覧と三言語の一致を検査します。[撮影・置き換え手順](./docs/documentation-screenshots.md)も参照してください。本文はバックエンドが提供するため、画像付き文書の更新時はフロントエンドの静的成果物も同時に配置します。

依存バージョンは Angular 22.2.1、TypeScript 6.0.3、RxJS 7.8.2、Vitest 5.0.3、jsdom 30.1.2 です。Angular は TypeScript `>=6.0 <6.1` を要求します。新規チェックアウトは `npm ci`、更新時は `npm outdated`、`package.json` の編集、`npm update` の順で実行し、ロックファイルも更新します。`npm run build` と `npm test -- --watch=false` で確認してください。[公式サイトの開発チュートリアル](https://relaxkon.com/docs/ja-JP/latest/getting-started/development)も参照できます。

| コマンド | 内容 |
| --- | --- |
| `npm ci` | 依存関係のインストール |
| `npm start` | 開発サーバー <http://localhost:4200>。`proxy.conf.json` による `/api` プロキシを有効化 |
| `npm run build` | 本番ビルド。`dist/RelaxKon` に出力 |
| `npm run watch` | 開発構成のウォッチビルド |
| `npm test` | 単体テスト（Vitest、`@angular/build:unit-test`） |
| `npm run verify:i18n` | 3 言語辞書の整合と参照キーの検証 |
| `npm run verify:doc-images` | ドキュメント用スクリーンショットの一覧と 3 言語の参照検証 |
| `npm run assets:sitemap` | `public/sitemap.xml` の再生成 |
| `npm run assets:og-image` | `public/og-image.png` の再レンダリング（ローカルの Chrome か Edge が必要） |

> `ng serve` が `proxy.conf.json` を読むのは起動時の一度だけです。**プロキシ設定を変更したら `npm start` を再起動してください。** ホットリロードでは再読み込みされず、再起動するまで `/api/*` は 502 を返します。

## ディレクトリ構成

```text
src/
├── app/
│   ├── app.ts / app.html / app.config.ts / app.routes.ts   # ルートコンポーネント、起動設定、ルート定義
│   ├── core/
│   │   ├── api/          # documentation-api.service.ts、content-api.service.ts
│   │   ├── config/       # api-base-url.token.ts（API_BASE_URL 注入トークン）
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
public/                   # favicon 一式、brand-mark.png、og-image.png、robots.txt、sitemap.xml、site.webmanifest、assets/i18n/*.json
tools/                    # i18n とスクリーンショットの検証、sitemap 生成、共有カードの原本とレンダリングスクリプト
```

ルート定義（`app.routes.ts`）：`/`、`/products`、`/products/relaxkonos`、`/docs`（現在の UI 言語の `getting-started/introduction` へリダイレクト）、`/docs/:language/:version/**`、`/downloads`、`/releases`、`/releases/:version`、`/faq`、`/about`、および 404 のフォールバック。すべてのページは遅延読み込みの standalone コンポーネントです。

## API との接続

すべてのリクエストは型付きサービスを通り、`src/environments/` にある**相対**パス `/api` をベース URL として使います。コンポーネントやサービスが API ホストをハードコードしてはいけません。

`npm start` は `proxy.conf.json` を読み込み、`/api` をバックエンドの HTTPS 開発エンドポイント（既定は `https://localhost:7252`。変更された場合は `RelaxKonServer/Properties/launchSettings.json` を確認）へ転送します。証明書の検証を無効化するのは**ローカル開発時に限ります**。

本番環境では Angular のビルド成果物と API を同一オリジンから配信するため、`/api` のパスは変わらず、違いはリバースプロキシの設定だけです。

## テーマ

`ThemeService` は `system` / `light` / `dark` を扱い、選択を LocalStorage の `rk-theme` キーに保存し、system モードでは `prefers-color-scheme` を監視します。`src/index.html` のインラインスクリプトが初回描画前にテーマを解決するため、ちらつきは発生しません。

色、余白、角丸、影はすべて `src/styles.scss` に定義された CSS カスタムプロパティ（`--rk-*`）で、ライト／ダークの 2 組を `document.documentElement` の `data-theme` で切り替えます。**テーマを追加する**場合は、`:root[data-theme='relaxkon-dark']` のような新しいセレクターでトークンを上書きし、`ThemePreference` とヘッダーの選択肢を拡張します。コンポーネントで色をハードコードしてはいけません。

## UI 言語

実行時の文言は `public/assets/i18n/{en-US,zh-CN,ja-JP}.json` にネストしたオブジェクトとして置かれ、読み込み時にドット区切りのキーへ平坦化されるため、テンプレートでは `t('home.hero.title')` で参照します（`{placeholder}` の補間に対応）。手動選択前は UI がブラウザー／システムの優先言語に従い、中国語は `zh-CN`、日本語は `ja-JP`、それ以外はすべて `en-US` になります。ブラウザーの `languagechange` にも追従します。ヘッダーで手動選択した場合だけ LocalStorage の `rk-language` キーへ保存され、以後はこちらが優先されます。

3 つの辞書はキーが完全に一致している必要があります（現在は各 376 件）。欠けたキーはキー名がそのまま表示されます。変更後は `node tools/verify-i18n-keys.mjs` で再確認し、さらに `node tools/verify-i18n-usage.mjs` でテンプレートが参照しているキーが実在するかを確認してください（欠けたキーはビルドを失敗させず、ページ上にキー名として現れるだけです）。**UI 言語を追加する**には：

1. `public/assets/i18n/<code>.json` を追加する
2. `core/i18n/i18n.service.ts` の `SiteLanguage` ユニオン型と `SITE_LANGUAGES` を拡張する

## コンテンツ言語とドキュメントのフォールバック

ドキュメントと FAQ は API が提供する**コンテンツ言語**を使い、UI 言語とは独立しています。

`RelaxKonServer/Content/Docs/{en-US,zh-CN,ja-JP}` は現在どの言語も 49 件（はじめに 12 + 概念 9 + アプリケーション 28）で、3 言語が完全に揃っているため通常の閲覧でフォールバックは発生しません。ただしフォールバックの仕組み自体は残っています。要求された言語に slug が無い場合は `en-US` の版が返り、レスポンスの `isFallback` が `true` になるので UI 側でその旨を伝えられます。**コンテンツファイルを増減するときは 3 言語の件数を揃えてください。** 揃っていないとナビゲーションにフォールバック項目が現れます。

そのため本文の言語と UI 言語は異なることがあります。`<html lang>` は `I18nService` の `htmlLanguage`（`contentLanguage ?? language`）が決め、ドキュメントページは `i18n.setContentLanguage(...)` で本文が**実際に**使っている言語（フォールバック時はルートで要求した言語ではなく提供された言語）を指し、`/docs` を離れるときにクリアして UI 言語へ戻します。`<article>` 要素にも個別に `lang` を付けています。これは周囲の外殻（ナビゲーション、サイドバー）が UI 言語のままであるためです。スクリーンリーダーが本文を正しい言語で読むための仕組みなので、**ドキュメントページを変更するときはこの 2 つの書き込み点を迂回しないでください**。なお API の `DocumentResponse.language` は要求した言語をそのまま返すため、実際の言語は `isFallback` で判定します。

## コーディング規約

- **1 コンポーネント = 3 ファイル**：`x.component.ts` / `x.component.html` / `x.component.scss`。`@Component` では `templateUrl` と `styleUrl`（単数）を使います。`template:` / `styles:` のインライン記述は禁止です。
- **ネイティブの `<select>` は必ず `[ngModel]` + `[ngValue]` を使い、`[value]` は使わない**：`[value]` は `@for` が `<option>` を生成する前に書き込まれて失敗し、バインディング式の値が変わらないため再試行もされません。
- **Angular の `DatePipe` は使わない**：`LOCALE_ID` が固定でサイト言語に追従しません。`rkDate` パイプ（`core/pipes/localized-date.pipe.ts`）に現在の言語を渡して使います。内部で `timeZone: 'UTC'` として整形するため、暦日がタイムゾーンでずれません。
- **SEO は必ず `SeoService.apply(...)` を通す**：タイトルと説明は `titleKey` / `descriptionKey`（`pageTitles.*` / `pageDescriptions.*`）で辞書から解決し、リテラルの `description` は本文を API から受け取るページだけが渡します。共有画像・canonical・`og:*` もすべてそこで書き込むため、ページ側に散らばせないでください。`document.title` や meta タグの直接操作も禁止です。
- **ブランドマークは画像であり、文字ではありません**：ヘッダーとフッターは `<img class="brand__mark" src="brand-mark.png" …>`（ソースは `public/`）を使います。「グラデーションの角丸ブロック + 白い R」というプレースホルダー実装へ戻さないでください。

## 共有画像とクローラー向けファイル

`public/` の次の 3 ファイルは共有・クロール用の生成物または静的アセットです。**手で編集しないでください。**

- `og-image.png`（1200×630）：`og:image` と `twitter:image` が指す共有カード。原本は `tools/og-card.html` で、`npm run assets:og-image` で再生成します（ローカルの Chrome か Edge、または `CHROME_PATH` で指定）。
- `sitemap.xml`：`npm run assets:sitemap` が静的ルートと `RelaxKonServer/Content/Docs` から生成します。コンテンツが既定の相対位置にない場合は `RELAXKON_DOCS_ROOT` を指定してください。見つからない場合は静的ルートのみを出力し、失敗にはしません。言語ごとに URL が変わるのはドキュメントだけなので、`hreflang` はドキュメントのエントリにのみ付けます。
- `robots.txt`：静的ファイルで、sitemap を指します。

共有画像・canonical・`og:*` / `twitter:*` は `SeoService` が各ルートで書き込みます。`src/index.html` には、JavaScript を実行しないクローラー向けの静的な既定値も置いてあります。

## プロジェクト境界

このプロジェクトは公式サイトのフロントエンドを置く唯一の場所です。`RelaxKonServer` にサイト UI を追加しないでください（あちらは API 専用です）。ワークスペース全体の境界ルールは [`../WEBSITE_ARCHITECTURE.ja.md`](../WEBSITE_ARCHITECTURE.ja.md) を参照してください。

## コンテンツ更新と検証

ガイドは現在のソース・実検証・公開パッケージを区別します。Android 詳細仕様の正本は製品の `Client/RelaxKonOS.Client.Android/docs/` で、サイトは利用者向け要約とリンクを提供します。Android・アカウント認証・転送再開・アラート・復元ガイドを追加し、FAQ は 16 件です。0.1.2 リリース記録は既存の四つの成果物から作成し、最近のソース機能の収録を推定しません。

```bash
node tools/verify-i18n-keys.mjs
node tools/verify-i18n-usage.mjs
npm test -- --watch=false
npm run build
```
