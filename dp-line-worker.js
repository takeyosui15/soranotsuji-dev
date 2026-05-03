// 辻ライン (DP線) 計算 Web Worker
// メインスレッドから 1天体・1時間分のチャンクを受け取り、
// 1秒単位でサンプリングして可視点 (altitude > limit) のみを返す。
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

const EARTH_RADIUS = 6378137;

// 観測者高 hObs から、ターゲット高 hTarget が観測高度 altObs に見える距離を返す
function calculateDistanceForAltitudes(altObs, hObs, hTarget, k) {
    const R = EARTH_RADIUS;
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

self.onmessage = (e) => {
    if (!A) {
        self.postMessage({ error: 'Astronomy engine not available' });
        return;
    }

    const {
        body, observerData, refractionEnabled, k,
        startOfDayMs, hourStart, hourEnd,
        valElev, targetElev, limit, distLimit,
        taskId
    } = e.data;

    const observer = new A.Observer(observerData.lat, observerData.lng, observerData.elev);
    const refr = refractionEnabled ? 'normal' : null;
    const points = [];

    const startSec = hourStart * 3600;
    const endSec = hourEnd * 3600;

    for (let s = startSec; s < endSec; s++) {
        const time = new Date(startOfDayMs + s * 1000);
        let r, d;
        if (body.fixed) {
            r = body.ra;
            d = body.dec;
        } else {
            const eq = A.Equator(body.id, time, observer, true, true);
            r = eq.ra;
            d = eq.dec;
        }
        const hor = A.Horizon(time, observer, r, d, refr);
        if (hor.altitude > limit) {
            const dist = calculateDistanceForAltitudes(hor.altitude, valElev, targetElev, k);
            if (dist > 0 && dist < distLimit) {
                points.push({ dist, az: hor.azimuth, timeMs: time.getTime() });
            }
        }
    }
    self.postMessage({ points, hourStart, taskId });
};
