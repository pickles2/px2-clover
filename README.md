# px2-clover

[Pickles 2](https://pickles2.pxt.jp/) のプラグイン型CMS。


## Usage - 使い方

### インストール

```
composer require tomk79/px2-clover;
```

### セットアップ

`px-files/config.php` の先頭に、 `tomk79\pickles2\px2clover\main::register()` の設定を追加する。

```php
	// funcs: Before sitemap
	$conf->funcs->before_sitemap = [
		// px2-clover
		tomk79\pickles2\px2clover\main::register( array(
			/* any options... */
		) ),

		// ...other plugins
	];
```


`$conf->allow_pxcommands` を有効に設定します。
この設定により、すべてのPXコマンドがブラウザから実行できるようになります。
通常、この設定は無効にすることが推奨されていますが、 Clover CMS が、他のすべてのPXコマンドの実行に認証を求め、保護するため、安全に使うことができます。

```php
$conf->allow_pxcommands = 1;
```

### プラグインオプション

必要に応じて、追加のオプションを設定できます。

```php
	// funcs: Before sitemap
	$conf->funcs->before_sitemap = [
		// px2-clover
		tomk79\pickles2\px2clover\main::register( array(
			"protect_preview" => true, // プレビューに認証を要求するか？
		) ),
	];
```


### 管理画面から設定

ここまでの設定ができたら、ブラウザでプレビューにアクセスし、管理画面から設定を続けます。
詳しくは管理画面の指示に従ってください。

通常、プレビュー画面の右下に管理メニューが表示され、管理画面へ遷移できます。
管理画面のURLは、 プレビューに `PX=admin` を付与したもの(例: `https://yourdomain/?PX=admin`) になります。


## 環境変数

- `APP_KEY`: 暗号・復号 に使用するキー


## 更新履歴 - Change log

### tomk79/px2-clover v0.1.2 (リリース日未定)

- パブリッシュが重くなる問題を修正した。
- ログイン処理の改善。
- メンバー管理機能を追加。
- その他の不具合修正、UI改善、パフォーマンス改善など。

### tomk79/px2-clover v0.1.1 (2022年5月22日)

- パブリッシュ画面を追加。
- キャッシュを消去画面を追加。
- 見た目に関する様々な変更。
- タスクスケジューラー: 排他ロックするようになった。
- タスクスケジューラー: 実行ログを残すようになった。
- Gitの基本操作画面を追加。
- Gitの自動コミット機能を追加。
- その他の変更。

### tomk79/px2-clover v0.1.0 (2022年5月6日)

- Initial Release



## ライセンス - License

MIT License https://opensource.org/licenses/mit-license.php


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
