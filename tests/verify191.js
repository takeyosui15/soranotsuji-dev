// 第187ラウンド検証: v1.99.4 — ①ロゴの三角のグラデーションは底辺の真ん中から頂点への斜め(userSpaceOnUse (250,1000)→(1000,0))・アイコン5種は SVG から
// ②短縮URLの案内文は「共有リンクからの」+スマホの Google マップアプリでの Plus Code の探し方(ヘルプ/FAQ も) ③リリースノート §7 は1行・リリース管理 docs/release-management/・deploy-guide の2チェック・request.md への参照替え・todo の roadmap
// 方式: 静的な形(S)だけ(実機は verify190 が持つ)。
'use strict';
const fs = require('fs');
const path = require('path');
let PASS = 0, FAIL = 0;
const check = (n, ok, d) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? '  ' + d : ''}`); ok ? PASS++ : FAIL++; };
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ex = (f) => fs.existsSync(path.join(ROOT, f));
const src = rd('script.js'), html = rd('index.html'), consts = rd('sora-constants.js');
const APP_VER = (/APP_VERSION = '([^']+)'/.exec(consts) || [])[1];
const pngSize = (f) => { const b = fs.readFileSync(path.join(ROOT, f)); return b.length > 24 && b.toString('latin1', 1, 4) === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };

check('V0 版のピン 1.99.4(sora-constants.js の APP_VERSION)+移行用 meta は無い+Version History の最新行が 1.99.4 で第187',
  APP_VER === '1.99.4' && !/<meta name="app-version"/.test(html) && /Version History:\nVersion 1\.99\.4 - 2026-10-22: [^\n]*第187ラウンド/.test(src), APP_VER);

const svg = rd('logo.svg');
check('S1 ロゴ: 三角のグラデーションは userSpaceOnUse で底辺の真ん中 (250,1000) から頂点 (1000,0) へ(斜めの「道」)・円は縦のまま・色は #ff0000→#ee7800・図形は不変・PNG 5種の大きさ・sw-precache の一覧に5種',
  svg.includes('<linearGradient id="sora-tri" gradientUnits="userSpaceOnUse" x1="250" y1="1000" x2="1000" y2="0">') && svg.includes('<linearGradient id="sora-sun" x1="0" y1="1" x2="0" y2="0">') &&
  (svg.match(/stop-color="#ff0000"/g) || []).length === 2 && (svg.match(/stop-color="#ee7800"/g) || []).length === 2 && svg.includes('<polygon points="0,1000 500,1000 1000,0"') && svg.includes('<circle cx="646.447" cy="146.447" r="146.447"') && !svg.includes('<image') &&
  JSON.stringify(pngSize('logo.png')) === '[100,100]' && JSON.stringify(pngSize('apple-touch-icon.png')) === '[180,180]' && JSON.stringify(pngSize('icon-192.png')) === '[192,192]' && JSON.stringify(pngSize('icon-512.png')) === '[512,512]' &&
  ['favicon.ico', 'apple-touch-icon.png', 'logo.png', 'icon-192.png', 'icon-512.png'].every(f => rd('sw-precache.js').includes(`'${f}'`)));

const hint = (src.match(/const _MAP_URL_HINT = '([^\n]*)';/) || [])[1] || '';
check('S2 短縮URLの案内: 「共有リンクからの短縮URL」・スマホの Google マップアプリで Plus Code を探す手順・パソコンはアドレスバーの URL・度分秒も可。ヘルプと FAQ も同じ案内',
  hint.startsWith('この URL からは位置を読み取れませんでした。') && hint.includes('共有リンクからの短縮URL(maps.app.goo.gl など)は宙の辻では展開できません。') && hint.includes('スマホの Google マップアプリでは、地点を開いて詳細を下へスクロールすると出る Plus Code(例: MQPJ+2V 港区)をコピーして貼ってください') &&
  hint.includes('パソコンでは Google マップでその URL を開き、アドレスバーの URL(google.com/maps/place/… の形)を貼ってください。') && hint.includes('度分秒') &&
  html.includes('は宙の辻では展開できないので、スマホの Google マップアプリでは地点の詳細を下へスクロールすると出る Plus Code をコピーして貼り、パソコンではブラウザでその URL を開いてアドレスバーの URL (google.com/maps/place/… の形) を貼ってください。') &&
  rd('docs/note/note-faq-page.md').includes('スマホでは、地点を開いて詳細を下へスクロールすると出る Plus Code をコピーして貼るのが早道です。'), hint.slice(0, 60));

const rn = rd('docs/release-notes/v1.99.4.md');
check('S3 文書: リリースノート v1.99.4.md の 7. は「:自動更新」の1行だけ・docs/release-management/README.md と v1.99.4.md がある・deploy-guide に棚卸しとリリース管理の2チェック・CLAUDE.md/AGENTS.md は request.md・todo に roadmap の DECISION と「リリース後の最優先」と memo 8件の行き先・memo.md の新しいメモは空・tools README に render-icons',
  rn.startsWith('# 宙の辻 v1.99.4 リリースのお知らせ') && /## 7\. その他の修正\n\n- Google ドライブ同期の「:自動更新」[^\n]*\n\n---/.test(rn) && !ex('docs/release-notes/v1.99.3.md') &&
  ex('docs/release-management/README.md') && ex('docs/release-management/v1.99.4.md') && rd('docs/release-management/v1.99.4.md').includes('## 6. 積み残し') &&
  rd('docs/operation/deploy-guide.md').includes('- [ ] todo.md の棚卸しが済んでいる') && rd('docs/operation/deploy-guide.md').includes('- [ ] リリース管理のドキュメント `docs/release-management/vA.B.C.md`') &&
  rd('CLAUDE.md').includes('| `docs/request.md` |') && rd('CLAUDE.md').includes('/docs/request.md、/docs/todo.md、') && rd('AGENTS.md').includes('| `docs/request.md` |') &&
  rd('docs/todo.md').includes('リリース後の進め方(第187・依頼者)') && rd('docs/todo.md').includes('#### リリース後の最優先(依頼者・第187)') && rd('docs/todo.md').includes('熊本城と月を撮る方法のチュートリアル') && rd('docs/todo.md').includes('Myプレイス: 宙の窓で撮った写真のリンク') &&
  !/熊本城/.test(rd('docs/memo.md')) && rd('docs/memo-log/memo-done-2026-10.md').includes('2026-10-22 第187ラウンド') && rd('ClaudeMederuU/tools/README.md').includes('| アイコンの書き出し(render-icons) | `tools/icons/render-icons.js` |'));

console.log(`\n結果: ${PASS} PASS / ${FAIL} FAIL`);
process.exit(FAIL ? 1 : 0);
