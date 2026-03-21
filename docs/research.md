# 調査記録

プロジェクトの現状を観察し、知見を記録するドキュメントです。

---

## 調査1: Leafletマーカーの活用（2026-03-10）

### 知りたいこと
地図上に複数のマーカーを配置して、タップで観測点や目的点に設定しやすくできるか。
- マーカーアイコンの色を変えて表示できるか
- ポップアップに観測点/目的点の識別情報を表示し、プログラムから識別できるか
- 同じ位置にマーカーを重ねられるか、重なった場合の表示順序はどうなるか
- ポップアップをクリックして、そこにマーカーを重ね合わせるロジックを組めるか

### 結果

#### マーカーアイコンの色変更 — 可能（3つの方法）

**方法A: `L.DivIcon` + CSS（推奨 — 外部依存なし）**
```js
var redDivIcon = L.divIcon({
  className: 'custom-marker-red',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -8]
});
L.marker([35.36, 138.73], {icon: redDivIcon}).addTo(map);
```
```css
.custom-marker-red {
  background-color: red;
  border: 2px solid darkred;
  border-radius: 50%;
  width: 12px;
  height: 12px;
}
```

**方法B: インラインSVG `L.DivIcon`（任意の色をプログラムで指定）**
```js
function coloredSvgIcon(color) {
  return L.divIcon({
    className: '',
    html: '<svg width="25" height="41" viewBox="0 0 25 41">' +
          '<path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="' + color + '" stroke="#333" stroke-width="1"/>' +
          '<circle cx="12.5" cy="12.5" r="5" fill="white"/></svg>',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });
}
L.marker([35.36, 138.73], {icon: coloredSvgIcon('#e74c3c')}).addTo(map);
```

**方法C: leaflet-color-markers（外部画像）**
```js
var redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], shadowSize: [41, 41],
  iconAnchor: [12, 41], popupAnchor: [1, -34]
});
```

#### ポップアップからの識別 — カスタムプロパティが最適

HTML解析ではなく、`marker.options` にカスタムプロパティを持たせる方法を推奨:
```js
var marker = L.marker([35.36, 138.73]).addTo(map);
marker.options.markerType = 'observation';  // 'observation' or 'target'
marker.options.pointName = '東京タワー';

// ポップアップにはHTMLを自由に設定
marker.bindPopup(
  '<b>観測点</b><br>東京タワー<br>緯度: 35.6586<br>経度: 139.7455<br>標高: 150.0m'
);

// 識別時
if (marker.options.markerType === 'observation') {
  // 観測点として処理
}
```

#### 同じ位置へのマーカー重ね — 可能

- 複数マーカーを同一座標に配置可能
- **後から追加したマーカーが前面に表示される**（DOM順序による）
- `zIndexOffset` で明示的に制御可能:
```js
var markerA = L.marker([35.36, 138.73], {zIndexOffset: 0}).addTo(map);
var markerB = L.marker([35.36, 138.73], {zIndexOffset: 1000}).addTo(map);
// markerB が前面
```
- カスタムペインで完全制御も可能:
```js
var topPane = map.createPane('topMarkers');
topPane.style.zIndex = 650;  // デフォルトmarkerPaneは600
L.marker([35.36, 138.73], {pane: 'topMarkers'}).addTo(map);
```

#### ポップアップ内クリックでマーカー配置 — 可能

DOM要素を直接 `bindPopup` に渡す方法が最も確実:
```js
function createPopupWithAction(marker, map) {
  var container = document.createElement('div');
  var title = document.createElement('b');
  title.textContent = '富士山';
  container.appendChild(title);
  container.appendChild(document.createElement('br'));

  var btn = document.createElement('button');
  btn.textContent = 'ここに観測点を設定';
  btn.addEventListener('click', function() {
    var latlng = marker.getLatLng();
    // 観測点マーカーを重ね合わせ
    L.marker([latlng.lat, latlng.lng], {icon: redIcon}).addTo(map);
    map.closePopup();
  });
  container.appendChild(btn);
  marker.bindPopup(container);
}
```

### まとめ
Leafletのマーカーは色変更、重ね合わせ、ポップアップ内操作のすべてに対応しており、
My観測点機能の実装に必要な要件は満たせる。
`L.DivIcon` + SVG方式が、外部依存なしで最も柔軟。

---

## 調査2: URLクエリストリングによる画面制御（2026-03-10）

### 知りたいこと
URLのクエリストリングで宙の辻の画面を開いたり、My観測点を追加したりできるか。
- `soranotsuji.net/?mode=soranotsuji&action=refer` のようにindex.htmlを書かなくても動作するか
- 例: `https://soranotsuji.net/?mode=soranotsuji&action=refer&obsvLat=35.774054&obsvLng=139.446201&obsvH=150&trgtLat=35.774054&trgtLng=139.446201&trgtH=150&datetime=now`

### 結果

#### index.html省略 — 問題なし

GitHub Pagesはルートパス `/` に対して `index.html` を自動で返す。
以下は同等:
```
https://soranotsuji.net/index.html?mode=soranotsuji&action=refer
https://soranotsuji.net/?mode=soranotsuji&action=refer
```
クエリストリングはクライアント側で処理されるため、サーバー設定は不要。

#### パラメータ読み取り — `URLSearchParams` を使用

```js
function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) return false;

  const mode = params.get('mode');
  const action = params.get('action');
  if (mode !== 'soranotsuji' || action !== 'refer') return false;

  // 数値パラメータの安全な読み取り
  const obsvLat = parseFloatSafe(params.get('obsvLat'), -90, 90);
  const obsvLng = parseFloatSafe(params.get('obsvLng'), -180, 180);
  const obsvH   = parseFloatSafe(params.get('obsvH'), 0, 10000);
  const trgtLat = parseFloatSafe(params.get('trgtLat'), -90, 90);
  const trgtLng = parseFloatSafe(params.get('trgtLng'), -180, 180);
  const trgtH   = parseFloatSafe(params.get('trgtH'), 0, 10000);

  if (obsvLat === null || obsvLng === null) return false;

  // appStateに反映
  appState.start = { lat: obsvLat, lng: obsvLng, elev: obsvH ?? 0 };
  if (trgtLat !== null && trgtLng !== null) {
    appState.end = { lat: trgtLat, lng: trgtLng, elev: trgtH ?? 0 };
  }

  // datetime処理
  const dt = params.get('datetime');
  if (dt && dt !== 'now') {
    const parsed = new Date(dt);
    if (!isNaN(parsed.getTime())) appState.currentDate = parsed;
  }
  return true;
}

function parseFloatSafe(str, min, max) {
  if (str === null || str === '') return null;
  const num = parseFloat(str);
  if (isNaN(num) || !isFinite(num)) return null;
  if (num < min || num > max) return null;
  return num;
}
```

#### 共有URL生成

```js
function generateShareURL() {
  const params = new URLSearchParams();
  params.set('mode', 'soranotsuji');
  params.set('action', 'refer');
  params.set('obsvLat', appState.start.lat.toFixed(6));
  params.set('obsvLng', appState.start.lng.toFixed(6));
  params.set('obsvH', Math.round(appState.start.elev).toString());
  params.set('trgtLat', appState.end.lat.toFixed(6));
  params.set('trgtLng', appState.end.lng.toFixed(6));
  params.set('trgtH', Math.round(appState.end.elev).toString());
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
```

#### ベストプラクティス
- パラメータ名はcamelCase（`obsvLat` 等 — appStateと一貫性を保つ）
- `URLSearchParams` を使い、手動文字列結合は避ける
- すべてのパラメータは外部入力として扱い、`parseFloatSafe` で範囲チェック
- DOM挿入時は既存の `escapeHtml()` を使用
- 読み込み後、`history.replaceState({}, '', window.location.pathname)` でURLをクリーンにする（任意）

### まとめ
URLクエリストリングによる画面制御は、GitHub Pagesでそのまま動作する。
`URLSearchParams` APIで安全にパラメータを読み書きでき、共有URLの生成も容易。

---

## 調査3: QRコード生成（2026-03-10）

### 知りたいこと
JavaScriptのCDNかライブラリで、URLをQRコードのPNG画像に変換してくれるものはあるか。

### 結果

#### ライブラリ比較

| ライブラリ | サイズ | カスタマイズ性 | PNG対応 | メンテナンス |
|---|---|---|---|---|
| **qrcodejs** (davidshimjs) | ~17KB | 低（基本色のみ） | Canvas経由で可能 | アーカイブ済だが安定 |
| **qrcode-generator** (kazuhikoarase) | ~25KB | 中 | Canvas/SVG対応 | アクティブ |
| **qr-code-styling** | ~50KB | 高（ロゴ、丸ドット、グラデーション） | 組み込みAPI | アクティブ |

#### 推奨: qrcodejs（最軽量、依存なし）

```html
<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
```

```js
// QRコード生成
const qr = new QRCode(document.getElementById("qrcode"), {
  text: "https://soranotsuji.net/?mode=soranotsuji&action=refer&obsvLat=35.36&obsvLng=138.73",
  width: 256,
  height: 256,
  colorDark: "#000000",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.M
});

// PNGダウンロード
document.getElementById("downloadQR").addEventListener("click", function() {
  const canvas = document.querySelector("#qrcode canvas");
  const link = document.createElement("a");
  link.download = "soranotsuji_qr.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
```

### まとめ
qrcodejs（~17KB）がプロジェクトに最適。CDN1行の追加でQRコード生成・PNGダウンロードが実現可能。
---
## 調査3−1: qr-code-stylingについて質問（2026-03-10）

### 知りたいこと
カスタマイズ性で
> 高（ロゴ、丸ドット、グラデーション）
とあるが、丸ドットではなくて、標準の角ドットにできるのかどか。
また、
> 組み込みAPI
ならライブラリのインポートなどは不要なのかどうか。

### 結果

#### 角ドット（標準の四角形）— 対応

`dotsOptions.type` で形状を指定でき、`"square"` が標準の角ドット。

**利用可能なドットスタイル一覧:**

| type値 | 形状 |
|---|---|
| `square` | 標準の四角形（角ドット） |
| `dots` | 円形（丸ドット） |
| `rounded` | 角丸四角形 |
| `classy` | クラシック |
| `classy-rounded` | クラシック角丸 |
| `extra-rounded` | 極丸 |

角の外枠（`cornersSquareOptions.type`）と角の内側ドット（`cornersDotOptions.type`）も個別に指定可能。

```js
const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  data: "https://soranotsuji.net/?mode=soranotsuji&action=refer",
  dotsOptions: {
    type: "square",           // 角ドット（標準の四角形）
    color: "#000000"
  },
  cornersSquareOptions: {
    type: "square"            // 角の外枠も四角形
  },
  cornersDotOptions: {
    type: "square"            // 角の内側ドットも四角形
  }
});
```

#### 「組み込みAPI」の意味 — ライブラリの読み込みは必要

「組み込みAPI」とは、**ライブラリ自体にPNG出力機能が内蔵されている**という意味。
ライブラリ（CDNまたはnpm）の読み込みは**必要**。
ただし、PNG出力のために html2canvas 等の**追加ライブラリは不要**という点がメリット。

```html
<!-- CDN読み込みは必要 -->
<script src="https://unpkg.com/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js"></script>
```

**PNG出力の方法:**

```js
// 方法1: ファイルダウンロード
qrCode.download({ name: "soranotsuji_qr", extension: "png" });

// 方法2: Blobとして取得（プログラム的に利用）
const blob = await qrCode.getRawData("png");
const url = URL.createObjectURL(blob);
```

対応フォーマット: `"png"`, `"jpeg"`, `"webp"`, `"svg"`

#### qrcodejs との比較（再整理）

| 観点 | qrcodejs | qr-code-styling |
|---|---|---|
| CDNサイズ | ~17KB | ~50KB |
| ドット形状 | 角ドットのみ | 6種類から選択可 |
| PNG出力 | Canvas経由で手動実装 | `.download()` / `.getRawData()` で直接可能 |
| ロゴ埋め込み | 非対応 | 対応 |
| 追加依存 | なし | なし |

### まとめ
qr-code-styling は `dotsOptions.type: "square"` で標準の角ドットに対応。
ライブラリの読み込み（CDN 1行）は必要だが、PNG出力に追加ライブラリは不要。
サイズが ~50KB と qrcodejs の約3倍だが、ドット形状選択やPNG出力APIの利便性が高い。
プロジェクトの要件（角ドット、PNG出力）には qrcodejs で十分だが、将来のカスタマイズ性を考慮するなら qr-code-styling も選択肢。

---

## 調査4: クリップボードへのコピー（2026-03-10）

### 知りたいこと
JavaScriptでブラウザからスマホのクリップボードにコピーできるか。別アプリ（Excelなど）に貼り付けできるか。

### 結果

#### ブラウザ対応状況

| ブラウザ | `navigator.clipboard.writeText()` | 備考 |
|---|---|---|
| iOS Safari 13.4+ | 対応 | ユーザー操作（タップ）が必要 |
| Android Chrome 66+ | 対応 | HTTPS必須 + ユーザー操作必要 |
| Desktop Chrome 66+ | 対応 | HTTPS必須 |
| Desktop Firefox 63+ | 対応 | HTTPS必須 |
| Desktop Safari 13.1+ | 対応 | ユーザー操作必要 |

#### 要件
- **HTTPS必須**（GitHub Pages = HTTPSなので問題なし）
- **ユーザー操作起点**（click/tapイベント内で呼ぶ必要あり）
- **別アプリへの貼り付け** — OS標準のクリップボードに入るため、Excel、LINE、メモ帳等どこにでも貼り付け可能

#### 実装例（フォールバック付き）

```js
async function copyToClipboard(text) {
  // モダンAPI
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("Clipboard API failed:", err);
    }
  }
  // フォールバック（古いブラウザ・HTTP環境向け）
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    return false;
  }
}

// 使用例
document.getElementById("copyBtn").addEventListener("click", async function() {
  const url = generateShareURL();
  const success = await copyToClipboard(url);
  if (success) {
    this.textContent = "コピーしました!";
    setTimeout(() => { this.textContent = "URLをコピー"; }, 2000);
  } else {
    prompt("以下のURLをコピーしてください:", url);
  }
});
```

### まとめ
Clipboard APIは主要ブラウザ（iOS/Android含む）で対応済み。
GitHub Pages（HTTPS）なので問題なく動作し、コピーした内容はExcel等の他アプリに貼り付け可能。

---

## 調査5: CSV出力の文字コード・改行コード（2026-03-10）

### 知りたいこと
ブラウザから宙の辻の項目をCSVファイルに出力する場合、Windows/Mac/Android/iPhoneで互換性のある文字コードと改行コードは何か。

### 結果

#### 最適な組み合わせ: UTF-8 BOM付き + CRLF

| アプリ | UTF-8 BOMなし | UTF-8 BOM付き | CRLF | LF |
|---|---|---|---|---|
| Excel (Windows) | 日本語文字化け | OK | OK | OK |
| Excel (Mac) | OK（最近のバージョン） | OK | OK | OK |
| Numbers (Mac/iPhone) | OK | OK | OK | OK |
| Google Sheets | OK | OK | OK | OK |
| LibreOffice | エンコード選択ダイアログ表示 | OK | OK | OK |

**UTF-8 BOM付きが唯一、全環境でユーザー操作なしに正しく開ける。**
BOMが不要なアプリ（Numbers、Google Sheets）はBOMを無視するので害はない。

#### 実装例

```js
function downloadCSV(filename, rows) {
  const csvContent = rows.map(row =>
    row.map(cell => {
      const str = String(cell ?? '');
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',')
  ).join('\r\n');  // CRLF

  // UTF-8 BOM + CSV
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 使用例
downloadCSV('tsuji_results.csv', [
  ['日時', '天体', '方位角', '視高度', '評価'],
  ['2026-03-15 06:12', '太陽', '92.5', '0.0', '◎'],
]);
```

**技術メモ**: JavaScriptの `'\uFEFF'`（U+FEFF）は、`Blob` がUTF-8エンコードする際に3バイト `EF BB BF`（UTF-8 BOM）に変換される。

### まとめ
**UTF-8 BOM付き + CRLF** が全プラットフォームで文字化けなく動作する唯一の組み合わせ。
`'\uFEFF'` を先頭に付けるだけで実現でき、実装も簡単。

---

## 調査6: JSON形式でのバックアップ・インポート（2026-03-10）

### 知りたいこと
宙の辻の項目内容（表示天体やMy観測点など）をバックアップしてインポートしたい。
JSON形式が良いと思うが、どのクライアントのアプリでも編集できるか。

### 結果

#### JSON形式の適性 — 最適

- JavaScriptネイティブ（`JSON.stringify()` / `JSON.parse()` — 依存ライブラリ不要）
- 人間が読める・編集可能
- 数値・真偽値・文字列・配列・オブジェクトの型を保持
- 設定データなら数KB程度で軽量

#### 各プラットフォームでの編集可否

| プラットフォーム | エディタ | JSON対応 |
|---|---|---|
| Windows | メモ帳 (Win 11+) | OK（UTF-8ネイティブ対応） |
| Windows | メモ帳 (旧版) | BOM付きならOK |
| Mac | TextEdit | OK（プレーンテキストモード） |
| Android | 各種ファイルマネージャ、コードエディタ | OK |
| iPhone/iPad | ファイルアプリ（閲覧のみ）、各種エディタ | OK |

#### エクスポート実装例

```js
function exportSettings() {
  const exportData = {
    version: '1.17.0',
    exportedAt: new Date().toISOString(),
    appState: {
      start: appState.start,
      end: appState.end,
      homeStart: appState.homeStart,
      homeEnd: appState.homeEnd,
      myStar: appState.myStar,
      refractionEnabled: appState.refractionEnabled,
      meteo: appState.meteo,
      bodies: appState.bodies,
      tsujiSearchDays: appState.tsujiSearchDays,
      tsujiSearchOffsetAz: appState.tsujiSearchOffsetAz,
      tsujiSearchOffsetAlt: appState.tsujiSearchOffsetAlt,
      tsujiSearchToleranceAz: appState.tsujiSearchToleranceAz,
      tsujiSearchToleranceAlt: appState.tsujiSearchToleranceAlt,
    }
  };

  const json = JSON.stringify(exportData, null, 2);  // 整形出力
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'soranotsuji_backup_' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

#### インポート実装例

```html
<input type="file" id="importFile" accept=".json">
```

```js
document.getElementById('importFile').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 1024 * 1024) {
    alert('ファイルサイズが大きすぎます（上限: 1MB）');
    this.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importData = JSON.parse(e.target.result);

      if (!importData.version || !importData.appState) {
        throw new Error('無効なバックアップファイルです');
      }

      const state = importData.appState;
      // 各プロパティを型チェック付きで復元
      if (state.start) appState.start = state.start;
      if (state.end) appState.end = state.end;
      if (state.myStar) appState.myStar = state.myStar;
      if (Array.isArray(state.bodies)) appState.bodies = state.bodies;
      // ... 他のプロパティも同様

      saveAppState();
      updateAll();
      alert('設定を復元しました');
    } catch (err) {
      alert('ファイルの読み込みに失敗しました: ' + err.message);
    }
    event.target.value = '';
  };
  reader.readAsText(file, 'UTF-8');
});
```

#### 注意点
- **version フィールド必須** — 将来のデータ構造変更時にマイグレーション可能にする
- **ホワイトリスト方式** — `Object.assign` で丸ごと上書きせず、許可するプロパティのみ復元
- **Date オブジェクト** — JSONでは文字列になるため、インポート時に `new Date()` で再構築が必要
- **非シリアライズ項目** — Leafletマップインスタンス等のDOM参照はエクスポート対象から除外
- **iOS Safari** — `a.click()` によるダウンロードはiOS 13+で動作

### まとめ
JSON形式はバックアップ・インポートに最適。全プラットフォームで閲覧・編集可能。
`version` フィールドを含めることで、将来のデータ構造変更にも対応できる。

## 調査7: 天体検索用JSONファイルDB（2026-03-10）

### 知りたいこと
今後の機能追加で、My天体を1件ではなくて、表示天体リストの中に複数件追加をできるように修正していこうと思っています。
そこで、天体検索メニューを作ろうと思っています。
空の辻は、ダイヤモンド富士やパール富士の写真撮影の時の補助ツールとして利用されるので、目視可能な範囲の天体のリストを作成しようと思っています。
海外の天体検察サイトなどをClaudeさんが利用して、SIMBAD天文データベースから条件に合致する天体データを一括取得し、指定されたフォーマットで作れますでしょうか。
大体何件のDBになったかも知りたいです。
ちなみに、宙の辻から実行するとなると、一旦クライアントにそのファイルを完全ダウンロードしてからになるのでしょうか。

【目的】
天体位置計算アプリの検索用元データベースを作成する。

【取得対象の天体】
1. 視等級（V等級）が 6.0 以下（6.0より明るい星）のすべての天体（主に恒星）
2. 著名な星雲・星団・銀河（メシエカタログ M1〜M110 を含むこと）
3. 名前の付いている〇〇座の星は全て網羅されていること。

【出力フォーマット】
以下のヘッダーを持つJSON形式で出力してください。
`天体名(日本語), 赤経(J2000), 赤緯(J2000), 視等級, 天体種別, 検索キー(日本語), 検索キー(英語)`

【データ処理の要件】
* **データ取得方法**: `astroquery.simbad` の `Simbad` クラス、または TAPクエリ (`Simbad.query_tap`) を使用し、SIMBADサーバーに過度な負荷をかけないようバルク処理で取得すること。
* **座標フォーマット**: 赤経赤緯は、現行のAstromy Engineを調査し、それで扱いやすい形式で、高い精度で、統一をすること。現行の宙の辻の北極星、北斗七星ミンタカ、すばる、もそうなっていなかったら、データの精度も合わせること。
* **日本語名と検索キーの生成**: 
    * SIMBADの標準出力は英語/カタログ名（例: *bet Ori*, *M 42*）であるため、有名な天体（1等星、主要な恒星、メシエ天体）については、日本語名（例: ベテルギウス、オリオン大星雲）と検索キー（例: "オリオン座, 冬の大三角"）を補完するマッピング処理を実装すること。
    * 日本語名が定義できないマイナーな6等星については、バイエル符号やHD星表番号などを「天体名」とし、検索キーには属する星座名（英語/日本語）を含めること。
* **天体種別**: SIMBADの `otype` を元に、「恒星」「星団」「星雲」「銀河」などを分かりやすく分類すること。

【成果物】
1.  生成されたJSONファイル

### 結果

#### 実現可能性 — 可能（ただし段階的なアプローチを推奨）

SIMBADからのデータ取得は技術的に可能だが、この環境からはSIMBADサーバーへの直接アクセスがネットワーク制限で不可のため、
**Pythonスクリプトをローカル環境で実行する方式**を推奨する。

#### 想定レコード件数

| カテゴリ | 件数（概算） | 備考 |
|---|---|---|
| V等級 ≤ 6.0 の恒星 | ~5,000〜5,900件 | 肉眼限界等級の全天恒星 |
| メシエ天体（M1〜M110） | 110件 | 星雲・星団・銀河 |
| 名前付き星座の星（重複含む） | 上記に概ね含まれる | バイエル符号付きの星はほぼ6等以内 |
| **合計（重複除去後）** | **約5,100〜6,000件** | |

**等級ごとの内訳（参考）:**

| 等級 | 累計件数 |
|---|---|
| ≤ 1.0 | ~22 |
| ≤ 2.0 | ~71 |
| ≤ 3.0 | ~190 |
| ≤ 4.0 | ~610 |
| ≤ 5.0 | ~1,929 |
| ≤ 6.0 | ~5,000〜5,900 |

#### JSONファイルのサイズ見積もり

```json
{
  "name": "シリウス",
  "ra": 6.7524,
  "dec": -16.7161,
  "mag": -1.46,
  "type": "恒星",
  "keysJa": "おおいぬ座, 冬の大三角, α CMa",
  "keysEn": "Sirius, Alpha Canis Majoris, HIP 32349"
}
```

| 形式 | サイズ | 備考 |
|---|---|---|
| 整形JSON（pretty-print） | ~1.5 MB | 開発・確認用 |
| 圧縮JSON（minified） | ~1.0 MB | 本番配信用 |
| gzip圧縮 | ~200〜400 KB | HTTP転送時（自動適用） |

**結論: 静的Webアプリで十分扱えるサイズ。**

#### クライアントへのダウンロード — はい、完全ダウンロードが必要

静的Webアプリではサーバー側での絞り込み（SQLクエリ等）はできないため、
JSONファイル全体をクライアントにダウンロードしてから、JavaScript側で検索・フィルタリングする。

**実装パターン:**

```js
// 方法1: fetch で非同期読み込み（推奨）
let starDB = null;

async function loadStarDB() {
  if (starDB) return starDB;  // キャッシュ済みなら再利用
  const res = await fetch('data/stars.json');
  starDB = await res.json();
  return starDB;
}

// 検索時に呼び出し
async function searchStar(keyword) {
  const db = await loadStarDB();
  return db.filter(star =>
    star.name.includes(keyword) ||
    star.keysJa.includes(keyword) ||
    star.keysEn.toLowerCase().includes(keyword.toLowerCase())
  );
}
```

```js
// 方法2: <script> タグで同期読み込み（muni.js と同じパターン）
// stars.js: var STAR_DB = [ {...}, {...}, ... ];
```

**パフォーマンス考慮:**
- ~1 MB のJSONは初回読み込みに 0.5〜2秒（通信環境依存）
- ブラウザキャッシュにより2回目以降は即座にロード
- 5,000件の `Array.filter()` は ~1ms で完了（パフォーマンス問題なし）
- 遅延読み込み（検索メニューを開いた時に初めてfetch）にすれば、初期表示に影響なし

#### Astronomy Engineの座標フォーマット

現行の `script.js` で使用している形式:

| 項目 | 形式 | 例 |
|---|---|---|
| **赤経（RA）** | 10進数 **時**（0〜24） | `6.7524` (= 6h 45m 08.9s) |
| **赤緯（Dec）** | 10進数 **度**（-90〜+90） | `-16.7161` |
| **座標系** | J2000.0 | Astronomy Engine標準 |

`Astronomy.Horizon(date, observer, ra, dec, refraction)` に直接渡す形式。

#### 現行の恒星データの精度問題

| 恒星 | 現行RA | 現行Dec | 精度 | SIMBAD正確値（RA） | SIMBAD正確値（Dec） |
|---|---|---|---|---|---|
| 北極星（Polaris） | 2.5303 | 89.2641 | 4桁 | 2.5302 | 89.2641 |
| メラク（Merak） | 11.0307 | 56.3824 | 4桁 | 11.0306 | 56.3824 |
| ミンタカ（Mintaka） | 5.534 | -0.299 | **3桁** | 5.5336 | -0.2991 |
| すばる（Subaru） | 3.79 | 24.12 | **2桁** | 3.7903 | 24.1052 |

**問題点:** ミンタカとすばるは精度が低い（2〜3桁）。
JSONデータベースでは **小数点以下4桁**（角度で約0.36秒角）に統一すべき。
既存の4恒星もデータベースの値に合わせて更新することを推奨。

#### SIMBADからのデータ生成方法

この環境からはSIMBADサーバーへのアクセスがネットワーク制限で不可のため、
以下の2つのアプローチが考えられる:

**アプローチA: Pythonスクリプトをローカルで実行（推奨）**

```python
# pip install astroquery astropy
from astroquery.simbad import Simbad
import json

# V等級 ≤ 6.0 の天体を一括取得
result = Simbad.query_tap("""
    SELECT main_id, ra, dec, flux AS vmag, otype
    FROM basic JOIN flux ON oid = flux.oidref
    WHERE flux.filter = 'V' AND flux.flux <= 6.0
    ORDER BY flux.flux ASC
""")

# メシエ天体を追加取得
for m in range(1, 111):
    result_m = Simbad.query_object(f"M {m}")
    # ... マージ処理
```

必要なもの: Python 3.8+、`astroquery`、`astropy` パッケージ

**アプローチB: 既存のカタログデータを利用**

Yale Bright Star Catalogue（BSC5、9,110天体、V ≤ 6.5）のデータを
JSON形式に変換する方式。データはパブリックドメインで入手可能。

#### 日本語名マッピングの課題

~5,000件のうち日本語固有名が付いているのは約100〜200件（1等星〜有名な星）。
残りはバイエル符号（α Ori → おおいぬ座アルファ星）や星表番号（HD 48915）で代替する。

**マッピング対象の階層:**

| 階層 | 件数 | 例 | 対応方法 |
|---|---|---|---|
| 1等星以上 | ~22 | シリウス、カノープス | 個別に日本語名を手動定義 |
| 主要な恒星（〜3等） | ~190 | ポルックス、レグルス | 個別に日本語名を手動定義 |
| メシエ天体 | 110 | オリオン大星雲、アンドロメダ銀河 | 個別に日本語名を手動定義 |
| バイエル符号付き（〜6等） | ~1,500 | おうし座ζ星 | 星座名（日本語）+ ギリシャ文字で自動生成 |
| その他の6等星 | ~3,000 | HD 123456 | HD番号 + 星座名で自動生成 |

#### SIMBAD TAPの利用条件

| 項目 | 内容 |
|---|---|
| アクセス方法 | HTTP GET/POST |
| レート制限 | 5〜10クエリ/秒（超過でIPブロック） |
| 出力形式 | JSON, CSV, VOTable |
| ブラウザからの直接アクセス | CORSが未保証のため、静的JSONファイル事前生成を推奨 |
| バルクアップロード上限 | 200,000行 |

### まとめ

1. **SIMBAD + Pythonスクリプトでデータベース生成は可能**。ただし、この環境からのSIMBAD直接アクセスは不可のため、ローカルPython実行が必要。
2. **約5,100〜6,000件**、JSONサイズ **~1.0〜1.5 MB**（gzip時 ~300 KB）。
3. **クライアントへの完全ダウンロードが必要**だが、サイズ的に問題なし。遅延読み込みで初期表示への影響も回避可能。
4. **座標フォーマット**: RA は10進数時（0〜24）、Dec は10進数度（-90〜+90）、小数点以下4桁統一。
5. **日本語名**: 有名天体（~300件）は手動マッピング、残りは星座名+符号で自動生成。
6. **次のステップ**: Pythonスクリプトの作成と日本語名マッピングテーブルの整備を行い、JSONファイルを生成する。

## 調査7-1: 天体検索用JSONファイルDB作成のための具体的な調査　（2026-03-11）

### 知りたいこと

調査7:アプローチA:Pythonスクリプトをローカルで実行（推奨）
を実施しようと思うが、具体的なソースコードと実行環境の構築手順を知りたい。

### 結果

#### 1. 実行環境の構築手順(Mac)

```bash
# Python 3.9以上が必要(astroquery v0.4.11の要件)
# Homebrewでインストール(未インストールの場合)
brew install python@3.12

# 仮想環境を作成(推奨)
python3 -m venv simbad_env
source simbad_env/bin/activate

# 必要パッケージのインストール
pip install astroquery astropy

# バージョン確認
python3 -c "import astroquery; print(astroquery.__version__)"
# → 0.4.11 以上であること
python3 -c "import astropy; print(astropy.__version__)"
```

**動作確認:**
```python
from astroquery.simbad import Simbad
result = Simbad.query_tap("SELECT TOP 5 main_id, ra, dec FROM basic WHERE ra IS NOT NULL")
print(result)
```

#### 2. SIMBAD TAPクエリの技術仕様

**テーブル構造:**

| テーブル | 主なカラム | 用途 |
|---|---|---|
| `basic` | `oid`, `main_id`, `ra`, `dec`, `otype`, `otype_txt`, `sp_type` | 天体基本情報 |
| `allfluxes` | `oidref`, `U`, `B`, `V`, `R`, `I`, `J`, `H`, `K`, `G` | 全バンド等級(一行に集約) |
| `ident` | `oidref`, `id` | 天体の全識別名 |
| `ids` | `oidref`, `ids` | 全識別名の連結文字列 |

**重要ポイント:**
- `basic.ra`, `basic.dec` は**度(degrees)**で格納(ICRS座標系)
- `allfluxes` の等級カラム名(`V`, `B`等)は**大文字**(唯一の大文字カラムテーブル)
- テーブル結合: `basic.oid = allfluxes.oidref`
- `ident.id` への検索では `normId()` が自動適用(`M1` → `M   1` に正規化)

**V等級 ≤ 6.0 の恒星取得クエリ:**
```sql
SELECT b.main_id, b.oid, b.ra, b.dec, a.V AS mag,
       b.otype, b.otype_txt, b.sp_type
FROM basic AS b
JOIN allfluxes AS a ON b.oid = a.oidref
WHERE a.V <= 6.0
  AND a.V IS NOT NULL
  AND b.ra IS NOT NULL
  AND b.dec IS NOT NULL
ORDER BY a.V ASC
```

**メシエ天体取得(TAP_UPLOAD方式):**
```python
messier_names = [f"M{i}" for i in range(1, 111)]
upload_table = Table([messier_names], names=["messier_id"])
result = Simbad.query_tap(query, messiers=upload_table)
```

**レート制限:**

| 項目 | 値 |
|---|---|
| ハードリミット | 10クエリ/秒/IP |
| 推奨 | 5〜6クエリ/秒以下 |
| 違反時 | 1分〜1時間ブロック |
| TAP_UPLOAD上限 | 200,000行 |
| 対策 | ループ回避、一括TAP取得、`time.sleep(2)` |

#### 3. 座標変換

- **RA:** 度 ÷ 15 = 時(hours, 0〜24) — Astronomy Engine互換
  - 例: シリウス RA = 101.287° → 101.287 / 15 = 6.7524 時
- **Dec:** そのまま度(変換不要)
- **精度:** 小数点以下4桁(0.0001時 ≈ 0.54秒角)

#### 4. 完全なPythonスクリプト

```python
#!/usr/bin/env python3
"""
SIMBAD天体データベース取得スクリプト
宙の辻(Sora no Tsuji)天体検索用JSONデータ生成
"""

import json
import time
import re
from astroquery.simbad import Simbad
from astropy.table import Table

# ============================================================
# 定数
# ============================================================

OUTPUT_FILE = "celestial_db.json"
V_MAG_LIMIT = 6.0
DECIMAL_PLACES = 4

# ============================================================
# 日本語名マッピングテーブル
# ============================================================

# 1等星以上の日本語名(約22件)
BRIGHT_STAR_NAMES_JA = {
    "* alf CMa":  "シリウス",
    "* alf Car":  "カノープス",
    "* alf Boo":  "アークトゥルス",
    "* alf Cen A": "リギル・ケンタウルス",
    "* alf Lyr":  "ベガ",
    "* alf Aur":  "カペラ",
    "* bet Ori":  "リゲル",
    "* alf CMi":  "プロキオン",
    "* alf Ori":  "ベテルギウス",
    "* alf Eri":  "アケルナル",
    "* bet Cen":  "ハダル",
    "* alf Aql":  "アルタイル",
    "* alf Cru":  "アクルックス",
    "* alf Tau":  "アルデバラン",
    "* alf Vir":  "スピカ",
    "* alf Sco":  "アンタレス",
    "* bet Gem":  "ポルックス",
    "* alf PsA":  "フォーマルハウト",
    "* alf Leo":  "レグルス",
    "* bet Cru":  "ミモザ",
    "* alf Gem":  "カストル",
    "* alf Cyg":  "デネブ",
}

# 主要恒星の日本語名(追加) — 実装時に拡張
NAMED_STAR_NAMES_JA = {
    "* alf UMi":  "ポラリス",
    "* bet UMa":  "メラク",
    "* del Ori":  "ミンタカ",
    "* alf And":  "アルフェラッツ",
    "* bet Per":  "アルゴル",
    "* alf UMa":  "ドゥーベ",
    "* eta UMa":  "アルカイド",
    "* gam Ori":  "ベラトリクス",
    "* eps Ori":  "アルニラム",
    "* zet Ori":  "アルニタク",
    # ... 約180件まで拡張
}

# メシエ天体の日本語名
MESSIER_NAMES_JA = {
    "M   1": "かに星雲",
    "M   8": "干潟星雲",
    "M  13": "ヘルクレス座球状星団",
    "M  16": "わし星雲",
    "M  17": "オメガ星雲",
    "M  20": "三裂星雲",
    "M  27": "あれい状星雲",
    "M  31": "アンドロメダ銀河",
    "M  33": "さんかく座銀河",
    "M  42": "オリオン大星雲",
    "M  44": "プレセペ星団",
    "M  45": "すばる(プレアデス星団)",
    "M  51": "子持ち銀河",
    "M  57": "環状星雲",
    "M  78": "M78星雲",
    "M  81": "ボーデの銀河",
    "M 101": "回転花火銀河",
    "M 104": "ソンブレロ銀河",
    # ... 全110件を定義
}

# 星座略号 → 日本語名マッピング(88星座)
CONSTELLATION_JA = {
    "And": "アンドロメダ座", "Ant": "ポンプ座", "Aps": "ふうちょう座",
    "Aqr": "みずがめ座", "Aql": "わし座", "Ara": "さいだん座",
    "Ari": "おひつじ座", "Aur": "ぎょしゃ座", "Boo": "うしかい座",
    "Cae": "ちょうこくぐ座", "Cam": "きりん座", "Cnc": "かに座",
    "CVn": "りょうけん座", "CMa": "おおいぬ座", "CMi": "こいぬ座",
    "Cap": "やぎ座", "Car": "りゅうこつ座", "Cas": "カシオペヤ座",
    "Cen": "ケンタウルス座", "Cep": "ケフェウス座",
    "Cet": "くじら座", "Cha": "カメレオン座", "Cir": "コンパス座",
    "Col": "はと座", "Com": "かみのけ座", "CrA": "みなみのかんむり座",
    "CrB": "かんむり座", "Crv": "からす座", "Crt": "コップ座",
    "Cru": "みなみじゅうじ座", "Cyg": "はくちょう座",
    "Del": "いるか座", "Dor": "かじき座", "Dra": "りゅう座",
    "Equ": "こうま座", "Eri": "エリダヌス座", "For": "ろ座",
    "Gem": "ふたご座", "Gru": "つる座", "Her": "ヘルクレス座",
    "Hor": "とけい座", "Hya": "うみへび座", "Hyi": "みずへび座",
    "Ind": "インディアン座", "Lac": "とかげ座", "Leo": "しし座",
    "LMi": "こじし座", "Lep": "うさぎ座", "Lib": "てんびん座",
    "Lup": "おおかみ座", "Lyn": "やまねこ座", "Lyr": "こと座",
    "Men": "テーブルさん座", "Mic": "けんびきょう座",
    "Mon": "いっかくじゅう座", "Mus": "はえ座", "Nor": "じょうぎ座",
    "Oct": "はちぶんぎ座", "Oph": "へびつかい座", "Ori": "オリオン座",
    "Pav": "くじゃく座", "Peg": "ペガスス座", "Per": "ペルセウス座",
    "Phe": "ほうおう座", "Pic": "がか座", "Psc": "うお座",
    "PsA": "みなみのうお座", "Pup": "とも座", "Pyx": "らしんばん座",
    "Ret": "レチクル座", "Sge": "や座", "Sgr": "いて座",
    "Sco": "さそり座", "Scl": "ちょうこくしつ座", "Sct": "たて座",
    "Ser": "へび座", "Sex": "ろくぶんぎ座", "Tau": "おうし座",
    "Tel": "ぼうえんきょう座", "Tri": "さんかく座",
    "TrA": "みなみのさんかく座", "Tuc": "きょしちょう座",
    "UMa": "おおぐま座", "UMi": "こぐま座", "Vel": "ほ座",
    "Vir": "おとめ座", "Vol": "とびうお座", "Vul": "こぎつね座",
}

# バイエル符号ギリシャ文字マッピング
GREEK_LETTERS = {
    "alf": "α", "bet": "β", "gam": "γ", "del": "δ", "eps": "ε",
    "zet": "ζ", "eta": "η", "tet": "θ", "iot": "ι", "kap": "κ",
    "lam": "λ", "mu.": "μ", "nu.": "ν", "ksi": "ξ", "omi": "ο",
    "pi.": "π", "rho": "ρ", "sig": "σ", "tau": "τ", "ups": "υ",
    "phi": "φ", "chi": "χ", "psi": "ψ", "ome": "ω",
}


# ============================================================
# データ取得関数
# ============================================================

def fetch_bright_stars():
    """V等級 ≤ 6.0の恒星をSIMBAD TAPで一括取得"""
    print("V等級 ≤ 6.0 の恒星を取得中...")

    query = f"""
    SELECT b.main_id, b.oid, b.ra, b.dec, a.V AS mag,
           b.otype, b.otype_txt, b.sp_type
    FROM basic AS b
    JOIN allfluxes AS a ON b.oid = a.oidref
    WHERE a.V <= {V_MAG_LIMIT}
      AND a.V IS NOT NULL
      AND b.ra IS NOT NULL
      AND b.dec IS NOT NULL
    ORDER BY a.V ASC
    """

    result = Simbad.query_tap(query)
    print(f"  取得件数: {len(result)}")
    return result


def fetch_messier_objects():
    """メシエ天体 M1〜M110 を取得"""
    print("メシエ天体を取得中...")

    messier_names = [f"M{i}" for i in range(1, 111)]
    upload_table = Table([messier_names], names=["messier_id"])

    query = """
    SELECT t.messier_id, b.main_id, b.oid, b.ra, b.dec,
           a.V AS mag, b.otype, b.otype_txt
    FROM TAP_UPLOAD.messiers AS t
    JOIN ident AS i ON i.id = t.messier_id
    JOIN basic AS b ON i.oidref = b.oid
    LEFT JOIN allfluxes AS a ON b.oid = a.oidref
    WHERE b.ra IS NOT NULL AND b.dec IS NOT NULL
    """

    result = Simbad.query_tap(query, messiers=upload_table)
    print(f"  取得件数: {len(result)}")
    return result


def fetch_all_identifiers(oid_list):
    """指定したoid群の全識別名を一括取得"""
    print("全識別名を取得中...")

    upload_table = Table([oid_list], names=["target_oid"])

    query = """
    SELECT t.target_oid, i.id
    FROM TAP_UPLOAD.targets AS t
    JOIN ident AS i ON i.oidref = t.target_oid
    """

    result = Simbad.query_tap(query, targets=upload_table)
    print(f"  識別名取得件数: {len(result)}")
    return result


# ============================================================
# 変換・生成関数
# ============================================================

def ra_deg_to_hours(ra_deg):
    """RA(度) → RA(時) 変換。Astronomy Engine互換形式。"""
    return round(ra_deg / 15.0, DECIMAL_PLACES)


def parse_bayer_designation(main_id):
    """
    SIMBADのmain_idからバイエル符号を解析
    例: "* alf CMa" → ("alf", "CMa") → "α CMa"
    """
    match = re.match(r'^\*\s+(\w+)\s+(\w+)$', main_id)
    if match:
        greek_key = match.group(1)
        constellation = match.group(2)
        greek_letter = GREEK_LETTERS.get(greek_key, greek_key)
        return greek_letter, constellation
    return None, None


def generate_name_ja(main_id, identifiers):
    """天体の日本語名を生成"""
    # 1. 固有名テーブルから検索
    if main_id in BRIGHT_STAR_NAMES_JA:
        return BRIGHT_STAR_NAMES_JA[main_id]
    if main_id in NAMED_STAR_NAMES_JA:
        return NAMED_STAR_NAMES_JA[main_id]

    # 2. バイエル符号から日本語名を自動生成
    greek, const_abbr = parse_bayer_designation(main_id)
    if greek and const_abbr:
        const_ja = CONSTELLATION_JA.get(const_abbr, const_abbr)
        return f"{const_ja} {greek}星"

    # 3. HD番号があればそれを使用
    for ident in identifiers:
        if ident.startswith("HD "):
            return f"HD {ident[3:]}"

    # 4. HIP番号にフォールバック
    for ident in identifiers:
        if ident.startswith("HIP "):
            return f"HIP {ident[4:]}"

    # 5. main_idをそのまま使用
    return main_id


def generate_keys_ja(main_id, identifiers, otype_txt):
    """日本語検索キーワードを生成"""
    keys = []
    name_ja = generate_name_ja(main_id, identifiers)
    if name_ja:
        keys.append(name_ja)

    greek, const_abbr = parse_bayer_designation(main_id)
    if const_abbr:
        const_ja = CONSTELLATION_JA.get(const_abbr, "")
        if const_ja:
            keys.append(const_ja)

    if otype_txt:
        keys.append(otype_txt)

    if greek and const_abbr:
        keys.append(f"{greek} {const_abbr}")

    return ", ".join(keys)


def generate_keys_en(main_id, identifiers):
    """英語検索キーワードを生成"""
    keys = [main_id]
    for ident in identifiers:
        if any(ident.startswith(prefix) for prefix in
               ["HD ", "HIP ", "HR ", "NGC ", "IC ", "NAME "]):
            keys.append(ident)
    return ", ".join(keys[:5])


# ============================================================
# JSON構築
# ============================================================

def build_json(stars_result, messier_result, all_identifiers):
    """最終JSONデータを構築"""
    print("JSONデータを構築中...")

    # 識別名をoid別に整理
    ident_map = {}
    for row in all_identifiers:
        oid = row["target_oid"]
        if oid not in ident_map:
            ident_map[oid] = []
        ident_map[oid].append(row["id"])

    output = []
    seen_oids = set()

    # 恒星データ
    for row in stars_result:
        oid = row["oid"]
        if oid in seen_oids:
            continue
        seen_oids.add(oid)
        identifiers = ident_map.get(oid, [])
        entry = {
            "name": generate_name_ja(row["main_id"], identifiers),
            "ra": ra_deg_to_hours(float(row["ra"])),
            "dec": round(float(row["dec"]), DECIMAL_PLACES),
            "mag": round(float(row["mag"]), 2),
            "type": "恒星",
            "keysJa": generate_keys_ja(
                row["main_id"], identifiers, row.get("otype_txt", "")),
            "keysEn": generate_keys_en(row["main_id"], identifiers),
        }
        output.append(entry)

    # メシエ天体
    for row in messier_result:
        oid = row["oid"]
        if oid in seen_oids:
            continue
        seen_oids.add(oid)
        identifiers = ident_map.get(oid, [])
        messier_id = row["messier_id"]
        name_ja = MESSIER_NAMES_JA.get(
            row["main_id"], f"M{messier_id.replace('M', '')}")
        mag_value = float(row["mag"]) if row["mag"] is not None else None
        entry = {
            "name": name_ja,
            "ra": ra_deg_to_hours(float(row["ra"])),
            "dec": round(float(row["dec"]), DECIMAL_PLACES),
            "mag": round(mag_value, 2) if mag_value else None,
            "type": row.get("otype_txt", "深宇宙天体"),
            "keysJa": f"{name_ja}, メシエ天体",
            "keysEn": generate_keys_en(row["main_id"], identifiers),
        }
        output.append(entry)

    # 等級順ソート(Noneは末尾)
    output.sort(key=lambda x: (x["mag"] is None, x["mag"] or 99))
    return output


# ============================================================
# メイン処理
# ============================================================

def main():
    print("=" * 60)
    print("SIMBAD天体データ取得スクリプト")
    print("=" * 60)

    # Step 1: 恒星データ取得
    stars = fetch_bright_stars()
    time.sleep(2)  # レート制限対策

    # Step 2: メシエ天体取得
    messier = fetch_messier_objects()
    time.sleep(2)

    # Step 3: 全oidを集めて識別名を一括取得
    all_oids = list(set(
        list(stars["oid"]) + list(messier["oid"])
    ))
    identifiers = fetch_all_identifiers(all_oids)

    # Step 4: JSON構築
    output = build_json(stars, messier, identifiers)

    # Step 5: ファイル出力
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n完了: {OUTPUT_FILE} に {len(output)} 件出力しました")


if __name__ == "__main__":
    main()
```

#### 5. 実行手順まとめ

```bash
# 1. 仮想環境を有効化
source simbad_env/bin/activate

# 2. スクリプトを保存(例: fetch_stars.py)

# 3. 実行
python3 fetch_stars.py

# 4. 出力ファイル確認
ls -la celestial_db.json
python3 -c "import json; d=json.load(open('celestial_db.json')); print(f'{len(d)}件')"
```

#### 6. 注意事項

- **エラーハンドリング:** ネットワークエラー時はSIMBADにブロックされた可能性があるため、1分待機してリトライ
- **非同期モード:** 大量データ取得時は `Simbad.query_tap(query, async_job=True)` を使用すると安定
- **データ整合性チェック:** RA(0〜360度)、Dec(-90〜+90度)、V等級(-2〜6.0)の範囲を確認
- **NAMED_STAR_NAMES_JA の拡張:** 初回実行後、主要恒星(〜3等)約180件の日本語名を手動で追加する作業が必要
- **MESSIER_NAMES_JA の完成:** 全110件の日本語名を定義する必要あり

#### 7. 次のステップ

1. Mac環境でPython + astroquery をインストール
2. スクリプトを保存して実行
3. 出力JSONの件数とサンプルデータを確認
4. 日本語名マッピングテーブルを拡充(主要恒星+メシエ全110件)
5. 完成版JSONを `data/celestial_db.json` に配置

#### 参考リンク
- [astroquery SIMBAD documentation](https://astroquery.readthedocs.io/en/stable/simbad/simbad.html)
- [SIMBAD ADQL examples](https://cds.unistra.fr/help/documentation/simbad-more/adql-simbad/)
- [SIMBAD TAP tables metadata](http://simbad.u-strasbg.fr/simbad/sim-tap/tables)