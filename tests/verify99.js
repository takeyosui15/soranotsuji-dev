// 第11ラウンド検証: 宙の窓 花火モード(デッサン06 55〜70段目+ctrl41〜53段目)
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE='http://127.0.0.1:8099';
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'];
let PASS=0, FAIL=0;
const check=(n,ok,d)=>{ console.log(`${ok?'PASS':'FAIL'} ${n}${d?'  '+d:''}`); ok?PASS++:FAIL++; };
(async()=>{
  {
    const src=fs.readFileSync(path.join(__dirname, '..', 'script.js'),'utf8');
    check('F0 APP_VERSION 1.22.0', src.includes("APP_VERSION = '1.22.0'"));
  }
  const b=await chromium.launch({executablePath:EXE,headless:true,args:ARGS});
  const p=await (await b.newContext({viewport:{width:900,height:900},timezoneId:'Asia/Tokyo'})).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(BASE+'/index.html',{waitUntil:'load'});
  await p.waitForFunction(()=>typeof drawSoramado==='function',{timeout:8000});
  await p.waitForTimeout(800);

  // F1: UIの存在と初期値(メニュー/ctrl両方)
  {
    const r=await p.evaluate(()=>{
      const ids=['chk-sora-fw','input-fw-latlng','input-fw-api-elev','input-fw-height','input-fw-radius',
        'sel-fw-size','fw-ball-dia','fw-alt-lo','fw-alt-hi','fw-dia-lo','fw-dia-hi',
        'fw-spread-label','input-fw-spread','chk-sora-fw-point','input-fw-base-az','input-fw-base-alt',
        'chk-sora-ctrl-fw','input-fw-ctrl-latlng','input-fw-ctrl-api-elev','input-fw-ctrl-height','input-fw-ctrl-radius',
        'sel-fw-ctrl-size','fw-ctrl-ball-dia','fw-ctrl-alt-lo','fw-ctrl-alt-hi','fw-ctrl-dia-lo','fw-ctrl-dia-hi',
        'fw-ctrl-spread-label','input-fw-ctrl-spread','chk-sora-ctrl-fw-point'];
      const missing=ids.filter(id=>!document.getElementById(id));
      const modeR=document.querySelector('input[name="fw-mode"][value="vary"]');
      const modeRC=document.querySelector('input[name="fw-mode-ctrl"][value="vary"]');
      return { missing:missing.join(','),
        defaults: !appState.fwEnabled && appState.fwSize==='10' && appState.fwMode==='vary' &&
                  appState.fwSpread===0 && appState.fwShowPoint===true && appState.fwLat===null,
        modeChecked: modeR&&modeR.checked&&modeRC&&modeRC.checked };
    });
    check('F1 花火UI 全30要素+モードラジオが存在', r.missing===''&&!!r.modeChecked, r.missing);
    check('F1 初期値(オフ・10号・色々・ばらつき0・花火点オン・打ち上げ点未設定)', r.defaults);
  }

  // F2: 号数仕様の表示(選択で切替・メニュー/ctrlミラー)
  {
    const r=await p.evaluate(async()=>{
      window.confirm=()=>true; window.alert=()=>{};
      const sel=document.getElementById('sel-fw-size');
      sel.value='40'; sel.dispatchEvent(new Event('change'));
      await new Promise(r=>setTimeout(r,50));
      const v=id=>document.getElementById(id).value;
      const at40={ball:v('fw-ball-dia'),altLo:v('fw-alt-lo'),altHi:v('fw-alt-hi'),dia:v('fw-dia-lo'),ctrlBall:v('fw-ctrl-ball-dia'),ctrlSel:v('sel-fw-ctrl-size')};
      const selC=document.getElementById('sel-fw-ctrl-size');
      selC.value='2.5'; selC.dispatchEvent(new Event('change'));   // ctrl側からの変更もメニューへ連動
      await new Promise(r=>setTimeout(r,50));
      const at25={ball:v('fw-ball-dia'),alt:v('fw-alt-lo'),dia:v('fw-dia-hi'),mainSel:v('sel-fw-size'),state:appState.fwSize};
      sel.value='10'; sel.dispatchEvent(new Event('change'));
      return {at40,at25};
    });
    check('F2 40号仕様(120cm/700-750m/700m)+ctrlミラー',
      r.at40.ball==='120cm'&&r.at40.altLo==='700m'&&r.at40.altHi==='750m'&&r.at40.dia==='700m'&&r.at40.ctrlBall==='120cm'&&r.at40.ctrlSel==='40',
      JSON.stringify(r.at40));
    check('F2 ctrl→メニュー連動(2.5号: 7.5cm/80m/50m)',
      r.at25.ball==='7.5cm'&&r.at25.alt==='80m'&&r.at25.dia==='50m'&&r.at25.mainSel==='2.5'&&r.at25.state==='2.5',
      JSON.stringify(r.at25));
  }

  // F3: 固定モードでばらつき0固定・スライダー両ミラー
  {
    const r=await p.evaluate(async()=>{
      const sp=document.getElementById('input-fw-spread');
      sp.value='60'; sp.dispatchEvent(new Event('input'));
      const after60={state:appState.fwSpread,label:document.getElementById('fw-spread-label').textContent,
                     ctrl:document.getElementById('input-fw-ctrl-spread').value,ctrlLabel:document.getElementById('fw-ctrl-spread-label').textContent};
      const fixed=document.querySelector('input[name="fw-mode-ctrl"][value="fixed"]');
      fixed.checked=true; fixed.dispatchEvent(new Event('change'));
      const afterFixed={mode:appState.fwMode,spread:appState.fwSpread,
                        mainRadio:document.querySelector('input[name="fw-mode"][value="fixed"]').checked,
                        label:document.getElementById('fw-spread-label').textContent};
      const vary=document.querySelector('input[name="fw-mode"][value="vary"]');
      vary.checked=true; vary.dispatchEvent(new Event('change'));
      return {after60,afterFixed};
    });
    check('F3 ばらつきスライダー(+60)が両メニューへ反映', r.after60.state===60&&r.after60.label==='+60'&&r.after60.ctrl==='60'&&r.after60.ctrlLabel==='+60', JSON.stringify(r.after60));
    check('F3 固定モード選択でばらつき0+メニュー側ラジオ連動', r.afterFixed.mode==='fixed'&&r.afterFixed.spread===0&&r.afterFixed.mainRadio&&r.afterFixed.label==='0', JSON.stringify(r.afterFixed));
  }

  // F4: 打ち上げ点(緯度,経度直入力)→標高フォールバック・地図マーカー・基準方位角/視高度の算出
  {
    const r=await p.evaluate(async()=>{
      appState.start={lat:35.30,lng:138.60,elev:500}; appState.startApiElev=500; appState.startHeight=0;
      appState.end={lat:35.3606,lng:138.7274,elev:3776}; appState.endApiElev=3776; appState.endHeight=0;
      // 初期値(未設定): 打ち上げ点=目的点の座標を表示し、標高も目的点(endApiElev)に追従
      fwSyncUI();
      const initLoc=document.getElementById('input-fw-latlng').value;
      const initElev=document.getElementById('input-fw-api-elev').value;
      const initOk=(appState.fwLat===null)&&/35\.3606, 138\.7274/.test(initLoc)&&parseFloat(initElev)===3776&&fwEffElev()===3776;
      const el=document.getElementById('input-fw-latlng');
      el.value='35.36, 138.72'; el.dispatchEvent(new Event('change'));
      await new Promise(r=>setTimeout(r,600));   // getElevation(オフラインでnull→0)を待つ
      const chk=document.getElementById('chk-sora-fw');
      chk.checked=true; chk.dispatchEvent(new Event('change'));
      await new Promise(r=>setTimeout(r,100));
      const az=calculateBearing(35.30,138.60,35.36,138.72);
      const azShown=parseFloat(document.getElementById('input-fw-base-az').value);
      const altShown=parseFloat(document.getElementById('input-fw-base-alt').value);
      return { initOk, lat:appState.fwLat, lng:appState.fwLng, elev:appState.fwElev,
               ctrlLoc:document.getElementById('input-fw-ctrl-latlng').value,
               marker:!!_fwMapMarker, circle:!!_fwMapCircle,
               azOk:Math.abs(azShown-az)<0.05, altFinite:isFinite(altShown), enabled:appState.fwEnabled };
    });
    check('F4 初期値=目的点(座標表示+標高がendApiElevに追従)', r.initOk);
    check('F4 打ち上げ点の直入力→状態+ctrl表示', r.lat===35.36&&r.lng===138.72&&/35\.36, 138\.72/.test(r.ctrlLoc), r.ctrlLoc);
    check('F4 花火モードONで地図マーカー🎆+領域円', r.enabled&&r.marker&&r.circle);
    check('F4 基準方位角=観測点→花火点の方位・視高度が算出される', r.azOk&&r.altFinite);
  }

  // F5: 宙の窓を開いてアニメーション→花火が上がる(シーン内オブジェクト+実寸ENU)
  {
    const r=await p.evaluate(async()=>{
      if(!appState.isSoramadoActive) toggleSoramado();
      await new Promise(r=>setTimeout(r,1500));   // 起動+打ち上げ1発以上を待つ
      const shells=_fwShells.length, children=_fwGrp?_fwGrp.children.length:0;
      const anim=_fwAnimReq!==null;
      // 花火点(+)は depthTest:false のスプライト
      const findCross=()=>_fwGrp?_fwGrp.children.find(c=>c.isSprite):null;
      // 色々モード(既定): 花火点=40号の開花高度の高い方(750m)
      let cross=findCross();
      let crossOk=false;
      if(cross){
        const c0=_fwEnu(fwEffElev()+appState.fwHeight+FW_SHELLS[5].altHi);
        crossOk=Math.abs(cross.position.x-c0.E)<1&&Math.abs(cross.position.y-c0.N)<1&&Math.abs(cross.position.z-c0.z)<1;
      }
      // 固定モード+10号: 花火点=10号の開花高度(330m)へ移動
      const fixed=document.querySelector('input[name="fw-mode"][value="fixed"]');
      fixed.checked=true; fixed.dispatchEvent(new Event('change'));
      appState.fwSize='10';
      _fwUpdateScene(performance.now());
      cross=findCross();
      let crossFixedOk=false;
      if(cross){
        const c1=_fwEnu(fwEffElev()+appState.fwHeight+FW_SHELLS[3].altHi);
        crossFixedOk=Math.abs(cross.position.z-c1.z)<1;
      }
      const vary=document.querySelector('input[name="fw-mode"][value="vary"]');
      vary.checked=true; vary.dispatchEvent(new Event('change'));
      // 実寸: 打ち上げ点までの距離 ≈ getDistanceWGS84
      const d=getDistanceWGS84(appState.start.lat,appState.start.lng,35.36,138.72);
      const g=_fwEnu(0);
      const distOk=Math.abs(Math.hypot(g.E,g.N)-d)<1;
      return { shells, children, anim, crossOk, crossFixedOk, distOk };
    });
    check('F5 アニメーションループ起動+花火玉が打ち上がる', r.anim&&r.shells>0&&r.children>0, `shells=${r.shells} children=${r.children}`);
    check('F5 花火点(+)=色々モードは40号の開花高度(750m)', r.crossOk);
    check('F5 花火点(+)=固定モードは選択号数の開花高度(10号330m)', r.crossFixedOk);
    check('F5 実寸ENU(打ち上げ点距離=測地線距離)', r.distOk);
  }

  // F6: ばらつきの号数分布(+100→40号のみ / -100→2.5号のみ / 0→複数号数)
  {
    const r=await p.evaluate(async()=>{
      const vary=document.querySelector('input[name="fw-mode"][value="vary"]');
      vary.checked=true; vary.dispatchEvent(new Event('change'));
      const sample=(spread)=>{
        appState.fwSpread=spread;
        _fwShells=[];
        for(let i=0;i<60;i++) _fwSpawnShell(performance.now());
        const rs=_fwShells.map(s=>s.R);
        _fwShells=[];
        return rs;
      };
      const hi=sample(100), lo=sample(-100), mid=sample(0);
      appState.fwSpread=0;
      return {
        hiAll40: hi.every(R=>R>=349&&R<=351),          // 40号: 開花直径700m→R=350
        loAll25: lo.every(R=>R>=24&&R<=26),            // 2.5号: 開花直径50m→R=25
        midVariety: new Set(mid.map(R=>Math.round(R))).size>=3,
      };
    });
    check('F6 ばらつき+100=40号のみ', r.hiAll40);
    check('F6 ばらつき-100=2.5号のみ', r.loAll25);
    check('F6 ばらつき0=複数号数が混ざる', r.midVariety);
  }

  // F7: URL記憶(パラメータ付与)+短縮URLシード辞書v9の往復
  {
    const r=await p.evaluate(()=>{
      const params=buildCommonUrlParams('fixed');
      const keys=['fwEnabled','fwLat','fwLng','fwElev','fwHeight','fwRadius','fwSize','fwMode','fwSpread','fwShowPoint'];
      const missing=keys.filter(k=>!params.has(k));
      const enc=encodeQueryParam(params.toString());
      const dec=decodeQueryParam(enc);
      return { missing:missing.join(','), roundtrip: dec===params.toString(),
               v9: _QP_SEED_VERSIONS.length===9,
               vals:`${params.get('fwEnabled')}/${params.get('fwSize')}/${params.get('fwLat')}` };
    });
    check('F7 URLに花火パラメータ10種', r.missing==='', r.missing);
    check('F7 短縮URL(シード辞書v9)の往復一致', r.roundtrip&&r.v9, r.vals);
  }

  // F8: 花火モードOFF→アニメ停止・シーン/マーカー消去
  {
    const r=await p.evaluate(async()=>{
      const chk=document.getElementById('chk-sora-ctrl-fw');
      chk.checked=false; chk.dispatchEvent(new Event('change'));
      await new Promise(r=>setTimeout(r,150));
      return { anim:_fwAnimReq===null, children:_fwGrp.children.length, marker:!_fwMapMarker,
               mainChk:!document.getElementById('chk-sora-fw').checked };
    });
    check('F8 OFFでアニメ停止+花火/マーカー消去+メニュー側チェック連動', r.anim&&r.children===0&&r.marker&&r.mainChk, JSON.stringify(r));
  }

  check('E ページエラーなし', errs.length===0, errs.join(' | ').slice(0,300));
  console.log(`---- PASS=${PASS} FAIL=${FAIL}`);
  await b.close();
  process.exit(FAIL?1:0);
})().catch(e=>{ console.error('HARNESS ERROR:',e); process.exit(2); });
