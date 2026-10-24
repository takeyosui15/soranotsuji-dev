// node render.js cfg_a.json [cfg_b.json ...]  — sky.html を http://127.0.0.1:8100/ で配っている前提。out/<cfg名>_{map,dome,win}.png を書く。
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright-core');
(async () => {
  const cfgs = process.argv.slice(2); if (!cfgs.length) { console.log('usage: node render.js cfg.json ...'); process.exit(1); }
  fs.mkdirSync('out', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1300, height: 2400 } });
  for (const cfg of cfgs) {
    await p.goto('http://127.0.0.1:8100/sky.html?cfg=' + encodeURIComponent(cfg)); await p.waitForFunction(() => window.__done, null, { timeout: 120000 });
    const err = await p.evaluate(() => window.__err); if (err) { console.log('ERR', cfg, err); continue; }
    console.log(JSON.stringify(await p.evaluate(() => window.__info)));
    const pngs = await p.evaluate(() => window.__pngs); const tag = path.basename(cfg, '.json');
    for (const k of Object.keys(pngs)) fs.writeFileSync(`out/${tag}_${k}.png`, Buffer.from(pngs[k].split(',')[1], 'base64'));
  }
  await b.close();
})();
