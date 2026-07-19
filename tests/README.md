# tests/ — ヘッドレスブラウザ検証スイート(ナレッジ)

Claude(AI)が各開発ラウンドで実行している検証スクリプトの保管場所です。
`docs/order.md` の「検証結果」に対応する実体で、ラウンド毎に `verifyNN.js` を追加します。
(旧来のPlaywright E2E一式は `test-initial/` に移動しました)

## 一覧

| ファイル | ラウンド | 内容 |
|---|---|---|
| `verify96.js` | 第8 | 焦点距離初期値24・File取得ボタン・月輝面比列・辻検索File取得E2E(65列CSV)・Myセット4シート存在確認(タブ削除→読込/保存で自動作成) |
| `verify97.js` | 第8 | 天体検索/登録メニュー改修・全天儀ctrl(開閉1/2分割・基本オプション/日時連動・速度ボタン委譲)・フレーム同期録画(媒体時間=コマ数/fps・再生可) |
| `verify98.js` | 第9〜10 | 全天儀ctrl2〜4段目(前景/後景クリップ面・透過=不透明両面描画の視覚検証・回転モードの軸不変量・北奥/目的点前リセット)・最大化サイズ規則5パターン・辻メッシュFile取得の全画素CSV(観測点ID=画素ID・行内日時順)・🕛アニメ・CSV回帰 |
| `verify100.js` | 第14 | 宙検索フェーズ1(メニューUI・扇形標本の格子丸め/重み・スコア関数の性質[快晴/曇天/月の避狙反転/対象高度]・Open-MeteoモックE2E[バッチ1コール/キャッシュ0コール/best_match延長/信頼度列]) |
| `verify101.js` | 第19 | 宙検索の光害組み込み(実アセット読込960×660・東京/山間/範囲外の参照・方向光害・光害因子[暗い空=高得点/都市=減点/lp省略の後方互換/重み0は不影響]・列表示) |
| `verify99.js` | 第11〜12 | 花火モード(UI30要素・号数仕様表示・メニュー/ctrl双方向連動・固定でばらつき0・打ち上げ点設定と地図マーカー・アニメーション起動と実寸ENU・ばらつき分布±100/0・URL記憶+短縮URL v9往復・OFF後始末) |
| `verify102.js` | 第20 | 実ネットワークE2E(ネットワーク許可後の初回。素のindex.html=CDN書き換え無しで、実CDN[unpkg/jsDelivr/sourceforge]・実地理院タイル/標高/地名検索・実Open-Meteoの宙検索[富士山麓14件・実SQM]・キャッシュ0コール・カウンター遮断の確認) |

## 実行方法(ローカルハーネス)

ネットワーク遮断環境でも動くよう、CDNのライブラリをローカルに置いた複製ディレクトリをHTTPで配信して実行します。

1. 作業ディレクトリ(例 `apptest/`)にリポジトリのアプリ一式(`index.html` `script.js` `style.css` 各ワーカー)をコピー
2. `vendor/` に以下を配置し、`index.html`とワーカーのCDN参照をvendorパスへ書き換える
   - leaflet 1.9.4 (`leaflet.js` `leaflet.css`) / astronomy-engine 2.1.19 (`astronomy.browser.min.js`)
   - three 0.160.0 (`three.min.js`) / geographiclib-geodesic / geographiclib-dms (いずれもnpmから取得可)
3. `python3 -m http.server 8099 --bind 127.0.0.1` で配信
4. `node tests/verify99.js` のように実行(要 `playwright-core` とChromium。CIやサンドボックスでは
   `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` でWebGLをソフトウェア実行)

- Google Drive/Sheets を使うテスト(verify96のT3等)は `window.fetch` をテスト内でモックしています(実アカウント不要)
- 判定は `PASS/FAIL` を標準出力に出し、FAILが1つでもあれば終了コード1

## 実行方法(実ネットワークハーネス。verify102以降)

ネットワーク許可済みの環境では、リポジトリ直下をそのまま配信して素のindex.html(CDN書き換え無し)で検証できます。
Claude Codeクラウド環境ではエージェントプロキシの都合で、ChromiumにプロキシCAのNSS登録と
`--proxy-server=$HTTPS_PROXY` `--proxy-bypass-list=<local>` `--ssl-version-max=tls1.2` が必要です
(詳細は `verify102.js` 冒頭のコメントを参照。TLS証明書検証は有効のままです)。
