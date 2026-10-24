// 雲頂強調(SND)で青〜赤に塗られた画素の、仮置きの階調→温度(黒320K・白180K)での輝度温度の分布。凡例は 240K(青)→200K(赤)。
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }); const p = await b.newPage();
  await p.goto('http://127.0.0.1:8100/sky.html?cfg=none').catch(()=>{});
  for (const [dir, z, x0, y0] of [['tiles_tsub',6,55,24],['tiles_ty_fd',5,25,12]]) {
    const r = await p.evaluate(async ([dir, z, x0, y0]) => {
      const load = async (prod) => { const c = document.createElement('canvas'); c.width = 768; c.height = 768; const g = c.getContext('2d'); await Promise.all([0,1,2].flatMap(i => [0,1,2].map(j => new Promise(res => { const im = new Image(); im.onload = () => { g.drawImage(im, i*256, j*256); res(); }; im.onerror = () => res(); im.src = `${dir}/${prod}_${z}_${x0+i}_${y0+j}.jpg`; })))); return g.getImageData(0,0,768,768).data; };
      const snd = await load('snd'), ir = await load('b13'); const T = (l) => 320 - 140*l/255;
      const q = (arr) => { arr.sort((a,b)=>a-b); const at = (f) => arr[Math.floor(f*(arr.length-1))]; return arr.length ? { n: arr.length, p05: at(0.05), p50: at(0.5), p95: at(0.95) } : null; };
      const blue = [], red = [], gray = [];
      for (let k = 0; k < snd.length; k += 4) { const R=snd[k], G=snd[k+1], B=snd[k+2]; const l = ir[k]; if (l >= 254) continue; const sat = Math.max(R,G,B)-Math.min(R,G,B);
        if (sat > 80 && B > R+60) blue.push(T(l)); else if (sat > 80 && R > B+60) red.push(T(l)); else if (sat <= 10 && Math.max(R,G,B) > 170) gray.push(T(l)); }
      return { blue: q(blue), red: q(red), whiteGrayCloud: q(gray) };
    }, [dir, z, x0, y0]);
    console.log(dir, JSON.stringify(r));
  }
  // 太陽の方位・高度が 100km でどれだけ変わるか(2026-10-24 16:40 JST・富士山と、その北 100km・東 100km)
  const v = await p.evaluate(() => { const A = window.Astronomy; const d = new Date(Date.UTC(2026,9,24,7,40)); const f = (lat, lon) => { const o = new A.Observer(lat, lon, 0); const eq = A.Equator(A.Body.Sun, d, o, true, true); const h = A.Horizon(d, o, eq.ra, eq.dec, 'normal'); return [h.azimuth, h.altitude]; }; const a = f(35.3606,138.7274), n = f(35.3606+0.9,138.7274), e = f(35.3606,138.7274+1.1); return { fuji: a, north100: n, east100: e, dN: [n[0]-a[0], n[1]-a[1]], dE: [e[0]-a[0], e[1]-a[1]] }; });
  console.log('sun shift', JSON.stringify(v)); await b.close();
})();
