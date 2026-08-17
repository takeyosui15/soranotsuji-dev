// 第99ラウンド検証: v1.81.0
// リリース前の最終修正: 観測点の回転ボタン(◀︎左回転/右回転▶︎)。
//   目的点中心の水平1°の回り込み(距離保持)・プレビューは向きも同角で回る(目的点が中心に留まる)・
//   読みに「回転±N°」・リセットで戻る・位置反映で確定(基準方位角の再計算が回転を引き継ぐ)。
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
check('V0 版数ピン 1.81.0', /APP_VERSION = '1\.81\.0'/.test(src));
check('V0 Version Historyに1.81.0の行がある', src.includes('Version 1.81.0 - ') || !!process.argv[2]);
check('V1 2描画経路のカメラ角に回転が入っている',
  (src.match(/_smObsRot\.az;   \/\/ \+観測点の回転プレビュー/g) || []).length === 2);

(async()=>{
  const b=await chromium.launch({executablePath:EXE,headless:true,args:ARGS});
  const ctx=await b.newContext({viewport:{width:900,height:900},timezoneId:'Asia/Tokyo'});
  await ctx.route('**/*', route => { route.request().url().startsWith(BASE) ? route.continue() : route.abort(); });
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(BASE+'/index.html',{waitUntil:'load'});
  await p.waitForFunction(()=>typeof _smObsRotMove==='function',{timeout:8000});
  await p.waitForTimeout(400);

  // B1: 部品と並び(カメラ段の両脇)
  {
    const r=await p.evaluate(()=>{
      const row=document.getElementById('btn-sora-cam-left').closest('.control-row');
      const ids=[...row.querySelectorAll('button')].map(b=>b.id);
      return { ids };
    });
    check('B1 カメラ段が「左回転・📷左・📷下・📷上・📷右・右回転」の6ボタン',
      JSON.stringify(r.ids)===JSON.stringify(['btn-sora-move-rot-left','btn-sora-cam-left','btn-sora-cam-down','btn-sora-cam-up','btn-sora-cam-right','btn-sora-move-rot-right']), JSON.stringify(r.ids));
  }

  // R1: 回転の幾何(距離保持・向きの追従・読み・リセット)
  {
    const r=await p.evaluate(()=>{
      window.confirm=()=>true; window.alert=()=>{};
      // 目的点を観測点の真北10kmに置く(局所平面で検証しやすい形)
      const lat0=35.0, lng0=139.0;
      appState.start={lat:lat0,lng:lng0,elev:0}; appState.startApiElev=0; appState.startHeight=0;
      appState.end={lat:lat0+10000/111320,lng:lng0,elev:0};
      appState.soraBaseAz=0; appState.soraOffsetAz=0;
      _smObsNudge={e:0,n:0,u:0}; _smObsRot={az:0,e:0,n:0};
      _smObsRotMove(1);   // 左回転1°
      const d0=10000;
      const dist=Math.hypot(10000-_smObsRot.n, 0-_smObsRot.e);   // 回転後の目的点までの距離
      const west=_smObsRot.e<0;   // 左回り込み=西へ動く
      const readout=document.getElementById('sora-move-readout').textContent;
      const az=_smObsRot.az;
      _smObsRotMove(-1); _smObsRotMove(-1);   // 右回転2回→合計-1°
      const az2=_smObsRot.az;
      document.getElementById('btn-sora-move-reset').click();
      const cleared=_smObsRot.az===0&&_smObsRot.e===0&&_smObsRot.n===0;
      return { dist, west, readout, az, az2, cleared, distErr: Math.abs(dist-d0) };
    });
    check('R1 左回転1°で観測点が西へ回り込み、目的点までの距離は保たれる(誤差<1mm)',
      r.west&&r.distErr<0.001, JSON.stringify({west:r.west,distErr:r.distErr}));
    check('R1 読みに「回転+1°」が出る・累計角(+1→-1)・リセットで全て戻る',
      r.readout.includes('回転+1°')&&r.az===1&&r.az2===-1&&r.cleared, JSON.stringify({readout:r.readout,az:r.az,az2:r.az2,cleared:r.cleared}));
  }

  // R2: 位置反映で確定(回転分の位置が緯度経度へ・回転角はクリア・基準方位角が再計算で引き継ぐ)
  {
    const r=await p.evaluate(async()=>{
      getElevation=async()=>0;   // 標高APIはモック
      const lat0=35.0, lng0=139.0;
      appState.start={lat:lat0,lng:lng0,elev:0}; appState.startApiElev=0; appState.startHeight=0;
      appState.end={lat:lat0+10000/111320,lng:lng0,elev:0};
      appState.soraBaseAz=0; appState.soraOffsetAz=0;
      _smObsNudge={e:0,n:0,u:0}; _smObsRot={az:0,e:0,n:0};
      _smObsRotMove(1);
      const rotE=_smObsRot.e;
      await _smObsNudgeApply();
      await new Promise(r=>setTimeout(r,300));
      const dLngM=(appState.start.lng-lng0)*111320*Math.cos(lat0*Math.PI/180);
      return { moved: Math.abs(dLngM-rotE)<0.01, rotAz: _smObsRot.az, rotE, dLngM,
               baseAz: appState.soraBaseAz };
    });
    // 西へ約175m(10km×sin1°)動き、新しい基準方位角は約+1°(北より東へ=目的点が北東方向)
    check('R2 位置反映: 回転分の位置が緯度経度へ確定し、回転角はクリアされる',
      r.moved&&r.rotAz===0, JSON.stringify({moved:r.moved,rotAz:r.rotAz,rotE:+r.rotE.toFixed(1)}));
    check('R2 確定後の基準方位角は再計算で約+1°(回転を引き継ぐ=二重回転なし)',
      Math.abs(r.baseAz-1)<0.02, String(r.baseAz));
  }

  check('E1 ページエラーなし', errs.length===0, errs.join(' | ').slice(0,300));
  await ctx.close();
  console.log(`---- PASS=${PASS} FAIL=${FAIL}`);
  await b.close();
  process.exit(FAIL?1:0);
})().catch(e=>{ console.error('HARNESS ERROR:',e); process.exit(2); });
