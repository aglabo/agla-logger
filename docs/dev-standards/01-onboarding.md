---
header:
  - src: 01-onboarding.md
  - @(#): Onboarding Guide
title: agla-logger
description: 新規コントリビュータ向け開発環境セットアップガイド
version: 1.0.0
created: 2025-09-27
authors:
  - atsushifx
changes:
  - 2025-09-27: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 新規コントリビュータ向けオンボーディングガイド

`agla-logger` プロジェクトへの参加を歓迎します。
このガイドでは、開発環境のセットアップから初回コントリビューションまでの手順を説明します。

## 1. プロジェクト参加準備

### 1.1 GitHubアカウント設定

#### 前提条件

- GitHub アカウントが必要
- Git がローカルにインストール済み
- SSH キーまたは Personal Access Token の設定済み

### 1.2 リポジトリのfork

```bash
# GitHubでagla-loggerリポジトリをfork
# https://github.com/atsushifx/agla-logger → "Fork" ボタンをクリック
```

### 1.3 ローカルへのclone

```bash
# 自分のforkリポジトリをclone
git clone git@github.com:[YOUR_USERNAME]/agla-logger.git
cd agla-logger

# upstream リモートを追加
git remote add upstream git@github.com:atsushifx/agla-logger.git

# リモート確認
git remote -v
# origin    git@github.com:[YOUR_USERNAME]/agla-logger.git (fetch)
# origin    git@github.com:[YOUR_USERNAME]/agla-logger.git (push)
# upstream  git@github.com:atsushifx/agla-logger.git (fetch)
# upstream  git@github.com:atsushifx/agla-logger.git (push)
```

### 1.4 開発ブランチのcheckout

```bash
# mainブランチから最新を取得
git checkout main
git pull upstream main

# 開発用ブランチを作成・checkout
git switch -c feature/your-feature-name

# ブランチ確認
git branch
# * feature/your-feature-name
#   main
```

## 2. 開発環境セットアップ

### 2.1. Volta環境 (Node.js/pnpm管理)

#### Voltaのインストール

**Windows (PowerShell):**

```bash
# Voltaインストール
winget install Volta.Volta --location c:\app\develop\volta --interactive

# または、公式サイトから手動インストール
# https://volta.sh/
```

**macOS/Linux:**

```bash
# Voltaインストール
curl https://get.volta.sh | bash

# シェルを再起動またはsource
source ~/.bashrc  # or ~/.zshrc
```

#### Node.js/pnpmのインストール

```bash
# プロジェクトディレクトリでVoltaが自動的にNode.js/pnpmをインストール
cd agla-logger

# バージョン確認
volta list
node --version   # v20.x.x 系
pnpm --version   # 9.x.x 系
```

### 2.2 開発ツールのインストール

```bash
# Windows PowerShell（管理者権限で実行）
.\scripts\install-dev-tools.ps1
```

インストールされるツール:

- `dotenvx` - 環境変数マネージャー
- `lefthook` - Git Hook マネージャー
- lint ツール (`commitlint`, `cspell` など)
- Claude Code (コーディング AI エージェント)
- Codex (コーディング AI エージェント)
- Git 関連ツール
- その他必要な開発ツール

### 2.3 ドキュメントツールのインストール

```bash
# Windows PowerShell（管理者権限で実行）
.\scripts\install-doc-tools.ps1
```

インストールされるツール:

- `textlint`: テキスト校正ツール (各種リントルールを含む)
- `markdownlint-cli2`: :マークダウンリントツール

### 2.4 APIキー設定

`dotenvx`を使用して、環境変数'OPENAI_API_KEY'に`ChatGPT`の API キーを設定します。

```bash
dotenvx set OPENAI_API_KEY 'sk-proj-012abc...'
```

> 作成された `.env`, `.env.keys` を公開しないでください

### 2.5 MCP設定

#### MCPサーバのインストール

**codex** は開発ツールとしてインストール済みです。

**lsmcp** と **serena-mcp** は個別にインストールが必要です:

#### `lsmcp`のインストール

以下のコマンドを実行:

1. `lsmcp`のインストール:

   ```bash
   pnpm add -g @mizchi/lsmcp
   ```

2. `lsmcp`の動作確認:

   ```bash
   lsmcp -p typescript
   ```

   > 起動が確認できたら、`Ctrl+C`でプロンプトに戻る

#### `serena-mcp`のインストール

1. `Python`のインストール:

   ```bash
   winget install Python.Python.3.13 --location C:\lang\python\ --interactive
   ```

2. `uv`のインストール:

   ```bash
   pip3 install uv
   ```

3. `serena-mcp`の動作確認:

   ```bash
   uvx --from git+https://github.com/oraios/serena.git serena start-mcp-server --context ide-assistant --project .
   ```

   > 起動が確認できたら、`Ctrl+C`でプロンプトに戻る

#### MCP設定ファイル

`.mcp.json`を設定:

```json
// src: .mcp.json
{
  "mcpServers": {
    "lsmcp": {
      "type": "stdio",
      "command": "lsmcp",
      "args": [
        "-p",
        "typescript"
      ]
    },
    "serena-mcp": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide-assistant",
        "--project",
        "."
      ],
      "env": {}
    },
    "codex-mcp": {
      "type": "stdio",
      "command": "codex",
      "args": [
        "mcp"
      ],
      "env": {}
    }
  }
}
```

### 2.6 VSCode推奨設定

#### 推奨拡張機能

`.vscode/extensions.json` で定義された拡張機能を自動インストール:

- TypeScript 関連
- ESLint/Prettier
- テスト関連
- Git 関連
- ドキュメント関連

#### 設定ファイル

`.vscode/settings.json` により自動設定:

- フォーマッタ設定
- リント設定
- デバッグ設定

## 3. プロジェクト固有設定

### 3.1 依存関係インストール

```bash
# モノレポ全体の依存関係をインストール
pnpm install

# インストール確認
pnpm list --depth 0
```

出力例:

```bash
@aglabo-monorepo/ag-logger@0.0.1 C:\Users\atsushifx\workspaces\develop\agla-logger (PRIVATE)

devDependencies:
@commitlint/config-conventional 19.8.1              eslint 9.36.0
@commitlint/types 19.8.1                            eslint-import-resolver-typescript 4.4.4
@eslint/js 9.36.0                                   eslint-plugin-import 2.32.0
```

### 3.2. モノレポ構造の理解

`agla-logger`は、以下の型式のモノレポになっています。

```bash
agla-logger/
  ├─ aggregator/                # アグリゲータ (公開用パッケージ)
  │   └─ @aglabo/               # 公開用メインパッケージ群
  │       ├─ agla-logger/       # 構造化ロガー (含む、エラーハンドリング)
  │       └─ agla-error/        # エラーハンドリング
  ├─ packages/
  │   └─ @aglabo/               # メインパッケージ群
  │       ├─ agla-logger-core/  # 構造化ロガー
  │       └─ agla-error-core/   # エラーハンドリング
  ├─ base/
  │   └─ configs/               # パッケージ用ベース設定
  ├─ docs/                      # ドキュメント
  ├─ configs/                   # 共有設定
  └─ scripts/                   # 開発スクリプト
```

### 3.3. 環境変数・設定ファイル

#### 必要な設定ファイル

- `.env` # `CodeGPT`の`OPENAI_API_KEY`設定用に作成
- `.env.keys` # `dotenvx`の秘密鍵保持ファイル (公開不可)
- ローカル設定ファイル

```bash
# 設定ファイルテンプレートがある場合
cp .env.example .env.local
```

### 3.4. lefthook (pre-commit) 設定

```bash
# lefthookインストール・設定
lefthook install

# 設定確認
lefthook version
```

## 4. 動作確認

### 4.1. ビルド確認

```bash
# 全パッケージビルド
pnpm run build

# 成功メッセージ確認
'build completed successfully'
```

### 4.2. テスト実行

```bash
# 全テスト実行
pnpm run test:all


`All tests passed`
```

### 4.3. 品質チェック

```bash
# 型チェック
pnpm run check:types

# リント確認
pnpm run lint-all

# フォーマット確認
pnpm run check:dprint

# 全て成功することを確認
```

### 4.4. Claude Code連携テスト

#### MCP接続確認

`/mcp`コマンドで MCP が動作していることを確認。

```bash
claude mcp list
```

出力例:

<!-- markdownlint-disable line-length -->

```bash
Checking MCP server health...

lsmcp: lsmcp -p typescript - ✓ Connected
serena-mcp: uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project . - ✓ Connected
codex: codex mcp - ✓ Connected
```

<!-- markdownlint-enable -->

#### オンボーディング

Claude Code 上のプロンプトで、以下のプロンプトを実行:

```bash
> lsmcp用にオンボーディングを実行
> serena-mcp用にオンボーディングを実行
```

#### プロジェクトの確認

`claude`上で、以下のプロンプトを入力:

```bash
> 現在のプロジェクトの概要を教えて
```

出力例:

```bash
 🎯 プロジェクトの目的

  @aglabo/agla-logger - TypeScript用の軽量でプラガブルな構造化ロガー

  主要機能

  - ログレベル管理 (TRACE → DEBUG → VERBOSE → INFO → WARN → ERROR → FATAL)
  - 柔軟なフォーマッティングオプション
  - プラグインシステム (フォーマッタ・ロガー)
  - ESM/CommonJS デュアルサポート
  - 包括的エラーハンドリング (AglaError統合)
```

## 5. 初回コントリビューション

### 5.1. issueの選び方

1. [GitHub Issues](https://github.com/atsushifx/agla-logger/issues) を確認
2. `good first issue` ラベルの付いた issue を選択
3. `issue` にコメントして担当宣言

### 5.2. ブランチ戦略

ブランチは、以下の型式で作成します。

```bash
git switch -c <category>-<id>/<scope>>/<topic>
```

| セグメント | 例                         | 説明                                     |
| ---------- | -------------------------- | ---------------------------------------- |
| `category` | `docs`, `feat`, `fix`, ... | 作業種別 (拡張Conventional Commitに準拠) |
| `id`       | `23`                       | `issue`やタスクの番号                    |
| `scope`    | `agla-logger`              | 作業対象のモジュール・パッケージ・領域   |
| `topic`    | `rewrite-dev-standards`    | 作業内容や目的をスラッグ形式で簡潔に記述 |

> ブランチ戦略の詳しい説明は、[Git Flow ベースのブランチ戦略](04-branch-strategy.md)を参照してください。

### 5.3. 開発フロー

1. BDD テスト駆動開発: [開発ワークフロー](02-development-workflow.md)に従う
2. Claude Code 活用: 効果的な指示で AI 支援を活用
3. 品質ゲート: 実装完了前に 5 項目チェック実行

### 5.4. 最初のPR作成手順

```bash
# 変更をコミット
git add .
git commit -m "feat: implement basic logging functionality

- Add AgLogger class with basic methods
- Implement console output formatter
- Add unit tests for core functionality

Fixes #123"

# フォーク先にプッシュ
git push origin feature/issue-number-short-description
```

#### Pull Request作成

1. GitHub で Pull Request を作成
2. テンプレートに従って詳細を記入
3. レビュー依頼

> PR作成ルールの詳細は、[プルリクエスト作成ルール](05-pull-request-rules.md) を参照してください。

### 5.5. レビュープロセス理解

#### レビュー観点

- コード品質: ESLint/TypeScript 規約遵守
- テスト: BDD 構造・カバレッジ確認
- ドキュメント: PR による機能の変更などに応じて更新
- 互換性: 既存機能への影響確認

#### レビュー対応

- フィードバックへの迅速な対応
- 修正後の再テスト実行
- レビュアーとの建設的な議論

## 6. トラブルシューティング

### 6.1. よくある問題と解決方法

#### pnpm install でエラー

前回のインストールで失敗した可能性があります、キャッシュや`node_modules`を削除して再インストールを試してください。

```bash
# キャッシュクリア
pnpm store prune

# node_modules削除後再インストール
rm -rf node_modules
pnpm install
```

#### TypeScript型エラー

型定義を再生成して、再度、型チェックしてみてください。

```bash
# 型定義再生成
pnpm run build:types

# 型チェック詳細表示
pnpm run check:types --verbose
```

#### テスト失敗

該当したテストに応じて、コードをデバッグします。

```bash
# 特定テストのみ実行
pnpm exec vitest run src/__tests__/specific.spec.ts

# ウォッチモードでデバッグ
pnpm exec vitest --watch
```

#### Claude Code接続問題

1. Claude Code 再起動
2. MCP 設定確認
3. プロジェクト再読み込み

### 6.2. サポート連絡先

#### 質問・相談

- GitHub Discussions: 技術的な質問・議論
- GitHub Issues: バグ報告・機能要望
- プロジェクトメンテナー: [@atsushifx](https://github.com/atsushifx)

<!-- textlint-disable ja-hiraku -->

#### 緊急時

- セキュリティ問題: <mailto:atsushifx@gmail.com>
- その他緊急事項: GitHub Issue で `urgent` ラベル

### 6.3. 追加リソース

#### 学習資料

- [プロジェクト概要](../projects/00-project-overview.md)
- [アーキテクチャガイド](../projects/01-architecture.md)
- [コーディング規約](08-coding-conventions.md)
- [品質保証](06-quality-assurance.md)

#### 外部リソース

- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Vitest公式ドキュメント](https://vitest.dev/)
- [pnpm公式ドキュメント](https://pnpm.io/)
- [Claude Code公式ドキュメント](https://docs.claude.com/en/docs/claude-code)

---

## 次のステップ

オンボーディング完了後は。以下のドキュメントを参照して開発を開始してください。

1. [開発ワークフロー](13-bdd-test-hierarchy.md): BDD 開発手法の詳細
2. [コーディング規約](08-coding-conventions.md): コード記述ルール
3. [プロジェクトロードマップ](../projects/02-roadmap.md): 開発計画・優先度

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
