# リポジトリ移行手順書

作成日: 2026-03-12

## 目的

本番環境のダウンタイムを最小化しつつ、リポジトリ構成を以下のように移行する。

## 移行の全体像

### 現状

| 環境 | リモート(GitHub) | ローカル(Mac) |
|---|---|---|
| 本番 | soranotsuji (GitHub Pages / soranotsuji.net) | - |
| 開発 | soranotsuji-dev | soranotsuji-dev |
| 旧 | soranotsuji-old | - |

### 移行後

| 環境 | リモート(GitHub) | ローカル(Mac) |
|---|---|---|
| 本番 | soranotsuji (新規作成 / GitHub Pages / soranotsuji.net) | - |
| 開発 | soranotsuji-dev (旧soranotsujiをリネーム) | soranotsuji-dev-local (新規clone) |
| 試行 | soranotsuji-sandbox (旧soranotsuji-devをリネーム) | soranotsuji-sandbox-local (旧soranotsuji-devをリネーム) |
| 旧 | soranotsuji-old | - |

---

## 前提条件

- GitHubアカウント: takeyosui15
- Mac環境にgitがインストール済み
- ローカルのsoranotsuji-devに未コミットの変更がないこと
- 作業前にローカルの変更をすべてpush済みであること

---

## 移行手順

### 注意事項
- 各ステップ完了後、チェックボックスにチェックを入れて進捗管理してください
- **ダウンタイム発生区間**: Step 3開始 〜 Step 4完了 (約5-10分)
- 作業は平日深夜や早朝など、アクセスが少ない時間帯を推奨

---

### Step 1: 事前準備

- [ ] ローカルのsoranotsuji-devで未コミットの変更がないことを確認

```bash
cd ~/soranotsuji-dev
git status
# "nothing to commit, working tree clean" であること
```

- [ ] すべてのブランチをpush済みであることを確認

```bash
git push origin --all
```

- [ ] 現在のリモートURLを記録(メモしておく)

```bash
git remote -v
# 例: origin  https://github.com/takeyosui15/soranotsuji-dev.git (fetch)
```

---

### Step 2: ローカルリポジトリのリネーム

ローカルのsoranotsuji-devを試行環境用にリネームする。

- [ ] Finderまたはターミナルでフォルダ名を変更

```bash
cd ~
mv soranotsuji-dev soranotsuji-sandbox-local
```

- [ ] リネーム後のフォルダに移動して動作確認

```bash
cd ~/soranotsuji-sandbox-local
git status
git remote -v
# まだリモートURLは旧soranotsuji-devのまま(Step 5で更新)
```

---

### Step 3: リモートリポジトリのリネーム(1) soranotsuji-dev → soranotsuji-sandbox

- [ ] GitHubでsoranotsuji-devのSettingsを開く
  1. https://github.com/takeyosui15/soranotsuji-dev にアクセス
  2. 上部メニューの **Settings** タブをクリック
  3. **General** セクションの **Repository name** を `soranotsuji-sandbox` に変更
  4. **Rename** ボタンをクリック

- [ ] リネーム完了を確認
  - https://github.com/takeyosui15/soranotsuji-sandbox にアクセスできること

---

### Step 4: リモートリポジトリのリネーム(2) soranotsuji → soranotsuji-dev

**ここからダウンタイム開始** — soranotsuji.netが一時的にアクセス不可になる。

- [ ] GitHubでsoranotsujiのSettingsを開く
  1. https://github.com/takeyosui15/soranotsuji にアクセス
  2. **Settings** タブ → **General** → **Repository name** を `soranotsuji-dev` に変更
  3. **Rename** をクリック

- [ ] リネーム完了を確認
  - https://github.com/takeyosui15/soranotsuji-dev にアクセスできること

**注意:** この時点でsoranotsuji.netのGitHub Pagesは停止する。

---

### Step 5: 新しい本番リポジトリの作成とGitHub Pages設定

ダウンタイムを最短にするため、このステップはStep 4の直後に素早く実行する。

- [ ] GitHubで新しいリポジトリ `soranotsuji` を作成
  1. https://github.com/new にアクセス
  2. Repository name: `soranotsuji`
  3. Public を選択
  4. 他のオプションはすべて未チェック(READMEなし、.gitignoreなし、ライセンスなし)
  5. **Create repository** をクリック

- [ ] soranotsuji-dev(旧soranotsuji)のコードを新しいsoranotsujiにpush

```bash
# 一時ディレクトリで作業
cd /tmp
git clone https://github.com/takeyosui15/soranotsuji-dev.git soranotsuji-temp
cd soranotsuji-temp

# リモートを新しい本番リポジトリに変更
git remote set-url origin https://github.com/takeyosui15/soranotsuji.git

# mainブランチのみpush(本番に必要なブランチのみ)
git push -u origin main

# 一時ディレクトリを削除
cd /tmp
rm -rf soranotsuji-temp
```

- [ ] CNAMEファイルの確認
  - リポジトリのルートに `CNAME` ファイルが存在し、内容が `soranotsuji.net` であることを確認
  - https://github.com/takeyosui15/soranotsuji にアクセスしてファイル一覧を確認

- [ ] GitHub Pagesを有効化
  1. https://github.com/takeyosui15/soranotsuji の **Settings** タブ
  2. 左メニューの **Pages** をクリック
  3. **Source**: Deploy from a branch
  4. **Branch**: main / /(root) を選択
  5. **Save** をクリック

- [ ] カスタムドメインの設定
  1. 同じPagesの設定画面で **Custom domain** に `soranotsuji.net` を入力
  2. **Save** をクリック
  3. DNS checkが成功することを確認(数分かかる場合あり)
  4. **Enforce HTTPS** にチェック

- [ ] soranotsuji.net にアクセスしてサイトが表示されることを確認

**ダウンタイム終了**

---

### Step 6: ローカルリポジトリのremote URL更新

- [ ] soranotsuji-sandbox-localのremote URLを更新

```bash
cd ~/soranotsuji-sandbox-local
git remote set-url origin https://github.com/takeyosui15/soranotsuji-sandbox.git
git remote -v
# origin  https://github.com/takeyosui15/soranotsuji-sandbox.git であること
git fetch origin
```

---

### Step 7: ローカル開発環境の新規作成

- [ ] soranotsuji-dev-localをclone

```bash
cd ~
git clone https://github.com/takeyosui15/soranotsuji-dev.git soranotsuji-dev-local
```

- [ ] clone成功を確認

```bash
cd ~/soranotsuji-dev-local
git remote -v
# origin  https://github.com/takeyosui15/soranotsuji-dev.git であること
git log --oneline -5
```

---

### Step 8: 旧本番リポジトリ(soranotsuji-dev)のGitHub Pages無効化

旧soranotsuji(現soranotsuji-dev)にGitHub Pagesが残っている場合は無効化する。

- [ ] https://github.com/takeyosui15/soranotsuji-dev の **Settings** → **Pages**
  - GitHub Pagesが有効な場合: Source を **None** に変更して **Save**
  - CNAMEファイルは開発環境として残しておいても問題なし(Pagesが無効なら影響なし)

---

## 移行後の確認チェックリスト

- [ ] https://soranotsuji.net にアクセスしてサイトが正常に表示される
- [ ] https://github.com/takeyosui15/soranotsuji が存在する(本番)
- [ ] https://github.com/takeyosui15/soranotsuji-dev が存在する(開発)
- [ ] https://github.com/takeyosui15/soranotsuji-sandbox が存在する(試行)
- [ ] ローカルの `~/soranotsuji-dev-local` でgit pull/pushができる
- [ ] ローカルの `~/soranotsuji-sandbox-local` でgit pull/pushができる

---

## DNS設定について

GitHub Pagesのカスタムドメインは、リポジトリ名の変更に関わらず、
DNSレコード自体は `takeyosui15.github.io` を指しているため、
**DNSレコードの変更は不要**です。

GitHubが内部的にリポジトリとドメインの紐付けを管理しているため、
新しいsoranotsujiリポジトリでGitHub Pagesを有効化してカスタムドメインを設定すれば、
既存のDNSレコードがそのまま機能します。

ただし、DNS設定を確認したい場合:
```bash
# Aレコードの確認
dig soranotsuji.net +short
# 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 のいずれか

# CNAMEレコードの確認(wwwサブドメインを使っている場合)
dig www.soranotsuji.net +short
```

---

## VSCodeでのローカルリポジトリ切り替え方法

### 方法1: フォルダを開く(最もシンプル)

1. VSCodeのメニュー: **File** → **Open Folder...**
2. 切り替えたいリポジトリのフォルダを選択
   - 開発環境: `~/soranotsuji-dev-local`
   - 試行環境: `~/soranotsuji-sandbox-local`

### 方法2: ターミナルから開く

```bash
# 開発環境を開く
code ~/soranotsuji-dev-local

# 試行環境を開く
code ~/soranotsuji-sandbox-local
```

### 方法3: マルチルートワークスペース(両方同時に開く)

1. VSCodeで **File** → **Add Folder to Workspace...** で2つ目のフォルダを追加
2. 保存: **File** → **Save Workspace As...** で `.code-workspace` ファイルとして保存

```json
// soranotsuji.code-workspace の例
{
  "folders": [
    { "path": "~/soranotsuji-dev-local", "name": "開発環境" },
    { "path": "~/soranotsuji-sandbox-local", "name": "試行環境" }
  ]
}
```

次回以降は `.code-workspace` ファイルをダブルクリックで両環境が同時に開く。

### 方法4: 最近使ったフォルダから切り替え

- ショートカット: **Ctrl+R** (Mac: **Cmd+R** ではなく **Ctrl+R**)
- 最近開いたフォルダ一覧が表示されるので、切り替え先を選択

---

## GitHubの日本語化について

GitHub公式には日本語UIは提供されていません(2026年3月現在)。
英語のみが公式サポート言語です。

### 代替手段: ブラウザ拡張機能

Chromeウェブストアで「GitHub 日本語化」などで検索すると、
コミュニティ製の翻訳拡張機能が見つかります。
代表的なものとして **GitHub-Chinese-Top-Charts** 系の翻訳拡張がありますが、
日本語版は公式には存在しないため、利用は自己責任となります。

**推奨:** GitHub操作に慣れるにつれて英語UIのまま使う方が、
ドキュメントや検索で情報を探しやすくなるため、長期的にはメリットが大きいです。
