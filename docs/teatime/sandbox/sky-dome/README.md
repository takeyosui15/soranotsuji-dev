# sky-dome — ひまわりの画像を「空のドーム」に投影する試作

第194ラウンド(2026-10-23)の「今の空」の最初の 1 枚。第195で設定ファイル化して与那国島(台風 30 号)も描き、稜線(国土地理院の標高タイルから求めた地平線の形)を足した。

## 何をする物

- 気象庁ホームページのひまわり日本域トゥルーカラー再現画像(タイル・最大ズーム 6=約 2km/画素)を 3×3 枚取り、観測点から見た空のドーム(方位×高度角・等距離射影)と、宙の窓風の 1 枚(ある方位を中心に水平 60°)と、地図に描く。
- 雲は「高さ H の 1 層」と仮定(設定の cloudH)。衛星の白い画素=雲、それ以外=青空(地面の色は空に貼らない)。
- 太陽と月は宙の辻と同じ Astronomy Engine(vendor/astronomy.browser.min.js を同じフォルダに置く)。
- 稜線(任意): `ridge.html`+`ridge.js` が、国土地理院の標高タイル(dem_png・zoom 10・約 120m/画素)を観測点の周り 9×9 枚読み、全方位(0.2° 刻み)に 150km まで 100m ずつ歩いて見かけの高度角の最大(気差 k=0.13・地球の丸み込み)を求める。結果の JSON を cfg の `ridge` に渡すと、窓とドームの稜線より下を地面の色(近い山は暗く、遠い山は青白く)で塗る。

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
4. 稜線を出す時(任意): 標高タイルを `dem/dem_10_{x}_{y}.png` に取り(`https://cyberjapandata.gsi.go.jp/xyz/dem_png/10/{x}/{y}.png`。観測点のタイルを中心に ±4)、`dem_meta.json` に {z,x0,y0,n} を書き、`ridge_xxx.json`(dem_meta・demdir・obs・eye・k・stepAz・dmax・stepD)を用意して、`python3 -m http.server 8101` で配りながら `node ridge.js ridge_xxx.json`。`ridge_xxx.out.json` ができるので cfg の `ridge` に書く(燕岳の例: ridge_tsubakuro.json → ridge_tsubakuro.out.json)。海のタイルは 404 で、0m として扱う。

## 限界(2026-10-24 時点)

- 日本域(jp)タイルはズーム 6 が最大で約 2km/画素。雲の縁は粗い。全球域(fd)はズーム 5 が最大(赤道で約 4.9km/画素・北緯 25 度で約 4.5km/画素)で、日本域の範囲外(与那国島の南西など)はこちらで描く(cfg の `zoom` と `tiledir`、URL の `jp` を `fd` に)。
- 雲の高さは 1 層の仮定。赤外(B13 の輝度温度)を使えば目安が付く。
- 稜線は zoom 10 の標高(約 120m/画素)なので、山頂は 50〜130m 低く丸まり、見かけの高度角は山頂そのものより 0.5° ほど低い(槍ヶ岳: 山頂 2.5° に対し稜線 1.6〜1.8°)。zoom 12〜14 の標高タイルにすれば細かくなる(枚数は 16〜256 倍)。
- 雲らしさは色と明るさの簡単な式で、雪や海面の反射を雲と見誤る。

## 出典

- 気象庁ホームページ(ひまわり画像)。利用規約は公共データ利用規約(第1.0版)。加工して使う時は出典と加工の明記。
- 国土地理院 標高タイル(dem_png)。地理院タイルの利用規約(出典の明記)。
