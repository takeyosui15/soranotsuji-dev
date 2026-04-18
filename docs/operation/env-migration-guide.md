# 環境移行手順書

宙の辻プロジェクトの開発環境・試行環境間のソース移行手順です。

---

## 環境一覧

| 環境名 | リポジトリ | 用途 |
|---|---|---|
| **開発環境 (dev)** | `soranotsuji-dev` | メイン開発。リリース版のソース管理 |
| **試行環境 (sandbox)** | `soranotsuji-sandbox` | リモート試行開発。実験的な機能検証 |
| **ローカル試行環境 (sandbox-local)** | `soranotsuji-sandbox-local` | ローカル試行開発。オフライン作業 |

---

## 事前準備: リモート設定

各リポジトリで、他の環境をリモートとして登録します (初回のみ)。

### dev から sandbox を参照する場合
```bash
cd soranotsuji-dev
git remote add sandbox <sandbox-repo-url>
git fetch sandbox
```

### sandbox から dev を参照する場合
```bash
cd soranotsuji-sandbox
git remote add dev <dev-repo-url>
git fetch dev
```

### sandbox-local も同様
```bash
cd soranotsuji-sandbox-local
git remote add dev <dev-repo-url>
git remote add sandbox <sandbox-repo-url>
git fetch dev
git fetch sandbox
```

> `<xxx-repo-url>` は GitHub の HTTPS URL (例: `https://github.com/takeyosui15/soranotsuji-dev.git`)

---

## パターン1: dev → sandbox (開発環境から試行環境への取り込み)

開発環境の最新ソースを試行環境に取り込むケース。

### 方法A: ブランチごとマージ (推奨)
```bash
cd soranotsuji-sandbox

# 1. dev の最新を取得
git fetch dev

# 2. 作業ブランチを作成 (任意)
git checkout -b merge-from-dev

# 3. dev の main ブランチをマージ
git merge dev/main

# 4. コンフリクトがあれば解消
#    → 該当ファイルを編集して git add → git commit

# 5. 動作確認後、sandbox の main にマージ
git checkout main
git merge merge-from-dev
git push origin main
```

### 方法B: 特定のコミットだけ取り込み (cherry-pick)
```bash
cd soranotsuji-sandbox

git fetch dev
# dev のコミットハッシュを指定
git cherry-pick <commit-hash>
git push origin main
```

---

## パターン2: sandbox → dev (試行環境から開発環境へのアップ)

試行環境で検証済みのコードを開発環境に戻すケース。

### 方法A: ブランチごとマージ
```bash
cd soranotsuji-dev

# 1. sandbox の最新を取得
git fetch sandbox

# 2. 作業ブランチで取り込み
git checkout -b merge-from-sandbox
git merge sandbox/main

# 3. コンフリクト解消 → 動作確認
# 4. main にマージ
git checkout main
git merge merge-from-sandbox
git push origin main
```

### 方法B: cherry-pick
```bash
cd soranotsuji-dev

git fetch sandbox
git cherry-pick <commit-hash>
git push origin main
```

---

## パターン3: dev ↔ sandbox-local (ローカル試行環境との行き来)

sandbox-local は sandbox と同じ手順です。リモート名を `dev` や `sandbox` に読み替えてください。

### dev → sandbox-local
```bash
cd soranotsuji-sandbox-local
git fetch dev
git merge dev/main
```

### sandbox-local → dev
```bash
cd soranotsuji-dev
git fetch sandbox-local
git cherry-pick <commit-hash>
# または
git merge sandbox-local/main
```

### sandbox ↔ sandbox-local
```bash
# sandbox → sandbox-local
cd soranotsuji-sandbox-local
git fetch sandbox
git merge sandbox/main

# sandbox-local → sandbox
cd soranotsuji-sandbox
git fetch sandbox-local
git merge sandbox-local/main
```

---

## ファイル単位のコピー (git を使わない方法)

リポジトリ構造が異なる場合や、特定ファイルだけコピーしたい場合:

```bash
# dev の script.js を sandbox にコピー
cp ../soranotsuji-dev/script.js ./script.js
git add script.js
git commit -m "dev から script.js を取り込み"
```

---

## 注意事項

1. **マージ前に必ずコミット**: 未コミットの変更がある状態でマージすると混乱するため、事前に `git stash` または `git commit` しておく
2. **コンフリクト解消**: マージ時にコンフリクトが発生した場合、該当ファイルの `<<<<<<<` / `=======` / `>>>>>>>` マーカーを手動で解消し、`git add` → `git commit`
3. **ブランチ運用**: マージ作業は作業ブランチで行い、動作確認後に main にマージすることを推奨
4. **バージョン管理**: dev のバージョン番号 (index.html / script.js) と sandbox のバージョンが食い違う場合は、マージ後に手動調整
5. **リモート名の確認**: `git remote -v` で現在のリモート設定を確認できる
