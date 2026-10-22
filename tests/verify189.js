// 第185ラウンド検証: v1.99.2 — ①不具合4件(File取得/結果リストの列名「標高グラフ」→「可視判定」・辻メッシュ/辻検索の File取得は2度押しでキャンセル・巨大 CSV は parts の Blob)+写位ボタンの幅
// ②端末のデータ(建物と本体の控えの最終更新日時・上限(MB)の空欄=既定の案内) ③ワーカープールの予約(SORA.WORKERS・CPU−1) ④ヘルプの節「オフライン時のデータについて」 ⑤アイコン 192/512(manifest・precache・同期) ⑥公開文(正式なリリースノート・お知らせ・FAQ)
// 方式: 静的な形(S)+実機(Playwright。外部は route abort)。
'use strict';
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = 'http://127.0.0.1:8099';
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'];
let PASS = 0, FAIL = 0;
const check = (n, ok, d) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? '  ' + d : ''}`); ok ? PASS++ : FAIL++; };
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const src = rd('script.js'), html = rd('index.html'), consts = rd('sora-constants.js'), css = rd('style.css'), pre = rd('sw-precache.js'), sync = rd('tests/harness/sync-apptest.py'), tool = rd('tools/sw/build-precache.js');
const APP_VER = (/APP_VERSION = '([^']+)'/.exec(consts) || [])[1];
const pngSize = (f) => { const b = fs.readFileSync(path.join(ROOT, f)); return b.length > 24 && b.toString('latin1', 1, 4) === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };

// ---- V0: 版のピン(最新の verify が持つ) ----
const _atLeast = (v, w) => { const a = String(v).split('.').map(Number), b = w.split('.').map(Number); for (let i = 0; i < 3; i++) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0); } return true; };
check('V0 版は 1.99.2 以上(第186で 1.99.3 へ。版のピンは最新の verify190 が持つ)+移行用 meta は無い(第186で削除)+Version History に 1.99.2 の行が第185で残る',
  _atLeast(APP_VER, '1.99.2') && !/<meta name="app-version"/.test(html) &&
  /Version 1\.99\.2 - 2026-10-21: [^\n]*第185ラウンド/.test(src) && (src.match(/^Version (\d+\.\d+\.\d+) - /m) || [])[1] === APP_VER);

// ---- S1: 不具合4件(静的) ----
check('S1 不具合(静的): File取得 CSV と結果リスト(thead 4つ・並べ替え 4つ)の列名が「可視判定」で「標高グラフ」の列は無い・CSV は parts の配列を downloadTextFile へ(join しない・Blob は配列を受ける)・辻メッシュ File取得は _tmFileBusy/_tmFileCancel/_tmExportGen で2度押し=キャンセルと途中の中断(閉じた時・入力エラーでも予約を消す)・辻検索 File取得も _tsujiFileGen で2度押し=キャンセル・#btn-photo-pos が 46px の並び',
  src.includes("'辻オフセット回転角','辻オフセット回転仰角','オフセット中心角','可視判定',") && !src.includes("'標高グラフ',") && (src.match(/<th>可視判定<\/th>/g) || []).length === 4 && !src.includes('<th>標高グラフ</th>') &&
  (src.match(/\{ label: '可視判定', compare:/g) || []).length === 4 && !src.includes("label: '標高グラフ'") &&
  src.includes("downloadTextFile(filename, parts);") && !src.includes("const csv = parts.join('');") && src.includes("const blob = new Blob(Array.isArray(text) ? text : [text], { type: mime });") && src.includes("if (isCanceled && isCanceled()) return false;") &&
  src.includes("let _tmFileCsvPending = false, _tmFileBusy = false, _tmExportGen = 0;") && src.includes("function _tmFileCancel(cancelSearch, msg) {") && src.includes("if (_tmFileBusy) { _tmFileCancel(true, '(File取得をキャンセルしました)'); return; }") &&
  src.includes(".finally(() => { if (exportGen === _tmExportGen) _tmFileSetBusy(false); });") && src.includes("if (_tmFileBusy) _tmFileCancel(false, null);") && src.includes("if (_tmFileBusy && !_tmFileCsvPending) _tmFileCancel(false, null);") && (src.match(/if \(_tmFileBusy \|\| _tmFileCsvPending\) _tmFileCancel\(false, null\);/g) || []).length === 3 && src.includes("if (typeof _tmFileCancel === 'function' && (_tmFileBusy || _tmFileCsvPending)) _tmFileCancel(false, null);") &&
  src.includes("const canceled = () => gen !== _tmExportGen;") && (src.match(/if \(canceled\(\)\) return;/g) || []).length >= 3 && src.includes("if (!ok || canceled()) return;") &&
  src.includes("let _tsujiFileRunning = false, _tsujiFileGen = 0;") && (src.match(/if \(gen !== _tsujiFileGen\) return;/g) || []).length === 4 && src.includes("undefined, () => gen !== _tsujiFileGen);") && src.includes("if (!ok || gen !== _tsujiFileGen) return;") && src.includes("if (gen === _tsujiFileGen) { _tsujiFileRunning = false; hideTsujiProgress(); if (btn) btn.classList.remove('active'); }") &&
  /#btn-now,\n#btn-gps,\n#btn-photo-pos,\n#btn-reg-start,/.test(css));

// ---- S2: 端末のデータ・ワーカー・ヘルプ(静的) ----
check('S2 端末のデータ/ワーカー/ヘルプ(静的): 建物と本体の控えの「最終更新日時」(id と put・_swStat の last=date ヘッダ)・上限(MB)の tooltip 5つに「空欄にすると既定(1024MB)に戻ります」・SORA.WORKERS(RESERVE 1/MIN 2/MAX 31/TOUCH_MAX 6/MOV_MAX 4)と _poolSize() を5つのプール+動画が使い「CPU+1」の式が残っていない・ヘルプ「オフライン時のデータについて」の節(4項目)が「地図上の線について」(3項目)の前・File取得の項(辻検索・辻メッシュ)・「可視判定」列の説明・本体の控えは件数・版・最終更新日時',
  html.includes('id="backup-bldg-updated"') && html.includes('id="backup-shell-updated"') && src.includes("put('backup-bldg-updated', when(bg.last || 0));") && src.includes("put('backup-shell-updated', when(sw.last || 0));") &&
  src.includes("const d = Date.parse(r.headers.get('date') || ''); if (d > out.last) out.last = d;") && src.includes("const out = { n: 0, bytes: 0, vers: [], last: 0 };") &&
  (html.match(/空欄にすると既定\(1024MB\)に戻ります/g) || []).length === 5 && html.includes('空欄にすると既定 (1024MB) に戻ります。') &&
  /const WORKERS = Object\.freeze\(\{[\s\S]*?RESERVE: 1,[\s\S]*?MIN: 2,[\s\S]*?MAX: 31,[\s\S]*?TOUCH_MAX: 6,[\s\S]*?MOV_MAX: 4,[\s\S]*?\}\);/.test(consts) && consts.includes('TILE_STORE, STORE, WORKERS,') &&
  src.includes('function _poolSize(touchMax) {') && src.includes('const DP_POOL_SIZE = _poolSize();') && src.includes('const POOL = _poolSize();') && src.includes('const TSUJI_NUM_WORKERS = _poolSize(SORA.WORKERS.TOUCH_MAX);') &&
  src.includes('const n = Math.min(SORA.WORKERS.MOV_MAX, _poolSize());') && src.includes('const SORA_TERRAIN_POOL_SIZE = _poolSize();') && !src.includes('hardwareConcurrency || 6) + 1') &&
  (() => { const a = html.indexOf('<h3>オフライン時のデータについて</h3>'), b = html.indexOf('<h3>地図上の線について</h3>'); if (a < 0 || b < 0 || a > b) return false; const sec = html.slice(a, b);
    const keys = ['<li><strong>地理タイル / 標高タイル (端末の控え)</strong>', '<li><strong>本体の控え (オフライン用)</strong>', '<li><strong>端末のデータ</strong>', '<li><strong>オフラインでの利用方法</strong>'];
    let pos = -1; for (const k of keys) { const i = sec.indexOf(k); if (i < pos) return false; pos = i; }
    const lines = html.slice(b, html.indexOf('</section>', b)); return (lines.match(/<li>/g) || []).length === 3 && lines.includes('<li><strong>方位線') && !lines.includes('端末の控え'); })() &&
  (html.match(/<li><strong>File取得<\/strong>: /g) || []).length === 2 && html.includes('実行中にもう一度押すと、その取得をキャンセルします。') && html.includes('「可視判定」列に表示 (v1.99.2 で「標高グラフ」から改名)') && html.includes('「本体の控え」に件数・版・最終更新日時が出れば完了'));

// ---- S3: アイコン・配信の一覧・公開文 ----
check('S3 アイコン(icon-192.png/icon-512.png が PNG でその大きさ・manifest に 192/512 の項・sw-precache と --check の FIXED とハーネスの同期の一覧に入る)・公開文(正式なリリースノート docs/release-notes/v1.99.2.md・お知らせに「可視判定」と過去の重要なお知らせ・トップページは記事へのリンク・FAQ に最終更新日時・docs/note の起草版は無い)',
  JSON.stringify(pngSize('icon-192.png')) === '[192,192]' && JSON.stringify(pngSize('icon-512.png')) === '[512,512]' &&
  (() => { const m = JSON.parse(rd('manifest.json')); return m.icons.some(i => i.src === 'icon-192.png' && i.sizes === '192x192') && m.icons.some(i => i.src === 'icon-512.png' && i.sizes === '512x512'); })() &&
  pre.includes("'icon-192.png',") && pre.includes("'icon-512.png',") && tool.includes("'icon-192.png', 'icon-512.png',") && sync.includes("'icon-192.png', 'icon-512.png',") &&
  fs.existsSync(path.join(ROOT, 'docs/release-notes/v1.99.3.md')) && rd('docs/release-notes/v1.99.3.md').startsWith('# 宙の辻 v1.99.3 リリースのお知らせ')   /* 第186: 配る版に合わせて改名 */ && !fs.existsSync(path.join(ROOT, 'docs/note/note-release-v1.99.md')) &&
  rd('docs/note/note-important-notice-page.md').includes('「標高グラフ」(可視判定の結果 OK/NG/-)が「可視判定」になります') && rd('docs/note/note-important-notice-page.md').includes('## ■2026/08/17 【重要】旧バックアップとの互換性について') && rd('docs/note/note-important-notice-page.md').includes('## ■2026/03/04 サイト移転') &&
  rd('docs/note/note-top-page.md').includes('- こちら (重要なお知らせの記事。') && !rd('docs/note/note-top-page.md').includes('## **■2026/08/17') && rd('docs/note/note-faq-page.md').includes('件数・版・最終更新日時が出れば完了'));

(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true, args: ARGS });
  const ctx = await b.newContext({ viewport: { width: 900, height: 900 }, timezoneId: 'Asia/Tokyo' });
  await ctx.route('**/*', route => { route.request().url().startsWith(BASE) ? route.continue() : route.abort(); });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('dialog', d => d.accept());
  await p.goto(BASE + '/index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof _poolSize === 'function' && typeof fileTsujiMeshCsv === 'function' && typeof _tmFileCancel === 'function', { timeout: 8000 });
  await p.waitForTimeout(400);

  // A1: ワーカーの数・downloadTextFile の配列・写位ボタンの幅・ヘルプの DOM
  const a1 = await p.evaluate(async () => {
    const cpu = navigator.hardwareConcurrency || 6;
    const r = { cpu, pool: _poolSize(), dp: DP_POOL_SIZE, terrain: SORA_TERRAIN_POOL_SIZE, tsuji: TSUJI_NUM_WORKERS, expect: Math.max(2, Math.min(cpu - 1, 31)), ver: APP_VERSION };
    let got = null; const oc = URL.createObjectURL, ok = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = (bl) => { got = bl; return 'blob:x'; }; HTMLAnchorElement.prototype.click = () => {};
    try { downloadTextFile('t.csv', ['﻿a,b\r\n', '1,2\r\n']); r.blobSize = got && got.size; r.blobType = got && got.type; r.text = got ? await got.text() : null; } finally { URL.createObjectURL = oc; HTMLAnchorElement.prototype.click = ok; }
    r.photoW = getComputedStyle(document.getElementById('btn-photo-pos')).width; r.gpsW = getComputedStyle(document.getElementById('btn-gps')).width;   // メニューが閉じていても CSS の幅は読める
    const h3s = [...document.querySelectorAll('.help-section h3')].map(e => e.textContent);
    const i1 = h3s.indexOf('オフライン時のデータについて'), i2 = h3s.indexOf('地図上の線について');
    const sec = document.querySelectorAll('.help-section')[i1];
    r.helpOrder = i1 >= 0 && i2 === i1 + 1; r.helpLis = sec ? sec.querySelectorAll('li').length : -1;
    return r;
  });
  check('A1 実機: _poolSize()=max(2, min(CPU−1, 31)) で辻ライン/地形/辻検索のプールが同じ値(タッチでない)・downloadTextFile は配列を1つの Blob に(BOM 付き・text/csv)・写位ボタンの幅が GPS と同じ 46px・ヘルプの新しい節が「地図上の線について」の直前で4項目',
    a1.pool === a1.expect && a1.dp === a1.pool && a1.terrain === a1.pool && a1.tsuji === a1.pool && a1.ver === APP_VER && a1.blobSize === new Blob(['﻿a,b\r\n1,2\r\n']).size && /text\/csv/.test(a1.blobType) && a1.text === 'a,b\r\n1,2\r\n' &&   // Blob.text() は BOM を落とす(大きさ 13 で BOM の3バイトを確かめる)
    a1.photoW === a1.gpsW && a1.photoW === '46px' && a1.helpOrder && a1.helpLis === 4, JSON.stringify(a1));

  // A2: File取得の2度押し=キャンセル(辻メッシュ・辻検索)。実行中の印を立てて押すと、予約が消え・印が消え・状態の文が出る
  const a2 = await p.evaluate(() => {
    const r = {};
    _tmFileSetBusy(true); _tmFileCsvPending = true; const g0 = _tmExportGen, m0 = tsujiMeshGeneration;
    fileTsujiMeshCsv();   // 2度押し(confirm は出ない)
    r.tmBusy = _tmFileBusy; r.tmPending = _tmFileCsvPending; r.tmGen = _tmExportGen === g0 + 1; r.meshGen = tsujiMeshGeneration === m0 + 1;
    r.tmBtn = document.getElementById('btn-tsujimesh-file').classList.contains('active'); r.tmStatus = document.getElementById('tsujimesh-status').textContent;
    _tsujiFileRunning = true; const f0 = _tsujiFileGen; document.getElementById('btn-tsuji-file').classList.add('active');
    fileTsujiSearchCsv();
    r.tsRunning = _tsujiFileRunning; r.tsGen = _tsujiFileGen === f0 + 1; r.tsBtn = document.getElementById('btn-tsuji-file').classList.contains('active'); r.tsStatus = document.getElementById('tsujisearch-status').textContent;
    // 閉じた時も予約が消える
    _tmFileSetBusy(true); _tmFileCsvPending = true; appState.isTsujiMeshActive = true; closeTsujiMesh(); r.closeBusy = _tmFileBusy; r.closePending = _tmFileCsvPending;
    return r;
  });
  check('A2 File取得の2度押し: 辻メッシュ=予約が消え・印が消え・世代が進み(検索と出力の両方)・「(File取得をキャンセルしました)」/ 辻検索=同じ / パネルを閉じても予約が消える',
    a2.tmBusy === false && a2.tmPending === false && a2.tmGen && a2.meshGen && a2.tmBtn === false && a2.tmStatus === '(File取得をキャンセルしました)' &&
    a2.tsRunning === false && a2.tsGen && a2.tsBtn === false && a2.tsStatus === '(File取得をキャンセルしました)' && a2.closeBusy === false && a2.closePending === false, JSON.stringify(a2));

  // A3: 端末のデータの行(建物・本体の最終更新日時の欄が埋まる)
  const a3 = await p.evaluate(async () => {
    const sec = document.getElementById('sec-backup'); sec.classList.remove('closed');
    await _bgClear();
    await _mtRefreshBackupRows();
    const g = (id) => document.getElementById(id).textContent;
    const empty = { bldg: g('backup-bldg-updated'), shell: g('backup-shell-updated') };
    await _bgIdb('readwrite', st => st.put({ key: 'x/seed', size: 10, buf: new ArrayBuffer(10), savedAt: new Date(2026, 9, 21, 12, 34, 0).getTime() }));   // 建物の店に1件
    await _mtRefreshBackupRows();
    const seeded = g('backup-bldg-updated');
    await _bgClear();
    const rowAlone = !!document.getElementById('backup-bldg-updated').closest('.control-row') && document.getElementById('backup-bldg-updated').closest('.control-row').querySelectorAll('.km-stat').length === 1;   // 最終更新日時は地理/標高と同じ単独の行
    return { ...empty, seeded, swLast: (await _swStat()).last, rowAlone };
  });
  check('A3 端末のデータの行: 建物/本体の控えの最終更新日時の欄は店が空・SW 無しなら「-」、建物の店に1件入れて描き直すと保存の日時(2026/10/21 12:34)が出る(=行の更新が走っている)・最終更新日時は単独の行(地理/標高と同じ)・_swStat は last を返す',
    a3.bldg === '-' && a3.shell === '-' && /2026/.test(a3.seeded) && /12:34/.test(a3.seeded) && a3.rowAlone && a3.swLast === 0, JSON.stringify(a3));

  check('E ページエラーなし', errs.length === 0, errs.join(' | ').slice(0, 300));
  await b.close();
  console.log(`\n結果: ${PASS} PASS / ${FAIL} FAIL`);
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
