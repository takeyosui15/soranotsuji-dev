# MederuUリポジトリ作成の手順書 — Privateで器を立てる

第76ラウンド(2026-08-14)作成。koushi公開で確立した型(staging→開錠→push→施錠→検品)の再利用。
一式の中身は `ClaudeMederuU/mederuu-repo-staging/` に準備済み(デッサン00の手順4=
「2フォルダ+README+CLAUDE.mdの最小構成」の通り。蒸留第1陣は入れない=空の器を先に作る)。

## 手順1 🧑: GitHubでMederuUリポジトリを作成する(3分)

1. https://github.com/new を開く。
2. 設定は次の通り。
   - Owner: `takeyosui15` / Repository name: `MederuU`
   - 説明(任意): `Claudeのナレッジ・道具・手順をセッションを越えて引き継ぐ器`
   - **Private** を選ぶ(公開の判断は手順9のまま先送り=デッサン00の方針)。
   - README/.gitignore/licenseは**全てオフのまま**(中身はClaudeが送る。
     ライセンスは公開時に道具=コードと学び=文書で分けて検討する — MITの意向は記録済み)。
3. 「Create repository」。
   - Privateなので読めるのも書けるのも、たけちゃんと許可したApp(開錠中のClaude)だけ。
   - ブランチ保護は当面設定しない(単独オーナーのPrivateでは鍵=App施錠が実質の保護。
     公開する時=手順9で、PR必須化とあわせて再検討する)。

## 手順2 🧑→🤖: 開錠してClaudeにpushしてもらう

1. GitHubの Settings → Applications → Installed GitHub Apps → Claude →「Configure」→
   Repository access に `MederuU` を追加してSave(開錠)。
2. 次の依頼で「MederuUを作りました。開錠済みです」と一言。
3. Claudeがstaging一式(README・CLAUDE.md・legends/・projects/)をmainへpushし、
   引き直しクローンで検品する(koushiと同じ「届いた実物」検品)。
4. 🧑 施錠(Repository accessから外す)。次にpushが必要になるまで閉めておく
   (koushiと同じ既定施錠の運用)。

## 以後の手順(デッサン00のスモールスタート手順の続き)

- 手順5: sync.js(一方向吸い上げ+秘密検査)— 吸い上げ元は宙の辻の`ClaudeMederuU/`+`.claude/skills/`。
- 手順6: index-gen(man風ヘッダ→目次)。
- 手順8: 最初の蒸留(reviews/約70枚からlegends/への昇格第1陣。プロジェクトの節目に)。
- 手順9: 公開の判断(ライセンス・秘密検査の確認)。
- sync実行時のMederuUへのpushも「開錠→push→施錠」で行う(頻度はプロジェクトの節目毎なので
  開けっ放しにしない運用と相性が良い)。

## 進捗

- 手順1〜2: 未実施(この手順書の作成=第76ラウンド。staging準備済み)。
