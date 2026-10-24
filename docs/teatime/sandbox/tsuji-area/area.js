// node area.js [occl=0|1] [steps]  — area.html を http://127.0.0.1:8102/ で配っている前提。out/area_<occl>_t{20,40,60}.png と計測を出す。
const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => {
  const occl = process.argv[2] || '0', steps = process.argv[3] || '48';
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'] });
  const p = await b.newPage(); p.on('console', m => { if (m.type() === 'error') console.log('console', m.text()); });
  await p.goto(`http://127.0.0.1:8102/area.html?occl=${occl}&steps=${steps}`); await p.waitForFunction(() => window.__done, null, { timeout: 600000 });
  const err = await p.evaluate(() => window.__err); if (err) { console.log('ERR', err); await b.close(); process.exit(1); }
  const r = await p.evaluate(() => window.__result); const pngs = await p.evaluate(() => window.__pngs); fs.mkdirSync('out', { recursive: true });
  for (const k of Object.keys(pngs)) fs.writeFileSync(`out/area_occl${occl}_${k}.png`, Buffer.from(pngs[k].split(',')[1], 'base64'));
  console.log(JSON.stringify(r)); await b.close();
})();
