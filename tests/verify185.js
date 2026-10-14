// 第180ラウンド検証: v1.98.1 — 「:自動更新」(Googleドライブ同期)のチェックがオフにできない件の直し。
// 従来はチェックが同期ダイアログ(👎の時だけ開く)の中にしか無く、自動更新が効いて👍のままだと辿り着けなかった。
// 直し: バックアップ/インポートメニューのGoogleドライブ欄にも同じチェックを置き、2か所を連動(_autoSyncSyncCheckboxes)。
// 方式: 静的な形(S)+実機(Playwright。ログイン無しで appState とチェックの連動だけを見る)。
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = 'http://127.0.0.1:8099';
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'];
let PASS = 0, FAIL = 0;
const check = (n, ok, d) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? '  ' + d : ''}`); ok ? PASS++ : FAIL++; };

const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// ---- V0: 版数ピン(最新のverifyが持つ) ----
check('V0 版数ピン 1.98.1+Version Historyに第180', /APP_VERSION = '1\.98\.1'/.test(src) && src.includes('Version 1.98.1 - ') && src.includes('第180ラウンド'));

// ---- S1: 2か所のチェックと連動の配線 ----
check('S1 index.html: バックアップメニューのGoogleドライブ欄に chk-gdrive-autosync-menu(:自動更新)があり、ダイアログの chk-gdrive-autosync も残っている・ヘルプに置き場所の説明',
  /id="chk-gdrive-autosync-menu"[^>]*>:自動更新/.test(html) && /id="chk-gdrive-autosync"[^>]*>:自動更新/.test(html) &&
  html.indexOf('id="chk-gdrive-autosync-menu"') < html.indexOf('id="gdrive-root-folder"') &&   // ログイン行の直後(フォルダ名の前)
  html.includes('どちらからでも切り替えられます'));
check('S2 script.js: 両方のチェックが同じハンドラ・_autoSyncSyncCheckboxes が2つのIDを揃える・updateBackupDriveUI から呼ぶ・👍の案内文に置き場所',
  src.includes("getElementById('chk-gdrive-autosync').addEventListener('change', onAutoSyncToggle)") &&
  src.includes("getElementById('chk-gdrive-autosync-menu').addEventListener('change', onAutoSyncToggle)") &&
  /function _autoSyncSyncCheckboxes\(\)[\s\S]*?\['chk-gdrive-autosync', 'chk-gdrive-autosync-menu'\]/.test(src) &&
  /function updateBackupDriveUI\(\)[\s\S]*?_autoSyncSyncCheckboxes\(\);/.test(src) &&
  src.includes("同期が取れています。\\n(「:自動更新」のオン/オフは、バックアップ/インポートメニューのGoogleドライブ欄で切り替えられます)"));

(async () => {
  const b = await chromium.launch({ executablePath: EXE, headless: true, args: ARGS });
  const ctx = await b.newContext({ viewport: { width: 900, height: 900 }, timezoneId: 'Asia/Tokyo' });
  await ctx.route('**/*', route => { route.request().url().startsWith(BASE) ? route.continue() : route.abort(); });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '/index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof _autoSyncSyncCheckboxes === 'function' && typeof updateBackupDriveUI === 'function', { timeout: 8000 });
  await p.waitForTimeout(400);

  // A1: 初期値はオフで両方オフ。メニュー側をオンにすると appState と localStorage がオンになり、ダイアログ側も揃う
  const a1 = await p.evaluate(() => {
    const m = document.getElementById('chk-gdrive-autosync-menu'), d = document.getElementById('chk-gdrive-autosync');
    const r = { exists: !!m && !!d, def: appState.googleDrive.autoSync === false && !m.checked && !d.checked };
    m.checked = true; m.dispatchEvent(new Event('change', { bubbles: true }));
    r.on = appState.googleDrive.autoSync === true && d.checked === true;
    r.saved = JSON.parse(localStorage.getItem(STORAGE_KEY)).googleDrive.autoSync === true;
    return r;
  });
  check('A1 メニュー側の「:自動更新」をオン → appState/localStorage がオン・ダイアログ側のチェックも揃う', a1.exists && a1.def && a1.on && a1.saved, JSON.stringify(a1));

  // A2: ダイアログ側でオフにすると、メニュー側もオフになり、保留中のタイマーが発火しても保存に進まない
  const a2 = await p.evaluate(async () => {
    const m = document.getElementById('chk-gdrive-autosync-menu'), d = document.getElementById('chk-gdrive-autosync');
    d.checked = false; d.dispatchEvent(new Event('change', { bubbles: true }));
    const r = { off: appState.googleDrive.autoSync === false && m.checked === false };
    r.saved = JSON.parse(localStorage.getItem(STORAGE_KEY)).googleDrive.autoSync === false;
    // _autoSyncArm はオフの時は何も予約しない
    _autoSyncArm();
    r.noTimer = _autoSyncTimer === null;
    return r;
  });
  check('A2 ダイアログ側でオフ → メニュー側もオフ・保存もオフ・_autoSyncArm は予約しない', a2.off && a2.saved && a2.noTimer, JSON.stringify(a2));

  // A3: updateBackupDriveUI は appState の値をメニュー側に映す(外から値が変わった時=ドライブからの読み込み等)
  const a3 = await p.evaluate(() => {
    appState.googleDrive.autoSync = true; updateBackupDriveUI();
    const on = document.getElementById('chk-gdrive-autosync-menu').checked === true && document.getElementById('chk-gdrive-autosync').checked === true;
    appState.googleDrive.autoSync = false; updateBackupDriveUI();
    const off = document.getElementById('chk-gdrive-autosync-menu').checked === false && document.getElementById('chk-gdrive-autosync').checked === false;
    return { on, off };
  });
  check('A3 updateBackupDriveUI が appState.googleDrive.autoSync を両方のチェックに映す(オン→オフ)', a3.on && a3.off, JSON.stringify(a3));

  // A4: メニューのチェックはバックアップ節(sec-backup)の中にある(ログイン無しでも見える置き場所)
  const a4 = await p.evaluate(() => !!document.querySelector('#sec-backup #chk-gdrive-autosync-menu'));
  check('A4 メニュー側のチェックはバックアップ/インポート節(#sec-backup)の中にある', a4);

  check('E ページエラーなし', errs.length === 0, errs.slice(0, 2).join(' | '));
  await b.close();
  console.log(`\n${PASS} passed, ${FAIL} failed`);
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.log('ERR', e && e.stack || e); process.exit(1); });
