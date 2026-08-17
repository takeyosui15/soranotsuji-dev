// 第99→第100ラウンド検証: v1.82.0
// 観測点の回転ボタン(依頼者仕様): 観測点(観測者自身)を中心に「移動の向き」を回す。
//   カメラも位置も動かず、以後の前後左右の移動ボタンが回した向きで歩く。
//   段構成=1段目:左/後/前/右・2段目:左回転/下/上/右回転・3段目:読み・4段目:リセット/位置反映・
//   5段目:📷4・6段目:リセット/カメラ反映(第100ラウンドの依頼者指定)。
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE='http://127.0.0.1:8099';
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'];
let PASS=0, FAIL=0;
const check=(n,ok,d)=>{ console.log(`${ok?'PASS':'FAIL'} ${n}${d?'  '+d:''}`); ok?PASS++:FAIL++; };

const target = process.argv[2] || path.join(__dirname, '..', 'script.js');
const src = fs.readFileSync(target, 'utf8');

// ---- V0: 版数ピン(最新の検証が持つ) ----
check('V0 版数ピン 1.82.0', /APP_VERSION = '1\.82\.0'/.test(src));
check('V0 Version Historyに1.82.0の行がある', src.includes('Version 1.82.0 - ') || !!process.argv[2]);

(async()=>{
  const b=await chromium.launch({executablePath:EXE,headless:true,args:ARGS});
  const ctx=await b.newContext({viewport:{width:900,height:900},timezoneId:'Asia/Tokyo'});
  await ctx.route('**/*', route => { route.request().url().startsWith(BASE) ? route.continue() : route.abort(); });
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(BASE+'/index.html',{waitUntil:'load'});
  await p.waitForFunction(()=>typeof _smObsRotMove==='function',{timeout:8000});
  await p.waitForTimeout(400);

  // B1: 段構成(依頼者指定の6段)
  {
    const r=await p.evaluate(()=>{
      const rowOf=id=>document.getElementById(id).closest('.control-row');
      const ids=row=>[...row.querySelectorAll('button')].map(b=>b.id);
      const r1=rowOf('btn-sora-move-left'), r2=rowOf('btn-sora-move-rot-left'),
            r3=rowOf('btn-sora-move-reset'), r5=rowOf('btn-sora-cam-left'), r6=rowOf('btn-sora-cam-reset');
      const readoutRow=document.getElementById('sora-move-readout').closest('.control-row');
      return {
        row1: ids(r1), row2: ids(r2), row4: ids(r3), row5: ids(r5), row6: ids(r6),
        order: (r1.compareDocumentPosition(r2)&4) && (r2.compareDocumentPosition(readoutRow)&4) &&
               (readoutRow.compareDocumentPosition(r3)&4) && (r3.compareDocumentPosition(r5)&4) &&
               (r5.compareDocumentPosition(r6)&4) ? true : false };
    });
    check('B1 1段目=左/後/前/右', JSON.stringify(r.row1)===JSON.stringify(['btn-sora-move-left','btn-sora-move-back','btn-sora-move-fwd','btn-sora-move-right']), JSON.stringify(r.row1));
    check('B1 2段目=左回転/下/上/右回転', JSON.stringify(r.row2)===JSON.stringify(['btn-sora-move-rot-left','btn-sora-move-down','btn-sora-move-up','btn-sora-move-rot-right']), JSON.stringify(r.row2));
    check('B1 段の順序(移動→回転/縦→読み→リセット/位置反映→📷→リセット/カメラ反映)',
      r.order && JSON.stringify(r.row4)===JSON.stringify(['btn-sora-move-reset','btn-sora-move-apply']) &&
      JSON.stringify(r.row5)===JSON.stringify(['btn-sora-cam-left','btn-sora-cam-down','btn-sora-cam-up','btn-sora-cam-right']) &&
      JSON.stringify(r.row6)===JSON.stringify(['btn-sora-cam-reset','btn-sora-cam-apply']), JSON.stringify({order:r.order,row4:r.row4,row6:r.row6}));
  }

  // H1: 回転はカメラも位置も動かさない(移動の向きだけが回る)
  {
    const r=await p.evaluate(async()=>{
      window.confirm=()=>true; window.alert=()=>{};
      appState.soraBaseAz=0; appState.soraOffsetAz=0; appState.soraOffsetAlt=0;
      _smObsNudge={e:0,n:0,u:0}; _smMoveHeading=0; _smCamNudgeBase=null;
      document.getElementById('btn-sora-move-rot-right').click();
      await new Promise(r=>setTimeout(r,50));
      return { heading:_smMoveHeading, offAz:appState.soraOffsetAz, baseAz:appState.soraBaseAz,
               nudge:{..._smObsNudge}, readout:document.getElementById('sora-move-readout').textContent };
    });
    check('H1 右回転→移動の向き+1°のみ(カメラオフセット/基準方位角/観測点の移動は全て不変)',
      r.heading===1&&r.offAz===0&&r.baseAz===0&&!r.nudge.e&&!r.nudge.n&&!r.nudge.u, JSON.stringify(r));
    check('H1 読みに「回転+1°」が出る', r.readout==='移動中: 上+0.0m 前+0.0m 右+0.0m 回転+1°', r.readout);
  }

  // H2: 回した向きで歩く(北向き+右回転90°→「前▲」で東へ1m)+読みの分解も同じ向き基準
  {
    const r=await p.evaluate(async()=>{
      appState.soraBaseAz=0; appState.soraOffsetAz=0;
      _smObsNudge={e:0,n:0,u:0}; _smMoveHeading=90;
      document.getElementById('btn-sora-move-fwd').click();
      await new Promise(r=>setTimeout(r,50));
      const n={..._smObsNudge};
      const readout=document.getElementById('sora-move-readout').textContent;
      return { n, readout };
    });
    check('H2 北向き+回転90°の「前▲」は東へ1m(e≈1, n≈0)', Math.abs(r.n.e-1)<1e-9&&Math.abs(r.n.n)<1e-9, JSON.stringify(r.n));
    check('H2 読みは回した向き基準で「前+1.0m」(右ではない)', r.readout==='移動中: 上+0.0m 前+1.0m 右+0.0m 回転+90°', r.readout);
  }

  // H3: リセットで回転も戻る・位置反映は位置だけ確定し回転は残る
  {
    const r=await p.evaluate(async()=>{
      document.getElementById('btn-sora-move-reset').click();
      const afterReset={ heading:_smMoveHeading, nudge:{..._smObsNudge} };
      // 回転のみの状態で位置反映→何も確定しない(観測点は不変・回転は残る)
      getElevation=async()=>0;
      const lat0=appState.start.lat, lng0=appState.start.lng;
      _smMoveHeading=-5;
      await _smObsNudgeApply();
      const onlyRot={ latSame: appState.start.lat===lat0&&appState.start.lng===lng0, heading:_smMoveHeading };
      // 移動+回転で位置反映→位置は確定・回転は残る
      _smObsNudge={e:2,n:0,u:0};
      await _smObsNudgeApply();
      await new Promise(r=>setTimeout(r,200));
      const dEm=(appState.start.lng-lng0)*111320*Math.cos(lat0*Math.PI/180);
      const after={ moved: Math.abs(dEm-2)<0.01, heading:_smMoveHeading, nudge:{..._smObsNudge} };
      _smMoveHeading=0; _smObsNudgeReadout();
      return { afterReset, onlyRot, after };
    });
    check('H3 リセットで回転も0へ', r.afterReset.heading===0&&!r.afterReset.nudge.e, JSON.stringify(r.afterReset));
    check('H3 回転のみでは位置反映は何もしない(観測点不変・回転は残る)', r.onlyRot.latSame&&r.onlyRot.heading===-5, JSON.stringify(r.onlyRot));
    check('H3 移動+回転の位置反映=位置だけ確定(東2m)・回転は残る', r.after.moved&&r.after.heading===-5&&!r.after.nudge.e, JSON.stringify(r.after));
  }

  check('E1 ページエラーなし', errs.length===0, errs.join(' | ').slice(0,300));
  await ctx.close();
  console.log(`---- PASS=${PASS} FAIL=${FAIL}`);
  await b.close();
  process.exit(FAIL?1:0);
})().catch(e=>{ console.error('HARNESS ERROR:',e); process.exit(2); });
