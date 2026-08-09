/**
 * @name        vscode-koushi/extension.test.js — Koushi Preview拡張のNode検証
 * @synopsis    node ClaudeMederuU/tools/vscode-koushi/extension.test.js
 * @description VSCode本体なしで検証できる範囲を全て検証する:
 *              ①フェンス差し込み(擬似markdown-it): koushiフェンスだけ表になり、他は元の描画へ委譲
 *              ②info文字列の判定(前後空白・属性つき・大文字・無関係言語)
 *              ③描画エラー時は<pre class="koushi-error">でプレビューを壊さない
 *              ④同梱koushi.jsが正(ClaudeMederuU/tools/koushi.js)とバイト一致(コピーのドリフト検査)
 *              ⑤package.jsonの構造(markdownItPlugins・previewStyles・mainの実在)
 *              実機(VSCodeのプレビュー表示)の最終確認だけは依頼者のMacの目視に委ねる。
 * @history     第66ラウンド(2026-08-09) 初版。
 * @seeAlso     extension.js, ClaudeMederuU/tools/koushi.test.js(レンダラ本体のゴールデン)
 */
'use strict';
const fs = require('fs');
const path = require('path');
let PASS = 0, FAIL = 0;
const check = (n, ok, d) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? '  ' + d : ''}`); ok ? PASS++ : FAIL++; };

const ext = require('./extension.js');
const Koushi = require('./koushi.js');

// ---- 擬似markdown-it: fenceルールの差し込み先だけを再現(実VSCodeのmdと同じ呼び出し形) ----
function makeFakeMd() {
    const md = {
        renderer: {
            rules: {
                fence: (tokens, idx) => '<pre>DEFAULT:' + tokens[idx].info + '</pre>',
            },
        },
    };
    return md;
}
const renderFence = (md, info, content) => md.renderer.rules.fence([{ info, content }], 0, {}, {}, null);

// ---- ①koushiフェンスだけ表になり、他は委譲される ----
{
    const md = ext.extendMarkdownIt(makeFakeMd());
    const koushiSrc = ['- t:1.', '  - r:1.', '    - c:1. A', '    - c:2. B'].join('\n');
    const out = renderFence(md, 'koushi', koushiSrc);
    check('①koushiフェンスがtable.koushiになる', out.startsWith('<table class="koushi">') && out.includes('<td>A</td>'));
    check('①出力はレンダラ本体(koushiToHtml)と一致', out === Koushi.koushiToHtml(koushiSrc) + '\n');
    const js = renderFence(md, 'js', 'const a = 1;');
    check('①jsフェンスは元の描画へ委譲', js === '<pre>DEFAULT:js</pre>');
    const plain = renderFence(md, '', 'plain');
    check('①言語なしフェンスも委譲', plain === '<pre>DEFAULT:</pre>');
}

// ---- ②info文字列の判定 ----
{
    check('②判定: koushi/前後空白/属性つき/大文字はtrue・koushi2やjsはfalse',
        ext.isKoushiFence('koushi') && ext.isKoushiFence('  koushi  ') && ext.isKoushiFence('koushi some-attr') &&
        ext.isKoushiFence('KOUSHI') && !ext.isKoushiFence('koushi2') && !ext.isKoushiFence('js') && !ext.isKoushiFence(''));
}

// ---- ③描画エラーでもプレビューを壊さない ----
{
    const md = ext.extendMarkdownIt(makeFakeMd());
    // contentにnullを渡してレンダラを確実に例外にする
    const out = md.renderer.rules.fence([{ info: 'koushi', content: null }], 0, {}, {}, null);
    check('③描画エラーは<pre class="koushi-error">に閉じ込める(例外を漏らさない)',
        out.startsWith('<pre class="koushi-error">'), out.slice(0, 60));
}

// ---- ④同梱コピーのドリフト検査(正=ClaudeMederuU/tools/koushi.js) ----
{
    const master = fs.readFileSync(path.join(__dirname, '..', 'koushi.js'), 'utf8');
    const bundled = fs.readFileSync(path.join(__dirname, 'koushi.js'), 'utf8');
    check('④同梱koushi.jsが正(tools/koushi.js)とバイト一致(ズレたらcpで同期する)', master === bundled,
        master === bundled ? '' : '→ cp ClaudeMederuU/tools/koushi.js ClaudeMederuU/tools/vscode-koushi/koushi.js');
}

// ---- ⑤package.jsonの構造 ----
{
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const c = pkg.contributes || {};
    check('⑤package.json: markdownItPlugins=true・previewStylesにCSS・mainが実在',
        c['markdown.markdownItPlugins'] === true &&
        Array.isArray(c['markdown.previewStyles']) && c['markdown.previewStyles'].length === 1 &&
        fs.existsSync(path.join(__dirname, c['markdown.previewStyles'][0])) &&
        fs.existsSync(path.join(__dirname, pkg.main)));
    check('⑤activate()がextendMarkdownItを返す(VSCodeの呼び出し形)',
        typeof ext.activate().extendMarkdownIt === 'function');
}

console.log(`\nPASS: ${PASS} / FAIL: ${FAIL}`);
process.exit(FAIL ? 1 : 0);
