# 設計書: My天体セクション

対応要件: `requirements/05-mystar.md`

## HTML構造

```
sec-mystar
├── btn-mystar-reg          登録ボタン
├── input-mystar-radec      赤経,赤緯 入力欄
├── chk-mystar              表示ON/OFFチェックボックス
├── style-MyStar            スタイルインジケーター
├── radec-MyStar            赤経・赤緯表示
├── riseset-MyStar          出時刻・南中時・入時刻表示
└── data-MyStar             方位角・視高度・視半径表示
```

---

## 状態管理 (appState)

```javascript
appState.myStar = { ra: 5.534, dec: -0.299 }  // 赤経(h), 赤緯(°)

// bodiesリスト内のMyStar:
{ id: 'MyStar', name: 'My天体', color: '#DDA0DD',
  isDashed: false, visible: false, isCustom: true }
```

---

## 関数設計

### 登録 (`registerMyStar`)

```
registerMyStar()
  ├── 入力値を取得
  ├── 空 → デフォルト値にリセット（ミンタカ: RA=5.534, Dec=-0.299）
  ├── カンマ区切りでパース → appState.myStar = { ra, dec }
  ├── 形式エラー → alert('形式エラー')
  ├── saveAppState()
  └── updateAll()
```

### UI反映 (`reflectMyStarUI`)

```
reflectMyStarUI()
  ├── appState.bodies から MyStar を検索
  ├── style-MyStar の色を設定
  ├── style-MyStar のクラスを solid/dashed に設定
  └── chk-mystar の checked を同期
```

### 天体計算での扱い

`updateCalculation()` 内:

```
body.id === 'MyStar' の場合:
  ra  = appState.myStar.ra   // ユーザー入力値（固定）
  dec = appState.myStar.dec   // ユーザー入力値（固定）

  // 以降は他の天体と同じフロー:
  Astronomy.Horizon(date, observer, ra, dec, refraction)
  searchStarRiseSet(ra, dec, observer, startOfDay)
  searchStarTransit(ra, dec, observer, startOfDay)
```

### 恒星の出入計算 (`searchStarRiseSet`)

Astronomy Engineの `SearchRiseSet` は恒星に対応していないため、独自実装:

```
searchStarRiseSet(ra, dec, observer, startOfDay)
  for m = 0 to 1440（1分刻み）:
    Astronomy.Horizon() で高度を計算
    前回高度 < 0 && 今回高度 ≥ 0 → 出（rise）
    前回高度 ≥ 0 && 今回高度 < 0 → 入（set）
    getCrossingTime() で線形補間して正確な時刻を算出

searchStarTransit(ra, dec, observer, startOfDay)
  for m = 0 to 1440:
    最大高度の時刻を記録 → 南中時刻
```

### 線形補間 (`getCrossingTime`)

```
getCrossingTime(t1, t2, alt1, alt2)
  ratio = (0 - alt1) / (alt2 - alt1)
  return new Date(t1 + (t2 - t1) × ratio)
```

2つの時刻の間で高度が0°になる正確な瞬間を、直線近似で求める。

---

## isCustomフラグ

`body.isCustom = true` の天体は `renderCelestialList()` でスキップされる。
My天体セクションの専用UIで表示するため、天体リストには重複して表示しない。
