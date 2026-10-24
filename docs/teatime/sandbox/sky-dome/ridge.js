// node ridge.js ridge_cfg.json  — ridge.html を http://127.0.0.1:8101/ で配っている前提。<cfg名>.out.json に稜線(方位→見かけの高度角)を書く。
const { chromium } = require('playwright-core'); const fs = require('fs'); const path = require('path');
(async () => {
  const cfgs = process.argv.slice(2); if (!cfgs.length) { console.log('usage: node ridge.js cfg.json ...'); process.exit(1); }
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }); const p = await b.newPage();
  for (const cfg of cfgs) {
    await p.goto('http://127.0.0.1:8101/ridge.html?cfg=' + encodeURIComponent(cfg)); await p.waitForFunction(() => window.__done, null, { timeout: 300000 });
    const err = await p.evaluate(() => window.__err); if (err) { console.log('ERR', cfg, err); continue; }
    const r = await p.evaluate(() => window.__ridge); const out = path.basename(cfg, '.json') + '.out.json'; fs.writeFileSync(out, JSON.stringify(r));
    const mx = Math.max(...r.el), i = r.el.indexOf(mx); console.log(JSON.stringify({ cfg, out, h0: r.h0, demH0: r.demH0, tiles: r.tiles, maxEl: mx, atAz: r.az[i], dist: r.dist[i], top: r.top[i] }));
  }
  await b.close();
})();
