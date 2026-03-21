# 設計書: 表示天体セクション

対応要件: `requirements/06-bodies.md`

## HTML構造

```
sec-bodies
└── celestial-list            動的生成リスト（ul）
    └── li（天体ごと）
        ├── body-checkbox     表示ON/OFF
        ├── style-indicator   色・線種インジケーター（クリックでパレット）
        └── body-info
            ├── body-name     天体名
            ├── radec-{id}    赤経 / 赤緯
            ├── riseset-{id}  出時刻 / 南中時 / 入時刻
            └── data-{id}     方位角 / 視高度 / 視半径

style-palette（オーバーレイ）
├── palette-colors            色選択グリッド
└── palette-lines             線種選択（実線/破線）
```

---

## 状態管理 (appState)

```javascript
appState.bodies = [
  { id: 'Sun', name: '太陽', color: '#FF0000',
    isDashed: false, visible: true },
  { id: 'Moon', name: '月', color: '#FFFF00',
    isDashed: false, visible: true },
  // ... 全13天体
]
```

---

## 関数設計

### リスト描画 (`renderCelestialList`)

```
renderCelestialList()
  for each body in appState.bodies:
    if body.isCustom → skip（My天体は専用UIで表示）
    li要素を生成:
      ├── checkbox → toggleVisibility(id, checked)
      ├── style-indicator → openPalette(id)（色と線種の表示+クリックイベント）
      └── body-info
          ├── body-name: **天体名**(太字) + (ID: xxx)(グレー色)
          └── id属性付きspan 3つ（赤経赤緯・出入南中・方位角高度）
```

### 天体計算 (`updateCalculation`)

```
updateCalculation()
  observer = new Astronomy.Observer(lat, lng, elev)

  for each body:
    1. 赤経/赤緯の取得:
       Polaris  → 固定値 (RA=2.5303, Dec=89.2641)
       Merak    → 固定値 (RA=11.0307, Dec=56.3824)
       Mintaka  → 固定値 (RA=5.534, Dec=-0.299)
       Subaru   → 固定値 (RA=3.79, Dec=24.12)
       MyStar   → appState.myStar
       その他   → Astronomy.Equator(body.id, date, observer, true, true)

    2. 地平座標の計算:
       Astronomy.Horizon(date, observer, ra, dec, refraction)

    3. 出入・南中時刻:
       太陽系天体 → Astronomy.SearchRiseSet / SearchHourAngle
       恒星      → searchStarRiseSet / searchStarTransit（1分刻み走査）

    4. 視半径:
       getBodyAngularRadius(bodyId, date, observer)
       = arctan(赤道半径km / 距離km) × 180/π

    5. DOM更新:
       radec-{id}   ← 赤経 / 赤緯
       riseset-{id} ← 出時刻 / 南中時 / 入時刻
       data-{id}    ← 方位角 / 視高度 / 視半径

    6. 方位線描画（visible時のみ）:
       drawDirectionLine(lat, lng, azimuth, altitude, body)
```

### 方位線描画 (`drawDirectionLine`)

```
drawDirectionLine(lat, lng, azimuth, altitude, body)
  end = getDestinationRhumb(lat, lng, azimuth, 3000000)  // 3000km先
  opacity = altitude < 0 ? 0.3 : 1.0   // 地平線以下は半透明
  dashArray = body.isDashed ? '10, 10' : null
  L.polyline([[lat,lng], [end.lat,end.lng]], options).addTo(linesLayer)
```

**等角航路線（Rhumb Line）を使う理由:**
大圏線（Great Circle）だと地図上で曲がって見える。
等角航路線なら「指定した方位に真っ直ぐ」引ける。

### スタイルパレット

```
openPalette(id)
  ├── editingBodyId = id
  ├── COLOR_MAP（14色）から色ボタンを生成
  └── パレットを表示

applyColor(code)
  ├── body.color = code
  ├── MyStar の場合 → reflectMyStarUI()
  ├── closePalette()
  └── saveAppState() + renderCelestialList() + updateAll()

applyLineStyle(type)
  ├── body.isDashed = (type === 'dashed')
  └── 同上

resetBodyStyle()
  ├── DEFAULT_BODIES から初期色・線種を復元
  └── 同上
```

### 表示切替 (`toggleVisibility`)

```
toggleVisibility(id, checked)
  body.visible = checked
  saveAppState()
  updateAll()  // 方位線・辻ラインの表示/非表示が即座に反映
```

---

## 天体の赤道半径（視半径計算用）

```javascript
BODY_RADIUS_KM = {
  Sun: 695700, Moon: 1737.4,
  Mercury: 2439.7, Venus: 6051.8, Mars: 3396.2,
  Jupiter: 71492, Saturn: 60268, Uranus: 25559, Neptune: 24764
}
KM_PER_AU = 149597870.7
```

Pluto、Polaris、Subaru、MyStar は `BODY_RADIUS_KM` に未登録 → 視半径 = 0。
