# 設計書: 薄明セクション

対応要件: `requirements/04-twilight.md`

## HTML構造

```
sec-twilight
├── 夜明グループ
│   ├── jump-astro-dawn    天文薄明[始] → time-astro-dawn
│   ├── jump-naut-dawn     航海薄明[始] → time-naut-dawn
│   ├── jump-yoake         夜明         → time-yoake
│   ├── jump-civil-dawn    常用薄明[始] → time-civil-dawn
│   └── jump-tw-sunrise    日の出       → time-tw-sunrise
│
└── 日暮グループ
    ├── jump-tw-sunset     日の入       → time-tw-sunset
    ├── jump-civil-dusk    常用薄明[終] → time-civil-dusk
    ├── jump-higure        日暮         → time-higure
    ├── jump-naut-dusk     航海薄明[終] → time-naut-dusk
    └── jump-astro-dusk    天文薄明[終] → time-astro-dusk
```

---

## 関数設計

### 薄明時刻の計算 (`updateTwilightData`)

```
updateTwilightData(startOfDay, observer)

  夜明側（ascending = +1 方向）:
    天文薄明[始] = SearchAltitude('Sun', observer, +1, startOfDay, 1, -18)
    航海薄明[始] = SearchAltitude('Sun', observer, +1, startOfDay, 1, -12)
    夜明         = SearchAltitude('Sun', observer, +1, startOfDay, 1, -7.361111)
    常用薄明[始] = SearchAltitude('Sun', observer, +1, startOfDay, 1, -6)
    日の出       = SearchRiseSet('Sun', observer, +1, startOfDay, 1)

  日暮側（descending = -1 方向）:
    日の入       = SearchRiseSet('Sun', observer, -1, startOfDay, 1)
    常用薄明[終] = SearchAltitude('Sun', observer, -1, startOfDay, 1, -6)
    日暮         = SearchAltitude('Sun', observer, -1, startOfDay, 1, -7.361111)
    航海薄明[終] = SearchAltitude('Sun', observer, -1, startOfDay, 1, -12)
    天文薄明[終] = SearchAltitude('Sun', observer, -1, startOfDay, 1, -18)
```

### Astronomy Engine API

| API | 用途 | パラメータ |
|---|---|---|
| `SearchAltitude(body, observer, direction, startDate, limitDays, altitude)` | 太陽が特定高度に達する時刻を検索 | direction: +1=上昇, -1=下降 |
| `SearchRiseSet(body, observer, direction, startDate, limitDays)` | 出没時刻を検索 | 地平線（高度0°）基準 |

### ジャンプの実装

```
各ジャンプボタンのonclick:
  jumpToEvent(type)
  └── currentRiseSetData[type] の日時に移動
      currentRiseSetData は updateTwilightData() で設定される
      各キー: 'astro-dawn', 'naut-dawn', 'yoake', 'civil-dawn',
              'tw-sunrise', 'tw-sunset', 'civil-dusk', 'higure',
              'naut-dusk', 'astro-dusk'
```

### 呼び出し元

```
updateCalculation()
  └── updateTwilightData(startOfDay, observer)
      → 日時変更のたびに全薄明時刻を再計算
```

---

## 夜明・日暮の高度値

```
-7°21'40" = -(7 + 21/60 + 40/3600)° = -7.361111°
```

この値は日本の暦学的定義に基づく。国際的な薄明区分（天文/航海/常用）とは独立した日本固有の概念。

---

## エッジケース

- 白夜・極夜の場合: `SearchAltitude` / `SearchRiseSet` が `null` を返す → `"--:--"` 表示
- 各時刻は同一日内（startOfDay〜翌日）の範囲で検索（limitDays=1）
