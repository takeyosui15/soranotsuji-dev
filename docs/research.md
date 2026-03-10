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