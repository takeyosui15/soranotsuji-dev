# 依頼・回答ログ

このファイルは、開発依頼と回答の記録用です。

## 運用ルール
- 依頼者が「## 依頼」セクションに依頼内容を記入
- Claudeが「### 回答」として回答を追記
- 完了した依頼はそのまま履歴として残す
- 依頼者は、依頼管理のため、Claudeのコミットハッシュを記録する
- order.mdが500行を超えたら、キリの良いところで、/order-log以下に保管する。

---


-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
git show 1e1c93a
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


## 依頼 (2026-05-04)
Claudeさん、ありがとうございます。
やはり、うまく進捗バーが表示されません。
いっそのことよく100年分(36500日分)計算するので、辻検索とMy辻検索を並行・並列・プール化したワーカースレッドで非同期化しませんか。
検索期間は、だいたい365の倍数になるので、ワーカースレッドに渡す単位を365単位くらいが良いと思います。
それから、テキストボックスのステップを1日単位でなくて、365日単位にして欲しいです。
よろしくお願いいたします。

### 回答 (2026-05-04) — 辻検索/My辻検索のWorkerプール化 + 365日チャンク + 進捗バー細粒化

#### 1. Worker Pool アーキテクチャの実装

辻検索 / My辻検索の両方が**同一の `tsujiPool` を共有**するグローバル Worker プールを実装しました。プールはタスクキューを持ち、空いているワーカーから順にタスクを処理します。

```js
const TSUJI_CHUNK_DAYS = 365;
const TSUJI_NUM_WORKERS = Math.max(1, Math.min(navigator.hardwareConcurrency || 4, 8));

const tsujiPool = (() => {
    let workers = [];
    let idle = [];
    const queue = [];
    const active = new Map();

    function ensure() { while (workers.length < TSUJI_NUM_WORKERS) { ... } }
    function dispatch() { while (idle.length && queue.length) { ... } }
    function run(worker, task) {
        worker.onmessage = (e) => { task.resolve(e.data); idle.push(worker); dispatch(); };
        worker.postMessage(task.taskData);
    }
    return {
        runTask(taskData) { ... ensure(); queue.push({...}); dispatch(); },
        terminateAll() { ... reject all active+pending ... }
    };
})();
```

**特徴**:
- ワーカーは一度作成すると再利用 (起動オーバーヘッドを毎回負担しない)
- 同時実行数は最大 `navigator.hardwareConcurrency` (上限8)
- `terminateAll()` で全ワーカーを破棄しつつ、active/pending タスクを reject (orphan async が await から抜けて正常終了できる)

#### 2. 365日固定チャンクへの変更

旧: `chunkSize = Math.ceil(searchDays / TSUJI_NUM_WORKERS)` (例: 36500/8 = 4563日)
新: 固定 `TSUJI_CHUNK_DAYS = 365` (36500日 → 100チャンク)

これにより、**100年分の検索でも100個の細かいタスクに分割され、プール内で並列処理**されます。1チャンク = 約365日分 = 365 × (1440分 + 121秒) の計算量で、1〜2秒程度で完了します。

ヘルパー関数 `runTsujiChunks()` を追加:

```js
async function runTsujiChunks({ bodyMsg, ..., days, onChunkDone }) {
    const numChunks = Math.ceil(days / TSUJI_CHUNK_DAYS);
    const promises = [];
    for (let c = 0; c < numChunks; c++) {
        const dayStart = c * TSUJI_CHUNK_DAYS;
        const dayEnd = Math.min(dayStart + TSUJI_CHUNK_DAYS, days);
        const p = tsujiPool.runTask({...}).then(data => {
            if (onChunkDone) onChunkDone();  // ← 1チャンクごとに進捗更新
            return data;
        }).catch(_ => { onChunkDone?.(); return { results: [], dayStart, dayEnd }; });
        promises.push(p);
    }
    return (await Promise.all(promises)).sort((a, b) => a.dayStart - b.dayStart);
}
```

#### 3. 進捗バー細粒化 (チャンク単位)

進捗バーの分母を「チャンクの総数」に変更:
- **辻検索**: `天体数 × ceil(searchDays/365)` (例: 5天体 × 100チャンク = 500)
- **My辻検索**: `Σ(行ごと: 天体数 × ceil(days/365))`

```js
const totalChunks = checked.reduce((sum, t) => {
    const ids = (t.bodyIds || '').split(':').filter(s => s.trim());
    const chunksPerBody = Math.ceil((t.days || 0) / TSUJI_CHUNK_DAYS);
    return sum + Math.max(1, ids.length) * Math.max(1, chunksPerBody);
}, 0);
let doneChunks = 0;
const chunkDoneCb = () => {
    doneChunks++;
    setTsujiProgress(doneChunks, totalChunks);
};
```

これで100年検索でも100チャンク単位で進捗が見え、進捗バーが必ず表示されます。1天体分でも100チャンクなので、十分な粒度になります。

#### 4. 計算順序の変更 (天体間も並列化)

旧: 天体ごとに sequential `for` ループ + 各天体内のチャンクを並列
新: **全天体の全チャンクを Promise.all で一気にプールへ投入**

```js
const allBodyResults = await Promise.all(visibleBodies.map(body => {
    return runTsujiChunks({ ... onChunkDone: chunkDoneCb });
}));
```

プールサイズ8、100年×5天体 = 500チャンクの場合、8並列で順次処理されます。

#### 5. テキストボックスのステップ変更 (1日 → 365日)

- `index.html` L168: `<input id="input-tsuji-search-days" step="1">` → `step="365"`
- `script.js` L4795: `<input class="mytsuji-days" step="1">` → `step="365"`

これで↑↓キーやスピナーで365日単位で値を変更できます。

#### 6. 強制キャンセルの動作改善

旧: `worker.terminate()` は `worker.onmessage` を発火させないため、`Promise.all(chunkPromises)` がハングし orphan async がメモリリーク。
新: `tsujiPool.terminateAll()` 内で active/pending タスクの Promise を**明示的に reject** するため、orphan async は `await` から抜けて自身の generation チェックでクリーンに return できます。


-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
git show 535cc0d
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


## 依頼 (2026-05-04)
Claudeさん、ありがとうございます。
確認しました。
大丈夫でした。
ありがとうございます。

少し訂正をしていただきたいのですが、検索日時の365日ステップですが、最小値が1のため、365の倍数+1になってしまうようです。
最小値を0にすれば良いと気がついたのですが、プログラム側で検索日時が0の時は1にするような処理が必要と思いました。
`min=0`として動作するように変更をお願いいたします。

### 回答 (2026-05-04) — 検索日数 min=0 + 0→1 内部正規化

#### HTML 側: `min="0"` に変更

- `index.html` L168: `<input id="input-tsuji-search-days" step="365" min="1" max="36500">` → `min="0"`
- `script.js` L4770 (My辻検索の `mytsuji-days` 入力): `min="1"` → `min="0"`

これでスピナーの有効ステップ値が `0, 365, 730, 1095, ..., 36500` (365の倍数) になります。

#### コード側: 値が `0` の時に `1` へ正規化

旧コードは `parseInt(...) || 365` というイディオムを使っていましたが、`0` も falsy のため `0 || 365 = 365` となり、入力された 0 が意図せず 365 にリセットされていました。

新コードは `isNaN` を明示判定し、空欄のみ既定値 (365) にフォールバック、その後 `Math.max(v, 1)` で最小値 1 にクランプ:

```js
// script.js (input-tsuji-search-days)
let v = parseInt(e.target.value);
if (isNaN(v)) v = 365;
appState.tsujiSearchDays = Math.min(Math.max(v, 1), 36500);

// script.js (mytsuji-days)
let v = parseInt(e.target.value);
if (isNaN(v)) v = 365;
v = Math.min(Math.max(v, 1), 36500);
t.days = v;
```

#### 期待される挙動

| ユーザー入力 | 内部値 | HTML 表示 |
|---|---|---|
| 空欄 | 365 | 365 |
| 0 | 1 | 1 |
| 365 | 365 | 365 |
| 730 | 730 | 730 |
| 36500 | 36500 | 36500 |
| 50000 | 36500 | 36500 |

スピナーで「365 → 0 → (1に正規化)」と遷移しても、続けて手入力で `730` 等を直接打鍵すれば 365 倍数で進められます。


-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
git show 25f55b2
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


## 依頼 (2026-05-04)
Claudeさん、ありがとうございます。
確認しました。

続いて、機能追加です。
「辻ライン365」ボタンを追加します。
詳細は、デッサン`01-location.md`に記載をしました。
よろしくお願いいたします。
