# 設計書: 設定セクション

対応要件: `requirements/07-settings.md`

## HTML構造

```
sec-settings
├── chk-refraction          大気差補正ON/OFFチェックボックス
├── input-refraction-k      大気差補正係数K（表示・手動入力）
├── input-meteo-p           気圧 P (hPa)
├── input-meteo-t           気温 T (°C)
├── input-meteo-l           気温減率 Γ (K/m)
├── btn-reset-meteo         気象パラメータリセットボタン
└── btn-reg-settings        登録ボタン
```

---

## 状態管理 (appState)

```javascript
appState.refractionEnabled = false     // 大気差補正ON/OFF
appState.refractionK       = 0.132     // 大気差補正係数（計算値）
appState.meteo = {
  p: 1013.25,   // 気圧 (hPa)
  t: 15.0,      // 気温 (°C)
  l: 0.0065     // 気温減率 (K/m)
}
```

---

## 関数設計

### フォームの有効/無効制御

```
setupUI() 内:
  setRefractionFormEnabled(enabled)
    ├── input-refraction-k の disabled を切替
    ├── input-meteo-p/t/l の disabled を切替
    └── btn-reset-meteo, btn-reg-settings の disabled を切替

  chkRefraction.onChange:
    ├── appState.refractionEnabled = checked
    ├── setRefractionFormEnabled(checked)
    ├── saveAppState()
    └── updateAll()
```

### Kの計算 (`calculateKFromMeteo`)

```
calculateKFromMeteo(p, tCel, l)
  tKelvin = tCel + 273.15
  K = 503 × (p / tKelvin²) × (0.034 - l)
  return K
```

**理論的背景:**
- 大気差（大気屈折）により、天体の見かけの高度が上がる
- K値は光の屈折率と大気の密度分布で決まる
- 標準大気（P=1013.25, T=15, Γ=0.0065）→ K ≒ 0.132

### 登録 (`registerSettings`)

```
registerSettings()
  ├── K入力欄が空 → meteoを標準値にリセット
  ├── 気象パラメータ3値をパース
  ├── NaN → alert('有効な数値を入力してください')
  ├── appState.meteo = { p, t, l }
  ├── K = calculateKFromMeteo(p, t, l)
  ├── appState.refractionK = K
  ├── K表示欄を更新
  ├── alert(`大気差補正係数を ${K} に設定しました`)
  ├── saveAppState()
  └── updateAll()
```

### リセット

```
btnResetMeteo.onclick:
  ├── input-meteo-p = 1013.25
  ├── input-meteo-t = 15.0
  ├── input-meteo-l = 0.0065
  └── input-refraction-k = ''（クリア）
  // meteoのappState更新は「登録」ボタン押下時に行われる
```

---

## Kの使用箇所

### 1. Astronomy Engineの気差オプション

```javascript
// updateCalculation(), searchStarRiseSet() 等
const refr = appState.refractionEnabled ? "normal" : null;
Astronomy.Horizon(date, observer, ra, dec, refr);
```

- `"normal"`: Astronomy Engine内蔵の標準気差補正を適用
- `null`: 補正なし

### 2. 距離計算の等価地球半径

```javascript
// calculateDistanceForAltitudes()
const k = appState.refractionEnabled ? calculateKFromMeteo(...) : 0;
const Reff = R / (1 - k);  // 等価地球半径
```

大気差により光が曲がるため、実効的に地球が大きくなったように見える。
これを等価地球半径として計算に組み込む。

### 3. 視高度計算

```javascript
// calculateApparentAltitude()
const k = appState.refractionEnabled ? calculateKFromMeteo(...) : 0;
const val = (hTarget - hObs) / dist - (dist × (1 - k)) / (2 × R);
return atan(val) × 180 / π;
```

---

## LocalStorage保存

```javascript
// 保存するもの
saved.meteo             = { p, t, l }    // 気象パラメータ
saved.refractionEnabled = true/false     // ON/OFF

// 保存しないもの
// refractionK → meteoから毎回再計算（loadAppState内）
```
