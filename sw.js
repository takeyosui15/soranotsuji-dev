/*
宙の辻 - Sora no Tsuji
Copyright (C) 2026 Takeyoshi Watanabe (Sora no Tsuji Project)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
*/

// 宙の辻 Service Worker(デッサン35 §2): 電波の無い所でも宙の辻を「開ける」ように、本体(画面・プログラム・同梱データ)を版ごとに控える。
// ・扱うのは自オリジン(置いたフォルダの中)の GET だけ。他オリジン(Google のログイン/API・国土地理院/OSM のタイル・Open-Meteo など)には一切触らない(respondWith しない)。
// ・版は sora-constants.js の APP_VERSION(唯一の置き場。第184)。importScripts で読み、控えの名前は sora-shell-v<版>。updateViaCache:'none' なので版が変わればブラウザが新しい SW として入れ直す。
// ・入れ替えは2フェーズ: install で一覧(sw-precache.js)を全部そろえて確かめてから、activate で古い控えを捨てる。
//   途中で失敗(圏外・404)したら install が失敗し、古い SW と古い控えのまま動く(中途半端な控えは決して使われない)。
// ・ページ(index.html)はネット優先(待ち時間を過ぎたら控え)。本体のファイルは、ページの版(ページと一緒に最新で読んだ sora-constants.js の版)が SW の版と同じなら控え優先(速い・圏外で動く)、
//   違えば(配布直後の過渡期)ネットだけ(古い控えを新しいページに混ぜない。落ちたら読み直しで控えの古い版に揃う)。
// ・控えから出した応答には x-sora-shell: cache の印を付ける(画面の「オフライン表示」の判定と検証用)。
// ・第183の反証レビューで足した守り: ワーカーは起動元のページの版を引き継ぐ / Cache Storage が壊れていれば SW が無い時と同じに通す / install の版の門番(旧URLの自動更新で入ろうとした SW は捨てる) /
//   install 失敗で途中の控えを残さない / 範囲内の転送(301)はブラウザに辿らせる / 配信元の 5xx は控えで凌ぐ / 容量は実体のバイト数で数える(content-length は gzip 後)。
'use strict';
importScripts('sora-constants.js');   // 版(SORA.APP_VERSION)と上限・待ち時間(SORA.STORE)。自オリジンだけ
importScripts('sw-precache.js');      // self.SORA_PRECACHE(自動生成の一覧。tools/sw/build-precache.js)
const VER = self.SORA.APP_VERSION;   // 版の唯一の置き場(第184・SSOT)
const CACHE = 'sora-shell-v' + VER;
const ST = self.SORA.STORE;
const SCOPE = self.registration.scope;   // 置いたフォルダ(本番 '/'・開発サイト '/soranotsuji-dev/')
const CONST_URL = new URL('sora-constants.js', SCOPE).href;   // 配信中の版を読む先(10KB・条件つき要求で軽い)
const RUNTIME_OK = /\.(js|css|html|json|bin|csv|webp|png|ico|svg|pbf|wasm|woff2?)$/i;   // 使った時に控える物の種類
const clientVer = new Map();   // クライアントID → そのページの版。ワーカーは起動元のページの版を引き継ぐ。SW が再起動すると消える(その時は控え優先=同じ版とみなす)
const PRECACHE_KEYS = new Set((self.SORA_PRECACHE || []).map(u => keyOf(new URL(u, SCOPE))));   // 控えに入れてよいページ(navigate)の鍵(第185の監査: 範囲内の任意の 200 応答で控えを膨らませない)
const servedFromCache = new Set();   // 控えから開いたページのクライアントID(画面の「オフライン表示」の印の問い合わせに答える。第184 段3)
let shellBytes = null;         // 控えの合計バイト(遅延で数える)

self.addEventListener('install', (e) => {
    e.waitUntil((async () => {
        const list = self.SORA_PRECACHE;
        if (!Array.isArray(list) || !list.length) throw new Error('precache list missing');
        const existed = await caches.has(CACHE);   // 同じ名前の控えが生きている時(版を上げずに sw.js だけ変わった時)は、失敗しても消さない
        try {
            // 版の門番: 配信中の版(sora-constants.js を最新で読む)が自分の版と違えば、この install は捨てる(更新の確認と配布が重なった時。正しい版は次の更新の確認で入る)
            const cst = await fetchWithTimeout(CONST_URL, ST.SHELL_FETCH_TIMEOUT_MS, { cache: 'reload' });
            const pv = cst.ok ? versionOf(await cst.text()) : null;
            if (pv && pv !== VER) throw new Error('version mismatch: page ' + pv + ' / sw ' + VER);
            const c = await caches.open(CACHE);
            await c.addAll(list.map(u => new Request(new URL(u, SCOPE).href, { cache: 'reload' })));   // HTTP キャッシュを飛ばして取る。1つでも失敗すれば install 失敗=古いまま
            for (const u of list) { if (!(await c.match(new URL(u, SCOPE).href))) throw new Error('precache incomplete: ' + u); }   // 全部そろったのを確かめてから切り替える
        } catch (err) {
            if (!existed) await caches.delete(CACHE).catch(() => {});   // 途中まで入った控えを残さない
            throw err;   // install 失敗=古い SW と控えのまま(2フェーズ)
        }
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k.startsWith('sora-shell-') && k !== CACHE).map(k => caches.delete(k)));   // 古い版の控えを捨てる
        await self.clients.claim();
    })());
});

function keyOf(url) { return url.origin + (url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname); }   // クエリ(?forecast=1 等)は控えの鍵に含めない。フォルダ('/')は index.html と同じ鍵
function fetchWithTimeout(href, ms, init) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    return fetch(href, Object.assign({ cache: 'no-cache', credentials: 'same-origin', signal: ctl.signal }, init || {})).finally(() => clearTimeout(t));
}
function versionOf(constText) { const m = /APP_VERSION = '([^']+)'/.exec(constText); return m ? m[1] : null; }   // sora-constants.js の版(本体と同じ1箇所)
function marked(res) {   // 控えから出す応答に印を付ける(Cache API の応答はヘッダが不変なので作り直す)
    const h = new Headers(res.headers); h.set('x-sora-shell', 'cache');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}
function unredirected(res) { return res.redirected ? new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers }) : res; }
async function openShell() { try { return await caches.open(CACHE); } catch (_) { return null; } }   // Cache Storage が壊れていても(open が reject)サイトを止めない: null なら SW が無い時と同じに通す
async function matchShell(c, key) { try { return await c.match(key); } catch (_) { return null; } }
async function fromShell(e, c, key) {   // 控えのページ(その鍵か index.html)。出せた時はそのクライアントの版=SW の版
    const hit = (await matchShell(c, key)) || (await matchShell(c, new URL('index.html', SCOPE).href));
    if (hit && e.resultingClientId) { clientVer.set(e.resultingClientId, VER); servedFromCache.add(e.resultingClientId); }
    return hit ? marked(hit) : null;
}
async function bodySize(res) { try { return (await res.clone().blob()).size; } catch (_) { return 0; } }   // 実体のバイト数(content-length は GitHub Pages では gzip 後の値)
async function shellSize(c) {
    if (shellBytes !== null) return shellBytes;
    let n = 0;
    for (const req of await c.keys()) { const r = await matchShell(c, req); if (r) n += await bodySize(r); }
    return (shellBytes = n);
}
async function putRuntime(c, key, res) {   // 使った時に控える(念のための上限つき)
    try {
        const buf = await res.arrayBuffer();
        const len = buf.byteLength;
        const cur = await shellSize(c);
        if (cur + len > ST.SHELL_MAX_BYTES) return;
        await c.put(key, new Response(buf, { status: res.status, statusText: res.statusText, headers: res.headers }));
        shellBytes = cur + len;
    } catch (_) { /* 容量不足などは黙って諦める(ネットから返した物はもう画面に届いている) */ }
}

self.addEventListener('message', (e) => {   // ページからの問い合わせ「このページは控えから出したか」(第184 段3)
    const d = e.data || {};
    if (d.type === 'sora:served?' && e.source && e.source.postMessage) e.source.postMessage({ type: 'sora:served', from: servedFromCache.has(e.source.id) ? 'cache' : 'network', ver: VER });
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE)) return;   // 他オリジン・範囲外は触らない(ブラウザがそのまま通信)
    if (req.headers.has('authorization')) return;
    const key = keyOf(url);
    if (req.mode === 'navigate') { e.respondWith(handleNavigate(e, url, key)); return; }
    e.respondWith(handleAsset(e, req, url, key));
});

async function handleNavigate(e, url, key) {   // ページ: ネット優先 → 待ち時間を過ぎたら/落ちたら控え
    const c = await openShell();
    if (!c) return fetch(e.request);   // Cache Storage が使えない: SW が無い時と同じ
    try {
        const [res, cst] = await Promise.all([fetchWithTimeout(url.href, ST.SHELL_NAV_TIMEOUT_MS), fetchWithTimeout(CONST_URL, ST.SHELL_NAV_TIMEOUT_MS).catch(() => null)]);   // ページと一緒に配信中の版も最新で読む
        if (res.redirected) return Response.redirect(res.url, 302);   // 範囲内の転送(例: /data→/data/)はブラウザに改めて辿らせる(navigate は転送済みの応答を返せない)
        if (res.status >= 500) return (await fromShell(e, c, key)) || res;   // 配信元の 5xx は控えで凌ぐ(無ければそのまま)
        if (res.ok) {
            let v = null;
            try { v = (cst && cst.ok) ? versionOf(await cst.text()) : null; } catch (_) { v = null; }
            if (e.resultingClientId) clientVer.set(e.resultingClientId, v || 'unknown');   // 版が読めなかった(落ちた/待ち時間切れ)時は「分からない」=本体はネット優先(古い控えを混ぜない。第184の反証レビュー C2/C12)
            if (v === VER && PRECACHE_KEYS.has(key)) putRuntime(c, key, res.clone());   // 同じ版で、一覧にあるページだけ控えに入れる(新しい版・版の分からないページを古い控えに混ぜない。第185の監査: 範囲内の任意の 200 応答は入れない)
        }
        return res;
    } catch (err) {
        const hit = await fromShell(e, c, key);
        if (hit) return hit;
        throw err;
    }
}

async function handleAsset(e, req, url, key) {   // 本体のファイル: 同じ版なら控え優先 → 無ければネット(控えに入れる) → 落ちたら控え
    const c = await openShell();
    if (!c) return fetch(req);   // Cache Storage が使えない: SW が無い時と同じ
    const pv = clientVer.get(e.clientId);
    if ((req.destination === 'worker' || req.destination === 'sharedworker') && e.resultingClientId && pv) clientVer.set(e.resultingClientId, pv);   // ワーカーに起動元のページの版を引き継ぐ(ワーカーからの importScripts は e.clientId がワーカー自身の id)
    if (pv && pv !== VER) {   // 配布直後: ページが新しい版(古い控えは使わずネットだけ)。版が読めなかった('unknown')ページはネット→落ちたら控え
        try { return unredirected(await fetchWithTimeout(url.href, ST.SHELL_FETCH_TIMEOUT_MS)); }
        catch (err) { if (pv === 'unknown') { const hit = await matchShell(c, key); if (hit) return marked(hit); } throw err; }
    }
    const fresh = req.cache === 'reload' || req.cache === 'no-store' || req.cache === 'no-cache';   // 呼び元が最新を求めた時はネット優先
    if (!fresh) { const hit = await matchShell(c, key); if (hit) return marked(hit); }
    try {
        const res = unredirected(await fetchWithTimeout(url.href, ST.SHELL_FETCH_TIMEOUT_MS, fresh ? { cache: req.cache } : null));
        if (res.ok && RUNTIME_OK.test(url.pathname)) putRuntime(c, key, res.clone());
        return res;
    } catch (err) {
        const hit = await matchShell(c, key);
        if (hit) return marked(hit);
        throw err;
    }
}
