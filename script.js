/*
宙の辻 - Sora no Tsuji
Copyright (c) 2026- Sora no Tsuji Project

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

Version History:
Version 1.16.9 - 2026-02-28: fix: 気差係数チェックボックスでフォームの有効/無効切り替え機能追加
Version 1.16.8 - 2026-02-28: fix: 辻Dayボタンの削除
Version 1.16.7 - 2026-02-28: fix: OSMフォールバックの追加、地図タイルのURL修正
Version 1.16.6 - 2026-02-28: fix: 辻Day/辻検索結果を表ソート化、地名検索複数件化
Version 1.16.5 - 2026-02-28: fix: 観測点高度が目的点高度より高い場合の処理を追加
Version 1.16.4 - 2026-02-26: fix: Astronomy.Horizonの気差補正オプションを解除（"normal" → null）
Version 1.16.3 - 2026-02-25: fix: 辻検索の△判定の範囲修正（視半径×4に変更）、ヘルプトピックの修正
Version 1.16.2 - 2026-02-25: fix: 辻検索の許容範囲ラベル修正、オフセット（ズレ）機能の追加、日付に曜日表示追加
Version 1.16.1 - 2026-02-25: fix: 辻検索にオフセット（ズレ）機能追加、許容範囲ラベル修正
Version 1.16.0 - 2026-02-25: feat: 辻検索機能追加（方位角・視高度範囲指定による天体検索）
Version 1.15.0 - 2026-02-25: feat: 辻Dayに時刻・月齢アイコン追加
Version 1.14.2 - 2026-02-25: fix: 大気差補正Kの計算式修正、辻Dayの△判定の範囲拡大
Version 1.14.1 - 2026-02-19: fix: 辻Day検索の不具合修正
Version 1.14.0 - 2026-02-19: feat: 辻Day検索機能追加
Version 1.13.0 - 2026-02-19: feat: Movボタン4種、標高取得ロジック改善、視度半径ライン追加
Version 1.12.0 - 2026-02-12: feat: 気象パラメータ連動で大気差補正Kを計算・表示する機能追加
Version 1.11.7 - 2026-02-11: fix: 大気差補正計算の不具合修正
Version 1.11.6 - 2026-02-09: fix: 大気差補正計算の不具合修正
Version 1.11.5 - 2026-02-08: fix: 月齢検索の不具合修正
Version 1.11.4 - 2026-02-07: fix: 初期表示を現在日時に修正
Version 1.11.3 - 2026-02-07: fix: 計算不具合等修正
Version 1.11.2 - 2026-02-06: style: 大気差補正Kの文言・表示修正
Version 1.11.1 - 2026-02-05: fix: 設定セクションのUI修正
Version 1.11.0 - 2026-02-05: feat: REFRACTION_K設定機能追加; 各種UI改善
Version 1.10.0 - 2026-02-05: Great-circle route line appended on map; Calculation optimization
Version 1.9.0 - 2026-02-05: Minor feature and apparent altitude appended in popup
Version 1.0.0 - 2026-01-29: Initial release
*/

// ============================================================
// 1. 定数定義
// ============================================================

const STORAGE_KEY = 'soranotsuji_app'; // 唯一の保存キー
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzq94EkeZgbWlFb65cb1WQcRrRVi2Qpd_i60NvJWx6BB6Qxpb-30GD7TSzZptpRYxYL/exec"; 
const SYNODIC_MONTH = 29.53058886; // 朔望月 (日数)
const EARTH_RADIUS = 6378137;
const REFRACTION_K = 0.132; // 大気差補正定数: 0.132
// 標準大気モデルの定数
const STD_P = 1013.25;  // 標準気圧 (hPa)
const STD_T = 15.0;     // 標準気温 (°C)
const STD_L = 0.0065;   // 標準気温減率 Γ (K/m) 正値。0.0065が国際標準大気、0.0125が測量標準

const POLARIS_RA = 2.5303;
const POLARIS_DEC = 89.2641;
const SUBARU_RA = 3.79;
const SUBARU_DEC = 24.12;

// 天体の赤道半径 (km) - 視半径の計算用
const BODY_RADIUS_KM = {
    Sun: 695700, Moon: 1737.4,
    Mercury: 2439.7, Venus: 6051.8, Mars: 3396.2,
    Jupiter: 71492, Saturn: 60268, Uranus: 25559, Neptune: 24764
};
const KM_PER_AU = 149597870.7;
const MINTAKA_RA = 5.534;
const MINTAKA_DEC = -0.299;

const DEFAULT_START = { lat: 35.658582, lng: 139.745471, elev: 150.0 };
const DEFAULT_END = { lat: 35.360776, lng: 138.727299, elev: 3774.9 };

// 天体ごとの初期スタイル (リセット用)
const DEFAULT_BODIES = [
    { id: 'Sun',     color: '#FF0000', isDashed: false },
    { id: 'Moon',    color: '#FFFF00', isDashed: false },
    { id: 'Mercury', color: '#00BFFF', isDashed: false },
    { id: 'Venus',   color: '#FFC0CB', isDashed: false },
    { id: 'Mars',    color: '#FFA500', isDashed: false },
    { id: 'Jupiter', color: '#A52A2A', isDashed: false },
    { id: 'Saturn',  color: '#008000', isDashed: false },
    { id: 'Uranus',  color: '#ADFF2F', isDashed: false },
    { id: 'Neptune', color: '#4B0082', isDashed: false },
    { id: 'Pluto',   color: '#800080', isDashed: false },
    { id: 'Polaris', color: '#000000', isDashed: false },
    { id: 'Subaru',  color: '#0000FF', isDashed: false },
    { id: 'MyStar',  color: '#DDA0DD', isDashed: false }
];

const COLOR_MAP = [
    { name: '赤', code: '#FF0000' },
    { name: '桃', code: '#FFC0CB' },
    { name: '橙', code: '#FFA500' },
    { name: '黄', code: '#FFFF00' },
    { name: '黄緑', code: '#ADFF2F' },
    { name: '緑', code: '#008000' }, 
    { name: '水', code: '#00BFFF' },
    { name: '青', code: '#0000FF' },
    { name: '藍', code: '#4B0082' },
    { name: '紫', code: '#800080' },
    { name: '薄紫', code: '#DDA0DD' },
    { name: '茶', code: '#A52A2A' }, 
    { name: 'こげ茶', code: '#654321' },
    { name: '白', code: '#FFFFFF' },
    { name: '黒', code: '#000000' }
];

// ============================================================
// 2. グローバル変数 & アプリケーション状態 (appState)
// ============================================================

let map; 
let linesLayer;
let locationLayer;
let dpLayer;

// ★ 全てを管理する状態オブジェクト
let appState = {
    // 現在表示中の場所
    start: { ...DEFAULT_START },
    end:   { ...DEFAULT_END },
    
    // 登録された場所 (Homeボタンで呼び出す場所)
    homeStart: null,
    homeEnd:   null,

    // 日時
    currentDate: new Date(),
    
    // My天体
    myStar: { ra: MINTAKA_RA, dec: MINTAKA_DEC },

    // My観測点リスト
    myLocations: [{ label: '', latlng: '' }],

    // 大気差補正の有効/無効
    refractionEnabled: false,

    // 大気差補正係数 (meteoから計算)
    refractionK: calculateKFromMeteo(STD_P, STD_T, STD_L),

    //気象パラメータ (初期値は標準大気)
    meteo: { p: STD_P, t: STD_T, l: STD_L },

    // 訪問履歴
    lastVisitDate: null,

    // 天体設定
    bodies: [
        { id: 'Sun',     name: '太陽',   color: '#FF0000', isDashed: false, visible: true },
        { id: 'Moon',    name: '月',     color: '#FFFF00', isDashed: false, visible: true },
        { id: 'Mercury', name: '水星',   color: '#00BFFF', isDashed: false, visible: false },
        { id: 'Venus',   name: '金星',   color: '#FFC0CB', isDashed: false, visible: false },
        { id: 'Mars',    name: '火星',   color: '#FFA500', isDashed: false, visible: false },
        { id: 'Jupiter', name: '木星',   color: '#A52A2A', isDashed: false, visible: false },
        { id: 'Saturn',  name: '土星',   color: '#008000', isDashed: false, visible: false },
        { id: 'Uranus',  name: '天王星', color: '#ADFF2F', isDashed: false, visible: false },
        { id: 'Neptune', name: '海王星', color: '#4B0082', isDashed: false, visible: false },
        { id: 'Pluto',   name: '冥王星', color: '#800080', isDashed: false, visible: false },
        { id: 'Polaris', name: '北極星', color: '#000000', isDashed: false, visible: false },
        { id: 'Subaru',  name: 'すばる', color: '#0000FF', isDashed: false, visible: false },
        { id: 'MyStar',  name: 'My天体', color: '#DDA0DD', isDashed: false, visible: false, isCustom: true }
    ],

    // 機能フラグ
    isMoving: false,
    moveSpeed: null,  // 'month', 'day', 'hour', 'min'
    isDPActive: true,
    isElevationActive: false,
    isTsujiSearchActive: false,

    // 辻検索パラメータ (②③⑤⑥はlocalStorage保存)
    tsujiSearchOffsetAz: 0,
    tsujiSearchToleranceAz: 15,
    tsujiSearchOffsetAlt: 0,
    tsujiSearchToleranceAlt: 2.5,

    // 内部制御用 (保存不要)
    timers: { move: null, fetch: null },
    elevationData: { points: [], index: 0 },
    tsujiSearchGeneration: 0,
    riseSetCache: {}
};

let visitorData = null; 
let editingBodyId = null;
let currentRiseSetData = {}; 


// ============================================================
// 3. 初期化プロセス
// ============================================================

window.onload = function() {
    console.log("宙の辻: 起動 (V1.16.9)");
    
    // Astronomy Engineが読み込まれているかチェック
    if (typeof Astronomy === 'undefined') {
        console.error("Astronomy Engine is not loaded.");
        return;
    }

    // GeographicLibが読み込まれているかチェック
    if (typeof geodesic === 'undefined') {
        console.error("GeographicLib is not loaded.");
        return;
    }

    // 1. 古いデータを削除 (Clean up)
    cleanupOldStorage();

    // 2. 設定読み込み
    loadAppState();

    // 3. 地図初期化
    initMap();

    // 4. UI構築
    setupUI();

    // 5. 初期状態反映
    if (appState.isDPActive) {
        document.getElementById('btn-dp').classList.add('active');
    }
    
    // 登録ボタンの見た目 (登録データがあるかどうかで判定)
    if(appState.homeStart) {
        const btn = document.getElementById('btn-reg-start');
        btn.classList.add('active');
        btn.title = "登録済みの観測点を呼び出し";
    }
    if(appState.homeEnd) {
        const btn = document.getElementById('btn-reg-end');
        btn.classList.add('active');
        btn.title = "登録済みの目的点を呼び出し";
    }

    document.getElementById('input-mystar-radec').value = `${appState.myStar.ra},${appState.myStar.dec}`;
    reflectMyStarUI();

    // 辻検索: ②③⑤⑥のlocalStorage復元値をセット
    document.getElementById('input-tsuji-az-offset').value = appState.tsujiSearchOffsetAz;
    document.getElementById('input-tsuji-az-tolerance').value = appState.tsujiSearchToleranceAz;
    document.getElementById('input-tsuji-alt-offset').value = appState.tsujiSearchOffsetAlt;
    document.getElementById('input-tsuji-alt-tolerance').value = appState.tsujiSearchToleranceAlt;

    // リストを生成
    renderCelestialList();
    
    // ツールチップ設定
    setupTooltips();

    // 起動時は「現在日時」にセット
    setNow();

    // リサイズ対応
    window.addEventListener('resize', () => {
        if(appState.isElevationActive) {
            drawProfileGraph();
        }
    });

    setTimeout(initVisitorCounter, 1000);
};

// 古いキーの削除関数
function cleanupOldStorage() {
    const oldKeys = [
        'soranotsuji_start',
        'soranotsuji_end',
        'soranotsuji_mystar', 
        'soranotsuji_last_visit',
        'soranotsuji_reg_start',
        'soranotsuji_reg_end',
        'soranotsuji_state'
    ];
    oldKeys.forEach(key => {
        localStorage.removeItem(key);
    });
}

function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    const gsiStd = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        maxZoom: 18
    });
    const gsiPhoto = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg', {
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        maxZoom: 18
    });
    const gsiPale = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        maxZoom: 18
    });
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
    });

    map = L.map('map', {
        center: [appState.start.lat, appState.start.lng],
        zoom: 9, 
        layers: [gsiStd], 
        zoomControl: false
    });
    map.attributionControl.addAttribution('<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>,<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,<a href="https://open-meteo.com/" target="_blank">Open-Meteo</a>');

    L.control.layers({
        "標準(地理院)": gsiStd,
        "写真(地理院)": gsiPhoto,
        "淡色(地理院)": gsiPale,
        "OSM": osm
    }, null, { position: 'topleft' }).addTo(map);

    L.control.zoom({ position: 'topleft' }).addTo(map);
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);
    
    linesLayer = L.layerGroup().addTo(map);
    locationLayer = L.layerGroup().addTo(map);
    dpLayer = L.layerGroup().addTo(map);

    map.on('click', onMapClick);
}


// ============================================================
// 4. UIイベント設定
// ============================================================

function setupUI() {
    document.getElementById('btn-help').onclick = toggleHelp;

    // 日時変更
    document.getElementById('date-input').addEventListener('change', () => {
        uncheckTimeShortcuts();
        syncStateFromUI();
        updateAll();
    });

    const tInput = document.getElementById('time-input');
    const tSlider = document.getElementById('time-slider');

    tSlider.addEventListener('input', () => {
        uncheckTimeShortcuts();
        const val = parseInt(tSlider.value);
        const h = Math.floor(val / 60);
        const m = val % 60;
        tInput.value = `${('00' + h).slice(-2)}:${('00' + m).slice(-2)}`;
        syncStateFromUI();
        updateAll();
    });

    tInput.addEventListener('input', () => {
        uncheckTimeShortcuts();
        if (!tInput.value) return;
        const [h, m] = tInput.value.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
            tSlider.value = h * 60 + m;
            syncStateFromUI();
            updateAll();
        }
    });

    // 月齢入力
    document.getElementById('moon-age-input').addEventListener('change', (e) => {
        let targetAge = parseFloat(e.target.value);
        if (isNaN(targetAge)) return;
        
        searchMoonAge(targetAge);
    });

    // ボタン類
    document.getElementById('btn-now').onclick = setNow;
    document.getElementById('btn-speed-month').onclick = () => toggleSpeed('month');
    document.getElementById('btn-speed-day').onclick = () => toggleSpeed('day');
    document.getElementById('btn-speed-hour').onclick = () => toggleSpeed('hour');
    document.getElementById('btn-speed-min').onclick = () => toggleSpeed('min');
    document.getElementById('btn-date-prev').onclick = () => addDay(-1);
    document.getElementById('btn-date-next').onclick = () => addDay(1);
    document.getElementById('btn-month-prev').onclick = () => addMonth(-1);
    document.getElementById('btn-month-next').onclick = () => addMonth(1);
    document.getElementById('btn-time-prev').onclick = () => addMinute(-1);
    document.getElementById('btn-time-next').onclick = () => addMinute(1);
    document.getElementById('btn-hour-prev').onclick = () => addMinute(-60);
    document.getElementById('btn-hour-next').onclick = () => addMinute(60);
    document.getElementById('btn-moon-prev').onclick = () => addMoonMonth(-1);
    document.getElementById('btn-moon-next').onclick = () => addMoonMonth(1);

    document.querySelectorAll('input[name="time-jump"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if(e.target.checked) jumpToEvent(e.target.value);
        });
    });

    document.getElementById('btn-gps').onclick = useGPS;
    document.getElementById('btn-elevation').onclick = toggleElevation;
    document.getElementById('btn-dp').onclick = toggleDP;
    document.getElementById('btn-tsuji-search').onclick = toggleTsujiSearch;

    // 辻検索: ②③⑤⑥の変更をlocalStorage保存
    document.getElementById('input-tsuji-az-offset').addEventListener('change', (e) => {
        appState.tsujiSearchOffsetAz = parseFloat(e.target.value) || 0;
        saveAppState();
    });
    document.getElementById('input-tsuji-az-tolerance').addEventListener('change', (e) => {
        appState.tsujiSearchToleranceAz = parseFloat(e.target.value) || 15;
        saveAppState();
    });
    document.getElementById('input-tsuji-alt-offset').addEventListener('change', (e) => {
        appState.tsujiSearchOffsetAlt = parseFloat(e.target.value) || 0;
        saveAppState();
    });
    document.getElementById('input-tsuji-alt-tolerance').addEventListener('change', (e) => {
        appState.tsujiSearchToleranceAlt = parseFloat(e.target.value) || 2.5;
        saveAppState();
    });

    // 登録ボタン
    document.getElementById('btn-reg-start').onclick = () => registerLocation('start');
    document.getElementById('btn-reg-end').onclick = () => registerLocation('end');

    // 座標入力 (changeイベント)
    const iStart = document.getElementById('input-start-latlng');
    const iEnd = document.getElementById('input-end-latlng');
    iStart.addEventListener('change', () => handleLocationInput(iStart.value, true));
    iEnd.addEventListener('change', () => handleLocationInput(iEnd.value, false));

    // 標高入力
    document.getElementById('input-start-elev').addEventListener('change', (e) => {
        appState.start.elev = parseFloat(e.target.value) || 0;
        saveAppState();
        updateAll(); 
    });
    document.getElementById('input-end-elev').addEventListener('change', (e) => {
        appState.end.elev = parseFloat(e.target.value) || 0;
        saveAppState();
        updateAll();
    });

    // My天体登録
    document.getElementById('btn-mystar-reg').onclick = registerMyStar;
    document.getElementById('chk-mystar').addEventListener('change', (e) => toggleVisibility('MyStar', e.target.checked));
    
    // --- ★追加: 気象パラメータ連動 ---
    const iK = document.getElementById('input-refraction-k');
    const iP = document.getElementById('input-meteo-p');
    const iT = document.getElementById('input-meteo-t');
    const iL = document.getElementById('input-meteo-l');
    const chkRefraction = document.getElementById('chk-refraction');
    const btnResetMeteo = document.getElementById('btn-reset-meteo');
    const btnRegSettings = document.getElementById('btn-reg-settings');

    // 気差フォームの有効/無効を切り替える関数
    const setRefractionFormEnabled = (enabled) => {
        iK.readOnly = !enabled;
        iK.disabled = !enabled;
        iP.readOnly = !enabled;
        iP.disabled = !enabled;
        iT.readOnly = !enabled;
        iT.disabled = !enabled;
        iL.readOnly = !enabled;
        iL.disabled = !enabled;
        btnResetMeteo.disabled = !enabled;
        btnRegSettings.disabled = !enabled;
    };

    // チェックボックスの変更イベント
    chkRefraction.addEventListener('change', (e) => {
        appState.refractionEnabled = e.target.checked;
        setRefractionFormEnabled(e.target.checked);
        saveAppState();
        updateAll();
    });

    // 気象条件が変わったら K を再計算して表示する関数
    const updateK = () => {
        const p = parseFloat(iP.value);
        const t = parseFloat(iT.value);
        const l = parseFloat(iL.value);
        if(!isNaN(p) && !isNaN(t) && !isNaN(l)) {
            const newK = calculateKFromMeteo(p, t, l);
            // 小数点4桁で表示 (値はまだ保存しない)
            iK.value = newK.toFixed(4);
        }
    };

    iP.addEventListener('input', updateK);
    iT.addEventListener('input', updateK);
    iL.addEventListener('input', updateK);

    // リセットボタン
    btnResetMeteo.onclick = () => {
        iP.value = STD_P;
        iT.value = STD_T;
        iL.value = STD_L;
        updateK(); // 計算してKも更新
    };

    // 設定登録ボタン
    btnRegSettings.onclick = registerSettings;

    // 起動時の初期値を入力欄にセット
    if(appState.meteo) {
        iP.value = appState.meteo.p;
        iT.value = appState.meteo.t;
        iL.value = appState.meteo.l;
        iK.value = appState.refractionK.toFixed(4);
    }
    // 起動時のチェックボックス状態を反映
    chkRefraction.checked = appState.refractionEnabled;
    setRefractionFormEnabled(appState.refractionEnabled);

    // My観測点ボタン
    document.getElementById('btn-myloc-load').onclick = loadMyLocation;
    document.getElementById('btn-myloc-saveall').onclick = saveAllMyLocations;
    document.getElementById('btn-myloc-add').onclick = addMyLocationRow;
    document.getElementById('btn-myloc-del').onclick = deleteMyLocationRow;
    renderMyLocations();
}


// ============================================================
// 5. 設定の保存・読み込み (Single Storage Key)
// ============================================================

/** 全状態を保存 */
function saveAppState() {
    // 保存したいデータだけを抽出
    const stateToSave = {
        start: appState.start,
        end: appState.end,
        homeStart: appState.homeStart, // 登録場所
        homeEnd: appState.homeEnd,     // 登録場所
        bodies: appState.bodies,
        myStar: appState.myStar,
        meteo: appState.meteo, //気象パラメータのみ保存(Kはmeteoから再計算)
        refractionEnabled: appState.refractionEnabled,
        isDPActive: appState.isDPActive,
        lastVisitDate: appState.lastVisitDate,
        // 辻検索パラメータ (②③⑤⑥)
        tsujiSearchOffsetAz: appState.tsujiSearchOffsetAz,
        tsujiSearchToleranceAz: appState.tsujiSearchToleranceAz,
        tsujiSearchOffsetAlt: appState.tsujiSearchOffsetAlt,
        tsujiSearchToleranceAlt: appState.tsujiSearchToleranceAlt,
        myLocations: appState.myLocations
        // currentDateは保存せず、毎回起動時にリセット(日の出等)する方針
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
}

/** 全状態を復元 */
function loadAppState() {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) {
        try {
            const saved = JSON.parse(json);
            // 個別マージ
            if(saved.start) appState.start = saved.start;
            if(saved.end) appState.end = saved.end;
            if(saved.homeStart) appState.homeStart = saved.homeStart;
            if(saved.homeEnd) appState.homeEnd = saved.homeEnd;
            if(saved.myStar) appState.myStar = saved.myStar;
            if(saved.meteo) appState.meteo = saved.meteo;
            // meteoからKを再計算 (refractionKは保存しない)
            appState.refractionK = calculateKFromMeteo(appState.meteo.p, appState.meteo.t, appState.meteo.l);
            if(saved.refractionEnabled !== undefined) appState.refractionEnabled = saved.refractionEnabled;
            if(saved.isDPActive !== undefined) appState.isDPActive = saved.isDPActive;
            if(saved.lastVisitDate) appState.lastVisitDate = saved.lastVisitDate;
            // 辻検索パラメータ復元
            if(saved.tsujiSearchOffsetAz !== undefined) appState.tsujiSearchOffsetAz = saved.tsujiSearchOffsetAz;
            if(saved.tsujiSearchToleranceAz !== undefined) appState.tsujiSearchToleranceAz = saved.tsujiSearchToleranceAz;
            if(saved.tsujiSearchOffsetAlt !== undefined) appState.tsujiSearchOffsetAlt = saved.tsujiSearchOffsetAlt;
            if(saved.tsujiSearchToleranceAlt !== undefined) appState.tsujiSearchToleranceAlt = saved.tsujiSearchToleranceAlt;
            if(saved.myLocations && Array.isArray(saved.myLocations) && saved.myLocations.length > 0) appState.myLocations = saved.myLocations;

            if(saved.bodies) {
                saved.bodies.forEach(sb => {
                    const b = appState.bodies.find(x => x.id === sb.id);
                    if(b) {
                        b.color = sb.color;
                        b.isDashed = sb.isDashed;
                        b.visible = sb.visible;
                    }
                });
            }
        } catch(e) { console.error("Load Error:", e); }
    }
}

/** 登録ボタンロジック (登録 / 呼び出し) */
function registerLocation(type) {
    const input = document.getElementById(`input-${type}-latlng`);
    const btn = document.getElementById(`btn-reg-${type}`);
    
    // キー名のマッピング (homeStart / homeEnd)
    const homeKey = (type === 'start') ? 'homeStart' : 'homeEnd';
    const hasRegistered = (appState[homeKey] !== null);

    // 1. リセット (空で押下)
    if (!input.value) {
        appState[homeKey] = null; // 登録削除

        // ★追加: 現在の場所をシステム初期値に戻す
        if (type === 'start') {
            appState.start = { ...DEFAULT_START };
        } else {
            appState.end = { ...DEFAULT_END };
        }
        
        saveAppState(); // 変更を保存
        updateAll();    // ★画面(入力欄・マーカー)を更新
        
        // ★親切機能: 地図もその場所へ移動させる
        const target = (type === 'start') ? appState.start : appState.end;
        map.setView([target.lat, target.lng], 10);

        btn.classList.remove('active');
        btn.title = `現在の${type==='start'?'観測点':'目的点'}を初期値として登録`;
        
        alert('初期値をリセットし、デフォルトに戻しました');
        return;
    }

    // 2. 呼び出し (登録データがある場合)
    if (hasRegistered) {
        // 登録データを現在地に適用
        if(type === 'start') {
            appState.start = { ...appState.homeStart };
            document.getElementById('radio-start').checked = true;
        } else {
            appState.end = { ...appState.homeEnd };
            document.getElementById('radio-end').checked = true;
        }
        
        saveAppState(); // 移動した状態を保存
        updateAll();
        
        // ★修正: fitBounds(全体表示) ではなく setView(その場所に移動)
        // これにより、観測点を呼び出したときに目的点まで引いてしまうのを防ぐ
        const target = (type === 'start') ? appState.start : appState.end;
        map.setView([target.lat, target.lng], 10);
        
        alert('登録済みの場所を呼び出しました');
    }

    // 3. 登録 (登録データがない場合)
    else {
        // 現在地を登録データとして保存
        if(type === 'start') {
            appState.homeStart = { ...appState.start };
        } else {
            appState.homeEnd = { ...appState.end };
        }
        
        saveAppState();
        
        btn.classList.add('active');
        btn.title = `登録済みの${type==='start'?'観測点':'目的点'}を呼び出し`;
        alert('現在の場所を初期値として登録しました');
    }
}


// ============================================================
// 6. メイン更新ロジック
// ============================================================

function syncStateFromUI() {
    const dStr = document.getElementById('date-input').value;
    const tStr = document.getElementById('time-input').value;
    if(dStr && tStr) {
        appState.currentDate = new Date(`${dStr}T${tStr}:00`);
    }
}

function syncUIFromState() {
    const d = appState.currentDate;
    const yyyy = d.getFullYear();
    const mm = ('00'+(d.getMonth()+1)).slice(-2);
    const dd = ('00'+d.getDate()).slice(-2);
    const h = ('00'+d.getHours()).slice(-2);
    const m = ('00'+d.getMinutes()).slice(-2);
    
    document.getElementById('date-input').value = `${yyyy}-${mm}-${dd}`;
    document.getElementById('time-input').value = `${h}:${m}`;
    document.getElementById('time-slider').value = d.getHours() * 60 + d.getMinutes();
}

function updateAll() {
    if (!map) return;

    if (appState.isMoving) {
        syncUIFromState();
    } else {
        syncStateFromUI();
    }

    updateLocationDisplay();
    updateCalculation();
    
    if (appState.isDPActive) {
        updateDPLines();
    } else {
        dpLayer.clearLayers();
    }

    updateTsujiSearchInputs();
}

function updateLocationDisplay() {
    locationLayer.clearLayers();

    const fmt = (pos) => `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
    
    if(document.activeElement.id !== 'input-start-latlng') {
        document.getElementById('input-start-latlng').value = fmt(appState.start);
    }
    if(document.activeElement.id !== 'input-end-latlng') {
        document.getElementById('input-end-latlng').value = fmt(appState.end);
    }
    
    document.getElementById('input-start-elev').value = appState.start.elev;
    document.getElementById('input-end-elev').value = appState.end.elev;

    const sPt = L.latLng(appState.start.lat, appState.start.lng);
    const ePt = L.latLng(appState.end.lat, appState.end.lng);
    
    // マーカーの設置
    L.marker(sPt).addTo(locationLayer).bindPopup(createLocationPopup("観測点", appState.start, appState.end));
    L.marker(ePt).addTo(locationLayer).bindPopup(createLocationPopup("目的点", appState.end, appState.start));
    
    // 1. メルカトル図法の直線 (地図上の見かけの線) -> 黒い破線
    L.polyline([sPt, ePt], {
        color: 'black',
        weight: 2,          // 少し細めにして
        opacity: 0.5,       // 薄くする（補助線的な意味合い）
        dashArray: '10, 10' // 破線で描画
    }).addTo(locationLayer);

    // 2. 大圏航路 (地球上の実際の最短ルート) -> 黒い実線
    const pathPoints = calculateGreatCirclePoints(appState.start, appState.end);
    
    L.polyline(pathPoints, {
        color: 'black',
        weight: 4,    // 太く強調
        opacity: 0.8
        // dashArrayを指定しない＝実線
    }).addTo(locationLayer);
}

function updateCalculation() {
    linesLayer.clearLayers();
    const obsDate = appState.currentDate;
    const startOfDay = new Date(obsDate);
    startOfDay.setHours(0, 0, 0, 0);

    let observer;
    try {
        observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev);
    } catch(e) { return; }

    appState.bodies.forEach(body => {
        let ra;
        let dec;
        
        if (body.id === 'Polaris') {
            ra = POLARIS_RA;
            dec = POLARIS_DEC;
        } else if (body.id === 'Subaru') {
            ra = SUBARU_RA;
            dec = SUBARU_DEC;
        } else if (body.id === 'MyStar') {
            ra = appState.myStar.ra;
            dec = appState.myStar.dec;
        } else {
            const eq = Astronomy.Equator(body.id, obsDate, observer, true, true);
            ra = eq.ra;
            dec = eq.dec;
        }

        const hor = Astronomy.Horizon(obsDate, observer, ra, dec, appState.refractionEnabled ? "normal" : null);

        let riseStr = "--:--";
        let setStr = "--:--";
        
        if (['Polaris', 'Subaru', 'MyStar'].includes(body.id)) {
            const times = searchStarRiseSet(ra, dec, observer, startOfDay);
            riseStr = times.rise;
            setStr = times.set;
        } else {
            try {
                const rise = Astronomy.SearchRiseSet(body.id, observer, +1, startOfDay, 2);
                const set  = Astronomy.SearchRiseSet(body.id, observer, -1, startOfDay, 2);
                riseStr = rise ? formatTime(rise.date, startOfDay) : "--:--";
                setStr = set ? formatTime(set.date, startOfDay) : "--:--";
            } catch(e){}
        }
        
        if (riseStr === "--:--" && setStr === "--:--" && hor.altitude > 0) {
            riseStr = "00:00";
            setStr = "00:00"; 
        }

        const dataEl = document.getElementById(`data-${body.id}`);
        if (dataEl) {
            dataEl.innerText = `出 ${riseStr} / 入 ${setStr} / 方位 ${hor.azimuth.toFixed(0)}° / 高度 ${hor.altitude.toFixed(0)}°`;
        }

        if (body.visible) {
            drawDirectionLine(appState.start.lat, appState.start.lng, hor.azimuth, hor.altitude, body);
        }
    });

    updateShortcutsData(startOfDay, observer);
    updateMoonInfo(obsDate);
}

function updateDPLines() {
    dpLayer.clearLayers();
    const baseDate = new Date(appState.currentDate);
    baseDate.setHours(0, 0, 0, 0);
    
    const datePrev = new Date(baseDate.getTime() - 86400000);
    const dateNext = new Date(baseDate.getTime() + 86400000);
    const observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev);

    appState.bodies.forEach(body => {
        if (!body.visible) return;
        const pPrev = calculateDPPathPoints(datePrev, body, observer);
        const pNext = calculateDPPathPoints(dateNext, body, observer);
        const pCurr = calculateDPPathPoints(baseDate, body, observer);
        
        drawDPPath(pPrev, body.color, '1, 13', false);
        drawDPPath(pNext, body.color, '1, 13', false);
        drawDPPath(pCurr, body.color, '13, 13', true);

        // 視半径エッジライン (一点鎖線)
        const angR = getBodyAngularRadius(body.id, appState.currentDate, observer);
        if (angR >= 0.01) {
            const dashDot = '1, 13, 13, 13'; // 点-スペース-線-スペースのパターン
            drawDPPath(pCurr, body.color, dashDot, false, +angR);
            drawDPPath(pCurr, body.color, dashDot, false, -angR);
        }
    });
}


// ============================================================
// 7. ロジック・ヘルパー
// ============================================================

async function handleLocationInput(val, isStart) {
    if(!val) return;

    let coords = parseInput(val);
    if (coords) {
        await applyLocationCoords(coords, isStart);
        return;
    }

    // 半角→全角変換
    const fullVal = toFullWidth(val.trim());
    const inputId = isStart ? 'input-start-latlng' : 'input-end-latlng';
    document.getElementById(inputId).value = fullVal;

    const results = await searchLocation(fullVal);
    if (!results || results.length === 0) {
        alert('該当する地名が見つかりませんでした');
        return;
    }

    showLocationPicker(results, isStart);
}

async function applyLocationCoords(coords, isStart) {
    const elev = await getElevation(coords.lat, coords.lng);
    const validElev = (elev !== null) ? elev : 0;

    if(isStart) {
        appState.start = { ...coords, elev: validElev };
        document.getElementById('radio-start').checked = true;
    } else {
        appState.end = { ...coords, elev: validElev };
        document.getElementById('radio-end').checked = true;
    }

    const inputId = isStart ? 'input-start-latlng' : 'input-end-latlng';
    document.getElementById(inputId).blur();

    map.setView(coords, 10);
    saveAppState();
    updateAll();
}

function showLocationPicker(results, isStart) {
    const picker = document.getElementById('location-picker');
    const list = document.getElementById('picker-list');
    const title = document.getElementById('picker-title');
    title.textContent = `地名検索結果（${results.length}件）`;
    list.innerHTML = '';

    results.forEach(r => {
        const item = document.createElement('div');
        item.className = 'picker-item';
        item.innerHTML = `<div class="picker-name">${r.title}</div><div class="picker-address">${r.address}</div>`;
        item.addEventListener('click', async () => {
            closeLocationPicker();
            const coords = { lat: r.lat, lng: r.lon };
            await applyLocationCoords(coords, isStart);
        });
        list.appendChild(item);
    });

    picker.classList.remove('hidden');
}

function closeLocationPicker() {
    document.getElementById('location-picker').classList.add('hidden');
}


// ============================================================
// 8. ツールチップ設定
// ============================================================

/**
 * すべての入力欄に対し、マウスオーバー時に入力内容をツールチップで表示する設定を行う
 */
function setupTooltips() {
    // 対象とする入力タイプ
    const selector = 'input[type="text"], input[type="number"], input[type="date"], input[type="time"]';
    const inputs = document.querySelectorAll(selector);

    inputs.forEach(input => {
        input.addEventListener('mouseover', function() {
            // 値が入っている場合のみ title属性に値をセットする
            if (this.value) {
                this.title = this.value;
            } else {
                // 値が空の場合は title属性を削除 (不要な空吹き出しを防ぐ)
                this.removeAttribute('title');
            }
        });
    });
}


// ============================================================
// 9. My観測点 (My Observation Points)
// ============================================================

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function renderMyLocations() {
    const list = document.getElementById('myloc-list');
    list.innerHTML = '';
    appState.myLocations.forEach((loc, i) => {
        const idx = String(i + 1).padStart(2, '0');
        const row = document.createElement('div');
        row.className = 'myloc-row';
        row.innerHTML =
            `<input type="radio" name="myloc-radio" id="myloc-r${i}" value="${i}" ${i === 0 ? 'checked' : ''}>` +
            `<label for="myloc-r${i}">${idx}:</label>` +
            `<input type="text" class="myloc-label" data-idx="${i}" value="${escapeHtml(loc.label)}" placeholder="ラベル名">` +
            `<input type="text" class="myloc-latlng" data-idx="${i}" value="${escapeHtml(loc.latlng)}" placeholder="緯度,経度">`;
        list.appendChild(row);
    });
    updateMyLocButtons();
}

function updateMyLocButtons() {
    document.getElementById('btn-myloc-add').disabled = appState.myLocations.length >= 99;
    document.getElementById('btn-myloc-del').disabled = appState.myLocations.length <= 1;
}

function getSelectedMyLocIndex() {
    const checked = document.querySelector('input[name="myloc-radio"]:checked');
    return checked ? parseInt(checked.value, 10) : 0;
}

function syncMyLocRowsToState() {
    const labels = document.querySelectorAll('.myloc-label');
    const latlngs = document.querySelectorAll('.myloc-latlng');
    appState.myLocations = [];
    labels.forEach((el, i) => {
        appState.myLocations.push({ label: el.value, latlng: latlngs[i].value });
    });
}

async function loadMyLocation() {
    syncMyLocRowsToState();
    const idx = getSelectedMyLocIndex();
    const latlng = appState.myLocations[idx]?.latlng;
    if (!latlng) { alert('緯度経度が入力されていません'); return; }
    document.getElementById('input-start-latlng').value = latlng;
    await handleLocationInput(latlng, true);
}

function saveAllMyLocations() {
    syncMyLocRowsToState();
    saveAppState();
    alert('My観測点を登録しました');
}

function showConfirmDialog(onYes) {
    const dialog = document.getElementById('confirm-dialog');
    dialog.classList.remove('hidden');
    document.getElementById('btn-confirm-yes').onclick = () => {
        closeConfirmDialog();
        onYes();
    };
}

function closeConfirmDialog() {
    document.getElementById('confirm-dialog').classList.add('hidden');
}

function addMyLocationRow() {
    if (appState.myLocations.length >= 99) return;
    showConfirmDialog(() => {
        syncMyLocRowsToState();
        const idx = getSelectedMyLocIndex();
        appState.myLocations.splice(idx + 1, 0, { label: '', latlng: '' });
        saveAppState();
        renderMyLocations();
        const radio = document.getElementById(`myloc-r${idx + 1}`);
        if (radio) radio.checked = true;
    });
}

function deleteMyLocationRow() {
    if (appState.myLocations.length <= 1) return;
    showConfirmDialog(() => {
        syncMyLocRowsToState();
        const idx = getSelectedMyLocIndex();
        appState.myLocations.splice(idx, 1);
        saveAppState();
        renderMyLocations();
        const newIdx = Math.min(idx, appState.myLocations.length - 1);
        const radio = document.getElementById(`myloc-r${newIdx}`);
        if (radio) radio.checked = true;
    });
}


// ------------------------------------------------------
// 操作系ハンドラ
// ------------------------------------------------------

function setNow() { 
    uncheckTimeShortcuts(); 
    appState.currentDate = new Date(); 
    syncUIFromState(); 
    updateAll(); 
}

function jumpToEvent(type) { 
    if (!currentRiseSetData[type]) return; 
    appState.currentDate = currentRiseSetData[type]; 
    syncUIFromState(); 
    updateAll(); 
}

function addDay(d) { 
    uncheckTimeShortcuts(); 
    appState.currentDate.setDate(appState.currentDate.getDate() + d); 
    syncUIFromState(); 
    updateAll(); 
}

function addMonth(m) { 
    uncheckTimeShortcuts(); 
    appState.currentDate.setMonth(appState.currentDate.getMonth() + m); 
    syncUIFromState(); 
    updateAll(); 
}

function addMinute(m) {
    uncheckTimeShortcuts();
    appState.currentDate.setMinutes(appState.currentDate.getMinutes() + m);
    syncUIFromState();
    updateAll();
}

function addHour(h) {
    uncheckTimeShortcuts();
    appState.currentDate.setHours(appState.currentDate.getHours() + h);
    syncUIFromState();
    updateAll();
}

function addMoonMonth(dir) {
    uncheckTimeShortcuts(); // 1. ショートカットの選択解除

    // 2. 「今の瞬間の月」がどんな状態か（位相）を調べる
    const currentPhase = Astronomy.MoonPhase(appState.currentDate);

    // 3. 「だいたい1ヶ月後（または前）」の日付を計算する (推測)
    const roughTarget = new Date(appState.currentDate.getTime() + dir * SYNODIC_MONTH * 86400000);

    // 4. 検索の開始地点を「だいたいの日」の5日前にセットする
    const searchStart = new Date(roughTarget.getTime() - 5 * 86400000);

    // 5. 正確な日時を検索する (ここが心臓部！)
    const res = Astronomy.SearchMoonPhase(currentPhase, searchStart, 10);
    
    // 6. 結果の適用
    if(res && res.date) {
        appState.currentDate = res.date; // 正確な日時が見つかればそれをセット
    } else {
        appState.currentDate = roughTarget; // 見つからなければ概算値を使う(保険)
    }
    syncUIFromState(); 
    updateAll();
}

// 月齢検索ロジック
function searchMoonAge(targetAge) {
    uncheckTimeShortcuts();

    // 1. 現在の月齢を計算
    const currentPhaseAngle = Astronomy.MoonPhase(appState.currentDate);
    const currentAge = (currentPhaseAngle / 360) * SYNODIC_MONTH;

    // 2. 検索方向の判定 (過去に戻るべきか？)
    // 基本は「現在日時」から未来検索
    let searchStartDate = appState.currentDate;
    
    const diff = targetAge - currentAge;

    // 数値が減った場合 (例: 15->14) は過去を探す。
    if (diff < 0) {
        // 例: 10 -> -5 (差は -15) : 過去に戻る
        // 検索開始位置を「diff+半月前」にずらすことで、直近の過去を見つける
        searchStartDate = new Date(appState.currentDate.getTime() - (Math.floor(Math.abs(diff)) + 15) * 24 * 60 * 60 * 1000);
    }

    // 3. 検索実行
    // 例: 31を入力 -> 31 % 29.53 = 1.47 -> 月齢1.47の位相を検索
    const normalizedAge = targetAge % SYNODIC_MONTH;
    const targetPhase = (normalizedAge / SYNODIC_MONTH) * 360;
    
    // 検索期間を少し広めに(45日)とって、確実にヒットさせる
    const res = Astronomy.SearchMoonPhase(targetPhase, searchStartDate, 45);
    
    if(res && res.date) {
        document.getElementById('moon-age-input').blur(); 
        appState.currentDate = res.date; 
        syncUIFromState(); 
        updateAll(); 
    } else { 
        alert("見つかりませんでした"); 
    }
}

function uncheckTimeShortcuts() { 
    document.querySelectorAll('input[name="time-jump"]').forEach(r => r.checked = false); 
}

function stopMove() {
    appState.isMoving = false;
    appState.moveSpeed = null;
    clearInterval(appState.timers.move);
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
}

function toggleSpeed(speed) {
    if (appState.isMoving && appState.moveSpeed === speed) {
        stopMove();
        return;
    }

    stopMove();
    appState.isMoving = true;
    appState.moveSpeed = speed;

    const btnId = { month: 'btn-speed-month', day: 'btn-speed-day', hour: 'btn-speed-hour', min: 'btn-speed-min' };
    document.getElementById(btnId[speed]).classList.add('active');

    const actions = {
        month: () => addMonth(1),
        day:   () => addDay(1),
        hour:  () => addHour(1),
        min:   () => addMinute(1)
    };
    appState.timers.move = setInterval(actions[speed], 1000);
}

function toggleDP() {
    appState.isDPActive = !appState.isDPActive;
    const btn = document.getElementById('btn-dp');
    
    if(appState.isDPActive) {
        btn.classList.add('active'); 
    } else {
        btn.classList.remove('active');
    }
    saveAppState();
    updateAll();
}

function useGPS() {
    if (!navigator.geolocation) return alert('GPS非対応です');
    navigator.geolocation.getCurrentPosition(pos => {
        appState.start.lat = pos.coords.latitude; 
        appState.start.lng = pos.coords.longitude;
        map.setView([appState.start.lat, appState.start.lng], 10);
        getElevation(appState.start.lat, appState.start.lng).then(elev => {
            if(elev !== null) appState.start.elev = elev;
            saveAppState(); 
            updateAll();
        });
    }, () => alert('位置情報を取得できませんでした'));
}


// ------------------------------------------------------
// 計算・描画ヘルパー (汎用)
// ------------------------------------------------------

function drawDirectionLine(lat, lng, azimuth, altitude, body) {
    // ★修正: Vincenty(大圏) ではなく Rhumb(等角) を使う
    // これにより、地図上で「指定した方位」に向かって真っ直ぐ線が引かれます
    const endPos = getDestinationRhumb(lat, lng, azimuth, 3000000); // 3000km

    const opacity = altitude < 0 ? 0.3 : 1.0; 
    const dashArray = body.isDashed ? '10, 10' : null;
    
    L.polyline([[lat, lng], [endPos.lat, endPos.lng]], {
        color: body.color,
        weight: 6,
        opacity: opacity,
        dashArray: dashArray
    }).addTo(linesLayer);
}

function calculateDPPathPoints(targetDate, body, observer) {
    const path = [];
    const startOfDay = new Date(targetDate.getTime());
    startOfDay.setHours(0, 0, 0, 0);
    const valElev = appState.start.elev;
    const dip = getHorizonDip(valElev); // 地平線の低下量 (度)
    const limit = -(dip + (16 / 60 + 1.18 / 3600) * 2 + 0.1); // 地平線の低下分 + 太陽の視直径 + 0.1度のマージン

    for (let m = 0; m < 1440; m += 1) { // 1分毎
        const time = new Date(startOfDay.getTime() + m * 60000);
        let r;
        let d;
        
        if (['Polaris', 'Subaru', 'MyStar'].includes(body.id)) {
            if(body.id === 'Polaris') {
                r = POLARIS_RA;
                d = POLARIS_DEC;
            } else if(body.id === 'Subaru') {
                r = SUBARU_RA;
                d = SUBARU_DEC;
            } else {
                r = appState.myStar.ra;
                d = appState.myStar.dec;
            }
        } else {
            const eq = Astronomy.Equator(body.id, time, observer, true, true);
            r = eq.ra;
            d = eq.dec;
        }
        
        const hor = Astronomy.Horizon(time, observer, r, d, appState.refractionEnabled ? "normal" : null);
        if (hor.altitude > limit) {
            const dist = calculateDistanceForAltitudes(hor.altitude, valElev, appState.end.elev);
            if (dist > 0 && dist < 500000) { // 500km以内のみ
                path.push({ dist: dist, az: hor.azimuth, time: time });
            }
        }
    }
    return path;
}

function drawDPPath(points, color, dashArray, withMarkers, azOffset) {
    if (points.length === 0) return;
    const targetPt = appState.end;
    let segments = [];
    let currentSegment = [];
    const offset = azOffset || 0;

    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const obsAz = (p.az + offset + 540) % 360; // +180 して逆方位 + offset
        const dest = getDestinationGeodesic(targetPt.lat, targetPt.lng, obsAz, p.dist);
        const pt = [dest.lat, dest.lng];
        
        if (currentSegment.length > 0) {
            const prev = points[i-1];
            if (Math.abs(p.az - prev.az) > 5) {
                segments.push(currentSegment);
                currentSegment = [];
            }
        }
        currentSegment.push(pt);
        
        if (withMarkers && p.time.getMinutes() % 5 === 0) {
            L.circleMarker(pt, {
                radius: 4,
                color: color,
                fillColor: color,
                fillOpacity: 1.0,
                weight: 1
            }).addTo(dpLayer);
            
            const timeStr = formatTime(p.time);
            L.marker(pt, {
                icon: L.divIcon({
                    className: 'dp-label-icon',
                    html: `<div style="font-size:14px;font-weight:bold;color:${color};text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;white-space:nowrap;">${timeStr}</div>`,
                    iconSize: [null, null],
                    iconAnchor: [-10, 7]
                })
            }).addTo(dpLayer);
        }
    }
    
    if (currentSegment.length > 0) segments.push(currentSegment);
    
    segments.forEach(seg => {
        L.polyline(seg, {
            color: color,
            weight: 5,
            opacity: 0.8,
            dashArray: dashArray
        }).addTo(dpLayer);
    });
}

// ------------------------------------------------------
// 計算ヘルパー (天体の視半径)
// ------------------------------------------------------
function getBodyAngularRadius(bodyId, date, observer) {
    const radiusKm = BODY_RADIUS_KM[bodyId];
    if (!radiusKm) return 0;
    const eq = Astronomy.Equator(bodyId, date, observer, true, true);
    const distKm = eq.dist * KM_PER_AU;
    return Math.atan(radiusKm / distKm) * 180 / Math.PI;
}

// ------------------------------------------------------
// 計算ヘルパー (高度角→距離変換)
// ------------------------------------------------------
/**
 * 2つの高度(観測者・ターゲット)を地球を球体として、
 * 指定された見かけの高度角(altObs)で見える「地上の水平距離」を逆算する
 * * 原理: 地球中心(C)-観測者(O)-ターゲット(T) の3点で三角形を作る
 * 1. 既知の辺: r1(地球+観測者), r2(地球+ターゲット)
 * 2. 既知の角: 観測点での見かけの高度角(altObs)
 * 3. 正弦定理 (r1 / sin(PI/2 - altTarget) = r2 / sin(PI/2 + altObs) を使って、
 * 目的点の高度角(altTarget)を導き出す
 * 4. 三角形の内角の和(180°)から、地球中心角(c)を決定する: (PI/2 + altObs) + (PI/2 - altTarget) + c = PI → c = altTarget - altObs
 * 5. 円弧の長さの定義より、地上の距離Lは、L = R * c
 * @param {number} altObs 観測点での見かけの高度角 (度)
 * @param {number} hObs 観測者の標高 (m)
 * @param {number} hTarget ターゲットの標高 (m)
 */
function calculateDistanceForAltitudes(altObs, hObs, hTarget) {
    // 地球半径 (定数より取得)
    const R = EARTH_RADIUS;
    
    // 気差係数kを気象パラメータから都度計算 (気差OFF時は0)
    const k = appState.refractionEnabled ? calculateKFromMeteo(appState.meteo.p, appState.meteo.t, appState.meteo.l) : 0;
    const Reff = R / (1 - k);

    const r1 = R + hObs;    // 観測者
    const r2 = R + hTarget; // ターゲット

    const altObsRad = altObs * Math.PI / 180;

    let sinVal = 0;
    let altTargetRad = 0;
    let c = 0;

    if (hObs <= hTarget) {
        sinVal = r1/r2 * Math.sin(Math.PI/2 + altObsRad);
        if (sinVal > 1) sinVal = 1; // 安全策: asinの引数は[-1, 1]の範囲でなければならない
        if (sinVal < -1) sinVal = -1;
        altTargetRad = Math.PI/2 - Math.asin(sinVal);
        c = altTargetRad - altObsRad; // 観測点が低い場合は、地球中心角cは両者の差になる
    } else {
        sinVal = r1/r2 * Math.sin(Math.PI/2 - altObsRad);
        if (sinVal > 1) sinVal = 1; // 安全策: asinの引数は[-1, 1]の範囲でなければならない
        if (sinVal < -1) sinVal = -1;
        altTargetRad = Math.asin(sinVal) - Math.PI/2;
        c = -altObsRad - altTargetRad; // 観測点が高い場合は、地球中心角cは両者の和になる
    }
    const L = Reff * c;

    return L;
}

// ------------------------------------------------------
// 計算・描画ヘルパー (GeographicLib)
// ------------------------------------------------------
/**
 * 指定した地点から、方位(az)と距離(dist)進んだ先の座標を計算する
 * (GeographicLib を使用して高精度に計算)
 */
function getDestinationGeodesic(lat1, lon1, az, dist) {
    // WGS84楕円体を使用
    const geod = geodesic.Geodesic.WGS84;
    
    // Direct(順解法): 始点(lat1, lon1), 方位(az), 距離(dist) -> 終点
    // GeographicLibのDirectメソッドは { lat2, lon2, ... } を返します
    const r = geod.Direct(lat1, lon1, az, dist);

    return { lat: r.lat2, lng: r.lon2 };
}

// ★追加: 等角航路（地図上の直線）での到達点を計算する関数
function getDestinationRhumb(lat1, lon1, brng, dist) {
    const R = EARTH_RADIUS; // 地球半径 (m)
    const rad = Math.PI / 180;
    
    // ラジアン変換
    const lat1Rad = lat1 * rad;
    const lon1Rad = lon1 * rad;
    const brngRad = brng * rad;
    
    // 緯度の変化 (等角航路では緯度は距離のcos成分で単純に変化する)
    const d = dist / R; // 角距離
    let lat2Rad = lat1Rad + d * Math.cos(brngRad);

    // 緯度が90度を超えないように制限
    if (Math.abs(lat2Rad) > Math.PI / 2) {
        lat2Rad = lat2Rad > 0 ? Math.PI / 2 : -Math.PI / 2;
    }

    // 経度の変化 (メルカトル図法上の伸び率「等長緯度」を考慮)
    const dPhi = Math.log(Math.tan(Math.PI / 4 + lat2Rad / 2) / Math.tan(Math.PI / 4 + lat1Rad / 2));
    
    // 東西方向(90度/270度)に近い場合のゼロ除算対策
    // q = (Δlat / ΔPhi) もしくは cos(lat)
    const q = Math.abs(dPhi) > 1e-10 ? (lat2Rad - lat1Rad) / dPhi : Math.cos(lat1Rad);
    
    const dLon = d * Math.sin(brngRad) / q;
    const lon2Rad = lon1Rad + dLon;

    return {
        lat: lat2Rad / rad,
        lng: lon2Rad / rad // Leafletは経度が180度を超えても描画してくれるので正規化しなくてOK
    };
}

// (参考) calculateGreatCirclePoints も GeographicLib 化する場合
function calculateGreatCirclePoints(start, end) {
    const points = [];
    
    const geod = geodesic.Geodesic.WGS84;
    
    // Inverse(逆解法)で2点間の測地線を定義
    // InverseLine は始点から終点への「ラインオブジェクト」を作ります
    const l = geod.InverseLine(start.lat, start.lng, end.lat, end.lng);
    
    // 距離 (l.s13)
    const dist = l.s13; 
    
    // 100分割 (または100kmごとなど) して点を取得
    const numSteps = 100;
    for (let i = 0; i <= numSteps; i++) {
        // 距離 s を指定して座標を算出
        const s = (dist * i) / numSteps;
        const r = l.Position(s);
        points.push([r.lat2, r.lon2]);
    }
    
    return points;
}

/**
 * 気象条件から気差係数 K を計算する
 * K = 503 * (P / T^2) * (0.034 - Γ)
 * Γ: 気温減率 (正値, K/m)
 */
function calculateKFromMeteo(p, tCel, l) {
    const tKelvin = tCel + 273.15; // ケルビンに変換
    // 近似式 (l = 気温減率Γ、正値)
    const k = 503 * (p / (tKelvin * tKelvin)) * (0.034 - l);
    return k;
}

// ------------------------------------------------------
// 計算・描画ヘルパー (イベントハンドラ)
// ------------------------------------------------------

// 地図クリック時の処理 
async function onMapClick(e) {
    const isStart = document.getElementById('radio-start').checked;
    const elev = await getElevation(e.latlng.lat, e.latlng.lng);
    const val = (elev !== null) ? elev : 0;
    
    if (isStart) {
        appState.start = { lat: e.latlng.lat, lng: e.latlng.lng, elev: val };
    } else {
        appState.end = { lat: e.latlng.lat, lng: e.latlng.lng, elev: val };
    }
    saveAppState();
    updateAll();
}

// 汎用ヘルパー
function parseInput(val) {
    if (val.indexOf(',') === -1) return null;
    const clean = val.replace(/[\(\)\s]/g, ''); 
    const parts = clean.split(',');
    if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    return null;
}

// --- 半角→全角変換 ---
function toFullWidth(str) {
    return str.normalize('NFKC')
        .replace(/[\x21-\x7e]/g, ch =>
            String.fromCharCode(ch.charCodeAt(0) + 0xFEE0)
        ).replace(/ /g, '\u3000');
}

// --- 国土地理院 地名検索（GSI優先、OSMフォールバック） ---
async function searchLocation(query) {
    if (!query) return null;
    const q = query.trim();
    if (/^[\d\.\-\s\uff10-\uff19\uff0e\uff0d]+$/.test(q)) {
        console.warn("数値のみの入力のため、地名検索をスキップしました:", q);
        return null;
    }
    try {
        // 1. 国土地理院 検索
        const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.length > 0) {
            const gsiResults = data
                .filter(item => item.properties.title.includes(q))
                .map(item => {
                    const code = item.properties.addressCode || '';
                    const muniStr = (code && GSI.MUNI_ARRAY && GSI.MUNI_ARRAY[code]) || '';
                    const parts = muniStr.split(',');
                    const pref = parts[1] || '';
                    const city = parts[3] || '';
                    const address = pref && city ? `${pref}　${city}` : '';
                    return {
                        lat: item.geometry.coordinates[1],
                        lon: item.geometry.coordinates[0],
                        title: item.properties.title,
                        address: address
                    };
                });
            if (gsiResults.length > 0) return gsiResults;
        }

        // 2. GSI結果0件 → OSMフォールバック
        const urlOsm = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
        const resOsm = await fetch(urlOsm);
        const dataOsm = await resOsm.json();
        if (!dataOsm || dataOsm.length === 0) return [];

        return dataOsm.map(item => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            title: item.display_name.split(',')[0].trim(),
            address: item.display_name
        }));
    } catch(e) {
        console.error(e);
        return null;
    }
}

// --- GSI DEM PNGタイルによる標高取得 ---
const GSI_DEM_SOURCES = [
    { title: "DEM5A", url: "https://cyberjapandata.gsi.go.jp/xyz/dem5a_png/{z}/{x}/{y}.png", zoom: 15, fixed: 1 },
    { title: "DEM5B", url: "https://cyberjapandata.gsi.go.jp/xyz/dem5b_png/{z}/{x}/{y}.png", zoom: 15, fixed: 1 },
    { title: "DEM5C", url: "https://cyberjapandata.gsi.go.jp/xyz/dem5c_png/{z}/{x}/{y}.png", zoom: 15, fixed: 1 },
    { title: "DEM10B", url: "https://cyberjapandata.gsi.go.jp/xyz/dem_png/{z}/{x}/{y}.png", zoom: 14, fixed: 0 },
];

const POW2_8 = Math.pow(2, 8);
const POW2_16 = Math.pow(2, 16);
const POW2_23 = Math.pow(2, 23);
const POW2_24 = Math.pow(2, 24);

function _getTileInfo(lat, lng, zoom) {
    const lngRad = lng * Math.PI / 180;
    const R = 128 / Math.PI;
    const worldX = R * (lngRad + Math.PI);
    const pixelX = worldX * Math.pow(2, zoom);
    const tileX = Math.floor(pixelX / 256);

    const latRad = lat * Math.PI / 180;
    const worldY = -R / 2 * Math.log((1 + Math.sin(latRad)) / (1 - Math.sin(latRad))) + 128;
    const pixelY = worldY * Math.pow(2, zoom);
    const tileY = Math.floor(pixelY / 256);

    return {
        x: tileX, y: tileY,
        pX: Math.floor(pixelX - tileX * 256),
        pY: Math.floor(pixelY - tileY * 256)
    };
}

function _loadTileImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Tile load failed"));
        img.src = url;
    });
}

function _elevFromRGB(r, g, b) {
    if (r === 128 && g === 0 && b === 0) return null;
    const d = r * POW2_16 + g * POW2_8 + b;
    let h = (d < POW2_23) ? d : d - POW2_24;
    if (h === -POW2_23) h = 0;
    else h *= 0.01;
    return h;
}

// タイル画像キャッシュ (同一セッション内でタイル再利用)
const _tileCache = {};

async function _getTileImageData(tileUrl) {
    if (_tileCache[tileUrl]) return _tileCache[tileUrl];
    try {
        const img = await _loadTileImage(tileUrl);
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, 256, 256);
        _tileCache[tileUrl] = imgData;
        return imgData;
    } catch (e) {
        return null;
    }
}

function _makeTileUrl(demSource, tileX, tileY) {
    return demSource.url.replace('{z}', demSource.zoom).replace('{x}', tileX).replace('{y}', tileY);
}

// Open-Meteo Elevation API で標高を取得 (GSIフォールバック用)
async function _getElevationFromOpenMeteo(lat, lng) {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.elevation && data.elevation.length > 0 && data.elevation[0] !== null) {
            return parseFloat(data.elevation[0].toFixed(1));
        }
    } catch (e) { /* ignore */ }
    return null;
}

// 1地点の標高取得 (DEM5A→5B→5C→10B の順にフォールバック、全て失敗時はOpen-Meteo)
async function getElevation(lat, lng) {
    for (const dem of GSI_DEM_SOURCES) {
        const ti = _getTileInfo(lat, lng, dem.zoom);
        const url = _makeTileUrl(dem, ti.x, ti.y);
        const imgData = await _getTileImageData(url);
        if (!imgData) continue;
        const idx = (ti.pY * 256 + ti.pX) * 4;
        const h = _elevFromRGB(imgData.data[idx], imgData.data[idx + 1], imgData.data[idx + 2]);
        if (h !== null) return parseFloat(h.toFixed(dem.fixed));
    }
    // GSI DEMで取得できなかった場合、Open-Meteo APIにフォールバック
    const omElev = await _getElevationFromOpenMeteo(lat, lng);
    if (omElev !== null) return omElev;
    return 0;
}

// バッチ標高取得 (標高グラフ用 - タイル単位でまとめて処理)
let _elevFetchGeneration = 0;
async function fetchAllElevations(points, onProgress) {
    const generation = ++_elevFetchGeneration;

    for (const dem of GSI_DEM_SOURCES) {
        if (generation !== _elevFetchGeneration) return;

        // 未取得ポイントをタイルごとにグループ化
        const tileGroups = {};
        for (let i = 0; i < points.length; i++) {
            if (points[i].fetched) continue;
            const ti = _getTileInfo(points[i].lat, points[i].lng, dem.zoom);
            const key = `${ti.x}_${ti.y}`;
            if (!tileGroups[key]) {
                tileGroups[key] = {
                    url: _makeTileUrl(dem, ti.x, ti.y),
                    pts: []
                };
            }
            tileGroups[key].pts.push({ idx: i, pX: ti.pX, pY: ti.pY });
        }

        const tileKeys = Object.keys(tileGroups);
        if (tileKeys.length === 0) break;

        // 1タイルずつ並列ダウンロード
        const BATCH = 1;
        for (let b = 0; b < tileKeys.length; b += BATCH) {
            if (generation !== _elevFetchGeneration) return;

            const batch = tileKeys.slice(b, b + BATCH);
            const results = await Promise.all(batch.map(async key => {
                const group = tileGroups[key];
                const imgData = await _getTileImageData(group.url);
                return { imgData, pts: group.pts };
            }));

            for (const { imgData, pts } of results) {
                if (!imgData) continue;
                for (const pt of pts) {
                    if (points[pt.idx].fetched) continue;
                    const pIdx = (pt.pY * 256 + pt.pX) * 4;
                    const h = _elevFromRGB(imgData.data[pIdx], imgData.data[pIdx + 1], imgData.data[pIdx + 2]);
                    if (h !== null) {
                        points[pt.idx].elev = parseFloat(h.toFixed(dem.fixed));
                        points[pt.idx].fetched = true;
                    }
                }
            }

            const fetchedCount = points.filter(p => p.fetched).length;
            if (onProgress) onProgress(fetchedCount, points.length);
        }
    }

    // フォールバック: どのDEMでも取得できなかったポイントはOpen-Meteo APIで取得
    const unfetched = points.filter(p => !p.fetched);
    if (unfetched.length > 0) {
        // Open-Meteo APIはカンマ区切りで複数地点を一括取得可能
        const BATCH_OM = 100;
        for (let b = 0; b < unfetched.length; b += BATCH_OM) {
            if (generation !== _elevFetchGeneration) return;
            const batch = unfetched.slice(b, b + BATCH_OM);
            const lats = batch.map(p => p.lat).join(',');
            const lngs = batch.map(p => p.lng).join(',');
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.elevation) {
                        for (let i = 0; i < batch.length; i++) {
                            if (data.elevation[i] !== null && data.elevation[i] !== undefined) {
                                batch[i].elev = parseFloat(data.elevation[i].toFixed(1));
                                batch[i].fetched = true;
                            }
                        }
                    }
                }
            } catch (e) { /* ignore */ }
            const fetchedCount = points.filter(p => p.fetched).length;
            if (onProgress) onProgress(fetchedCount, points.length);
        }
    }
    // 最終フォールバック: それでも取得できなかったポイントは0
    for (const pt of points) {
        if (!pt.fetched) { pt.elev = 0; pt.fetched = true; }
    }
    if (onProgress) onProgress(points.length, points.length);
}

function createLocationPopup(title, pos, target) {
    const az = calculateBearing(pos.lat, pos.lng, target.lat, target.lng);
    const dist = L.latLng(pos.lat, pos.lng).distanceTo(L.latLng(target.lat, target.lng));
    
    // ★追加: 視高度を計算
    const alt = calculateApparentAltitude(dist, pos.elev, target.elev);

    return `
        <b>${title}</b><br>
        緯度: ${pos.lat.toFixed(5)}°<br>
        経度: ${pos.lng.toFixed(5)}°<br>
        標高: ${pos.elev} m<br>
        相手距離: ${(dist/1000).toFixed(2)} km<br>
        相手方位: ${az.toFixed(1)}°<br>
        相手高度: ${alt.toFixed(2)}°
    `;
}

// ★追加: 2点間の距離と標高差から視高度(角度)を計算する関数
function calculateApparentAltitude(dist, hObs, hTarget) {
    if (dist <= 0) return 0; // 距離0の場合は0度とする

    // 気差係数k (気差OFF時は0)
    const k = appState.refractionEnabled ? calculateKFromMeteo(appState.meteo.p, appState.meteo.t, appState.meteo.l) : 0;

    // 地球の曲率(と気差)を考慮した視高度計算式
    // tan(a) = (H_target - H_obs) / d - d / (2 * R) * (1 - k)
    const val = (hTarget - hObs) / dist - (dist * (1 - k)) / (2 * EARTH_RADIUS);
    return Math.atan(val) * 180 / Math.PI;
}

function calculateBearing(lat1, lng1, lat2, lng2) {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;
    const l1 = toRad(lat1);
    const l2 = toRad(lat2);
    const dLng = toRad(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(l2);
    const x = Math.cos(l1) * Math.sin(l2) - Math.sin(l1) * Math.cos(l2) * Math.cos(dLng);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function getRiseSetAlt(bodyId, date, observer, refr) {
    const eq = Astronomy.Equator(bodyId, date, observer, true, true);
    const hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec, refr);
    return hor.altitude.toFixed(2);
}

function updateShortcutsData(startOfDay, observer) {
    try {
        const sr = Astronomy.SearchRiseSet('Sun', observer, +1, startOfDay, 1);
        const ss = Astronomy.SearchRiseSet('Sun', observer, -1, startOfDay, 1);
        const mr = Astronomy.SearchRiseSet('Moon', observer, +1, startOfDay, 2);
        const ms = Astronomy.SearchRiseSet('Moon', observer, -1, startOfDay, 2);
        
        document.getElementById('time-sunrise').innerText = sr ? formatTime(sr.date) : "--:--";
        document.getElementById('time-sunset').innerText = ss ? formatTime(ss.date) : "--:--";
        document.getElementById('time-moonrise').innerText = mr ? formatTime(mr.date, startOfDay) : "--:--";
        document.getElementById('time-moonset').innerText = ms ? formatTime(ms.date, startOfDay) : "--:--";

        const refr = appState.refractionEnabled ? "normal" : null;
        document.getElementById('alt-sunrise').innerText = sr ? getRiseSetAlt('Sun', sr.date, observer, refr) : "--";
        document.getElementById('alt-sunset').innerText = ss ? getRiseSetAlt('Sun', ss.date, observer, refr) : "--";
        document.getElementById('alt-moonrise').innerText = mr ? getRiseSetAlt('Moon', mr.date, observer, refr) : "--";
        document.getElementById('alt-moonset').innerText = ms ? getRiseSetAlt('Moon', ms.date, observer, refr) : "--";

        currentRiseSetData = {
            sunrise: sr?.date,
            sunset: ss?.date,
            moonrise: mr?.date,
            moonset: ms?.date
        };
    } catch(e) {}
}

function updateMoonInfo(date) {
    const phase = Astronomy.MoonPhase(date);
    const age = (phase / 360) * SYNODIC_MONTH;
    document.getElementById('moon-age-input').value = age.toFixed(1);
    const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    document.getElementById('moon-icon').innerText = icons[Math.round(phase / 45) % 8];
}

function formatTime(date, baseDate) {
    if (!date) return "--:--";
    
    let h = date.getHours();
    const m = date.getMinutes();
    
    if (baseDate) {
        // 24時間以上経過しているかチェック (86400000ms = 24h)
        if (date.getTime() - baseDate.getTime() >= 86400000) {
            h += 24;
        }
    }
    
    return `${('00'+h).slice(-2)}:${('00'+m).slice(-2)}`;
}

function searchStarRiseSet(ra, dec, observer, startOfDay) {
    let rise = null;
    let set = null;
    let prevAlt = null;
    const start = startOfDay.getTime();
    
    for (let m = 0; m <= 1440; m += 1) { 
        const time = new Date(start + m * 60000);
        
        const hor = Astronomy.Horizon(time, observer, ra, dec, appState.refractionEnabled ? "normal" : null); 
        const alt = hor.altitude;
        
        if (prevAlt !== null) {
            if (prevAlt < 0 && alt >= 0) {
                rise = getCrossingTime(start + (m-1)*60000, start + m*60000, prevAlt, alt);
            } else if (prevAlt >= 0 && alt < 0) {
                set = getCrossingTime(start + (m-1)*60000, start + m*60000, prevAlt, alt);
            }
        }
        prevAlt = alt;
    }
    return {
        rise: rise ? formatTime(rise) : "--:--",
        set: set ? formatTime(set) : "--:--"
    };
}

/**
 * 線形補間により、高度が0(地平線)になる正確な時刻を計算する
 * 原理: 2点間を直線で結び、その線が0と交差するポイント(比率)を求める
 * * @param {number} t1 前回の時刻 (ms)
 * @param {number} t2 今回の時刻 (ms)
 * @param {number} alt1 前回の高度
 * @param {number} alt2 今回の高度
 */
function getCrossingTime(t1, t2, alt1, alt2) {
    // 1. 全体でどれだけ高度が変わったか (分母: 坂の高さ)
    const totalClimb = alt2 - alt1;
    
    // 2. 0(地平線)になるには、t1からあとどれだけ登ればいいか (分子: 残りの高さ)
    const needToClimb = 0 - alt1;
    
    // 3. その比率(進捗率)を出し、時間の幅(t2-t1)に掛けて、t1に足す
    const ratio = needToClimb / totalClimb;
    
    return new Date(t1 + (t2 - t1) * ratio);
}

/**
 * 眼高差（Dip of Horizon）を計算する
 * 引用: 天文航法, 天文学辞典, 理科年表
 * 式: σ = 1.776' × √h (分)
 * * @param {number} h 眼高 (メートル)
 * @returns {number} 眼高差 (度)
 */
function getHorizonDip(h) {
    if (!h || h <= 0) return 0;
    
    // 1.776分 × √h
    // 戻り値は「度」にする必要があるので 60 で割る
    return 1.776 * Math.sqrt(h) / 60;
}

// MyStar
function registerMyStar() {
    const val = document.getElementById('input-mystar-radec').value.trim();
    if(!val) { 
        appState.myStar = { ra: MINTAKA_RA, dec: MINTAKA_DEC }; 
    } else {
        const parts = val.split(',');
        if(parts.length === 2) { 
            appState.myStar = { ra: parseFloat(parts[0]), dec: parseFloat(parts[1]) }; 
        } else {
            return alert('形式エラー');
        }
    }
    saveAppState();
    updateAll();
}

function reflectMyStarUI() {
    const myBody = appState.bodies.find(b => b.id === 'MyStar');
    if(myBody) {
        const ind = document.getElementById('style-MyStar');
        ind.style.color = myBody.color;
        ind.className = `style-indicator ${myBody.isDashed ? 'dashed' : 'solid'}`;
        document.getElementById('chk-mystar').checked = myBody.visible;
    }
}

// リスト・パレット
function renderCelestialList() {
    const list = document.getElementById('celestial-list');
    if (!list) return;
    list.innerHTML = '';
    
    appState.bodies.forEach(body => {
        if(body.isCustom) return; 
        const li = document.createElement('li');
        const dashClass = body.isDashed ? 'dashed' : 'solid';
        li.innerHTML = `
            <input type="checkbox" class="body-checkbox" ${body.visible ? 'checked' : ''} 
                   onchange="toggleVisibility('${body.id}', this.checked)">
            <div class="style-indicator ${dashClass}" style="color: ${body.color};"
                 onclick="openPalette('${body.id}')"></div>
            <div class="body-info">
                <div class="body-header"><span class="body-name">${body.name}</span></div>
                <span id="data-${body.id}" class="body-detail-text">--:--</span>
            </div>`;
        list.appendChild(li);
    });
}

function toggleVisibility(id, checked) {
    const body = appState.bodies.find(b => b.id === id);
    if(body) {
        body.visible = checked;
        saveAppState();
        updateAll();
    }
}

function openPalette(id) {
    editingBodyId = id;
    const p = document.getElementById('style-palette');
    const c = document.getElementById('palette-colors');
    c.innerHTML = '';
    
    COLOR_MAP.forEach(col => {
        const d = document.createElement('div');
        d.className = 'color-btn';
        d.style.backgroundColor = col.code;
        d.onclick = () => { applyColor(col.code); };
        c.appendChild(d);
    });
    p.classList.remove('hidden');
}

function applyColor(code) {
    const b = appState.bodies.find(x => x.id === editingBodyId);
    if(b) {
        b.color = code;
        if(editingBodyId === 'MyStar') reflectMyStarUI();
        closePalette();
        saveAppState();
        renderCelestialList();
        updateAll();
    }
}

function applyLineStyle(type) {
    const b = appState.bodies.find(x => x.id === editingBodyId);
    b.isDashed = (type === 'dashed');
    if(editingBodyId === 'MyStar') reflectMyStarUI();
    closePalette();
    saveAppState();
    renderCelestialList();
    updateAll();
}

// 設定登録 (大気差係数など)
function registerSettings() {
    const iK = document.getElementById('input-refraction-k');
    const iP = document.getElementById('input-meteo-p');
    const iT = document.getElementById('input-meteo-t');
    const iL = document.getElementById('input-meteo-l');
    const val = iK.value.trim();

    // 空欄の場合はmeteoを標準値にリセット
    if (val === '') {
        appState.meteo = { p: STD_P, t: STD_T, l: STD_L };
        iP.value = STD_P;
        iT.value = STD_T;
        iL.value = STD_L;
    } else {
        const p = parseFloat(iP.value);
        const t = parseFloat(iT.value);
        const l = parseFloat(iL.value);
        if (isNaN(p) || isNaN(t) || isNaN(l)) {
            return alert('気象パラメータに有効な数値を入力してください');
        }
        appState.meteo = { p, t, l };
    }

    // 常にmeteoからKを再計算
    const k = calculateKFromMeteo(appState.meteo.p, appState.meteo.t, appState.meteo.l);
    appState.refractionK = k;
    iK.value = k.toFixed(4);
    alert(`大気差補正係数を ${k.toFixed(4)} に設定しました`);

    saveAppState();
    updateAll(); // 再計算して描画更新
}

function resetBodyStyle() {
    if (!editingBodyId) return;
    const def = DEFAULT_BODIES.find(x => x.id === editingBodyId);
    if (!def) return;
    const body = appState.bodies.find(x => x.id === editingBodyId);
    if (!body) return;
    body.color = def.color;
    body.isDashed = def.isDashed;
    if (editingBodyId === 'MyStar') reflectMyStarUI();
    closePalette();
    saveAppState();
    renderCelestialList();
    updateAll();
}

function closePalette() {
    document.getElementById('style-palette').classList.add('hidden');
    editingBodyId = null;
}

// 標高
function toggleElevation() {
    const btn = document.getElementById('btn-elevation');
    const pnl = document.getElementById('elevation-panel');
    appState.isElevationActive = !appState.isElevationActive;

    if (appState.isElevationActive) {
        btn.classList.add('active');
        pnl.classList.remove('hidden');
        startElevationFetch();
    } else {
        btn.classList.remove('active');
        pnl.classList.add('hidden');
        _elevFetchGeneration++;
        document.getElementById('progress-overlay').classList.add('hidden');
    }
    syncBottomPanels();
}

// --- 辻検索 入力連動 ---
function updateTsujiSearchInputs() {
    const dist = L.latLng(appState.start.lat, appState.start.lng)
                  .distanceTo(L.latLng(appState.end.lat, appState.end.lng));
    const az = calculateBearing(appState.start.lat, appState.start.lng,
                                appState.end.lat, appState.end.lng);
    const alt = calculateApparentAltitude(dist, appState.start.elev, appState.end.elev);
    document.getElementById('input-tsuji-az').value = az.toFixed(1);
    document.getElementById('input-tsuji-alt').value = alt.toFixed(2);
}

// --- 辻検索 ---
function toggleTsujiSearch() {
    appState.isTsujiSearchActive = !appState.isTsujiSearchActive;
    const btn = document.getElementById('btn-tsuji-search');
    const pnl = document.getElementById('tsujiday-panel');

    if (appState.isTsujiSearchActive) {
        btn.classList.add('active');
        pnl.classList.remove('hidden');
        document.getElementById('tsujiday-header').innerHTML = '辻検索結果 <span id="tsujiday-status"></span>';
        startTsujiSearch();
    } else {
        btn.classList.remove('active');
        pnl.classList.add('hidden');
        appState.tsujiSearchGeneration++;
    }
    syncBottomPanels();
}

function syncBottomPanels() {
    const tdPnl = document.getElementById('tsujiday-panel');
    if (appState.isTsujiSearchActive && appState.isElevationActive) {
        tdPnl.classList.add('with-elevation');
    } else {
        tdPnl.classList.remove('with-elevation');
    }
}


// --- テーブルソート ヘルパー ---
function setupTableSort(table, rowData, columns, renderRowFn, extraRows) {
    const ths = Array.from(table.querySelectorAll('thead th'));
    const tbody = table.querySelector('tbody');
    let sortColIdx = -1;
    let sortAsc = true;

    ths.forEach((th, idx) => {
        th.addEventListener('click', () => {
            if (sortColIdx === idx) {
                sortAsc = !sortAsc;
            } else {
                sortColIdx = idx;
                sortAsc = true;
            }
            ths.forEach((h, i) => {
                h.textContent = columns[i].label + (i === sortColIdx ? (sortAsc ? '▲' : '▼') : '');
            });
            rowData.sort((a, b) => {
                const cmp = columns[idx].compare(a, b);
                return sortAsc ? cmp : -cmp;
            });
            tbody.innerHTML = '';
            rowData.forEach(d => tbody.appendChild(renderRowFn(d)));
            if (extraRows) extraRows.forEach(r => tbody.appendChild(r));
        });
    });
}

// --- 辻検索 ヘルパー ---
function isAzimuthInRange(az, targetAz, tolerance) {
    let diff = az - targetAz;
    diff = ((diff + 540) % 360) - 180;
    return Math.abs(diff) <= tolerance;
}

// --- 辻検索 コア検索ロジック ---
async function startTsujiSearch() {
    const generation = ++appState.tsujiSearchGeneration;
    const contentEl = document.getElementById('tsujiday-content');
    const statusEl = document.getElementById('tsujiday-status');
    contentEl.innerHTML = '';
    statusEl.textContent = '(検索中…)';

    const observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev);
    const baseAz = parseFloat(document.getElementById('input-tsuji-az').value);
    const offsetAz = parseFloat(document.getElementById('input-tsuji-az-offset').value) || 0;
    const toleranceAz = parseFloat(document.getElementById('input-tsuji-az-tolerance').value);
    const baseAlt = parseFloat(document.getElementById('input-tsuji-alt').value);
    const offsetAlt = parseFloat(document.getElementById('input-tsuji-alt-offset').value) || 0;
    const toleranceAlt = parseFloat(document.getElementById('input-tsuji-alt-tolerance').value);
    const searchDays = 365;
    const searchInterval = 1;
    const stepsPerDay = 1440;

    // オフセットを加算した検索中心
    const targetAz = (baseAz + offsetAz + 360) % 360;
    const targetAlt = baseAlt + offsetAlt;

    if (isNaN(baseAz) || isNaN(toleranceAz) || isNaN(baseAlt) || isNaN(toleranceAlt)) {
        statusEl.textContent = '(入力値エラー)';
        contentEl.innerHTML = '<div style="padding:8px;color:#f99;">方位角・視高度・許容範囲を正しく入力してください</div>';
        return;
    }

    const visibleBodies = appState.bodies.filter(b => b.visible);
    const searchStart = new Date(appState.currentDate);
    searchStart.setHours(0, 0, 0, 0);
    const MAX_RESULTS_PER_BODY = 366;
    const totalResults = [];

    for (let bi = 0; bi < visibleBodies.length; bi++) {
        const body = visibleBodies[bi];
        const bodyResults = [];
        let bodyLimitReached = false;

        for (let d = 0; d < searchDays; d++) {
            if (generation !== appState.tsujiSearchGeneration) return;

            const dayStart = new Date(searchStart.getTime() + d * 86400000);
            let bestMatch = null;
            let bestDist = Infinity;

            for (let s = 0; s < stepsPerDay; s++) {
                const m = s * searchInterval;
                const time = new Date(dayStart.getTime() + m * 60000);

                let ra, dec;
                if (body.id === 'Polaris') {
                    ra = POLARIS_RA; dec = POLARIS_DEC;
                } else if (body.id === 'Subaru') {
                    ra = SUBARU_RA; dec = SUBARU_DEC;
                } else if (body.id === 'MyStar') {
                    ra = appState.myStar.ra; dec = appState.myStar.dec;
                } else {
                    const eq = Astronomy.Equator(body.id, time, observer, true, true);
                    ra = eq.ra; dec = eq.dec;
                }

                const hor = Astronomy.Horizon(time, observer, ra, dec, appState.refractionEnabled ? "normal" : null);

                if (isAzimuthInRange(hor.azimuth, targetAz, toleranceAz) &&
                    Math.abs(hor.altitude - targetAlt) <= toleranceAlt) {
                    // 中心からの角距離を計算
                    let azDiff = hor.azimuth - targetAz;
                    azDiff = ((azDiff + 540) % 360) - 180;
                    const altDiff = hor.altitude - targetAlt;
                    const dist = Math.sqrt(azDiff * azDiff + altDiff * altDiff);
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestMatch = { time: new Date(time), azimuth: hor.azimuth, altitude: hor.altitude, dist };
                    }
                }
            }

            if (bestMatch) {
                bodyResults.push(bestMatch);
                if (bodyResults.length >= MAX_RESULTS_PER_BODY) {
                    bodyLimitReached = true;
                    break;
                }
            }

            // 7日ごとにUI解放
            if (d % 7 === 6) {
                statusEl.textContent = `(${body.name} ${d + 1}/${searchDays}日…)`;
                await new Promise(r => setTimeout(r, 0));
            }
        }

        totalResults.push({ body, results: bodyResults, limitReached: bodyLimitReached });
        statusEl.textContent = `(検索中… ${bi + 1}/${visibleBodies.length} 天体完了)`;
        await new Promise(r => setTimeout(r, 0));
    }

    if (generation !== appState.tsujiSearchGeneration) return;

    // 結果表示
    const totalCount = totalResults.reduce((sum, t) => sum + t.results.length, 0);
    statusEl.textContent = `(${totalCount}件)`;

    if (totalCount === 0) {
        contentEl.innerHTML = '<div style="padding:8px;color:#999;">該当する日時はありません</div>';
        return;
    }

    // ソート用データをフラットに事前計算
    const symbolRank = { '◎': 0, '○': 1, '△': 2, '-': 3 };
    const rowData = [];
    const extraRows = [];

    totalResults.forEach(({ body, results, limitReached }) => {
        results.forEach(r => {
            let symbol;
            if (r.dist <= 0.125) symbol = '◎';       // ±0.125° (誤差範囲0.25°、視半径以内)
            else if (r.dist <= 0.25) symbol = '○';   // ±0.25° (誤差範囲0.5°、視直径以内)
            else if (r.dist <= 1.0) symbol = '△';    // ±1° (誤差範囲2°、視直径×4以内)
            else symbol = '-';

            const dt = r.time;
            const dow = ['日','月','火','水','木','金','土'][dt.getDay()];
            const dateStr = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}(${dow})`;
            const timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

            const angR = getBodyAngularRadius(body.id, dt, observer);

            let moonAge = -1;
            let moonIcon = '';
            if (body.id === 'Moon') {
                const phase = Astronomy.MoonPhase(dt);
                moonAge = (phase / 360) * SYNODIC_MONTH;
                const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
                moonIcon = icons[Math.round(phase / 45) % 8];
            }

            rowData.push({
                body, symbol, dateStr: `${dateStr} ${timeStr}`, dateObj: dt,
                dist: r.dist, azimuth: r.azimuth, altitude: r.altitude,
                angularRadius: angR, moonAge, moonIcon
            });
        });

        if (limitReached) {
            const tr = document.createElement('tr');
            tr.style.color = body.color;
            tr.innerHTML = `<td colspan="10">${body.name}: and more…</td>`;
            extraRows.push(tr);
        }
    });

    const renderRow = (r) => {
        const tr = document.createElement('tr');
        tr.className = 'td-data-row';
        tr.style.color = r.body.color;
        tr.innerHTML = `<td>${r.body.id}</td><td>${r.body.name}</td><td>${r.symbol}</td><td>${r.dist.toFixed(3)}°</td><td>${r.dateStr}</td><td>${r.azimuth.toFixed(1)}°</td><td>${r.altitude.toFixed(2)}°</td><td>${r.angularRadius.toFixed(3)}°</td><td>${r.moonAge >= 0 ? r.moonAge.toFixed(1) : ''}</td><td>${r.moonIcon}</td>`;
        tr.addEventListener('click', () => {
            appState.currentDate = new Date(r.dateObj);
            syncUIFromState();
            updateAll();
        });
        return tr;
    };

    const table = document.createElement('table');
    table.className = 'td-table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>ID</th><th>天体</th><th>精度</th><th>角距離</th><th>日時</th><th>方位角</th><th>視高度</th><th>視半径</th><th>月齢</th><th>🌙</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    rowData.forEach(r => tbody.appendChild(renderRow(r)));
    extraRows.forEach(r => tbody.appendChild(r));
    table.appendChild(tbody);
    contentEl.appendChild(table);

    setupTableSort(table, rowData, [
        { label: 'ID', compare: (a, b) => a.body.id.localeCompare(b.body.id) },
        { label: '天体', compare: (a, b) => {
            const ia = appState.bodies.findIndex(bo => bo.id === a.body.id);
            const ib = appState.bodies.findIndex(bo => bo.id === b.body.id);
            return ia - ib;
        }},
        { label: '精度', compare: (a, b) => (symbolRank[a.symbol] ?? 9) - (symbolRank[b.symbol] ?? 9) },
        { label: '角距離', compare: (a, b) => a.dist - b.dist },
        { label: '日時', compare: (a, b) => a.dateObj - b.dateObj },
        { label: '方位角', compare: (a, b) => a.azimuth - b.azimuth },
        { label: '視高度', compare: (a, b) => a.altitude - b.altitude },
        { label: '視半径', compare: (a, b) => a.angularRadius - b.angularRadius },
        { label: '月齢', compare: (a, b) => a.moonAge - b.moonAge },
        { label: '🌙', compare: (a, b) => a.moonIcon.localeCompare(b.moonIcon) },
    ], renderRow, extraRows);
}

async function startElevationFetch() {
    appState.elevationData.points = [];
    const s = L.latLng(appState.start.lat, appState.start.lng);
    const e = L.latLng(appState.end.lat, appState.end.lng);
    const dist = s.distanceTo(e);
    const steps = Math.floor(dist / 100);

    for(let i=0; i<=steps; i++) {
        const r = i/steps;
        appState.elevationData.points.push({
            lat: s.lat + (e.lat - s.lat)*r,
            lng: s.lng + (e.lng - s.lng)*r,
            dist: i*0.1,
            elev: null,
            fetched: false
        });
    }
    appState.elevationData.index = 0;
    document.getElementById('progress-overlay').classList.remove('hidden');
    updateProgress(0, 0, appState.elevationData.points.length);

    // タイルベースのバッチ処理で標高を取得
    await fetchAllElevations(appState.elevationData.points, (fetched, total) => {
        const pct = Math.floor((fetched / total) * 100);
        updateProgress(pct, fetched, total);
        drawProfileGraph();
    });

    document.getElementById('progress-overlay').classList.add('hidden');
    drawProfileGraph();
}

function updateProgress(pct, cur, tot) {
    document.getElementById('progress-bar').style.width = pct + "%";
    document.getElementById('progress-text').innerText = `${pct}% (${cur}/${tot} タイル処理中...)`;
}

function drawProfileGraph() {
    const cvs = document.getElementById('elevation-canvas');
    const ctx = cvs.getContext('2d');
    const w = cvs.width = cvs.clientWidth;
    const h = cvs.height = cvs.clientHeight;
    const pts = appState.elevationData.points.filter(p => p.fetched);
    
    if(pts.length === 0) return;
    
    const elevs = pts.map(p => p.elev);
    const minE = Math.min(0, ...elevs);
    const maxE = Math.max(100, ...elevs);
    
    const pad = {l:40, r:10, t:20, b:20};
    const gw = w - pad.l - pad.r;
    const gh = h - pad.t - pad.b;
    const maxD = appState.elevationData.points[appState.elevationData.points.length-1].dist;
    
    const toX = d => pad.l + (d/maxD)*gw;
    const toY = e => pad.t + gh - ((e - minE)/(maxE - minE))*gh;

    ctx.strokeStyle = '#444';
    ctx.beginPath();
    for(let i=0; i<=4; i++) {
        const y = toY(minE + (maxE-minE)*(i/4));
        ctx.moveTo(pad.l, y);
        ctx.lineTo(w-pad.r, y);
        ctx.fillStyle='#aaa';
        ctx.fillText(Math.round(minE+(maxE-minE)*(i/4)), 2, y+3);
    }
    ctx.stroke();

    if(pts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(toX(pts[0].dist), toY(pts[0].elev));
        for(let i=1; i<pts.length; i++) {
            ctx.lineTo(toX(pts[i].dist), toY(pts[i].elev));
        }
        ctx.strokeStyle='#00ff00';
        ctx.lineWidth=2;
        ctx.stroke();
        
        ctx.lineTo(toX(pts[pts.length-1].dist), pad.t+gh);
        ctx.lineTo(toX(pts[0].dist), pad.t+gh);
        ctx.fillStyle='rgba(0,255,0,0.1)';
        ctx.fill();
    }
}

function initVisitorCounter() {
    const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    // lastVisitDateはappStateで管理
    if (appState.lastVisitDate !== todayStr) {
        fetch(`${GAS_API_URL}?action=visit`).then(r=>r.json()).then(d => {
            if(!d.error) {
                appState.lastVisitDate = todayStr;
                saveAppState();
                visitorData = d;
                document.getElementById('cnt-today').innerText = d.today;
                document.getElementById('cnt-yesterday').innerText = d.yesterday;
                document.getElementById('cnt-year').innerText = d.yearTotal;
                document.getElementById('cnt-last').innerText = d.lastYearTotal;
            }
        });
    } else {
        fetch(`${GAS_API_URL}?action=get`).then(r=>r.json()).then(d => {
            if(!d.error) {
                visitorData = d;
                document.getElementById('cnt-today').innerText = d.today;
                document.getElementById('cnt-yesterday').innerText = d.yesterday;
                document.getElementById('cnt-year').innerText = d.yearTotal;
                document.getElementById('cnt-last').innerText = d.lastYearTotal;
            }
        });
    }
}

function showGraph(type) {
    if(!visitorData) return;
    document.getElementById('graph-modal').classList.remove('hidden');
    const cvs = document.getElementById('visitor-canvas');
    const ctx = cvs.getContext('2d');
    const w = cvs.width = cvs.clientWidth;
    const h = cvs.height = 300;
    
    const data = (type==='current') ? visitorData.dailyLog : visitorData.lastYearLog;
    document.getElementById('graph-title').innerText = (type==='current') ? "今年の推移" : "昨年の推移";
    if(!data || data.length===0) {
        ctx.fillStyle = '#333'; // 文字色も指定しておくと丁寧です
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center"; // 中央揃え
        ctx.fillText("No Data", w/2, h/2);
        return;
    }
    
    const maxVal = Math.max(10, ...data.map(d=>d.count));
    const pad = 40;
    const gw = w - pad*2;
    const gh = h - pad*2;
    
    ctx.strokeStyle='#ccc';
    ctx.strokeRect(pad, pad, gw, gh);
    
    ctx.beginPath();
    ctx.strokeStyle='#007bff';
    ctx.lineWidth=2;
    
    data.forEach((d, i) => {
        const x = pad + (i/(data.length-1||1))*gw;
        const y = (pad+gh) - (d.count/maxVal)*gh;
        if(i===0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        ctx.fillStyle = '#007bff'; 
        ctx.fillRect(x-2, y-2, 4, 4);
    });
    ctx.stroke();
    
    ctx.fillStyle='#333';
    ctx.textAlign = "right"; // 右揃え
    ctx.fillText(maxVal, pad-10, pad+10); // 位置調整
    ctx.fillText(0, pad-10, h-pad);
}

function closeGraph() {
    document.getElementById('graph-modal').classList.add('hidden');
}

function togglePanel() {
    document.getElementById('control-panel').classList.toggle('minimized');
}

function toggleSection(id) {
    document.getElementById(id).classList.toggle('closed');
}

function toggleHelp() {
    const modal = document.getElementById('help-modal');
    if(modal) modal.classList.toggle('hidden');
}