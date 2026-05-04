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

### 回答 (2026-05-04) — 辻ライン365 トグルボタンの追加

#### 1. ボタンの追加 (`index.html`)

位置情報メニュー1列目5段目 (旧spacer-btn位置) に追加:

```html
<div class="control-row">
    <div class="btn-group-left">
        <button id="btn-dp365" class="nav-btn small" title="辻ライン365(直近1年の辻ラインを描画します)">辻</button>
    </div>
    <label class="input-label">目的点標高(m):</label>
    ...
</div>
```

#### 2. 状態管理 (`script.js`)

- `appState.isDP365Active: false` (新規)
- `saveAppState` / `loadAppState` に追加
- 起動時の `if (appState.isDP365Active) document.getElementById('btn-dp365').classList.add('active')`

#### 3. `toggleDP365()` トグルハンドラ

```js
function toggleDP365() {
    appState.isDP365Active = !appState.isDP365Active;
    const btn = document.getElementById('btn-dp365');
    if (appState.isDP365Active) {
        btn.classList.add('active');
        updateDP365Lines();
    } else {
        btn.classList.remove('active');
        dp365Layer.clearLayers();
        dp365CurrentGeneration++; // 進行中の計算を破棄
    }
    saveAppState();
}
```

OFF時は世代カウンタをインクリメントすることで、進行中の Promise が結果を破棄します。

#### 4. `updateDP365Lines()` — 並列バッチ計算

365日分 × 表示天体分のpath計算を、DPプール (`dp-line-worker`) のWorkerプールに投入します。UIフリーズ回避のため `BATCH_DAYS = DP_POOL_SIZE` (8日) ずつのバッチで処理し、バッチ間で `await` して yield。

```js
const BATCH_DAYS = DP_POOL_SIZE;
for (let dOff = 0; dOff < totalDays; dOff += BATCH_DAYS) {
    if (generation !== dp365CurrentGeneration) return;
    const batchTasks = [];
    for (let b = 0; b < BATCH_DAYS && (dOff + b) < totalDays; b++) {
        const day = new Date(baseDate.getTime() + (dOff + b) * 86400000);
        for (const body of visibleBodies) {
            batchTasks.push(calculateDPPathPoints(day, body, observer).then(pts => {
                if (generation !== dp365CurrentGeneration) return;
                drawDP365Path(pts, body.color);
                doneWork++;
                updateLabel();  // 「辻」ボタンに XX% 表示
            }));
        }
    }
    await Promise.all(batchTasks);
}
```

`calculateDPPathPoints` は既存の DP プール (1秒サンプリング) を再利用するため、新規 Worker は不要です。

#### 5. `drawDP365Path()` — 軽量描画 (◎破線のみ)

通常の辻ラインと違い、5分マーカー・時刻ラベル・前後日線・視半径エッジ線・△境界線などは描画しません。`dashArray: '13, 13'` の破線のみ、weight=3, opacity=0.6 で控えめに表示します。

```js
L.polyline(seg, { color, weight: 3, opacity: 0.6, dashArray: '13, 13' }).addTo(dp365Layer);
```

`dp365Layer` は通常の `dpLayer` とは独立したレイヤーで、365のON/OFFが通常の辻ラインに影響しません。

#### 6. 進捗表示

ボタン自体に `XX%` を表示します (例: `45%`)。完了時に「辻」に戻ります。

#### 7. 仕様メモ

- 365日 × 5天体 = 1825 path計算 (各day内で各天体について 1時間粗スキャン → 可視時間のみ Worker で 1秒サンプリング)
- 太陽・月のように毎日空に出る天体だと、各day平均 6〜12時間 × 1825 day ≈ 11000〜22000 Workerタスク。プール8並列で数分〜十数分の処理。
- `appState.isMoving` 中は `calculateDPPathPoints` がメインスレッド1分粗描画パスへ分岐するため、365 を有効化中にアニメーションを開始した場合は描画品質が下がります (停止後に手動でトグルOFF→ONで再計算してください)。
- 計算中にユーザーが日付/位置を変更しても、既に開始した365計算は当時の値で完了します (現在の世代のものは描画される)。次回ON時に最新値で再計算されます。


-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
git show b542338
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


## 依頼 (2026-05-04)
Claudeさん、ありがとうございます。
確認しました。
スマホで実行すると、メモリ不足で処理がキャンセルされるようです。
1秒間隔でなくて1分間隔にしましょう。
あと、途中で処理をキャンセルすると、ボタンラベル名が「何％」のままで「辻」に戻りません。
修正をよろしくお願いいたします。

### 回答 (2026-05-04) — 辻ライン365 を1分間隔に変更 + キャンセル時のラベル復元

#### 1. サンプリング間隔を 1秒 → 1分 に変更 (メモリ削減 60×)

**worker側 (`dp-line-worker.js`)**: `stepSeconds` パラメータを追加し、ループ刻み幅を可変化:

```js
const stepSec = (stepSeconds && stepSeconds > 0) ? stepSeconds : 1;
const startSec = hourStart * 3600;
const endSec = hourEnd * 3600;
for (let s = startSec; s < endSec; s += stepSec) {
    // ...
}
```

`stepSeconds` 未指定時は従来通り 1秒 (通常の辻ライン用)。

**`calculateDPPathPoints` (`script.js`)**: 第4引数に `opts` オブジェクトを追加:

```js
async function calculateDPPathPoints(targetDate, body, observer, opts = {}) {
    const stepSeconds = opts.stepSeconds || 1;
    const forceWorker = !!opts.forceWorker;
    // ...
    if (appState.isMoving && !forceWorker) { /* main-thread fallback */ }
    // ... pass stepSeconds to dpPoolRunTask({ ..., stepSeconds })
}
```

- `opts.stepSeconds`: Worker内サンプリング間隔(秒) (デフォルト 1)
- `opts.forceWorker`: アニメ中でもメインスレッドフォールバックせずWorkerパス強制 (365モード用)

**`updateDP365Lines`**: `{ stepSeconds: 60, forceWorker: true }` を渡す:

```js
calculateDPPathPoints(day, body, observer, { stepSeconds: 60, forceWorker: true })
```

これで:
- 1チャンク (1時間) 当たり最大 3600 → 60 ポイント (60×削減)
- 365日 × 5天体 × 60点/時間 × 6〜12時間 ≈ 65万〜130万 → 1万〜2万 ポイントへ
- スマホでもメモリ枯渇しにくくなります

**他の動作への影響なし**: 通常の辻ライン (`updateDPLines`) は引数を渡さないため、従来通り1秒精度のまま動作します。

#### 2. キャンセル時のボタンラベル復元

**バグの原因**: `updateDP365Lines` の `finally` ブロックは「自分の世代がまだアクティブな時のみ」ラベルを復元していたため、ユーザーがOFFトグル → `dp365CurrentGeneration++` の時、orphan は既に古い世代になっており finally の条件分岐がfalseとなり、ラベルが「XX%」のままでした。

**修正**: `toggleDP365()` のOFF分岐で**即座にラベルを復元**:

```js
} else {
    btn.classList.remove('active');
    btn.textContent = '辻'; // ← 進捗表示(XX%)が残らないように即座にラベル復元
    dp365Layer.clearLayers();
    dp365CurrentGeneration++;
}
```

orphan async の `.then()` 内では `if (generation !== dp365CurrentGeneration) return;` チェックを通るため、キャンセル後の遅延ポイント描画やラベル更新は行われず、リセット済みラベルが上書きされる心配もありません。


-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
git show 99b145d
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


## 依頼 (2026-05-04)
Claudeさん、ありがとうございます。
確認しました。
スムーズに表示されるようになりました。

あと、私の伝え方が良くなかったのですが、表示天体メニューで表示を切り替えた時に、表示・再表示出来るようにしたいです。
何か疑問点や質問はありますでしょうか。
