# 宙の辻 - Sora no Tsuji

Celestial simulation web app that visualizes where and when celestial bodies align with mountain peaks on a map — helping photographers find "Diamond Fuji" moments and similar phenomena.

- **URL**: https://soranotsuji.design10100.net/
- **Version**: 1.17.0
- **License**: GPLv3
- **Language**: UI and code comments are in Japanese

## Tech Stack

Pure static web app — **no build system, no package.json, no node_modules**.

- HTML5 / CSS3 / Vanilla JavaScript (no framework)
- **Leaflet 1.9.4** — map rendering (CDN)
- **Astronomy Engine 2.1.19** — celestial body position calculations (CDN)
- **GeographicLib** — geodesic calculations and DMS formatting (CDN)
- **MathJax 3** — math formula rendering in help section (CDN)

### External APIs

- **GSI (国土地理院)** — elevation data and map tiles
- **OpenStreetMap Nominatim** — geocoding / reverse geocoding
- **Google Apps Script** — visitor counter (backend deployed separately)

## File Structure

| File | Description |
|------|-------------|
| `index.html` | Main HTML page, UI structure, all panels and dialogs |
| `script.js` | **All application logic** (~2600 lines, 9 sections — see below) |
| `style.css` | All styling (~1170 lines) |
| `muni.js` | Municipality data lookup table (GSI.MUNI_ARRAY). **Auto-generated — do NOT edit** |
| `gas_spredsheet.js` | Google Apps Script for visitor counter. **Reference only — runs in GAS, not in the browser** |
| `reset.html` | Standalone data reset page for LocalStorage management |
| `favicon.ico`, `logo.png`, `ogp.png`, `apple-touch-icon.png` | Static assets |

## script.js Sections

1. **定数定義** (Constants) — line ~46
2. **グローバル変数 & アプリケーション状態 (appState)** — line ~113
3. **初期化プロセス** (Initialization) — line ~200
4. **UIイベント設定** (UI Event Handlers) — line ~344
5. **設定の保存・読み込み** (Save/Load via LocalStorage) — line ~570
6. **メイン更新ロジック** (Main Update Logic) — line ~720
7. **ロジック・ヘルパー** (Logic Helpers) — line ~905
8. **ツールチップ設定** (Tooltip Configuration) — line ~981
9. **ユーティリティ** (Utilities) — line ~1007

## Architecture

- **Single-page application**: Everything runs client-side in the browser
- **State management**: Central `appState` object holds all application state
- **Persistence**: Single LocalStorage key `soranotsuji_app` stores serialized state
- **No modules/bundling**: All JS is in global scope, loaded via `<script>` tags
- **DOM interaction**: Direct DOM manipulation (getElementById, querySelector)

## Coding Conventions

- **Comments**: Japanese
- **Constants**: `UPPER_SNAKE_CASE`
- **Variables/functions**: `camelCase`
- **Section separators**: `// ============================================================` with numbered headers
- **Version history**: Comment block at the top of `script.js`
- **Commit messages**: `type: 説明` in Japanese (types: `feat`, `fix`, `style`, `doc`, `refactor`)

## Development Rules

- **No build step**: Edit files directly, refresh browser to test
- **XSS prevention**: All innerHTML insertions MUST use `escapeHtml()`
- **Do NOT edit** `muni.js` (auto-generated data)
- **`gas_spredsheet.js`** is for reference/version control only — it runs in Google Apps Script
- **LocalStorage schema changes** must maintain backward compatibility (`loadState()` handles migration)
- **Version bumps**: Update the version comment block at top of `script.js`
- **Deployment**: GitHub Pages from `master` branch (CNAME: soranotsuji.design10100.net)
- **Git workflow**: `develop` branch for feature work, merge to `master` for release

## Domain Glossary

| Term | Meaning |
|------|---------|
| 辻 (Tsuji) | Intersection/crossroads — the point where a celestial body aligns with a mountain peak from an observer's position |
| 辻ライン (Tsuji Line) | Line on the map showing where alignment occurs at each time, with 5-minute markers |
| 辻検索 (Tsuji Search) | Search for dates (up to 4 years ahead) when alignment occurs at a given location |
| 観測点 (Kansokuten) | Observer's position (start point) |
| 目的点 (Mokutekiten) | Target peak (end point, e.g., Mt. Fuji summit) |
| Diamond Fuji / Pearl Fuji | Sun/Moon aligning with Mt. Fuji's summit |
| 薄明 (Hakumei) | Twilight (civil, nautical, astronomical) |
| 気差補正 K (Refraction K) | Atmospheric refraction correction coefficient (default: 0.132) |
| My天体 | Custom celestial body tracking via RA/Dec coordinates |
