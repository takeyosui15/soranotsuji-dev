// 第59ラウンド検証: v1.54.0 依頼者フィードバック4件
// ①辻マーカー上のホバーでも詳細リストを連動(従来はメッシュマーカーのみ)
// ②詳細リスト行クリック直後に優辻マーカーが「表示されない」修正 — 実測でピンは生成済みだが
//   観測点マーカー(zIndex:1000)と完全同座標で真裏に隠れていた。同一座標の間だけ前面(1100)へ(_tmSyncPinZ)。
// ③「行選択後オプション」→「行選択後表示オプション」ラベル(ヘルプ2箇所も)
// ④メッシュ画素リスト(一覧側)にも「検索中心」列(デッサン04訂正。verify136のS2は4表へ意図更新済み)
const fs = require('fs');
const path = require('path');
let PASS = 0, FAIL = 0;
const check = (n, ok, d) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? '  ' + d : ''}`); ok ? PASS++ : FAIL++; };

const target = process.argv[2] || path.join(__dirname, '..', 'script.js');
const src = fs.readFileSync(target, 'utf8');
const html = fs.readFileSync(path.join(path.dirname(target), 'index.html'), 'utf8');

// ---- T0: 版数ピン(最新のverifyに集約) ----
check('T0 APP_VERSION 1.54.0', src.includes("APP_VERSION = '1.54.0'") || !!process.argv[2]);
check('T0 Version Historyに1.54.0の行がある', src.includes('Version 1.54.0 - ') || !!process.argv[2]);

// ---- T1: 静的な配線 ----
check('T1 画素リストの行データにcenterMode(検索の選択値を正規化して保持)',
    src.includes("centerMode: _tsujiMeshCalc.centerMode === 'line' ? 'line' : 'point',"));
{
    // 「行選択後オプション」は旧称0(「行選択後表示オプション」は部分文字列でないため単純countで判定できる)。
    // script.jsは冒頭のVersion History(改名の履歴として旧称に言及)を除いて数える(verify98 V0と同じ流儀)
    const body = src.replace(/^[\s\S]*?\*\//, '');
    const oldN = (html.match(/行選択後オプション/g) || []).length + (body.match(/行選択後オプション/g) || []).length;
    const newN = (html.match(/行選択後表示オプション/g) || []).length;
    check('T1 ラベル改名: 旧称「行選択後オプション」=0・新称がindex.htmlに存在', oldN === 0 && newN >= 2, `old=${oldN} new=${newN}`);
}
{
    // handleTsujiMeshGoldHover: 辻マーカー分岐とメッシュマーカー分岐の両方に詳細リスト連動がある
    const fn = src.slice(src.indexOf('function handleTsujiMeshGoldHover'), src.indexOf('function selectTsujiMeshRow'));
    const n = (fn.match(/_tmUpdateDetailList\(/g) || []).length;
    check('T1 ホバーの詳細リスト連動が辻マーカー/メッシュマーカーの2分岐にある', n === 2, `n=${n}`);
}
{
    const def = (src.match(/function _tmSyncPinZ\(/g) || []).length;
    const calls = (src.match(/_tmSyncPinZ\(\);/g) || []).length;
    check('T1 _tmSyncPinZ=定義1+呼出2(ピン配置時+観測点移動時)', def === 1 && calls === 2, `def=${def} calls=${calls}`);
}

// ============================================================
// ブラウザ検査(合成メッシュ4画素: verify98 V3方式+recalc用の最小ビン索引)
// ============================================================
(async () => {
    const { chromium } = require('playwright-core');
    const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
    const BASE = 'http://127.0.0.1:8099';
    const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'];
    const b = await chromium.launch({ executablePath: EXE, headless: true, args: ARGS });
    const ctx = await b.newContext({ viewport: { width: 900, height: 900 }, timezoneId: 'Asia/Tokyo' });
    await ctx.route('**/*', route => route.request().url().startsWith(BASE) ? route.continue() : route.abort());
    const p = await ctx.newPage();
    await p.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE + '/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof glMap === 'object' && glMap !== null && !!_glLocMarkers, { timeout: 10000 });
    await p.waitForTimeout(400);

    // 合成メッシュのセットアップ(以降のB1〜B3で共用)
    await p.evaluate(() => {
        const obs = { lat: 35.5, lng: 138.8, elev: 900 };
        const t0 = new Date(2026, 6, 19, 10, 0, 0);
        const aobs = new Astronomy.Observer(obs.lat, obs.lng, obs.elev);
        const eq = Astronomy.Equator('Sun', t0, aobs, true, true);
        const hor = Astronomy.Horizon(t0, aobs, eq.ra, eq.dec, null);
        const dOff = [0.011, 0.052, 0.201, 0.302];
        const N = 4;
        // 画素1の緯度経度が_tmPixAtLatLngで引けるよう、その地図画素をgxBase/gyBaseに据えた1×1グリッド
        const pixLL = { lat: 35.502, lng: 138.802 };
        const scale = Math.pow(2, TSUJIMESH_ZOOM), R = 128 / Math.PI;
        const gpx = Math.floor(128 * (pixLL.lng / 180 + 1) * scale);
        const gpy = Math.floor((128 - R * Math.atanh(Math.sin(pixLL.lat * Math.PI / 180))) * scale);
        _tsujiMeshCalc = {
            baseAz: Float64Array.from(dOff.map(d => hor.azimuth + d)),
            baseAlt: Float64Array.from(dOff.map(() => hor.altitude)),
            dE: new Float64Array(N), dN: new Float64Array(N), tanLat: Math.tan(obs.lat * Math.PI / 180),
            offsetAz: 0, offsetAlt: 0, centerMode: 'point',
            observerData: obs, refractionEnabled: false,
            minAlt: hor.altitude, maxAlt: hor.altitude,
            binSize: 360, nBins: 1, binIndex: Uint32Array.from([0, N]), binPixels: Uint32Array.from([0, 1, 2, 3]),
            grid: Int32Array.from([2]), gridW: 1, gxBase: gpx, gyBase: gpy,
            bounds: { west: 138.8019, east: 138.8021, north: 35.5021, south: 35.5019 },
        };
        _tsujiMeshPix = { lat: [35.501, 35.502, 35.503, 35.504], lng: [138.801, 138.802, 138.803, 138.804], elev: [900, 910, 920, 930] };
        window._tsujiMeshPixHeightUsed = 1.5;
        window._tsujiMeshLayerVisible = true;
        appState.end = { lat: 35.3606, lng: 138.7274, elev: 3776 };
        const sun = appState.bodies.find(bo => bo.id === 'Sun');
        const disp = (t) => {
            const d = new Date(t);
            return { dateObj: d, dateStr: '2026年07月19日', dowStr: '(日)', timeStr: _tmFmtTimeMs2(t),
                     timeCategory: '昼', sunriseStr: '05:00:00', sunsetStr: '19:00:00',
                     moonriseStr: '10:00:00', moonsetStr: '22:00:00', moonAge: 4.4, moonIcon: '🌒', moonIllum: 20.0,
                     symbol: '◎', elevationStatus: '-', mwOffAngle: 0, angularRadius: 0.262,
                     azDiff: 0, altDiff: 0, centerMode: 'point' };
        };
        const mkRow = (pixIdx, times, dist0) => Object.assign(disp(times[0]), {
            body: sun, dist: dist0,
            pixIdx: Uint32Array.from(pixIdx), pixTime: Float64Array.from(times),
            pixDist: Float32Array.from(pixIdx.map(i => dOff[i])),
            azimuth: hor.azimuth, altitude: hor.altitude });
        window.__t0 = t0.getTime();
        _tsujiMeshRows = [mkRow([2, 0, 1], [t0.getTime(), t0.getTime() + 60e3, t0.getTime() + 120e3], 0.011)];
        drawTsujiMeshMarkers();   // 白マーカー索引(CSR)を構築(詳細リストのデータ源)
    });

    // B1: 詳細リスト行クリック相当のジャンプ → 優辻ピンが観測点と同座標でも前面に見える
    {
        const r = await p.evaluate(async () => {
            const out = {};
            appState.currentDate = new Date(window.__t0 + 60e3);
            syncUIFromState();
            _tmSetObserverToPix(0);
            selectTsujiMeshRow(0, { pix: 0, timeMs: window.__t0 + 60e3, dist: 0.011 });
            await new Promise(res => setTimeout(res, 250));
            const pins = _glMarkerGroups.tmpin || [];
            out.pinCount = pins.length;
            if (pins.length) {
                const ll = pins[0].getLngLat(), oll = _glLocMarkers.obs.getLngLat();
                out.samePos = Math.abs(ll.lat - oll.lat) < 1e-9 && Math.abs(ll.lng - oll.lng) < 1e-9;
                out.pinZ = pins[0].getElement().style.zIndex;
                const pt = glMap.project([ll.lng, ll.lat]);
                const rect = glMap.getCanvas().getBoundingClientRect();
                const el = document.elementFromPoint(rect.left + pt.x, rect.top + pt.y - 15);
                out.top = el ? (el.closest('.location-marker') || el).className : null;
                // 観測点がピンから離れたら通常の前後関係(900=観測点の後ろ)に戻る
                appState.start = { lat: 35.6, lng: 138.9, elev: 0 };
                _tmSyncPinZ();
                out.pinZAway = pins[0].getElement().style.zIndex;
                appState.start = { lat: ll.lat, lng: ll.lng, elev: 910 + 1.5 };   // 戻す(B2でも使う)
                _tmSyncPinZ();
            }
            return out;
        });
        check('B1 ジャンプ後: ピンは観測点と同座標+前面(zIndex 1100)', r.pinCount === 1 && r.samePos && r.pinZ === '1100', JSON.stringify(r));
        check('B1 最前面の要素=優辻ピン(不具合時は観測点マーカーだった)', String(r.top || '').includes('location-marker-tsujigold'), r.top);
        check('B1 観測点が離れたら通常のzIndex(900)へ戻る', r.pinZAway === '900', `z=${r.pinZAway}`);
    }

    // B2: 辻マーカー上のホバーで詳細リストが更新される(+確定ポップアップ固定中は更新されない)
    {
        const r = await p.evaluate(async () => {
            const out = {};
            _tsujiMeshGoldSet = new Map([[1, 0.05]]);   // 画素1を辻マーカー集合に
            _glTmGoldShown = true;
            _tmDetailPix = -1;
            _tmDetailLockPopup = null;
            handleTsujiMeshGoldHover({ lat: 35.502, lng: 138.802 });   // 画素1の位置(1×1グリッドで解決)
            await new Promise(res => setTimeout(res, 100));
            out.detailPix = _tmDetailPix;
            out.header = document.getElementById('tsujimesh-detail-header').textContent;
            out.hidden = document.getElementById('tsujimesh-detail').classList.contains('hidden');
            const tip = document.querySelector('.maplibregl-popup-content');
            out.tip = tip ? tip.textContent.slice(0, 30) : '';
            // 確定ポップアップ固定中はホバーで更新しない
            _tmDetailLockPopup = {};   // truthyなら固定扱い(実物のポップアップは不要)
            _tmDetailPix = -1;
            handleTsujiMeshGoldHover({ lat: 35.502, lng: 138.802 });
            out.lockedPix = _tmDetailPix;
            _tmDetailLockPopup = null;
            return out;
        });
        check('B2 辻マーカーのホバーで詳細リストが画素1へ更新(ヘッダに緯度経度)', r.detailPix === 1 && !r.hidden && r.header.includes('35.502'), JSON.stringify({ pix: r.detailPix, h: r.header }));
        check('B2 ツールチップは辻マーカー(対象精度)', r.tip.includes('辻マーカー'), r.tip);
        check('B2 確定ポップアップ固定中はホバーで更新しない', r.lockedPix === -1, `pix=${r.lockedPix}`);
    }

    // B3: メッシュ画素リスト(一覧側)に検索中心列(視半径の右・23列・値はpoint/line)
    {
        const r = await p.evaluate(() => {
            renderTsujiMeshResults();
            const table = document.querySelector('#tsujimesh-content table');
            if (!table) return { ok: false };
            const ths = [...table.querySelectorAll('thead th')].map(th => th.textContent);
            const iCtr = ths.indexOf('検索中心'), iAngR = ths.indexOf('視半径');
            const tr = table.querySelector('tbody tr.td-data-row');
            return { ok: true, iCtr, iAngR, nTh: ths.length, cell: tr ? tr.children[iCtr].textContent : '' };
        });
        check('B3 画素リストのtheadで視半径の右が検索中心(23列)', r.ok && r.iCtr === r.iAngR + 1 && r.nTh === 23, JSON.stringify(r));
        check('B3 画素リストのセル値=point(検索時の選択値)', r.ok && r.cell === 'point', `cell=${r.cell}`);
    }

    check('B4 ページエラーなし', errs.length === 0, errs.slice(0, 3).join(' | '));

    await b.close();
    console.log(`\n結果: PASS=${PASS} FAIL=${FAIL}`);
    process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
