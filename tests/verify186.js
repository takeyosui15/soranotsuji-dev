// 第183ラウンド検証: v1.99.0 — 依頼者 GO の4件+不具合1件。
// ①時間フィルタに「月の出」「月の入」(辻検索/辻メッシュ/My辻検索の開始・終了の基準。「GH[終]」と「GH[始]」の間。無い日は通さない。短縮URL辞書v23)
// ②観測点を地名/座標/地図/GPS/写位で置いた時の高さ 1.5m(SORA.OBSERVER.EYE_HEIGHT_M。Hom の既定 150m と目的点 0 は不変)
// ③位置情報メニューの「写位」(写真のExif位置情報→ラジオで選択中の観測点(°)/目的点(°))
// ④宙の窓検索のコントロール: 2つのラジオ(択一)+各段の「リセット」(幅1/3・右寄せ)+注記の文(デッサン05 4.1〜4.3段目)
// ⑤二本指(ドラッグ)で動かした構図がカメラの「リセット」で戻らない不具合(棚卸し460)
// 方式: 静的な形(S)+実機(Playwright。外部は route abort・標高取得はスタブ)。
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
const src = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
const _verSrc = fs.readFileSync(path.join(ROOT, 'sora-constants.js'), 'utf8');   // 版の唯一の置き場(第184): APP_VERSION はここにある
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');

// ---- 合成写真(verify173 と同じ組み立て): Exif GPS 入りの最小JPEG ----
function buildExifJpeg({ little, latRef, lngRef, lat, lng }) {
  const tiff = [];
  const u16 = (v) => little ? [v & 255, v >> 8] : [v >> 8, v & 255];
  const u32 = (v) => little ? [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255] : [(v >>> 24) & 255, (v >> 16) & 255, (v >> 8) & 255, v & 255];
  tiff.push(...(little ? [0x49, 0x49] : [0x4D, 0x4D]), ...u16(42), ...u32(8));
  tiff.push(...u16(1), ...u16(0x8825), ...u16(4), ...u32(1), ...u32(26), ...u32(0));
  tiff.push(...u16(4));
  tiff.push(...u16(1), ...u16(2), ...u32(2), latRef.charCodeAt(0), 0, 0, 0);
  tiff.push(...u16(2), ...u16(5), ...u32(3), ...u32(80));
  tiff.push(...u16(3), ...u16(2), ...u32(2), lngRef.charCodeAt(0), 0, 0, 0);
  tiff.push(...u16(4), ...u16(5), ...u32(3), ...u32(104));
  tiff.push(...u32(0));
  for (const [d, m, s100] of [lat, lng]) tiff.push(...u32(d), ...u32(1), ...u32(m), ...u32(1), ...u32(s100), ...u32(100));
  const app1Len = 2 + 6 + tiff.length;
  return Uint8Array.from([0xFF, 0xD8, 0xFF, 0xE1, app1Len >> 8, app1Len & 255, 0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff, 0xFF, 0xD9]);
}
const PHOTO = buildExifJpeg({ little: true, latRef: 'N', lngRef: 'E', lat: [35, 21, 3870], lng: [138, 43, 3850] });   // 35.36075, 138.727361

// ---- V0: 版数ピン(最新のverifyが持つ) ----
check('V0 版数は 1.99 以上+Version Historyに第183(ピンは最新のverifyへ移した。版の置き場は sora-constants.js=第184)', /APP_VERSION = '1\.(99|[1-9]\d{2,})\.\d+'/.test(src + _verSrc) && src.includes('Version 1.99.0 - ') && src.includes('第183ラウンド'));

// ---- S1: 月の出/月の入(静的) ----
check('S1 時間フィルタ: TSUJI_TIME_MODES の並びが 日の出→月の出→GH[終]→GH[始]→月の入→日の入(第184・依頼者)・computeDayTwilight が Moon の出没をその日の中で探す・無い日は NaN で通さない・短縮URL辞書v23',
  /\{ v: 'sunrise',\s+l: '日の出' \},\s*\{ v: 'moonrise',\s+l: '月の出' \},[^\n]*\n\s*\{ v: 'ghEnd',\s+l: 'GH\[終\]' \},\s*\{ v: 'ghStart',\s+l: 'GH\[始\]' \},\s*\{ v: 'moonset',\s+l: '月の入' \},\s*\{ v: 'sunset',\s+l: '日の入' \},/.test(src) &&
  src.includes("moonrise: rs(+1, 'Moon'), moonset: rs(-1, 'Moon'),") && src.includes("Astronomy.SearchRiseSet(body, observer, dir, startOfDay, 1)") &&
  src.includes("const TSUJI_MOON_MODES = new Set(['moonrise', 'moonset']);") && src.includes("if (!d) return TSUJI_MOON_MODES.has(mode) ? NaN : null;") &&
  src.includes("if (Number.isNaN(sMin) || Number.isNaN(eMin)) return false;") &&
  src.includes("const _QP_SEEDS_V23 = _QP_SEEDS_V22.concat(['&tsujiStartMode=moonrise', '&tsujiStartMode=moonset', '&tsujiEndMode=moonrise', '&tsujiEndMode=moonset', '&tsujiMeshStartMode=moonrise', '&tsujiMeshStartMode=moonset', '&tsujiMeshEndMode=moonrise', '&tsujiMeshEndMode=moonset']);") && src.includes("_QP_SEEDS_V22, _QP_SEEDS_V23];") &&
  html.includes('日の出/日の入/月の出/月の入/各薄明/GH・BHの境目から選べ') && html.includes('月の出・月の入がその日に無い日 (月に1回ほどあります) は、その境界を使うフィルタは何も通しません'));

// ---- S2: 1.5m(静的): 3つの置き方(座標/地名→applyLocationCoords・GPS・地図)で EYE_HEIGHT_M。目的点側は 0 のまま。Hom の既定は不変 ----
check('S2 観測点の高さ 1.5m: applyLocationCoords/useGPS/applyMapPointAction の観測点側が SORA.OBSERVER.EYE_HEIGHT_M・目的点側は endHeight = 0 のまま・DEFAULT_START の高さ 150 は不変・ヘルプ',
  (src.match(/appState\.startHeight = SORA\.OBSERVER\.EYE_HEIGHT_M;/g) || []).length === 3 &&
  src.includes("appState.start = { ...coords, elev: validElev + appState.startHeight };") && src.includes("appState.start.elev = elev + appState.startHeight;") &&
  src.includes("appState.start = { lat: latlng.lat, lng: latlng.lng, elev: val + appState.startHeight };") &&
  (src.match(/appState\.endHeight = 0;/g) || []).length === 2 && !/appState\.startHeight = 0;/.test(src) &&
  /DEFAULT_START = \{[^}]*height: 150/.test(src) &&
  html.includes('観測点を地名・座標・地図・GPS・写位で置いた時の高さは 1.5m (地上に立った人の目の高さ)、目的点は 0m です'));

// ---- S3: 写位(静的) ----
check('S3 写位: 位置情報メニューの「高移」の次の段(目的点標高の行)に btn-photo-pos と file-photo-pos・配線・setLocationFromPhoto は _exifGpsFromArrayBuffer→applyLocationCoords・ヘルプ',
  /id="btn-move-peak"[\s\S]{0,600}?<div class="btn-group-left">\s*<button id="btn-photo-pos" class="nav-btn small"[^>]*>写位<\/button>\s*<input type="file" id="file-photo-pos" accept="image\/\*" style="display:none">\s*<\/div>\s*<label class="input-label">目的点標高\(m\):<\/label>/.test(html) &&
  src.includes("document.getElementById('btn-photo-pos').onclick = () => document.getElementById('file-photo-pos').click();") &&
  /getElementById\('file-photo-pos'\)\.addEventListener\('change'[\s\S]{0,300}?setLocationFromPhoto\(f\);/.test(src) &&
  /async function setLocationFromPhoto\(file\) \{[\s\S]*?_exifGpsFromArrayBuffer\(await file\.arrayBuffer\(\)\)[\s\S]*?await applyLocationCoords\(\{ lat, lng \}, isStart\);\n\}/.test(src) &&
  html.includes('<li><strong>写位 (写真の位置)</strong>'));

// ---- S4: 宙の窓検索のコントロール(静的) ----
check('S4 宙の窓検索ctrl: 2つのラジオ(name=sora-ctrl-drag・構図が初期)+各段の「リセット」(sora-ctrl-reset=幅1/3・右寄せ)+「辻検索」「辻メッシュ」+注記の文+ヘルプ+CSS',
  /<div class="control-row left-row sora-ctrl-drag-row">\s*<label class="baseopt-radio" for="chk-sora-ctrl-drag-frame"[^>]*><input type="radio" name="sora-ctrl-drag" id="chk-sora-ctrl-drag-frame" value="frame" checked>:構図をドラッグ\(二本指\)で変更<\/label>\s*<button id="btn-sora-ctrl-reset-frame" class="nav-btn sora-ctrl-reset"[^>]*>リセット<\/button>\s*<\/div>\s*<div class="control-row left-row sora-ctrl-drag-row">\s*<label class="baseopt-radio" for="chk-sora-ctrl-drag-tsuji"[^>]*><input type="radio" name="sora-ctrl-drag" id="chk-sora-ctrl-drag-tsuji" value="tsuji">:辻オフセット点をドラッグ\(二本指\)で変更<\/label>\s*<button id="btn-sora-ctrl-reset-tsuji" class="nav-btn sora-ctrl-reset"[^>]*>リセット<\/button>\s*<\/div>\s*<div class="control-row main-buttons-row sora-ctrl-search-row">/.test(html) &&
  html.includes('プレビュー下のコントロールメニューから構図を見ながら辻オフセット点を変更して、辻検索・辻メッシュ検索ができます。</span>') &&
  html.includes('各段の右の<strong>「リセット」</strong>は、構図の段ではカメラオフセット方位角/視高度を0に、辻オフセット点の段では辻オフセット方位角/視高度を0に戻します') &&
  css.includes('#soramado-ctrl-body .sora-ctrl-drag-row .sora-ctrl-reset { flex: 0 0 calc(100% / 3); width: calc(100% / 3); min-width: 0; margin-left: auto;') &&
  src.includes("if (_smCamNudgeBase === null) _smCamNudgeBase = { az: Number(appState.soraOffsetAz) || 0, alt: Number(appState.soraOffsetAlt) || 0 };   // ドラッグ(二本指)の戻り先も覚える"));

(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true, args: ARGS });
  const ctx = await b.newContext({ viewport: { width: 900, height: 900 }, timezoneId: 'Asia/Tokyo' });
  await ctx.route('**/*', route => { route.request().url().startsWith(BASE) ? route.continue() : route.abort(); });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('dialog', d => d.accept());
  await p.goto(BASE + '/index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof computeDayTwilight === 'function' && typeof setLocationFromPhoto === 'function' && typeof _smSetupSearchCtrl === 'function', { timeout: 8000 });
  await p.waitForTimeout(400);

  // ---- A1: 月の出/月の入の境界(実機): その日の中・無い日は NaN で通さない・短縮URLの往復・ラジオの並び ----
  const a1 = await p.evaluate(() => {
    const obs = new Astronomy.Observer(35.6585, 139.7454, 150);
    const d0 = new Date(2026, 9, 15, 0, 0, 0, 0);   // 2026-10-15 JST
    const res = { days: 0, inDay: 0, none: [], agree: 0, disagree: [] };
    for (let i = 0; i < 40; i++) {
      const day = new Date(d0.getTime() + i * 86400000);
      const tw = computeDayTwilight(day, obs);
      const next = new Date(day.getTime() + 86400000);
      res.days++;
      for (const k of ['moonrise', 'moonset']) {
        const v = tw[k];
        if (v === null) { res.none.push(`${day.getDate()}:${k}`); continue; }
        if (v >= day && v < next) res.inDay++;
        const rs = _searchSunMoonRiseSet(obs, day)[k === 'moonrise' ? 'mr' : 'ms'];   // 2日以内の最初の出没(従来の関数)
        if (rs && rs.date >= day && rs.date < next) { if (Math.abs(rs.date - v) < 1000) res.agree++; else res.disagree.push(`${day.getDate()}:${k}`); }
      }
    }
    // 通す/通さない: 月の出〜月の出+1:00 の窓
    const tw0 = computeDayTwilight(d0, obs);
    const mr = tw0.moonrise;
    const fs = { startMode: 'moonrise', startTime: '00:00', startPrePost: false, startPrePostDir: 'after', startOffset: '00:00', endMode: 'moonrise', endTime: '00:00', endPrePost: true, endPrePostDir: 'after', endOffset: '01:00' };
    const inside = mr ? passesTimeFilter(new Date(mr.getTime() + 30 * 60000), tw0, fs) : null;
    const outside = mr ? passesTimeFilter(new Date(mr.getTime() + 90 * 60000), tw0, fs) : null;
    const twNone = Object.assign({}, tw0, { moonrise: null });
    const noneDay = passesTimeFilter(new Date(mr ? mr.getTime() + 30 * 60000 : d0.getTime() + 3600000), twNone, fs);   // 月の出が無い日: 通さない
    const sunNone = passesTimeFilter(new Date(d0.getTime() + 3600000), Object.assign({}, tw0, { astroDawn: null }), Object.assign({}, fs, { startMode: 'astroDawn', endMode: 'fixed', endTime: '23:59', endPrePost: false }));   // 太陽の境界が無い: 従来どおり通す
    const grid = timeFilterModeGridHtml('x', 'sunset', 'c', '');
    const labels = Array.from(grid.matchAll(/value="([a-zA-Z]+)"[^>]*>([^<]+)<\/label>/g)).map(m => m[1] + '=' + m[2]);
    const i1 = labels.indexOf('sunrise=日の出'), i2 = labels.indexOf('moonrise=月の出'), i3 = labels.indexOf('ghEnd=GH[終]'), i4 = labels.indexOf('ghStart=GH[始]'), i5 = labels.indexOf('moonset=月の入'), i6 = labels.indexOf('sunset=日の入');
    const q = '&tsujiStartMode=moonrise&tsujiEndMode=moonset';
    const enc = encodeQueryParam(q.slice(1)); const dec = decodeQueryParam(enc);
    const validModes = TSUJI_TIME_MODES.map(m => m.v);
    return { ...res, mrNull: mr === null, inside, outside, noneDay, sunNone, order: [i1, i2, i3, i4, i5, i6], labelsN: labels.length, enc, dec, ver: _QP_SEED_VERSIONS.length, validHas: validModes.includes('moonrise') && validModes.includes('moonset') };
  });
  check('A1 月の出/月の入(実機・東京タワー 2026-10-15から40日): 境界はその日の0時〜24時の中・従来の2日探索と同じ日なら一致・無い日が1回以上ある → 窓「月の出〜月の出+1:00」は+30分を通し+90分を通さない・月の出が無い日は通さない(太陽の境界が無い時は従来どおり通す)・ラジオの並びは 日の出→月の出→GH[終]→GH[始]→月の入→日の入(16項目)・短縮URL v23 で往復',
    a1.days === 40 && a1.inDay === 80 - a1.none.length && a1.none.length >= 1 && a1.disagree.length === 0 && a1.agree >= 60 &&
    !a1.mrNull && a1.inside === true && a1.outside === false && a1.noneDay === false && a1.sunNone === true &&
    a1.order[0] >= 0 && a1.order.every((v, i) => i === 0 || v === a1.order[0] + i) && a1.labelsN === 16 &&   // 日の出→月の出→GH[終]→GH[始]→月の入→日の入(第184)
    a1.dec === 'tsujiStartMode=moonrise&tsujiEndMode=moonset' && a1.ver === 23 && a1.validHas, JSON.stringify(a1));

  // ---- A2: 1.5m(実機): 座標→観測点は 高さ1.5・標高+1.5。目的点は 0。地図(applyMapPointAction)も同じ。Hom のリセット(空欄)は 150m ----
  const a2 = await p.evaluate(async () => {
    const keep = JSON.stringify({ st: appState.start, en: appState.end, ae: appState.startApiElev, h: appState.startHeight, ee: appState.endApiElev, eh: appState.endHeight, lm: appState.locMode });
    window.getElevation = async () => 100;   // 標高取得をスタブ(外部は遮断)
    appState.locMode = 'start';
    await applyLocationCoords({ lat: 35.5, lng: 139.5 }, true);
    const s1 = { api: appState.startApiElev, h: appState.startHeight, elev: appState.start.elev, ui: document.getElementById('input-start-elev').value };
    await applyLocationCoords({ lat: 35.6, lng: 139.6 }, false);
    const e1 = { api: appState.endApiElev, h: appState.endHeight, elev: appState.end.elev };
    appState.locMode = 'start';
    await applyMapPointAction({ lat: 35.7, lng: 139.7 });
    const s2 = { api: appState.startApiElev, h: appState.startHeight, elev: appState.start.elev, lat: appState.start.lat };
    appState.locMode = 'end';
    await applyMapPointAction({ lat: 35.8, lng: 139.8 });
    const e2 = { api: appState.endApiElev, h: appState.endHeight, elev: appState.end.elev, lat: appState.end.lat };
    const k = JSON.parse(keep); appState.start = k.st; appState.end = k.en; appState.startApiElev = k.ae; appState.startHeight = k.h; appState.endApiElev = k.ee; appState.endHeight = k.eh; appState.locMode = k.lm;
    return { s1, e1, s2, e2, eye: SORA.OBSERVER.EYE_HEIGHT_M, def: DEFAULT_START.height };
  });
  check('A2 観測点の高さ 1.5m(実機): 座標入力(applyLocationCoords)と地図(applyMapPointAction)で観測点=高さ1.5・標高(elev)=API標高+1.5・高さ欄も1.5。目的点は高さ0・elev=API標高。既定の Hom は 150m のまま',
    a2.eye === 1.5 && a2.def === 150 &&
    a2.s1.api === 100 && a2.s1.h === 1.5 && a2.s1.elev === 101.5 && String(a2.s1.ui) === '1.5' &&
    a2.e1.api === 100 && a2.e1.h === 0 && a2.e1.elev === 100 &&
    a2.s2.api === 100 && a2.s2.h === 1.5 && a2.s2.elev === 101.5 && a2.s2.lat === 35.7 &&
    a2.e2.api === 100 && a2.e2.h === 0 && a2.e2.elev === 100 && a2.e2.lat === 35.8, JSON.stringify(a2));

  // ---- A3: 写位(実機): ラジオ=目的点 → 写真のGPSが目的点に入る(標高はスタブ100・高さ0)。ラジオ=観測点 → 観測点に入り高さ1.5。GPS無しは何もしない ----
  const a3 = await p.evaluate(async (bytes) => {
    const keep = JSON.stringify({ st: appState.start, en: appState.end, ae: appState.startApiElev, h: appState.startHeight, ee: appState.endApiElev, eh: appState.endHeight, lm: appState.locMode });
    window.getElevation = async () => 100;
    let confirms = 0; window.confirm = () => { confirms++; return true; };
    let alerts = 0; window.alert = () => { alerts++; };
    const file = new File([Uint8Array.from(bytes)], 'p.jpg', { type: 'image/jpeg' });
    document.getElementById('radio-end').checked = true; appState.locMode = 'end';
    await setLocationFromPhoto(file);
    const e = { lat: appState.end.lat, lng: appState.end.lng, api: appState.endApiElev, h: appState.endHeight, box: document.getElementById('input-end-latlng').value };
    document.getElementById('radio-start').checked = true; appState.locMode = 'start';
    await setLocationFromPhoto(file);
    const s = { lat: appState.start.lat, lng: appState.start.lng, api: appState.startApiElev, h: appState.startHeight, elev: appState.start.elev, box: document.getElementById('input-start-latlng').value };
    const before = JSON.stringify(appState.start);
    await setLocationFromPhoto(new File([Uint8Array.from([0xFF, 0xD8, 0xFF, 0xD9])], 'nogps.jpg', { type: 'image/jpeg' }));
    const unchanged = JSON.stringify(appState.start) === before;
    const k = JSON.parse(keep); appState.start = k.st; appState.end = k.en; appState.startApiElev = k.ae; appState.startHeight = k.h; appState.endApiElev = k.ee; appState.endHeight = k.eh; appState.locMode = k.lm;
    return { e, s, confirms, alerts, unchanged };
  }, Array.from(PHOTO));
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  check('A3 写位(実機): ラジオ=目的点で写真の位置(35.36075,138.727361)が目的点(°)に入る(標高は緯度経度から・高さ0)→ラジオ=観測点で観測点に入り高さ1.5・座標欄にも反映→GPS無しの写真は alert で何もしない(確認2回・alert 1回)',
    near(a3.e.lat, 35.36075) && near(a3.e.lng, 138.727361) && a3.e.api === 100 && a3.e.h === 0 && a3.e.box.includes('35.36075') &&
    near(a3.s.lat, 35.36075) && near(a3.s.lng, 138.727361) && a3.s.api === 100 && a3.s.h === 1.5 && a3.s.elev === 101.5 && a3.s.box.includes('138.727361') &&
    a3.confirms === 2 && a3.alerts === 1 && a3.unchanged, JSON.stringify(a3));

  // ---- A4: 宙の窓検索ctrl(実機): ラジオの択一・各段のリセット・二本指(ドラッグ)後にカメラの「リセット」が効く(棚卸し460)・リセットの幅 ----
  await p.evaluate(() => { document.getElementById('btn-soramado').click(); });
  await p.waitForFunction(() => appState.isSoramadoActive && typeof _smInited !== 'undefined' && _smInited, { timeout: 15000 }).catch(() => {});
  await p.evaluate(() => { const h = document.getElementById('soramado-ctrl-header'); if (h && document.getElementById('soramado-ctrl-body').classList.contains('hidden')) h.click(); });
  await p.waitForTimeout(500);
  const cvBox = await p.evaluate(() => { const r = document.getElementById('soramado-canvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, ok: r.width > 50 && r.height > 50 }; });
  const drag = async (dx, dy) => {
    const x0 = cvBox.x + cvBox.w / 2, y0 = cvBox.y + cvBox.h / 2;
    await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move(x0 + dx / 2, y0 + dy / 2, { steps: 2 }); await p.mouse.move(x0 + dx, y0 + dy, { steps: 2 }); await p.mouse.up();
    await p.waitForTimeout(150);
  };
  const pick = async (id) => p.evaluate((id) => { const c = document.getElementById(id); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }, id);
  const st = () => p.evaluate(() => ({ az: appState.soraOffsetAz, alt: appState.soraOffsetAlt, taz: appState.tsujiSearchOffsetAz, talt: appState.tsujiSearchOffsetAlt, maz: appState.tsujiMeshOffsetAz, malt: appState.tsujiMeshOffsetAlt,
    frame: document.getElementById('chk-sora-ctrl-drag-frame').checked, tsuji: document.getElementById('chk-sora-ctrl-drag-tsuji').checked, df: _smDragFrame, dt: _smDragTsuji, base: _smTsujiDragBase, cam: _smCamNudgeBase,
    menu: document.getElementById('input-tsuji-az-offset').value }));
  const s0 = await p.evaluate(() => { appState.soraOffsetAz = 0; appState.soraOffsetAlt = 0; _smCamNudgeBase = null; appState.tsujiSearchOffsetAz = 1.5; appState.tsujiSearchOffsetAlt = 0.5; _tsujiLinkPropagate('tsuji', false); updateOffsetDistances(); soraSyncUI(); drawSoramado(); return true; });
  const b0 = await st();
  await drag(40, 0);                                             // 構図(初期): カメラオフセット方位角が減る。戻り先(_smCamNudgeBase)を覚える(460)
  const b1 = await st();
  await p.evaluate(() => document.getElementById('btn-sora-cam-reset').click());   // カメラの「リセット」で戻る
  const b2 = await st();
  await drag(40, 0);
  await p.evaluate(() => document.getElementById('btn-sora-ctrl-reset-frame').click());   // ctrl の構図「リセット」=0
  const b3 = await st();
  await pick('chk-sora-ctrl-drag-tsuji');                        // 辻オフセット点へ(択一: 構図は外れる)。戻り先 1.5/0.5
  const b4 = await st();
  await drag(40, -20);                                           // ×が右上へ=辻オフセット増。カメラは不変
  const b5 = await st();
  await pick('chk-sora-ctrl-drag-frame');                        // 構図へ戻す=辻オフセットはそのまま(第184・依頼者)
  const b6 = await st();
  await pick('chk-sora-ctrl-drag-tsuji'); await drag(40, -20);
  await p.evaluate(() => document.getElementById('btn-sora-ctrl-reset-tsuji').click());   // 辻オフセット点の「リセット」=0(辻メッシュ側も)
  const b7 = await st();
  await pick('chk-sora-ctrl-drag-frame');                        // リセット後に構図へ戻しても 0 のまま(切り替えでは何も戻さない)
  const b8 = await st();
  const widths = await p.evaluate(() => {
    const row = document.querySelector('#soramado-ctrl-body .sora-ctrl-drag-row'), btn = document.getElementById('btn-sora-ctrl-reset-frame');
    const r = row.getBoundingClientRect(), bb = btn.getBoundingClientRect();
    return { row: r.width, btn: bb.width, rightGap: r.right - bb.right, both: document.querySelectorAll('#soramado-ctrl-body .sora-ctrl-reset').length, radios: document.querySelectorAll('input[name="sora-ctrl-drag"]').length };
  });
  check('A4 宙の窓検索ctrl(実機): 構図のドラッグで戻り先を覚えカメラの「リセット」で戻る(460)→ctrlの構図「リセット」で0→ラジオ=辻オフセット点(構図は外れる)でドラッグ=辻オフセット増・カメラ不変→構図へ戻しても辻オフセットはそのまま(第184)→辻オフセット点の「リセット」で0(辻メッシュ側も)→構図へ戻しても0のまま。リセットは行の幅の1/3で右端',
    cvBox.ok && s0 && b0.frame && !b0.tsuji && b0.df && !b0.dt && b0.cam === null &&
    b1.az < -0.01 && b1.cam && b1.cam.az === 0 && b1.cam.alt === 0 && b1.taz === 1.5 &&
    b2.az === 0 && b2.alt === 0 && b2.cam === null &&
    b3.az === 0 && b3.alt === 0 && b3.cam === null &&
    b4.tsuji && !b4.frame && b4.dt && !b4.df &&
    b5.taz > 1.5 + 0.01 && b5.talt > 0.5 + 0.005 && b5.maz === b5.taz && b5.az === 0 && Math.abs(parseFloat(b5.menu) - b5.taz) < 1e-6 &&
    b6.frame && !b6.tsuji && b6.taz === b5.taz && b6.talt === b5.talt && b6.maz === b5.taz &&
    b7.taz === 0 && b7.talt === 0 && b7.maz === 0 && b7.malt === 0 && parseFloat(b7.menu) === 0 &&
    b8.frame && b8.taz === 0 && b8.talt === 0 &&
    widths.both === 2 && widths.radios === 2 && Math.abs(widths.btn - widths.row / 3) < 2 && Math.abs(widths.rightGap) < 1,
    JSON.stringify({ cvBox, b0, b1, b2, b3, b4, b5, b6, b7, b8, widths }));

  check('E ページエラーなし', errs.length === 0, errs.join(' | ').slice(0, 300));
  await b.close();
  console.log(`\n結果: ${PASS} PASS / ${FAIL} FAIL`);
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
