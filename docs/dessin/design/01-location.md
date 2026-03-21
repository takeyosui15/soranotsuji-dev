# 設計書: 位置情報セクション

対応要件: `requirements/01-location.md`

## HTML構造

```
sec-location
├── btn-gps                  GPS取得ボタン
├── radio-start / radio-end  観測点/目的点モード切替
├── input-start-latlng       観測点入力欄（緯度経度 or 地名）
├── btn-reg-start            ホーム登録/呼出ボタン
├── input-start-elev         観測点標高
├── input-end-latlng         目的点入力欄
├── btn-reg-end              推山登録/呼出ボタン
├── input-end-elev           目的点標高
├── btn-dp                   辻ラインON/OFF
├── btn-tsuji-search         辻検索ボタン
└── btn-elevation            標高グラフボタン
```

---

## 状態管理 (appState)

```javascript
appState.start     = { lat, lng, elev }  // 観測点の現在位置
appState.end       = { lat, lng, elev }  // 目的点の現在位置
appState.homeStart = { lat, lng, elev }  // 登録済み観測点（null=未登録）
appState.homeEnd   = { lat, lng, elev }  // 登録済み目的点（null=未登録）
appState.locMode   = 'start' | 'end'    // 地図クリック時のモード
appState.isDPActive          = true      // 辻ライン表示フラグ
appState.isElevationActive   = false     // 標高グラフ表示フラグ
```

---

## 関数設計

### 位置入力フロー

```
handleLocationInput(val, isStart)
  ├── parseInput(val)  →  緯度経度パース成功 → applyLocationCoords()
  └── 地名検索
      ├── toFullWidth(val)  →  半角→全角変換（GSI API対応）
      ├── searchLocation(query)
      │   ├── GSI API: msearch.gsi.go.jp（日本の地名）
      │   └── OSM API: nominatim.openstreetmap.org（フォールバック）
      └── showLocationPicker(results, isStart)  →  候補一覧表示
          └── クリック → applyLocationCoords()

applyLocationCoords(coords, isStart)
  ├── getElevation(lat, lng)  →  標高取得
  ├── appState.start/end を更新
  ├── map.setView()  →  地図移動
  ├── saveAppState()
  └── updateAll()
```

### 地図クリック

```
onMapClick(e)
  ├── appState.locMode で観測点/目的点を判定
  ├── getElevation()  →  標高取得
  ├── appState更新
  ├── saveAppState()
  └── updateAll()
```

### 登録ロジック (`registerLocation`)

```
registerLocation(type)   // type = 'start' | 'end'
  ├── 入力欄が空 → リセット（homeStart/End = null, デフォルト位置に戻す）
  ├── 登録データあり → 呼び出し（homeStart/End を start/end にコピー）
  └── 登録データなし → 新規登録（start/end を homeStart/End にコピー）
```

### 標高取得 (`getElevation`)

```
getElevation(lat, lng)
  for each DEM in [DEM5A, DEM5B, DEM5C, DEM10B]:
    ├── _getTileInfo(lat, lng, zoom)  →  タイル座標計算
    ├── _makeTileUrl()  →  タイルURL生成
    ├── _getTileImageData(url)  →  PNGタイル取得（キャッシュ有）
    └── _elevFromRGB(r, g, b)  →  RGB→標高変換
  └── _getElevationFromOpenMeteo()  →  Open-Meteo APIフォールバック
```

**RGB→標高変換の計算式:**
- `d = R × 2^16 + G × 2^8 + B`
- `h = d < 2^23 ? d : d - 2^24`（符号付き整数変換）
- `h = h × 0.01`（cm → m）
- `R=128, G=0, B=0` は無効値（海域等）

### 辻ライン（DPパス）

```
updateDPLines()
  for each 表示中の天体:
    ├── calculateDPPathPoints(前日)  →  drawDPPath(点線)
    ├── calculateDPPathPoints(当日)  →  drawDPPath(実線+時刻マーカー)
    ├── calculateDPPathPoints(翌日)  →  drawDPPath(点線)
    └── 視半径 > 0.01° の場合:
        ├── drawDPPath(+視半径, 一点鎖線)
        └── drawDPPath(-視半径, 一点鎖線)
```

**DPパス計算 (`calculateDPPathPoints`):**
1. 1分刻みで天体の方位角・高度を計算
2. 高度が下限（地平線低下量+太陽視直径+マージン）以上の時刻を抽出
3. `calculateDistanceForAltitudes()` で天体の視高度から地上距離を逆算
4. 目的点から逆方位に距離分だけ移動した地点を算出
5. その地点が「その天体が山頂と重なって見える場所」

### 地図レイヤー

```
map            → Leaflet Mapインスタンス
linesLayer     → 天体方位線レイヤー（毎回クリア＆再描画）
locationLayer  → 観測点・目的点マーカーレイヤー
dpLayer        → 辻ライン（DPパス）レイヤー
```

---

## 外部API

| API | 用途 | エンドポイント |
|---|---|---|
| 国土地理院 地名検索 | ジオコーディング | `msearch.gsi.go.jp/address-search/AddressSearch` |
| OSM Nominatim | ジオコーディング（フォールバック） | `nominatim.openstreetmap.org/search` |
| 国土地理院 DEM | 標高取得 | `cyberjapandata.gsi.go.jp/xyz/dem*.png` |
| Open-Meteo | 標高取得（フォールバック） | `api.open-meteo.com/v1/elevation` |
| 国土地理院 タイル | 地図表示 | `cyberjapandata.gsi.go.jp/xyz/std,ort,pale` |
| OpenStreetMap | 地図表示 | `tile.openstreetmap.org` |
