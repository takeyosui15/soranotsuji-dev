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
// ・版は登録URLの ?v=(本体の APP_VERSION)で受け取る。控えの名前は sora-shell-v<版>。
// ・入れ替えは2フェーズ: install で一覧(sw-precache.js)を全部そろえて確かめてから、activate で古い控えを捨てる。
//   途中で失敗(圏外・404)したら install が失敗し、古い SW と古い控えのまま動く(中途半端な控えは決して使われない)。
// ・ページ(index.html)はネット優先(待ち時間を過ぎたら控え)。本体のファイルは、ページの版(meta app-version)が SW の版と同じなら控え優先(速い・圏外で動く)、
//   違えば(配布直後の過渡期)ネットだけ(古い控えを新しいページに混ぜない。落ちたら読み直しで控えの古い版に揃う)。
// ・控えから出した応答には x-sora-shell: cache の印を付ける(画面の「オフライン表示」の判定と検証用)。
'use strict';
const VER = new URL(self.location.href).searchParams.get('v') || '0';
const CACHE = 'sora-shell-v' + VER;
importScripts('sora-constants.js');   // 上限と待ち時間(SORA.STORE)。自オリジンだけ
importScripts('sw-precache.js');      // self.SORA_PRECACHE(自動生成の一覧。tools/sw/build-precache.js)
const ST = self.SORA.STORE;
const SCOPE = self.registration.scope;   // 置いたフォルダ(本番 '/'・開発サイト '/soranotsuji-dev/')
const RUNTIME_OK = /\.(js|css|html|json|bin|csv|webp|png|ico|svg|pbf|wasm|woff2?)$/i;   // 使った時に控える物の種類
const clientVer = new Map();   // クライアントID → そのページの版(meta app-version)。SW が再起動すると消える(その時は控え優先=同じ版とみなす)
let shellBytes = null;         // 控えの合計バイト(遅延で数える)

self.addEventListener('install', (e) => {
    e.waitUntil((async () => {
        const list = self.SORA_PRECACHE;
        if (!Array.isArray(list) || !list.length) throw new Error('precache list missing');
        const c = await caches.open(CACHE);
        await c.addAll(list.map(u => new Request(new URL(u, SCOPE).href, { cache: 'reload' })));   // HTTP キャッシュを飛ばして取る。1つでも失敗すれば install 失敗=古いまま
        for (const u of list) { if (!(await c.match(new URL(u, SCOPE).href))) throw new Error('precache incomplete: ' + u); }   // 全部そろったのを確かめてから切り替える
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

function keyOf(url) { return url.origin + url.pathname; }   // クエリ(?forecast=1 等)は控えの鍵に含めない
function fetchWithTimeout(href, ms, init) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    return fetch(href, Object.assign({ cache: 'no-cache', credentials: 'same-origin', signal: ctl.signal }, init || {})).finally(() => clearTimeout(t));
}
function versionOf(html) { const m = /<meta name="app-version" content="([^"]+)"/.exec(html); return m ? m[1] : null; }
function marked(res) {   // 控えから出す応答に印を付ける(Cache API の応答はヘッダが不変なので作り直す)
    const h = new Headers(res.headers); h.set('x-sora-shell', 'cache');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}
function unredirected(res) { return res.redirected ? new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers }) : res; }
async function shellSize(c) {
    if (shellBytes !== null) return shellBytes;
    let n = 0;
    for (const req of await c.keys()) { const r = await c.match(req); if (r) n += Number(r.headers.get('content-length')) || 0; }
    return (shellBytes = n);
}
async function putRuntime(c, key, res) {   // 使った時に控える(念のための上限つき)
    try {
        const len = Number(res.headers.get('content-length')) || 0;
        const cur = await shellSize(c);
        if (cur + len > ST.SHELL_MAX_BYTES) return;
        await c.put(key, res);
        shellBytes = cur + len;
    } catch (_) { /* 容量不足などは黙って諦める(ネットから返した物はもう画面に届いている) */ }
}

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
    const c = await caches.open(CACHE);
    try {
        const res = await fetchWithTimeout(url.href, ST.SHELL_NAV_TIMEOUT_MS);
        if (res.ok) {
            const v = versionOf(await res.clone().text());
            if (e.resultingClientId) clientVer.set(e.resultingClientId, v || VER);
            if (!v || v === VER) putRuntime(c, key, res.clone());   // 同じ版だけ控えに入れる(新しい版のページを古い控えに混ぜない)
        }
        return res;
    } catch (err) {
        const hit = (await c.match(key)) || (await c.match(new URL('index.html', SCOPE).href));
        if (hit) { if (e.resultingClientId) clientVer.set(e.resultingClientId, VER); return marked(hit); }
        throw err;
    }
}

async function handleAsset(e, req, url, key) {   // 本体のファイル: 同じ版なら控え優先 → 無ければネット(控えに入れる) → 落ちたら控え
    const c = await caches.open(CACHE);
    const pv = clientVer.get(e.clientId);
    if (pv && pv !== VER) return unredirected(await fetchWithTimeout(url.href, ST.SHELL_FETCH_TIMEOUT_MS));   // 配布直後: ページが新しい版。古い控えは使わずネットだけ
    const fresh = req.cache === 'reload' || req.cache === 'no-store' || req.cache === 'no-cache';   // 呼び元が最新を求めた時はネット優先
    if (!fresh) { const hit = await c.match(key); if (hit) return marked(hit); }
    try {
        const res = unredirected(await fetchWithTimeout(url.href, ST.SHELL_FETCH_TIMEOUT_MS, fresh ? { cache: req.cache } : null));
        if (res.ok && RUNTIME_OK.test(url.pathname)) putRuntime(c, key, res.clone());
        return res;
    } catch (err) {
        const hit = await c.match(key);
        if (hit) return marked(hit);
        throw err;
    }
}
