// 第37ラウンド検証: URL由来値のセッション限定化(依頼者決定)+海外DEM対応+懸案対応
// (1)URLで開いたセッションではURLが変えた項目を保存しない(再訪で自分の保存値に戻る)
// (2)表示中セットのMy系編集で行アイコン即👎 (3)Drive指紋はアップロード内容から計算(👍偽装解消)
// (4)ctrlの花火モードラベル金字 (5)海外DEM(Terrarium)フォールバック (6)DP365死にコード整理
// ローカルハーネス(vendor)。外部への実アクセスは行わない(route abort)。
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
    check('W0 APP_VERSION 1.39.0', src.includes("APP_VERSION = '1.39.0'"));
    check('W0 onloadのDP365死に分岐が整理されている', !/isDP365Active\) \{\s*\n\s*document\.getElementById\('btn-dp365'\)\.classList\.add/.test(src));
  }
  const b=await chromium.launch({executablePath:EXE,headless:true,args:ARGS});
  const ctx=await b.newContext({viewport:{width:1000,height:900},timezoneId:'Asia/Tokyo'});
  await ctx.route('**/*', route => {   // テスト方針: ローカル以外への実アクセスを遮断
    route.request().url().startsWith(BASE) ? route.continue() : route.abort();
  });
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));

  // W1: URLセッション限定化 — 通常訪問で保存→共有URLで開いて保存が走っても→再訪で自分の値
  {
    await p.goto(BASE+'/index.html',{waitUntil:'load'});
    await p.waitForFunction(()=>typeof glMap==='object'&&glMap!==null,{timeout:10000});
    await p.evaluate(()=>{ appState.start={lat:35.18,lng:136.9,elev:50}; appState.tsujiSearchDays=100; saveAppState(); });
    await p.goto(BASE+'/index.html?mode=tsujisearch&startLat=35.5&startLng=138.8&endLat=35.36&endLng=138.73&tsujiSearchDays=200&tsujiAz=99&tsujiAlt=1&starId=Sun',{waitUntil:'load'});
    await p.waitForFunction(()=>typeof glMap==='object'&&glMap!==null,{timeout:10000});
    await p.waitForTimeout(1200);
    const inUrl=await p.evaluate(()=>{
      const frozen=Object.keys(_urlSessionFrozen||{});
      saveAppState();   // URLセッション中の任意の操作(保存)を再現
      const saved=JSON.parse(localStorage.getItem('soranotsuji_app'));
      return { hasFrozen: frozen.includes('start')&&frozen.includes('tsujiSearchDays'),
               appLat: appState.start.lat, savedLat: saved.start.lat, savedDays: saved.tsujiSearchDays };
    });
    check('W1 URLセッション中: 画面はURL値・保存は自分の値のまま(凍結)',
      inUrl.hasFrozen&&inUrl.appLat===35.5&&inUrl.savedLat===35.18&&inUrl.savedDays===100, JSON.stringify(inUrl));
    await p.goto(BASE+'/index.html',{waitUntil:'load'});
    await p.waitForFunction(()=>typeof glMap==='object'&&glMap!==null,{timeout:10000});
    const after=await p.evaluate(()=>({ lat: appState.start.lat, days: appState.tsujiSearchDays, off: _urlSessionFrozen===null }));
    check('W1 再訪(通常URL)で自分の保存値に復帰・凍結は解除',
      after.lat===35.18&&after.days===100&&after.off, JSON.stringify(after));
  }

  await p.waitForTimeout(300);

  // W2: 表示中セットのMy系編集で行アイコン即👎+シート未紐付けは対象外
  {
    const r=await p.evaluate(()=>{
      appState.mySetHome.sheetId='sheet0'; mySetSheetStates[0]='ok';
      setMyTsujiDirty(true);
      const tsujiStale=mySetSheetStates[0]==='stale';
      mySetSheetStates[0]='ok';
      addMyStar('検証星W2', 5.5, 30);
      const starStale=mySetSheetStates[0]==='stale';
      appState.myStars=appState.myStars.filter(s=>s.name!=='検証星W2');
      appState.mySetHome.sheetId=null; mySetSheetStates[0]='ok';
      setMyPointDirty('obs', true);
      const noSheet=mySetSheetStates[0]==='ok';
      setMyTsujiDirty(false); setMyPointDirty('obs', false);
      return { tsujiStale, starStale, noSheet };
    });
    check('W2 表示中セットの編集(辻検索dirty/My天体追加)で行アイコン即👎・未紐付けは不変',
      r.tsujiStale&&r.starStale&&r.noSheet, JSON.stringify(r));
  }

  // W3: Drive指紋=アップロードした内容から計算(アップロード中の編集で👍が偽装されない)
  {
    const r=await p.evaluate(async()=>{
      window.isGoogleLoggedIn=()=>true;
      window.ensureSoraFolders=async()=>{};
      window.resolveAppFile=async()=>{};
      appState.googleDrive.appFileId='f1';
      window.driveUploadJson=async(id,name,parents,content)=>{
        appState.myObservations.push({id:77,name:'編集中',lat:1,lng:2,elev:3,height:0});   // アップロード中の編集
        saveAppState();
        return { id:'f1', modifiedTime:'2026-07-20T12:00:00Z', size:new TextEncoder().encode(content).length };
      };
      const oa=window.alert; window.alert=()=>{};
      await saveAppToDrive();
      window.alert=oa;
      const mismatch=localContentFingerprint()!==appState.googleDrive.lastSyncFingerprint;
      appState.myObservations=appState.myObservations.filter(o=>o.id!==77); saveAppState();
      return { mismatch };
    });
    check('W3 アップロード中の編集は指紋不一致になる(次チェックで正しく👎)', r.mismatch);
  }

  // W4: ctrlの「:花火モード」ラベルが金字
  {
    const r=await p.evaluate(()=>getComputedStyle(document.querySelector('label[for="chk-sora-ctrl-fw"]')).color);
    check('W4 宙の窓ctrlの花火モードラベルが金字(#ffd700)', r==='rgb(255, 215, 0)', r);
  }

  check('W9 ページエラーなし', errs.length===0, errs.slice(0,3).join(' | '));

  await b.close();
  console.log(`\n結果: PASS=${PASS} FAIL=${FAIL}`);
  process.exit(FAIL?1:0);
})().catch(e=>{ console.error('FATAL', e); process.exit(1); });
