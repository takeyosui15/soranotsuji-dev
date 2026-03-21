# Git基本コマンド解説

作成日: 2026-03-16

デプロイ管理・バージョン管理で使う基本的なGitコマンドを解説する。

---

## Gitの全体像

```
作業ディレクトリ     ステージング     ローカルリポジトリ     リモートリポジトリ
(Working Dir)      (Staging Area)   (Local Repo)          (GitHub)
     |                  |                 |                     |
     |--- git add ----->|                 |                     |
     |                  |--- git commit ->|                     |
     |                  |                 |--- git push ------->|
     |                  |                 |                     |
     |                  |                 |<-- git fetch -------|
     |<-------------- git pull -----------|<--------------------|
     |                  |                 |                     |
     |<--- git checkout / restore --------|                     |
```

Gitでは「変更を記録する」までに3段階のステップがある:
1. **作業ディレクトリ**: ファイルを編集する場所（普段触っているフォルダ）
2. **ステージング**: 次のコミットに含める変更を選ぶ場所（`git add`で追加）
3. **ローカルリポジトリ**: コミット（変更履歴）が保存される場所
4. **リモートリポジトリ**: GitHubなどのサーバー上のリポジトリ

---

## 基本コマンド

### git clone — リモートリポジトリをローカルにコピー

```bash
git clone https://github.com/takeyosui15/soranotsuji-dev.git
```

GitHubにあるリポジトリを、まるごとローカルにダウンロードする。
全ファイル + 全変更履歴がコピーされる。最初の1回だけ実行する。

---

### git status — 現在の状態を確認

```bash
git status
```

- どのファイルが変更されたか
- どのファイルがステージングされているか
- コミットされていない変更があるか

を表示する。**作業中はこまめに実行して状態を把握する**のが良い。

---

### git add — 変更をステージングに追加

```bash
# 特定のファイルを追加
git add script.js

# 全ての変更を追加
git add -A
```

「次のコミットにこの変更を含める」という意思表示。
`git add` しただけではまだ記録されない。次の `git commit` で初めて記録される。

---

### git commit — 変更を記録（ローカルに保存）

```bash
git commit -m "feat: 辻検索の速度を改善"
```

ステージングされた変更を、**ローカルリポジトリに記録**する。
コミットメッセージ（`-m` の後の文字列）で「何を変更したか」を説明する。

**重要**: commitはローカルにしか保存されない。GitHubにはまだ反映されない。

---

### git push — ローカルの変更をリモートに送信

```bash
git push origin main
```

ローカルリポジトリのコミットを、リモートリポジトリ（GitHub）に送信する。

```
ローカルリポジトリ ──── git push ────→ リモートリポジトリ(GitHub)
  [コミットA]                           [コミットA] ← 追加される
  [コミットB]                           [コミットB] ← 追加される
```

- `origin`: リモートリポジトリの名前（通常はGitHub）
- `main`: 送信先のブランチ名

---

### git pull — リモートの変更をローカルに取得・統合

```bash
git pull origin main
```

リモートリポジトリの最新の変更を取得し、ローカルに統合する。
内部的には `git fetch` + `git merge` を一度に実行している。

```
リモートリポジトリ(GitHub) ──── git pull ────→ ローカルリポジトリ
  [コミットC] ← 他の人がpushした                  [コミットC] ← 追加される
```

---

### git fetch — リモートの変更を取得（統合はしない）

```bash
git fetch origin
```

リモートの最新情報を取得するが、ローカルのファイルは変更しない。
「確認だけしたい」ときに使う。統合するには別途 `git merge` が必要。

---

## pushとmergeの違い

これが最もよく混同されるポイント。

### push = ローカル → リモートに送る

```
[自分のPC]                    [GitHub]
コミット履歴:                  コミット履歴:
  A → B → C (新しい)    →→→    A → B → C (受け取る)
            ↑ push
```

**pushは「自分の変更をGitHubにアップロードする」操作。**

### merge = 2つのブランチを1つに統合する

```
main:     A → B → C
                    ↘
feature:        D → E → F
                         ↘
merge後:  A → B → C → D → E → F → M(統合コミット)
```

**mergeは「別々に進んだ変更を1つにまとめる」操作。**

### まとめ

| 操作 | 方向 | 目的 |
|---|---|---|
| push | ローカル → リモート | 自分の変更をGitHubに送信 |
| pull | リモート → ローカル | GitHubの変更を自分のPCに取得 |
| merge | ブランチ → ブランチ | 別々の変更を1つに統合 |
| fetch | リモート → ローカル | GitHubの情報だけ取得（ファイルは変えない） |

---

## バージョン管理コマンド

### git tag — バージョンのスナップショットを作成

```bash
# タグを作成
git tag v1.17.0

# タグをリモートにpush
git push origin v1.17.0

# タグの一覧
git tag -l

# リモートのタグ一覧
git ls-remote --tags origin
```

タグは「このコミットがバージョン v1.17.0 です」という**目印**。
コミットハッシュ（abc1234）は覚えにくいが、タグ名（v1.17.0）は分かりやすい。

```
コミット履歴:  A → B → C → D → E
                         ↑         ↑
                      v1.16.0   v1.17.0  ← タグ（目印）
```

### タグの削除（間違えた場合）

```bash
# ローカルのタグ削除
git tag -d v1.17.0

# リモートのタグ削除
git push origin --delete v1.17.0
```

### 過去のバージョンを確認

```bash
# 特定のタグの状態を見る（読み取り専用）
git checkout v1.17.0

# 元に戻る
git checkout main
```

---

## 状態確認コマンド

### git log — コミット履歴を確認

```bash
# 簡潔な一覧表示
git log --oneline -10

# 詳細表示
git log -5
```

出力例:
```
abc1234 feat: 辻検索の速度を改善
def5678 fix: 月の方位角計算の誤差を修正
ghi9012 style: ヘルプ画面のレイアウト調整
```

### git diff — 変更内容を確認

```bash
# まだcommitしていない変更を確認
git diff

# ステージング済みの変更を確認
git diff --staged

# 変更ファイルの一覧だけ確認
git diff --stat
```

---

## 取り消し・修正コマンド

### git revert — コミットを取り消す（安全）

```bash
git revert HEAD --no-edit
```

直前のコミットを打ち消す**新しいコミット**を作成する。
履歴は残るので安全。デプロイのロールバックで使用。

```
コミット履歴:  A → B → C → Revert C
                              ↑ Cの変更を打ち消す新しいコミット
```

### git checkout — ファイルの変更を取り消す

```bash
# 特定のファイルの変更を取り消す（コミット前の変更のみ）
git checkout -- script.js
```

**注意**: この操作は元に戻せない。変更が失われる。

---

## リモートリポジトリ管理

### git remote — リモートの管理

```bash
# リモートの一覧を確認
git remote -v

# リモートURLを変更
git remote set-url origin https://github.com/takeyosui15/soranotsuji-dev.git

# リモートを追加
git remote add origin https://github.com/takeyosui15/soranotsuji.git

# リモートを削除
git remote remove prod
```

`origin` は「このリポジトリのGitHub上の場所」を指す名前（エイリアス）。
複数のリモートを登録できるが、通常は `origin` の1つだけで十分。

---

## ブランチ操作

### ブランチとは

ブランチは「作業の分岐」。mainブランチ（本流）から分岐して作業し、
完成したらmainに統合（merge）する。

```
main:      A → B → C ─────────→ M（統合）
                ↘               ↗
feature:     D → E → F ────┘
```

### 基本操作

```bash
# 現在のブランチを確認
git branch

# 新しいブランチを作成して切り替え
git checkout -b feature/new-function

# ブランチを切り替え
git checkout main

# ブランチを統合（mainにfeatureを取り込む）
git checkout main
git merge feature/new-function

# 不要になったブランチを削除
git branch -d feature/new-function
```

---

## よく使うコマンドの早見表

| やりたいこと | コマンド |
|---|---|
| 変更状態を確認 | `git status` |
| 変更をステージング | `git add ファイル名` |
| 変更を記録 | `git commit -m "メッセージ"` |
| GitHubに送信 | `git push origin main` |
| GitHubから取得 | `git pull origin main` |
| バージョンタグ付与 | `git tag v1.17.0` |
| タグをGitHubに送信 | `git push origin v1.17.0` |
| 履歴を確認 | `git log --oneline -10` |
| 直前のコミットを取り消し | `git revert HEAD --no-edit` |
| リモートURLを確認 | `git remote -v` |
