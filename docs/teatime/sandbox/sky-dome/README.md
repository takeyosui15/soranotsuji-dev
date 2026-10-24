# sky-dome — ひまわりの画像を「空のドーム」に投影する試作

第194ラウンド(2026-10-23)の「今の空」の最初の 1 枚。第195で設定ファイル化して与那国島(台風 30 号)も描いた。

## 何をする物

- 気象庁ホームページのひまわり日本域トゥルーカラー再現画像(タイル・最大ズーム 6=約 2km/画素)を 3×3 枚取り、観測点から見た空のドーム(方位×高度角・等距離射影)と、宙の窓風の 1 枚(ある方位を中心に水平 60°)と、地図に描く。
- 雲は「高さ H の 1 層」と仮定(設定の cloudH)。衛星の白い画素=雲、それ以外=青空(地面の色は空に貼らない)。
- 太陽と月は宙の辻と同じ Astronomy Engine(vendor/astronomy.browser.min.js を同じフォルダに置く)。

## 使い方(箱の中で)

1. タイルと時刻を取る(latest=直近の 2.5 分の画像。x0/y0 は zoom 6 のタイル番号で、観測点を含むタイルの左上の 1 つ手前)。
   ```
   curl -sS https://www.jma.go.jp/bosai/himawari/data/satimg/targetTimes_jp.json -o tt.json
   # bt/vt を tt.json の最後の要素から取り、x=x0..x0+2, y=y0..y0+2 を
   # https://www.jma.go.jp/bosai/himawari/data/satimg/{bt}/jp/{vt}/REP/ETC/6/{x}/{y}.jpg → tiles/rep_6_{x}_{y}.jpg に保存
   # time.json に {"basetime":bt,"validtime":vt} を書く
   ```
2. 設定を書く(cfg_*.json): `time`(時刻ファイル)・`tiledir`・`zoom`(省略時 6。全球域 fd は最大 5)・`x0`・`y0`・`obs`(観測点 name/lat/lon/h)・`tgt`(印を付ける地点)・`cloudH`。
3. このフォルダを `python3 -m http.server 8100` で配り、`node render.js cfg_xxx.json`(playwright-core と Chromium が要る。kaiki のハーネスと同じ)。`out/` に map/dome/win の PNG が出る。

## 限界(2026-10-24 時点)

- 日本域(jp)タイルはズーム 6 が最大で約 2km/画素。雲の縁は粗い。全球域(fd)はズーム 5 が最大(約 4km/画素)で、日本域の範囲外(与那国島の南西など)はこちらで描く(cfg の `zoom` と `tiledir`、URL の `jp` を `fd` に)。
- 雲の高さは 1 層の仮定。赤外(B13 の輝度温度)を使えば目安が付く。
- 稜線は未実装(地平線は眼高の伏角だけ)。
- 雲らしさは色と明るさの簡単な式で、雪や海面の反射を雲と見誤る。

## 出典

- 気象庁ホームページ(ひまわり画像)。利用規約は公共データ利用規約(第1.0版)。加工して使う時は出典と加工の明記。
