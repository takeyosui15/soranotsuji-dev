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
*/

// 宙の窓 DEM地形タイル取得 Web Worker
// メインスレッドから 1タイルのURLと、そのタイル内で標高が必要なサブピクセル群を受け取り、
// fetch → PNGデコード(createImageBitmap / OffscreenCanvas) → 標高(GSI dem_png方式) を計算して返す。
// ネットワークとデコードをワーカーにオフロードし、メインスレッドのプレビュー描画を軽く保つ。
//
// 受信: { reqId, url, pts: [{ idx, pX, pY, fX, fY }] }   (fX/fY=小数画素座標。バイリニア補間に使用)
// 返信: { reqId, elevs: [{ idx, elev }] }   (取得/デコード失敗時は elev=0)

const POW2_8 = Math.pow(2, 8);
const POW2_16 = Math.pow(2, 16);
const POW2_23 = Math.pow(2, 23);
const POW2_24 = Math.pow(2, 24);

// GSI 標高タイル(dem_png)のRGB→標高(m)変換。script.js の _elevFromRGB と同一式。
function elevFromRGB(r, g, b) {
    if (r === 128 && g === 0 && b === 0) return null;   // 無効値(データ無し)
    const d = r * POW2_16 + g * POW2_8 + b;
    let h = (d < POW2_23) ? d : d - POW2_24;
    if (h === -POW2_23) h = 0; else h *= 0.01;
    return h;
}

// 小数画素座標(fX,fY)のバイリニア補間。script.js の _bilinearElevFromImg と同一実装。
// 無効画素が4近傍に混じる場合は従来の最近傍参照へフォールバック(null=全て無効)。
function bilinearElev(data, fX, fY) {
    const gx = Math.min(255, Math.max(0, fX - 0.5));
    const gy = Math.min(255, Math.max(0, fY - 0.5));
    const x0 = Math.floor(gx), y0 = Math.floor(gy);
    const x1 = Math.min(255, x0 + 1), y1 = Math.min(255, y0 + 1);
    const wx = gx - x0, wy = gy - y0;
    const at = (x, y) => { const o = (y * 256 + x) * 4; return elevFromRGB(data[o], data[o + 1], data[o + 2]); };
    const v00 = at(x0, y0), v10 = at(x1, y0), v01 = at(x0, y1), v11 = at(x1, y1);
    if (v00 === null || v10 === null || v01 === null || v11 === null) {
        return at(Math.min(255, Math.floor(fX)), Math.min(255, Math.floor(fY)));
    }
    return v00 * (1 - wx) * (1 - wy) + v10 * wx * (1 - wy) + v01 * (1 - wx) * wy + v11 * wx * wy;
}

self.onmessage = async (e) => {
    const { reqId, url, pts } = e.data;
    const out = new Array(pts.length);
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const blob = await resp.blob();
        const bmp = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(256, 256);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(bmp, 0, 0, 256, 256);
        const img = ctx.getImageData(0, 0, 256, 256).data;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            const v = (p.fX !== undefined)
                ? bilinearElev(img, p.fX, p.fY)
                : elevFromRGB(img[(p.pY * 256 + p.pX) * 4], img[(p.pY * 256 + p.pX) * 4 + 1], img[(p.pY * 256 + p.pX) * 4 + 2]);
            out[i] = { idx: p.idx, elev: (v === null) ? 0 : v };
        }
        if (bmp.close) bmp.close();
    } catch (err) {
        for (let i = 0; i < pts.length; i++) out[i] = { idx: pts[i].idx, elev: 0 };
    }
    self.postMessage({ reqId, elevs: out });
};
