# 移行前タグ付与手順書（v1.17.1）

作成日: 2026-03-19

## 目的

リポジトリ移行（repo-migration-guide.md）の前に、現在の開発環境・本番環境のコードを
バージョンタグ v1.17.1 で記録する。移行作業で問題が起きた場合の復元ポイントとなる。

## 前提条件

- ローカルの soranotsuji-dev に未コミットの変更がないこと
- 完了済みの作業がすべて main にマージ済みであること

## 作業の全体像

```
1. soranotsuji-dev（開発環境）の main を最新にする
2. develop 上で script.js のバージョンを v1.17.1 に更新する
3. develop を main にマージする
4. タグ v1.17.1 を付与して push する
5. soranotsuji（本番環境）にも同じタグを付与する
```

---

## パス定義

| 変数名 | パス |
|---|---|
| `$DOCS` | `~/Library/Mobile Documents/com~apple~CloudDocs/Documents` |
| 開発環境 | `$DOCS/soranotsuji-dev` |
| 一時作業 | `$DOCS/soranotsuji-tmp-local` |

---

## 手順

### Step 1: 開発環境の状態確認

- [ ] 未コミットの変更がないことを確認

```bash
cd "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Documents/soranotsuji-dev"
git status
# "nothing to commit, working tree clean" であること
```

- [ ] 現在のブランチ状況を確認

```bash
git branch -a
git log --oneline main -5
git log --oneline develop -5
```

---

### Step 2: script.js のバージョンを develop 上で更新

移行前の区切りとして、develop ブランチ上でバージョン番号を v1.17.1 に更新する。
develop で変更してから main にマージすることで、両ブランチの内容を一致させる。

- [ ] develop の最新を取得

```bash
git checkout develop
git pull origin develop
```

- [ ] script.js 冒頭のバージョンコメントを確認

```bash
head -10 script.js
# 現在のバージョン（例: V1.17.0）を確認
```

- [ ] バージョン番号を v1.17.1 に更新

VSCode などのエディタで script.js を開き、冒頭のバージョンコメントを修正:
```
// V1.17.0（2026-03-06）
↓
// V1.17.1（2026-03-21）
```

- [ ] 変更をコミット & push

```bash
git add script.js
git commit -m "feat: V1.17.1 移行前リリース"
git push origin develop
```

---

### Step 3: develop を main にマージ

develop ブランチの完了済み作業(バージョン更新を含む)を main にマージする。

- [ ] main の最新を取得

```bash
git checkout main
git pull origin main
```

- [ ] develop を main にマージ

```bash
git merge develop
```

- [ ] マージ結果を確認

```bash
git log --oneline -5
git diff --stat HEAD~1
# 変更内容が意図通りであること
# script.js のバージョンが V1.17.1 になっていること
head -10 script.js
```

**注意:** コンフリクトが発生した場合は、内容を確認して手動で解決する。
不明な場合は作業を中断し、Claudeに相談する。

---

### Step 4: 開発環境にタグを付与して push

- [ ] main を push

```bash
git push origin main
```

- [ ] タグを作成して push

```bash
# タグを作成
git tag v1.17.1

# タグを push
git push origin v1.17.1
```

- [ ] タグが正しく付与されたことを確認

```bash
git tag -l
# v1.17.1 が表示されること

git log --oneline -3
# 最新コミットにタグが付いていること
```

- [ ] GitHub 上でも確認
  - https://github.com/takeyosui15/soranotsuji-dev にアクセス
  - 「Tags」をクリックして v1.17.1 が存在すること

---

### Step 5: 本番環境にもタグを付与

本番リポジトリ（soranotsuji）にも同じファイルを反映し、タグを付与する。

- [ ] 一時作業フォルダを準備

```bash
mkdir -p "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Documents/soranotsuji-tmp-local"
cd "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Documents/soranotsuji-tmp-local"
```

- [ ] 本番リポジトリを一時 clone

```bash
git clone https://github.com/takeyosui15/soranotsuji.git soranotsuji-tag
cd soranotsuji-tag
```

- [ ] CNAME ファイルを退避

```bash
cp CNAME ../CNAME_backup
```

- [ ] 開発環境のファイルで上書き

```bash
# .git 以外の全ファイルを削除
find . -maxdepth 1 -not -name '.git' -not -name '.' -exec rm -rf {} +

# 開発環境のファイルをコピー（.git は除く）
rsync -av --exclude='.git' "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Documents/soranotsuji-dev/" ./

# CNAME ファイルを復元
cp ../CNAME_backup ./CNAME
```

- [ ] 差分を確認

```bash
git status
git diff --stat
# 変更内容が意図通りであること

# CNAME が正しいことを確認
cat CNAME
# soranotsuji.net であること
```

- [ ] コミット & push

```bash
git add -A
git commit -m "deploy: soranotsuji-dev からデプロイ (v1.17.1)"
git push origin main
```

- [ ] タグを付与

```bash
git tag v1.17.1
git push origin v1.17.1
```

- [ ] タグが正しく付与されたことを確認

```bash
git tag -l
# v1.17.1 が表示されること
```

- [ ] 一時作業フォルダを削除

```bash
cd "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Documents/soranotsuji-tmp-local"
rm -rf soranotsuji-tag
rm -f CNAME_backup
```

---

### Step 6: 本番環境の動作確認

- [ ] `https://soranotsuji.net` にアクセスして動作確認
- [ ] 主要機能のチェック:
  - [ ] 地図が正常に表示される
  - [ ] 天体の方位角・高度が計算される
  - [ ] 辻検索が動作する
- [ ] GitHub 上でタグを確認
  - https://github.com/takeyosui15/soranotsuji の「Tags」に v1.17.1 が存在すること

---

### Step 7: 作業記録

- [ ] 以下の情報を order.md に記録

```
タグ付与日時: 2026-MM-DD HH:MM
バージョン: v1.17.1
開発環境(soranotsuji-dev): タグ v1.17.1 付与済み
本番環境(soranotsuji): タグ v1.17.1 付与済み、デプロイ済み
確認結果: OK / NG
```

---

## 完了後の次のステップ

この手順が完了したら、リポジトリ移行（repo-migration-guide.md）に進む。

```
✅ v1.17.1 タグ付与完了
   ↓
📋 リポジトリ移行（repo-migration-guide.md）
   ↓
📋 テスト環境構築（test-env-setup.md）
   ↓
📋 テスト実施（test-checklist.md）
```

---

## タグを間違えた場合の修正方法

```bash
# ローカルのタグ削除
git tag -d v1.17.1

# リモートのタグ削除
git push origin --delete v1.17.1

# 正しいコミットでタグを再作成
git tag v1.17.1
git push origin v1.17.1
```
