// 辻ライン (DP線) 計算 Web Worker
// メインスレッドから 1天体・1時間分のチャンクを受け取り、
// サンプリング間隔ごとに可視点 (altitude > limit) を計算する。
//
// 各時刻で観測点位置を反復補正することで以下の精度を確保:
//   - 月などの視差: 実際の観測点位置で天体方位を再計算
//   - 球面 R 近似: 観測点緯度に応じた WGS84 局所半径を使用
//
// 反復中の位置計算は球面近似 (高速)。最終的な lat/lng は
// main thread 側で GeographicLib による正確な back-azimuth 計算で確定する。
//
// このWorkerはプール内で再利用される設計のため、起動時のオーバーヘッドを
// 1度だけ負担して、以降のメッセージは postMessage のみで処理する。

importScripts('https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js');

const A = (typeof Astronomy !== 'undefined') ? Astronomy
        : (typeof self !== 'undefined' && self.Astronomy) ? self.Astronomy
        : null;

if (!A) {
    self.postMessage({ error: 'Astronomy engine failed to load in DP line worker.' });
}

// WGS84 楕円体パラメータ
const WGS84_A = 6378137;
const WGS84_B = 6356752.3142;

/** 観測点緯度における WGS84 局所地球半径 */
function getLocalEarthRadius(latDeg) {
    const lat = latDeg * Math.PI / 180;
    const cosLat = Math.cos(lat), sinLat = Math.sin(lat);
    const a2cos2 = (WGS84_A * WGS84_A) * cosLat * cosLat;
    const b2sin2 = (WGS84_B * WGS84_B) * sinLat * sinLat;
    const acos = WGS84_A * cosLat;
    const bsin = WGS84_B * sinLat;
    return Math.sqrt((WGS84_A * a2cos2 + WGS84_B * WGS84_B * b2sin2) /
                     (acos * acos + bsin * bsin));
}

/** 観測高度 altObs に目的点が見える地表距離 (球面近似、局所半径使用) */
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

/** 球面上の destination point (反復用の近似計算、GeographicLib 不要) */
function getDestinationSpherical(lat1Deg, lng1Deg, azDeg, distMeters) {
    const R = 6371000; // 平均地球半径
    const lat1 = lat1Deg * Math.PI / 180;
    const lng1 = lng1Deg * Math.PI / 180;
    const az = azDeg * Math.PI / 180;
    const d = distMeters / R;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(az));
    const lng2 = lng1 + Math.atan2(Math.sin(az) * Math.sin(d) * Math.cos(lat1),
                                    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
    return { lat: lat2 * 180 / Math.PI, lng: lng2 * 180 / Math.PI };
}

self.onmessage = (e) => {
    if (!A) {
        self.postMessage({ error: 'Astronomy engine not available' });
        return;
    }

    const {
        body, observerData, targetData, refractionEnabled, k,
        startOfDayMs, hourStart, hourEnd,
        valElev, targetElev, limit, distLimit,
        taskId,
        stepSeconds
    } = e.data;

    const refr = refractionEnabled ? 'normal' : null;
    const points = [];
    const stepSec = (stepSeconds && stepSeconds > 0) ? stepSeconds : 1;
    const startSec = hourStart * 3600;
    const endSec = hourEnd * 3600;

    // targetData が渡されている場合は反復補正を行う
    const hasTarget = targetData && targetData.lat != null && targetData.lng != null;
    const initObs = new A.Observer(observerData.lat, observerData.lng, observerData.elev);

    for (let s = startSec; s < endSec; s += stepSec) {
        const time = new Date(startOfDayMs + s * 1000);

        let curObs = initObs;
        let curLat = observerData.lat;
        let lastAz = null, lastDist = null;
        let limitReached = false;

        // 反復補正: 観測点位置を球面近似で更新しながら天体方位を再計算
        const maxIter = hasTarget ? 3 : 1;
        for (let iter = 0; iter < maxIter; iter++) {
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

            lastAz = hor.azimuth;
            lastDist = dist;

            // 反復: 球面近似で候補観測点を計算し、観測者を更新
            if (hasTarget && iter < maxIter - 1) {
                const reverseAz = (hor.azimuth + 180) % 360;
                const approxDest = getDestinationSpherical(targetData.lat, targetData.lng, reverseAz, dist);

                // 収束チェック (前回位置との差 < 1m)
                if (iter > 0) {
                    const dLat = approxDest.lat - curLat;
                    const dLng = approxDest.lng - observerData.lng; // 簡易比較
                    if (Math.sqrt(dLat * dLat + dLng * dLng) * 111000 < 1) break;
                }

                curLat = approxDest.lat;
                curObs = new A.Observer(approxDest.lat, approxDest.lng, valElev);
            }
        }

        if (!limitReached && lastAz != null && lastDist != null) {
            points.push({ dist: lastDist, az: lastAz, timeMs: time.getTime() });
        }
    }
    self.postMessage({ points, hourStart, taskId });
};
