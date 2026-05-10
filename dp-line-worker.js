// 辻ライン (DP線) 計算 Web Worker
// メインスレッドから 1天体・1時間分のチャンクを受け取り、
// サンプリング間隔ごとに可視点 (altitude > limit) を計算する。
//
// 各時刻で観測点位置を反復補正することで以下の精度を確保:
//   - 子午線収差: GeographicLib の back-azimuth 反復解で対処
//   - 月などの視差: 実際の観測点位置で天体方位を再計算
//   - 球面 R 近似: 観測点緯度に応じた WGS84 局所半径を使用
//
// このWorkerはプール内で再利用される設計のため、起動時のオーバーヘッドを
// 1度だけ負担して、以降のメッセージは postMessage のみで処理する。

importScripts('https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js');
importScripts('https://geographiclib.sourceforge.io/scripts/geographiclib-geodesic.min.js');

const A = (typeof Astronomy !== 'undefined') ? Astronomy
        : (typeof self !== 'undefined' && self.Astronomy) ? self.Astronomy
        : null;
const G = (typeof geodesic !== 'undefined') ? geodesic
        : (typeof self !== 'undefined' && self.geodesic) ? self.geodesic
        : null;

if (!A) {
    self.postMessage({ error: 'Astronomy engine failed to load in DP line worker.' });
}
if (!G) {
    self.postMessage({ error: 'GeographicLib failed to load in DP line worker.' });
}

// WGS84 楕円体パラメータ
const WGS84_A = 6378137;          // 赤道半径 (semi-major)
const WGS84_B = 6356752.3142;     // 極半径 (semi-minor)

/** 観測点緯度における WGS84 局所地球半径 (子午線・卯酉線の幾何平均) */
function getLocalEarthRadius(latDeg) {
    const lat = latDeg * Math.PI / 180;
    const cosLat = Math.cos(lat), sinLat = Math.sin(lat);
    const a2cos2 = (WGS84_A * WGS84_A) * cosLat * cosLat;
    const b2sin2 = (WGS84_B * WGS84_B) * sinLat * sinLat;
    const acos2 = WGS84_A * cosLat;
    const bsin2 = WGS84_B * sinLat;
    return Math.sqrt((WGS84_A * a2cos2 + WGS84_B * WGS84_B * b2sin2) /
                     (acos2 * acos2 + bsin2 * bsin2));
}

/** 観測者高 hObs / ターゲット高 hTarget のとき、観測高度 altObs に見える距離。
 *  obsLat を渡すと WGS84 局所半径を使用、未指定時は赤道半径フォールバック。 */
function calculateDistanceForAltitudes(altObs, hObs, hTarget, k, obsLat) {
    const R = (typeof obsLat === 'number') ? getLocalEarthRadius(obsLat) : WGS84_A;
    const Reff = R / (1 - k);
    const r1 = R + hObs;
    const r2 = R + hTarget;
    const altObsRad = altObs * Math.PI / 180;

    let sinVal, altTargetRad, c;
    if (hObs <= hTarget) {
        sinVal = r1 / r2 * Math.sin(Math.PI / 2 + altObsRad);
        if (sinVal > 1) sinVal = 1;
        if (sinVal < -1) sinVal = -1;
        altTargetRad = Math.PI / 2 - Math.asin(sinVal);
        c = altTargetRad - altObsRad;
    } else {
        sinVal = r1 / r2 * Math.sin(Math.PI / 2 - altObsRad);
        if (sinVal > 1) sinVal = 1;
        if (sinVal < -1) sinVal = -1;
        altTargetRad = Math.asin(sinVal) - Math.PI / 2;
        c = -altObsRad - altTargetRad;
    }
    return Reff * c;
}

/** 目的点 (target) から「観測点 P → 目的点の方位 = desiredBearing」
 *  となる観測点 P を距離 L で求める。WGS84 上の Newton 反復解。 */
function getObserverFromTargetBackAzimuth(geod, targetLat, targetLng, desiredBearing, L) {
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

self.onmessage = (e) => {
    if (!A || !G) {
        self.postMessage({ error: 'Astronomy or GeographicLib not available' });
        return;
    }

    const {
        body, observerData, targetData, refractionEnabled, k,
        startOfDayMs, hourStart, hourEnd,
        valElev, targetElev, limit, distLimit,
        taskId,
        stepSeconds  // optional: サンプリング間隔(秒) デフォルト 1
    } = e.data;

    const geod = G.Geodesic.WGS84;
    const refr = refractionEnabled ? 'normal' : null;
    const points = [];
    const stepSec = (stepSeconds && stepSeconds > 0) ? stepSeconds : 1;
    const startSec = hourStart * 3600;
    const endSec = hourEnd * 3600;

    // 初期観測点 (反復のスタート地点)
    const initObs = new A.Observer(observerData.lat, observerData.lng, observerData.elev);

    for (let s = startSec; s < endSec; s += stepSec) {
        const time = new Date(startOfDayMs + s * 1000);

        // 反復補正: 観測点位置を更新しながら az/alt を再計算 (月の視差等を吸収)
        let curObs = initObs;
        let curLat = observerData.lat, curLng = observerData.lng;
        let dest = null;
        let lastAz = null, lastDist = null;
        let limitReached = false;

        for (let iter = 0; iter < 3; iter++) {
            let r, d;
            if (body.fixed) {
                r = body.ra;
                d = body.dec;
            } else {
                const eq = A.Equator(body.id, time, curObs, true, true);
                r = eq.ra;
                d = eq.dec;
            }
            const hor = A.Horizon(time, curObs, r, d, refr);
            if (hor.altitude <= limit) { limitReached = true; break; }

            const dist = calculateDistanceForAltitudes(hor.altitude, valElev, targetElev, k, curLat);
            if (dist <= 0 || dist >= distLimit) { limitReached = true; break; }

            // 観測点位置を更新
            const newDest = getObserverFromTargetBackAzimuth(
                geod, targetData.lat, targetData.lng, hor.azimuth, dist
            );

            // 収束チェック: 前回との位置差 < 1m なら早期 break (太陽はここで止まる)
            if (dest) {
                const dLat = newDest.lat - dest.lat;
                const dLng = newDest.lng - dest.lng;
                const approxMeters = Math.sqrt(dLat * dLat + dLng * dLng) * 111000;
                if (approxMeters < 1) {
                    dest = newDest; lastAz = hor.azimuth; lastDist = dist;
                    break;
                }
            }
            dest = newDest;
            lastAz = hor.azimuth;
            lastDist = dist;
            curLat = dest.lat;
            curLng = dest.lng;
            curObs = new A.Observer(curLat, curLng, valElev);
        }

        if (!limitReached && dest && lastDist != null) {
            points.push({
                dist: lastDist,
                az: lastAz,
                lat: dest.lat,
                lng: dest.lng,
                timeMs: time.getTime()
            });
        }
    }
    self.postMessage({ points, hourStart, taskId });
};
