# px2-clover アピアランス設定インストラクション

## 概要

px2-cloverでは、ユーザーが管理画面の外観（アピアランス）を設定できる機能を提供しています。ライトモード、ダークモード、またはシステム設定に従う自動モードを選択できます。

## アピアランス設定の種類

### 1. Auto（自動）
- **値**: `""` (空文字列) または `"auto"`
- **動作**: システムの `prefers-color-scheme` 設定に従って自動的にライトモードまたはダークモードを適用
- **デフォルト**: 新規ユーザーのデフォルト設定

### 2. Light Mode（ライトモード）
- **値**: `"light"`
- **動作**: 常にライトモードを適用

### 3. Dark Mode（ダークモード）
- **値**: `"dark"`
- **動作**: 常にダークモードを適用

## ファイル構造

### ソースファイル（SCSS）

```
src/cloverCommon/appearance/
├── auto.scss          # 自動モード用スタイル（prefers-color-scheme に基づく）
├── lightmode.scss     # ライトモード用スタイル（空ファイル）
└── darkmode.scss      # ダークモード用スタイル
```

### ビルド成果物（CSS）

```
public/resources/cloverCommon/appearance/
├── auto.css           # コンパイル後の自動モードCSS
├── lightmode.css      # コンパイル後のライトモードCSS
└── darkmode.css       # コンパイル後のダークモードCSS
```

## 実装の詳細

### 1. スタイル定義（SCSS）

#### auto.scss
```scss
@media (prefers-color-scheme: dark) {
  :root {
    --px2-text-color: #ddd;
    --px2-background-color: #333;
  }
  
  @import "../../../vendor/pickles2/px2style/dist/themes/darkmode";
  
  // ダークモード用のスタイル定義
  // ...
}
```

#### darkmode.scss
```scss
:root {
  --px2-text-color: #ddd;
  --px2-background-color: #333;
}

@import "../../../vendor/pickles2/px2style/dist/themes/darkmode";

// ダークモード用のスタイル定義
// ...
```

#### lightmode.scss
```scss
// ライトモードは空ファイル（デフォルトスタイルを使用）
```

### 2. ビルドプロセス（webpack.mix.js）

```javascript
.sass('src/cloverCommon/appearance/auto.scss', 'public/resources/cloverCommon/appearance/')
.sass('src/cloverCommon/appearance/lightmode.scss', 'public/resources/cloverCommon/appearance/')
.sass('src/cloverCommon/appearance/darkmode.scss', 'public/resources/cloverCommon/appearance/')
```

### 3. サーバーサイド処理（php/view.php）

ユーザーの設定に基づいて適切なCSSファイルを読み込みます：

```php
switch( $this->clover->auth()->get_login_user_info()->appearance ?? '' ){
    case "light":
        ?><style id="px2-clover-appearance-styles"><?= ( file_get_contents(__DIR__.'/../public/resources/cloverCommon/appearance/lightmode.css') ); ?></style><?php
        break;
    
    case "dark":
        ?><style id="px2-clover-appearance-styles"><?= ( file_get_contents(__DIR__.'/../public/resources/cloverCommon/appearance/darkmode.css') ); ?></style><?php
        break;
    
    case "":
    default:
        ?><style id="px2-clover-appearance-styles"><?= ( file_get_contents(__DIR__.'/../public/resources/cloverCommon/appearance/auto.css') ); ?></style><?php
        break;
}
```

### 4. テンプレートへの埋め込み

すべてのレイアウトテンプレート（`templates/layouts/*.twig`）で、`appearance_resources` 変数として埋め込まれます：

```twig
{# Appearance Resources #}
{{ appearance_resources | raw }}
```

### 5. ユーザー設定UI（React）

`src/cloverMain/views/ConfigProfile.jsx` で、ユーザーがアピアランス設定を変更できます：

```jsx
<select id="input-appearance" name="appearance" defaultValue={main.profile.appearance}>
    <option value="">Auto</option>
    <option value="light">Light mode</option>
    <option value="dark">Dark mode</option>
</select>
```

### 6. データ保存（php/helpers/auth.php）

ユーザープロファイルに `appearance` フィールドとして保存されます：

```php
$write_data->appearance = $new_profile->appearance ?? null;
```

## スタイルの適用範囲

### 1. 基本スタイル
- `:root` 変数によるカラーテーマ定義
- `--px2-text-color`: テキストカラー
- `--px2-background-color`: 背景カラー

### 2. px2style テーマ
- `@import "../../../vendor/pickles2/px2style/dist/themes/darkmode"` により、px2styleのダークモードテーマを適用

### 3. Clover固有のスタイル
- `.theme-layout` コンポーネントのスタイル
- `.theme-frame` コンポーネントのスタイル
- 各種ビュー固有のスタイル（PageInfo, Sitemap, Publish など）

### 4. 外部ライブラリのテーマ
以下の外部ライブラリのダークモードテーマも適用されます：
- `px2te` (Pickles 2 Theme Editor)
- `gitui79` (Git UI)
- `remote-finder` (リモートファイルファインダー)
- `common-file-editor` (共通ファイルエディタ)

## 開発ガイドライン

### 新しいスタイルを追加する場合

1. **ダークモード用スタイルを追加**
   - `src/cloverCommon/appearance/darkmode.scss` にスタイルを追加
   - `src/cloverCommon/appearance/auto.scss` の `@media (prefers-color-scheme: dark)` ブロック内にも同じスタイルを追加

2. **ビルドを実行**
   ```bash
   npm run dev
   # または
   npm run watch
   ```

3. **確認**
   - 管理画面でアピアランス設定を変更して、スタイルが正しく適用されることを確認

### 既存のスタイルを修正する場合

1. **SCSSファイルを編集**
   - `src/cloverCommon/appearance/darkmode.scss` または `auto.scss` を編集

2. **ビルドを実行**
   ```bash
   npm run dev
   ```

3. **ブラウザで確認**
   - 管理画面をリロードして、変更が反映されていることを確認

### 新しいビューにダークモード対応を追加する場合

1. **ビュー固有のダークモードSCSSファイルを作成**
   - 例: `src/cloverMain/views/YourView_files/darkmode.scss`

2. **auto.scss と darkmode.scss にインポートを追加**
   ```scss
   [data-px="admin.your_view"] {
       @import "./../../cloverMain/views/YourView_files/darkmode";
   }
   ```

3. **ビルドを実行**
   ```bash
   npm run dev
   ```

## トラブルシューティング

### スタイルが適用されない場合

1. **ビルドが実行されているか確認**
   ```bash
   npm run dev
   ```

2. **CSSファイルが生成されているか確認**
   - `public/resources/cloverCommon/appearance/` にCSSファイルが存在するか確認

3. **HTMLにスタイルが埋め込まれているか確認**
   - ブラウザの開発者ツールで `<style id="px2-clover-appearance-styles">` タグが存在するか確認

4. **ユーザー設定が正しく保存されているか確認**
   - 管理画面のプロフィール設定で、アピアランス設定が正しく保存されているか確認

### ダークモードとライトモードが混在する場合

1. **CSSの優先順位を確認**
   - `appearance_resources` は `common_resources` の後に読み込まれるため、正しく上書きされるはずです
   - 必要に応じて `!important` を使用（推奨されません）

2. **スタイルのスコープを確認**
   - 特定のビューにのみ適用されるスタイルは、適切なセレクタで囲まれているか確認

### ビルドエラーが発生する場合

1. **SCSSの構文エラーを確認**
   - `@import` パスが正しいか確認
   - 変数やミックスインの定義が正しいか確認

2. **依存パッケージを確認**
   - `vendor/pickles2/px2style/dist/themes/darkmode` が存在するか確認
   - `node_modules` 内の依存パッケージが正しくインストールされているか確認

## テスト方法

### 手動テスト

1. **管理画面にログイン**
   - プロフィール設定画面に移動

2. **アピアランス設定を変更**
   - Auto / Light mode / Dark mode を切り替え

3. **ページをリロード**
   - 設定が正しく適用されているか確認

4. **システム設定を変更（Autoモードの場合）**
   - OSのダークモード設定を変更
   - ブラウザをリロードして、自動的に切り替わるか確認

### 自動テスト

現在、アピアランス設定に関する自動テストは実装されていません。必要に応じて追加を検討してください。

## 関連ファイル一覧

### ソースファイル
- `src/cloverCommon/appearance/auto.scss`
- `src/cloverCommon/appearance/lightmode.scss`
- `src/cloverCommon/appearance/darkmode.scss`
- `src/cloverCommon/cloverCommon.scss` (基本スタイル)

### ビルド成果物
- `public/resources/cloverCommon/appearance/auto.css`
- `public/resources/cloverCommon/appearance/lightmode.css`
- `public/resources/cloverCommon/appearance/darkmode.css`

### PHPファイル
- `php/view.php` (スタイルの読み込み処理)
- `php/helpers/auth.php` (ユーザープロファイルの保存・読み込み)

### Reactコンポーネント
- `src/cloverMain/views/ConfigProfile.jsx` (設定UI)

### テンプレートファイル
- `templates/layouts/plain.twig`
- `templates/layouts/default.twig`
- `templates/layouts/auth.twig`

### ビルド設定
- `webpack.mix.js`

## 今後の改善案

1. **追加のテーマオプション**
   - カスタムカラーテーマのサポート
   - 高コントラストモードの追加

2. **パフォーマンス最適化**
   - CSSの遅延読み込み
   - 不要なスタイルの削除

3. **アクセシビリティ向上**
   - WCAG 2.1 AA準拠の確認
   - カラーコントラスト比の最適化

4. **自動テストの追加**
   - スタイル適用の自動テスト
   - ビジュアルリグレッションテスト

---

このインストラクションに従うことで、px2-cloverのアピアランス設定機能を理解し、適切に拡張・修正することができます。

