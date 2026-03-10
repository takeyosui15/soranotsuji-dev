# 宙の辻 (Sora no Tsuji)

## プロジェクト概要
天体と地上のランドマーク（富士山など）の位置関係を地図上に可視化するWebアプリケーション。
ダイヤモンド富士やパール富士など、天体が特定の山と重なる「辻」の日時・場所を計算する。

## 技術スタック
- **静的Webアプリ** — ビルドプロセスなし、GitHub Pagesでホスティング
- **HTML/CSS/Vanilla JavaScript** — フレームワーク不使用
- **主要ライブラリ（CDN読み込み）:**
  - Leaflet 1.9.4（地図描画）
  - Astronomy Engine 2.1.19（天体位置計算）
  - GeographicLib（測地線計算）
  - MathJax 3（数式表示）

## ファイル構成
| ファイル | 役割 |
|---|---|
| `index.html` | メインHTML（UI構造、ヘルプ、全セクション定義） |
| `script.js` | メインロジック（状態管理、天体計算、地図操作、UI制御） |
| `style.css` | 全スタイル定義 |
| `muni.js` | 市区町村データライブラリ |
| `gas_spredsheet.js` | Google Apps Script連携（訪問者カウンター） |
| `reset.html` | データリセットページ |

## アーキテクチャ
- **状態管理**: `appState` オブジェクトで全状態を一元管理
- **永続化**: LocalStorage（キー: `soranotsuji_app`）に設定・位置情報を保存
- **外部API**: 国土地理院（標高DEM・地図タイル）、OpenStreetMap（ジオコーディング）、Open-Meteo（標高データ）

## script.js の主要セクション
1. 定数定義（天体データ、デフォルト座標、色設定）
2. `appState`（グローバル状態オブジェクト）
3. 初期化処理（LocalStorage復元、地図初期化、イベント登録）
4. UIイベントハンドラ
5. Storage管理（保存・読込）
6. 天体計算・更新ロジック（`updateCalculation`, `updateCelestialData`）
7. 辻検索（`startTsujiSearch` — 方位角・視高度による天体アライメント検索）
8. ユーティリティ関数

## コーディング規約
- UIテキスト・コメントは**日本語**で記述
- コミットメッセージも日本語（`feat:` / `fix:` / `style:` プレフィクス使用）
- XSS対策として `escapeHtml()` を使用（ユーザー入力をDOMに挿入する際は必須）
- **構造とスタイルの分離**: インラインスタイル（`style="..."`）は使用せず、CSSクラスで定義する。HTML/JSには構造のみ、`style.css`にスタイルを記述する
- 恒星（Polaris, Merak, Mintaka, Subaru, MyStar）は固定RA/Decで計算、惑星・太陽・月はAstronomy Engine APIで動的計算

## バージョン管理
- バージョン履歴は `script.js` 冒頭のコメントに記載
- 現在: V1.17.0（2026-03-06）
- ライセンス: GPL v3
- コミット・プッシュ後はコミットハッシュ（例: `abc1234`）を報告する
