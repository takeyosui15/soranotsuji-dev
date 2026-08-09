# Koushi Preview — VSCode拡張

Markdownの ```` ```koushi ```` コードフェンスを、VSCodeの標準Markdownプレビュー
(Cmd+Shift+V)で**Koushi(格子)記法の表**として描画する小さな拡張です。
マトリックスCLや状態遷移表を「漏れなく・ダブりなく」目で確認するための道具
(第66ラウンド・依頼者GO)。

## インストール(Mac・どちらか一方でOK)

### 方法A: vsixファイルで入れる(おすすめ)

1. このフォルダの `koushi-preview-0.1.0.vsix` を使います。
2. VSCodeの拡張ビュー(⇧⌘X)右上の「…」→「Install from VSIX...」でファイルを選ぶ。
   (またはターミナルで `code --install-extension <このフォルダ>/koushi-preview-0.1.0.vsix`)
3. VSCodeを再読み込み(⇧⌘P→「Reload Window」)。

### 方法B: フォルダを拡張ディレクトリへコピーする(vsixが使えない時の予備)

```sh
cp -R ClaudeMederuU/tools/vscode-koushi ~/.vscode/extensions/soranotsuji.koushi-preview-0.1.0
```

その後、VSCodeを再読み込み。アンインストールはこのフォルダを削除するだけです。

## 動作確認

同じフォルダの `sample.md` を開いてプレビュー(⇧⌘V)。
3つの表(マトリックスCL・状態遷移表・チェックリスト)が罫線つきで描かれ、
最後のjsフェンスは普通のハイライトのままなら成功です。

## 中身と保守

| ファイル | 役割 |
|---|---|
| `extension.js` | markdown-itプラグイン本体(```koushiフェンスだけをkoushiToHtmlで描画・他は委譲) |
| `koushi.js` | レンダラの同梱コピー。**正は `ClaudeMederuU/tools/koushi.js`**。ズレは`extension.test.js`のドリフト検査が検知(同期は`cp`一発) |
| `koushi-preview.css` | プレビュー用の罫線と寄せ(テーマ非依存の半透明グレー) |
| `sample.md` | 動作確認サンプル |
| `extension.test.js` | Node単体で回る検証(フェンス差し込み・委譲・エラー閉じ込め・ドリフト・package構造)。回帰の道具テストに含める |

- 記法の正はデッサン `ClaudeMederuU/dessin/01-koushi-dessin.md`。
- レンダラ本体を更新したら: `cp ClaudeMederuU/tools/koushi.js ClaudeMederuU/tools/vscode-koushi/koushi.js`
  → テスト → vsixを作り直してVSCodeへ入れ直す。
- vsixの作り直し(ネットワークのある環境): このフォルダで
  `npx @vscode/vsce package --allow-missing-repository` を実行。
