# broccoli-module-std-document

## カスタマイズログ

### 2020-05-18:

- `$editable` の `keydown` イベント内で、 `e.stopPropagation()` を実行するようにした。これにより、 呼び出し側がハンドルする Backspace キー および Delete キー と競合し、文字を消せなくなる問題が解消した。

### 2020-06-23:

- Update Summernote: v0.8.16 to v0.8.18
