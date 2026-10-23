// 第186ラウンド検証: v1.99.3 — ①Google マップ/Apple マップの URL・geo: URI・度分秒から観測点/目的点/花火点/My点を設定(通信なし。短縮URLは案内文) ②端末のデータの「天気の控え」の行を宙検索/宙断面の封鎖に連動して非表示
// ③宙の窓 ctrl のラジオの大きさ(label の中のラジオ/チェックは flex 0 0 auto) ④「宙の窓検索」→「宙の窓」 ⑤ロゴの SVG(図形)とアイコン5種 ⑥移行用 meta の削除 ⑦文書(重要なお知らせ/リリースノートの改名・FAQ・todo)
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
const ex = (f) => fs.existsSync(path.join(ROOT, f));
const src = rd('script.js'), html = rd('index.html'), consts = rd('sora-constants.js'), css = rd('style.css');
const APP_VER = (/APP_VERSION = '([^']+)'/.exec(consts) || [])[1];
const pngSize = (f) => { const b = fs.readFileSync(path.join(ROOT, f)); return b.length > 24 && b.toString('latin1', 1, 4) === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };

// ---- V0: 版のピン(最新の verify が持つ) ----
const _atLeast = (v, w) => { const a = String(v).split('.').map(Number), b = w.split('.').map(Number); for (let i = 0; i < 3; i++) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0); } return true; };
check('V0 版は 1.99.3 以上(第187で 1.99.4 へ。版のピンは最新の verify191 が持つ)+移行用 meta は無い(第186で削除)+Version History に 1.99.3 の行が第186で残る',
  _atLeast(APP_VER, '1.99.3') && !/<meta name="app-version"/.test(html) && /Version 1\.99\.3 - 2026-10-22: [^\n]*第186ラウンド/.test(src), APP_VER);

// ---- S1: 地図 URL・度分秒(静的) ----
const hintCalls = (src.match(/if \(_mapUrlLooksLike\(val\)\) \{ alert\(_MAP_URL_HINT\); return; \}/g) || []).length;
check('S1 地図 URL(静的): _mapUrlParse/_dmsParse/_llPair/_mapUrlLooksLike/_MAP_URL_HINT があり、parseInput は Plus Code→URL→度分秒→「緯度,経度」の順・案内の呼び出しは観測点/目的点・My点の行・花火点の3箇所・プレースホルダー「地図URL」(位置情報2+花火2+My点の行)・ツールチップとヘルプに URL と度分秒と短縮URLの案内・オフラインの「できないこと」の文',
  src.includes('function _mapUrlParse(raw) {') && src.includes('function _dmsParse(raw) {') && src.includes('function _llPair(t) {') && src.includes('function _mapUrlLooksLike(raw) {') && src.includes("const _MAP_URL_HINT = 'この URL からは位置を読み取れませんでした。") &&
  /const pc = _plusCodeDecode\(val\);[^\n]*\n\s*if \(pc\) return pc;\n\s*const mu = _mapUrlParse\(val\);[^\n]*\n\s*if \(mu\) return mu;\n\s*const dms = _dmsParse\(val\);[^\n]*\n\s*if \(dms\) return dms;\n\s*if \(val\.indexOf\(','\) === -1\) return null;/.test(src) &&
  hintCalls === 3 &&
  (html.match(/placeholder="Plus Code、緯度,経度、地図URL"/g) || []).length === 2 && (html.match(/placeholder="地名、Plus Code、緯度,経度、地図URL"/g) || []).length === 2 && src.includes('placeholder="地名、Plus Code、緯度,経度、地図URL"') &&
  (html.match(/Google マップ\/Apple マップの URL\(地点のピンの URL。短縮URLは不可\)・度分秒・地名・およその住所で(観測点|目的点)を設定/g) || []).length === 2 &&
  html.includes('<strong>Google マップ/Apple マップの URL</strong> (地点のピンの URL。Google マップの「共有」で出る短縮URL (maps.app.goo.gl/…) は宙の辻では展開できないので') && html.includes('<strong>度分秒</strong> (例: 35°39\'30.9"N 139°44\'43.6"E。') &&
  html.includes('(Plus Code のフルコード・Google マップの URL・「緯度,経度」は通信なしで変換できます)'), JSON.stringify({ hintCalls }));

// ---- S2: 天気の控えの行の封鎖 ----
check('S2 天気の控えの行の封鎖: index.html は backup-wx-block で見出し〜削除ボタンを包む・applyFeatureLocks が FEATURE_FORECAST_ENABLED でなければ feature-locked を付ける(可視マップの早期 return より前)・ヘルプ/ツールチップ/FAQ/リリースノートから天気の控えの記述を外した(片付けワーカーの TTL はそのまま)',
  /<div id="backup-wx-block">[^\n]*\n\s*<hr class="tsujisearch-separator km-hr">\n\s*<div class="control-row left-row"><label class="baseopt-group-label km-sub" title="宙検索・宙断面が使う天気[\s\S]*?天気の控えを削除<\/button><\/div>\n\s*<\/div>\n\s*<hr class="tsujisearch-separator km-hr">\n\s*<div class="control-row left-row"><label class="baseopt-group-label km-sub" title="宙の辻の本体/.test(html) &&
  /function applyFeatureLocks\(\) \{\n\s*if \(!FEATURE_FORECAST_ENABLED\) \{ const wb = document\.getElementById\('backup-wx-block'\); if \(wb\) wb\.classList\.add\('feature-locked'\); \}[^\n]*\n\s*if \(FEATURE_KASHIMAP_ENABLED\) return;/.test(src) &&
  !html.includes('天気の控え・本体の控えの件数') && !html.includes('天気の控えは2時間') && !html.includes('天気の期限切れを今すぐ') && html.includes('(地図・標高・建物は上の控えのある範囲だけ)') &&
  rd('sora-store-worker.js').includes('wxTtlMs') && !rd('docs/note/note-faq-page.md').includes('天気の控えは取ってから') && !rd('docs/release-notes/v1.99.4.md').includes('天気の控え'));

// ---- S3: ラジオ/チェックの flex ----
check('S3 CSS: label の中のラジオ/チェックボックスは flex: 0 0 auto(文が折り返す段で縮まない。第186)',
  css.includes('label > input[type="radio"],\nlabel > input[type="checkbox"] { margin-top: 0; margin-bottom: 0; flex: 0 0 auto; }'));

// ---- S4: 「宙の窓検索」→「宙の窓」 ----
const topBody = rd('docs/note/note-top-page.md').split('\n---\n').slice(1).join('\n');
check('S4 「宙の窓検索」→「宙の窓」: 位置情報メニューのボタン・ヘルプの節・index.html/README/docs/note(本文)/リリースノート v1.99.3 に「宙の窓検索」が残らない・verify174/183 のピンも新しい名前',
  /<button id="btn-soramado" class="nav-btn main-btn" title="[^"]*辻検索・辻メッシュ検索へ">宙の窓<\/button>/.test(html) && html.includes('<h3>宙の窓</h3>') && html.includes('<p>「宙の窓」ボタンON時に、') &&
  !html.includes('宙の窓検索') && !rd('README.md').includes('宙の窓検索') && !topBody.includes('宙の窓検索') && !rd('docs/note/note-faq-page.md').includes('宙の窓検索') && !rd('docs/release-notes/v1.99.4.md').includes('宙の窓検索') &&
  rd('tests/verify183.js').includes('>宙の窓<\\/button>') && rd('tests/verify174.js').includes('>宙の窓<\\/button>'));

// ---- S5: ロゴとアイコン ----
const svg = rd('logo.svg'); const ico = fs.readFileSync(path.join(ROOT, 'favicon.ico'));
check('S5 ロゴ: logo.svg は図形(<image> 無し・linearGradient 2つ・三角 0,1000 500,1000 1000,0・円 r=146.447 中心 646.447,146.447・#ff0000→#ee7800)・PNG は 100/180/192/512・favicon.ico は PNG 4枚の ICO・道具 tools/icons/render-icons.js・deploy-guide に手順',
  !svg.includes('<image') && (svg.match(/<linearGradient /g) || []).length === 2 && svg.includes('<polygon points="0,1000 500,1000 1000,0"') && svg.includes('<circle cx="646.447" cy="146.447" r="146.447"') && svg.includes('stop-color="#ff0000"') && svg.includes('stop-color="#ee7800"') &&
  JSON.stringify(pngSize('logo.png')) === '[100,100]' && JSON.stringify(pngSize('apple-touch-icon.png')) === '[180,180]' && JSON.stringify(pngSize('icon-192.png')) === '[192,192]' && JSON.stringify(pngSize('icon-512.png')) === '[512,512]' &&
  ico.readUInt16LE(0) === 0 && ico.readUInt16LE(2) === 1 && ico.readUInt16LE(4) === 4 && ico.toString('latin1', ico.readUInt32LE(18) + 1, ico.readUInt32LE(18) + 4) === 'PNG' &&
  ex('tools/icons/render-icons.js') && rd('ClaudeMederuU/tools/README.md').includes('tools/icons/render-icons.js') /* 第193: 依頼者が deploy-guide のチェックリストを UI の確認に絞ったので、手順の所在は道具の台帳で見る */);

// ---- S6: 文書 ----
const rn = rd('docs/release-notes/v1.99.4.md');
check('S6 文書: 重要なお知らせの下書きは note-important-notice-page.md(旧名は無い・「お知らせ」の記事とは別)・リリースノートは v1.99.4.md(旧名は無い・§4 に URL・§7 は1行=第187)・FAQ に「Google マップで見つけた場所を」の Q・todo の備忘録にコンパス/固定タブ/次の監査・デッサン01 に URL の読む順',
  ex('docs/note/note-important-notice-page.md') && !ex('docs/note/note-notice-page.md') && rd('docs/note/note-important-notice-page.md').includes('とは別の記事') &&
  ex('docs/release-notes/v1.99.4.md') && !ex('docs/release-notes/v1.99.3.md') && rn.startsWith('# 宙の辻 v1.99.4 リリースのお知らせ') && rn.includes('- **Google マップ/Apple マップの URL から**') && /## 7\. その他の修正\n\n- Google ドライブ同期[^\n]*\n\n/.test(rn) /* 第187: §7 は利用者に要る1行だけ */ &&
  rd('docs/note/note-faq-page.md').includes('# Q. Google マップで見つけた場所を、宙の辻の観測点/目的点にしたい。') &&
  rd('docs/todo.md').includes('コンパスアイコンのボタンを作り') && rd('docs/todo.md').includes('上の方に固定されたタブ') && rd('docs/todo.md').includes('「### 次の監査でやる事」') &&
  rd('docs/dessin/dessin/01-location.md').includes('読む順(_mapUrlParse)'));

(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true, args: ARGS });
  const ctx = await b.newContext({ viewport: { width: 900, height: 900 }, timezoneId: 'Asia/Tokyo' });
  await ctx.route('**/*', route => { route.request().url().startsWith(BASE) ? route.continue() : route.abort(); });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const dialogs = []; p.on('dialog', d => { dialogs.push(d.message()); d.dismiss(); });
  await p.goto(BASE + '/index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof _mapUrlParse === 'function' && typeof handleLocationInput === 'function' && typeof glMap !== 'undefined' && glMap, { timeout: 15000 });
  await p.waitForTimeout(400);

  // U1: parseInput/_dmsParse の単体(実機の関数で)
  const u1 = await p.evaluate(() => {
    const near = (r, lat, lng) => !!r && Math.abs(r.lat - lat) < 2e-4 && Math.abs(r.lng - lng) < 2e-4;
    const cases = [
      ['https://www.google.com/maps/place/%E6%9D%B1%E4%BA%AC%E3%82%BF%E3%83%AF%E3%83%BC/@35.6585805,139.7432442,17z/data=!3m1!4b1!4m6!3m5!1s0x60188bbd9009ec09:0x481a93f0d2a409dd!8m2!3d35.6585805!4d139.7454329!16zL20vMDdfbTk?entry=ttu', 35.6585805, 139.7454329],
      ['https://www.google.com/maps/place/35%C2%B039\'30.9%22N+139%C2%B044\'43.6%22E/@35.6585805,139.7428,17z/data=!3m1!4b1!4m4!3m3!8m2!3d35.6585805!4d139.7454329', 35.6585805, 139.7454329],
      ['https://www.google.com/maps/place/35%C2%B039\'30.9%22N+139%C2%B044\'43.6%22E/@35.6585805,139.7428,17z', 35.658583, 139.745444],
      ['https://www.google.com/maps/search/35.6585805,139.7454329?entry=tts', 35.6585805, 139.7454329],
      ['https://www.google.com/maps/search/?api=1&query=35.6585805%2C139.7454329', 35.6585805, 139.7454329],
      ['https://www.google.com/maps/dir/%E6%9D%B1%E4%BA%AC%E9%A7%85/35.6585805,139.7454329/@35.67,139.75,14z', 35.6585805, 139.7454329],
      ['https://maps.google.com/maps?q=35.6585805,139.7454329&z=15', 35.6585805, 139.7454329],
      ['https://maps.google.com/?q=loc:35.6585805,139.7454329', 35.6585805, 139.7454329],
      ['https://www.google.co.jp/maps/@35.6585805,139.7454329,15z', 35.6585805, 139.7454329],
      ['https://maps.apple.com/?ll=35.6585805,139.7454329&q=Tokyo%20Tower', 35.6585805, 139.7454329],
      ['https://maps.apple.com/place?coordinate=35.6585805,139.7454329&name=Tokyo%20Tower', 35.6585805, 139.7454329],
      ['geo:-33.8688,151.2093', -33.8688, 151.2093],
      ['https://www.google.com/maps/place/40%C2%B041\'21.1%22N+74%C2%B002\'40.2%22W/@40.689,-74.044,17z', 40.689194, -74.0445],
      ['35°39\'30.9"N 139°44\'43.6"E', 35.658583, 139.745444], ['139°44\'43.6"E 35°39\'30.9"N', 35.658583, 139.745444], ['N 35°39\'30.9" E 139°44\'43.6"', 35.658583, 139.745444],
      ['北緯35度39分30.9秒 東経139度44分43.6秒', 35.658583, 139.745444], ['33°51\'35.9"S 151°12\'40.0"E', -33.859972, 151.211111], ['35°39.515\'N 139°44.727\'E', 35.658583, 139.74545],
      ['8Q7XMQPJ+2V', 35.6850625, 139.7821875], ['35.1, 139.2', 35.1, 139.2], ['(35.1,139.2)', 35.1, 139.2],
      ['https://maps.app.goo.gl/AbCdEfGh12345', null], ['https://goo.gl/maps/AbCdEf', null], ['https://example.com/maps/@35.6,139.7,15z', null], ['https://www.google.com/maps/place/91.0,200.0', null],
      ['https://www.google.com/maps?q=Tokyo+Tower', null], ['東京タワー', null], ['35°', null], ['気温 25°C', null], ['MQPJ+2V 港区', null],
    ];
    const bad = [];
    for (const c of cases) { const r = parseInput(c[0]); const ok = c[1] === null ? r === null : near(r, c[1], c[2]); if (!ok) bad.push([c[0].slice(0, 60), r]); }
    return { n: cases.length, bad, looks: [_mapUrlLooksLike('https://maps.app.goo.gl/x'), _mapUrlLooksLike('geo:1,2'), _mapUrlLooksLike('東京タワー')] };
  });
  check('U1 parseInput の単体(実機): Google マップ(ピン/度分秒のピン/search/dir/q=/loc:/co.jp/@中心)・Apple(ll=/coordinate=)・geo:・度分秒(後置き/経度先/前置き/漢字/南半球/度分)・従来の Plus Code と「緯度,経度」はそのまま・短縮URL/地名/他サイト/範囲外/短縮形の Plus Code は null(短縮形は次の段で解決)',
    u1.bad.length === 0 && u1.looks.join() === 'true,true,false', JSON.stringify(u1));

  // U2: 実機の流れ(観測点・目的点・短縮URL・花火点・My観測点の行)
  const u2 = await p.evaluate(async () => {
    const r = {};
    await handleLocationInput('https://www.google.com/maps/place/%E5%AF%8C%E5%A3%AB%E5%B1%B1/@35.3606,138.7274,15z/data=!4m6!3m5!1s0x6019629a42fdc899:0x9d2d5a4d4c8b4b6e!8m2!3d35.3606255!4d138.7273634!16zL20vMDE5ZDU', true, false);
    r.start = { lat: appState.start.lat, lng: appState.start.lng, box: document.getElementById('input-start-latlng').value };
    await handleLocationInput('35°21\'38.3"N 138°43\'38.5"E', false, false);
    r.end = { lat: appState.end.lat, lng: appState.end.lng };
    await handleLocationInput('https://maps.app.goo.gl/AbCdEfGh12345', true, false);
    r.afterShort = { lat: appState.start.lat, lng: appState.start.lng };
    await handleFwLocationInput('geo:35.1,139.1');
    r.fw = { lat: appState.fwLat, lng: appState.fwLng };
    const ge = window.getElevation; window.getElevation = async () => 42;   // 標高の取得は通信なので差し替え(verify158 と同じ)
    try {
      appState.myObservations = [{ id: Date.now(), name: 't', lat: null, lng: null, elev: 0, height: 0, memo: '', checked: false }];
      renderMyPointsList('obs');
      const inp = document.querySelector('.mypoint-latlng');
      inp.value = 'https://maps.apple.com/?ll=35.2,139.2&q=x'; inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await new Promise(res => setTimeout(res, 300));
      const pt = appState.myObservations[0]; r.my = { lat: pt.lat, lng: pt.lng, elev: pt.elev, ph: inp.placeholder };
    } finally { window.getElevation = ge; appState.myObservations = []; renderMyPointsList('obs'); }
    return r;
  });
  check('U2 実機: 観測点に Google マップの URL(ピン 35.3606255,138.7273634・欄は「緯度, 経度」に)・目的点に度分秒(35.36064,138.72736)・短縮URLは案内のダイアログで観測点は動かない・花火点に geo:・My観測点の行に Apple マップの URL(標高も取得・プレースホルダーに地図URL)',
    Math.abs(u2.start.lat - 35.3606255) < 1e-9 && Math.abs(u2.start.lng - 138.7273634) < 1e-9 && u2.start.box === '35.3606255, 138.7273634' &&
    Math.abs(u2.end.lat - 35.360639) < 1e-5 && Math.abs(u2.end.lng - 138.727361) < 1e-5 &&
    u2.afterShort.lat === u2.start.lat && u2.afterShort.lng === u2.start.lng && dialogs.some(d => d.startsWith('この URL からは位置を読み取れませんでした。')) &&
    u2.fw.lat === 35.1 && u2.fw.lng === 139.1 && u2.my.lat === 35.2 && u2.my.lng === 139.2 && u2.my.elev === 42 && u2.my.ph === '地名、Plus Code、緯度,経度、地図URL', JSON.stringify({ u2, dialogs: dialogs.map(d => d.slice(0, 40)) }));

  // U3: 天気の控えの行(既定は非表示・?forecast=1 で表示)
  const u3a = await p.evaluate(() => ({ disp: getComputedStyle(document.getElementById('backup-wx-block')).display, locked: document.getElementById('backup-wx-block').classList.contains('feature-locked') }));
  const p2 = await ctx.newPage();
  await p2.goto(BASE + '/index.html?forecast=1', { waitUntil: 'load' });
  await p2.waitForFunction(() => typeof applyFeatureLocks === 'function' && document.getElementById('app-version').textContent !== 'v0.0.0', { timeout: 15000 });
  const u3b = await p2.evaluate(() => ({ disp: getComputedStyle(document.getElementById('backup-wx-block')).display, locked: document.getElementById('backup-wx-block').classList.contains('feature-locked') }));
  await p2.close();
  check('U3 天気の控えの行: 既定は display:none(feature-locked)・?forecast=1 では出る', u3a.disp === 'none' && u3a.locked && u3b.disp !== 'none' && !u3b.locked, JSON.stringify({ u3a, u3b }));

  // U4: 宙の窓 ctrl のラジオの幅(字を大きくしても 20px)
  const u4 = await p.evaluate(() => {
    const q = s => document.querySelector(s); const frame = q('#chk-sora-ctrl-drag-frame'), tsuji = q('#chk-sora-ctrl-drag-tsuji');
    let el = frame; while (el && el !== document.body) { if (getComputedStyle(el).display === 'none') { el.style.display = 'block'; el.classList.remove('hidden'); } el = el.parentElement; }
    const w0 = [frame.getBoundingClientRect().width, tsuji.getBoundingClientRect().width];
    frame.parentElement.style.fontSize = '17px'; tsuji.parentElement.style.fontSize = '17px';
    const w1 = [frame.getBoundingClientRect().width, tsuji.getBoundingClientRect().width];
    return { w0, w1, ref: getComputedStyle(q('input[name="baseopt-center-mode"]')).width, shrink: getComputedStyle(frame).flexShrink };
  });
  check('U4 宙の窓 ctrl のラジオ: 字を 17px にしても 20px のまま(他のメニューのラジオと同じ・flex-shrink 0。直す前は 13〜15px に縮んでいた)',
    u4.w0.every(w => Math.abs(w - 20) < 0.01) && u4.w1.every(w => Math.abs(w - 20) < 0.01) && u4.ref === '20px' && u4.shrink === '0', JSON.stringify(u4));

  // ---- A1: 探索テストの直し(第186): 共有プール tsujiPool の4つの流れの排他(_tsujiFlowsCancelAll)・パネルを閉じると File取得も止まる・止められたチャンクは canceled の印 ----
  const a1 = await p.evaluate(async () => {
    const out = {};
    _tsujiFileRunning = true; myTsujiBatchRunning = true; myTsujiFileRunning = true;
    const g = [appState.tsujiSearchGeneration, _tsujiFileGen, myTsujiBatchGen, myTsujiFileGen];
    for (const id of ['btn-tsuji-file', 'btn-mytsuji-batch', 'btn-mytsuji-file']) document.getElementById(id).classList.add('active');
    _tsujiFlowsCancelAll('(テスト)');
    out.flags = [_tsujiFileRunning, myTsujiBatchRunning, myTsujiFileRunning];
    out.gens = [appState.tsujiSearchGeneration - g[0], _tsujiFileGen - g[1], myTsujiBatchGen - g[2], myTsujiFileGen - g[3]];
    out.btns = ['btn-tsuji-file', 'btn-mytsuji-batch', 'btn-mytsuji-file'].map(id => document.getElementById(id).classList.contains('active'));
    out.status = document.getElementById('tsujisearch-status').textContent;
    appState.isTsujiSearchActive = true; _tsujiFileRunning = true; const f0 = _tsujiFileGen; document.getElementById('btn-tsuji-file').classList.add('active');
    toggleTsujiSearch();   // 閉じる側
    out.close = { running: _tsujiFileRunning, gen: _tsujiFileGen - f0, btn: document.getElementById('btn-tsuji-file').classList.contains('active'), active: appState.isTsujiSearchActive };
    const pr = runTsujiChunks({ bodyMsg: { id: 'Sun', fixed: false }, observerData: { lat: 35, lng: 139, elev: 0 }, astroRefraction: true, targetAz: 90, targetAlt: 10, toleranceAz: 5, toleranceAlt: 5, centerMode: 'point', centerAz0: 90, centerAlt0: 10, searchStartMs: Date.now(), days: 400, maxResults: 100, onChunkDone: null });
    await new Promise(r => setTimeout(r, 30)); tsujiPool.terminateAll();
    const chunks = await pr; out.chunks = chunks.map(c => !!c.canceled);
    return out;
  });
  check('A1 探索テストの直し: _tsujiFlowsCancelAll で辻検索 File取得/My辻 一括計算/My辻 File取得の旗が全部降り、4つの世代が進み、3つのボタンが消灯し、状態の文が書かれる・パネルを閉じる(toggleTsujiSearch)と File取得が取り消される・terminateAll で止めたチャンクは canceled の印(欠けた CSV を出さない)',
    a1.flags.join() === 'false,false,false' && a1.gens.join() === '1,1,1,1' && a1.btns.join() === 'false,false,false' && a1.status === '(テスト)' &&
    a1.close.running === false && a1.close.gen === 1 && a1.close.btn === false && a1.close.active === false && a1.chunks.length === 2 && a1.chunks.every(Boolean), JSON.stringify(a1));

  // ---- A2: 「緯度,経度」の範囲外は受けず案内・地名検索の正規化を3経路で同じに・My観測点の行は blur(change)でも Plus Code を確定して標高を取り直す ----
  const a2 = await p.evaluate(async () => {
    const out = { range: [parseInput('95, 139.7'), parseInput('35.6, 190'), parseInput('139.7, 35.6'), parseInput('Infinity, 139'), parseInput('35.6, 139.7')],
      oor: [_coordOutOfRange('139.7, 35.6'), _coordOutOfRange('東京'), _coordOutOfRange('35.6,139.7'), _coordOutOfRange('(95, 139)')],
      norm: [_normLocQuery('港区1-2-3'), _normLocQuery('Matterhorn'), _normLocQuery('  Ayers Rock ')] };
    const s0 = appState.start.lat; await handleLocationInput('95, 139.7', true, false); out.startSame = appState.start.lat === s0;
    const ge = window.getElevation; window.getElevation = async () => 42;
    try {
      appState.myObservations = [{ id: Date.now(), name: 't', lat: null, lng: null, elev: 0, height: 0, memo: '', checked: false }]; renderMyPointsList('obs');
      const inp = document.querySelector('.mypoint-latlng'); inp.value = '8Q7XMQPJ+2V'; inp.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 200));
      const pt = appState.myObservations[0]; out.blur = { lat: pt.lat, lng: pt.lng, elev: pt.elev, box: inp.value, maxlength: inp.getAttribute('maxlength') };
    } finally { window.getElevation = ge; appState.myObservations = []; renderMyPointsList('obs'); }
    out.maxlen = ['input-start-latlng', 'input-end-latlng', 'input-fw-latlng', 'input-fw-ctrl-latlng'].map(id => document.getElementById(id).getAttribute('maxlength'));
    return out;
  });
  check('A2 範囲外の「緯度,経度」(95,139.7 / 35.6,190 / 139.7,35.6 / Infinity)は null で観測点は動かず案内のダイアログ・_coordOutOfRange は数値の組だけ true・正規化は日本語を含む時だけ全角(英字は無変換)・My観測点の行は blur で Plus Code が座標になり標高も取得・座標欄の maxlength は 2048(URL が切れない)',
    a2.range.slice(0, 4).every(r => r === null) && a2.range[4] && a2.range[4].lat === 35.6 && a2.oor.join() === 'true,false,false,true' && a2.norm.join('|') === '港区１－２－３|Matterhorn|Ayers Rock' &&
    a2.startSame && dialogs.some(d => d.startsWith('緯度は -90〜90、経度は -180〜180')) &&
    Math.abs(a2.blur.lat - 35.6850625) < 1e-6 && Math.abs(a2.blur.lng - 139.7821875) < 1e-6 && a2.blur.elev === 42 && a2.blur.maxlength === '2048' && a2.maxlen.every(m => m === '2048'), JSON.stringify(a2));

  // ---- A3: 結果CSVの書き手(createTsujiCsvWriter): 行を Blob の部品へ流し、downloadTextFile は Blob の配列を1つの Blob に(列見出しは第185のまま) ----
  const a3 = await p.evaluate(async () => {
    let got = null; const oc = URL.createObjectURL, ok = HTMLAnchorElement.prototype.click; URL.createObjectURL = (bl) => { got = bl; return 'blob:x'; }; HTMLAnchorElement.prototype.click = () => {};
    try {
      const w = createTsujiCsvWriter(); const c0 = w.count; w.finish('t.csv');
      const text = got ? await got.text() : null;
      return { c0, size: got && got.size, head: text && text.slice(0, 30), cols: text ? text.trim().split(',').length : 0, rows: TSUJI_CSV_BLOB_ROWS };
    } finally { URL.createObjectURL = oc; HTMLAnchorElement.prototype.click = ok; }
  });
  check('A3 結果CSVの書き手: 見出しだけの finish で Blob が1つ(66列・BOM 付き・先頭は「辻検索ID」)・TSUJI_CSV_BLOB_ROWS=5000',
    a3.c0 === 0 && a3.size > 1000 && a3.head.startsWith('辻検索ID,辻検索名') && a3.cols === 66 && a3.rows === 5000, JSON.stringify(a3));

  check('E ページエラーなし', errs.length === 0, errs.join(' | ').slice(0, 300));
  await b.close();
  console.log(`\n結果: ${PASS} PASS / ${FAIL} FAIL`);
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
