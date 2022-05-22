# px2-clover

[Pickles 2](https://pickles2.pxt.jp/) のプラグイン型CMS。


## Usage - 使い方

### インストール

```
composer require tomk79/px2-clover;
```

### セットアップ

`px-files/config.php` に、 `tomk79\pickles2\px2clover\main::register()` の設定を追加する。

```php
	// funcs: Before sitemap
	$conf->funcs->before_sitemap = [
		// px2-clover
		tomk79\pickles2\px2clover\main::register(),
	];
```


## 環境変数

- `APP_KEY`: 暗号・復号 に使用するキー


## 更新履歴 - Change log

### tomk79/px2-clover v0.1.1 (リリース日未定)

- パブリッシュ画面を追加。
- キャッシュを消去画面を追加。
- 見た目に関する様々な変更。
- タスクスケジューラー: 排他ロックするようになった。
- タスクスケジューラー: 実行ログを残すようになった。
- Gitの基本操作画面を追加。
- その他の変更。

### tomk79/px2-clover v0.1.0 (2022年5月6日)

- Initial Release



## ライセンス - License

MIT License https://opensource.org/licenses/mit-license.php


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
