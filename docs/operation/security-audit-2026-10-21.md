# セキュリティ監査 2026-10-21(第185ラウンド)— 直しの記録と報告書

このファイルは2部構成です。前半「A. 直しの記録」は第185ラウンドで実際に行ったこと(同じラウンドで直した・受け入れた・依頼者へ提案)、後半「B. 監査の報告書」は Workflow(claude-security 相当)が出した報告書の原文です(報告書の F-01〜F-30 の番号を A でも使います)。
やり方: 脅威モデル(1)→12視点の走査(12)→指摘ごとの反証(低=1レンズ・中/高=3レンズ)→確認された物のパッチ案→報告書。エージェント 115・約2.9時間。生の指摘 50 件→確認 43 件(統合して 30 件)・反証 7 件・確認して問題なしの記録 189 件。
置き場: 報告書の原文はこのファイルの B。直しの字面は tests/verify184.js の S12(静的)と U9(毒入りの URL で起動)が見張る。設計への反映はデッサン34 §9。

## A. 直しの記録(第185ラウンド・v1.99.2)

### A-1. 同じラウンドで直した物(コード)

| 報告書の番号 | 直し | 場所 |
|---|---|---|
| F-02 | ページ(navigate)の控えは一覧(sw-precache)にあるページだけ入れる(範囲内の任意の 200 応答で控えを膨らませない) | sw.js `PRECACHE_KEYS` |
| F-03 | My観測点/My目的点の緯度経度は ±90/±180 の範囲(型そろえで範囲外の行は捨てる・CSV 取り込みは行で止める) | script.js `_sanitizeStoredShapes` `importMyPointsCsv` `appendMyPointsCsv` |
| F-04 | 気象値(気圧/気温/気温減率)は有限で常識の範囲、違えば標準値。K は型そろえの後に取り直す。URL は Infinity を通さない | `_sanitizeStoredShapes` `restoreFromUrl` |
| F-05 | 宙の辻フォルダ名は文字で 1〜100 文字、違えば既定 | `_sanitizeStoredShapes` |
| F-06 | 表示中のセットの ID は整数で、既定(0)か存在する Myセットだけ | `_sanitizeStoredShapes` |
| F-07 | 既定のセット(ID:0)のメモ/シートID/真偽の欄を型そろえ | `_sanitizeStoredShapes` |
| F-08 | 位置情報のラジオ(locMode)は start/end だけ | `_sanitizeStoredShapes` |
| F-09 | My* の行の ID 重複は先頭の行だけ残す | `_sanitizeStoredShapes` `uniqById` |
| F-10 | My* の行数はアプリの上限 1,000 まで | `_sanitizeStoredShapes` `ROW_MAX` |
| F-11 | My宙検索の名前は 150 文字(他の取り込みと同じ)。My宙の型そろえにも名前の長さ | `parseMySoraCsvLine` |
| F-12 | プリセットの列挙は `in` ではなく hasOwnProperty(__proto__/constructor が通らない) | `normalizeAppState` ×2 |
| F-13 | loadAppState は配列/オブジェクトの形を見てから触る(壊れた1キーで残りの復元が飛ばない) | `loadAppState` |
| F-14 | 旧形式バックアップの取り込みは途中で例外になったら localStorage から読み直す(半端な状態を残さない) | `importBackup` |
| F-15 | CSV 取り込みの名前/メモの長さは保存時の型そろえと同じ(300/1000)に | `importMyPointsCsv` `appendMyPointsCsv` `importMyStarsCsv` |
| F-16 | 可視マップ資産の山名は文字に(一覧の並べ替えも文字列化) | `_kmStoreSave` `_kmRenderStoreList` |
| F-17 | URL の date/time は数字だけ(8桁・4/6桁)。壊れた日時は現在時刻に戻す最終防衛 | `restoreFromUrl` |
| F-18 | URL の標高/高さは有限で ±20,000m | `restoreFromUrl` `elvOk` |
| F-19 | 花火の緯度経度は範囲外なら捨てる(null) | `normalizeAppState` |
| F-20 | 短縮URL(?query=)の LZW 展開に上限 262,144 文字(展開爆弾) | `decodeQueryParam` `QP_DECODE_MAX_CHARS` |
| F-21 | URL の My天体は 1,000 件まで | `restoreFromUrl` |
| F-23 | My辻検索の天体 ID は重複排除 | `executeSingleMyTsujiSearch` |
| F-24 | googleLogin の約束は毎回の呼び出しの物を解決する(2回目以降が永久に未解決だった) | `googleLogin` `_googleLoginResolve` |
| F-25 | シートの読み取りは列も CV(100列)まで(2箇所) | `_mySetFetchSheetData` ほか |
| F-26 | 宙の窓の地形ワーカーのタイル取得に 12 秒の待ち時間 | sora-terrain-worker.js |
| F-27 | CSP の s3.amazonaws.com は /elevation-tiles-prod/、script.google.com は /macros/s/ の経路まで | index.html |

### A-2. 受け入れた物(今は直さない。理由つき)

- **F-01 控え(Cache Storage)の中身を検査せずに本体を出す**: 開発サイト(takeyosui15.github.io=他のプロジェクトと同一オリジン)だけの筋で、本番(soranotsuji.net)は専用オリジン。反証の3レンズとも low。対策は「本番は専用オリジン」「開発オリジンに宙の辻-dev 以外の HTML を置かない」(デッサン34 §7b の運用)で足りると判断。将来 vendor/本体の指紋を SW で照合する案は §9 の次の段に。
- **F-22 共有 URL(mode=tsujisearch/tsujimesh)の自動実行の量**: 開いた人の端末の CPU を使うだけ(自分で開いた URL)。検索はキャンセルでき、日数や許容範囲は normalizeAppState の範囲で収まる。確認ダイアログを足すと共有 URL の体験(開けばすぐ結果)が損なわれるので今は変えない。
- **F-28 vendor/ の advisory の監視**: 自動の手段(Dependabot)は vendor/ を見ない。運用(毎月の点検)の項目に「vendor/ の4ライブラリの版と advisory を見る」を足した(todo)。

### A-3. 依頼者へ提案(公開文=事前提示)

- **F-29 privacy.html の写位の記述**: 「写真から読み取った位置情報は外部へ送信・端末に保存しない」は、標高の取得で緯度経度を地理院/Open-Meteo へ送り、観測点/My点として端末に保存する実装と合わない。案: 「写真の位置情報(Exif)は端末の中で読み取り、写真そのものは送信・保存しません。読み取った緯度経度は、他の方法で置いた観測点/目的点と同じ扱い(標高の取得のために国土地理院/Open-Meteo へ送る・端末に保存する)になります。」
- **F-30 GPS の記載**: privacy.html に端末の位置情報(GPS ボタン)の利用の記載が無い。案: 「GPS ボタンを押した時だけ、ブラウザの位置情報(端末の GPS)を読み、観測点に入れます。許可はブラウザが求め、位置情報はこの端末の中だけで使います(標高の取得のために緯度経度を国土地理院/Open-Meteo へ送る点は他の方法と同じ)。」

### A-4. 反証された物(7件)

F-01 の重複(2件)・可視マップの端末資産の要約の innerHTML(型そろえ済み)・sora_store_clean_at の Infinity(片付けが止まるだけで実害なし=Number() の結果は次の片付けで上書き)・privacy/terms に CSP meta が無い(スクリプトを持たない静的ページ)・vendor の SRI(integrity)が無い(同一オリジン配信+MANIFEST の検査で足りる。開発オリジンの控え汚染は F-01 と同じ扱い)×2。

---

## B. 監査の報告書(Workflow の原文)

# セキュリティ監査 2026-10-21(第185ラウンド・claude-security 相当の Workflow)

対象: 宙の辻(soranotsuji-dev・c759fef)。
前提の文書: docs/dessin/dessin/34-security.md(§1〜§5・§7b)。自動検査: tests/verify184.js(+verify187)。
規則: 読み専用の監査(ファイルの変更なし)。指摘は全て file:line とコードの引用・再現の筋・影響・直し方つき。既に対策済み・受け入れ済みの物は再報告しない(対策が実装どおり効いていない場合だけ報告)。

## 0. 要約

- 走査の結果: 生の指摘 50 件のうち、反証レンズを通って残った物 43 件(重複を統合すると **30 件**)、反証された物 7 件、確認して問題なしの記録 189 件。
- 重大度: **high 0・medium 0・low 30**。申告時に medium だった 3 件(sw.js の控えの無検査配信・My点の緯度経度の範囲・meteo の型)は、反証の票決で全て low に落ちた(理由は各件に記す)。
- 第159(v1.98.0・デッサン34 §4)の 15 の対策は、全て実装どおりに効いていることを確認した(vendor の指紋は上流 jsDelivr と一致・CSP・インライン全廃・型そろえ・noopener/ID 文字種・revoke・GAS・reset・.nojekyll・CSV 式注入・取り込み口の上限・security.txt)。
- 利用者のデータや資格情報が第三者に渡る経路・任意コード実行の経路は見つからなかった。
- 残った指摘の大半は「保存データの型そろえ(_sanitizeStoredShapes)の網羅漏れ」と「URL の数値に範囲が無い」の 2 系統で、どちらも 1 関数への追記で束ねて閉じられる。

### 最重要の 3 件(直す順)

| 順 | 番号 | 題 | なぜ先か |
|---|---|---|---|
| 1 | F-03 | My観測点/My目的点の緯度経度に範囲検査が無く、|緯度|>90 の行で MapLibre の Marker が例外→以後の My マーカー描画と Myセット切替の保存が途中で止まる | 他人の共有シート・CSV・バックアップ・本人の手入力の全部から入り、端末に残って起動のたび再発する。直しは fixMyPoints 1 行 |
| 2 | F-24 | googleLogin() の Promise が 2 回目以降のログインで永久に解決しない(TokenClient の callback が初回の resolve を握ったまま) | 安全の穴ではないが、ログアウト→再ログイン、1 時間後の再取得で「保存したつもりが保存されない」を利用者が日常で踏む。verify に無い |
| 3 | F-01 | sw.js は控え(Cache Storage)の中身を検査せずに script.js 等を出すので、同一オリジンで一度植えた偽の本体が版が上がるまで動き続ける | 前提(同一オリジンで JS が走る)は §7b で受け入れ済みの dev 限定だが、§8 の「控えは配信物の写し」をコードが担保していない。sw-precache.js に sha256 を持たせれば閉じる |

次点: F-04(meteo の型そろえ漏れ=NaN の K が Drive 経由で他端末にも伝播)・F-13(loadAppState の順序=壊れたキー 1 つで Myセット等の復元が飛び、次の保存で確定)。

## 1. やり方

1. **脅威モデル**(§2)を先に書いた。資産・入口・信頼の境界・既に取った対策・走査の候補(⑤の 14 項目)。
2. **12 の視点**で走査エージェントがコードを読み、指摘候補を出した: dom-xss / url-params / messages(postMessage・ワーカー・SW の message)/ service-worker / storage-trust(localStorage・IndexedDB・Cache Storage の信頼)/ google-oauth / file-import / csp-headers / supply-chain / dos-resources / privacy-leak / type-confusion。
3. **3 レンズの反証**: 候補ごとに別のエージェントが独立に読み直し、(a) 既存の守り(型そろえ・escapeHtml・CSP・confirm・上限・verify184)で止まらないか、(b) §7b の受け入れ済みの穴の派生でないか、(c) 再現の筋と影響が実コードどおりか、を票決した(各件の votes)。1 票でも「反証」が通った物は反証済みへ、支持が残った物だけ確認済みへ。重大度は票の多数決(申告より下がった物は申告値も併記)。
4. **パッチ案**: 確認済みの各件に直し方と自動検査(verify)の案を付けた。コードの変更はしていない。
5. エージェント数: 207(走査・反証・照合・補助を含む)。走査の補助として、decodeQueryParam の抜き出し実行(展開量の実測)・vendor/astronomy.browser.min.js と maplibre-gl.js の node 実行(例外の文言の確認)・vendor の sha256 と jsDelivr の配布物一覧の照合・OSV querybatch を使った。

## 2. 脅威モデル(要約)

### 資産
- Google アクセストークン(drive.file・1 時間): メモリの `googleToken` だけ(script.js:14509-14512)。Bearer の送信先は www.googleapis.com・sheets.googleapis.com の 4 箇所。失うと XSS 1 発でこのアプリの Drive ファイルを読み書きされる。
- 端末の保存データ: localStorage `soranotsuji_app`・`sora_store_caps`・`sora_store_clean_at`、IndexedDB 4 店(タイル・kashimap・wx・bldg)、Cache Storage `sora-shell-v<版>`。失うと My リストの改ざん/消失・持続 XSS の苗床・保存枠の枯渇。
- 利用者の Drive/シートの中身(`soranotsuji-app.json`=localStorage の生ダンプ・Myセットの各シート)。端末→Drive→別端末への毒の伝播路。
- 配信物の完全性(GitHub Pages・vendor/ と MANIFEST.json・sw.js の控え)。
- 公開鍵類(clientId・ピッカー API キー・GAS URL)と訪問者カウンタ(§7b 受け入れ)。

### 入口
1. URL クエリ(`restoreFromUrl` 16815・短縮 URL `decodeQueryParam` 16341・`?forecast=1`/`?kashimap=1` の封鎖解除・`?sw=1`)。pushState/replaceState・window の message リスナは無い。
2. ファイル(`pickTextFile` 8MB・バックアップ JSON・CSV 5 種・可視マップ資産・写真の Exif)。
3. Google シート(他人の共有シートも picker で選べる)。
4. Google Drive の app.json(`alt=media`→JSON.parse→`_writeSoranotsujiKeys`→再読込)。
5. 同一オリジンの他ページ(開発オリジン takeyosui15.github.io の共有。§7b)。localStorage/IndexedDB/Cache Storage はオリジン単位。
6. 外部 API の応答(地理院・Nominatim・Open-Meteo・GAS・PLATEAU・タイル画素・Google API JSON・GIS/ピッカーの第三者コード)。
7. ワーカー/SW の message(全て自サイトの固定名・型付きデータのみ)。
8. HTML を組む場所(script.js の innerHTML 127・setHTML 5・insertAdjacentHTML 1・DOMParser 1、reset.js の innerHTML 2)。

### 信頼の境界で効いている守り(確認済み)
- URL: 数値は parseFloat+NaN ガード→`normalizeAppState` の範囲丸め、文字列は APP_DEFAULTS の enum/個別検査、URL で変わったキーは `_urlSessionFrozen` で保存しない(=URL 由来の毒は端末に残らない。設計上の良い壁)。
- 保存データ: `_sanitizeStoredShapes`(3206-3285)が点・My点・My天体・My辻・Myセット・My宙・Drive ID・色を型そろえ。対象外のキー(meteo・soraFolderName・mySetCurrentId・mySetHome・locMode)が今回の指摘の束。
- 描画: escapeHtml/Number()/safeCssColor の二重化。CSP(script-src 'self'・object-src 'none'・base-uri 'self')。`style-src 'unsafe-inline'` なので CSS 注入は CSP では止まらないが、style に届く文字列は全て定数か safeCssColor。
- クリック: `_CLICK_ACTIONS` 許可表。Google ID: 文字種検査+encodeURIComponent+noopener。SW: 自オリジン・範囲内・GET・authorization 無しだけ。

## 3. 確認された指摘

重複を統合した 30 件(生の報告 43 件)。重大度は票決の値。申告が違った物は「申告 medium」と付記。

| 番号 | 重大度 | 場所 | 題 | 直し(要点) |
|---|---|---|---|---|
| F-01 | low(申告 medium・票 low×3) | sw.js:152 | 控えの中身を検査せずに script.js 等を出す(同一オリジンで植えた偽の本体が次の版まで持続) | sw-precache.js に sha256 を持たせ、配信時に crypto.subtle.digest で照合。index.html の script/link に SRI。§7b に「Cache Storage 経由の本体差し替え(dev 限定)」を明記 |
| F-02 | low | sw.js:132 | navigate の控えは種類を絞らず全ての in-scope 200 応答を入れる(第三者がリンクで誘導して 64MB の枠を埋められる) | handleNavigate の putRuntime を text/html(または index.html 鍵)だけに。上限到達時は古い鍵から追い出し |
| F-03 | low(申告 medium・票 low×2 medium×1) | script.js:3238(入口 7029/7076/15280/5035) | My観測点/My目的点の緯度経度に範囲検査が無く、|緯度|>90 の行で MapLibre の LngLat が例外→以後の My マーカー・Myセット切替の保存が途中で止まる | fixMyPoints で |lat|≦90・|lng|≦180 を必須に(dropped に記録)。各入口でも拒否。glUpdateMyPointMarkers の addPts を try/catch |
| F-04 | low(申告 medium・票 low×3) | script.js:3095(6527-6529・17071) | 気象パラメータ meteo が型そろえの対象外。文字列/Infinity/-273.15 で K が NaN/Infinity になり、全ての大気差計算が静かに誤る(保存で永続・Drive で伝播) | _sanitizeStoredShapes に meteo を追加(numOr で p 300〜1100・t −90〜60・l ±0.05)。refractionKInUse に Number.isFinite の保険。17071 は Number.isFinite |
| F-05 | low | script.js:3093(14637) | soraFolderName が型検査されず、文字列以外だと soraRootFolderRealName の .replace が TypeError→Drive 保存/シート作成/自動更新が全て失敗し続ける | _sanitizeStoredShapes で typeof string かつ registerSoraFolderName と同じ規則(先頭 / 1 つ・2 つ目の / 無し・1〜150 文字)でなければ既定へ |
| F-06 | low | script.js:3090 | mySetCurrentId が型・存在を検査されず、"1"(文字列)や存在しない id のまま残る→厳密比較が全て偽になり、切替表示で mySetHomeData が上書きされ、未同期セットの保存でシートを空で上書きし得る | _sanitizeStoredShapes で intId(v) か 0、mySets に同じ id が無ければ 0 |
| F-07 | low | script.js:3092 | 既定のセット mySetHome の sheetId/memo/saveMode/checked が型そろえの対象外(§4.4 の記述が ID:0 に効いていない)。到達先は全て encodeURIComponent/正規表現で止まるので実害は 404 止まり | mySets と同じ規則(sheetId 文字種・memo 1000・checked !!・saveMode 列挙・lastSyncSheetTime 40 文字)を mySetHome にも当てる |
| F-08 | low | script.js:392 | locMode が列挙検査されず、未知の値だと `!== 'end'`(4392/4409)と `=== 'start'`(5006/12257)で観測点/目的点の扱いが食い違う | APP_DEFAULTS を `locMode: { def: 'start', enum: ['start','end'] }` に |
| F-09 | low | script.js:3235 | 保存データ由来の My* 行の ID 重複を除去せず、行削除が同 ID の全行を消し、My辻の obsId/tgtId 参照が先頭行に固定される | 各リストの map の後に seen Set で 2 つ目以降を dropped へ |
| F-10 | low | script.js:3233 | _sanitizeStoredShapes は行数の上限(アプリ自身の 1,000 件)を掛けず、4M 文字に 15 万行を詰めた保存データが起動のたび全行描画で固まる | 各リストに .slice(0, 1000)(MY_LIST_MAX_ROWS に寄せる)。落とした件数を console.warn |
| F-11 | low | script.js:22082(22113・3284) | My宙検索だけ名前/メモに 150 文字の上限が無く、型そろえも長さを切らない(封鎖中・?forecast=1 のみ) | 22082/22113 に .slice(0,150)。3284 を name str(300)/memo str(1000) に |
| F-12 | low | script.js:3352(3360・20910) | ssPreset / My宙検索 preset の列挙検査が `in` 演算子なので constructor/__proto__/toString が通る(汚染は起きない・label undefined・スコア NaN の表示崩れ。?forecast=1 のみ) | Object.hasOwn(SS_PRESETS, key) に。3346 の SORA_SENSOR_ALIASES も同じ書き方に揃える |
| F-13 | low | script.js:3088(3161・3191) | loadAppState が型そろえより前に生の配列を forEach し、myTsujiSearches が配列でないと例外で 3089 以降(Myセット・同期簿記・設定群)の復元が丸ごと飛び、次の保存で既定値が確定する | forEach を Array.isArray で包むか mwOffsetAngle の補完を normalize の後へ。bodies も同様。根本策はキー毎の try |
| F-14 | low | script.js:6513-6515 | 旧形式バックアップの取り込みが normalizeAppState(6533)の前に appState へ直接代入し syncMyStarsToBodies を呼ぶため、[null] 等で途中例外になると生のまま残り、次の保存で書かれる(再読込で自己回復) | 写しに代入→型そろえ→一括反映。簡便策は catch でスナップショットへ戻す |
| F-15 | low | script.js:7021/7026/7068/7074(6269/6306) | CSV 取り込みの名前/メモに長さ上限が無く normalize を通さず保存。取り込み時と再読込時(300/1000)の上限が食い違い黙って切られる。8MB 以内の CSV で QuotaExceeded→そのセッションの保存が止まる(永続はしない) | 入口で .slice(0,150)(画面の maxlength と同じ)。各 import の saveAppState の前に normalizeAppState()。saveAppState が boolean を返し、失敗なら「登録しました」を出さない |
| F-16 | low | script.js:12021(11946・13073) | 可視マップ資産の meta.mountain.name の型を確定せず IndexedDB に書く。数値/配列の name が 1 件あると _kmRenderStoreList の localeCompare が TypeError→一覧が描けず UI から削除もできない。13073 の入口は 8MB 上限も無い(?kashimap=1 のみ) | _kmImportText で name を文字列に確定(無ければ id)・range_km/zoom/x0/y0 の数値確定・13073 に PICK_FILE_MAX_BYTES。11946 を String() で守り、11906 を try/catch |
| F-17 | low | script.js:16880(16876-16890) | URL の date/time が数字でないと Invalid Date になり、_restoredFromUrl で setNow が飛び、Astronomy.Equator の例外で onload が途中で止まる(そのタブだけ) | `/^\d{8}$/`・`/^\d{4}(\d{2})?$/` を通った時だけ適用し、isNaN(getTime()) なら new Date() に戻す |
| F-18 | low | script.js:16866(3218-3229) | startElv/startApiElv/endElv に範囲が無く 1e308 で start.elev が巨大→Astronomy.Equator が "not a finite number" で例外→onload 停止 | _sanitizeStoredShapes で elev/apiElev/height 系を [−500, 100000] m に丸める(バックアップ/Drive 経路も同時に固くなる) |
| F-19 | low | script.js:17051(3349・2079) | fwEnabled=true と |fwLat|>90 で MapLibre の LngLat が例外→起動時の updateAll が 1 回止まる(以後は _fwMapKey で早期 return) | 3349 で |fwLat|≦90・|fwLng|≦180 を検査。glFwUpdateMapMarker の isFinite にも範囲 |
| F-20 | low | script.js:16428(16409-16431) | 短縮 URL の LZW 展開に入力長・出力長・辞書の上限が無く、KwKwK 連鎖で出力が符号数の二乗で膨らむ(実測: 35,165 文字→1.28 億文字 1.1 s。約 75KB で V8 の文字列上限)。開いた端末のタブが固まる/落ちる | 入口で s.length>16384 → null。ループ内で res.length>65536 または dict.length>65536 → null。verify に展開爆弾 1 件 |
| F-21 | low | script.js:16905-16944 | URL の starId/starName の件数に上限が無く、相異なる starId なら 1,000 件の採番上限を迂回して数万の表示天体を作れる(isFixedStar の some が O(n) で updateAll が O(n²)) | `params.getAll('starId').slice(0, 1000)` と push 前の length≧1000 で打ち切り |
| F-22 | low | script.js:853(841-862・498-503・532-533) | mode=tsujisearch/tsujimesh の共有 URL は確認無しに自動実行し、日数 36,500×許容範囲無制限({def} だけで範囲丸めなし)×URL で増やした天体の分だけ CPU/メモリを使い切る(開いた端末だけ・保存されない) | APP_DEFAULTS に tolerance 0..180・offset ±360 の範囲。URL 起点は天体数×日数が閾値超なら confirm() かパネルを開くだけ。結果表のページ分け |
| F-23 | low | script.js:7938(7510・15313・8141) | My辻検索の bodyIds を重複排除せず、「Sun:」×250 の 1 行で同じ天体を 250 回検索し結果も 250 倍 | `[...new Set(split(':'))]` を 7937/8141 に。parseMyTsujiCsvLine でも重複排除して保存 |
| F-24 | low | script.js:14536-14563(14589-14597・15062-15068) | googleTokenClient は初回だけ生成され、callback が初回 Promise の resolve を閉じ込めたまま。ログアウト/失効後の再ログインでは requestAccessToken だけ走り、await していた操作(Drive 保存/読込・Myセット保存/読込・一括更新)が永久に続かない(アイコンだけ変わる) | resolve/reject をモジュール変数に置き googleLogin() のたびに差し替える。または googleLogout()/error_callback で googleTokenClient=null。verify(実機)に「ログアウト→再ログイン→Myセット保存が 1 回で完了」 |
| F-25 | low | script.js:15359(15235・15160-15167) | Myセットのシート読込は 1,100 行の上限だけで列数・セル長・応答サイズの上限が無く、4M 文字の検査(15403)は resp.json() の後。他人の共有シートで 1,100 行×多列×5 万文字の応答を丸ごと解析してタブが落ちる(非永続) | 範囲に列の上限(`A1:BZ1100`)。sheetsApiFetch で resp.text() の長さを STORE_WRITE_MAX_CHARS で見てから JSON.parse |
| F-26 | low | sora-terrain-worker.js:145 | 宙の窓の地形ワーカーのタイル取得に待ち時間が無く、応答の止まった取得が実行中のワーカーを占有し続ける(プールは実行中を terminate しない)。全本が当たると地形は再読込まで更新されない | AbortController+12 秒(script.js:5421 と同じ)。_smTerrainRunOnWorker にタスクの見張り |
| F-27 | low | index.html:21 | connect-src/img-src の s3.amazonaws.com(パス形式=任意バケット)と script.google.com(任意の Apps Script)がホスト丸ごとで、使う先(terrarium 1 バケット・GAS 1 配備)より広い。XSS 成立後の持ち出し先を絞る壁として効かない。文書側で s3 を fetch する箇所は無い(Image のみ) | img-src を `https://s3.amazonaws.com/elevation-tiles-prod/` に、connect-src から s3 を外す。script.google.com を `/macros/s/<配備ID>/` まで。verify184 S3 の期待配列と U6 の反証を合わせる |
| F-28 | low | vendor/MANIFEST.json:2(package.json) | 層3 が頼る Dependabot は vendor/ の版を見ない(package.json に無い・.github/ 無し)。verify184 S2 は台帳⇔実体の一致だけで上流との照合は無い。今は 8 ファイルとも jsDelivr と一致・OSV の該当は受け入れ済みの CVE-2026-85061 だけだが、次の advisory が出ても何も鳴らない | tools/vendor/audit.js(jsDelivr の hash 照合+OSV querybatch。受け入れ済み ID 以外で exit 1)。層3 の月 1 回とライブラリ更新時の手順に加える。package.json の devDependencies に同じ版を宣言だけ置けば Dependabot alerts も届く |
| F-29 | low | privacy.html:72 | 「写真から読み取った位置情報は外部へ送信・端末に保存しない」が実装と一致しない: Exif の緯度経度は getElevation(地理院タイル→Open-Meteo に緯度経度そのもの)へ送られ、My点/観測点として localStorage に保存され Drive/シート/CSV にも乗る(写真そのものについては正しい) | 段落を実装どおりに書き換える(写真は送信・保存しない。読み取った緯度経度は地図で指定した地点と同じ扱い)。改定日更新。verify184 S11 に文言の検査 |
| F-30 | low | script.js:4369(privacy.html) | privacy.html に端末の位置情報(Geolocation API=GPS ボタン)の利用の記載が無い(ヘルプにはある)。取得は利用者の操作+ブラウザの許可の後で、送信先・保存先は §1/§4 の範囲内 | §1 または §4 に 1 文(GPS ボタンを押した時だけ現在地を取得し観測点として扱う。端末内に保存・標高取得のため §4 のサービスへ送信・当プロジェクトへは送信しない)。改定日更新 |

### 各件の詳細

#### F-01 sw.js:152 — 控えの中身を検査せずに本体を出す(統合: service-worker 1 件。関連の反証 3 件は §4)
- 引用: sw.js:151-152 `const fresh = req.cache === 'reload' || …; if (!fresh) { const hit = await matchShell(c, key); if (hit) return marked(hit); }`。sw-precache.js は path の一覧だけ(sha を含む行 0 件)。install(sw.js:50-51)は「全件そろったか」しか見ない。
- 経路: Cache Storage はオリジン単位。同一オリジンのどのスクリプトからも `caches.open('sora-shell-v1.99.2').put('<自サイト>/script.js', new Response(偽コード, {headers:{'content-type':'text/javascript'}}))` が書ける。次に /soranotsuji-dev/ を開くと index.html はネット(sw.js:125)だが `<script src="script.js">` は控えから返り、index.html:21 の script-src 'self' を満たして実行される。sw.js 本体と importScripts の 2 本は updateViaCache:'none' でブラウザが fetch ハンドラの外で取るので、毎時の update()(script.js:1132)も _swServedVersion(no-cache・1108)も異常を検知しない。script.js・sora-constants.js・three-global.js(と import する vendor/three.module.min.js)・ワーカー 7 本と各 importScripts・forecast-features.html(353 で fetch→DOMParser→DOM へ)が全て控え優先。
- 影響: APP_VERSION が上がって activate(sw.js:63)が古い名前を捨てるまで、または利用者が「本体の控えを削除」(script.js:2836)か reset.html を押すまで持続。開発サイトでは同アカウントの他プロジェクトの JS(またはそこへの XSS)1 つで宙の辻-dev の全利用者(=依頼者と検証者)に持続的な任意コード(googleToken・localStorage・IndexedDB の全てに届く)。本番は専用オリジンなので前提は「宙の辻自身で一度 JS を走らせられること」。
- 票決が low に落とした理由: 前提は §7b で受け入れ済みの「開発オリジンの共有」そのもので、同一オリジンの攻撃者は SW が無くても window.open/iframe で本体を直接操作できる。本件が足すのは「一回限りの実行が次の版まで持続する」差分だけ。ただし §8 は「控えは配信物の写し」と前提しているのにコードが担保していない(文書と実装の差)ので、確認済みとして記録する。
- 直し: ① tools/sw/build-precache.js で一覧を {path, sha256} にし、sw.js は控えから .js/.html/.css/.wasm/.json を返す前に `crypto.subtle.digest('SHA-256', await hit.clone().arrayBuffer())` を照合(不一致なら c.delete(key) してネットへ)。直接 put された物を止められるのは配信時の照合だけ。script.js 1.5MB でも数 ms。一覧に無い鍵の .js/.html/.wasm は配信しない。② index.html の `<script src>`/`<link rel=stylesheet>` に SRI(現在 0 件。ワーカーの importScripts と three-global.js の import には効かないので①の代替にはならない)。③ 受け入れるなら §7b に「Cache Storage 経由の本体差し替え(dev 限定)」を明記。
- 自動検査: verify187 に「改ざんした控え(script.js を put)を出さない」実機検査 1 件。

#### F-02 sw.js:132 — navigate の控えが種類を絞らない
- 引用: sw.js:128-132 `if (res.ok) { … if (v === VER) putRuntime(c, key, res.clone()); }`。handleAsset(155)の `RUNTIME_OK.test(url.pathname)` のような絞りが無い。putRuntime(95-104)は `if (cur + len > ST.SHELL_MAX_BYTES) return;` の上限だけで追い出し無し。
- 経路: 他オリジンのページから top-level の navigate(リンク・window.open・連続リダイレクト)で milkyway-skymap_4k.webp(7.9MB)・ogp.png・data/kashimap/…/outline.json(7.5MB)を順に開かせると、SW 登録済みの端末では各 navigate が 121→132 を通り控えに入る。反証票の補足: Chrome/Firefox はサードパーティ iframe のストレージを分割するので iframe 経由は効かず、top-level の誘導に限られる。
- 影響: 今日の配信ツリーは約 28MB で 64MB に届かず、実害は「不要な控えが版更新か手動削除まで残る」。配信物が 64MB を超えた後は第三者が上限まで埋めて以後の実行時の控え(天の川 4K・印刷用)を黙って止められる。
- 直し: `const ct = res.headers.get('content-type') || ''; if (v === VER && /text\/html/i.test(ct)) putRuntime(…)`(または keyOf の結果が index.html の時だけ)。putRuntime で上限到達時は date ヘッダの古い順に一覧外の鍵を消してから入れる。
- 自動検査: verify187 に「navigate で webp を開いても控えに入らない」。

#### F-03 script.js:3238 — My観測点/My目的点の緯度経度に範囲検査が無い(統合: file-import 1 件+type-confusion 1 件)
- 引用: 3235-3238 fixMyPoints は emptyOrFin(有限か)だけ。観測点用 fixPoint(3217)の `Math.abs(lat) > 90 || Math.abs(lng) > 360` が My点には無い。入口も同じ: parseInput 5035 `if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };`、importMyPointsCsv 7029・appendMyPointsCsv 7076・_mySetParsePoints 15280 は isNaN のみ。
- 経路: 行の座標欄に「999, 135」→Enter→「全て登録」、または CSV の 1 行、または他人の共有シートの 1 行で Myセット切替。保存(cfg.setList→saveAppState 7041-7042)の後に glUpdateMyPointMarkers(1689)→_glAddMarker(1598 `new maplibregl.Marker(...).setLngLat([lng, lat])`)で vendor/maplibre-gl.js の LngLat が `Invalid LngLat latitude value: must be between -90 and 90` を投げる(文言を実体で確認)。
- 影響: forEach の途中で投げるのでその行以降の My マーカーが描かれない。try/catch の無い呼び元が途中で止まる: switchMySetDisplay は `appState.mySetCurrentId = id`(15958)の後 applyMySetData(15123)で投げ、renderMySetList/saveAppState(15960-15961)に届かない(メモリ上だけ切替済み)。registerMyPoints(6925)は「登録しました」が出ない。importMyPointsCsv は「CSVの読み込みに失敗」と出るが一覧は差し替え+保存済み。起動のたび 811 の setTimeout でも投げる。再読込しても fixMyPoints が残すので持続。行削除(6961)で復旧できデータ消失は無い。
- 票決: low×2・medium×1。漏洩・任意実行・データ消失が無く行削除で復旧できる点で low。ただし他人の共有シートから入り端末に残る唯一の指摘なので最優先に置く。
- 直し: (1) fixMyPoints で lat/lng が入っている行は `Math.abs(lat) <= 90 && Math.abs(lng) <= 180` を必須にし、外れた行は dropped へ(1 箇所で CSV/バックアップ/Drive/シートの全入口に効く)。(2) 各入口(7029/7076/15280・parseInput の My点用途)でも「無効です」で止めて理由を伝える。(3) glUpdateMyPointMarkers(1692)で範囲外の行を continue。
- 自動検査: verify184 U4 に lat:999 の行が捨てられる 1 件。

#### F-04 script.js:3095 — meteo が型そろえの対象外(統合: url-params 1 件+storage-trust 1 件+file-import 1 件+type-confusion 1 件)
- 引用: 3095 `if(saved.meteo) appState.meteo = saved.meteo;`、6527-6529 `appState.meteo.p = data.settings.meteo.p`(旧形式)、17071 は parseFloat+isNaN(Infinity が通る)。APP_DEFAULTS(380-600)・_sanitizeStoredShapes(3208-3287)・normalizeAppState のどこにも meteo は無い(grep 0)。UI(registerSettings 9088)も isNaN だけなので t=−273.15 は UI からも通る。
- 経路/影響: sora-constants.js:87-90 `temperatureC + 273.15` … `pressureHpa / (tKelvin*tKelvin)` は文字列で NaN("15" でも "15273.15" の連結で誤値)、p=Infinity で ±Infinity、t=−273.15 で Infinity、l≈0.0342 で NaN。refractionKInUse(4949)→inv2ReffFor(sora-constants.js:105-108)→標高グラフ(4608)・辻検索(4803)・辻メッシュ(12940)・_visInv2Reff(14124)・宙の窓(22715)の可視判定が `elev > NaN` で常に false=「遮蔽なし」側へ静かに倒れる(例外は出ない)。buildStateToSave(2936)が meteo をそのまま書くので再読込でも直らず Drive 経由で他端末へも伝播。兆候は係数欄(9060)の「NaN」だけ。設定メニューで気象値を登録し直せば直る(9091)。URL 経路は凍結され端末に残らない。meteo が文字列の時は 17071/6527 の `appState.meteo[mk] = v` がプリミティブへの代入で黙って無視される('use strict' 無し)。
- 直し: `const m = appState.meteo && typeof appState.meteo === 'object' ? appState.meteo : {}; appState.meteo = { p: numOr(m.p, STD_P, 300, 1100), t: numOr(m.t, STD_T, -90, 60), l: numOr(m.l, STD_L, -0.05, 0.05) };` を _sanitizeStoredShapes に。refractionKInUse の戻りを `Number.isFinite(k) ? k : calculateKFromMeteo(STD_P, STD_T, STD_L)` で保険。17071 と 9088 を Number.isFinite に。
- 自動検査: verify184 U4 に meteo:'abc' と {p:'x'} と p:Infinity の 3 件。

#### F-05 script.js:3093 — soraFolderName の型(統合: storage-trust・google-oauth・type-confusion の 3 件)
- 引用: 3093 `if(saved.soraFolderName) appState.soraFolderName = saved.soraFolderName;`、14637 `(appState.soraFolderName || '/soranotsuji-宙の辻').replace(/^\//, '')`。ensureSoraFolders(14657)は `soraRootFolderRealName()` を引数として先に評価するので、フォルダ ID が既に控えにあっても失敗する。
- 影響: saveAppToDrive・mySetCreateSheet・copyMySet・_autoSyncFlush が全て catch へ(「保存に失敗しました: ….replace is not a function」)。値は localStorage に残る。Drive 保存ができないので別端末へは広がらない(他方、Drive の app.json に既に入っていれば読込で来る)。入力欄(15021)に '[object Object]' が出る。registerSoraFolderName(15038-15046)で入れ直せば復旧。文字列なら長さ・文字種は無制限で Drive のフォルダ名(JSON ボディ=注入不可)と confirm/alert に入る。innerHTML には届かない。
- 直し: `const fn = appState.soraFolderName; appState.soraFolderName = (typeof fn === 'string' && /^\/[^\/\u0000-\u001f]{1,100}$/.test(fn)) ? fn : '/soranotsuji-宙の辻';`。

#### F-06 script.js:3090 — mySetCurrentId の型・存在(統合: storage-trust・type-confusion の 2 件)
- 引用: 3090 は saved の値をそのまま。照合は全て `s.id === appState.mySetCurrentId`(15395/15404/15421/15459/15922/15953)。
- 影響: "1"(文字列)や 999 だと表示中のセットが「非表示」扱い。mySetDataOf が `s.data || {}` を返すため、未同期(lastSyncSheetTime 無し)またはオフライン指定のセットの保存で 15421 の守りを通り抜け、シートを空で上書きし得る。切替表示(15950-15955)では curSet が見つからず `else appState.mySetHomeData = snap;` が走り、既定のセットの退避内容を現在の内容で潰す。到達は細工したバックアップ/Drive ファイルだけ(UI は 15958 で数値を入れる)。
- 直し: `const cur = intId(appState.mySetCurrentId); appState.mySetCurrentId = (cur !== null && appState.mySets.some(s => s.id === cur)) ? cur : 0;`。

#### F-07 script.js:3092 — mySetHome の文字欄
- 引用: 3092 `{ ...appState.mySetHome, ...saved.mySetHome, id: 0, name: '既定のセット' }`。_sanitizeStoredShapes(3272-3278)が見るのは mySets[] だけ。
- 影響: sheetId '../x?y'・saveMode 1・checked 'yes' が ID:0 で残る(mySets[] なら null/'save'/false に戻る)。到達先は driveGetMeta 14602・sheetsApiFetch 15214-15360・copy 16028 の encodeURIComponent、openMySetSheet 15610 の正規表現、memo の escapeHtml(15775)で守られているので実害は 404→😢 止まり。設計の記述(§4.4)と実装の差。
- 直し: mySets の直後に同じ規則を h = appState.mySetHome へ。verify184 U7 系に ID:0 のケース。

#### F-08 script.js:392 — locMode の列挙
- 引用: `locMode: { def: 'start' }`(enum 無し)。3106 `if(saved.locMode) appState.locMode = saved.locMode;`。4392/4409 `!== 'end'` と 5006/12257 `=== 'start'`。
- 影響: 'foo' が入ると位置情報メニューのラジオは観測点だが地図操作の一部が目的点に効く。ラジオを押し直せば直る(2267)。
- 直し: `locMode: { def: 'start', enum: ['start', 'end'] }`。

#### F-09 script.js:3235 — My* 行の ID 重複
- 引用: fixMyPoints(3233-3239)・myStars(3243-3248)・myTsujiSearches(3254-3269)は intId で整数化するだけ。CSV(7030/7083)とシート(15278)は重複を拒むがバックアップ/Drive/mySets[].data/mySetHomeData は通る。
- 影響: deleteMyPointRow 6961 `cfg.setList(cfg.list().filter(p => p.id !== id))` が同 ID の全行を消し、recalcMyTsujiOffsetDist(7214-7215)と getNextMyPointId(6594)は先頭行だけを見る。
- 直し: 各 map の後に seen Set で 2 つ目以降を dropped へ(1 行目を残す)。

#### F-10 script.js:3233 — 行数の上限
- 引用: 各リストの `map(...).filter(Boolean)` に slice 無し。書き戻し口は合計 4M 文字(STORE_WRITE_MAX_CHARS)だけ。
- 影響: `{"id":1,"lat":35,"lng":139}` 25 文字で約 15 万行。起動時 804-805 の renderMyPointsList が 6649 の forEach で全行の innerHTML を組み、updateMyPointMarkers も全行のマーカーを作る。再読込しても同じ(reset.html で復旧)。
- 直し: 各リストに .slice(0, 1000)。MY_LIST_MAX_ROWS を 6932/7285 と共用。落とした件数を dropped と同じ console.warn に。

#### F-11 script.js:22082 — My宙検索の長さ
- 引用: 22082 `const name = csvUnprefix(cols[1].trim());`、22113 memo も同じ。3284 は id/obsId/tgtId だけ。3369-3370 は typeof のみ。他 4 種は 7506/15271/15277/15295 で .slice(0,150)。
- 影響: CSV 経路は 8MB の中で 1 行に数 MB の name→appState→saveAppState が QuotaExceeded(alert 1 回・旧値は残る・再読込で戻る)。シート経路は 15403 の 4M で止まる。描画は escapeHtml(21895/21925)。FEATURE_FORECAST_ENABLED(322)で封鎖中。
- 直し: 22082/22113 に .slice(0,150)。3284 を `{ ...t, id, obsId, tgtId, name: str(t.name,300), memo: str(t.memo,1000) }`。封鎖解除前に。

#### F-12 script.js:3352 — ssPreset の `in`(統合: url-params・storage-trust の 2 件)
- 引用: 3352 `if (!(appState.ssPreset in SS_PRESETS) && appState.ssPreset !== 'custom')`、3360 `!(t.preset in SS_PRESETS)`、20910 `sel.value in SS_PRESETS`。SS_PRESETS(20441)は素のオブジェクト。
- 影響: 'constructor'/'__proto__'/'toString' が通る。ssEffectivePreset(20825)の label が undefined、21771/22054-22058 の `SS_PRESETS[t.preset] || SS_PRESETS.milkyway` は Object/Object.prototype が真なので既定に落ちず重み undefined→スコア NaN・hours undefined→時間帯全 false で結果 0 件。全て読み取りでプロトタイプへの書き込みは無い(汚染不成立)。?forecast=1 で My宙検索の行を保存すると(21795 `preset: appState.ssPreset`)その行に残る。SORA_SENSOR_ALIASES(3346)は直後の SORA_SENSORS.some で既定に戻るので無害。
- 直し: Object.hasOwn(SS_PRESETS, key)(無ければ Object.prototype.hasOwnProperty.call)。3346 も同じ書き方。

#### F-13 script.js:3088 — loadAppState の順序(統合: storage-trust・file-import・type-confusion の 3 件)
- 引用: 3087-3088 `if(saved.myTsujiSearches) appState.myTsujiSearches = saved.myTsujiSearches;` の直後に `appState.myTsujiSearches.forEach(t => { if (t.mwOffsetAngle === undefined) … })`。3161/3172 `saved.bodies.forEach(sb => …)` も同形。3191-3192 の flipRows は `(rows||[]).forEach`。try/catch は 3078-3202 を丸ごと 1 つ(3195)。
- 影響: myTsujiSearches が {} や文字列、要素に null が混じると TypeError で catch へ。3089 以降(mySets・mySetCurrentId・mySetHomeData・mySetHome・soraFolderName・googleDrive・meteo・気差・辻/辻メッシュ/宙の窓/宙検索/花火/都市モードの全キー・bodies の色・_loadedSchema)は既定のまま。normalizeAppState は型を直すだけで「読めなかった分」は戻せず、次の任意の saveAppState で既定値が localStorage に確定し、取り込んだバックアップの Myセット(オフライン保持の内容・シート ID)と Drive の同期簿記が消える。_sanitizeStoredShapes(3250)は配列でなければ [] に直せるが、この forEach が先に走る。入口はバックアップ JSON(6493/14683 は JSON.parse 可否だけ)と Drive の app.json。反証票の補足: 消えるのは「取り込んだ blob 自身の中身」で、Drive 側はファイルの版から復旧可能。
- 直し: `(Array.isArray(appState.myTsujiSearches) ? appState.myTsujiSearches : []).forEach(t => { if (t && typeof t === 'object' && t.mwOffsetAngle === undefined) … })`。bodies は `Array.isArray(saved.bodies) && saved.bodies.forEach(sb => { if (!sb || typeof sb !== 'object') return; … })`。flipRows は Array.isArray(rows) ? rows : []。根本策: 各ブロックを個別の try にするか mwOffsetAngle の補完を normalize の後へ。_writeSoranotsujiKeys(14685)で `const o = JSON.parse(obj[k]); if (!o || typeof o !== 'object' || Array.isArray(o)) throw` の形の門を 1 つ足すと null/数値/配列の生ダンプを再読込前に止められる。
- 自動検査: verify184 に「myTsujiSearches:'x' を含む保存データで loadAppState しても mySets が残る」。

#### F-14 script.js:6513-6515 — 旧形式バックアップの順序(統合: file-import・type-confusion の 2 件)
- 引用: 6501-6520 で homeStart/homeEnd・bodies・myStars・My点・My辻・My宙・meteo を順に appState へ直接代入、6515 syncMyStarsToBodies()、normalizeAppState/saveAppState は 6532-6533。catch(6562)は alert だけ。
- 影響: `{"myStars":[null]}` で 6058 `String(star.id)` が TypeError→myStars=[null] と isCustom を落とした bodies(6055)がメモリに残る。続く任意の UI 操作の saveAppState で [null] が端末に書かれ、renderMyStarsList(6109-6122 `star.ra.toFixed`)が再読込まで例外。再読込で _sanitizeStoredShapes が null 行を捨てて自己回復。XSS にはならない(表示は safeCssColor/escapeHtml/Number)。
- 直し: 6515 を 6533 の normalizeAppState の直後へ(applyMySetData 15109-15110 はその順)。または写しに代入→型そろえ→一括反映。簡便策は catch で取り込み前のスナップショットに戻す。

#### F-15 script.js:7021 — CSV 取り込みの長さ(統合: file-import 1 件+dos-resources 1 件。脅威モデル⑤-3 の確認を含む)
- 引用: 7021/7026(importMyPointsCsv)・7068/7074(append)は `csvUnprefix(cols[1].trim())`・`csvUnprefix((cols[6] ?? '').trim())` のまま、7041-7042 `cfg.setList(newPoints); saveAppState();` で normalize を通さない。My天体 6269/6306・My宙 22082 も同じ。画面の入力欄は maxlength=150(6660)。
- 脅威モデル⑤-3「以後の保存が全て失敗(永続停止)」は不成立: localStorage.setItem は原子的で旧値が残り、saveAppState(3059-3070)は QuotaExceeded を catch して 1 回 alert(_warned 3064)。再読込で _sanitizeStoredShapes の str(300)/str(1000) が効く。残る問題: (a) 保存失敗後も「n件を登録しました」が出て画面上は取り込めたように見え、再読込で消える。以後そのセッションの保存は無音で失敗し「:自動更新」も発火しない(3060 に届かない)。(b) 保存に成功した場合は次の再読込で 300/1000 に黙って切られ、Drive の生ダンプとの指紋も食い違う。PICK_FILE_MAX_BYTES の注記(6223)「端末の保存枠に収まる範囲」は UTF-16 換算(2.5〜5M 文字)より大きい。
- 直し: 入口 7 箇所に .slice(0,150)(画面の maxlength・My辻 7498 と揃う)。各 import/append の saveAppState の前に normalizeAppState()(importMySoraCsv 22130 は既にそう)。saveAppState が boolean を返し、false なら「保存できませんでした(件数/文字数を減らしてください)」。保険として JSON.stringify(stateToSave).length > STORE_WRITE_MAX_CHARS なら保存せず明示の alert。注記 6223 を UTF-16 換算に。

#### F-16 script.js:12021 — 可視マップ資産の山名の型(統合: input-validation 2 件)
- 引用: _kmStoreSave 12021 `name: mt.name || id`。_kmImportText(12047-12064)は meta.mountain.id の truthy と島の no/px(12057-12058)だけ。_kmLoadDeviceIndex は try(11885-11903)の外 11906 で _kmRenderStoreList を呼び、11946 `a.name.localeCompare(b.name,'ja')` が非文字列で TypeError。13073-13076 の入口は pickTextFile を通らず `await f.text()` で 8MB の上限も無い。
- 影響: 資産 2 件以上で sort の比較関数が呼ばれ _kmLoadDeviceIndex が毎回 reject。取込(12024)・削除(12011)・起動時(13113 は catch で黙る)のどれでも一覧が更新されず、最初の runKashimapSearch(12745-12757)で「山データの取得に失敗しました」。削除は一覧の行チェックが前提なので UI から消せず、reset.html の全消去か DevTools でしか回復できない。FEATURE_KASHIMAP_ENABLED(329-331)で ?kashimap=1 のみ。公開時は medium 相当。
- 直し: _kmImportText で `typeof meta.mountain.name === 'string'`(無ければ id)・`Number.isFinite(+meta.range_km)`・zoom/x0/y0 の数値確定・島の names は文字列配列。12021 を `name: typeof mt.name === 'string' && mt.name ? mt.name.slice(0,150) : id`。11946 を String() で守り、11906 を try/catch。13073 に `if (f.size > PICK_FILE_MAX_BYTES) { msgs.push(…); continue; }`。
- 自動検査: verify184 U4b に「name が数値の資産ファイル」1 件。

#### F-17 script.js:16880 — URL の date/time(統合: dos-invalid-input・NaN-propagation の 2 件)
- 引用: date は `s.length === 8`、time は `s.length >= 4` だけで parseInt の結果を setFullYear/setHours に直渡し(同じ関数の startLat 等は `!isNaN(v)` 付き)。
- 経路/影響: `?mode=full&date=abcd0101` で currentDate が Invalid Date、_restoredFromUrl=true で onload(817-826)は setNow() を飛ばし、syncUIFromState(3500)が "NaN-aN-aN" を date-input に書く。updateAll→updateCalculation の 3664 `Astronomy.Equator(body.id, obsDate, observer, true, true)` が "Argument must be a Date object…" を投げる(vendor/astronomy.browser.min.js を node で確認)。try/catch は 3652 の Observer だけ。async onload が reject し、resize リスナ(828)・訪問者カウンタ(838)・mode=tsujisearch/tsujimesh/panel の自動実行(841-874)が走らない。以後の updateAll も同じ例外。currentDate は保存しない(3041)のでそのタブだけ。
- 直し: `/^\d{8}$/`・`/^\d{4}(\d{2})?$/` を通った時だけ適用し、16893 付近で `if (isNaN(appState.currentDate.getTime())) { appState.currentDate = new Date(); delete appState._restoredFromUrl; }`。

#### F-18 script.js:16866 — 標高/高さの範囲
- 引用: 16865-16870 は parseFloat+isNaN のみ。_sanitizeStoredShapes 3218(fixPoint は lat/lng だけ範囲)・3228-3229(fin のみ)。normalizeAppState に Height/ApiElev/elev の丸めは無い(本文を走査して言及ゼロ)。
- 影響: 17096 `start.elev = startApiElev + startHeight` = 1e308。3652 `new Astronomy.Observer(lat, lng, 1e308)` は通るが 3664 の Equator が "Value is not a finite number: Infinity"(node で 1e308 と 1e300 の両方を確認)。F-17 と同じ onload 停止。window.onerror 等の全域ハンドラは無い(grep 0)。凍結で端末には残らない。
- 直し: _sanitizeStoredShapes(3218-3229)で elev/apiElev/height/startHeight/endHeight/startApiElev/endApiElev を [−500, 100000] m に丸める(APP_DEFAULTS の fwElev/fwHeight 439-440 と同じ流儀)。または updateCalculation の try を Equator/Horizon まで広げる。

#### F-19 script.js:17051 — fwLat の範囲
- 引用: 3349 は isFinite のみ。glFwUpdateMapMarker(2069-2079)は fwEnabled が真なら `_glAddMarker('fw', p0.lat, p0.lng, …)`→setLngLat([lng, lat])。
- 影響: `?mode=full&fwEnabled=true&fwLat=1000&fwLng=139` で起動時の updateAll(826)が "Invalid LngLat latitude value" で止まる。反証票の訂正: 2074 で `_fwMapKey = key` を throw より先に代入するので 2 回目以降は 2073 で早期 return し、例外は起動時の 1 回(と 1556 の try/catch 内の再試行)だけ。updateAll 内では fwUpdateMapMarker が末尾なので計算・表示は済んでいる。凍結で残らない。
- 直し: 3349 で `Math.abs(fwLat) > 90 || Math.abs(fwLng) > 180` も null に(fixPoint と同じ)。2078 の isFinite にも範囲。

#### F-20 script.js:16428 — LZW 展開爆弾(統合: dos-decompression 1 件+dos-resource 1 件)
- 引用: 16409-16431 `else if (code === nextCode) entry = w + w[0]; … res += entry; dict.push(w + entry[0]); nextCode++; w = entry;`。res・dict・ループ回数の上限無し。readBits は pos+width>total でしか止まらない。呼び元 restoreFromUrl(16851)は `params.get('query')` をそのまま渡す。
- 実測(抜き出した decodeQueryParam を node で): v1 形式 1,755 文字→501,501 文字、7,746→8,006,001、16,471→32,012,001(0.4 s)、35,165→128,024,001(1.1 s)。約 75KB で V8 の文字列上限(約 5.4 億)に当たり RangeError→catch→null→alert で復帰するが、そこまでに辞書の平坦化+res+Uint8Array(16433)+TextDecoder(16435)で数百 MB〜1.5GB を確保しようとする。
- 影響: 開いた端末のタブが固まる/落ちる。復号前なので何も保存されない。合法な短縮 URL の展開後は数 KB。
- 直し: 入口で `s.length > 16384 → null`。ループ内で `if (res.length > 65536 || dict.length > 65536) return null;`。
- 自動検査: verify184 に「展開爆弾を null で返す」1 件(bomb(16000) の生成器は scratchpad の qp.js の方式)。

#### F-21 script.js:16905 — starId の件数
- 引用: 16905-16944 の URL 復元は件数上限無し。`let id = parseInt(sid); if (isNaN(id) || appState.myStars.some(s => s.id === id)) { id = getNextMyStarId(); }` なので相異なる starId は 1,000 の上限(6070)を通らない。_sanitizeStoredShapes.intId(3210)は 1〜1,000,000 を受け、件数を切り詰めない。手動追加の 1000 件ガード(6320)は addMyStar 側だけ。
- 影響: 1 天体約 45 文字なので 2MB の URL で約 4 万件の visible=true。16928 find・16935 some・isFixedStar(246-248)の some が O(n) で updateCalculation(3660)が全 body に呼ぶため updateAll が O(n²)。アニメ中は毎秒。凍結で残らない。
- 直し: `params.getAll('starId').slice(0, 1000)` と push 前の `appState.myStars.length >= 1000` で打ち切り。isFixedStar を Set にすると更に軽い。

#### F-22 script.js:853 — 共有 URL の自動実行の量
- 引用: 841-854/858-862 は 500ms 後に startTsujiSearch()/toggleTsujiMesh() を confirm 無しで。日数は 36,500 まで(3342-3343)。tsujiSearchToleranceAz/Alt・tsujiMeshOffsetAlt は APP_DEFAULTS が `{ def: 15 }`/`{ def: 0 }`(498-503・532-533)で汎用パス(3331 `if (d.min !== undefined)`)の範囲丸めを通らない(UI の 2288/2449-2452 は手動変更時だけ丸める)。tolerance=360 だと安全スキップ(tsuji-search-worker.js:159-163)が効かず毎日 1,440 標本の全評価。
- 影響: 200 天体×100 チャンク×525,600 回の Horizon() が全コアで走り、終了時に最大 730 万行の表(13772 で全行 appendChild)。辻メッシュは tsujiMeshOffsetAlt 無制限で線モードが全高度帯を覆い、1 日あたり MAX_PIX_PER_DAY=2,359,296×16B≈38MB の配列が events(11423)に 36,500 日分まで。開いた端末だけ・保存されない。
- 直し: ① URL 起点(_pendingTsujiSearch/_pendingTsujiMesh)は天体数×日数が閾値(天体 20・日数 3,650)を超えたら confirm() かパネルを開くだけ。② APP_DEFAULTS に tsuji*Tolerance* 0..180・*Offset* −360..360 の範囲(_sanitizeStoredShapes 3258-3259 と同じ)。③ F-21。④ 結果表のページ分け。

#### F-23 script.js:7938 — bodyIds の重複
- 引用: 7937-7938 は split(':') の結果をそのまま appState.bodies.find へ。parseMyTsujiCsvLine(7510)は toHalfWidth+空チェックのみ、_mySetParseTsuji(15313-15316)は ID の重複しか見ず、3256 は str(t.bodyIds, 1000) の長さ切りだけ。画面の maxlength=150(8657)は CSV/シート経由では効かない。進捗分母(8141・8474)も同様。
- 影響: 「Sun:」×250・期間 36500 の 1 行で 25,000 チャンク。発火は利用者の一括実行(confirm 8118)で中断可能。
- 直し: `[...new Set((t.bodyIds || '').split(':').map(s => s.trim()).filter(Boolean))]` を 7937 と 8141 に。parseMyTsujiCsvLine でも分割→重複排除→連結。

#### F-24 script.js:14536 — googleLogin の Promise
- 引用: 14536-14560 で `googleTokenClient` が null の時だけ initTokenClient し、callback/error_callback はその時の `new Promise` の resolve を閉じ込める。14563 は requestAccessToken() だけ。googleTokenClient への代入は 14537 の 1 箇所(grep)。googleLogout()(14589-14597)も失効監視(15062-15068)も null に戻さない。
- 影響: 2 回目以降のログイン(ログアウト→再ログイン、1 時間で切れた後の再取得)では Google の応答で呼ばれる callback が「解決済みの初回 Promise」の resolve を呼ぶので今回の Promise は永久に pending。googleToken 自体は 14542 で入りアイコン更新と checkGoogleSyncState は動くので見た目は正常。ensureGoogleToken()(14572-14576)経由の全 Drive/Sheets 呼び出し(saveAppToDrive/loadAppFromDrive/mySetSaveToSheet 15414/mySetLoadFromSheet 15481/切替表示 15933)が続かない。bulkUpdateMySets(15580-15600)は最初の await で止まり「更新中(0%)」のまま。もう一度押すと isGoogleLoggedIn() が true なので動く。
- 再現: ログイン→Drive 保存(成功)→ログアウト→Myセット行をチェックして「更新」→confirm OK→ポップアップで許可→アイコンは変わるが保存/読込は実行されず alert も出ない。
- 直し: resolve/reject をモジュール変数(`let _googleLoginPending = null`)に置き、googleLogin() のたびに差し替え、callback/error_callback はその変数を呼んで null に。または googleLogout() と error_callback で googleTokenClient=null にして毎回 initTokenClient。
- 自動検査: 実機 A 系に「ログアウト→再ログイン→Myセット保存が 1 回で完了」。

#### F-25 script.js:15359 — シート読込の列数・応答サイズ
- 引用: 15359・15235 の範囲 `'${n}'!1:${MYSET_SHEET_MAX_ROWS}`(全列)。sheetsApiFetch(15160-15167)は `if (!resp.ok) throw` の後に `return resp.json()`。4M 文字の検査は mySetSetData(15403)=解析後。
- 影響: 他人の共有シート(閲覧のみでも「:読込」可能と案内 15470)の 1,100 行×100 列×5 万文字で数 GB の JSON を丸ごと解析してタブが落ちる。到達は「:読込」(15489)・切替表示での取得(15937)・コメント行(15235)。永続しない。
- 直し: 範囲に列の上限(`'${n}'!A1:BZ${MYSET_SHEET_MAX_ROWS}`。My辻≧58 列・My宙 22・点 7・天体 5 が読めればよい)。sheetsApiFetch の GET は `const t = await resp.text(); if (t.length > STORE_WRITE_MAX_CHARS) throw new Error('シートの応答が大きすぎます'); return JSON.parse(t);`。

#### F-26 sora-terrain-worker.js:145 — タイル取得の待ち時間
- 引用: `const resp = await fetch(url);`(AbortController も setTimeout も無し。同ファイルの setTimeout は 119 の demTouch だけ)。本体側は script.js:1272-1276 MT_FETCH_TIMEOUT_MS・5421 の 12 秒・kashimap-worker.js:134 FETCH_TIMEOUT_MS+3 回。プール(script.js:22468-22500)は message 受信時にしか idle へ戻さず、_smTerrainPoolCancelQueued(22502)は queue の task.resolve だけで terminate は呼ばない(grep で terminate は tests/verify184.js の自前ワーカーだけ)。
- 影響: 応答の止まった取得(途中で止める中継・キャプティブポータル)に当たったワーカーがセッション中 busy。SORA_TERRAIN_POOL_SIZE 本すべてが当たると地形は再読込まで更新されない。_smFetchTerrain の Promise.all(22630-22637)もその世代で完了しない。_bgFetchBuf(22997)も素の fetch だが世代(23074)で捨てられる。
- 直し: `const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 12000); try { resp = await fetch(url, { signal: ctl.signal }); } finally { clearTimeout(t); }`。_smTerrainRunOnWorker に N 秒超なら terminate して作り直す見張り。

#### F-27 index.html:21 — connect-src/img-src の広さ
- 引用: img-src/connect-src とも `https://s3.amazonaws.com`、connect-src に `https://script.google.com`。使う先は script.js:5229 `url: "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"` と 196 の GAS 1 配備だけ。文書側で s3 を fetch する箇所は無い(5405 `_loadTileImage` の Image=img-src。fetch は sora-terrain-worker.js:145=meta CSP の外。script.js:5422 の fetch は DEM_TILE_URL_RE(5395: 地理院 dem*_png のみ)を通った物だけ)。
- 影響: XSS 成立後に `fetch('https://s3.amazonaws.com/<自分のバケット>/x?d=' + localStorage.soranotsuji_app)` や `new Image().src = …` が CSP で止まらない(バケットのアクセスログに残る)。任意の Apps Script も同様。CSP は転送後の照合でパスを無視するので script.google.com→script.googleusercontent.com の 302 はパスを書いても通る。一層目(型そろえ・escapeHtml・S4)が効いているので low。verify184 S3 は許可リストの一致だけ、U6 は example.invalid の反証だけ。
- 直し: img-src の s3 を `https://s3.amazonaws.com/elevation-tiles-prod/`。connect-src から s3 を外す(将来 fetch 化する時に同じ経路付きで戻す)。script.google.com を `https://script.google.com/macros/s/AKfycbz…/`(末尾 / で前方一致)。script.googleusercontent.com はホストのまま。S3 の期待配列を同時に直し、U6 に「s3.amazonaws.com/other-bucket/ と script.google.com/macros/s/other/ は止まる」の反証を 1 本。

#### F-28 vendor/MANIFEST.json — 上流との照合・advisory の監視
- 確認した事実: package.json の依存は devDependencies の @playwright/test だけ。vendor/ の 5 パッケージはどこにも宣言されず、.github/ も無い(dependabot.yml・CodeQL 無し)。tests/verify184.js:55-67 の S2 は `fs.readFileSync(vendor/…)` と `JSON.parse(rd('vendor/MANIFEST.json'))` の一致・出所 URL の形式・ライセンス・迷子ファイルだけで、台帳と実体を同じコミットで書き換えれば通る。34-security.md:78 は Dependabot を層3 の手段に挙げ、:79 の GitHub Watch は MapLibre/three/astronomy-engine の 3 つだけ(GeographicLib/qrcode は手動監視の対象外)。
- 今回手で照合した結果: 8 ファイルとも sha256 が data.jsdelivr.com の配布物一覧と一致(本物)。OSV の該当は maplibre-gl 4.7.1 の GHSA-jrc7-96c5-q579=CVE-2026-85061(§7b 受け入れ済み・6.4.1 で修正)だけ。他 4 パッケージは無し。
- 直し: tools/vendor/audit.js(MANIFEST の各 {package, version, source} について ① `https://data.jsdelivr.com/v1/packages/npm/<pkg>@<ver>?structure=flat` の hash と手元の sha256 を照合 ② `POST https://api.osv.dev/v1/querybatch` で受け入れ済み ID 以外が返れば exit 1)。ネットワーク遮断の回帰には入れず、層3 の「月 1 回」と「ライブラリを上げる時」に加える(34 層3 と vendor/README.md に 1 行)。package.json の devDependencies に vendor と同じ版を宣言だけ置けば Dependabot alerts も届く(node_modules は使わない)。

#### F-29 privacy.html:72 — 写真の位置情報の記述
- 引用: script.js:6895 `const elev = await getElevation(lat, lng);`(addMyPointFromPhoto)、4400 `await applyLocationCoords({ lat, lng }, isStart);`(写位)→applyLocationCoords の `const elev = await getElevation(coords.lat, coords.lng);`。getElevation(5453-5469)は地理院 DEM タイル(タイル座標)→無ければ `_getElevationFromOpenMeteo`(5442 `fetch(\`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}\`)`)。6898-6899 `cfg.list().push({ id, name: ..., lat, lng, elev, height: 0, memo: '' }); saveAppState();`。
- 影響: 「読み取った位置情報が外部へ送信されること、端末に保存されることはありません」は事実と異なる(写真そのものについては正しい。index.html:948/2152/2187/2553 のヘルプは主語が「写真は」なので正しい)。送信先は §4 で開示済みなので新たな漏洩経路ではなく、公開文の正確さ(同意の前提)の問題。
- 直し: §1 の段落を「写真そのものは端末内で読み取るだけで送信・保存しません。読み取った緯度経度は地図で指定した地点と同じ扱いになり、標高の取得のため 4. の国土地理院/Open-Meteo へ送信され、My観測点・My目的点(または観測点・目的点)として端末内に保存されます(ドライブ同期・Myセット・CSV に含まれます)」に。改定日を更新。verify184 S11 に「読み取った位置情報が…送信されることはありません」が無いことの検査。

#### F-30 script.js:4369 — GPS の記載
- 引用: index.html:898 `<button id="btn-gps" …>GPS</button>`、script.js:2233 `document.getElementById('btn-gps').onclick = useGPS;`、4369 `navigator.geolocation.getCurrentPosition(pos => {`→4370-4372 で start へ→4373 setView→4374 getElevation→4381 saveAppState。
- 影響: privacy.html の「位置情報」は 72 行目の写真の段落のみ(grep 'GPS|現在地|位置情報')。ヘルプ(index.html:2549)にはある。取得は利用者の操作+ブラウザの許可の後で、送信先(93-94)と保存先(70)は説明済み。網羅性の問題。
- 直し: §1 または §4 に 1 文。改定日を更新。

## 4. 反証された指摘

| 題 | 場所 | 反証の理由 |
|---|---|---|
| 開発オリジン共有: Cache Storage に他ページが植えた script.js を SW が無検査で配る(⑤-2 の確認) | sw.js:152 | コードの事実は指摘どおりだが、前提「takeyosui15.github.io に別の HTML が置かれる」は §7b:117 で受け入れ済み(運用: このオリジンに他の HTML を置かない)。植えられるのは同アカウントのリポジトリ=依頼者自身が公開した物だけ。同オリジンのページは Cache Storage を触るまでもなく window.open で本体を開きメモリの googleToken・localStorage・IndexedDB を直接読める。SW は「永続化」を足すだけで到達範囲を広げない。本番は専用オリジン。§7b の文面が控えの永続性に触れていない点は文書の補足に値する(F-01 として記録) |
| sw.js は Cache Storage の中身を無検査で配る(開発オリジンの他ページが植えた script.js/index.html がそのまま実行される)(申告 medium) | sw.js:152 | 3 票とも反証。機構は実在するが前提が §7b の受け入れ済みの穴そのもので、その攻撃者は iframe/window.open 経由で稼働中の window(googleToken 14505・Drive 操作関数・localStorage)に直接触れる。SW が足すのは「攻撃ページが閉じた後の持続」だけで、install の addAll(cache:'reload')と activate の削除で版の更新ごとに上書き・掃除される。承認済みオリジンなので公開の clientId で GIS のトークンも得られる=既に全面的な侵害。指紋検査は多層防御として low 相当(F-01) |
| 可視マップの端末資産の要約(IndexedDB assets)を型そろえせずに innerHTML へ入れている(range・islands) | script.js:11961 | 11961 `tr2.innerHTML = \`<td>範囲: ${r.range}km</td>…\`` と 11963 の `${(r.islands || 0).toLocaleString()}` は生だが、assets 店への書き込み経路はアプリ内の 3 本だけで全て数値を書く(_kmStoreSave 12017 `range = +meta.range_km`/12021 `islands: isl.islands.length`、_kmStoreRename は name だけ、ズーム補完 11901 は _kmNum)。毒を置けるのは同一オリジンでスクリプトを走らせる者だけ=既に DOM を直接操作できる。info(r.range/r.islands に +Number を掛けるだけで閉じる) |
| sora_store_clean_at を Number() だけで読むので 'Infinity' や 1e308 を植えられると自動の片付けが二度と起きない | script.js:1163 | 機構は申告どおりだが入口が「同一オリジンでスクリプトを動かせる者」だけで、CSP(script-src 'self'・object-src 'none'・base-uri 'self')と §7b の運用で塞がれている。その攻撃者は localStorage/IndexedDB を直接消せる。付記: 1092 の when(Infinity) は RangeError を外側の try が握りつぶしセルが更新されないだけ。堅牢性(時計を戻した端末)として `isFinite(last) && last <= Date.now()` の 1 行は価値があるが info |
| privacy.html / terms.html に CSP meta と Referrer-Policy meta が無い | privacy.html:18 | 事実は確認(privacy/terms:18-19 に無し、verify184 S3/S3b も index/reset だけ)。しかし再現の筋が成り立たない: caches.put() には同一オリジンで JS が走っている必要があり、その時点で全てを直接読み書きできる。「index.html なら CSP が止める」は誤り: CSP は meta として本文の中にあるので put() で差し替えられる攻撃者は CSP 無しの本文を植えられる。両ページには script も入力欄も無く(grep 0)、外部リンクは S5 が noopener を見張り、Referer は既定が strict-origin-when-cross-origin。書き分けの不統一のみ |
| vendor/ のスクリプト・CSS に integrity(SRI)が無く、MANIFEST.json の指紋は実行時に効いていない | index.html:55 | 事実は正しい(49-58 に integrity 無し・sw.js:152 は控え優先・install は存在確認だけ)。前提は §7b:117 の受け入れ済み。同一オリジンで動くコードは Cache API を書かずとも全権を持つので SRI を足してもその攻撃者は止まらない。設計書は指紋を実行時の守りとは謳っておらず §5 層1(:63)で「自動で見張る(verify184 S2)」=開発時検査と明記しているので「対策が実装どおり効いていない」には当たらない。§8:131 に「指紋は開発時検査」と注記する程度(info) |
| vendor/ の script/link に integrity が無く、SW が控え優先で出す vendor ファイルの指紋を誰も確かめない(開発オリジン限定の控え汚染→任意コード) | index.html:55 | 同上。同一オリジンの攻撃者は window.open()/iframe で開発版の window を直接スクリプトでき(frame-ancestors は meta で書けないと §7b 1 行目が記録、window.open は元々制限外)、メモリの googleToken も localStorage も読める。控え汚染は新しい権限を与えない。本番は専用オリジン |

反証から学んだこと: SW/SRI 系の 4 件は「同一オリジンで JS が走る」前提を共有し、それは §7b で受け入れ済み。ただし §7b の文面は OAuth オリジンと localStorage の混入までしか書いておらず、Cache Storage の「持続性」は書かれていない。F-01 の③(§7b への追記)で文書と実装を揃える。

## 5. 確認して問題なしの記録(189 件)

### dom-xss(22 件)
- 件数(grep): script.js の HTML 組立の代入 133 行(innerHTML 127・setHTML 5・insertAdjacentHTML 1)、reset.js innerHTML 2(37, 51)、index.html/sw.js/各 *-worker.js/three-global.js/muni.js/forecast-features.html は 0。document.write/outerHTML/srcdoc/createContextualFragment 0。引用符無しの属性補間(`[a-z-]=${`)0・単引用符の属性補間 0(14608/14727 は Drive の検索クエリ文字列で DOM ではない)・`href="${`/`src="${` 0。setAttribute は THREE の属性/viewBox/autocomplete のみ。
- reset.js:44-51 localStorage の全キー/値は escapeHTML(key)/escapeHTML(value)(3-15。& < > ' " を置換)を通して表に組む。HTML として解釈されない(⑤-1 は問題なし)。
- script.js:1360/1387/1407 地図コントロールの innerHTML は定数(names 表と SVG)。
- script.js:1606/1633 setHTML(opts.popupHtml) の呼び元は 1659/1671(createLocationPopup 5565: escapeHtml(title)+Number() のみ)・1695(escapeHtml(title/pt.name)+Number(id/lat/lng/elev/height))・12424(escapeHtml(縞島名)+数値 toFixed)・12677(escapeHtml(m.name/peak/yomi/pref)、m.lat/lon/elev は同一オリジンの静的 data/mountains.json か _kmSyncPseudo 12884 で +d.lat/_kmNum した数値、_kmListsLabel 12641 は KM_LIST_LABEL 表/静的データ)。1624 wrap.innerHTML=html の呼び元は 2079('🎆')と 12422(定数 div)のみ。
- script.js:1937 _glTmShowTip(html) の呼び元 1543(+f.properties.dist 数値)・2061/10803(_tmTooltipHtml 10555: title/action は定数、timeMs/dist は数値)・10796(件数=数値)・12207(escapeHtml(info.names))。10420/10436/10452 の setDOMContent 用 div も同じ。
- script.js:4085 住所検索(地理院 5169/Nominatim 5196 の応答)は escapeHtml(r.title)/escapeHtml(r.address)。_locNameSet は input.value。
- script.js:6114 My天体の行: Number(star.id)・safeCssColor(star.color)・escapeHtml(star.name)・star.ra/dec.toFixed(6)(3240-3245 で fin)。6428 天体名検索は同一オリジン静的 celestial_db.json(6377)のみが源で name/type/keys は escapeHtml、ra/dec/mag は静的データ。
- script.js:6652 My観測点/目的点の行: Number(pt.id/lat/lng/elev/height)・escapeHtml(pt.name/memo)。6910/7413/15879/15898/15968 の未入力エラー文は escapeHtml(id)。7453 renderMyTsujiRowError の messages は `観測点ID:${t.obsId}` のみで obsId/tgtId は parseInt(NaN→null)/intId なので整数か null。
- script.js:8220/11581/13757/10696 の結果表: 名前/ID/timeCategory/elevationStatus は escapeHtml、symbol/moonIcon/dateStr/dowStr/timeStr/日月出入は計算値、r.tsuji.id/r.obs.id/r.tgt.id は intId、11581 の r.centerMode は 11545 で 'line'/'point' に確定、10702 の r.ctrMode も同様、13757 は escapeHtml。tr.style.color=r.body.color は style プロパティ代入(CSS 注入にならない)。
- script.js:8641 My辻検索の行: name/bodyIds は escapeHtml、id は intId、days/offsetAz/toleranceAz/moonBase は numOr で数値、baseAz/baseAlt は fin→toFixed、startTime/startOffset/endTime/endOffset は 3255 で /^\d{1,2}:\d{2}$/、CSV 取り込みも hhmmOr/modeOr/dirOr で確定、buildMyTsujiTimeGroupHtml 5893-5921 の mode/ppDir は === 比較のみ。timeFilterModeGridHtml 5861 は TSUJI_TIME_MODES 定数。
- script.js:8960 表示天体の行: escapeHtml(body.name/id)+safeCssColor(body.color 3247)。loadAppState 3171-3179 は color/isDashed/visible しか写さない(name は既定表)。17644 天体儀の名称 SVG は esc()(& < " を置換)で二重引用符の属性に入れる。
- script.js:11958-11963 端末の資産一覧: name は escapeHtml(値も title も)、r.range は +meta.range_km、r.islands は length、r.size は Blob サイズ、kind は String().includes の真偽のみ、k は isFinite。(name の型だけが F-16。)
- script.js:12047-12064 _kmImportText: 島の no/px と輪郭の [no,px] を数値に確定(U4b)。12450 島リストは escapeHtml(no/names/yomi/px)+Number(dup)+(+lat).toFixed。12258 ポップアップは escapeHtml(p.name/p.no)。12449/12693/12706 の style="background:…" は _kmSeatColor 12650=COLOR_MAP 定数表。12695 山リスト: id/name/yomi/pref/kind は escapeHtml、_kmInfoCells は title/text とも escapeHtml(12699)・12034 は textContent/title プロパティ。
- script.js:14931/14933 同期ダイアログ: formatMySetDateTime 15146 は new Date(ts) の各欄を数値で組む(不正な ts でも NaN/undefined の文字しか出ない)。15713 mySetUpdatedHtml も同様。15526 mySetRowIcon は定数。15593 は数値。
- script.js:15706/15753/15795 Myセットの見出しと行: name/memo/iconTitle は escapeHtml(value と title)、id は Number()/intId、saveMode/offline は比較のみ。s.data/mySetHomeData(15374/15396/15405/15930)は applyMySetData→normalizeAppState(15079)を経ずに描画される経路が無い(flipRows 3191 は符号の読み替えだけ)(⑤-4 は問題なし)。
- script.js:16994-17060 URL の文字列キー: soraSensorKey(3347-3348 一覧照合)・soraOrient/soraFisheyeShape/soraMovPlayMode/soraExpFormat/fwMode/ssMoonMode/ssUnkaiMode/ssObj/mwConstNameSort/tsujiMeshCenterMode/tsujiMeshAccuracy は APP_DEFAULTS の enum で 3318 の汎用パスが既定に戻す。fwSize 3351(FW_SHELLS)・ssPreset 3353(SS_PRESETS)。tsuji*/tsujiMesh* の Mode/Time/Offset/PrePostDir は 3331-3337(validModes・reTime)。これらは buildTimeGroupHtmlFor 5866-5886 の value="…" と 742/767/18290-18342/20383/21264 の属性セレクタに入るが、全て列挙検査後の定数しか届かない(⑤-5 は F-12 以外問題なし)。
- script.js:17037 URL の My天体: U7(verify184 323-332)が見張る。bodyColor* は 17057 で /^#[0-9A-Fa-f]{6}$/。
- script.js:21024/21139 宙検索の結果表と内訳: ssRowValues 20985-21001 は数値/定数(SS_BAND_LABELS・r.conf は escapeHtml、r.env.unkai は計算値)、内訳は name/desc/coef/p.key を escapeHtml、気圧面の値は Math.round。style="color:…" は scoreColor/confColor 定数。21705 の凡例は SD_LEGEND_STEPS 定数。Open-Meteo の応答(20492-20650)は数値として集計してからしか DOM に入らない。
- script.js:21887 My宙検索の行: name/memo は escapeHtml、id/obsId/tgtId は intId(3277)、preset は 3357 で SS_PRESETS 照合(=== 比較のみ)、days/fan/range/interval は 3361-3364 で数値。parseMySoraCsvLine 22078-22114 も全欄確定。
- script.js:14402-14407 訪問者カウンタ(GAS の d.today 等)は innerText。14110 山頂部の reason は textContent。16701-16720 QR は canvas に isDark で描く。355 DOMParser の対象は同一オリジンの forecast-features.html(on*= 0)。
- script.js:1264-1290/5335-5338/21370-21379 タイルは img.src(画素のみ)。6248/18728 は blob: の download リンク、18945/18998 は createObjectURL、14518/15620/22887 の script.src は定数 URL。window.open は 15578 で ID 文字種検査(S5)。
- sw.js:77/79/100 の new Response は取得した本文の写しだけで HTML を組まない。各ワーカーに DOM 操作は無い。ワーカー→ページの e.data.error は Error に包んで alert/console に行き innerHTML には入らない(9866/9933/1191 は定数文)。
- script.js:2105-2134 data-click/data-arg はテンプレートで補間していない(grep 0)。index.html/forecast-features.html/reset.html にインラインの on*= と <script> ブロック無し(S4 と一致)。

### url-params(12 件)
- grep 件数: URLSearchParams(window.location.search) は 3 箇所(323 forecast / 330 kashimap / 16848 restoreFromUrl)、location.search の正規表現が 1(1106 ?sw=1)、location.hash 0、history.pushState/replaceState 0、window.addEventListener('message') 0。reset.js/sw.js は URL パラメータを読まない。
- script.js:16848-16854 短縮 URL は decodeQueryParam→URLSearchParams(decoded) に置き換えるだけで、展開後の query= を再帰展開しない。forecast/kashimap(323/330)は window.location.search を直接読むので短縮 URL 経由では封鎖を解けない。
- script.js:16350-16355 辞書版 ~N~ は 2〜23 以外 null、16358-16362 Base64URL 以外は null、16435 TextDecoder fatal:true、16437 v12 以降は先頭 & 必須。復号失敗は alert して既定状態で続行。
- prototype 汚染: restoreFromUrl が appState[key] に書くキーは全て定数(soraNum/soraBool/soraStr のリテラル、'tsujiMonth'+suf は _MONTH_DEFS 定数、'tsujiMesh'+G+… は定数、bodyColor/bodyDash+bd.id は appState.bodies 側の id)。params.forEach/entries/keys で URL のキー名をそのままオブジェクトのキーにする箇所は 0。_urlSessionFrozen のキーは buildStateToSave の固定キー。__proto__ をキーに書き込める経路は無い。
- script.js:16994-17060 URL の文字列キーは全て normalizeAppState で列挙/形式検査される(enum 13 種・special 3 種・時間フィルタ)。mode は比較にしか使わない。timeZone は parseTimezoneOffsetMinutes(16470)の正規表現で不一致は +0900。
- script.js:16924-16941 URL の My天体は name→str(300)+escapeHtml、color→safeCssColor(既定 #DDA0DD)、ra/dec→fin(Infinity は行ごと捨てる)。巨大な有限 ra/dec(1e308)は Astronomy.Horizon が角度を折り畳むだけで例外にならない(node で確認)。
- script.js:3218-3221 start/end の lat/lng は |lat|≦90・|lng|≦360 で範囲外は既定へ(Infinity も fin で捨てる)。
- 数値の範囲: APP_DEFAULTS の min/max 付きキー(399-492: soraAspectW/H・soraFocal・soraViewRange≦300・soraMovShots≦99999・soraMovImgMb・soraExpW/H≦8192・fwElev/fwHeight/fwRadius≦10000・ssDays≦16・ssFan・elevExcludeRadius≦10000 など)は 3312-3323 の汎用パスで丸める。tsujiSearchDays/tsujiMeshDays は 1〜36500。UI と同じ上限で URL だけが超えることは無い。
- script.js:13509-13600 mode=tsujisearch の自動実行: 結果は 1 日 1 件×MAX_RESULTS_PER_BODY 36500 で上限あり、許容範囲 Infinity でも件数は増えない。mode=tsujimesh の DEM 範囲 N は _tmSearchArea(UI のラジオ)で URL からは変えられない。elevation/milkyway/soramado の自動オープンは UI の同操作と同じ経路。
- script.js:17116-17124 URL で変わったキーは _urlSessionFrozen で保存しない。本監査で見た DoS/例外は全て端末・Drive に残らず、その URL を開いた画面だけで起きることを確認(currentDate は保存対象外=3041、myStars/meteo/startHeight/fwLat/ssPreset は凍結対象)。
- script.js:1106 ?sw=1 は http(ローカル検証)でのみ意味を持ち https では常時登録。354 loadForecastFeatures は同一オリジンの forecast-features.html を fetch→DOMParser で注入(外部入力は無い)。
- Google 署名/トークン: restoreFromUrl が読むキーに googleToken・Drive ID 系は無く、URL から googleDrive/mySets の ID を書く経路は無い(U3 が見張る)。

### messages(13 件)
- 入口の棚卸し: window.addEventListener('message')=0・BroadcastChannel=0・MessageChannel/MessagePort/.ports=0・'storage' イベント=0・window.opener/parent/top/frames/name・document.referrer・location.hash/hashchange=0・SharedWorker=0・onmessageerror=0。受け口は navigator.serviceWorker の listener 1(1252)・sw.js の message 1(105)・ワーカー onmessage 8・ページ側のワーカー受け口 8。
- sw.js:105-108 message: 送信元の検査は無いが SW に message を送れるのは同一オリジンのクライアントだけ。d.type の照合のみで状態を変えず、返事は { type, from, ver } の公開情報だけ。
- script.js:1252 ページ側の SW message: e.data.type === 'sora:served' なら _swMarkSet(1240-1247)が textContent/title に定数文字列を入れるだけ。
- script.js:1120-1127 controllerchange→location.reload(): _swReloaded で 1 回だけ・_swPageStale の時だけ。別スコープの SW の claim は最長一致に負ける。
- ワーカーの生成は 7 種とも同一オリジンの固定名(1182/4539/9925/13467/9957/12952/18415/22473)。blob:/createObjectURL からのワーカー生成は無い。importScripts は自オリジンのみ。
- ワーカー→ページの値の行き先: sora-store の d.store/d.done/d.total→textContent・kashimap の progress→textContent と style.width の数値・preview→canvas・error の m.message→Error→alert・_makeWorkerPool の e.data.error→reject→catch で空の結果・dp/mov/terrain は数値。innerHTML/setHTML へ直接届く受け口は無い。kashimap-worker は job.name を meta/islands/outline に写すだけ(510-512)。
- ワーカー内の fetch 先: sora-terrain-worker.js:145 の url はページが定数ホスト+整数のタイル座標で組む(22601-22609。_getTileInfo は Math.floor・GSI_DEM_SOURCES 5222-5229 は定数)。kashimap-worker.js:135 は SORA.DEM.GSI_TILE_BASE+定数の kind+整数。利用者/URL/シート/CSV 由来の文字列が URL に混ざる経路は無い(§7b の前提どおり)。
- sora-store-worker.js:116-124: p.type==='clean' 以外は無視。caps/now/unusedDays/high/low はページが SORA.STORE の定数と _storeCap() から組む。
- Google の枠(GIS/ピッカー)からの postMessage はライブラリが処理し、ページは callback の resp.access_token(14540-14551)と res[ACTION]/DOCUMENTS[0][ID](15660-15663)だけ読む。
- reset.js:69-70: caches は 'sora-shell-' 接頭辞だけ削除・serviceWorker は自分の範囲の登録だけ unregister。
- script.js:2122-2129 securitypolicyviolation: console.warn のみ・blockedURI は '?' 以降を落とす。
- 堅牢性の記録(攻撃の入口は無い): _dpRunOnWorker(4546-4558)・_smMovRunOnWorker(18419-18427)・_smTerrainRunOnWorker(22475-22485)は 'message' だけを待ち onerror が無いので、ワーカーが例外で落ちるとその task の Promise が解決されず idle に戻らない。到達には自サイトのコードが壊れた message を送る必要がある。
- (F-26 の補足)プールは実行中の terminate を持たない設計で、外部からは起こせない。

### service-worker(17 件)
- 件数(grep・配信物のみ): caches. = 10(sw.js 6・script.js 3・reset.js 1)/ serviceWorker = 7 / importScripts = 10(全て相対パス=自オリジン。https: 指定 0)/ respondWith = 2(sw.js:117/118)/ index.html の integrity= 0 / <video|<audio|Range 0。
- sw.js:112-115 入口の門: GET 以外・他オリジン・範囲外(startsWith(SCOPE)=末尾 '/' 付きなので /soranotsuji-dev-x/ は不一致)・authorization 付きは respondWith しない。Google/タイル/天気の通信には触れない(§8 どおり)。
- sw.js:27-28 importScripts は自オリジンの 2 本。SW 本体と importScripts はブラウザが fetch ハンドラの外・updateViaCache:'none' で取るので、控えの汚染で sw.js 自体は差し替えられない。
- sw.js:105-108 message は type 'sora:served?' だけに応答。控えの書き換え・削除・fetch はできない。
- sw.js:39-58 install: 版の門番(配信中の sora-constants.js を cache:'reload')→addAll(cache:'reload')→全件確認→skipWaiting の 2 フェーズ。失敗時は既存の控えが無かった時だけ削除=途中の控えを残さない。activate(60-66)は 'sora-shell-' かつ自分以外だけを消すので他プロジェクトの Cache Storage には触れない。
- sw.js:94-103 putRuntime: res.ok のみ・同一オリジン(opaque 応答は生じない)・上限 64MB・実体バイトで計上。4xx/5xx は控えに入らない。
- sw.js:126/79 転送: navigate の転送は Response.redirect(res.url)。他オリジンへの転送は CORS で落ちて catch→控えに落ちるので、他オリジンの本文を自オリジンとして返す経路は無い。
- sw.js:68 keyOf はクエリを捨てる(?query=/?forecast=1/?sw=1 を別の鍵にしない)。フォルダは index.html と同じ鍵。
- sw.js:145-150 配布直後(ページの版≠SW の版)はネットだけ・'unknown' はネット→落ちたら控え。
- script.js:1106-1118 登録: https か ?sw=1 の時だけ、register('sw.js') は範囲内の相対 URL・updateViaCache:'none'。_swServedVersion(1108)は cache:'no-cache' なので sw.js:151 の fresh 判定でネットへ行き、汚染された控えの sora-constants.js に騙されない。
- script.js:1122-1128 controllerchange: 無限 reload にはならない。
- script.js:1135-1150 _swStat: 表示は _mtRefreshBackupRows の put(1077)=textContent なので、他ページが植えた名前(sora-shell-v<img…>)も HTML にならない。
- script.js:1153-1156 _swClear と reset.js:69-70: 消すのは 'sora-shell-' 接頭の控えと scope が自分の置き場と完全一致する登録だけ。利用者は「本体の控えを削除」(2836・confirm 付き)と reset.html で消せる。
- reset.js:44-51(⑤-1): key/value とも escapeHTML。reset.html:21 の CSP は self のみ・img-src self data: なので外部画像も止まる。
- index.html:21 CSP meta は控えから出す index.html にもそのまま入る。worker-src 'self' blob: で登録は通る。
- verify187 S1(形の文字列一致)・S2(一覧の一致と実体)・S3(本体の配線)・A1-A3(実機: 登録→控え→オフライン起動→削除)を確認。改ざんした控えの拒否と navigate の種類の絞りは検査対象外(F-01/F-02)。
- tools/sw/build-precache.js は配信面から一覧を集め実体の有無を確かめるが指紋は出さない(sw-precache.js は path のみ)。vendor/MANIFEST.json の sha384 は verify/ハーネスでの照合用で、実行時(SW/SRI)には使われていない。

### storage-trust(20 件)
- grep 件数: localStorage 参照 script.js 33 行(実コード 20 箇所)+reset.js 9+sora-constants.js 1 / JSON.parse 25(script.js 23・reset.js 2)/ indexedDB.open 7(script.js 4・ワーカー 3)/ caches.* script.js 4・reset.js 1・sw.js 8。全て読んで入口から辿った。
- reset.js:47 localStorage の全キー/値は escapeHTML。reset.js:127-131 の復元は soranotsuji_app だけ・文字列だけ・4M 文字・JSON.parse 可否で止まる(本体の _writeSoranotsujiKeys と同じ)。
- script.js:3077 JSON.parse は try/catch 内。saved が null/数値/文字列/配列でも saved.x は undefined で全て既定に落ちる(例外は F-13 の形だけ)。loadAppFromDrive 14844-14846 も object かつ STORAGE_KEY が文字列で JSON.parse 可を確かめる。
- プロトタイプ汚染: 保存データを深く merge する関数は無い(grep deepMerge/merge 0・Object.assign は 12087 の内部値のみ)。{...saved.mySetHome}/{...saved.googleDrive}/{...p} のスプレッドは CreateDataProperty なので JSON.parse 由来の自前プロパティ "__proto__" は own property になるだけ。appState[k]=saved[k] は固定の鍵一覧(3117-3156)だけ。
- script.js:1028-1033 sora_store_caps は知っている店名だけ・isFinite・10〜1,000,000 で読む。sora-store-worker.js:44/74/106 は Number()||0 と Number(v.t) で守る。
- script.js:3206-3285 _sanitizeStoredShapes: 点(lat/lng 必須・範囲)・My点(id 整数・名前 300/メモ 1000)・My天体(色 safeCssColor)・My辻(numOr・時刻の形・真偽 !!)・mySets(sheetId 文字種)・googleDrive の 4 ID・My宙検索の id を確認。bodies は id で find するだけで色は safeCssColor(3250)。
- APP_DEFAULTS(386-559・157 項目)と loadAppState の復元キーを機械照合: 規則無し({def}のみ)の 54 キーは input.value/真偽判定/計算にしか届かず、innerHTML/setHTML/style への補間は 0 件(走査スクリプトで確認。soraFolderName は confirm/alert の文字列・astroRefraction はキャッシュ鍵のみ)。
- script.js:15373-15375/15396/15404-15407/15930: mySets[].data と mySetHomeData の読み手は applyMySetData(→normalizeAppState 15110)と _mySetSheetRows(15189-15196・RAW 書き込み・配列でなければ .map の TypeError を try/catch が受ける)と flipRows だけで、描画へは届かない(⑤-4 は問題なし。F-06 の mySetCurrentId の型だけが絡む)。
- script.js:15609-15611 Myセットを開く window.open は id 0 も含めて /^[A-Za-z0-9_-]+$/ と encodeURIComponent・noopener。Sheets/Drive API のパスは全て encodeURIComponent。
- script.js:1264-1290 gsicache: params.url は initMapGL の定数ソース定義(_mtUrl 1293)からだけ。IndexedDB の rec.buf はラスタ画像として復号されるだけ(画素)・rec.miss は数値扱い。kashimap-worker.js:135-137 と sora-terrain-worker.js:145-156 も Blob→createImageBitmap で、失敗は catch で null(⑤-14 は問題なし)。
- script.js:20561/21578 天気の控え(soranotsuji-wx/fc): hit.t は数値比較・hit.data は数値計算にしか使わない。TTL 切れは sora-store-worker.js:106 が消す。
- script.js:22993-22997 建物の店: rec.buf は _smBldgParseB3dm(22899)へ渡り 23271 の try/catch で解釈失敗は null。tileset の JSON.parse(23015)の失敗は reject で _smBldgTilesetCache から外す。
- script.js:11883-11899/12016-12026 可視マップ資産: File読込の経路は _kmImportText で島番号/画素数を数値化し、range=+meta.range_km・islands=length・name は escapeHtml、kind は _kmKindOf の定数 4 種(12813)。ファイル経路からの HTML 注入は無い。
- script.js:3094 googleDrive: ID 4 つは 3255-3259 で文字種検査。lastDriveModifiedTime は new Date(...) で NaN なら比較が false(14911)。autoSync は真偽値。lastSyncFingerprint は比較のみ。
- script.js:3107/14371 lastVisitDate は todayStr との文字列比較だけ(型が違えばカウンタが 1 増えるのみ=§7b の範囲)。
- script.js:3080-3083/5565-5580 start/end/homeStart/homeEnd: fixPoint は {...p} で余分な鍵を残すが、ポップアップは Number()/toFixed だけ。
- sw.js:105-108 message は type 照合と返信だけ。111-116 の門・39-57 の 2 フェーズ install は実装どおり。controllerchange の自動再読込は配信中の版の照合だけで控えの中身は見ない=F-01 と整合。
- script.js:14667-14672 collectLocalStorageAll は soranotsuji_ 接頭辞だけを Drive へ上げ、書き戻しは soranotsuji_app だけ(14681-14685)。他ページが植えた soranotsuji_* の鍵は Drive に乗るが端末へは戻らない(§7b の範囲)。
- script.js:3337 SORA_SENSOR_ALIASES[key] は 'constructor' 等でも次行の SORA_SENSORS.some が false で既定へ(F-12 の SS_PRESETS と違い実害なし)。3348 FW_SHELLS.some・3310 validModes.includes・APP_DEFAULTS の enum は配列の includes なので安全。
- script.js:3059 saveAppState の QuotaExceeded は catch で 1 回だけ alert+console.error(無音にならない)。_settingsBytes(1206)の表示も try/catch。

### google-oauth(15 件)
- script.js:187-196 GOOGLE_CONFIG: clientId(prod/dev)・Picker apiKey・scope は drive.file 1 本。getGoogleClientId は hostname の完全一致で本番/開発を分け、他ホストは開発 clientId(承認済みオリジン外では Google が発行拒否)。apiKey の使い所は setDeveloperKey(15657)の 1 箇所だけで key= の URL には付けない。
- script.js:14505-14512,14542-14545,14595,15062-15068 トークンはメモリの googleToken だけ。入るのは GIS の callback だけ・ログアウトと失効監視で null。console/alert に resp やトークンを出す箇所は無い。alert に混ざる API 由来の文字列は resp.status の数字(14557/14628/15135)と GIS の err.message/err.type(14551)だけ(⑤-13 は問題なし)。expiresAt は expires_in−60s・isGoogleLoggedIn は +60s の余裕。
- script.js:14553,14624,14804,15132 Bearer を付ける fetch は 4 箇所で宛先は固定文字列+定数パス。ID が入る所は全て encodeURIComponent(driveGetMeta 14600・driveUploadJson 14622・loadAppFromDrive 14804・_mySetEnsureSheets 15187/15191/15199・batchGet 15329・mySetCreateSheet 15333・保存 15456-15468・copy 16028・PATCH 15048)。Drive の q 文字列は定数の marker と SORA_APP_FILENAME だけ。
- script.js:14614-14631 multipart アップロード: boundary は固定文字列、本文は JSON.stringify の出力(CR/LF は \\r\\n にエスケープ)なので \r\n--boundary を作れない。アップロード後に size をバイト数で照合(14874-14876)。
- script.js:14592-14594 revoke: 生きているトークンを渡し失敗は console.warn。oauth2.googleapis.com は connect-src にある。失効後に revoke できない件は §7b。
- script.js:14798-14845 loadAppFromDrive: alt=media の本文は JSON.parse→object かつ STORAGE_KEY が文字列→中身も JSON.parse→confirm→_writeSoranotsujiKeys。drive.file スコープなので第三者が共有した soranotsuji-app.json は名前検索(14701)に見えない(Picker は SPREADSHEETS ビュー 15655=ネイティブのシートは alt=media で 403→broken)。他人のファイルで端末を毒する筋は無し。
- script.js:15654-15672 Picker: setOAuthToken/setDeveloperKey/setAppId(clientId 先頭の数字=プロジェクト番号)。使うのは Document.ID だけ(15664)。未検査で保存されるが全ての到達先が encodeURIComponent、openMySetSheet 15610-15611 は正規表現+noopener、次回 normalize(3277)で不正なら null(⑤-7 は問題なし)。
- script.js:15178-15180,15200-15201,15329-15330 Sheets 応答: sheets.properties.title は比較のみ・valueRanges/values は || [] で守る・各セルは String() 化→parseInt/parseFloat。名前は 150 文字・行数 1,100・合計 4M。meta.modifiedTime は文字列比較と new Date().getTime() のみ、meta.size は Number()(14745/14831/14899)、meta.name は比較のみ(⑤-12 は問題なし)。他人の共有シートを Picker で選んだ場合も同じ検査。
- script.js:15745-15815,14931-14934,14402-14405 描画: Myセット行の name/memo/title は escapeHtml・id は Number()・同期ダイアログは整形した日時と定数の [New]・カウンタは innerText。
- script.js:14375-14425 / gas_spredsheet.js:31-76 GAS: クライアントは action の定数だけを encodeURIComponent で送り、応答は d.error の照合→innerText。非 JSON は .catch で '- - -'。再試行は合計 3 回。サーバーは doGet のみ・e.parameter.action は === 比較だけで出力に戻さない・例外は error:'internal'(71-72)・dailyLog は年 1 シートの最大 366 行。dailyLog が配列でない応答は drawGraph(14449)で TypeError になるだけ(運営者自身の TLS 先)。水増し/枠切れは §7b(⑤-11 は問題なし)。
- index.html:21 CSP の Google の枠: script-src accounts.google.com/gsi/client+apis.google.com・frame-src accounts.google.com/gsi/+docs.google.com・connect-src www/sheets/oauth2.googleapis.com+accounts.google.com/gsi/+script.google.com+script.googleusercontent.com。GIS/Picker のスクリプトは固定 URL を動的に append(14518/15621)で、SRI は Google が未対応=信頼する第三者コードとして受け入れ済み。
- script.js:16815-17101 URL 復元は googleDrive/mySets/mySetHome/soraFolderName/sheetId/lastVisitDate を一切触らない。Drive/Sheets の書き込みは全てクリック+confirm() の後(14998/15543/15554/15591/15649/16021/14822)で、URL や postMessage から起動できない=CSRF 的な筋は無し。
- script.js:14785 _autoSyncFlush は isGoogleLoggedIn() を先に見て API を呼ばない(ユーザー操作なしのポップアップは起きない)。visibilitychange(14820-14822)も同じ。
- script.js:14647-14660,14666-14675 collectLocalStorageAll は soranotsuji_ 接頭辞だけ(トークン・sora_store_* は対象外)、書き戻しは STORAGE_KEY だけ。verify184 S6/U 系がトークンの非保存を見張る。
- script.js:3268-3272 googleDrive の 4 つの ID は文字種検査済み。3094 の spread は saved.googleDrive が文字列でも object になり検査に入る。lastDriveModifiedTime/lastSyncFingerprint/lastSyncDriveModifiedTime は比較と new Date() だけ。

### file-import(13 件)
- 入口の列挙: pickTextFile 経由のテキスト取り込み 10 箇所(6257/6295/6488/7010/7057/7639/7672/22118/22139)+写真 3 箇所(2255 写位・2669 My観測点・2688 My目的点=index.html:949/2153/2188 accept=image/*)+可視マップ資産 1 箇所(13072・複数可)+reset.js:116 復元。QR は出力のみで画像/QR の読み取りは無い。Exif 解析は自前 1 本(_exifGpsFromArrayBuffer 6820)。
- script.js:6225-6238 pickTextFile: file.size > PICK_FILE_MAX_BYTES(8MB)で読む前に止める(6232)。上の 10 箇所全てがこの殻を通る(S9)。
- script.js:6820-6881 _exifGpsFromArrayBuffer(写位 4394・写真から追加 6890): 画像のデコードはせず DataView の走査だけ。JPEG のセグメント走査は `len < 2 || off + 2 + len > byteLength` で break(6832)し、各分岐で off が必ず進むので無限ループにならない。findTag は `e + 12 > byteLength` で打ち切り(6854)、refChar/dms は境界で守る(6865/6872)。緯度経度は ±90/±180 の範囲検査(6879)と (0,0) 除外。呼び元は try/catch で RangeError も alert に落とす。HEIC/PNG/WebP は先頭が合わないので null。
- reset.js:3-15/44-51(⑤-1): key・value とも escapeHTML。復元(116-142)は soranotsuji_app の文字列だけ・4M 文字・JSON.parse の門(S10)。
- script.js:14677-14690 _writeSoranotsujiKeys(バックアップ新形式・Drive 共通): 書くのは STORAGE_KEY だけ・合計 4M 文字・JSON.parse の門。localStorage.setItem は原子的なので枠超過でも旧値が残る(U5/U8)。importBackup 6491-6497 は書き戻し→appReload() で、中身の型は再読込の _sanitizeStoredShapes に委ねる設計どおり。
- 脅威モデル⑤-3(CSV で保存枠を超えて以後の保存が永続的に失敗する筋)は不成立: saveAppState 3059-3070 は setItem の例外を catch して 1 回 alert し、旧値はそのまま。削除/再読込で回復(残る不整合は F-15)。
- script.js:6255-6360 My天体 CSV / 7488-7636 My辻検索 CSV / 22078-22158 My宙検索 CSV: ID は parseInt で 1〜1000・行数 ≤1000・数値欄は parseFloat+isNaN・列挙欄は許可リスト・真偽は ON/1/TRUE だけ・My辻の name は .slice(0,150)・My宙は範囲に丸めて normalizeAppState→saveAppState の順。自由文は csvUnprefix(S10/U8)。描画は escapeHtml 済み(U4)。toHalfWidth(6192)は全角→半角の写像のみ。
- script.js:12047-12063 _kmImportText: JSON の門・meta/islands/outline の構造・島の番号/画素数の数値確定(U4b)。_kmDecodePoly(12140-12144)は next() が必ず i を進めるので文字列末尾で終わる。資産の描画は Promise の中で、失敗は p.catch(12165)で _kmAssets から外して次回再試行。入口は ?kashimap=1 の時だけ(残る型の穴は F-16)。
- script.js:16695-16725 QR コード: 自アプリが作った URL 文字列を vendor/qrcode.js で画像化してクリップボードへ出すだけ。
- script.js:3208-3287 _sanitizeStoredShapes: バックアップ/Drive/シート由来のリストは再読込/取り込み/切替の全入口で型が確定する(U4/U7)。meteo と My点の緯度経度の範囲だけが対象外(F-03/F-04)。
- script.js:4387-4400 写位 setLocationFromPhoto: Exif の緯度経度(範囲検査済み)を applyLocationCoords へ渡すだけで標高は再取得。confirm の後に適用。
- script.js:13072-13078 可視マップ資産のファイル選択: ファイルごとに try/catch で alert の文に集約し、1 件の失敗が他の件を止めない。ev.target.value='' で再選択も可。
- (補足)写真 3 箇所は accept=image/* で、画像のデコードは行わないため画像パーサの脆弱性は当たらない。

### csp-headers(12 件)
- 列挙の件数: CSP meta は index.html:21(13 ディレクティブ)と reset.html:21(7)の 2 枚(privacy/terms は無し=反証済み)。script.js の外部ホスト 18 種(fetch 31 箇所+workers 2)・new Worker 7 箇所(全て自サイトの固定名)・createObjectURL 6 箇所・new Image 4 箇所・動的 <script> 3 箇所(14518 gsi/client・15620 apis.google.com/js/api.js・22887 vendor/draco=self)・target=_blank は index.html 12 本+privacy 3+terms 2+script.js の attribution 8 本(全て rel=noopener。S5)・window.open 1(15611 noopener,noreferrer)・style= 属性 index.html 4+reset.html 6(定数)・innerHTML reset.js 2。
- index.html:21 script-src: 動的に作る script は accounts.google.com/gsi/client(パス一致)と apis.google.com/js/api.js(gapi がその後読む /_/scs/… のためホスト全体が要る)と vendor/draco/draco_wasm_wrapper.js(self)の 3 つ。Draco は DracoDecoderModule({wasmBinary})(22893)で WASM を組むので 'wasm-unsafe-eval' は必要十分。three は three-global.js:3 の import(self)。インライン/eval 無し(S4)。
- index.html:21 worker-src 'self' blob:: 自サイトの専用ワーカー 7 本は 'self'。MapLibre 4.7.1 は createObjectURL した blob: を new Worker で起動=blob: が要る。three/Draco はワーカーを作らず主スレッドで復号。sw.js の登録も 'self' で通る。
- index.html:21 connect-src: 文書側の fetch 先を全部当てた(self・cyberjapandata・tile.openstreetmap.org・msearch.gsi.go.jp・nominatim・api/archive-api/air-quality-api.open-meteo.com・www.googleapis.com・sheets.googleapis.com・oauth2.googleapis.com・accounts.google.com/gsi/・script.google.com→script.googleusercontent.com・assets.cms.plateau.reearth.io)。XMLHttpRequest/sendBeacon/WebSocket/EventSource は 0。blob:/data: を fetch する箇所も 0(createImageBitmap(blob) は URL を通らない)。(広さは F-27。)
- index.html:21 img-src 'self' data: blob: + 地理院/OSM/s3: Image() の 4 箇所・_demDecode の objectURL(blob:)・qrcode.js の createImgTag(data:gif)・vendor/maplibre-gl.css の background-image 37 箇所は全て data:image/svg+xml・style.css に url()/@import/@font-face 無し。font-src 'self' は使い道が無い(MapLibre の glyphs は fetch=connect-src 'self')が害も無い。media-src 'self' blob: は 18998 の動画に対応。
- index.html:21 frame-src accounts.google.com/gsi/ + docs.google.com: createElement('iframe') 0。枠を作るのは GIS と Picker(docs.google.com/picker)だけ。object-src 'none'・base-uri 'self'・form-action 'self'(<form> 0)。manifest-src は default-src 'self' に落ちて自サイトの manifest.json が通る。重複ディレクティブ無し・ワイルドカード無し・http: 無し(S3)。
- index.html:22 / reset.html:22 <meta name="referrer" content="strict-origin-when-cross-origin"> は CSP meta の直後・最初の資源読み込みより前。
- manifest.json: start_url "./"・scope "./" は manifest の URL 基準の相対なので本番 / と開発 /soranotsuji-dev/ の両方で sw.js の範囲と一致。クエリを焼き込んでいない。icons は全て自サイト。
- sw.js:69-73 fetchWithTimeout は credentials:'same-origin'・cache:'no-cache' で Cookie を他へ送る形は無い。112-115 の門。148/154 で url.href を取り直すが同一オリジンなので mode/credentials の差は出ない。
- reset.js:47 は localStorage の全鍵/値を & < > ' " エスケープしてから innerHTML(51)。reset.js:37 の innerHTML は定数。
- style-src 'unsafe-inline' が要る理由と到達性: index.html の style= 4 箇所は定数、script.js のテンプレート内 style="…${}" 8 箇所は safeCssColor(6109/8947)か定数表(12418/12662/12675 _kmSeatColor・20993/20996/21673)で、利用者/シート/URL の文字列が CSS に届く経路は無い(U4/U7 が色の「;background:url」を既定色に戻すことを見張る)。MapLibre/three は CSSOM(el.style.x=)で CSP の対象外。多層防御の欠けではあるが今は塞がれている。
- script.js:2121-2130 securitypolicyviolation の記録は blockedURI の '?' 以降を落とす。forecast-features.html は <template> だけ(script/on*= 0・<a> 0)で index.html の CSP の下に入る。location.href/assign/replace への代入 0。

### supply-chain(16 件)
- vendor/MANIFEST.json ⇔ vendor/* の指紋: 8/8 ファイルとも sha384・sha256・バイト数が台帳と一致。data.jsdelivr.com/v1/packages/npm/<pkg>@<ver>?structure=flat の hash と照合し、maplibre-gl@4.7.1 dist/maplibre-gl.{js,css}・three@0.160.0 build/three.module.min.js と examples/jsm/libs/draco/{draco_wasm_wrapper.js,draco_decoder.wasm}・astronomy-engine@2.1.19・geographiclib-geodesic@2.2.0・qrcode-generator@1.4.4 の sha256 が全て上流と一致(同梱物は本物)。
- 既知の CVE(OSV querybatch): maplibre-gl 4.7.1 → GHSA-jrc7-96c5-q579 = CVE-2026-85061 のみ(§7b 受け入れ済み。fixed 6.4.1・CVSS 9.6・attribution 文字列が定数の間は不可)。three 0.160.0 / astronomy-engine 2.1.19 / geographiclib-geodesic 2.2.0 / qrcode-generator 1.4.4 → 該当なし。GitHub /advisories API はプロキシがリポジトリ外のパスを拒むため未使用。
- index.html:47,48,51,54,55,58,2953,2954: <script>/<link> は vendor/・three-global.js・sora-constants.js・script.js だけ(https の src/href は 0)。integrity 属性は 0(F-01 の②)。動的に作るスクリプトは GIS/Picker の 2 つ(S1)。
- importScripts の宛先は全て自オリジンの相対パス(dp-line 32,42 / sora-mov 10 / tsuji-search 22 / tsujimesh 23 / tm-vis 9 / kashimap 21 / sora-terrain 26 / sw.js 27-28)。
- vendor/draco/draco_wasm_wrapper.js: eval/new Function は 0。22887 の同一オリジン <script> と 22891 の fetch('vendor/draco/draco_decoder.wasm') で読み 'wasm-unsafe-eval' の下で動く。
- package.json / package-lock.json: devDependency は @playwright/test ^1.58.2 のみ(lockfileVersion 3・registry.npmjs.org・sha512 integrity 付きで 1.58.2 に固定)。OSV: playwright / playwright-core / @playwright/test 1.58.2 とも該当なし。node_modules は .gitignore:2 で除外(過去に追跡していた分は 4bb6702 で削除済み)。tools/lightpollution/package-lock.json の geotiff 2.1.3・pako 2.2.0・lerc 3.0.0・web-worker 1.5.0・quick-lru 6.1.2・xml-utils 1.10.2・zstddec 0.1.0・parse-headers 2.0.6・@petamoriken/float16 3.9.3 も OSV 該当なし。
- tools/ が取ってくる物: tools/kashimap/fetch-gsi-1003zan.sh:7-22 は OPENSSL_CONF で UnsafeLegacyRenegotiation だけ許し証明書検証は維持・URL は www.gsi.go.jp に限定 / tools/pref/make-pref-borders.py:63 は curl --proto =https --max-filesize 1500M -m 900、zip は :71-76 でメンバを MAX_MEMBER_BYTES 以下に限ってメモリに読むだけ(展開しないので zip-slip 無し)/ tools/plateau/make-bldg-cities.js:27,65 はカタログ API と d.url(任意ホスト)を fetch するが、出力 data/plateau-bldg-cities.json は現在 base 以外の絶対 URL が 0 件で、実行時 script.js:22814 `abs = u.startsWith('http') ? u : j.base + u` に他ホストが来ても CSP connect-src が止める / tools/kashimap/viewshed.js:52 は地理院タイル / fetch_stars.py:42,137 は SIMBAD TAP(HTTPS・証明書検証)→ celestial_db.json(名前は 6119/6429 で escapeHtml)/ tools/lightpollution は手動ダウンロード前提で通信無し。
- tests/harness/sync-apptest.py:43-54: vendor/ をコピーして MANIFEST の sha256 と照合し違えば exit 2。ネットワーク取得は無い(S7)。tools/sw/build-precache.js は通信無し。sw-precache.js:3-45 は全て自サイトの相対パス。
- 秘密情報: 追跡ファイル(vendor/ 除く)の形走査(ya29./GOCSPX-/1//0/AKIA/ghp_/github_pat_/xox/sk-/秘密鍵/AIza/クライアント ID/GAS URL)の該当は、公開前提の Picker キー AIzaSyBQ…(script.js:190。order-log 2026-10-14:881 は GitHub のアラート画面の貼り付けで同じ鍵。§7 行14 で Won't fix 合意済み)・OAuth クライアント ID 2 つ・GAS の配備 URL のみ。git 履歴(346 コミット・`git log -G` 全 ref・vendor 除く): 該当は検査の説明文・走査器の自己テスト用見本 ClaudeMederuU/mederuu-repo-staging/sync.js:103,105(AKIA＋16桁の英数字(AWS の例のキー)・秘密鍵の見出し(BEGIN で始まる PEM の行)のリテラル)・削除済み node_modules の NOTICE だけ。履歴全体で AIza の鍵は 1 種類。.env/.pem/credentials/token の名前の追跡ファイル無し。個人メールアドレスは追跡ファイル本文に無し(git の author メタデータのみ)。
- .github/: 無い(workflows・dependabot.yml・CodeQL 無し)。Pages の配信は GitHub 組み込みの pages-build-deployment なので、リポジトリ内のファイルで CI を改変する経路は無い(Dependabot が vendor/ を見ない点は F-28)。
- .well-known/security.txt:6-10: Contact 2 行(1 行目 security/advisories/new)・Expires 2027-10-01T00:00:00.000Z(今日から 345 日・1 年未満)・Preferred-Languages ja, en・Canonical は本番 URL・BOM 無し(S11)。開発サイトも同じファイルを配るが Canonical が本番だけなのは RFC 9116 §2.5.2 上は無害。
- robots.txt: `User-agent: *` / `Allow: /` の 2 行。隠しパスの開示も Sitemap も無く問題なし。
- CSP meta は index.html:21 と reset.html だけだが、privacy.html / terms.html / forecast-features.html には <script> が 0 で、forecast-features.html は DOMParser で不活性に読むだけ。index.html の script-src に 'unsafe-inline'/'unsafe-eval' 無し(S3)。
- 配布の経路: docs/operation/deploy-guide.md:215 の rsync -av --exclude='.git' に指紋照合は無いが、コミット前の回帰 verify184 S2 が dev 側で vendor を照合し、:274 で本番の vendor/MANIFEST.json の 200 を確かめる運用。vendor/README.md は更新時に npm tgz または jsDelivr+unpkg の 2 か所照合を定める。vendor/licenses/ は MANIFEST の license_file 6 件すべて実在。
- muni.js(113KB)は追跡され tests/harness/sync-apptest.py:35 でコピーされるが、index.html/script.js から参照されていない(読むのは script.js:204 の muni.json)。CSP 下で読み込まれない死蔵ファイルで害は無い(ハーネスの一覧からは外せる)。
- (補足)GIS/Picker の第三者スクリプトは SRI 未対応で、§4-2 のとおり信頼する第三者コードとして受け入れ済み。

### dos-resources(21 件)
- ReDoS: script.js/reset.js/sw.js/各ワーカー/gas_spredsheet.js の正規表現リテラルを全列挙(候補 94 行=大半は除算。実際の正規表現は 4146 csvText・4149 csvUnprefix・4152 safeCssColor・5169 数値のみ判定・5095-5096 プラスコード短縮形・5245/5395/sora-terrain-worker.js:73,97 タイル URL・16379 版プレフィックス・16471 TZ・3261 真偽キー表・3327 reTime・sw.js:28 RUNTIME_OK・reset.js:4 escapeHTML)。全て先頭/末尾固定か固定長の文字クラスで線形。入れ子の量指定子 0 件。new RegExp 0 件。
- プラスコード復号(5044-5074)は入力長に線形。parseInput(5026)は split(',') と parseFloat のみ。
- ワーカープールの数: _poolSize()=max(2, min(CPU−1, 31))(4525-4529)、タッチ端末は 6(13462)、動画は 4(18413)。辻検索/辻メッシュは terminateAll(9890・closeTsujiMesh)、tm-vis は失敗時 terminate と terminateAll(9968-9987)、可視マップは 1 本で終了。DP/動画/地形のプールは固定本数の再利用で増えない。
- 辻検索の分割: TSUJI_CHUNK_DAYS=365(13457)、結果は天体あたり MAX_RESULTS_PER_BODY=36,500 で打ち切り。辻メッシュは 30 日チャンク(11404)、ワーカー側で 1 日の画素数を MAX_PIX_PER_DAY で打ち切り。
- 日数・範囲の丸め: tsujiSearchDays/tsujiMeshDays 1..36,500・My辻 days 1..36,500(3257)・ssDays 1..16・ssRange 1..300・soraViewRange 1..300・smBldgTiles 1..500(449/23065)・soraExpW/H ≤8192・soraMovShots ≤99,999(利用者操作のみ)。
- 辻ライン365(isDP365Active)は URL から復元しない(716 の注記)=ボタン操作のみ。dp-line-worker.js の二分(255)は 12 回で打ち切り、Vincenty の反復(119)は 100 回上限。
- 標高グラフ: 標本は固定 2,001 点(13813)、タイルは 1 枚ずつ(5507 BATCH=1)、国外は地理院を飛ばす(5484)、12 秒の待ち時間+1 回で諦める(5421-5431)、世代で中断(5478)。
- Open-Meteo: 標本点は格子で最大 16 点(20480-20500)、1 回の実行で API ごとに 1 本のまとめ要求、days≤16/11/7、失敗は throw→行ごとに捕捉で再試行ループ無し、IndexedDB の控え TTL 2 時間。ERA5 は ssStat オンの時だけ 10 年分を逐次。標高の代替は 96 点ずつ(5534)。
- GAS カウンタ: visit は端末ごとに 1 日 1 回(14370)、lock_busy の再試行は最大 2 回・2.7 秒×回、detail は 1 セッション 1 回(14415)。gas_spredsheet.js:31-74 は action 以外を読まず、detail の応答は最大 366 行×2。
- 地名検索(5160-5215): 利用者の入力時だけ・数値のみは飛ばす・再試行なし。Nominatim への並列呼び出し無し。
- LZW 復号の他の守り: 未知の版→null(16383)、Base64URL 以外→null(16391)、code>nextCode→null(16427)、UTF-8 fatal(16435)、幅は辞書の伸びに同期(16424)。while(true) は pos+width>total で必ず抜ける(残るのは F-20 の出力量)。
- Service Worker(sw.js): 自オリジン・範囲内・GET・authorization 無しだけ、SHELL_MAX_BYTES 64MB を実体バイトで数えて超えたら入れない、keyOf がクエリを落とすので鍵が増えない、ページ 4 秒/本体 10 秒の待ち時間(SORA.STORE)、install は 2 フェーズで途中の控えを残さない。
- IndexedDB の上限: 地理タイル(1279-1283)と建物(23002-23006)は put 前に _storeCap を見る。標高タイル(5410/5419/5426・sora-terrain-worker.js:146-149・kashimap-worker.js:138-141)は put 時に上限を見ず、1 日 1 回の片付け(sora-store-worker.js:48-72・9 割→8 割、30 日未使用、used 店の孤児)だけが効く=1 日の内は CAP_BYTES.demtiles を超え得る(情報。可視マップは封鎖中)。天気の店は片付けが TTL だけで CAP_BYTES.wx を見ない(84-98)が、1 件が小さく鍵は 0.05° 格子×日数で有限(情報)。404 の「無し」の印は size 0 で savedAt により期限切れ(_storeTouched も 5 万件で全消去)。
- localStorage から読む設定値: sora_store_caps は型と範囲(10..1,000,000MB)を検査、sora_store_clean_at は Number()(反証済みの項を参照)。
- バックアップ/Drive の書き戻し: STORAGE_KEY だけ・JSON 可・4M 文字(14680、reset.js:118-121)。Drive の app.json は drive.file+appProperties の自アプリのファイルで、JSON.parse は確認付きの操作の中。
- CSV 出力: 大きな結果 CSV は parts の配列のまま Blob へ(6244-6246・8553)で Invalid string length を避けている。他の出力は ≤1,000 行。21249/22047 の parts.join('') は宙検索結果(≤16 日×24 時間×≤16 点)で小さい。
- saveAppState の容量超過は捕捉して 1 回だけ alert(3059-3067)、UI ハンドラへ例外が出ない。reset.js の一覧は値を escapeHTML して線形に描く。
- sora-terrain-worker.js の _tileCache は 8 枚で入れ替え(157)、kashimap-worker.js の fetchTile は FETCH_TIMEOUT_MS+3 回+間隔(130-148)。PLATEAU の _smBldgUpdate は世代(23074)で古い実行を捨て、タイル数は smBldgTiles≤500。
- 他ウィンドウからの入口: window.addEventListener('message') 0 件・history.pushState/replaceState 0 件。
- (補足)辻検索の安全スキップ(tsuji-search-worker.js:159-163)は tolerance が通常範囲なら日ごとの全評価を避ける(F-22 は tolerance=360 の時だけ)。
- (補足)_poolSize の上限 31 はコア数に依存し、URL からは変えられない。

### privacy-leak(16 件)
- Referer に共有 URL のクエリ(位置)が乗らない: index.html:22 の referrer meta が CSP meta の直後(最初の資源読込より前)にあり、他オリジンへはオリジンだけ。reset.html:22 も同じ。privacy/terms はクエリを持たない。pushState/replaceState 0。別タブリンクは index.html 10 件・script.js 5 件とも rel="noopener noreferrer"、15611 window.open は 'noopener,noreferrer'。
- ワーカーの Referer: new Worker は 7 箇所全て固定ファイル名でクエリ無し。fetch は kashimap-worker.js:135 と sora-terrain-worker.js:145 のタイル取得だけ。専用ワーカーの referrer はワーカーのスクリプト URL(クエリを持たない)で、既定 strict-origin-when-cross-origin→他オリジンにはオリジンだけ。
- Service Worker: handleNavigate は url.href を自分で fetch する(ページの referrer を転送しない)。控えの鍵はクエリを落とす。控えの中身は配信物(sw-precache.js の 43 件)だけで利用者データは含まない。
- 訪問者カウンタ(GAS)に送る物: 14364 `fetch(\`${GAS_API_URL}?action=${encodeURIComponent(action)}\`)` と 14416 `?action=detail` だけ。credentials 指定なし(既定 same-origin=Cookie 不送信)。gas_spredsheet.js:42 以外のパラメータは読まず、IP/UA/時刻の個票は記録せず日別の件数だけ(63-66)。visit は本番ホスト+日に 1 回。
- console に出る個人情報/トークン: script.js の console.* 65 件(sw.js/reset.js/ワーカー 0 件)を全件確認。トークン本体を出す所は無い(14593 は revoke の r.error だけ)。3286 の「直せない行」は添字ラベルだけで内容を出さない。Google/Open-Meteo/Drive の失敗は status だけ。唯一の軽微点: 5166 `console.warn("数値のみの入力のため、地名検索をスキップしました:", q)` は利用者が入れた数値(座標の可能性)をコンソールに出す(端末内のみ。info)。
- アクセストークンの露出面: googleToken はメモリだけ。Bearer を付ける fetch は www.googleapis.com(14582, 14626)と sheets.googleapis.com(15165)。alert(e.message) 14874/15470-15472 の e.message は 'Drive APIエラー: <status>' 等で API 本文を含まない。GIS/ピッカーのスクリプトはログイン/追加の操作時に遅延読込なので未ログインの利用者は Google へ通信しない。userinfo/about/email/login_hint の参照 0 件。
- 書き出し画像/動画の位置情報: 宙の窓の静止画は canvas.toBlob(18750)の PNG/JPEG で Exif を持たない。焼き込みは soraExpCredit(18676-18680)=日時+クレジットのみ。ファイル名は日時のみ(18729)。動画は MediaRecorder(18876)で位置メタデータ無し。navigator.share は不使用。
- QR コード: copyShareQr(16690-16727)は端末内生成→クリップボードへ PNG。中身は共有 URL だけ(通信なし)。
- 共有 URL(buildCommonUrlParams 16494-16645)に乗る物: 観測点/目的点の緯度経度・標高、日時+タイムゾーン差、表示天体(My天体は name/ra/dec/color)、花火点の緯度経度(設定時のみ)、表示設定、辻検索/辻メッシュ条件。sheetId・Drive の ID・My点リスト・メモ・フォルダ名は乗らない。宙検索(ss*)は ?forecast=1 の時だけ(16575)。
- バックアップ/Drive の生ダンプ: collectLocalStorageAll は soranotsuji_ 接頭辞の鍵だけ。トークンは含まない(U3)。含まれる Google 側の情報は自分の Drive フォルダ/ファイル ID と Myセットの sheetId で、ID だけではアクセスできない(info)。Myセットのシートへ書く内容は _mySetSheetRows(15177-15205)=My辻検索/My観測点/My目的点/My天体(/My宙検索)だけ。
- Open-Meteo への緯度経度: 標高 5442/5541 は地理院 DEM に値が無い地点(海・国外)だけ緯度経度そのまま(privacy §4 に明記)。天気/AOD/気圧面/ERA5(20509-20650, 21570-21590)は 0.05° 格子に丸めた点(20497-20501)で、呼び元は ?forecast=1 の封鎖中機能。公開ビルドでは天気の通信は発生しない。
- 地名検索 5176/5203: 送るのは入力した地名だけ。タイムゾーン(5172)は振り分けにだけ使い送信しない。Nominatim に email 等のパラメータは付けない。
- privacy.html と実装の一致: §1 localStorage(STORAGE_KEY 180)・IndexedDB の控え 4 店(soranotsuji-maptiles 972 / soranotsuji-kashimap 11845 / soranotsuji-wx 20456 / soranotsuji-bldg 22970)は reset.js:62-64 で全て削除、本体の控え(sora-shell-*)と SW 登録も reset.js:67-68 で削除(reset.html:124 の記述と一致)。§2 scope=drive.file・トークンはメモリ。§3 カウンタ。§4 の通信先は index.html:21 connect-src/img-src の許可リストと一致(S11)。§5 解析/追跡なし(sendBeacon/userAgent/外部 img 0 件、manifest.json の start_url './' に追跡パラメータ無し)。(写真の段落と GPS は F-29/F-30。)
- privacy.html に書いていないが個人データではない物(info): 本体の控え(Cache Storage。配信物のみ。ヘルプ index.html:2794 に説明あり)と navigator.storage.persist()(利用者がボタンを押した時だけ要求 2826/1236)。§1 に「本体(プログラム)の控え」を 1 文足すと親切。
- MapLibre の地図/標高タイル(地理院・OSM・S3 terrarium)と PLATEAU(22965 `j.base+u`)には表示範囲/観測点周辺のタイル座標が乗る(仕様。privacy §4 に記載)。Referer はオリジンだけ。gsicache:// の URL はソース定義の定数から。
- エラー文の内部情報: GAS は 'internal'。本体の throw new Error は status 番号/ファイル名だけ。_writeSoranotsujiKeys のエラーは文字数のみ(14650)。

### type-confusion(16 件)
- Object.assign は 2 箇所のみ(script.js:12087 の patch はコード定数 / sw.js:72 の init はコード定数)→ __proto__ 経由の prototype 汚染なし。JSON.parse の結果は全て `{...}` スプレッドか個別代入で取り込む。
- JSON.parse 22 箇所(script.js 20 / reset.js 2)を列挙: 全て try/catch 内か形式検査付き(loadAppFromDrive 14844-14846 は object・非配列・STORAGE_KEY が文字列を要求 / importBackup 6490-6493 / _writeSoranotsujiKeys 14683 / reset.js 122-130 / 店の上限 1028-1031 は Number+範囲)。JSON.parse(JSON.stringify()) の深いコピー 7 箇所は自データ。
- Array.isArray 27 箇所: _sanitizeStoredShapes は 6 リスト全部を `Array.isArray(x) ? x : []` で包む(3233・3243・3250・3254・3272・3280)。applyMySetData(15103-15110)は 5 キーだけを `|| []` で取り込んで直ちに normalizeAppState→シート/オフライン保持の生データは型そろえを経ずに描画されない(消費箇所は applyMySetData・flipRows(`|| []` 付き)・シート保存の値配列だけ)。
- confirm() 65 箇所。URL からの自動実行: restoreFromUrl は状態の代入と _pendingPanel/_pendingTsujiSearch/_pendingTsujiMesh(検索の自動開始=非破壊)だけで、全消去・取り込み・Myセット切替・Drive 保存に相当するパラメータは無い。URL を読む他の箇所は ?forecast/?kashimap と ?sw=1 の 3 つだけ。_CLICK_ACTIONS(2106-2111)は開閉/閉じる系の 12 関数のみ。
- ID の採番と衝突: getNextMyStarId(6070)/getNextMyPointId(6594)/getNextMyTsujiId(7199)/getNextMySetId(15139)は 1〜1000 の空き番号走査。_sanitizeStoredShapes の intId は 1〜1,000,000 の整数のみ(3210)。CSV/シートの取り込みは 1〜1000+重複拒否(7030・7083・15278・15296・7646)、追加 CSV は重複時に confirm→再採番(7108-7112)。URL の starId は既存と衝突すれば getNextMyStarId で採番し直し、範囲外は次の normalize で捨てる(16917-16925)(件数は F-21、保存データの重複は F-09)。
- Google の ID 文字種: Drive の 4 ID と Myセットの sheetId は `/^[A-Za-z0-9_-]{10,200}$/`(3255・3272)、API パスは全て encodeURIComponent。picker 直後の s.sheetId(15632)は次の normalize で null 化される。
- 日時の HTML 化: formatMySetDateTime(15040-15046)は常に `new Date(ts)` を通して数値だけを出すので、savedAt・updatedAt・modifiedTime に文字列(HTML)が入っても innerHTML に届かない。同期ダイアログの [New] 判定(14920-14925)は NaN 比較で false になるだけ。
- reset.js:37-51 は localStorage の鍵と値を両方 escapeHTML で包んで表に組む。復元は soranotsuji_app だけ・JSON 検査・4M 文字。
- Myセット行: 既定のセットの memo は escapeHtml(15771)、name は loadAppState で固定(3092)、各行の name/memo も escapeHtml/Number(15779-15790)。mySetHome の取り込みは `{ ...appState.mySetHome, ...saved.mySetHome, id: 0, name: '既定のセット' }` で、saved.mySetHome が文字列/配列でもインデックス鍵が増えるだけ。
- {def} だけで汎用パスの対象外の数値キー(tsujiSearchBaseAz/OffsetAz/ToleranceAz/BaseAlt/OffsetAlt/ToleranceAlt・tsujiMoonBase/Tolerance・tsujiMesh*Az/Alt・soraBaseAz/Alt・soraOffsetAz/Alt)の行き先を全て確認: input.value(735・745・2276・2345・18311)かワーカー/計算の payload(7376・7386・8568・8582・9220・13521・18603・20127)で、innerHTML/style/MapLibre 属性には届かない(文字列が入ると NaN→検索結果が空になるだけ。範囲の無さは F-22)。真偽の {def} キーは if 判定でしか使われない。
- My宙検索の weights(custom 時に object 検査のみ 3380-3382)は HTML テンプレートに補間されない。parseMySoraCsvLine(22046-22083)は全欄を数値/列挙に確定。
- 訪問者カウンタ: setCounterDisplay は innerText(14401-14404)、dailyLog は canvas に描くだけ(14440-14470)。
- restoreFromUrl の数値は parseFloat+isNaN ガード→normalizeAppState(17048)→start/end は fixPoint の範囲検査(3217)で守られる。文字列キーの全部が APP_DEFAULTS の enum/個別検査(3331-3365)で列挙に落ちる。URL 凍結(17116-17122)は loadAppState 末尾の normalize 済みの preUrlSnap と、URL 適用+normalize 後の postSnap の差だけを凍結するので、生の値が凍結値として保存に紛れない。
- 可視マップ資産の取り込み _kmImportText(12047-12064)は assets/meta/islands/outline の形を Array.isArray と型で検査し、島番号/画素数を数値に確定(U4b)。
- 店の上限 _storeCaps(1026-1032)は知っている店名だけ・Number・10〜1,000,000。GeographicLib の Inverse は範囲外の緯度で例外を投げない(vendor/geographiclib-geodesic.min.js に "not in [-90" 無し)=getDistanceWGS84 は NaN を返すだけ。
- 地点ポップアップ/マーカーの HTML(1693-1703・createLocationPopup 5557-5570)は escapeHtml/Number で二重化、fixPoint が残す余分なキー(start.name 等)はテンプレートに補間されない。

## 6. 第159 の監査からの変化と、次の監査でやる事

### 第159(v1.98.0・デッサン34 §4)からの変化
- §4 の 15 の対策は全て実装どおりに効いている(§5 の各視点で個別に確認)。「対策が実装どおり効いていない」に該当する物は無かった。文書と実装の差は 2 点だけ: §4.4「Myセット…シートIDは Google の ID の文字種だけ」が ID:0(mySetHome)に効いていない(F-07)、§8「控えは配信物の写し」をコードが担保していない(F-01)。
- 第183 で足した Service Worker(sw.js)は、§8 に書いた守り(自オリジン GET のみ・importScripts 2 本・他オリジンに触れない)がそのまま実装されている。新しく出た指摘は「控えの出所を信じる」(F-01)と「navigate の控えの種類」(F-02)の 2 件で、どちらも dev 限定または実害の無い多層防御の話。
- 第159 で入れた型そろえ(_sanitizeStoredShapes)は設計の意図どおり「全入口の共通路」として機能していて、その分だけ対象外のキーが目立つ形になった。今回の指摘 30 件のうち 11 件(F-03〜F-10・F-12・F-18)は同じ関数への追記で閉じる。
- 第159 で「URL 由来の毒は端末に残らない」(_urlSessionFrozen)としたことは、今回の URL 系 7 件(F-17〜F-23)の影響を全て「開いた画面だけ」に抑えている。設計上の良い壁として再確認した。
- 脅威モデル ⑤ の 14 候補の結果: ⑤-1(reset.js の表)問題なし / ⑤-2(SW の控え)F-01 として記録 / ⑤-3(CSV で永続停止)不成立=F-15 の軽い形に / ⑤-4(s.data の描画)問題なし / ⑤-5(URL 文字列キーの網羅)F-12 だけ / ⑤-6(LZW)F-20 / ⑤-7(picker の ID)問題なし / ⑤-8(対象外キー)F-04〜F-08 / ⑤-9(setHTML)問題なし / ⑤-10(属性文脈)問題なし / ⑤-11(GAS)問題なし / ⑤-12(Google 応答の型)問題なし / ⑤-13(トークンの露出)問題なし / ⑤-14(gsicache)問題なし。

### 次の監査でやる事
1. 今回の 30 件を直した後の再走査(特に _sanitizeStoredShapes への追記が CSV/シート/バックアップ/Drive/URL の全入口で効いていることを、入口ごとに 1 件ずつ)。
2. 封鎖中の機能(?forecast=1 の宙検索/My宙検索・?kashimap=1 の可視マップ)を公開する前に、その節だけを対象にした再監査(F-11・F-12・F-16 は公開時に重大度が上がる)。
3. MapLibre を 6.4.1 以上へ上げた時(CVE-2026-85061 の受け入れを外せる)、setHTML/属性文字列の呼び元 5 箇所を再確認。
4. SW の段2/段3(デッサン35)を進める時、F-01 の指紋照合を設計に含める。ワーカーの importScripts と three-global.js の import は SRI が効かないので、SW 側の照合が唯一の守りになる。
5. vendor の上流照合と OSV(F-28)を月 1 回の運用に入れ、次回の監査では「鳴った物」を見る形にする。
6. googleLogin(F-24)の直しの後、実機のログイン→ログアウト→再ログイン→保存の往復を A 系に入れる。
7. 本監査で使った補助道具(decodeQueryParam の抜き出し・astronomy/maplibre の node 実行・jsDelivr/OSV 照合)は再利用できるので ClaudeMederuU/tools/ に台帳を残す価値がある(本ラウンドの実験ノートに記す)。

## 7. 合格条件(デッサン34 §5)への追加案

### 層1(verify184 / verify187 に足す自動検査)
- U4 に毒入りの保存データを 6 件追加: `meteo:'abc'`・`meteo:{p:'x'}`・`meteo:{p:Infinity}`(K が有限に戻る)/ My観測点 `lat:999`(行が捨てられる)/ `soraFolderName:5`・`soraFolderName:{}`(既定に戻る)/ `mySetCurrentId:"1"`・`mySetCurrentId:999`(0 に戻る)/ `mySetHome:{sheetId:'../x?y', saveMode:1, checked:'yes'}`(null/'save'/false に戻る)/ `locMode:'foo'`('start' に戻る)。
- U4 に「loadAppState の順序」を 1 件: `myTsujiSearches:'x'` と `mySets:[…]` を持つ保存データを読んでも mySets が残る。旧形式 `{"myStars":[null]}` の取り込みで appState が変わらない。
- U4 に件数と重複: 150,000 行の myObservations が 1,000 行に切られる / id:1 の重複行が 1 行になる。
- U7 系に URL の不正値 5 件: `date=abcd0101`・`time=zz00`・`startElv=1e308`・`fwEnabled=true&fwLat=1000`・`starId×2000` を付けて開いても onload が例外なく終わり(resize リスナと _pendingPanel が走る)、My天体が 1,000 件を超えない。
- decodeQueryParam に展開爆弾(KwKwK 連鎖 16,000 符号)を渡すと null が返り、所要 100ms 未満。
- S3 の期待配列を F-27 の経路付きに更新し、U6 に `s3.amazonaws.com/other-bucket/` と `script.google.com/macros/s/other/` が止まる反証を 1 本。
- S11 の privacy.html 検査に「読み取った位置情報が…送信されることはありません」の文言が無いこと・「GPS」または「現在地」の語があることを追加。
- verify187 に「控えに改ざんした script.js を put しても配信されない(指紋不一致で削除してネットへ)」の実機検査と、「navigate で webp を開いても控えに入らない」を追加。
- ssPreset の `in` を `Object.hasOwn` に替えた後、`ssPreset:'constructor'` が既定へ戻ることを U4 に。

### 層2(依頼者が 1 回確かめる)
- 実機: ログイン→Drive 保存→ログアウト→再ログイン→Myセットの「更新」が 1 回で完了し「更新中(0%)」のまま止まらない(F-24)。
- 実機(dev): DevTools で `caches.open('sora-shell-v<版>')` の一覧に data/・画像の navigate 由来の鍵が増えていない(F-02 の直しの後)。

### 層3(続ける運用)
- 月 1 回に「tools/vendor/audit.js を回す(jsDelivr の指紋と OSV)」を加える(F-28)。GitHub Watch の対象に GeographicLib と qrcode-generator も加える。
- ライブラリを上げる時の手順に「sw-precache.js の指紋を作り直す(build-precache.js)」を加える(F-01 の直しの後)。
- 封鎖解除(forecast/kashimap)の前に「その節の再監査」を手順に入れる。

### §7b(受け入れた穴)への追記案
- 「開発オリジンの共有」の項に「同一オリジンのスクリプトは Cache Storage(sora-shell-v<版>)に本体を植えられ、sw.js は控えの出所を検査しないので次の版まで持続する(F-01)。本番は専用オリジンで対象外。dev では運用(他の HTML を置かない)で止める。指紋照合を入れるまでの間の受け入れ」を足す。
- 「専用ワーカーは meta CSP の対象外」の項に「sora-terrain-worker の fetch は URL がページの定数から組まれることを確認(第185)」を足す。
- 「MapLibre 4.7.1 の CVE」の項に「第185 で setHTML の呼び元 5 箇所と style 補間 8 箇所が定数/escapeHtml/safeCssColor のみであることを再確認」を足す。
