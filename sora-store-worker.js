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

// 端末の控え(IndexedDB)の片付けワーカー(デッサン35 §4・第184 段2)。画面を止めずに、
//   ①最終使用(usedAt。無ければ savedAt)から unusedDays(30日)を過ぎた物を消す
//   ②店の上限(caps[店])の high(9割)を超えていたら、古い順に low(8割)まで消す
//   ③天気の控えは TTL(2時間)を過ぎた物を消す
// 値(タイルのバイト列)は読まず、索引(size・savedAt・usedAt)の鍵カーソルだけで台帳を作る(1GB の店でも軽い)。削除は batch(200件)ずつ別の取引で。
// 本体からの message: { type:'clean', now, unusedDays, caps:{maptiles,demtiles,bldg,wx}, high, low, wxTtlMs, batch }
'use strict';
const STORES = [
    { name: 'maptiles', db: 'soranotsuji-maptiles', store: 'tiles' },
    { name: 'demtiles', db: 'soranotsuji-kashimap', store: 'tiles' },
    { name: 'bldg', db: 'soranotsuji-bldg', store: 'tiles' },
];
function openDb(name) {
    return new Promise((ok) => {
        try {
            const req = indexedDB.open(name);   // 版は本体が作る(無ければ店は無い=作らない)
            req.onupgradeneeded = () => { try { req.transaction.abort(); } catch (_) {} };   // 無い店を新しく作ってしまわない
            req.onsuccess = () => ok(req.result);
            req.onerror = () => ok(null);
            req.onblocked = () => ok(null);
        } catch (_) { ok(null); }
    });
}
function keyCursorMap(st, indexName) {   // 索引の鍵カーソルで primaryKey → 索引の値 の Map(値は読まない)
    return new Promise((ok) => {
        const m = new Map();
        if (!st.indexNames.contains(indexName)) { ok(m); return; }
        const rq = st.index(indexName).openKeyCursor();
        rq.onsuccess = () => { const c = rq.result; if (!c) { ok(m); return; } m.set(c.primaryKey, Number(c.key) || 0); c.continue(); };
        rq.onerror = () => ok(m);
    });
}
function deleteKeys(db, store, keys) {
    return new Promise((ok) => {
        try {
            const tx = db.transaction(store, 'readwrite'); const st = tx.objectStore(store);
            for (const k of keys) st.delete(k);
            tx.oncomplete = () => ok(true); tx.onerror = () => ok(false); tx.onabort = () => ok(false);
        } catch (_) { ok(false); }
    });
}
async function cleanTileStore(p, def) {
    const r = { name: def.name, n: 0, bytes: 0, deletedOld: 0, deletedCap: 0, freed: 0, skipped: false };
    const db = await openDb(def.db);
    if (!db || !db.objectStoreNames.contains(def.store)) { r.skipped = true; if (db) db.close(); return r; }
    const st = db.transaction(def.store, 'readonly').objectStore(def.store);
    const [sizes, saved, used] = await Promise.all([keyCursorMap(st, 'size'), keyCursorMap(st, 'savedAt'), keyCursorMap(st, 'usedAt')]);
    const rows = [];
    for (const [k, size] of sizes) { const last = used.get(k) || saved.get(k) || 0; rows.push({ k, size, last }); r.bytes += size; }
    r.n = rows.length;
    const cutoff = p.now - p.unusedDays * 86400000;
    const old = rows.filter(x => x.last < cutoff);
    const oldKeys = old.map(x => x.k);
    let remain = rows.filter(x => x.last >= cutoff);
    let total = remain.reduce((s, x) => s + x.size, 0);
    const capKeys = [];
    const cap = Number(p.caps[def.name]) || 0;
    if (cap > 0 && total > cap * p.high) {   // 上限の9割を超えた: 古い順に8割まで
        remain.sort((a, b) => a.last - b.last);
        for (const x of remain) { if (total <= cap * p.low) break; capKeys.push(x.k); total -= x.size; }
    }
    const all = oldKeys.concat(capKeys);
    let done = 0;
    for (let i = 0; i < all.length; i += p.batch) {
        await deleteKeys(db, def.store, all.slice(i, i + p.batch));
        done = Math.min(all.length, i + p.batch);
        postMessage({ type: 'progress', store: def.name, done, total: all.length });
    }
    r.deletedOld = oldKeys.length; r.deletedCap = capKeys.length;
    r.freed = old.reduce((s, x) => s + x.size, 0) + (rows.reduce((s, x) => s + x.size, 0) - old.reduce((s, x) => s + x.size, 0) - total);
    r.bytes = total;
    db.close();
    return r;
}
async function cleanWx(p) {   // 天気の控え: TTL 切れを消す(値は小さいので値カーソルでよい)
    const r = { name: 'wx', n: 0, bytes: 0, deletedOld: 0, deletedCap: 0, freed: 0, skipped: false };
    const db = await openDb('soranotsuji-wx');
    if (!db || !db.objectStoreNames.contains('fc')) { r.skipped = true; if (db) db.close(); return r; }
    const expired = [];
    await new Promise((ok) => {
        const rq = db.transaction('fc', 'readonly').objectStore('fc').openCursor();
        rq.onsuccess = () => {
            const c = rq.result; if (!c) { ok(); return; }
            const v = c.value; let sz = 0; try { sz = JSON.stringify(v).length; } catch (_) {}
            if (v && Number(v.t) && p.now - Number(v.t) > p.wxTtlMs) { expired.push(c.primaryKey); r.freed += sz; } else { r.n++; r.bytes += sz; }
            c.continue();
        };
        rq.onerror = () => ok();
    });
    for (let i = 0; i < expired.length; i += p.batch) await deleteKeys(db, 'fc', expired.slice(i, i + p.batch));
    r.deletedOld = expired.length;
    db.close();
    return r;
}
self.onmessage = async (e) => {
    const p = e.data;
    if (!p || p.type !== 'clean') return;
    const out = { type: 'done', reason: p.reason, stores: {} };
    try {
        for (const def of STORES) out.stores[def.name] = await cleanTileStore(p, def);
        out.stores.wx = await cleanWx(p);
    } catch (err) { out.error = String(err && err.message || err); }
    postMessage(out);
};
