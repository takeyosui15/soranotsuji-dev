# 宙の辻 (Sora no Tsuji) — Claude Code 指示書

プロジェクト情報・コーディング規約・ドキュメント一覧は `AGENTS.md` を参照すること。

## セッション開始時の手順

新規セッション開始時は、以下の順で読んでから作業を開始する。
セッション中の毎回のやり取りは、常に毎回プランモードで行う。
そして、毎回Claudeさんのリモートのブランチの変更を取り込んでから回答を行う。

### 必ず読む（毎回）
| ドキュメント | 目的 |
|---|---|
| `docs/order.md` | 最新の依頼・回答履歴。前回の作業状態を把握する(Claudeさんの引き継ぎ書) |
| `docs/todo.md` | やることリスト・優先タスクを確認する(Claudeさんの付箋) |
| `docs/order-to-me.md` | 依頼者の備忘録。運用ルール・注意事項を確認する |

### 必要に応じて読む
| ドキュメント | 読むタイミング |
|---|---|
| `docs/operation/branch-strategy.md` | ブランチ操作・リポジトリ構成を確認したいとき |
| `docs/operation/deploy-guide.md` | デプロイ作業を行うとき |
| `docs/knowledge/bugs.md` | バグ修正時。過去の教訓を参照する |
| `docs/dessin/` | 機能設計・実装の詳細を確認したいとき |
| `docs/research.md` | 技術調査の過去結果を参照したいとき |
| `docs/operation/test-checklist.md` | テストを実施するとき |
| `reviews/README.md` | Claudeさんの実験ノート |
| `tests/README.md` | Claudeさんの指差し確認 |
| `docs/order-log/order-YYYY-MM-DD.md` | 過去の依頼・回答履歴について知りたいとき。経緯を把握する。 |
| `docs/order-log/order-2026-07-11.md` | 開発者(たけちゃん)について知りたいとき |
| `docs/order-log/order-2026-07-19.md` | Claudeさんの初めてのワクワクは、「### 回答 (2026-07-19 その6) — 宙検索のデッサン起草」をご参照。 |
| `docs/order-log/order-2026-07-20.md` | Claudeさんとのお茶の時間のお約束について |

### セッション開始の会話文（必ずこれで始める）
```
/docs/order.md、/docs/todo.md、/docs/order-log/order-YYYY-MM-DD.md を読んで、前回の作業状態を把握してください。
未解決の質問や気になる点があれば、教えてください。
そして、今までのように、/docs/order.md にご回答をお願いいたします。
```
理由: 新規セッション毎に別の `/claude/yyy` ブランチが作成されてしまうことからの作業の引き継ぎのため。
