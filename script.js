/*
宙の辻 - Sora no Tsuji
Copyright (C) 2026 Takeyoshi Watanabe (Sora no Tsuji Project)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

Version History:
Version 1.20.1 - 2026-06-16: fix: パール富士で午前0時付近の日付が消える(重複する)問題を対策(東京タワーからのパール富士2026/06/24付)
Version 1.20.0 - 2026-05-25: feat: 辻ボタン/標高グラフ可視判定/位置精度の大幅な向上(南側にズレる問題を解消)
Version 1.19.2 - 2026-05-01: fix: 辻検索とMy辻検索の精度不整合、辻検索とMy辻検索の計算中の観測点/目的点/日時の動的問題を修正
Version 1.19.1 - 2026-04-22: fix: 方位角/視高度4桁精度、精度角距離5桁精度、辻検索/My辻検索に精度フィルタ、各種不具合修正（件数表示、南中時/視半径、天体ID反映等）
Version 1.19.0 - 2026-04-18: feat: My天体改修、My観測点、My目的点、My辻検索、バックアップ/インポートの機能追加
Version 1.18.1 - 2026-04-05: fix: URL取得形式を3種類(日時固定、日時半固定、アクセス日時)に修正、マーカー位置を微調整
Version 1.18.0 - 2026-04-04: feat: マーカー色青赤、既定表示天体複数追加、encodeURL.html追加、URL取得ボタン×2追加
Version 1.17.3 - 2026-03-25: fix: Hom/推山ボタンのリセット/登録時に地図のズームを解除
Version 1.17.2 - 2026-03-25: fix: 既定目的点の富士山の緯度経度と標高を修正、ヘルプの内容を見直し
Version 1.17.1 - 2026-03-21: feat: 観測点/目的点標高、オフセット方位距離/視高距離、表示天体詳細表記
Version 1.17.0 - 2026-03-06: feat: 薄明ジャンプ機能追加、日出/日入/月出/月入ジャンプに視高度を表示
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

// 市区町村データ (遅延読み込み)
let muniData = null;
async function loadMuniData() {
    if (muniData) return muniData;
    const resp = await fetch('muni.json');
    muniData = await resp.json();
    return muniData;
}
const EARTH_RADIUS = 6378137;
const REFRACTION_K = 0.132; // 大気差補正定数: 0.132
// 標準大気モデルの定数
const STD_P = 1013.25;  // 標準気圧 (hPa)
const STD_T = 15.0;     // 標準気温 (°C)
const STD_L = 0.0065;   // 標準気温減率 Γ (K/m) 正値。0.0065が国際標準大気、0.0125が測量標準

const POLARIS_RA = 2.530304;
const POLARIS_DEC = 89.264109;
const MERAK_RA = 11.030689;
const MERAK_DEC = 56.382434;
const MINTAKA_RA = 5.533444;
const MINTAKA_DEC = -0.299095;
const SUBARU_RA = 3.777222;
const SUBARU_DEC = 24.178056;
const M42_RA = 5.588007;
const M42_DEC = -5.3876;
const VEGA_RA = 18.615649;
const VEGA_DEC = 38.783689;
const ALTAIR_RA = 19.846388;
const ALTAIR_DEC = 8.868321;
const DENEB_RA = 20.690532;
const DENEB_DEC = 45.280339;
const BETELGEUSE_RA = 5.919529;
const BETELGEUSE_DEC = 7.407064;
const SIRIUS_RA = 6.752477;
const SIRIUS_DEC = -16.716116;
const PROCYON_RA = 7.655033;
const PROCYON_DEC = 5.224988;
// 天の川: 代表点として天の川銀河の中心 (Sgr A*, J2000) を用いる
const MILKYWAY_RA = 17.761122;
const MILKYWAY_DEC = -29.007806;

// 固定RA/Decの恒星IDリスト
const FIXED_STAR_IDS = ['Polaris', 'Merak', 'Mintaka', 'Subaru', 'M42', 'Vega', 'Altair', 'Deneb', 'Betelgeuse', 'Sirius', 'Procyon', 'MilkyWay'];

/** 固定恒星判定 (既定恒星 + My天体) */
function isFixedStar(bodyId) {
    return FIXED_STAR_IDS.includes(bodyId) || appState.myStars.some(s => String(s.id) === bodyId);
}

// 天体の赤道半径 (km) - 視半径の計算用
const BODY_RADIUS_KM = {
    Sun: 695700, Moon: 1737.4,
    Mercury: 2439.7, Venus: 6051.8, Mars: 3396.2,
    Jupiter: 71492, Saturn: 60268, Uranus: 25559, Neptune: 24764
};
const KM_PER_AU = 149597870.7;

const DEFAULT_START = { lat: 35.658595126386274, lng: 139.74544465541842, elev: 18.5, height: 150.0 };
const DEFAULT_END = { lat: 35.3627986111111, lng: 138.730781416667, elev: 3776, height: 0 };

// 天体ごとの初期スタイル (リセット用・appState.bodies の単一情報源)
// ここが全組込天体の既定値の唯一の定義。appState.bodies はこれから派生する。
const DEFAULT_BODIES = [
    { id: 'MilkyWay', name: '天の川',   color: '#DDA0DD', isDashed: false, visible: true },
    { id: 'Sun',     name: '太陽',     color: '#FF0000', isDashed: false, visible: true },
    { id: 'Moon',    name: '月',       color: '#FFFF00', isDashed: false, visible: true },
    { id: 'Mercury', name: '水星',     color: '#00BFFF', isDashed: false, visible: false },
    { id: 'Venus',   name: '金星',     color: '#FFC0CB', isDashed: false, visible: false },
    { id: 'Mars',    name: '火星',     color: '#FFA500', isDashed: false, visible: false },
    { id: 'Jupiter', name: '木星',     color: '#A52A2A', isDashed: false, visible: false },
    { id: 'Saturn',  name: '土星',     color: '#008000', isDashed: false, visible: false },
    { id: 'Uranus',  name: '天王星',   color: '#ADFF2F', isDashed: false, visible: false },
    { id: 'Neptune', name: '海王星',   color: '#4B0082', isDashed: false, visible: false },
    { id: 'Pluto',   name: '冥王星',   color: '#808080', isDashed: false, visible: false },
    { id: 'Polaris', name: '北極星',   color: '#000000', isDashed: false, visible: false },
    { id: 'Merak',   name: '北斗七星メラク', color: '#654321', isDashed: false, visible: false },
    { id: 'Mintaka', name: 'オリオン座ミンタカ', color: '#FFFFFF', isDashed: false, visible: false },
    { id: 'Subaru',  name: 'すばる', color: '#0000FF', isDashed: false, visible: false },
    { id: 'M42',     name: 'オリオン大星雲M42', color: '#800080', isDashed: false, visible: false },
    { id: 'Vega',    name: 'こと座ベガ', color: '#FFA500', isDashed: true, visible: false },
    { id: 'Altair',  name: 'わし座アルタイル', color: '#008000', isDashed: true, visible: false },
    { id: 'Deneb',   name: 'はくちょう座デネブ', color: '#FFD700', isDashed: true, visible: false },
    { id: 'Betelgeuse', name: 'オリオン座ベテルギウス', color: '#FF0000', isDashed: true, visible: false },
    { id: 'Sirius',  name: 'おおいぬ座シリウス', color: '#00BFFF', isDashed: true, visible: false },
    { id: 'Procyon', name: 'こいぬ座プロキオン', color: '#ADFF2F', isDashed: true, visible: false }
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
    { name: '灰', code: '#808080' },
    { name: '黒', code: '#000000' }
];

// ============================================================
// 2. グローバル変数 & アプリケーション状態 (appState)
// ============================================================

let map;
let linesLayer;
let locationLayer;
let dpLayer;
// PC(マウス操作)判定: trueなら地図の観測点/目的点移動とメッシュ/辻マーカー選択をダブルクリックで行う
// (ドラッグ中の誤クリックによる観測点移動の防止。スマホ・タブレットは従来どおりタップ)
let _mapDblClickMode = (typeof window !== 'undefined' && window.matchMedia)
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : false;
// 辻ライン365 — 天体ごとに L.layerGroup を保持し、表示天体メニューの切替に高速応答する
let dp365LayerByBody = {}; // body.id -> L.layerGroup (mapに追加されている時のみ表示中)
let dp365CalculatedBodies = new Set(); // 365日path計算が完了した天体ID
let dp365CurrentGeneration = 0;

// ★ 全てを管理する状態オブジェクト
let appState = {
    // 現在表示中の場所（elevはapiElev + heightの合算値）
    start: { lat: DEFAULT_START.lat, lng: DEFAULT_START.lng, elev: DEFAULT_START.elev + DEFAULT_START.height },
    end:   { lat: DEFAULT_END.lat,   lng: DEFAULT_END.lng,   elev: DEFAULT_END.elev + DEFAULT_END.height },

    // API取得の生の標高値（読み取り専用表示用）
    startApiElev: DEFAULT_START.elev,
    endApiElev: DEFAULT_END.elev,

    // ユーザー入力の追加高さ（編集可能）
    startHeight: DEFAULT_START.height,
    endHeight: DEFAULT_END.height,

    // 登録された場所 (Homeボタンで呼び出す場所)
    homeStart: null,
    homeEnd:   null,

    // 日時
    currentDate: new Date(),
    
    // My天体 (複数天体)
    myStars: [],

    // My観測点 / My目的点
    myObservations: [],  // { id, name, lat, lng, elev, height }
    myTargets: [],       // { id, name, lat, lng, elev, height }

    // My辻検索
    myTsujiSearches: [],  // { id, name, days, bodyIds, obsId, tgtId,
                          //   baseAz, baseAlt, offsetAz, offsetAlt,
                          //   toleranceAz, toleranceAlt,
                          //   moonFilter, moonBase, moonTolerance,
                          //   accuracyFilter, accDblCircle, accCircle, accTriangle, accDash,
                          //   checked, memo }

    // 大気差補正の有効/無効
    refractionEnabled: false,

    // 大気差補正係数 (meteoから計算)
    refractionK: calculateKFromMeteo(STD_P, STD_T, STD_L),

    //気象パラメータ (初期値は標準大気)
    meteo: { p: STD_P, t: STD_T, l: STD_L },

    // 訪問履歴
    lastVisitDate: null,

    // 天体設定
    // 組込天体は DEFAULT_BODIES から派生（単一情報源）。My天体は別途 myStars から追加される。
    bodies: DEFAULT_BODIES.map(b => ({ ...b })),

    // 機能フラグ
    isMoving: false,
    moveSpeed: null,  // 'month', 'day', 'hour', 'min'
    isDPActive: true,
    isDP365Active: false,
    locMode: 'start',  // 'start' or 'end' — 地図クリック時にどちらの地点を移動するか
    isElevationActive: false,
    isMilkyWayActive: false,
    isSoramadoActive: false,
    isTsujiSearchActive: false,

    // 宙の窓パラメータ (isSoramadoActive以外はlocalStorage保存)
    soraSensorKey: 'fullframe',
    soraAspectW: 3,
    soraAspectH: 2,
    soraFocal: 35,
    soraFNumberIdx: 10,   // F_NUMBERS のインデックス (10 = 2.8)
    soraFocusDist: 1000,
    soraFisheye: false,
    soraPeaking: false,   // フォーカスピーキング(デッサン38段目: 初期値オフ)
    soraGrayscale: true,
    soraBaseAz: 0,
    soraBaseAlt: 0,
    soraOffsetAz: 0,
    soraOffsetAlt: 0,
    soraViewRange: 10,
    soraTraj: true,
    soraCenterCross: true,
    soraTargetCross: true,       // 目的点(+)マーカーの表示
    soraSearchCenter: true,      // 検索中心(×)マーカー(検索中心オプションが線なら目的点→オフセット点の線も)の表示
    soraOrient: 'landscape',     // カメラ位置: 'landscape'=横位置 / 'portrait'=縦位置(アスペクトを回転)
    soraFisheyeStrength: 50,     // フィッシュアイの歪み(%) 0〜100 (50=従来の見た目)
    soraFisheyeShape: 'rect',    // フィッシュアイの画面形状: 'rect'=四角 / 'circle'=円形
    soraPanorama: false,         // パノラマ撮影モード(アスペクト比可変・水平画角0〜360°)
    soraPanoAov: 0,              // パノラマの水平画角(°) 0=レンズの水平画角(自動追従) / 1〜360=指定値
    soraMovInterval: 15,         // インターバルMov: 撮影間隔(秒) 0.5〜86400
    soraMovShots: 1,             // インターバルMov: 撮影回数 1〜99999
    soraMovFps: 30,              // インターバルMov: フレームレート 24/25/30/50/60
    soraMovDispStep: 0.3,        // インターバルMov: 表示間隔(秒) 0.12/0.24/0.25/0.3/0.5/0.6/1
    soraMovImgMb: 140,           // インターバルMov: 画像サイズ(MB) 1〜102400
    soraMovPlayMode: 'anim',     // 再生オプション: 'anim'=表示間隔サンプリングのアニメ / 'video'=MP4/WebM生成→動画再生
    soraMwBrightness: 100,       // 天の川写真の明るさ(%) 0〜100 (黒レベル持ち上げ: 白は保ち暗色から先に沈む)
    soraElevShade: 50,           // 標高ヒルシェード適用度(%) 0〜100 (50=従来の見た目)
    soraSunShade: 50,            // 太陽光ヒルシェード適用度(%) 0〜100 (50=従来の見た目)
    soraExpFormat: 'jpeg',       // 書き出し形式: 'jpeg'/'png'(静止画) / 'h264'(動画MP4)/'webm'(動画WebM)
    soraExpW: 300,               // 書き出し画像サイズ 横(px) 1〜8192 (縦とアスペクト連動)
    soraExpH: 200,               // 書き出し画像サイズ 縦(px) 1〜8192
    soraLabelScale: 100,         // 表示天体名・星座名称の文字サイズ(%) 0〜1000 (プレビュー基準100)

    // 基本オプション (全てlocalStorage保存)
    baseOptMwBase: 'center',     // 天の川の基準点: 'center'=中心座標(いて座付近) / 'offset'=オフセット点
    mwOffsetAngle: 0,            // オフセット中心角(°) -360〜+360。基本オプションと辻検索メニューで連動
    mwShowBodies: true,          // 全天儀: 表示天体(天の川の写真・環・マーカー等)の表示
    mwShowBodyNames: true,       // 全天儀の表示天体名+引き出し線、宙の窓プレビューの表示天体名の表示
    mwShowConstFig: false,       // 全天儀: 星座線の表示
    mwShowConstBounds: false,    // 全天儀: 星座領域の表示
    mwShowConstNames: false,     // 全天儀: 星座名称の表示
    mwConstNameSort: 'aiueo',    // 星座名称の表示順: 'aiueo'=50音順(左上から右下へ) / 'pos'=座標順(天頂+90°→-90°)
    elevExcludeRadius: 0,        // 標高グラフ: 目的点の半径○m以内は可視判定のNGを無視 (0〜10000)

    // 辻検索パラメータ (全てlocalStorage保存)
    tsujiSearchBaseAz: 0,
    tsujiSearchOffsetAz: 0,
    tsujiSearchToleranceAz: 15,
    tsujiSearchBaseAlt: 0,
    tsujiSearchOffsetAlt: 0,
    tsujiSearchToleranceAlt: 15,
    tsujiSearchDays: 365,
    tsujiCenterMode: 'point',    // 検索中心オプション: 'point'=オフセット点 / 'line'=基準点からオフセット点までの線

    // 辻検索: 月齢フィルタ
    tsujiMoonFilterEnabled: false,
    tsujiMoonBase: 14.8,
    tsujiMoonTolerance: 2,

    // 精度フィルタ
    tsujiAccuracyFilterEnabled: false,
    tsujiAccDblCircle: false,
    tsujiAccCircle: false,
    tsujiAccTriangle: false,
    tsujiAccDash: false,

    // 標高オプション
    tsujiElevationOption: false,
    // 辻メッシュ検索パラメータ (全てlocalStorage保存。isTsujiMeshActiveのみセッション/URL)
    tsujiMeshDays: 365,
    tsujiMeshBaseAz: 0, tsujiMeshOffsetAz: 0, tsujiMeshToleranceAz: 15,
    tsujiMeshBaseAlt: 0, tsujiMeshOffsetAlt: 0, tsujiMeshToleranceAlt: 15,
    tsujiMeshCenterMode: 'point',   // 検索中心オプション: 'point'|'line'
    tsujiMeshAccuracy: 'x1',        // 精度フィルタ: 'x1'=◎(±0.125) 'x2'(±0.0625) 'x4'(±0.03125) 'x8'(±0.015625)
    tsujiMeshMoonFilterEnabled: false, tsujiMeshMoonBase: 14.8, tsujiMeshMoonTolerance: 2,
    tsujiMeshTimeFilter: false,
    tsujiMeshStartMode: 'sunset', tsujiMeshStartTime: '00:00', tsujiMeshStartPrePost: false, tsujiMeshStartPrePostDir: 'before', tsujiMeshStartOffset: '00:00',
    tsujiMeshEndMode: 'sunrise', tsujiMeshEndTime: '00:00', tsujiMeshEndPrePost: false, tsujiMeshEndPrePostDir: 'before', tsujiMeshEndOffset: '00:00',
    tsujiMeshSymO: true, tsujiMeshSymTri: true, tsujiMeshSymDash: true,   // 精度フィルタ(◎は常時オン・○△-の表示可否。初期値オン)
    tsujiMeshElevationOption: false, tsujiMeshElevOK: false, tsujiMeshElevNG: false,
    isTsujiMeshActive: false,       // 辻メッシュ検索パネルの表示状態(セッションのみ・URL復元)
    tsujiElevOK: false,
    tsujiElevNG: false,

    // 時間フィルタ
    tsujiTimeFilter: false,
    tsujiStartMode: 'sunset', tsujiStartTime: '00:00', tsujiStartPrePost: false, tsujiStartPrePostDir: 'before', tsujiStartOffset: '00:00',
    tsujiEndMode: 'sunrise', tsujiEndTime: '00:00', tsujiEndPrePost: false, tsujiEndPrePostDir: 'before', tsujiEndOffset: '00:00',

    // 月齢 (計算値、appStateで管理)
    moonAge: 0,

    // 内部制御用 (保存不要)
    timers: { move: null, fetch: null },
    elevationData: { points: [], index: 0 },
    tsujiSearchGeneration: 0,
    riseSetCache: {}
};

/** API標高とユーザー高さから内部計算用elevを再計算 */
function recalcElev(type) {
    if (type === 'start') {
        appState.start.elev = appState.startApiElev + appState.startHeight;
    } else {
        appState.end.elev = appState.endApiElev + appState.endHeight;
    }
}

let visitorData = null;
let editingBodyId = null;
let currentRiseSetData = {};


// ============================================================
// 3. 初期化プロセス
// ============================================================

window.onload = function() {
    console.log("宙の辻: 起動 (v1.20.1)");
    
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

    // 2.5. URLパラメータからの復元（LocalStorageより優先）
    restoreFromUrl();

    // 3. 地図初期化
    initMap();

    // 4. UI構築
    setupUI();

    // 5. 初期状態反映
    if (appState.isDPActive) {
        document.getElementById('btn-dp').classList.add('active');
    }
    if (appState.isDP365Active) {
        document.getElementById('btn-dp365').classList.add('active');
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

    // 位置情報: 観測点/目的点モードのlocalStorage復元値をセット
    document.getElementById(appState.locMode === 'end' ? 'radio-end' : 'radio-start').checked = true;

    // 辻検索: ①〜⑥+検索期間のlocalStorage復元値をセット
    document.getElementById('input-tsuji-az').value = appState.tsujiSearchBaseAz;
    document.getElementById('input-tsuji-az-offset').value = appState.tsujiSearchOffsetAz;
    document.getElementById('input-tsuji-az-tolerance').value = appState.tsujiSearchToleranceAz;
    document.getElementById('input-tsuji-alt').value = appState.tsujiSearchBaseAlt;
    document.getElementById('input-tsuji-alt-offset').value = appState.tsujiSearchOffsetAlt;
    document.getElementById('input-tsuji-alt-tolerance').value = appState.tsujiSearchToleranceAlt;
    document.getElementById('input-tsuji-search-days').value = appState.tsujiSearchDays;
    const tcmR = document.querySelector(`input[name="tsuji-center-mode"][value="${appState.tsujiCenterMode}"]`);
    if (tcmR) tcmR.checked = true;
    document.getElementById('chk-tsuji-moon-filter').checked = appState.tsujiMoonFilterEnabled;
    document.getElementById('input-tsuji-moon-base').value = appState.tsujiMoonBase;
    document.getElementById('input-tsuji-moon-tolerance').value = appState.tsujiMoonTolerance;
    document.getElementById('chk-tsuji-accuracy-filter').checked = appState.tsujiAccuracyFilterEnabled;
    document.getElementById('chk-tsuji-acc-dbl-circle').checked = appState.tsujiAccDblCircle;
    document.getElementById('chk-tsuji-acc-circle').checked = appState.tsujiAccCircle;
    document.getElementById('chk-tsuji-acc-triangle').checked = appState.tsujiAccTriangle;
    document.getElementById('chk-tsuji-acc-dash').checked = appState.tsujiAccDash;
    document.getElementById('chk-tsuji-elev-option').checked = appState.tsujiElevationOption;
    document.getElementById('chk-tsuji-elev-ok').checked = appState.tsujiElevOK;
    document.getElementById('chk-tsuji-elev-ng').checked = appState.tsujiElevNG;
    // 辻メッシュ検索: localStorage復元値をセット
    document.getElementById('input-tsujimesh-days').value = appState.tsujiMeshDays;
    document.getElementById('input-tsujimesh-az').value = appState.tsujiMeshBaseAz;
    document.getElementById('input-tsujimesh-alt').value = appState.tsujiMeshBaseAlt;
    document.getElementById('input-tsujimesh-az-tolerance').value = appState.tsujiMeshToleranceAz;
    document.getElementById('input-tsujimesh-alt-tolerance').value = appState.tsujiMeshToleranceAlt;
    const tmcmR = document.querySelector(`input[name="tsujimesh-center-mode"][value="${appState.tsujiMeshCenterMode}"]`);
    if (tmcmR) tmcmR.checked = true;
    const tmaR = document.querySelector(`input[name="tsujimesh-accuracy"][value="${appState.tsujiMeshAccuracy}"]`);
    if (tmaR) tmaR.checked = true;
    document.getElementById('input-tsujimesh-mw-offset').value = appState.mwOffsetAngle;
    document.getElementById('chk-tsujimesh-moon-filter').checked = appState.tsujiMeshMoonFilterEnabled;
    document.getElementById('input-tsujimesh-moon-base').value = appState.tsujiMeshMoonBase;
    document.getElementById('input-tsujimesh-moon-tolerance').value = appState.tsujiMeshMoonTolerance;
    document.getElementById('chk-tsujimesh-elev-option').checked = appState.tsujiMeshElevationOption;
    document.getElementById('chk-tsujimesh-sym-maru').checked = appState.tsujiMeshSymO;
    document.getElementById('chk-tsujimesh-sym-tri').checked = appState.tsujiMeshSymTri;
    document.getElementById('chk-tsujimesh-sym-dash').checked = appState.tsujiMeshSymDash;
    document.getElementById('chk-tsujimesh-elev-ok').checked = appState.tsujiMeshElevOK;
    document.getElementById('chk-tsujimesh-elev-ng').checked = appState.tsujiMeshElevNG;
    updateTsujiMeshMoonFilterUI();
    updateTsujiMeshElevationOptionUI();
    updateTsujiMeshOffsetDistances();
    updateTsujiAccuracyFilterUI();
    updateTsujiMoonFilterUI();
    updateTsujiElevationOptionUI();
    syncTsujiTimeFilter();
    updateOffsetDistances();

    // リストを生成
    syncMyStarsToBodies();
    renderCelestialList();
    renderMyStarsList();
    renderMyPointsList('obs');
    renderMyPointsList('tgt');
    renderMyTsujiSearches();

    // My観測点/My目的点マーカーを表示
    setTimeout(() => updateMyPointMarkers(), 460);

    // ツールチップ設定
    setupTooltips();

    // 起動時は「現在日時」にセット（URLパラメータからの復元がない場合のみ）
    if (appState._restoredFromUrl) {
        delete appState._restoredFromUrl;
        syncUIFromState();
        updateAll();
    } else {
        setNow();
    }

    // リサイズ対応
    window.addEventListener('resize', () => {
        if(appState.isElevationActive) {
            drawProfileGraph();
        }
        if(appState.isMilkyWayActive) {
            resizeMilkyWayGlobe();
        }
        if(appState.isSoramadoActive) {
            resizeSoramado();
        }
    });

    setTimeout(initVisitorCounter, 900);

    // URLパラメータで辻検索が指定されていた場合、自動実行
    if (appState._pendingTsujiSearch) {
        delete appState._pendingTsujiSearch;
        setTimeout(() => {
            // toggleTsujiSearchと同じ処理を実行
            appState.isTsujiSearchActive = true;
            const btn = document.getElementById('btn-tsuji-search');
            const pnl = document.getElementById('tsujisearch-panel');
            btn.classList.add('active');
            pnl.classList.remove('hidden');
            document.getElementById('tsujisearch-header').innerHTML = '辻検索結果 <span id="tsujisearch-status"></span>';
            syncBottomPanels();
            startTsujiSearch();
        }, 500);
    }

    // URLパラメータで辻メッシュ検索が指定されていた場合、自動実行
    if (appState._pendingTsujiMesh) {
        delete appState._pendingTsujiMesh;
        setTimeout(() => {
            if (!appState.isTsujiMeshActive) toggleTsujiMesh();
        }, 500);
    }

    // URL(プレビューモード)で下部パネルが指定されていた場合、UI準備後に開く(排他なので1つ)
    if (appState._pendingPanel) {
        const panel = appState._pendingPanel;
        delete appState._pendingPanel;
        setTimeout(() => {
            if (panel === 'elevation' && !appState.isElevationActive) toggleElevation();
            else if (panel === 'milkyway' && !appState.isMilkyWayActive) toggleMilkyWayInstrument();
            else if (panel === 'soramado' && !appState.isSoramadoActive) toggleSoramado();
        }, 500);
    }
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

    // 地図パンボタン(◀▶/▲▼): ドラッグせずに半画面ずつスクロールできる(左上・ズームコントロールの下)
    const panControl = L.control({ position: 'topleft' });
    panControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'map-pan-control');
        div.innerHTML =
            '<div class="leaflet-bar map-pan-h">' +
            '<a href="#" id="map-pan-left" title="地図を左へ移動(半画面)">◀</a>' +
            '<a href="#" id="map-pan-right" title="地図を右へ移動(半画面)">▶</a></div>' +
            '<div class="leaflet-bar map-pan-v">' +
            '<a href="#" id="map-pan-up" title="地図を上へ移動(半画面)">▲</a>' +
            '<a href="#" id="map-pan-down" title="地図を下へ移動(半画面)">▼</a></div>';
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.on(div, 'dblclick', L.DomEvent.stopPropagation);
        const pan = (dx, dy) => {
            const s = map.getSize();
            map.panBy([dx * s.x / 2, dy * s.y / 2]);
        };
        [['map-pan-left', -1, 0], ['map-pan-right', 1, 0], ['map-pan-up', 0, -1], ['map-pan-down', 0, 1]].forEach(([id, dx, dy]) => {
            L.DomEvent.on(div.querySelector('#' + id), 'click', (ev) => { L.DomEvent.preventDefault(ev); pan(dx, dy); });
        });
        return div;
    };
    panControl.addTo(map);

    linesLayer = L.layerGroup().addTo(map);
    locationLayer = L.layerGroup().addTo(map);
    dpLayer = L.layerGroup().addTo(map);

    map.on('click', onMapClick);
    // PC/スマホとも、ドラッグ/スクロール中の誤クリック(誤タップ)で観測点が動かないよう、
    // 観測点/目的点の移動はダブルクリック(ダブルタップ)で行う(ダブルクリックズームは無効化)
    map.doubleClickZoom.disable();
    map.on('dblclick', onMapDblClick);
    map.on('mousemove', (e) => handleTsujiMeshGoldHover(e.latlng));   // 辻メッシュ金色オーバーレイのツールチップ
}


// ============================================================
// 4. UIイベント設定
// ============================================================

function setupUI() {
    // 全テキストボックスのautocomplete無効化 (ブラウザのフォーム復元を防止)
    document.querySelectorAll('input').forEach(el => el.setAttribute('autocomplete', 'off'));
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
        // スライダーで時刻を選んだ場合は秒を0にする（スライダーは分単位）
        tInput.value = `${('00' + h).slice(-2)}:${('00' + m).slice(-2)}:00`;
        syncStateFromUI();
        updateAll();
    });

    tInput.addEventListener('input', () => {
        uncheckTimeShortcuts();
        if (!tInput.value) return;
        const parts = tInput.value.split(':').map(Number);
        const h = parts[0], m = parts[1];
        if (!isNaN(h) && !isNaN(m)) {
            tSlider.value = h * 60 + m;  // スライダーは分単位（秒は反映しない）
            syncStateFromUI();
            updateAll();
        }
    });

    // 月齢入力
    document.getElementById('moon-age-input').addEventListener('change', (e) => {
        const targetAge = parseFloat(e.target.value);
        if (isNaN(targetAge)) {
            // 空欄時は計算値を復元
            e.target.value = appState.moonAge;
            return;
        }
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
    document.getElementById('btn-milkyway').onclick = toggleMilkyWayInstrument;
    document.getElementById('btn-soramado').onclick = toggleSoramado;
    setupSoramadoControls();
    setupBaseOptionControls();
    document.getElementById('btn-dp').onclick = toggleDP;
    document.getElementById('btn-dp365').onclick = toggleDP365;
    document.getElementById('btn-move-peak').onclick = moveToNearestPeak;
    document.getElementById('btn-tsuji-search').onclick = toggleTsujiSearch;
    document.getElementById('btn-tsujimesh').onclick = toggleTsujiMesh;
    setupTsujiMeshPanelControls();

    // 位置情報: 観測点/目的点モードの変更をlocalStorage保存
    document.querySelectorAll('input[name="loc-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            appState.locMode = e.target.value;
            saveAppState();
        });
    });

    // 辻検索: ①〜⑥+検索期間の変更をlocalStorage保存
    document.getElementById('input-tsuji-az').addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) appState.tsujiSearchBaseAz = val;
        e.target.value = appState.tsujiSearchBaseAz;
        saveAppState();
    });
    document.getElementById('input-tsuji-az-offset').addEventListener('change', (e) => {
        appState.tsujiSearchOffsetAz = parseFloat(e.target.value) || 0;
        e.target.value = appState.tsujiSearchOffsetAz;
        saveAppState();
        updateOffsetDistances();
        if (appState.isSoramadoActive && !_smFailed) drawSoramado();   // 検索中心(×)マーカーの追従
    });
    document.getElementById('input-tsuji-az-tolerance').addEventListener('change', (e) => {
        appState.tsujiSearchToleranceAz = parseFloat(e.target.value) || 15;
        e.target.value = appState.tsujiSearchToleranceAz;
        saveAppState();
    });
    document.getElementById('input-tsuji-alt').addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) appState.tsujiSearchBaseAlt = val;
        e.target.value = appState.tsujiSearchBaseAlt;
        saveAppState();
    });
    document.getElementById('input-tsuji-alt-offset').addEventListener('change', (e) => {
        appState.tsujiSearchOffsetAlt = parseFloat(e.target.value) || 0;
        e.target.value = appState.tsujiSearchOffsetAlt;
        saveAppState();
        updateOffsetDistances();
        if (appState.isSoramadoActive && !_smFailed) drawSoramado();   // 検索中心(×)マーカーの追従
    });
    // 宙の窓メニュー/コントロールメニューの辻オフセット方位角・視高度(辻検索メニューと連動)
    [['input-sora-tsuji-az-offset', 'tsujiSearchOffsetAz'], ['input-sora-ctrl-tsuji-az-offset', 'tsujiSearchOffsetAz'],
     ['input-sora-tsuji-alt-offset', 'tsujiSearchOffsetAlt'], ['input-sora-ctrl-tsuji-alt-offset', 'tsujiSearchOffsetAlt']].forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', (e) => {
            appState[key] = Math.max(-360, Math.min(360, parseFloat(e.target.value) || 0));
            e.target.value = appState[key];
            saveAppState();
            updateOffsetDistances();
            if (appState.isSoramadoActive && !_smFailed) drawSoramado();   // 検索中心(×)マーカーの追従
        });
    });
    document.getElementById('input-tsuji-alt-tolerance').addEventListener('change', (e) => {
        appState.tsujiSearchToleranceAlt = parseFloat(e.target.value) || 15;
        e.target.value = appState.tsujiSearchToleranceAlt;
        saveAppState();
    });
    document.getElementById('input-tsuji-search-days').addEventListener('change', (e) => {
        // step=365, min=0 だが、内部値は最小1に正規化 (0日検索は無効)
        let v = parseInt(e.target.value);
        if (isNaN(v)) v = 365;
        appState.tsujiSearchDays = Math.min(Math.max(v, 1), 36500);
        e.target.value = appState.tsujiSearchDays;
        saveAppState();
    });
    // 検索中心オプション(点/線)
    document.querySelectorAll('input[name="tsuji-center-mode"]').forEach(r => {
        r.addEventListener('change', () => { if (r.checked) { appState.tsujiCenterMode = r.value; saveAppState(); if (appState.isSoramadoActive && !_smFailed) drawSoramado(); } });   // 検索中心(×)の線表示の切替
    });
    // 月齢フィルタ
    document.getElementById('chk-tsuji-moon-filter').addEventListener('change', (e) => {
        appState.tsujiMoonFilterEnabled = e.target.checked;
        updateTsujiMoonFilterUI();
        saveAppState();
    });
    document.getElementById('input-tsuji-moon-base').addEventListener('change', (e) => {
        appState.tsujiMoonBase = Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 30);
        e.target.value = appState.tsujiMoonBase;
        saveAppState();
    });
    document.getElementById('input-tsuji-moon-tolerance').addEventListener('change', (e) => {
        appState.tsujiMoonTolerance = Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 15);
        e.target.value = appState.tsujiMoonTolerance;
        saveAppState();
    });
    // 精度フィルタ
    document.getElementById('chk-tsuji-accuracy-filter').addEventListener('change', (e) => {
        appState.tsujiAccuracyFilterEnabled = e.target.checked;
        updateTsujiAccuracyFilterUI();
        saveAppState();
    });
    ['dbl-circle', 'circle', 'triangle', 'dash'].forEach(key => {
        const propMap = { 'dbl-circle': 'tsujiAccDblCircle', 'circle': 'tsujiAccCircle', 'triangle': 'tsujiAccTriangle', 'dash': 'tsujiAccDash' };
        document.getElementById(`chk-tsuji-acc-${key}`).addEventListener('change', (e) => {
            appState[propMap[key]] = e.target.checked;
            saveAppState();
        });
    });
    // 標高オプション
    document.getElementById('chk-tsuji-elev-option').addEventListener('change', (e) => {
        appState.tsujiElevationOption = e.target.checked;
        updateTsujiElevationOptionUI();
        saveAppState();
    });
    document.getElementById('chk-tsuji-elev-ok').addEventListener('change', (e) => {
        appState.tsujiElevOK = e.target.checked;
        saveAppState();
    });
    document.getElementById('chk-tsuji-elev-ng').addEventListener('change', (e) => {
        appState.tsujiElevNG = e.target.checked;
        saveAppState();
    });
    // 時間フィルタ: グループHTMLを生成してから各種ハンドラを登録
    const tfContainer = document.getElementById('tsuji-time-filter-groups');
    if (tfContainer) {
        tfContainer.innerHTML = buildTsujiTimeGroupHtml('start') + buildTsujiTimeGroupHtml('end');
        document.getElementById('chk-tsuji-time-filter').addEventListener('change', (e) => {
            appState.tsujiTimeFilter = e.target.checked;
            updateTsujiTimeFilterUI();
            saveAppState();
        });
        ['start', 'end'].forEach(group => {
            const G = group === 'start' ? 'Start' : 'End';
            document.querySelectorAll(`input[name="tsuji-${group}-mode"]`).forEach(r => {
                r.addEventListener('change', (e) => { appState['tsuji' + G + 'Mode'] = e.target.value; saveAppState(); });
            });
            document.getElementById(`input-tsuji-${group}-time`).addEventListener('change', (e) => { appState['tsuji' + G + 'Time'] = e.target.value; saveAppState(); });
            document.getElementById(`chk-tsuji-${group}-prepost`).addEventListener('change', (e) => { appState['tsuji' + G + 'PrePost'] = e.target.checked; updateTsujiTimeFilterUI(); saveAppState(); });
            document.querySelectorAll(`input[name="tsuji-${group}-prepost-dir"]`).forEach(r => {
                r.addEventListener('change', (e) => { appState['tsuji' + G + 'PrePostDir'] = e.target.value; saveAppState(); });
            });
            document.getElementById(`input-tsuji-${group}-offset`).addEventListener('change', (e) => { appState['tsuji' + G + 'Offset'] = e.target.value; saveAppState(); });
        });
    }

    // 辻メッシュ検索: メニューの変更をlocalStorage保存
    document.getElementById('input-tsujimesh-days').addEventListener('change', (e) => {
        let v = parseInt(e.target.value);
        if (isNaN(v)) v = 365;
        appState.tsujiMeshDays = Math.min(Math.max(v, 1), 36500);
        e.target.value = appState.tsujiMeshDays;
        saveAppState();
    });
    document.getElementById('input-tsujimesh-az').addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) appState.tsujiMeshBaseAz = val;
        e.target.value = appState.tsujiMeshBaseAz;
        saveAppState();
        updateTsujiMeshOffsetDistances();
    });
    document.getElementById('input-tsujimesh-alt').addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) appState.tsujiMeshBaseAlt = val;
        e.target.value = appState.tsujiMeshBaseAlt;
        saveAppState();
        updateTsujiMeshOffsetDistances();
    });
    [['input-tsujimesh-az-offset', 'tsujiMeshOffsetAz'], ['input-tsujimesh-alt-offset', 'tsujiMeshOffsetAlt']].forEach(([id, key]) => {
        document.getElementById(id).addEventListener('change', (e) => {
            appState[key] = Math.max(-360, Math.min(360, parseFloat(e.target.value) || 0));
            e.target.value = appState[key];
            saveAppState();
            updateTsujiMeshOffsetDistances();
        });
    });
    [['input-tsujimesh-az-tolerance', 'tsujiMeshToleranceAz'], ['input-tsujimesh-alt-tolerance', 'tsujiMeshToleranceAlt']].forEach(([id, key]) => {
        document.getElementById(id).addEventListener('change', (e) => {
            appState[key] = parseFloat(e.target.value) || 15;
            e.target.value = appState[key];
            saveAppState();
        });
    });
    document.querySelectorAll('input[name="tsujimesh-center-mode"]').forEach(r => {
        r.addEventListener('change', () => { if (r.checked) { appState.tsujiMeshCenterMode = r.value; saveAppState(); } });
    });
    document.querySelectorAll('input[name="tsujimesh-accuracy"]').forEach(r => {
        r.addEventListener('change', () => { if (r.checked) { appState.tsujiMeshAccuracy = r.value; saveAppState(); } });
    });
    document.getElementById('chk-tsujimesh-moon-filter').addEventListener('change', (e) => {
        appState.tsujiMeshMoonFilterEnabled = e.target.checked;
        updateTsujiMeshMoonFilterUI();
        saveAppState();
    });
    document.getElementById('input-tsujimesh-moon-base').addEventListener('change', (e) => {
        appState.tsujiMeshMoonBase = Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 30);
        e.target.value = appState.tsujiMeshMoonBase;
        saveAppState();
    });
    document.getElementById('input-tsujimesh-moon-tolerance').addEventListener('change', (e) => {
        appState.tsujiMeshMoonTolerance = Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 15);
        e.target.value = appState.tsujiMeshMoonTolerance;
        saveAppState();
    });
    document.getElementById('chk-tsujimesh-elev-option').addEventListener('change', (e) => {
        appState.tsujiMeshElevationOption = e.target.checked;
        updateTsujiMeshElevationOptionUI();
        saveAppState();
    });
    [['chk-tsujimesh-sym-maru', 'tsujiMeshSymO'], ['chk-tsujimesh-sym-tri', 'tsujiMeshSymTri'], ['chk-tsujimesh-sym-dash', 'tsujiMeshSymDash']].forEach(([id, key]) => {
        document.getElementById(id).addEventListener('change', (e) => {
            appState[key] = e.target.checked;
            saveAppState();
        });
    });
    document.getElementById('chk-tsujimesh-elev-ok').addEventListener('change', (e) => {
        appState.tsujiMeshElevOK = e.target.checked;
        saveAppState();
    });
    document.getElementById('chk-tsujimesh-elev-ng').addEventListener('change', (e) => {
        appState.tsujiMeshElevNG = e.target.checked;
        saveAppState();
    });
    // 辻メッシュ: 時間フィルタ(グループHTML生成+結線)
    const tmfContainer = document.getElementById('tsujimesh-time-filter-groups');
    if (tmfContainer) {
        tmfContainer.innerHTML = buildTimeGroupHtmlFor('tsujimesh', 'tsujiMesh', 'start') + buildTimeGroupHtmlFor('tsujimesh', 'tsujiMesh', 'end');
        document.getElementById('chk-tsujimesh-time-filter').addEventListener('change', (e) => {
            appState.tsujiMeshTimeFilter = e.target.checked;
            updateTsujiMeshTimeFilterUI();
            saveAppState();
        });
        ['start', 'end'].forEach(group => {
            const G = group === 'start' ? 'Start' : 'End';
            document.querySelectorAll(`input[name="tsujimesh-${group}-mode"]`).forEach(r => {
                r.addEventListener('change', (e) => { appState['tsujiMesh' + G + 'Mode'] = e.target.value; saveAppState(); });
            });
            document.getElementById(`input-tsujimesh-${group}-time`).addEventListener('change', (e) => { appState['tsujiMesh' + G + 'Time'] = e.target.value; saveAppState(); });
            document.getElementById(`chk-tsujimesh-${group}-prepost`).addEventListener('change', (e) => { appState['tsujiMesh' + G + 'PrePost'] = e.target.checked; updateTsujiMeshTimeFilterUI(); saveAppState(); });
            document.querySelectorAll(`input[name="tsujimesh-${group}-prepost-dir"]`).forEach(r => {
                r.addEventListener('change', (e) => { appState['tsujiMesh' + G + 'PrePostDir'] = e.target.value; saveAppState(); });
            });
            document.getElementById(`input-tsujimesh-${group}-offset`).addEventListener('change', (e) => { appState['tsujiMesh' + G + 'Offset'] = e.target.value; saveAppState(); });
        });
        syncTsujiMeshTimeFilter();
    }
    document.getElementById('btn-url-tsujimesh').onclick = () => toggleUrlPanel('tsujimesh');

    // 登録ボタン
    document.getElementById('btn-reg-start').onclick = () => registerLocation('start');
    document.getElementById('btn-reg-end').onclick = () => registerLocation('end');

    // URL取得ボタン: ポップアップダイアログ表示
    document.getElementById('btn-url-location').onclick = () => toggleUrlPanel('location');
    document.getElementById('btn-url-tsuji').onclick = () => toggleUrlPanel('tsuji');
    // URL取得ダイアログ: 項目クリック
    document.getElementById('url-picker-fixed').addEventListener('click', () => {
        const mode = urlPickerMode;
        closeUrlPicker();
        if (mode === 'location') copyLocationUrl('fixed');
        else if (mode === 'tsuji') copyTsujiSearchUrl('fixed');
        else if (mode === 'mytsuji') copyMyTsujiSearchUrl('fixed');
        else if (mode === 'soramado') copySoramadoUrl('fixed');
        else if (mode === 'tsujimesh') copyTsujiMeshUrl('fixed');
    });
    document.getElementById('url-picker-semi-fixed').addEventListener('click', () => {
        const mode = urlPickerMode;
        closeUrlPicker();
        if (mode === 'location') copyLocationUrl('semi-fixed');
        else if (mode === 'tsuji') copyTsujiSearchUrl('semi-fixed');
        else if (mode === 'mytsuji') copyMyTsujiSearchUrl('semi-fixed');
        else if (mode === 'soramado') copySoramadoUrl('semi-fixed');
        else if (mode === 'tsujimesh') copyTsujiMeshUrl('semi-fixed');
    });
    document.getElementById('url-picker-access').addEventListener('click', () => {
        const mode = urlPickerMode;
        closeUrlPicker();
        if (mode === 'location') copyLocationUrl(false);
        else if (mode === 'tsuji') copyTsujiSearchUrl(false);
        else if (mode === 'mytsuji') copyMyTsujiSearchUrl(false);
        else if (mode === 'soramado') copySoramadoUrl(false);
        else if (mode === 'tsujimesh') copyTsujiMeshUrl(false);
    });

    // 座標入力 (changeイベント)
    const iStart = document.getElementById('input-start-latlng');
    const iEnd = document.getElementById('input-end-latlng');
    iStart.addEventListener('change', () => handleLocationInput(iStart.value, true));
    iEnd.addEventListener('change', () => handleLocationInput(iEnd.value, false));

    // 標高入力（ユーザーが手動で上書き可能。地図クリック等でAPI取得値に上書きされる）
    document.getElementById('input-start-api-elev').addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) appState.startApiElev = val;
        e.target.value = appState.startApiElev;
        recalcElev('start');
        saveAppState();
        updateAll();
    });
    document.getElementById('input-end-api-elev').addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) appState.endApiElev = val;
        e.target.value = appState.endApiElev;
        recalcElev('end');
        saveAppState();
        updateAll();
    });

    // 高さ入力（ユーザー入力の追加高さ）
    document.getElementById('input-start-elev').addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) appState.startHeight = val;
        e.target.value = appState.startHeight;
        recalcElev('start');
        saveAppState();
        updateAll();
    });
    document.getElementById('input-end-elev').addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) appState.endHeight = val;
        e.target.value = appState.endHeight;
        recalcElev('end');
        saveAppState();
        updateAll();
    });

    // My天体操作ボタン
    document.getElementById('btn-mystars-up').onclick = moveMyStarUp;
    document.getElementById('btn-mystars-down').onclick = moveMyStarDown;
    document.getElementById('btn-mystars-delete').onclick = deleteMyStar;
    document.getElementById('btn-mystars-csv-import').onclick = importMyStarsCsv;
    document.getElementById('btn-mystars-csv-append').onclick = appendMyStarsCsv;
    document.getElementById('btn-mystars-csv-export').onclick = exportMyStarsCsv;

    // My観測点ボタン
    document.getElementById('btn-myobs-apply').onclick = () => applyMyPoint('obs');
    document.getElementById('btn-myobs-get').onclick = () => getMyPointFromLocation('obs');
    document.getElementById('btn-myobs-regall').onclick = () => registerAllMyPoints('obs');
    document.getElementById('btn-myobs-up').onclick = () => moveMyPointUp('obs');
    document.getElementById('btn-myobs-down').onclick = () => moveMyPointDown('obs');
    document.getElementById('btn-myobs-addrow').onclick = () => addMyPointRow('obs');
    document.getElementById('btn-myobs-delrow').onclick = () => deleteMyPointRow('obs');
    document.getElementById('btn-myobs-csv-import').onclick = () => importMyPointsCsv('obs');
    document.getElementById('btn-myobs-csv-append').onclick = () => appendMyPointsCsv('obs');
    document.getElementById('btn-myobs-csv-export').onclick = () => exportMyPointsCsv('obs');
    document.getElementById('btn-myobs-url').onclick = () => getMyPointUrl('obs');

    // My目的点ボタン
    document.getElementById('btn-mytgt-apply').onclick = () => applyMyPoint('tgt');
    document.getElementById('btn-mytgt-get').onclick = () => getMyPointFromLocation('tgt');
    document.getElementById('btn-mytgt-regall').onclick = () => registerAllMyPoints('tgt');
    document.getElementById('btn-mytgt-up').onclick = () => moveMyPointUp('tgt');
    document.getElementById('btn-mytgt-down').onclick = () => moveMyPointDown('tgt');
    document.getElementById('btn-mytgt-addrow').onclick = () => addMyPointRow('tgt');
    document.getElementById('btn-mytgt-delrow').onclick = () => deleteMyPointRow('tgt');
    document.getElementById('btn-mytgt-csv-import').onclick = () => importMyPointsCsv('tgt');
    document.getElementById('btn-mytgt-csv-append').onclick = () => appendMyPointsCsv('tgt');
    document.getElementById('btn-mytgt-csv-export').onclick = () => exportMyPointsCsv('tgt');
    document.getElementById('btn-mytgt-url').onclick = () => getMyPointUrl('tgt');

    // My辻検索ボタン (Phase A-3)
    document.getElementById('btn-mytsuji-toggle-all').onclick = toggleAllMyTsuji;
    document.getElementById('btn-mytsuji-get').onclick = getMyTsujiFromTsujiSearch;
    document.getElementById('btn-mytsuji-regall').onclick = registerAllMyTsuji;
    document.getElementById('btn-mytsuji-up').onclick = moveMyTsujiUp;
    document.getElementById('btn-mytsuji-down').onclick = moveMyTsujiDown;
    document.getElementById('btn-mytsuji-addrow').onclick = addMyTsujiRow;
    document.getElementById('btn-mytsuji-delrow').onclick = deleteMyTsujiRow;
    // CSV (Phase B)
    document.getElementById('btn-mytsuji-csv-import').onclick = importMyTsujiCsv;
    document.getElementById('btn-mytsuji-csv-append').onclick = appendMyTsujiCsv;
    document.getElementById('btn-mytsuji-csv-export').onclick = exportMyTsujiCsv;
    document.getElementById('btn-mytsuji-url').onclick = getMyTsujiUrl;
    // batch (Phase C-2/C-3) — 結果は辻検索パネルを再利用
    // 一括計算とFile取得は排他: 一方を押下すると他方がキャンセル
    document.getElementById('btn-mytsuji-batch').onclick = async () => {
        if (myTsujiBatchRunning) { myTsujiBatchCanceled = true; return; }
        if (myTsujiFileRunning) await forceCancelMyTsujiFile();
        runBatchMyTsujiSearch();
    };
    document.getElementById('btn-mytsuji-file').onclick = async () => {
        if (myTsujiFileRunning) { myTsujiFileCanceled = true; return; }
        if (myTsujiBatchRunning) await forceCancelMyTsujiBatch();
        fileBatchMyTsujiSearch();
    };


    // 天体検索ボタン
    document.getElementById('btn-starsearch').onclick = searchStars;
    document.getElementById('btn-starsearch-reg').onclick = registerSearchStar;

    // バックアップ / インポート
    document.getElementById('btn-backup').onclick = exportBackup;
    document.getElementById('btn-import').onclick = importBackup;

    // --- ★追加: 気象パラメータ連動 ---
    const iK = document.getElementById('input-refraction-k');
    const iP = document.getElementById('input-meteo-p');
    const iT = document.getElementById('input-meteo-t');
    const iL = document.getElementById('input-meteo-l');
    const chkRefraction = document.getElementById('chk-refraction');
    const btnResetMeteo = document.getElementById('btn-reset-meteo');
    const btnRegSettings = document.getElementById('btn-reg-settings');

    // 気差フォームの有効/無効を切り替える関数
    // 気差係数(iK)はデッサン仕様により常に読み取り専用
    const setRefractionFormEnabled = (enabled) => {
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

}


// ============================================================
// 5. 設定の保存・読み込み (Single Storage Key)
// ============================================================

/** 全状態を保存 */
function saveAppState() {
    // 保存したいデータだけを抽出
    const stateToSave = {
        appSchema: APP_SCHEMA,   // localStorageスキーマ版数（将来のマイグレーション/診断用）
        start: appState.start,
        end: appState.end,
        homeStart: appState.homeStart, // 登録場所
        homeEnd: appState.homeEnd,     // 登録場所
        bodies: appState.bodies.filter(b => !b.isCustom),
        myStars: appState.myStars,
        myObservations: appState.myObservations,
        myTargets: appState.myTargets,
        myTsujiSearches: appState.myTsujiSearches,
        meteo: appState.meteo, //気象パラメータのみ保存(Kはmeteoから再計算)
        refractionEnabled: appState.refractionEnabled,
        isDPActive: appState.isDPActive,
        // isDP365Active は意図的に保存しない:
        // - 365日計算はキャッシュ無効化(位置/日付変更)を伴うため起動時のキャッシュ復元が困難
        // - 重い計算を起動時にユーザーの意図なしに走らせない
        // - 起動時は常にOFFで、ユーザーがボタン押下時のみ計算開始
        locMode: appState.locMode,
        lastVisitDate: appState.lastVisitDate,
        // 辻検索パラメータ (①〜⑥+検索期間)
        tsujiSearchBaseAz: appState.tsujiSearchBaseAz,
        tsujiSearchOffsetAz: appState.tsujiSearchOffsetAz,
        tsujiSearchToleranceAz: appState.tsujiSearchToleranceAz,
        tsujiSearchBaseAlt: appState.tsujiSearchBaseAlt,
        tsujiSearchOffsetAlt: appState.tsujiSearchOffsetAlt,
        tsujiSearchToleranceAlt: appState.tsujiSearchToleranceAlt,
        tsujiSearchDays: appState.tsujiSearchDays,
        tsujiCenterMode: appState.tsujiCenterMode,
        baseOptMwBase: appState.baseOptMwBase, mwOffsetAngle: appState.mwOffsetAngle,
        mwShowBodies: appState.mwShowBodies, mwShowBodyNames: appState.mwShowBodyNames, mwShowConstFig: appState.mwShowConstFig,
        mwShowConstBounds: appState.mwShowConstBounds, mwShowConstNames: appState.mwShowConstNames,
        mwConstNameSort: appState.mwConstNameSort,
        elevExcludeRadius: appState.elevExcludeRadius,
        tsujiMoonFilterEnabled: appState.tsujiMoonFilterEnabled,
        tsujiMoonBase: appState.tsujiMoonBase,
        tsujiMoonTolerance: appState.tsujiMoonTolerance,
        tsujiAccuracyFilterEnabled: appState.tsujiAccuracyFilterEnabled,
        tsujiAccDblCircle: appState.tsujiAccDblCircle,
        tsujiAccCircle: appState.tsujiAccCircle,
        tsujiAccTriangle: appState.tsujiAccTriangle,
        tsujiAccDash: appState.tsujiAccDash,
        tsujiElevationOption: appState.tsujiElevationOption,
        tsujiElevOK: appState.tsujiElevOK,
        tsujiElevNG: appState.tsujiElevNG,
        tsujiTimeFilter: appState.tsujiTimeFilter,
        tsujiStartMode: appState.tsujiStartMode, tsujiStartTime: appState.tsujiStartTime, tsujiStartPrePost: appState.tsujiStartPrePost, tsujiStartPrePostDir: appState.tsujiStartPrePostDir, tsujiStartOffset: appState.tsujiStartOffset,
        tsujiEndMode: appState.tsujiEndMode, tsujiEndTime: appState.tsujiEndTime, tsujiEndPrePost: appState.tsujiEndPrePost, tsujiEndPrePostDir: appState.tsujiEndPrePostDir, tsujiEndOffset: appState.tsujiEndOffset,
        // 辻メッシュ検索パラメータ
        tsujiMeshDays: appState.tsujiMeshDays,
        tsujiMeshBaseAz: appState.tsujiMeshBaseAz, tsujiMeshOffsetAz: appState.tsujiMeshOffsetAz, tsujiMeshToleranceAz: appState.tsujiMeshToleranceAz,
        tsujiMeshBaseAlt: appState.tsujiMeshBaseAlt, tsujiMeshOffsetAlt: appState.tsujiMeshOffsetAlt, tsujiMeshToleranceAlt: appState.tsujiMeshToleranceAlt,
        tsujiMeshCenterMode: appState.tsujiMeshCenterMode, tsujiMeshAccuracy: appState.tsujiMeshAccuracy,
        tsujiMeshMoonFilterEnabled: appState.tsujiMeshMoonFilterEnabled, tsujiMeshMoonBase: appState.tsujiMeshMoonBase, tsujiMeshMoonTolerance: appState.tsujiMeshMoonTolerance,
        tsujiMeshTimeFilter: appState.tsujiMeshTimeFilter,
        tsujiMeshStartMode: appState.tsujiMeshStartMode, tsujiMeshStartTime: appState.tsujiMeshStartTime, tsujiMeshStartPrePost: appState.tsujiMeshStartPrePost, tsujiMeshStartPrePostDir: appState.tsujiMeshStartPrePostDir, tsujiMeshStartOffset: appState.tsujiMeshStartOffset,
        tsujiMeshEndMode: appState.tsujiMeshEndMode, tsujiMeshEndTime: appState.tsujiMeshEndTime, tsujiMeshEndPrePost: appState.tsujiMeshEndPrePost, tsujiMeshEndPrePostDir: appState.tsujiMeshEndPrePostDir, tsujiMeshEndOffset: appState.tsujiMeshEndOffset,
        tsujiMeshSymO: appState.tsujiMeshSymO, tsujiMeshSymTri: appState.tsujiMeshSymTri, tsujiMeshSymDash: appState.tsujiMeshSymDash,
        tsujiMeshElevationOption: appState.tsujiMeshElevationOption, tsujiMeshElevOK: appState.tsujiMeshElevOK, tsujiMeshElevNG: appState.tsujiMeshElevNG,
        // 宙の窓パラメータ
        // 焦点距離・合焦距離・フィッシュアイ強度・パノラマ画角・カメラオフセット・視界範囲は保存しない
        // (毎アクセスで初期値を適用。URLからは復元される。広画角のまま再訪してDEMタイルを過剰取得するのを防ぐ)
        soraSensorKey: appState.soraSensorKey, soraAspectW: appState.soraAspectW, soraAspectH: appState.soraAspectH,
        soraFNumberIdx: appState.soraFNumberIdx,
        soraFisheye: appState.soraFisheye, soraPeaking: appState.soraPeaking, soraGrayscale: appState.soraGrayscale,
        soraBaseAz: appState.soraBaseAz, soraBaseAlt: appState.soraBaseAlt,
        soraTraj: appState.soraTraj, soraCenterCross: appState.soraCenterCross,
        soraTargetCross: appState.soraTargetCross, soraSearchCenter: appState.soraSearchCenter,
        soraOrient: appState.soraOrient, soraFisheyeShape: appState.soraFisheyeShape,
        soraPanorama: appState.soraPanorama,
        soraMovInterval: appState.soraMovInterval, soraMovShots: appState.soraMovShots, soraMovFps: appState.soraMovFps,
        soraMovDispStep: appState.soraMovDispStep, soraMovImgMb: appState.soraMovImgMb, soraMovPlayMode: appState.soraMovPlayMode,
        soraMwBrightness: appState.soraMwBrightness, soraElevShade: appState.soraElevShade, soraSunShade: appState.soraSunShade,
        soraExpFormat: appState.soraExpFormat, soraExpW: appState.soraExpW, soraExpH: appState.soraExpH, soraLabelScale: appState.soraLabelScale,
        // 標高関連（API標高とユーザー入力高）
        startApiElev: appState.startApiElev,
        endApiElev: appState.endApiElev,
        startHeight: appState.startHeight,
        endHeight: appState.endHeight
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
            if(saved.myStars) appState.myStars = saved.myStars;
            if(saved.myObservations) appState.myObservations = saved.myObservations;
            if(saved.myTargets) appState.myTargets = saved.myTargets;
            if(saved.myTsujiSearches) appState.myTsujiSearches = saved.myTsujiSearches;
            // 旧保存データ(オフセット中心角が行独立になる前)は基本オプションの値で補完
            appState.myTsujiSearches.forEach(t => { if (t.mwOffsetAngle === undefined) t.mwOffsetAngle = Number(saved.mwOffsetAngle ?? appState.mwOffsetAngle) || 0; });
            if(saved.meteo) appState.meteo = saved.meteo;
            // meteoからKを再計算 (refractionKは保存しない)
            appState.refractionK = calculateKFromMeteo(appState.meteo.p, appState.meteo.t, appState.meteo.l);
            if(saved.refractionEnabled !== undefined) appState.refractionEnabled = saved.refractionEnabled;
            if(saved.isDPActive !== undefined) appState.isDPActive = saved.isDPActive;
            // isDP365Active は読み込まない: 起動時は常に OFF で初期化済み (saveAppStateにも保存しない)
            if(saved.locMode) appState.locMode = saved.locMode;
            if(saved.lastVisitDate) appState.lastVisitDate = saved.lastVisitDate;
            // 辻検索パラメータ復元 (①〜⑥+検索期間)
            if(saved.tsujiSearchBaseAz !== undefined) appState.tsujiSearchBaseAz = saved.tsujiSearchBaseAz;
            if(saved.tsujiSearchOffsetAz !== undefined) appState.tsujiSearchOffsetAz = saved.tsujiSearchOffsetAz;
            if(saved.tsujiSearchToleranceAz !== undefined) appState.tsujiSearchToleranceAz = saved.tsujiSearchToleranceAz;
            if(saved.tsujiSearchOffsetAlt !== undefined) appState.tsujiSearchOffsetAlt = saved.tsujiSearchOffsetAlt;
            if(saved.tsujiSearchBaseAlt !== undefined) appState.tsujiSearchBaseAlt = saved.tsujiSearchBaseAlt;
            if(saved.tsujiSearchToleranceAlt !== undefined) appState.tsujiSearchToleranceAlt = saved.tsujiSearchToleranceAlt;
            if(saved.tsujiSearchDays !== undefined) appState.tsujiSearchDays = saved.tsujiSearchDays;
            if(saved.tsujiCenterMode !== undefined) appState.tsujiCenterMode = saved.tsujiCenterMode;
            // 辻メッシュ検索パラメータ
            ['tsujiMeshDays', 'tsujiMeshBaseAz', 'tsujiMeshOffsetAz', 'tsujiMeshToleranceAz',
             'tsujiMeshBaseAlt', 'tsujiMeshOffsetAlt', 'tsujiMeshToleranceAlt',
             'tsujiMeshCenterMode', 'tsujiMeshAccuracy',
             'tsujiMeshMoonFilterEnabled', 'tsujiMeshMoonBase', 'tsujiMeshMoonTolerance',
             'tsujiMeshTimeFilter',
             'tsujiMeshStartMode', 'tsujiMeshStartTime', 'tsujiMeshStartPrePost', 'tsujiMeshStartPrePostDir', 'tsujiMeshStartOffset',
             'tsujiMeshEndMode', 'tsujiMeshEndTime', 'tsujiMeshEndPrePost', 'tsujiMeshEndPrePostDir', 'tsujiMeshEndOffset',
             'tsujiMeshSymO', 'tsujiMeshSymTri', 'tsujiMeshSymDash',
             'tsujiMeshElevationOption', 'tsujiMeshElevOK', 'tsujiMeshElevNG'].forEach(k => {
                if (saved[k] !== undefined) appState[k] = saved[k];
            });
            if(saved.tsujiMoonFilterEnabled !== undefined) appState.tsujiMoonFilterEnabled = saved.tsujiMoonFilterEnabled;
            if(saved.tsujiMoonBase !== undefined) appState.tsujiMoonBase = saved.tsujiMoonBase;
            if(saved.tsujiMoonTolerance !== undefined) appState.tsujiMoonTolerance = saved.tsujiMoonTolerance;
            if(saved.tsujiAccuracyFilterEnabled !== undefined) appState.tsujiAccuracyFilterEnabled = saved.tsujiAccuracyFilterEnabled;
            if(saved.tsujiAccDblCircle !== undefined) appState.tsujiAccDblCircle = saved.tsujiAccDblCircle;
            if(saved.tsujiAccCircle !== undefined) appState.tsujiAccCircle = saved.tsujiAccCircle;
            if(saved.tsujiAccTriangle !== undefined) appState.tsujiAccTriangle = saved.tsujiAccTriangle;
            if(saved.tsujiAccDash !== undefined) appState.tsujiAccDash = saved.tsujiAccDash;
            if(saved.tsujiElevationOption !== undefined) appState.tsujiElevationOption = saved.tsujiElevationOption;
            if(saved.tsujiElevOK !== undefined) appState.tsujiElevOK = saved.tsujiElevOK;
            if(saved.tsujiElevNG !== undefined) appState.tsujiElevNG = saved.tsujiElevNG;
            ['tsujiTimeFilter','tsujiStartMode','tsujiStartTime','tsujiStartPrePost','tsujiStartPrePostDir','tsujiStartOffset','tsujiEndMode','tsujiEndTime','tsujiEndPrePost','tsujiEndPrePostDir','tsujiEndOffset'].forEach(k => { if (saved[k] !== undefined) appState[k] = saved[k]; });
            // 宙の窓パラメータ復元
            ['soraSensorKey','soraAspectW','soraAspectH','soraFNumberIdx','soraFisheye','soraPeaking','soraGrayscale','soraBaseAz','soraBaseAlt','soraTraj','soraCenterCross','soraTargetCross','soraSearchCenter','soraOrient','soraFisheyeShape','soraPanorama',
             'soraMovInterval','soraMovShots','soraMovFps','soraMovDispStep','soraMovImgMb','soraMovPlayMode',
             'soraMwBrightness','soraElevShade','soraSunShade','soraExpFormat','soraExpW','soraExpH','soraLabelScale',
             'baseOptMwBase','mwOffsetAngle','mwShowBodies','mwShowBodyNames','mwShowConstFig','mwShowConstBounds','mwShowConstNames','mwConstNameSort','elevExcludeRadius'].forEach(k => { if (saved[k] !== undefined) appState[k] = saved[k]; });
            // 標高関連（API標高とユーザー入力高）
            if(saved.startApiElev !== undefined) appState.startApiElev = saved.startApiElev;
            if(saved.endApiElev !== undefined) appState.endApiElev = saved.endApiElev;
            if(saved.startHeight !== undefined) appState.startHeight = saved.startHeight;
            if(saved.endHeight !== undefined) appState.endHeight = saved.endHeight;
            // API標高とユーザー高さから内部計算用elevを再計算
            recalcElev('start');
            recalcElev('end');

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
            appState._loadedSchema = (typeof saved.appSchema === 'number') ? saved.appSchema : 0;
        } catch(e) { console.error("Load Error:", e); }
    }
    // 旧/不整合な保存データを安全な値に正規化（バージョンアップ時の自己修復）
    normalizeAppState();
}

/** 読み込んだ appState を安全な値に正規化（冪等）。旧バージョン/不整合データの自己修復。 */
const APP_SCHEMA = 2;
function normalizeAppState() {
    // スキーマ1→2: 既定色の変更(天の川:紫→薄紫 / M42:薄紫→紫)。
    // 旧既定色のまま使っていた保存データだけ新既定色へ追従する(カスタム色は保持)。
    if ((appState._loadedSchema || 0) < 2) {
        const mw = appState.bodies.find(b => b.id === 'MilkyWay');
        if (mw && typeof mw.color === 'string' && mw.color.toUpperCase() === '#800080') mw.color = '#DDA0DD';
        const m42 = appState.bodies.find(b => b.id === 'M42');
        if (m42 && typeof m42.color === 'string' && m42.color.toUpperCase() === '#DDA0DD') m42.color = '#800080';
    }
    const validModes = TSUJI_TIME_MODES.map(m => m.v).concat('fixed');
    const num = (v, def, min, max) => {
        const n = parseFloat(v);
        if (!isFinite(n)) return def;
        return Math.max(min, Math.min(max, n));
    };
    const reTime = /^\d{1,2}:\d{2}$/;
    // 時間フィルタ: モード・前後方向・時刻形式
    ['Start', 'End'].forEach(G => {
        const defMode = G === 'Start' ? 'sunset' : 'sunrise';
        if (!validModes.includes(appState['tsuji' + G + 'Mode'])) appState['tsuji' + G + 'Mode'] = defMode;
        if (appState['tsuji' + G + 'PrePostDir'] !== 'before' && appState['tsuji' + G + 'PrePostDir'] !== 'after') appState['tsuji' + G + 'PrePostDir'] = 'before';
        ['Time', 'Offset'].forEach(k => { if (!reTime.test(appState['tsuji' + G + k])) appState['tsuji' + G + k] = '00:00'; });
        appState['tsuji' + G + 'PrePost'] = !!appState['tsuji' + G + 'PrePost'];
    });
    appState.tsujiTimeFilter = !!appState.tsujiTimeFilter;
    // 辻メッシュ検索
    ['Start', 'End'].forEach(G => {
        const defMode = G === 'Start' ? 'sunset' : 'sunrise';
        if (!validModes.includes(appState['tsujiMesh' + G + 'Mode'])) appState['tsujiMesh' + G + 'Mode'] = defMode;
        if (appState['tsujiMesh' + G + 'PrePostDir'] !== 'before' && appState['tsujiMesh' + G + 'PrePostDir'] !== 'after') appState['tsujiMesh' + G + 'PrePostDir'] = 'before';
        ['Time', 'Offset'].forEach(k => { if (!reTime.test(appState['tsujiMesh' + G + k])) appState['tsujiMesh' + G + k] = '00:00'; });
        appState['tsujiMesh' + G + 'PrePost'] = !!appState['tsujiMesh' + G + 'PrePost'];
    });
    appState.tsujiMeshTimeFilter = !!appState.tsujiMeshTimeFilter;
    if (!['point', 'line'].includes(appState.tsujiMeshCenterMode)) appState.tsujiMeshCenterMode = 'point';
    if (!['x1', 'x2', 'x4', 'x8'].includes(appState.tsujiMeshAccuracy)) appState.tsujiMeshAccuracy = 'x1';
    appState.tsujiMeshSymO = !!appState.tsujiMeshSymO; appState.tsujiMeshSymTri = !!appState.tsujiMeshSymTri; appState.tsujiMeshSymDash = !!appState.tsujiMeshSymDash;
    appState.tsujiMeshDays = Math.min(Math.max(parseInt(appState.tsujiMeshDays) || 365, 1), 36500);
    if (!['point', 'line'].includes(appState.tsujiCenterMode)) appState.tsujiCenterMode = 'point';
    appState.myTsujiSearches.forEach(t => { if (!['point', 'line'].includes(t.centerMode)) t.centerMode = 'point'; });
    // 宙の窓: 数値の範囲・型
    appState.soraAspectW = num(appState.soraAspectW, 3, 1, 100);
    appState.soraAspectH = num(appState.soraAspectH, 2, 1, 100);
    appState.soraFocal = num(appState.soraFocal, 35, 1, 3000);
    appState.soraFNumberIdx = Math.round(num(appState.soraFNumberIdx, 10, 0, SORA_FNUMBERS.length - 1));
    appState.soraFocusDist = num(appState.soraFocusDist, 1000, 0, 300000);
    appState.soraViewRange = num(appState.soraViewRange, 10, 1, 300);
    ['soraFisheye', 'soraPeaking', 'soraTraj', 'soraCenterCross'].forEach(k => { appState[k] = !!appState[k]; });
    appState.soraGrayscale = true;   // 標高グレースケールは常時オン(適用度は標高ヒルシェードスライダーで調整; チェックは廃止)
    if (!SORA_SENSORS.some(s => s.key === appState.soraSensorKey)) appState.soraSensorKey = 'fullframe';
    if (appState.soraOrient !== 'landscape' && appState.soraOrient !== 'portrait') appState.soraOrient = 'landscape';
    appState.soraFisheyeStrength = num(appState.soraFisheyeStrength, 50, 0, 100);
    if (appState.soraFisheyeShape !== 'rect' && appState.soraFisheyeShape !== 'circle') appState.soraFisheyeShape = 'rect';
    appState.soraPanorama = !!appState.soraPanorama;
    appState.soraPanoAov = num(appState.soraPanoAov, 0, 0, 360);
    appState.soraMovInterval = num(appState.soraMovInterval, 15, 0.5, 86400);
    appState.soraMovShots = Math.round(num(appState.soraMovShots, 1, 1, 99999));
    if (![24, 25, 30, 50, 60].includes(Number(appState.soraMovFps))) appState.soraMovFps = 30; else appState.soraMovFps = Number(appState.soraMovFps);
    if (![0.12, 0.24, 0.25, 0.3, 0.5, 0.6, 1].includes(Number(appState.soraMovDispStep))) appState.soraMovDispStep = 0.3; else appState.soraMovDispStep = Number(appState.soraMovDispStep);
    appState.soraMovImgMb = num(appState.soraMovImgMb, 140, 1, 102400);
    appState.soraMwBrightness = num(appState.soraMwBrightness, 100, 0, 100);
    appState.soraElevShade = num(appState.soraElevShade, 50, 0, 100);
    appState.soraSunShade = num(appState.soraSunShade, 50, 0, 100);
    if (appState.soraExpFormat === 'h265') appState.soraExpFormat = 'h264';   // 旧H.265選択はH.264(MP4)へ移行
    if (!['jpeg', 'png', 'h264', 'webm'].includes(appState.soraExpFormat)) appState.soraExpFormat = 'jpeg';
    if (!['anim', 'video'].includes(appState.soraMovPlayMode)) appState.soraMovPlayMode = 'anim';
    appState.soraExpW = Math.round(num(appState.soraExpW, 300, 1, 8192));
    appState.soraExpH = Math.round(num(appState.soraExpH, 200, 1, 8192));
    appState.soraLabelScale = Math.round(num(appState.soraLabelScale, 100, 0, 1000));
    // 基本オプション
    if (appState.baseOptMwBase !== 'center' && appState.baseOptMwBase !== 'offset') appState.baseOptMwBase = 'center';
    appState.mwOffsetAngle = num(appState.mwOffsetAngle, 0, -360, 360);
    appState.elevExcludeRadius = num(appState.elevExcludeRadius, 0, 0, 10000);
    appState.mwShowBodies = appState.mwShowBodies === undefined ? true : !!appState.mwShowBodies;
    appState.mwShowBodyNames = appState.mwShowBodyNames === undefined ? true : !!appState.mwShowBodyNames;
    ['mwShowConstFig', 'mwShowConstBounds', 'mwShowConstNames'].forEach(k => { appState[k] = !!appState[k]; });
    appState.soraTargetCross = appState.soraTargetCross !== false;
    appState.soraSearchCenter = appState.soraSearchCenter !== false;
    if (appState.mwConstNameSort !== 'aiueo' && appState.mwConstNameSort !== 'pos') appState.mwConstNameSort = 'aiueo';
    // 表示天体は loadAppState の「既定配列へマージ」方式により全既定天体が常に存在する
    // （saved.bodies に無い新天体=天の川等は既定のまま保持される）ため、ここでの補完は不要。
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
            appState.start = { lat: DEFAULT_START.lat, lng: DEFAULT_START.lng, elev: DEFAULT_START.elev + DEFAULT_START.height };
            appState.startApiElev = DEFAULT_START.elev;
            appState.startHeight = DEFAULT_START.height;
        } else {
            appState.end = { lat: DEFAULT_END.lat, lng: DEFAULT_END.lng, elev: DEFAULT_END.elev + DEFAULT_END.height };
            appState.endApiElev = DEFAULT_END.elev;
            appState.endHeight = DEFAULT_END.height;
        }
        
        saveAppState(); // 変更を保存
        updateAll();    // ★画面(入力欄・マーカー)を更新
        
        // ★親切機能: 地図もその場所へ移動させる
        const target = (type === 'start') ? appState.start : appState.end;
        map.setView([target.lat, target.lng]);

        btn.classList.remove('active');
        btn.title = `現在の${type==='start'?'観測点':'目的点'}を初期値として登録`;
        
        alert('初期値をリセットし、デフォルトに戻しました');
        return;
    }

    // 2. 呼び出し (登録データがある場合)
    if (hasRegistered) {
        // 登録データを現在地に適用
        if(type === 'start') {
            appState.start = { lat: appState.homeStart.lat, lng: appState.homeStart.lng, elev: appState.homeStart.elev };
            appState.startApiElev = appState.homeStart.apiElev !== undefined ? appState.homeStart.apiElev : appState.homeStart.elev;
            appState.startHeight = appState.homeStart.height || 0;
            recalcElev('start');
            appState.locMode = 'start';
            document.getElementById('radio-start').checked = true;
        } else {
            appState.end = { lat: appState.homeEnd.lat, lng: appState.homeEnd.lng, elev: appState.homeEnd.elev };
            appState.endApiElev = appState.homeEnd.apiElev !== undefined ? appState.homeEnd.apiElev : appState.homeEnd.elev;
            appState.endHeight = appState.homeEnd.height || 0;
            recalcElev('end');
            appState.locMode = 'end';
            document.getElementById('radio-end').checked = true;
        }
        
        saveAppState(); // 移動した状態を保存
        updateAll();
        
        // ★修正: fitBounds(全体表示) ではなく setView(その場所に移動)
        // これにより、観測点を呼び出したときに目的点まで引いてしまうのを防ぐ
        const target = (type === 'start') ? appState.start : appState.end;
        map.setView([target.lat, target.lng]);
        
        alert('登録済みの場所を呼び出しました');
    }

    // 3. 登録 (登録データがない場合)
    else {
        // 現在地を登録データとして保存（apiElevとheightも含める）
        if(type === 'start') {
            appState.homeStart = { ...appState.start, apiElev: appState.startApiElev, height: appState.startHeight };
        } else {
            appState.homeEnd = { ...appState.end, apiElev: appState.endApiElev, height: appState.endHeight };
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
        // tStr は "HH:MM" または "HH:MM:SS" のどちらの形式もあり得る
        const parts = tStr.split(':');
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]) || 0;
        const s = parts.length >= 3 ? (parseInt(parts[2]) || 0) : 0;
        const base = new Date(`${dStr}T00:00:00`);
        base.setHours(h, m, s, 0);
        appState.currentDate = base;
        // 宙の窓プレビューのコントロールメニュー(日付/時刻・撮影開始日時ピッカー)にも連動反映
        // (メインピッカー直接編集の経路は syncUIFromState を通らないためここでミラー)
        const scd = document.getElementById('sora-ctrl-date');
        if (scd) scd.value = dStr;
        const sct = document.getElementById('sora-ctrl-time');
        if (sct) sct.value = tStr;
        soraMovSyncUI();
    }
}

function syncUIFromState() {
    const d = appState.currentDate;
    const yyyy = d.getFullYear();
    const mm = ('00'+(d.getMonth()+1)).slice(-2);
    const dd = ('00'+d.getDate()).slice(-2);
    const h = ('00'+d.getHours()).slice(-2);
    const m = ('00'+d.getMinutes()).slice(-2);
    const s = ('00'+d.getSeconds()).slice(-2);

    document.getElementById('date-input').value = `${yyyy}-${mm}-${dd}`;
    document.getElementById('time-input').value = `${h}:${m}:${s}`;
    // スライダーは分単位のまま（秒は無視）
    document.getElementById('time-slider').value = d.getHours() * 60 + d.getMinutes();
    // 宙の窓プレビューのコントロールメニュー(日付/時刻・撮影開始日時ピッカー)にも連動反映
    const scd = document.getElementById('sora-ctrl-date');
    if (scd) scd.value = `${yyyy}-${mm}-${dd}`;
    const sct = document.getElementById('sora-ctrl-time');
    if (sct) sct.value = `${h}:${m}:${s}`;
    soraMovSyncUI();   // 撮影開始/終了日時などの算出表示を日時に追従
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

    updateTsujiMeshSearchInputs();

    // 全天儀: 観測者の位置・日時が変わったら向きを更新
    if (appState.isMilkyWayActive) {
        updateMilkyWayGlobe();
    }

    // 宙の窓: 位置変化で基準方位角/視高度を更新し、開いていれば再描画
    soraUpdateBaseFromPoints();
    if (appState.isSoramadoActive) {
        drawSoramado();
    }
}

function updateLocationDisplay() {
    locationLayer.clearLayers();

    const fmt = (pos) => `${pos.lat}, ${pos.lng}`;
    
    if(document.activeElement.id !== 'input-start-latlng') {
        document.getElementById('input-start-latlng').value = fmt(appState.start);
    }
    if(document.activeElement.id !== 'input-end-latlng') {
        document.getElementById('input-end-latlng').value = fmt(appState.end);
    }
    
    // 読み取り専用のAPI標高
    document.getElementById('input-start-api-elev').value = appState.startApiElev;
    document.getElementById('input-end-api-elev').value = appState.endApiElev;
    // 編集可能なユーザー高さ
    document.getElementById('input-start-elev').value = appState.startHeight;
    document.getElementById('input-end-elev').value = appState.endHeight;

    const sPt = L.latLng(appState.start.lat, appState.start.lng);
    const ePt = L.latLng(appState.end.lat, appState.end.lng);
    
    // マーカーの設置（観測点:青、目的点:赤）— My観測点/My目的点マーカーより常に上に表示するためzIndexOffsetを高く設定
    const observerIcon = L.divIcon({ className: '', html: '<div class="location-marker location-marker-observer"></div>', iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
    const targetIcon = L.divIcon({ className: '', html: '<div class="location-marker location-marker-target"></div>', iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
    L.marker(sPt, { icon: observerIcon, zIndexOffset: 1000 }).addTo(locationLayer).bindPopup(createLocationPopup("観測点", appState.start, appState.end, appState.startApiElev, appState.startHeight));
    L.marker(ePt, { icon: targetIcon, zIndexOffset: 1000 }).addTo(locationLayer).bindPopup(createLocationPopup("目的点", appState.end, appState.start, appState.endApiElev, appState.endHeight));
    
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
        
        if (isFixedStar(body.id)) {
            const rd = getFixedStarRaDec(body.id);
            ra = rd.ra;
            dec = rd.dec;
        } else {
            const eq = Astronomy.Equator(body.id, obsDate, observer, true, true);
            ra = eq.ra;
            dec = eq.dec;
        }

        const hor = Astronomy.Horizon(obsDate, observer, ra, dec, appState.refractionEnabled ? "normal" : null);

        let riseStr = "--:--";
        let setStr = "--:--";

        if (isFixedStar(body.id)) {
            // 恒星: 出入り時刻は非同期で計算（下のsetTimeoutでまとめて処理）
        } else {
            try {
                const rise = Astronomy.SearchRiseSet(body.id, observer, +1, startOfDay, 2);
                const set  = Astronomy.SearchRiseSet(body.id, observer, -1, startOfDay, 2);
                riseStr = rise ? formatTime(rise.date, startOfDay) : "--:--";
                setStr = set ? formatTime(set.date, startOfDay) : "--:--";
            } catch(e){}
        }

        if (!isFixedStar(body.id) && riseStr === "--:--" && setStr === "--:--" && hor.altitude > 0) {
            riseStr = "00:00";
            setStr = "00:00";
        }

        // 視半径の計算
        const angR = getBodyAngularRadius(body.id, obsDate, observer);

        // 赤経・赤緯
        const radecEl = document.getElementById(`radec-${body.id}`);
        if (radecEl) {
            radecEl.innerText = `赤経 ${ra.toFixed(6)}h / 赤緯 ${dec.toFixed(6)}°`;
        }

        // 出/入時刻・南中時
        const risesetEl = document.getElementById(`riseset-${body.id}`);
        const transitEl = document.getElementById(`transit-${body.id}`);
        if (risesetEl) {
            if (isFixedStar(body.id)) {
                // 恒星: 出入り時刻・南中時を全て非同期で一括計算
                risesetEl.innerText = `出時刻 --:--:-- / 入時刻 --:--:--`;
                if (transitEl) transitEl.innerText = `南中時 --:--:-- / 視半径 -.---°`;
                const bodyId = body.id;
                const capturedRa = ra;
                const capturedDec = dec;
                setTimeout(() => {
                    const times = searchStarRiseSet(capturedRa, capturedDec, observer, startOfDay);
                    let rs = times.rise;
                    let ss = times.set;
                    if (rs === "--:--:--" && ss === "--:--:--") {
                        const h = Astronomy.Horizon(obsDate, observer, capturedRa, capturedDec, appState.refractionEnabled ? "normal" : null);
                        if (h.altitude > 0) { rs = "00:00:00"; ss = "00:00:00"; }
                    }
                    const transitStr = searchStarTransit(capturedRa, capturedDec, observer, startOfDay);
                    const rsEl = document.getElementById(`riseset-${bodyId}`);
                    const trEl = document.getElementById(`transit-${bodyId}`);
                    if (rsEl) rsEl.innerText = `出時刻 ${rs} / 入時刻 ${ss}`;
                    if (trEl) {
                        const existing = trEl.innerText;
                        const angPart = existing.includes(' / 視半径') ? existing.substring(existing.indexOf(' / 視半径')) : '';
                        trEl.innerText = `南中時 ${transitStr}${angPart}`;
                    }
                }, 0);
            } else {
                // 太陽系天体: 出入り時刻は同期、南中時のみ非同期
                risesetEl.innerText = `出時刻 ${riseStr} / 入時刻 ${setStr}`;
                if (transitEl) transitEl.innerText = `南中時 --:--:-- / 視半径 --°`;
                const bodyId = body.id;
                setTimeout(() => {
                    let transitStr = "--:--:--";
                    try {
                        const transit = Astronomy.SearchHourAngle(bodyId, observer, 0, startOfDay);
                        if (transit && transit.time) {
                            transitStr = formatTime(transit.time.date, startOfDay);
                        }
                    } catch(e) {}
                    const trEl = document.getElementById(`transit-${bodyId}`);
                    if (trEl) {
                        const existing = trEl.innerText;
                        const angPart = existing.includes(' / 視半径') ? existing.substring(existing.indexOf(' / 視半径')) : '';
                        trEl.innerText = `南中時 ${transitStr}${angPart}`;
                    }
                }, 0);
            }
        }

        // 方位角・視高度・視半径 + 方位の日本語名
        const dataEl = document.getElementById(`data-${body.id}`);
        const transitEl2 = document.getElementById(`transit-${body.id}`);
        const bodyIdEl = document.getElementById(`bodyid-${body.id}`);
        if (dataEl) {
            const angRStr = BODY_RADIUS_KM[body.id] ? angR.toFixed(3) + '°' : '-.---°';
            dataEl.innerText = `方位角 ${hor.azimuth.toFixed(4)}° / 視高度 ${hor.altitude.toFixed(4)}°`;
            if (transitEl2) {
                const currentTransit = transitEl2.innerText;
                const transitPart = currentTransit.split(' / 視半径')[0];
                transitEl2.innerText = `${transitPart} / 視半径 ${angRStr}`;
            }
        }
        if (bodyIdEl) {
            bodyIdEl.innerText = `ID: ${body.id} / 方位 ${azimuthToDirectionJP(hor.azimuth)}`;
        }

        if (body.visible) {
            drawDirectionLine(appState.start.lat, appState.start.lng, hor.azimuth, hor.altitude, body);
        }
    });

    updateShortcutsData(startOfDay, observer);
    updateTwilightData(startOfDay, observer);
    updateMoonInfo(obsDate);
}

/** 天体の当日の南中時刻(ms)。日の0:00以降で最初に時角=0になる時刻。
 *  惑星/太陽/月は SearchHourAngle、恒星/天の川は恒星時から直接算出する。失敗時は正午。 */
function findBodyTransitMs(body, observer, dayStartMs) {
    try {
        if (body.id === 'MilkyWay' || isFixedStar(body.id)) {
            const rd = getFixedStarRaDec(body.id);
            const gast = Astronomy.SiderealTime(new Date(dayStartMs));   // グリニッジ視恒星時(時)
            let haH = (gast + observer.longitude / 15 - rd.ra) % 24;     // 時角(時)
            if (haH < 0) haH += 24;
            const dtH = (24 - haH) % 24;                                 // 時角が0に戻るまでの恒星時時間
            return dayStartMs + dtH * 0.9972695663 * 3600000;
        }
        const evt = Astronomy.SearchHourAngle(body.id, observer, 0, new Date(dayStartMs), +1);
        return evt.time.date.getTime();
    } catch (_) { return dayStartMs + 43200000; }
}

async function updateDPLines() {
    // 新しい世代を発番し、既存キューにある古い世代の通常辻ラインタスクをキャンセル(辻ライン365は巻き添えにしない)
    const generation = ++dpCurrentGeneration;
    dpPoolCancelQueued('dp');
    dpLayer.clearLayers();

    const baseDate = new Date(appState.currentDate);
    baseDate.setHours(0, 0, 0, 0);
    const observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev);
    const visibleBodies = appState.bodies.filter(b => b.visible);

    // 各天体について 前日/当日/翌日 3本の計算をプールで並列実行
    // stepSeconds=5 (方位角の精度は同等、線分刻みが粗くなるだけ。負荷 1/5)
    // 当日線 = 目的点から300km以内 かつ その天体の当日の南中時±12時間。
    // 翌日線/前日線 = 南中時±24時間を起点とした±12時間(3窓で連続72時間をタイル)。
    // 月のように南中が毎日約50分ずれる天体でも、辻ラインが日付を跨いで連続する。
    const DP_DIST_LIMIT = 300000;
    const allComputed = await Promise.all(visibleBodies.map(async body => {
        const t0 = findBodyTransitMs(body, observer, baseDate.getTime());
        // 窓の起点は分単位にスナップする。サンプル時刻は「起点+5秒刻み」のため、
        // 南中時刻の秒端数をそのまま使うと毎分00秒に乗らず、5分毎の時刻マーカーが表示されない。
        const currStart = Math.floor((t0 - 43200000) / 60000) * 60000;
        const [pPrev, pNext, pCurr] = await Promise.all([
            calculateDPPathPoints(baseDate, body, observer, { stepSeconds: 5, windowStartMs: currStart - 86400000, distLimit: DP_DIST_LIMIT }),
            calculateDPPathPoints(baseDate, body, observer, { stepSeconds: 5, windowStartMs: currStart + 86400000, distLimit: DP_DIST_LIMIT }),
            calculateDPPathPoints(baseDate, body, observer, { stepSeconds: 5, windowStartMs: currStart, distLimit: DP_DIST_LIMIT }),
        ]);
        return { body, pPrev, pNext, pCurr };
    }));

    // 計算遅延中に新しい呼び出しがあった場合は描画しない
    if (generation !== dpCurrentGeneration) return;

    allComputed.forEach(({ body, pPrev, pNext, pCurr }) => {
        drawDPPath(pPrev, body.color, '1, 13', false);
        drawDPPath(pNext, body.color, '1, 13', false);
        // 丁度 — 実線 (天体の中心が目的点に完全に重なる位置)
        drawDPPath(pCurr, body.color, null, true);

        // ◎ 精度の境界 (±0.125°) — 破線
        const dashLine = '13, 13';
        drawDPPath(pCurr, body.color, dashLine, false, +0.125);
        drawDPPath(pCurr, body.color, dashLine, false, -0.125);

        // ○ 精度の境界 (±angR: 視半径) — 一点鎖線
        const angR = getBodyAngularRadius(body.id, appState.currentDate, observer);
        if (angR >= 0.01) {
            const dashDot = '1, 13, 13, 13';
            drawDPPath(pCurr, body.color, dashDot, false, +angR);
            drawDPPath(pCurr, body.color, dashDot, false, -angR);
        }
        // △ 精度の境界 (±1°) — 二点鎖線
        const dashDotDot = '1, 13, 1, 13, 13, 13';
        drawDPPath(pCurr, body.color, dashDotDot, false, +1);
        drawDPPath(pCurr, body.color, dashDotDot, false, -1);
    });
}

/** 天体IDのlayerGroupを取得(無ければ作成) */
function ensureDP365LayerForBody(bodyId) {
    if (!dp365LayerByBody[bodyId]) {
        dp365LayerByBody[bodyId] = L.layerGroup();
    }
    return dp365LayerByBody[bodyId];
}

/** 辻ライン365 — 直近1年(365日分)の◎精度の辻ラインを破線のみで描画。
 *  各天体ごとに L.layerGroup を作成し、表示天体メニューの切替で:
 *  - チェック→ レイヤーが既に計算済みなら即時 mapに追加 (高速)、未計算なら新規計算
 *  - チェック解除→ そのレイヤーを mapから外す (キャッシュは保持、再表示で復元)
 *  非表示の天体や、観測点/目的点/日付変更後の再計算は OFF→ON で実施。 */
async function updateDP365Lines() {
    const generation = ++dp365CurrentGeneration;
    // 前回実行の残キュー(旧世代の辻ライン365タスク)を破棄してから開始
    dpPoolCancelQueued('dp365');

    const baseDate = new Date(appState.currentDate);
    baseDate.setHours(0, 0, 0, 0);
    const observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev);
    const visibleBodies = appState.bodies.filter(b => b.visible);
    const visibleIds = new Set(visibleBodies.map(b => b.id));

    // 非表示になった天体のレイヤーを map から外す (キャッシュは残す)
    Object.entries(dp365LayerByBody).forEach(([id, layer]) => {
        if (!visibleIds.has(id) && map.hasLayer(layer)) {
            layer.removeFrom(map);
        }
    });
    // 計算済み・表示中の天体は即座にレイヤーをmapに追加 (高速)
    visibleBodies.forEach(body => {
        if (dp365CalculatedBodies.has(body.id)) {
            const layer = ensureDP365LayerForBody(body.id);
            if (!map.hasLayer(layer)) layer.addTo(map);
        }
    });

    // 未計算の天体だけを計算対象に
    const newBodies = visibleBodies.filter(b => !dp365CalculatedBodies.has(b.id));
    if (newBodies.length === 0) return;

    const btn = document.getElementById('btn-dp365');
    const totalDays = 365;
    const totalWork = totalDays * newBodies.length;
    let doneWork = 0;
    const updateLabel = () => {
        const pct = Math.round(doneWork / totalWork * 100);
        btn.textContent = `${pct}%`;
    };
    updateLabel();

    // バッチ単位で並列実行 (1バッチ = BATCH_DAYS日 × 新規天体)
    // バッチ間で await して UI ブロックを回避
    const BATCH_DAYS = DP_POOL_SIZE;
    try {
        for (let dOff = 0; dOff < totalDays; dOff += BATCH_DAYS) {
            if (generation !== dp365CurrentGeneration) return;
            const batchTasks = [];
            for (let b = 0; b < BATCH_DAYS && (dOff + b) < totalDays; b++) {
                const day = new Date(baseDate.getTime() + (dOff + b) * 86400000);
                for (const body of newBodies) {
                    batchTasks.push(calculateDPPathPoints(day, body, observer, { stepSeconds: 60, forceWorker: true, owner: 'dp365' }).then(pts => {
                        if (generation !== dp365CurrentGeneration) return;
                        const layer = ensureDP365LayerForBody(body.id);
                        if (!map.hasLayer(layer)) layer.addTo(map);
                        drawDP365Path(pts, body.color, layer);
                        doneWork++;
                        updateLabel();
                    }));
                }
            }
            await Promise.all(batchTasks);
        }
        // 全完了したら計算済みマーク
        if (generation === dp365CurrentGeneration) {
            newBodies.forEach(b => dp365CalculatedBodies.add(b.id));
        }
    } finally {
        if (generation === dp365CurrentGeneration) {
            btn.textContent = '辻';
        }
    }
}

/** 辻ライン365 用の軽量描画 (◎破線のみ、マーカー無し)。
 *  指定された targetLayer (天体ごとの L.layerGroup) に追加する。 */
function drawDP365Path(points, color, targetLayer) {
    if (!points || points.length === 0) return;
    const targetPt = appState.end;
    let segments = [];
    let currentSegment = [];
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        let dest;
        if (p.lat != null && p.lng != null) {
            dest = { lat: p.lat, lng: p.lng };
        } else {
            const desiredBearing = ((p.az) % 360 + 360) % 360;
            dest = getObserverFromTargetBackAzimuth(targetPt.lat, targetPt.lng, desiredBearing, p.dist);
        }
        const pt = [dest.lat, dest.lng];
        if (currentSegment.length > 0) {
            const prev = points[i - 1];
            if (Math.abs(p.az - prev.az) > 5) {
                segments.push(currentSegment);
                currentSegment = [];
            }
        }
        currentSegment.push(pt);
    }
    if (currentSegment.length > 0) segments.push(currentSegment);
    segments.forEach(seg => {
        L.polyline(seg, {
            color: color,
            weight: 7,
            opacity: 0.5  // 透けて見える程度に薄く (365日重ねて表示するため控えめに)
            // dashArray なし = 実線
        }).addTo(targetLayer);
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
        appState.startApiElev = validElev;
        appState.startHeight = 0;
        appState.locMode = 'start';
        document.getElementById('radio-start').checked = true;
    } else {
        appState.end = { ...coords, elev: validElev };
        appState.endApiElev = validElev;
        appState.endHeight = 0;
        appState.locMode = 'end';
        document.getElementById('radio-end').checked = true;
    }

    const inputId = isStart ? 'input-start-latlng' : 'input-end-latlng';
    document.getElementById(inputId).blur();

    map.setView(coords);
    saveAppState();
    updateAll();
}

function showLocationPicker(results, isStartOrCallback) {
    const picker = document.getElementById('location-picker');
    const list = document.getElementById('picker-list');
    const title = document.getElementById('picker-title');
    title.textContent = `地名検索結果（${results.length}件）`;
    list.innerHTML = '';

    results.forEach(r => {
        const item = document.createElement('div');
        item.className = 'picker-item';
        item.innerHTML = `<div class="picker-name">${escapeHtml(r.title)}</div><div class="picker-address">${escapeHtml(r.address)}</div>`;
        item.addEventListener('click', async () => {
            closeLocationPicker();
            if (typeof isStartOrCallback === 'function') {
                // カスタムコールバック (My観測点/My目的点用)
                await isStartOrCallback(r);
            } else {
                // 既存の位置情報メニュー用 (boolean)
                const coords = { lat: r.lat, lng: r.lon };
                await applyLocationCoords(coords, isStartOrCallback);
            }
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
// 9. ユーティリティ
// ============================================================

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
    // アニメーション停止後、辻ラインを高精度(1秒サンプリング)で再描画
    if (appState.isDPActive) {
        updateDPLines();
    }
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

/** 全ての辻ライン365レイヤーをmapから外し、キャッシュをクリア */
function clearAllDP365Layers() {
    Object.values(dp365LayerByBody).forEach(layer => {
        if (map.hasLayer(layer)) layer.removeFrom(map);
        layer.clearLayers();
    });
    dp365LayerByBody = {};
    dp365CalculatedBodies.clear();
}

function toggleDP365() {
    appState.isDP365Active = !appState.isDP365Active;
    const btn = document.getElementById('btn-dp365');
    if (appState.isDP365Active) {
        btn.classList.add('active');
        updateDP365Lines();
    } else {
        btn.classList.remove('active');
        btn.textContent = '辻'; // 進捗表示(XX%)が残らないように即座にラベル復元
        clearAllDP365Layers();
        dp365CurrentGeneration++; // 進行中の計算を破棄 (orphan async は generation チェックで早期 return)
        dpPoolCancelQueued('dp365'); // キューに残った未実行の辻ライン365タスクを全て破棄(走り続け防止)
    }
    saveAppState();
}

function useGPS() {
    if (!navigator.geolocation) return alert('GPS非対応です');
    navigator.geolocation.getCurrentPosition(pos => {
        appState.start.lat = pos.coords.latitude; 
        appState.start.lng = pos.coords.longitude;
        map.setView([appState.start.lat, appState.start.lng], 10);
        getElevation(appState.start.lat, appState.start.lng).then(elev => {
            if(elev !== null) {
                appState.start.elev = elev;
                appState.startApiElev = elev;
                appState.startHeight = 0;
            }
            saveAppState();
            updateAll();
        });
    }, () => alert('位置情報を取得できませんでした'));
}

/**
 * 準最高地点移動「高移」
 * ラジオで選択中の観測点/目的点の近傍256×256ピクセル(現在ピクセル中心)を検索し、
 * 現在地点から最も近い・現在より高い小ピーク(局所最大)へ移動する。
 * 判定順: ①最も近い ②より高い。DEM標高タイルで算出する。
 */
async function moveToNearestPeak() {
    const isStart = appState.locMode !== 'end';
    const cur = isStart ? appState.start : appState.end;
    if (!cur || cur.lat === null || cur.lat === undefined) {
        return alert((isStart ? '観測点' : '目的点') + 'の緯度経度が設定されていません');
    }
    const btn = document.getElementById('btn-move-peak');
    if (btn) { btn.disabled = true; btn.textContent = '⌛'; }
    try {
        // 現在点を覆うDEMソースを選定 (5A→5B→5C→10B)。現在標高と現在グローバルピクセルを取得
        let chosen = null, curElev = null, gpx0 = 0, gpy0 = 0;
        for (const dem of GSI_DEM_SOURCES) {
            const ti = _getTileInfo(cur.lat, cur.lng, dem.zoom);
            const imgData = await _getTileImageData(_makeTileUrl(dem, ti.x, ti.y));
            if (!imgData) continue;
            const idx = (ti.pY * 256 + ti.pX) * 4;
            const h = _elevFromRGB(imgData.data[idx], imgData.data[idx + 1], imgData.data[idx + 2]);
            if (h !== null) {
                chosen = dem; curElev = h;
                gpx0 = ti.x * 256 + ti.pX; gpy0 = ti.y * 256 + ti.pY;
                break;
            }
        }
        if (!chosen) return alert('近傍の標高データを取得できませんでした');

        // 現在ピクセルを中心とする256×256の窓を構成し、必要なタイルを一括ロード
        const HALF = 128, W = HALF * 2;
        const minGX = gpx0 - HALF, minGY = gpy0 - HALF;
        const tiles = {};
        const loads = [];
        const minTX = Math.floor(minGX / 256), maxTX = Math.floor((minGX + W - 1) / 256);
        const minTY = Math.floor(minGY / 256), maxTY = Math.floor((minGY + W - 1) / 256);
        for (let tx = minTX; tx <= maxTX; tx++) {
            for (let ty = minTY; ty <= maxTY; ty++) {
                loads.push(_getTileImageData(_makeTileUrl(chosen, tx, ty)).then(d => { tiles[tx + '_' + ty] = d; }));
            }
        }
        await Promise.all(loads);

        // 標高グリッドを構築 (データ無しのピクセルは valid=0)
        const grid = new Float64Array(W * W);
        const valid = new Uint8Array(W * W);
        for (let j = 0; j < W; j++) {
            for (let i = 0; i < W; i++) {
                const gx = minGX + i, gy = minGY + j;
                const tx = Math.floor(gx / 256), ty = Math.floor(gy / 256);
                const d = tiles[tx + '_' + ty];
                if (!d) continue;
                const idx = ((gy - ty * 256) * 256 + (gx - tx * 256)) * 4;
                const h = _elevFromRGB(d.data[idx], d.data[idx + 1], d.data[idx + 2]);
                if (h === null) continue;
                grid[j * W + i] = h; valid[j * W + i] = 1;
            }
        }

        // 中心ピクセル=(HALF,HALF)。局所最大(8近傍より高い)かつ現在より高い候補を
        // ①最も近い(ピクセル距離最小) ②より高い の順で1点選定
        const ci = HALF, cj = HALF;
        let best = null;
        for (let j = 1; j < W - 1; j++) {
            for (let i = 1; i < W - 1; i++) {
                if (!valid[j * W + i]) continue;
                const h = grid[j * W + i];
                if (h <= curElev) continue;
                let isPeak = true;
                for (let dj = -1; dj <= 1 && isPeak; dj++) {
                    for (let di = -1; di <= 1; di++) {
                        if (di === 0 && dj === 0) continue;
                        const n = (j + dj) * W + (i + di);
                        if (valid[n] && grid[n] > h) { isPeak = false; break; }
                    }
                }
                if (!isPeak) continue;
                const d2 = (i - ci) * (i - ci) + (j - cj) * (j - cj);
                if (!best || d2 < best.d2 || (d2 === best.d2 && h > best.h)) {
                    best = { i, j, h, d2 };
                }
            }
        }
        if (!best) return alert('近傍により高い地点が見つかりませんでした');

        // 選定ピクセル → 緯度経度。選択中の点に反映し、移動先を画面中心にズーム
        const dest = _globalPixelToLatLng(minGX + best.i, minGY + best.j, chosen.zoom);
        await applyLocationCoords({ lat: dest.lat, lng: dest.lng }, isStart);
        const maxZ = (map && map.getMaxZoom) ? map.getMaxZoom() : 17;
        map.setView([dest.lat, dest.lng], Math.min(17, maxZ));
    } catch (e) {
        alert('準最高地点の探索に失敗しました: ' + (e && e.message ? e.message : e));
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '高移'; }
    }
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

// ============================================================
// DP線計算用 Web Worker プール (初期化コストを1度だけにするための再利用設計)
// ============================================================
const DP_POOL_SIZE = Math.max(1, Math.min((navigator.hardwareConcurrency || 6) + 1, 31));
let dpWorkerPool = null;       // { workers, idle, queue }
let dpTaskIdCounter = 0;       // 各タスクのユニークID (世代管理に使用)
let dpCurrentGeneration = 0;   // 現在の有効世代

function ensureDPWorkerPool() {
    if (dpWorkerPool) return dpWorkerPool;
    const workers = [];
    for (let i = 0; i < DP_POOL_SIZE; i++) {
        workers.push(new Worker('dp-line-worker.js'));
    }
    dpWorkerPool = { workers, idle: [...workers], queue: [] };
    return dpWorkerPool;
}

function _dpRunOnWorker(worker, task) {
    const handler = (e) => {
        worker.removeEventListener('message', handler);
        task.resolve(e.data || { points: [], hourStart: task.message.hourStart });
        // 完了後、キューに次のタスクがあればそれを実行、なければ idle に戻す
        if (dpWorkerPool && dpWorkerPool.queue.length > 0) {
            const next = dpWorkerPool.queue.shift();
            _dpRunOnWorker(worker, next);
        } else if (dpWorkerPool) {
            dpWorkerPool.idle.push(worker);
        }
    };
    worker.addEventListener('message', handler);
    worker.postMessage(task.message);
}

function dpPoolRunTask(message) {
    const pool = ensureDPWorkerPool();
    return new Promise(resolve => {
        const task = { message, resolve };
        if (pool.idle.length > 0) {
            _dpRunOnWorker(pool.idle.pop(), task);
        } else {
            pool.queue.push(task);
        }
    });
}

/** キュー上の未開始タスクをキャンセル (世代切替時に呼ぶ)。
 *  owner('dp'=通常辻ライン / 'dp365'=辻ライン365)を指定するとそのタスクのみ、省略時は全件。
 *  プールは両者で共有のため、owner指定で相互の巻き添えキャンセルを防ぐ。 */
function dpPoolCancelQueued(owner) {
    if (!dpWorkerPool) return;
    const keep = [];
    for (const task of dpWorkerPool.queue) {
        if (owner && task.message.owner !== owner) { keep.push(task); continue; }
        task.resolve({ canceled: true, points: [], hourStart: task.message.hourStart });
    }
    dpWorkerPool.queue = keep;
}

async function calculateDPPathPoints(targetDate, body, observer, opts = {}) {
    // opts.stepSeconds: Worker内サンプリング間隔(秒) デフォルト 1
    // opts.forceWorker: アニメ中でもメインスレッドフォールバックせずWorkerパスを強制
    // opts.windowStartMs: 指定時は「その日の0:00」の代わりに任意の24時間窓の起点(ms)を使う(南中基準の窓用)
    // opts.distLimit: 目的点からの最大距離(m) デフォルト 500000
    const stepSeconds = opts.stepSeconds || 1;
    const forceWorker = !!opts.forceWorker;
    const distLimit = opts.distLimit || 500000;

    let startOfDayMs;
    if (opts.windowStartMs !== undefined) {
        startOfDayMs = opts.windowStartMs;
    } else {
        const startOfDay = new Date(targetDate.getTime());
        startOfDay.setHours(0, 0, 0, 0);
        startOfDayMs = startOfDay.getTime();
    }
    const valElev = appState.start.elev;
    const dip = getHorizonDip(valElev);
    const limit = -(dip + (16 / 60 + 1.18 / 3600) * 2 + 0.1);
    const refr = appState.refractionEnabled ? "normal" : null;
    const k = appState.refractionEnabled ? calculateKFromMeteo(appState.meteo.p, appState.meteo.t, appState.meteo.l) : 0;

    // 天体メッセージを構築 (固定恒星は ra/dec をプリセット)
    const isFixed = isFixedStar(body.id);
    let bodyMsg;
    if (isFixed) {
        const rd = getFixedStarRaDec(body.id);
        bodyMsg = { id: body.id, fixed: true, ra: rd.ra, dec: rd.dec };
    } else {
        bodyMsg = { id: body.id, fixed: false };
    }

    // ra/dec取得ヘルパー (メインスレッド用)
    const getRD = (time) => {
        if (isFixed) return { r: bodyMsg.ra, d: bodyMsg.dec };
        const eq = Astronomy.Equator(body.id, time, observer, true, true);
        return { r: eq.ra, d: eq.dec };
    };

    // 1時間刻みの粗い可視判定 (メインスレッドで実施: 25回のHorizon呼び出し)
    const visibleHour = new Array(25).fill(false);
    for (let h = 0; h <= 24; h++) {
        const time = new Date(startOfDayMs + h * 3600000);
        const { r, d } = getRD(time);
        const hor = Astronomy.Horizon(time, observer, r, d, refr);
        if (hor.altitude > limit) visibleHour[h] = true;
    }

    // 可視な時間帯 (前後の時間も含む) を抽出
    const hoursToProcess = [];
    for (let h = 0; h < 24; h++) {
        const isNear = visibleHour[h] || visibleHour[h+1] || (h > 0 && visibleHour[h-1]);
        if (isNear) hoursToProcess.push(h);
    }
    if (hoursToProcess.length === 0) return [];

    // アニメーション中: 1分間隔の粗いサンプリング (メインスレッドで同期処理、軽量)
    // (forceWorker 指定時はこの分岐をスキップしてWorkerパスを使う)
    // 注: アニメ中の簡易計算では視差の反復補正は行わない (リアルタイム性優先)。
    //     ただし、緯度依存の局所半径は使う (calculateDistanceForAltitudes 第4引数)。
    if (appState.isMoving && !forceWorker) {
        const path = [];
        for (const h of hoursToProcess) {
            for (let m = 0; m < 60; m++) {
                const time = new Date(startOfDayMs + (h * 60 + m) * 60000);
                const { r, d } = getRD(time);
                const hor = Astronomy.Horizon(time, observer, r, d, refr);
                if (hor.altitude > limit) {
                    const dist = calculateDistanceForAltitudes(hor.altitude, valElev, appState.end.elev, observer.latitude, appState.end.lat);
                    if (dist > 0 && dist < distLimit) {
                        path.push({ dist, az: hor.azimuth, time });
                    }
                }
            }
        }
        return path;
    }

    // 停止中: 反復補正版 Worker に1時間ずつ並列にタスクを依頼
    const observerData = { lat: observer.latitude, lng: observer.longitude, elev: observer.height };
    const targetData = { lat: appState.end.lat, lng: appState.end.lng };
    const promises = hoursToProcess.map(h => {
        const taskId = ++dpTaskIdCounter;
        return dpPoolRunTask({
            body: bodyMsg,
            observerData,
            targetData,  // Worker での反復補正に必要
            refractionEnabled: appState.refractionEnabled,
            k,
            startOfDayMs,
            hourStart: h,
            hourEnd: h + 1,
            valElev,
            targetElev: appState.end.elev,
            limit,
            distLimit,
            taskId,
            stepSeconds,  // 365モードでは60(1分)、通常は1(1秒)
            owner: opts.owner || 'dp',   // キュー掃除のスコープ判定用('dp'/'dp365')
        });
    });

    const results = await Promise.all(promises);
    // 結果を時系列順にマージ (canceled タスクは points が空)
    results.sort((a, b) => (a.hourStart || 0) - (b.hourStart || 0));
    const path = [];
    for (const result of results) {
        if (result && result.points) {
            for (const p of result.points) {
                path.push({ dist: p.dist, az: p.az, time: new Date(p.timeMs), lat: p.lat, lng: p.lng });
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
        let dest;
        if (offset === 0 && p.lat != null && p.lng != null) {
            dest = { lat: p.lat, lng: p.lng };
        } else {
            const desiredBearing = ((p.az + offset) % 360 + 360) % 360;
            dest = getObserverFromTargetBackAzimuth(targetPt.lat, targetPt.lng, desiredBearing, p.dist);
        }
        const pt = [dest.lat, dest.lng];

        if (currentSegment.length > 0) {
            const prev = points[i-1];
            if (Math.abs(p.az - prev.az) > 5) {
                segments.push(currentSegment);
                currentSegment = [];
            }
        }
        currentSegment.push(pt);
        
        if (withMarkers && p.time.getMinutes() % 5 === 0 && p.time.getSeconds() === 0) {
            L.circleMarker(pt, {
                radius: 4,
                color: color,
                fillColor: color,
                fillOpacity: 1.0,
                weight: 1
            }).addTo(dpLayer);
            
            const timeStr = formatTimeHM(p.time);
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

/** 天の川の基準点(基本オプション)のRA/Dec。
 *  基準点が「オフセット点」のときは、銀河赤道(b=0)上を中心座標からオフセット中心角(°)ズラした点を返す。 */
function getMilkyWayBaseRaDec() {
    const ang = Number(appState.mwOffsetAngle) || 0;
    if (appState.baseOptMwBase !== 'offset' || ang % 360 === 0) return { ra: MILKYWAY_RA, dec: MILKYWAY_DEC };
    const eq = galacticToEquatorial(ang, 0);
    return { ra: eq.ra, dec: eq.dec };
}

/** My辻検索の行が使う天の川の基準点のRA/Dec。行ごとのオフセット中心角に従う(基本オプションとは連動しない。0°=中心座標) */
function _myTsujiMwRaDec(t) {
    const ang = Number(t && t.mwOffsetAngle) || 0;
    if (ang % 360 === 0) return { ra: MILKYWAY_RA, dec: MILKYWAY_DEC };
    const eq = galacticToEquatorial(ang, 0);
    return { ra: eq.ra, dec: eq.dec };
}

// 固定RA/Decの恒星のRA/Decを返すヘルパー
function getFixedStarRaDec(bodyId) {
    switch (bodyId) {
        case 'Polaris':    return { ra: POLARIS_RA, dec: POLARIS_DEC };
        case 'Merak':      return { ra: MERAK_RA, dec: MERAK_DEC };
        case 'Mintaka':    return { ra: MINTAKA_RA, dec: MINTAKA_DEC };
        case 'Subaru':     return { ra: SUBARU_RA, dec: SUBARU_DEC };
        case 'M42':        return { ra: M42_RA, dec: M42_DEC };
        case 'Vega':       return { ra: VEGA_RA, dec: VEGA_DEC };
        case 'Altair':     return { ra: ALTAIR_RA, dec: ALTAIR_DEC };
        case 'Deneb':      return { ra: DENEB_RA, dec: DENEB_DEC };
        case 'Betelgeuse': return { ra: BETELGEUSE_RA, dec: BETELGEUSE_DEC };
        case 'Sirius':     return { ra: SIRIUS_RA, dec: SIRIUS_DEC };
        case 'Procyon':    return { ra: PROCYON_RA, dec: PROCYON_DEC };
        case 'MilkyWay':   return getMilkyWayBaseRaDec();   // 基本オプションの基準点(中心座標/オフセット点)に追従
        default: {
            // My天体から検索
            const myStar = appState.myStars.find(s => String(s.id) === bodyId);
            if (myStar) return { ra: myStar.ra, dec: myStar.dec };
            return { ra: 0, dec: 0 };
        }
    }
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
// WGS84 楕円体パラメータ
const WGS84_SEMI_MAJOR = 6378137;          // 赤道半径
const WGS84_SEMI_MINOR = 6356752.3142;     // 極半径

/** 観測点緯度 (deg) における WGS84 楕円体上の地心距離 (geocentric radius)。
 *  ρ(φ) = sqrt[((a²cosφ)² + (b²sinφ)²) / ((a cosφ)² + (b sinφ)²)]
 *  lat=0 で a (赤道半径), lat=90 で b (極半径), lat=35° で約 6371km。 */
function getLocalEarthRadius(latDeg) {
    const lat = latDeg * Math.PI / 180;
    const cosLat = Math.cos(lat), sinLat = Math.sin(lat);
    const a = WGS84_SEMI_MAJOR, b = WGS84_SEMI_MINOR;
    const a2cos = a * a * cosLat;
    const b2sin = b * b * sinLat;
    const acos = a * cosLat;
    const bsin = b * sinLat;
    return Math.sqrt(
        (a2cos * a2cos + b2sin * b2sin) /
        (acos * acos + bsin * bsin)
    );
}

function calculateDistanceForAltitudes(altObs, hObs, hTarget, obsLat, tgtLat) {
    // 観測者高 hObs / ターゲット高 hTarget で、観測高度 altObs に見える地表距離。
    // obsLat (観測点緯度 deg) を渡すと WGS84 局所半径を使用。
    // tgtLat も指定すると、観測点とターゲットで別々の局所半径を使用 (より高精度)。
    const R_obs = (typeof obsLat === 'number') ? getLocalEarthRadius(obsLat) : EARTH_RADIUS;
    const R_tgt = (typeof tgtLat === 'number') ? getLocalEarthRadius(tgtLat) : R_obs;

    // 気差係数kを気象パラメータから都度計算 (気差OFF時は0)
    const k = appState.refractionEnabled ? calculateKFromMeteo(appState.meteo.p, appState.meteo.t, appState.meteo.l) : 0;
    // 有効地球半径モデル: 光路の屈折を「地球半径が 1/(1-k) 倍に膨らんだ」
    // と等価に扱うため、各点の地心距離も Reff ベースで計算する。
    const Reff_obs = R_obs / (1 - k);
    const Reff_tgt = R_tgt / (1 - k);
    // 大円距離計算には観測点とターゲットの平均的な有効半径を使う。
    const Reff_avg = (Reff_obs + Reff_tgt) / 2;

    const r1 = Reff_obs + hObs;     // 観測者の地心距離 (有効半径ベース)
    const r2 = Reff_tgt + hTarget;  // ターゲットの地心距離

    const altObsRad = altObs * Math.PI / 180;

    let sinVal = 0;
    let altTargetRad = 0;
    let c = 0;

    if (hObs <= hTarget) {
        // r1 ≤ r2 (大辺対大角の規則): ∠OP2P1 は鋭角
        sinVal = r1/r2 * Math.sin(Math.PI/2 + altObsRad);
        if (sinVal > 1) sinVal = 1; // 安全策: asinの引数は[-1, 1]の範囲でなければならない
        if (sinVal < -1) sinVal = -1;
        altTargetRad = Math.PI/2 - Math.asin(sinVal);
        c = altTargetRad - altObsRad; // 観測点が低い場合は、地球中心角cは両者の差になる
    } else {
        // r1 > r2 (観測者が高い): ∠OP2P1 は鈍角を選ぶ (鋭角解は遠方の偽解)
        sinVal = r1/r2 * Math.sin(Math.PI/2 - altObsRad);
        if (sinVal > 1) sinVal = 1; // 安全策: asinの引数は[-1, 1]の範囲でなければならない
        if (sinVal < -1) sinVal = -1;
        // 鈍角解: ∠OP2P1 = π - asin(sinVal), altTargetRad = ∠OP2P1 - π/2 = π/2 - asin(sinVal)
        altTargetRad = Math.PI/2 - Math.asin(sinVal);
        c = -altObsRad - altTargetRad; // 観測点が高い場合は、地球中心角cは両者の和になる
    }
    const L = Reff_avg * c;

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

/** 目的点 (target) から「観測点→目的点の方位 = desiredBearing」となる観測点 P を距離 L で求める。
 *  WGS84 上では forward/back bearing が厳密に 180° 差ではない (子午線収差) ため、
 *  geod.Direct の azi2 (到着点での方位) を使って Newton 反復で正確な初期方位を求める。
 *  通常 2-4 回で tolerance 1e-7° (≈ 1mm @ 100km) に収束する。 */
function getObserverFromTargetBackAzimuth(targetLat, targetLng, desiredBearing, L) {
    const geod = geodesic.Geodesic.WGS84;
    let initAz = ((desiredBearing + 180) % 360 + 360) % 360;
    let r = geod.Direct(targetLat, targetLng, initAz, L);
    for (let iter = 0; iter < 6; iter++) {
        const currentBackAz = ((r.azi2 + 180) % 360 + 360) % 360;
        let delta = desiredBearing - currentBackAz;
        delta = ((delta + 540) % 360) - 180;
        if (Math.abs(delta) < 1e-7) break;
        initAz = ((initAz + delta) % 360 + 360) % 360;
        r = geod.Direct(targetLat, targetLng, initAz, L);
    }
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
// PC/スマホとも、ドラッグ/スクロール中の誤クリック(誤タップ)による観測点移動を防ぐため、
// 観測点/目的点の移動とメッシュ/辻マーカーの選択はダブルクリック(ダブルタップ)で行う
// スマホのダブルタップはLeafletの合成dblclick(2タップの間隔200ms以内でしか発火しない)に
// 依存せず、click(タップ)2回から自前で判定する(400ms以内・40px以内)
let _mapLastTapMs = 0, _mapLastTapPt = null;
async function onMapClick(e) {
    // アニメーション中は地図クリック/タップで停止(PC/スマホ共通・シングルで有効)
    if (appState.isMoving) {
        stopMove();
        return;
    }
    if (_mapDblClickMode) {
        // PC: メッシュ/辻マーカーの画素のクリックで位置を確定してポップアップを表示(観測点は移動しない)。
        // 観測点/目的点の移動はダブルクリック(onMapDblClick)
        _tmShowPixelPopup(e.latlng);
        return;
    }
    // スマホ: 自前のダブルタップ判定(前回タップから400ms以内かつ40px以内)
    const now = Date.now();
    const pt = map.latLngToContainerPoint(e.latlng);
    if (_mapLastTapPt && (now - _mapLastTapMs) <= 400 && pt.distanceTo(_mapLastTapPt) <= 40) {
        _mapLastTapMs = 0; _mapLastTapPt = null;
        map.closePopup();
        await applyMapPointAction(e.latlng);
        return;
    }
    _mapLastTapMs = now; _mapLastTapPt = pt;
    // シングルタップ: メッシュ/辻マーカーの画素ならポップアップを表示(観測点は移動しない。
    // ポップアップの行/内容のタップで該当行を表示して観測点に設定)。
    // 何もない地図のタップでは移動しない(移動はダブルタップ)
    _tmShowPixelPopup(e.latlng);
}

async function onMapDblClick(e) {
    // スマホはclick経路の自前判定で処理済み(タップ間隔が偶然200ms以内で
    // Leafletの合成dblclickも発火した場合の二重実行を防ぐ)
    if (!_mapDblClickMode) return;
    if (appState.isMoving) {
        stopMove();
        return;
    }
    await applyMapPointAction(e.latlng);
}

/** 地図の点操作: メッシュ/辻マーカーの画素ならポップアップを表示するだけ(観測点は移動しない。
 *  観測点の移動はポップアップの行/内容のクリック/タップで行う)。
 *  それ以外は位置情報メニューのモードに従って観測点/目的点を移動する。 */
async function applyMapPointAction(latlng) {
    if (_tmShowPixelPopup(latlng)) return;
    const isStart = appState.locMode === 'start';
    const elev = await getElevation(latlng.lat, latlng.lng);
    const val = (elev !== null) ? elev : 0;

    if (isStart) {
        appState.start = { lat: latlng.lat, lng: latlng.lng, elev: val };
        appState.startApiElev = val;
        appState.startHeight = 0;
    } else {
        appState.end = { lat: latlng.lat, lng: latlng.lng, elev: val };
        appState.endApiElev = val;
        appState.endHeight = 0;
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
            const muni = await loadMuniData();
            const gsiResults = data
                .filter(item => item.properties.title.includes(q))
                .map(item => {
                    const code = item.properties.addressCode || '';
                    const muniStr = (code && muni && muni[code]) || '';
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

/** グローバルピクセル座標(gpx,gpy)を緯度経度に逆変換する (_getTileInfo の逆。ピクセル中心を返す) */
function _globalPixelToLatLng(gpx, gpy, zoom) {
    const scale = Math.pow(2, zoom);
    const R = 128 / Math.PI;
    const worldX = (gpx + 0.5) / scale;
    const lng = (worldX / R - Math.PI) * 180 / Math.PI;
    const worldY = (gpy + 0.5) / scale;
    const eL = Math.exp((128 - worldY) * 2 / R);
    const lat = Math.asin((eL - 1) / (eL + 1)) * 180 / Math.PI;
    return { lat, lng };
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
        const BATCH_OM = 96;
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

function createLocationPopup(title, pos, target, apiElev, height) {
    const az = calculateBearing(pos.lat, pos.lng, target.lat, target.lng);
    const dist = getDistanceWGS84(pos.lat, pos.lng, target.lat, target.lng);

    // ★追加: 視高度を計算 (観測点緯度を渡して局所半径で補正)
    const alt = calculateApparentAltitude(dist, pos.elev, target.elev, pos.lat, target.lat);

    return `
        <b>${title}</b><br>
        緯度: ${pos.lat}°<br>
        経度: ${pos.lng}°<br>
        標高: ${apiElev != null ? apiElev : pos.elev} m<br>
        高さ: ${height != null ? height : 0} m<br>
        相手距離: ${(dist/1000).toFixed(2)} km<br>
        相手方位: ${az.toFixed(4)}°<br>
        相手高度: ${alt.toFixed(4)}°
    `;
}

// ★追加: 2点間の距離と標高差から視高度(角度)を計算する関数
function calculateApparentAltitude(dist, hObs, hTarget, obsLat, tgtLat) {
    if (dist <= 0) return 0; // 距離0の場合は0度とする

    // 気差係数k (気差OFF時は0)
    const k = appState.refractionEnabled ? calculateKFromMeteo(appState.meteo.p, appState.meteo.t, appState.meteo.l) : 0;

    // 観測点・目的点の局所地球半径 (緯度依存) と有効半径 (気差込み)
    const R_obs = (typeof obsLat === 'number') ? getLocalEarthRadius(obsLat) : EARTH_RADIUS;
    const R_tgt = (typeof tgtLat === 'number') ? getLocalEarthRadius(tgtLat) : R_obs;
    const Reff_obs = R_obs / (1 - k);
    const Reff_tgt = R_tgt / (1 - k);
    const Reff_avg = (Reff_obs + Reff_tgt) / 2;

    // 厳密な三角形解 (calculateDistanceForAltitudes と完全に逆関数)
    // 三角形 OP1P2 で:
    //   OP1 = r1 = Reff_obs + hObs (観測者の地心距離)
    //   OP2 = r2 = Reff_tgt + hTarget (ターゲットの地心距離)
    //   ∠P1OP2 = c = dist / Reff_avg (中心角)
    //   slant = |P1P2| (余弦定理)
    //   ∠OP1P2 = atan2(sin, cos) で範囲 [0, π] を一意に求める
    //   altObs = ∠OP1P2 - π/2
    const r1 = Reff_obs + hObs;
    const r2 = Reff_tgt + hTarget;
    const c = dist / Reff_avg;
    const slant = Math.sqrt(r1 * r1 + r2 * r2 - 2 * r1 * r2 * Math.cos(c));
    const sinAng = r2 * Math.sin(c) / slant;
    const cosAng = (r1 * r1 + slant * slant - r2 * r2) / (2 * r1 * slant);
    const angle = Math.atan2(sinAng, cosAng);
    return (angle - Math.PI / 2) * 180 / Math.PI;
}

/** 観測点 (lat1,lng1) から目的点 (lat2,lng2) への WGS84 楕円体上の forward azimuth (deg)。
 *  球面三角法より高精度 (TT→Fuji で約 0.08° の差、辻検索の baseAz 精度に直結)。 */
function calculateBearing(lat1, lng1, lat2, lng2) {
    const r = geodesic.Geodesic.WGS84.Inverse(lat1, lng1, lat2, lng2);
    return ((r.azi1 + 360) % 360);
}

/** 2地点間の WGS84 楕円体上の geodesic 距離 (m)。
 *  L.latLng().distanceTo() は球面 (Haversine) で精度がやや低いため、
 *  辻検索の baseAlt 計算など精度が必要な場面ではこちらを使う。 */
function getDistanceWGS84(lat1, lng1, lat2, lng2) {
    return geodesic.Geodesic.WGS84.Inverse(lat1, lng1, lat2, lng2).s12;
}

/** 方位角 (0-360°) を16方位の日本語 (最大3文字) に変換。例: 112.5° → 東南東 */
function azimuthToDirectionJP(azDeg) {
    const dirs = ['北','北北東','北東','東北東','東','東南東','南東','南南東',
                  '南','南南西','南西','西南西','西','西北西','北西','北北西'];
    return dirs[Math.round(((azDeg % 360) + 360) % 360 / 22.5) % 16];
}

function getRiseSetAlt(bodyId, date, observer, refr) {
    const eq = Astronomy.Equator(bodyId, date, observer, true, true);
    const hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec, refr);
    return hor.altitude.toFixed(4);
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

function updateTwilightData(startOfDay, observer) {
    try {
        const refr = appState.refractionEnabled ? "normal" : null;
        // 夜明側 (ascending)
        const astroDawn = Astronomy.SearchAltitude('Sun', observer, +1, startOfDay, 1, -18);
        const nautDawn  = Astronomy.SearchAltitude('Sun', observer, +1, startOfDay, 1, -12);
        const yoake     = Astronomy.SearchAltitude('Sun', observer, +1, startOfDay, 1, -7.361111);
        const civilDawn = Astronomy.SearchAltitude('Sun', observer, +1, startOfDay, 1, -6);
        const bhEndGhStart = Astronomy.SearchAltitude('Sun', observer, +1, startOfDay, 1, -4);   // BH[終]/GH[始]
        const sr        = Astronomy.SearchRiseSet('Sun', observer, +1, startOfDay, 1);
        const ghEnd     = Astronomy.SearchAltitude('Sun', observer, +1, startOfDay, 1, 6);       // GH[終]

        // 日暮側 (descending)
        const ghStart   = Astronomy.SearchAltitude('Sun', observer, -1, startOfDay, 1, 6);       // GH[始]
        const ss        = Astronomy.SearchRiseSet('Sun', observer, -1, startOfDay, 1);
        const ghEndBhStart = Astronomy.SearchAltitude('Sun', observer, -1, startOfDay, 1, -4);   // GH[終]/BH[始]
        const civilDusk = Astronomy.SearchAltitude('Sun', observer, -1, startOfDay, 1, -6);
        const higure    = Astronomy.SearchAltitude('Sun', observer, -1, startOfDay, 1, -7.361111);
        const nautDusk  = Astronomy.SearchAltitude('Sun', observer, -1, startOfDay, 1, -12);
        const astroDusk = Astronomy.SearchAltitude('Sun', observer, -1, startOfDay, 1, -18);

        // 時刻DOM更新
        document.getElementById('time-astro-dawn').innerText = astroDawn ? formatTime(astroDawn.date) : "--:--";
        document.getElementById('time-naut-dawn').innerText  = nautDawn ? formatTime(nautDawn.date) : "--:--";
        document.getElementById('time-yoake').innerText      = yoake ? formatTime(yoake.date) : "--:--";
        document.getElementById('time-civil-dawn').innerText = civilDawn ? formatTime(civilDawn.date) : "--:--";
        document.getElementById('time-bh-end-gh-start').innerText = bhEndGhStart ? formatTime(bhEndGhStart.date) : "--:--";
        document.getElementById('time-tw-sunrise').innerText = sr ? formatTime(sr.date) : "--:--";
        document.getElementById('time-gh-end').innerText     = ghEnd ? formatTime(ghEnd.date) : "--:--";

        document.getElementById('time-gh-start').innerText   = ghStart ? formatTime(ghStart.date) : "--:--";
        document.getElementById('time-tw-sunset').innerText  = ss ? formatTime(ss.date) : "--:--";
        document.getElementById('time-gh-end-bh-start').innerText = ghEndBhStart ? formatTime(ghEndBhStart.date) : "--:--";
        document.getElementById('time-civil-dusk').innerText = civilDusk ? formatTime(civilDusk.date) : "--:--";
        document.getElementById('time-higure').innerText     = higure ? formatTime(higure.date) : "--:--";
        document.getElementById('time-naut-dusk').innerText  = nautDusk ? formatTime(nautDusk.date) : "--:--";
        document.getElementById('time-astro-dusk').innerText = astroDusk ? formatTime(astroDusk.date) : "--:--";

        // 日の出/入の視高度表示
        document.getElementById('alt-tw-sunrise').innerText = sr ? getRiseSetAlt('Sun', sr.date, observer, refr) : "--";
        document.getElementById('alt-tw-sunset').innerText  = ss ? getRiseSetAlt('Sun', ss.date, observer, refr) : "--";

        // currentRiseSetDataに薄明データを追加
        currentRiseSetData.astro_dawn = astroDawn?.date;
        currentRiseSetData.naut_dawn  = nautDawn?.date;
        currentRiseSetData.yoake      = yoake?.date;
        currentRiseSetData.civil_dawn = civilDawn?.date;
        currentRiseSetData.bh_end_gh_start = bhEndGhStart?.date;
        currentRiseSetData.tw_sunrise = sr?.date;
        currentRiseSetData.gh_end     = ghEnd?.date;
        currentRiseSetData.gh_start   = ghStart?.date;
        currentRiseSetData.tw_sunset  = ss?.date;
        currentRiseSetData.gh_end_bh_start = ghEndBhStart?.date;
        currentRiseSetData.civil_dusk = civilDusk?.date;
        currentRiseSetData.higure     = higure?.date;
        currentRiseSetData.naut_dusk  = nautDusk?.date;
        currentRiseSetData.astro_dusk = astroDusk?.date;
    } catch(e) {}
}

// 辻検索/My辻検索の結果「時間帯」列のラベル (0時起点で時間順に16区分。BH=ブルーアワー, GH=ゴールデンアワー)
const TIME_CATEGORY_LABELS = [
    '0時<=x<天文薄明[始]',
    '天文薄明[始]<=x<航海薄明[始]',
    '航海薄明[始]<=x<夜明',
    '夜明<=x<常用薄明/BH[始]',
    '常用薄明/BH[始]<=x<BH[終]/GH[始]',
    'BH[終]/GH[始]<=x<日の出',
    '日の出<=x<GH[終]',
    'GH[終]<=x<12時',
    '12時<=x<GH[始]',
    'GH[始]<=x<日の入',
    '日の入<=x<GH[終]/BH[始]',
    'GH[終]/BH[始]<=x<常用薄明/BH[終]',
    '常用薄明/BH[終]<=x<日暮',
    '日暮<=x<航海薄明[終]',
    '航海薄明[終]<=x<天文薄明[終]',
    '天文薄明[終]<=x<0時',
];

/** 当日の薄明・日の出/日の入時刻をDateで返す (DOM更新なし。時間帯分類用)。値はDate|null。 */
function computeDayTwilight(startOfDay, observer) {
    const alt = (dir, deg) => {
        try { const e = Astronomy.SearchAltitude('Sun', observer, dir, startOfDay, 1, deg); return e ? e.date : null; }
        catch (_) { return null; }
    };
    const rs = (dir) => {
        try { const e = Astronomy.SearchRiseSet('Sun', observer, dir, startOfDay, 1); return e ? e.date : null; }
        catch (_) { return null; }
    };
    return {
        astroDawn: alt(+1, -18), nautDawn: alt(+1, -12), yoake: alt(+1, -7.361111),
        civilDawn: alt(+1, -6), bhEndGhStart: alt(+1, -4), sunrise: rs(+1), ghEnd: alt(+1, 6),
        ghStart: alt(-1, 6), sunset: rs(-1), ghEndBhStart: alt(-1, -4),
        civilDusk: alt(-1, -6), higure: alt(-1, -7.361111),
        nautDusk: alt(-1, -12), astroDusk: alt(-1, -18)
    };
}

/** 辻時刻dtが属する時間帯ラベル(TIME_CATEGORY_LABELSのいずれか、不明時'-')を返す。
 *  tw=computeDayTwilightの結果, startOfDay=当日0:00。null境界はスキップ(隣接区間とマージ)。 */
function classifyTimeCategory(dt, tw, startOfDay) {
    const noon = new Date(startOfDay); noon.setHours(12, 0, 0, 0);
    const nextMidnight = new Date(startOfDay.getTime() + 86400000);
    const bounds = [tw.astroDawn, tw.nautDawn, tw.yoake, tw.civilDawn, tw.bhEndGhStart, tw.sunrise, tw.ghEnd,
                    noon, tw.ghStart, tw.sunset, tw.ghEndBhStart, tw.civilDusk, tw.higure, tw.nautDusk, tw.astroDusk, nextMidnight];
    for (let i = 0; i < bounds.length; i++) {
        if (bounds[i] && dt < bounds[i]) return TIME_CATEGORY_LABELS[i];
    }
    return '-';
}

// 時間フィルタの時刻モード (値は computeDayTwilight の返却キーに一致)。これに加えて 'fixed'(時刻指定) がある。
const TSUJI_TIME_MODES = [
    { v: 'astroDawn',    l: '天文薄明[始]' },
    { v: 'nautDawn',     l: '航海薄明[始]' },
    { v: 'yoake',        l: '夜明' },
    { v: 'civilDawn',    l: '常用薄明/BH[始]' },
    { v: 'bhEndGhStart', l: 'BH[終]/GH[始]' },
    { v: 'sunrise',      l: '日の出' },
    { v: 'ghEnd',        l: 'GH[終]' },
    { v: 'ghStart',      l: 'GH[始]' },
    { v: 'sunset',       l: '日の入' },
    { v: 'ghEndBhStart', l: 'GH[終]/BH[始]' },
    { v: 'civilDusk',    l: '常用薄明/BH[終]' },
    { v: 'higure',       l: '日暮' },
    { v: 'nautDusk',     l: '航海薄明[終]' },
    { v: 'astroDusk',    l: '天文薄明[終]' },
];

/** 'HH:MM' を分に変換 (不正時は0) */
function hhmmToMinutes(s) {
    if (!s || typeof s !== 'string') return 0;
    const parts = s.split(':');
    const h = parseInt(parts[0], 10), mi = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(mi)) return 0;
    return h * 60 + mi;
}

/** 時間フィルタの境界時刻を「当日の分(0-1440)」で返す。tw=computeDayTwilightの結果。
 *  null = 境界が解決できない(その日はその境界を無効扱い)。 */
function timeModeToMinutes(mode, fixedHHMM, prePost, dir, offsetHHMM, tw) {
    let base;
    if (mode === 'fixed') {
        base = hhmmToMinutes(fixedHHMM);
    } else {
        const d = tw ? tw[mode] : null;
        if (!d) return null;
        base = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    }
    if (prePost) {
        const off = hhmmToMinutes(offsetHHMM);
        base += (dir === 'after' ? off : -off);
    }
    return ((base % 1440) + 1440) % 1440;
}

/** 辻時刻dtが時間フィルタの範囲内かを判定する。
 *  fs = {startMode,startTime,startPrePost,startPrePostDir,startOffset, end同等}。
 *  開始>終了 のときは夜間(日付境界またぎ)として扱う。境界が解決できない場合は通す。 */
function passesTimeFilter(dt, tw, fs) {
    const sMin = timeModeToMinutes(fs.startMode, fs.startTime, fs.startPrePost, fs.startPrePostDir, fs.startOffset, tw);
    const eMin = timeModeToMinutes(fs.endMode, fs.endTime, fs.endPrePost, fs.endPrePostDir, fs.endOffset, tw);
    if (sMin === null || eMin === null) return true;
    const tMin = dt.getHours() * 60 + dt.getMinutes() + dt.getSeconds() / 60;
    if (sMin <= eMin) return tMin >= sMin && tMin <= eMin;
    return tMin >= sMin || tMin <= eMin; // 夜間 (日付境界またぎ)
}

/** 時間フィルタの薄明/出没/GH/BHモード(TSUJI_TIME_MODES)のラジオ(グリッド)HTMLを生成 */
function timeFilterModeGridHtml(name, checkedValue, cls, dataAttr, disabledAttr = 'disabled') {
    return TSUJI_TIME_MODES.map(m =>
        `<label class="tsuji-time-mode"><input type="radio" name="${name}" value="${m.v}" class="${cls}" ${dataAttr} ${checkedValue === m.v ? 'checked' : ''} ${disabledAttr}>${m.l}</label>`
    ).join('');
}

/** 辻検索/辻メッシュ検索メニューの時間フィルタ1グループ(開始/終了)のHTMLを生成。
 *  prefix: id/name接頭辞('tsuji'|'tsujimesh')、statePrefix: appStateキー接頭辞('tsuji'|'tsujiMesh') */
function buildTimeGroupHtmlFor(prefix, statePrefix, group) {
    const G = group === 'start' ? 'Start' : 'End';
    const name = `${prefix}-${group}-mode`, ppName = `${prefix}-${group}-prepost-dir`;
    const mode = appState[statePrefix + G + 'Mode'];
    const ctlCls = `${prefix}-time-control`, ppCls = `${prefix}-${group}-prepost-control`;
    const groupLabel = group === 'start' ? '開始時刻' : '終了時刻';
    return `<div class="tsuji-time-group tsuji-time-${group}">
        <div class="control-row left-row"><span class="tsuji-time-group-label">${groupLabel}</span></div>
        <div class="control-row left-row">
            <label class="tsuji-time-mode"><input type="radio" name="${name}" value="fixed" class="${ctlCls}" ${mode === 'fixed' ? 'checked' : ''} disabled>時刻指定</label>
            <input type="time" id="input-${prefix}-${group}-time" class="${ctlCls}" value="${appState[statePrefix + G + 'Time']}" disabled>
        </div>
        <div class="control-row left-row tsuji-time-radio-grid">${timeFilterModeGridHtml(name, mode, ctlCls, '')}</div>
        <div class="control-row left-row">
            <label class="tsuji-time-mode"><input type="checkbox" id="chk-${prefix}-${group}-prepost" class="body-checkbox ${ctlCls}" ${appState[statePrefix + G + 'PrePost'] ? 'checked' : ''} disabled>前後時刻指定</label>
            <label class="tsuji-time-mode"><input type="radio" name="${ppName}" value="before" class="${ppCls}" ${appState[statePrefix + G + 'PrePostDir'] === 'before' ? 'checked' : ''} disabled>前</label>
            <label class="tsuji-time-mode"><input type="radio" name="${ppName}" value="after" class="${ppCls}" ${appState[statePrefix + G + 'PrePostDir'] === 'after' ? 'checked' : ''} disabled>後</label>
            <input type="time" id="input-${prefix}-${group}-offset" class="${ppCls}" value="${appState[statePrefix + G + 'Offset']}" disabled>
        </div>
    </div>`;
}

/** 辻検索メニューの時間フィルタ1グループ(開始/終了)のHTMLを生成 */
function buildTsujiTimeGroupHtml(group) {
    return buildTimeGroupHtmlFor('tsuji', 'tsuji', group);
}

/** My辻検索の1行の時間フィルタ1グループ(開始/終了)のHTMLを生成 (per-row、クラス+data-id) */
function buildMyTsujiTimeGroupHtml(t, group) {
    const id = t.id;
    const name = `mytsuji-${group}-mode-${id}`, ppName = `mytsuji-${group}-prepost-dir-${id}`;
    const mode = t[group + 'Mode'] || (group === 'start' ? 'sunset' : 'sunrise');
    const time = t[group + 'Time'] || '00:00';
    const prePost = !!t[group + 'PrePost'];
    const ppDir = t[group + 'PrePostDir'] || 'before';
    const offset = t[group + 'Offset'] || '00:00';
    const dis = t.timeFilter ? '' : 'disabled';
    const ppDis = (t.timeFilter && prePost) ? '' : 'disabled';
    const cls = `mytsuji-time-control mytsuji-${group}-mode`;
    const ppCls = `mytsuji-${group}-prepost-control`;
    const groupLabel = group === 'start' ? '開始時刻' : '終了時刻';
    return `<div class="tsuji-time-group tsuji-time-${group}">
        <div class="control-row left-row"><span class="tsuji-time-group-label">${groupLabel}</span></div>
        <div class="control-row left-row">
            <label class="tsuji-time-mode"><input type="radio" name="${name}" value="fixed" class="${cls}" data-id="${id}" ${mode === 'fixed' ? 'checked' : ''} ${dis}>時刻指定</label>
            <input type="time" class="mytsuji-time-control mytsuji-${group}-time" data-id="${id}" value="${time}" ${dis}>
        </div>
        <div class="control-row left-row tsuji-time-radio-grid">${timeFilterModeGridHtml(name, mode, cls, `data-id="${id}"`, dis)}</div>
        <div class="control-row left-row">
            <label class="tsuji-time-mode"><input type="checkbox" class="body-checkbox mytsuji-time-control mytsuji-${group}-prepost" data-id="${id}" ${prePost ? 'checked' : ''} ${dis}>前後時刻指定</label>
            <label class="tsuji-time-mode"><input type="radio" name="${ppName}" value="before" class="${ppCls}" data-id="${id}" ${ppDir === 'before' ? 'checked' : ''} ${ppDis}>前</label>
            <label class="tsuji-time-mode"><input type="radio" name="${ppName}" value="after" class="${ppCls}" data-id="${id}" ${ppDir === 'after' ? 'checked' : ''} ${ppDis}>後</label>
            <input type="time" class="mytsuji-${group}-offset ${ppCls}" data-id="${id}" value="${offset}" ${ppDis}>
        </div>
    </div>`;
}

/** My辻検索の1行の時間フィルタの活性/非活性を更新 */
function updateMyTsujiRowTimeFilterUI(row, t) {
    const on = !!t.timeFilter;
    row.querySelectorAll('.mytsuji-time-control').forEach(el => { el.disabled = !on; });
    ['start', 'end'].forEach(group => {
        const pp = on && !!t[group + 'PrePost'];
        row.querySelectorAll('.mytsuji-' + group + '-prepost-control').forEach(el => { el.disabled = !pp; });
    });
}

function updateMoonInfo(date) {
    const phase = Astronomy.MoonPhase(date);
    const age = (phase / 360) * SYNODIC_MONTH;
    appState.moonAge = parseFloat(age.toFixed(1));
    document.getElementById('moon-age-input').value = appState.moonAge;
    const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    document.getElementById('moon-icon').innerText = icons[Math.round(phase / 45) % 8];
}

function formatTime(date, baseDate) {
    if (!date) return "--:--:--";

    let h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();

    if (baseDate) {
        if (date.getTime() - baseDate.getTime() >= 86400000) {
            h += 24;
        }
    }

    return `${('00'+h).slice(-2)}:${('00'+m).slice(-2)}:${('00'+s).slice(-2)}`;
}

function formatTimeHM(date) {
    if (!date) return "--:--";
    return `${('00'+date.getHours()).slice(-2)}:${('00'+date.getMinutes()).slice(-2)}`;
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
        rise: rise ? formatTime(rise) : "--:--:--",
        set: set ? formatTime(set) : "--:--:--"
    };
}

function searchStarTransit(ra, dec, observer, startOfDay) {
    let maxAlt = -Infinity;
    let transitTime = null;
    const start = startOfDay.getTime();
    for (let m = 0; m <= 1440; m += 1) {
        const time = new Date(start + m * 60000);
        const hor = Astronomy.Horizon(time, observer, ra, dec, appState.refractionEnabled ? "normal" : null);
        if (hor.altitude > maxAlt) {
            maxAlt = hor.altitude;
            transitTime = time;
        }
    }
    return transitTime ? formatTime(transitTime, startOfDay) : "--:--:--";
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

// ============================================================
// My天体管理
// ============================================================

/** My天体 → bodies 配列に同期 */
function syncMyStarsToBodies() {
    // bodies から isCustom のものを除去
    appState.bodies = appState.bodies.filter(b => !b.isCustom);
    // myStars を bodies に追加
    appState.myStars.forEach(star => {
        appState.bodies.push({
            id: String(star.id),
            name: star.name,
            color: star.color,
            isDashed: star.isDashed,
            visible: star.visible,
            isCustom: true
        });
    });
}

/** 空きID番号の最小値を返す (1〜1000) */
function getNextMyStarId() {
    const usedIds = new Set(appState.myStars.map(s => s.id));
    for (let i = 1; i <= 1000; i++) {
        if (!usedIds.has(i)) return i;
    }
    return null;
}

/** My天体を追加 */
function addMyStar(name, ra, dec) {
    const id = getNextMyStarId();
    if (id === null) {
        alert('My天体の登録上限(1000件)に達しています');
        return false;
    }
    appState.myStars.push({
        id, name: name.replace(/,/g, '，'), ra, dec,
        visible: false,
        color: '#DDA0DD',
        isDashed: true
    });
    syncMyStarsToBodies();
    saveAppState();
    renderMyStarsList();
    updateAll();
    return true;
}

/** My天体リスト描画 */
function renderMyStarsList() {
    const list = document.getElementById('mystars-list');
    if (!list) return;
    list.innerHTML = '';

    if (appState.myStars.length === 0) {
        list.innerHTML = '<li class="mystars-empty">My天体は登録されていません</li>';
        return;
    }

    appState.myStars.forEach(star => {
        const bodyInBodies = appState.bodies.find(b => b.id === String(star.id));
        const dashClass = star.isDashed ? 'dashed' : 'solid';
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="radio" name="mystars-select" value="${star.id}" class="mystars-radio">
            <input type="checkbox" class="body-checkbox" ${star.visible ? 'checked' : ''}>
            <div class="style-indicator ${dashClass}" style="color: ${escapeHtml(star.color)};"></div>
            <div class="body-info">
                <span class="body-name-label">${escapeHtml(star.name)}</span>
                <span class="body-name-id" id="bodyid-${star.id}">ID: ${star.id}</span>
                <span id="data-${star.id}" class="body-detail-text">方位角 --° / 視高度 --°</span>
                <span id="riseset-${star.id}" class="body-detail-text">出時刻 --:--:-- / 入時刻 --:--:--</span>
                <span id="transit-${star.id}" class="body-detail-text">南中時 --:--:-- / 視半径 -.---°</span>
                <span id="radec-${star.id}" class="body-detail-text">赤経 ${star.ra.toFixed(6)}h / 赤緯 ${star.dec.toFixed(6)}°</span>
            </div>`;
        // チェックボックス: 表示/非表示
        li.querySelector('.body-checkbox').addEventListener('change', function() {
            star.visible = this.checked;
            if (bodyInBodies) bodyInBodies.visible = this.checked;
            saveAppState();
            updateAll();
        });
        // カラーパレット
        li.querySelector('.style-indicator').addEventListener('click', function() {
            openPalette(String(star.id));
        });
        list.appendChild(li);
    });
}

/** ラジオボタンで選択中のMy天体IDを取得 */
function getSelectedMyStarId() {
    const radio = document.querySelector('input[name="mystars-select"]:checked');
    return radio ? parseInt(radio.value) : null;
}

/** My天体を削除 */
function deleteMyStar() {
    const id = getSelectedMyStarId();
    if (id === null) return alert('削除するMy天体を選択してください');
    const star = appState.myStars.find(s => s.id === id);
    if (!star) return;
    if (!confirm(`My天体リストの天体(ID:${id}, ${star.name})を削除しますか？`)) return;
    appState.myStars = appState.myStars.filter(s => s.id !== id);
    syncMyStarsToBodies();
    saveAppState();
    renderMyStarsList();
    updateAll();
}

/** My天体を上に移動 */
function moveMyStarUp() {
    const id = getSelectedMyStarId();
    if (id === null) return;
    const idx = appState.myStars.findIndex(s => s.id === id);
    if (idx <= 0) return;
    [appState.myStars[idx - 1], appState.myStars[idx]] = [appState.myStars[idx], appState.myStars[idx - 1]];
    syncMyStarsToBodies();
    saveAppState();
    renderMyStarsList();
    // 選択状態を復元
    const radio = document.querySelector(`input[name="mystars-select"][value="${id}"]`);
    if (radio) radio.checked = true;
}

/** My天体を下に移動 */
function moveMyStarDown() {
    const id = getSelectedMyStarId();
    if (id === null) return;
    const idx = appState.myStars.findIndex(s => s.id === id);
    if (idx < 0 || idx >= appState.myStars.length - 1) return;
    [appState.myStars[idx], appState.myStars[idx + 1]] = [appState.myStars[idx + 1], appState.myStars[idx]];
    syncMyStarsToBodies();
    saveAppState();
    renderMyStarsList();
    const radio = document.querySelector(`input[name="mystars-select"][value="${id}"]`);
    if (radio) radio.checked = true;
}

/** 全角→半角変換 (名前以外の値用) */
function toHalfWidth(str) {
    return str.replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
              .replace(/　/g, ' ');
}

/** ファイル名用日時フォーマット (YYYYMMDD-hhmmss) */
function formatFileDateTime() {
    const d = new Date();
    const Y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, '0');
    const D = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${Y}${M}${D}-${h}${m}${s}`;
}

/** CSVのコメント行(1列目が半角#で始まる行)かどうかを判定する */
function isCsvCommentLine(line) {
    if (!line) return false;
    const firstCell = line.replace(/^﻿/, '').split(',')[0];
    return firstCell.trim().startsWith('#');
}

/** CSV入力 (My天体) */
function importMyStarsCsv() {
    if (!confirm('My天体リストにCSVファイルから全て上書き入力・登録しますか？')) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const text = ev.target.result;
                const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim() && !isCsvCommentLine(l));
                if (lines.length < 2) return alert('CSVファイルにデータがありません');
                if (lines.length > 1001) return alert('CSVの上限は1000件(見出し行+1000行)です');

                const newStars = [];
                const usedIds = new Set();
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',');
                    if (cols.length < 4) { alert(`${i + 1}行目: 列数が不足しています`); return; }
                    const id = parseInt(toHalfWidth(cols[0].trim()));
                    const name = cols[1].trim();
                    const ra = parseFloat(toHalfWidth(cols[2].trim()));
                    const dec = parseFloat(toHalfWidth(cols[3].trim()));
                    if (isNaN(id) || id < 1 || id > 1000) { alert(`${i + 1}行目: IDが無効です(1〜1000)`); return; }
                    if (usedIds.has(id)) { alert(`${i + 1}行目: ID ${id} が重複しています`); return; }
                    if (!name) { alert(`${i + 1}行目: 天体名が空です`); return; }
                    if (isNaN(ra) || isNaN(dec)) { alert(`${i + 1}行目: 赤経/赤緯が無効です`); return; }
                    usedIds.add(id);
                    newStars.push({ id, name, ra, dec, visible: false, color: '#DDA0DD', isDashed: true });
                }
                // CSVの読み込み順で登録（ID昇順ソートはしない）
                appState.myStars = newStars;
                syncMyStarsToBodies();
                saveAppState();
                renderMyStarsList();
                updateAll();
                alert(`${newStars.length}件のMy天体を登録しました`);
            } catch (err) {
                alert('CSVの読み込みに失敗しました: ' + err.message);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

/** 追加CSV入力 (My天体 — 既存リストに追加) */
function appendMyStarsCsv() {
    if (!confirm('My天体リストにCSVファイルから"追加"入力・登録しますか？')) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const text = ev.target.result;
                const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim() && !isCsvCommentLine(l));
                if (lines.length < 2) return alert('CSVファイルにデータがありません');

                const csvEntries = [];
                const csvIds = new Set();
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',');
                    if (cols.length < 4) { alert(`${i + 1}行目: 列数が不足しています`); return; }
                    const id = parseInt(toHalfWidth(cols[0].trim()));
                    const name = cols[1].trim();
                    const ra = parseFloat(toHalfWidth(cols[2].trim()));
                    const dec = parseFloat(toHalfWidth(cols[3].trim()));
                    if (isNaN(id) || id < 1 || id > 1000) { alert(`${i + 1}行目: IDが無効です(1〜1000)`); return; }
                    if (csvIds.has(id)) { alert(`CSV内でID ${id} が重複しています`); return; }
                    if (!name) { alert(`${i + 1}行目: 天体名が空です`); return; }
                    if (isNaN(ra) || isNaN(dec)) { alert(`${i + 1}行目: 赤経/赤緯が無効です`); return; }
                    csvIds.add(id);
                    csvEntries.push({ id, name, ra, dec });
                }

                let addedCount = 0;
                for (const entry of csvEntries) {
                    // 上限チェック
                    if (appState.myStars.length >= 1000) { alert('My天体の登録上限(1000件)に達しています'); return; }

                    // 赤経/赤緯が同じ既存エントリがあればスキップ
                    const duplicate = appState.myStars.some(s => s.ra === entry.ra && s.dec === entry.dec);
                    if (duplicate) continue;

                    // ID重複チェック
                    if (appState.myStars.some(s => s.id === entry.id)) {
                        const ok = confirm(`My天体(ID:${entry.id}、${entry.name})は、IDが重複しています。新規にIDを採番しますか？(OK→採番する、キャンセル→処理終了)`);
                        if (!ok) return;
                        entry.id = getNextMyStarId();
                        if (entry.id === null) { alert('My天体の登録上限(1000件)に達しています'); return; }
                    }

                    appState.myStars.push({
                        id: entry.id, name: entry.name, ra: entry.ra, dec: entry.dec,
                        visible: false, color: '#DDA0DD', isDashed: true
                    });
                    addedCount++;
                }

                syncMyStarsToBodies();
                saveAppState();
                renderMyStarsList();
                updateAll();
                alert(`${addedCount}件のMy天体を追加しました`);
            } catch (err) {
                alert('CSVの読み込みに失敗しました: ' + err.message);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

/** CSV出力 (My天体) */
function exportMyStarsCsv() {
    if (appState.myStars.length === 0) return alert('My天体が登録されていません');
    const targets = appState.myStars.filter(s => s.visible);
    if (targets.length === 0) return alert('CSV出力するMy天体が選択されていません');
    if (!confirm('チェックボックスで選択されたMy天体リストの登録内容をCSVファイルに出力しますか？')) return;
    const bom = '\uFEFF';
    let csv = bom + '天体ID,天体名,赤経,赤緯\r\n';
    targets.forEach(s => {
        csv += `${s.id},${s.name},${s.ra},${s.dec}\r\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soranotsuji-My天体-${formatFileDateTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================================
// 天体検索
// ============================================================

let CelestialDb = null; // celestial_db.json キャッシュ
let selectedSearchStar = null; // 検索で選択された天体

/** celestial_db.json をロード (キャッシュ) */
function loadCelestialDb() {
    if (CelestialDb) return Promise.resolve(CelestialDb);
    return fetch('celestial_db.json')
        .then(res => {
            if (!res.ok) throw new Error('celestial_db.json の読み込みに失敗しました');
            return res.json();
        })
        .then(data => {
            CelestialDb = data;
            return data;
        });
}

/** 天体検索を実行 */
function searchStars() {
    const keyword = document.getElementById('input-starsearch').value.trim();
    if (!keyword) return alert('検索キーワードを入力してください');

    const chkMag3 = document.getElementById('chk-search-mag3').checked;
    const chkMag6 = document.getElementById('chk-search-mag6').checked;
    const chkOther = document.getElementById('chk-search-other').checked;

    loadCelestialDb().then(db => {
        const results = db.filter(star => {
            // キーワードマッチ (name, keys)
            const text = `${star.name} ${star.keys || ''}`;
            if (!text.includes(keyword)) return false;
            // 等級フィルタ
            if (star.mag === null || star.mag === undefined) return chkOther;
            if (star.mag <= 3) return chkMag3;
            if (star.mag <= 6) return chkMag6;
            return chkOther;
        });
        showStarSearchPopup(results);
    }).catch(err => {
        alert('天体データの読み込みに失敗しました: ' + err.message);
    });
}

/** 検索ポップアップを表示 */
function showStarSearchPopup(results) {
    const popup = document.getElementById('starsearch-popup');
    const title = document.getElementById('starsearch-popup-title');
    const content = document.getElementById('starsearch-popup-content');

    title.textContent = `天体名検索結果（${results.length}件）`;
    content.innerHTML = '';

    if (results.length === 0) {
        content.innerHTML = '<div class="starsearch-no-result">該当する天体が見つかりませんでした</div>';
    } else {
        results.forEach(star => {
            const item = document.createElement('div');
            item.className = 'starsearch-result-item';
            item.innerHTML = `
                <div class="starsearch-result-name">${escapeHtml(star.name)}</div>
                <div class="starsearch-result-detail">${star.ra}, ${star.dec}</div>
                <div class="starsearch-result-detail">${star.mag !== null && star.mag !== undefined ? star.mag : '--'}, ${escapeHtml(star.type || '--')}</div>
                <div class="starsearch-result-keys">${escapeHtml(star.keys || '')}</div>`;
            item.addEventListener('click', () => selectSearchResult(star));
            content.appendChild(item);
        });
    }
    popup.classList.remove('hidden');
}

/** 検索結果を選択 */
function selectSearchResult(star) {
    selectedSearchStar = star;
    document.getElementById('input-starsearch-name').value = star.name;
    document.getElementById('input-starsearch-radec').value = `${star.ra}, ${star.dec}`;
    closeStarSearchPopup();
}

/** 検索ポップアップを閉じる */
function closeStarSearchPopup() {
    document.getElementById('starsearch-popup').classList.add('hidden');
}

/** 検索結果をMy天体に登録 */
function registerSearchStar() {
    const name = document.getElementById('input-starsearch-name').value.trim();
    const radecStr = document.getElementById('input-starsearch-radec').value.trim();
    if (!name || !radecStr) return alert('天体名と赤経赤緯を入力してください');
    const parts = radecStr.split(',').map(s => s.trim());
    if (parts.length !== 2) return alert('赤経赤緯の形式が不正です');
    const ra = parseFloat(parts[0]);
    const dec = parseFloat(parts[1]);
    if (isNaN(ra) || isNaN(dec)) return alert('赤経赤緯の値が不正です');
    if (!confirm(`検索天体をMy天体に登録しますか？(天体名と赤経赤緯は書き換えられます。)`)) return;
    if (addMyStar(name, ra, dec)) {
        // 入力フィールドをクリア
        document.getElementById('input-starsearch-name').value = '';
        document.getElementById('input-starsearch-radec').value = '';
        selectedSearchStar = null;
    }
}

// ============================================================
// バックアップ / インポート
// ============================================================

function exportBackup() {
    if (!confirm('Homeボタン、推し山ボタン、表示天体、My天体、My観測点、My目的点、My辻検索、設定のリストをバックアップファイルに全て出力しますか？')) return;
    const data = {
        backupDate: new Date().toISOString(),
        homeStart: appState.homeStart,
        homeEnd: appState.homeEnd,
        bodies: appState.bodies.filter(b => !b.isCustom).map(b => ({
            id: b.id, visible: b.visible, color: b.color, isDashed: b.isDashed
        })),
        myStars: appState.myStars,
        myObservations: appState.myObservations,
        myTargets: appState.myTargets,
        myTsujiSearches: appState.myTsujiSearches,
        settings: {
            refractionEnabled: appState.refractionEnabled,
            meteo: { p: appState.meteo.p, t: appState.meteo.t, l: appState.meteo.l }
        }
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soranotsuji-バックアップ-${formatFileDateTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importBackup() {
    if (!confirm('Homeボタン、推し山ボタン、表示天体、My天体、My観測点、My目的点、My辻検索、設定のリストをバックアップファイルから全て上書き入力・登録しますか？')) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.homeStart) appState.homeStart = data.homeStart;
                if (data.homeEnd) appState.homeEnd = data.homeEnd;
                if (data.bodies && Array.isArray(data.bodies)) {
                    data.bodies.forEach(b => {
                        const existing = appState.bodies.find(x => x.id === b.id && !x.isCustom);
                        if (existing) {
                            if (b.visible !== undefined) existing.visible = b.visible;
                            if (b.color !== undefined) existing.color = b.color;
                            if (b.isDashed !== undefined) existing.isDashed = b.isDashed;
                        }
                    });
                }
                if (data.myStars && Array.isArray(data.myStars)) {
                    appState.myStars = data.myStars;
                    syncMyStarsToBodies();
                }
                if (data.myObservations && Array.isArray(data.myObservations)) appState.myObservations = data.myObservations;
                if (data.myTargets && Array.isArray(data.myTargets)) appState.myTargets = data.myTargets;
                if (data.myTsujiSearches && Array.isArray(data.myTsujiSearches)) appState.myTsujiSearches = data.myTsujiSearches;
                if (data.settings) {
                    if (data.settings.refractionEnabled !== undefined) appState.refractionEnabled = data.settings.refractionEnabled;
                    if (data.settings.meteo) {
                        if (data.settings.meteo.p !== undefined) appState.meteo.p = data.settings.meteo.p;
                        if (data.settings.meteo.t !== undefined) appState.meteo.t = data.settings.meteo.t;
                        if (data.settings.meteo.l !== undefined) appState.meteo.l = data.settings.meteo.l;
                    }
                }
                saveAppState();
                syncUIFromState();
                // Homeボタン/推し山ボタンの押下状態を homeStart/homeEnd の有無で更新
                const btnRegStart = document.getElementById('btn-reg-start');
                const btnRegEnd = document.getElementById('btn-reg-end');
                if (appState.homeStart) {
                    btnRegStart.classList.add('active');
                    btnRegStart.title = '登録済みの観測点を呼び出し';
                } else {
                    btnRegStart.classList.remove('active');
                    btnRegStart.title = '';
                }
                if (appState.homeEnd) {
                    btnRegEnd.classList.add('active');
                    btnRegEnd.title = '登録済みの目的点を呼び出し';
                } else {
                    btnRegEnd.classList.remove('active');
                    btnRegEnd.title = '';
                }
                renderCelestialList();
                renderMyStarsList();
                renderMyPointsList('obs');
                renderMyPointsList('tgt');
                renderMyTsujiSearches();
                updateMyPointMarkers();
                updateAll();
                alert('バックアップファイルからインポートしました。');
            } catch (err) {
                alert('バックアップファイルの読み込みに失敗しました: ' + err.message);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

// ============================================================
// My観測点 / My目的点 — 共通関数
// ============================================================

let myObsDirty = false;
let myTgtDirty = false;
let myPointMarkerLayer = null; // マーカー用レイヤー

/** 型情報を返す */
function myPointConfig(type) {
    if (type === 'obs') return {
        list: () => appState.myObservations,
        setList: (v) => { appState.myObservations = v; },
        prefix: 'myobs', label: '観測点', labelFull: 'My観測点',
        markerColor: '#4CAF50', locKey: 'start',
        getDirty: () => myObsDirty, setDirty: (v) => { myObsDirty = v; }
    };
    return {
        list: () => appState.myTargets,
        setList: (v) => { appState.myTargets = v; },
        prefix: 'mytgt', label: '目的点', labelFull: 'My目的点',
        markerColor: '#FF9800', locKey: 'end',
        getDirty: () => myTgtDirty, setDirty: (v) => { myTgtDirty = v; }
    };
}

/** ID自動採番 (1〜1000の空き最小値) */
function getNextMyPointId(type) {
    const cfg = myPointConfig(type);
    const usedIds = new Set(cfg.list().map(p => p.id));
    for (let i = 1; i <= 1000; i++) { if (!usedIds.has(i)) return i; }
    return null;
}

/** dirty flag 更新 → 「全て登録」ボタンのスタイル変更 */
function setMyPointDirty(type, val) {
    const cfg = myPointConfig(type);
    cfg.setDirty(val);
    const btn = document.getElementById(`btn-${cfg.prefix}-regall`);
    if (btn) {
        if (val) { btn.classList.add('dirty'); }
        else { btn.classList.remove('dirty'); }
    }
}

/** リスト描画 */
function renderMyPointsList(type) {
    const cfg = myPointConfig(type);
    const container = document.getElementById(`${cfg.prefix}-list`);
    if (!container) return;
    while (container.firstChild) container.removeChild(container.firstChild);
    const points = cfg.list();
    if (points.length === 0) {
        container.innerHTML = `<div class="mystars-empty">${cfg.labelFull}は登録されていません</div>`;
        return;
    }
    points.forEach((pt, idx) => {
        const row = document.createElement('div');
        row.className = 'mypoint-row';
        row.innerHTML = `
            <hr class="tsujisearch-separator">
            <div class="mypoint-row-header">
                <input type="radio" name="${cfg.prefix}-select" value="${pt.id}" class="mystars-radio" ${idx === 0 ? 'checked' : ''}>
                <input type="checkbox" class="body-checkbox mypoint-check" data-id="${pt.id}" ${pt.checked ? 'checked' : ''} title="CSV出力の選択">
                <span class="mypoint-id">ID:${String(pt.id).padStart(4, ' ')}</span>
            </div>
            <div class="control-row">
                <input type="text" class="mypoint-name" value="${escapeHtml(pt.name)}" placeholder="${cfg.label}名" maxlength="150" data-id="${pt.id}" autocomplete="off">
            </div>
            <div class="control-row">
                <input type="text" class="mypoint-latlng" value="${pt.lat !== null && pt.lat !== undefined ? pt.lat + ', ' + pt.lng : ''}" placeholder="地名 住所 緯度,経度" maxlength="150" data-id="${pt.id}" autocomplete="off">
            </div>
            <div class="control-row">
                <label class="mypoint-label">標高:</label>
                <input type="number" class="mypoint-elev" value="${pt.elev !== null && pt.elev !== undefined ? pt.elev : ''}" placeholder="標高" step="0.1" data-id="${pt.id}">
                <label class="mypoint-label">高さ:</label>
                <input type="number" class="mypoint-height" value="${pt.height !== null && pt.height !== undefined ? pt.height : ''}" placeholder="高さ" step="0.1" data-id="${pt.id}">
            </div>
            <div class="control-row">
                <label class="mypoint-label">メモ:</label>
                <input type="text" class="mypoint-memo" value="${escapeHtml(pt.memo || '')}" placeholder="メモ(150文字)" maxlength="150" data-id="${pt.id}" autocomplete="off">
            </div>`;
        // イベント: 名前変更
        row.querySelector('.mypoint-name').addEventListener('input', () => setMyPointDirty(type, true));
        row.querySelector('.mypoint-name').addEventListener('change', (e) => {
            pt.name = e.target.value.trim();
            saveAppState();
            setMyPointDirty(type, true);
        });
        // イベント: 緯度経度変更 (Enter で地名検索 or 数値入力)
        const latlngInput = row.querySelector('.mypoint-latlng');
        latlngInput.addEventListener('keydown', async (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const val = latlngInput.value.trim();
            if (!val) return;
            // 緯度,経度 形式か判定
            const parts = val.split(',').map(s => s.trim());
            if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
                pt.lat = parseFloat(parts[0]);
                pt.lng = parseFloat(parts[1]);
                latlngInput.value = `${pt.lat}, ${pt.lng}`;
                // 標高取得
                const elev = await getElevation(pt.lat, pt.lng);
                pt.elev = elev !== null ? elev : 0;
                row.querySelector('.mypoint-elev').value = pt.elev;
                saveAppState();
                setMyPointDirty(type, true);
            } else {
                // 地名検索
                const results = await searchLocation(val);
                if (results && results.length > 0) {
                    showLocationPicker(results, async (selected) => {
                        pt.lat = selected.lat;
                        pt.lng = selected.lon;
                        latlngInput.value = `${pt.lat}, ${pt.lng}`;
                        const elev = await getElevation(pt.lat, pt.lng);
                        pt.elev = elev !== null ? elev : 0;
                        row.querySelector('.mypoint-elev').value = pt.elev;
                        saveAppState();
                        setMyPointDirty(type, true);
                    });
                } else {
                    alert('該当する場所が見つかりませんでした');
                }
            }
        });
        latlngInput.addEventListener('input', () => setMyPointDirty(type, true));
        // blur時に直接編集された数値を反映 (Enter押下を経由しない編集対応)
        latlngInput.addEventListener('change', () => {
            const val = latlngInput.value.trim();
            if (!val) {
                pt.lat = null;
                pt.lng = null;
                saveAppState();
                setMyPointDirty(type, true);
                return;
            }
            const parts = val.split(',').map(s => s.trim());
            if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
                pt.lat = parseFloat(parts[0]);
                pt.lng = parseFloat(parts[1]);
                saveAppState();
                setMyPointDirty(type, true);
            }
            // 非数値(地名)の場合はpt.lat/lngを更新しない(Enterで地名検索してもらう)
        });
        // イベント: 標高/高さ変更
        row.querySelector('.mypoint-elev').addEventListener('change', (e) => {
            pt.elev = parseFloat(e.target.value) || 0;
            saveAppState();
            setMyPointDirty(type, true);
        });
        row.querySelector('.mypoint-height').addEventListener('change', (e) => {
            pt.height = parseFloat(e.target.value) || 0;
            saveAppState();
            setMyPointDirty(type, true);
        });
        row.querySelector('.mypoint-memo').addEventListener('change', (e) => {
            pt.memo = e.target.value.trim();
            saveAppState();
            setMyPointDirty(type, true);
        });
        // イベント: CSV出力選択チェックボックス
        row.querySelector('.mypoint-check').addEventListener('change', (e) => {
            pt.checked = e.target.checked;
            saveAppState();
        });
        container.appendChild(row);
    });
}

/** 位置反映 */
function applyMyPoint(type) {
    const cfg = myPointConfig(type);
    const id = getSelectedMyPointId(type);
    if (id === null) return alert(`${cfg.label}を選択してください`);
    const pt = cfg.list().find(p => p.id === id);
    if (!pt || pt.lat === null || pt.lat === undefined) return alert('緯度経度が設定されていません');
    if (!confirm(`${cfg.label}（ID:${id}、${pt.name}）を位置情報メニューと地図に反映しますか？`)) return;
    const locKey = cfg.locKey;
    const totalElev = (pt.elev || 0) + (pt.height || 0);
    appState[locKey] = { lat: pt.lat, lng: pt.lng, elev: totalElev };
    if (locKey === 'start') {
        appState.startApiElev = pt.elev || 0;
        appState.startHeight = pt.height || 0;
    } else {
        appState.endApiElev = pt.elev || 0;
        appState.endHeight = pt.height || 0;
    }
    saveAppState();
    updateAll();
    // 地図の中心を移動
    if (typeof map !== 'undefined') map.setView([pt.lat, pt.lng], map.getZoom());
}

/** 観測点取得 / 目的点取得 */
function getMyPointFromLocation(type) {
    const cfg = myPointConfig(type);
    if (!confirm(`現在の位置情報（緯度経度・標高・高さ）を${cfg.labelFull}リストに追加しますか？`)) return;
    const id = getNextMyPointId(type);
    if (id === null) return alert(`${cfg.labelFull}の登録上限(1000件)に達しています`);
    const locKey = cfg.locKey;
    const loc = appState[locKey];
    const apiElev = locKey === 'start' ? appState.startApiElev : appState.endApiElev;
    const height = locKey === 'start' ? appState.startHeight : appState.endHeight;
    cfg.list().push({
        id, name: `新規${cfg.label}名`,
        lat: loc.lat, lng: loc.lng,
        elev: apiElev, height: height, memo: ''
    });
    saveAppState();
    setMyPointDirty(type, true);
    renderMyPointsList(type);
}

/** 全て登録 */
function registerAllMyPoints(type) {
    const cfg = myPointConfig(type);
    const points = cfg.list();
    // 未入力チェック
    for (const pt of points) {
        if (!pt.name || pt.lat === null || pt.lat === undefined || pt.lng === null || pt.lng === undefined) {
            document.getElementById(`${cfg.prefix}-error`).innerHTML =
                `<span class="mypoint-error-text">${cfg.label}ID:${pt.id}に未入力のものがあります。入力するか、行削除してください。</span>`;
            return;
        }
    }
    document.getElementById(`${cfg.prefix}-error`).innerHTML = '';
    if (!confirm(`現在の${cfg.labelFull}リストをローカルストレージに登録しますか？`)) return;
    points.forEach(pt => {
        pt.name = (pt.name || '').replace(/,/g, '，');
        pt.memo = (pt.memo || '').replace(/,/g, '，');
        if (typeof pt.lat === 'string') pt.lat = parseFloat(toHalfWidth(String(pt.lat)));
        if (typeof pt.lng === 'string') pt.lng = parseFloat(toHalfWidth(String(pt.lng)));
    });
    saveAppState();
    setMyPointDirty(type, false);
    updateMyPointMarkers();
    alert(`${cfg.labelFull}を登録しました`);
}

/** 行追加 */
function addMyPointRow(type) {
    const cfg = myPointConfig(type);
    if (cfg.list().length >= 1000) return alert(`${cfg.labelFull}の登録上限(1000件)に達しています`);
    if (!confirm(`${cfg.labelFull}リストの末尾に${cfg.label}の行を追加しますか？`)) return;
    const id = getNextMyPointId(type);
    if (id === null) return;
    // 末尾の行の次に追加
    const selId = getSelectedMyPointId(type);
    const idx = selId !== null ? cfg.list().findIndex(p => p.id === selId) : -1;
    const newPt = { id, name: '', lat: null, lng: null, elev: null, height: 0, memo: '' };
    if (idx >= 0) {
        cfg.list().push(newPt);   // 末尾の行の次に追加(デッサン変更に追従)
    } else {
        cfg.list().push(newPt);
    }
    saveAppState();
    setMyPointDirty(type, true);
    renderMyPointsList(type);
    // 新しい行を選択
    const radio = document.querySelector(`input[name="${cfg.prefix}-select"][value="${id}"]`);
    if (radio) radio.checked = true;
}

/** 行削除 */
function deleteMyPointRow(type) {
    const cfg = myPointConfig(type);
    const id = getSelectedMyPointId(type);
    if (id === null) return alert(`削除する${cfg.label}を選択してください`);
    const pt = cfg.list().find(p => p.id === id);
    if (!pt) return;
    if (!confirm(`${cfg.labelFull}リストの${cfg.label}（ID:${id}、${pt.name || ''}）を削除しますか？`)) return;
    cfg.setList(cfg.list().filter(p => p.id !== id));
    saveAppState();
    setMyPointDirty(type, true);
    renderMyPointsList(type);
}

/** 上に移動 */
function moveMyPointUp(type) {
    const cfg = myPointConfig(type);
    const id = getSelectedMyPointId(type);
    if (id === null) return;
    const idx = cfg.list().findIndex(p => p.id === id);
    if (idx <= 0) return;
    const list = cfg.list();
    [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
    saveAppState();
    setMyPointDirty(type, true);
    renderMyPointsList(type);
    const radio = document.querySelector(`input[name="${cfg.prefix}-select"][value="${id}"]`);
    if (radio) radio.checked = true;
}

/** 下に移動 */
function moveMyPointDown(type) {
    const cfg = myPointConfig(type);
    const id = getSelectedMyPointId(type);
    if (id === null) return;
    const list = cfg.list();
    const idx = list.findIndex(p => p.id === id);
    if (idx < 0 || idx >= list.length - 1) return;
    [list[idx], list[idx + 1]] = [list[idx + 1], list[idx]];
    saveAppState();
    setMyPointDirty(type, true);
    renderMyPointsList(type);
    const radio = document.querySelector(`input[name="${cfg.prefix}-select"][value="${id}"]`);
    if (radio) radio.checked = true;
}

/** 選択中のID取得 */
function getSelectedMyPointId(type) {
    const cfg = myPointConfig(type);
    const radio = document.querySelector(`input[name="${cfg.prefix}-select"]:checked`);
    return radio ? parseInt(radio.value) : null;
}

/** CSV入力 */
function importMyPointsCsv(type) {
    const cfg = myPointConfig(type);
    if (!confirm(`${cfg.labelFull}リストにCSVファイルから全て上書き入力・登録しますか？`)) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const text = ev.target.result;
                const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim() && !isCsvCommentLine(l));
                if (lines.length < 2) return alert('CSVファイルにデータがありません');
                if (lines.length > 1001) return alert('CSVの上限は1000件です');
                const newPoints = [];
                const usedIds = new Set();
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',');
                    if (cols.length < 6) { alert(`${i + 1}行目: 列数が不足しています(6列必要)`); return; }
                    const id = parseInt(toHalfWidth(cols[0].trim()));
                    const name = cols[1].trim();
                    const lat = parseFloat(toHalfWidth(cols[2].trim()));
                    const lng = parseFloat(toHalfWidth(cols[3].trim()));
                    let elev = cols[4].trim() === '' ? null : parseFloat(toHalfWidth(cols[4].trim()));
                    const height = parseFloat(toHalfWidth(cols[5].trim())) || 0;
                    const memo = (cols[6] !== undefined ? cols[6] : '').trim();
                    if (isNaN(id) || id < 1 || id > 1000) { alert(`${i + 1}行目: IDが無効です(1〜1000)`); return; }
                    if (usedIds.has(id)) { alert(`${i + 1}行目: ID ${id} が重複しています`); return; }
                    if (isNaN(lat) || isNaN(lng)) { alert(`${i + 1}行目: 緯度/経度が無効です`); return; }
                    usedIds.add(id);
                    // 標高が空の場合は後で取得
                    newPoints.push({ id, name, lat, lng, elev, height, memo });
                }
                // 標高が未設定の場合は取得
                for (const pt of newPoints) {
                    if (pt.elev === null || isNaN(pt.elev)) {
                        const el = await getElevation(pt.lat, pt.lng);
                        pt.elev = el !== null ? el : 0;
                    }
                }
                cfg.setList(newPoints);
                saveAppState();
                setMyPointDirty(type, false);
                renderMyPointsList(type);
                updateMyPointMarkers();
                alert(`${newPoints.length}件の${cfg.labelFull}を登録しました`);
            } catch (err) {
                alert('CSVの読み込みに失敗しました: ' + err.message);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

/** 追加CSV入力 (既存リストに追加) */
function appendMyPointsCsv(type) {
    const cfg = myPointConfig(type);
    if (!confirm(`${cfg.labelFull}リストにCSVファイルから"追加"入力・登録しますか？`)) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const text = ev.target.result;
                const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim() && !isCsvCommentLine(l));
                if (lines.length < 2) return alert('CSVファイルにデータがありません');

                const existingList = cfg.list();
                const csvEntries = [];
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',');
                    if (cols.length < 6) { alert(`${i + 1}行目: 列数が不足しています(6列必要)`); return; }
                    const id = parseInt(toHalfWidth(cols[0].trim()));
                    const name = cols[1].trim();
                    const lat = parseFloat(toHalfWidth(cols[2].trim()));
                    const lng = parseFloat(toHalfWidth(cols[3].trim()));
                    let elev = cols[4].trim() === '' ? null : parseFloat(toHalfWidth(cols[4].trim()));
                    const height = parseFloat(toHalfWidth(cols[5].trim())) || 0;
                    const memo = (cols[6] !== undefined ? cols[6] : '').trim();
                    if (isNaN(id) || id < 1 || id > 1000) { alert(`${i + 1}行目: IDが無効です(1〜1000)`); return; }
                    if (isNaN(lat) || isNaN(lng)) { alert(`${i + 1}行目: 緯度/経度が無効です`); return; }
                    csvEntries.push({ id, name, lat, lng, elev, height, memo });
                }

                // CSV内のID重複チェック
                const csvIds = new Set();
                for (const entry of csvEntries) {
                    if (csvIds.has(entry.id)) { alert(`CSV内でID ${entry.id} が重複しています`); return; }
                    csvIds.add(entry.id);
                }

                let addedCount = 0;
                for (const entry of csvEntries) {
                    // 上限チェック
                    if (existingList.length >= 1000) { alert(`${cfg.labelFull}の登録上限(1000件)に達しています`); return; }

                    // 標高が未設定の場合は取得
                    if (entry.elev === null || isNaN(entry.elev)) {
                        const el = await getElevation(entry.lat, entry.lng);
                        entry.elev = el !== null ? el : 0;
                    }
                    
                    // 緯度/経度/標高/高さが全て同じ既存エントリがあればスキップ
                    const duplicate = existingList.some(p =>
                        p.lat === entry.lat && p.lng === entry.lng &&
                        p.elev === entry.elev && p.height === entry.height
                    );
                    if (duplicate) continue;

                    // ID重複チェック
                    if (existingList.some(p => p.id === entry.id)) {
                        const ok = confirm(`${cfg.label}(ID:${entry.id}、${entry.name})は、IDが重複しています。新規にIDを採番しますか？(OK→採番する、キャンセル→処理終了)`);
                        if (!ok) return;
                        entry.id = getNextMyPointId(type);
                        if (entry.id === null) { alert(`${cfg.labelFull}の登録上限(1000件)に達しています`); return; }
                    }

                    existingList.push(entry);
                    addedCount++;
                }

                saveAppState();
                setMyPointDirty(type, false);
                renderMyPointsList(type);
                updateMyPointMarkers();
                alert(`${addedCount}件の${cfg.labelFull}を追加しました`);
            } catch (err) {
                alert('CSVの読み込みに失敗しました: ' + err.message);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

/** CSV出力 */
function exportMyPointsCsv(type) {
    const cfg = myPointConfig(type);
    if (cfg.list().length === 0) return alert(`${cfg.labelFull}が登録されていません`);
    const targets = cfg.list().filter(pt => pt.checked);
    if (targets.length === 0) return alert(`CSV出力する${cfg.labelFull}が選択されていません`);
    if (!confirm(`チェックボックスで選択された${cfg.labelFull}リストの登録内容をCSVファイルに出力しますか？`)) return;
    const bom = '\uFEFF';
    let csv = bom + `${cfg.label}ID,${cfg.label}名,緯度,経度,標高,高さ,メモ\r\n`;
    targets.forEach(pt => {
        csv += `${pt.id},${pt.name},${pt.lat},${pt.lng},${pt.elev !== null ? pt.elev : ''},${pt.height},${pt.memo || ''}\r\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soranotsuji-${cfg.labelFull}-${formatFileDateTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/** URL取得 */
function getMyPointUrl(type) {
    const cfg = myPointConfig(type);
    const id = getSelectedMyPointId(type);
    if (id === null) return alert(`${cfg.label}を選択してください`);
    const pt = cfg.list().find(p => p.id === id);
    if (!pt || pt.lat === null) return alert('緯度経度が設定されていません');
    const baseUrl = buildBaseUrl();
    const params = new URLSearchParams();
    params.set('mode', 'preview');
    if (cfg.locKey === 'start') {
        params.set('startLat', String(pt.lat));
        params.set('startLng', String(pt.lng));
        params.set('startApiElv', String(pt.elev || 0));
        params.set('startElv', String(pt.height || 0));
    } else {
        params.set('endLat', String(pt.lat));
        params.set('endLng', String(pt.lng));
        params.set('endApiElv', String(pt.elev || 0));
        params.set('endElv', String(pt.height || 0));
    }
    const url = `${baseUrl}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
        alert(`${cfg.labelFull}リストの${cfg.label}（ID:${id}、${pt.name}）を開くURLをクリップボードにコピーしました。`);
    }).catch(() => {
        alert('クリップボードへのコピーに失敗しました');
    });
}

/** マーカー更新 (My観測点 + My目的点) */
function updateMyPointMarkers() {
    if (!myPointMarkerLayer) {
        myPointMarkerLayer = L.layerGroup().addTo(map);
    }
    myPointMarkerLayer.clearLayers();
    // My観測点マーカー (緑)
    appState.myObservations.forEach(pt => {
        if (pt.lat === null || pt.lat === undefined) return;
        const icon = L.divIcon({
            className: '',
            html: '<div class="location-marker location-marker-myobs"></div>',
            iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24]
        });
        const marker = L.marker([pt.lat, pt.lng], { icon }).addTo(myPointMarkerLayer);
        marker.bindPopup(`
            <b>My観測点</b><br>
            ${escapeHtml(pt.name)}<br>
            ID: ${pt.id}<br>
            緯度: ${pt.lat}°<br>
            経度: ${pt.lng}°<br>
            標高: ${pt.elev !== null ? pt.elev : '--'} m<br>
            高さ: ${pt.height || 0} m
        `);
        marker.on('click', () => {
            appState.start = { lat: pt.lat, lng: pt.lng, elev: (pt.elev || 0) + (pt.height || 0) };
            appState.startApiElev = pt.elev || 0;
            appState.startHeight = pt.height || 0;
            // 位置情報メニューのラジオボタンも観測点選択へ移動する
            appState.locMode = 'start';
            const rs = document.getElementById('radio-start');
            if (rs) rs.checked = true;
            saveAppState();
            updateAll();
        });
    });
    // My目的点マーカー (橙)
    appState.myTargets.forEach(pt => {
        if (pt.lat === null || pt.lat === undefined) return;
        const icon = L.divIcon({
            className: '',
            html: '<div class="location-marker location-marker-mytgt"></div>',
            iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24]
        });
        const marker = L.marker([pt.lat, pt.lng], { icon }).addTo(myPointMarkerLayer);
        marker.bindPopup(`
            <b>My目的点</b><br>
            ${escapeHtml(pt.name)}<br>
            ID: ${pt.id}<br>
            緯度: ${pt.lat}°<br>
            経度: ${pt.lng}°<br>
            標高: ${pt.elev !== null ? pt.elev : '--'} m<br>
            高さ: ${pt.height || 0} m
        `);
        marker.on('click', () => {
            appState.end = { lat: pt.lat, lng: pt.lng, elev: (pt.elev || 0) + (pt.height || 0) };
            appState.endApiElev = pt.elev || 0;
            appState.endHeight = pt.height || 0;
            // 位置情報メニューのラジオボタンも目的点選択へ移動する
            appState.locMode = 'end';
            const re = document.getElementById('radio-end');
            if (re) re.checked = true;
            saveAppState();
            updateAll();
        });
    });
}

// ============================================================
// My辻検索 — 共通関数
// ============================================================

let myTsujiDirty = false;

/** dirty flag 更新 → 「全て登録」ボタンのスタイル変更 */
function setMyTsujiDirty(val) {
    myTsujiDirty = val;
    const btn = document.getElementById('btn-mytsuji-regall');
    if (btn) {
        if (val) { btn.classList.add('dirty'); }
        else { btn.classList.remove('dirty'); }
    }
}

/** 空きID番号の最小値を返す (1〜1000) */
function getNextMyTsujiId() {
    const usedIds = new Set(appState.myTsujiSearches.map(t => t.id));
    for (let i = 1; i <= 1000; i++) { if (!usedIds.has(i)) return i; }
    return null;
}

/** 選択中のID取得 */
function getSelectedMyTsujiId() {
    const radio = document.querySelector('input[name="mytsuji-select"]:checked');
    return radio ? parseInt(radio.value) : null;
}

/** オフセット方位距離・視高距離を再計算して返す */
function recalcMyTsujiOffsetDist(t) {
    const obs = appState.myObservations.find(o => o.id === t.obsId);
    const tgt = appState.myTargets.find(g => g.id === t.tgtId);
    if (!obs || !tgt || obs.lat == null || tgt.lat == null) return { azDist: 0, altDist: 0 };
    const dist = getDistanceWGS84(obs.lat, obs.lng, tgt.lat, tgt.lng);
    const azDist = dist * Math.tan((t.offsetAz || 0) * Math.PI / 180);
    const altDist = dist * Math.tan((t.offsetAlt || 0) * Math.PI / 180);
    return { azDist, altDist };
}

/** 行追加/削除/移動ボタンの活性状態を更新 */
function updateMyTsujiButtonStates() {
    const list = appState.myTsujiSearches;
    const addBtn = document.getElementById('btn-mytsuji-addrow');
    const delBtn = document.getElementById('btn-mytsuji-delrow');
    const upBtn = document.getElementById('btn-mytsuji-up');
    const dnBtn = document.getElementById('btn-mytsuji-down');
    if (addBtn) addBtn.disabled = list.length >= 1000;
    if (delBtn) delBtn.disabled = list.length === 0;
    if (upBtn) upBtn.disabled = list.length < 2;
    if (dnBtn) dnBtn.disabled = list.length < 2;
}

/** 位置情報メニューの観測点と一致するMy観測点IDを返す。なければ新規追加してそのIDを返す */
function findOrCreateMyObsFromCurrent() {
    const loc = appState.start;
    const apiElev = appState.startApiElev;
    const height = appState.startHeight;
    const match = appState.myObservations.find(o =>
        o.lat === loc.lat && o.lng === loc.lng &&
        o.elev === apiElev && o.height === height
    );
    if (match) return match.id;
    const newId = getNextMyPointId('obs');
    if (newId === null) { alert('My観測点の登録上限(1000件)に達しています'); return null; }
    appState.myObservations.push({
        id: newId, name: '新規観測点名',
        lat: loc.lat, lng: loc.lng,
        elev: apiElev, height: height, memo: ''
    });
    saveAppState();
    setMyPointDirty('obs', true);
    renderMyPointsList('obs');
    if (typeof updateMyPointMarkers === 'function') updateMyPointMarkers();
    return newId;
}

/** 位置情報メニューの目的点と一致するMy目的点IDを返す。なければ新規追加してそのIDを返す */
function findOrCreateMyTgtFromCurrent() {
    const loc = appState.end;
    const apiElev = appState.endApiElev;
    const height = appState.endHeight;
    const match = appState.myTargets.find(g =>
        g.lat === loc.lat && g.lng === loc.lng &&
        g.elev === apiElev && g.height === height
    );
    if (match) return match.id;
    const newId = getNextMyPointId('tgt');
    if (newId === null) { alert('My目的点の登録上限(1000件)に達しています'); return null; }
    appState.myTargets.push({
        id: newId, name: '新規目的点名',
        lat: loc.lat, lng: loc.lng,
        elev: apiElev, height: height, memo: ''
    });
    saveAppState();
    setMyPointDirty('tgt', true);
    renderMyPointsList('tgt');
    if (typeof updateMyPointMarkers === 'function') updateMyPointMarkers();
    return newId;
}

/** 行追加 (空の辻検索情報) */
function addMyTsujiRow() {
    if (appState.myTsujiSearches.length >= 1000) return alert('My辻検索の登録上限(1000件)に達しています');
    if (!confirm('My辻検索リストの末尾に辻検索の行を追加しますか？')) return;
    const id = getNextMyTsujiId();
    if (id === null) return;
    const selId = getSelectedMyTsujiId();
    const idx = selId !== null ? appState.myTsujiSearches.findIndex(t => t.id === selId) : -1;
    const newT = {
        id, name: '', days: 365,
        bodyIds: appState.bodies.filter(b => b.visible).map(b => b.id).join(':'),
        obsId: null, tgtId: null,
        baseAz: null, baseAlt: null,
        offsetAz: 0, offsetAlt: 0,
        toleranceAz: 15, toleranceAlt: 15,
        centerMode: 'point',   // 検索中心オプション: 'point'=オフセット点 / 'line'=基準点からオフセット点までの線
        mwOffsetAngle: Number(appState.mwOffsetAngle) || 0,   // 天の川オプション: 初期値は基本オプションの値(以後は行ごとに独立)
        moonFilter: false, moonBase: 14.8, moonTolerance: 2,
        accuracyFilter: false, accDblCircle: false, accCircle: false, accTriangle: false, accDash: false,
        elevationOption: false, elevOK: false, elevNG: false,
        timeFilter: false, startMode: 'sunset', startTime: '00:00', startPrePost: false, startPrePostDir: 'before', startOffset: '00:00', endMode: 'sunrise', endTime: '00:00', endPrePost: false, endPrePostDir: 'before', endOffset: '00:00',
        checked: false, memo: ''
    };
    appState.myTsujiSearches.push(newT);   // 末尾の行の次に追加(デッサン変更に追従)
    saveAppState();
    setMyTsujiDirty(true);
    renderMyTsujiSearches();
    const radio = document.querySelector(`input[name="mytsuji-select"][value="${id}"]`);
    if (radio) radio.checked = true;
}

/** 行削除 */
function deleteMyTsujiRow() {
    const id = getSelectedMyTsujiId();
    if (id === null) return alert('削除するMy辻検索を選択してください');
    const t = appState.myTsujiSearches.find(x => x.id === id);
    if (!t) return;
    if (!confirm(`My辻検索リストの辻検索（ID:${id}、${t.name || ''}）を削除しますか？`)) return;
    appState.myTsujiSearches = appState.myTsujiSearches.filter(x => x.id !== id);
    saveAppState();
    setMyTsujiDirty(true);
    renderMyTsujiSearches();
}

/** 上に移動 */
function moveMyTsujiUp() {
    const id = getSelectedMyTsujiId();
    if (id === null) return;
    const list = appState.myTsujiSearches;
    const idx = list.findIndex(t => t.id === id);
    if (idx <= 0) return;
    [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
    saveAppState();
    setMyTsujiDirty(true);
    renderMyTsujiSearches();
    const radio = document.querySelector(`input[name="mytsuji-select"][value="${id}"]`);
    if (radio) radio.checked = true;
}

/** 下に移動 */
function moveMyTsujiDown() {
    const id = getSelectedMyTsujiId();
    if (id === null) return;
    const list = appState.myTsujiSearches;
    const idx = list.findIndex(t => t.id === id);
    if (idx < 0 || idx >= list.length - 1) return;
    [list[idx], list[idx + 1]] = [list[idx + 1], list[idx]];
    saveAppState();
    setMyTsujiDirty(true);
    renderMyTsujiSearches();
    const radio = document.querySelector(`input[name="mytsuji-select"][value="${id}"]`);
    if (radio) radio.checked = true;
}

/** 辻検索取得: 現在の辻検索メニューの内容を1件のMy辻検索として追加 */
function getMyTsujiFromTsujiSearch() {
    if (appState.myTsujiSearches.length >= 1000) return alert('My辻検索の登録上限(1000件)に達しています');
    if (!confirm('現在の観測点/目的点の位置情報（緯度経度・標高・高さ）と、辻検索情報を、My辻検索リストに追加しますか？')) return;
    const id = getNextMyTsujiId();
    if (id === null) return;
    const obsId = findOrCreateMyObsFromCurrent();
    if (obsId === null) return;
    const tgtId = findOrCreateMyTgtFromCurrent();
    if (tgtId === null) return;
    appState.myTsujiSearches.push({
        id,
        name: '新規辻検索名',
        days: appState.tsujiSearchDays,
        bodyIds: appState.bodies.filter(b => b.visible).map(b => b.id).join(':'),
        obsId, tgtId,
        baseAz: appState.tsujiSearchBaseAz,
        baseAlt: appState.tsujiSearchBaseAlt,
        offsetAz: appState.tsujiSearchOffsetAz,
        offsetAlt: appState.tsujiSearchOffsetAlt,
        toleranceAz: appState.tsujiSearchToleranceAz,
        toleranceAlt: appState.tsujiSearchToleranceAlt,
        centerMode: appState.tsujiCenterMode === 'line' ? 'line' : 'point',   // 登録時点の辻検索メニューの検索中心オプション
        mwOffsetAngle: Number(appState.mwOffsetAngle) || 0,   // 登録時点の基本オプション値を初期値に(以後は行ごとに独立)
        moonFilter: appState.tsujiMoonFilterEnabled,
        moonBase: appState.tsujiMoonBase,
        moonTolerance: appState.tsujiMoonTolerance,
        accuracyFilter: appState.tsujiAccuracyFilterEnabled,
        accDblCircle: appState.tsujiAccDblCircle,
        accCircle: appState.tsujiAccCircle,
        accTriangle: appState.tsujiAccTriangle,
        accDash: appState.tsujiAccDash,
        elevationOption: appState.tsujiElevationOption, elevOK: appState.tsujiElevOK, elevNG: appState.tsujiElevNG,
        timeFilter: appState.tsujiTimeFilter, startMode: appState.tsujiStartMode, startTime: appState.tsujiStartTime, startPrePost: appState.tsujiStartPrePost, startPrePostDir: appState.tsujiStartPrePostDir, startOffset: appState.tsujiStartOffset, endMode: appState.tsujiEndMode, endTime: appState.tsujiEndTime, endPrePost: appState.tsujiEndPrePost, endPrePostDir: appState.tsujiEndPrePostDir, endOffset: appState.tsujiEndOffset,
        checked: false, memo: ''
    });
    saveAppState();
    setMyTsujiDirty(true);
    renderMyTsujiSearches();
    const radio = document.querySelector(`input[name="mytsuji-select"][value="${id}"]`);
    if (radio) radio.checked = true;
}

/** 全て登録: バリデーション + dirty flag クリア */
function registerAllMyTsuji() {
    const list = appState.myTsujiSearches;
    for (const t of list) {
        if (!t.name || t.days == null || !t.bodyIds ||
            t.obsId == null || t.tgtId == null ||
            t.baseAz == null || t.baseAlt == null) {
            document.getElementById('mytsuji-error').innerHTML =
                `<span class="mypoint-error-text">辻検索ID:${t.id}に未入力のものがあります。入力するか、行削除してください。</span>`;
            return;
        }
    }
    document.getElementById('mytsuji-error').innerHTML = '';
    if (!confirm('現在のMy辻検索リストをローカルストレージに登録しますか？')) return;
    list.forEach(t => {
        t.name = (t.name || '').replace(/,/g, '，');
        t.memo = (t.memo || '').replace(/,/g, '，');
    });
    saveAppState();
    setMyTsujiDirty(false);
    alert('My辻検索を登録しました');
}

/** 一括選択/一括解除トグル */
function toggleAllMyTsuji() {
    const btn = document.getElementById('btn-mytsuji-toggle-all');
    const isPressed = btn.classList.contains('mytsuji-toggle-active');
    const newState = !isPressed;
    if (newState) {
        btn.textContent = '一括解除';
        btn.classList.add('mytsuji-toggle-active');
    } else {
        btn.textContent = '一括選択';
        btn.classList.remove('mytsuji-toggle-active');
    }
    appState.myTsujiSearches.forEach(t => { t.checked = newState; });
    saveAppState();
    renderMyTsujiSearches();
}

/** 行エラー表示エリアにメッセージを設定 (空なら非表示) */
function renderMyTsujiRowError(row, messages) {
    const err = row.querySelector('.mytsuji-row-error');
    if (!err) return;
    if (!messages || messages.length === 0) {
        err.innerHTML = '';
    } else {
        err.innerHTML = `<span class="mypoint-error-text">${messages.join(' / ')}</span>`;
    }
}

/** 観測点ID/目的点IDの存在チェック。エラー配列を返す */
function validateMyTsujiRow(t, row) {
    const errors = [];
    if (t.obsId != null) {
        const obs = appState.myObservations.find(o => o.id === t.obsId);
        if (!obs) errors.push(`観測点ID:${t.obsId}はMy観測点リストに存在しません`);
    }
    if (t.tgtId != null) {
        const tgt = appState.myTargets.find(g => g.id === t.tgtId);
        if (!tgt) errors.push(`目的点ID:${t.tgtId}はMy目的点リストに存在しません`);
    }
    renderMyTsujiRowError(row, errors);
    return errors.length === 0;
}

/** 観測点ID/目的点IDから基準方位角/視高度を計算し、appState上の t を直接更新 (DOM非依存) */
function calcMyTsujiBaseValues(t) {
    if (t.obsId == null || t.tgtId == null) return false;
    const obs = appState.myObservations.find(o => o.id === t.obsId);
    const tgt = appState.myTargets.find(g => g.id === t.tgtId);
    if (!obs || !tgt || obs.lat == null || tgt.lat == null) return false;
    const obsElev = (obs.elev || 0) + (obs.height || 0);
    const tgtElev = (tgt.elev || 0) + (tgt.height || 0);
    const dist = getDistanceWGS84(obs.lat, obs.lng, tgt.lat, tgt.lng);
    const az = calculateBearing(obs.lat, obs.lng, tgt.lat, tgt.lng);
    const alt = calculateApparentAltitude(dist, obsElev, tgtElev, obs.lat, tgt.lat);
    t.baseAz = az;
    t.baseAlt = alt;
    return true;
}

/** 観測点ID/目的点IDから基準方位角/視高度を自動計算して appState と行DOM に反映 */
function autoCalcMyTsujiBase(t, row) {
    if (!calcMyTsujiBaseValues(t)) return;
    const azInput = row.querySelector('.mytsuji-base-az');
    const altInput = row.querySelector('.mytsuji-base-alt');
    if (azInput) azInput.value = t.baseAz != null ? t.baseAz.toFixed(4) : '';
    if (altInput) altInput.value = t.baseAlt != null ? t.baseAlt.toFixed(4) : '';
}

// ============================================================
// My辻検索 — CSV入出力 (Phase B)
// ============================================================

/** CSV 1行分をMy辻検索オブジェクトにパース。エラー時はalert + null。 */
function parseMyTsujiCsvLine(cols, lineNum) {
    if (cols.length < 6) { alert(`${lineNum}行目: 列数が不足しています(最低6列必要)`); return null; }
    const id = parseInt(toHalfWidth(cols[0].trim()));
    if (isNaN(id) || id < 1 || id > 1000) { alert(`${lineNum}行目: 辻検索IDが無効です(1〜1000)`); return null; }
    const name = cols[1].trim();  // 全角保持
    if (!name) { alert(`${lineNum}行目: 辻検索名が空です`); return null; }
    const days = parseInt(toHalfWidth(cols[2].trim()));
    if (isNaN(days) || days < 1 || days > 36500) { alert(`${lineNum}行目: 検索期間が無効です(1〜36500)`); return null; }
    const bodyIds = toHalfWidth(cols[3].trim());
    if (!bodyIds) { alert(`${lineNum}行目: 天体IDが空です`); return null; }
    const obsId = parseInt(toHalfWidth(cols[4].trim()));
    if (isNaN(obsId) || obsId < 1 || obsId > 1000) { alert(`${lineNum}行目: 観測点IDが無効です(1〜1000)`); return null; }
    const tgtId = parseInt(toHalfWidth(cols[5].trim()));
    if (isNaN(tgtId) || tgtId < 1 || tgtId > 1000) { alert(`${lineNum}行目: 目的点IDが無効です(1〜1000)`); return null; }
    // 7-8列目: 基準方位角/視高度 (空なら null で後から再計算)
    const baseAzStr = (cols[6] ?? '').trim();
    const baseAltStr = (cols[7] ?? '').trim();
    const baseAz = baseAzStr === '' ? null : parseFloat(toHalfWidth(baseAzStr));
    const baseAlt = baseAltStr === '' ? null : parseFloat(toHalfWidth(baseAltStr));
    if (baseAz !== null && isNaN(baseAz)) { alert(`${lineNum}行目: 基準方位角が無効です`); return null; }
    if (baseAlt !== null && isNaN(baseAlt)) { alert(`${lineNum}行目: 基準視高度が無効です`); return null; }
    // 9-15列目: 省略可。省略時はデフォルト値
    const parseNumOr = (v, def) => {
        if (v == null || v.trim() === '') return def;
        const n = parseFloat(toHalfWidth(v.trim()));
        return isNaN(n) ? def : n;
    };
    const offsetAz = parseNumOr(cols[8], 0);
    const offsetAlt = parseNumOr(cols[9], 0);
    const toleranceAz = Math.min(Math.max(parseNumOr(cols[10], 15), 0), 360);
    const toleranceAlt = Math.min(Math.max(parseNumOr(cols[11], 15), 0), 360);
    const parseBoolOr = (v) => {
        if (v == null) return false;
        const s = toHalfWidth(v.trim()).toUpperCase();
        return (s === 'ON' || s === '1' || s === 'TRUE');
    };
    // 旧形式は列数で判別して読み替える:
    //   ≦21列 = 初代(オフセット中心角・時間フィルタ・標高オプションなし)
    //    36列 = 検索中心の列が追加される前の形式
    //   ≧37列 = 現行(13列目に検索中心)
    const legacy = cols.length <= 21;
    const hasCenter = cols.length >= 37;
    // 13列目: 検索中心 (point/line。旧形式は point)
    const centerMode = hasCenter && toHalfWidth((cols[12] ?? '').trim()).toLowerCase() === 'line' ? 'line' : 'point';
    const ci = hasCenter ? 1 : 0;   // 検索中心の有無による以降の列シフト
    // オフセット中心角 (旧初代形式は基本オプションの現在値で補完)
    const mwOffsetAngle = legacy ? (Number(appState.mwOffsetAngle) || 0)
                                 : Math.min(Math.max(parseNumOr(cols[12 + ci], 0), -360), 360);
    // 月齢フィルタ/基準月齢/許容範囲月齢 (初代:13-15列目 / 36列:14-16列目 / 37列:15-17列目)
    const mi = legacy ? 12 : 13 + ci;
    const moonFilter = parseBoolOr(cols[mi]);
    const moonBase = Math.min(Math.max(parseNumOr(cols[mi + 1], 14.8), 0), 30);
    const moonTolerance = Math.min(Math.max(parseNumOr(cols[mi + 2], 2), 0), 15);
    // 時間フィルタ (新形式のみ: 17-27列目。モードは TSUJI_TIME_MODES の値か fixed)
    const modeOr = (v, def) => {
        const s = v == null ? '' : toHalfWidth(v.trim());
        return (s === 'fixed' || TSUJI_TIME_MODES.some(m => m.v === s)) ? s : def;
    };
    const hhmmOr = (v, def) => {
        const s = v == null ? '' : toHalfWidth(v.trim());
        return /^\d{1,2}:\d{2}$/.test(s) ? s : def;
    };
    const dirOr = (v, def) => {
        const s = v == null ? '' : toHalfWidth(v.trim()).toLowerCase();
        if (s === 'after' || s === '後') return 'after';
        if (s === 'before' || s === '前') return 'before';
        return def;
    };
    let timeFilter = false, startMode = 'sunset', startTime = '00:00', startPrePost = false, startPrePostDir = 'before', startOffset = '00:00';
    let endMode = 'sunrise', endTime = '00:00', endPrePost = false, endPrePostDir = 'before', endOffset = '00:00';
    if (!legacy) {
        timeFilter = parseBoolOr(cols[16 + ci]);
        startMode = modeOr(cols[17 + ci], 'sunset');
        startTime = hhmmOr(cols[18 + ci], '00:00');
        startPrePost = parseBoolOr(cols[19 + ci]);
        startPrePostDir = dirOr(cols[20 + ci], 'before');
        startOffset = hhmmOr(cols[21 + ci], '00:00');
        endMode = modeOr(cols[22 + ci], 'sunrise');
        endTime = hhmmOr(cols[23 + ci], '00:00');
        endPrePost = parseBoolOr(cols[24 + ci]);
        endPrePostDir = dirOr(cols[25 + ci], 'before');
        endOffset = hhmmOr(cols[26 + ci], '00:00');
    }
    // 精度フィルタ (初代:16-20列目 / それ以外は時間フィルタ群の後)
    const ai = legacy ? 15 : 27 + ci;
    const accuracyFilter = parseBoolOr(cols[ai]);
    const accDblCircle = parseBoolOr(cols[ai + 1]);
    const accCircle = parseBoolOr(cols[ai + 2]);
    const accTriangle = parseBoolOr(cols[ai + 3]);
    const accDash = parseBoolOr(cols[ai + 4]);
    // 標高オプション (初代以外)
    const elevationOption = legacy ? false : parseBoolOr(cols[32 + ci]);
    const elevOK = legacy ? false : parseBoolOr(cols[33 + ci]);
    const elevNG = legacy ? false : parseBoolOr(cols[34 + ci]);
    // メモ (末尾列)
    const memo = ((legacy ? cols[20] : cols[35 + ci]) ?? '').trim();
    return {
        id, name, days, bodyIds,
        obsId, tgtId,
        baseAz, baseAlt,
        offsetAz, offsetAlt,
        toleranceAz, toleranceAlt,
        centerMode,
        mwOffsetAngle,
        moonFilter, moonBase, moonTolerance,
        timeFilter, startMode, startTime, startPrePost, startPrePostDir, startOffset, endMode, endTime, endPrePost, endPrePostDir, endOffset,
        accuracyFilter, accDblCircle, accCircle, accTriangle, accDash,
        elevationOption, elevOK, elevNG,
        checked: false, memo
    };
}

/** 全CSV入力 (リスト全置換) */
function importMyTsujiCsv() {
    if (!confirm('My辻検索リストにCSVファイルから全て上書き入力・登録しますか？')) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const text = ev.target.result;
                const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim() && !isCsvCommentLine(l));
                if (lines.length < 2) return alert('CSVファイルにデータがありません');
                if (lines.length > 1001) return alert('CSVの上限は1000件です(ヘッダー行を除く)');
                const newList = [];
                const usedIds = new Set();
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',');
                    const t = parseMyTsujiCsvLine(cols, i + 1);
                    if (!t) return;
                    if (usedIds.has(t.id)) { alert(`${i + 1}行目: 辻検索ID ${t.id} が重複しています`); return; }
                    usedIds.add(t.id);
                    // 基準方位角/視高度が空なら観測点ID/目的点IDから再計算
                    if (t.baseAz === null || t.baseAlt === null) {
                        calcMyTsujiBaseValues(t);
                    }
                    newList.push(t);
                }
                appState.myTsujiSearches = newList;
                saveAppState();
                setMyTsujiDirty(false);
                renderMyTsujiSearches();
                alert(`${newList.length}件のMy辻検索を登録しました`);
            } catch (err) {
                alert('CSVの読み込みに失敗しました: ' + err.message);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

/** 追加CSV入力 (既存リストに追加) */
function appendMyTsujiCsv() {
    if (!confirm('My辻検索リストにCSVファイルから"追加"入力・登録しますか？')) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const text = ev.target.result;
                const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim() && !isCsvCommentLine(l));
                if (lines.length < 2) return alert('CSVファイルにデータがありません');

                // 全行パース
                const csvEntries = [];
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',');
                    const t = parseMyTsujiCsvLine(cols, i + 1);
                    if (!t) return;
                    csvEntries.push(t);
                }
                // CSV内ID重複チェック
                const csvIds = new Set();
                for (const entry of csvEntries) {
                    if (csvIds.has(entry.id)) { alert(`CSV内で辻検索ID ${entry.id} が重複しています`); return; }
                    csvIds.add(entry.id);
                }

                const existingList = appState.myTsujiSearches;
                let addedCount = 0;

                // 重複判定(辻検索IDと辻検索名以外が全て一致)
                const isContentDup = (a, b) =>
                    a.days === b.days && a.bodyIds === b.bodyIds &&
                    a.obsId === b.obsId && a.tgtId === b.tgtId &&
                    a.baseAz === b.baseAz && a.baseAlt === b.baseAlt &&
                    a.offsetAz === b.offsetAz && a.offsetAlt === b.offsetAlt &&
                    a.toleranceAz === b.toleranceAz && a.toleranceAlt === b.toleranceAlt &&
                    a.moonFilter === b.moonFilter &&
                    a.moonBase === b.moonBase && a.moonTolerance === b.moonTolerance;

                for (const entry of csvEntries) {
                    if (existingList.length >= 1000) { alert('My辻検索の登録上限(1000件)に達しています'); break; }
                    // 基準方位角/視高度が空なら再計算
                    if (entry.baseAz === null || entry.baseAlt === null) {
                        calcMyTsujiBaseValues(entry);
                    }
                    // 内容重複ならスキップ
                    if (existingList.some(x => isContentDup(x, entry))) continue;
                    // ID重複: 採番するか確認
                    if (existingList.some(x => x.id === entry.id)) {
                        const ok = confirm(`辻検索(ID:${entry.id}、${entry.name})は、IDが重複しています。新規にIDを採番しますか？(OK→採番する、キャンセル→処理終了)`);
                        if (!ok) break;
                        const newId = getNextMyTsujiId();
                        if (newId === null) { alert('My辻検索の登録上限(1000件)に達しています'); break; }
                        entry.id = newId;
                    }
                    existingList.push(entry);
                    addedCount++;
                }

                saveAppState();
                setMyTsujiDirty(false);
                renderMyTsujiSearches();
                alert(`${addedCount}件のMy辻検索を追加しました`);
            } catch (err) {
                alert('CSVの読み込みに失敗しました: ' + err.message);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

/** CSV文字列の生成(全36列。行の項目の並び順に対応)。入出力で同じ列構成を使う */
function _buildMyTsujiCsv(targets) {
    let csv = '辻検索ID,辻検索名,検索期間,天体ID,観測点ID,目的点ID,基準方位角,基準視高度,辻オフセット方位角,辻オフセット視高度,許容範囲方位角,許容範囲視高度,検索中心,オフセット中心角,月齢フィルタ,基準月齢,許容範囲月齢,時間フィルタ,開始時刻モード,開始時刻,開始前後指定,開始前後,開始前後時刻,終了時刻モード,終了時刻,終了前後指定,終了前後,終了前後時刻,精度フィルタ,精度◎フィルタ,精度○フィルタ,精度△フィルタ,精度-フィルタ,標高オプション,標高OKフィルタ,標高NGフィルタ,メモ\r\n';
    targets.forEach(t => {
        csv += [
            t.id,
            t.name ?? '',
            t.days ?? '',
            t.bodyIds ?? '',
            t.obsId ?? '',
            t.tgtId ?? '',
            t.baseAz ?? '',
            t.baseAlt ?? '',
            t.offsetAz ?? 0,
            t.offsetAlt ?? 0,
            t.toleranceAz ?? 15,
            t.toleranceAlt ?? 15,
            t.centerMode === 'line' ? 'line' : 'point',
            t.mwOffsetAngle ?? 0,
            t.moonFilter ? 'ON' : 'OFF',
            t.moonBase ?? 14.8,
            t.moonTolerance ?? 2,
            t.timeFilter ? 'ON' : 'OFF',
            t.startMode ?? 'sunset',
            t.startTime ?? '00:00',
            t.startPrePost ? 'ON' : 'OFF',
            t.startPrePostDir ?? 'before',
            t.startOffset ?? '00:00',
            t.endMode ?? 'sunrise',
            t.endTime ?? '00:00',
            t.endPrePost ? 'ON' : 'OFF',
            t.endPrePostDir ?? 'before',
            t.endOffset ?? '00:00',
            t.accuracyFilter ? 'ON' : 'OFF',
            t.accDblCircle ? 'ON' : 'OFF',
            t.accCircle ? 'ON' : 'OFF',
            t.accTriangle ? 'ON' : 'OFF',
            t.accDash ? 'ON' : 'OFF',
            t.elevationOption ? 'ON' : 'OFF',
            t.elevOK ? 'ON' : 'OFF',
            t.elevNG ? 'ON' : 'OFF',
            t.memo ?? ''
        ].join(',') + '\r\n';
    });
    return csv;
}

/** CSV出力 */
function exportMyTsujiCsv() {
    if (appState.myTsujiSearches.length === 0) return alert('My辻検索が登録されていません');
    const targets = appState.myTsujiSearches.filter(t => t.checked);
    if (targets.length === 0) return alert('CSV出力するMy辻検索が選択されていません');
    if (!confirm('チェックボックスで選択されたMy辻検索リストの登録内容をCSVファイルに出力しますか？')) return;
    const csv = '\uFEFF' + _buildMyTsujiCsv(targets);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soranotsuji-My辻検索-${formatFileDateTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================================
// My辻検索 — URL取得 (Phase C-1)
// ============================================================

/** URL取得: ポップアップで3種類のURLを選択 */
function getMyTsujiUrl() {
    const id = getSelectedMyTsujiId();
    if (id === null) return alert('URL取得するMy辻検索を選択してください');
    const t = appState.myTsujiSearches.find(x => x.id === id);
    if (!t) return;
    const obs = appState.myObservations.find(o => o.id === t.obsId);
    const tgt = appState.myTargets.find(g => g.id === t.tgtId);
    if (!obs || !tgt) return alert('観測点または目的点がMy観測点/My目的点リストに存在しません');
    toggleUrlPanel('mytsuji');
}

/** My辻検索のURLをビルドしてクリップボードにコピー */
function copyMyTsujiSearchUrl(includeDateTime) {
    const id = getSelectedMyTsujiId();
    if (id === null) return;
    const t = appState.myTsujiSearches.find(x => x.id === id);
    if (!t) return;
    const obs = appState.myObservations.find(o => o.id === t.obsId);
    const tgt = appState.myTargets.find(g => g.id === t.tgtId);
    if (!obs || !tgt) return;

    const d = appState.currentDate;
    const params = new URLSearchParams();
    if (includeDateTime === 'fixed') {
        params.set('date', formatDateForUrl(d));
        params.set('time', formatTimeForUrl(d));
        params.set('timeZone', getLocalTimezoneOffsetString());
    } else if (includeDateTime === 'semi-fixed') {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        params.set('date', `0000${mm}${dd}`);
        params.set('time', formatTimeForUrl(d));
        params.set('timeZone', getLocalTimezoneOffsetString());
    }
    params.set('startLat', String(obs.lat));
    params.set('startLng', String(obs.lng));
    params.set('startApiElv', String(obs.elev ?? 0));
    params.set('startElv', String(obs.height ?? 0));
    params.set('endLat', String(tgt.lat));
    params.set('endLng', String(tgt.lng));
    params.set('endApiElv', String(tgt.elev ?? 0));
    params.set('endElv', String(tgt.height ?? 0));
    (t.bodyIds || '').split(':').forEach(bid => {
        const v = bid.trim();
        if (v) params.append('starId', v);
    });
    params.set('tsujiSearchDays', String(t.days ?? 365));
    if (t.baseAz != null) params.set('tsujiAz', String(t.baseAz));
    if (t.baseAlt != null) params.set('tsujiAlt', String(t.baseAlt));
    params.set('tsujiAzOffset', String(t.offsetAz ?? 0));
    params.set('tsujiAltOffset', String(t.offsetAlt ?? 0));
    params.set('tsujiAzTolerance', String(t.toleranceAz ?? 15));
    params.set('tsujiAltTolerance', String(t.toleranceAlt ?? 15));
    params.set('tsujiCenterMode', t.centerMode === 'line' ? 'line' : 'point');
    params.set('tsujiMoonFilter', t.moonFilter ? 'true' : 'false');
    params.set('tsujiMoonBase', String(t.moonBase ?? 14.8));
    params.set('tsujiMoonTolerance', String(t.moonTolerance ?? 2));
    params.set('tsujiAccuracyFilter', t.accuracyFilter ? 'true' : 'false');
    params.set('tsujiAccDblCircle', t.accDblCircle ? 'true' : 'false');
    params.set('tsujiAccCircle', t.accCircle ? 'true' : 'false');
    params.set('tsujiAccTriangle', t.accTriangle ? 'true' : 'false');
    params.set('tsujiAccDash', t.accDash ? 'true' : 'false');
    params.set('mode', 'tsujisearch');

    const url = buildBaseUrl() + '?' + params.toString();
    navigator.clipboard.writeText(url).then(() => {
        alert(`My辻検索リストの辻検索（ID:${t.id}、${t.name || ''}）を開くURLをクリップボードにコピーしました。`);
    }).catch(err => {
        console.error('clipboard error:', err);
        prompt('URLをコピーしてください:', url);
    });
}

// ============================================================
// My辻検索 — 一括計算 (Phase C-2)
// ============================================================

/** 単一のMy辻検索行を実行し、body単位の結果配列を返す。
 *  chunkDoneCb は1チャンク (365日分) 完了ごとに呼ばれる (進捗バー用) */
async function executeSingleMyTsujiSearch(t, searchStartMsOverride, snapshotObs, snapshotTgt, chunkDoneCb) {
    const obsSource = snapshotObs || appState.myObservations;
    const tgtSource = snapshotTgt || appState.myTargets;
    const obs = obsSource.find(o => o.id === t.obsId);
    const tgt = tgtSource.find(g => g.id === t.tgtId);
    if (!obs || !tgt) return null;

    const observerData = {
        lat: obs.lat,
        lng: obs.lng,
        elev: (obs.elev || 0) + (obs.height || 0)
    };
    const refractionEnabled = appState.refractionEnabled;
    let searchStartMs;
    if (searchStartMsOverride != null) {
        searchStartMs = searchStartMsOverride;
    } else {
        const searchStart = new Date(appState.currentDate);
        searchStart.setHours(0, 0, 0, 0);
        searchStartMs = searchStart.getTime();
    }
    const MAX_RESULTS_PER_BODY = 36500;

    const targetAz = ((t.baseAz || 0) + (t.offsetAz || 0) + 360) % 360;
    const targetAlt = (t.baseAlt || 0) + (t.offsetAlt || 0);
    const toleranceAz = t.toleranceAz || 15;
    const toleranceAlt = t.toleranceAlt || 15;

    const bodyIds = (t.bodyIds || '').split(':').map(s => s.trim()).filter(Boolean);
    const bodies = bodyIds.map(bid => appState.bodies.find(b => b.id === bid)).filter(Boolean);
    if (bodies.length === 0) return { tsuji: t, obs, tgt, bodyResults: [] };

    // 全天体・全チャンクをプールに一括投入し、並列処理する
    const perBodyChunks = bodies.map(body => {
        let bodyMsg;
        if (body.id === 'MilkyWay') {
            const rd = _myTsujiMwRaDec(t);   // 天の川はこの行のオフセット中心角を使う(基本オプションとは連動しない)
            bodyMsg = { id: body.id, fixed: true, ra: rd.ra, dec: rd.dec };
        } else if (isFixedStar(body.id)) {
            const rd = getFixedStarRaDec(body.id);
            bodyMsg = { id: body.id, fixed: true, ra: rd.ra, dec: rd.dec };
        } else {
            bodyMsg = { id: body.id, fixed: false };
        }
        return { body, bodyMsg };
    });

    const bodyChunkResults = await Promise.all(perBodyChunks.map(({ bodyMsg }) =>
        runTsujiChunks({
            bodyMsg, observerData, refractionEnabled,
            targetAz, targetAlt, toleranceAz, toleranceAlt,
            centerMode: t.centerMode, centerAz0: ((t.baseAz || 0) + 360) % 360, centerAlt0: t.baseAlt || 0,   // 検索中心オプション(行ごとに独立)
            searchStartMs, days: t.days,
            maxResults: MAX_RESULTS_PER_BODY,
            onChunkDone: chunkDoneCb
        })
    ));

    const bodyResults = perBodyChunks.map(({ body }, bi) => {
        const chunkResults = bodyChunkResults[bi];
        const flatResults = [];
        let limitReached = false;
        for (const ch of chunkResults) {
            for (const r of ch.results) {
                flatResults.push({
                    time: new Date(r.timeMs),
                    azimuth: r.azimuth,
                    altitude: r.altitude,
                    dist: r.dist
                });
                if (flatResults.length >= MAX_RESULTS_PER_BODY) { limitReached = true; break; }
            }
            if (limitReached) break;
        }
        return { body, results: flatResults, limitReached };
    });

    return { tsuji: t, obs, tgt, bodyResults };
}

/** 結果オブジェクトの配列に装飾情報(symbol/moonAge/moonIcon/dateStr/timeStr)を付加。
 *  月齢フィルタで除外される行は null として filter */
async function decorateMyTsujiResults(results) {
    const moonIcons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    const twCache = new Map();
    // 標高オプション: (観測点ID,目的点ID)毎に1回だけ可視判定 (entry.elevationOption が ON のもの)
    const visCache = new Map();
    for (const r of results) {
        if (!r.tsuji.elevationOption) continue;
        const vkey = `${r.obs.id}_${r.tgt.id}`;
        if (visCache.has(vkey)) continue;
        const sTot = (r.obs.elev || 0) + (r.obs.height || 0);
        const eTot = (r.tgt.elev || 0) + (r.tgt.height || 0);
        const v = await computePathVisibility(r.obs.lat, r.obs.lng, sTot, r.tgt.lat, r.tgt.lng, eTot);
        visCache.set(vkey, v.visible ? 'OK' : 'NG');
    }
    const decorated = [];
    for (const r of results) {
        const phase = Astronomy.MoonPhase(r.time);
        const moonAge = (phase / 360) * SYNODIC_MONTH;
        const moonIcon = moonIcons[Math.round(phase / 45) % 8];
        let symbol;
        if (r.dist <= 0.125) symbol = '◎';
        else if (r.dist <= 0.25) symbol = '○';
        else if (r.dist <= 1.0) symbol = '△';
        else symbol = '-';
        if (r.tsuji.moonFilter && !isMoonAgeInRange(moonAge, r.tsuji.moonBase ?? 15, r.tsuji.moonTolerance ?? 2)) continue;
        if (r.tsuji.accuracyFilter) {
            const allowed = [];
            if (r.tsuji.accDblCircle) allowed.push('◎');
            if (r.tsuji.accCircle) allowed.push('○');
            if (r.tsuji.accTriangle) allowed.push('△');
            if (r.tsuji.accDash) allowed.push('-');
            if (allowed.length > 0 && !allowed.includes(symbol)) continue;
        }
        // 標高オプション: 可視判定の結果(OK/NG/-)とOK/NGフィルタ
        const elevationStatus = r.tsuji.elevationOption ? (visCache.get(`${r.obs.id}_${r.tgt.id}`) || '-') : '-';
        if (r.tsuji.elevationOption && (r.tsuji.elevOK || r.tsuji.elevNG)) {
            const allowedElev = [];
            if (r.tsuji.elevOK) allowedElev.push('OK');
            if (r.tsuji.elevNG) allowedElev.push('NG');
            if (!allowedElev.includes(elevationStatus)) continue;
        }
        const dt = r.time;
        const dow = ['日','月','火','水','木','金','土'][dt.getDay()];
        const dateStr = `${dt.getFullYear()}年${String(dt.getMonth()+1).padStart(2,'0')}月${String(dt.getDate()).padStart(2,'0')}日`;
        const dowStr = `(${dow})`;
        const timeStr = `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}:${String(dt.getSeconds()).padStart(2,'0')}`;
        const observer = new Astronomy.Observer(r.obs.lat, r.obs.lng, (r.obs.elev || 0) + (r.obs.height || 0));
        const angularRadius = getBodyAngularRadius(r.body.id, dt, observer);
        // 日の出/日の入/月の出/月の入時刻 (panel/CSV共通)
        const startOfDay = new Date(dt); startOfDay.setHours(0,0,0,0);
        const twKey = `${r.obs.lat},${r.obs.lng},${(r.obs.elev||0)+(r.obs.height||0)}|${startOfDay.getTime()}`;
        let tw = twCache.get(twKey);
        if (!tw) { tw = computeDayTwilight(startOfDay, observer); twCache.set(twKey, tw); }
        const timeCategory = classifyTimeCategory(dt, tw, startOfDay);
        // 時間フィルタ: 辻時刻がその日の範囲外ならスキップ
        if (r.tsuji.timeFilter) {
            const fs = {
                startMode: r.tsuji.startMode || 'sunset', startTime: r.tsuji.startTime || '00:00', startPrePost: !!r.tsuji.startPrePost, startPrePostDir: r.tsuji.startPrePostDir || 'before', startOffset: r.tsuji.startOffset || '00:00',
                endMode: r.tsuji.endMode || 'sunrise', endTime: r.tsuji.endTime || '00:00', endPrePost: !!r.tsuji.endPrePost, endPrePostDir: r.tsuji.endPrePostDir || 'before', endOffset: r.tsuji.endOffset || '00:00',
            };
            if (!passesTimeFilter(dt, tw, fs)) continue;
        }
        let sunriseStr = '--:--:--', sunsetStr = '--:--:--', moonriseStr = '--:--:--', moonsetStr = '--:--:--';
        try {
            sunriseStr = fmtHms(Astronomy.SearchRiseSet('Sun', observer, +1, startOfDay, 1));
            sunsetStr  = fmtHms(Astronomy.SearchRiseSet('Sun', observer, -1, startOfDay, 1));
            moonriseStr = fmtHms(Astronomy.SearchRiseSet('Moon', observer, +1, startOfDay, 2));
            moonsetStr  = fmtHms(Astronomy.SearchRiseSet('Moon', observer, -1, startOfDay, 2));
        } catch (_) {}
        decorated.push({ ...r, symbol, dateStr, dowStr, timeStr, moonAge, moonIcon, angularRadius, timeCategory,
                 elevationStatus, sunriseStr, sunsetStr, moonriseStr, moonsetStr });
    }
    return decorated;
}

// 一括計算 / File取得の実行状態とキャンセルフラグ (独立管理)
let myTsujiBatchRunning = false;
let myTsujiBatchCanceled = false;
let myTsujiFileRunning = false;
let myTsujiFileCanceled = false;
// 世代カウンタ: 強制キャンセル時にインクリメントし、orphan asyncが自身の最終クリーンアップをスキップする
let myTsujiBatchGen = 0;
let myTsujiFileGen = 0;

/** 辻検索パネルの進捗バーを更新 */
function setTsujiProgress(current, total) {
    const bar = document.getElementById('tsujisearch-progress');
    const fill = document.getElementById('tsujisearch-progress-fill');
    if (!bar || !fill || !total) return;
    bar.classList.remove('hidden');
    const pct = Math.max(0, Math.min(100, Math.round(current / total * 100)));
    fill.style.width = `${pct}%`;
}
function hideTsujiProgress() {
    const bar = document.getElementById('tsujisearch-progress');
    if (bar) bar.classList.add('hidden');
}

/** 一括計算/File取得を強制キャンセル (相手側の起動前に呼ぶ)
 *  プール内のワーカーを terminate することで、ペンディング中の Promise が
 *  reject され、orphan async が await から抜けて正常終了できる。 */
async function forceCancelMyTsujiBatch() {
    myTsujiBatchCanceled = true;
    myTsujiBatchGen++;
    tsujiPool.terminateAll();
    myTsujiBatchRunning = false;
    document.getElementById('btn-mytsuji-batch').classList.remove('active');
    hideTsujiProgress();
    await new Promise(r => setTimeout(r, 0));
}
async function forceCancelMyTsujiFile() {
    myTsujiFileCanceled = true;
    myTsujiFileGen++;
    tsujiPool.terminateAll();
    myTsujiFileRunning = false;
    document.getElementById('btn-mytsuji-file').classList.remove('active');
    hideTsujiProgress();
    await new Promise(r => setTimeout(r, 0));
}

/** 一括計算 — チェック済みMy辻検索を全て実行し、結果を専用パネルに表示 */
async function runBatchMyTsujiSearch() {
    const checked = appState.myTsujiSearches.filter(t => t.checked);
    if (checked.length === 0) return alert('一括計算するMy辻検索をチェックしてください');
    if (!confirm('チェックされた辻検索を実行しますか？')) return;

    const myGen = ++myTsujiBatchGen;
    myTsujiBatchRunning = true;
    myTsujiBatchCanceled = false;
    document.getElementById('btn-mytsuji-batch').classList.add('active');

    showTsujiPanelForMyTsuji('My辻検索結果');
    const content = document.getElementById('tsujisearch-content');
    const statusEl = document.getElementById('tsujisearch-status');
    content.innerHTML = '';

    // 計算開始時の日時・観測点・目的点を固定 (計算中にユーザーが変更しても影響しない)
    const batchStartDate = new Date(appState.currentDate);
    batchStartDate.setHours(0, 0, 0, 0);
    const batchStartMs = batchStartDate.getTime();
    const snapshotObs = JSON.parse(JSON.stringify(appState.myObservations));
    const snapshotTgt = JSON.parse(JSON.stringify(appState.myTargets));

    // 進捗バーの分母 = 全行 × 各行の天体数 × 各天体あたりのチャンク数 (365日単位)
    const totalChunks = checked.reduce((sum, t) => {
        const ids = (t.bodyIds || '').split(':').map(s => s.trim()).filter(Boolean);
        const chunksPerBody = Math.ceil((t.days || 0) / TSUJI_CHUNK_DAYS);
        return sum + Math.max(1, ids.length) * Math.max(1, chunksPerBody);
    }, 0);
    let doneChunks = 0;
    setTsujiProgress(0, totalChunks);
    const chunkDoneCb = () => {
        doneChunks++;
        setTsujiProgress(doneChunks, totalChunks);
    };

    const allResults = [];
    for (let i = 0; i < checked.length; i++) {
        if (myGen !== myTsujiBatchGen) return; // 強制キャンセル済 (新規起動済)
        if (myTsujiBatchCanceled) { statusEl.textContent = `(キャンセルされました)`; break; }
        const t = checked[i];
        statusEl.textContent = `⏳ 実行中... ${i+1}/${checked.length} (ID:${t.id} ${t.name || ''})`;
        const res = await executeSingleMyTsujiSearch(t, batchStartMs, snapshotObs, snapshotTgt, chunkDoneCb);
        if (myGen !== myTsujiBatchGen) return;
        if (!res) continue;
        for (const br of res.bodyResults) {
            for (const r of br.results) {
                allResults.push({
                    tsuji: t, obs: res.obs, tgt: res.tgt,
                    body: br.body,
                    time: r.time, azimuth: r.azimuth, altitude: r.altitude, dist: r.dist
                });
            }
        }
    }

    if (myGen !== myTsujiBatchGen) return;
    myTsujiBatchRunning = false;
    document.getElementById('btn-mytsuji-batch').classList.remove('active');

    const decorated = await decorateMyTsujiResults(allResults);
    if (!myTsujiBatchCanceled) statusEl.textContent = `${decorated.length}件`;
    hideTsujiProgress();
    if (decorated.length === 0) {
        content.innerHTML = '<div style="padding:8px;color:#999;">該当する日時はありません</div>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'td-table';
    table.innerHTML = `<thead><tr>
        <th>辻検索ID</th><th>辻検索名</th>
        <th>天体ID</th><th>天体名</th>
        <th>観測点ID</th><th>観測点名</th>
        <th>目的点ID</th><th>目的点名</th>
        <th>精度記号</th><th>精度角距離</th>
        <th>日付</th><th>曜日</th><th>辻時刻</th><th>時間帯</th>
        <th>日の出時刻</th><th>日の入時刻</th>
        <th>月の出時刻</th><th>月の入時刻</th>
        <th>月齢</th><th>月齢アイコン</th>
        <th>方位角</th><th>視高度</th><th>視半径</th><th>天体方位角差</th><th>天体視高度差</th><th>オフセット中心角</th><th>標高グラフ</th>
    </tr></thead><tbody></tbody>`;
    const tbody = table.querySelector('tbody');

    const renderMyTsujiResultRow = (r) => {
        const tr = document.createElement('tr');
        tr.className = 'td-data-row';
        tr.style.color = r.body.color;
        const angRDisplay = BODY_RADIUS_KM[r.body.id] ? r.angularRadius.toFixed(3) + '°' : '-.---°';
        tr.innerHTML = `
            <td>${r.tsuji.id}</td>
            <td>${escapeHtml(r.tsuji.name || '')}</td>
            <td>${escapeHtml(r.body.id)}</td>
            <td>${escapeHtml(r.body.name || '')}</td>
            <td>${r.obs.id ?? ''}</td>
            <td>${escapeHtml(r.obs.name || '')}</td>
            <td>${r.tgt.id ?? ''}</td>
            <td>${escapeHtml(r.tgt.name || '')}</td>
            <td>${r.symbol}</td>
            <td>${r.dist.toFixed(5)}°</td>
            <td>${r.dateStr}</td>
            <td>${r.dowStr}</td>
            <td>${r.timeStr}</td>
            <td>${escapeHtml(r.timeCategory)}</td>
            <td>${r.sunriseStr}</td>
            <td>${r.sunsetStr}</td>
            <td>${r.moonriseStr}</td>
            <td>${r.moonsetStr}</td>
            <td>${r.moonAge.toFixed(1)}</td>
            <td>${r.moonIcon}</td>
            <td>${r.azimuth.toFixed(4)}°</td>
            <td>${r.altitude.toFixed(4)}°</td>
            <td>${angRDisplay}</td>
            <td>${fmtSignedDeg(azDiffDeg(r.azimuth, r.tsuji.baseAz || 0))}</td>
            <td>${fmtSignedDeg(r.altitude - (r.tsuji.baseAlt || 0))}</td>
            <td>${(Number(r.tsuji.mwOffsetAngle) || 0).toFixed(4)}°</td>
            <td>${escapeHtml(r.elevationStatus)}</td>`;
        tr.addEventListener('click', () => {
            appState.startApiElev = r.obs.elev || 0;
            appState.startHeight = r.obs.height || 0;
            appState.start = { lat: r.obs.lat, lng: r.obs.lng, elev: appState.startApiElev + appState.startHeight };
            appState.endApiElev = r.tgt.elev || 0;
            appState.endHeight = r.tgt.height || 0;
            appState.end = { lat: r.tgt.lat, lng: r.tgt.lng, elev: appState.endApiElev + appState.endHeight };
            appState.currentDate = new Date(r.time);
            syncUIFromState();
            updateAll();
        });
        return tr;
    };

    decorated.forEach(r => tbody.appendChild(renderMyTsujiResultRow(r)));
    content.appendChild(table);

    const symbolRank = { '◎': 0, '○': 1, '△': 2, '-': 3 };
    setupTableSort(table, decorated, [
        { label: '辻検索ID', compare: (a, b) => a.tsuji.id - b.tsuji.id },
        { label: '辻検索名', compare: (a, b) => (a.tsuji.name || '').localeCompare(b.tsuji.name || '') },
        { label: '天体ID', compare: (a, b) => a.body.id.localeCompare(b.body.id) },
        { label: '天体名', compare: (a, b) => (a.body.name || '').localeCompare(b.body.name || '') },
        { label: '観測点ID', compare: (a, b) => (a.obs.id ?? 0) - (b.obs.id ?? 0) },
        { label: '観測点名', compare: (a, b) => (a.obs.name || '').localeCompare(b.obs.name || '') },
        { label: '目的点ID', compare: (a, b) => (a.tgt.id ?? 0) - (b.tgt.id ?? 0) },
        { label: '目的点名', compare: (a, b) => (a.tgt.name || '').localeCompare(b.tgt.name || '') },
        { label: '精度記号', compare: (a, b) => (symbolRank[a.symbol] ?? 9) - (symbolRank[b.symbol] ?? 9) },
        { label: '精度角距離', compare: (a, b) => a.dist - b.dist },
        { label: '日付', compare: (a, b) => a.time - b.time },
        { label: '曜日', compare: (a, b) => a.time.getDay() - b.time.getDay() },
        { label: '辻時刻', compare: (a, b) => a.timeStr.localeCompare(b.timeStr) },
        { label: '時間帯', compare: (a, b) => TIME_CATEGORY_LABELS.indexOf(a.timeCategory) - TIME_CATEGORY_LABELS.indexOf(b.timeCategory) },
        { label: '日の出時刻', compare: (a, b) => a.sunriseStr.localeCompare(b.sunriseStr) },
        { label: '日の入時刻', compare: (a, b) => a.sunsetStr.localeCompare(b.sunsetStr) },
        { label: '月の出時刻', compare: (a, b) => a.moonriseStr.localeCompare(b.moonriseStr) },
        { label: '月の入時刻', compare: (a, b) => a.moonsetStr.localeCompare(b.moonsetStr) },
        { label: '月齢', compare: (a, b) => a.moonAge - b.moonAge },
        { label: '月齢アイコン', compare: (a, b) => a.moonIcon.localeCompare(b.moonIcon) },
        { label: '方位角', compare: (a, b) => a.azimuth - b.azimuth },
        { label: '視高度', compare: (a, b) => a.altitude - b.altitude },
        { label: '視半径', compare: (a, b) => a.angularRadius - b.angularRadius },
        { label: '天体方位角差', compare: (a, b) => azDiffDeg(a.azimuth, a.tsuji.baseAz || 0) - azDiffDeg(b.azimuth, b.tsuji.baseAz || 0) },
        { label: '天体視高度差', compare: (a, b) => (a.altitude - (a.tsuji.baseAlt || 0)) - (b.altitude - (b.tsuji.baseAlt || 0)) },
        { label: 'オフセット中心角', compare: (a, b) => (Number(a.tsuji.mwOffsetAngle) || 0) - (Number(b.tsuji.mwOffsetAngle) || 0) },
        { label: '標高グラフ', compare: (a, b) => String(a.elevationStatus).localeCompare(String(b.elevationStatus)) },
    ], renderMyTsujiResultRow);
}

// ============================================================
// My辻検索 — File取得 (Phase C-3)
// ============================================================

/** Date を HH:mm:ss 形式にフォーマット (null時は '--:--:--') */
function fmtHms(d) {
    if (!d) return '--:--:--';
    const x = d instanceof Date ? d : (d.date || d);
    return `${String(x.getHours()).padStart(2,'0')}:${String(x.getMinutes()).padStart(2,'0')}:${String(x.getSeconds()).padStart(2,'0')}`;
}

/** decorated 結果1件分をCSV行の配列へ変換 */
function buildMyTsujiCsvRow(r) {
    const dt = r.time;
    const startOfDay = new Date(dt);
    startOfDay.setHours(0, 0, 0, 0);
    const observer = new Astronomy.Observer(r.obs.lat, r.obs.lng, (r.obs.elev || 0) + (r.obs.height || 0));

    let sr, ss, mr, ms;
    try {
        sr = Astronomy.SearchRiseSet('Sun', observer, +1, startOfDay, 1);
        ss = Astronomy.SearchRiseSet('Sun', observer, -1, startOfDay, 1);
        mr = Astronomy.SearchRiseSet('Moon', observer, +1, startOfDay, 2);
        ms = Astronomy.SearchRiseSet('Moon', observer, -1, startOfDay, 2);
    } catch (_) {}

    let astroDawn, nautDawn, yoake, civilDawn, civilDusk, higure, nautDusk, astroDusk;
    try {
        astroDawn = Astronomy.SearchAltitude('Sun', observer, +1, startOfDay, 1, -18);
        nautDawn  = Astronomy.SearchAltitude('Sun', observer, +1, startOfDay, 1, -12);
        yoake     = Astronomy.SearchAltitude('Sun', observer, +1, startOfDay, 1, -7.361111);
        civilDawn = Astronomy.SearchAltitude('Sun', observer, +1, startOfDay, 1, -6);
        civilDusk = Astronomy.SearchAltitude('Sun', observer, -1, startOfDay, 1, -6);
        higure    = Astronomy.SearchAltitude('Sun', observer, -1, startOfDay, 1, -7.361111);
        nautDusk  = Astronomy.SearchAltitude('Sun', observer, -1, startOfDay, 1, -12);
        astroDusk = Astronomy.SearchAltitude('Sun', observer, -1, startOfDay, 1, -18);
    } catch (_) {}

    let raStr = '', decStr = '';
    try {
        const eq = Astronomy.Equator(r.body.id, dt, observer, true, true);
        raStr = eq.ra.toFixed(6) + 'h';
        decStr = eq.dec.toFixed(6) + '°';
    } catch (_) {}

    const angR = getBodyAngularRadius(r.body.id, dt, observer);
    const angRStr = BODY_RADIUS_KM[r.body.id] ? angR.toFixed(3) + '°' : '';

    // プレビューURL (mode=preview)
    const urlParams = new URLSearchParams();
    urlParams.set('date', formatDateForUrl(dt));
    urlParams.set('time', formatTimeForUrl(dt));
    urlParams.set('timeZone', getLocalTimezoneOffsetString());
    urlParams.set('startLat', String(r.obs.lat));
    urlParams.set('startLng', String(r.obs.lng));
    urlParams.set('startApiElv', String(r.obs.elev ?? 0));
    urlParams.set('startElv', String(r.obs.height ?? 0));
    urlParams.set('endLat', String(r.tgt.lat));
    urlParams.set('endLng', String(r.tgt.lng));
    urlParams.set('endApiElv', String(r.tgt.elev ?? 0));
    urlParams.set('endElv', String(r.tgt.height ?? 0));
    urlParams.append('starId', r.body.id);
    urlParams.set('mode', 'preview');
    const previewUrl = buildBaseUrl() + '?' + urlParams.toString();

    // CSV用: YYYY/MM/DD (Excel加工しやすい形式) + 曜日は単独カラム
    const csvDateStr = `${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
    const csvDowStr = ['日','月','火','水','木','金','土'][dt.getDay()];

    // 相手距離・相手方位・相手高度 (観測点→目的点の地理計算)
    const obsLat = r.obs.lat ?? 0, obsLng = r.obs.lng ?? 0;
    const tgtLat = r.tgt.lat ?? 0, tgtLng = r.tgt.lng ?? 0;
    const obsTotalElev = (r.obs.elev ?? 0) + (r.obs.height ?? 0);
    const tgtTotalElev = (r.tgt.elev ?? 0) + (r.tgt.height ?? 0);
    const partnerDist = getDistanceWGS84(obsLat, obsLng, tgtLat, tgtLng);
    const partnerAz = calculateBearing(obsLat, obsLng, tgtLat, tgtLng);
    const partnerAlt = calculateApparentAltitude(partnerDist, obsTotalElev, tgtTotalElev, obsLat, tgtLat);
    // オフセット方位/視高 (My辻検索情報)
    const offsetAz = r.tsuji.offsetAz || 0;
    const offsetAlt = r.tsuji.offsetAlt || 0;
    const offsetAzDist = partnerDist * Math.tan(offsetAz * Math.PI / 180);
    const offsetAltDist = partnerDist * Math.tan(offsetAlt * Math.PI / 180);
    // オフセット回転角(上=0°・時計回り) / 回転仰角(基準点とオフセット点の球面角距離)
    const baseAz = r.tsuji.baseAz || 0, baseAlt = r.tsuji.baseAlt || 0;
    const offsetRot = calcOffsetRotation(offsetAz, offsetAlt);
    const offsetRotAlt = angularDistance(baseAz, baseAlt, baseAz + offsetAz, baseAlt + offsetAlt);

    return [
        r.tsuji.id,
        r.tsuji.name ?? '',
        r.tsuji.memo ?? '',
        csvDateStr,
        csvDowStr,
        fmtHms(dt),
        fmtHms(sr), fmtHms(ss), fmtHms(mr), fmtHms(ms),
        r.moonAge.toFixed(1),
        r.moonIcon,
        fmtHms(astroDawn), fmtHms(nautDawn), fmtHms(yoake), fmtHms(civilDawn),
        fmtHms(sr), fmtHms(ss),
        fmtHms(civilDusk), fmtHms(higure), fmtHms(nautDusk), fmtHms(astroDusk),
        r.body.id, r.body.name ?? '',
        decStr, raStr,
        r.obs.id, r.obs.name ?? '',
        obsLat.toFixed(6) + '°',
        obsLng.toFixed(6) + '°',
        (r.obs.elev ?? 0).toFixed(1) + 'm',
        (r.obs.height ?? 0).toFixed(1) + 'm',
        r.obs.memo ?? '',
        r.tgt.id, r.tgt.name ?? '',
        tgtLat.toFixed(6) + '°',
        tgtLng.toFixed(6) + '°',
        (r.tgt.elev ?? 0).toFixed(1) + 'm',
        (r.tgt.height ?? 0).toFixed(1) + 'm',
        r.tgt.memo ?? '',
        r.symbol,
        r.dist.toFixed(5) + '°',
        r.azimuth.toFixed(4) + '°',
        r.altitude.toFixed(4) + '°',
        angRStr,
        fmtSignedDeg(azDiffDeg(r.azimuth, baseAz)),
        fmtSignedDeg(r.altitude - baseAlt),
        partnerDist.toFixed(1) + 'm',
        partnerAz.toFixed(4) + '°',
        partnerAlt.toFixed(4) + '°',
        offsetAz.toFixed(4) + '°',
        offsetAlt.toFixed(4) + '°',
        offsetAzDist.toFixed(1) + 'm',
        offsetAltDist.toFixed(1) + 'm',
        offsetRot.toFixed(4) + '°',
        offsetRotAlt.toFixed(4) + '°',
        (Number(r.tsuji.mwOffsetAngle) || 0).toFixed(4) + '°',
        r.elevationStatus ?? '-',
        previewUrl
    ];
}

/** File取得 — チェック済みMy辻検索を実行し、結果をCSVダウンロード */
async function fileBatchMyTsujiSearch() {
    const checked = appState.myTsujiSearches.filter(t => t.checked);
    if (checked.length === 0) return alert('File取得するMy辻検索をチェックしてください');
    if (!confirm('チェックされた辻検索を実行し、結果をCSVでFile取得しますか？')) return;

    const myGen = ++myTsujiFileGen;
    myTsujiFileRunning = true;
    myTsujiFileCanceled = false;
    document.getElementById('btn-mytsuji-file').classList.add('active');

    showTsujiPanelForMyTsuji('My辻検索結果 (File出力)');
    const statusEl = document.getElementById('tsujisearch-status');
    document.getElementById('tsujisearch-content').innerHTML = '';

    // 計算開始時の日時・観測点・目的点を固定 (計算中にユーザーが変更しても影響しない)
    const batchStartDate = new Date(appState.currentDate);
    batchStartDate.setHours(0, 0, 0, 0);
    const batchStartMs = batchStartDate.getTime();
    const snapshotObs = JSON.parse(JSON.stringify(appState.myObservations));
    const snapshotTgt = JSON.parse(JSON.stringify(appState.myTargets));

    // 進捗バーの分母 = 全行 × 各行の天体数 × 各天体あたりのチャンク数 (365日単位)
    const totalChunks = checked.reduce((sum, t) => {
        const ids = (t.bodyIds || '').split(':').map(s => s.trim()).filter(Boolean);
        const chunksPerBody = Math.ceil((t.days || 0) / TSUJI_CHUNK_DAYS);
        return sum + Math.max(1, ids.length) * Math.max(1, chunksPerBody);
    }, 0);
    let doneChunks = 0;
    setTsujiProgress(0, totalChunks);
    const chunkDoneCb = () => {
        doneChunks++;
        setTsujiProgress(doneChunks, totalChunks);
    };

    const allResults = [];
    for (let i = 0; i < checked.length; i++) {
        if (myGen !== myTsujiFileGen) return;
        if (myTsujiFileCanceled) { statusEl.textContent = `(キャンセルされました)`; break; }
        const t = checked[i];
        statusEl.textContent = `⏳ File出力処理中... ${i+1}/${checked.length} (ID:${t.id} ${t.name || ''})`;
        const res = await executeSingleMyTsujiSearch(t, batchStartMs, snapshotObs, snapshotTgt, chunkDoneCb);
        if (myGen !== myTsujiFileGen) return;
        if (!res) continue;
        for (const br of res.bodyResults) {
            for (const r of br.results) {
                allResults.push({
                    tsuji: t, obs: res.obs, tgt: res.tgt,
                    body: br.body,
                    time: r.time, azimuth: r.azimuth, altitude: r.altitude, dist: r.dist
                });
            }
        }
    }

    if (myGen !== myTsujiFileGen) return;
    myTsujiFileRunning = false;
    document.getElementById('btn-mytsuji-file').classList.remove('active');
    hideTsujiProgress();

    if (myTsujiFileCanceled) return;

    const decorated = await decorateMyTsujiResults(allResults);
    if (decorated.length === 0) {
        statusEl.textContent = '0件';
        return alert('該当する日時はありません');
    }

    statusEl.textContent = `${decorated.length}件 (CSV生成中…)`;

    const header = [
        '辻検索ID','辻検索名','辻検索メモ','日付','曜日','辻時刻',
        '日の出時刻','日の入時刻','月の出時刻','月の入時刻',
        '月齢','月齢アイコン',
        '天文薄明[始]時刻','航海薄明[始]時刻','夜明時刻','常用薄明[始]時刻',
        '日の出時刻','日の入時刻',
        '常用薄明[終]時刻','日暮時刻','航海薄明[終]時刻','天文薄明[終]時刻',
        '天体ID','天体名','天体赤緯','天体赤経',
        '観測点ID','観測点名','観測点緯度','観測点経度','観測点標高','観測点高','観測点メモ',
        '目的点ID','目的点名','目的点緯度','目的点経度','目的点標高','目的点高','目的点メモ',
        '精度記号','精度角距離',
        '方位角','視高度','視半径','天体方位角差','天体視高度差',
        '相手距離','相手方位','相手高度',
        '辻オフセット方位角','辻オフセット視高度','辻オフセット方位距離','辻オフセット視高距離',
        '辻オフセット回転角','辻オフセット回転仰角','オフセット中心角','標高グラフ',
        'プレビューURL'
    ];
    const esc = v => {
        const s = String(v ?? '');
        if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
        return s;
    };
    const bom = '\uFEFF';
    let csv = bom + header.map(esc).join(',') + '\r\n';
    decorated.forEach(r => {
        csv += buildMyTsujiCsvRow(r).map(esc).join(',') + '\r\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soranotsuji-My辻検索結果-${formatFileDateTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    statusEl.textContent = `${decorated.length}件 (CSV出力完了)`;
}

/** リスト描画 (Phase A-3: イベントハンドラ追加) */
function renderMyTsujiSearches() {
    const container = document.getElementById('mytsuji-list');
    if (!container) return;
    while (container.firstChild) container.removeChild(container.firstChild);
    const list = appState.myTsujiSearches;
    if (list.length === 0) {
        container.innerHTML = `<div class="mystars-empty">My辻検索は登録されていません</div>`;
        return;
    }
    list.forEach((t, idx) => {
        const row = document.createElement('div');
        row.className = 'mypoint-row';
        const moonDisabled = t.moonFilter ? '' : 'disabled';
        row.innerHTML = `
            <hr class="tsujisearch-separator">
            <div class="mypoint-row-header">
                <input type="radio" name="mytsuji-select" value="${t.id}" class="mystars-radio" ${idx === 0 ? 'checked' : ''}>
                <input type="checkbox" class="body-checkbox mytsuji-check" data-id="${t.id}" ${t.checked ? 'checked' : ''}>
                <span class="mypoint-id">ID:${String(t.id).padStart(4, ' ')}</span>
            </div>
            <div class="control-row">
                <input type="text" class="mytsuji-name" value="${escapeHtml(t.name || '')}" placeholder="辻検索名" maxlength="150" data-id="${t.id}" autocomplete="off">
            </div>
            <div class="control-row">
                <label class="mytsuji-label">検索期間(日):</label>
                <input type="number" class="mytsuji-days" value="${t.days !== undefined ? t.days : ''}" placeholder="検索期間(日:最大36500)" step="365" min="0" max="36500" data-id="${t.id}">
            </div>
            <div class="control-row">
                <label class="mytsuji-label">天体ID:</label>
                <input type="text" class="mytsuji-bodyids" value="${escapeHtml(t.bodyIds || '')}" placeholder="天体ID:天体ID:..." maxlength="150" data-id="${t.id}" autocomplete="off">
            </div>
            <div class="control-row">
                <label class="mytsuji-label">観測点ID:</label>
                <input type="number" class="mytsuji-obsid" value="${t.obsId !== undefined && t.obsId !== null ? t.obsId : ''}" placeholder="観測点ID(数字)" step="1" min="1" max="1000" data-id="${t.id}">
                <label class="mytsuji-label">目的点ID:</label>
                <input type="number" class="mytsuji-tgtid" value="${t.tgtId !== undefined && t.tgtId !== null ? t.tgtId : ''}" placeholder="目的点ID(数字)" step="1" min="1" max="1000" data-id="${t.id}">
            </div>
            <div class="mytsuji-row-error"></div>
            <div class="control-row">
                <label class="mytsuji-label">基準方位角(°):</label>
                <input type="number" class="mytsuji-base-az" value="${t.baseAz !== undefined && t.baseAz !== null ? t.baseAz.toFixed(4) : ''}" placeholder="基準方位角(°)" step="0.0001" min="0" max="360" data-id="${t.id}">
                <label class="mytsuji-label">基準視高度(°):</label>
                <input type="number" class="mytsuji-base-alt" value="${t.baseAlt !== undefined && t.baseAlt !== null ? t.baseAlt.toFixed(4) : ''}" placeholder="基準視高度(°)" step="0.0001" min="-360" max="360" data-id="${t.id}">
            </div>
            <div class="control-row">
                <label class="mytsuji-label">辻オフセット方位角(°):</label>
                <input type="number" class="mytsuji-offset-az" value="${t.offsetAz !== undefined && t.offsetAz !== null ? t.offsetAz : 0}" placeholder="オフセット方位角(°)" step="0.0001" min="-360" max="360" data-id="${t.id}">
                <label class="mytsuji-label">辻オフセット視高度(°):</label>
                <input type="number" class="mytsuji-offset-alt" value="${t.offsetAlt !== undefined && t.offsetAlt !== null ? t.offsetAlt : 0}" placeholder="オフセット視高度(°)" step="0.0001" min="-360" max="360" data-id="${t.id}">
            </div>
            <div class="control-row">
                <label class="mytsuji-label">辻オフセット方位距離(m):</label>
                <input type="number" class="mytsuji-offset-az-dist elev-readonly" value="0" readonly step="0.1" data-id="${t.id}">
                <label class="mytsuji-label">辻オフセット視高距離(m):</label>
                <input type="number" class="mytsuji-offset-alt-dist elev-readonly" value="0" readonly step="0.1" data-id="${t.id}">
            </div>
            <div class="control-row">
                <label class="mytsuji-label">辻オフセット回転角(°):</label>
                <input type="number" class="mytsuji-offset-rot elev-readonly" value="0" readonly step="0.0001" data-id="${t.id}">
                <label class="mytsuji-label">辻オフセット回転仰角(°):</label>
                <input type="number" class="mytsuji-offset-rot-alt elev-readonly" value="0" readonly step="0.0001" data-id="${t.id}">
            </div>
            <div class="control-row">
                <label class="mytsuji-label">許容範囲方位角(°): ±</label>
                <input type="number" class="mytsuji-tol-az" value="${t.toleranceAz !== undefined && t.toleranceAz !== null ? t.toleranceAz : 15}" placeholder="許容範囲方位角(°)" step="0.1" min="0" max="360" data-id="${t.id}">
                <label class="mytsuji-label">許容範囲視高度(°): ±</label>
                <input type="number" class="mytsuji-tol-alt" value="${t.toleranceAlt !== undefined && t.toleranceAlt !== null ? t.toleranceAlt : 15}" placeholder="許容範囲視高度(°)" step="0.1" min="0" max="360" data-id="${t.id}">
            </div>
            <hr class="tsujisearch-separator">
            <div class="control-row left-row"><label class="baseopt-group-label" title="検索中心を「点」か「線」の範囲かで選択します">検索中心オプション</label></div>
            <div class="control-row left-row">
                <label class="baseopt-radio" title="検索中心をオフセット点の「点」で検索します"><input type="radio" class="mytsuji-center-mode" name="mytsuji-center-mode-${t.id}" value="point" data-id="${t.id}" ${t.centerMode !== 'line' ? 'checked' : ''}>:オフセット点</label>
            </div>
            <div class="control-row left-row">
                <label class="baseopt-radio" title="検索中心を基準点からオフセット点までの「線」の範囲で検索します"><input type="radio" class="mytsuji-center-mode" name="mytsuji-center-mode-${t.id}" value="line" data-id="${t.id}" ${t.centerMode === 'line' ? 'checked' : ''}>:基準点からオフセット点までの線</label>
            </div>
            <hr class="tsujisearch-separator">
            <div class="control-row left-row"><label class="baseopt-group-label">天の川オプション</label></div>
            <div class="control-row">
                <label class="mytsuji-label" title="この行の辻検索だけに反映する天の川の基準点のオフセット中心角(基本オプションとは連動しない)">オフセット中心角(°):</label>
                <input type="number" class="mytsuji-mw-offset" value="${t.mwOffsetAngle !== undefined && t.mwOffsetAngle !== null ? t.mwOffsetAngle : (Number(appState.mwOffsetAngle) || 0)}" placeholder="-360〜+360(°)" step="1" min="-360" max="360" data-id="${t.id}">
            </div>
            <hr class="tsujisearch-separator">
            <div class="control-row left-row">
                <input type="checkbox" class="body-checkbox mytsuji-moon-filter" data-id="${t.id}" ${t.moonFilter ? 'checked' : ''}>
                <label>月齢フィルタ</label>
            </div>
            <div class="control-row">
                <label class="mytsuji-label">基準月齢:</label>
                <input type="number" class="mytsuji-moon-base" value="${t.moonBase !== undefined && t.moonBase !== null ? t.moonBase : 15}" placeholder="基準月齢" step="0.1" min="0" max="30" data-id="${t.id}" ${moonDisabled}>
                <label class="mytsuji-label">許容範囲月齢: ±</label>
                <input type="number" class="mytsuji-moon-tol" value="${t.moonTolerance !== undefined && t.moonTolerance !== null ? t.moonTolerance : 2}" placeholder="許容範囲月齢±" step="0.1" min="0" max="15" data-id="${t.id}" ${moonDisabled}>
            </div>
            <hr class="tsujisearch-separator">
            <div class="control-row left-row">
                <input type="checkbox" class="body-checkbox mytsuji-time-filter" data-id="${t.id}" ${t.timeFilter ? 'checked' : ''}>
                <label>時間フィルタ</label>
            </div>
            ${buildMyTsujiTimeGroupHtml(t, 'start')}
            ${buildMyTsujiTimeGroupHtml(t, 'end')}
            <hr class="tsujisearch-separator">
            <div class="control-row left-row">
                <input type="checkbox" class="body-checkbox mytsuji-acc-filter" data-id="${t.id}" ${t.accuracyFilter ? 'checked' : ''}>
                <label>精度フィルタ</label>
            </div>
            <div class="control-row left-row">
                <input type="checkbox" class="body-checkbox mytsuji-acc-dbl-circle" data-id="${t.id}" ${t.accDblCircle ? 'checked' : ''} ${t.accuracyFilter ? '' : 'disabled'}> <label class="tsuji-acc-label">:◎</label>
                <input type="checkbox" class="body-checkbox mytsuji-acc-circle" data-id="${t.id}" ${t.accCircle ? 'checked' : ''} ${t.accuracyFilter ? '' : 'disabled'}> <label class="tsuji-acc-label">:○</label>
                <input type="checkbox" class="body-checkbox mytsuji-acc-triangle" data-id="${t.id}" ${t.accTriangle ? 'checked' : ''} ${t.accuracyFilter ? '' : 'disabled'}> <label class="tsuji-acc-label">:△</label>
                <input type="checkbox" class="body-checkbox mytsuji-acc-dash" data-id="${t.id}" ${t.accDash ? 'checked' : ''} ${t.accuracyFilter ? '' : 'disabled'}> <label class="tsuji-acc-label">:-</label>
            </div>
            <hr class="tsujisearch-separator">
            <div class="control-row left-row">
                <input type="checkbox" class="body-checkbox mytsuji-elev-option" data-id="${t.id}" ${t.elevationOption ? 'checked' : ''}>
                <label>標高オプション</label>
            </div>
            <div class="control-row left-row">
                <input type="checkbox" class="body-checkbox mytsuji-elev-ok" data-id="${t.id}" ${t.elevOK ? 'checked' : ''} ${t.elevationOption ? '' : 'disabled'}> <label class="tsuji-acc-label">:OK</label>
                <input type="checkbox" class="body-checkbox mytsuji-elev-ng" data-id="${t.id}" ${t.elevNG ? 'checked' : ''} ${t.elevationOption ? '' : 'disabled'}> <label class="tsuji-acc-label">:NG</label>
            </div>
            <div class="control-row">
                <label class="mytsuji-label">メモ:</label>
                <input type="text" class="mytsuji-memo" value="${escapeHtml(t.memo || '')}" placeholder="メモ(150文字)" maxlength="150" data-id="${t.id}" autocomplete="off">
            </div>`;

        // ヘルパー: 行内の指定クラスを持つ要素にchangeハンドラを登録
        const onChange = (cls, fn) => {
            const el = row.querySelector('.' + cls);
            if (el) el.addEventListener('change', fn);
        };
        // オフセットの読取専用欄(方位距離/視高距離/回転角/回転仰角)を再計算して反映
        const updateDist = () => {
            const r = recalcMyTsujiOffsetDist(t);
            row.querySelector('.mytsuji-offset-az-dist').value = r.azDist.toFixed(1);
            row.querySelector('.mytsuji-offset-alt-dist').value = r.altDist.toFixed(1);
            const oAz = t.offsetAz || 0, oAlt = t.offsetAlt || 0;
            const bAz = t.baseAz, bAlt = t.baseAlt;
            const baseValid = bAz !== null && bAz !== undefined && !isNaN(bAz) && bAlt !== null && bAlt !== undefined && !isNaN(bAlt);
            row.querySelector('.mytsuji-offset-rot').value = parseFloat(calcOffsetRotation(oAz, oAlt).toFixed(4));
            row.querySelector('.mytsuji-offset-rot-alt').value = baseValid ? parseFloat(angularDistance(bAz, bAlt, bAz + oAz, bAlt + oAlt).toFixed(4)) : 0;
        };
        // 初期表示 + ID検証
        updateDist();
        validateMyTsujiRow(t, row);

        onChange('mytsuji-name', e => { t.name = e.target.value.trim(); saveAppState(); setMyTsujiDirty(true); });
        onChange('mytsuji-days', e => {
            // step=365, min=0 だが、内部値は最小1に正規化 (0日検索は無効)
            let v = parseInt(e.target.value);
            if (isNaN(v)) v = 365;
            v = Math.min(Math.max(v, 1), 36500);
            t.days = v; e.target.value = v; saveAppState(); setMyTsujiDirty(true);
        });
        onChange('mytsuji-bodyids', e => { t.bodyIds = e.target.value.trim(); saveAppState(); setMyTsujiDirty(true); });
        onChange('mytsuji-obsid', e => {
            const v = parseInt(e.target.value);
            t.obsId = isNaN(v) ? null : v;
            if (validateMyTsujiRow(t, row)) autoCalcMyTsujiBase(t, row);
            saveAppState(); setMyTsujiDirty(true); updateDist();
        });
        onChange('mytsuji-tgtid', e => {
            const v = parseInt(e.target.value);
            t.tgtId = isNaN(v) ? null : v;
            if (validateMyTsujiRow(t, row)) autoCalcMyTsujiBase(t, row);
            saveAppState(); setMyTsujiDirty(true); updateDist();
        });
        onChange('mytsuji-base-az', e => {
            const v = parseFloat(e.target.value);
            t.baseAz = isNaN(v) ? null : v;
            saveAppState(); setMyTsujiDirty(true); updateDist();
        });
        onChange('mytsuji-base-alt', e => {
            const v = parseFloat(e.target.value);
            t.baseAlt = isNaN(v) ? null : v;
            saveAppState(); setMyTsujiDirty(true); updateDist();
        });
        onChange('mytsuji-offset-az', e => {
            t.offsetAz = parseFloat(e.target.value) || 0;
            e.target.value = t.offsetAz;
            saveAppState(); setMyTsujiDirty(true); updateDist();
        });
        onChange('mytsuji-offset-alt', e => {
            t.offsetAlt = parseFloat(e.target.value) || 0;
            e.target.value = t.offsetAlt;
            saveAppState(); setMyTsujiDirty(true); updateDist();
        });
        onChange('mytsuji-tol-az', e => {
            t.toleranceAz = Math.min(Math.max(parseFloat(e.target.value) || 15, 0), 360);
            e.target.value = t.toleranceAz;
            saveAppState(); setMyTsujiDirty(true);
        });
        onChange('mytsuji-tol-alt', e => {
            t.toleranceAlt = Math.min(Math.max(parseFloat(e.target.value) || 15, 0), 360);
            e.target.value = t.toleranceAlt;
            saveAppState(); setMyTsujiDirty(true);
        });
        onChange('mytsuji-mw-offset', e => {   // 行ごとに独立(基本オプションとは連動しない)
            t.mwOffsetAngle = Math.min(Math.max(parseFloat(e.target.value) || 0, -360), 360);
            e.target.value = t.mwOffsetAngle;
            saveAppState(); setMyTsujiDirty(true);
        });
        row.querySelectorAll('.mytsuji-center-mode').forEach(r => r.addEventListener('change', () => {   // 検索中心オプション(行ごとに独立)
            if (r.checked) { t.centerMode = r.value === 'line' ? 'line' : 'point'; saveAppState(); setMyTsujiDirty(true); }
        }));
        onChange('mytsuji-moon-filter', e => {
            t.moonFilter = e.target.checked;
            row.querySelector('.mytsuji-moon-base').disabled = !t.moonFilter;
            row.querySelector('.mytsuji-moon-tol').disabled = !t.moonFilter;
            saveAppState(); setMyTsujiDirty(true);
        });
        onChange('mytsuji-moon-base', e => {
            t.moonBase = Math.min(Math.max(parseFloat(e.target.value) || 15, 0), 30);
            e.target.value = t.moonBase;
            saveAppState(); setMyTsujiDirty(true);
        });
        onChange('mytsuji-moon-tol', e => {
            t.moonTolerance = Math.min(Math.max(parseFloat(e.target.value) || 2, 0), 15);
            e.target.value = t.moonTolerance;
            saveAppState(); setMyTsujiDirty(true);
        });
        onChange('mytsuji-acc-filter', e => {
            t.accuracyFilter = e.target.checked;
            row.querySelector('.mytsuji-acc-dbl-circle').disabled = !t.accuracyFilter;
            row.querySelector('.mytsuji-acc-circle').disabled = !t.accuracyFilter;
            row.querySelector('.mytsuji-acc-triangle').disabled = !t.accuracyFilter;
            row.querySelector('.mytsuji-acc-dash').disabled = !t.accuracyFilter;
            saveAppState(); setMyTsujiDirty(true);
        });
        onChange('mytsuji-acc-dbl-circle', e => { t.accDblCircle = e.target.checked; saveAppState(); setMyTsujiDirty(true); });
        onChange('mytsuji-acc-circle', e => { t.accCircle = e.target.checked; saveAppState(); setMyTsujiDirty(true); });
        onChange('mytsuji-acc-triangle', e => { t.accTriangle = e.target.checked; saveAppState(); setMyTsujiDirty(true); });
        onChange('mytsuji-acc-dash', e => { t.accDash = e.target.checked; saveAppState(); setMyTsujiDirty(true); });
        onChange('mytsuji-elev-option', e => {
            t.elevationOption = e.target.checked;
            row.querySelector('.mytsuji-elev-ok').disabled = !t.elevationOption;
            row.querySelector('.mytsuji-elev-ng').disabled = !t.elevationOption;
            saveAppState(); setMyTsujiDirty(true);
        });
        onChange('mytsuji-elev-ok', e => { t.elevOK = e.target.checked; saveAppState(); setMyTsujiDirty(true); });
        onChange('mytsuji-elev-ng', e => { t.elevNG = e.target.checked; saveAppState(); setMyTsujiDirty(true); });
        // 時間フィルタ
        onChange('mytsuji-time-filter', e => {
            t.timeFilter = e.target.checked;
            updateMyTsujiRowTimeFilterUI(row, t);
            saveAppState(); setMyTsujiDirty(true);
        });
        ['start', 'end'].forEach(group => {
            row.querySelectorAll('.mytsuji-' + group + '-mode').forEach(r => {
                r.addEventListener('change', e => { t[group + 'Mode'] = e.target.value; saveAppState(); setMyTsujiDirty(true); });
            });
            const timeBox = row.querySelector('.mytsuji-' + group + '-time');
            if (timeBox) timeBox.addEventListener('change', e => { t[group + 'Time'] = e.target.value; saveAppState(); setMyTsujiDirty(true); });
            const ppChk = row.querySelector('.mytsuji-' + group + '-prepost');
            if (ppChk) ppChk.addEventListener('change', e => { t[group + 'PrePost'] = e.target.checked; updateMyTsujiRowTimeFilterUI(row, t); saveAppState(); setMyTsujiDirty(true); });
            row.querySelectorAll('.mytsuji-' + group + '-prepost-control[type="radio"]').forEach(r => {
                r.addEventListener('change', e => { t[group + 'PrePostDir'] = e.target.value; saveAppState(); setMyTsujiDirty(true); });
            });
            const offBox = row.querySelector('.mytsuji-' + group + '-offset');
            if (offBox) offBox.addEventListener('change', e => { t[group + 'Offset'] = e.target.value; saveAppState(); setMyTsujiDirty(true); });
        });
        onChange('mytsuji-check', e => { t.checked = e.target.checked; saveAppState(); });
        onChange('mytsuji-memo', e => { t.memo = e.target.value.trim(); saveAppState(); setMyTsujiDirty(true); });

        container.appendChild(row);
    });
    updateMyTsujiButtonStates();
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
            <input type="checkbox" class="body-checkbox" ${body.visible ? 'checked' : ''}>
            <div class="style-indicator ${dashClass}" style="color: ${escapeHtml(body.color)};"></div>
            <div class="body-info">
                <span class="body-name-label">${escapeHtml(body.name)}</span>
                <span class="body-name-id" id="bodyid-${escapeHtml(body.id)}">ID: ${escapeHtml(body.id)}</span>
                <span id="data-${escapeHtml(body.id)}" class="body-detail-text">方位角 --° / 視高度 --°</span>
                <span id="riseset-${escapeHtml(body.id)}" class="body-detail-text">出時刻 --:--:-- / 入時刻 --:--:--</span>
                <span id="transit-${escapeHtml(body.id)}" class="body-detail-text">南中時 --:--:-- / 視半径 --°</span>
                <span id="radec-${escapeHtml(body.id)}" class="body-detail-text">赤経 --h / 赤緯 --°</span>
            </div>`;
        li.querySelector('.body-checkbox').addEventListener('change', function() {
            toggleVisibility(body.id, this.checked);
        });
        li.querySelector('.style-indicator').addEventListener('click', function() {
            openPalette(body.id);
        });
        list.appendChild(li);
    });
}

function toggleVisibility(id, checked) {
    const body = appState.bodies.find(b => b.id === id);
    if(body) {
        body.visible = checked;
        saveAppState();
        updateAll();
        applyTsujiMeshLayerVisibility();   // 選択行の天体の表示/非表示に辻マーカー(集合+ピン)を連動
        // 辻ライン365 連動: 表示天体が変わったら再計算 (世代カウンタで進行中をキャンセル)
        if (appState.isDP365Active) {
            updateDP365Lines();
        }
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
        // My天体側にも同期
        const myStar = appState.myStars.find(s => String(s.id) === editingBodyId);
        if (myStar) myStar.color = code;
        closePalette();
        saveAppState();
        renderCelestialList();
        renderMyStarsList();
        updateAll();
        _tmApplyBodyStyleChange();
    }
}

/** 辻メッシュの辻/優辻マーカーは焼き込み画像のため、天体色の変更時はここで再描画する(結果行の文字色も追従) */
function _tmApplyBodyStyleChange() {
    if (!_tsujiMeshRows.length) return;
    _tsujiMeshRows.forEach(r => { if (r.__tr) r.__tr.style.color = r.body.color; });
    recalcTsujiMeshGoldAtTime();
}

function applyLineStyle(type) {
    const b = appState.bodies.find(x => x.id === editingBodyId);
    b.isDashed = (type === 'dashed');
    // My天体側にも同期
    const myStar = appState.myStars.find(s => String(s.id) === editingBodyId);
    if (myStar) myStar.isDashed = (type === 'dashed');
    closePalette();
    saveAppState();
    renderCelestialList();
    renderMyStarsList();
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
    const body = appState.bodies.find(x => x.id === editingBodyId);
    if (!body) return;
    if (def) {
        body.color = def.color;
        body.isDashed = def.isDashed;
    } else {
        // My天体のデフォルト: 薄紫、破線
        body.color = '#DDA0DD';
        body.isDashed = true;
    }
    // My天体側にも同期
    const myStar = appState.myStars.find(s => String(s.id) === editingBodyId);
    if (myStar) { myStar.color = body.color; myStar.isDashed = body.isDashed; }
    closePalette();
    saveAppState();
    renderCelestialList();
    renderMyStarsList();
    updateAll();
    _tmApplyBodyStyleChange();
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
        // 全天儀・宙の窓とは画面下1/3を排他利用するため、開いていれば閉じる
        if (appState.isMilkyWayActive) closeMilkyWayInstrument();
        if (appState.isSoramadoActive) closeSoramado();
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

/** 全天儀の表示/非表示トグル (標高グラフと排他、辻検索とは共存) */
function toggleMilkyWayInstrument() {
    if (appState.isMilkyWayActive) {
        closeMilkyWayInstrument();
    } else {
        // 標高グラフ・宙の窓とは排他: 開いていれば閉じる
        if (appState.isElevationActive) toggleElevation();
        if (appState.isSoramadoActive) closeSoramado();
        appState.isMilkyWayActive = true;
        document.getElementById('btn-milkyway').classList.add('active');
        document.getElementById('milkyway-panel').classList.remove('hidden');
        startMilkyWayGlobe();
        _mwUpdateBaseOptions();   // 閉じている間の基本オプション変更を反映
    }
    syncBottomPanels();
}

/** 全天儀を閉じる (内部用: syncBottomPanels は呼び出し側で行う) */
function closeMilkyWayInstrument() {
    appState.isMilkyWayActive = false;
    document.getElementById('btn-milkyway').classList.remove('active');
    document.getElementById('milkyway-panel').classList.add('hidden');
}

// --- 辻検索 入力連動 ---
// 位置が変わった場合のみ再計算（ユーザーの手動入力値を保護）
function updateTsujiSearchInputs() {
    const posKey = `${appState.start.lat},${appState.start.lng},${appState.start.elev}|${appState.end.lat},${appState.end.lng},${appState.end.elev}`;
    if (posKey === appState._lastTsujiPosKey) return;
    appState._lastTsujiPosKey = posKey;

    const dist = L.latLng(appState.start.lat, appState.start.lng)
                  .distanceTo(L.latLng(appState.end.lat, appState.end.lng));
    const az = calculateBearing(appState.start.lat, appState.start.lng,
                                appState.end.lat, appState.end.lng);
    const alt = calculateApparentAltitude(dist, appState.start.elev, appState.end.elev, appState.start.lat, appState.end.lat);
    appState.tsujiSearchBaseAz = az;
    appState.tsujiSearchBaseAlt = alt;
    document.getElementById('input-tsuji-az').value = az.toFixed(4);
    document.getElementById('input-tsuji-alt').value = alt.toFixed(4);
    saveAppState();
    updateOffsetDistances();
}

/** 球面角距離 (Az,Alt座標系での厳密な角距離、°)。tsuji-search-worker.js の angularDistance と同一式。 */
function angularDistance(az1, alt1, az2, alt2) {
    const toRad = Math.PI / 180;
    const cosD = Math.sin(alt1 * toRad) * Math.sin(alt2 * toRad) +
                 Math.cos(alt1 * toRad) * Math.cos(alt2 * toRad) * Math.cos((az1 - az2) * toRad);
    return Math.acos(Math.max(-1, Math.min(1, cosD))) * 180 / Math.PI;
}

/** オフセット回転角 (目的点方向を向いて0時(上)から時計回りの角度、°[0,360))。上=0°・右(方位角+)=90°。 */
function calcOffsetRotation(offsetAz, offsetAlt) {
    return (Math.atan2(offsetAz, offsetAlt) * 180 / Math.PI + 360) % 360;
}

/** オフセット方位距離・視高距離・回転角・回転仰角を再計算してUIに反映 */
function updateOffsetDistances() {
    const dist = L.latLng(appState.start.lat, appState.start.lng)
                  .distanceTo(L.latLng(appState.end.lat, appState.end.lng));
    const offsetAz = appState.tsujiSearchOffsetAz;
    const offsetAlt = appState.tsujiSearchOffsetAlt;
    const azDist = dist * Math.tan(offsetAz * Math.PI / 180);
    const altDist = dist * Math.tan(offsetAlt * Math.PI / 180);
    // 回転角 (上=0°・時計回り) / 回転仰角 (中心方向とオフセット適用方向の球面角距離)
    const baseAz = appState.tsujiSearchBaseAz;
    const baseAlt = appState.tsujiSearchBaseAlt;
    const valid = !isNaN(baseAz) && !isNaN(baseAlt) && !isNaN(offsetAz) && !isNaN(offsetAlt);
    const rot = valid ? calcOffsetRotation(offsetAz, offsetAlt) : 0;
    const rotAlt = valid ? angularDistance(baseAz, baseAlt, baseAz + offsetAz, baseAlt + offsetAlt) : 0;
    // 辻検索メニュー・宙の窓メニュー・宙の窓コントロールメニューの全コピーへ反映(編集中の入力欄は上書きしない)
    const setV = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };
    ['input-tsuji-az-offset', 'input-sora-tsuji-az-offset', 'input-sora-ctrl-tsuji-az-offset'].forEach(id => setV(id, offsetAz));
    ['input-tsuji-alt-offset', 'input-sora-tsuji-alt-offset', 'input-sora-ctrl-tsuji-alt-offset'].forEach(id => setV(id, offsetAlt));
    ['input-tsuji-az-offset-dist', 'input-sora-tsuji-az-offset-dist', 'input-sora-ctrl-tsuji-az-offset-dist'].forEach(id => setV(id, parseFloat(azDist.toFixed(1))));
    ['input-tsuji-alt-offset-dist', 'input-sora-tsuji-alt-offset-dist', 'input-sora-ctrl-tsuji-alt-offset-dist'].forEach(id => setV(id, parseFloat(altDist.toFixed(1))));
    ['input-tsuji-rot', 'input-sora-tsuji-rot', 'input-sora-ctrl-tsuji-rot'].forEach(id => setV(id, parseFloat(rot.toFixed(4))));
    ['input-tsuji-rot-alt', 'input-sora-tsuji-rot-alt', 'input-sora-ctrl-tsuji-rot-alt'].forEach(id => setV(id, parseFloat(rotAlt.toFixed(4))));
}

/** 月齢フィルタのUI状態を更新 (入力可否) */
function updateTsujiMoonFilterUI() {
    const enabled = appState.tsujiMoonFilterEnabled;
    document.getElementById('input-tsuji-moon-base').disabled = !enabled;
    document.getElementById('input-tsuji-moon-tolerance').disabled = !enabled;
}

function updateTsujiAccuracyFilterUI() {
    const enabled = appState.tsujiAccuracyFilterEnabled;
    document.getElementById('chk-tsuji-acc-dbl-circle').disabled = !enabled;
    document.getElementById('chk-tsuji-acc-circle').disabled = !enabled;
    document.getElementById('chk-tsuji-acc-triangle').disabled = !enabled;
    document.getElementById('chk-tsuji-acc-dash').disabled = !enabled;
}

/** 標高オプションのUI状態を更新 (OK/NGチェックの入力可否) */
function updateTsujiElevationOptionUI() {
    const enabled = appState.tsujiElevationOption;
    document.getElementById('chk-tsuji-elev-ok').disabled = !enabled;
    document.getElementById('chk-tsuji-elev-ng').disabled = !enabled;
}

/** 時間フィルタのUI状態(活性/非活性)を更新 */
function updateTsujiTimeFilterUI() {
    const on = appState.tsujiTimeFilter;
    document.querySelectorAll('#tsuji-time-filter-groups .tsuji-time-control').forEach(el => { el.disabled = !on; });
    ['start', 'end'].forEach(group => {
        const G = group === 'start' ? 'Start' : 'End';
        const pp = on && appState['tsuji' + G + 'PrePost'];
        document.querySelectorAll('.tsuji-' + group + '-prepost-control').forEach(el => { el.disabled = !pp; });
    });
}

/** 時間フィルタのフォーム値をappStateから反映 */
function syncTsujiTimeFilter() {
    const chk = document.getElementById('chk-tsuji-time-filter');
    if (!chk) return;
    chk.checked = appState.tsujiTimeFilter;
    ['start', 'end'].forEach(group => {
        const G = group === 'start' ? 'Start' : 'End';
        const mr = document.querySelector(`input[name="tsuji-${group}-mode"][value="${appState['tsuji' + G + 'Mode']}"]`);
        if (mr) mr.checked = true;
        document.getElementById(`input-tsuji-${group}-time`).value = appState['tsuji' + G + 'Time'];
        document.getElementById(`chk-tsuji-${group}-prepost`).checked = appState['tsuji' + G + 'PrePost'];
        const dr = document.querySelector(`input[name="tsuji-${group}-prepost-dir"][value="${appState['tsuji' + G + 'PrePostDir']}"]`);
        if (dr) dr.checked = true;
        document.getElementById(`input-tsuji-${group}-offset`).value = appState['tsuji' + G + 'Offset'];
    });
    updateTsujiTimeFilterUI();
}

// --- 辻メッシュ検索 入力連動/UIヘルパー ---
/** 位置が変わった場合のみ辻メッシュの基準方位角/視高度を再計算（手動入力値を保護） */
function updateTsujiMeshSearchInputs() {
    const posKey = `${appState.start.lat},${appState.start.lng},${appState.start.elev}|${appState.end.lat},${appState.end.lng},${appState.end.elev}`;
    if (posKey === appState._lastTsujiMeshPosKey) return;
    appState._lastTsujiMeshPosKey = posKey;
    const dist = L.latLng(appState.start.lat, appState.start.lng)
                  .distanceTo(L.latLng(appState.end.lat, appState.end.lng));
    const az = calculateBearing(appState.start.lat, appState.start.lng, appState.end.lat, appState.end.lng);
    const alt = calculateApparentAltitude(dist, appState.start.elev, appState.end.elev, appState.start.lat, appState.end.lat);
    appState.tsujiMeshBaseAz = az;
    appState.tsujiMeshBaseAlt = alt;
    const azEl = document.getElementById('input-tsujimesh-az');
    const altEl = document.getElementById('input-tsujimesh-alt');
    if (azEl) azEl.value = az.toFixed(4);
    if (altEl) altEl.value = alt.toFixed(4);
    saveAppState();
    updateTsujiMeshOffsetDistances();
}

/** 辻メッシュの辻オフセット方位距離・視高距離・回転角・回転仰角を再計算してUIに反映 */
function updateTsujiMeshOffsetDistances() {
    const dist = L.latLng(appState.start.lat, appState.start.lng)
                  .distanceTo(L.latLng(appState.end.lat, appState.end.lng));
    const offsetAz = appState.tsujiMeshOffsetAz;
    const offsetAlt = appState.tsujiMeshOffsetAlt;
    const baseAz = appState.tsujiMeshBaseAz;
    const baseAlt = appState.tsujiMeshBaseAlt;
    const valid = !isNaN(baseAz) && !isNaN(baseAlt) && !isNaN(offsetAz) && !isNaN(offsetAlt);
    const setV = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };
    setV('input-tsujimesh-az-offset', offsetAz);
    setV('input-tsujimesh-alt-offset', offsetAlt);
    setV('input-tsujimesh-az-offset-dist', parseFloat((dist * Math.tan(offsetAz * Math.PI / 180)).toFixed(1)));
    setV('input-tsujimesh-alt-offset-dist', parseFloat((dist * Math.tan(offsetAlt * Math.PI / 180)).toFixed(1)));
    setV('input-tsujimesh-rot', parseFloat((valid ? calcOffsetRotation(offsetAz, offsetAlt) : 0).toFixed(4)));
    setV('input-tsujimesh-rot-alt', parseFloat((valid ? angularDistance(baseAz, baseAlt, baseAz + offsetAz, baseAlt + offsetAlt) : 0).toFixed(4)));
}

/** 辻メッシュ: 月齢フィルタのUI状態(入力可否)を更新 */
function updateTsujiMeshMoonFilterUI() {
    const enabled = appState.tsujiMeshMoonFilterEnabled;
    const b = document.getElementById('input-tsujimesh-moon-base');
    const t = document.getElementById('input-tsujimesh-moon-tolerance');
    if (b) b.disabled = !enabled;
    if (t) t.disabled = !enabled;
}

/** 辻メッシュ: 標高オプションのUI状態(OK/NGチェックの入力可否)を更新 */
function updateTsujiMeshElevationOptionUI() {
    const enabled = appState.tsujiMeshElevationOption;
    const ok = document.getElementById('chk-tsujimesh-elev-ok');
    const ng = document.getElementById('chk-tsujimesh-elev-ng');
    if (ok) ok.disabled = !enabled;
    if (ng) ng.disabled = !enabled;
}

/** 辻メッシュ: 時間フィルタのUI状態(活性/非活性)を更新 */
function updateTsujiMeshTimeFilterUI() {
    const on = appState.tsujiMeshTimeFilter;
    document.querySelectorAll('#tsujimesh-time-filter-groups .tsujimesh-time-control').forEach(el => { el.disabled = !on; });
    ['start', 'end'].forEach(group => {
        const G = group === 'start' ? 'Start' : 'End';
        const pp = on && appState['tsujiMesh' + G + 'PrePost'];
        document.querySelectorAll('.tsujimesh-' + group + '-prepost-control').forEach(el => { el.disabled = !pp; });
    });
}

/** 辻メッシュ: 時間フィルタのフォーム値をappStateから反映 */
function syncTsujiMeshTimeFilter() {
    const chk = document.getElementById('chk-tsujimesh-time-filter');
    if (!chk) return;
    chk.checked = appState.tsujiMeshTimeFilter;
    ['start', 'end'].forEach(group => {
        const G = group === 'start' ? 'Start' : 'End';
        const mr = document.querySelector(`input[name="tsujimesh-${group}-mode"][value="${appState['tsujiMesh' + G + 'Mode']}"]`);
        if (mr) mr.checked = true;
        document.getElementById(`input-tsujimesh-${group}-time`).value = appState['tsujiMesh' + G + 'Time'];
        document.getElementById(`chk-tsujimesh-${group}-prepost`).checked = appState['tsujiMesh' + G + 'PrePost'];
        const dr = document.querySelector(`input[name="tsujimesh-${group}-prepost-dir"][value="${appState['tsujiMesh' + G + 'PrePostDir']}"]`);
        if (dr) dr.checked = true;
        document.getElementById(`input-tsujimesh-${group}-offset`).value = appState['tsujiMesh' + G + 'Offset'];
    });
    updateTsujiMeshTimeFilterUI();
}

/** 月齢が基準月齢±許容範囲の範囲内かどうか（月齢はSYNODIC_MONTHで循環） */
function isMoonAgeInRange(moonAge, base, tolerance) {
    const S = SYNODIC_MONTH;
    // 循環を考慮した最短距離
    let diff = Math.abs(moonAge - base);
    if (diff > S / 2) diff = S - diff;
    return diff <= tolerance;
}

// --- 辻検索 ---
/** 辻検索パネルをMy辻検索結果表示用に開く (startTsujiSearchを呼ばず、ヘッダーテキストを差し替える) */
function showTsujiPanelForMyTsuji(titleText) {
    if (appState.isTsujiMeshActive) closeTsujiMesh();   // 辻メッシュ検索とは同時表示不可
    appState.isTsujiSearchActive = true;
    document.getElementById('btn-tsuji-search').classList.add('active');
    document.getElementById('tsujisearch-panel').classList.remove('hidden');
    document.getElementById('tsujisearch-header').innerHTML =
        `${titleText} <span id="tsujisearch-status"></span>`;
    syncBottomPanels();
}

function toggleTsujiSearch() {
    appState.isTsujiSearchActive = !appState.isTsujiSearchActive;
    const btn = document.getElementById('btn-tsuji-search');
    const pnl = document.getElementById('tsujisearch-panel');

    if (appState.isTsujiSearchActive) {
        if (appState.isTsujiMeshActive) closeTsujiMesh();   // 辻メッシュ検索とは同時表示不可
        btn.classList.add('active');
        pnl.classList.remove('hidden');
        document.getElementById('tsujisearch-header').innerHTML = '辻検索結果 <span id="tsujisearch-status"></span>';
        startTsujiSearch();
    } else {
        btn.classList.remove('active');
        pnl.classList.add('hidden');
        appState.tsujiSearchGeneration++;
        // キャンセル: 実行中ワーカーを terminate し、キューの全タスクを破棄(走り続け防止)。
        // My辻検索の一括計算が実行中の場合は破棄しない(結果の破損防止)。
        if (!myTsujiBatchRunning) tsujiPool.terminateAll();
        hideTsujiProgress();
    }
    syncBottomPanels();
}

// --- 辻メッシュ検索 パネル ---
let tsujiMeshGeneration = 0;   // キャンセル用世代カウンタ
const TSUJIMESH_ZOOM = 14;     // DEM標高タイルのズーム (dem_png の最大)
const TSUJIMESH_EPS = { x1: 0.125, x2: 0.0625, x4: 0.03125, x8: 0.015625 };   // 精度フィルタ→角距離ε(°)
let _tsujiMeshRows = [];       // 表示中の結果行(現在の表示順)
let _tsujiMeshSelIdx = -1;     // 選択中の行index
let _tsujiMeshPix = null;      // 対象画素 { lat:Float64Array, lng:Float64Array, elev:Float32Array(DEM標高) } (プレフィルタ後)
let _tsujiMeshPixHeightUsed = 0;   // 検索時に使った観測点高(金色マーカーの観測点設定・標高判定に使用)
let tsujiMeshLayer = null, _tsujiMeshGoldLayer = null, _tsujiMeshCanvasRenderer = null;
let _tsujiMeshLayerVisible = true;   // マーカーレイヤーの表示/非表示(コントロールのチェックボックス)
let _tsujiMeshCalc = null;     // 辻時刻コントロールの再計算用スナップショット(画素索引+検索条件。検索毎に更新)
let _tmCtrlDay0 = null;        // 選択行の日0:00(ms)。実効辻時刻 = day0 + スライダー(その日の通算秒) + サブ秒
let _tmCtrlFracMs = 0;         // 実効辻時刻のサブ秒(ms)。行選択/ジャンプ時は精細化時刻の端数、スライダー手動操作で0にリセット
let _tmCtrlWidth = 0;          // 辻時刻の幅(±秒) 0〜30 (0=指定した1秒のみ)
let _tmCtrlEps = 0.125;        // 精度フィルタオプション(角距離ε°) ◎〜◎×128
let _tmPostMode = 'attime';    // 行選択後オプション: 'attime'=表示辻時刻での最高精度点(既定) / 'near'=近傍の最高精度点(≠辻時刻)
let _tmSearchArea = 3;         // 検索エリア: DEM標高タイルの範囲 N×N (3/4/5/6)
let _tmMeshGray = 0;           // メッシュマーカー色: グレースケール% (0=白〜100=黒)
let _tmForcedPin = null;       // 行選択時に優辻マーカーを強制配置する画素(近傍モード。再計算1回で消費)
let _tmLastBig = null;         // 直近の再計算で表示した優辻マーカー {pix, dist, timeMs}(地図センタリングに使用)
let _tsujiMeshWhiteRow = null;   // 白マーカー索引: 画素→最良の行(下のスナップショット配列のindex。-1=なし)
let _tsujiMeshWhiteTime = null;  // 白マーカー索引: 画素→その行での最良辻時刻(ms)
let _tsujiMeshWhiteDist = null;  // 白マーカー索引: 画素→その行での最良精度角距離(°)
let _tsujiMeshWhiteRows = null;  // 索引構築時の行スナップショット(結果リストのソートに影響されない参照)
// 全件索引(CSR): 1画素×表示天体毎に複数日の最良辻日時を全て保持する(取りこぼしなし)。
// 画素pの全ヒットは k = start[p]〜start[p+1]-1 で、行= rows[row[k]]・行内位置= pos[k]
// (辻時刻= 行.pixTime[pos[k]]・精度角距離= 行.pixDist[pos[k]]。値は行の配列を参照し重複保持しない)
let _tsujiMeshPixEntries = null; // { start: Uint32Array(n+1), row: Int32Array(m), pos: Uint32Array(m) }

// 辻メッシュ検索 ワーカープール (tsujiPoolと同型 + 全ワーカーへの画素データinit)
const tsujiMeshPool = (() => {
    let workers = [];
    let idle = [];
    const queue = [];
    const active = new Map();
    function ensure() {
        while (workers.length < TSUJI_NUM_WORKERS) {
            const w = new Worker('tsujimesh-search-worker.js');
            workers.push(w);
            idle.push(w);
        }
    }
    function dispatch() {
        while (idle.length && queue.length) {
            const w = idle.shift();
            const task = queue.shift();
            run(w, task);
        }
    }
    function run(worker, task) {
        active.set(worker, task);
        worker.onmessage = (e) => {
            active.delete(worker);
            if (e.data && e.data.error) task.reject(new Error(e.data.error));
            else task.resolve(e.data);
            idle.push(worker);
            dispatch();
        };
        worker.onerror = (err) => {
            active.delete(worker);
            task.reject(err);
            idle.push(worker);
            dispatch();
        };
        worker.postMessage(task.taskData);
    }
    return {
        /** 全ワーカーを生成し、画素データ(基準方位角/視高度+ビン索引)を配布して応答を待つ */
        async init(initData) {
            ensure();
            await Promise.all(workers.map(w => new Promise((resolve, reject) => {
                w.onmessage = (e) => {
                    if (e.data && e.data.type === 'inited') resolve();
                    else if (e.data && e.data.error) reject(new Error(e.data.error));
                };
                w.onerror = reject;
                w.postMessage(initData);
            })));
        },
        runTask(taskData) {
            return new Promise((resolve, reject) => {
                ensure();
                queue.push({ taskData, resolve, reject });
                dispatch();
            });
        },
        terminateAll() {
            workers.forEach(w => { try { w.terminate(); } catch(_) {} });
            const err = new Error('canceled');
            active.forEach(t => t.reject(err));
            active.clear();
            queue.forEach(t => t.reject(err));
            queue.length = 0;
            workers = [];
            idle = [];
        }
    };
})();

function ensureTsujiMeshLayers() {
    if (!tsujiMeshLayer && typeof map !== 'undefined' && map) {
        _tsujiMeshCanvasRenderer = L.canvas({ padding: 0.3 });   // 多数の小マーカー用にCanvas描画
        tsujiMeshLayer = L.layerGroup().addTo(map);
        _tsujiMeshGoldLayer = L.layerGroup().addTo(map);
        applyTsujiMeshLayerVisibility();
    }
}

/** マーカーレイヤー(白/金)の表示/非表示をチェックボックスの状態に合わせる */
function applyTsujiMeshLayerVisibility() {
    if (typeof map === 'undefined' || !map) return;
    // 辻マーカー(集合+ピン)は、表示天体メニューで選択行の天体がオフなら非表示にする
    const row = _tsujiMeshRows[_tsujiMeshSelIdx];
    const bodyVisible = !row || !row.body || row.body.visible !== false;
    [[tsujiMeshLayer, _tsujiMeshLayerVisible], [_tsujiMeshGoldLayer, _tsujiMeshLayerVisible && bodyVisible]].forEach(([l, vis]) => {
        if (!l) return;
        if (vis) { if (!map.hasLayer(l)) l.addTo(map); }
        else if (map.hasLayer(l)) { map.removeLayer(l); }
    });
}
function clearTsujiMeshMarkers() {
    if (tsujiMeshLayer) tsujiMeshLayer.clearLayers();
    if (_tsujiMeshGoldLayer) _tsujiMeshGoldLayer.clearLayers();
    _tsujiMeshGoldSet = null;
    _tsujiMeshWhiteRow = null; _tsujiMeshWhiteTime = null; _tsujiMeshWhiteDist = null; _tsujiMeshWhiteRows = null;
    if (_tmHoverTooltip) { _tmHoverTooltip.remove(); _tmHoverTooltip = null; }
}

/** ヒット画素集合を検索エリア(N×256四方)のオーバーレイ画像に描いて返す(1画像画素=DEM1画素の実寸表示)。
 *  paint(put) の put(pix) で画素を塗る。rgba=[r,g,b,a(0..255)] */
function _tmBuildOverlay(paint, rgba) {
    const C = _tsujiMeshCalc;
    if (!C || !C.grid) return null;
    const W = C.gridW;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = W;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(W, W);
    const data = img.data;
    const [r, g, b, a] = rgba;
    paint((pix) => {
        const o = C.gridPos[pix] * 4;
        data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = a;
    });
    ctx.putImageData(img, 0, 0);
    return L.imageOverlay(canvas.toDataURL(), C.bounds, { interactive: false });
}

/** 地図座標→対象画素index(集合の当たり判定用)。対象外は -1 */
function _tmPixAtLatLng(latlng) {
    const C = _tsujiMeshCalc;
    if (!C || !C.grid) return -1;
    const scale = Math.pow(2, TSUJIMESH_ZOOM);
    const R = 128 / Math.PI;
    const gpx = Math.floor(128 * (latlng.lng / 180 + 1) * scale);
    const sinLat = Math.sin(latlng.lat * Math.PI / 180);
    const gpy = Math.floor((128 - R * Math.atanh(Math.max(-0.9999999, Math.min(0.9999999, sinLat)))) * scale);
    const x = gpx - C.gxBase, y = gpy - C.gyBase;
    if (x < 0 || x >= C.gridW || y < 0 || y >= C.gridW) return -1;
    return C.grid[y * C.gridW + x] - 1;
}

/** 全結果行のヒット画素の和集合を白のオーバーレイで描画(全画素表示・上限なし)。
 *  あわせて「画素→最良の行(最小dist)とその辻時刻・精度角距離」の索引を構築する(ホバー/クリック用)。 */
function drawTsujiMeshMarkers() {
    ensureTsujiMeshLayers();
    if (!tsujiMeshLayer || !_tsujiMeshPix) return;
    tsujiMeshLayer.clearLayers();
    const n = _tsujiMeshPix.lat.length;
    _tsujiMeshWhiteRow = new Int32Array(n).fill(-1);
    _tsujiMeshWhiteTime = new Float64Array(n);
    _tsujiMeshWhiteDist = new Float32Array(n);
    _tsujiMeshWhiteRows = _tsujiMeshRows.slice();
    // 全件索引(CSR)の構築: 1パス目=画素毎のヒット数を数え、2パス目=行/行内位置を充填する
    let m = 0;
    for (const row of _tsujiMeshWhiteRows) m += row.pixIdx.length;
    const csrStart = new Uint32Array(n + 1);
    for (const row of _tsujiMeshWhiteRows) {
        const idxArr = row.pixIdx;
        for (let i = 0; i < idxArr.length; i++) csrStart[idxArr[i] + 1]++;
    }
    for (let p = 0; p < n; p++) csrStart[p + 1] += csrStart[p];
    const csrRow = new Int32Array(m), csrPos = new Uint32Array(m);
    const fill = csrStart.slice(0, n);   // 画素毎の書き込み位置(進行カーソル)
    const overlay = _tmBuildOverlay((put) => {
        for (let r = 0; r < _tsujiMeshWhiteRows.length; r++) {
            const row = _tsujiMeshWhiteRows[r];
            const idxArr = row.pixIdx;
            for (let i = 0; i < idxArr.length; i++) {
                const pix = idxArr[i];
                const k = fill[pix]++;
                csrRow[k] = r;
                csrPos[k] = i;
                if (_tsujiMeshWhiteRow[pix] < 0) {
                    put(pix);
                    _tsujiMeshWhiteRow[pix] = r;
                    _tsujiMeshWhiteTime[pix] = row.pixTime[i];
                    _tsujiMeshWhiteDist[pix] = row.pixDist[i];
                } else if (row.pixDist[i] < _tsujiMeshWhiteDist[pix]) {
                    _tsujiMeshWhiteRow[pix] = r;
                    _tsujiMeshWhiteTime[pix] = row.pixTime[i];
                    _tsujiMeshWhiteDist[pix] = row.pixDist[i];
                }
            }
        }
    }, (() => { const v = Math.round(255 * (1 - _tmMeshGray / 100)); return [v, v, v, 230]; })());
    _tsujiMeshPixEntries = { start: csrStart, row: csrRow, pos: csrPos };
    if (overlay) overlay.addTo(tsujiMeshLayer);
}

/** 全件索引から画素の全ヒット(表示天体毎→日付順)を取り出す。各要素 {row, timeMs, dist, best}。
 *  CSRの2パス目は行indexの昇順に充填するため、取り出し順=行の構築順(表示天体順→日時順)。 */
function _tmPixAllHits(pix) {
    const E = _tsujiMeshPixEntries;
    if (!E || !_tsujiMeshWhiteRows) return [];
    const out = [];
    for (let k = E.start[pix]; k < E.start[pix + 1]; k++) {
        const row = _tsujiMeshWhiteRows[E.row[k]], i = E.pos[k];
        out.push({ row, timeMs: row.pixTime[i], dist: row.pixDist[i], best: false });
    }
    let bi = -1;
    for (let j = 0; j < out.length; j++) if (bi < 0 || out[j].dist < out[bi].dist) bi = j;
    if (bi >= 0) out[bi].best = true;
    return out;
}

/** 選択行のヒット画素を金色マーカーで描画(クリックで観測点に設定できる) */
function updateTsujiMeshGoldMarkers() {
    ensureTsujiMeshLayers();
    if (!_tsujiMeshGoldLayer || !_tsujiMeshPix) return;
    _tsujiMeshGoldLayer.clearLayers();
    const row = _tsujiMeshRows[_tsujiMeshSelIdx];
    if (!row) return;
    const n = Math.min(row.pixIdx.length, 5000);
    for (let i = 0; i < n; i++) {
        const pix = row.pixIdx[i];
        const lat = _tsujiMeshPix.lat[pix], lng = _tsujiMeshPix.lng[pix], elev = _tsujiMeshPix.elev[pix];
        L.circleMarker([lat, lng], {
            renderer: _tsujiMeshCanvasRenderer,
            radius: 4, color: '#b8860b', weight: 1, fillColor: '#ffd700', fillOpacity: 1,
        }).on('click', () => {
            // 金色マーカーを選択すると観測点に設定できる(位置情報を取得。観測点高=検索時の観測点高)
            appState.start = { lat, lng, elev: elev + _tsujiMeshPixHeightUsed };
            appState.startApiElev = elev;
            appState.startHeight = _tsujiMeshPixHeightUsed;
            saveAppState();
            updateAll();
        }).bindTooltip(`精度角距離 ${row.pixDist[i].toFixed(5)}°<br>クリックで観測点に設定`, { direction: 'top' })
          .addTo(_tsujiMeshGoldLayer);
    }
}

/** 辻時刻コントロールの実効辻時刻(ms)。スライダー(選択行の日0:00からの通算秒)+サブ秒 から求める */
function _tmCtrlEffectiveMs() {
    if (_tmCtrlDay0 === null) return null;
    const sl = document.getElementById('tsujimesh-time-slider');
    if (!sl) return null;
    return _tmCtrlDay0 + parseInt(sl.value) * 1000 + _tmCtrlFracMs;
}

/** 指定した辻時刻(±幅s)の各秒で全画素を再評価し、精度フィルタ(ε)以内の画素を金色マーカーで表示する。
 *  判定はワーカー(tsujimesh-search-worker.js)と同一: 天体位置は領域中心で1回計算し、
 *  方位角ビン索引で候補画素を引き、ENU一次回転補正した検索中心(点/線)への角距離で判定する。
 *  検索条件(オフセット/検索中心/大気差)は検索時のスナップショット(_tsujiMeshCalc)に凍結。 */
function recalcTsujiMeshGoldAtTime() {
    const C = _tsujiMeshCalc;
    const row = _tsujiMeshRows[_tsujiMeshSelIdx];
    const t = _tmCtrlEffectiveMs();
    if (!C || !row || t === null) { updateTsujiMeshGoldMarkers(); return; }
    const lbl = document.getElementById('tsujimesh-time-label');
    if (lbl) lbl.textContent = `辻日時: ${_tmFmtDateMs(t)} ${_tmFmtTimeMs2(t)}`;   // 0.01秒表示
    const eps = _tmCtrlEps, w = _tmCtrlWidth;
    const D2R = Math.PI / 180;
    const wrap180 = (deg) => ((deg + 540) % 360) - 180;
    const angDist = (az1, alt1, az2, alt2) => {
        const s = Math.sin(alt1 * D2R) * Math.sin(alt2 * D2R) +
                  Math.cos(alt1 * D2R) * Math.cos(alt2 * D2R) * Math.cos((az1 - az2) * D2R);
        return Math.acos(Math.max(-1, Math.min(1, s))) / D2R;
    };
    const isLine = C.centerMode === 'line';
    const dAz = wrap180(C.offsetAz), dAlt = C.offsetAlt;
    const len2 = dAz * dAz + dAlt * dAlt;
    const altLo = (isLine ? Math.min(0, dAlt) : C.offsetAlt) - eps;
    const altHi = (isLine ? Math.max(0, dAlt) : C.offsetAlt) + eps;
    const azLo = isLine ? Math.min(0, dAz) : dAz;
    const azHi = isLine ? Math.max(0, dAz) : dAz;
    const evalDist = (pix, ex, ny, uz) => {
        const wE = -C.dN[pix], wN = C.dE[pix], wU = C.dE[pix] * C.tanLat;
        const cx = ex - (wN * uz - wU * ny);
        const cy = ny - (wU * ex - wE * uz);
        const cz = uz - (wE * ny - wN * ex);
        const altPd = Math.asin(Math.max(-1, Math.min(1, cz))) / D2R;
        const azP = Math.atan2(cx, cy) / D2R;
        const bAz = C.baseAz[pix], bAlt = C.baseAlt[pix];
        if (isLine) {
            const pAz = wrap180(azP - bAz), pAlt = altPd - bAlt;
            let s = len2 > 0 ? (pAz * dAz + pAlt * dAlt) / len2 : 0;
            s = Math.max(0, Math.min(1, s));
            return angDist(azP, altPd, bAz + s * dAz, bAlt + s * dAlt);
        }
        return angDist(azP, altPd, bAz + C.offsetAz, bAlt + C.offsetAlt);
    };
    const observer = new Astronomy.Observer(C.observerData.lat, C.observerData.lng, C.observerData.elev);
    let fixedRaDec = null;
    if (isFixedStar(row.body.id)) fixedRaDec = getFixedStarRaDec(row.body.id);
    // 点モードの高速路: 画素ごとの検索中心(基準+オフセット)の単位ベクトルを一度だけ前計算し、
    // 弦距離の2乗(角距離と厳密に単調)で判定する(三角関数はヒット分の角度変換のみ)。
    if (!isLine && !C.tx) {
        const n = C.baseAz.length;
        C.tx = new Float32Array(n); C.ty = new Float32Array(n); C.tz = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            const taz = (C.baseAz[i] + C.offsetAz) * D2R, talt = (C.baseAlt[i] + C.offsetAlt) * D2R;
            const c2 = Math.cos(talt);
            C.tx[i] = Math.sin(taz) * c2; C.ty[i] = Math.cos(taz) * c2; C.tz[i] = Math.sin(talt);
        }
    }
    const chord2 = (pix, ex, ny, uz) => {
        const wE = -C.dN[pix], wN = C.dE[pix], wU = C.dE[pix] * C.tanLat;
        const cx = ex - (wN * uz - wU * ny);
        const cy = ny - (wU * ex - wE * uz);
        const cz = uz - (wE * ny - wN * ex);
        const dx = cx - C.tx[pix], dy = cy - C.ty[pix], dz = cz - C.tz[pix];
        return dx * dx + dy * dy + dz * dz;
    };
    const chordToDeg = (q) => Math.asin(Math.min(1, Math.sqrt(q) / 2)) * 2 / D2R;
    const thr2 = Math.pow(2 * Math.sin(eps * D2R / 2), 2);
    // 集合の最小distは型付き配列で持つ(幅が広い時に数百万回のget/setになるMapより速い)
    if (!C.distBuf) C.distBuf = new Float32Array(C.baseAz.length);
    const distBuf = C.distBuf;
    distBuf.fill(Infinity);
    const hits = [];
    for (let s = -w; s <= w; s++) {
        const time = new Date(t + s * 1000);
        let ra, dec;
        if (fixedRaDec) {
            ra = fixedRaDec.ra; dec = fixedRaDec.dec;
        } else {
            const eq = Astronomy.Equator(row.body.id, time, observer, true, true);
            ra = eq.ra; dec = eq.dec;
        }
        const hor = Astronomy.Horizon(time, observer, ra, dec, C.refractionEnabled ? 'normal' : null);
        const az = hor.azimuth, alt = hor.altitude;
        if (alt < C.minAlt + altLo - 0.05 || alt > C.maxAlt + altHi + 0.05) continue;
        const ca = Math.cos(alt * D2R);
        const ex = Math.sin(az * D2R) * ca, ny = Math.cos(az * D2R) * ca, uz = Math.sin(alt * D2R);
        const cosAlt = Math.max(ca, 0.02);
        let half = (azHi - azLo) / 2 + eps / cosAlt + C.binSize + 0.08;
        if (half > 15) half = 15;
        const center = az - (azLo + azHi) / 2;
        const b0 = Math.floor((((center - half) % 360 + 360) % 360) / C.binSize);
        const b1 = Math.floor((((center + half) % 360 + 360) % 360) / C.binSize);
        const scanBin = (b) => {
            const st = C.binIndex[b], en = C.binIndex[b + 1];
            for (let i = st; i < en; i++) {
                const pix = C.binPixels[i];
                const relAlt = alt - C.baseAlt[pix];
                if (relAlt < altLo - 0.05 || relAlt > altHi + 0.05) continue;
                let dist;
                if (isLine) {
                    dist = evalDist(pix, ex, ny, uz);
                    if (dist > eps) continue;
                } else {
                    const q = chord2(pix, ex, ny, uz);
                    if (q > thr2) continue;
                    dist = chordToDeg(q);
                }
                if (distBuf[pix] === Infinity) hits.push(pix);
                if (dist < distBuf[pix]) distBuf[pix] = dist;
            }
        };
        if (b0 <= b1) {
            for (let b = b0; b <= b1; b++) scanBin(b);
        } else {   // 0°をまたぐ
            for (let b = b0; b < C.nBins; b++) scanBin(b);
            for (let b = 0; b <= b1; b++) scanBin(b);
        }
    }
    const perPix = new Map();   // pix -> 最小dist (クリック/ホバー判定と描画に使用)
    for (let i = 0; i < hits.length; i++) perPix.set(hits[i], distBuf[hits[i]]);
    // 指定した辻時刻(実効時刻t)での最良精度の画素: εに関係なく全画素の最小距離(argmin)を1回のスイープで求める
    let big = null;
    {
        const time = new Date(t);
        let ra, dec;
        if (fixedRaDec) {
            ra = fixedRaDec.ra; dec = fixedRaDec.dec;
        } else {
            const eq = Astronomy.Equator(row.body.id, time, observer, true, true);
            ra = eq.ra; dec = eq.dec;
        }
        const hor = Astronomy.Horizon(time, observer, ra, dec, C.refractionEnabled ? 'normal' : null);
        const ca = Math.cos(hor.altitude * D2R);
        const ex = Math.sin(hor.azimuth * D2R) * ca, ny = Math.cos(hor.azimuth * D2R) * ca, uz = Math.sin(hor.altitude * D2R);
        let bestPix = -1, bestDist = Infinity;
        const n = C.baseAz.length;
        if (isLine) {
            for (let pix = 0; pix < n; pix++) {
                const dist = evalDist(pix, ex, ny, uz);
                if (dist < bestDist) { bestDist = dist; bestPix = pix; }
            }
        } else {
            let bestQ = Infinity;
            for (let pix = 0; pix < n; pix++) {
                const q = chord2(pix, ex, ny, uz);
                if (q < bestQ) { bestQ = q; bestPix = pix; }
            }
            bestDist = chordToDeg(bestQ);
        }
        if (bestPix >= 0) big = { pix: bestPix, dist: bestDist, timeMs: t };
    }
    // 近傍モードの行選択直後は、指定された「近傍の最高精度点」へピンを強制配置(1回で消費)
    if (_tmForcedPin) { big = _tmForcedPin; _tmForcedPin = null; }
    drawTsujiMeshGoldSet(perPix, big);
}

/** 金色マーカーの画素をクリックした時と同じ観測点設定(観測点高=検索時の観測点高) */
function _tmSetObserverToPix(pix) {
    const lat = _tsujiMeshPix.lat[pix], lng = _tsujiMeshPix.lng[pix], elev = _tsujiMeshPix.elev[pix];
    appState.start = { lat, lng, elev: elev + _tsujiMeshPixHeightUsed };
    appState.startApiElev = elev;
    appState.startHeight = _tsujiMeshPixHeightUsed;
    saveAppState();
    updateAll();
}

/** 再計算した画素集合(pix→精度角距離)を金色のオーバーレイで描画し(全画素表示・上限なし)、
 *  クリック/ホバーは地図側のハンドラで _tsujiMeshGoldSet を参照。
 *  big={pix,dist,timeMs}(最良精度の画素)には、観測点マーカーと同じ大きさの金色ピン(優辻マーカー)を立てる。 */
let _tsujiMeshGoldSet = null;   // 表示中の辻マーカー集合(pix→精度角距離)。クリック/ホバー判定に使用
const _tmColorCache = new Map();   // CSS色→[r,g,b](辻マーカーの天体色)
function _tmCssColorToRGB(c) {
    const key = c || '#ffd700';
    let rgb = _tmColorCache.get(key);
    if (!rgb) {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 1;
        const x = cv.getContext('2d');
        x.fillStyle = key;
        x.fillRect(0, 0, 1, 1);
        const d = x.getImageData(0, 0, 1, 1).data;
        rgb = [d[0], d[1], d[2]];
        _tmColorCache.set(key, rgb);
    }
    return rgb;
}
function _tmFmtDateMs(ms) {
    const d = new Date(ms);
    const dow = ['日','月','火','水','木','金','土'][d.getDay()];
    return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日(${dow})`;
}
function _tmFmtTimeMs2(ms) {
    const d = new Date(ms);
    const sec = d.getSeconds() + d.getMilliseconds() / 1000;
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${sec.toFixed(2).padStart(5, '0')}`;
}
function drawTsujiMeshGoldSet(perPix, big) {
    ensureTsujiMeshLayers();
    if (!_tsujiMeshGoldLayer || !_tsujiMeshPix) return;
    _tsujiMeshGoldLayer.clearLayers();
    _tsujiMeshGoldSet = perPix;
    _tmLastBig = (big && big.pix >= 0) ? big : null;
    // 辻マーカーは選択行の天体色で描く(複数天体の検索でどの天体の集合か分かるように)
    const row = _tsujiMeshRows[_tsujiMeshSelIdx];
    const [cr, cg, cb] = _tmCssColorToRGB(row && row.body ? row.body.color : '#ffd700');
    const overlay = _tmBuildOverlay((put) => { for (const pix of perPix.keys()) put(pix); }, [cr, cg, cb, 235]);
    if (overlay) overlay.addTo(_tsujiMeshGoldLayer);
    // 最良精度の画素: 観測点マーカーと同じ大きさの金色ピン(優辻マーカー)で指し示す
    if (big && big.pix >= 0) {
        const goldIcon = L.divIcon({ className: '', html: '<div class="location-marker location-marker-tsujigold"></div>', iconSize: [24, 24], iconAnchor: [12, 24] });
        const marker = L.marker([_tsujiMeshPix.lat[big.pix], _tsujiMeshPix.lng[big.pix]], { icon: goldIcon, zIndexOffset: 900 })
            .on('click', () => _tmShowPinPopup(big))   // クリック/タップでポップアップ(観測点は移動しない)
            .bindTooltip('…', { direction: 'top' })
            .addTo(_tsujiMeshGoldLayer);
        // ツールチップは開いた時に画素の最良辻時刻(0.01秒精度)を精細化して表示する
        marker.on('tooltipopen', () => {
            const ref = _tmRefinePixelTime(big.pix) || { timeMs: big.timeMs, dist: big.dist };
            marker.setTooltipContent(_tmTooltipHtml('優辻マーカー(最良画素)', ref.timeMs, ref.dist));
        });
    }
    applyTsujiMeshLayerVisibility();
}

/** メッシュ/辻マーカーの画素のポップアップを開く(PC=クリック・スマホ=タップ共通)。
 *  マーカーのクリック/タップでは位置を確定してポップアップを表示するだけで、観測点は移動しない。
 *  ポップアップの行(メッシュ)/内容(辻)をクリック/タップすると、該当行のデータを結果リストで
 *  表示して観測点をその画素に移動する。画素ヒットなしは false(通常の地図操作として処理)。 */
function _tmShowPixelPopup(latlng) {
    if (!_tsujiMeshLayerVisible || typeof map === 'undefined' || !map) return false;
    const pix = _tmPixAtLatLng(latlng);
    if (pix < 0) return false;
    const action = _mapDblClickMode ? 'クリックで観測点に設定' : 'タップで観測点に設定';
    const div = document.createElement('div');
    if (_tsujiMeshGoldSet && map.hasLayer(_tsujiMeshGoldLayer) && _tsujiMeshGoldSet.has(pix)) {
        // 辻マーカー: 内容(1ブロック)をクリック→観測点をこの画素に移動+選択中の行をリストで表示
        const ref = _tmRefinePixelTime(pix);
        if (!ref) return false;
        div.innerHTML = `<div class="tm-popup-block">${_tmTooltipHtml('辻マーカー(対象精度)', ref.timeMs, ref.dist, action)}</div>`;
        div.querySelector('.tm-popup-block').addEventListener('click', () => {
            map.closePopup();
            _tmSetObserverToPix(pix);
            const row = _tsujiMeshRows[_tsujiMeshSelIdx];
            if (row && row.__tr) row.__tr.scrollIntoView({ block: 'nearest' });
        });
    } else if (_tsujiMeshWhiteRow && map.hasLayer(tsujiMeshLayer) && _tsujiMeshWhiteRow[pix] >= 0) {
        // メッシュマーカー: 天体×日付毎の行をホバーでハイライト・クリックで該当行を選択+観測点移動
        const r = _tmMeshPopupLinesHtml(pix, true);
        if (!r) return false;
        div.innerHTML = `${r.html}<div class="tm-popup-note">${action}</div>`;
        div.querySelectorAll('.tm-popup-line').forEach(el => {
            el.addEventListener('click', () => {
                const h = r.hits[parseInt(el.dataset.j)];
                if (!h) return;
                map.closePopup();
                _tmSetObserverToPix(pix);
                const idx = _tsujiMeshRows.indexOf(h.row);
                if (idx >= 0) {
                    // ジャンプ先の辻時刻は行と同じ0.01秒精細化後の値(表示との一致)
                    const ref = _tmRefinePixelTimeFast(pix, h.timeMs, h.row.body);
                    selectTsujiMeshRow(idx, { pix, timeMs: ref ? ref.timeMs : h.timeMs, dist: ref ? ref.dist : h.dist });
                }
            });
        });
    } else return false;
    L.popup({ offset: [0, -4] })
        .setLatLng(L.latLng(_tsujiMeshPix.lat[pix], _tsujiMeshPix.lng[pix]))
        .setContent(div)
        .openOn(map);
    return true;
}

/** 優辻マーカー(金色ピン)のポップアップ(クリック/タップで開く。観測点は移動しない)。
 *  内容をクリック/タップすると観測点をその画素に移動し、選択中の行をリストで表示する。 */
function _tmShowPinPopup(big) {
    if (typeof map === 'undefined' || !map) return;
    const ref = _tmRefinePixelTime(big.pix) || { timeMs: big.timeMs, dist: big.dist };
    const action = _mapDblClickMode ? 'クリックで観測点に設定' : 'タップで観測点に設定';
    const div = document.createElement('div');
    div.innerHTML = `<div class="tm-popup-block">${_tmTooltipHtml('優辻マーカー(最良画素)', ref.timeMs, ref.dist, action)}</div>`;
    div.querySelector('.tm-popup-block').addEventListener('click', () => {
        map.closePopup();
        _tmSetObserverToPix(big.pix);
        const row = _tsujiMeshRows[_tsujiMeshSelIdx];
        if (row && row.__tr) row.__tr.scrollIntoView({ block: 'nearest' });
    });
    L.popup({ offset: [0, -20] })
        .setLatLng([_tsujiMeshPix.lat[big.pix], _tsujiMeshPix.lng[big.pix]])
        .setContent(div)
        .openOn(map);
}

/** 画素×天体の角距離評価関数(ms→°)を作る。判定は検索本体と同一(回転補正+点/線の検索中心)。
 *  検索条件は検索時のスナップショット(_tsujiMeshCalc)に凍結。条件不足ならnull。 */
function _tmPixDistFn(pix, body) {
    const C = _tsujiMeshCalc;
    if (!C || !body) return null;
    const D2R = Math.PI / 180;
    const wrap180 = (deg) => ((deg + 540) % 360) - 180;
    const angDist = (az1, alt1, az2, alt2) => {
        const s = Math.sin(alt1 * D2R) * Math.sin(alt2 * D2R) +
                  Math.cos(alt1 * D2R) * Math.cos(alt2 * D2R) * Math.cos((az1 - az2) * D2R);
        return Math.acos(Math.max(-1, Math.min(1, s))) / D2R;
    };
    const isLine = C.centerMode === 'line';
    const dAz = wrap180(C.offsetAz), dAlt = C.offsetAlt;
    const len2 = dAz * dAz + dAlt * dAlt;
    const observer = new Astronomy.Observer(C.observerData.lat, C.observerData.lng, C.observerData.elev);
    let fixedRaDec = null;
    if (isFixedStar(body.id)) fixedRaDec = getFixedStarRaDec(body.id);
    return (ms, out) => {
        const time = new Date(ms);
        let ra, dec;
        if (fixedRaDec) { ra = fixedRaDec.ra; dec = fixedRaDec.dec; }
        else { const eq = Astronomy.Equator(body.id, time, observer, true, true); ra = eq.ra; dec = eq.dec; }
        const hor = Astronomy.Horizon(time, observer, ra, dec, C.refractionEnabled ? 'normal' : null);
        if (out) { out.az = hor.azimuth; out.alt = hor.altitude; }   // 観測点中心の天体位置(ワーカーのbestAz/bestAltと同義)
        const ca = Math.cos(hor.altitude * D2R);
        const ex = Math.sin(hor.azimuth * D2R) * ca, ny = Math.cos(hor.azimuth * D2R) * ca, uz = Math.sin(hor.altitude * D2R);
        const wE = -C.dN[pix], wN = C.dE[pix], wU = C.dE[pix] * C.tanLat;
        const cx = ex - (wN * uz - wU * ny);
        const cy = ny - (wU * ex - wE * uz);
        const cz = uz - (wE * ny - wN * ex);
        const altPd = Math.asin(Math.max(-1, Math.min(1, cz))) / D2R;
        const azP = Math.atan2(cx, cy) / D2R;
        const bAz = C.baseAz[pix], bAlt = C.baseAlt[pix];
        if (isLine) {
            const pAz = wrap180(azP - bAz), pAlt = altPd - bAlt;
            let s = len2 > 0 ? (pAz * dAz + pAlt * dAlt) / len2 : 0;
            s = Math.max(0, Math.min(1, s));
            return angDist(azP, altPd, bAz + s * dAz, bAlt + s * dAlt);
        }
        return angDist(azP, altPd, bAz + C.offsetAz, bAlt + C.offsetAlt);
    };
}

/** 画素の辻時刻の軽量精細化: 秒精度の最小時刻(ワーカーの1秒格子)の前後1秒の3点放物線補間で0.01秒化。
 *  ポップアップの行毎の表示・結果行の値用(±120秒スキャンの_tmRefinePixelTimeより約80倍軽い)。
 *  戻り値の az/alt は精細化時刻での観測点中心の天体位置(結果行の方位角/視高度と同義)。 */
function _tmRefinePixelTimeFast(pix, centerMs, body) {
    const distAt = _tmPixDistFn(pix, body);
    if (!distAt) return null;
    const a = distAt(centerMs - 1000) ** 2, b = distAt(centerMs) ** 2, c = distAt(centerMs + 1000) ** 2;
    let frac = 0;
    const denom = a - 2 * b + c;
    if (denom > 1e-18) frac = Math.max(-0.5, Math.min(0.5, 0.5 * (a - c) / denom));
    const bestMs = centerMs + frac * 1000;
    const out = {};
    const dist = distAt(bestMs, out);
    return { timeMs: bestMs, dist, az: out.az, alt: out.alt };
}

/** 画素の最良辻時刻を、中心時刻±120秒の1秒スキャン+放物線補間で0.01秒精度で求める。
 *  判定は検索本体と同一(回転補正+点/線の検索中心)。centerMs/body省略時は表示中の辻時刻と選択行の天体。 */
let _tmRefineCache = { key: null, val: null };
function _tmRefinePixelTime(pix, centerMs, body) {
    const row = _tsujiMeshRows[_tsujiMeshSelIdx];
    const t = (centerMs !== undefined) ? centerMs : _tmCtrlEffectiveMs();
    if (body === undefined) body = row ? row.body : null;
    if (t === null) return null;
    const distAt = _tmPixDistFn(pix, body);
    if (!distAt) return null;
    const key = `${pix}_${t}_${body.id}`;
    if (_tmRefineCache.key === key) return _tmRefineCache.val;
    const R = 120;
    const ds = new Float64Array(2 * R + 1);
    let bi = 0;
    for (let i = 0; i <= 2 * R; i++) {
        ds[i] = distAt(t + (i - R) * 1000);
        if (ds[i] < ds[bi]) bi = i;
    }
    // 放物線補間(距離の2乗が最小近傍で2次関数になることを利用)で秒未満を精細化
    let frac = 0;
    if (bi > 0 && bi < 2 * R) {
        const a = ds[bi - 1] ** 2, b = ds[bi] ** 2, c = ds[bi + 1] ** 2;
        const denom = a - 2 * b + c;
        if (denom > 1e-18) frac = Math.max(-0.5, Math.min(0.5, 0.5 * (a - c) / denom));
    }
    const bestMs = t + (bi - R + frac) * 1000;
    const val = { timeMs: bestMs, dist: distAt(bestMs) };
    _tmRefineCache = { key, val };
    return val;
}

/** ポップアップ本文(タイトル太字/辻日付/辻時刻(0.01秒)/精度角距離/クリック説明)を組み立てる */
function _tmTooltipHtml(title, timeMs, dist, action) {
    return `<strong>${title}</strong><br>辻日付: ${_tmFmtDateMs(timeMs)}<br>辻時刻: ${_tmFmtTimeMs2(timeMs)}<br>精度角距離: ${dist.toFixed(5)}°<br>${action || 'クリックで観測点に設定'}`;
}

/** メッシュマーカーのポップアップに表示する画素の全ヒットを、表示天体毎にグルーピングして
 *  天体内は精度角距離の昇順(最良が先頭)で並べる。天体内で複数ある場合は最良に★(star=true)。
 *  1画素は表示天体毎に複数日の最良辻日時を保持する(公転で同方向を年2回以上通る日を取りこぼさない)。 */
function _tmMeshPopupHits(pix) {
    const hits = _tmPixAllHits(pix);
    const groups = new Map();   // 天体ID→ヒット配列(挿入順=表示天体順)
    for (const h of hits) {
        if (!groups.has(h.row.body.id)) groups.set(h.row.body.id, []);
        groups.get(h.row.body.id).push(h);
    }
    const out = [];
    for (const arr of groups.values()) {
        arr.sort((a, b) => a.dist - b.dist);
        arr.forEach((h, i) => { h.star = (arr.length >= 2 && i === 0); });
        out.push(...arr);
    }
    return out;
}

/** メッシュマーカーのポップアップ本文の行リスト(1行=マーク+天体名 精度角距離° 辻日付 辻時刻(0.01秒))。
 *  表示上限24件、超える場合は末尾に「...25件以上」。interactive=true は各行をクリック可能なdivにする。
 *  戻り値 { hits, html }(表示順のヒット配列と本文HTML)。ヒットなしは null。 */
function _tmMeshPopupLinesHtml(pix, interactive) {
    const hits = _tmMeshPopupHits(pix);
    if (!hits.length) return null;
    const MAX_LINES = 24;
    const parts = [];
    for (let j = 0; j < hits.length && j < MAX_LINES; j++) {
        const h = hits[j];
        const ref = _tmRefinePixelTimeFast(pix, h.timeMs, h.row.body);
        const timeMs = ref ? ref.timeMs : h.timeMs, dist = ref ? ref.dist : h.dist;
        const text = `${h.star ? '★' : '・'}${escapeHtml(h.row.body.name)} ${dist.toFixed(5)}° ${_tmFmtDateMs(timeMs)} ${_tmFmtTimeMs2(timeMs)}`;
        parts.push(interactive ? `<div class="tm-popup-line" data-j="${j}">${text}</div>` : `${text}<br>`);
    }
    if (hits.length > MAX_LINES) parts.push(interactive ? '<div>...25件以上</div>' : '...25件以上<br>');
    return { hits, html: parts.join('') };
}

/** メッシュマーカーのホバー用本文(非インタラクティブ)。1画素分は再計算不要なのでキャッシュする。 */
let _tmMeshTipCache = { pix: -1, rows: null, action: '', html: null };
function _tmMeshTooltipHtml(pix, action) {
    if (_tmMeshTipCache.pix === pix && _tmMeshTipCache.rows === _tsujiMeshWhiteRows &&
        _tmMeshTipCache.action === action) return _tmMeshTipCache.html;
    const r = _tmMeshPopupLinesHtml(pix, false);
    const html = r ? `${r.html}${action}` : null;
    _tmMeshTipCache = { pix, rows: _tsujiMeshWhiteRows, action, html };
    return html;
}

/** 辻マーカー/白マーカー上のホバーでポップアップを表示する(地図のmousemoveから)。
 *  辻マーカー(表示中の集合)を優先し、集合外の白マーカー画素は最良の行の値を表示する。 */
let _tmHoverTooltip = null;
function handleTsujiMeshGoldHover(latlng) {
    const hide = () => { if (_tmHoverTooltip) { _tmHoverTooltip.remove(); _tmHoverTooltip = null; } };
    if (!_tsujiMeshLayerVisible || typeof map === 'undefined' || !map) { hide(); return; }
    const pix = _tmPixAtLatLng(latlng);
    if (pix < 0) { hide(); return; }
    let content = null;
    if (_tsujiMeshGoldSet && map.hasLayer(_tsujiMeshGoldLayer) && _tsujiMeshGoldSet.has(pix)) {
        const ref = _tmRefinePixelTime(pix);
        if (ref) content = _tmTooltipHtml('辻マーカー(対象精度)', ref.timeMs, ref.dist, 'クリックで観測点に設定');
    } else if (_tsujiMeshWhiteRow && map.hasLayer(tsujiMeshLayer) && _tsujiMeshWhiteRow[pix] >= 0) {
        content = _tmMeshTooltipHtml(pix, 'クリックで観測点に設定');
    }
    if (!content) { hide(); return; }
    const at = L.latLng(_tsujiMeshPix.lat[pix], _tsujiMeshPix.lng[pix]);
    // 地図クリック(preclick)でLeafletが非permanentツールチップを閉じるため、
    // 参照が残っていても地図から外れていたら作り直す(クリック後にホバーが再表示されない不具合の修正)
    if (!_tmHoverTooltip || !_tmHoverTooltip._map) {
        if (_tmHoverTooltip) _tmHoverTooltip.remove();
        _tmHoverTooltip = L.tooltip({ direction: 'top' }).setLatLng(at).setContent(content).addTo(map);
    } else {
        _tmHoverTooltip.setLatLng(at).setContent(content);
    }
}

/** 結果リストの選択行を変更(スライダー/◀▶/行クリックから) */
function selectTsujiMeshRow(idx, jump) {
    if (!_tsujiMeshRows.length) return;
    // ソートで並びが変わっている可能性があるため、フラグから現在indexを再同期
    const cur = _tsujiMeshRows.findIndex(r => r.__sel);
    if (cur >= 0) _tsujiMeshSelIdx = cur;
    idx = Math.max(0, Math.min(_tsujiMeshRows.length - 1, idx));
    _tsujiMeshRows.forEach(r => { r.__sel = false; if (r.__tr) r.__tr.classList.remove('selected'); });
    const row = _tsujiMeshRows[idx];
    row.__sel = true;
    _tsujiMeshSelIdx = idx;
    if (row.__tr) {
        row.__tr.classList.add('selected');
        row.__tr.scrollIntoView({ block: 'nearest' });
    }
    // 行選択後オプション(白マーカークリック時はその画素)に従って、
    // 辻時刻コントロールの初期時刻と優辻マーカー(ピン)の位置を決める
    let initDt = row.dateObj;
    _tmForcedPin = null;
    if (jump) {
        // 白マーカークリック: その画素の辻時刻へジャンプし、優辻マーカーをその画素に配置
        initDt = new Date(jump.timeMs);
        _tmForcedPin = { pix: jump.pix, dist: jump.dist, timeMs: jump.timeMs };
    } else if (_tmPostMode === 'near') {
        // 近傍の最高精度点(≠辻時刻): 最高精度(◎×128以内、なければその行の最小距離)の画素のうち、
        // 現在の観測点に地上距離が最も近い画素。辻時刻コントロールはその画素の辻時刻に移動する。
        let minD = Infinity;
        for (let i = 0; i < row.pixDist.length; i++) if (row.pixDist[i] < minD) minD = row.pixDist[i];
        const thr = Math.max(0.0009765625, minD);
        const obs = _tsujiMeshCalc ? _tsujiMeshCalc.observerData : appState.start;
        const cosLat = Math.cos(obs.lat * Math.PI / 180);
        let bestI = -1, bestG = Infinity;
        for (let i = 0; i < row.pixIdx.length; i++) {
            if (row.pixDist[i] > thr) continue;
            const pix = row.pixIdx[i];
            const dLat = _tsujiMeshPix.lat[pix] - obs.lat;
            const dLng = (_tsujiMeshPix.lng[pix] - obs.lng) * cosLat;
            const g = dLat * dLat + dLng * dLng;   // 近傍比較なので平面近似で十分
            if (g < bestG) { bestG = g; bestI = i; }
        }
        if (bestI >= 0) {
            // 表示は0.01秒精細化後の時刻に合わせる(結果行・優辻マーカーのポップアップと同じ)
            const refN = _tmRefinePixelTimeFast(row.pixIdx[bestI], row.pixTime[bestI], row.body);
            const tN = refN ? refN.timeMs : row.pixTime[bestI];
            initDt = new Date(tN);
            _tmForcedPin = { pix: row.pixIdx[bestI], dist: refN ? refN.dist : row.pixDist[bestI], timeMs: tN };
        }
    }
    // 辻時刻コントロールを初期化(スライダー=選択行の日0:00からの通算秒)し、その時刻の再計算集合を辻マーカー表示
    const d0 = new Date(initDt);
    d0.setHours(0, 0, 0, 0);
    _tmCtrlDay0 = d0.getTime();
    const tsl = document.getElementById('tsujimesh-time-slider');
    if (tsl) {
        // スライダー範囲は「その行の全ヒット画素の辻時刻の範囲」(初期値も範囲に含める)
        let minT = Infinity, maxT = -Infinity;
        for (let i = 0; i < row.pixTime.length; i++) {
            if (row.pixTime[i] < minT) minT = row.pixTime[i];
            if (row.pixTime[i] > maxT) maxT = row.pixTime[i];
        }
        // スライダーは秒単位・サブ秒(0.01秒精細化の端数)は_tmCtrlFracMsで保持して表示・再計算に反映
        const totalMs = initDt.getTime() - _tmCtrlDay0;
        const val = Math.floor(totalMs / 1000);
        _tmCtrlFracMs = totalMs - val * 1000;
        if (minT <= maxT) {
            tsl.min = String(Math.min(Math.floor((minT - _tmCtrlDay0) / 1000), val));
            tsl.max = String(Math.max(Math.ceil((maxT - _tmCtrlDay0) / 1000), val));
        } else {
            tsl.min = String(val - 300); tsl.max = String(val + 300);
        }
        tsl.value = String(val);
    }
    recalcTsujiMeshGoldAtTime();
    // 優辻マーカー(ピン)が可視領域(下部パネルを除く)の中央に来るよう表示する
    zoomToTsujiMeshRow(row, _tmLastBig ? _tmLastBig.pix : row.bestPix);
}

/** ズーム=地図の最大ズーム値-3で、優辻マーカー(centerPix)が
 *  可視領域(下部パネルを除く)の中央に来るよう表示する。 */
function zoomToTsujiMeshRow(row, centerPix) {
    if (!row || !_tsujiMeshPix || typeof map === 'undefined' || !map) return;
    // 表示中の下部パネルの被覆高さ(px)を実測(recenterObserverInViewと同じ)
    let coveredPx = 0;
    for (const id of ['elevation-panel', 'milkyway-panel', 'soramado-panel', 'tsujisearch-panel', 'tsujimesh-panel']) {
        const el = document.getElementById(id);
        if (!el || el.classList.contains('hidden')) continue;
        coveredPx = Math.max(coveredPx, window.innerHeight - el.getBoundingClientRect().top);
    }
    const zoom = (map.getMaxZoom ? map.getMaxZoom() : 18) - 3;
    const pinPix = (centerPix !== undefined && centerPix >= 0) ? centerPix : row.bestPix;
    // ピンが「パネルに隠れない領域の中央」に来るよう、地図中心をピンから下へ被覆高さの半分だけずらす
    const pinPt = map.project([_tsujiMeshPix.lat[pinPix], _tsujiMeshPix.lng[pinPix]], zoom);
    const center = map.unproject(pinPt.add(L.point(0, coveredPx / 2)), zoom);
    map.setView(center, zoom);
}

/** 辻メッシュ標高オプション: 対象画素それぞれを観測点として、標高グラフ(computePathVisibility)と
 *  同一のアルゴリズムで可視判定する。
 *  - 経路(画素→目的点)を2000等分し、内部の各点の標高を DEM5A→5B→5C(z15)→DEM10B(z14) の順で参照
 *    (標高グラフの getElevation と同じフォールバック・同じ丸め(z15系=0.1m・z14=1m))
 *  - 可視直線(画素のDEM5A系標高+観測点高 → 目的点標高)を上回る点があればNG
 *  - 除外範囲(目的点の半径○m以内)のNGは標高グラフと同じく無視する
 *  タイルは対象領域〜目的点のコリドー(扇形)を先取りする(5B/5Cは前段で取得できなかった座標のみ)。
 *  サンプル位置はz15グローバル画素の線形歩行+64サンプル毎のメルカトルY厳密補正(誤差はサブピクセル)。
 *  戻り値: Uint8Array(kept) 1=OK / 中断(世代交代)は null */
async function computeTsujiMeshVisibilityFlags(latA, lngA, elevA, kept, pixHeight, end, endElev, gxBase, gyBase, gridW, refLat, generation, setStatus) {
    const exclKm = (Number(appState.elevExcludeRadius) || 0) / 1000;
    const synthetic = (typeof window._tmSyntheticElev === 'function');
    const steps = 2000;
    const scale15 = Math.pow(2, 15);
    const R128 = 128 / Math.PI;
    const gpy15At = (lat) => (128 - R128 * Math.atanh(Math.sin(lat * Math.PI / 180))) * scale15;
    const tgx15 = 128 * (end.lng / 180 + 1) * scale15;

    let elevAtPix15;   // (z15グローバル画素int) → 標高 or null (標高グラフのgetElevationと同じチェーン)
    if (synthetic) {
        // テスト用: z15合成(あれば)→z14合成
        elevAtPix15 = (gx, gy) => {
            if (typeof window._tmSyntheticElev15 === 'function') {
                const e = window._tmSyntheticElev15(gx, gy);
                if (e !== null && e !== undefined) return e;
            }
            return window._tmSyntheticElev(gx >> 1, gy >> 1);
        };
    } else {
        // コリドー(対象領域〜目的点の扇形)のタイル先取り。z14と、z15は5A→5B→5Cの順に未取得座標のみ
        const EARTH_R = 6371000;
        const mPerDegLat = Math.PI * EARTH_R / 180;
        const mPerDegLng = mPerDegLat * Math.cos(end.lat * Math.PI / 180);
        const scale14 = Math.pow(2, TSUJIMESH_ZOOM);
        const pixLL14 = (gpx, gpy) => {
            const lng = ((gpx / scale14) / R128 - Math.PI) * 180 / Math.PI;
            const eL = Math.exp((128 - gpy / scale14) * 2 / R128);
            return { lat: Math.asin((eL - 1) / (eL + 1)) * 180 / Math.PI, lng };
        };
        const toXY = (ll) => ({ x: (ll.lng - end.lng) * mPerDegLng, y: (ll.lat - end.lat) * mPerDegLat });
        const h14 = 40075016.686 * Math.cos(refLat * Math.PI / 180) / (scale14 * 256);
        const corners = [[gxBase, gyBase], [gxBase + gridW, gyBase], [gxBase, gyBase + gridW], [gxBase + gridW, gyBase + gridW]]
            .map(([gx, gy]) => toXY(pixLL14(gx, gy)));
        const maxDist = Math.max(...corners.map(c => Math.hypot(c.x, c.y))) + 16 * h14;
        const tgx14 = tgx15 / 2, tgy14 = gpy15At(end.lat) / 2;
        const inside = tgx14 >= gxBase && tgx14 <= gxBase + gridW && tgy14 >= gyBase && tgy14 <= gyBase + gridW;
        const wrapPi = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
        let azC = 0, span = 2 * Math.PI;
        if (!inside) {
            const azs = corners.map(c => Math.atan2(c.x, c.y));
            const ds = azs.map(a => wrapPi(a - azs[0]));
            azC = azs[0] + (Math.min(...ds) + Math.max(...ds)) / 2;
            span = Math.max(...ds) - Math.min(...ds);
        }
        // コリドー内のタイル座標を列挙(タイル中心の方位/距離でセクター絞り込み)
        const listTiles = (zoom) => {
            const tileSizeM = 40075016.686 * Math.cos(refLat * Math.PI / 180) / Math.pow(2, zoom);
            const tileR = tileSizeM * 0.75;
            const degLatR = (maxDist + tileR) / mPerDegLat, degLngR = (maxDist + tileR) / mPerDegLng;
            const tNW = _getTileInfo(end.lat + degLatR, end.lng - degLngR, zoom);
            const tSE = _getTileInfo(end.lat - degLatR, end.lng + degLngR, zoom);
            const out = [];
            const scaleZ = Math.pow(2, zoom);
            for (let ty = tNW.y; ty <= tSE.y; ty++) {
                for (let tx = tNW.x; tx <= tSE.x; tx++) {
                    const cLng = (((tx * 256 + 128) / scaleZ) / R128 - Math.PI) * 180 / Math.PI;
                    const eL = Math.exp((128 - (ty * 256 + 128) / scaleZ) * 2 / R128);
                    const cLat = Math.asin((eL - 1) / (eL + 1)) * 180 / Math.PI;
                    const c = toXY({ lat: cLat, lng: cLng });
                    const d = Math.hypot(c.x, c.y);
                    if (d > maxDist + tileR) continue;
                    if (!inside && d > tileR) {
                        const pad = Math.asin(Math.min(1, tileR / d));
                        if (Math.abs(wrapPi(Math.atan2(c.x, c.y) - azC)) > span / 2 + pad) continue;
                    }
                    out.push({ tx, ty });
                }
            }
            return out;
        };
        const fetchInto = async (map, dem, coords, label) => {
            let done = 0, qi = 0;
            const loop = async () => {
                while (qi < coords.length) {
                    if (generation !== tsujiMeshGeneration) return;
                    const { tx, ty } = coords[qi++];
                    let img = null;
                    try { img = await _getTileImageData(_makeTileUrl(dem, tx, ty)); } catch (_) {}
                    map.set(tx * 32768 + ty, img);
                    done++;
                    if ((done & 7) === 0 || done === coords.length) {
                        setStatus(`(標高オプション 標高タイル取得中(${label})… ${done}/${coords.length})`);
                        setTsujiMeshProgress(done, coords.length);
                    }
                }
            };
            await Promise.all(Array.from({ length: 8 }, loop));
        };
        const dem14 = GSI_DEM_SOURCES.find(d => d.zoom === TSUJIMESH_ZOOM);
        const z15Sources = GSI_DEM_SOURCES.filter(d => d.zoom === 15);
        const map14 = new Map();
        const maps15 = z15Sources.map(() => new Map());
        await fetchInto(map14, dem14, listTiles(TSUJIMESH_ZOOM), dem14.title);
        if (generation !== tsujiMeshGeneration) return null;
        const coords15 = listTiles(15);
        for (let si = 0; si < z15Sources.length; si++) {
            const need = coords15.filter(({ tx, ty }) => {
                for (let p = 0; p < si; p++) if (maps15[p].get(tx * 32768 + ty)) return false;
                return true;
            });
            if (need.length === 0) break;
            await fetchInto(maps15[si], z15Sources[si], need, z15Sources[si].title);
            if (generation !== tsujiMeshGeneration) return null;
        }
        elevAtPix15 = (gx, gy) => {
            const key = (gx >> 8) * 32768 + (gy >> 8);
            for (let si = 0; si < maps15.length; si++) {
                const t = maps15[si].get(key);
                if (!t) continue;
                const o = ((gy & 255) * 256 + (gx & 255)) << 2;
                const e = _elevFromRGB(t.data[o], t.data[o + 1], t.data[o + 2]);
                if (e !== null) return Math.round(e * 10) / 10;   // DEM5A/5B/5C: getElevationと同じ0.1m丸め
            }
            const gx14 = gx >> 1, gy14 = gy >> 1;
            const t14 = map14.get((gx14 >> 8) * 32768 + (gy14 >> 8));
            if (!t14) return null;
            const o14 = ((gy14 & 255) * 256 + (gx14 & 255)) << 2;
            const e14 = _elevFromRGB(t14.data[o14], t14.data[o14 + 1], t14.data[o14 + 2]);
            return (e14 === null) ? null : Math.round(e14);   // DEM10B(z14): 1m丸め
        };
    }

    // 各対象画素: 標高グラフと同一の2000等分判定(NGが出たら打ち切り)。
    // サンプル位置はz15グローバル画素で線形歩行し、メルカトルYは64サンプル毎に厳密再計算して補間する
    const flags = new Uint8Array(kept);
    const endLL = L.latLng(end.lat, end.lng);
    const SEG = 64;
    for (let i = 0; i < kept; i++) {
        const sLat = latA[i], sLng = lngA[i];
        const sx15 = 128 * (sLng / 180 + 1) * scale15;
        const sy15 = gpy15At(sLat);
        // 観測点側の標高も標高グラフと同じチェーン(z15優先)で参照(無ければ検索用のz14標高)
        const s0 = elevAtPix15(sx15 | 0, sy15 | 0);
        const startTotal = (s0 !== null && s0 !== undefined ? s0 : elevA[i]) + pixHeight;
        const totalDistKm = L.latLng(sLat, sLng).distanceTo(endLL) / 1000;
        const dx = (tgx15 - sx15) / steps;
        const dLat = end.lat - sLat;
        let visible = 1;
        for (let j0 = 1; j0 < steps && visible; j0 += SEG) {
            const j1 = Math.min(j0 + SEG - 1, steps - 1);
            const gyA = gpy15At(sLat + dLat * (j0 / steps));
            const dgy = (j1 > j0) ? (gpy15At(sLat + dLat * (j1 / steps)) - gyA) / (j1 - j0) : 0;
            for (let j = j0; j <= j1; j++) {
                const e = elevAtPix15((sx15 + dx * j) | 0, (gyA + dgy * (j - j0)) | 0);
                if (e === null || e === undefined) continue;   // 標高グラフと同じ: データ無し点は判定対象外
                const r = j / steps;
                const lineElev = startTotal + (endElev - startTotal) * r;
                if (e > lineElev) {
                    if (totalDistKm * (1 - r) <= exclKm) continue;   // 除外範囲(目的点側)のNGは無視
                    visible = 0;
                    break;
                }
            }
        }
        flags[i] = visible;
        if ((i & 255) === 0 || i === kept - 1) {
            setStatus(`(標高オプション可視判定中… ${(i + 1).toLocaleString()}/${kept.toLocaleString()}画素)`);
            setTsujiMeshProgress(i + 1, kept);
            if ((i & 2047) === 0) await new Promise(r2 => setTimeout(r2, 0));   // UIへ制御を返す
            if (generation !== tsujiMeshGeneration) return null;
        }
    }
    return flags;
}

/** 辻メッシュ検索の実行 (トグルON/URL自動実行から) */
async function startTsujiMeshSearch() {
    const generation = ++tsujiMeshGeneration;
    tsujiMeshPool.terminateAll();
    hideTsujiMeshProgress();
    clearTsujiMeshMarkers();
    _tsujiMeshRows = []; _tsujiMeshSelIdx = -1; _tsujiMeshPix = null; _tsujiMeshCalc = null; _tmCtrlDay0 = null; _tmCtrlFracMs = 0;

    const contentEl = document.getElementById('tsujimesh-content');
    const statusEl = document.getElementById('tsujimesh-status');
    const setStatus = (t) => { if (statusEl) statusEl.textContent = t; };
    contentEl.innerHTML = '<div style="padding:8px;color:#999;">DEM標高タイルを取得しています…</div>';
    setStatus('(DEM標高タイル取得中…)');

    const start = appState.start, end = appState.end;
    const endElev = end.elev;
    const pixHeight = Number(appState.startHeight) || 0;   // 観測点高を全画素に自動適用(辻検索と同じ「標高+観測点高」基準)
    _tsujiMeshPixHeightUsed = pixHeight;
    const menuBaseAz = appState.tsujiMeshBaseAz, menuBaseAlt = appState.tsujiMeshBaseAlt;
    const tolAz = appState.tsujiMeshToleranceAz, tolAlt = appState.tsujiMeshToleranceAlt;
    if (isNaN(menuBaseAz) || isNaN(menuBaseAlt) || isNaN(tolAz) || isNaN(tolAlt)) {
        setStatus('(入力値エラー)');
        contentEl.innerHTML = '<div style="padding:8px;color:#f99;">基準方位角・基準視高度・許容範囲を正しく入力してください</div>';
        return;
    }

    // 1) 観測点を含むタイルの近傍(検索エリア: N×N)のDEM標高タイルを取得
    const areaN = _tmSearchArea;
    const areaHalf = Math.floor((areaN - 1) / 2);
    const progTotal = 2 * areaN * areaN;   // 取得N²+前計算N²
    const ti = _getTileInfo(start.lat, start.lng, TSUJIMESH_ZOOM);
    const dem = GSI_DEM_SOURCES.find(d => d.zoom === TSUJIMESH_ZOOM);
    // マーカーのオーバーレイ描画・ビューシェッド用: 検索エリア(N*256四方)のグローバル画素座標系
    const gridW = areaN * 256;
    const gxBase = (ti.x - areaHalf) * 256, gyBase = (ti.y - areaHalf) * 256;
    const tiles = [];
    for (let dy = -areaHalf; dy <= areaN - 1 - areaHalf; dy++)
        for (let dx = -areaHalf; dx <= areaN - 1 - areaHalf; dx++) tiles.push({ x: ti.x + dx, y: ti.y + dy });
    const tileData = [];
    for (let i = 0; i < tiles.length; i++) {
        if (generation !== tsujiMeshGeneration) return;
        let img = null;
        if (typeof window._tmSyntheticElev === 'function') {
            img = '_synthetic_';   // テスト用: 取得せず合成標高を使う
        } else {
            const url = dem.url.replace('{z}', TSUJIMESH_ZOOM).replace('{x}', tiles[i].x).replace('{y}', tiles[i].y);
            try { img = await _getTileImageData(url); } catch (_) { img = null; }   // 海上等でタイルが無い場合はスキップ
        }
        tileData.push(img);
        setTsujiMeshProgress(i + 1, progTotal);
    }
    if (generation !== tsujiMeshGeneration) return;

    // 1b) 標高オプション: 許容範囲で絞った対象画素それぞれに、標高グラフと同一のアルゴリズムで
    //     可視(OK)/不可視(NG)を判定し、OK/NGチェックで選んだ対象だけを検索する(判定は前計算の後)。
    //     結果行の標高グラフ列は「行の表示値を出した地点=その日の最良画素」の可視判定を表示する。
    const elevOptOn = appState.tsujiMeshElevationOption;
    let viewshedMode = 'all';
    if (elevOptOn && appState.tsujiMeshElevOK !== appState.tsujiMeshElevNG)
        viewshedMode = appState.tsujiMeshElevOK ? 'visible' : 'invisible';

    // 2) 全画素の前計算: 画素→目的点の基準方位角/基準視高度(WGS84測地線+見かけ高度)
    //    許容範囲(メニューの基準方位角/視高度から±)内の画素だけを検索対象にする
    setStatus('(画素の前計算中…)');
    const maxCount = tiles.length * 65536;
    const baseAzA = new Float32Array(maxCount), baseAltA = new Float32Array(maxCount);
    const latA = new Float64Array(maxCount), lngA = new Float64Array(maxCount), elevA = new Float32Array(maxCount);
    const dEA = new Float32Array(maxCount), dNA = new Float32Array(maxCount);   // 領域中心からの変位角(rad)。地平座標系の画素位置補正用
    const EARTH_R = 6371000;
    const mPerDegLat = Math.PI * EARTH_R / 180;
    const mPerDegLng = mPerDegLat * Math.cos(start.lat * Math.PI / 180);
    const geod = geodesic.Geodesic.WGS84;
    // マーカーのオーバーレイ描画用: 検索エリア(N*256四方)のグローバル画素→対象画素index+1(0=対象外)
    const grid = new Uint32Array(gridW * gridW);
    const gridPosA = new Uint32Array(maxCount);   // 対象画素index→グリッド位置(オーバーレイ描画用の逆引き)
    let kept = 0, minAlt = Infinity, maxAlt = -Infinity;
    for (let t = 0; t < tiles.length; t++) {
        const img = tileData[t];
        if (!img) { setTsujiMeshProgress(tiles.length + t + 1, progTotal); continue; }
        const gx0 = tiles[t].x * 256, gy0 = tiles[t].y * 256;
        const px = (img === '_synthetic_') ? null : img.data;
        for (let py = 0; py < 256; py++) {
            for (let pxx = 0; pxx < 256; pxx++) {
                let elev;
                if (px) {
                    const o = (py * 256 + pxx) * 4;
                    elev = _elevFromRGB(px[o], px[o + 1], px[o + 2]);
                    if (elev === null) continue;   // 無効値(海など)は対象外
                } else {
                    elev = window._tmSyntheticElev(gx0 + pxx, gy0 + py);
                    if (elev === null) continue;
                }
                const ll = _globalPixelToLatLng(gx0 + pxx, gy0 + py, TSUJIMESH_ZOOM);
                const inv = geod.Inverse(ll.lat, ll.lng, end.lat, end.lng);
                const az = (inv.azi1 + 360) % 360;
                if (Math.abs(((az - menuBaseAz + 540) % 360) - 180) > tolAz) continue;
                const alt = calculateApparentAltitude(inv.s12, elev + pixHeight, endElev, ll.lat, end.lat);
                if (Math.abs(alt - menuBaseAlt) > tolAlt) continue;
                baseAzA[kept] = az; baseAltA[kept] = alt;
                latA[kept] = ll.lat; lngA[kept] = ll.lng; elevA[kept] = elev;
                dEA[kept] = (ll.lng - start.lng) * mPerDegLng / EARTH_R;
                dNA[kept] = (ll.lat - start.lat) * mPerDegLat / EARTH_R;
                const gpos = (gy0 + py - gyBase) * gridW + (gx0 + pxx - gxBase);
                grid[gpos] = kept + 1;
                gridPosA[kept] = gpos;
                if (alt < minAlt) minAlt = alt;
                if (alt > maxAlt) maxAlt = alt;
                kept++;
            }
        }
        setTsujiMeshProgress(tiles.length + t + 1, progTotal);
        await new Promise(r => setTimeout(r, 0));   // UIへ制御を返す
        if (generation !== tsujiMeshGeneration) return;
    }
    if (kept === 0) {
        setStatus('(対象画素なし)');
        hideTsujiMeshProgress();
        contentEl.innerHTML = '<div style="padding:8px;color:#999;">許容範囲内の画素がありません(許容範囲方位角/視高度を広げてください)</div>';
        return;
    }

    // 標高オプション: 許容範囲内の対象画素それぞれを、標高グラフと同一のアルゴリズムで可視判定する
    let visFlags = null;   // Uint8Array(kept) 1=OK(可視)
    if (elevOptOn) {
        visFlags = await computeTsujiMeshVisibilityFlags(latA, lngA, elevA, kept, pixHeight, end, endElev, gxBase, gyBase, gridW, start.lat, generation, setStatus);
        if (generation !== tsujiMeshGeneration || !visFlags) return;
        if (viewshedMode !== 'all') {
            // OK/NGチェックで選んだ対象だけへ圧縮(グリッド索引も再構築)
            let w = 0;
            minAlt = Infinity; maxAlt = -Infinity;
            for (let i = 0; i < kept; i++) {
                const keep = (viewshedMode === 'visible') ? visFlags[i] === 1 : visFlags[i] === 0;
                if (!keep) { grid[gridPosA[i]] = 0; continue; }
                baseAzA[w] = baseAzA[i]; baseAltA[w] = baseAltA[i];
                latA[w] = latA[i]; lngA[w] = lngA[i]; elevA[w] = elevA[i];
                dEA[w] = dEA[i]; dNA[w] = dNA[i];
                gridPosA[w] = gridPosA[i]; visFlags[w] = visFlags[i];
                grid[gridPosA[w]] = w + 1;
                if (baseAltA[w] < minAlt) minAlt = baseAltA[w];
                if (baseAltA[w] > maxAlt) maxAlt = baseAltA[w];
                w++;
            }
            kept = w;
            if (kept === 0) {
                setStatus('(対象画素なし)');
                hideTsujiMeshProgress();
                contentEl.innerHTML = '<div style="padding:8px;color:#999;">許容範囲内かつ標高オプション対象の画素がありません(OK/NGチェックや許容範囲を見直してください)</div>';
                return;
            }
        }
    }
    const baseAz = baseAzA.slice(0, kept), baseAlt = baseAltA.slice(0, kept);
    _tsujiMeshPix = { lat: latA.slice(0, kept), lng: lngA.slice(0, kept), elev: elevA.slice(0, kept) };

    // 3) 方位角ビン索引(0.1°)を構築してワーカーへ配布
    const binSize = 0.1, nBins = 3600;
    const counts = new Uint32Array(nBins);
    for (let i = 0; i < kept; i++) counts[Math.min(nBins - 1, Math.floor(baseAz[i] / binSize))]++;
    const binIndex = new Uint32Array(nBins + 1);
    for (let b = 0; b < nBins; b++) binIndex[b + 1] = binIndex[b] + counts[b];
    const binPixels = new Uint32Array(kept);
    const cursor = binIndex.slice(0, nBins);
    for (let i = 0; i < kept; i++) {
        const b = Math.min(nBins - 1, Math.floor(baseAz[i] / binSize));
        binPixels[cursor[b]++] = i;
    }
    setStatus(`(対象${kept.toLocaleString()}画素 / ワーカー準備中…)`);
    const dE = dEA.slice(0, kept), dN = dNA.slice(0, kept);
    // 領域のコーナー基準バウンズ(_globalPixelToLatLngは画素中心+0.5基準なのでコーナーはインライン計算)
    const cornerLL = (gpx, gpy) => {
        const scale = Math.pow(2, TSUJIMESH_ZOOM);
        const R = 128 / Math.PI;
        const lng = ((gpx / scale) / R - Math.PI) * 180 / Math.PI;
        const eL = Math.exp((128 - gpy / scale) * 2 / R);
        const lat = Math.asin((eL - 1) / (eL + 1)) * 180 / Math.PI;
        return { lat, lng };
    };
    const nw = cornerLL(gxBase, gyBase), se = cornerLL(gxBase + gridW, gyBase + gridW);
    // 辻時刻コントロールの再計算(案B)用に、画素索引と検索条件をスナップショット(検索条件の凍結)
    _tsujiMeshCalc = {
        baseAz, baseAlt, dE, dN, tanLat: Math.tan(start.lat * Math.PI / 180),
        minAlt, maxAlt, binSize, nBins, binIndex, binPixels,
        observerData: { lat: start.lat, lng: start.lng, elev: start.elev },
        refractionEnabled: appState.refractionEnabled,
        offsetAz: appState.tsujiMeshOffsetAz, offsetAlt: appState.tsujiMeshOffsetAlt,
        centerMode: appState.tsujiMeshCenterMode,
        grid, gridW, gridPos: gridPosA.slice(0, kept), gxBase, gyBase,
        bounds: L.latLngBounds([se.lat, nw.lng], [nw.lat, se.lng]),
    };
    await tsujiMeshPool.init({ type: 'init', count: kept, baseAz, baseAlt, dE, dN, tanLat: Math.tan(start.lat * Math.PI / 180), minAlt, maxAlt, binSize, nBins, binIndex, binPixels });
    if (generation !== tsujiMeshGeneration) return;

    // 4) 表示天体 × 日チャンク(30日)をプールへ投入
    const visibleBodies = appState.bodies.filter(b => b.visible);
    if (visibleBodies.length === 0) {
        setStatus('(表示天体なし)');
        hideTsujiMeshProgress();
        contentEl.innerHTML = '<div style="padding:8px;color:#999;">表示天体メニューで検索する天体をオンにしてください</div>';
        return;
    }
    const days = appState.tsujiMeshDays;
    const CHUNK = 30;
    const numChunks = Math.ceil(days / CHUNK);
    const totalTasks = visibleBodies.length * numChunks;
    let doneTasks = 0;
    const searchStart = new Date(appState.currentDate);
    searchStart.setHours(0, 0, 0, 0);
    const searchStartMs = searchStart.getTime();
    const epsilon = TSUJIMESH_EPS[appState.tsujiMeshAccuracy] || TSUJIMESH_EPS.x1;
    const observerData = { lat: start.lat, lng: start.lng, elev: start.elev };
    setStatus(`(検索中… 対象${kept.toLocaleString()}画素 / ${visibleBodies.length}天体 / ${totalTasks}タスク)`);
    setTsujiMeshProgress(0, totalTasks);
    contentEl.innerHTML = '<div style="padding:8px;color:#999;">検索しています…</div>';

    const buildBodyMsg = (body) => {
        if (isFixedStar(body.id)) {
            const rd = getFixedStarRaDec(body.id);
            return { id: body.id, fixed: true, ra: rd.ra, dec: rd.dec };
        }
        return { id: body.id, fixed: false };
    };
    const bumpProgress = () => { doneTasks++; setTsujiMeshProgress(doneTasks, totalTasks); };

    const allBodyEvents = await Promise.all(visibleBodies.map(async body => {
        const bodyMsg = buildBodyMsg(body);
        const events = [];
        for (let c = 0; c < numChunks; c++) {
            const dayStart = c * CHUNK, dayEnd = Math.min(dayStart + CHUNK, days);
            try {
                const res = await tsujiMeshPool.runTask({
                    type: 'search', reqId: `${body.id}_${c}`, body: bodyMsg,
                    observerData, refractionEnabled: appState.refractionEnabled,
                    offsetAz: appState.tsujiMeshOffsetAz, offsetAlt: appState.tsujiMeshOffsetAlt,
                    centerMode: appState.tsujiMeshCenterMode, epsilon,
                    searchStartMs, dayStart, dayEnd,
                });
                events.push(...res.events);
            } catch (_) { /* キャンセル/エラーはスキップ */ }
            bumpProgress();
        }
        events.sort((a, b) => a.dayIdx - b.dayIdx);
        return { body, events };
    }));
    if (generation !== tsujiMeshGeneration) return;

    // 5) (天体,日)イベント → 結果行へ整形 + フィルタ(月齢/時間) + 装飾
    const observer = new Astronomy.Observer(start.lat, start.lng, start.elev);
    const timeFs = {
        startMode: appState.tsujiMeshStartMode, startTime: appState.tsujiMeshStartTime, startPrePost: appState.tsujiMeshStartPrePost, startPrePostDir: appState.tsujiMeshStartPrePostDir, startOffset: appState.tsujiMeshStartOffset,
        endMode: appState.tsujiMeshEndMode, endTime: appState.tsujiMeshEndTime, endPrePost: appState.tsujiMeshEndPrePost, endPrePostDir: appState.tsujiMeshEndPrePostDir, endOffset: appState.tsujiMeshEndOffset,
    };
    const riseSetCache = {};
    const getRiseSetForDay = (dateObj) => {
        const key = dateObj.toDateString();
        if (riseSetCache[key]) return riseSetCache[key];
        const startOfDay = new Date(dateObj);
        startOfDay.setHours(0, 0, 0, 0);
        let sr, ss, mr, ms;
        try {
            sr = Astronomy.SearchRiseSet('Sun', observer, +1, startOfDay, 1);
            ss = Astronomy.SearchRiseSet('Sun', observer, -1, startOfDay, 1);
            mr = Astronomy.SearchRiseSet('Moon', observer, +1, startOfDay, 2);
            ms = Astronomy.SearchRiseSet('Moon', observer, -1, startOfDay, 2);
        } catch (_) {}
        const tw = computeDayTwilight(startOfDay, observer);
        return riseSetCache[key] = { sr, ss, mr, ms, tw, startOfDay };
    };

    const rows = [];
    let totalPix = 0;
    allBodyEvents.forEach(({ body, events }) => {
        events.forEach(ev => {
            // 行の辻時刻・精度記号・精度角距離・方位角・視高度は
            // 「その日に領域内で最高精度が出る画素(最良画素)の辻時刻と、その時の値」(最良画素基準)。
            // 日付毎に全メッシュ画素をグルーピングし、その日の最良精度のデータを表示する統一仕様。
            // 検索本体は1秒格子なので、辻時刻・精度角距離・方位角・視高度は優辻マーカーのポップアップと
            // 同じ0.01秒精細化後の値にする(格子上の最小値のままだと優辻マーカーの表示と食い違うため)。
            const ref = _tmRefinePixelTimeFast(ev.bestPix, ev.bestTimeMs, body);
            const rowTimeMs = ref ? ref.timeMs : ev.bestTimeMs;
            const rowDist = ref ? ref.dist : ev.bestDist;
            const rowAz = ref ? ref.az : ev.bestAz;
            const rowAlt = ref ? ref.alt : ev.bestAlt;
            const dt = new Date(rowTimeMs);
            const dow = ['日','月','火','水','木','金','土'][dt.getDay()];
            const rs = getRiseSetForDay(dt);
            const phase = Astronomy.MoonPhase(dt);
            const moonAge = (phase / 360) * SYNODIC_MONTH;
            const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
            // 月齢フィルタ
            if (appState.tsujiMeshMoonFilterEnabled &&
                !isMoonAgeInRange(moonAge, appState.tsujiMeshMoonBase, appState.tsujiMeshMoonTolerance)) return;
            // 時間フィルタ
            if (appState.tsujiMeshTimeFilter && !passesTimeFilter(dt, rs.tw, timeFs)) return;
            let symbol;
            if (rowDist <= 0.125) symbol = '◎';
            else if (rowDist <= 0.25) symbol = '○';
            else if (rowDist <= 1.0) symbol = '△';
            else symbol = '-';
            // 精度フィルタ(◎は常時オン・○△-はチェックされた記号のみ表示)
            if ((symbol === '○' && !appState.tsujiMeshSymO) ||
                (symbol === '△' && !appState.tsujiMeshSymTri) ||
                (symbol === '-' && !appState.tsujiMeshSymDash)) return;
            const diffBaseAz = baseAz[ev.bestPix];
            const diffBaseAlt = baseAlt[ev.bestPix];
            totalPix += ev.total;
            rows.push({
                body, dateObj: dt,
                symbol,
                dist: rowDist, azimuth: rowAz, altitude: rowAlt,
                azDiff: azDiffDeg(rowAz, diffBaseAz),
                altDiff: rowAlt - diffBaseAlt,
                mwOffAngle: Number(appState.mwOffsetAngle) || 0,
                angularRadius: getBodyAngularRadius(body.id, dt, observer),
                moonAge, moonIcon: icons[Math.round(phase / 45) % 8],
                timeCategory: classifyTimeCategory(dt, rs.tw, rs.startOfDay),
                elevationStatus: (elevOptOn && visFlags)
                    ? (visFlags[ev.bestPix] ? 'OK' : 'NG')
                    : '-',   // 行の表示値を出した地点=最良画素の可視判定(標高グラフと同一アルゴリズム)
                sunriseStr: fmtHms(rs.sr), sunsetStr: fmtHms(rs.ss),
                moonriseStr: fmtHms(rs.mr), moonsetStr: fmtHms(rs.ms),
                dateStr: `${dt.getFullYear()}年${String(dt.getMonth() + 1).padStart(2, '0')}月${String(dt.getDate()).padStart(2, '0')}日`,
                dowStr: `(${dow})`,
                timeStr: _tmFmtTimeMs2(rowTimeMs),   // 0.01秒表示(優辻マーカーのポップアップと同じ)
                bestPix: ev.bestPix, pixIdx: ev.pixIdx, pixTime: ev.pixTime, pixDist: ev.pixDist,
                total: ev.total, capped: ev.capped,
            });
        });
    });
    // 表示天体順 → 日時順
    const bodyOrder = new Map(visibleBodies.map((b, i) => [b.id, i]));
    rows.sort((a, b) => (bodyOrder.get(a.body.id) - bodyOrder.get(b.body.id)) || (a.dateObj - b.dateObj));

    if (generation !== tsujiMeshGeneration) return;

    _tsujiMeshRows = rows;
    hideTsujiMeshProgress();
    setStatus(`(${rows.length}件 / ヒット画素のべ${totalPix.toLocaleString()})`);
    renderTsujiMeshResults();
    drawTsujiMeshMarkers();
    // 検索直後は行を自動選択せず、日時も移動しない
    // (検索開始時の日時のままURL取得できるようにするため。行クリックで選択・移動する)
}

/** 辻メッシュ検索の結果リスト(21列・ソート可)を描画 */
function renderTsujiMeshResults() {
    const contentEl = document.getElementById('tsujimesh-content');
    contentEl.innerHTML = '';
    if (_tsujiMeshRows.length === 0) {
        contentEl.innerHTML = '<div style="padding:8px;color:#999;">該当する日時はありません(精度フィルタ/許容範囲/検索期間を見直してください)</div>';
        return;
    }
    const renderRow = (r) => {
        const tr = document.createElement('tr');
        tr.className = 'td-data-row' + (r.__sel ? ' selected' : '');
        tr.style.color = r.body.color;
        const angRDisplay = BODY_RADIUS_KM[r.body.id] ? r.angularRadius.toFixed(3) + '°' : '-.---°';
        tr.innerHTML = `<td>${escapeHtml(r.body.id)}</td><td>${escapeHtml(r.body.name)}</td><td>${r.symbol}</td><td>${r.dist.toFixed(5)}°</td><td>${r.dateStr}</td><td>${r.dowStr}</td><td>${r.timeStr}</td><td>${escapeHtml(r.timeCategory)}</td><td>${r.sunriseStr}</td><td>${r.sunsetStr}</td><td>${r.moonriseStr}</td><td>${r.moonsetStr}</td><td>${r.moonAge.toFixed(1)}</td><td>${r.moonIcon}</td><td>${r.azimuth.toFixed(4)}°</td><td>${r.altitude.toFixed(4)}°</td><td>${angRDisplay}</td><td>${fmtSignedDeg(r.azDiff)}</td><td>${fmtSignedDeg(r.altDiff)}</td><td>${r.mwOffAngle.toFixed(4)}°</td><td>${escapeHtml(r.elevationStatus)}</td>`;
        tr.addEventListener('click', () => {
            appState.currentDate = new Date(r.dateObj);
            syncUIFromState();
            updateAll();
            selectTsujiMeshRow(_tsujiMeshRows.indexOf(r));
        });
        r.__tr = tr;
        return tr;
    };
    const table = document.createElement('table');
    table.className = 'td-table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>天体ID</th><th>天体名</th><th>精度記号</th><th>精度角距離</th><th>日付</th><th>曜日</th><th>辻時刻</th><th>時間帯</th><th>日の出時刻</th><th>日の入時刻</th><th>月の出時刻</th><th>月の入時刻</th><th>月齢</th><th>月齢アイコン</th><th>方位角</th><th>視高度</th><th>視半径</th><th>天体方位角差</th><th>天体視高度差</th><th>オフセット中心角</th><th>標高グラフ</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    _tsujiMeshRows.forEach(r => tbody.appendChild(renderRow(r)));
    table.appendChild(tbody);
    contentEl.appendChild(table);
    const symbolRank = { '◎': 0, '○': 1, '△': 2, '-': 3 };
    setupTableSort(table, _tsujiMeshRows, [
        { label: '天体ID', compare: (a, b) => a.body.id.localeCompare(b.body.id) },
        { label: '天体名', compare: (a, b) => {
            const ia = appState.bodies.findIndex(bo => bo.id === a.body.id);
            const ib = appState.bodies.findIndex(bo => bo.id === b.body.id);
            return ia - ib;
        }},
        { label: '精度記号', compare: (a, b) => (symbolRank[a.symbol] ?? 9) - (symbolRank[b.symbol] ?? 9) },
        { label: '精度角距離', compare: (a, b) => a.dist - b.dist },
        { label: '日付', compare: (a, b) => a.dateObj - b.dateObj },
        { label: '曜日', compare: (a, b) => a.dateObj.getDay() - b.dateObj.getDay() },
        { label: '辻時刻', compare: (a, b) => a.timeStr.localeCompare(b.timeStr) },
        { label: '時間帯', compare: (a, b) => TIME_CATEGORY_LABELS.indexOf(a.timeCategory) - TIME_CATEGORY_LABELS.indexOf(b.timeCategory) },
        { label: '日の出時刻', compare: (a, b) => a.sunriseStr.localeCompare(b.sunriseStr) },
        { label: '日の入時刻', compare: (a, b) => a.sunsetStr.localeCompare(b.sunsetStr) },
        { label: '月の出時刻', compare: (a, b) => a.moonriseStr.localeCompare(b.moonriseStr) },
        { label: '月の入時刻', compare: (a, b) => a.moonsetStr.localeCompare(b.moonsetStr) },
        { label: '月齢', compare: (a, b) => a.moonAge - b.moonAge },
        { label: '月齢アイコン', compare: (a, b) => a.moonIcon.localeCompare(b.moonIcon) },
        { label: '方位角', compare: (a, b) => a.azimuth - b.azimuth },
        { label: '視高度', compare: (a, b) => a.altitude - b.altitude },
        { label: '視半径', compare: (a, b) => a.angularRadius - b.angularRadius },
        { label: '天体方位角差', compare: (a, b) => a.azDiff - b.azDiff },
        { label: '天体視高度差', compare: (a, b) => a.altDiff - b.altDiff },
        { label: 'オフセット中心角', compare: (a, b) => a.mwOffAngle - b.mwOffAngle },
        { label: '標高グラフ', compare: (a, b) => String(a.elevationStatus).localeCompare(String(b.elevationStatus)) },
    ], renderRow, []);
}

function setTsujiMeshProgress(current, total) {
    const bar = document.getElementById('tsujimesh-progress');
    if (!bar || !total) return;
    bar.classList.remove('hidden');
    document.getElementById('tsujimesh-progress-fill').style.width = `${Math.round(current / total * 100)}%`;
}
function hideTsujiMeshProgress() {
    const bar = document.getElementById('tsujimesh-progress');
    if (bar) bar.classList.add('hidden');
}

function toggleTsujiMesh() {
    appState.isTsujiMeshActive = !appState.isTsujiMeshActive;
    const btn = document.getElementById('btn-tsujimesh');
    const pnl = document.getElementById('tsujimesh-panel');
    if (appState.isTsujiMeshActive) {
        if (appState.isTsujiSearchActive) toggleTsujiSearch();   // 辻検索とは同時表示不可
        btn.classList.add('active');
        pnl.classList.remove('hidden');
        startTsujiMeshSearch();
    } else {
        closeTsujiMesh(true);
    }
    syncBottomPanels();
}

/** 辻メッシュ検索パネルを閉じる(alreadyFlagged=trueならフラグ反転済み) */
function closeTsujiMesh(alreadyFlagged = false) {
    if (!alreadyFlagged && !appState.isTsujiMeshActive) return;
    appState.isTsujiMeshActive = false;
    document.getElementById('btn-tsujimesh').classList.remove('active');
    document.getElementById('tsujimesh-panel').classList.add('hidden');
    tsujiMeshGeneration++;                       // 実行中の検索をキャンセル
    if (typeof tsujiMeshPool !== 'undefined') tsujiMeshPool.terminateAll();
    hideTsujiMeshProgress();
    if (typeof clearTsujiMeshMarkers === 'function') clearTsujiMeshMarkers();
    syncBottomPanels();
}

/** 辻メッシュ検索パネルのコントロール(最大化・開閉・スライダー・◀▶)の結線 */
function setupTsujiMeshPanelControls() {
    document.getElementById('btn-tsujimesh-max').addEventListener('click', () => {
        const pnl = document.getElementById('tsujimesh-panel');
        const on = pnl.classList.toggle('maximized');
        document.getElementById('btn-tsujimesh-max').classList.toggle('active', on);
        syncBottomPanels();
    });
    document.getElementById('tsujimesh-ctrl-header').addEventListener('click', () => {
        const body = document.getElementById('tsujimesh-ctrl-body');
        const open = !body.classList.toggle('hidden');
        document.getElementById('tsujimesh-ctrl-arrow').textContent = open ? '▲' : '▼';
        document.getElementById('tsujimesh-ctrl').classList.toggle('open', open);
    });
    document.getElementById('chk-tsujimesh-marker-layer').addEventListener('change', (e) => {
        _tsujiMeshLayerVisible = e.target.checked;
        applyTsujiMeshLayerVisibility();
    });
    // 辻時刻コントロール: スライダーに追従してライブ再計算(手動操作はサブ秒を0にリセット=秒単位)
    document.getElementById('tsujimesh-time-slider').addEventListener('input', () => {
        _tmCtrlFracMs = 0;
        recalcTsujiMeshGoldAtTime();
    });
    document.getElementById('input-tsujimesh-time-width').addEventListener('change', (e) => {
        const v = parseFloat(e.target.value);
        if (isNaN(v)) { e.target.value = _tmCtrlWidth; return; }   // 未入力は元の値を復元
        _tmCtrlWidth = Math.min(Math.max(Math.round(v), 0), 30);
        e.target.value = _tmCtrlWidth;
        recalcTsujiMeshGoldAtTime();
    });
    // 辻時刻スライダーの◀/▶: 1秒ずつ前/後へ(min/maxでクランプ)して再計算(サブ秒は0にリセット)
    const stepTimeSlider = (delta) => {
        const sl = document.getElementById('tsujimesh-time-slider');
        const v = Math.min(Math.max(parseInt(sl.value) + delta, parseInt(sl.min)), parseInt(sl.max));
        sl.value = String(v);
        _tmCtrlFracMs = 0;
        recalcTsujiMeshGoldAtTime();
    };
    document.getElementById('btn-tsujimesh-time-prev').addEventListener('click', () => stepTimeSlider(-1));
    document.getElementById('btn-tsujimesh-time-next').addEventListener('click', () => stepTimeSlider(1));
    document.getElementById('select-tsujimesh-time-eps').addEventListener('change', (e) => {
        _tmCtrlEps = parseFloat(e.target.value) || 0.125;
        recalcTsujiMeshGoldAtTime();
    });
    // 行選択後オプション: 優辻マーカー(ピン)の初期位置。切替時は現在の選択行に即適用する
    document.querySelectorAll('input[name="tsujimesh-post-mode"]').forEach(r => {
        r.addEventListener('change', () => {
            if (!r.checked) return;
            _tmPostMode = r.value;
            if (_tsujiMeshSelIdx >= 0) selectTsujiMeshRow(_tsujiMeshSelIdx);
        });
    });
    // 検索エリア: N×Nタイル。変更で再検索(世代カウンタが実行中の前の処理をキャンセルする)
    document.querySelectorAll('input[name="tsujimesh-area"]').forEach(r => {
        r.addEventListener('change', () => {
            if (!r.checked) return;
            _tmSearchArea = parseInt(r.value) || 3;
            if (appState.isTsujiMeshActive) startTsujiMeshSearch();
        });
    });
    // メッシュマーカー色: 白(0%)〜黒(100%)のグレースケール。追従して再描画
    document.getElementById('tsujimesh-mesh-gray').addEventListener('input', (e) => {
        _tmMeshGray = Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100);
        const lbl = document.getElementById('tsujimesh-mesh-gray-label');
        if (lbl) lbl.textContent = `${_tmMeshGray}%`;
        const smp = document.getElementById('tsujimesh-mesh-gray-sample');
        if (smp) { const v = Math.round(255 * (1 - _tmMeshGray / 100)); smp.style.color = `rgb(${v},${v},${v})`; }
        if (_tsujiMeshRows.length) drawTsujiMeshMarkers();
    });
}

function syncBottomPanels() {
    const tdPnl = document.getElementById('tsujisearch-panel');
    // 辻検索パネルは、標高グラフ/全天儀が下にあるとき1段上へ押し上げる
    tdPnl.classList.toggle('with-elevation', appState.isTsujiSearchActive && appState.isElevationActive);
    tdPnl.classList.toggle('with-milkyway', appState.isTsujiSearchActive && appState.isMilkyWayActive);
    tdPnl.classList.toggle('with-soramado', appState.isTsujiSearchActive && appState.isSoramadoActive);
    // 宙の窓プレビュー領域: 辻検索の有無で高さが変わる(通常2/3⇄1/3、最大化100%⇄66.67%)。
    // 最大化中に辻検索がONなら辻検索結果を上1/3へ
    // 辻メッシュ検索パネル(辻検索と同じ積み上げ規則。辻検索とは排他)
    const tmPnl = document.getElementById('tsujimesh-panel');
    if (tmPnl) {
        tmPnl.classList.toggle('with-elevation', appState.isTsujiMeshActive && appState.isElevationActive);
        tmPnl.classList.toggle('with-milkyway', appState.isTsujiMeshActive && appState.isMilkyWayActive);
        tmPnl.classList.toggle('with-soramado', appState.isTsujiMeshActive && appState.isSoramadoActive);
    }
    const smPnl = document.getElementById('soramado-panel');
    if (smPnl) {
        smPnl.classList.toggle('with-tsuji', appState.isTsujiSearchActive || appState.isTsujiMeshActive);
        tdPnl.classList.toggle('with-soramado-max',
            appState.isTsujiSearchActive && appState.isSoramadoActive && smPnl.classList.contains('maximized'));
        if (tmPnl) tmPnl.classList.toggle('with-soramado-max',
            appState.isTsujiMeshActive && appState.isSoramadoActive && smPnl.classList.contains('maximized'));
        resizeSoramado();   // 高さ変更に合わせてプレビューを再描画
    }
    // 下部パネルのトグルで隠れる領域が変わるので、観測点を可視領域の中央へ移動
    recenterObserverInView();
}

/** 下部パネル(全天儀/標高グラフ/宙の窓/辻検索)で隠れていない可視領域の中央へ、
 * 観測点(appState.start)が来るよう地図をパンする。requestAnimationFrameで多重呼出をコアレス。 */
let _recenterRAF = null;
function recenterObserverInView(animate = true) {
    if (typeof map === 'undefined' || !map || !appState.start) return;
    if (_recenterRAF) cancelAnimationFrame(_recenterRAF);
    _recenterRAF = requestAnimationFrame(() => {
        _recenterRAF = null;
        if (!map || !appState.start) return;
        const size = map.getSize();
        // パネルは画面下から積み上がる(各1/3)。他パネル排他＋辻検索は併用可(最大2/3)。
        // 実際に表示中の下部パネルの上端から、隠れている高さを実測する(プレビュー領域2/3・最大化にも対応)
        let coveredPx = 0;
        for (const id of ['elevation-panel', 'milkyway-panel', 'soramado-panel', 'tsujisearch-panel', 'tsujimesh-panel']) {
            const el = document.getElementById(id);
            if (!el || el.classList.contains('hidden')) continue;
            coveredPx = Math.max(coveredPx, window.innerHeight - el.getBoundingClientRect().top);
        }
        const coveredFrac = Math.min(0.9, Math.max(0, coveredPx / Math.max(1, size.y)));   // 全面時は動かしすぎない
        const z = map.getZoom();
        const obsPx = map.project([appState.start.lat, appState.start.lng], z);
        // 隠れ領域は下端側。地図中心を南へ size.y*coveredFrac/2 ずらすと観測点が可視領域の中央に来る
        const centerPx = obsPx.add([0, size.y * coveredFrac / 2]);
        map.panTo(map.unproject(centerPx, z), { animate });
    });
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
/** 方位角差を±180°へ正規化 (右=正、左=負) */
function azDiffDeg(az, baseAz) {
    return ((az - baseAz + 540) % 360) - 180;
}
/** 符号つき角度の表示文字列 (+12.3456° / -0.1000°) */
function fmtSignedDeg(d) {
    return (d >= 0 ? '+' : '') + d.toFixed(4) + '°';
}

function isAzimuthInRange(az, targetAz, tolerance) {
    let diff = az - targetAz;
    diff = ((diff + 540) % 360) - 180;
    return Math.abs(diff) <= tolerance;
}

// --- 辻検索 Web Worker プール ---
// 365日単位のチャンクをプール内のワーカーが順次処理する。
// 一度作成したワーカーは再利用され、起動オーバーヘッドを削減する。
// 辻検索 / My辻検索 は同一プールを共有 (排他実行が前提)
const TSUJI_CHUNK_DAYS = 365;
const TSUJI_NUM_WORKERS = Math.max(1, Math.min((navigator.hardwareConcurrency || 6) + 1, 31));
let tsujiActiveWorkers = []; // 互換用 (旧コードからの参照を残す)

const tsujiPool = (() => {
    let workers = [];
    let idle = [];
    const queue = [];
    const active = new Map(); // worker -> task

    function ensure() {
        while (workers.length < TSUJI_NUM_WORKERS) {
            const w = new Worker('tsuji-search-worker.js');
            workers.push(w);
            idle.push(w);
        }
    }
    function dispatch() {
        while (idle.length && queue.length) {
            const w = idle.shift();
            const task = queue.shift();
            run(w, task);
        }
    }
    function run(worker, task) {
        active.set(worker, task);
        worker.onmessage = (e) => {
            active.delete(worker);
            if (e.data && e.data.error) task.reject(new Error(e.data.error));
            else task.resolve(e.data);
            idle.push(worker);
            dispatch();
        };
        worker.onerror = (err) => {
            active.delete(worker);
            task.reject(err);
            idle.push(worker);
            dispatch();
        };
        worker.postMessage(task.taskData);
    }
    return {
        get size() { return TSUJI_NUM_WORKERS; },
        runTask(taskData) {
            return new Promise((resolve, reject) => {
                ensure();
                queue.push({ taskData, resolve, reject });
                dispatch();
            });
        },
        terminateAll() {
            workers.forEach(w => { try { w.terminate(); } catch(_) {} });
            const err = new Error('canceled');
            active.forEach(t => t.reject(err));
            active.clear();
            queue.forEach(t => t.reject(err));
            queue.length = 0;
            workers = [];
            idle = [];
        }
    };
})();

/** 辻検索のチャンク要求を発行するヘルパー。
 *  bodyMsg/共通パラメータと days を渡すと、365日単位でプールに投入し、
 *  完了したチャンクごとに onChunkDone() を呼びつつ全結果をマージして返す。 */
async function runTsujiChunks({
    bodyMsg, observerData, refractionEnabled,
    targetAz, targetAlt, toleranceAz, toleranceAlt,
    centerMode, centerAz0, centerAlt0,
    searchStartMs, days, maxResults, onChunkDone
}) {
    const numChunks = Math.ceil(days / TSUJI_CHUNK_DAYS);
    const promises = [];
    for (let c = 0; c < numChunks; c++) {
        const dayStart = c * TSUJI_CHUNK_DAYS;
        const dayEnd = Math.min(dayStart + TSUJI_CHUNK_DAYS, days);
        const p = tsujiPool.runTask({
            body: bodyMsg, observerData, refractionEnabled,
            targetAz, targetAlt, toleranceAz, toleranceAlt,
            centerMode: centerMode || 'point', centerAz0: centerAz0 || 0, centerAlt0: centerAlt0 || 0,
            searchStartMs, dayStart, dayEnd, maxResults
        }).then(data => {
            if (onChunkDone) onChunkDone();
            return data;
        }).catch(_ => {
            if (onChunkDone) onChunkDone();
            return { results: [], dayStart, dayEnd };
        });
        promises.push(p);
    }
    const chunkResults = await Promise.all(promises);
    chunkResults.sort((a, b) => a.dayStart - b.dayStart);
    return chunkResults;
}

// --- 辻検索 コア検索ロジック ---
async function startTsujiSearch() {
    const generation = ++appState.tsujiSearchGeneration;
    // 前回検索の残タスク(実行中＋キュー)を全て破棄してから開始する。
    // ワーカーは terminate されるが、runTask 時の ensure() で再生成される。
    // My辻検索の一括計算が実行中の場合は破棄しない(結果の破損防止。プール共有・排他前提)。
    if (!myTsujiBatchRunning) tsujiPool.terminateAll();
    const contentEl = document.getElementById('tsujisearch-content');
    const statusEl = document.getElementById('tsujisearch-status');
    contentEl.innerHTML = '';
    statusEl.textContent = '(検索中…)';

    const observerData = { lat: appState.start.lat, lng: appState.start.lng, elev: appState.start.elev };
    const baseAz = appState.tsujiSearchBaseAz;
    const offsetAz = appState.tsujiSearchOffsetAz;
    const toleranceAz = appState.tsujiSearchToleranceAz;
    const baseAlt = appState.tsujiSearchBaseAlt;
    const offsetAlt = appState.tsujiSearchOffsetAlt;
    const toleranceAlt = appState.tsujiSearchToleranceAlt;
    const searchDays = appState.tsujiSearchDays;

    // オフセットを加算した検索中心
    const targetAz = (baseAz + offsetAz + 360) % 360;
    const targetAlt = baseAlt + offsetAlt;

    if (isNaN(baseAz) || isNaN(toleranceAz) || isNaN(baseAlt) || isNaN(toleranceAlt)) {
        statusEl.textContent = '(入力値エラー)';
        contentEl.innerHTML = '<div style="padding:8px;color:#f99;">方位角・視高度・許容範囲を正しく入力してください</div>';
        return;
    }

    const refractionEnabled = appState.refractionEnabled;
    const visibleBodies = appState.bodies.filter(b => b.visible);
    const searchStart = new Date(appState.currentDate);
    searchStart.setHours(0, 0, 0, 0);
    const searchStartMs = searchStart.getTime();
    const MAX_RESULTS_PER_BODY = 36500;
    const totalResults = [];

    // 進捗バーの分母 = 天体数 × 各天体あたりのチャンク数 (365日単位)
    const chunksPerBody = Math.ceil(searchDays / TSUJI_CHUNK_DAYS);
    const totalChunks = visibleBodies.length * chunksPerBody;
    let doneChunks = 0;
    setTsujiProgress(0, totalChunks);
    const chunkDoneCb = () => {
        doneChunks++;
        setTsujiProgress(doneChunks, totalChunks);
    };

    // 全天体のチャンクをプールに一括投入し、並列処理する
    statusEl.textContent = `(検索中… ${visibleBodies.length}天体 / ${totalChunks}チャンク)`;
    const allBodyResults = await Promise.all(visibleBodies.map(body => {
        let bodyMsg;
        if (isFixedStar(body.id)) {
            const rd = getFixedStarRaDec(body.id);
            bodyMsg = { id: body.id, fixed: true, ra: rd.ra, dec: rd.dec };
        } else {
            bodyMsg = { id: body.id, fixed: false };
        }
        return runTsujiChunks({
            bodyMsg, observerData, refractionEnabled,
            targetAz, targetAlt, toleranceAz, toleranceAlt,
            centerMode: appState.tsujiCenterMode, centerAz0: (baseAz + 360) % 360, centerAlt0: baseAlt,   // 検索中心オプション(線=基準点→オフセット点)
            searchStartMs, days: searchDays,
            maxResults: MAX_RESULTS_PER_BODY,
            onChunkDone: chunkDoneCb
        }).then(chunkResults => ({ body, chunkResults }));
    }));

    if (generation !== appState.tsujiSearchGeneration) return;

    for (const { body, chunkResults } of allBodyResults) {
        const bodyResults = [];
        let bodyLimitReached = false;
        for (const ch of chunkResults) {
            for (const r of ch.results) {
                bodyResults.push({
                    time: new Date(r.timeMs),
                    azimuth: r.azimuth,
                    altitude: r.altitude,
                    dist: r.dist,
                });
                if (bodyResults.length >= MAX_RESULTS_PER_BODY) {
                    bodyLimitReached = true;
                    break;
                }
            }
            if (bodyLimitReached) break;
        }
        totalResults.push({ body, results: bodyResults, limitReached: bodyLimitReached });
    }

    if (generation !== appState.tsujiSearchGeneration) return;

    // 結果表示用の observer を再構築（後段の getBodyAngularRadius 等で利用）
    const observer = new Astronomy.Observer(observerData.lat, observerData.lng, observerData.elev);

    // 結果表示
    const totalCount = totalResults.reduce((sum, t) => sum + t.results.length, 0);

    if (totalCount === 0) {
        statusEl.textContent = `(0件)`;
        contentEl.innerHTML = '<div style="padding:8px;color:#999;">該当する日時はありません</div>';
        return;
    }

    // 標高オプション: start→end の可視判定を1回計算 (start/end は検索中固定のため全行共通)
    let elevStatus = '-';
    if (appState.tsujiElevationOption) {
        statusEl.textContent = '(標高判定中…)';
        const vis = await computePathVisibility(
            appState.start.lat, appState.start.lng, appState.startApiElev + appState.startHeight,
            appState.end.lat, appState.end.lng, appState.endApiElev + appState.endHeight);
        if (generation !== appState.tsujiSearchGeneration) return;
        elevStatus = vis.visible ? 'OK' : 'NG';
    }

    // 時間フィルタの設定 (全行共通)。各行ごとに当日の薄明/出没(rs.tw)で範囲判定する。
    const timeFs = {
        startMode: appState.tsujiStartMode, startTime: appState.tsujiStartTime, startPrePost: appState.tsujiStartPrePost, startPrePostDir: appState.tsujiStartPrePostDir, startOffset: appState.tsujiStartOffset,
        endMode: appState.tsujiEndMode, endTime: appState.tsujiEndTime, endPrePost: appState.tsujiEndPrePost, endPrePostDir: appState.tsujiEndPrePostDir, endOffset: appState.tsujiEndOffset,
    };

    // ソート用データをフラットに事前計算
    const symbolRank = { '◎': 0, '○': 1, '△': 2, '-': 3 };
    const rowData = [];
    const extraRows = [];

    // rise/set 値はrendering時に計算が重いため、日付別キャッシュ
    const riseSetCache = {};
    function getRiseSetForDay(dateObj) {
        const key = dateObj.toDateString();
        if (riseSetCache[key]) return riseSetCache[key];
        const startOfDay = new Date(dateObj);
        startOfDay.setHours(0, 0, 0, 0);
        let sr, ss, mr, ms;
        try {
            sr = Astronomy.SearchRiseSet('Sun', observer, +1, startOfDay, 1);
            ss = Astronomy.SearchRiseSet('Sun', observer, -1, startOfDay, 1);
            mr = Astronomy.SearchRiseSet('Moon', observer, +1, startOfDay, 2);
            ms = Astronomy.SearchRiseSet('Moon', observer, -1, startOfDay, 2);
        } catch (_) {}
        const tw = computeDayTwilight(startOfDay, observer);
        return riseSetCache[key] = { sr, ss, mr, ms, tw, startOfDay };
    }

    totalResults.forEach(({ body, results, limitReached }) => {
        results.forEach(r => {
            let symbol;
            if (r.dist <= 0.125) symbol = '◎';       // ±0.125° (誤差範囲0.25°、視半径以内)
            else if (r.dist <= 0.25) symbol = '○';   // ±0.25° (誤差範囲0.5°、視直径以内)
            else if (r.dist <= 1.0) symbol = '△';    // ±1° (誤差範囲2°、視直径×4以内)
            else symbol = '-';

            const dt = r.time;
            const dow = ['日','月','火','水','木','金','土'][dt.getDay()];
            const dateStr = `${dt.getFullYear()}年${String(dt.getMonth() + 1).padStart(2, '0')}月${String(dt.getDate()).padStart(2, '0')}日`;
            const dowStr = `(${dow})`;
            const timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}:${String(dt.getSeconds()).padStart(2, '0')}`;

            const angR = getBodyAngularRadius(body.id, dt, observer);
            const rs = getRiseSetForDay(dt);

            // 月齢と月齢アイコンは全天体で辻時刻の月の状態を表示
            const phase = Astronomy.MoonPhase(dt);
            const moonAge = (phase / 360) * SYNODIC_MONTH;
            const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
            const moonIcon = icons[Math.round(phase / 45) % 8];

            // 月齢フィルタが有効な場合は範囲外をスキップ
            if (appState.tsujiMoonFilterEnabled &&
                !isMoonAgeInRange(moonAge, appState.tsujiMoonBase, appState.tsujiMoonTolerance)) {
                return;
            }

            // 精度フィルタが有効な場合はチェックされた記号以外をスキップ
            if (appState.tsujiAccuracyFilterEnabled) {
                const allowed = [];
                if (appState.tsujiAccDblCircle) allowed.push('◎');
                if (appState.tsujiAccCircle) allowed.push('○');
                if (appState.tsujiAccTriangle) allowed.push('△');
                if (appState.tsujiAccDash) allowed.push('-');
                if (allowed.length > 0 && !allowed.includes(symbol)) return;
            }

            // 標高オプションのOK/NGフィルタ
            if (appState.tsujiElevationOption && (appState.tsujiElevOK || appState.tsujiElevNG)) {
                const allowedElev = [];
                if (appState.tsujiElevOK) allowedElev.push('OK');
                if (appState.tsujiElevNG) allowedElev.push('NG');
                if (!allowedElev.includes(elevStatus)) return;
            }

            // 時間フィルタ: 辻時刻がその日の範囲外ならスキップ
            if (appState.tsujiTimeFilter && !passesTimeFilter(dt, rs.tw, timeFs)) return;

            rowData.push({
                body, symbol, dateStr, dowStr, timeStr, dateObj: dt,
                dist: r.dist, azimuth: r.azimuth, altitude: r.altitude,
                azDiff: azDiffDeg(r.azimuth, baseAz),   // 天体方位角差(目的点=基準方位角より右=正)
                altDiff: r.altitude - baseAlt,          // 天体視高度差(目的点=基準視高度より上=正)
                mwOffAngle: Number(appState.mwOffsetAngle) || 0,   // この検索で使ったオフセット中心角
                angularRadius: angR, moonAge, moonIcon,
                timeCategory: classifyTimeCategory(dt, rs.tw, rs.startOfDay),
                elevationStatus: elevStatus,
                sunriseStr: fmtHms(rs.sr), sunsetStr: fmtHms(rs.ss),
                moonriseStr: fmtHms(rs.mr), moonsetStr: fmtHms(rs.ms)
            });
        });

        if (limitReached) {
            const tr = document.createElement('tr');
            tr.style.color = body.color;
            tr.innerHTML = `<td colspan="21">${escapeHtml(body.name)}: and more…</td>`;
            extraRows.push(tr);
        }
    });

    statusEl.textContent = `(${rowData.length}件)`;
    hideTsujiProgress();
    if (rowData.length === 0) {
        contentEl.innerHTML = '<div style="padding:8px;color:#999;">フィルタの結果、該当する日時はありません</div>';
        return;
    }

    const renderRow = (r) => {
        const tr = document.createElement('tr');
        tr.className = 'td-data-row';
        tr.style.color = r.body.color;
        const angRDisplay = BODY_RADIUS_KM[r.body.id] ? r.angularRadius.toFixed(3) + '°' : '-.---°';
        tr.innerHTML = `<td>${escapeHtml(r.body.id)}</td><td>${escapeHtml(r.body.name)}</td><td>${r.symbol}</td><td>${r.dist.toFixed(5)}°</td><td>${r.dateStr}</td><td>${r.dowStr}</td><td>${r.timeStr}</td><td>${escapeHtml(r.timeCategory)}</td><td>${r.sunriseStr}</td><td>${r.sunsetStr}</td><td>${r.moonriseStr}</td><td>${r.moonsetStr}</td><td>${r.moonAge.toFixed(1)}</td><td>${r.moonIcon}</td><td>${r.azimuth.toFixed(4)}°</td><td>${r.altitude.toFixed(4)}°</td><td>${angRDisplay}</td><td>${fmtSignedDeg(r.azDiff)}</td><td>${fmtSignedDeg(r.altDiff)}</td><td>${r.mwOffAngle.toFixed(4)}°</td><td>${escapeHtml(r.elevationStatus)}</td>`;
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
    thead.innerHTML = '<tr><th>天体ID</th><th>天体名</th><th>精度記号</th><th>精度角距離</th><th>日付</th><th>曜日</th><th>辻時刻</th><th>時間帯</th><th>日の出時刻</th><th>日の入時刻</th><th>月の出時刻</th><th>月の入時刻</th><th>月齢</th><th>月齢アイコン</th><th>方位角</th><th>視高度</th><th>視半径</th><th>天体方位角差</th><th>天体視高度差</th><th>オフセット中心角</th><th>標高グラフ</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    rowData.forEach(r => tbody.appendChild(renderRow(r)));
    extraRows.forEach(r => tbody.appendChild(r));
    table.appendChild(tbody);
    contentEl.appendChild(table);

    setupTableSort(table, rowData, [
        { label: '天体ID', compare: (a, b) => a.body.id.localeCompare(b.body.id) },
        { label: '天体名', compare: (a, b) => {
            const ia = appState.bodies.findIndex(bo => bo.id === a.body.id);
            const ib = appState.bodies.findIndex(bo => bo.id === b.body.id);
            return ia - ib;
        }},
        { label: '精度記号', compare: (a, b) => (symbolRank[a.symbol] ?? 9) - (symbolRank[b.symbol] ?? 9) },
        { label: '精度角距離', compare: (a, b) => a.dist - b.dist },
        { label: '日付', compare: (a, b) => a.dateObj - b.dateObj },
        { label: '曜日', compare: (a, b) => a.dateObj.getDay() - b.dateObj.getDay() },
        { label: '辻時刻', compare: (a, b) => a.timeStr.localeCompare(b.timeStr) },
        { label: '時間帯', compare: (a, b) => TIME_CATEGORY_LABELS.indexOf(a.timeCategory) - TIME_CATEGORY_LABELS.indexOf(b.timeCategory) },
        { label: '日の出時刻', compare: (a, b) => a.sunriseStr.localeCompare(b.sunriseStr) },
        { label: '日の入時刻', compare: (a, b) => a.sunsetStr.localeCompare(b.sunsetStr) },
        { label: '月の出時刻', compare: (a, b) => a.moonriseStr.localeCompare(b.moonriseStr) },
        { label: '月の入時刻', compare: (a, b) => a.moonsetStr.localeCompare(b.moonsetStr) },
        { label: '月齢', compare: (a, b) => a.moonAge - b.moonAge },
        { label: '月齢アイコン', compare: (a, b) => a.moonIcon.localeCompare(b.moonIcon) },
        { label: '方位角', compare: (a, b) => a.azimuth - b.azimuth },
        { label: '視高度', compare: (a, b) => a.altitude - b.altitude },
        { label: '視半径', compare: (a, b) => a.angularRadius - b.angularRadius },
        { label: '天体方位角差', compare: (a, b) => a.azDiff - b.azDiff },
        { label: '天体視高度差', compare: (a, b) => a.altDiff - b.altDiff },
        { label: 'オフセット中心角', compare: (a, b) => a.mwOffAngle - b.mwOffAngle },
        { label: '標高グラフ', compare: (a, b) => String(a.elevationStatus).localeCompare(String(b.elevationStatus)) },
    ], renderRow, extraRows);
}

async function startElevationFetch() {
    appState.elevationData.points = [];
    const s = L.latLng(appState.start.lat, appState.start.lng);
    const e = L.latLng(appState.end.lat, appState.end.lng);
    const dist = s.distanceTo(e);
    const steps = 2000;
    const intervalM = dist / steps;
    appState.elevationData.intervalM = intervalM; // グラフ表示用に保持

    for(let i=0; i<=steps; i++) {
        const r = i/steps;
        appState.elevationData.points.push({
            lat: s.lat + (e.lat - s.lat)*r,
            lng: s.lng + (e.lng - s.lng)*r,
            dist: (dist * r) / 1000, // km単位
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
    // 取得完了後、可視判定の結果をポップアップで通知
    showVisibilityResult();
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
    
    const pad = {l:40, r:10, t:20, b:26};
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

    // 横軸: 直線距離の目盛 (縦の補助線 + 距離ラベル)。縦軸=標高/横軸=距離が分かるようにする
    const distDecimals = maxD >= 10 ? 0 : (maxD >= 1 ? 1 : 2);
    const xTicks = 4;
    ctx.strokeStyle = '#444';
    ctx.fillStyle = '#aaa';
    ctx.font = '11px sans-serif';
    ctx.beginPath();
    for (let i = 0; i <= xTicks; i++) {
        const d = maxD * (i / xTicks);
        const x = toX(d);
        ctx.moveTo(x, pad.t);
        ctx.lineTo(x, pad.t + gh);
        ctx.textAlign = i === 0 ? 'left' : (i === xTicks ? 'right' : 'center');
        ctx.fillText(`${d.toFixed(distDecimals)}km`, x, pad.t + gh + 14);
    }
    ctx.stroke();
    ctx.textAlign = 'start';

    // グラフ上部に間隔情報を表示
    const intervalM = appState.elevationData.intervalM;
    if (intervalM !== undefined) {
        ctx.fillStyle = '#aaa';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${intervalM.toFixed(1)}m間隔 2000地点`, w - pad.r, pad.t - 5);
        ctx.textAlign = 'start';
    }

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

        // 見通し線（赤）: スタート地点(API標高+観測点高) → ゴール地点(API標高+目的点高)
        const startElev = appState.startApiElev + appState.startHeight;
        const endElev = appState.endApiElev + appState.endHeight;
        ctx.beginPath();
        ctx.moveTo(toX(pts[0].dist), toY(startElev));
        ctx.lineTo(toX(pts[pts.length - 1].dist), toY(endElev));
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

/** 標高プロファイルから可視判定を計算する。
 *  各点が可視直線(スタート(API標高+観測点高) → ゴール(API標高+目的点高))より下なら可視 (OK)。
 *  返り値: { visible: boolean, blockingDist?: number, blockingElev?: number, lineElevAtBlocking?: number } */
function computeVisibility() {
    const pts = appState.elevationData.points.filter(p => p.fetched);
    if (pts.length < 2) return { visible: true };
    const startElev = appState.startApiElev + appState.startHeight;
    const endElev = appState.endApiElev + appState.endHeight;
    const totalDist = pts[pts.length - 1].dist;
    if (totalDist <= 0) return { visible: true };
    // 両端は除外 (スタート/ゴール地点自体は判定対象外)
    const exclKm = (Number(appState.elevExcludeRadius) || 0) / 1000;   // 基本オプション: 目的点の半径○m以内のNGは無視
    for (let i = 1; i < pts.length - 1; i++) {
        const pt = pts[i];
        const lineElev = startElev + (endElev - startElev) * (pt.dist / totalDist);
        if (pt.elev > lineElev) {
            if (totalDist - pt.dist <= exclKm) continue;
            return { visible: false, blockingDist: pt.dist, blockingElev: pt.elev, lineElevAtBlocking: lineElev };
        }
    }
    return { visible: true };
}

/** 任意のパス start→end の可視判定 (標高オプション用)。appState/DOM非依存、DEMタイルキャッシュ再利用。
 *  startTotalElev/endTotalElev は (API標高+高さ)[m]。返り値は computeVisibility と同形式。 */
async function computePathVisibility(startLat, startLng, startTotalElev, endLat, endLng, endTotalElev) {
    const s = L.latLng(startLat, startLng);
    const e = L.latLng(endLat, endLng);
    const dist = s.distanceTo(e);
    const steps = 2000;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
        const r = i / steps;
        pts.push({ lat: s.lat + (e.lat - s.lat) * r, lng: s.lng + (e.lng - s.lng) * r, dist: (dist * r) / 1000, elev: null, fetched: false });
    }
    await fetchAllElevations(pts, null);
    const fetched = pts.filter(p => p.fetched);
    if (fetched.length < 2) return { visible: true };
    const totalDist = fetched[fetched.length - 1].dist;
    if (totalDist <= 0) return { visible: true };
    const exclKm = (Number(appState.elevExcludeRadius) || 0) / 1000;   // 基本オプション: 目的点の半径○m以内のNGは無視
    for (let i = 1; i < fetched.length - 1; i++) {
        const pt = fetched[i];
        const lineElev = startTotalElev + (endTotalElev - startTotalElev) * (pt.dist / totalDist);
        if (pt.elev > lineElev) {
            if (totalDist - pt.dist <= exclKm) continue;
            return { visible: false, blockingDist: pt.dist, blockingElev: pt.elev, lineElevAtBlocking: lineElev };
        }
    }
    return { visible: true };
}

/** 可視判定の結果をポップアップ表示する (取得完了後に1回だけ呼ぶ) */
function showVisibilityResult() {
    const r = computeVisibility();
    const note = '\n\n※ 屈折・地球曲率は考慮していない単純な直線判定です(遠距離見通しでは精度に注意)';
    if (r.visible) {
        alert('可視判定: OK\n観測点から目的点が見通せます' + note);
    } else {
        const dist = r.blockingDist.toFixed(2);
        const elev = r.blockingElev.toFixed(1);
        const lineE = r.lineElevAtBlocking.toFixed(1);
        alert(`可視判定: NG\n観測点から ${dist}km 地点 (標高 ${elev}m) が可視直線(${lineE}m)を遮っています` + note);
    }
}

function initVisitorCounter() {
    const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    // 計算中表示
    setCounterDisplay('-', '-', '-', '-');

    // soranotsuji.net からのアクセスのみカウントアップ
    const isProductionSite = (location.hostname === 'soranotsuji.net');
    const action = (isProductionSite && appState.lastVisitDate !== todayStr) ? 'visit' : 'get';
    fetchVisitorData(action, todayStr);
}

function fetchVisitorData(action, todayStr) {
    fetch(`${GAS_API_URL}?action=${action}`).then(r=>r.json()).then(d => {
        if (d.error === 'lock_busy') {
            // ロック解除待ち表示 → 3秒後リトライ
            setCounterDisplay('- -', '- -', '- -', '- -');
            setTimeout(() => fetchVisitorData(action, todayStr), 2700);
            return;
        }
        if (d.error === 'no_sheet') {
            // シート無し表示
            setCounterDisplay('- - -', '- - -', '- - -', '- - -');
            return;
        }
        if (d.error) return;

        if (action === 'visit') {
            appState.lastVisitDate = todayStr;
            saveAppState();
        }
        visitorData = d;
        setCounterDisplay(d.today, d.yesterday, d.yearTotal, d.lastYearTotal);
    }).catch(() => {
        setCounterDisplay('- - -', '- - -', '- - -', '- - -');
    });
}

function setCounterDisplay(today, yesterday, year, last) {
    document.getElementById('cnt-today').innerText = today;
    document.getElementById('cnt-yesterday').innerText = yesterday;
    document.getElementById('cnt-year').innerText = year;
    document.getElementById('cnt-last').innerText = last;
}

function showGraph(type) {
    if(!visitorData) return;
    document.getElementById('graph-modal').classList.remove('hidden');
    document.getElementById('graph-title').innerText = (type==='current') ? "今年の推移" : "昨年の推移";

    // dailyLogが未取得ならaction=detailでfetchしてから描画
    if (!visitorData.dailyLog) {
        fetch(`${GAS_API_URL}?action=detail`).then(r=>r.json()).then(d => {
            if (!d.error) {
                visitorData.dailyLog = d.dailyLog;
                visitorData.lastYearLog = d.lastYearLog;
            }
            drawGraph(type);
        }).catch(() => drawGraph(type));
    } else {
        drawGraph(type);
    }
}

function drawGraph(type) {
    const cvs = document.getElementById('visitor-canvas');
    const ctx = cvs.getContext('2d');
    const w = cvs.width = cvs.clientWidth;
    const h = cvs.height = 300;

    const data = (type==='current') ? visitorData.dailyLog : visitorData.lastYearLog;
    if(!data || data.length===0) {
        ctx.fillStyle = '#333';
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
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
    ctx.textAlign = "right";
    ctx.fillText(maxVal, pad-10, pad+10);
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

// ============================================================
// URL取得・復元
// ============================================================

// URL短縮(queryキー)用の可逆圧縮コーデック: LZW(可変コード幅) + Base64URL。
// 依存なし・同期処理。encodeQueryParam(str) → URL安全文字列、decodeQueryParam(s) → 元文字列(失敗時 null)。
//
// 【辞書のバージョン運用】共有シード辞書はエンコード結果のコード割当を決めるため、
// 一度発行したURLを読み続けるには「その版の辞書」が必要になる。そこで:
//  - 辞書は _QP_SEED_VERSIONS に版ごとに保持し、既存の版は絶対に変更しない。
//  - エンコードは常に最新版を使い、出力の先頭に「~版数~」を付ける(v1のみ無印=レガシー)。
//  - デコードは先頭の「~版数~」で辞書を選ぶ(無印はv1)。
//  - パラメータキーを追加/変更したら、新しい配列(_QP_SEEDS_V3, ...)を追加して
//    _QP_SEED_VERSIONS に積み、エンコーダが自動で最新版を使う。古いURLはそのまま読める。
const _QP_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
// LZWの貪欲一致は接頭辞を辿るため、シードは全接頭辞(2文字以上)に展開して登録する
function _qpSeedEntries(seeds) {
    const set = [];
    const seen = new Set();
    for (const seed of seeds) {
        for (let n = 2; n <= seed.length; n++) {
            const pre = seed.slice(0, n);
            if (!seen.has(pre)) { seen.add(pre); set.push(pre); }
        }
    }
    return set;
}
// v1: 初版の頻出断片(変更禁止: 発行済みURLの復号に使用)
const _QP_SEEDS = ['tsuji','Start','End','Mode=','Offset=','Offset','Tolerance=','Time=','Filter=','PrePost','Dir=before','Dir=after','=false&','=true&','&tsuji','&star','starId=','startL','endL','startApiElv=','endApiElv=','startElv=','endElv=','Lat=3','Lng=13','sunset','sunrise','00%3A00','Acc','DblCircle','Circle','Triangle','Dash','elevation','milkyway','soramado','mode=preview','mode=tsujisearch','&date=20','&time=','timeZone=%2B0900','Search','Days=365','Moon','Base=','&dp=','Elev','ilkyWay','starName=','starRa=','starDec=','starColor=%23','starIsDashed='];
// v2: v1の全シード + 現行の全URLパラメータキー(&key=形式)。キー追加時はV3を作って_QP_SEED_VERSIONSへ
const _QP_SEEDS_V2 = _QP_SEEDS.concat(
    ['date', 'time', 'timeZone', 'startLat', 'startLng', 'startApiElv', 'startElv', 'endLat', 'endLng', 'endApiElv', 'endElv',
     'starId', 'starName', 'starRa', 'starDec', 'starColor', 'starIsDashed',
     'dp', 'elevation', 'milkyway', 'soramado', 'tsujisearch', 'mode',
     'soraSensorKey', 'soraAspectW', 'soraAspectH', 'soraOrient', 'soraFocal', 'soraFNumberIdx', 'soraFocusDist',
     'soraFisheye', 'soraFisheyeStrength', 'soraFisheyeShape', 'soraPanorama', 'soraPanoAov',
     'soraPeaking', 'soraTraj', 'soraCenterCross',
     'soraBaseAz', 'soraBaseAlt', 'soraOffsetAz', 'soraOffsetAlt', 'soraViewRange',
     'soraMovInterval', 'soraMovShots', 'soraMovFps', 'soraMovDispStep', 'soraMovImgMb',
     'soraMwBrightness', 'soraElevShade', 'soraSunShade', 'soraExpFormat', 'soraExpW', 'soraExpH',
     'tsujiSearchDays', 'tsujiAz', 'tsujiAlt', 'tsujiAzOffset', 'tsujiAltOffset', 'tsujiAzTolerance', 'tsujiAltTolerance',
     'tsujiMoonFilter', 'tsujiMoonBase', 'tsujiMoonTolerance',
     'tsujiAccuracyFilter', 'tsujiAccDblCircle', 'tsujiAccCircle', 'tsujiAccTriangle', 'tsujiAccDash',
     'tsujiElevationOption', 'tsujiElevOK', 'tsujiElevNG',
     'tsujiTimeFilter', 'tsujiStartMode', 'tsujiStartTime', 'tsujiStartPrePost', 'tsujiStartPrePostDir', 'tsujiStartOffset',
     'tsujiEndMode', 'tsujiEndTime', 'tsujiEndPrePost', 'tsujiEndPrePostDir', 'tsujiEndOffset']
        .map(k => '&' + k + '='),
    ['=landscape&', '=portrait&', '=fullframe&', '=jpeg&', '=png&', '=h264&', '=webm&', '=rect&', '=circle&']
);
// v3: v2の全シード + 再生オプション(キー追加時は新版を作って_QP_SEED_VERSIONSへ)
const _QP_SEEDS_V3 = _QP_SEEDS_V2.concat(['&soraMovPlayMode=', '=anim&', '=video&']);
// v4: v3の全シード + 検索中心オプション
const _QP_SEEDS_V4 = _QP_SEEDS_V3.concat(['&tsujiCenterMode=', '=point&', '=line&']);
// v5: v4の全シード + 目的点/検索中心チェックボックス
const _QP_SEEDS_V5 = _QP_SEEDS_V4.concat(['&soraTargetCross=', '&soraSearchCenter=']);
// v6: v5の全シード + 辻メッシュ検索
const _QP_SEEDS_V6 = _QP_SEEDS_V5.concat(['&tsujiMesh', 'tsujiMesh', '&tsujimesh=', '=x1&', '=x2&', '=x4&', '=x8&', 'MeshStart', 'MeshEnd', '=tsujimesh&']);
// v7: v6の全シード + 観測点画素の高さ(項目は廃止済み。辞書は凍結のため残す)
const _QP_SEEDS_V7 = _QP_SEEDS_V6.concat(['&tsujiMeshPixHeight=']);
// v8: v7の全シード + 精度フィルタ(◎○△-)
const _QP_SEEDS_V8 = _QP_SEEDS_V7.concat(['&tsujiMeshSymO=', '&tsujiMeshSymTri=', '&tsujiMeshSymDash=']);
const _QP_SEED_VERSIONS = [_QP_SEEDS, _QP_SEEDS_V2, _QP_SEEDS_V3, _QP_SEEDS_V4, _QP_SEEDS_V5, _QP_SEEDS_V6, _QP_SEEDS_V7, _QP_SEEDS_V8];   // 添字+1=版数。最新版でエンコードする

function encodeQueryParam(str) {
    const bytes = new TextEncoder().encode(str);
    if (bytes.length === 0) return '';
    const version = _QP_SEED_VERSIONS.length;   // 常に最新版の辞書で圧縮
    // LZW圧縮 (初期辞書=1バイト256種, コード幅9bit開始で辞書拡大に応じて広げる)
    const dict = new Map();
    for (let i = 0; i < 256; i++) dict.set(String.fromCharCode(i), i);
    let nextCode = 256;
    for (const e of _qpSeedEntries(_QP_SEED_VERSIONS[version - 1])) { if (!dict.has(e)) dict.set(e, nextCode++); }
    let width = 9;
    while ((1 << width) < nextCode) width++;   // 初期辞書が512を超える場合は幅を拡げて開始
    const out = [];   // {code, width}
    let w = '';
    for (let i = 0; i < bytes.length; i++) {
        const c = String.fromCharCode(bytes[i]);
        const wc = w + c;
        if (dict.has(wc)) { w = wc; continue; }
        out.push({ code: dict.get(w), width });
        dict.set(wc, nextCode++);
        if (nextCode === (1 << width) + 1) width++;   // 新しいコードが幅に収まらなくなる直前に拡幅
        w = c;
    }
    if (w !== '') out.push({ code: dict.get(w), width });
    // ビットパック → Base64URL (6bit単位)
    let acc = 0, nbits = 0, s = '';
    for (const { code, width: wd } of out) {
        acc = (acc * (1 << wd)) + code;   // 上位詰め
        nbits += wd;
        while (nbits >= 6) {
            nbits -= 6;
            s += _QP_B64[Math.floor(acc / (1 << nbits)) & 63];
            acc = acc % (1 << nbits);
        }
    }
    if (nbits > 0) s += _QP_B64[(acc << (6 - nbits)) & 63];
    return (version >= 2 ? `~${version}~` : '') + s;   // v2以降は辞書版数プレフィックス(v1=無印)
}

function decodeQueryParam(s) {
    try {
        if (!s) return '';
        // 辞書版数プレフィックス(~N~)。無印はv1(レガシーURL)
        let seeds = _QP_SEEDS;
        const vm = /^~(\d+)~/.exec(s);
        if (vm) {
            const v = parseInt(vm[1]);
            if (v < 2 || v > _QP_SEED_VERSIONS.length) return null;   // 未知の版(将来の新版URL)は復号不可
            seeds = _QP_SEED_VERSIONS[v - 1];
            s = s.slice(vm[0].length);
            if (!s) return '';
        }
        // Base64URL → ビット列リーダー
        const vals = [];
        for (const ch of s) {
            const v = _QP_B64.indexOf(ch);
            if (v < 0) return null;
            vals.push(v);
        }
        let pos = 0;   // ビット位置
        const total = vals.length * 6;
        const readBits = (n) => {
            if (pos + n > total) return null;
            let r = 0;
            for (let i = 0; i < n; i++) {
                const v6 = vals[(pos / 6) | 0];
                const bit = (v6 >> (5 - (pos % 6))) & 1;
                r = (r << 1) | bit;
                pos++;
            }
            return r;
        };
        // LZW展開
        const dict = [];
        for (let i = 0; i < 256; i++) dict.push(String.fromCharCode(i));
        for (const e of _qpSeedEntries(seeds)) dict.push(e);
        let nextCode = dict.length, width = 9;
        while ((1 << width) < nextCode) width++;   // エンコーダと同一の初期幅
        let code = readBits(width);
        if (code === null) return '';
        let w = dict[code];
        if (w === undefined) return null;
        let res = w;
        while (true) {
            if (nextCode === (1 << width)) width++;   // エンコーダが拡幅した直後のコードに合わせる
            if (pos + width > total) break;           // 端数パディングは無視
            code = readBits(width);
            if (code === null) break;
            let entry;
            if (code < dict.length) entry = dict[code];
            else if (code === nextCode) entry = w + w[0];   // KwKwK ケース
            else return null;
            res += entry;
            dict.push(w + entry[0]); nextCode++;
            w = entry;
        }
        // バイト列 → UTF-8文字列
        const bytes = new Uint8Array(res.length);
        for (let i = 0; i < res.length; i++) bytes[i] = res.charCodeAt(i);
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch (_) {
        return null;
    }
}

function buildBaseUrl() {
    return window.location.origin + window.location.pathname;
}

// 日時をdessin仕様フォーマットに変換するヘルパー
function formatDateForUrl(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
}
function formatTimeForUrl(d) {
    return `${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}`;
}

// ブラウザのタイムゾーンオフセットを+0900形式で返す
function getLocalTimezoneOffsetString() {
    const offset = new Date().getTimezoneOffset(); // JSTなら-540
    const sign = offset <= 0 ? '+' : '-';
    const abs = Math.abs(offset);
    const h = String(Math.floor(abs / 60)).padStart(2, '0');
    const m = String(abs % 60).padStart(2, '0');
    return `${sign}${h}${m}`;
}

// +0900形式をパースして分単位(JSTなら+540)で返す
function parseTimezoneOffsetMinutes(tzString) {
    const match = tzString.match(/^([+-])(\d{2})(\d{2})$/);
    if (!match) return 540; // デフォルトJST
    const sign = match[1] === '+' ? 1 : -1;
    return sign * (parseInt(match[2]) * 60 + parseInt(match[3]));
}

// 共通のURLパラメータを構築するヘルパー
function buildCommonUrlParams(dateTimeMode = 'fixed') {
    const d = appState.currentDate;
    const params = new URLSearchParams();
    if (dateTimeMode === 'fixed' || dateTimeMode === true) {
        params.set('date', formatDateForUrl(d));
        params.set('time', formatTimeForUrl(d));
        params.set('timeZone', getLocalTimezoneOffsetString());
    } else if (dateTimeMode === 'semi-fixed') {
        // 年を0000にして月日時は固定
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        params.set('date', `0000${mm}${dd}`);
        params.set('time', formatTimeForUrl(d));
        params.set('timeZone', getLocalTimezoneOffsetString());
    }
    params.set('startLat', String(appState.start.lat));
    params.set('startLng', String(appState.start.lng));
    params.set('startApiElv', String(appState.startApiElev));
    params.set('startElv', String(appState.startHeight));
    params.set('endLat', String(appState.end.lat));
    params.set('endLng', String(appState.end.lng));
    params.set('endApiElv', String(appState.endApiElev));
    params.set('endElv', String(appState.endHeight));

    // 表示天体: starIdを複数指定
    const visibleBodies = appState.bodies.filter(b => b.visible);
    visibleBodies.forEach(b => {
        params.append('starId', b.id);
        // My天体の場合は追加情報を付与
        if (b.isCustom) {
            const myStar = appState.myStars.find(s => String(s.id) === b.id);
            if (myStar) {
                params.append('starName', myStar.name);
                params.append('starRa', String(myStar.ra));
                params.append('starDec', String(myStar.dec));
                params.append('starColor', myStar.color);
                params.append('starIsDashed', myStar.isDashed ? '1' : '0');
            }
        }
    });

    // 下部パネル等の表示/非表示状態(プレビュー/辻検索の両モードで復元): 辻ライン・標高グラフ・全天儀・宙の窓・辻検索
    params.set('dp', appState.isDPActive ? 'true' : 'false');
    params.set('elevation', appState.isElevationActive ? 'true' : 'false');
    params.set('milkyway', appState.isMilkyWayActive ? 'true' : 'false');
    params.set('soramado', appState.isSoramadoActive ? 'true' : 'false');
    params.set('tsujisearch', appState.isTsujiSearchActive ? 'true' : 'false');
    params.set('tsujimesh', appState.isTsujiMeshActive ? 'true' : 'false');

    // 宙の窓メニュー＋コントロールメニューの全項目(どのURLでも記憶・復元できるよう常時付与)
    ['soraSensorKey', 'soraAspectW', 'soraAspectH', 'soraOrient', 'soraFocal', 'soraFNumberIdx', 'soraFocusDist',
     'soraFisheye', 'soraFisheyeStrength', 'soraFisheyeShape', 'soraPanorama', 'soraPanoAov',
     'soraPeaking', 'soraTraj', 'soraCenterCross', 'soraTargetCross', 'soraSearchCenter',
     'soraBaseAz', 'soraBaseAlt', 'soraOffsetAz', 'soraOffsetAlt', 'soraViewRange',
     'soraMovInterval', 'soraMovShots', 'soraMovFps', 'soraMovDispStep', 'soraMovImgMb', 'soraMovPlayMode',
     'soraMwBrightness', 'soraElevShade', 'soraSunShade', 'soraExpFormat', 'soraExpW', 'soraExpH'].forEach(k => {
        const v = appState[k];
        params.set(k, typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v));
    });

    return params;
}

// URL取得ポップアップダイアログ
let urlPickerMode = null; // 'location' or 'tsuji'

function toggleUrlPanel(type) {
    const picker = document.getElementById('url-picker');
    const fixedLabel = document.getElementById('url-picker-fixed-label');
    const semiFixedLabel = document.getElementById('url-picker-semi-fixed-label');

    const d = appState.currentDate;
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    const hh = String(d.getHours()).padStart(2,'0');
    const mi = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');

    fixedLabel.textContent = `日時固定(${d.getFullYear()}年${mm}月${dd}日${hh}:${mi}:${ss})`;
    semiFixedLabel.textContent = `日時半固定(アクセス年の${mm}月${dd}日${hh}:${mi}:${ss})`;
    urlPickerMode = type;
    picker.classList.remove('hidden');
}

function closeUrlPicker() {
    document.getElementById('url-picker').classList.add('hidden');
    urlPickerMode = null;
}

function copyLocationUrl(includeDateTime) {
    const params = buildCommonUrlParams(includeDateTime);
    params.set('mode', 'preview');
    // パネル状態(dp/elevation/milkyway/soramado/tsujisearch)は buildCommonUrlParams で付与済み

    // 長いクエリを可逆圧縮して query キー1つの短いURLにまとめる(旧形式の長いURLも引き続き読める)
    const url = buildBaseUrl() + '?query=' + encodeQueryParam(params.toString());
    navigator.clipboard.writeText(url).then(() => {
        alert('現在の状態で宙の辻を開くURLをクリップボードにコピーしました。');
    });
}

function copySoramadoUrl(includeDateTime) {
    const params = buildCommonUrlParams(includeDateTime);
    params.set('mode', 'preview');
    params.set('soramado', 'true');   // 宙の窓URLは必ず宙の窓パネルを開く

    const url = buildBaseUrl() + '?query=' + encodeQueryParam(params.toString());
    navigator.clipboard.writeText(url).then(() => {
        alert('現在の宙の窓を開くURLをクリップボードにコピーしました。');
    });
}

function copyTsujiSearchUrl(includeDateTime) {
    const params = buildCommonUrlParams(includeDateTime);
    params.set('mode', 'tsujisearch');

    params.set('tsujiSearchDays', String(appState.tsujiSearchDays));
    params.set('tsujiAz', String(appState.tsujiSearchBaseAz));
    params.set('tsujiAlt', String(appState.tsujiSearchBaseAlt));
    params.set('tsujiAzOffset', String(appState.tsujiSearchOffsetAz));
    params.set('tsujiAltOffset', String(appState.tsujiSearchOffsetAlt));
    params.set('tsujiAzTolerance', String(appState.tsujiSearchToleranceAz));
    params.set('tsujiAltTolerance', String(appState.tsujiSearchToleranceAlt));
    params.set('tsujiCenterMode', appState.tsujiCenterMode || 'point');
    params.set('tsujiMoonFilter', appState.tsujiMoonFilterEnabled ? 'true' : 'false');
    params.set('tsujiMoonBase', String(appState.tsujiMoonBase));
    params.set('tsujiMoonTolerance', String(appState.tsujiMoonTolerance));
    params.set('tsujiAccuracyFilter', appState.tsujiAccuracyFilterEnabled ? 'true' : 'false');
    params.set('tsujiAccDblCircle', appState.tsujiAccDblCircle ? 'true' : 'false');
    params.set('tsujiAccCircle', appState.tsujiAccCircle ? 'true' : 'false');
    params.set('tsujiAccTriangle', appState.tsujiAccTriangle ? 'true' : 'false');
    params.set('tsujiAccDash', appState.tsujiAccDash ? 'true' : 'false');
    params.set('tsujiElevationOption', appState.tsujiElevationOption ? 'true' : 'false');
    params.set('tsujiElevOK', appState.tsujiElevOK ? 'true' : 'false');
    params.set('tsujiElevNG', appState.tsujiElevNG ? 'true' : 'false');
    params.set('tsujiTimeFilter', appState.tsujiTimeFilter ? 'true' : 'false');
    params.set('tsujiStartMode', appState.tsujiStartMode);
    params.set('tsujiStartTime', appState.tsujiStartTime);
    params.set('tsujiStartPrePost', appState.tsujiStartPrePost ? 'true' : 'false');
    params.set('tsujiStartPrePostDir', appState.tsujiStartPrePostDir);
    params.set('tsujiStartOffset', appState.tsujiStartOffset);
    params.set('tsujiEndMode', appState.tsujiEndMode);
    params.set('tsujiEndTime', appState.tsujiEndTime);
    params.set('tsujiEndPrePost', appState.tsujiEndPrePost ? 'true' : 'false');
    params.set('tsujiEndPrePostDir', appState.tsujiEndPrePostDir);
    params.set('tsujiEndOffset', appState.tsujiEndOffset);

    // 長いクエリを可逆圧縮して query キー1つの短いURLにまとめる(旧形式の長いURLも引き続き読める)
    const url = buildBaseUrl() + '?query=' + encodeQueryParam(params.toString());
    navigator.clipboard.writeText(url).then(() => {
        alert('現在の辻検索を開くURLをクリップボードにコピーしました。');
    });
}

function copyTsujiMeshUrl(includeDateTime) {
    const params = buildCommonUrlParams(includeDateTime);
    params.set('mode', 'tsujimesh');

    params.set('tsujiMeshDays', String(appState.tsujiMeshDays));
    params.set('tsujiMeshAz', String(appState.tsujiMeshBaseAz));
    params.set('tsujiMeshAlt', String(appState.tsujiMeshBaseAlt));
    params.set('tsujiMeshAzOffset', String(appState.tsujiMeshOffsetAz));
    params.set('tsujiMeshAltOffset', String(appState.tsujiMeshOffsetAlt));
    params.set('tsujiMeshAzTolerance', String(appState.tsujiMeshToleranceAz));
    params.set('tsujiMeshAltTolerance', String(appState.tsujiMeshToleranceAlt));
    params.set('tsujiMeshCenterMode', appState.tsujiMeshCenterMode || 'point');
    params.set('tsujiMeshAccuracy', appState.tsujiMeshAccuracy || 'x1');
    params.set('tsujiMeshSymO', appState.tsujiMeshSymO ? 'true' : 'false');
    params.set('tsujiMeshSymTri', appState.tsujiMeshSymTri ? 'true' : 'false');
    params.set('tsujiMeshSymDash', appState.tsujiMeshSymDash ? 'true' : 'false');
    params.set('tsujiMeshMoonFilter', appState.tsujiMeshMoonFilterEnabled ? 'true' : 'false');
    params.set('tsujiMeshMoonBase', String(appState.tsujiMeshMoonBase));
    params.set('tsujiMeshMoonTolerance', String(appState.tsujiMeshMoonTolerance));
    params.set('tsujiMeshElevationOption', appState.tsujiMeshElevationOption ? 'true' : 'false');
    params.set('tsujiMeshElevOK', appState.tsujiMeshElevOK ? 'true' : 'false');
    params.set('tsujiMeshElevNG', appState.tsujiMeshElevNG ? 'true' : 'false');
    params.set('tsujiMeshTimeFilter', appState.tsujiMeshTimeFilter ? 'true' : 'false');
    params.set('tsujiMeshStartMode', appState.tsujiMeshStartMode);
    params.set('tsujiMeshStartTime', appState.tsujiMeshStartTime);
    params.set('tsujiMeshStartPrePost', appState.tsujiMeshStartPrePost ? 'true' : 'false');
    params.set('tsujiMeshStartPrePostDir', appState.tsujiMeshStartPrePostDir);
    params.set('tsujiMeshStartOffset', appState.tsujiMeshStartOffset);
    params.set('tsujiMeshEndMode', appState.tsujiMeshEndMode);
    params.set('tsujiMeshEndTime', appState.tsujiMeshEndTime);
    params.set('tsujiMeshEndPrePost', appState.tsujiMeshEndPrePost ? 'true' : 'false');
    params.set('tsujiMeshEndPrePostDir', appState.tsujiMeshEndPrePostDir);
    params.set('tsujiMeshEndOffset', appState.tsujiMeshEndOffset);

    const url = buildBaseUrl() + '?query=' + encodeQueryParam(params.toString());
    navigator.clipboard.writeText(url).then(() => {
        alert('現在の辻メッシュ検索を開くURLをクリップボードにコピーしました。');
    });
}

function restoreFromUrl() {
    let params = new URLSearchParams(window.location.search);
    // 短縮URL(queryキー)なら展開して通常のパラメータ群に戻す(復号失敗時はユーザーへ通知して既定状態で続行)
    if (params.has('query')) {
        const decoded = decodeQueryParam(params.get('query'));
        if (decoded) params = new URLSearchParams(decoded);
        else alert('短縮URLの復元に失敗しました。URLが途中で欠けているか、壊れている可能性があります。既定の状態で開きます。');
    }
    if (!params.has('mode')) return;

    const mode = params.get('mode');

    // 位置情報
    if (params.has('startLat')) { const v = parseFloat(params.get('startLat')); if (!isNaN(v)) appState.start.lat = v; }
    if (params.has('startLng')) { const v = parseFloat(params.get('startLng')); if (!isNaN(v)) appState.start.lng = v; }
    if (params.has('startApiElv')) { const v = parseFloat(params.get('startApiElv')); if (!isNaN(v)) appState.startApiElev = v; }
    if (params.has('startElv')) { const v = parseFloat(params.get('startElv')); if (!isNaN(v)) appState.startHeight = v; }
    if (params.has('endLat')) { const v = parseFloat(params.get('endLat')); if (!isNaN(v)) appState.end.lat = v; }
    if (params.has('endLng')) { const v = parseFloat(params.get('endLng')); if (!isNaN(v)) appState.end.lng = v; }
    if (params.has('endApiElv')) { const v = parseFloat(params.get('endApiElv')); if (!isNaN(v)) appState.endApiElev = v; }
    if (params.has('endElv')) { const v = parseFloat(params.get('endElv')); if (!isNaN(v)) appState.endHeight = v; }

    // 日時 (YYYYMMDD, hhmmss) — date/timeが存在する場合のみ日時を復元しsetNow()をスキップ
    if (params.has('date')) {
        appState._restoredFromUrl = true;
        const s = params.get('date');
        if (s.length === 8) {
            let y = parseInt(s.substring(0, 4));
            const m = parseInt(s.substring(4, 6)) - 1, d = parseInt(s.substring(6, 8));
            if (y === 0) y = new Date().getFullYear(); // 日時半固定: アクセス年に置換
            appState.currentDate.setFullYear(y, m, d);
        }
    }
    if (params.has('time')) {
        appState._restoredFromUrl = true;
        const s = params.get('time');
        if (s.length >= 4) {
            const h = parseInt(s.substring(0, 2)), m = parseInt(s.substring(2, 4));
            const sec = s.length >= 6 ? parseInt(s.substring(4, 6)) : 0;
            appState.currentDate.setHours(h, m, sec, 0);
        }
    }

    // タイムゾーン補正: URL作成者と閲覧者のオフセット差を補正
    if (params.has('date') || params.has('time')) {
        const urlTzString = params.has('timeZone') ? params.get('timeZone') : '+0900';
        const urlOffsetMin = parseTimezoneOffsetMinutes(urlTzString);
        const localOffsetMin = -new Date().getTimezoneOffset();
        const diffMin = urlOffsetMin - localOffsetMin;
        if (diffMin !== 0) {
            appState.currentDate.setMinutes(appState.currentDate.getMinutes() - diffMin);
        }
    }

    // 表示天体 (starId複数指定対応)
    const starIds = params.getAll('starId');
    const starNames = params.getAll('starName');
    const starRas = params.getAll('starRa');
    const starDecs = params.getAll('starDec');
    const starColors = params.getAll('starColor');
    const starIsDasheds = params.getAll('starIsDashed');
    if (starIds.length > 0) {
        // URLに含まれるMy天体を復元
        let customIdx = 0;
        starIds.forEach(sid => {
            // 既定天体かどうかチェック
            const existing = appState.bodies.find(b => b.id === sid && !b.isCustom);
            if (existing) {
                existing.visible = true;
            } else if (customIdx < starNames.length) {
                // My天体としてURLから復元
                const ra = parseFloat(starRas[customIdx]);
                const dec = parseFloat(starDecs[customIdx]);
                const name = starNames[customIdx];
                const color = starColors[customIdx] || '#DDA0DD';
                const isDashed = starIsDasheds[customIdx] === '1';
                if (!isNaN(ra) && !isNaN(dec) && name) {
                    // 同じ赤経赤緯の既存My天体があるか検索
                    const sameRaDec = appState.myStars.find(s => s.ra === ra && s.dec === dec);
                    if (sameRaDec) {
                        // 既存の同一座標天体を表示ONにする
                        sameRaDec.visible = true;
                    } else {
                        // 新規追加: IDの衝突があれば新しいIDを採番
                        let id = parseInt(sid);
                        if (isNaN(id) || appState.myStars.some(s => s.id === id)) {
                            id = getNextMyStarId();
                        }
                        if (id !== null) {
                            appState.myStars.push({ id, name, ra, dec, visible: true, color, isDashed });
                        }
                    }
                }
                customIdx++;
            }
        });
        // 既定天体のvisible状態を設定
        appState.bodies.forEach(b => {
            if (!b.isCustom) {
                b.visible = starIds.includes(b.id);
            }
        });
        syncMyStarsToBodies();
    }

    // 辻検索パラメータ (mode=tsujisearchの時のみ)
    if (mode === 'tsujisearch') {
        if (params.has('tsujiSearchDays')) { const v = parseInt(params.get('tsujiSearchDays')); if (!isNaN(v)) appState.tsujiSearchDays = v; }
        if (params.has('tsujiAz')) { const v = parseFloat(params.get('tsujiAz')); if (!isNaN(v)) appState.tsujiSearchBaseAz = v; }
        if (params.has('tsujiAlt')) { const v = parseFloat(params.get('tsujiAlt')); if (!isNaN(v)) appState.tsujiSearchBaseAlt = v; }
        if (params.has('tsujiAzOffset')) { const v = parseFloat(params.get('tsujiAzOffset')); if (!isNaN(v)) appState.tsujiSearchOffsetAz = v; }
        if (params.has('tsujiAltOffset')) { const v = parseFloat(params.get('tsujiAltOffset')); if (!isNaN(v)) appState.tsujiSearchOffsetAlt = v; }
        if (params.has('tsujiAzTolerance')) { const v = parseFloat(params.get('tsujiAzTolerance')); if (!isNaN(v)) appState.tsujiSearchToleranceAz = v; }
        if (params.has('tsujiAltTolerance')) { const v = parseFloat(params.get('tsujiAltTolerance')); if (!isNaN(v)) appState.tsujiSearchToleranceAlt = v; }
        if (params.has('tsujiCenterMode')) appState.tsujiCenterMode = params.get('tsujiCenterMode');
        if (params.has('tsujiMoonFilter')) { appState.tsujiMoonFilterEnabled = params.get('tsujiMoonFilter') === 'true'; }
        if (params.has('tsujiMoonBase')) { const v = parseFloat(params.get('tsujiMoonBase')); if (!isNaN(v)) appState.tsujiMoonBase = v; }
        if (params.has('tsujiMoonTolerance')) { const v = parseFloat(params.get('tsujiMoonTolerance')); if (!isNaN(v)) appState.tsujiMoonTolerance = v; }
        if (params.has('tsujiAccuracyFilter')) { appState.tsujiAccuracyFilterEnabled = params.get('tsujiAccuracyFilter') === 'true'; }
        if (params.has('tsujiAccDblCircle')) { appState.tsujiAccDblCircle = params.get('tsujiAccDblCircle') === 'true'; }
        if (params.has('tsujiAccCircle')) { appState.tsujiAccCircle = params.get('tsujiAccCircle') === 'true'; }
        if (params.has('tsujiAccTriangle')) { appState.tsujiAccTriangle = params.get('tsujiAccTriangle') === 'true'; }
        if (params.has('tsujiAccDash')) { appState.tsujiAccDash = params.get('tsujiAccDash') === 'true'; }
        if (params.has('tsujiElevationOption')) { appState.tsujiElevationOption = params.get('tsujiElevationOption') === 'true'; }
        if (params.has('tsujiElevOK')) { appState.tsujiElevOK = params.get('tsujiElevOK') === 'true'; }
        if (params.has('tsujiElevNG')) { appState.tsujiElevNG = params.get('tsujiElevNG') === 'true'; }
        if (params.has('tsujiTimeFilter')) { appState.tsujiTimeFilter = params.get('tsujiTimeFilter') === 'true'; }
        if (params.has('tsujiStartMode')) { appState.tsujiStartMode = params.get('tsujiStartMode'); }
        if (params.has('tsujiStartTime')) { appState.tsujiStartTime = params.get('tsujiStartTime'); }
        if (params.has('tsujiStartPrePost')) { appState.tsujiStartPrePost = params.get('tsujiStartPrePost') === 'true'; }
        if (params.has('tsujiStartPrePostDir')) { appState.tsujiStartPrePostDir = params.get('tsujiStartPrePostDir'); }
        if (params.has('tsujiStartOffset')) { appState.tsujiStartOffset = params.get('tsujiStartOffset'); }
        if (params.has('tsujiEndMode')) { appState.tsujiEndMode = params.get('tsujiEndMode'); }
        if (params.has('tsujiEndTime')) { appState.tsujiEndTime = params.get('tsujiEndTime'); }
        if (params.has('tsujiEndPrePost')) { appState.tsujiEndPrePost = params.get('tsujiEndPrePost') === 'true'; }
        if (params.has('tsujiEndPrePostDir')) { appState.tsujiEndPrePostDir = params.get('tsujiEndPrePostDir'); }
        if (params.has('tsujiEndOffset')) { appState.tsujiEndOffset = params.get('tsujiEndOffset'); }
    }

    // 辻メッシュ検索パラメータ (mode=tsujimeshの時のみ)
    if (mode === 'tsujimesh') {
        const meshNum = (pk, sk) => { if (params.has(pk)) { const v = parseFloat(params.get(pk)); if (!isNaN(v)) appState[sk] = v; } };
        const meshBool = (pk, sk) => { if (params.has(pk)) appState[sk] = params.get(pk) === 'true'; };
        const meshStr = (pk, sk) => { if (params.has(pk)) appState[sk] = params.get(pk); };
        if (params.has('tsujiMeshDays')) { const v = parseInt(params.get('tsujiMeshDays')); if (!isNaN(v)) appState.tsujiMeshDays = v; }
        meshNum('tsujiMeshAz', 'tsujiMeshBaseAz'); meshNum('tsujiMeshAlt', 'tsujiMeshBaseAlt');
        meshNum('tsujiMeshAzOffset', 'tsujiMeshOffsetAz'); meshNum('tsujiMeshAltOffset', 'tsujiMeshOffsetAlt');
        meshNum('tsujiMeshAzTolerance', 'tsujiMeshToleranceAz'); meshNum('tsujiMeshAltTolerance', 'tsujiMeshToleranceAlt');
        meshStr('tsujiMeshCenterMode', 'tsujiMeshCenterMode'); meshStr('tsujiMeshAccuracy', 'tsujiMeshAccuracy');
        meshBool('tsujiMeshSymO', 'tsujiMeshSymO'); meshBool('tsujiMeshSymTri', 'tsujiMeshSymTri'); meshBool('tsujiMeshSymDash', 'tsujiMeshSymDash');
        meshBool('tsujiMeshMoonFilter', 'tsujiMeshMoonFilterEnabled');
        meshNum('tsujiMeshMoonBase', 'tsujiMeshMoonBase'); meshNum('tsujiMeshMoonTolerance', 'tsujiMeshMoonTolerance');
        meshBool('tsujiMeshElevationOption', 'tsujiMeshElevationOption');
        meshBool('tsujiMeshElevOK', 'tsujiMeshElevOK'); meshBool('tsujiMeshElevNG', 'tsujiMeshElevNG');
        meshBool('tsujiMeshTimeFilter', 'tsujiMeshTimeFilter');
        ['Start', 'End'].forEach(G => {
            meshStr('tsujiMesh' + G + 'Mode', 'tsujiMesh' + G + 'Mode');
            meshStr('tsujiMesh' + G + 'Time', 'tsujiMesh' + G + 'Time');
            meshBool('tsujiMesh' + G + 'PrePost', 'tsujiMesh' + G + 'PrePost');
            meshStr('tsujiMesh' + G + 'PrePostDir', 'tsujiMesh' + G + 'PrePostDir');
            meshStr('tsujiMesh' + G + 'Offset', 'tsujiMesh' + G + 'Offset');
        });
    }

    // 宙の窓メニュー＋コントロールメニューの全項目を復元(preview/tsujisearch の両モード共通)。
    // 範囲・選択肢の妥当性は直後の normalizeAppState 相当の既定値で担保するため、型変換＋NaNガードのみ行う
    const soraNum = (key) => { if (params.has(key)) { const v = parseFloat(params.get(key)); if (!isNaN(v)) appState[key] = v; } };
    const soraBool = (key) => { if (params.has(key)) appState[key] = params.get(key) === 'true'; };
    const soraStr = (key) => { if (params.has(key)) appState[key] = params.get(key); };
    soraStr('soraSensorKey'); soraStr('soraOrient'); soraStr('soraFisheyeShape'); soraStr('soraExpFormat'); soraStr('soraMovPlayMode');
    ['soraAspectW', 'soraAspectH', 'soraFocal', 'soraFNumberIdx', 'soraFocusDist', 'soraFisheyeStrength', 'soraPanoAov',
     'soraBaseAz', 'soraBaseAlt', 'soraOffsetAz', 'soraOffsetAlt', 'soraViewRange',
     'soraMovInterval', 'soraMovShots', 'soraMovFps', 'soraMovDispStep', 'soraMovImgMb',
     'soraMwBrightness', 'soraElevShade', 'soraSunShade', 'soraExpW', 'soraExpH'].forEach(soraNum);
    ['soraFisheye', 'soraPanorama', 'soraPeaking', 'soraTraj', 'soraCenterCross', 'soraTargetCross', 'soraSearchCenter'].forEach(soraBool);
    normalizeAppState();   // URL由来の値を既定の範囲・選択肢に丸める

    // 下部パネル等の表示/非表示状態を復元(preview/tsujisearch の両モード共通)
    // 辻ライン(地図オーバーレイ): フラグ復元→ init の active反映＋updateAll で描画
    if (params.has('dp')) appState.isDPActive = params.get('dp') === 'true';
    // 標高グラフ/全天儀/宙の窓は排他のため、ONは1つだけ遅延オープン(elevation→milkyway→soramado優先)
    if (params.get('elevation') === 'true') appState._pendingPanel = 'elevation';
    else if (params.get('milkyway') === 'true') appState._pendingPanel = 'milkyway';
    else if (params.get('soramado') === 'true') appState._pendingPanel = 'soramado';
    // 辻検索: ONなら遅延オープン(他パネルと共存可)
    if (params.get('tsujisearch') === 'true') appState._pendingTsujiSearch = true;
    // 辻メッシュ検索: ONなら遅延オープン(辻検索と排他のため、両方ONなら辻メッシュを優先)
    if (params.get('tsujimesh') === 'true') { appState._pendingTsujiMesh = true; delete appState._pendingTsujiSearch; }

    // 標高(elev)を再計算: elev = apiElev + height
    appState.start.elev = appState.startApiElev + appState.startHeight;
    appState.end.elev = appState.endApiElev + appState.endHeight;

    // 宙の窓の基準方位角/視高度/視界範囲をURL値のまま使う(位置起点の自動再計算で上書きしない)
    if (params.has('soraBaseAz') || params.has('soraBaseAlt')) {
        appState._soraLastPosKey = `${appState.start.lat},${appState.start.lng},${appState.start.elev}|${appState.end.lat},${appState.end.lng},${appState.end.elev}`;
    }

    // mode=tsujisearchの場合は辻検索を自動実行（UIが準備できた後に）
    if (mode === 'tsujisearch') {
        appState._pendingTsujiSearch = true;
    }
    // mode=tsujimeshの場合は辻メッシュ検索を自動実行（UIが準備できた後に）
    if (mode === 'tsujimesh') {
        appState._pendingTsujiMesh = true;
        delete appState._pendingTsujiSearch;
        // URLの基準方位角/視高度を自動再計算で上書きしない
        if (params.has('tsujiMeshAz') || params.has('tsujiMeshAlt')) {
            appState._lastTsujiMeshPosKey = `${appState.start.lat},${appState.start.lng},${appState.start.elev}|${appState.end.lat},${appState.end.lng},${appState.end.elev}`;
        }
    }
}

// ============================================================
// 全天儀 (Milky Way orrery) — 3D天体儀パネル
//  - 赤道座標(EQJ)のスカイテクスチャを貼った球を、観測者の地平座標へ
//    合わせて回転し、外側から俯瞰する。地平線・東西南北・赤道格子を重畳。
//  - テクスチャは既定でプロシージャル生成。milkyway-skymap.webp があれば差替。
//  - three.js (グローバル THREE) を使用。CDN未読込時はメッセージ表示で停止。
// ============================================================
const _MW_D2R = Math.PI / 180;
const _MW_R = 1;             // 天球半径(ワールド)
let _mwInited = false, _mwFailed = false;
let _mwRenderer = null, _mwScene = null, _mwCamera = null;
let _mwWorld = null;         // マスターGroup(ドラッグで回転。初期=北が上)
let _mwGlobe = null;         // テクスチャ球+赤道格子(EQJ系; 観測者へ回転)
let _mwTexture = null, _mwMaterial = null;
let _mwMwObjGrp = null;      // 天の川オブジェクト群(環・方位線・マーカー・オフセット点)。基本オプション変更で再構築
const _mwConstLayers = { fig: null, bounds: null };   // 星座線/星座領域のオーバーレイ球(遅延生成)
let _mwBodiesObjGrp = null;  // 表示天体オブジェクト群(軌跡・マーカー・方位線)。_mwGlobeの子(EQJ系で天球と共に回転)
let _mwLabelItems = [];      // 名称ラベル対象 [{name, color, pos(THREE.Vector3 グローブ座標)}]
let _mwBodiesKey = '';       // 再構築判定キー
let _mwConstHighlight = null;   // ハイライト中の星座名(null=なし)
let _mwBlinkPhase = false;      // 点滅位相(黄⇄赤)
let _mwBlinkTimer = null;       // 点滅タイマー
let _mwConstHlMarker = null;    // ハイライト中の星座中心を示す3Dリング

// 88星座の日本語名と中心座標(RA時, Dec度; 概略値。名称ラベルの指し示し用)
const MW_CONSTELLATIONS = [
    { n: 'アンドロメダ座', a: 'And', ra: 0.8, dec: 37 }, { n: 'いっかくじゅう座', a: 'Mon', ra: 7.1, dec: -3 },
    { n: 'いて座', a: 'Sgr', ra: 19.1, dec: -28 }, { n: 'いるか座', a: 'Del', ra: 20.7, dec: 12 },
    { n: 'インディアン座', a: 'Ind', ra: 21.0, dec: -58 }, { n: 'うお座', a: 'Psc', ra: 0.5, dec: 14 },
    { n: 'うさぎ座', a: 'Lep', ra: 5.5, dec: -19 }, { n: 'うしかい座', a: 'Boo', ra: 14.7, dec: 31 },
    { n: 'うみへび座', a: 'Hya', ra: 11.6, dec: -14 }, { n: 'エリダヌス座', a: 'Eri', ra: 3.3, dec: -28 },
    { n: 'おうし座', a: 'Tau', ra: 4.7, dec: 15 }, { n: 'おおいぬ座', a: 'CMa', ra: 6.8, dec: -22 },
    { n: 'おおかみ座', a: 'Lup', ra: 15.2, dec: -43 }, { n: 'おおぐま座', a: 'UMa', ra: 11.3, dec: 51 },
    { n: 'おとめ座', a: 'Vir', ra: 13.4, dec: -4 }, { n: 'おひつじ座', a: 'Ari', ra: 2.6, dec: 20 },
    { n: 'オリオン座', a: 'Ori', ra: 5.6, dec: 6 }, { n: 'がか座', a: 'Pic', ra: 5.7, dec: -53 },
    { n: 'カシオペヤ座', a: 'Cas', ra: 1.0, dec: 62 }, { n: 'かじき座', a: 'Dor', ra: 5.2, dec: -59 },
    { n: 'かに座', a: 'Cnc', ra: 8.6, dec: 20 }, { n: 'かみのけ座', a: 'Com', ra: 12.8, dec: 23 },
    { n: 'カメレオン座', a: 'Cha', ra: 10.7, dec: -79 }, { n: 'からす座', a: 'Crv', ra: 12.4, dec: -18 },
    { n: 'かんむり座', a: 'CrB', ra: 15.8, dec: 33 }, { n: 'きょしちょう座', a: 'Tuc', ra: 23.8, dec: -66 },
    { n: 'ぎょしゃ座', a: 'Aur', ra: 6.1, dec: 42 }, { n: 'きりん座', a: 'Cam', ra: 8.9, dec: 69 },
    { n: 'くじゃく座', a: 'Pav', ra: 19.6, dec: -65 }, { n: 'くじら座', a: 'Cet', ra: 1.7, dec: -7 },
    { n: 'ケフェウス座', a: 'Cep', ra: 22.0, dec: 71 }, { n: 'ケンタウルス座', a: 'Cen', ra: 13.1, dec: -47 },
    { n: 'けんびきょう座', a: 'Mic', ra: 21.0, dec: -36 }, { n: 'こいぬ座', a: 'CMi', ra: 7.7, dec: 6 },
    { n: 'こうま座', a: 'Equ', ra: 21.2, dec: 8 }, { n: 'こぎつね座', a: 'Vul', ra: 20.2, dec: 24 },
    { n: 'こぐま座', a: 'UMi', ra: 15.0, dec: 78 }, { n: 'こじし座', a: 'LMi', ra: 10.2, dec: 32 },
    { n: 'コップ座', a: 'Crt', ra: 11.4, dec: -16 }, { n: 'こと座', a: 'Lyr', ra: 18.9, dec: 37 },
    { n: 'コンパス座', a: 'Cir', ra: 14.6, dec: -63 }, { n: 'さいだん座', a: 'Ara', ra: 17.4, dec: -56 },
    { n: 'さそり座', a: 'Sco', ra: 16.9, dec: -27 }, { n: 'さんかく座', a: 'Tri', ra: 2.2, dec: 31 },
    { n: 'しし座', a: 'Leo', ra: 10.7, dec: 13 }, { n: 'じょうぎ座', a: 'Nor', ra: 16.1, dec: -51 },
    { n: 'たて座', a: 'Sct', ra: 18.7, dec: -10 }, { n: 'ちょうこくぐ座', a: 'Cae', ra: 4.7, dec: -38 },
    { n: 'ちょうこくしつ座', a: 'Scl', ra: 0.4, dec: -32 }, { n: 'つる座', a: 'Gru', ra: 22.5, dec: -46 },
    { n: 'テーブルさん座', a: 'Men', ra: 5.4, dec: -77 }, { n: 'てんびん座', a: 'Lib', ra: 15.2, dec: -15 },
    { n: 'とかげ座', a: 'Lac', ra: 22.5, dec: 46 }, { n: 'とけい座', a: 'Hor', ra: 3.3, dec: -53 },
    { n: 'とびうお座', a: 'Vol', ra: 7.8, dec: -69 }, { n: 'とも座', a: 'Pup', ra: 7.3, dec: -31 },
    { n: 'はえ座', a: 'Mus', ra: 12.6, dec: -70 }, { n: 'はくちょう座', a: 'Cyg', ra: 20.6, dec: 45 },
    { n: 'はちぶんぎ座', a: 'Oct', ra: 23.0, dec: -82 }, { n: 'はと座', a: 'Col', ra: 5.9, dec: -35 },
    { n: 'ふうちょう座', a: 'Aps', ra: 16.1, dec: -76 }, { n: 'ふたご座', a: 'Gem', ra: 7.1, dec: 23 },
    { n: 'ペガスス座', a: 'Peg', ra: 22.7, dec: 19 }, { n: 'へび座', a: 'Ser', ra: 16.9, dec: 6 },
    { n: 'へびつかい座', a: 'Oph', ra: 17.4, dec: -8 }, { n: 'ヘルクレス座', a: 'Her', ra: 17.4, dec: 27 },
    { n: 'ペルセウス座', a: 'Per', ra: 3.2, dec: 45 }, { n: 'ほ座', a: 'Vel', ra: 9.6, dec: -47 },
    { n: 'ぼうえんきょう座', a: 'Tel', ra: 19.3, dec: -51 }, { n: 'ほうおう座', a: 'Phe', ra: 0.9, dec: -48 },
    { n: 'ポンプ座', a: 'Ant', ra: 10.3, dec: -32 }, { n: 'みずがめ座', a: 'Aqr', ra: 22.3, dec: -10 },
    { n: 'みずへび座', a: 'Hyi', ra: 2.3, dec: -70 }, { n: 'みなみじゅうじ座', a: 'Cru', ra: 12.4, dec: -60 },
    { n: 'みなみのうお座', a: 'PsA', ra: 22.3, dec: -30 }, { n: 'みなみのかんむり座', a: 'CrA', ra: 18.6, dec: -41 },
    { n: 'みなみのさんかく座', a: 'TrA', ra: 16.1, dec: -65 }, { n: 'や座', a: 'Sge', ra: 19.7, dec: 19 },
    { n: 'やぎ座', a: 'Cap', ra: 21.0, dec: -18 }, { n: 'やまねこ座', a: 'Lyn', ra: 8.0, dec: 47 },
    { n: 'らしんばん座', a: 'Pyx', ra: 8.9, dec: -27 }, { n: 'りゅう座', a: 'Dra', ra: 17.0, dec: 65 },
    { n: 'りゅうこつ座', a: 'Car', ra: 8.7, dec: -63 }, { n: 'りょうけん座', a: 'CVn', ra: 13.1, dec: 40 },
    { n: 'レチクル座', a: 'Ret', ra: 3.9, dec: -60 }, { n: 'ろ座', a: 'For', ra: 2.8, dec: -30 },
    { n: 'ろくぶんぎ座', a: 'Sex', ra: 10.3, dec: -2 }, { n: 'わし座', a: 'Aql', ra: 19.7, dec: 3 },
];
const _MW_TILT = 38 * _MW_D2R;             // 初期俯瞰角(北が上・東が右になる固定カメラ)
const _MW_DIST0 = 3.4;                     // 初期カメラ距離
let _mwDist = _MW_DIST0;                    // ホイールズーム用

/** 銀河座標(l,b 度) → 赤道座標 J2000 {ra(時), dec(度)} (固定回転行列) */
function galacticToEquatorial(lDeg, bDeg) {
    const l = lDeg * _MW_D2R, b = bDeg * _MW_D2R, cb = Math.cos(b);
    const gx = cb * Math.cos(l), gy = cb * Math.sin(l), gz = Math.sin(b);
    const ex = -0.0548755604 * gx + 0.4941094279 * gy - 0.8676661490 * gz;
    const ey = -0.8734370902 * gx - 0.4448296300 * gy - 0.1980763734 * gz;
    const ez = -0.4838350155 * gx + 0.7469822445 * gy + 0.4559837762 * gz;
    let ra = Math.atan2(ey, ex); if (ra < 0) ra += 2 * Math.PI;
    const dec = Math.asin(Math.max(-1, Math.min(1, ez)));
    return { ra: ra * 12 / Math.PI, dec: dec / _MW_D2R };
}

/** 赤道座標(RA時,Dec度) → 単位ベクトル(EQJ系: Z=北天極, X=RA0/Dec0) */
function _mwEquVec(raHours, decDeg) {
    const ra = raHours * 15 * _MW_D2R, dec = decDeg * _MW_D2R, cd = Math.cos(dec);
    return [cd * Math.cos(ra), cd * Math.sin(ra), Math.sin(dec)];
}

/** 地平座標(az,alt 度) → ワールドベクトル(右手系: X=北, Y=天頂, Z=東) */
function _mwWorldVec(azDeg, altDeg) {
    const az = azDeg * _MW_D2R, alt = altDeg * _MW_D2R, ca = Math.cos(alt);
    return [ca * Math.cos(az), Math.sin(alt), ca * Math.sin(az)];
}

/** 天の川テクスチャのプロシージャル生成 (赤道座標 equirectangular の canvas) */
function _mwBuildProceduralTexture() {
    const W = 2048, H = 1024;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    g.fillStyle = '#05060a'; g.fillRect(0, 0, W, H);
    const toPx = (raHours, decDeg) => [(raHours / 24) * W, ((90 - decDeg) / 180) * H];
    // ガウス近似 (約 -2..+2)
    const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;

    g.globalCompositeOperation = 'lighter';
    // (a) 天の川の帯: 銀河赤道 b=0 を中心に、広いハロー+明るいコアの2層で描く (RA継ぎ目対策で±W複製)
    for (let l = 0; l < 360; l += 0.4) {
        const eq = galacticToEquatorial(l, 0);
        const [x0, y] = toPx(eq.ra, eq.dec);
        const cen = Math.max(0, Math.cos((((l + 180) % 360) - 180) * _MW_D2R)); // 銀河中心(l=0)付近で明るく
        for (const x of [x0 - W, x0, x0 + W]) {
            let grd = g.createRadialGradient(x, y, 0, x, y, 90);   // 広いハロー
            grd.addColorStop(0, `rgba(170,190,235,${(0.032 + 0.032 * cen).toFixed(3)})`);
            grd.addColorStop(1, 'rgba(170,190,235,0)');
            g.fillStyle = grd; g.beginPath(); g.arc(x, y, 90, 0, 2 * Math.PI); g.fill();
            grd = g.createRadialGradient(x, y, 0, x, y, 34);       // 明るいコア
            grd.addColorStop(0, `rgba(220,228,255,${(0.055 + 0.06 * cen).toFixed(3)})`);
            grd.addColorStop(1, 'rgba(220,228,255,0)');
            g.fillStyle = grd; g.beginPath(); g.arc(x, y, 34, 0, 2 * Math.PI); g.fill();
        }
    }
    // (b1) 全天の淡い星
    for (let i = 0; i < 1800; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        const a = 0.15 + Math.random() * 0.45, s = Math.random() < 0.93 ? 0.6 : 1.2;
        g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        g.beginPath(); g.arc(x, y, s, 0, 2 * Math.PI); g.fill();
    }
    // (b2) 天の川に集中する星 (|b|小でガウス分布)
    for (let i = 0; i < 5200; i++) {
        const l = Math.random() * 360, b = gauss() * 9;
        const eq = galacticToEquatorial(l, b);
        const [x, y] = toPx(eq.ra, eq.dec);
        const a = 0.25 + Math.random() * 0.6, s = Math.random() < 0.9 ? 0.6 : 1.4;
        g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        g.beginPath(); g.arc(x, y, s, 0, 2 * Math.PI); g.fill();
    }
    // (c) 星雲グロー (銀河中心ほか)
    const glow = (lD, bD, rad, col) => {
        const eq = galacticToEquatorial(lD, bD);
        const [x0, y] = toPx(eq.ra, eq.dec);
        for (const x of [x0 - W, x0, x0 + W]) {
            const grd = g.createRadialGradient(x, y, 0, x, y, rad);
            grd.addColorStop(0, col); grd.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = grd; g.beginPath(); g.arc(x, y, rad, 0, 2 * Math.PI); g.fill();
        }
    };
    glow(0, 0, 150, 'rgba(255,225,180,0.18)');   // いて座(銀河中心)
    glow(80, 0, 110, 'rgba(210,220,255,0.10)');  // はくちょう座方向
    glow(287, -1, 95, 'rgba(255,205,185,0.10)'); // りゅうこつ座方向
    g.globalCompositeOperation = 'source-over';
    return cv;
}

/** 実画像(milkyway-skymap.webp)があれば差し替え。無ければプロシージャルのまま。 */
function _mwTryLoadRealImage() {
    const img = new Image();
    img.onload = () => {
        if (_mwFailed || !_mwMaterial) return;
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        // NASA赤道座標版は「0h RAが中央・RAは左へ増加」配置。球UV(u=RA/24)へ水平反転オフセットで整合
        tex.wrapS = THREE.RepeatWrapping;
        tex.repeat.x = -1; tex.offset.x = 0.5;
        tex.needsUpdate = true;
        if (_mwTexture) _mwTexture.dispose();
        _mwTexture = tex;
        _mwMaterial.map = appState.mwShowBodies ? tex : null;   // 表示天体OFF中は貼らない(ONで復帰)
        _mwMaterial.color.set(appState.mwShowBodies ? 0xffffff : 0x000000);   // OFF中は黒球(枠組みだけ見える)
        _mwMaterial.needsUpdate = true;
        const cr = document.getElementById('milkyway-credit');
        if (cr) cr.textContent = '天体写真: NASA/Goddard SVS（Deep Star Maps 2020, パブリックドメイン; Gaia: ESA/Gaia/DPAC）';
        _mwRender();
    };
    img.onerror = () => { /* 取得不可: 模式図のまま */ };
    img.src = 'milkyway-skymap.webp';
}

/** 赤道座標の経緯線(グラティキュール) */
function _mwBuildGraticule() {
    const grp = new THREE.Group();
    const matMinor = new THREE.LineBasicMaterial({ color: 0x4a6fa5, transparent: true, opacity: 0.35 });
    const matMajor = new THREE.LineBasicMaterial({ color: 0x6f9fd8, transparent: true, opacity: 0.55 });
    const RR = _MW_R * 1.002;
    for (let dec = -75; dec <= 75; dec += 15) {      // 赤緯(緯度)小円 15°刻み
        const pts = [];
        for (let i = 0; i <= 128; i++) { const v = _mwEquVec(24 * i / 128, dec); pts.push(new THREE.Vector3(v[0] * RR, v[1] * RR, v[2] * RR)); }
        grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), dec === 0 ? matMajor : matMinor));
    }
    for (let ra = 0; ra < 24; ra += 1) {             // 赤経(経度)経線 1h=15°刻み
        const pts = [];
        for (let j = 0; j <= 64; j++) { const v = _mwEquVec(ra, -82.5 + 165 * j / 64); pts.push(new THREE.Vector3(v[0] * RR, v[1] * RR, v[2] * RR)); }
        grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), matMinor));
    }
    return grp;
}

/** テクスチャ球(EQJ系)を生成 */
function _mwBuildGlobe() {
    const slices = 96, stacks = 48, positions = [], uvs = [], indices = [];
    for (let j = 0; j <= stacks; j++) {
        const dec = -90 + 180 * j / stacks;
        for (let i = 0; i <= slices; i++) {
            const v = _mwEquVec(24 * i / slices, dec);
            positions.push(v[0] * _MW_R, v[1] * _MW_R, v[2] * _MW_R);
            uvs.push(i / slices, j / stacks);
        }
    }
    const row = slices + 1;
    for (let j = 0; j < stacks; j++) for (let i = 0; i < slices; i++) {
        const a = j * row + i, b = a + row;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    // 加算合成: 暗い背景は透過し、星/帯のみ浮かぶ→内側からも透けて両面で環が見える
    _mwMaterial = new THREE.MeshBasicMaterial({
        map: _mwTexture, side: THREE.DoubleSide,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const globe = new THREE.Group();
    globe.add(new THREE.Mesh(geo, _mwMaterial));
    globe.add(_mwBuildGraticule());
    _mwMwObjGrp = _mwBuildMilkyWayRing();
    globe.add(_mwMwObjGrp);
    return globe;
}

/** 天の川リング(銀河赤道)・天の川方位線(中心→銀河中心)・交点の赤マーカー。
 *  WebGLは線幅指定が効かないため太線は TubeGeometry で表現。_mwGlobe の子として M とともに回転。 */
function _mwBuildMilkyWayRing() {
    const grp = new THREE.Group();
    const RR = _MW_R * 1.006;
    // 天の川リング: 銀河赤道(b=0)を球面化した白い太環
    const ringPts = [];
    for (let l = 0; l < 360; l += 3) {
        const eq = galacticToEquatorial(l, 0);
        const v = _mwEquVec(eq.ra, eq.dec);
        ringPts.push(new THREE.Vector3(v[0] * RR, v[1] * RR, v[2] * RR));
    }
    const ringCurve = new THREE.CatmullRomCurve3(ringPts, true);
    const matWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    grp.add(new THREE.Mesh(new THREE.TubeGeometry(ringCurve, 240, 0.0045 * _MW_R, 8, true), matWhite));
    // 銀河中心方向(=銀河赤道 l=0)。リング・方位線・交点を厳密に一致させる
    const gc = galacticToEquatorial(0, 0);
    const gv = _mwEquVec(gc.ra, gc.dec);
    const gcPos = new THREE.Vector3(gv[0] * RR, gv[1] * RR, gv[2] * RR);
    // 天の川方位線: 地平面中心(原点)→銀河中心 の白い太線
    const lineCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), gcPos);
    grp.add(new THREE.Mesh(new THREE.TubeGeometry(lineCurve, 1, 0.0035 * _MW_R, 8, false), matWhite));
    // 交点(銀河中心)の赤マーカー
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.018 * _MW_R, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff3333 }));
    marker.position.copy(gcPos);
    grp.add(marker);
    // オフセット点(基本オプション): 中心座標からのオフセット中心角の点を天体色マーカー＋天体色方位線で表示。
    // 中心と重なる場合(角度が360の倍数)は中心の赤マーカーを優先して表示しない。
    const ang = Number(appState.mwOffsetAngle) || 0;
    if (appState.baseOptMwBase === 'offset' && ang % 360 !== 0) {
        const mwBody = appState.bodies.find(b => b.id === 'MilkyWay');
        const col = new THREE.Color((mwBody && mwBody.color) || '#800080');
        const op = galacticToEquatorial(ang, 0);
        const ov = _mwEquVec(op.ra, op.dec);
        const opPos = new THREE.Vector3(ov[0] * RR, ov[1] * RR, ov[2] * RR);
        const matBody = new THREE.MeshBasicMaterial({ color: col });
        grp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), opPos), 1, 0.0035 * _MW_R, 8, false), matBody));
        const opMarker = new THREE.Mesh(new THREE.SphereGeometry(0.018 * _MW_R, 16, 12), matBody);
        opMarker.position.copy(opPos);
        grp.add(opMarker);
    }
    return grp;
}

/** 星座線/星座領域のオーバーレイ球を(必要時に)生成する。kind='fig'|'bounds' */
// 星座線/星座領域: IAU境界ベクトルデータ(d3-celestial, BSD-3ライセンス)を線で描画。
// 星座別レジストリ(略符→Line配列)でハイライト(黄⇄赤点滅)に対応
// データ取得は全天儀と宙の窓プレビューで共通(1回だけfetchしてキャッシュ)
const _constDataCache = {};
function _constFetch(kind) {
    if (!_constDataCache[kind]) {
        const file = kind === 'fig' ? 'constellations.lines.json' : 'constellations.borders.json';
        _constDataCache[kind] = fetch(file)
            .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .catch(err => { delete _constDataCache[kind]; throw err; });
    }
    return _constDataCache[kind];
}
const _MW_CONST_STYLE = {
    fig:    { file: 'constellations.lines.json',   r: 1.002, color: 0x6ec6ff, opacity: 0.8 },   // 星座線=淡い水色
    bounds: { file: 'constellations.borders.json', r: 1.004, color: 0xd9b64e, opacity: 0.55 },  // 星座領域=淡い金
};
const _mwConstSegs = { fig: new Map(), bounds: new Map() };   // 略符 → [THREE.Line]
const _mwConstLoading = { fig: false, bounds: false };

/** 大円スラープで約2°間隔に細分した頂点列(EQJ球面上)を返す。coords=[ [lonDeg, decDeg], ... ] */
function _mwConstPolyline(coords, R) {
    const pts = [];
    const toVec = (c) => {
        const raH = (((c[0] % 360) + 360) % 360) / 15;
        const v = _mwEquVec(raH, c[1]);
        return new THREE.Vector3(v[0], v[1], v[2]);
    };
    for (let i = 0; i < coords.length; i++) {
        const a = toVec(coords[i]);
        if (i === 0) { pts.push(a.clone().multiplyScalar(R)); continue; }
        const prev = toVec(coords[i - 1]);
        const ang = prev.angleTo(a);
        const n = Math.max(1, Math.ceil(ang / (2 * Math.PI / 180)));   // ≦2°/分割
        for (let k = 1; k <= n; k++) {
            const p = prev.clone().lerp(a, k / n).normalize().multiplyScalar(R);   // 単位球へ正規化=大円近似
            pts.push(p);
        }
    }
    return pts;
}

function _mwEnsureConstLayer(kind) {
    if (_mwConstLayers[kind] || !_mwGlobe || _mwConstLoading[kind]) return;
    const on = kind === 'fig' ? appState.mwShowConstFig : appState.mwShowConstBounds;
    if (!on) return;   // ONになるまで生成しない(データを無駄に読まない)
    const st = _MW_CONST_STYLE[kind];
    _mwConstLoading[kind] = true;
    _constFetch(kind).then(gj => {
        if (!_mwGlobe || _mwConstLayers[kind]) return;
        const group = new THREE.Group();
        const R = _MW_R * st.r;
        for (const f of gj.features) {
            // 所属星座: lines は id(1星座)、borders は ids="And,Lac"(隣接2星座の共有辺)
            const abbrs = (f.ids || f.id || '').split(',').filter(Boolean);
            const geom = f.geometry;
            const polys = geom.type === 'MultiLineString' ? geom.coordinates : [geom.coordinates];
            for (const poly of polys) {
                const pts = _mwConstPolyline(poly, R);
                if (pts.length < 2) continue;
                const g = new THREE.BufferGeometry().setFromPoints(pts);
                const m = new THREE.LineBasicMaterial({ color: st.color, transparent: true, opacity: st.opacity, depthWrite: false });
                const line = new THREE.Line(g, m);
                group.add(line);
                for (const ab of abbrs) {
                    if (!_mwConstSegs[kind].has(ab)) _mwConstSegs[kind].set(ab, []);
                    _mwConstSegs[kind].get(ab).push(line);
                }
            }
        }
        group.visible = kind === 'fig' ? !!appState.mwShowConstFig : !!appState.mwShowConstBounds;
        _mwConstLayers[kind] = group;
        _mwGlobe.add(group);
        _mwRender();
    }).catch(() => { /* 取得不可: 何も重ねない(次回ONで再試行) */ _mwConstLoading[kind] = false; });
}

/** 基本オプション(天の川の基準点/オフセット中心角・表示天体・星座線/領域)を全天儀へ反映 */
function _mwUpdateBaseOptions() {
    if (!_mwInited || _mwFailed || !_mwGlobe) return;
    // 天の川オブジェクト群を再構築(オフセット点マーカー/方位線の反映)
    if (_mwMwObjGrp) {
        _mwGlobe.remove(_mwMwObjGrp);
        _mwMwObjGrp.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material && c.material.dispose) c.material.dispose(); });
    }
    _mwMwObjGrp = _mwBuildMilkyWayRing();
    _mwGlobe.add(_mwMwObjGrp);
    // 表示天体チェック: 天の川の写真・環・マーカー等の表示/非表示
    _mwMwObjGrp.visible = !!appState.mwShowBodies;
    if (_mwMaterial) {
        _mwMaterial.map = appState.mwShowBodies ? _mwTexture : null;
        _mwMaterial.color.set(appState.mwShowBodies ? 0xffffff : 0x000000);   // OFF中は黒球(地平線や格子などの枠組みだけが見える)
        _mwMaterial.needsUpdate = true;
    }
    // 星座線/星座領域のオーバーレイ
    _mwEnsureConstLayer('fig');
    _mwEnsureConstLayer('bounds');
    if (_mwConstLayers.fig) _mwConstLayers.fig.visible = !!appState.mwShowConstFig;
    if (_mwConstLayers.bounds) _mwConstLayers.bounds.visible = !!appState.mwShowConstBounds;
    _mwBodiesKey = '';   // 表示天体オブジェクトも再構築
    _mwUpdateBodies();
    _mwRender();
}

/** 表示天体のオブジェクト群(軌跡=等赤緯の日周円・視半径マーカー/十字・中心からの方位線)を再構築。
 *  基本オプションの「表示天体」チェックでまとめて表示/非表示。名称ラベルは _mwUpdateLabels が描く。 */
function _mwUpdateBodies() {
    if (!_mwInited || _mwFailed || !_mwGlobe) return;
    const date = appState.currentDate;
    const visKey = appState.bodies.filter(b => b.visible).map(b => `${b.id}:${b.color}`).join(',');
    const key = `${Math.floor(date.getTime() / 60000)}|${appState.start.lat},${appState.start.lng}|${visKey}|${appState.mwShowBodies}|${appState.baseOptMwBase}:${appState.mwOffsetAngle}`;
    if (key === _mwBodiesKey && _mwBodiesObjGrp) return;
    _mwBodiesKey = key;
    if (_mwBodiesObjGrp) {
        _mwGlobe.remove(_mwBodiesObjGrp);
        _mwBodiesObjGrp.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material && c.material.dispose) c.material.dispose(); });
    }
    _mwBodiesObjGrp = new THREE.Group();
    _mwGlobe.add(_mwBodiesObjGrp);
    _mwLabelItems = [];
    if (!appState.mwShowBodies) { return; }
    let observer;
    try { observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev); } catch (e) { return; }
    const R = _MW_R * 1.006;
    appState.bodies.forEach(body => {
        if (!body.visible) return;
        let ra, dec;
        if (body.id === 'MilkyWay' || isFixedStar(body.id)) {
            const rd = getFixedStarRaDec(body.id); ra = rd.ra; dec = rd.dec;
        } else {
            try { const eq = Astronomy.Equator(body.id, date, observer, true, true); ra = eq.ra; dec = eq.dec; } catch (e) { return; }
        }
        const v = _mwEquVec(ra, dec);
        const pos = new THREE.Vector3(v[0] * R, v[1] * R, v[2] * R);
        const col = new THREE.Color(body.color || '#DDA0DD');
        // 軌跡: 日周運動=EQJ系の等赤緯円(中心座標を0°として±180°=全周を常に描画)
        const circPts = [];
        for (let a = 0; a <= 360; a += 4) {
            const cv = _mwEquVec(ra + a / 15, dec);
            circPts.push(new THREE.Vector3(cv[0] * R, cv[1] * R, cv[2] * R));
        }
        _mwBodiesObjGrp.add(_mwFrontBackLine(circPts, col, 0.55, false));   // 前面=実線/背面=破線(回転に追従)
        _mwLabelItems.push({ name: body.name, color: body.color || '#DDA0DD', pos });
        if (body.id === 'MilkyWay') return;   // 天の川のマーカー/方位線は _mwBuildMilkyWayRing 側で表現(基準点の軌跡とラベルのみここで)
        const mat = new THREE.MeshBasicMaterial({ color: col });
        // 方位線: 中心→天体
        _mwBodiesObjGrp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), pos), 1, 0.0025 * _MW_R, 6, false), mat));
        const angR = getBodyAngularRadius(body.id, date, observer);
        if (angR > 0) {
            // 惑星/太陽/月: 視半径を反映した球マーカー(小さすぎる場合は見やすい最小径にクランプ)
            const r = Math.max(_MW_R * Math.tan(angR * Math.PI / 180), 0.012 * _MW_R);
            const mk = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat);
            mk.position.copy(pos);
            _mwBodiesObjGrp.add(mk);
        } else {
            // 恒星: 天体色のマーカー(+) — 位置の接平面上に細い十字
            const n = pos.clone().normalize();
            let t1 = new THREE.Vector3(0, 1, 0).cross(n);
            if (t1.lengthSq() < 1e-6) t1 = new THREE.Vector3(1, 0, 0).cross(n);
            t1.normalize();
            const t2 = n.clone().cross(t1).normalize();
            const L = 0.025 * _MW_R;
            [t1, t2].forEach(t => {
                const a = pos.clone().addScaledVector(t, -L), b = pos.clone().addScaledVector(t, L);
                _mwBodiesObjGrp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, 0.003 * _MW_R, 6, false), mat));
            });
        }
    });
}

/** 表示天体・星座の名称を全天儀の左右に並べ、引き出し線で位置を指し示す(SVGオーバーレイ)。
 *  ドラッグ回転にも追従するよう _mwRender の度に呼ばれる。星座名称はホバー/タップで黄赤点滅ハイライト。 */
function _mwUpdateLabels() {
    const svg = document.getElementById('milkyway-labels');
    if (!svg || !_mwInited || _mwFailed || !_mwCamera || !_mwGlobe) return;
    const cv = document.getElementById('milkyway-canvas');
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h || !appState.isMilkyWayActive) { if (svg.firstChild) svg.innerHTML = ''; return; }
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    _mwGlobe.updateMatrixWorld(true);
    const camDir = _mwCamera.position.clone().normalize();
    const proj = (pos) => {
        const wp = pos.clone().applyMatrix4(_mwGlobe.matrixWorld);
        const front = wp.clone().normalize().dot(camDir) > 0.1;   // 前面(カメラ側)半球のみ
        const p = wp.project(_mwCamera);
        return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h, front };
    };
    const left = [], right = [];
    // 表示天体名: 投影位置の左右へ振り分け(「:表示天体名」チェックで名称+引き出し線を表示/非表示)
    if (appState.mwShowBodies && appState.mwShowBodyNames) {
        _mwLabelItems.forEach(it => {
            const pr = proj(it.pos);
            (pr.x < w / 2 ? left : right).push({ name: it.name, color: it.color, x: pr.x, y: pr.y, cls: 'body-label' });
        });
        left.sort((a, b) => a.y - b.y); right.sort((a, b) => a.y - b.y);
    }
    // 星座名称: 前面半球のみ。50音順=左上から右下(左列→右列)、座標順=Dec+90°→-90°
    if (appState.mwShowConstNames) {
        const items = [];
        const R = _MW_R * 1.006;
        MW_CONSTELLATIONS.forEach(c => {
            const v = _mwEquVec(c.ra, c.dec);
            const pr = proj(new THREE.Vector3(v[0] * R, v[1] * R, v[2] * R));
            items.push({ name: c.n, dec: c.dec, x: pr.x, y: pr.y, front: pr.front });   // 全星座を表示(背面は引き出し線なし)
        });
        if (appState.mwConstNameSort === 'pos') items.sort((a, b) => b.dec - a.dec);
        else items.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        const halve = Math.ceil(items.length / 2);
        items.forEach((it, i) => {
            (i < halve ? left : right).push({ name: it.name, color: '#9ab', x: it.x, y: it.y, cls: 'const-label', noLine: !it.front });
        });
    }
    const rowH = 12;
    const place = (list) => {
        let y = 12;
        list.forEach(it => { it.ly = y; y += rowH; });
        return list.filter(it => it.ly < h - 4);   // パネル高さに収まる分のみ(回転で入れ替わる)
    };
    const L = place(left), Rr = place(right);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    // 文字幅の概算(全角=フォントサイズ、半角=0.55倍)。引き出し線の始点計算に使用
    const estTextW = (s, fs) => { let sum = 0; for (const ch of s) sum += (ch.charCodeAt(0) > 0xFF ? 1 : 0.55) * fs; return sum; };
    const rowHtml = (it, isLeft) => {
        const hl = it.cls === 'const-label' && _mwConstHighlight === it.name;
        const col = hl ? (_mwBlinkPhase ? '#ffee00' : '#ff3333') : it.color;
        const lw = hl ? 2 : 1;
        const ax = isLeft ? 6 : w - 6;
        // 引き出し線は文字の内側端(左列=名称の末尾、右列=名称の先頭)から天体位置へ引く
        const tw = estTextW(it.name, it.cls === 'const-label' ? 10 : 11);
        const lx = isLeft ? ax + tw + 3 : ax - tw - 3;
        // 背面(奥)にある星座は名称のみ表示し、引き出し線は引かない
        const lineHtml = it.noLine ? '' : `<line x1="${lx.toFixed(1)}" y1="${(it.ly - 4).toFixed(1)}" x2="${it.x.toFixed(1)}" y2="${it.y.toFixed(1)}" stroke="${esc(col)}" stroke-width="${lw}" opacity="0.75"></line>`;
        return lineHtml +
               `<text x="${ax}" y="${(it.ly - 3 + rowH - 9).toFixed(1)}" fill="${esc(col)}" ${isLeft ? '' : 'text-anchor="end"'} class="${it.cls}" data-name="${esc(it.name)}">${esc(it.name)}</text>`;
    };
    let html = '';
    L.forEach(it => { html += rowHtml(it, true); });
    Rr.forEach(it => { html += rowHtml(it, false); });
    svg.innerHTML = html;
}

/** 星座名称のハイライト設定(黄⇄赤の点滅＋中心リングマーカー)。name=null で解除 */
/** ハイライト中の星座の線/領域Line群を取得(レイヤー表示中のもののみ) */
function _mwHlLines(abbr) {
    const out = [];
    if (!abbr) return out;
    if (_mwConstLayers.fig && _mwConstLayers.fig.visible) out.push(...(_mwConstSegs.fig.get(abbr) || []));
    if (_mwConstLayers.bounds && _mwConstLayers.bounds.visible) out.push(...(_mwConstSegs.bounds.get(abbr) || []));
    return out;
}

/** ハイライト対象の線色/不透明度を基準スタイルへ戻す */
function _mwResetHlLines(abbr) {
    if (!abbr) return;
    (_mwConstSegs.fig.get(abbr) || []).forEach(l => { l.material.color.set(_MW_CONST_STYLE.fig.color); l.material.opacity = _MW_CONST_STYLE.fig.opacity; });
    (_mwConstSegs.bounds.get(abbr) || []).forEach(l => { l.material.color.set(_MW_CONST_STYLE.bounds.color); l.material.opacity = _MW_CONST_STYLE.bounds.opacity; });
}

function _mwSetConstHighlight(name) {
    if (_mwConstHighlight === name) return;
    // 直前のハイライト星座の線/領域を基準色へ復元
    const prev = MW_CONSTELLATIONS.find(x => x.n === _mwConstHighlight);
    if (prev) _mwResetHlLines(prev.a);
    _mwConstHighlight = name;
    if (_mwBlinkTimer) { clearInterval(_mwBlinkTimer); _mwBlinkTimer = null; }
    // 3Dリングマーカーの撤去
    if (_mwConstHlMarker && _mwGlobe) {
        _mwGlobe.remove(_mwConstHlMarker);
        _mwConstHlMarker.geometry.dispose(); _mwConstHlMarker.material.dispose();
        _mwConstHlMarker = null;
    }
    if (name && _mwGlobe) {
        const c = MW_CONSTELLATIONS.find(x => x.n === name);
        // 星座線/領域が表示中ならベクトル線そのものを点滅ハイライト。非表示時は中心リングでフォールバック
        const hlLines = c ? _mwHlLines(c.a) : [];
        if (c && hlLines.length === 0) {
            const v = _mwEquVec(c.ra, c.dec);
            const pos = new THREE.Vector3(v[0], v[1], v[2]).multiplyScalar(_MW_R * 1.006);
            _mwConstHlMarker = new THREE.Mesh(
                new THREE.TorusGeometry(0.06 * _MW_R, 0.006 * _MW_R, 8, 32),
                new THREE.MeshBasicMaterial({ color: 0xffee00 }));
            _mwConstHlMarker.position.copy(pos);
            _mwConstHlMarker.lookAt(new THREE.Vector3(0, 0, 0));   // 球面に沿わせる
            _mwGlobe.add(_mwConstHlMarker);
        }
        const blink = () => {
            _mwBlinkPhase = !_mwBlinkPhase;
            const col = _mwBlinkPhase ? 0xffee00 : 0xff3333;
            if (_mwConstHlMarker) _mwConstHlMarker.material.color.set(col);
            for (const l of hlLines) { l.material.color.set(col); l.material.opacity = 1.0; }
            _mwRender();
        };
        blink();   // 即時に1回反映
        _mwBlinkTimer = setInterval(blink, 350);
    }
    _mwRender();
}

/** 星座名称のホバー/タップのイベント委譲。
 *  SVGラベルは毎フレーム再構築されるため、パネルレベルで委譲し「ラベル外に出たら解除」で取りこぼしを防ぐ。 */
function _mwAttachLabelEvents() {
    const panel = document.getElementById('milkyway-panel');
    if (!panel || panel._mwEventsAttached) return;
    panel._mwEventsAttached = true;
    let tapClearTimer = null;
    const isConstLabel = t => t && t.classList && t.classList.contains('const-label');
    panel.addEventListener('mouseover', e => {
        if (isConstLabel(e.target)) _mwSetConstHighlight(e.target.getAttribute('data-name'));
        else if (_mwConstHighlight && !tapClearTimer) _mwSetConstHighlight(null);   // ラベル外に出たら解除(タップ中は維持)
    });
    panel.addEventListener('mouseleave', () => { if (!tapClearTimer) _mwSetConstHighlight(null); });
    panel.addEventListener('click', e => {
        if (!isConstLabel(e.target)) return;
        _mwSetConstHighlight(e.target.getAttribute('data-name'));
        if (tapClearTimer) clearTimeout(tapClearTimer);
        tapClearTimer = setTimeout(() => { tapClearTimer = null; _mwSetConstHighlight(null); }, 4000);   // タップは4秒で自動解除
    });
}

/** 球面上の線/メッシュを「前面(カメラ側)のみ」または「背面のみ」描くようにマテリアルへシェーダーを注入する。
 *  ビュー空間で頂点が球中心より手前(z大)なら前面。回転(モデル行列)に自動追従する。 */
function _mwPatchFrontBack(mat, frontOnly) {
    mat.onBeforeCompile = (sh) => {
        sh.vertexShader = sh.vertexShader
            .replace('void main() {', 'varying float vMwFront;\nvoid main() {')
            .replace('#include <project_vertex>', '#include <project_vertex>\n\tvMwFront = mvPosition.z - (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;');
        sh.fragmentShader = sh.fragmentShader
            .replace('void main() {', 'varying float vMwFront;\nvoid main() {')
            .replace('#include <clipping_planes_fragment>', '\tif (vMwFront ' + (frontOnly ? '< 0.0' : '>= 0.0') + ') discard;\n#include <clipping_planes_fragment>');
    };
    return mat;
}

/** 球面上のポリラインを「前面=実線/背面=破線」の2本組(Group)で作る。globe/world中心が原点にあるオブジェクト用 */
function _mwFrontBackLine(points, color, opacity, loop) {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const Ctor = loop ? THREE.LineLoop : THREE.Line;
    const solid = new Ctor(geo, _mwPatchFrontBack(new THREE.LineBasicMaterial({ color, transparent: true, opacity }), true));
    const dashed = new Ctor(geo, _mwPatchFrontBack(new THREE.LineDashedMaterial({ color, transparent: true, opacity: opacity * 0.75, dashSize: 0.035 * _MW_R, gapSize: 0.025 * _MW_R }), false));
    dashed.computeLineDistances();
    const grp = new THREE.Group();
    grp.add(solid); grp.add(dashed);
    return grp;
}

/** 地平面(放射状線)・地平線円・東西南北マーカー(ワールド地平系) */
function _mwBuildHorizon() {
    const grp = new THREE.Group();
    // 地平面: 中心から15°刻みの放射状線(方位コンパス)
    const matSpoke = new THREE.LineBasicMaterial({ color: 0x557799, transparent: true, opacity: 0.30 });
    const matSpokeMain = new THREE.LineBasicMaterial({ color: 0x88aacc, transparent: true, opacity: 0.55 });
    for (let az = 0; az < 360; az += 15) {
        const v = _mwWorldVec(az, 0);
        const seg = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(v[0] * _MW_R, 0, v[2] * _MW_R)];
        grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(seg), (az % 90 === 0) ? matSpokeMain : matSpoke));
    }
    // 地平線円: 緑の太線。前面(カメラ側)=実線のトーラス、背面=破線(少しずらした3本重ねで太めに)。回転しても常に前面/背面で切り替わる
    const horizonTorus = new THREE.Mesh(
        new THREE.TorusGeometry(_MW_R * 1.004, 0.006 * _MW_R, 8, 128),
        _mwPatchFrontBack(new THREE.MeshBasicMaterial({ color: 0x33dd88, transparent: true, opacity: 0.95 }), true));
    horizonTorus.rotation.x = Math.PI / 2;   // XZ平面(地平面)へ
    grp.add(horizonTorus);
    for (const rr of [0.998, 1.004, 1.010]) {
        const pts = [];
        for (let az = 0; az < 360; az += 2) { const v = _mwWorldVec(az, 0); pts.push(new THREE.Vector3(v[0] * _MW_R * rr, 0, v[2] * _MW_R * rr)); }
        const dashed = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),
            _mwPatchFrontBack(new THREE.LineDashedMaterial({ color: 0x33dd88, transparent: true, opacity: 0.8, dashSize: 0.035 * _MW_R, gapSize: 0.025 * _MW_R }), false));
        dashed.computeLineDistances();
        grp.add(dashed);
    }
    // 方位マーカー: 北=赤、東/南/西=水色
    for (const [label, az] of [['北', 0], ['東', 90], ['南', 180], ['西', 270]]) {
        const v = _mwWorldVec(az, 0);
        const sp = _mwTextSprite(label, az === 0 ? '#ff4444' : '#66ccff');
        sp.position.set(v[0] * _MW_R * 1.10, 0.02, v[2] * _MW_R * 1.10);
        grp.add(sp);
    }
    // 方位目盛り: 北=0°、30°おきの度数(地平線円上)。0/90/180/270は北東南西の文字が示す
    for (let az = 30; az < 360; az += 30) {
        if (az % 90 === 0) continue;
        const v = _mwWorldVec(az, 0);
        const sp = _mwDegreeSprite(String(az));
        sp.position.set(v[0] * _MW_R * 1.10, 0.02, v[2] * _MW_R * 1.10);
        grp.add(sp);
    }
    return grp;
}

/** 文字スプライト */
function _mwTextSprite(text, color) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const c = cv.getContext('2d');
    c.font = 'bold 44px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillText(text, 34, 34);
    c.fillStyle = color; c.fillText(text, 32, 32);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sp.scale.set(0.22, 0.22, 0.22);
    return sp;
}

/** 方位目盛り用の小型数字スプライト(薄い灰) */
function _mwDegreeSprite(text) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const c = cv.getContext('2d');
    c.font = 'bold 30px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillText(text, 33, 33);
    c.fillStyle = '#cdd6df'; c.fillText(text, 32, 32);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sp.scale.set(0.15, 0.15, 0.15);
    return sp;
}

/** 観測者の位置・日時から EQJ→ワールド地平系 の回転を求める (Astronomy.Horizon のみ使用) */
function _mwComputeOrientation() {
    const obs = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev);
    const date = appState.currentDate;
    const toWorld = (raH, decD) => { const h = Astronomy.Horizon(date, obs, raH, decD, null); return _mwWorldVec(h.azimuth, h.altitude); };
    const Rx = toWorld(0, 0), Rz = toWorld(0, 90);   // EQJ標準基底 Xe(RA0/Dec0), Ze(北天極)の像
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const norm = (a) => { const m = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / m, a[1] / m, a[2] / m]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const rz = norm(Rz);
    const d = dot(Rx, rz);
    const rx = norm([Rx[0] - rz[0] * d, Rx[1] - rz[1] * d, Rx[2] - rz[2] * d]);
    const ry = cross(rz, rx);   // Ze×Xe = Ye
    return { rx, ry, rz };
}

/** 固定俯瞰カメラ: 南側上方から原点を見る。画面上=北(+X)・右=東(+Z)・俯瞰で地平面を上から見る */
function _mwUpdateCamera() {
    const ct = Math.cos(_MW_TILT), st = Math.sin(_MW_TILT);
    _mwCamera.position.set(-_mwDist * ct, _mwDist * st, 0);
    _mwCamera.up.set(st, ct, 0);
    _mwCamera.lookAt(0, 0, 0);
}

function _mwRender() {
    if (_mwRenderer && _mwScene && _mwCamera) _mwRenderer.render(_mwScene, _mwCamera);
    _mwUpdateLabels();   // 名称ラベル/引き出し線をドラッグ・ズームに追従
}

/** ドラッグでマスターGroup(_mwWorld)をトラックボール回転、ホイールでズーム */
function _mwAttachDrag(cv) {
    const ct = Math.cos(_MW_TILT), st = Math.sin(_MW_TILT);
    const upAxis = new THREE.Vector3(st, ct, 0);     // 画面の上方向(=カメラup)
    const rightAxis = new THREE.Vector3(0, 0, 1);    // 画面の右方向(=東)
    // マウスは1ポインタのドラッグ、タッチ(スマホ)は2本指の重心移動で回転する
    const pts = new Map();   // pointerId → {x, y}
    const centroid = () => {
        let x = 0, y = 0;
        pts.forEach(p => { x += p.x; y += p.y; });
        return { x: x / pts.size, y: y / pts.size };
    };
    cv.addEventListener('pointerdown', e => {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    });
    cv.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId) || !_mwWorld) return;
        const need = (e.pointerType === 'touch') ? 2 : 1;   // タッチは2本指のみ有効
        const before = centroid();
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size < need) return;
        const after = centroid();
        // 外側から掴んで回す操作感: 前面(カメラ側)が指に追従するよう回転。水平は +dx(=東軸まわり)。
        _mwWorld.rotateOnWorldAxis(upAxis, (after.x - before.x) * 0.006);
        _mwWorld.rotateOnWorldAxis(rightAxis, (after.y - before.y) * 0.006);
        _mwRender();
    });
    const end = e => { pts.delete(e.pointerId); };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    cv.addEventListener('wheel', e => {
        e.preventDefault();
        _mwDist = Math.max(1.7, Math.min(7, _mwDist * (e.deltaY > 0 ? 1.1 : 0.9)));
        _mwUpdateCamera(); _mwRender();
    }, { passive: false });
}

function _mwInit() {
    if (typeof THREE === 'undefined') {
        _mwFailed = true;
        const cr = document.getElementById('milkyway-credit');
        if (cr) cr.textContent = '3Dライブラリ(three.js)を読み込めませんでした';
        return;
    }
    const cv = document.getElementById('milkyway-canvas');
    _mwRenderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    _mwRenderer.setPixelRatio(window.devicePixelRatio || 1);
    _mwScene = new THREE.Scene();
    _mwScene.background = new THREE.Color(0x05060a);
    _mwCamera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
    _mwTexture = new THREE.CanvasTexture(_mwBuildProceduralTexture());
    _mwTexture.colorSpace = THREE.SRGBColorSpace;
    _mwGlobe = _mwBuildGlobe();
    _mwWorld = new THREE.Group();          // ドラッグで回す全体。初期は識別回転(=北が上)
    _mwWorld.add(_mwGlobe);
    _mwWorld.add(_mwBuildHorizon());
    _mwScene.add(_mwWorld);
    _mwUpdateCamera();
    _mwAttachDrag(cv);
    const cr = document.getElementById('milkyway-credit');
    if (cr) cr.textContent = '天の川: 模式図（生成）';
    _mwTryLoadRealImage();
    _mwAttachLabelEvents();
    _mwInited = true;
    _mwUpdateBaseOptions();   // 基本オプション(表示天体・星座線/領域・オフセット点)を初期反映
}

/** パネルを開いた時の起動。毎回「北が上」にリセット */
function startMilkyWayGlobe() {
    if (!_mwInited && !_mwFailed) _mwInit();
    if (_mwFailed) return;
    if (_mwWorld) _mwWorld.quaternion.identity();   // 初期表示は毎回 北が上
    _mwDist = _MW_DIST0;
    _mwUpdateCamera();
    resizeMilkyWayGlobe();
    updateMilkyWayGlobe();
}

/** 観測者の位置・日時変更に追従して向きを更新 */
function updateMilkyWayGlobe() {
    if (!_mwInited || _mwFailed || !_mwGlobe) return;
    const { rx, ry, rz } = _mwComputeOrientation();
    const m = new THREE.Matrix4();
    m.makeBasis(new THREE.Vector3(rx[0], rx[1], rx[2]), new THREE.Vector3(ry[0], ry[1], ry[2]), new THREE.Vector3(rz[0], rz[1], rz[2]));
    _mwGlobe.quaternion.setFromRotationMatrix(m);
    _mwUpdateBodies();   // 表示天体(惑星は日時で移動)を追従(キャッシュ付き)
    _mwRender();
}

/** リサイズ対応 */
function resizeMilkyWayGlobe() {
    if (!_mwInited || _mwFailed) return;
    const cv = document.getElementById('milkyway-canvas');
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    _mwRenderer.setSize(w, h, false);
    _mwCamera.aspect = w / h; _mwCamera.updateProjectionMatrix();
    _mwRender();
}

// ============================================================
// 宙の窓 (Sora no Mado) — 観測点→目的点方向のカメラ視点シミュレーション
//  フェーズ1: メニュー・光学計算・パネル枠(three.jsカメラ枠/ファインダー/中心十字)
//  天体描画(F2)・DEM地形(F3)は後続フェーズ。
// ============================================================
const SORA_SENSORS = [
    { key: 'mediumformat', name: '中判 (44×33)',                 w: 44,   h: 33 },
    { key: 'fullframe',    name: 'フルサイズ (36×24)',            w: 36,   h: 24 },
    { key: 'apsh',         name: 'APS-H (28.7×19)',              w: 28.7, h: 19 },
    { key: 'apsc',         name: 'APS-C (23.5×15.6)',            w: 23.5, h: 15.6 },
    { key: 'apsc_canon',   name: 'APS-C Canon (22.3×14.9)',      w: 22.3, h: 14.9 },
    { key: 'm43',          name: 'マイクロフォーサーズ (17.3×13)', w: 17.3, h: 13 },
    { key: 'one',          name: '1型 (13.2×8.8)',               w: 13.2, h: 8.8 },
    { key: 'type114',      name: '1/1.14型 (11.2×8.4)',          w: 11.2, h: 8.4 },
    { key: 'type128',      name: '1/1.28型 (9.8×7.3)',           w: 9.8,  h: 7.3 },
    { key: 'type17',       name: '1/1.7型 (7.6×5.7)',            w: 7.6,  h: 5.7 },
    { key: 'type20',       name: '1/2.0型 (6.4×4.8)',            w: 6.4,  h: 4.8 },
    { key: 'type23',       name: '1/2.3型 (6.17×4.55)',          w: 6.17, h: 4.55 },
    { key: 'type255',      name: '1/2.55型 (5.7×4.3)',           w: 5.7,  h: 4.3 },
    { key: 'type30',       name: '1/3.0型 (4.8×3.6)',            w: 4.8,  h: 3.6 },
    { key: 'type36',       name: '1/3.6型 (4.0×3.0)',            w: 4.0,  h: 3.0 },
    // スマートフォン(主カメラ・広角)。寸法は公開情報ベースの概算(4:3)
    { key: 'ip_x_11',      name: 'iPhone X/XS/XR/11 (1/2.55型)',            w: 5.7,  h: 4.3 },
    { key: 'ip_12',        name: 'iPhone 12/12 mini/12 Pro (1/2.55型)',     w: 5.7,  h: 4.3 },
    { key: 'ip_12pm',      name: 'iPhone 12 Pro Max (1/1.7型)',             w: 7.6,  h: 5.7 },
    { key: 'ip_13',        name: 'iPhone 13/13 mini (1/1.9型)',             w: 6.8,  h: 5.1 },
    { key: 'ip_13p_14',    name: 'iPhone 13 Pro/Pro Max・14/14 Plus (1/1.65型)', w: 7.8, h: 5.9 },
    { key: 'ip_pro48',     name: 'iPhone 14 Pro/15 Pro/16 Pro/17 Pro 系 (1/1.28型)', w: 9.8, h: 7.3 },
    { key: 'ip_15_16',     name: 'iPhone 15/16 系・17・Air (1/1.56型)',          w: 8.2, h: 6.2 },
    { key: 'ip_se',        name: 'iPhone SE(第2/3世代) (1/3.0型)',          w: 4.8,  h: 3.6 },
    { key: 'ipod7',        name: 'iPod touch(第7世代) (1/3.2型)',           w: 4.5,  h: 3.4 },
    { key: 'px_4a_6a',     name: 'Pixel 4a/5/5a/6a (1/2.55型)',             w: 5.7,  h: 4.3 },
    { key: 'px_6_7',       name: 'Pixel 6/6 Pro・7/7 Pro (1/1.31型)',       w: 9.8,  h: 7.4 },
    { key: 'px_7a_8a',     name: 'Pixel 7a/8a (1/1.73型)',                  w: 7.4,  h: 5.6 },
    { key: 'px_8_9',       name: 'Pixel 8/8 Pro・9/9 Pro (1/1.31型)',       w: 9.8,  h: 7.4 },
    { key: 'xp_1ii_iv',    name: 'Xperia 1/5 (II〜IV) (1/1.7型)',           w: 7.6,  h: 5.7 },
    { key: 'xp_1v',        name: 'Xperia 1 V/5 V・1 VI (1/1.35型)',         w: 9.6,  h: 7.2 },
    { key: 'xp_10',        name: 'Xperia 10 (II〜VI) (1/2.8型)',            w: 5.1,  h: 3.8 },
];
const SORA_FOCALS = [6,7.5,8,10,11,12,13,14,15,16,17,18,20,21,24,25,26,28,30,35,36,40,43,45,50,55,58,60,70,72,75,80,85,86,100,105,120,135,140,150,180,200,210,250,300,360,400,500,600,800,1000,1200,1700,2000];
const SORA_FNUMBERS = [0.95,1.0,1.1,1.2,1.4,1.6,1.8,2.0,2.2,2.5,2.8,3.2,3.5,4.0,4.5,5.0,5.6,6.3,7.1,8.0,9.0,10,11,13,14,16,18,20,22];

function soraSensor() { return SORA_SENSORS.find(s => s.key === appState.soraSensorKey) || SORA_SENSORS[1]; }
function soraFNumber() { return SORA_FNUMBERS[Math.max(0, Math.min(SORA_FNUMBERS.length - 1, appState.soraFNumberIdx))]; }

/** 実効フレーム: アスペクト比をセンサー(W×H mm)に内接させ {We,He} を返す */
/** カメラ位置(縦/横)を適用したアスペクト比の横/縦を返す(縦位置は横縦を入れ替え) */
function soraOrientedAspect() {
    const w = appState.soraAspectW > 0 ? appState.soraAspectW : 3;
    const h = appState.soraAspectH > 0 ? appState.soraAspectH : 2;
    return appState.soraOrient === 'portrait' ? { aw: h, ah: w } : { aw: w, ah: h };
}

function soraEffectiveFrame() {
    const s0 = soraSensor();
    // カメラ位置=縦のときはセンサー自体も回転する(水平/垂直画角が入れ替わる)
    const s = appState.soraOrient === 'portrait' ? { w: s0.h, h: s0.w } : s0;
    const { aw, ah } = soraOrientedAspect();
    const a = aw / ah;
    const sensorA = s.w / s.h;
    if (a >= sensorA) return { We: s.w, He: s.w / a };
    return { We: s.h * a, He: s.h };
}

/** フィッシュアイの実効パラメータ: uK=樽歪み係数, fovScale=画角拡大率(表示・カメラfovに連動) */
function soraFisheyeParams() {
    const s = Math.max(0, Math.min(100, Number(appState.soraFisheyeStrength) || 0));
    return { uK: 0.7 * s / 100, fovScale: 1 + 0.8 * s / 100 };
}

/** パノラマの実効水平画角(°)。soraPanoAov=0はレンズの水平画角に自動追従 */
function soraPanoEffAov(o) {
    const v = Number(appState.soraPanoAov) || 0;
    return Math.max(1, Math.min(360, v > 0 ? v : (o || soraComputeOptics()).aovH));
}

/** パノラマの画面アスペクト比 H:V。横=水平画角の弧長(円筒投影)、縦=垂直画角の透視投影 */
function soraPanoAspect(o) {
    const oo = o || soraComputeOptics();
    const vHalf = Math.min(89, oo.aovV / 2) * Math.PI / 180;
    return (soraPanoEffAov(oo) * Math.PI / 180) / (2 * Math.tan(vHalf));
}

/** 光学計算: 画角(水平/垂直/対角°)・過焦点距離・合焦近遠・被写界深度(m) */
function soraComputeOptics() {
    const f = appState.soraFocal, N = soraFNumber(), s = soraSensor();
    const { We, He } = soraEffectiveFrame();
    const aovH = 2 * Math.atan(We / (2 * f)) * 180 / Math.PI;
    const aovV = 2 * Math.atan(He / (2 * f)) * 180 / Math.PI;
    const aovD = 2 * Math.atan(Math.hypot(We, He) / (2 * f)) * 180 / Math.PI;
    const c = Math.hypot(s.w, s.h) / 1500;          // 許容錯乱円 mm
    const Hmm = f * f / (N * c) + f;                // 過焦点距離 mm
    const sMm = appState.soraFocusDist * 1000;      // ピント距離 mm
    const nearMm = Hmm * sMm / (Hmm + (sMm - f));
    const farMm = (sMm < Hmm) ? Hmm * sMm / (Hmm - (sMm - f)) : Infinity;
    const near = nearMm / 1000, far = (farMm === Infinity) ? Infinity : farMm / 1000;
    return { aovH, aovV, aovD, hyperfocal: Hmm / 1000, near, far, dof: (far === Infinity) ? Infinity : far - near };
}

function soraFmtM(v) {
    if (v === Infinity) return '∞';
    if (v >= 1000) return (v / 1000).toFixed(2) + 'km';
    if (v >= 10) return v.toFixed(0) + 'm';
    return v.toFixed(2) + 'm';
}

/** select の選択肢を生成 */
function soraPopulateSelects() {
    const ss = document.getElementById('input-sora-sensor');
    if (ss && !ss.options.length) SORA_SENSORS.forEach(s => { const o = document.createElement('option'); o.value = s.key; o.textContent = s.name; ss.appendChild(o); });
    const fs = document.getElementById('input-sora-focal-select');
    if (fs && !fs.options.length) SORA_FOCALS.forEach(f => { const o = document.createElement('option'); o.value = String(f); o.textContent = f + 'mm'; fs.appendChild(o); });
    const fn = document.getElementById('input-sora-fnum-select');
    if (fn && !fn.options.length) SORA_FNUMBERS.forEach((f, i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = 'F' + f; fn.appendChild(o); });
}

/** appState → フォーム値・算出表示を反映 (フォーカス中の入力は保護) */
function soraSyncUI() {
    const set = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };
    const txt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const chk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v; };
    set('input-sora-sensor', appState.soraSensorKey);
    set('input-sora-aspect-w', appState.soraAspectW);
    set('input-sora-aspect-h', appState.soraAspectH);
    set('input-sora-focal-text', appState.soraFocal);
    set('input-sora-focal-select', String(appState.soraFocal));
    set('input-sora-focal-slider', appState.soraFocal);
    txt('sora-focal-label', appState.soraFocal + 'mm');
    set('input-sora-ctrl-focal', appState.soraFocal);
    set('input-sora-ctrl-focal-text', appState.soraFocal);
    set('input-sora-ctrl-offset-az', Number(appState.soraOffsetAz).toFixed(4));
    set('input-sora-ctrl-offset-alt', Number(appState.soraOffsetAlt).toFixed(4));
    set('input-sora-fnum-select', String(appState.soraFNumberIdx));
    set('input-sora-fnum-slider', appState.soraFNumberIdx);
    txt('sora-fnum-label', 'F' + soraFNumber());
    set('input-sora-focus-slider', appState.soraFocusDist);
    txt('sora-focus-label', appState.soraFocusDist + 'm');
    chk('chk-sora-fisheye', appState.soraFisheye);
    set('input-sora-fisheye-slider', appState.soraFisheyeStrength);
    const orientR = document.querySelector(`input[name="sora-orient"][value="${appState.soraOrient}"]`);
    if (orientR) orientR.checked = true;
    const shapeR = document.querySelector(`input[name="sora-fisheye-shape"][value="${appState.soraFisheyeShape}"]`);
    if (shapeR) shapeR.checked = true;
    chk('chk-sora-peaking', appState.soraPeaking);
    chk('chk-sora-traj', appState.soraTraj);
    chk('chk-sora-center', appState.soraCenterCross);
    chk('chk-sora-target', appState.soraTargetCross);
    chk('chk-sora-search-center', appState.soraSearchCenter);
    set('input-sora-base-az', Number(appState.soraBaseAz).toFixed(4));
    set('input-sora-base-alt', Number(appState.soraBaseAlt).toFixed(4));
    set('input-sora-offset-az', Number(appState.soraOffsetAz).toFixed(4));
    set('input-sora-offset-alt', Number(appState.soraOffsetAlt).toFixed(4));
    updateOffsetDistances();   // 辻オフセット群(宙の窓/ctrlのコピー含む)を反映
    set('input-sora-range', appState.soraViewRange);
    set('input-sora-range-slider', appState.soraViewRange);
    const o = soraComputeOptics();
    const fe = appState.soraFisheye ? soraFisheyeParams().fovScale : 1;
    const aov = x => Math.min(180, x * fe).toFixed(1);
    txt('sora-aov', 'H:' + aov(o.aovH) + '° V:' + aov(o.aovV) + '° D:' + aov(o.aovD) + '°');
    txt('sora-fisheye-label', (Number(appState.soraFisheyeStrength) || 0) + '%');
    chk('chk-sora-panorama', appState.soraPanorama);
    const panoAov = soraPanoEffAov(o);
    set('input-sora-pano-slider', Math.round(panoAov));
    const panoAsp = soraPanoAspect(o);
    txt('sora-pano-label', 'H:V=' + (panoAsp >= 9.95 ? String(Math.round(panoAsp)) : panoAsp.toFixed(1)) + ':1 H:' + Math.round(panoAov) + '°');
    set('input-sora-mw-bright', appState.soraMwBrightness);
    txt('sora-mw-bright-label', (Number(appState.soraMwBrightness) || 0) + '%');
    set('input-sora-elevshade', appState.soraElevShade);
    txt('sora-elevshade-label', (Number(appState.soraElevShade) || 0) + '%');
    set('input-sora-sunshade', appState.soraSunShade);
    txt('sora-sunshade-label', (Number(appState.soraSunShade) || 0) + '%');
    set('input-sora-mov-interval', appState.soraMovInterval);
    set('input-sora-mov-shots', appState.soraMovShots);
    set('sel-sora-mov-fps', String(appState.soraMovFps));
    set('sel-sora-mov-step', String(appState.soraMovDispStep));
    set('input-sora-mov-mb', appState.soraMovImgMb);
    soraMovSyncUI();
    const pmR = document.querySelector(`input[name="sora-mov-playmode"][value="${appState.soraMovPlayMode}"]`);
    if (pmR) pmR.checked = true;
    const expR = document.querySelector(`input[name="sora-exp-format"][value="${appState.soraExpFormat}"]`);
    if (expR) expR.checked = true;
    // 出力サイズはプレビューのアスペクト比に常時追従(縦は横から再計算)
    const expAsp = appState.soraPanorama ? soraPanoAspect(o) : soraOrientedAspect().aw / soraOrientedAspect().ah;
    appState.soraExpH = Math.max(1, Math.min(8192, Math.round(appState.soraExpW / expAsp)));
    set('input-sora-exp-w', appState.soraExpW);
    set('input-sora-exp-h', appState.soraExpH);
    txt('sora-hyperfocal', soraFmtM(o.hyperfocal));
    txt('sora-focus-range', soraFmtM(o.near) + ' 〜 ' + soraFmtM(o.far));
    txt('sora-dof', o.dof === Infinity ? '∞' : soraFmtM(o.dof));
}

/** 観測点・目的点から 基準方位角/視高度・視界範囲既定 を算出 (辻検索とは非連動)。位置変化時のみ */
function soraUpdateBaseFromPoints() {
    const posKey = `${appState.start.lat},${appState.start.lng},${appState.start.elev}|${appState.end.lat},${appState.end.lng},${appState.end.elev}`;
    if (posKey === appState._soraLastPosKey) return;
    appState._soraLastPosKey = posKey;
    const dist = getDistanceWGS84(appState.start.lat, appState.start.lng, appState.end.lat, appState.end.lng);
    appState.soraBaseAz = calculateBearing(appState.start.lat, appState.start.lng, appState.end.lat, appState.end.lng);
    appState.soraBaseAlt = calculateApparentAltitude(dist, appState.start.elev, appState.end.elev, appState.start.lat, appState.end.lat);
    appState.soraViewRange = Math.max(1, Math.min(300, Math.ceil(dist / 1000)));   // 相手距離kmを切り上げ(0km〜この範囲)
    appState.soraFocusDist = Math.max(0, Math.min(300000, Math.ceil(dist / 1000) * 1000));   // 合焦距離の初期値=相手距離(km切り上げ→m)
    saveAppState();
    soraSyncUI();
}

// --- インターバルMov (タイムラプス再生シミュレーション) ---
let _movTimer = null, _movEndMs = 0;

/** 秒数 → "HH:MM:SS" (時は2桁パディング・24時間超も可) */
function soraMovFmtHMS(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return `${('00' + h).slice(-2)}:${('00' + m).slice(-2)}:${('00' + s).slice(-2)}`;
}

/** インターバルMovの算出表示(撮影時間・撮影終了日時・再生時間・総画像容量)を更新 */
function soraMovSyncUI() {
    const durEl = document.getElementById('sora-mov-duration');
    if (!durEl) return;
    const iv = Math.max(0.5, Number(appState.soraMovInterval) || 15);
    const n = Math.max(1, Math.round(Number(appState.soraMovShots) || 1));
    const durSec = iv * n;
    durEl.textContent = soraMovFmtHMS(durSec);
    // 撮影開始日時 = 現在の日時情報(再生はここから始まる)
    const sEl = document.getElementById('sora-mov-start');
    if (sEl) {
        const d0 = appState.currentDate, q2 = v => ('00' + v).slice(-2);
        sEl.textContent = `${d0.getFullYear()}/${q2(d0.getMonth() + 1)}/${q2(d0.getDate())} ${q2(d0.getHours())}:${q2(d0.getMinutes())}:${q2(d0.getSeconds())}`;
    }
    // 再生中は開始時に確定した終了日時を、停止中は現在日時+撮影時間を表示
    const endMs = _movTimer ? _movEndMs : appState.currentDate.getTime() + durSec * 1000;
    const e = new Date(endMs);
    const p2 = v => ('00' + v).slice(-2);
    document.getElementById('sora-mov-end').textContent =
        `${e.getFullYear()}/${p2(e.getMonth() + 1)}/${p2(e.getDate())} ${p2(e.getHours())}:${p2(e.getMinutes())}:${p2(e.getSeconds())}`;
    document.getElementById('sora-mov-playtime').textContent = soraMovFmtHMS(n / (Number(appState.soraMovFps) || 30));
    const gb = n * (Number(appState.soraMovImgMb) || 140) / 1024;
    document.getElementById('sora-mov-total').value = gb >= 10 ? String(Math.round(gb)) : gb.toFixed(2);   // 単位はラベル(GB)側に表示
}

// --- 再生(インターバルMov): 日時情報メニューと切り離した別処理 ---
// ワーカープールでフレーム毎の天体位置・空の基底を事前計算してキューに積み、
// 再生タイマーはデキューして ①天体(位置/視半径/月相) ②軌跡(日替わりのみ) ③空・星座線/領域(回転) を動かすだけ。
// appState.currentDate は再生中も変更しない(辻ライン・地図・メニューの再計算は発生しない)。
let _movQueue = [], _movFilled = 0, _movPlayIdx = 0, _movGen = 0, _movPlaying = false;
let _smMovPool = null;
function _smMovPoolEnsure() {
    if (_smMovPool) return _smMovPool;
    const n = Math.max(1, Math.min(4, navigator.hardwareConcurrency || 4));
    const workers = [];
    for (let i = 0; i < n; i++) workers.push(new Worker('sora-mov-worker.js'));
    _smMovPool = { workers, idle: [...workers], queue: [] };
    return _smMovPool;
}
function _smMovRunOnWorker(worker, task) {
    const handler = (e) => {
        worker.removeEventListener('message', handler);
        task.resolve(e.data || { frames: [] });
        if (_smMovPool.queue.length > 0) _smMovRunOnWorker(worker, _smMovPool.queue.shift());
        else _smMovPool.idle.push(worker);
    };
    worker.addEventListener('message', handler);
    worker.postMessage(task.message);
}
function _smMovPoolRun(message) {
    const pool = _smMovPoolEnsure();
    return new Promise(resolve => {
        const task = { message, resolve };
        if (pool.idle.length > 0) _smMovRunOnWorker(pool.idle.pop(), task);
        else pool.queue.push(task);
    });
}

/** キューのフレームデータから表示天体スプライト群を再構築(メインスレッドでの天文計算なし) */
function _smApplyMovBodies(frame, metas) {
    if (!_smBodiesGrp) return;
    while (_smBodiesGrp.children.length) { const c = _smBodiesGrp.children.pop(); if (c.material) c.material.dispose(); }
    const fovV = (_smCamera ? _smCamera.fov : 40) * Math.PI / 180;
    const cs = _SM_CROSS_PX * 2 * Math.tan(fovV / 2) / _smFinderH;
    metas.forEach((m, i) => {
        const fb = frame.bodies[i];
        if (!fb) return;
        const pos = _smDir(fb.az, fb.alt).multiplyScalar(_SM_BODY_R);
        if (m.id === 'Moon' && fb.phase !== undefined) {
            const tex = _smCanvasTex(`moon_${fb.phase.toFixed(2)}_${fb.waxing}`, (c2, s) => _smDrawMoon(c2, s, fb.phase, fb.waxing), 128);
            const r = _SM_BODY_R * Math.tan(Math.max(fb.angR, 0.08) * Math.PI / 180);
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true, depthWrite: false }));
            sp.scale.set(2 * r, 2 * r, 1); sp.position.copy(pos); _smBodiesGrp.add(sp);
        } else if (fb.angR > 0) {
            const r = _SM_BODY_R * Math.tan(fb.angR * Math.PI / 180);
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: _smDiskTex(m.color), transparent: true, opacity: 0.55, depthTest: true, depthWrite: false }));
            sp.scale.set(2 * r, 2 * r, 1); sp.position.copy(pos); _smBodiesGrp.add(sp);
        }
        const cross = new THREE.Sprite(new THREE.SpriteMaterial({ map: _smCrossTex(m.color), transparent: true, depthTest: true, depthWrite: false, sizeAttenuation: false }));
        cross.scale.set(cs, cs, 1); cross.position.copy(pos.clone().multiplyScalar(0.9999)); _smBodiesGrp.add(cross);
    });
    // 目的点マーカー(赤十字)は固定方向なので毎フレーム同じ
    _smAddTargetMarkers(cs);
}

/** 再生中の天の川の環: EQJ座標の等価な環+基準点方位線を空と同回転のグループに置き、毎フレームの再計算なしで追従させる。
 *  (環と写真は表示天体「天の川」の表現そのものなので、表示天体オンの間は再生中も表示し続ける) */
let _smMovRingGrp = null;
function _smMovRingSetup() {
    _smMovRingTeardown();
    const mw = appState.bodies.find(b => b.id === 'MilkyWay');
    if (!(mw && mw.visible) || !_smEqjGrp) return;
    const R = _SM_SKY_R * 0.99;
    const grp = new THREE.Group();
    const pts = [];
    for (let l = 0; l <= 360; l += 4) {
        const eq = galacticToEquatorial(l, 0);
        const v = _mwEquVec(eq.ra, eq.dec);
        pts.push(new THREE.Vector3(v[0] * R, v[1] * R, v[2] * R));
    }
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })));
    const rd = getFixedStarRaDec('MilkyWay');
    const bv = _mwEquVec(rd.ra, rd.dec);
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(bv[0] * R, bv[1] * R, bv[2] * R)]),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })));
    _smMovRingGrp = grp;
    _smEqjGrp.add(grp);
    if (_smMwRingGrp) _smMwRingGrp.visible = false;   // ENU版と入れ替え(停止時に復元)
}
function _smMovRingTeardown() {
    if (_smMovRingGrp && _smEqjGrp) {
        _smEqjGrp.remove(_smMovRingGrp);
        _smMovRingGrp.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material && c.material.dispose) c.material.dispose(); });
    }
    _smMovRingGrp = null;
    if (_smMwRingGrp) _smMwRingGrp.visible = true;
}

/** 再生トグル: 再生オプションで ①アニメーション(表示間隔サンプリング) / ②動画(MP4/WebM)生成→プレビュー上で再生 を切替。
 *  ①はワーカーで事前計算したキューをデキューして、プレビュー内の①天体②軌跡③空・星座線/領域だけを動かす */
function soraMovTogglePlay() {
    if (_movTimer || _movVideo || (_expVideo && _expVideo.owner === 'play')) { soraMovStop(); return; }
    if (!appState.isSoramadoActive || !_smInited || _smFailed) { alert('宙の窓のプレビューを表示してから再生してください。'); return; }
    if (appState.soraMovPlayMode === 'video') { soraMovPlayVideo(); return; }
    const iv = Math.max(0.5, Number(appState.soraMovInterval) || 15);
    const shots = Math.max(1, Math.round(Number(appState.soraMovShots) || 1));
    const fps = Number(appState.soraMovFps) || 30;
    const dispStep = Number(appState.soraMovDispStep) || 0.3;
    // 再生コマ数は「再生時間(=撮影回数÷fps)÷表示間隔」だけ。全撮影コマは再生しない(動画を表示間隔で間引いたプレビュー)。
    const playSec = shots / fps;
    const n = Math.max(1, Math.ceil(playSec / dispStep - 1e-9));
    const shotIdx = [];   // 表示コマk → 撮影コマ番号(動画時刻 k×表示間隔 のフレーム)
    for (let k = 0; k < n; k++) shotIdx.push(Math.min(shots - 1, Math.round(k * dispStep * fps)));
    const startMs = appState.currentDate.getTime();
    _movEndMs = startMs + iv * shots * 1000;
    const gen = ++_movGen;
    // 表示天体のメタ情報(固定天体はRA/Dec、惑星等は半径kmを渡してワーカー側で視半径まで計算)
    const metas = appState.bodies.filter(b => b.visible).map(b => {
        const m = { id: b.id, color: b.color || '#DDA0DD' };
        if (b.id === 'MilkyWay') { const rd = getFixedStarRaDec('MilkyWay'); m.fixed = true; m.ra = rd.ra; m.dec = rd.dec; }
        else if (isFixedStar(b.id)) { const rd = getFixedStarRaDec(b.id); m.fixed = true; m.ra = rd.ra; m.dec = rd.dec; }
        else m.radiusKm = BODY_RADIUS_KM[b.id] || 0;
        return m;
    });
    // サンプリングした再生コマだけをチャンクに分けてワーカープールへ事前計算を依頼(結果はコマ順のキューへ)
    _movQueue = new Array(n);
    _movFilled = 0;
    _movPlayIdx = 0;
    const wBodies = metas.map(m => ({ id: m.id, fixed: !!m.fixed, ra: m.ra, dec: m.dec, radiusKm: m.radiusKm || 0 }));
    const obs = { lat: appState.start.lat, lng: appState.start.lng, elev: appState.start.elev };
    const CH = 120;
    for (let off = 0; off < n; off += CH) {
        const frames = [];
        for (let f = off; f < Math.min(n, off + CH); f++) frames.push(startMs + shotIdx[f] * iv * 1000);
        _smMovPoolRun({ reqId: `${gen}_${off}`, off, frames, bodies: wBodies, observer: obs, refraction: appState.refractionEnabled })
            .then(res => {
                if (gen !== _movGen) return;   // 停止済みの世代は破棄
                (res.frames || []).forEach((fr, i) => { _movQueue[res.off + i] = fr; });
                _movFilled += (res.frames || []).length;
            });
    }
    _movPlaying = true;
    _smMovRingSetup();
    const btn = document.getElementById('btn-sora-mov-play');
    if (btn) { btn.classList.add('active'); btn.textContent = '停止'; }
    const p2 = v => ('00' + v).slice(-2);
    const stepMs = Math.max(50, (Number(appState.soraMovDispStep) || 0.3) * 1000);
    _movTimer = setInterval(() => {
        if (gen !== _movGen) return;
        if (_movPlayIdx >= n) { soraMovStop(); return; }
        const fr = _movQueue[_movPlayIdx];
        if (!fr) { soraExpProgress(`再生準備中… (${_movFilled}/${n}コマ計算済み)`); return; }   // 未計算フレームは待つ
        _movPlayIdx++;
        if (fr.sky) {
            const ra = _smDir(fr.sky.rx.az, fr.sky.rx.alt), rb = _smDir(fr.sky.rz.az, fr.sky.rz.alt);
            _smSetSkyBasis([ra.x, ra.y, ra.z], [rb.x, rb.y, rb.z]);   // 空・星座線/領域・環が一括で回転
        }
        _smApplyMovBodies(fr, metas);        // 天体(位置・視半径・月相)
        _smBuildTraj(new Date(fr.t));        // 軌跡は日替わり時のみ内部キャッシュで再構築
        const d = new Date(fr.t);
        soraExpProgress(`再生中 ${_movPlayIdx}/${n} (${d.getFullYear()}/${p2(d.getMonth() + 1)}/${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())})`);
        drawSoramado();   // 再生中はレンダリングのみ(シーン更新はキュー側で完了済み)
    }, stepMs);
    soraMovSyncUI();
}

function soraMovStop() {
    if (_movTimer) { clearInterval(_movTimer); _movTimer = null; }
    if (_expVideo && _expVideo.owner === 'play') soraExportCancel();   // 再生用の動画生成中なら中止
    if (_movVideo) {   // 動画再生のオーバーレイを片付け
        if (_movVideo.el && _movVideo.el.parentElement) _movVideo.el.parentElement.removeChild(_movVideo.el);
        if (_movVideo.url) { try { URL.revokeObjectURL(_movVideo.url); } catch (_) {} }
        _movVideo = null;
    }
    _movGen++;            // 事前計算の未着チャンクを破棄
    _movPlaying = false;
    _movQueue = [];
    _smMovRingTeardown();
    soraExpProgress(null);
    const btn = document.getElementById('btn-sora-mov-play');
    if (btn) { btn.classList.remove('active'); btn.textContent = '再生'; }
    soraMovSyncUI();
    if (appState.isSoramadoActive && !_smFailed) drawSoramado();   // 現在の日時情報の表示へ復帰
}

// --- 書き出し (静止画JPEG/PNG・動画H.265/H.264) ---
let _expVideo = null;   // 動画書き出し中の状態 {recorder, timer, canceled, startDate}

/** 右下クレジット文字列: 「YYYY/MM/DD hh:mm:ss © 出力年 宙の辻 - Sora no Tsuji」 */
function soraExpCredit(d) {
    const p2 = v => ('00' + v).slice(-2);
    return `${d.getFullYear()}/${p2(d.getMonth() + 1)}/${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}` +
        ` © ${new Date().getFullYear()} 宙の辻 - Sora no Tsuji`;
}

/** プレビューを w×h でオフスクリーン描画し、右下に日時＋クレジットを載せた2Dキャンバスを返す。
 *  drawSoramadoと同じ 通常/パノラマ(ストリップ)/フィッシュアイ 分岐。canvas2d を渡すと再利用(動画フレーム用)。 */
function _smComposeFrame(w, h, canvas2d) {
    if (!_smInited || _smFailed || !_smRenderer) return null;
    const o = soraComputeOptics();
    const az = Number(appState.soraBaseAz) + Number(appState.soraOffsetAz);
    const alt = Number(appState.soraBaseAlt) + Number(appState.soraOffsetAlt);
    const pano = appState.soraPanorama;
    const panoAov = pano ? soraPanoEffAov(o) : 0;
    const _fe = (!pano && appState.soraFisheye) ? soraFisheyeParams() : null;
    // 画面固定pxの十字などが出力解像度に合うよう、ファインダー寸法を一時差し替えてシーンを再構築
    const savedW = _smFinderW, savedH = _smFinderH;
    _smFinderW = w; _smFinderH = h;
    // 文字(表示天体名・星座名称)が出力サイズに比例してプレビューと同じ相対サイズになるよう倍率を設定
    _smLabelScaleX = h / Math.max(1, savedH);
    if (_smSkyMat && _smSkyMat.userData.uMwBlack) {
        const mwb = Number(appState.soraMwBrightness);
        _smSkyMat.userData.uMwBlack.value = 1 - Math.max(0, Math.min(100, isNaN(mwb) ? 100 : mwb)) / 100;
    }
    const allsky = !!_fe && _smAllSkyOn();   // 歪み100%+円形: 等距離射影の全天表示
    if (allsky) {
        _smSetAllSkyBasis(az, alt);   // 画面中心=カメラの向き
        // 画面固定サイズのスプライトが出力でも同じ見た目になるよう実効fovを設定(プレビューと同式)
        const allskyR = Math.min(w, h) / 2;
        _smCamera.fov = 2 * Math.atan(Math.PI * h / (4 * allskyR)) * 180 / Math.PI;
    } else {
        _smCamera.fov = Math.max(1, Math.min(170, o.aovV * (_fe ? _fe.fovScale : 1)));
    }
    _smCamera.up.set(0, 0, 1);
    _smCamera.position.set(0, 0, 0);
    _smCamera.lookAt(_smDir(az, alt));
    _smUpdateSky();
    _smBuildBodies();
    _smBuildTraj();
    _smUpdateMilkyWayRing();
    _smUpdateTerrain();
    _smEnsureConstNames();
    _smUpdateConstNames({ w, h });   // 星座名称のサイズ/向きを出力解像度・投影に合わせて更新
    const rt = new THREE.WebGLRenderTarget(w, h);
    rt.texture.colorSpace = THREE.SRGBColorSpace;
    _smRenderer.setRenderTarget(rt);
    _smRenderer.setClearColor(0x0a0e1a, 1);
    if (pano) {
        const nStrips = Math.max(1, Math.ceil(panoAov / 10));
        const stripDeg = panoAov / nStrips;
        const stripAspect = Math.tan(stripDeg * Math.PI / 360) / Math.tan(_smCamera.fov * Math.PI / 360);
        _smRenderer.setScissorTest(true);
        for (let i = 0; i < nStrips; i++) {
            const px0 = Math.round(w * i / nStrips), px1 = Math.round(w * (i + 1) / nStrips);
            if (px1 <= px0) continue;
            const sAz = az - panoAov / 2 + (i + 0.5) * stripDeg;
            _smCamera.aspect = stripAspect;
            _smCamera.lookAt(_smDir(sAz, alt));
            _smCamera.updateProjectionMatrix();
            _smRenderer.setViewport(px0, 0, px1 - px0, h);
            _smRenderer.setScissor(px0, 0, px1 - px0, h);
            _smRenderer.clear(true, true, true);
            _smRenderer.render(_smScene, _smCamera);
        }
        _smRenderer.setScissorTest(false);
    } else if (allsky && _smRenderAllSkyCube(w / h, Math.min(w, h) / 2)) {
        // 真の魚眼(等距離射影)の全天表示: キューブ全方位レンダ→等距離射影クアッドを出力RTへ
        _smRenderer.setRenderTarget(rt);
        _smRenderer.clear(true, true, true);
        _smRenderer.render(_smAllSkyScene, _smAllSkyCam);
    } else if (_fe && _smPostMat) {
        _smCamera.aspect = w / h;
        _smCamera.updateProjectionMatrix();
        _smPostMat.uniforms.uK.value = _fe.uK;
        _smPostMat.uniforms.uCircle.value = appState.soraFisheyeShape === 'circle' ? 1.0 : 0.0;
        _smPostMat.uniforms.uAspect.value = w / h;
        _smRT.setSize(w, h);
        _smRenderer.setRenderTarget(_smRT);
        _smRenderer.clear(true, true, true);
        _smRenderer.render(_smScene, _smCamera);
        _smRenderer.setRenderTarget(rt);
        _smRenderer.clear(true, true, true);
        _smRenderer.render(_smPostScene, _smPostCam);
    } else {
        _smCamera.aspect = w / h;
        _smCamera.updateProjectionMatrix();
        _smRenderer.setViewport(0, 0, w, h);
        _smRenderer.clear(true, true, true);
        _smRenderer.render(_smScene, _smCamera);
    }
    const buf = new Uint8Array(w * h * 4);
    _smRenderer.readRenderTargetPixels(rt, 0, 0, w, h, buf);
    _smRenderer.setRenderTarget(null);
    rt.dispose();
    _smFinderW = savedW; _smFinderH = savedH;
    _smLabelScaleX = 1;
    // 上下反転(WebGLは下原点)して2Dキャンバスへ → 右下クレジット
    const cv2 = canvas2d || document.createElement('canvas');
    if (cv2.width !== w) cv2.width = w;
    if (cv2.height !== h) cv2.height = h;
    const ctx = cv2.getContext('2d');
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) img.data.set(buf.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    ctx.putImageData(img, 0, 0);
    const fs = Math.max(9, Math.round(h / 40));
    ctx.font = `${fs}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = Math.max(1, Math.round(fs / 6));
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    const credit = soraExpCredit(appState.currentDate);
    ctx.strokeText(credit, w - Math.round(fs * 0.6), h - Math.round(fs * 0.5));
    ctx.fillText(credit, w - Math.round(fs * 0.6), h - Math.round(fs * 0.5));
    return cv2;
}

function soraExpProgress(text) {
    const el = document.getElementById('soramado-export-progress');
    if (!el) return;
    if (text === null) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.textContent = text;
}

function soraExportDownload(blob, ext) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soranotsuji-宙の窓-${formatFileDateTime()}.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** ファイル出力ボタン: 形式ラジオで静止画/動画に振り分け。動画実行中は中止 */
function soraExportRun() {
    if (_expVideo && _expVideo.owner === 'export') { soraExportCancel(); return; }
    if (_expVideo) { alert('再生用の動画を生成中です。停止してから実行してください。'); return; }
    if (!appState.isSoramadoActive || !_smInited || _smFailed) { alert('宙の窓のプレビューを表示してから実行してください。'); return; }
    const fmt = appState.soraExpFormat;
    if (fmt === 'jpeg' || fmt === 'png') soraExportStill(fmt);
    else soraExportVideo(fmt);
}

function soraExportStill(fmt) {
    if (!confirm(`現在のプレビューを${fmt === 'png' ? 'PNG' : 'JPEG'}画像(${appState.soraExpW}×${appState.soraExpH}px)で書き出します。よろしいですか?`)) return;
    soraExpProgress('画像を書き出し中…');
    const cv = _smComposeFrame(appState.soraExpW, appState.soraExpH);
    drawSoramado();   // 画面表示を元の解像度で復元
    if (!cv) { soraExpProgress(null); alert('画像の生成に失敗しました。'); return; }
    cv.toBlob(blob => {
        soraExpProgress(null);
        if (!blob) { alert('画像の生成に失敗しました。'); return; }
        soraExportDownload(blob, fmt === 'png' ? 'png' : 'jpg');
    }, fmt === 'png' ? 'image/png' : 'image/jpeg', 0.92);
}

/** 選択形式のMIME候補。h264=H.264のMP4(非対応はWebMへ)、webm=H.264のWebM(非対応はVP9等のWebMへ) */
function soraExpPickMime(fmt) {
    if (typeof MediaRecorder === 'undefined') return null;
    const wanted = fmt === 'webm'
        ? ['video/webm;codecs=h264']
        : ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.42E01E'];
    const fallback = fmt === 'webm'
        ? ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
        : ['video/webm;codecs=h264', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (const m of wanted) { try { if (MediaRecorder.isTypeSupported(m)) return { mime: m, fellBack: false }; } catch (_) {} }
    for (const m of fallback) { try { if (MediaRecorder.isTypeSupported(m)) return { mime: m, fellBack: true }; } catch (_) {} }
    return null;
}

/** インターバルMovの全コマをフレームレートで実時間録画する共通部(書き出し/再生オプション②で共用)。
 *  完了(または中止)で onDone(blob|null) を呼ぶ。中止は soraExportCancel。開始できなければ false を返す */
function _soraRecordMovVideo(picked, w, h, owner, label, onDone) {
    const iv = Math.max(0.5, Number(appState.soraMovInterval) || 15);
    const n = Math.max(1, Math.round(Number(appState.soraMovShots) || 1));
    const fps = Number(appState.soraMovFps) || 30;
    const cv2 = document.createElement('canvas');
    cv2.width = w; cv2.height = h;
    const stream = cv2.captureStream();
    let recorder;
    try {
        recorder = new MediaRecorder(stream, { mimeType: picked.mime, videoBitsPerSecond: Math.min(5e7, Math.max(1e6, w * h * fps * 0.15)) });
    } catch (e) { alert('動画の生成を開始できませんでした: ' + e.message); return false; }
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };
    const startDate = new Date(appState.currentDate.getTime());
    _expVideo = { recorder, timer: null, canceled: false, startDate, owner };
    recorder.onstop = () => {
        const st = _expVideo;
        _expVideo = null;
        soraExpProgress(null);
        // 日時をシミュレーション開始時点へ復元
        appState.currentDate = new Date(startDate.getTime());
        syncUIFromState();
        updateAll();
        onDone(st && st.canceled ? null : new Blob(chunks, { type: picked.mime.split(';')[0] }));
    };
    let f = 0;
    recorder.start();
    _expVideo.timer = setInterval(() => {
        if (!_expVideo) return;
        if (f >= n) {
            clearInterval(_expVideo.timer);
            _expVideo.recorder.stop();
            return;
        }
        appState.currentDate = new Date(startDate.getTime() + f * iv * 1000);
        _smComposeFrame(w, h, cv2);
        soraExpProgress(`${label} ${f + 1}/${n}`);
        f++;
    }, 1000 / fps);
    return true;
}

/** 動画書き出し: インターバルMovの全コマをフレームレートで実時間録画(キャンバスストリーム+MediaRecorder) */
function soraExportVideo(fmt) {
    const picked = soraExpPickMime(fmt);
    if (!picked) { alert('このブラウザは動画の書き出しに対応していません。'); return; }
    const w = appState.soraExpW, h = appState.soraExpH;
    const n = Math.max(1, Math.round(Number(appState.soraMovShots) || 1));
    const fps = Number(appState.soraMovFps) || 30;
    const durSec = Math.ceil(n / fps);
    const codecName = fmt === 'webm' ? 'H.264(WebM)' : 'H.264(MP4)';
    const msg = (picked.fellBack
        ? (fmt === 'webm' ? 'お使いのブラウザはH.264のWebM書き出しに対応していないため、VP9等のWebM形式で出力します。\n'
                          : `お使いのブラウザは${codecName}での書き出しに対応していないため、WebM形式で出力します。\n`)
        : '') +
        `インターバルMovの${n}コマを動画(${w}×${h}px, ${fps}fps)で書き出します。\n約${durSec}秒かかります(実時間で録画します)。よろしいですか?`;
    if (!confirm(msg)) return;
    if (_movTimer || _movVideo) soraMovStop();   // 再生中なら停止してから
    const btn = document.getElementById('btn-sora-export');
    const ok = _soraRecordMovVideo(picked, w, h, 'export', '書き出し中', blob => {
        if (btn) { btn.classList.remove('active'); btn.textContent = 'ファイル出力'; }
        if (!blob) return;   // 中止時は破棄
        if (blob.size > 0) soraExportDownload(blob, picked.mime.includes('mp4') ? 'mp4' : 'webm');
        else alert('動画の生成に失敗しました。');
    });
    if (ok && btn) { btn.classList.add('active'); btn.textContent = '中止'; }
}

/** 再生オプション②: インターバルMovをMP4(非対応はWebM)で生成し、プレビュー画面の上に重ねて動画再生する */
let _movVideo = null;   // 再生中のオーバーレイ {el, url}
function soraMovPlayVideo() {
    const picked = soraExpPickMime('h264');   // MP4優先→非対応ブラウザはWebMへ自動フォールバック(確認なし)
    if (!picked) { alert('このブラウザは動画の生成に対応していません。'); return; }
    if (_expVideo) { alert('動画の書き出し中です。完了または中止してから再生してください。'); return; }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(2, Math.round(_smFinderW * dpr)), h = Math.max(2, Math.round(_smFinderH * dpr));
    const btn = document.getElementById('btn-sora-mov-play');
    const ok = _soraRecordMovVideo(picked, w, h, 'play', '動画生成中', blob => {
        if (!blob || blob.size === 0) { soraMovStop(); if (blob) alert('動画の生成に失敗しました。'); return; }
        const el = document.createElement('video');
        el.id = 'soramado-movplay-video';
        el.muted = true; el.playsInline = true; el.autoplay = true;
        el.src = URL.createObjectURL(blob);
        el.addEventListener('ended', () => soraMovStop());   // 再生し終えたら自動停止(プレビュー表示へ復帰)
        const view = document.getElementById('soramado-view');
        if (view) view.appendChild(el);
        _movVideo = { el, url: el.src };
        drawSoramado();   // ファインダー矩形と同サイズに追従させる
        el.play().catch(() => {});
    });
    if (ok && btn) { btn.classList.add('active'); btn.textContent = '停止'; }
}

/** 動画書き出しの中止(出力は破棄)。パネルクローズ時も呼ばれる */
function soraExportCancel() {
    if (!_expVideo) return;
    _expVideo.canceled = true;
    clearInterval(_expVideo.timer);
    _expVideo.recorder.stop();
}

/** 各コントロールのイベント登録 */
// --- 基本オプションメニュー ---
/** 基本オプションのUI同期(状態→フォーム)。オフセット中心角は辻検索メニュー・My辻検索行とも連動 */
function syncBaseOptionUI() {
    const r = document.querySelector(`input[name="baseopt-mw-base"][value="${appState.baseOptMwBase}"]`);
    if (r) r.checked = true;
    const set = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };
    set('input-baseopt-mw-offset', appState.mwOffsetAngle);
    set('input-tsuji-mw-offset', appState.mwOffsetAngle);
    set('input-tsujimesh-mw-offset', appState.mwOffsetAngle);
    set('input-baseopt-elev-exclude', appState.elevExcludeRadius);
    const chk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v; };
    chk('chk-baseopt-mw-bodies', appState.mwShowBodies);
    chk('chk-baseopt-mw-body-names', appState.mwShowBodyNames);
    chk('chk-baseopt-const-fig', appState.mwShowConstFig);
    chk('chk-baseopt-const-bounds', appState.mwShowConstBounds);
    chk('chk-baseopt-const-names', appState.mwShowConstNames);
    // 宙の窓メニュー側のチェックボックス(基本オプションと連動・同じ状態を共有)
    chk('chk-sora-mw-body-names', appState.mwShowBodyNames);
    chk('chk-sora-const-fig', appState.mwShowConstFig);
    chk('chk-sora-const-bounds', appState.mwShowConstBounds);
    chk('chk-sora-const-names', appState.mwShowConstNames);
    const lsSlider = document.getElementById('input-sora-label-scale');
    if (lsSlider) lsSlider.value = appState.soraLabelScale;
    const lsVal = document.getElementById('sora-label-scale-val');
    if (lsVal) lsVal.textContent = `${appState.soraLabelScale}%`;
    const sortSel = document.getElementById('sel-baseopt-const-sort');
    if (sortSel) sortSel.value = appState.mwConstNameSort;
    // My辻検索行のオフセット中心角は行ごとに独立(基本オプションとは連動しないため、ここでは上書きしない)
}

/** 天の川の基準点/オフセット中心角の変更を全機能へ反映(天体詳細・辻ライン・辻検索・全天儀・宙の窓) */
function applyMilkyWayBaseChange() {
    saveAppState();
    syncBaseOptionUI();
    updateAll();
    _mwUpdateBaseOptions();
    if (appState.isSoramadoActive && !_smFailed) drawSoramado();
}

function setupBaseOptionControls() {
    document.querySelectorAll('input[name="baseopt-mw-base"]').forEach(r => {
        r.addEventListener('change', () => { if (r.checked) { appState.baseOptMwBase = r.value; applyMilkyWayBaseChange(); } });
    });
    const offsetHandler = (el) => {
        if (!el) return;
        el.addEventListener('change', () => {
            let v = parseFloat(el.value);
            if (isNaN(v)) v = 0;
            appState.mwOffsetAngle = Math.max(-360, Math.min(360, v));
            appState.baseOptMwBase = 'offset';   // 角度を編集したら基準点を自動でオフセット点へ(編集が即反映されるように)
            applyMilkyWayBaseChange();
        });
    };
    offsetHandler(document.getElementById('input-baseopt-mw-offset'));
    offsetHandler(document.getElementById('input-tsuji-mw-offset'));
    offsetHandler(document.getElementById('input-tsujimesh-mw-offset'));
    // My辻検索行のオフセット中心角は行ごとに独立(基本オプションとは連動しない)。行内のonChangeで登録する
    const chkHandler = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => {
            appState[key] = el.checked;
            saveAppState();
            syncBaseOptionUI();   // 基本オプションと宙の窓メニューの両方のチェック状態を再同期(双方向連動)
            _mwUpdateBaseOptions();
            if (appState.isSoramadoActive && !_smFailed) drawSoramado();   // 星座線/領域・表示天体は宙の窓にも反映
        });
    };
    chkHandler('chk-baseopt-mw-bodies', 'mwShowBodies');
    chkHandler('chk-baseopt-mw-body-names', 'mwShowBodyNames');
    chkHandler('chk-baseopt-const-fig', 'mwShowConstFig');
    chkHandler('chk-baseopt-const-bounds', 'mwShowConstBounds');
    chkHandler('chk-baseopt-const-names', 'mwShowConstNames');
    // 宙の窓メニュー側のチェックボックス(基本オプションと同じキーを共有=双方向連動)
    chkHandler('chk-sora-mw-body-names', 'mwShowBodyNames');
    chkHandler('chk-sora-const-fig', 'mwShowConstFig');
    chkHandler('chk-sora-const-bounds', 'mwShowConstBounds');
    chkHandler('chk-sora-const-names', 'mwShowConstNames');
    // 文字サイズスライダー(表示天体名・星座名称・プレビュー基準100%)
    const lsSlider = document.getElementById('input-sora-label-scale');
    if (lsSlider) lsSlider.addEventListener('input', () => {
        appState.soraLabelScale = Math.max(0, Math.min(1000, Math.round(Number(lsSlider.value) || 0)));
        const lsVal = document.getElementById('sora-label-scale-val');
        if (lsVal) lsVal.textContent = `${appState.soraLabelScale}%`;
        saveAppState();
        if (appState.isSoramadoActive && !_smFailed) drawSoramado();
    });
    const sortSel = document.getElementById('sel-baseopt-const-sort');
    if (sortSel) sortSel.addEventListener('change', () => {
        appState.mwConstNameSort = sortSel.value === 'pos' ? 'pos' : 'aiueo';
        saveAppState();
        _mwRender();   // ラベルの並び順を即時反映
    });
    const excl = document.getElementById('input-baseopt-elev-exclude');
    if (excl) excl.addEventListener('change', () => {
        let v = parseFloat(excl.value);
        if (isNaN(v)) v = 0;
        appState.elevExcludeRadius = Math.max(0, Math.min(10000, Math.round(v)));
        saveAppState();
        syncBaseOptionUI();
    });
    syncBaseOptionUI();
}

function setupSoramadoControls() {
    soraPopulateSelects();
    const after = () => { soraSyncUI(); saveAppState(); if (appState.isSoramadoActive) drawSoramado(); };
    const numH = (id, key, min, max, round) => {
        const el = document.getElementById(id); if (!el) return;
        el.addEventListener('change', () => {
            let v = parseFloat(el.value);
            if (!isNaN(v)) { v = Math.max(min, Math.min(max, v)); appState[key] = round ? Math.round(v) : v; }
            after();
        });
    };
    numH('input-sora-aspect-w', 'soraAspectW', 1, 100, true);
    numH('input-sora-aspect-h', 'soraAspectH', 1, 100, true);
    numH('input-sora-base-az', 'soraBaseAz', 0, 360, false);
    numH('input-sora-base-alt', 'soraBaseAlt', -360, 360, false);
    numH('input-sora-offset-az', 'soraOffsetAz', -360, 360, false);
    numH('input-sora-offset-alt', 'soraOffsetAlt', -360, 360, false);
    numH('input-sora-range', 'soraViewRange', 1, 300, true);
    const selH = (id, key, parse) => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => { appState[key] = parse(el.value); after(); }); };
    selH('input-sora-sensor', 'soraSensorKey', v => v);
    selH('input-sora-focal-select', 'soraFocal', v => parseFloat(v));   // 7.5mm等の小数焦点距離に対応
    selH('input-sora-fnum-select', 'soraFNumberIdx', v => parseInt(v));
    // 焦点距離(mm)テキストボックス: 手入力(0.5刻み)。リスト・スライダー・コントロールメニューと連動
    for (const fid of ['input-sora-focal-text', 'input-sora-ctrl-focal-text']) {
        const focalText = document.getElementById(fid);
        if (focalText) focalText.addEventListener('change', () => {
            const v = parseFloat(focalText.value);
            if (!isNaN(v)) appState.soraFocal = Math.max(1, Math.min(3000, Math.round(v * 2) / 2));
            after();
        });
    }
    // コントロールメニューのオフセット方位角/視高度(メニュー・ドラッグパンと連動)
    numH('input-sora-ctrl-offset-az', 'soraOffsetAz', -360, 360, false);
    numH('input-sora-ctrl-offset-alt', 'soraOffsetAlt', -360, 360, false);
    const sliderH = (id, key) => { const el = document.getElementById(id); if (el) el.addEventListener('input', () => { appState[key] = parseInt(el.value); after(); }); };
    sliderH('input-sora-focal-slider', 'soraFocal');
    sliderH('input-sora-fnum-slider', 'soraFNumberIdx');
    sliderH('input-sora-focus-slider', 'soraFocusDist');
    sliderH('input-sora-range-slider', 'soraViewRange');
    const chkH = (id, key) => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => { appState[key] = el.checked; after(); }); };
    chkH('chk-sora-fisheye', 'soraFisheye');
    sliderH('input-sora-fisheye-slider', 'soraFisheyeStrength');
    document.querySelectorAll('input[name="sora-orient"]').forEach(r => {
        r.addEventListener('change', () => { if (r.checked) { appState.soraOrient = r.value; after(); } });
    });
    document.querySelectorAll('input[name="sora-fisheye-shape"]').forEach(r => {
        r.addEventListener('change', () => { if (r.checked) { appState.soraFisheyeShape = r.value; after(); } });
    });
    chkH('chk-sora-panorama', 'soraPanorama');
    sliderH('input-sora-pano-slider', 'soraPanoAov');
    // プレビュー最大化トグル(画面下1/3 ⇄ 全面)。状態は保存しない(初期値オフ)
    const maxBtn = document.getElementById('btn-soramado-max');
    if (maxBtn) maxBtn.addEventListener('click', () => {
        const panel = document.getElementById('soramado-panel');
        const on = panel.classList.toggle('maximized');
        maxBtn.classList.toggle('active', on);
        maxBtn.title = on ? 'プレビューを元のサイズに戻す' : 'プレビューを画面いっぱいに最大化';
        syncBottomPanels();   // 辻検索結果の位置替え(最大化中は上1/3)・プレビュー再描画・地図センタリング
    });
    // プレビュー内コントロールメニュー(開閉・焦点距離・日付/時刻)。開閉状態は保存しない(初期状態:閉)
    const ctrlHeader = document.getElementById('soramado-ctrl-header');
    if (ctrlHeader) ctrlHeader.addEventListener('click', () => {
        const body = document.getElementById('soramado-ctrl-body');
        const open = !body.classList.toggle('hidden');
        document.getElementById('soramado-ctrl-arrow').textContent = open ? '▲' : '▼';
        document.getElementById('soramado-ctrl').classList.toggle('open', open);   // 開=プレビュー画面と縦分割
        resizeSoramado();   // プレビュー画面のサイズが変わるので再描画
    });
    sliderH('input-sora-ctrl-focal', 'soraFocal');
    const btnH = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
    btnH('btn-sora-ctrl-month-prev', () => addMonth(-1));
    btnH('btn-sora-ctrl-date-prev', () => addDay(-1));
    btnH('btn-sora-ctrl-date-next', () => addDay(1));
    btnH('btn-sora-ctrl-month-next', () => addMonth(1));
    btnH('btn-sora-ctrl-hour-prev', () => addMinute(-60));
    btnH('btn-sora-ctrl-time-prev', () => addMinute(-1));
    btnH('btn-sora-ctrl-time-next', () => addMinute(1));
    btnH('btn-sora-ctrl-hour-next', () => addMinute(60));
    // 日付/時刻ピッカー: 日時情報メニューと同じ順序(状態更新→syncUIFromState→updateAll)で反映
    const dtPairH = (dateId, timeId) => {
        const dEl = document.getElementById(dateId), tEl = document.getElementById(timeId);
        if (!dEl || !tEl) return;
        const handler = () => {
            const dStr = dEl.value, tStr = tEl.value;
            if (!dStr || !tStr) return;
            const parts = tStr.split(':');
            const base = new Date(`${dStr}T00:00:00`);
            base.setHours(parseInt(parts[0]) || 0, parseInt(parts[1]) || 0, parts.length >= 3 ? (parseInt(parts[2]) || 0) : 0, 0);
            if (isNaN(base.getTime())) return;
            uncheckTimeShortcuts();
            appState.currentDate = base;
            syncUIFromState();
            updateAll();
        };
        dEl.addEventListener('change', handler);
        tEl.addEventListener('change', handler);
    };
    dtPairH('sora-ctrl-date', 'sora-ctrl-time');
    // インターバルMov: パラメータ入力と再生トグル
    numH('input-sora-mov-interval', 'soraMovInterval', 0.5, 86400, false);
    numH('input-sora-mov-shots', 'soraMovShots', 1, 99999, true);
    numH('input-sora-mov-mb', 'soraMovImgMb', 1, 102400, false);
    selH('sel-sora-mov-fps', 'soraMovFps', v => parseInt(v));
    selH('sel-sora-mov-step', 'soraMovDispStep', v => parseFloat(v));
    btnH('btn-sora-mov-play', soraMovTogglePlay);
    sliderH('input-sora-mw-bright', 'soraMwBrightness');
    sliderH('input-sora-elevshade', 'soraElevShade');
    sliderH('input-sora-sunshade', 'soraSunShade');
    btnH('btn-sora-url', () => toggleUrlPanel('soramado'));
    // 再生オプション: アニメーション/動画のラジオ(切替時は再生中のものを停止)
    document.querySelectorAll('input[name="sora-mov-playmode"]').forEach(r => {
        r.addEventListener('change', () => { if (r.checked) { if (_movTimer || _movVideo || (_expVideo && _expVideo.owner === 'play')) soraMovStop(); appState.soraMovPlayMode = r.value; soraSyncUI(); saveAppState(); } });
    });
    // 書き出し: 形式ラジオ・出力サイズ(アスペクト連動)・ファイル出力
    document.querySelectorAll('input[name="sora-exp-format"]').forEach(r => {
        r.addEventListener('change', () => { if (r.checked) { appState.soraExpFormat = r.value; soraSyncUI(); saveAppState(); } });
    });
    const expAspect = () => appState.soraPanorama ? soraPanoAspect() : soraOrientedAspect().aw / soraOrientedAspect().ah;
    const expWEl = document.getElementById('input-sora-exp-w');
    if (expWEl) expWEl.addEventListener('change', () => {
        const v = Math.round(parseFloat(expWEl.value));
        if (!isNaN(v)) {
            appState.soraExpW = Math.max(1, Math.min(8192, v));
            appState.soraExpH = Math.max(1, Math.min(8192, Math.round(appState.soraExpW / expAspect())));
        }
        soraSyncUI(); saveAppState();
    });
    const expHEl = document.getElementById('input-sora-exp-h');
    if (expHEl) expHEl.addEventListener('change', () => {
        const v = Math.round(parseFloat(expHEl.value));
        if (!isNaN(v)) {
            appState.soraExpH = Math.max(1, Math.min(8192, v));
            appState.soraExpW = Math.max(1, Math.min(8192, Math.round(appState.soraExpH * expAspect())));
        }
        soraSyncUI(); saveAppState();
    });
    btnH('btn-sora-export', soraExportRun);
    chkH('chk-sora-peaking', 'soraPeaking');
    chkH('chk-sora-traj', 'soraTraj');
    chkH('chk-sora-center', 'soraCenterCross');
    chkH('chk-sora-target', 'soraTargetCross');
    chkH('chk-sora-search-center', 'soraSearchCenter');
    soraSyncUI();
}

// --- パネル制御 ---
function toggleSoramado() {
    if (appState.isSoramadoActive) {
        closeSoramado();
    } else {
        // 標高グラフ・全天儀とは画面下1/3を排他利用
        if (appState.isElevationActive) toggleElevation();
        if (appState.isMilkyWayActive) closeMilkyWayInstrument();
        appState.isSoramadoActive = true;
        saveAppState();
        soraSyncUI();
        document.getElementById('btn-soramado').classList.add('active');
        document.getElementById('soramado-panel').classList.remove('hidden');
        drawSoramado();
    }
    syncBottomPanels();
}
function closeSoramado() {
    if (_movTimer || _movVideo || (_expVideo && _expVideo.owner === 'play')) soraMovStop();   // インターバルMov再生中なら停止(動画再生・生成中含む)
    if (_expVideo) soraExportCancel();   // 動画書き出し中なら中止(破棄)
    appState.isSoramadoActive = false;
    document.getElementById('btn-soramado').classList.remove('active');
    document.getElementById('soramado-panel').classList.add('hidden');
}

// --- three.js プレビュー (F1: カメラ枠・ファインダー・中心十字) ---
let _smRenderer = null, _smScene = null, _smCamera = null, _smInited = false, _smFailed = false;
let _smEqjGrp = null;   // EQJ座標のオーバーレイ群(星座線/領域・再生中の天の川の環)。空と同じ回転を適用

function _smInit() {
    if (typeof THREE === 'undefined') {
        _smFailed = true;
        const info = document.getElementById('soramado-info');
        if (info) info.textContent = '3Dライブラリ(three.js)を読み込めませんでした';
        return;
    }
    const cv = document.getElementById('soramado-canvas');
    _smRenderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, logarithmicDepthBuffer: true });
    _smRenderer.setPixelRatio(window.devicePixelRatio || 1);
    _smRenderer.autoClear = false;
    _smScene = new THREE.Scene();
    _smScene.background = null;
    _smCamera = new THREE.PerspectiveCamera(40, 1, 1, 1e6);
    // F2: 背景天球・軌跡・天体マーカー (描画順: 空→軌跡→天体)
    _smSky = _smBuildSky();
    _smScene.add(_smSky);
    _smTerrainGrp = new THREE.Group(); _smScene.add(_smTerrainGrp);   // F3: DEM地形(前景)
    _smMwRingGrp = new THREE.Group(); _smScene.add(_smMwRingGrp);     // 天の川の環(銀河赤道, キャッシュ)
    _smTrajGrp = new THREE.Group(); _smScene.add(_smTrajGrp);
    _smBodiesGrp = new THREE.Group(); _smScene.add(_smBodiesGrp);
    _smEqjGrp = new THREE.Group(); _smScene.add(_smEqjGrp);   // 星座線/領域・再生中の環(EQJ→地平回転を共有)
    _smTryLoadRealImage();
    _smInitPost();
    _smAttachDrag(cv);
    _smInited = true;
}

/** プレビューのドラッグパン: マウスは1ポインタのドラッグ、タッチ(スマホ)は2本指の重心移動で
 *  オフセット方位角/視高度を連動更新する(内容が指に追従するパノラマ操作)。 */
function _smAttachDrag(cv) {
    const pts = new Map();   // pointerId → {x, y}
    const centroid = () => {
        let x = 0, y = 0;
        pts.forEach(p => { x += p.x; y += p.y; });
        return { x: x / pts.size, y: y / pts.size };
    };
    cv.addEventListener('pointerdown', e => {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    });
    cv.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId)) return;
        const need = (e.pointerType === 'touch') ? 2 : 1;   // タッチは2本指のみ有効
        const before = centroid();
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size < need) return;
        const after = centroid();
        const dx = after.x - before.x, dy = after.y - before.y;
        if (!dx && !dy) return;
        // px→角度: ファインダー実寸と画角から換算。内容が指に追従(右へドラッグ=視線は左へ=Az減、下へドラッグ=視線は上へ=Alt増)
        const o = soraComputeOptics();
        const hAov = appState.soraPanorama ? soraPanoEffAov(o) : o.aovH;   // パノラマ中は画面幅=パノラマ水平画角
        const dAz = -dx * hAov / _smFinderW;
        const dAlt = dy * o.aovV / _smFinderH;
        appState.soraOffsetAz = Math.max(-360, Math.min(360, Number(appState.soraOffsetAz) + dAz));
        appState.soraOffsetAlt = Math.max(-360, Math.min(360, Number(appState.soraOffsetAlt) + dAlt));
        soraSyncUI();
        drawSoramado();
    });
    const end = e => {
        if (!pts.has(e.pointerId)) return;
        pts.delete(e.pointerId);
        if (pts.size === 0) saveAppState();   // ドラッグ完了時に1回だけ保存
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
}

/** 方位az・視高度alt(度) → ワールド単位ベクトル(右手系 ENU: X=東, Y=北, Z=上) */
function _smDir(azDeg, altDeg) {
    const az = azDeg * Math.PI / 180, alt = altDeg * Math.PI / 180, ca = Math.cos(alt);
    return new THREE.Vector3(Math.sin(az) * ca, Math.cos(az) * ca, Math.sin(alt));
}

/** ファインダー枠の矩形(指定領域内に finderAspect で内接, margin) → {x,y,w,h} */
function _smFitRect(boxW, boxH, finderAspect, margin) {
    let w = boxW * margin, h = w / finderAspect;
    if (h > boxH * margin) { h = boxH * margin; w = h * finderAspect; }
    return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
}

function drawSoramado() {
    if (!_smInited && !_smFailed) _smInit();
    if (_smFailed) return;
    const cv = document.getElementById('soramado-canvas');
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    _smRenderer.setSize(w, h, false);

    const o = soraComputeOptics();
    const az = Number(appState.soraBaseAz) + Number(appState.soraOffsetAz);
    const alt = Number(appState.soraBaseAlt) + Number(appState.soraOffsetAlt);
    const pano = appState.soraPanorama;
    const panoAov = pano ? soraPanoEffAov(o) : 0;
    const { aw: _oaw, ah: _oah } = soraOrientedAspect();
    // パノラマON時はアスペクト比を水平画角に応じて可変(円筒投影)。通常時はアスペクト比設定どおり
    const finderAspect = pano ? soraPanoAspect(o) : _oaw / _oah;
    // ファインダー矩形(CSS px)を先に求め、中心十字の画面固定サイズやドラッグ換算に使う(_smBuildBodiesより前)
    const cr = _smFitRect(w, h, finderAspect, 0.94);
    _smFinderH = cr.h || 1;
    _smFinderW = cr.w || 1;
    const _fe = (!pano && appState.soraFisheye) ? soraFisheyeParams() : null;   // パノラマ中はフィッシュアイ無効
    const allsky = !!_fe && _smAllSkyOn();                    // 歪み100%+円形: 等距離射影の全天表示
    const allskyR = allsky ? Math.min(cr.w, cr.h) / 2 : 0;    // 円の半径(CSS px)
    if (allsky) {
        _smSetAllSkyBasis(az, alt);   // 画面中心=カメラの向き(基準方位角+基準視高度+オフセット)
        // 画面固定サイズのスプライト(十字/星座名称)の既存スケール式が全天表示でも同じ見た目になるよう、
        // 等距離射影の中心倍率(最終px = 2·scale·R/π)から逆算した実効fovを設定する(キューブ面90°描画の中心近似)
        _smCamera.fov = 2 * Math.atan(Math.PI * _smFinderH / (4 * allskyR)) * 180 / Math.PI;
    } else {
        _smCamera.fov = Math.max(1, Math.min(170, o.aovV * (_fe ? _fe.fovScale : 1)));   // フィッシュアイON時は歪みに連動して画角を拡大
    }
    _smCamera.aspect = finderAspect;
    _smCamera.up.set(0, 0, 1);
    _smCamera.position.set(0, 0, 0);
    _smCamera.lookAt(_smDir(az, alt));
    _smCamera.updateProjectionMatrix();

    // 天の川の明るさ(黒レベル)をスライダー値から反映
    if (_smSkyMat && _smSkyMat.userData.uMwBlack) {
        const mwb = Number(appState.soraMwBrightness);
        _smSkyMat.userData.uMwBlack.value = 1 - Math.max(0, Math.min(100, isNaN(mwb) ? 100 : mwb)) / 100;
    }
    if (!_movPlaying) {
        // F2: 背景球の向き/可視・天体マーカー・軌跡・天の川の環を更新(再生中はキュー側が更新するのでスキップ)
        _smUpdateSky();
        _smBuildBodies();
        _smBuildTraj();
        _smUpdateMilkyWayRing();
        // F3: DEM地形(扇が変わった時のみ再取得)
        _smUpdateTerrain();
    }
    // 星座線/星座領域/星座名称(基本オプション連動): チェックオンなら宙の窓のプレビューにも表示
    _smEnsureConstLayer('fig');
    _smEnsureConstLayer('bounds');
    _smEnsureConstNames();
    _smUpdateConstNames(cr);

    // ファインダー矩形: HTML枠(#soramado-frame)と一致させるため CSS px(論理px)で指定する。
    // three.js は setViewport/setScissor の座標を内部で devicePixelRatio 倍する(three.js WebGLRenderer)。
    // ここでデバイスpxを渡すと dpr>1 で二重スケールし、プレビュー内容だけ枠からズレる(スマホで顕著)。
    const dpr = _smRenderer.getPixelRatio();
    const glY = h - cr.y - cr.h;                        // WebGLは左下原点 (cr は上部で算出済み)
    _smRenderer.setScissorTest(false);
    _smRenderer.setClearColor(0x000000, 1);
    _smRenderer.clear(true, true, true);                 // パネル全体を黒でクリア
    if (pano) {
        // パノラマ: 垂直ストリップ毎にカメラ方位を回して透視投影し、横に並べる(円筒投影の近似)。
        // ストリップ幅は角度に比例(viewport px は丸め累積で隙間なし)。カメラは fov=垂直画角のまま、
        // aspect=tan(ストリップ角/2)/tan(垂直画角/2) で各ストリップの水平角範囲を切り出す。
        const nStrips = Math.max(1, Math.ceil(panoAov / 10));   // 1ストリップ≦10°で円筒近似
        const stripDeg = panoAov / nStrips;
        const stripAspect = Math.tan(stripDeg * Math.PI / 360) / Math.tan(_smCamera.fov * Math.PI / 360);
        _smRenderer.setScissorTest(true);
        _smRenderer.setClearColor(0x0a0e1a, 1);
        for (let i = 0; i < nStrips; i++) {
            const px0 = Math.round(cr.x + cr.w * i / nStrips);
            const px1 = Math.round(cr.x + cr.w * (i + 1) / nStrips);
            if (px1 <= px0) continue;
            const sAz = az - panoAov / 2 + (i + 0.5) * stripDeg;
            _smCamera.aspect = stripAspect;
            _smCamera.lookAt(_smDir(sAz, alt));
            _smCamera.updateProjectionMatrix();
            _smRenderer.setViewport(px0, glY, px1 - px0, cr.h);
            _smRenderer.setScissor(px0, glY, px1 - px0, cr.h);
            _smRenderer.clear(true, true, true);
            _smRenderer.render(_smScene, _smCamera);
        }
        _smRenderer.setScissorTest(false);
    } else if (allsky && _smRenderAllSkyCube(finderAspect, allskyR * dpr)) {
        // 真の魚眼(等距離射影)の全天表示: キューブ全方位レンダ→等距離射影クアッドをファインダーへ
        _smRenderer.setRenderTarget(null);
        _smRenderer.setScissorTest(true);
        _smRenderer.setViewport(cr.x, glY, cr.w, cr.h);
        _smRenderer.setScissor(cr.x, glY, cr.w, cr.h);
        _smRenderer.render(_smAllSkyScene, _smAllSkyCam);
        _smRenderer.setScissorTest(false);
    } else if (appState.soraFisheye && _smPostMat) {
        // フィッシュアイ(近似): シーンをRTへ→バレル歪みでファインダーへ
        // RTは鮮鋭さのためデバイスpxで確保。RTバインド中は RT 自身のviewportが使われるため setViewport は不要。
        _smPostMat.uniforms.uK.value = _fe.uK;
        _smPostMat.uniforms.uCircle.value = appState.soraFisheyeShape === 'circle' ? 1.0 : 0.0;
        _smPostMat.uniforms.uAspect.value = finderAspect;
        const rw = Math.max(2, Math.round(cr.w * dpr)), rh = Math.max(2, Math.round(cr.h * dpr));
        _smRT.setSize(rw, rh);
        _smRenderer.setRenderTarget(_smRT);
        _smRenderer.setClearColor(0x0a0e1a, 1);
        _smRenderer.clear(true, true, true);
        _smRenderer.render(_smScene, _smCamera);
        _smRenderer.setRenderTarget(null);
        _smRenderer.setScissorTest(true);
        _smRenderer.setViewport(cr.x, glY, cr.w, cr.h);
        _smRenderer.setScissor(cr.x, glY, cr.w, cr.h);
        _smRenderer.render(_smPostScene, _smPostCam);
        _smRenderer.setScissorTest(false);
    } else {
        _smRenderer.setScissorTest(true);
        _smRenderer.setViewport(cr.x, glY, cr.w, cr.h);
        _smRenderer.setScissor(cr.x, glY, cr.w, cr.h);
        _smRenderer.setClearColor(0x0a0e1a, 1);
        _smRenderer.clear(true, true, true);             // ファインダー内を空色でクリア
        _smRenderer.render(_smScene, _smCamera);         // 背景球・天体・軌跡・地形
        _smRenderer.setScissorTest(false);
    }

    // HTMLオーバーレイ (CSS px で配置)
    const frame = document.getElementById('soramado-frame');
    if (frame) { frame.style.width = cr.w + 'px'; frame.style.height = cr.h + 'px'; }
    if (_movVideo && _movVideo.el) { _movVideo.el.style.width = cr.w + 'px'; _movVideo.el.style.height = cr.h + 'px'; }   // 再生オプション②の動画をファインダー矩形に重ねる
    const cross = document.getElementById('soramado-center');
    if (cross) cross.classList.toggle('hidden', !appState.soraCenterCross);
    // 左下の中心・画角キャプションは表示しない(依頼により削除)。#soramado-info は three.js読込失敗時のエラー表示にのみ使用。
}

function resizeSoramado() { if (appState.isSoramadoActive && !_smFailed) drawSoramado(); }

// --- F2: 天体プレビュー (背景球・天体マーカー・月相・軌跡) ---
const _SM_BODY_R = 400000, _SM_SKY_R = 600000;   // 天体・天球は地形(≤300km)より外側に置き、地形で遮蔽できるように
const _SM_CROSS_PX = 26;   // 天体中心十字のスプライト画面高さ(px固定)。可視十字は約0.69倍≈18pxで画面中心十字と同程度
let _smSky = null, _smSkyMat = null, _smSkyTex = null, _smBodiesGrp = null, _smTrajGrp = null, _smTrajKey = '';
let _smMwRingGrp = null, _smMwRingKey = '';   // 天の川の環(銀河赤道の大円)を天体色の線で。時刻/位置/色で再計算(キャッシュ)
let _smFinderH = 200, _smFinderW = 300;   // 直近のファインダーCSS高さ/幅(px)。十字の画面固定サイズやドラッグのpx→角度換算に使用(drawSoramadoで更新)
const _smTexCache = {};   // key → CanvasTexture

/** 背景天球(BackSide, 赤道座標テクスチャ)を生成 */
function _smBuildSky() {
    const slices = 64, stacks = 32, positions = [], uvs = [], indices = [];
    for (let j = 0; j <= stacks; j++) {
        const dec = -90 + 180 * j / stacks;
        for (let i = 0; i <= slices; i++) {
            const v = _mwEquVec(24 * i / slices, dec);
            positions.push(v[0] * _SM_SKY_R, v[1] * _SM_SKY_R, v[2] * _SM_SKY_R);
            uvs.push(i / slices, j / stacks);
        }
    }
    const row = slices + 1;
    for (let j = 0; j < stacks; j++) for (let i = 0; i < slices; i++) {
        const a = j * row + i, b = a + row;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    _smSkyTex = new THREE.CanvasTexture(_mwBuildProceduralTexture());
    _smSkyTex.colorSpace = THREE.SRGBColorSpace;
    _smSkyMat = new THREE.MeshBasicMaterial({ map: _smSkyTex, side: THREE.DoubleSide, depthWrite: false });
    // 天の川の明るさ(黒レベル持ち上げ): 白に近い明るい色は保ち、暗い色から先に沈める。
    // uMwBlack=0で原画どおり、1に近づくほど暗色から黒へ(ホワイトバランスを暗い色から0にするイメージ)。
    _smSkyMat.onBeforeCompile = (shader) => {
        shader.uniforms.uMwBlack = { value: 1 - Math.max(0, Math.min(100, Number(appState.soraMwBrightness))) / 100 || 0 };
        _smSkyMat.userData.uMwBlack = shader.uniforms.uMwBlack;
        shader.fragmentShader = shader.fragmentShader
            .replace('void main() {', 'uniform float uMwBlack;\nvoid main() {')
            .replace('#include <map_fragment>', '#include <map_fragment>\n\tdiffuseColor.rgb = max(diffuseColor.rgb - vec3(uMwBlack), vec3(0.0)) / max(1.0 - uMwBlack, 0.001);');
    };
    const mesh = new THREE.Mesh(geo, _smSkyMat);
    mesh.renderOrder = -1;
    return mesh;
}

/** 実画像(高解像度 milkyway-skymap_4k.webp)があれば背景球テクスチャを差し替え */
function _smTryLoadRealImage() {
    const img = new Image();
    img.onload = () => {
        if (_smFailed || !_smSkyMat) return;
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping; tex.repeat.x = -1; tex.offset.x = 0.5;   // NASA赤道座標版に整合
        tex.needsUpdate = true;
        if (_smSkyTex) _smSkyTex.dispose();
        _smSkyTex = tex; _smSkyMat.map = tex; _smSkyMat.needsUpdate = true;
        if (appState.isSoramadoActive) drawSoramado();
    };
    img.onerror = () => { /* 取得不可: 模式図のまま */ };
    img.src = 'milkyway-skymap_4k.webp';   // 宙の窓は広角背景のため高解像度版を使用(全天儀は小サイズ版)
}

/** EQJ→地平(ENU) 回転を Astronomy.Horizon の基準点から構成し、背景球へ適用＋可視更新 */
/** EQJ→地平の回転基底(RA0h/Dec0°とDec+90°の地平方向)を空とEQJオーバーレイ群へ適用。
 *  再生(インターバルMov)ではワーカーが事前計算した基底をここへ流し込む。 */
function _smSetSkyBasis(Rx, Rz) {
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const norm = (a) => { const m = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / m, a[1] / m, a[2] / m]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const rz = norm(Rz), d = dot(Rx, rz);
    const rx = norm([Rx[0] - rz[0] * d, Rx[1] - rz[1] * d, Rx[2] - rz[2] * d]);
    const ry = cross(rz, rx);
    const m = new THREE.Matrix4();
    m.makeBasis(new THREE.Vector3(rx[0], rx[1], rx[2]), new THREE.Vector3(ry[0], ry[1], ry[2]), new THREE.Vector3(rz[0], rz[1], rz[2]));
    if (_smSky) _smSky.quaternion.setFromRotationMatrix(m);
    if (_smEqjGrp && _smSky) _smEqjGrp.quaternion.copy(_smSky.quaternion);
}

function _smUpdateSky() {
    if (!_smSky) return;
    const mw = appState.bodies.find(b => b.id === 'MilkyWay');
    _smSky.visible = !!(mw && mw.visible);
    let observer;
    try { observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev); } catch (e) { return; }
    const date = appState.currentDate;
    const toW = (raH, decD) => { const hor = Astronomy.Horizon(date, observer, raH, decD, null); const d = _smDir(hor.azimuth, hor.altitude); return [d.x, d.y, d.z]; };
    // 星座線/領域(EQJオーバーレイ)は天の川の表示に依らず回転させるため、可視でなくても基底は更新する
    _smSetSkyBasis(toW(0, 0), toW(0, 90));
}

// 宙の窓プレビューの星座線/星座領域(基本オプションのチェックと連動)。EQJ群(_smEqjGrp)の子として空と一緒に回転
const _smConstLayers2 = { fig: null, bounds: null };
const _smConstLoading2 = { fig: false, bounds: false };
function _smEnsureConstLayer(kind) {
    if (!_smEqjGrp) return;
    const on = kind === 'fig' ? !!appState.mwShowConstFig : !!appState.mwShowConstBounds;
    if (_smConstLayers2[kind]) { _smConstLayers2[kind].visible = on; return; }
    if (!on || _smConstLoading2[kind]) return;
    _smConstLoading2[kind] = true;
    const st = _MW_CONST_STYLE[kind];
    _constFetch(kind).then(gj => {
        if (!_smEqjGrp || _smConstLayers2[kind]) return;
        const group = new THREE.Group();
        const R = _SM_SKY_R * 0.995;   // 天球のわずか内側(地形より外側なので山で隠れる)
        for (const f of gj.features) {
            const geom = f.geometry;
            const polys = geom.type === 'MultiLineString' ? geom.coordinates : [geom.coordinates];
            for (const poly of polys) {
                const pts = _mwConstPolyline(poly, R);
                if (pts.length < 2) continue;
                const g = new THREE.BufferGeometry().setFromPoints(pts);
                group.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: st.color, transparent: true, opacity: st.opacity * 0.85, depthWrite: false })));
            }
        }
        group.visible = kind === 'fig' ? !!appState.mwShowConstFig : !!appState.mwShowConstBounds;
        _smConstLayers2[kind] = group;
        _smEqjGrp.add(group);
        if (appState.isSoramadoActive && !_smFailed) drawSoramado();
    }).catch(() => { _smConstLoading2[kind] = false; });
}

// 宙の窓プレビューの星座名称(基本オプションの「:星座名称」チェックと連動)。
// 88星座の概略中心(MW_CONSTELLATIONS)にテキストスプライトを置き、EQJ群(_smEqjGrp)の子として空と一緒に回転させる。
// フィッシュアイのポストプロセスでも星座線と一緒に歪む。テクスチャは初回のみ生成し、
// 向き(四角=水平/円形=同心円状)とスクリーン固定サイズは毎描画(_smUpdateConstNames)で更新する。
// 表示天体名・星座名称の文字サイズ: メニューのスライダー(%・プレビュー基準100)×書き出し時の出力倍率。
// 書き出しでは _smLabelScaleX = 出力高さ÷プレビューのファインダー高さ を掛けて、
// 出力サイズを変えてもプレビューと同じ相対サイズの文字になるようにする
let _smLabelScaleX = 1;
function _smLabelScale() {
    const v = Number(appState.soraLabelScale);
    return (isNaN(v) ? 100 : Math.max(0, Math.min(1000, v))) / 100 * _smLabelScaleX;
}
let _smConstNamesGrp = null;
function _smEnsureConstNames() {
    if (!_smEqjGrp || _smConstNamesGrp || !appState.mwShowConstNames) return;
    const grp = new THREE.Group();
    const R = _SM_SKY_R * 0.995;
    MW_CONSTELLATIONS.forEach(c => {
        // 名称テクスチャ(白文字+黒縁取り)。幅は文字数に応じて可変、アスペクト比はスケール側で維持する
        const H = 48, font = 'bold 30px sans-serif';
        const cv = document.createElement('canvas');
        let ctx = cv.getContext('2d');
        ctx.font = font;
        const w = Math.ceil(ctx.measureText(c.n).width) + 16;
        cv.width = w; cv.height = H;
        ctx = cv.getContext('2d');
        ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.strokeText(c.n, w / 2, H / 2);
        ctx.fillStyle = '#ffffff'; ctx.fillText(c.n, w / 2, H / 2);
        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({
            map: tex, transparent: true, opacity: 0.85,
            depthTest: true, depthWrite: false, sizeAttenuation: false,
        }));
        sp.renderOrder = 998;   // 描画順は後段(半透明の重なり用)。depthTestで前景の山並みの奥では隠れる
        sp.userData.aspect = w / H;
        const v = _mwEquVec(c.ra, c.dec);
        sp.position.set(v[0] * R, v[1] * R, v[2] * R);
        grp.add(sp);
    });
    _smConstNamesGrp = grp;
    _smEqjGrp.add(grp);
}

/** 星座名称スプライトの毎描画更新: 表示/画面固定サイズ/向き。
 *  向きは画面形状=四角(またはフィッシュアイオフ・パノラマ中)なら水平、円形なら画面中心から同心円状
 *  (接線方向・文字の天が中心向き=星座盤の慣例)。バレル歪みは中心からの放射方向を保つため、
 *  ポストプロセス後も接線方向は維持される。 */
function _smUpdateConstNames(cr) {
    if (!_smConstNamesGrp) return;
    _smConstNamesGrp.visible = !!appState.mwShowConstNames;
    if (!_smConstNamesGrp.visible) return;
    const NAME_PX = 13 * _smLabelScale();   // 画面上の文字高さ(px・文字サイズスライダーと書き出し倍率を反映)
    const fovV = (_smCamera ? _smCamera.fov : 40) * Math.PI / 180;
    const sy = NAME_PX * 2 * Math.tan(fovV / 2) / _smFinderH;
    const wp = new THREE.Vector3();
    _smConstNamesGrp.children.forEach(sp => {
        sp.scale.set(sy * sp.userData.aspect, sy, 1);
        sp.getWorldPosition(wp);
        sp.material.rotation = _smLabelRotFor(wp, cr.w, cr.h);
    });
}

/** ラベルスプライトの回転角(現在の投影モードに応じて):
 *  全天表示=画面中心(カメラ方向)まわりの同心円状 / 樽円形=ファインダー中心からの同心円状 / それ以外=0(水平) */
function _smLabelRotFor(wp, crW, crH) {
    if (_smAllSkyOn()) return _smAllSkyLabelRot(wp);
    if (!!appState.soraFisheye && appState.soraFisheyeShape === 'circle' && !appState.soraPanorama) {
        const ndc = wp.clone().project(_smCamera);
        const phi = Math.atan2(ndc.y * crH, ndc.x * crW);
        return phi + Math.PI / 2;
    }
    return 0;
}

/** 64px キャンバスを描いて CanvasTexture をキャッシュ */
function _smCanvasTex(key, draw, size) {
    if (_smTexCache[key]) return _smTexCache[key];
    const s = size || 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
    draw(cv.getContext('2d'), s);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    _smTexCache[key] = tex; return tex;
}
function _smCrossTex(color) {
    return _smCanvasTex('cross_' + color, (c, s) => {
        c.clearRect(0, 0, s, s); c.strokeStyle = color; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(s / 2, 10); c.lineTo(s / 2, s - 10); c.moveTo(10, s / 2); c.lineTo(s - 10, s / 2); c.stroke();
    });
}

/** X字(×)記号のテクスチャ(検索中心マーカー用) */
function _smCrossTexX(color) {
    return _smCanvasTex('crossx_' + color, (c, s) => {
        c.clearRect(0, 0, s, s); c.strokeStyle = color; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(14, 14); c.lineTo(s - 14, s - 14); c.moveTo(s - 14, 14); c.lineTo(14, s - 14); c.stroke();
    });
}

/** 目的点(+)・検索中心(×)マーカーを _smBodiesGrp へ追加(通常描画/再生の両パスで共用)。
 *  検索中心 = 基準(目的点)方向 + 辻オフセット。検索中心オプションが線なら目的点→オフセット点の線も描く */
function _smAddTargetMarkers(cs) {
    const baseAz = Number(appState.soraBaseAz) || 0, baseAlt = Number(appState.soraBaseAlt) || 0;
    if (appState.soraTargetCross) {
        const tpos = _smDir(baseAz, baseAlt).multiplyScalar(_SM_BODY_R);
        const tcross = new THREE.Sprite(new THREE.SpriteMaterial({ map: _smCrossTex('#F44336'), transparent: true, depthTest: false, depthWrite: false, sizeAttenuation: false }));
        tcross.scale.set(cs, cs, 1); tcross.position.copy(tpos.clone().multiplyScalar(0.9999)); tcross.renderOrder = 999;
        tcross.userData.kind = 'targetCross'; _smBodiesGrp.add(tcross);
    }
    if (appState.soraSearchCenter) {
        const sAz = baseAz + (Number(appState.tsujiSearchOffsetAz) || 0);
        const sAlt = baseAlt + (Number(appState.tsujiSearchOffsetAlt) || 0);
        const spos = _smDir(sAz, sAlt).multiplyScalar(_SM_BODY_R * 0.9999);
        const xcross = new THREE.Sprite(new THREE.SpriteMaterial({ map: _smCrossTexX('#FFD700'), transparent: true, depthTest: false, depthWrite: false, sizeAttenuation: false }));
        xcross.scale.set(cs, cs, 1); xcross.position.copy(spos); xcross.renderOrder = 999;
        xcross.userData.kind = 'searchCenter'; _smBodiesGrp.add(xcross);
        if (appState.tsujiCenterMode === 'line') {
            // 検索中心の線分: 検索(ワーカーのsegmentMatch)と同じ「方位角/視高度平面の直線」を描く。
            // 大円(球面補間)で描くと検索の判定線と中間で数°ズレるため、az/altの線形補間で一致させる。
            const dAz = ((sAz - baseAz + 540) % 360) - 180;   // ワーカーと同じ±180正規化
            const dAlt = sAlt - baseAlt;
            const pts = [];
            for (let i = 0; i <= 48; i++) {
                pts.push(_smDir(baseAz + dAz * i / 48, baseAlt + dAlt * i / 48).multiplyScalar(_SM_BODY_R * 0.9999));
            }
            const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.9, depthTest: false, depthWrite: false }));
            line.renderOrder = 998; line.userData.kind = 'searchCenterLine'; _smBodiesGrp.add(line);
        }
    }
}
function _smDiskTex(color) {
    return _smCanvasTex('disk_' + color, (c, s) => {
        c.clearRect(0, 0, s, s); c.fillStyle = color;
        c.beginPath(); c.arc(s / 2, s / 2, s / 2 - 3, 0, 2 * Math.PI); c.fill();
    });
}
/** 月の満ち欠けキャンバス(clip+半分塗り+ターミネーター楕円) + 視半径の細線円 */
function _smDrawMoon(c, s, fraction, waxing) {
    const R = s / 2 - 6, cx = s / 2, cy = s / 2;
    const dark = 'rgba(48,50,60,0.92)', lit = '#f4f1e0';
    c.clearRect(0, 0, s, s);
    c.save();
    c.beginPath(); c.arc(cx, cy, R, 0, 2 * Math.PI); c.clip();
    c.fillStyle = dark; c.fillRect(0, 0, s, s);
    const k = Math.max(0, Math.min(1, fraction));
    c.fillStyle = lit;
    if (waxing) c.fillRect(cx, 0, s, s); else c.fillRect(0, 0, cx, s);   // 明るい縁側の半分
    const ex = R * Math.abs(1 - 2 * k);                                  // ターミネーター楕円の横半径
    c.beginPath(); c.ellipse(cx, cy, ex, R, 0, 0, 2 * Math.PI);
    c.fillStyle = (k > 0.5) ? lit : dark;                               // 凸(満ちて)→明, 凹(欠けて)→暗
    c.fill();
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1;            // 視半径の細線円
    c.beginPath(); c.arc(cx, cy, R, 0, 2 * Math.PI); c.stroke();
}

/** 表示天体のマーカー(中心十字・視半径円・月相)を毎回再構築 */
// 表示天体名のテクスチャ(天体色文字+黒縁取り)。天体ごとに1回だけ生成してキャッシュ
const _smBodyNameTexCache = {};
function _smBodyNameTex(body) {
    const key = `${body.id}_${body.color}_${body.name}`;
    if (_smBodyNameTexCache[key]) return _smBodyNameTexCache[key];
    const H = 44, font = 'bold 28px sans-serif';
    const cv = document.createElement('canvas');
    let ctx = cv.getContext('2d');
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(body.name).width) + 14;
    cv.width = w; cv.height = H;
    ctx = cv.getContext('2d');
    ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.strokeText(body.name, w / 2, H / 2);
    ctx.fillStyle = body.color; ctx.fillText(body.name, w / 2, H / 2);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return _smBodyNameTexCache[key] = { tex, aspect: w / H };
}

/** 表示天体名スプライトをマーカーの右横に追加(基本オプション「:表示天体名」オン時)。
 *  向きは星座名称と同じ規則(全天/樽円形=同心円状・それ以外=水平)。 */
function _smAddBodyName(body, pos) {
    if (!appState.mwShowBodyNames) return;
    const t = _smBodyNameTex(body);
    const fovV = (_smCamera ? _smCamera.fov : 40) * Math.PI / 180;
    const sy = 12 * _smLabelScale() * 2 * Math.tan(fovV / 2) / _smFinderH;   // 画面上約12px(文字サイズスライダーと書き出し倍率を反映)
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tex, transparent: true, opacity: 0.95, depthTest: true, depthWrite: false, sizeAttenuation: false }));
    sp.renderOrder = 998;   // depthTestで前景の山並みの奥では隠れる
    sp.scale.set(sy * t.aspect, sy, 1);
    sp.center.set(-0.12, 0.5);   // マーカーの右横に表示(アンカー位置の右側に文字)
    sp.material.rotation = _smLabelRotFor(pos, _smFinderW, _smFinderH);
    sp.position.copy(pos.clone().multiplyScalar(0.9998));
    _smBodiesGrp.add(sp);
}

function _smBuildBodies() {
    if (!_smBodiesGrp) return;
    while (_smBodiesGrp.children.length) { const c = _smBodiesGrp.children.pop(); if (c.material) c.material.dispose(); }
    let observer;
    try { observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev); } catch (e) { return; }
    const date = appState.currentDate;
    const refr = appState.refractionEnabled ? 'normal' : null;
    appState.bodies.forEach(body => {
        if (!body.visible) return;
        if (body.id === 'MilkyWay') {
            // 天の川の基準点(中心座標/オフセット点=基本オプション)に、他天体と同じ天体色の固定画面サイズ十字
            const gc = getFixedStarRaDec('MilkyWay');
            const ghor = Astronomy.Horizon(date, observer, gc.ra, gc.dec, refr);
            const gpos = _smDir(ghor.azimuth, ghor.altitude).multiplyScalar(_SM_BODY_R);
            const gfov = (_smCamera ? _smCamera.fov : 40) * Math.PI / 180;
            const gcs = _SM_CROSS_PX * 2 * Math.tan(gfov / 2) / _smFinderH;
            const gcross = new THREE.Sprite(new THREE.SpriteMaterial({ map: _smCrossTex(body.color), transparent: true, depthTest: true, depthWrite: false, sizeAttenuation: false }));
            gcross.scale.set(gcs, gcs, 1); gcross.position.copy(gpos.clone().multiplyScalar(0.9999)); _smBodiesGrp.add(gcross);
            _smAddBodyName(body, gpos);
            return;   // 帯本体は背景球の写真＋天の川の環(線)で表現
        }
        let ra, dec;
        if (isFixedStar(body.id)) { const rd = getFixedStarRaDec(body.id); ra = rd.ra; dec = rd.dec; }
        else { try { const eq = Astronomy.Equator(body.id, date, observer, true, true); ra = eq.ra; dec = eq.dec; } catch (e) { return; } }
        const hor = Astronomy.Horizon(date, observer, ra, dec, refr);
        const pos = _smDir(hor.azimuth, hor.altitude).multiplyScalar(_SM_BODY_R);
        const angR = getBodyAngularRadius(body.id, date, observer);    // deg (点光源は0)
        if (body.id === 'Moon') {
            const ill = Astronomy.Illumination('Moon', date);
            const waxing = Astronomy.MoonPhase(date) < 180;
            const tex = _smCanvasTex(`moon_${ill.phase_fraction.toFixed(2)}_${waxing}`, (c, s) => _smDrawMoon(c, s, ill.phase_fraction, waxing), 128);
            const r = _SM_BODY_R * Math.tan(Math.max(angR, 0.08) * Math.PI / 180);
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true, depthWrite: false }));
            sp.scale.set(2 * r, 2 * r, 1); sp.position.copy(pos); _smBodiesGrp.add(sp);
        } else if (angR > 0) {
            const r = _SM_BODY_R * Math.tan(angR * Math.PI / 180);
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: _smDiskTex(body.color), transparent: true, opacity: 0.55, depthTest: true, depthWrite: false }));
            sp.scale.set(2 * r, 2 * r, 1); sp.position.copy(pos); _smBodiesGrp.add(sp);
        }
        // 中心十字 (全天体・焦点距離/プレビューサイズに依らず ≈_SM_CROSS_PX の画面固定サイズ＝画面中心十字と同程度)。
        // sizeAttenuation:false のSpriteの画面高さ比 = scale/(2·tan(fov/2)) なので、px固定になるよう scale を逆算する。
        const fovV = (_smCamera ? _smCamera.fov : 40) * Math.PI / 180;
        const cs = _SM_CROSS_PX * 2 * Math.tan(fovV / 2) / _smFinderH;
        const cross = new THREE.Sprite(new THREE.SpriteMaterial({ map: _smCrossTex(body.color), transparent: true, depthTest: true, depthWrite: false, sizeAttenuation: false }));
        cross.scale.set(cs, cs, 1); cross.position.copy(pos.clone().multiplyScalar(0.9999)); _smBodiesGrp.add(cross);
        _smAddBodyName(body, pos);
    });

    // 目的点マーカー: 基準方位角・基準視高度(=観測点→目的点方向, オフセット無し)に赤い十字を画面固定サイズで表示。
    // depthTest:false＋高renderOrderで地形に隠れず常に見える。オフセット0なら白い中心十字と重なる。
    const tfov = (_smCamera ? _smCamera.fov : 40) * Math.PI / 180;
    const tcs = _SM_CROSS_PX * 2 * Math.tan(tfov / 2) / _smFinderH;
    _smAddTargetMarkers(tcs);
}

/** 表示天体の軌跡(前後1日の各日0:00〜23:59を1本ずつ＝計3本, 天体色の細線)。日・位置・対象が変わった時のみ再計算 */
function _smBuildTraj(dateOverride) {
    if (!_smTrajGrp) return;
    const dayStart = new Date(dateOverride || appState.currentDate); dayStart.setHours(0, 0, 0, 0);
    const posKey = `${appState.start.lat},${appState.start.lng},${appState.start.elev}`;
    const visibleIds = appState.bodies.filter(b => b.visible).map(b => b.id).join(',');
    const key = `${dayStart.getTime()}|${posKey}|${visibleIds}|${appState.soraTraj}|${appState.baseOptMwBase}:${appState.mwOffsetAngle}`;
    if (key === _smTrajKey) return;
    _smTrajKey = key;
    while (_smTrajGrp.children.length) { const c = _smTrajGrp.children.pop(); if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }
    if (!appState.soraTraj) return;
    let observer;
    try { observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev); } catch (e) { return; }
    const dayStartMs = dayStart.getTime(), N = 96;
    appState.bodies.forEach(body => {
        if (!body.visible) return;
        // 天の川は「基準点(中心座標/オフセット点=基本オプション)」を固定点として軌跡を描く。それ以外は通常天体。
        let isFixed, rd;
        if (body.id === 'MilkyWay') {
            isFixed = true; rd = getFixedStarRaDec('MilkyWay');
        } else {
            isFixed = isFixedStar(body.id);
            rd = isFixed ? getFixedStarRaDec(body.id) : null;
        }
        // 前日/当日/翌日 を各日 0:00〜23:59:59 で1本ずつ(計3本)描画
        for (let d = -1; d <= 1; d++) {
            const day0 = dayStartMs + d * 86400000;
            const pts = [];
            for (let i = 0; i <= N; i++) {
                const t = new Date(day0 + (i / N) * 86399000);   // 0:00 .. 23:59:59
                let ra, dec;
                if (isFixed) { ra = rd.ra; dec = rd.dec; }
                else { try { const eq = Astronomy.Equator(body.id, t, observer, true, true); ra = eq.ra; dec = eq.dec; } catch (e) { continue; } }
                const hor = Astronomy.Horizon(t, observer, ra, dec, null);
                pts.push(_smDir(hor.azimuth, hor.altitude).multiplyScalar(_SM_BODY_R * 0.98));
            }
            if (pts.length < 2) continue;
            const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(body.color), transparent: true, opacity: 0.6, depthTest: true }));
            _smTrajGrp.add(line);
        }
    });
}

/** 天の川の環(銀河赤道 b=0 の大円)を白色の線で描画。時刻・位置が変わった時のみ再計算(キャッシュ)。
 *  背景球と同じ Astronomy.Horizon→_smDir 変換で作るため、天の川写真の帯にぴたり整列する。 */
function _smUpdateMilkyWayRing() {
    if (!_smMwRingGrp) return;
    const mw = appState.bodies.find(b => b.id === 'MilkyWay');
    const visible = !!(mw && mw.visible);
    const posKey = `${appState.start.lat},${appState.start.lng},${appState.start.elev}`;
    const key = visible ? `${appState.currentDate.getTime()}|${posKey}` : 'off';
    if (key === _smMwRingKey) return;
    _smMwRingKey = key;
    while (_smMwRingGrp.children.length) { const c = _smMwRingGrp.children.pop(); if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }
    if (!visible) return;
    let observer;
    try { observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev); } catch (e) { return; }
    const date = appState.currentDate;
    const refr = appState.refractionEnabled ? 'normal' : null;
    const pts = [];
    for (let l = 0; l <= 360; l += 4) {   // 銀河赤道を約91点で大円描画
        const eq = galacticToEquatorial(l, 0);
        const hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec, refr);
        pts.push(_smDir(hor.azimuth, hor.altitude).multiplyScalar(_SM_BODY_R));
    }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthTest: true }));
    _smMwRingGrp.add(line);
}
// --- F3: DEM地形(山稜線・グレースケール/白黒・フォーカスピーキング) ---
let _smTerrainGrp = null, _smTerrainMesh = null, _smHeightfield = null, _smGeomKey = '', _smShadeKey = '', _smTerrainGen = 0;

/** 現在日時・観測点での太陽のENU方向(単位ベクトル)と高度。地形ヒルシェードの光源に使う。
 * 夜間(太陽が地平線下)は方位を保ちつつ高度を底上げし、尾根のレリーフを常に維持する。 */
function _smSunDir() {
    try {
        const observer = new Astronomy.Observer(appState.start.lat, appState.start.lng, appState.start.elev);
        const date = appState.currentDate;
        const eq = Astronomy.Equator('Sun', date, observer, true, true);
        const hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec, null);
        const altUse = hor.altitude < 3 ? 35 : hor.altitude;
        return { vec: _smDir(hor.azimuth, altUse), alt: hor.altitude, az: hor.azimuth };
    } catch (e) {
        return { vec: _smDir(135, 45), alt: 45, az: 135 };   // 取得失敗時は南東45°の既定光
    }
}

/** 球面上の終点(始点lat,lng・方位az度・距離distm) → {lat,lng} */
function _smDestPoint(latDeg, lngDeg, azDeg, distM) {
    const R = EARTH_RADIUS, dr = distM / R;
    const lat1 = latDeg * Math.PI / 180, lng1 = lngDeg * Math.PI / 180, az = azDeg * Math.PI / 180;
    const sinLat2 = Math.sin(lat1) * Math.cos(dr) + Math.cos(lat1) * Math.sin(dr) * Math.cos(az);
    const lat2 = Math.asin(Math.max(-1, Math.min(1, sinLat2)));
    const lng2 = lng1 + Math.atan2(Math.sin(az) * Math.sin(dr) * Math.cos(lat1), Math.cos(dr) - Math.sin(lat1) * sinLat2);
    return { lat: lat2 * 180 / Math.PI, lng: ((lng2 * 180 / Math.PI + 540) % 360) - 180 };
}

/** 視界範囲(km)からタイル数を抑える適応ズーム (dem_png は z≤14) */
function _smTerrainZoom(rangeKm, latDeg) {
    const span = Math.max(rangeKm / 6, 0.2);   // 1タイルあたり ~ range/6 km を狙う
    const z = Math.round(Math.log2(40075 * Math.cos(latDeg * Math.PI / 180) / span));
    return Math.max(9, Math.min(14, z));
}

/** 地形の更新: 扇(位置・方位・画角・範囲)が変わった時のみ非同期取得。陰影は毎回反映 */
function _smUpdateTerrain() {
    if (!_smTerrainGrp) return;
    const o = soraComputeOptics();
    const aovH = appState.soraPanorama ? soraPanoEffAov(o) : o.aovH;   // パノラマ中は扇をパノラマ水平画角へ
    const centerAz = Number(appState.soraBaseAz) + Number(appState.soraOffsetAz);
    const range = Math.max(1, Number(appState.soraViewRange) || 1);
    const zoom = _smTerrainZoom(range, appState.start.lat);
    const geomKey = `${appState.start.lat.toFixed(5)},${appState.start.lng.toFixed(5)},${(+appState.start.elev).toFixed(1)}|${centerAz.toFixed(2)}|${aovH.toFixed(1)}|${range}|${zoom}`;
    if (geomKey !== _smGeomKey) {
        _smGeomKey = geomKey;
        _smFetchTerrain(centerAz, aovH, range, zoom);
    }
    _smApplyShading();
}

// --- F3: DEM地形タイル取得 ワーカープール (fetch/PNGデコード/標高化を並列オフロード) ---
const SORA_TERRAIN_POOL_SIZE = Math.max(1, Math.min((navigator.hardwareConcurrency || 6) + 1, 31));
let _smTerrainPool = null;
function _smEnsureTerrainPool() {
    if (_smTerrainPool) return _smTerrainPool;
    const workers = [];
    for (let i = 0; i < SORA_TERRAIN_POOL_SIZE; i++) workers.push(new Worker('sora-terrain-worker.js'));
    _smTerrainPool = { workers, idle: [...workers], queue: [], seq: 0 };
    return _smTerrainPool;
}
function _smTerrainRunOnWorker(worker, task) {
    const handler = (e) => {
        worker.removeEventListener('message', handler);
        task.resolve(e.data || { elevs: [] });
        if (_smTerrainPool && _smTerrainPool.queue.length > 0) _smTerrainRunOnWorker(worker, _smTerrainPool.queue.shift());
        else if (_smTerrainPool) _smTerrainPool.idle.push(worker);
    };
    worker.addEventListener('message', handler);
    worker.postMessage(task.message);
}
function _smTerrainPoolRun(message) {
    const pool = _smEnsureTerrainPool();
    return new Promise(resolve => {
        const task = { message, resolve };
        if (pool.idle.length > 0) _smTerrainRunOnWorker(pool.idle.pop(), task);
        else pool.queue.push(task);
    });
}
/** キュー上の未実行タイルタスクを全て破棄(扇の世代切替時に呼ぶ)。結果は空で解決され、旧世代側の gen チェックで捨てられる。 */
function _smTerrainPoolCancelQueued() {
    if (!_smTerrainPool) return;
    for (const task of _smTerrainPool.queue) task.resolve({ reqId: task.message.reqId, elevs: [] });
    _smTerrainPool.queue = [];
}

/** 地形取得の進捗バー。done<0 で非表示、それ以外は done/total を表示。 */
function _smSetTerrainProgress(done, total) {
    const bar = document.getElementById('soramado-progress');
    const fill = document.getElementById('soramado-progress-fill');
    if (!bar || !fill) return;
    if (done < 0 || !total) { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    fill.style.width = Math.round(Math.min(1, done / total) * 100) + '%';
}

/** 扇形をサンプリングし、DEM(またはテスト用合成)から標高を取得 → ハイトフィールド。
 * 実DEMはタイル単位にまとめ、ワーカープールで並列取得(対応環境)。進捗バーを表示。 */
async function _smFetchTerrain(centerAz, aovH, rangeKm, zoom) {
    const gen = ++_smTerrainGen;
    _smTerrainPoolCancelQueued();   // 旧扇のキュー済みタイルを全て破棄(走り続け防止。実行中の分は gen チェックで結果破棄)
    const nA = aovH > 180 ? 280 : 140, nR = 100, nearKm = 0.01;   // 0km近傍から。広角パノラマは方位分解能を倍に
    const azHalf = aovH / 2 + 2;     // 余白2°
    const oLat = appState.start.lat, oLng = appState.start.lng;
    const samples = new Array((nA + 1) * (nR + 1));
    let p = 0;
    for (let j = 0; j <= nR; j++) {
        const rr = j / nR, dkm = nearKm + (rangeKm - nearKm) * rr * rr;   // 近傍を密に
        for (let i = 0; i <= nA; i++) {
            const a = centerAz + (-azHalf + 2 * azHalf * i / nA);
            const d = _smDestPoint(oLat, oLng, a, dkm * 1000);
            samples[p++] = { a, dkm, lat: d.lat, lng: d.lng, elev: 0 };
        }
    }
    const hf = { nA, nR, samples, centerAz };
    // テスト用合成標高フック(実DEMを遮断する検証環境用)
    if (typeof window !== 'undefined' && typeof window._smSyntheticElev === 'function') {
        for (const s of samples) s.elev = window._smSyntheticElev(s.lat, s.lng);
        _smOnTerrainFetched(gen, hf);
        return;
    }
    // 実DEM: 適応ズームの dem_png タイル単位でグループ化
    const groups = {};
    for (let idx = 0; idx < samples.length; idx++) {
        const ti = _getTileInfo(samples[idx].lat, samples[idx].lng, zoom);
        const k = `${ti.x}_${ti.y}`;
        (groups[k] || (groups[k] = { url: `https://cyberjapandata.gsi.go.jp/xyz/dem_png/${zoom}/${ti.x}/${ti.y}.png`, pts: [] })).pts.push({ idx, pX: ti.pX, pY: ti.pY });
    }
    const keys = Object.keys(groups);
    const total = keys.length;
    let done = 0;
    _smSetTerrainProgress(0, total);
    const tileDone = () => { _smSetTerrainProgress(++done, total); };

    // ワーカープールで並列取得(対応環境)。非対応時はメインスレッド逐次にフォールバック。
    const canWorker = (typeof Worker !== 'undefined') && (typeof OffscreenCanvas !== 'undefined');
    if (canWorker) {
        const pool = _smEnsureTerrainPool();
        const seq0 = ++pool.seq;
        await Promise.all(keys.map(async (k) => {
            if (gen !== _smTerrainGen) return;
            const g = groups[k];
            const res = await _smTerrainPoolRun({ reqId: `${seq0}_${k}`, url: g.url, pts: g.pts });
            if (gen !== _smTerrainGen) return;
            for (const e of res.elevs) samples[e.idx].elev = e.elev;
            tileDone();
        }));
    } else {
        for (const k of keys) {
            if (gen !== _smTerrainGen) { _smSetTerrainProgress(-1, total); return; }
            const g = groups[k];
            const img = await _getTileImageData(g.url);
            for (const pt of g.pts) {
                let h = 0;
                if (img) { const i = (pt.pY * 256 + pt.pX) * 4; const v = _elevFromRGB(img.data[i], img.data[i + 1], img.data[i + 2]); h = (v === null) ? 0 : v; }
                samples[pt.idx].elev = h;
            }
            tileDone();
        }
    }
    if (gen !== _smTerrainGen) return;   // 新しい扇に置き換わったらキャンセル(進捗バーは新しい実行のものを消さない)
    _smSetTerrainProgress(-1, total);   // 非表示
    _smOnTerrainFetched(gen, hf);
}

function _smOnTerrainFetched(gen, hf) {
    if (gen !== _smTerrainGen) return;
    _smHeightfield = hf;
    _smShadeKey = '';   // 陰影を再構築
    _smApplyShading();
    if (appState.isSoramadoActive && !_smFailed) drawSoramado();
}

/** ハイトフィールドからメッシュを生成・陰影。fetch不要。
 * 太陽光ヒルシェード(尾根筋の立体)＋標高グレー(視界範囲内の最高標高=白)を頂点色に焼き込む。 */
function _smApplyShading() {
    if (!_smHeightfield) return;
    const o = soraComputeOptics();
    const focusNear = o.near, focusFar = o.far;   // m (soraComputeOptics は m単位)
    const sun = _smSunDir();
    // 太陽方位/高度を量子化して鍵に含める→日時変化で陰影を再計算
    const sunKey = `${Math.round(sun.az)}_${Math.round(sun.alt)}`;
    const shadeKey = `${_smGeomKey}|${appState.soraGrayscale}|${appState.soraPeaking}|${focusNear.toFixed(0)}|${focusFar === Infinity ? 'inf' : focusFar.toFixed(0)}|${sunKey}|${appState.soraElevShade}|${appState.soraSunShade}`;
    if (shadeKey === _smShadeKey && _smTerrainMesh) return;
    _smShadeKey = shadeKey;
    _smBuildTerrainMesh(_smHeightfield, focusNear, focusFar, sun.vec);
}

function _smBuildTerrainMesh(hf, focusNear, focusFar, sunVec) {
    while (_smTerrainGrp.children.length) { const c = _smTerrainGrp.children.pop(); if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }
    _smTerrainMesh = null;
    const { nA, nR, samples } = hf;
    const row = nA + 1;
    const obsElev = Number(appState.start.elev) || 0;
    const k = appState.refractionEnabled ? calculateKFromMeteo(appState.meteo.p, appState.meteo.t, appState.meteo.l) : 0;
    const Reff = getLocalEarthRadius(appState.start.lat) / (1 - k);
    // 標高レンジ
    let minE = Infinity, maxE = -Infinity;
    for (const s of samples) { if (s.elev < minE) minE = s.elev; if (s.elev > maxE) maxE = s.elev; }
    if (!isFinite(minE)) { minE = 0; maxE = 1; }
    const span = Math.max(1, maxE - minE);
    const gray = appState.soraGrayscale, peak = appState.soraPeaking;
    const sE = Math.max(0, Math.min(100, Number(appState.soraElevShade) || 0)) / 50;   // 標高ヒルシェード適用度(1=従来)
    const sS = Math.max(0, Math.min(100, Number(appState.soraSunShade) || 0)) / 50;    // 太陽光ヒルシェード適用度(1=従来)
    const positions = new Float32Array(samples.length * 3);
    // 1) 位置(ENU・曲率落差込み)を先に作る
    for (let idx = 0; idx < samples.length; idx++) {
        const s = samples[idx], d = s.dkm * 1000, a = s.a * Math.PI / 180;
        const E = d * Math.sin(a), N = d * Math.cos(a);
        const drop = d * d / (2 * Reff);
        positions[idx * 3] = E; positions[idx * 3 + 1] = N; positions[idx * 3 + 2] = (s.elev - obsElev) - drop;
    }
    // 2) 扇グリッドの隣接差分から頂点法線を解析的に算出(上向きに正規化)→安定したヒルシェード
    const sx = sunVec.x, sy = sunVec.y, sz = sunVec.z;
    const colors = new Float32Array(samples.length * 3);
    const getP = (i, j) => { const id = j * row + i; return [positions[id * 3], positions[id * 3 + 1], positions[id * 3 + 2]]; };
    for (let j = 0; j <= nR; j++) {
        for (let i = 0; i <= nA; i++) {
            const idx = j * row + i, s = samples[idx];
            const pa0 = getP(Math.max(0, i - 1), j), pa1 = getP(Math.min(nA, i + 1), j);   // 方位接線
            const pr0 = getP(i, Math.max(0, j - 1)), pr1 = getP(i, Math.min(nR, j + 1));   // 距離接線
            const tax = pa1[0] - pa0[0], tay = pa1[1] - pa0[1], taz = pa1[2] - pa0[2];
            const trx = pr1[0] - pr0[0], try_ = pr1[1] - pr0[1], trz = pr1[2] - pr0[2];
            let nx = try_ * taz - trz * tay, ny = trz * tax - trx * taz, nz = trx * tay - try_ * tax;
            if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
            const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
            // ランバート陰影(環境光0.35＋拡散0.75)→尾根の向きで明暗
            const lambert = 0.35 + 0.75 * Math.max(0, nx * sx + ny * sy + nz * sz);
            const d = s.dkm * 1000, slant = Math.hypot(positions[idx * 3], positions[idx * 3 + 1], positions[idx * 3 + 2]);
            let r, g, b;
            if (peak && slant >= focusNear && slant <= focusFar) { r = 0.95; g = 0.12; b = 0.12; }   // フォーカスピーキング(赤)
            else {
                // 標高グレー(最高標高=白)。grayscale OFF時は一様グレーで純レリーフ。
                // 適用度スライダー(50%=従来): 標高ヒルシェードは0.6を中心に、太陽光ヒルシェードは1.0(陰影なし)を中心に強弱
                const base0 = gray ? (0.18 + 0.82 * ((s.elev - minE) / span)) : 0.6;
                const base = Math.max(0.05, Math.min(1, 0.6 + sE * (base0 - 0.6)));
                const lam = Math.max(0, 1 + sS * (lambert - 1));
                let lum = Math.min(1, base * lam);
                r = lum * 0.94; g = lum * 0.97; b = lum;   // ごく僅かに寒色
            }
            colors[idx * 3] = r; colors[idx * 3 + 1] = g; colors[idx * 3 + 2] = b;
        }
    }
    const indices = [];
    for (let j = 0; j < nR; j++) for (let i = 0; i < nA; i++) {
        const aI = j * row + i, bI = aI + row;
        indices.push(aI, bI, aI + 1, aI + 1, bI, bI + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    // 陰影は頂点色に焼き込み済み(視点非依存のヒルシェード)→MeshBasicでそのまま表示
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    _smTerrainMesh = new THREE.Mesh(geo, mat);
    _smTerrainGrp.add(_smTerrainMesh);
}

// --- F3: フィッシュアイ post-process (近似: 透視レンダをRTへ→バレル歪み) ---
let _smRT = null, _smPostScene = null, _smPostCam = null, _smPostMat = null;
function _smInitPost() {
    if (typeof THREE === 'undefined') return;
    _smRT = new THREE.WebGLRenderTarget(16, 16);
    _smPostCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    _smPostMat = new THREE.ShaderMaterial({
        depthTest: false, depthWrite: false,
        uniforms: { tDiffuse: { value: _smRT.texture }, uK: { value: 0.35 }, uCircle: { value: 0.0 }, uAspect: { value: 1.5 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: [
            'varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uK; uniform float uCircle; uniform float uAspect;',
            'void main(){',
            '  vec2 c = vUv - 0.5;',
            '  if (uCircle > 0.5) {',                                          // 画面形状=円形: 内接円の外は黒
            '    float rlim = 0.5 * min(uAspect, 1.0);',
            '    if (length(vec2(c.x * uAspect, c.y)) > rlim) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }',
            '  }',
            '  float r2 = dot(c, c) * 4.0;',                 // 0..2 (中心0, 角2)
            '  vec2 src = 0.5 + c * (1.0 - uK * r2);',       // 樽歪み(縁を内側へ→魚眼風)
            '  if (src.x < 0.0 || src.x > 1.0 || src.y < 0.0 || src.y > 1.0) gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);',
            '  else gl_FragColor = texture2D(tDiffuse, src);',
            '}'
        ].join('\n')
    });
    _smPostScene = new THREE.Scene();
    _smPostScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), _smPostMat));
}

// --- 真の魚眼(等距離射影)の全天表示 ---
// フィッシュアイ「歪み100%+円形」のとき、シーンをキューブカメラで全方位レンダリングし、
// シェーダで等距離射影(像高∝中心からの角度: r = f·θ)に合成する。透視投影+樽歪みの近似と異なり、
// 画面中心(基準方位角+基準視高度=カメラの向き)から90°までの全天(直径180°)を円形に均等に描く。
// 基準視高度を90°にすると天頂中心の星座盤の見え方になる(そのとき円の下方向=基準方位角)。
let _smCubeRT = null, _smCubeCam = null, _smAllSkyMat = null, _smAllSkyScene = null, _smAllSkyCam = null;
let _smAllSkyBasis = null;   // {f,r,u}: 画面中心方向・画像右・画像上の正規直交基底(THREE.Vector3)
function _smAllSkyOn() {
    return !!appState.soraFisheye && appState.soraFisheyeShape === 'circle' &&
           Number(appState.soraFisheyeStrength) >= 100 && !appState.soraPanorama;
}
/** 全天表示の基底を設定: f̂=カメラ方向(画面中心)、r̂=画像右、û=画像上。
 *  ほぼ天頂/天底では上方向が定義できないため、û=基準方位角の反対(円の下=基準方位角)に固定する */
function _smSetAllSkyBasis(azDeg, altDeg) {
    const f = _smDir(azDeg, altDeg);
    let r, u;
    if (Math.abs(altDeg) >= 89.9) {
        r = _smDir(azDeg + 90, 0);
        u = _smDir(azDeg + 180, 0);
        if (altDeg < 0) u.negate();
    } else {
        r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 0, 1)).normalize();
        u = new THREE.Vector3().crossVectors(r, f).normalize();
    }
    _smAllSkyBasis = { f, r, u };
}
function _smEnsureAllSky() {
    if (_smAllSkyMat || typeof THREE === 'undefined') return;
    _smCubeRT = new THREE.WebGLCubeRenderTarget(1024);
    _smCubeRT.texture.colorSpace = THREE.SRGBColorSpace;
    _smCubeCam = new THREE.CubeCamera(0.1, _SM_SKY_R * 4, _smCubeRT);
    _smAllSkyCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    _smAllSkyMat = new THREE.ShaderMaterial({
        depthTest: false, depthWrite: false,
        uniforms: {
            uCube: { value: _smCubeRT.texture }, uAspect: { value: 1.5 },
            uF: { value: new THREE.Vector3(0, 1, 0) }, uR: { value: new THREE.Vector3(1, 0, 0) }, uU: { value: new THREE.Vector3(0, 0, 1) },
        },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: [
            'varying vec2 vUv; uniform samplerCube uCube; uniform float uAspect;',
            'uniform vec3 uF; uniform vec3 uR; uniform vec3 uU;',
            'void main(){',
            '  vec2 c = vUv - 0.5;',
            '  vec2 p = vec2(c.x * uAspect, c.y);',            // 高さ基準の等方座標
            '  float rlim = 0.5 * min(uAspect, 1.0);',         // 内接円
            '  float r = length(p);',
            '  if (r > rlim) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }',
            '  float theta = (r / rlim) * 1.5707963;',         // 中心からの角度 0..90° (等距離射影)
            '  float phi = atan(p.x, p.y);',                   // 画像上方向基準の方位角
            '  vec3 dir = cos(theta) * uF + sin(theta) * (sin(phi) * uR + cos(phi) * uU);',
            '  gl_FragColor = textureCube(uCube, dir);',
            '}'
        ].join('\n')
    });
    _smAllSkyScene = new THREE.Scene();
    _smAllSkyScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), _smAllSkyMat));
}
/** 全天表示のキューブレンダリング+uniform設定(プレビュー/書き出し共通)。成功でtrue */
function _smRenderAllSkyCube(aspect, radiusPx) {
    _smEnsureAllSky();
    if (!_smAllSkyMat || !_smAllSkyBasis) return false;
    const F = Math.max(512, Math.min(2048, Math.round(radiusPx * 2)));
    if (_smCubeRT.width !== F) _smCubeRT.setSize(F, F);
    _smCubeCam.position.set(0, 0, 0);
    // CubeCamera.update は各面をクリアしないため、autoClear=false(宙の窓の既定)のままだと
    // 前フレームの内容がキューブ面に蓄積して残像になる(天体切替・日時変更で軌跡が残る)。
    // update の間だけ autoClear を有効にして各面を空色でクリアする
    const savedAutoClear = _smRenderer.autoClear;
    _smRenderer.autoClear = true;
    _smRenderer.setClearColor(0x0a0e1a, 1);
    _smCubeCam.update(_smRenderer, _smScene);
    _smRenderer.autoClear = savedAutoClear;
    _smAllSkyMat.uniforms.uAspect.value = aspect;
    _smAllSkyMat.uniforms.uF.value.copy(_smAllSkyBasis.f);
    _smAllSkyMat.uniforms.uR.value.copy(_smAllSkyBasis.r);
    _smAllSkyMat.uniforms.uU.value.copy(_smAllSkyBasis.u);
    return true;
}
/** 全天表示での星座名称等の回転角: 最終画像(中心=カメラ方向)で同心円状になるよう、
 *  ラベルが載るキューブ面のスクリーン空間での接線方向の画面角を求める。
 *  文字の天が画像中心側を向くよう±180°を選ぶ(星座盤の慣例)。 */
function _smAllSkyLabelRot(wp) {
    _smEnsureAllSky();
    if (!_smCubeCam) return 0;
    const d = wp.clone().normalize();
    const up = _smAllSkyBasis ? _smAllSkyBasis.f : new THREE.Vector3(0, 0, 1);   // 画像中心方向まわりの同心円
    const t = new THREE.Vector3().crossVectors(up, d);
    if (t.lengthSq() < 1e-9) return 0;   // 画像中心の直上は接線が定義できない
    t.normalize();
    const u = new THREE.Vector3().crossVectors(d, t).normalize();   // 画像中心側(中心角が減る向き)
    // 支配軸のキューブ面カメラ(children順: +X,-X,+Y,-Y,+Z,-Z)へ射影して画面角を得る
    const ax = Math.abs(d.x), ay = Math.abs(d.y), az2 = Math.abs(d.z);
    let idx;
    if (ax >= ay && ax >= az2) idx = d.x >= 0 ? 0 : 1;
    else if (ay >= ax && ay >= az2) idx = d.y >= 0 ? 2 : 3;
    else idx = d.z >= 0 ? 4 : 5;
    const cam = _smCubeCam.children[idx];
    if (!cam) return 0;
    _smCubeCam.updateMatrixWorld(true);
    const e = 0.01;
    const p0 = d.clone().multiplyScalar(_SM_SKY_R).project(cam);
    const pt = d.clone().multiplyScalar(_SM_SKY_R).addScaledVector(t, _SM_SKY_R * e).project(cam);
    const pu = d.clone().multiplyScalar(_SM_SKY_R).addScaledVector(u, _SM_SKY_R * e).project(cam);
    const aT = Math.atan2(pt.y - p0.y, pt.x - p0.x);
    const aU = Math.atan2(pu.y - p0.y, pu.x - p0.x);
    const wrap = (x) => Math.atan2(Math.sin(x), Math.cos(x));
    return Math.abs(wrap(aU - (aT + Math.PI / 2))) <= Math.PI / 2 ? aT : aT + Math.PI;
}
