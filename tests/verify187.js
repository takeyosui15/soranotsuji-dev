// 第183ラウンド検証: v1.99.0 — 本体の控え=Service Worker(デッサン35 段1)。
// 圏外でも宙の辻を「開ける」ように本体を版ごとに控える。2フェーズの入れ替え(全部そろって確かめてから切り替え。失敗なら古いまま)。
// 方式: 静的な形(S)+実機(Playwright。serviceWorkers: 'allow'・?sw=1 で登録・オフラインは context.setOffline)。
// 第183の反証レビュー(Workflow)で足した守り(ワーカーの版の引き継ぎ・Cache Storage の破損・版の門番・install 失敗の後始末・転送・5xx・実体のバイト数・meta の版で登録・自分の範囲だけ解除)も S1/S3 で見張る。
// 注意: Playwright の route は SW の前に割り込むので(route を使うと SW が返した応答の x-sora-shell が消える=第183で実測)、この verify だけは route を使わず、
// 外部ホストは Chromium の --host-rules(127.0.0.1 以外を NOTFOUND に)で遮断する(テスト方針「実ネットワークに出ない」は保つ)。
'use strict';
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = 'http://127.0.0.1:8099';
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--host-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'];
let PASS = 0, FAIL = 0;
const check = (n, ok, d) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? '  ' + d : ''}`); ok ? PASS++ : FAIL++; };
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const src = rd('script.js'), html = rd('index.html'), sw = rd('sw.js'), pre = rd('sw-precache.js'), resetJs = rd('reset.js'), resetHtml = rd('reset.html'), consts = rd('sora-constants.js'), sync = rd('tests/harness/sync-apptest.py');
const APP_VER = (/APP_VERSION = '([^']+)'/.exec(consts) || [])[1];   // 第184: 版の唯一の置き場は sora-constants.js
const PRECACHE = [...pre.matchAll(/^  '([^']+)',$/gm)].map(m => m[1]);

// ---- S1: sw.js の形 ----
check('S1 sw.js: 自オリジン(範囲内)の GET だけ・Authorization 付きは触らない・版は sora-constants.js の APP_VERSION(第184・SSOT)・控えは sora-shell-v<版>・install は addAll(cache:reload)+全件の確認→skipWaiting(2フェーズ)・activate で古い sora-shell-* を捨て claim・ページはネット優先(待ち時間→控え)・本体は同じ版なら控え優先/配布直後(ページの版≠SWの版)はネットだけ・控えからの応答に x-sora-shell: cache・importScripts は自オリジンの2本だけ',
  sw.includes("const VER = self.SORA.APP_VERSION;") && sw.includes("const CACHE = 'sora-shell-v' + VER;") && !sw.includes("searchParams.get('v')") &&
  sw.includes("importScripts('sora-constants.js');") && sw.includes("importScripts('sw-precache.js');") && (sw.match(/importScripts\(/g) || []).length === 2 && !/importScripts\(['"]https?:/.test(sw) &&
  sw.includes("if (req.method !== 'GET') return;") && sw.includes("if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE)) return;") && sw.includes("if (req.headers.has('authorization')) return;") &&
  sw.includes("await c.addAll(list.map(u => new Request(new URL(u, SCOPE).href, { cache: 'reload' })));") && sw.includes("throw new Error('precache incomplete: ' + u);") && sw.includes("await self.skipWaiting();") &&
  sw.includes("keys.filter(k => k.startsWith('sora-shell-') && k !== CACHE).map(k => caches.delete(k))") && sw.includes("await self.clients.claim();") &&
  sw.includes("if (req.mode === 'navigate') { e.respondWith(handleNavigate(e, url, key)); return; }") && sw.includes("fetchWithTimeout(url.href, ST.SHELL_NAV_TIMEOUT_MS)") &&
  sw.includes("if (pv && pv !== VER) {   // 配布直後: ページが新しい版(古い控えは使わずネットだけ)。版が読めなかった('unknown')ページはネット→落ちたら控え") && sw.includes("if (v === VER && PRECACHE_KEYS.has(key)) putRuntime(c, key, res.clone());") &&
  sw.includes("h.set('x-sora-shell', 'cache');") && sw.includes("if (cur + len > ST.SHELL_MAX_BYTES) return;") && !/fetch\(['"]https?:/.test(sw) &&
  // 反証レビューで足した守り
  sw.includes("if ((req.destination === 'worker' || req.destination === 'sharedworker') && e.resultingClientId && pv) clientVer.set(e.resultingClientId, pv);") &&
  sw.includes("async function openShell() { try { return await caches.open(CACHE); } catch (_) { return null; } }") && sw.includes("if (!c) return fetch(e.request);") && sw.includes("if (!c) return fetch(req);") &&
  sw.includes("if (pv && pv !== VER) throw new Error('version mismatch: page ' + pv + ' / sw ' + VER);") && sw.includes("const existed = await caches.has(CACHE);") && sw.includes("if (!existed) await caches.delete(CACHE).catch(() => {});") &&
  sw.includes("if (res.redirected) return Response.redirect(res.url, 302);") && sw.includes("if (res.status >= 500) return (await fromShell(e, c, key)) || res;") &&
  sw.includes("const buf = await res.arrayBuffer();") && sw.includes("function keyOf(url) { return url.origin + (url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname); }"));

// ---- S2: 一覧と版の一致 ----
let checkOut = '', checkOk = false;
try { checkOut = execFileSync(process.execPath, [path.join(ROOT, 'tools', 'sw', 'build-precache.js'), '--check'], { encoding: 'utf8' }); checkOk = true; } catch (e) { checkOut = String(e.stdout || '') + String(e.stderr || ''); }
const metaVer = (html.match(/<meta name="app-version" content="([^"]+)"/) || [])[1] || null;   // 第184: meta は廃止(1.99.1 だけ移行用に残す=APP_VERSION と同じ値であること。1.99.2 で消す)
check('S2 sw-precache.js は配信面と一致(build-precache --check)・37件以上・index.html/script.js/sora-constants.js/style.css/vendor 一式/ワーカー7本/フォント/天の川が入り、4K の天の川や data/kashimap は入らない・全ファイルに実体・index.html に版の meta は無い(版は sora-constants.js の1箇所。第184)・script.js の APP_VERSION は SORA.APP_VERSION を読む',
  checkOk && PRECACHE.length >= 37 && ['index.html', 'script.js', 'sora-constants.js', 'style.css', 'three-global.js', 'reset.html', 'reset.js', 'vendor/maplibre-gl.js', 'vendor/three.module.min.js', 'vendor/draco/draco_decoder.wasm', 'vendor/astronomy.browser.min.js', 'fonts/SoraSans/0-255.pbf', 'milkyway-skymap.webp', 'celestial_db.json', 'muni.json',
    'dp-line-worker.js', 'sora-mov-worker.js', 'sora-terrain-worker.js', 'tm-vis-worker.js', 'tsuji-search-worker.js', 'tsujimesh-search-worker.js', 'kashimap-worker.js'].every(f => PRECACHE.includes(f)) &&
  !PRECACHE.includes('milkyway-skymap_4k.webp') && !PRECACHE.some(f => f.startsWith('data/kashimap/')) && !PRECACHE.includes('sw.js') &&
  PRECACHE.every(f => fs.existsSync(path.join(ROOT, f))) && (metaVer === null || metaVer === APP_VER) && /^\d+\.\d+\.\d+$/.test(APP_VER || '') && src.includes('const APP_VERSION = SORA.APP_VERSION;') && !/const APP_VERSION = '\d/.test(src), JSON.stringify({ checkOut: checkOut.trim(), n: PRECACHE.length, metaVer, APP_VER }));

// ---- S3: 本体の配線 ----
check('S3 本体: 登録は https か ?sw=1 の時だけ(register(sw.js)・updateViaCache none・load の1.5秒後・controllerchange で配信中の版が違えば一度だけ読み直し)・前面復帰で1時間ごとの update・_swStat/_swClear・バックアップメニューの「本体の控え(オフライン用)」の行(件数/容量/版/注記/削除)と確認文・reset.js が控えと登録も消す・reset.html の注記・ハーネスの同期に sw.js と sw-precache.js・ヘルプ・SORA.STORE(上限と待ち時間と30日はここ1箇所)',
  src.includes("function _swEnabled() { return ('serviceWorker' in navigator) && (location.protocol === 'https:' || /[?&]sw=1(&|$)/.test(location.search)); }") &&
  src.includes("navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })") && src.includes("navigator.serviceWorker.addEventListener('controllerchange', _swOnControllerChange);") &&
  /async function _swOnControllerChange\(\)[\s\S]*?_swServedVersion\(\)[\s\S]*?if \(_swPageStale\) \{ _swReloaded = true; location\.reload\(\); return; \}/.test(src) && src.includes("fetch('sora-constants.js', { cache: 'no-cache' })") && src.includes("window.addEventListener('load', () => setTimeout(_swRegister, 1500));") &&
  src.includes("document.addEventListener('visibilitychange', _swMaybeUpdate);") && src.includes("Date.now() - _swLastUpdate < 3600000") &&
  /async function _swStat\(\)[\s\S]*?k\.startsWith\('sora-shell-'\)/.test(src) && /async function _swClear\(\)[\s\S]*?const scope = new URL\('\.\/', location\.href\)\.href; for \(const r of await navigator\.serviceWorker\.getRegistrations\(\)\) if \(r\.scope === scope\) await r\.unregister\(\);/.test(src) &&
  src.includes("out.n++; out.bytes += (await r.clone().blob()).size;") &&
  src.includes("put('backup-shell-count', sw.n.toLocaleString()); put('backup-shell-size', _kmMB(sw.bytes)); put('backup-shell-ver',") &&
  src.includes("if (bSw) bSw.onclick = async () => { if (!confirm('本体の控え(オフライン用)を削除しますか？\\n(次に開く時に通信して作り直します。電波の無い所では開けなくなります)')) return; await _swClear(); _mtRefreshBackupRows(); };") &&
  /id="backup-demtiles-note"[\s\S]{0,8000}?<label class="baseopt-group-label km-sub"[^>]*>本体の控え\(オフライン用\):<\/label>[\s\S]{0,600}?id="backup-shell-count"[\s\S]{0,300}?id="backup-shell-size"[\s\S]{0,300}?id="backup-shell-ver"[\s\S]{0,400}?<span class="menu-note">削除すると、次に開く時に通信して作り直します\(電波の無い所では開けなくなります\)。<\/span>[\s\S]{0,300}?<button id="btn-backup-shell-clear"[^>]*>本体の控えを削除<\/button>/.test(html) &&
  resetJs.includes("if (k.startsWith('sora-shell-')) caches.delete(k);") && resetJs.includes("const scope = new URL('./', location.href).href; navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => { if (r.scope === scope) r.unregister(); }));") &&
  resetHtml.includes('オフライン用の本体の控え (Service Worker) も消去し、次に宙の辻を開く時に通信して作り直します。') &&
  sync.includes("'sw.js', 'sw-precache.js'") && html.includes('<li><strong>本体の控え (オフライン用)</strong>') &&
  /const STORE = Object\.freeze\(\{[\s\S]*?SHELL_MAX_BYTES: 64 \* 1024 \* 1024,[\s\S]*?SHELL_NAV_TIMEOUT_MS: 4000,[\s\S]*?SHELL_FETCH_TIMEOUT_MS: 10000,[\s\S]*?UNUSED_DAYS: 30,/.test(consts) && consts.includes('TILE_STORE, STORE, WORKERS, calculateKFromMeteo'));

(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true, args: ARGS });
  const ctx = await b.newContext({ viewport: { width: 900, height: 900 }, timezoneId: 'Asia/Tokyo', serviceWorkers: 'allow' });
  const p = await ctx.newPage();   // route は使わない(上の注意)。外部は --host-rules で遮断
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '/index.html?sw=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof _swRegister === 'function' && typeof _swStat === 'function', { timeout: 8000 });
  // A1: 登録→控えが全件そろう→本体のファイルは控えから(x-sora-shell: cache)、ページはネットから
  let a1 = null;
  for (let i = 0; i < 60 && !(a1 && a1.ready); i++) {
    await p.waitForTimeout(500);
    a1 = await p.evaluate(async (n) => {
      const regs = await navigator.serviceWorker.getRegistrations();
      const ks = (await caches.keys()).filter(k => k.startsWith('sora-shell-'));
      const c = ks.length ? await caches.open(ks[0]) : null;
      const cnt = c ? (await c.keys()).length : 0;
      return { regs: regs.map(r => r.active && r.active.scriptURL).filter(Boolean), ks, cnt, ready: cnt >= n && !!navigator.serviceWorker.controller };
    }, PRECACHE.length);
  }
  await p.reload({ waitUntil: 'load' });   // SW が制御する状態でオンラインのまま開き直す: ページはネット優先(ネットから)・本体のファイルは同じ版なので控えから
  await p.waitForFunction(() => typeof _swStat === 'function' && document.getElementById('app-version').textContent !== 'v0.0.0', { timeout: 15000 });
  const a1b = await p.evaluate(async () => {
    const s = await _swStat();
    const r1 = await fetch('sora-constants.js'); const r2 = await fetch('vendor/astronomy.browser.min.js'); const r3 = await fetch('index.html?sw=1');   // r3 はページ内からの読み(navigate ではない)=本体のファイル扱いで控えから
    const r4 = await fetch('sora-constants.js', { cache: 'reload' });   // 呼び元が最新を求めた時はネット
    const nav = performance.getEntriesByType('navigation')[0] || {};
    return { stat: s, mark1: r1.headers.get('x-sora-shell'), mark2: r2.headers.get('x-sora-shell'), mark3: r3.headers.get('x-sora-shell'), mark4: r4.headers.get('x-sora-shell'), ok: r1.ok && r2.ok && r3.ok && r4.ok, ctrl: !!navigator.serviceWorker.controller, navBytes: nav.transferSize, ver: document.getElementById('app-version').textContent };
  });
  check('A1 実機(?sw=1): 登録(sw.js)→控え sora-shell-v<版>(版は sora-constants.js)に一覧の全件→_swStat の件数が一致し容量>5MB→オンラインで開き直すとページはネットから(transferSize>0)・本体のファイルは控えから(x-sora-shell: cache)・cache:reload の要求はネットから(印なし)',
    a1 && a1.ready && a1.regs.some(u => u.endsWith('/sw.js')) && a1.ks.length === 1 && a1.ks[0] === 'sora-shell-v' + APP_VER && a1.cnt === PRECACHE.length &&
    a1b.ctrl && a1b.ok && a1b.ver === 'v' + APP_VER && a1b.navBytes > 0 && a1b.stat.n === PRECACHE.length && a1b.stat.bytes > 5 * 1024 * 1024 && a1b.stat.vers.join() === APP_VER && a1b.mark1 === 'cache' && a1b.mark2 === 'cache' && a1b.mark3 === 'cache' && a1b.mark4 === null,
    JSON.stringify({ a1, a1b: { ...a1b, stat: { n: a1b.stat.n, bytes: a1b.stat.bytes, vers: a1b.stat.vers } }, want: PRECACHE.length }));

  // A2: オフラインで開き直す
  await ctx.setOffline(true);
  let a2 = { err: null };
  try {
    await p.reload({ waitUntil: 'load', timeout: 30000 });
    await p.waitForFunction(() => typeof computeDayTwilight === 'function' && document.getElementById('app-version') && document.getElementById('app-version').textContent !== 'v0.0.0', { timeout: 15000 });
    a2 = await p.evaluate(async () => {
      const rp = await fetch('index.html?sw=1').catch(() => null); const rs = await fetch('script.js').catch(() => null);
      return { ver: document.getElementById('app-version').textContent, fn: typeof computeDayTwilight === 'function', online: navigator.onLine, pageMark: rp && rp.headers.get('x-sora-shell'), jsMark: rs && rs.headers.get('x-sora-shell'), nav: (performance.getEntriesByType('navigation')[0] || {}).transferSize };
    });
  } catch (e) { a2 = { err: String(e && e.message).slice(0, 200) }; }
  await ctx.setOffline(false);
  check('A2 オフラインにして再読み込み: ページも本体も控えから開き(x-sora-shell: cache)、版のフッター(APP_VERSION)と本体の関数がそろう', !a2.err && a2.ver === 'v' + APP_VER && a2.fn && a2.pageMark === 'cache' && a2.jsMark === 'cache', JSON.stringify(a2));

  // A3: 「本体の控えを削除」相当
  await p.waitForFunction(() => typeof _swClear === 'function', { timeout: 8000 });
  const a3 = await p.evaluate(async () => { await _swClear(); const ks = (await caches.keys()).filter(k => k.startsWith('sora-shell-')); const regs = await navigator.serviceWorker.getRegistrations(); const s = await _swStat(); return { ks, regs: regs.length, n: s.n }; });
  check('A3 _swClear(「本体の控えを削除」): sora-shell-* の控えと SW の登録が消え、_swStat は0件', a3.ks.length === 0 && a3.regs === 0 && a3.n === 0, JSON.stringify(a3));

  check('E ページエラーなし', errs.length === 0, errs.join(' | ').slice(0, 300));
  await b.close();
  console.log(`\n結果: ${PASS} PASS / ${FAIL} FAIL`);
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
