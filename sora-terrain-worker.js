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
// 受信: { reqId, url, pts: [{ idx, pX, pY }] }
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
            const o = (p.pY * 256 + p.pX) * 4;
            const v = elevFromRGB(img[o], img[o + 1], img[o + 2]);
            out[i] = { idx: p.idx, elev: (v === null) ? 0 : v };
        }
        if (bmp.close) bmp.close();
    } catch (err) {
        for (let i = 0; i < pts.length; i++) out[i] = { idx: pts[i].idx, elev: 0 };
    }
    self.postMessage({ reqId, elevs: out });
};
