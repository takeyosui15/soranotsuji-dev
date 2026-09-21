#!/usr/bin/env node
// 可視マップ 段2: 計算の道具(静的資産を作る側)。デッサン docs/dessin/dessin/05-kashimap.md 第7版「実装の段取り」段2。
// 推し山(data/mountains.json の索引番号)を中心に、範囲(km四方)の地理院DEMタイル(z15: dem5a→5b→5c、無ければ z14 dem_png)
// を読み、「地上1.5mに立った人から山頂が見えるか」を全画素で判定する。
// 判定: 山頂から放射状(R2=窓の縁の全画素へ光線)に、地球の丸み+大気差(k固定)の沈み込み d²/(2Reff) を引いた
// 見かけ高度角の最大値を更新しながら外へ歩く(1画素を光線ごとに1回)。アプリの統一可視判定(_visJudgeCore)と同じ式
// (e − d²·inv2R と直線の比較)で、除外規則(目的点側15m・観測点側10m)も同じ。
// 出力(out/<id>-<range>km-z<z>-<canopy>/): visible.bin(1bitの見える/見えない・行優先)・islands.json(島の索引)・
// islands.geojson(島の輪郭。大きい島は外周をたどる・小さい島は画素の四角)・meta.json(計算条件)・preview.png(縮小画像)。
// 使い方: node tools/kashimap/viewshed.js --id 368 --range 60 [--zoom 15] [--k 0.132] [--obs 1.5] [--concurrency 6]
//         [--check 2000] [--preview 1024] [--outline 2000] [--cache tools/kashimap/cache] [--out tools/kashimap/out]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const https = require('https');
const { URL } = require('url');

const args = {};
for (let i = 2; i < process.argv.length; i++) { const a = process.argv[i]; if (a.startsWith('--')) { const k = a.slice(2); const v = (i + 1 < process.argv.length && !process.argv[i + 1].startsWith('--')) ? process.argv[++i] : 'true'; args[k] = v; } }
const HERE = __dirname;
const REPO = path.join(HERE, '..', '..');
const ID = String(args.id || '368');
const RANGE_KM = parseFloat(args.range || '60');
const Z = parseInt(args.zoom || '15', 10);
const K = parseFloat(args.k || '0.132');
const OBS_H = parseFloat(args.obs || '1.5');
const CONC = parseInt(args.concurrency || '6', 10);
const CHECK_N = parseInt(args.check || '2000', 10);
const PREVIEW = parseInt(args.preview || '1024', 10);
const OUTLINE_N = parseInt(args.outline || '2000', 10);
const CANOPY = args.canopy === 'true';      // 段2後半(樹冠)。今はfalse固定
const EXCL_TARGET_ARG = args['excl-target'] !== undefined ? parseFloat(args['excl-target']) : null;   // 目的点側の除外半径(m)。無指定=山頂部の広がりから自動
const SUMMIT_DROP_M = parseFloat(args['summit-drop'] || '120');   // 「山頂部」= 山頂からこの高さ以内の画素(自動除外半径の決め方)
const SUMMIT_SEARCH_M = parseFloat(args['summit-search'] || '3000');   // 山頂部を探す半径(m)
const CACHE = path.resolve(args.cache || path.join(HERE, 'cache'));
const OUT_ROOT = path.resolve(args.out || path.join(HERE, 'out'));
const R_EARTH = 6371000;
const EXCL_OBS_M = 10;                       // 観測点側の除外半径(アプリの既定と同じ)
let EXCL_TGT_M = 15;                          // 目的点側の除外半径。アプリの既定は15m。山頂部の広がりで自動的に広げる(下のsummitInfo)
const UA = 'soranotsuji-dev kashimap viewshed (https://github.com/takeyosui15/soranotsuji-dev)';
const NODATA = 65535;                        // Uint16格子の「データ無し」。値=round((標高+100)×10)
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------- 山データ ----------
const mdata = JSON.parse(fs.readFileSync(path.join(REPO, 'data', 'mountains.json'), 'utf8'));
const M = mdata.mountains.find(m => m.id === ID);
if (!M) { console.error('山が見つかりません: id=' + ID); process.exit(1); }
log(`対象: ${M.name}${M.peak ? '(' + M.peak + ')' : ''} 索引番号${M.id} ${M.elev}m (${M.lat}, ${M.lon}) 範囲${RANGE_KM}km四方 z${Z} k=${K} 観測者${OBS_H}m`);

// ---------- タイル座標 ----------
const WORLD = 256 * Math.pow(2, Z);
const lonToX = lon => (lon + 180) / 360 * WORLD;
const latToY = lat => (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * WORLD;
const xToLon = x => x / WORLD * 360 - 180;
const yToLat = y => Math.atan(Math.sinh(Math.PI * (1 - 2 * y / WORLD))) * 180 / Math.PI;
const MPP = 40075016.686 * Math.cos(M.lat * Math.PI / 180) / WORLD;   // 中心緯度での1画素(m)。窓の中で約±0.4%変わる
const cxF = lonToX(M.lon), cyF = latToY(M.lat);
const halfPx = Math.ceil(RANGE_KM * 1000 / 2 / MPP);
const X0 = Math.floor(cxF) - halfPx, Y0 = Math.floor(cyF) - halfPx;
const W = 2 * halfPx + 1, H = W;
const CX = halfPx, CY = halfPx;              // 窓内の山頂画素
const TX0 = Math.floor(X0 / 256), TX1 = Math.floor((X0 + W - 1) / 256), TY0 = Math.floor(Y0 / 256), TY1 = Math.floor((Y0 + H - 1) / 256);
const NT = (TX1 - TX0 + 1) * (TY1 - TY0 + 1);
log(`窓: ${W}×${H}画素(1画素≈${MPP.toFixed(2)}m) タイル${TX1 - TX0 + 1}×${TY1 - TY0 + 1}=${NT}枚`);

// ---------- PNG ----------
function pngDecode(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not png');
  let pos = 8, w = 0, h = 0, ct = 0, bd = 0; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos); const type = buf.toString('ascii', pos + 4, pos + 8); const body = buf.subarray(pos + 8, pos + 8 + len); pos += 12 + len;
    if (type === 'IHDR') { w = body.readUInt32BE(0); h = body.readUInt32BE(4); bd = body[8]; ct = body[9]; if (body[12] !== 0) throw new Error('interlaced'); }
    else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
  }
  if (bd !== 8) throw new Error('bitdepth ' + bd);
  const ch = { 2: 3, 6: 4, 0: 1, 4: 2, 3: 1 }[ct];
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch; const out = Buffer.alloc(w * h * ch); let p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++]; const o = y * stride; const po = o - stride;
    for (let i = 0; i < stride; i++) {
      const x = raw[p + i]; const a = i >= ch ? out[o + i - ch] : 0; const b = y > 0 ? out[po + i] : 0; const c = (y > 0 && i >= ch) ? out[po + i - ch] : 0;
      let v;
      if (f === 0) v = x; else if (f === 1) v = x + a; else if (f === 2) v = x + b; else if (f === 3) v = x + ((a + b) >> 1);
      else { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v = x + ((pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c)); }
      out[o + i] = v & 255;
    }
    p += stride;
  }
  return { w, h, ch, data: out, ct };
}
function pngEncodeRGB(w, h, rgb) {
  const stride = w * 3; const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (stride + 1)] = 0; rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride); }
  const crcTable = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); crcTable[n] = c; }
  const crc = b => { let c = -1; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (type, body) => { const len = Buffer.alloc(4); len.writeUInt32BE(body.length); const tb = Buffer.concat([Buffer.from(type, 'ascii'), body]); const cc = Buffer.alloc(4); cc.writeUInt32BE(crc(tb)); return Buffer.concat([len, tb, cc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- タイル取得(キャッシュ・フォールバック・並列数の上限) ----------
function fetchBuf(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    const done = (res) => { if (res.statusCode === 404) { res.resume(); return resolve(null); } if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode + ' ' + url)); } const bufs = []; res.on('data', d => bufs.push(d)); res.on('end', () => resolve(Buffer.concat(bufs))); res.on('error', reject); };
    if (proxy) {
      // 環境のプロキシ(CONNECT)経由。証明書検証はそのまま(NODE_EXTRA_CA_CERTS等は環境が設定)
      const pu = new URL(proxy); const http = require('http');
      const req = http.request({ host: pu.hostname, port: pu.port, method: 'CONNECT', path: `${u.hostname}:443`, headers: pu.username ? { 'Proxy-Authorization': 'Basic ' + Buffer.from(decodeURIComponent(pu.username) + ':' + decodeURIComponent(pu.password)).toString('base64') } : {} });
      req.on('connect', (res, socket) => {
        if (res.statusCode !== 200) return reject(new Error('proxy CONNECT ' + res.statusCode));
        const r2 = https.request({ host: u.hostname, path: u.pathname + u.search, method: 'GET', headers: { 'User-Agent': UA }, socket, agent: false, servername: u.hostname }, done);
        r2.on('error', reject); r2.end();
      });
      req.on('error', reject); req.end();
    } else {
      const r = https.request({ host: u.hostname, path: u.pathname + u.search, method: 'GET', headers: { 'User-Agent': UA } }, done);
      r.on('error', reject); r.end();
    }
  });
}
async function fetchTileCached(kind, z, x, y) {
  const dir = path.join(CACHE, kind, String(z), String(x)); const fn = path.join(dir, y + '.png'); const miss = path.join(dir, y + '.404');
  if (fs.existsSync(fn)) return fs.readFileSync(fn);
  if (fs.existsSync(miss)) return null;
  fs.mkdirSync(dir, { recursive: true });
  let buf = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try { buf = await fetchBuf(`https://cyberjapandata.gsi.go.jp/xyz/${kind}/${z}/${x}/${y}.png`); break; }
    catch (e) { if (attempt === 2) throw e; await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); }
  }
  if (buf) fs.writeFileSync(fn, buf); else fs.writeFileSync(miss, '');
  return buf;
}
const grid = new Uint16Array(W * H).fill(NODATA);
const stats = { fetched: 0, cached: 0, from5a: 0, from5b: 0, from5c: 0, from14: 0, missing: 0 };
function decodeElevInto(png, tx, ty, zt) {
  // タイル(zt)の画素を窓の格子へ。zt=Z-1 のときは2倍に引き伸ばす(最近傍)。既に値のある画素は上書きしない
  const scale = Math.pow(2, Z - zt);
  const { w, ch, data } = png;
  const originX = tx * 256 * scale - X0, originY = ty * 256 * scale - Y0;
  for (let py = 0; py < 256; py++) {
    for (let px = 0; px < 256; px++) {
      const o = (py * w + px) * ch; let v = (data[o] << 16) | (data[o + 1] << 8) | data[o + 2];
      if (v === 0x800000) continue;
      if (v > 0x800000) v -= 0x1000000;
      const code = Math.round((v * 0.01 + 100) * 10);
      if (code < 0 || code >= NODATA) continue;
      for (let sy = 0; sy < scale; sy++) {
        const gy = originY + py * scale + sy; if (gy < 0 || gy >= H) continue;
        for (let sx = 0; sx < scale; sx++) {
          const gx = originX + px * scale + sx; if (gx < 0 || gx >= W) continue;
          const gi = gy * W + gx; if (grid[gi] === NODATA) grid[gi] = code;
        }
      }
    }
  }
}
async function loadTiles() {
  const jobs = [];
  for (let ty = TY0; ty <= TY1; ty++) for (let tx = TX0; tx <= TX1; tx++) jobs.push([tx, ty]);
  let next = 0, doneN = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const [tx, ty] = jobs[next++];
      let got = false;
      for (const kind of ['dem5a_png', 'dem5b_png', 'dem5c_png']) {
        const buf = await fetchTileCached(kind, Z, tx, ty);
        if (buf) { decodeElevInto(pngDecode(buf), tx, ty, Z); stats['from' + kind.slice(3, 5)]++; got = true; break; }
      }
      if (!got) {
        const buf = await fetchTileCached('dem_png', Z - 1, tx >> 1, ty >> 1);
        if (buf) { decodeElevInto(pngDecode(buf), tx >> 1, ty >> 1, Z - 1); stats.from14++; } else stats.missing++;
      }
      doneN++; if (doneN % 100 === 0 || doneN === jobs.length) log(`タイル ${doneN}/${jobs.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONC, jobs.length) }, worker));
}

// ---------- 視域計算(R2: 山頂から窓の縁の全画素へ光線) ----------
/** 山頂の標高と「山頂部の広がり」。目的点は1画素だが、火口の縁(富士山)や山頂の平らな部分では、その1点が
 *  縁や隣の画素に隠れて「見えない」になる(アプリと同じ式でも同じ)。そこで、山頂から SUMMIT_DROP_M 以内の高さの画素が
 *  山頂から最も遠い距離を「山頂部の広がり」とし、その範囲の地形は遮蔽に数えない(アプリの目的点側除外15mの一般化)。
 *  山頂標高は3×3画素の最大(画素の中心が最高点から少しずれる分の補正)。 */
function summitInfo() {
  let hS = -Infinity;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const c = grid[(CY + dy) * W + (CX + dx)]; if (c !== NODATA) hS = Math.max(hS, c / 10 - 100); }
  if (hS === -Infinity) hS = M.elev;
  const rPx = Math.ceil(SUMMIT_SEARCH_M / MPP); let far = 0, nCap = 0;
  for (let dy = -rPx; dy <= rPx; dy++) for (let dx = -rPx; dx <= rPx; dx++) {
    const x = CX + dx, y = CY + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const c = grid[y * W + x]; if (c === NODATA) continue;
    const dM = Math.sqrt(dx * dx + dy * dy) * MPP; if (dM > SUMMIT_SEARCH_M) continue;
    if (c / 10 - 100 >= hS - SUMMIT_DROP_M) { nCap++; if (dM > far) far = dM; }
  }
  const auto = Math.max(15, Math.ceil(far));
  return { hS, capPx: nCap, capFarM: +far.toFixed(1), exclTargetM: EXCL_TARGET_ARG !== null ? EXCL_TARGET_ARG : auto, exclAuto: EXCL_TARGET_ARG === null };
}
function computeViewshed(hS) {
  const visible = new Uint8Array(W * H);           // 1=見える 0=見えない/データ無し 2=山頂
  const inv2R = (1 - K) / (2 * R_EARTH);           // 1/(2·Reff), Reff = R/(1−k)
  const exclObsPx = Math.ceil(EXCL_OBS_M / MPP), exclTgtPx = Math.ceil(EXCL_TGT_M / MPP);
  const maxSteps = 2 * halfPx + 2;
  const thetaT = new Float64Array(maxSteps);        // 光線上の地形の見かけ高度角(手前から)
  const prefix = new Float64Array(maxSteps);        // 手前までの最大(除外画素を除く)
  let raysDone = 0;
  const walk = (ex, ey) => {
    const dx = ex - CX, dy = ey - CY; const steps = Math.max(Math.abs(dx), Math.abs(dy)); if (steps === 0) return;
    const sx = dx / steps, sy = dy / steps;
    let runMax = -Infinity;
    for (let s = 1; s <= steps; s++) {
      const px = Math.round(CX + sx * s), py = Math.round(CY + sy * s);
      const gi = py * W + px; const code = grid[gi];
      const dM = Math.sqrt((px - CX) * (px - CX) + (py - CY) * (py - CY)) * MPP;
      let th = -Infinity;
      if (code !== NODATA) {
        const h = code / 10 - 100; const drop = dM * dM * inv2R;
        th = (h - drop - hS) / dM;                                   // 地形の見かけ高度角(山頂から)
        const thP = (h + OBS_H - drop - hS) / dM;                   // 観測者(地上+OBS_H)の見かけ高度角
        // 手前の地形の最大(観測者側の除外=直前exclObsPx画素を除く。目的点側の除外=最初のexclTgtPx画素はprefixに入れない)
        const refIdx = s - 1 - exclObsPx;
        const ref = refIdx >= 1 ? prefix[refIdx] : -Infinity;
        if (thP >= ref) visible[gi] = 1;
      }
      thetaT[s] = th;
      if (s > exclTgtPx) runMax = Math.max(runMax, th);
      prefix[s] = runMax;
    }
    raysDone++;
  };
  for (let x = 0; x < W; x++) { walk(x, 0); walk(x, H - 1); }
  for (let y = 1; y < H - 1; y++) { walk(0, y); walk(W - 1, y); }
  visible[CY * W + CX] = 2;
  let nVis = 0; for (let i = 0; i < visible.length; i++) if (visible[i] === 1) nVis++;
  return { visible, nVis, rays: raysDone };
}

// ---------- 島(8近傍の連結成分。行の連(run)の合併で省メモリ) ----------
function labelIslands(visible) {
  const runs = [];          // [y, x0, x1, parent]
  const rowStart = new Int32Array(H + 1);
  for (let y = 0; y < H; y++) {
    rowStart[y] = runs.length; const o = y * W;
    for (let x = 0; x < W; x++) {
      if (visible[o + x] === 1) { const x0 = x; while (x + 1 < W && visible[o + x + 1] === 1) x++; runs.push([y, x0, x, runs.length]); }
    }
  }
  rowStart[H] = runs.length;
  const find = i => { while (runs[i][3] !== i) { runs[i][3] = runs[runs[i][3]][3]; i = runs[i][3]; } return i; };
  const union = (a, b) => { a = find(a); b = find(b); if (a !== b) runs[b][3] = a; };
  for (let y = 1; y < H; y++) {
    let j = rowStart[y - 1]; const jEnd = rowStart[y];
    for (let i = rowStart[y]; i < rowStart[y + 1]; i++) {
      const r = runs[i];
      while (j < jEnd && runs[j][2] < r[1] - 1) j++;
      for (let k = j; k < jEnd && runs[k][1] <= r[2] + 1; k++) union(i, k);
    }
  }
  const comp = new Map();   // root -> {px, sx, sy, minx, miny, maxx, maxy, runs:[]}
  for (let i = 0; i < runs.length; i++) {
    const r = runs[i]; const root = find(i); let c = comp.get(root);
    if (!c) { c = { px: 0, sx: 0, sy: 0, minx: r[1], maxx: r[2], miny: r[0], maxy: r[0], runs: [] }; comp.set(root, c); }
    const n = r[2] - r[1] + 1; c.px += n; c.sx += (r[1] + r[2]) / 2 * n; c.sy += r[0] * n;
    if (r[1] < c.minx) c.minx = r[1]; if (r[2] > c.maxx) c.maxx = r[2]; if (r[0] < c.miny) c.miny = r[0]; if (r[0] > c.maxy) c.maxy = r[0];
    c.runs.push(i);
  }
  const islands = [];
  for (const c of comp.values()) {
    const cx = c.sx / c.px, cy = c.sy / c.px;
    // 代表点=重心に一番近い画素(必ず島の中)
    let best = null, bd = Infinity;
    for (const ri of c.runs) { const r = runs[ri]; const x = Math.min(Math.max(Math.round(cx), r[1]), r[2]); const d = (x - cx) * (x - cx) + (r[0] - cy) * (r[0] - cy); if (d < bd) { bd = d; best = [x, r[0]]; } }
    islands.push({ px: c.px, cx, cy, rep: best, bbox: [c.minx, c.miny, c.maxx, c.maxy], runs: c.runs });
  }
  // 項番=代表点を北から南(同じなら東から西)に並べた固定番号(Q2)。北=小さいy、東=大きいx
  islands.sort((a, b) => (a.rep[1] - b.rep[1]) || (b.rep[0] - a.rep[0]));
  islands.forEach((isl, i) => { isl.no = i + 1; });
  return { runs, islands };
}
// 島の外周をたどる(Moore近傍・8連結。穴は省略)。bbox内の小さなビットマップで処理する
function traceOutline(visible, isl) {
  const [minx, miny, maxx, maxy] = isl.bbox; const bw = maxx - minx + 3, bh = maxy - miny + 3;
  const bm = new Uint8Array(bw * bh);
  // このコンポーネントの画素だけを立てる(bboxに他の島が混ざっても外周は正しい)
  for (const ri of isl.runs) { const r = isl._runs[ri]; const by = r[0] - miny + 1; for (let x = r[1]; x <= r[2]; x++) bm[by * bw + (x - minx + 1)] = 1; }
  const at = (x, y) => (x >= 0 && y >= 0 && x < bw && y < bh) ? bm[y * bw + x] : 0;
  // 開始点=最上段の最左画素。境界は画素の左上角を頂点にした格子上の輪郭(square tracing)
  let sx = -1, sy = -1;
  for (let y = 0; y < bh && sy < 0; y++) for (let x = 0; x < bw; x++) if (bm[y * bw + x]) { sx = x; sy = y; break; }
  // 画素の縁を辿る(右手法: 内側を左に見て進む)。方向: 0=東 1=南 2=西 3=北。頂点座標は画素の角
  const ring = []; let x = sx, y = sy, dir = 0;   // 開始頂点=画素(sx,sy)の左上角、東へ
  const startX = x, startY = y; let guard = 0;
  do {
    ring.push([x, y]);
    // 次の方向を決める: 前方左の画素と前方右の画素で判定(格子の辺に沿って進む)
    const dxs = [1, 0, -1, 0], dys = [0, 1, 0, -1];
    const fx = x + dxs[dir], fy = y + dys[dir];
    // 進行方向の辺の両側の画素: 左側と右側(dirに対して)
    const leftPix = (d, vx, vy) => d === 0 ? at(vx, vy - 1) : d === 1 ? at(vx, vy) : d === 2 ? at(vx - 1, vy) : at(vx - 1, vy - 1);
    const rightPix = (d, vx, vy) => d === 0 ? at(vx, vy) : d === 1 ? at(vx - 1, vy) : d === 2 ? at(vx - 1, vy - 1) : at(vx, vy - 1);
    // 現在の辺(x,y)->(fx,fy)は「左が外(0)・右が内(1)」の向きで進む(時計回りに外周)
    x = fx; y = fy;
    // 次の辺: 左折できるか(左前が内)、直進か、右折か
    const dl = (dir + 3) % 4, dr = (dir + 1) % 4;
    if (rightPix(dl, x, y) === 1 && leftPix(dl, x, y) === 0) dir = dl;
    else if (rightPix(dir, x, y) === 1 && leftPix(dir, x, y) === 0) { /* 直進 */ }
    else if (rightPix(dr, x, y) === 1 && leftPix(dr, x, y) === 0) dir = dr;
    else dir = (dir + 2) % 4;   // 行き止まり(1画素幅の突起): 折り返す
    if (++guard > 8 * (bw + bh) * 4 + 100000) break;
  } while (!(x === startX && y === startY && dir === 0) && guard < 20000000);
  ring.push([startX, startY]);
  // 直線上の中間点を落とす(格子の辺の連続)+1画素の許容で間引き
  const simp = [];
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i]; const q = simp[simp.length - 1], o = simp[simp.length - 2];
    if (q && o && ((o[0] === q[0] && q[0] === p[0]) || (o[1] === q[1] && q[1] === p[1]))) simp[simp.length - 1] = p; else simp.push(p);
  }
  return simp.map(([bx, by]) => [xToLon(X0 + bx - 1 + minx), yToLat(Y0 + by - 1 + miny)]);
}

// ---------- 答え合わせ(アプリの _visJudgeCore と同じ歩き方で標本画素を判定) ----------
function judgeLikeApp(px, py, hS, inv2R) {
  const scale15 = Math.pow(2, 15), R128 = 128 / Math.PI;
  const gpy15At = (lat) => (128 - R128 * Math.atanh(Math.sin(lat * Math.PI / 180))) * scale15;
  const elevAt = (gx15, gy15) => {   // z15の世界画素→窓の格子(zoomがZの格子へ換算)
    const f = Math.pow(2, Z - 15); const gx = Math.floor(gx15 * f) - X0, gy = Math.floor(gy15 * f) - Y0;
    if (gx < 0 || gy < 0 || gx >= W || gy >= H) return null; const c = grid[gy * W + gx]; return c === NODATA ? null : c / 10 - 100;
  };
  const sLat = yToLat(Y0 + py + 0.5), sLng = xToLon(X0 + px + 0.5);
  const c0 = grid[py * W + px]; if (c0 === NODATA) return null;
  const startTotal = c0 / 10 - 100 + OBS_H;
  const endLat = yToLat(Y0 + CY + 0.5), endLng = xToLon(X0 + CX + 0.5), endTotal = hS;
  const rad = Math.PI / 180, la1 = sLat * rad, la2 = endLat * rad, sdl = Math.sin((endLat - sLat) * rad / 2), sdn = Math.sin((endLng - sLng) * rad / 2);
  const a = sdl * sdl + Math.cos(la1) * Math.cos(la2) * sdn * sdn; const distM = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const stepM = 40075016.686 * Math.cos(sLat * Math.PI / 180) / (scale15 * 256) / 2;
  const steps = Math.max(2, Math.ceil(distM / stepM));
  const sx15 = 128 * (sLng / 180 + 1) * scale15; const dx = (128 * (endLng / 180 + 1) * scale15 - sx15) / steps; const dLat = endLat - sLat;
  const endDrop = distM * distM * inv2R;
  for (let j0 = 1; j0 < steps; j0 += 64) {
    const j1 = Math.min(j0 + 63, steps - 1); const gyA = gpy15At(sLat + dLat * (j0 / steps)); const dgy = (j1 > j0) ? (gpy15At(sLat + dLat * (j1 / steps)) - gyA) / (j1 - j0) : 0;
    for (let j = j0; j <= j1; j++) {
      const e = elevAt((sx15 + dx * j) | 0, (gyA + dgy * (j - j0)) | 0); if (e === null) continue;
      const r = j / steps, d = distM * r; const lineElev = startTotal + (endTotal - endDrop - startTotal) * r;
      if (e - d * d * inv2R > lineElev) { if (distM * (1 - r) <= EXCL_TGT_M) continue; if (d <= EXCL_OBS_M) continue; return false; }
    }
  }
  return true;
}

// ---------- メイン ----------
(async () => {
  const t0 = Date.now();
  await loadTiles();
  let nData = 0; for (let i = 0; i < grid.length; i++) if (grid[i] !== NODATA) nData++;
  log(`タイル取得完了: 5A ${stats.from5a} 5B ${stats.from5b} 5C ${stats.from5c} z14 ${stats.from14} 無し ${stats.missing}。データ画素 ${nData}/${W * H}`);
  const t1 = Date.now();
  const SI = summitInfo(); const hS = SI.hS; EXCL_TGT_M = SI.exclTargetM;
  log(`山頂: DEM標高 ${hS}m(一覧 ${M.elev}m) 山頂部(−${SUMMIT_DROP_M}m以内)の広がり ${SI.capFarM}m(${SI.capPx}画素) → 目的点側の除外半径 ${EXCL_TGT_M}m${SI.exclAuto ? '(自動)' : '(指定)'}`);
  const { visible, nVis, rays } = computeViewshed(hS);
  const t2 = Date.now();
  log(`視域計算: 光線${rays}本 見える画素 ${nVis} (${(100 * nVis / Math.max(1, nData)).toFixed(2)}%)  ${((t2 - t1) / 1000).toFixed(1)}s`);
  const { runs, islands } = labelIslands(visible);
  islands.forEach(i => { i._runs = runs; });
  const t3 = Date.now();
  log(`島: ${islands.length}個 (最大 ${Math.max(...islands.map(i => i.px))}画素)  ${((t3 - t2) / 1000).toFixed(1)}s`);
  // 答え合わせ
  let agree = 0, checked = 0, disagreeVis = 0, disagreeInv = 0;
  if (CHECK_N > 0) {
    const inv2R = (1 - K) / (2 * R_EARTH); let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    while (checked < CHECK_N) {
      const px = Math.floor(rnd() * W), py = Math.floor(rnd() * H); if (px === CX && py === CY) continue;
      const v = visible[py * W + px]; if (grid[py * W + px] === NODATA) continue;
      const ref = judgeLikeApp(px, py, hS, inv2R); if (ref === null) continue;
      checked++; if ((v === 1) === ref) agree++; else if (v === 1) disagreeVis++; else disagreeInv++;
    }
    log(`答え合わせ(アプリと同じ歩き方・${checked}画素): 一致 ${agree} (${(100 * agree / checked).toFixed(2)}%) 道具だけ見える ${disagreeVis} アプリだけ見える ${disagreeInv}`);
  }
  // 出力
  const outDir = path.join(OUT_ROOT, `${ID}-${RANGE_KM}km-z${Z}-${CANOPY ? 'canopy' : 'terrain'}`);
  fs.mkdirSync(outDir, { recursive: true });
  const bits = Buffer.alloc(Math.ceil(W * H / 8));
  for (let i = 0; i < visible.length; i++) if (visible[i] === 1) bits[i >> 3] |= (128 >> (i & 7));
  fs.writeFileSync(path.join(outDir, 'visible.bin'), bits);
  const pxArea = MPP * MPP;
  const distKm = (isl) => Math.hypot(isl.rep[0] - CX, isl.rep[1] - CY) * MPP / 1000;
  const idx = islands.map(i => ({ no: i.no, px: i.px, area_km2: +(i.px * pxArea / 1e6).toFixed(4), rep: [+yToLat(Y0 + i.rep[1] + 0.5).toFixed(6), +xToLon(X0 + i.rep[0] + 0.5).toFixed(6)],
    bbox: [+xToLon(X0 + i.bbox[0]).toFixed(6), +yToLat(Y0 + i.bbox[3] + 1).toFixed(6), +xToLon(X0 + i.bbox[2] + 1).toFixed(6), +yToLat(Y0 + i.bbox[1]).toFixed(6)], dist_km: +distKm(i).toFixed(2) }));
  fs.writeFileSync(path.join(outDir, 'islands.json'), JSON.stringify({ mountain: { id: M.id, name: M.name }, count: idx.length, islands: idx }));
  // 輪郭: 大きい順にOUTLINE_N島は外周をたどる。それ以外は代表点の画素の四角
  const byArea = islands.slice().sort((a, b) => b.px - a.px);
  const feats = [];
  for (let i = 0; i < byArea.length; i++) {
    const isl = byArea[i]; let coords;
    if (i < OUTLINE_N && isl.px >= 2) coords = traceOutline(visible, isl);
    else { const [x, y] = isl.rep; coords = [[xToLon(X0 + x), yToLat(Y0 + y)], [xToLon(X0 + x + 1), yToLat(Y0 + y)], [xToLon(X0 + x + 1), yToLat(Y0 + y + 1)], [xToLon(X0 + x), yToLat(Y0 + y + 1)], [xToLon(X0 + x), yToLat(Y0 + y)]]; }
    feats.push({ type: 'Feature', properties: { no: isl.no, px: isl.px, area_km2: +(isl.px * pxArea / 1e6).toFixed(4), dist_km: +distKm(isl).toFixed(2), outline: i < OUTLINE_N && isl.px >= 2 ? 'traced' : 'pixel' }, geometry: { type: 'Polygon', coordinates: [coords.map(c => [+c[0].toFixed(6), +c[1].toFixed(6)])] } });
  }
  fs.writeFileSync(path.join(outDir, 'islands.geojson'), JSON.stringify({ type: 'FeatureCollection', features: feats }));
  // プレビュー(縮小): 見える割合を金色の濃さに。山頂は赤
  if (PREVIEW > 0) {
    const S = Math.max(1, Math.ceil(W / PREVIEW)); const pw = Math.ceil(W / S), ph = Math.ceil(H / S); const rgb = Buffer.alloc(pw * ph * 3);
    const cnt = new Uint32Array(pw * ph), tot = new Uint32Array(pw * ph);
    for (let y = 0; y < H; y++) { const oy = Math.floor(y / S) * pw; for (let x = 0; x < W; x++) { const gi = y * W + x; const pi = oy + Math.floor(x / S); if (grid[gi] !== NODATA) tot[pi]++; if (visible[gi] === 1) cnt[pi]++; } }
    for (let i = 0; i < pw * ph; i++) { const f = tot[i] ? cnt[i] / tot[i] : 0; const base = tot[i] ? 40 : 15; rgb[i * 3] = Math.round(base + (255 - base) * f); rgb[i * 3 + 1] = Math.round(base + (215 - base) * f); rgb[i * 3 + 2] = Math.round(base * (1 - f)); }
    const spx = Math.floor(CX / S), spy = Math.floor(CY / S);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const x = spx + dx, y = spy + dy; if (x >= 0 && y >= 0 && x < pw && y < ph) { const i = (y * pw + x) * 3; rgb[i] = 255; rgb[i + 1] = 40; rgb[i + 2] = 40; } }
    fs.writeFileSync(path.join(outDir, 'preview.png'), pngEncodeRGB(pw, ph, rgb));
  }
  const meta = { tool: 'tools/kashimap/viewshed.js', version: 1, generated: new Date().toISOString(), mountain: { id: M.id, name: M.name, peak: M.peak, elev_list: M.elev, elev_dem: hS, lat: M.lat, lon: M.lon },
    range_km: RANGE_KM, zoom: Z, canopy: CANOPY, buildings: false, observer_h_m: OBS_H, k: K, earth_radius_m: R_EARTH, reff_m: R_EARTH / (1 - K),
    excl_target_m: EXCL_TGT_M, excl_target_how: SI.exclAuto ? `自動: 山頂から${SUMMIT_DROP_M}m以内の高さの画素が山頂から最も遠い距離(${SI.capFarM}m・${SI.capPx}画素。探索半径${SUMMIT_SEARCH_M}m)。最小15m` : '指定値', summit_elev_how: '3×3画素のDEM最大', excl_observer_m: EXCL_OBS_M,
    grid: { w: W, h: H, x0: X0, y0: Y0, mpp_center: +MPP.toFixed(4), note: '1画素の大きさは中心緯度の値で一定とした(窓の中で約±0.4%の差)' },
    dem: { sources: 'cyberjapandata.gsi.go.jp dem5a_png/dem5b_png/dem5c_png(z15)→dem_png(z14, 最近傍で2倍)', tiles: NT, from5a: stats.from5a, from5b: stats.from5b, from5c: stats.from5c, from14: stats.from14, missing: stats.missing, data_px: nData },
    method: 'R2: 山頂から窓の縁の全画素へ光線。見かけ高度角=(h−d²/(2Reff)−hS)/d の最大を更新。観測者=地上+observer_h。除外=目的点側(山頂部の広がり・上記)・観測点側10m(式と観測点側はアプリの統一可視判定と同じ。目的点側はアプリの15mを山頂部の広がりへ一般化)',
    result: { visible_px: nVis, visible_km2: +(nVis * pxArea / 1e6).toFixed(3), islands: islands.length, rays, check: { n: checked, agree, agree_pct: checked ? +(100 * agree / checked).toFixed(2) : null, tool_only_visible: disagreeVis, app_only_visible: disagreeInv } },
    timing_s: { tiles: +((t1 - t0) / 1000).toFixed(1), viewshed: +((t2 - t1) / 1000).toFixed(1), islands: +((t3 - t2) / 1000).toFixed(1), total: +((Date.now() - t0) / 1000).toFixed(1) },
    attribution: '国土地理院 標高タイル(DEM5A/5B/5C/10B)を加工して作成。日本の主な山岳標高(国土地理院)を加工して作成' };
  fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 1));
  log(`出力: ${outDir} (visible.bin ${(bits.length / 1e6).toFixed(1)}MB, islands ${idx.length}, geojson ${feats.length}件)  合計 ${meta.timing_s.total}s`);
})().catch(e => { console.error('ERROR', e); process.exit(1); });
