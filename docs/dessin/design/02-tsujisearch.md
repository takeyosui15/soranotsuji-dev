# 設計書: 辻検索セクション

対応要件: `requirements/02-tsujisearch.md`

## HTML構造

```
sec-tsujisearch（パラメータ入力）
├── input-tsuji-az              基準方位角
├── input-tsuji-az-offset       オフセット方位角
├── input-tsuji-az-tolerance    許容範囲方位角
├── input-tsuji-alt             基準視高度
├── input-tsuji-alt-offset      オフセット視高度
├── input-tsuji-alt-tolerance   許容範囲視高度
└── input-tsuji-search-days     検索期間

tsujisearch-panel（結果パネル、オーバーレイ）
├── tsujisearch-header          ヘッダー + ステータス表示
└── tsujisearch-content         結果テーブル
```

---

## 状態管理 (appState)

```javascript
appState.tsujiSearchBaseAz      = 0      // ①基準方位角（自動計算）
appState.tsujiSearchBaseAlt     = 0      // ②基準視高度（自動計算）
appState.tsujiSearchOffsetAz    = 0      // ③オフセット方位角
appState.tsujiSearchOffsetAlt   = 0      // ④オフセット視高度
appState.tsujiSearchToleranceAz = 15     // ⑤許容範囲方位角
appState.tsujiSearchToleranceAlt = 2.5   // ⑥許容範囲視高度
appState.tsujiSearchDays        = 365    // 検索期間
appState.isTsujiSearchActive    = false  // 検索パネル表示フラグ
appState.tsujiSearchGeneration  = 0      // 中断制御用カウンター
appState._lastTsujiPosKey       = null   // 位置変更検知用（内部）
```

---

## 関数設計

### 検索パラメータの自動更新

```
updateTsujiSearchInputs()
  ├── posKey = start + end の連結文字列
  ├── 前回と同じ → return（ユーザー手動入力を保護）
  ├── calculateBearing()  →  方位角算出 → tsujiSearchBaseAz
  ├── calculateApparentAltitude()  →  視高度算出 → tsujiSearchBaseAlt
  └── DOM更新 + saveAppState()
```

### 検索トグル

```
toggleTsujiSearch()
  ├── ON: パネル表示 → startTsujiSearch()
  └── OFF: パネル非表示 → generation++ で検索中断
```

### 検索コアロジック (`startTsujiSearch`)

```
startTsujiSearch()
  ├── generation をインクリメント（中断制御）
  ├── 検索中心を計算:
  │   targetAz  = baseAz + offsetAz（mod 360）
  │   targetAlt = baseAlt + offsetAlt
  │
  ├── for each 表示中の天体:
  │   for each day in searchDays:
  │     for each minute in 0..1439:
  │       ├── 天体の赤経/赤緯を取得
  │       ├── Astronomy.Horizon() で方位角・高度を計算
  │       ├── isAzimuthInRange() で方位角判定
  │       ├── |altitude - targetAlt| ≤ tolerance で高度判定
  │       └── 両方合致 → 中心からの角距離を計算、ベストマッチを記録
  │     7日ごとに await（UI応答性確保）
  │
  └── 結果テーブル生成
```

### 方位角の範囲判定

```
isAzimuthInRange(az, targetAz, tolerance)
  diff = ((az - targetAz + 540) % 360) - 180  // -180〜+180に正規化
  return |diff| ≤ tolerance
```

**0°/360°をまたぐ例:**
- target=355°, tolerance=15° → 340°〜10°
- az=5° → diff = ((5-355+540)%360)-180 = (190%360)-180 = 10 → |10| ≤ 15 → true

### 判定ロジック

```
◎: |azDiff| ≤ 視半径 AND |altDiff| ≤ 視半径
○: |azDiff| ≤ 視半径×4 AND |altDiff| ≤ 視半径×4
△: 範囲内だが上記に該当しない
```

### 結果テーブル

```
結果行 = { time, azimuth, altitude, dist, bodyId, bodyName, bodyColor, moonAge, moonIcon, grade }

テーブルカラム:
  天体 | 日付 | 時刻 | 月齢 | 方位角 | 視高度 | 判定

ソート: setupTableSort() でヘッダークリック時にソート
行クリック: appState.currentDate を設定 → syncUIFromState() → updateAll()
```

---

## パフォーマンス設計

- 7日ごとに `await new Promise(r => setTimeout(r, 0))` でUIスレッドを解放する
- `generation` カウンターで検索の中断を制御（新検索開始時に旧検索を即停止）
- 天体1つあたり最大1461件で打ち切り（メモリ保護）

---

## パネル配置

```
syncBottomPanels()
  辻検索 + 標高グラフ 同時表示時:
    tsujisearch-panel に .with-elevation クラスを付与
    → CSSでパネル高さを調整
```
