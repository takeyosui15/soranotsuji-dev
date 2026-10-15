#!/usr/bin/env node
// NAME
//   build-precache.js — Service Worker が先に控える(precache)本体ファイルの一覧 sw-precache.js を作る/確かめる
// SYNOPSIS
//   node tools/sw/build-precache.js --write   # sw-precache.js を書き直す
//   node tools/sw/build-precache.js --check   # 今の sw-precache.js が一覧と一致するか(verify187 が呼ぶ。違えば exit 1)
//   node tools/sw/build-precache.js           # 一覧と合計サイズを表示するだけ
// DESCRIPTION
//   一覧は手で書かず、配信面から集める(デッサン35 §2.4): 固定の本体(index.html/script.js/…)+index.html の <script src>/<link rel=stylesheet>
//   +vendor/MANIFEST.json の全ファイル+ワーカー(script.js の new Worker('…') と直下の *-worker.js)+起動時に読む同梱データ(celestial_db.json・muni.json・星座・天の川・フォント・data/ の小さい物)。
//   大きい物(milkyway-skymap_4k.webp 7.9MB・*_print.webp・ogp.png・data/kashimap/)は入れない=初めて使った時に控える(sw.js の実行時の控え)。
//   実体の無いファイルが一覧に入ると install が失敗して古い控えのまま(2フェーズ)になるので、ここで実体の有無も確かめる。
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'sw-precache.js');

const FIXED = [
  'index.html', 'script.js', 'sora-constants.js', 'style.css', 'three-global.js',
  'reset.html', 'reset.js', 'forecast-features.html', 'privacy.html', 'terms.html',
  'favicon.ico', 'apple-touch-icon.png', 'logo.png',
];
const DATA = [
  'celestial_db.json', 'muni.json', 'constellations.borders.json', 'constellations.lines.json',
  'milkyway-skymap.webp', 'fonts/SoraSans/0-255.pbf',
  'data/geoid-jp.json', 'data/lp-japan.json', 'data/lp-japan.bin', 'data/mountains.json', 'data/plateau-bldg-cities.json',
];

function collect() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const js = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'vendor', 'MANIFEST.json'), 'utf8'));
  const set = new Set(FIXED);
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) if (!/^https?:/.test(m[1])) set.add(m[1]);
  for (const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) if (!/^https?:/.test(m[1])) set.add(m[1]);
  for (const f of man.files) set.add('vendor/' + f.path);
  for (const m of js.matchAll(/new Worker\('([^']+)'\)/g)) set.add(m[1]);
  for (const f of fs.readdirSync(ROOT)) if (/-worker\.js$/.test(f)) set.add(f);   // 変数名で起動するワーカー(tsuji-search-worker.js 等)も拾う: 直下の *-worker.js は全部
  for (const d of DATA) set.add(d);
  const list = [...set].sort();
  const missing = list.filter(f => !fs.existsSync(path.join(ROOT, f)));
  const bytes = list.filter(f => !missing.includes(f)).reduce((s, f) => s + fs.statSync(path.join(ROOT, f)).size, 0);
  return { list, missing, bytes };
}
function render(list) {
  return "// 宙の辻 Service Worker が先に控える本体の一覧(自動生成: node tools/sw/build-precache.js --write。手で直さない。verify187 が一致を見張る)\n" +
    "self.SORA_PRECACHE = [\n" + list.map(f => `  '${f}',`).join('\n') + "\n];\n";
}

const { list, missing, bytes } = collect();
const mode = process.argv[2] || '';
if (missing.length) { console.error('実体の無いファイル: ' + missing.join(', ')); process.exit(1); }
if (mode === '--write') {
  fs.writeFileSync(OUT, render(list));
  console.log(`wrote ${path.relative(ROOT, OUT)}: ${list.length} files, ${(bytes / 1048576).toFixed(2)} MB`);
} else if (mode === '--check') {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== render(list)) { console.error('sw-precache.js が配信面と合いません。node tools/sw/build-precache.js --write で作り直してください'); process.exit(1); }
  console.log(`ok: sw-precache.js = ${list.length} files, ${(bytes / 1048576).toFixed(2)} MB`);
} else {
  console.log(list.join('\n'));
  console.log(`${list.length} files, ${(bytes / 1048576).toFixed(2)} MB`);
}
