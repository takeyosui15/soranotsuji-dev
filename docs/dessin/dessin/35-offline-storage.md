# 35. オフライン起動と端末のデータ管理(デッサン第3版)

- 起草: 2026-10-15(第182ラウンド・第1版=案)。第2版: 2026-10-15(第183ラウンド・依頼者の Q1〜Q6 の回答を取り込み、段1=Service Worker を v1.99.0 で実装)。第3版: 2026-10-19(第184ラウンド・段2=片付けと上限、段3=ホーム画面/永続/オフライン表示を v1.99.1 で実装。版の置き場を sora-constants.js の1箇所に。建物(PLATEAU)の店を追加=依頼者)。
- 目的: ①圏外でも宙の辻を**開ける**(第1版まで: 開いたまま圏外になった時だけ動いた) ②端末にある宙の辻のデータを1か所で見て・消せる ③控えを自動で片付ける(使っていない物から・上限つき・使用量が分かる)。
- 位置づけ: 段1〜段3まで実装済み(v1.99.1・未配布)。残りは利用者向けの公開文(FAQ/リリースノート=docs/note に案)と、iPhone の Chrome での実機確認。
- 関連: デッサン18(バックアップ/インポート: 「本体の控え」の行)・デッサン34(セキュリティ: SW は自オリジンだけ)・デッサン00(ドライブ同期)・デッサン33(SORA.STORE)。

## 1. 依頼者の問いへの答え(第1版から。短く)

| 問い | 答え |
|---|---|
| アプリ本体のデータ(HTML/JS/フォント)も IndexedDB に入っているか | **入っていなかった。** 本体はブラウザの HTTP キャッシュ(GitHub Pages の `max-age=600`=10分)だけだった。IndexedDB にあるのは 地理タイル(`soranotsuji-maptiles`)・標高タイルと可視マップ資産(`soranotsuji-kashimap`)・天気(`soranotsuji-wx`)。設定は localStorage(`soranotsuji_app`)。**第183から本体は Service Worker の Cache Storage(`sora-shell-v<版>`)に版ごとに控える**ので「圏外で開く」ができる。 |
| 本体は常に最新を読みに行き、読めなければ控えから、が良いか | **はい(ページはネット優先・落ちたら控え)。** 本体のファイルは、ページの版と控えの版が同じなら控えから(速い・圏外で動く)、違えば(配布直後)ネットだけ(下の 2.6)。 |
| アプリデータの全削除ボタンが欲しい | 置いた。バックアップ/インポートメニューの「本体の控え(オフライン用)」に件数/容量/版と「本体の控えを削除」(段1)。地理/標高の全削除は既存。天気・可視マップ資産・設定の行と「全部削除」は段2(3.)。reset.html も控えと登録を消す(段1)。 |
| 地理/標高タイルを自動で管理(最終使用から30日で削除・上限・使用率%)したい。バックグラウンドのスレッドは難しいか | **ウェブには「閉じた後も動く裏方」は無い**(Periodic Background Sync は Chrome のインストール済み PWA 限定で当てにならない)。なので「開いている間」に片付ける: 起動5秒後(1日1回)+前面に戻った時+「今すぐ整理」ボタン。実際の削除は Web Worker(ワーカー)で、画面を止めずに(段2)。上限と使用率%は店(ストア)ごとにアプリが数える(ブラウザは「オリジン全体」しか見ない)。 |
| IndexedDB は localStorage と同じくドメインごとか | **同じ(オリジン=スキーム+ホスト+ポートごと)。** IndexedDB も Cache Storage も同じ規則。注意: 開発サイト `takeyosui15.github.io` は、そのアカウントの他のプロジェクトページとも同じオリジン(控えの名前に `sora-` を付けて区別)。ブラウザが容量不足で消す時は「オリジンの全部」をまとめて消す(店ごとではない)。 |

## 2. 本体のオフライン起動 = Service Worker(SW)。**段1・v1.99.0 で実装**

1. 置き場と範囲: `sw.js` をリポジトリ直下に置き、本体が `navigator.serviceWorker.register('sw.js?v=' + APP_VERSION, { updateViaCache: 'none' })`。範囲(scope)は置いたフォルダ=本番は `/`、開発サイトは `/soranotsuji-dev/`(GitHub Pages は `Service-Worker-Allowed` を送れないので、置き場で決まる)。
   - 登録するのは **https の時だけ**(本番・開発サイト)。ローカルの検証(`http://127.0.0.1`)では `?sw=1` を付けた時だけ登録する=既存の verify 群(Playwright の route で外部を遮断)が SW に横取りされないため。
   - 登録は `load` の1.5秒後(起動の描画を邪魔しない)。前面に戻った時、1時間以上経っていれば `registration.update()`(ページ自体はネット優先なので、これは落ちた時の保険の更新)。
2. 版の置き場(第184・依頼者「1箇所を直したら全てに反映」=SSOT): **`sora-constants.js` の `APP_VERSION` だけ**。script.js は `SORA.APP_VERSION` を読む(フッター・起動ログ・書き出しの印)。sw.js は `importScripts('sora-constants.js')` で同じ値を読み、控えの名前 `sora-shell-v<版>` を付ける。`updateViaCache:'none'` なので、版が変わる(=sora-constants.js のバイトが変わる)とブラウザが新しい SW として入れ直す。登録URLの `?v=` と index.html の meta は廃止。
   - 配信中の版の見分け方: ページ(navigate)を取る時に `sora-constants.js` も最新で読み(10KB・条件つき要求)、`APP_VERSION = '…'` を正規表現で読む。install の版の門番も同じ。
   - verify 群の版の検査は「script.js と sora-constants.js を繋いだ文字列」に対して行う(78本を機械で更新。ピンは最新の verify=verify188)。
   - 第2版で「移すと40本の意図更新になる」と書いた懸念は、機械更新(定義行1本+正規表現の置換)で片付いた。
   - **配信物を変えたら必ず APP_VERSION を上げる**(控えの入れ替えの合図。版を上げないと、同じ版の控えが優先されて新しいファイルが読まれない)。script.js 冒頭の Version History には内容の記録を1行足す(最新行の版=APP_VERSION を verify188 が見張る)。
3. 方針: **自オリジン(範囲の中)の GET だけ**を扱う。他オリジン(Google のログイン/API/ピッカー・script.google.com のカウンタ・地理院/OSM のタイル・Open-Meteo・Nominatim・PLATEAU)・GET 以外・Authorization 付きは触らない(respondWith しない=ブラウザがそのまま通信)。地理院タイルは今の `gsicache://` の店(IndexedDB)のままで、SW で二重に控えない。
4. 控えの中身(先に入れておく物=`sw-precache.js`・39件・約6.5MB): index.html・script.js・sora-constants.js・style.css・three-global.js・reset.html/.js・forecast-features.html・privacy.html・terms.html・`vendor/`(MANIFEST.json の全ファイル・draco)・ワーカー7本・`fonts/SoraSans/0-255.pbf`・celestial_db.json・muni.json・constellations.*.json・milkyway-skymap.webp・`data/` の小さい物(geoid・光害 lp-japan・mountains・plateau-bldg-cities)・アイコン類。
   - 使った時に控える物(先には入れない): milkyway-skymap_4k.webp(7.9MB)・`*_print.webp`・ogp.png・`data/kashimap/**`。種類は拡張子で絞り(js/css/html/json/bin/csv/webp/png/ico/svg/pbf/wasm/woff)、合計が `SORA.STORE.SHELL_MAX_BYTES`(64MB)を超える時は控えない(**アプリ本体の領域の念のための制限**=memo④)。
   - 一覧は手で書かず道具 `tools/sw/build-precache.js` が配信面から集める(固定の本体+index.html の script/link+vendor/MANIFEST.json+ワーカー=`new Worker('…')` と直下の `*-worker.js`+同梱データ)。`--write` で作り直し、`--check` で一致を確かめる(verify187 S2 と deploy-guide のプレ・デプロイ)。実体の無いファイルは `--write` の時点で止める(無い物が一覧にあると install が失敗して古いまま=2フェーズの性質)。
   - 先に入れる時は `new Request(url, {cache:'reload'})` で HTTP キャッシュを飛ばす(10分の古い写しを入れないため)。
5. 入れ替え=**2フェーズ**(依頼者 Q3 の答え。「更新中に電波が切れて中途半端」を防ぐ):
   - フェーズ1(install): 新しい版の SW が、新しい名前の控え `sora-shell-v<新版>` に一覧を**全部**入れ(`cache.addAll`=1つでも失敗すれば全体が失敗)、入った後にもう一度**全件の有無を確かめて**から `skipWaiting()`。途中で圏外になれば install が失敗し、**新しい SW は捨てられ、古い SW と古い控えのまま**動く(次に開いた時にまた最初から試す)。
   - フェーズ2(activate): 新しい SW が有効になった時に初めて、古い `sora-shell-*` を消して `clients.claim()`。
   - これはブラウザの SW の規則そのもの(install が失敗した SW は activate されない)なので、宙の辻側で「途中の状態」を持たない。
6. ページとファイルの読み方(ネット優先と「古い控えを混ぜない」の両立):
   - **ページ(index.html=navigate)**: ネット優先(`cache:'no-cache'`=条件つき要求。GitHub Pages は ETag を返すので変わっていなければ 304 で軽い。待ち時間 `SHELL_NAV_TIMEOUT_MS`=4秒)。落ちたら控えの index.html。ネットから取れたページの版(meta)を、そのクライアントIDに覚えておく。同じ版のページだけ控えに入れる。
   - **本体のファイル(それ以外)**: そのクライアントのページの版が SW の版と**同じ**(普段)なら**控え優先**(速い・圏外で動く)→無ければネット(待ち時間 `SHELL_FETCH_TIMEOUT_MS`=10秒。取れたら控えに入れる)→落ちたら控え。ページの版が**違う**(配布直後: 古い SW の下で新しいページが開いた)なら**ネットだけ**=古い控えを新しいページに混ぜない。落ちたら読み直しで控えの古い版に揃う(次に開いた時には新しい SW が入っている)。呼び元が `cache:'reload'/'no-store'/'no-cache'` を指定した要求はネット優先。
   - 控えから出した応答には `x-sora-shell: cache` の印を付ける(段3の「オフライン表示」の判定と検証用)。
   - 既知の小さな窓: SW が再起動すると「クライアントIDと版」の表が消え、その時は「同じ版」とみなして控え優先になる。配布直後の数秒に SW の再起動が重なった時だけ起こり得て、次の読み込みで直る。
   - 第183の反証レビュー(Workflow・実機で再現)で足した守り: ①ワーカーは起動元のページの版を引き継ぐ(ワーカーの importScripts は e.clientId がワーカー自身の id なので、new Worker の要求の resultingClientId に版を写す) ②Cache Storage が壊れていて open が reject する端末では SW が無い時と同じに素通し(白画面にしない) ③install の版の門番: 配信中の index.html の版が自分の版と違えば install を捨てる(sw.js や sw-precache.js だけが変わった時に、旧URL sw.js?v=旧 の自動更新が旧版名の控えへ新版を上書きしないため) ④install 失敗で途中の控えを残さない(同じ名前の控えが生きていれば消さない) ⑤範囲内の転送(/data→/data/ の 301)は Response.redirect でブラウザに辿らせる ⑥配信元の 5xx は控えで凌ぐ ⑦容量は実体のバイト数で数える(GitHub Pages の content-length は gzip 後) ⑧登録はページの meta の版で行い、meta と APP_VERSION が違う(古い script.js が控えから出た)時は新しい SW が入ったら一度だけ読み直す(resultingClientId の無い古い WebKit でも版が揃う) ⑨「本体の控えを削除」と reset.html は自分の範囲の登録だけを解除(開発サイトは他のプロジェクトとオリジンを共有)。
7. CSP: 今の meta に `worker-src 'self' blob:` があるので登録は通る。`sw.js` の importScripts は自オリジンの2本(sora-constants.js・sw-precache.js)だけ(verify187 S1)。控えから出す index.html にも meta の CSP は入っている。
8. 消す時: バックアップ/インポートメニューの「本体の控えを削除」と reset.html の「すべてのデータを消去する」は、IndexedDB に加えて `caches.keys()→delete`(sora-shell-*)と `navigator.serviceWorker.getRegistrations()→unregister()` を行う。**注記(Q6)**: 「削除すると、次に開く時に通信して作り直します(電波の無い所では開けなくなります)。」をボタンの上に。
9. 検証: verify187=静的(sw.js の形・一覧の一致・版の一致・配線)+実機(`?sw=1` で登録→控えに全件→オンラインで開き直すとページはネット・本体は控え→`context.setOffline(true)` で開き直すとページも控えから開き版のフッターが出る→削除で消える)。
   - 実測(第183): Playwright の `route` は SW の前に割り込み、SW が返した応答(の印)が見えなくなる。verify187 だけは route を使わず、Chromium の `--host-rules`(127.0.0.1 以外を NOTFOUND)で外部を遮断する。他の verify は `?sw=1` を付けないので SW は登録されず、従来どおり。
10. iOS/Android の注意は 6. へ(第2版で独立の節に)。

## 3. 端末のデータの一覧(バックアップ/インポートメニュー。段1で「本体の控え」の行、段2で残り=第184・v1.99.1 で実装)

| 行 | 中身 | 件数/容量 | 最終使用 | 上限 | 使用率 | 削除 | 段 |
|---|---|---|---|---|---|---|---|
| 本体の控え(オフライン用) | `sora-shell-v<版>` の Cache Storage | 件数/MB・版 | − | 64MB(SHELL_MAX_BYTES) | − | 「本体の控えを削除」(SW も解除。注記つき) | **段1(済)** |
| 設定(登録内容) | localStorage `soranotsuji_app` | KB(文字数×2) | − | 約5MB(ブラウザ) | % | 既存(reset.html)へ | **段2(済)** |
| 地理タイル | `soranotsuji-maptiles`(店 v3: usedAt の索引) | 件数/MB | 最終使用(usedAt の最大。無ければ savedAt) | 1GB(上限(MB)の欄で端末ごとに) | % | 既存「地理タイルを全削除」 | **段2(済)** |
| 標高タイル | `soranotsuji-kashimap` の tiles(店 v4: usedAt) | 件数/MB | 同上 | 1GB(同上) | % | 既存「標高タイルを全削除」 | **段2(済)** |
| 建物(PLATEAU) | `soranotsuji-bldg` の tiles(第184・依頼者: 地理/標高と同じ別項目。b3dm と tileset.json。鍵=URL) | 件数/MB | 同上 | 1GB(同上) | % | 「建物タイルを全削除」 | **段2(済)** |
| 可視マップ資産 | 同 DB の assets(要約の size の合計) | 件数/MB | − | 1GB(目安。自動では消さない) | % | 既存(可視マップの資産一覧)へ。封鎖中は行を隠す | **段2(済)** |
| 天気の控え | `soranotsuji-wx` | 件数/KB(JSON の長さ) | − | 1GB(目安)+TTL 2時間 | % | 「天気の控えを削除」 | **段2(済)** |
| 全体 | `navigator.storage.estimate()`・`persisted()` | 使用/割当(ブラウザの見積もり)・永続 はい/いいえ | 前回の整理の日時 | ブラウザ | − | 「今すぐ整理」「永続化を要求」(段3)。全部削除は reset.html | **段2/3(済)** |

- 上限の既定(依頼者 Q1): **地理 1GB・標高 1GB・可視マップ資産 1GB・天気 1GB**(天気は宙統計で過去データを一時的に貯める可能性があるため)。本体の控えは 64MB(念のための制限)。
- 上限の設定(memo④・依頼者の問い「スマホと PC で変えられるか・ユーザがテキストボックスで変えられるか」): **できる(段2で実装)。** 既定値は SORA.STORE.CAP_BYTES に1箇所、端末ごとの上書きは appState.storeCaps(MB。localStorage=端末ごと・ドライブ同期には乗るが端末の設定なので持ち主が合わせる)に持ち、一覧の各行の「上限(MB)」のテキストボックスで変える(空欄=既定。10〜1,000,000。normalizeAppState で知らない店と範囲外を捨てる)。スマホと PC の違いは「端末ごとの設定」で自然に分かれる(自動で機種を見分けて変えることはしない=分かりにくいため)。ブラウザの割当(`estimate().quota`)が上限より小さい端末では、割当の方が先に効く(その旨を「全体」の行に出す)。
- 使用量は店ごとにアプリが数える(今の `size` の索引で件数・合計バイトは数えられる)。`estimate()` はオリジン全体の目安(他のデータも含む・端数は丸められる)として「全体」の行だけに使う。`persist()` の結果(永続: はい/いいえ)も「全体」の行に(段3)。
- 「今すぐ整理」ボタン=4.の片付けを手で起動(進み具合を表示)(段2)。
- 画面の設計はデッサン18(バックアップ/インポート)の「端末のデータ」の節に写す(第183で段1の行を追記)。

## 4. 自動の片付け(地理タイル・標高タイル・建物・天気。段2=第184・v1.99.1 で実装: sora-store-worker.js)

- 最終使用(`usedAt`)を記録する。読み(ヒット)のたびに書くと重いので、**前回の記録から24時間以上経っていた時だけ**書き直す(1タイル1日1回まで)。索引に `usedAt` を足す(無い古い記録は索引に出ないので、1GB の書き直しは不要。古い記録は `savedAt` で代用して判定)。
- 規則: ①`SORA.STORE.UNUSED_DAYS`(=30)日使っていない物を消す ②店の上限の9割を超えたら、古い順(usedAt)に8割まで消す(行ったり来たりしないよう幅を持つ) ③天気は TTL(2時間)切れを消す。
- **30日は設定で変えない(依頼者 Q2)。変える時は `sora-constants.js` の `STORE.UNUSED_DAYS` の1箇所だけ**(本体・片付けのワーカー・道具が同じ値を読む。段1で定義済み。verify187 S3 が「ここにある」ことを見張り、段2で「他に 30 の字面が無い」も見張る)。
- TTL=**Time To Live(有効期限)**: 控えに「いつまで使ってよいか」を付けておく仕組み。天気の控えは「取ってから2時間」までは再利用し、過ぎたら取り直す(宙検索・宙断面=封鎖中)。
- 契機: ①起動の約5秒後(`localStorage` の `soranotsuji_store_clean_at` が24時間より前なら) ②画面が前面に戻った時(同じ条件) ③「今すぐ整理」ボタン(いつでも)。実行は専用のワーカー `sora-store-worker.js`: 値(タイルのバイト列)は読まず、size/savedAt/usedAt の索引の鍵カーソルで台帳を作り、200件ずつ別の取引で削除(画面を止めない)。無い店は作らない(onupgradeneeded で abort)。結果は「整理しました: N件・MB」を行に出す。定数(30日・9割/8割・1日1回・200件・TTL)は全部 SORA.STORE から本体が渡す。
- `requestIdleCallback` は Safari で無効のままなので `setTimeout` で代用。

## 5. 守りとの関係(デッサン34)

- SW は自オリジンの GET だけ。他オリジン(Google の鍵が載る通信)は一切触らない(respondWith しない=ブラウザがそのまま通信)。Authorization 付きの要求も触らない。
- 控えに入れるのは自サイトの配信物だけ。MANIFEST.json の指紋の仕組みは今のまま(SW は配信の写しであって出所ではない)。
- `sw.js` 自体も検査の対象(verify187 S1: 外部の importScripts/fetch が無い・自オリジン判定・GET だけ)。CSP の worker-src は 'self'。
- 控えは「その版の配信物の写し」なので、配信物を差し替える攻撃(デッサン34 の供給網)に対する守りは増えも減りもしない(控えに入る前の取得は従来と同じ経路)。

## 6. オフラインでの利用方法(利用者向けの案内の元。第184: ヘルプ(index.html)に項を足し、FAQ の案を docs/note/note-faq-page.md に書いた=依頼者の承認後に note へ)

- 共通: 一度オンラインで宙の辻を開いて少し待つ(本体の控えができる。バックアップ/インポートメニューの「本体の控え(オフライン用)」に件数と版が出れば完了)。その後は電波が無くても開ける。地図・標高・天気は「一度見た範囲」だけ(端末の控えのある所)。Google ドライブ同期・地名検索・天気の取得は通信が要る。
- **iOS(iPhone/iPad)**: Safari も Chrome も **WebKit(同じエンジン)**なので規則は同じ(依頼者の問い「iOS の Chrome は Safari と別か」→ 別ではない。iOS では全てのブラウザが Safari のエンジンを使う決まり)。「7日間そのサイトを触らないと、スクリプトが書いたデータ(IndexedDB・Cache Storage・localStorage)を全部消す」規則(ITP)がある。**ホーム画面に追加**した宙の辻は別の勘定になり消されない。
  - ホーム画面に追加: Safari なら共有ボタン→「ホーム画面に追加」。Chrome(iOS)でも共有→「ホーム画面に追加」ができる(開くのは WebKit の standalone 表示)。
  - 注意: ホーム画面の宙の辻と、ブラウザのタブの宙の辻は**データの入れ物が別**(My観測点などは共有されない)。移す時はバックアップ/インポート(JSON)か Google ドライブ同期で。
  - データを消す方法(依頼者の問い「ホーム画面に追加したら消せるか」→ 消せる): ①ホーム画面の宙の辻の中で「本体の控えを削除」「地理/標高タイルを全削除」・reset.html ②iOS の 設定 → Safari → 詳細 → Webサイトデータ で soranotsuji.net を削除(ホーム画面の分も含む) ③ホーム画面のアイコンを削除(そのデータも消える)。
  - `navigator.storage.persist()` は iOS では効かない(ホーム画面への追加が代わり)。
- **Android**: Chrome(Blink)の規則。オリジンの割当はディスクの最大6割ほどで十分。容量が逼迫すると「最も使っていないオリジン」から消される(LRU)が、`navigator.storage.persist()` が許可されると消されない(ホーム画面に追加/インストール済み・ブックマーク済み・よく使うサイトなら自動で許可。段3で起動時に1回呼び、結果を「全体」の行に出す)。「ホーム画面に追加」は Android でも勧める(standalone 表示+永続の許可が得やすい)。Samsung Internet・Firefox も SW は使える(persist の判定はブラウザごと)。
  - データを消す方法: アプリ内の削除ボタン・reset.html のほか、Chrome の 設定 → サイトの設定 → 保存されたデータ(またはホーム画面の宙の辻を長押し→アプリ情報→ストレージの削除)。
- **PC(Windows/Mac)**: Chrome/Edge/Firefox/Safari とも SW は使える。Safari(Mac)は iOS と同じ7日の規則がある。
- 要実機確認(段3の前に依頼者と): iPhone の Chrome で「ホーム画面に追加」の出方・7日の規則が Chrome(iOS)のタブにも効くか(WebKit なので効くはず)。

## 7. 段取り

1. **段1(第183・v1.99.0・済)**: SW(2.)+登録URLの ?v= で版+`sw-precache.js` の道具(--write/--check)+「本体の控え」の行と削除(3.)+reset.html の対応+index.html の meta app-version+SORA.STORE(上限・待ち時間・30日)+verify187+deploy-guide のプレ・デプロイ項目。
2. **段2(第184・v1.99.1・済)**: usedAt(店 v3/v4・ヒットで1日1回)・上限(SORA.STORE.CAP_BYTES+端末ごとの上限(MB)の欄)・片付け(sora-store-worker.js)+一覧の残りの行(設定/建物/可視マップ資産/天気/全体)+「今すぐ整理」+「天気の控えを削除」+建物(PLATEAU)の店 soranotsuji-bldg(b3dm と tileset.json を控え、都市モードが圏外でも一度見た街は出る)+verify188。
3. **段3(第184・済)**: manifest.json(`<link rel="manifest">`・standalone・start_url ./)+「永続化を要求」ボタン(persist() は押した時だけ=Firefox は確認が出るので起動時には呼ばない)+「オフライン表示」の印(SW に `sora:served?` を尋ね、控えから出したページなら版の横に。navigator.onLine=false でも)+ヘルプの「端末のデータ」「オフラインでの利用方法」+FAQ/リリースノート/お知らせの案(docs/note)+deploy-guide。
4. 配布: v1.99.1 として段1〜3をまとめて(依頼者の判断)。配った後の確認に「機内モードで開き直せる」「端末のデータの行に件数が出る」を H に足す(deploy-guide に記載済み)。残り: iPhone の Chrome での「ホーム画面に追加」と7日の規則の実機確認(依頼者)。

## 8. 未決(第3版で残っている物)

- manifest.json の見た目(standalone=ブラウザの枠無し・theme_color #1e1e1e)と名前・アイコン(apple-touch-icon.png と logo.png の流用)=実機で見て依頼者の判断。
- 可視マップ資産の上限は使用率の表示だけ(自動では消さない)。資産の作成時に上限で止めるかは可視マップの再開時に。
- 6. の公開文(FAQ・リリースノート・お知らせ)=docs/note に案。依頼者の承認後に note へ。
