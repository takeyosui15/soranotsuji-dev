# 設計書: 日時情報セクション

対応要件: `requirements/03-datetime.md`

## HTML構造

```
sec-datetime
├── btn-now                     現在日時ボタン
├── 日付行
│   ├── btn-month-prev / btn-month-next    ±1ヶ月
│   ├── btn-date-prev / btn-date-next      ±1日
│   └── date-input                          日付入力（type=date）
├── 時刻行
│   ├── btn-hour-prev / btn-hour-next      ±1時間
│   ├── btn-time-prev / btn-time-next      ±1分
│   └── time-input                          時刻入力（type=time）
├── 速度ボタン行
│   ├── btn-speed-month / btn-speed-day
│   └── btn-speed-hour / btn-speed-min
├── time-slider                  タイムスライダー（0-1439）
├── ショートカット行
│   ├── jump-sunrise / jump-sunset
│   └── jump-moonrise / jump-moonset
└── 月齢行
    ├── btn-moon-prev / btn-moon-next
    ├── moon-age-input
    └── moon-icon
```

---

## 状態管理 (appState)

```javascript
appState.currentDate = new Date()    // 表示中の日時
appState.isMoving    = false         // 自動送り中フラグ
appState.moveSpeed   = null          // 'month' | 'day' | 'hour' | 'min'
appState.moonAge     = 0             // 月齢（計算値、表示用）
appState.timers.move = null          // setInterval ID
```

---

## 関数設計

### 日時変更の共通パターン

すべての日時変更操作は同じパターンに従う:

```
1. uncheckTimeShortcuts()     // ジャンプボタンの選択解除
2. appState.currentDate を変更
3. syncUIFromState()          // UIに反映（入力欄・スライダー）
4. updateAll()                // 天体計算・描画の再実行
```

### 日時操作関数

| 関数 | トリガー | 処理 |
|---|---|---|
| `setNow()` | Nowボタン | `currentDate = new Date()` |
| `addDay(d)` | ◁日/日▷ | `.setDate(getDate() + d)` |
| `addMonth(m)` | ◁月/月▷ | `.setMonth(getMonth() + m)` |
| `addMinute(m)` | ◁分/分▷ | `.setMinutes(getMinutes() + m)` |
| `addHour(h)` | ◁時/時▷ | `.setHours(getHours() + h)` |
| `jumpToEvent(type)` | ショートカット | `currentRiseSetData[type]` の日時をセット |

### UI ↔ State 同期

```
syncStateFromUI()
  ├── date-input の値 → currentDate の年月日
  └── time-input の値 → currentDate の時分

syncUIFromState()
  ├── currentDate → date-input, time-input に反映
  └── currentDate → time-slider に反映（hours×60 + minutes）
```

### タイムスライダー

```
slider.addEventListener('input', () => {
  minutes = slider.value           // 0-1439
  hours = Math.floor(minutes / 60)
  mins  = minutes % 60
  currentDate.setHours(hours, mins, 0, 0)  // 秒・ミリ秒はリセット
  // 日付は変更しない
})
```

### 速度ボタン（Mov機能）

```
toggleSpeed(speed)
  ├── 同じ速度 → stopMove()（停止）
  └── 新しい速度:
      ├── stopMove()（前の自動送りを停止）
      ├── appState.moveSpeed = speed
      ├── appState.isMoving = true
      ├── ボタンにactiveクラス付与
      └── setInterval(200ms):
          speed === 'month' → addMonth(1)
          speed === 'day'   → addDay(1)
          speed === 'hour'  → addHour(1)
          speed === 'min'   → addMinute(1)
```

### 月齢ジャンプ (`addMoonMonth`)

```
addMoonMonth(dir)   // dir = +1（翌月）or -1（前月）
  1. 現在の月相角を取得: Astronomy.MoonPhase()
  2. 概算の目標日: 現在 + dir × 29.53日
  3. 検索開始日: 概算日 - 5日
  4. Astronomy.SearchMoonPhase(currentPhase, searchStart, 10)
     → 同じ月相になる正確な日時を検索
  5. 結果適用（見つからなければ概算日を使用）
```

### 月齢検索 (`searchMoonAge`)

```
searchMoonAge(targetAge)
  1. 現在月齢を計算: (MoonPhase / 360) × 29.53
  2. diff = targetAge - currentAge
  3. diff < 0 → 過去方向の検索開始日（-30日）
  4. targetPhase = (targetAge / 29.53) × 360
  5. SearchMoonPhase(targetPhase, searchStart, 40)
  6. 結果適用
```

---

## 更新トリガーの全体フロー

```
日時変更
  └── updateAll()
      ├── syncStateFromUI()
      ├── updateLocationDisplay()     ← 位置マーカー・ポップアップ更新
      ├── updateCalculation()         ← 全天体の方位角・高度計算
      ├── updateDPLines()             ← 辻ライン再描画
      └── updateTsujiSearchInputs()   ← 辻検索パラメータ更新
```
