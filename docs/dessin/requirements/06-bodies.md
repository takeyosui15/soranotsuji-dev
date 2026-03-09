# 要件定義: 表示天体セクション

セクションID: `sec-bodies`

## 目的

天体ごとの計算データ（方位角・高度・出入時刻等）を表示し、
地図上の方位線の表示・スタイルを管理する。

---

## 対象天体

全13天体を扱う（My天体は別セクションで登録）。

| # | ID | 名称 | 種別 | 初期表示 | 計算方法 |
|---|---|---|---|---|---|
| 1 | Sun | 太陽 | 恒星 | ON | Astronomy Engine動的計算 |
| 2 | Moon | 月 | 衛星 | ON | Astronomy Engine動的計算 |
| 3 | Mercury | 水星 | 惑星 | OFF | Astronomy Engine動的計算 |
| 4 | Venus | 金星 | 惑星 | OFF | Astronomy Engine動的計算 |
| 5 | Mars | 火星 | 惑星 | OFF | Astronomy Engine動的計算 |
| 6 | Jupiter | 木星 | 惑星 | OFF | Astronomy Engine動的計算 |
| 7 | Saturn | 土星 | 惑星 | OFF | Astronomy Engine動的計算 |
| 8 | Uranus | 天王星 | 惑星 | OFF | Astronomy Engine動的計算 |
| 9 | Neptune | 海王星 | 惑星 | OFF | Astronomy Engine動的計算 |
| 10 | Pluto | 冥王星 | 矮小惑星 | OFF | Astronomy Engine動的計算 |
| 11 | Polaris | 北極星 | 恒星 | OFF | 固定RA/Dec |
| 12 | Subaru | すばる | 星団 | OFF | 固定RA/Dec |
| 13 | MyStar | My天体 | ユーザー定義 | OFF | 固定RA/Dec（ユーザー入力） |

---

## 機能一覧

### F6-1: 天体データの表示

各天体について以下のデータを表示する:
- 赤経RA / 赤緯Dec
- 出時刻 / 南中時刻 / 入時刻
- 方位角 / 視高度 / 視半径

### F6-2: 表示ON/OFF

- 天体ごとのチェックボックスで地図上の方位線を表示/非表示にする
- ON/OFF状態はLocalStorageに保存する

### F6-3: 方位線の描画

- 観測点から天体方位に向かって3000kmの直線（等角航路線）を描画する
- 天体が地平線以下の場合は半透明（opacity: 0.3）で描画する
- 線の色・線種（実線/破線）はスタイル設定に従う

### F6-4: スタイル設定（カラーパレット）

- スタイルインジケーターをクリックでカラーパレットを開く
- 12色（赤/桃/橙/黄/黄緑/緑/水/青/藍/紫/薄紫/茶/こげ茶/白/黒）から選択
- 線種は実線/破線の2種
- 「リセット」ボタンで初期スタイルに戻せる
- My天体のスタイル変更時は専用UIにも反映する

### F6-5: 出入時刻の計算

- 太陽系天体: `Astronomy.SearchRiseSet`で計算
- 恒星・My天体: 1分刻みで高度を走査し、地平線との交差点を線形補間で特定
- 南中時刻:
  - 太陽系天体: `Astronomy.SearchHourAngle`で計算
  - 恒星・My天体: 1分刻みで最大高度の時刻を検索
- 終日見えている天体は出入時刻を `00:00` と表示する

### F6-6: 視半径の計算

- 天体の赤道半径（km）と観測距離（AU→km変換）からarctan関数で計算する
- 恒星・My天体の視半径は0として扱う

---

## 保存

- 各天体の表示ON/OFF、色、線種をLocalStorageに保存する
