// REP(トゥルーカラー)の雲らしさ・海らしさで画素を分け、B13 の明るさの分布を見る(階調→温度の仮置きの検算)
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }); const p = await b.newPage();
  await p.goto('http://127.0.0.1:8100/sky.html?cfg=none').catch(()=>{});
  for (const [dir, z, x0, y0] of [['tiles_tsub',6,55,24],['tiles_ty_fd',5,25,12],['tiles_tsub_now',6,55,24]]) {
    const r = await p.evaluate(async ([dir, z, x0, y0]) => {
      const load = async (prod) => { const c = document.createElement('canvas'); c.width = 768; c.height = 768; const g = c.getContext('2d');
        await Promise.all([0,1,2].flatMap(i => [0,1,2].map(j => new Promise(res => { const im = new Image(); im.onload = () => { g.drawImage(im, i*256, j*256); res(); }; im.onerror = () => res(); im.src = `${dir}/${prod}_${z}_${x0+i}_${y0+j}.jpg`; })))); return g.getImageData(0,0,768,768).data; };
      const rep = await load('rep'), ir = await load('b13');
      const q = (arr) => { arr.sort((a,b)=>a-b); const at = (f) => arr[Math.floor(f*(arr.length-1))]; return arr.length ? [at(0.05), at(0.5), at(0.95), arr.length] : null; };
      const sea = [], land = [], cloud = [], all = [];
      for (let k = 0; k < rep.length; k += 4) { const R=rep[k], G=rep[k+1], B=rep[k+2]; const mx=Math.max(R,G,B), mn=Math.min(R,G,B); const lum=(0.299*R+0.587*G+0.114*B); const l = ir[k]; if (ir[k+3]===0) continue; all.push(l);
        if (mx < 10) continue; // 範囲外(黒)
        const sat = mx ? (mx-mn)/mx : 0;
        if (lum > 170 && sat < 0.25) cloud.push(l); else if (B > R+15 && lum < 110) sea.push(l); else if (lum < 150) land.push(l); }
      return { sea: q(sea), land: q(land), cloud: q(cloud), all: q(all) };
    }, [dir, z, x0, y0]);
    console.log(dir, JSON.stringify(r));
  }
  await b.close();
})();
