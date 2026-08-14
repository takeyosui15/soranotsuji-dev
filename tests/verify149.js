// 第82ラウンド検証: v1.66.0
// 怒号の項目6: 「:天の川オプション」チェックボックス(4面+My辻行)と、オフセット中心角の±表示反転。
//   実体は基準点(baseOptMwBase)と同じ1状態(オン=オフセット点/オフ=中心座標。値は保持)。
//   ±は画面の入出力だけ反転(夏の天の川を上から見て時計回り=正)。内部・保存・URL・CSV・Fileは従来符号。
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
check('V0 版数ピン 1.66.0', /APP_VERSION = '1\.66\.0'/.test(src));
check('V0 Version Historyに1.66.0の行がある', src.includes('Version 1.66.0 - ') || !!process.argv[2]);

// ---- V1: 静的な形(実効角ヘルパーの使用箇所・Fileの生符号・既存行の正規化) ----
check('V1 getMilkyWayBaseRaDecが実効角(_mwEffOffsetAngle)を使う',
  /function getMilkyWayBaseRaDec\(\) \{\s*\n\s*const ang = _mwEffOffsetAngle\(\);/.test(src));
check('V1 検索記録(ctx)が実効角を記す(mwOff/mwOffAngle)',
  src.includes('mwOff: _mwEffOffsetAngle()') && (src.match(/mwOffAngle: _mwEffOffsetAngle\(\)/g) || []).length >= 2);
check('V1 File出力のオフセット中心角は内部符号のまま', src.includes("(Number(r.tsuji.mwOffsetAngle) || 0).toFixed(4) + '°'"));
check('V1 既存行の正規化(mwOffsetEnabled未定義→オン=従来挙動)', src.includes('if (t.mwOffsetEnabled === undefined) t.mwOffsetEnabled = true'));

(async()=>{
  const b=await chromium.launch({executablePath:EXE,headless:true,args:ARGS});
  const ctx=await b.newContext({viewport:{width:900,height:900},timezoneId:'Asia/Tokyo'});
  await ctx.route('**/*', route => { route.request().url().startsWith(BASE) ? route.continue() : route.abort(); });
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(BASE+'/index.html',{waitUntil:'load'});
  await p.waitForFunction(()=>typeof drawSoramado==='function',{timeout:8000});
  await p.waitForTimeout(800);

  const CHK_IDS=['chk-baseopt-mw-enable','chk-tsuji-mw-enable','chk-tsujimesh-mw-enable','chk-mwctrl-mw-enable'];
  const IN_IDS=['input-baseopt-mw-offset','input-tsuji-mw-offset','input-tsujimesh-mw-offset',
                'input-mwctrl-mw-offset','input-mwctrl-mw-offset-slider'];

  // W1: 初期状態(既定=中心座標)→チェック4面オフ・角度入力は無効
  {
    const r=await p.evaluate(([chkIds,inIds])=>({
      base: appState.baseOptMwBase,
      allOff: chkIds.every(id=>document.getElementById(id) && !document.getElementById(id).checked),
      allDisabled: inIds.every(id=>document.getElementById(id) && document.getElementById(id).disabled)
    }),[CHK_IDS,IN_IDS]);
    check('W1 初期状態: 既定=中心座標でチェック4面オフ・角度入力5個は無効', r.base==='center'&&r.allOff&&r.allDisabled, JSON.stringify(r));
  }

  // W2: チェックオン(辻検索面)→状態offset・ラジオ追従・4面オン・入力が有効に
  {
    const r=await p.evaluate(async([chkIds,inIds])=>{
      window.confirm=()=>true; window.alert=()=>{};
      const el=document.getElementById('chk-tsuji-mw-enable');
      el.checked=true; el.dispatchEvent(new Event('change',{bubbles:true}));
      await new Promise(r=>setTimeout(r,100));
      return {
        base: appState.baseOptMwBase,
        radioOffset: document.querySelector('input[name="baseopt-mw-base"][value="offset"]').checked,
        allOn: chkIds.every(id=>document.getElementById(id).checked),
        allEnabled: inIds.every(id=>!document.getElementById(id).disabled)
      };
    },[CHK_IDS,IN_IDS]);
    check('W2 チェックオン→baseOptMwBase=offset・ラジオも追従・4面オン・入力が有効', r.base==='offset'&&r.radioOffset&&r.allOn&&r.allEnabled, JSON.stringify(r));
  }

  // W3: チェックオフ(ctrl面)→状態center・ラジオ追従・4面オフ・入力無効(値は保持)
  {
    const r=await p.evaluate(async([chkIds,inIds])=>{
      appState.mwOffsetAngle=-30; syncBaseOptionUI();   // 保持の確認用に角度を仕込む
      const el=document.getElementById('chk-mwctrl-mw-enable');
      el.checked=false; el.dispatchEvent(new Event('change',{bubbles:true}));
      await new Promise(r=>setTimeout(r,100));
      return {
        base: appState.baseOptMwBase,
        radioCenter: document.querySelector('input[name="baseopt-mw-base"][value="center"]').checked,
        allOff: chkIds.every(id=>!document.getElementById(id).checked),
        allDisabled: inIds.every(id=>document.getElementById(id).disabled),
        kept: appState.mwOffsetAngle===-30,
        shown: document.getElementById('input-baseopt-mw-offset').value   // 表示は反転で30のまま
      };
    },[CHK_IDS,IN_IDS]);
    check('W3 チェックオフ→center・ラジオ追従・4面オフ・入力無効・値は保持(表示30)',
      r.base==='center'&&r.radioCenter&&r.allOff&&r.allDisabled&&r.kept&&r.shown==='30', JSON.stringify(r));
  }

  // W4: ラジオ→チェックの向き(オフセット点を選ぶと4面オン)
  {
    const r=await p.evaluate(async(chkIds)=>{
      const radio=document.querySelector('input[name="baseopt-mw-base"][value="offset"]');
      radio.checked=true; radio.dispatchEvent(new Event('change',{bubbles:true}));
      await new Promise(r=>setTimeout(r,100));
      return { base: appState.baseOptMwBase, allOn: chkIds.every(id=>document.getElementById(id).checked) };
    },CHK_IDS);
    check('W4 ラジオでオフセット点→チェック4面もオン', r.base==='offset'&&r.allOn, JSON.stringify(r));
  }

  // W5: 実効角: チェックオフ中は0(=中心座標のRA/Dec)・オン中は角度が効く
  {
    const r=await p.evaluate(()=>{
      appState.mwOffsetAngle=30;
      appState.baseOptMwBase='center';
      const c=getMilkyWayBaseRaDec();
      const e0=_mwEffOffsetAngle();
      appState.baseOptMwBase='offset';
      const o=getMilkyWayBaseRaDec();
      const e1=_mwEffOffsetAngle();
      return { centerIsBase: c.ra===MILKYWAY_RA&&c.dec===MILKYWAY_DEC, e0, e1,
               offsetDiffers: o.ra!==MILKYWAY_RA||o.dec!==MILKYWAY_DEC };
    });
    check('W5 実効角: オフ中は0で中心座標・オン中は角度30が効く',
      r.centerIsBase&&r.e0===0&&r.e1===30&&r.offsetDiffers, JSON.stringify(r));
  }

  // W6: ±表示反転の往復(内部-30→表示30 / 入力25→内部-25・4面の表示も25)
  {
    const r=await p.evaluate(async()=>{
      appState.mwOffsetAngle=-30; appState.baseOptMwBase='offset'; syncBaseOptionUI();
      const disp={ base: document.getElementById('input-baseopt-mw-offset').value,
                   ctrl: document.getElementById('input-mwctrl-mw-offset').value,
                   slider: document.getElementById('input-mwctrl-mw-offset-slider').value };
      const el=document.getElementById('input-tsuji-mw-offset');
      el.value='25'; el.dispatchEvent(new Event('change',{bubbles:true}));
      await new Promise(r=>setTimeout(r,100));
      const after={ state: appState.mwOffsetAngle,
                    mesh: document.getElementById('input-tsujimesh-mw-offset').value };
      const sl=document.getElementById('input-mwctrl-mw-offset-slider');
      sl.value='10'; sl.dispatchEvent(new Event('input',{bubbles:true}));
      await new Promise(r=>setTimeout(r,100));
      return { disp, after, sliderState: appState.mwOffsetAngle };
    });
    check('W6 表示反転: 内部-30→表示30(3面)', r.disp.base==='30'&&r.disp.ctrl==='30'&&r.disp.slider==='30', JSON.stringify(r.disp));
    check('W6 入力25→内部-25・相手面の表示も25 / スライダー10→内部-10',
      r.after.state===-25&&r.after.mesh==='25'&&r.sliderState===-10, JSON.stringify({after:r.after,slider:r.sliderState}));
  }

  // W7: My辻行の「:天の川オプション」(行ごと独立・表示反転・オフで実効0と入力無効・値は保持)
  {
    const r=await p.evaluate(async()=>{
      appState.myTsujiSearches=[];
      appState.baseOptMwBase='offset';   // 行の初期値がこの状態に合うことも見る
      addMyTsujiRow();
      const t=appState.myTsujiSearches[0];
      const initOn = t.mwOffsetEnabled===true;
      t.mwOffsetAngle=-30; renderMyTsujiSearches();
      const inp=document.querySelector(`.mytsuji-mw-offset[data-id="${t.id}"]`);
      const chk=document.querySelector(`.mytsuji-mw-enable[data-id="${t.id}"]`);
      const disp30 = inp.value==='30' && !inp.disabled && chk.checked;
      chk.checked=false; chk.dispatchEvent(new Event('change',{bubbles:true}));
      await new Promise(r=>setTimeout(r,50));
      const offRow = t.mwOffsetEnabled===false && inp.disabled===true && t.mwOffsetAngle===-30;
      const gated = (()=>{ const g=_myTsujiMwRaDec(t); return g.ra===MILKYWAY_RA&&g.dec===MILKYWAY_DEC; })();
      const globalUntouched = appState.baseOptMwBase==='offset';   // 行のチェックは全体に波及しない
      chk.checked=true; chk.dispatchEvent(new Event('change',{bubbles:true}));
      inp.disabled=false; inp.value='25'; inp.dispatchEvent(new Event('change',{bubbles:true}));
      await new Promise(r=>setTimeout(r,50));
      const typed = t.mwOffsetAngle===-25 && inp.value==='25';
      const ungated = (()=>{ const g=_myTsujiMwRaDec(t); return g.ra!==MILKYWAY_RA; })();
      appState.baseOptMwBase='center';
      addMyTsujiRow();
      const initOff = appState.myTsujiSearches[1].mwOffsetEnabled===false;   // 行の初期値は基本オプションに合わせる
      appState.myTsujiSearches=[]; renderMyTsujiSearches();
      return { initOn, disp30, offRow, gated, globalUntouched, typed, ungated, initOff };
    });
    check('W7 My辻行: 初期値追従・表示反転・オフで実効0/入力無効/値保持・全体に波及しない',
      r.initOn&&r.disp30&&r.offRow&&r.gated&&r.globalUntouched, JSON.stringify(r));
    check('W7 My辻行: 入力25→内部-25・再オンで角度が効く・center時の新規行はオフ',
      r.typed&&r.ungated&&r.initOff, JSON.stringify({typed:r.typed,ungated:r.ungated,initOff:r.initOff}));
  }

  // W8: CSVは内部符号のまま(表示反転しない)
  {
    const r=await p.evaluate(()=>{
      const csv=_buildMyTsujiCsv([{id:901,name:'RAWTEST',mwOffsetAngle:-13}]);
      const cols=csv.split('\r\n')[1].split(',');
      return { col13: cols[13] };
    });
    check('W8 CSV出力のオフセット中心角は内部符号-13のまま', r.col13==='-13', JSON.stringify(r));
  }

  check('E ページエラーなし', errs.length===0, errs.join(' | ').slice(0,300));
  await ctx.close();
  console.log(`---- PASS=${PASS} FAIL=${FAIL}`);
  await b.close();
  process.exit(FAIL?1:0);
})().catch(e=>{ console.error('HARNESS ERROR:',e); process.exit(2); });
