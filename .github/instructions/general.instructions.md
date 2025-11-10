# px2-clover リポジトリ構造インストラクション

## プロジェクト概要

**px2-clover** は、Pickles 2のプラグイン型CMSです。PHP製のバックエンド、React製のフロントエンド管理画面、Twigテンプレートエンジンを使用した、フル機能のコンテンツ管理システムです。

## 技術スタック

### バックエンド
- **PHP 7.3以上** - サーバーサイド処理
- **Composer** - PHPパッケージ管理
- **Pickles 2 Framework** - ベースフレームワーク
- **Twig v3** - テンプレートエンジン
- **PHPUnit** - テストフレームワーク

### フロントエンド
- **React 17** - 管理画面UI
- **Laravel Mix** - アセットビルド
- **Webpack** - バンドラー
- **Sass** - CSSプリプロセッサ
- **Babel** - JavaScriptトランスパイラ

## ディレクトリ構造

```
/px2-clover
├── php/                    # PHPバックエンドコード
│   ├── clover.php         # メインクラス
│   ├── initializer.php    # 初期化処理
│   ├── register.php       # プラグイン登録
│   ├── view.php           # ビュー処理
│   ├── funcs/             # 機能モジュール
│   │   ├── api/           # APIエンドポイント
│   │   ├── editContent/   # コンテンツ編集機能
│   │   ├── editModule/    # モジュール編集機能
│   │   ├── editThemeLayout/ # テーマレイアウト編集
│   │   └── serve/         # 開発サーバー機能
│   └── helpers/           # ヘルパークラス
│       ├── auth.php       # 認証処理
│       ├── config.php     # 設定管理
│       ├── git.php        # Git操作
│       ├── logger.php     # ログ管理
│       └── ...
├── src/                   # フロントエンドソースコード
│   ├── _libs/             # 共通ライブラリ
│   ├── cloverCommon/      # 共通コンポーネント
│   ├── cloverMain/        # メイン管理画面
│   │   ├── cloverMain.jsx  # エントリポイント
│   │   ├── components/    # Reactコンポーネント
│   │   ├── context/       # Reactコンテキスト
│   │   ├── layouts/       # レイアウトコンポーネント
│   │   └── views/         # ビューコンポーネント
│   │       ├── Dashboard.jsx
│   │       ├── Sitemap.jsx
│   │       ├── Publish.jsx
│   │       └── ...
│   └── previewFooter/     # プレビューフッター機能
├── public/resources/      # 公開リソース
│   ├── jquery-3.6.0.min.js
│   ├── ace/              # コードエディタ
│   ├── codemirror/       # コードエディタ
│   └── ...
├── templates/             # Twigテンプレート
│   ├── cont/             # コンテンツテンプレート
│   ├── layouts/          # レイアウトテンプレート
│   ├── preview/          # プレビューテンプレート
│   └── system/           # システムテンプレート
├── tests/                # テストコード
│   ├── mainTest.php      # メインテスト
│   └── testdata/         # テストデータ
├── data/                 # データファイル
│   └── language.csv      # 多言語対応データ
├── composer.json         # PHP依存関係定義
├── package.json          # Node.js依存関係定義
├── webpack.mix.js        # ビルド設定
└── phpunit.xml           # PHPUnit設定
```

## 主要機能とファイルマッピング

### 1. 認証・ユーザー管理
- `php/helpers/auth.php` - 認証処理
- `php/helpers/authorizeHelper.php` - 認可ヘルパー
- `src/cloverMain/views/ConfigMembers.jsx` - メンバー管理UI
- `src/cloverMain/views/ConfigProfile.jsx` - プロフィール管理UI
- `templates/system/login.twig` - ログイン画面

### 2. コンテンツ編集
- `php/funcs/editContent/editContent.php` - コンテンツ編集処理
- `src/cloverMain/views/PageInfo.jsx` - ページ情報編集UI
- `templates/cont/editContent/` - コンテンツ編集テンプレート

### 3. モジュール編集
- `php/funcs/editModule/` - モジュール編集機能
- `src/cloverMain/views/Modules.jsx` - モジュール管理UI

### 4. テーマ・レイアウト編集
- `php/funcs/editThemeLayout/` - テーマレイアウト編集機能
- `src/cloverMain/views/Theme.jsx` - テーマ管理UI

### 5. サイトマップ管理
- `src/cloverMain/views/Sitemap.jsx` - サイトマップUI

### 6. パブリッシュ機能
- `php/funcs/api/publish.php` - パブリッシュAPI
- `src/cloverMain/views/Publish.jsx` - パブリッシュUI

### 7. 履歴管理・Git連携
- `php/helpers/git.php` - Git操作
- `src/cloverMain/views/History.jsx` - 履歴管理UI
- `src/cloverMain/views/ConfigHistory.jsx` - 履歴設定UI

### 8. ファイル管理
- `php/funcs/api/commonFileEditor.php` - ファイル編集API
- `src/cloverMain/views/FilesAndFolders.jsx` - ファイル管理UI

### 9. 設定管理
- `php/helpers/config.php` - 設定ヘルパー
- `src/cloverMain/views/Config.jsx` - 設定UI
- `src/cloverMain/views/Dashboard.jsx` - ダッシュボード

### 10. メンテナンスモード
- `php/helpers/maintenanceMode.php` - メンテナンスモード管理
- `src/cloverMain/views/ConfigMaintenance.jsx` - メンテナンス設定UI

### 11. スケジューラー
- `php/helpers/scheduler.php` - タスクスケジューラー
- `src/cloverMain/views/ConfigScheduler.jsx` - スケジューラー設定UI

### 12. 多言語対応
- `php/helpers/lang.php` - 言語ヘルパー
- `data/language.csv` - 言語データ
- `node_modules` 内の `langbank` パッケージ使用

### 13. ブログ機能
- `src/cloverMain/views/Blog.jsx` - ブログ管理UI
- 外部パッケージ `pickles2/px2-blog-kit` に依存

### 14. 開発サーバー
- `php/funcs/serve/serve.php` - 開発サーバー機能
- `composer start` コマンドで起動

## 開発ワークフロー

### セットアップ

```bash
# PHP依存関係のインストール
composer install

# Node.js依存関係のインストール
npm install

# フロントエンドアセットのビルド
npm run dev
```

### 開発時

```bash
# フロントエンド自動ビルド（監視モード）
npm run watch

# 開発サーバー起動
composer start
# または
php ./tests/testdata/src_px2/.px_execute.php "/?PX=admin.serve&S=localhost:8090"
```

### プロダクションビルド

```bash
npm run production
```

### テスト実行

```bash
composer test
# または
php ./vendor/phpunit/phpunit/phpunit
```

## API構造

### PXコマンド形式
URLパラメータ `PX` を使用してAPIを呼び出す：
- `?PX=admin` - 管理画面トップ
- `?PX=admin.api.*` - API呼び出し
- `?PX=admin.serve` - 開発サーバー起動

### API機能配置
`php/funcs/api/` ディレクトリ内：
- `profile.php` - プロフィール管理API
- `publish.php` - パブリッシュAPI
- `commonFileEditor.php` - ファイル編集API
- その他多数のAPIモジュール

## 重要な設定ファイル

### composer.json
- PHPバージョン要件: `>=7.3.0`
- 主要依存: Pickles 2 Framework, Twig, PHPUnit
- オートロード: PSR-4形式で `tomk79\pickles2\px2clover` 名前空間

### package.json
- React 17ベース
- Laravel Mix 6でビルド
- 開発用スクリプト: `dev`, `watch`, `production`

### webpack.mix.js
- Babel設定（React JSX対応）
- Twig Loader
- CSV Loader
- Sass Loader
- エントリポイント設定

## セキュリティ機能

1. **認証システム** - `php/helpers/auth.php`
2. **CSRFトークン** - セッション管理
3. **認可ヘルパー** - `php/helpers/authorizeHelper.php`
4. **チェックアウト機能** - `php/helpers/checkout.php`（排他制御）
5. **暗号化機能** - `php/helpers/crypt.php`
6. **アカウントロック** - 不正アクセス防止

## ロギング機能

- `php/helpers/logger.php` - ログ管理
- ISO 8601形式のタイムスタンプ
- 操作履歴の記録

## コーディング規約

### PHP
- PSR-4オートロード準拠
- 名前空間: `tomk79\pickles2\px2clover`
- クラス名: PascalCase
- メソッド名: snake_case

### JavaScript/React
- ES6+ 構文
- React 17 Hooks推奨
- コンポーネント名: PascalCase
- ファイル拡張子: `.jsx`

### CSS/Sass
- `.scss` 形式
- BEM命名規則
- モジュール単位でスタイル分離

## テストデータ

`tests/testdata/src_px2/` に完全なテスト用Pickles 2プロジェクトが配置されています。

### ブラウザでの表示方法
- フロント画面URL: `http://localhost:8090/`
- 管理画面URL: `http://localhost:8090/?PX=admin`
    - ログインID: `texter`
    - パスワード: `tester`

## ビルド成果物

- `public/resources/` - 本番用公開リソース
- `mix-manifest.json` - Laravel Mixのマニフェストファイル

## 拡張機能

### Custom Console Extensions (CCE)
- `src/cloverMain/views/CustomConsoleExtensions.jsx`
- プラグインで管理画面を拡張可能
- `cceAgent` APIを提供

## 依存パッケージ

### 主要PHP依存
- `pickles2/px-fw-2.x` - Pickles 2フレームワーク
- `pickles2/px2-blog-kit` - ブログ機能
- `pickles2/px2-px2dthelper` - 開発ツールヘルパー
- `tomk79/langbank` - 多言語対応
- `tomk79/remote-finder` - リモートファイルファインダー
- `twig/twig` - テンプレートエンジン

### 主要Node.js依存
- `react`, `react-dom` - UI構築
- `laravel-mix` - ビルドツール
- `sass`, `sass-loader` - スタイル処理
- `babel-loader` - JSXトランスパイル
- `gitui79` - Git UI
- `marked` - Markdownパーサー

## 変更を加える際のガイドライン

### 新機能追加時
1. **バックエンドAPI**: `php/funcs/api/` に新規クラスを追加
2. **フロントエンドビュー**: `src/cloverMain/views/` に新規Reactコンポーネントを追加
3. **ルーティング**: `src/cloverMain/cloverMain.jsx` にルート定義を追加
4. **テンプレート**: 必要に応じて `templates/` に追加

### スタイル変更時
1. `src/cloverMain/cloverMain.scss` または各ビューの `.scss` ファイルを編集
2. `npm run dev` または `npm run watch` でリビルド

### 言語追加時
1. `data/language.csv` に翻訳を追加
2. `php/helpers/lang.php` を使用して多言語対応

### テスト追加時
1. `tests/` ディレクトリに新規テストファイルを追加
2. PHPUnit形式で記述
3. `composer test` で実行確認

## トラブルシューティング

### ビルドエラーが発生する場合
1. `node_modules` を削除して `npm install` を再実行
2. `npm run dev` でエラーメッセージを確認
3. `webpack.mix.js` の設定を確認

### PHPエラーが発生する場合
1. `composer install` が正しく完了しているか確認
2. PHP 7.3以上がインストールされているか確認
3. `vendor/autoload.php` が存在するか確認

### テストが失敗する場合
1. `tests/testdata/` のデータが正しいか確認
2. PHPUnitのバージョンを確認
3. `phpunit.xml` の設定を確認

## リリースプロセス

1. すべてのテストが通ることを確認: `composer test`
2. プロダクションビルドを実行: `npm run production`
3. バージョン番号を更新
4. 変更履歴を `README.md` に記載
5. Gitタグを作成してプッシュ

## 参考リンク

- [Pickles 2 公式サイト](https://pickles2.com/)
- [プロジェクトリポジトリ](https://github.com/pickles2/px2-clover)
- [開発者サイト](https://www.pxt.jp/)

---

このインストラクションに従うことで、px2-cloverプロジェクトの構造を理解し、効率的に開発を進めることができます。
