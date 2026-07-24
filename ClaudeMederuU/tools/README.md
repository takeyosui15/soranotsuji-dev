# ClaudeMederuU/tools/ — 自作ツール置き場(Claudeさんの道具箱)

「自分が使うツールは、自分で作る」— 開発中に必要になって自作した、**プロジェクトをまたいで
再利用できる道具**をここに保管します(第39ラウンド新設。将来は`MederuU`へ引き継ぐ想定)。

## 道具の台帳

| ツール | 置き場所 | 用途 | 再利用方法 |
|---|---|---|---|
| 保存キー整合性リンター | `tests/verify123.js` | 「保存される(save)のに復元されない(load)」「復元コードだけあって保存されない」という複数箇所の暗黙対応のズレを静的検査する。宙の辻の花火モードのバグ(第36ラウンド)の再発防止から生まれた | `node tests/verify123.js [対象JSファイル]` — 対象を引数で差し替え可能。関数名(buildStateToSave/loadAppState/normalizeAppState)は他プロジェクトでは冒頭の定数を書き換える |
| 中央寄せ画素チェッカー | `ClaudeMederuU/tools/center-check.js` | ボタン内アイコン等の「見た目の中央ズレ」を画素で実測する(子要素の矩形中心+スクリーンショットのインク重心の両方)。アイコン中心ズレのバグ(第33ラウンド)の画素実測を汎用化した | `node ClaudeMederuU/tools/center-check.js <URL> <CSSセレクタ...>` (要playwright-core+Chromium)。verifyからは`require('../ClaudeMederuU/tools/center-check.js')`で関数利用 |
| ローカルglyphs生成 | `tests/build-glyphs.js` | symbolレイヤ用のSDFフォントPBF(ASCII)を外部配信に頼らず自前生成する(オフライン方針との両立。第36ラウンド) | `node tests/build-glyphs.js` → `fonts/<名前>/0-255.pbf`。フォント名/文字範囲はスクリプト内の定数 |
| ハーネス構築・同期 | `tests/harness/sync-apptest.py` | ローカル検証用apptest(アプリ一式+CDN→vendor書き換え)をゼロから構築/再同期する。ハーネス構築の知識がセッション初期化で消える不便(第41ラウンド)から昇格。ヘッダはman風書式(NAME/SYNOPSIS/…/HISTORY)の適用第1号 | `python3 tests/harness/sync-apptest.py <apptestディレクトリ>`。手順全体はスキル`.claude/skills/kaiki/`を参照 |
| 回帰の回し方スキル | `.claude/skills/kaiki/SKILL.md` | 次のセッションのClaude宛の引き継ぎ書(ハーネス構築→サーバ→回帰実行→つまずきの記憶)。「Claude自身が次セッション宛にスキルを書けるか」(第41ラウンド)の実証第1号 | 新しいセッションで自動的に読み込まれる(Skillツールから`kaiki`で呼び出し)。他プロジェクトへはMederuUのskills/経由で配布想定 |

## 候補(まだ作っていない道具。作る時はこの台帳へ昇格する)

| 候補 | 用途 | 生まれた経緯 |
|---|---|---|
| coverage-report | PlaywrightのCoverage APIで、回帰(verify群)実行中のscript.jsの行/関数カバレッジを実測する。クローズ前の品質確認用 | 第43ラウンドの依頼者のカバレッジ質問(C0/C1/MC/DC)から |
| css-why | ある要素のあるプロパティに、どの規則がカスケード順で効いているかを列挙する(人間のMDNホバーに当たるClaudeの目) | 第40ラウンドのレイヤーリスト縦4行のカスケード衝突調査から(手書き版はChromiumのネストCSS仕様で一度壊れた) |
| index-gen | man風ヘッダ/JSDocタグ/docstringから目次・索引(index.md)を自動生成する(手書きの目次は腐る) | 第41ラウンドのscratch索引の依頼者アイデア+OKFのindex.md文化から |
| anchor.js | 構造指紋+位置指紋の発行・検証・重複検出(デッサンはClaudeMederuU/dessin/03) | 第39ラウンドのパーマリンク案から |

## 運用メモ

- ここに置くのは「**プロジェクト成果物ではない**が、開発の道具として今後も使うもの」。
  (宙の辻専用のverifyスクリプトは従来どおり`tests/`。台帳からリンクだけする)
- 新しい道具を作ったら、この台帳に1行追加し、生まれた経緯(どのバグ/どの不便から)を書く。
  道具は経緯とセットで残すと、次のプロジェクトで「いつ使うか」が思い出せる。
