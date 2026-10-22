#!/usr/bin/env node
// NAME
//   render-icons.js — logo.svg(図形で描いたロゴ)から、配信するアイコンの PNG と favicon.ico を書き出す
// SYNOPSIS
//   NODE_PATH=<playwright-core のある node_modules> node tools/icons/render-icons.js            # リポジトリ直下の logo.png / apple-touch-icon.png / icon-192.png / icon-512.png / favicon.ico を書き直す
//   NODE_PATH=... node tools/icons/render-icons.js --out /tmp/icons                              # 別の置き場へ書く(見比べる時)
//   NODE_PATH=... node tools/icons/render-icons.js --check                                       # 今のファイルが logo.svg から書き出した物と一致するか(違えば exit 1)
// DESCRIPTION
//   Chromium(Playwright)で logo.svg を <img> として描き、透過背景のまま各サイズのスクリーンショットを PNG にする(第186)。
//   ・logo.png=100×100(ヘッダのロゴ・manifest 100)・apple-touch-icon.png=180×180・icon-192.png/icon-512.png(manifest・Android の「インストール」)
//   ・favicon.ico=16/32/48/64 の PNG を1つの ICO 容器に入れた物(元の favicon.ico も PNG 入りの ICO だった)
//   ・書き出した後は sw-precache.js(node tools/sw/build-precache.js --write)も作り直す(サイズが変わるので)。
//   ・ブラウザは環境のプリインストール(/opt/pw-browsers/chromium-*/chrome-linux/chrome)。無ければ PW_CHROME=<path> で指定する。
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const OUT = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : ROOT;
const CHECK = args.includes('--check');
const TARGETS = [['logo.png', 100], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]];
const ICO_SIZES = [16, 32, 48, 64];

function findChrome() {
  if (process.env.PW_CHROME) return process.env.PW_CHROME;
  const base = '/opt/pw-browsers';
  try { const d = fs.readdirSync(base).filter(n => /^chromium-\d+$/.test(n)).sort().pop(); if (d) return path.join(base, d, 'chrome-linux', 'chrome'); } catch (_) {}
  return null;
}
function ico(pngs) {   // PNG 入りの ICO(ディレクトリ 16 バイト×n+本体)
  const hdr = Buffer.alloc(6); hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length); let off = 6 + dir.length;
  pngs.forEach(([n, buf], i) => { const d = dir.subarray(i * 16); d[0] = n >= 256 ? 0 : n; d[1] = n >= 256 ? 0 : n; d[2] = 0; d[3] = 0; d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6); d.writeUInt32LE(buf.length, 8); d.writeUInt32LE(off, 12); off += buf.length; });
  return Buffer.concat([hdr, dir, ...pngs.map(([, b]) => b)]);
}
(async () => {
  const { chromium } = require('playwright-core');
  const exe = findChrome();
  if (!exe) { console.error('Chromium が見つかりません(PW_CHROME=... で指定)'); process.exit(2); }
  const svg = fs.readFileSync(path.join(ROOT, 'logo.svg'), 'utf8');
  const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const ctx = await b.newContext({ deviceScaleFactor: 1 });
  const render = async (n) => {
    const p = await ctx.newPage({ viewport: { width: n, height: n } });
    await p.setContent(`<html><head><style>html,body{margin:0;padding:0;background:transparent}img{display:block;width:${n}px;height:${n}px}</style></head><body><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`);
    await p.waitForTimeout(100);
    const buf = await p.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: n, height: n }, type: 'png' });
    await p.close();
    return buf;
  };
  const out = [];
  for (const [name, n] of TARGETS) out.push([name, await render(n)]);
  const icoPngs = []; for (const n of ICO_SIZES) icoPngs.push([n, await render(n)]);
  out.push(['favicon.ico', ico(icoPngs)]);
  await b.close();
  let diff = 0;
  for (const [name, buf] of out) {
    const dst = path.join(OUT, name);
    if (CHECK) { const cur = fs.existsSync(dst) ? fs.readFileSync(dst) : null; const same = cur && cur.equals(buf); if (!same) diff++; console.log(`${same ? 'same' : 'DIFF'} ${name} (${buf.length} bytes)`); }
    else { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, buf); console.log(`wrote ${dst} (${buf.length} bytes)`); }
  }
  if (CHECK) process.exit(diff ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
