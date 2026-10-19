// 第184ラウンド検証: v1.99.1 — ①版の SSOT(sora-constants.js の APP_VERSION だけ) ②依頼者の修正4件(時間フィルタの並び・ラジオ切替で戻さない・月の出入り列の 24時表記・My辻CSVヘッダ「可視フィルタ」)
// ③デッサン35 段2(端末の控えの上限と片付け: usedAt・30日・上限の9割→8割・端末ごとの上限(MB)・建物(PLATEAU)の店・天気の控え・一覧の行・今すぐ整理) ④段3(manifest.json・永続化・「オフライン表示」の印) ⑤利用規約(目的・禁止事項・段落・改定日)
// 方式: 静的な形(S)+実機(Playwright。外部は route abort。片付けは店に種を撒いて本物のワーカーで)。S4=反証レビュー(24件)の直しの字面(移行用 meta・版の分からないページ・used 店・端末だけの上限・暦日の翌日・印の3種・onversionchange)。
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
const src = rd('script.js'), html = rd('index.html'), consts = rd('sora-constants.js'), sw = rd('sw.js'), worker = rd('sora-store-worker.js'), css = rd('style.css'), terms = rd('terms.html'), pre = rd('sw-precache.js'), resetJs = rd('reset.js'), kmw = rd('kashimap-worker.js'), trw = rd('sora-terrain-worker.js'), sync = rd('tests/harness/sync-apptest.py'), privacy = rd('privacy.html');
const APP_VER = (/APP_VERSION = '([^']+)'/.exec(consts) || [])[1];

// ---- V0: 版のピン(最新の verify が持つ)。置き場は sora-constants.js の1箇所 ----
check('V0 版のピン 1.99.1(sora-constants.js の APP_VERSION)+script.js は SORA.APP_VERSION を読む+index.html の移行用 meta(1.99.2 で消す)は同じ値+Version History の最新行が同じ版で第184',
  APP_VER === '1.99.1' && src.includes('const APP_VERSION = SORA.APP_VERSION;') && !/const APP_VERSION = '\d/.test(src) && (html.match(/<meta name="app-version" content="([^"]+)"/) || [])[1] === APP_VER && html.includes('移行用(1.99.2 で消す)') &&
  /Version 1\.99\.1 - 2026-10-19: [^\n]*第184ラウンド/.test(src) && (src.match(/^Version (\d+\.\d+\.\d+) - /m) || [])[1] === APP_VER);

// ---- S1: 依頼者の修正(静的) ----
check('S1 修正4件(静的): TSUJI_TIME_MODES の並び 日の出→月の出→GH[終]→GH[始]→月の入→日の入・ラジオの切り替えでは何も戻さない(setDragMode は旗だけ)・fmtHms(d, baseDate) で翌日は24時を足す(月の列5か所に当日0時を渡す)・My辻CSVヘッダが可視フィルタ/可視OK/可視NG',
  /\{ v: 'sunrise',\s+l: '日の出' \},\s*\{ v: 'moonrise',\s+l: '月の出' \},[^\n]*\n\s*\{ v: 'ghEnd',\s+l: 'GH\[終\]' \},\s*\{ v: 'ghStart',\s+l: 'GH\[始\]' \},\s*\{ v: 'moonset',\s+l: '月の入' \},\s*\{ v: 'sunset',\s+l: '日の入' \},/.test(src) &&
  /const setDragMode = \(tsuji\) => \{[^\n]*\n\s*if \(tsuji === _smDragTsuji\) return;\n\s*_smDragTsuji = tsuji; _smDragFrame = !tsuji;\n\s*\};/.test(src) &&
  src.includes('function fmtHms(d, baseDate) {') && src.includes('if (baseDate) { const dd = _dayDiff(x, baseDate); if (dd > 0) h += 24 * dd; }') && src.includes('function _dayDiff(d, baseDate) {') && src.includes('const dd = _dayDiff(date, baseDate);') &&
  (src.match(/fmtHms\(Astronomy\.SearchRiseSet\('Moon', observer, [+-]1, (startOfDay|d0), 2\), \1\)/g) || []).length === 4 && src.includes('fmtHms(mr, startOfDay), fmtHms(ms, startOfDay)') && (src.match(/fmtHms\(rs\.mr, rs\.startOfDay\), moonsetStr: fmtHms\(rs\.ms, rs\.startOfDay\)/g) || []).length === 2 &&
  src.includes(',精度-フィルタ,可視フィルタ,可視OKフィルタ,可視NGフィルタ,メモ\\r\\n') && !src.includes(',標高フィルタ,標高OKフィルタ,'));

// ---- S2: 段2(静的) ----
check('S2 段2(静的): SORA.STORE に CAP_BYTES(5店・1GB)/CLEAN_HIGH 0.9/CLEAN_LOW 0.8/TOUCH_MIN_MS/CLEAN_INTERVAL_MS/CLEAN_BATCH/WX_TTL_MS・SS_TTL と地理タイルの上限は SORA を読む・最終使用の店 used(3店の版上げで作る)と _storeTouch(店, 鍵。1日1回・まとめ書き)・標高/地理/建物のヒットで touch・本文の put に usedAt を持たない・ワーカー2本も used 店(idbTouch/demTouch)・建物の店 soranotsuji-bldg(_bgFetchBuf・tileset も)・片付けワーカー sora-store-worker.js(30日・9割→8割・200件ずつ・天気の TTL・used 店も消す)・契機(load+5秒・前面復帰・今すぐ整理)・unusedDays は SORA.STORE から渡す・上限(MB)は端末だけの sora_store_caps(appState に無い)・前回の整理は sora_store_clean_at・片付けの後は数え直しの約束も捨てる・reset.js が建物の店も消す',
  /CAP_BYTES: Object\.freeze\(\{[\s\S]*?maptiles: 1024 \* 1024 \* 1024, demtiles: 1024 \* 1024 \* 1024, bldg: 1024 \* 1024 \* 1024, assets: 1024 \* 1024 \* 1024, wx: 1024 \* 1024 \* 1024,/.test(consts) &&
  consts.includes('CLEAN_HIGH: 0.9, CLEAN_LOW: 0.8,') && consts.includes('TOUCH_MIN_MS: 24 * 3600 * 1000,') && consts.includes('CLEAN_INTERVAL_MS: 24 * 3600 * 1000,') && consts.includes('CLEAN_BATCH: 200,') && consts.includes('WX_TTL_MS: 2 * 3600 * 1000,') && consts.includes('UNUSED_DAYS: 30,') &&
  src.includes('const SS_TTL = SORA.STORE.WX_TTL_MS;') && src.includes("if (_mtBytes + buf.byteLength <= _storeCap('maptiles')) {") && src.includes("function _storeCap(name) {") && src.includes("const _storeTouched = new Map(), _storeTouchQ = new Map();") &&
  src.includes("function _idbEnsureUsedStore(db, tx) {") && (src.match(/_idbEnsureUsedStore\(db, tx\);/g) || []).length === 3 && src.includes('indexedDB.open(MT_DB, 3)') && src.includes("indexedDB.open('soranotsuji-kashimap', 4)") && src.includes("function _storeTouch(store, key) {") && src.includes("function _storeTouchFlush(store) {") &&
  src.includes("if (rec && rec.buf) { _storeTouch('mt', url); return { data: rec.buf }; }") && src.includes("else { _storeTouch('km', key); try { return await _demDecode(r.buf); } catch (_) {} }") && src.includes("if (rec && rec.buf) { _storeTouch('bg', url); return rec.buf; }") && !src.includes("savedAt: Date.now(), usedAt: Date.now()") &&
  kmw.includes("if (rec.buf) idbTouch(db, key);") && kmw.includes("function idbTouchFlush(db, keys) {") && trw.includes("demTouch(db, key); }") && trw.includes("function demTouchFlush(db, keys) {") && !kmw.includes("usedAt: Date.now() }") && !trw.includes("usedAt: Date.now() }") &&
  worker.includes("hasUsed ? keyCursorMap(tx.objectStore('used'), 'usedAt')") && worker.includes("await deleteKeys(db, def.store, all.slice(i, i + p.batch), hasUsed);") &&
  src.includes("const BG_DB = 'soranotsuji-bldg', BG_STORE = 'tiles';") && src.includes("async function _bgFetchBuf(url) {") && src.includes("p = _bgFetchBuf(url).then(buf => JSON.parse(new TextDecoder().decode(buf))).then(ts => {") && src.includes("bufP = _bgFetchBuf(url)") &&
  worker.includes("{ name: 'maptiles', db: 'soranotsuji-maptiles', store: 'tiles' },") && worker.includes("{ name: 'demtiles', db: 'soranotsuji-kashimap', store: 'tiles' },") && worker.includes("{ name: 'bldg', db: 'soranotsuji-bldg', store: 'tiles' },") &&
  worker.includes("const cutoff = p.now - p.unusedDays * 86400000;") && worker.includes("if (cap > 0 && total > cap * p.high) {") && worker.includes("if (total <= cap * p.low) break;") && worker.includes("p.now - Number(v.t) > p.wxTtlMs") && worker.includes("req.onupgradeneeded = () => { try { req.transaction.abort(); } catch (_) {} };") &&
  src.includes("w = new Worker('sora-store-worker.js');") && src.includes("window.addEventListener('load', () => setTimeout(_storeCleanMaybe, SORA.STORE.CLEAN_DELAY_MS));") && src.includes("document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') _storeCleanMaybe(); });") &&
  src.includes("const STORE_CAPS_KEY = 'sora_store_caps';") && src.includes("function _storeCaps() {") && src.includes("function _storeCapSet(name, mb) {") && src.includes("for (const k of Object.keys(SORA.STORE.CAP_BYTES)) { const v = Number(caps[k]); if (isFinite(v) && v >= 10 && v <= 1000000) out[k] = Math.round(v); }") &&
  !src.includes('storeCaps: appState.storeCaps') && !src.includes('saved.storeCaps') && !/^\s*storeCaps: \{\},/m.test(src) && src.includes("unusedDays: SORA.STORE.UNUSED_DAYS,") &&
  src.includes("localStorage.setItem('sora_store_clean_at', String(Date.now()));") && !src.includes('soranotsuji_store_clean_at') && src.includes("_mtBytes = null; _mtBytesP = null; _mtCapWarned = false; _bgBytes = null; _bgBytesP = null; _bgCapWarned = false;") &&
  resetJs.includes("'soranotsuji-maptiles', 'soranotsuji-bldg']") && resetJs.includes('建物 (PLATEAU)') === false && rd('reset.html').includes('建物 (PLATEAU) の控え'));

// ---- S3: 一覧の行・段3・規約・配信 ----
check('S3 一覧(index.html): 端末のデータ(全体/永続/前回の整理/今すぐ整理/永続化を要求/設定)・地理/標高の最終使用/使用率/上限(MB)・建物(PLATEAU)の行と全削除・可視マップ資産(封鎖中は隠す)・天気の控えと削除・本体の控え。段3: manifest.json(link・theme-color・start_url ./・standalone)・sw-precache.js の一覧に manifest と片付けワーカー・SW の sora:served? への返事・オフライン表示の印・永続。規約: 目的の一文・禁止事項2つ・共有の段落・改定日。privacy: 建物も控える・ハーネスの同期',
  ['backup-total-usage', 'backup-persist-state', 'backup-clean-at', 'backup-clean-status', 'btn-backup-clean-now', 'btn-backup-persist', 'backup-settings-size', 'backup-settings-pct',
   'backup-maptiles-used', 'backup-maptiles-pct', 'input-backup-cap-maptiles', 'backup-demtiles-used', 'backup-demtiles-pct', 'input-backup-cap-demtiles',
   'backup-bldg-count', 'backup-bldg-size', 'backup-bldg-used', 'backup-bldg-pct', 'input-backup-cap-bldg', 'btn-backup-bldg-clear',
   'backup-assets-block', 'backup-assets-count', 'backup-assets-size', 'backup-assets-pct', 'input-backup-cap-assets',
   'backup-wx-count', 'backup-wx-size', 'backup-wx-pct', 'input-backup-cap-wx', 'btn-backup-wx-clear', 'backup-shell-count', 'app-offline-mark'].every(id => html.includes(`id="${id}"`)) &&
  html.includes('<link rel="manifest" href="manifest.json">') && html.includes('<meta name="theme-color" content="#1e1e1e">') &&
  (() => { const m = JSON.parse(rd('manifest.json')); return m.start_url === './' && m.display === 'standalone' && m.short_name === '宙の辻' && m.icons.some(i => i.src === 'apple-touch-icon.png' && i.sizes === '180x180') && m.icons.some(i => i.src === 'logo.png' && i.sizes === '100x100'); })() &&
  pre.includes("'manifest.json',") && pre.includes("'sora-store-worker.js',") && sync.includes("'manifest.json', 'sora-store-worker.js'") &&
  sw.includes("if (d.type === 'sora:served?' && e.source && e.source.postMessage) e.source.postMessage({ type: 'sora:served', from: servedFromCache.has(e.source.id) ? 'cache' : 'network', ver: VER });") && sw.includes("servedFromCache.add(e.resultingClientId);") &&
  src.includes("function _swShowOfflineMark(on) {") && src.includes("function _swMarkSet(kind, on) {") && src.includes("navigator.serviceWorker.controller.postMessage({ type: 'sora:served?' });") && src.includes("window.addEventListener('offline', () => _swMarkSet('offline', true));") && src.includes("window.addEventListener('online', () => _swMarkSet('offline', false));") &&
  src.includes("async function _storagePersisted() {") && src.includes("async function _storagePersistRequest() {") && css.includes('.offline-mark { color: #ffd54f; font-size: 11px; }') &&
  terms.includes('本アプリは、街や自然環境において、宙(そら)や空を楽しむことを目的としています。') && terms.includes('<li>他の利用者や第三者になりすます行為</li>') && terms.includes('<li>本アプリの共有機能(URL・Myセットなど)を、宣伝・勧誘・連絡先の配布など、本アプリの目的から外れた用途に使う行為</li>') &&
  terms.includes('<p>本アプリのURLやMyセット(Googleスプレッドシート)などを使って他の利用者と共有した内容は、共有した利用者自身の責任です。当プロジェクトは共有された内容を保管せず、その正確性・適法性を保証しません。共有された内容に問題がある場合は、共有元のサービス(Googleなど)の通報の仕組みをご利用ください。</p>') && terms.includes('改定日: 2026年10月19日') &&
  privacy.includes('地図タイル・標高タイル・建物(PLATEAU)のデータ・天気の情報は、'));

// ---- S4: 反証レビュー(第184・24件)の直し(静的) ----
check('S4 反証レビューの直し: sw.js=版が読めないページは unknown(控えに入れない・本体はネット→落ちたら控え)・controllerchange の読み直しは画面が元から古い時だけ(普段は「(新しい版あり)」の印)・印は cache/offline/update の3種・翌日は暦日で数える(_dayDiff)・店の open に onversionchange/onblocked(本体4つ+ワーカー2本)・ヘルプの地理タイルの文(合計1GB→上限と片付け)・お知らせの列番号 55〜57・FAQ の天気は TTL だけ',
  sw.includes("clientVer.set(e.resultingClientId, v || 'unknown');") && sw.includes("if (v === VER) putRuntime(c, key, res.clone());") && sw.includes("if (pv === 'unknown') { const hit = await matchShell(c, key); if (hit) return marked(hit); }") &&
  src.includes("async function _swServedVersion() {") && src.includes("_swPageStale = !!served && served !== APP_VERSION;") && src.includes("if (_swPageStale) { _swReloaded = true; location.reload(); return; }") && src.includes("_swMarkSet('update', true);") &&
  src.includes("const _swMark = { cache: false, offline: false, update: false };") && src.includes("parts.push('(通信なし)')") && src.includes("parts.push('(新しい版あり)')") &&
  (src.match(/db\.onversionchange = \(\) => \{ try \{ db\.close\(\); \} catch \(_\) \{\} _(mtDbP|kmDbP|bgDbP|ssDbReady) = null; \}/g) || []).length === 4 && (src.match(/req\.onblocked = \(\) => setTimeout\(/g) || []).length === 4 &&
  kmw.includes("db.onversionchange = () => { try { db.close(); } catch (_) {} _dbP = null; };") && trw.includes("db.onversionchange = () => { try { db.close(); } catch (_) {} _demDbP = null; };") &&
  html.includes('地理タイル・標高タイル・建物の控えにはそれぞれ上限があり (既定 1024MB。「端末のデータ」の上限 (MB) で変えられます)、30日使っていない物と上限の9割を超えた分は自動で片付けます') && !html.includes('合計1GBまでで') && html.includes('はこの端末だけの設定で') &&
  rd('docs/note/note-notice-page.md').includes('(55〜57列目)') && rd('docs/note/note-faq-page.md').includes('天気の控えは取ってから2時間で取り直します'));

(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true, args: ARGS });
  const ctx = await b.newContext({ viewport: { width: 900, height: 900 }, timezoneId: 'Asia/Tokyo' });
  await ctx.route('**/*', route => { route.request().url().startsWith(BASE) ? route.continue() : route.abort(); });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('dialog', d => d.accept());
  await p.goto(BASE + '/index.html?kashimap=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof _storeCleanNow === 'function' && typeof _bgFetchBuf === 'function' && typeof fmtHms === 'function', { timeout: 8000 });
  await p.waitForTimeout(400);

  // A1: 版の SSOT(実機)・月の列の 24時表記・上限の上書きと正規化
  const a1 = await p.evaluate(() => {
    const d0 = new Date(2026, 10, 3, 0, 0, 0, 0);
    const next = new Date(d0.getTime() + 86400000 + 45 * 60000 + 46000);
    const r = { ver: APP_VERSION, sora: SORA.APP_VERSION, footer: document.getElementById('app-version').textContent,
      f1: fmtHms(next, d0), f2: fmtHms(next), f3: fmtHms(new Date(d0.getTime() + 5 * 3600000), d0), f4: fmtHms(null, d0), f5: fmtHms(new Date(2026, 10, 5, 1, 0, 0), d0), f6: formatTime(next, d0),
      meta: (document.querySelector('meta[name="app-version"]') || {}).content };
    const keep = localStorage.getItem('sora_store_caps');
    const inp = document.getElementById('input-backup-cap-maptiles');
    inp.value = '500'; inp.dispatchEvent(new Event('change', { bubbles: true }));
    r.cap500 = _storeCap('maptiles'); r.saved = JSON.parse(localStorage.getItem('sora_store_caps') || '{}').maptiles;
    r.notInApp = !('storeCaps' in JSON.parse(localStorage.getItem('soranotsuji_app') || '{}')) && !('storeCaps' in appState) && !('storeCaps' in collectLocalStorageAll());
    inp.value = ''; inp.dispatchEvent(new Event('change', { bubbles: true }));
    r.capDefault = _storeCap('maptiles'); r.removed = localStorage.getItem('sora_store_caps') === null;
    localStorage.setItem('sora_store_caps', JSON.stringify({ maptiles: 5, demtiles: 'abc', bldg: 2048, nope: 100 })); _storeCapsCache = null;
    r.norm = JSON.stringify(_storeCaps());
    localStorage.setItem('sora_store_caps', 'not json'); _storeCapsCache = null; r.broken = JSON.stringify(_storeCaps());
    if (keep === null) localStorage.removeItem('sora_store_caps'); else localStorage.setItem('sora_store_caps', keep); _storeCapsCache = null;
    return r;
  });
  check('A1 実機: APP_VERSION は SORA.APP_VERSION と同じでフッターに出る・移行用 meta も同じ値・fmtHms(翌日0:45:46, 当日0時)=24:45:46(baseDate 無しは 00:45:46・当日5時は 05:00:00・null は --:--:--・2日後1時は 49:00:00・formatTime も 24:45:46)・上限(MB)の欄 500 → _storeCap=500MB・localStorage の sora_store_caps に保存(soranotsuji_app/appState/バックアップの収集には乗らない)・空欄で既定 1024MB(キーも消える)・読む時に 10未満/文字/知らない店を捨てる・壊れた JSON は空',
    a1.ver === '1.99.1' && a1.sora === a1.ver && a1.footer === 'v' + a1.ver && a1.meta === a1.ver && a1.f1 === '24:45:46' && a1.f2 === '00:45:46' && a1.f3 === '05:00:00' && a1.f4 === '--:--:--' && a1.f5 === '49:00:00' && a1.f6 === '24:45:46' &&
    a1.cap500 === 500 * 1048576 && a1.saved === 500 && a1.notInApp && a1.capDefault === 1024 * 1048576 && a1.removed && a1.norm === '{"bldg":2048}' && a1.broken === '{}', JSON.stringify(a1));

  // A2: 片付け(本物のワーカー): 種を撒く→30日超えが消え、上限超えは古い順に8割まで、天気の期限切れが消える
  const a2 = await p.evaluate(async () => {
    const now = Date.now(), day = 86400000, MB = 1048576;
    const buf = (n) => new ArrayBuffer(n);
    const mtPut = (rec) => _mtIdb('readwrite', st => st.put(rec)), mtUsed = (key, t) => _mtIdb('readwrite', st => st.put({ key, usedAt: t }), 'used');
    const kmPut = (rec) => _kmIdb('tiles', 'readwrite', st => st.put(rec)), kmUsed = (key, t) => _kmIdb('used', 'readwrite', st => st.put({ key, usedAt: t }));
    const bgPut = (rec) => _bgIdb('readwrite', st => st.put(rec)), bgUsed = (key, t) => _bgIdb('readwrite', st => st.put({ key, usedAt: t }), 'used');
    await _mtClear(); await _kmTilesClear(); await _bgClear(); await _ssClear();
    // 地理: 古い(40日)2件・新しい2件・最終使用が新しいが savedAt が古い1件(=残る)。最終使用は used 店(本文には usedAt を持たない)。used 店の孤児(本文の無い鍵)1件は消える
    await mtPut({ key: 'v/old1', size: 1000, buf: buf(1000), savedAt: now - 40 * day });
    await mtPut({ key: 'v/old2', size: 1000, buf: buf(1000), savedAt: now - 31 * day }); await mtUsed('v/old2', now - 31 * day);
    await mtPut({ key: 'v/new1', size: 1000, buf: buf(1000), savedAt: now - 1 * day }); await mtUsed('v/new1', now - 1 * day);
    await mtPut({ key: 'v/new2', size: 1000, buf: buf(1000), savedAt: now }); await mtUsed('v/new2', now);
    await mtPut({ key: 'v/usedRecently', size: 1000, buf: buf(1000), savedAt: now - 60 * day }); await mtUsed('v/usedRecently', now - 2 * day);
    await mtUsed('v/gone', now);
    // 標高: 上限 10MB に下げ(端末だけの設定)、1MB×12件(最終使用は 1日おきに古い)→ 9割超え → 古い順に 8MB 以下まで
    _storeCapSet('demtiles', 10);
    for (let i = 0; i < 12; i++) { await kmPut({ key: `t/${i}`, size: MB, buf: buf(MB), savedAt: now - i * day }); await kmUsed(`t/${i}`, now - i * day); }
    // 建物: 新しい1件(残る)・古い1件(消える)
    await bgPut({ key: 'b/new', size: 2000, buf: buf(2000), savedAt: now }); await bgUsed('b/new', now);
    await bgPut({ key: 'b/old', size: 2000, buf: buf(2000), savedAt: now - 45 * day }); await bgUsed('b/old', now - 45 * day);
    // 天気: 期限切れ1件・生き1件
    await _ssIdb('readwrite', s => s.put({ t: now - 3 * 3600000, data: { a: 1 } }, 'test:old'));
    await _ssIdb('readwrite', s => s.put({ t: now, data: { a: 1 } }, 'test:new'));
    const res = await _storeCleanNow('test');
    const mt = await _mtStat(), dem = await _kmTilesStat(), bg = await _bgStat(), wx = await _ssStat();
    const mtKeys = await _mtIdb('readonly', st => st.getAllKeys());
    const mtUsedKeys = await _mtIdb('readonly', st => st.getAllKeys(), 'used');
    const demKeys = await _kmIdb('tiles', 'readonly', st => st.getAllKeys());
    const demUsedKeys = await _kmIdb('used', 'readonly', st => st.getAllKeys());
    const wxKeys = await _ssIdb('readonly', st => st.getAllKeys());
    const status = document.getElementById('backup-clean-status').textContent;
    const cleanAt = Number(localStorage.getItem('sora_store_clean_at')) || 0;
    const bytesReset = _mtBytesP === null && _bgBytesP === null;   // 片付けの後は数え直しの約束も捨てる(反証レビュー C3)
    _storeCapSet('demtiles', '');
    await _mtClear(); await _kmTilesClear(); await _bgClear(); await _ssClear();
    const usedAfterClear = (await _mtIdb('readonly', st => st.count(), 'used')) + (await _kmIdb('used', 'readonly', st => st.count())) + (await _bgIdb('readonly', st => st.count(), 'used'));
    return { res: res && res.stores ? Object.fromEntries(Object.entries(res.stores).map(([k, v]) => [k, { n: v.n, bytes: v.bytes, old: v.deletedOld, cap: v.deletedCap }])) : res, mt, dem, bg, wx, mtKeys, mtUsedKeys, demKeys, demUsedKeys, wxKeys, status, cleanAtOk: now - cleanAt < 60000 && cleanAt > 0, bytesReset, usedAfterClear, mtUsed: mt.used, noOldKey: localStorage.getItem('soranotsuji_store_clean_at') === null };
  });
  const demKeysSorted = (a2.demKeys || []).slice().sort();
  check('A2 片付け(本物のワーカー): 地理=40日/31日の2件が消え、新しい2件と「保存は古いが最近使った」1件が残る(used 店も同じ3件=孤児 v/gone も消える・最終使用=now)・標高=上限10MB・1MB×12件 → 古い順に消えて 8MB 以下(8件・t/0〜t/7 が残る。used 店も同じ8件)・建物=45日の1件が消え新しい1件が残る・天気=期限切れ1件が消え生き1件が残る・状態の文と「前回の整理」の時刻(sora_store_clean_at)・数え直しの約束も捨てる・全削除で used 店も空',
    a2.mt.n === 3 && a2.mtKeys.slice().sort().join() === 'v/new1,v/new2,v/usedRecently' && a2.mtUsedKeys.slice().sort().join() === 'v/new1,v/new2,v/usedRecently' && a2.res.maptiles.old === 2 && a2.res.maptiles.cap === 0 && a2.mtUsed > 0 && Date.now() - a2.mtUsed < 120000 &&
    a2.dem.n === 8 && a2.dem.bytes === 8 * 1048576 && demKeysSorted.join() === ['t/0', 't/1', 't/2', 't/3', 't/4', 't/5', 't/6', 't/7'].sort().join() && a2.demUsedKeys.slice().sort().join() === demKeysSorted.join() && a2.res.demtiles.cap === 4 &&
    a2.bg.n === 1 && a2.res.bldg.old === 1 && a2.wx.n === 1 && a2.wxKeys.join() === 'test:new' && a2.res.wx.old === 1 &&
    /整理しました: 8件/.test(a2.status) && a2.cleanAtOk && a2.noOldKey && a2.bytesReset && a2.usedAfterClear === 0, JSON.stringify(a2));

  // A3: 建物の店: 自サイトのファイルを _bgFetchBuf で取ると店に入り、2回目は店から(usedAt あり)・tileset も同じ経路・全削除
  const a3 = await p.evaluate(async () => {
    await _bgClear();
    const u = new URL('logo.png', location.href).href;
    const b1 = await _bgFetchBuf(u); const s1 = await _bgStat();
    const rec = await _bgIdb('readonly', st => st.get(u));
    const used0 = await _bgIdb('readonly', st => st.get(u), 'used');
    const b2 = await _bgFetchBuf(u); const s2 = await _bgStat();
    await new Promise(r => setTimeout(r, 1300));   // 最終使用のまとめ書き(1秒)を待つ
    const used1 = await _bgIdb('readonly', st => st.get(u), 'used');
    const b3 = await _bgFetchBuf(u); await new Promise(r => setTimeout(r, 1300));
    const used2 = await _bgIdb('readonly', st => st.get(u), 'used');
    document.getElementById('btn-backup-bldg-clear').click();
    await new Promise(r => setTimeout(r, 400));
    const s3 = await _bgStat();
    const usedN = await _bgIdb('readonly', st => st.count(), 'used');
    return { n1: s1.n, bytes1: s1.bytes, len: b1.byteLength, hasSaved: !!(rec && rec.savedAt) && !('usedAt' in rec), noUsed0: !used0, n2: s2.n, same: b2.byteLength === b1.byteLength && b3.byteLength === b1.byteLength, used1: !!(used1 && used1.usedAt), used2same: !!(used2 && used1 && used2.usedAt === used1.usedAt), n3: s3.n, usedN };
  });
  check('A3 建物(PLATEAU)の店: 取得→店に1件(size=実体・savedAt あり・本文に usedAt は無い・used 店はまだ空)→2回目は店から(1件のまま)で used 店に最終使用が入る→3回目は1日1回なので書き直さない→「建物タイルを全削除」で tiles も used も0件',
    a3.n1 === 1 && a3.bytes1 === a3.len && a3.len > 1000 && a3.hasSaved && a3.noUsed0 && a3.n2 === 1 && a3.same && a3.used1 && a3.used2same && a3.n3 === 0 && a3.usedN === 0, JSON.stringify(a3));

  // A4: 一覧の行が埋まる(バックアップの節を開く)・可視マップ資産の行は開錠時に見える・永続の状態・オフライン表示の印
  const a4 = await p.evaluate(async () => {
    const sec = document.getElementById('sec-backup'); sec.classList.remove('closed');
    await _mtRefreshBackupRows();
    const g = (id) => document.getElementById(id).textContent;
    const pers = await _storagePersisted();
    const el = document.getElementById('app-offline-mark'), txt = () => el.textContent;
    _swShowOfflineMark(true); const mark = txt(); _swShowOfflineMark(false); const mark2 = txt();
    window.dispatchEvent(new Event('offline')); const mark3 = txt(); const title3 = el.title; window.dispatchEvent(new Event('online')); const mark4 = txt();
    _swMarkSet('update', true); _swShowOfflineMark(true); const mark5 = txt(); _swMarkSet('update', false); _swShowOfflineMark(false); const mark6 = txt();
    return { total: g('backup-total-usage'), persist: g('backup-persist-state'), settings: g('backup-settings-size'), spct: g('backup-settings-pct'), mpct: g('backup-maptiles-pct'), dpct: g('backup-demtiles-pct'), bpct: g('backup-bldg-pct'), wpct: g('backup-wx-pct'), apct: g('backup-assets-pct'),
      assetsShown: document.getElementById('backup-assets-block').style.display !== 'none', ph: document.getElementById('input-backup-cap-wx').placeholder, persTyped: typeof pers, mark, mark2, mark3, title3, mark4, mark5, mark6 };
  });
  check('A4 一覧の行: 全体(使用/割当)・永続(はい/いいえ)・設定の KB と %・各店の使用率%・上限の欄の placeholder「既定 1024」・開錠時は可視マップ資産の行が見える・版の横の印: 控えから=「(オフライン表示)」(出し入れできる)・offline で「(通信なし)」(online で消える)・新しい版あり+控えは2つ並ぶ',
    /MB \/ .*MB/.test(a4.total) && /はい|いいえ/.test(a4.persist) && /KB$/.test(a4.settings) && /%$/.test(a4.spct) && [a4.mpct, a4.dpct, a4.bpct, a4.wpct, a4.apct].every(x => /^\d+%$/.test(x)) &&
    a4.assetsShown && a4.ph === '既定 1024' && a4.persTyped === 'boolean' && a4.mark === '(オフライン表示)' && a4.mark2 === '' && a4.mark3 === '(通信なし)' && /通信が切れています/.test(a4.title3) && a4.mark4 === '' && a4.mark5 === '(オフライン表示) (新しい版あり)' && a4.mark6 === '', JSON.stringify(a4));

  check('E ページエラーなし', errs.length === 0, errs.join(' | ').slice(0, 300));
  await b.close();
  console.log(`\n結果: ${PASS} PASS / ${FAIL} FAIL`);
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
