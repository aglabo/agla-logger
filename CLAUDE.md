# ag-logger モノレポ開発ガイド

このファイルは、Claude Code (claude.ai/code) がag-loggerモノレポでの作業時に参照する総合ガイドです。

## 📋 目次・ドキュメント構成

すべての詳細情報は体系化された `docs/claude/` ディレクトリに整理されています：

### 🚀 基本情報・概要

- **[01-project-overview.md](docs/claude/01-project-overview.md)** - プロジェクト全体概要・パッケージ構造
- **[02-architecture-complete.md](docs/claude/02-architecture-complete.md)** - 技術アーキテクチャ・設計パターン

### 🛠️ 開発プロセス・手順

- **[03-development-workflow.md](docs/claude/03-development-workflow.md)** - BDD開発フロー・実装手順
- **[04-coding-conventions.md](docs/claude/04-coding-conventions.md)** - コーディング規約・ベストプラクティス
- **[05-command-reference.md](docs/claude/05-command-reference.md)** - 開発コマンド完全リファレンス

### 🔍 品質保証・テスト

- **[06-quality-assurance.md](docs/claude/06-quality-assurance.md)** - 多層品質保証システム
- **[07-project-roadmap.md](docs/claude/07-project-roadmap.md)** - プロジェクトロードマップ・未了タスク

### 🔧 専門技術・高度な機能

- **[08-plugin-system-guide.md](docs/claude/08-plugin-system-guide.md)** - プラグインシステム詳細ガイド
- **[09-type-system-reference.md](docs/claude/09-type-system-reference.md)** - TypeScript型システムリファレンス
- **[10-symbol-map-navigation.md](docs/claude/10-symbol-map-navigation.md)** - シンボルマップ・コードナビゲーション

### 📚 ユーティリティ・ツール

- **[11-utility-functions.md](docs/claude/11-utility-functions.md)** - ユーティリティ関数カタログ
- **[12-mcp-tools-mandatory.md](docs/claude/12-mcp-tools-mandatory.md)** - **🔴必須: MCP ツール使用要件**
- **[13-code-navigation-commands.md](docs/claude/13-code-navigation-commands.md)** - コードナビゲーション・MCPコマンド

## ⚡ クイックスタート

### 最重要情報（開発開始前必読）

1. **[MCPツール必須使用](docs/claude/12-mcp-tools-mandatory.md)** 🔴
   - **すべての開発作業でlsmcp・serena-mcpの使用が必須**
   - コード理解・実装・テスト・デバッグの全段階で活用

2. **[BDD開発プロセス](docs/claude/03-development-workflow.md)**
   - Red-Green-Refactorサイクルの厳格遵守
   - 1 message = 1 testの原則

3. **[品質ゲート](docs/claude/06-quality-assurance.md)**
   - コミット前の必須チェック5項目
   - lefthookによる自動品質保証

### 必須コマンドセット

```bash
# 型チェック（最優先）
pnpm run check:types

# コード品質
pnpm run lint:all

# フォーマット
pnpm run check:dprint

# テスト実行
pnpm run test:develop

# ビルド確認
pnpm run build
```

## 🏗️ プロジェクト概要（要約）

### 基本情報

- **プロジェクト**: ag-logger - TypeScript用軽量・プラガブルロガー
- **アーキテクチャ**: pnpmワークスペース使用のモノレポ
- **現在フォーカス**: AglaErrorフレームワークへの移行

### パッケージ構成

```
packages/
└── @aglabo/             # メインパッケージ群
    ├── agla-logger/     # 構造化ロガーパッケージ
    └── agla-error/      # エラーハンドリングフレームワーク
```

### 技術スタック

- **ESM-first** + CommonJS互換性
- **デュアルビルド**: `lib/` (CJS), `module/` (ESM)
- **TypeScript厳格モード** + 包括的型定義
- **4層テスト戦略**: Unit/Functional/Integration/E2E

## 🎯 重要な開発ルール

### ファイル編集制限

- ❌ **編集禁止**: `lib/`, `module/`, `maps/`, `.cache/`, `node_modules/`
- ✅ **編集対象**: `src/`, `configs/`, `__tests__/`, `tests/`

### セキュリティ必須事項

- 🔒 機密情報（APIキー・パスワード）のコード記述禁止
- 🔒 機密情報のログ出力禁止
- 🔒 secretlint・gitleaksによる自動検出

### MCPツール必須活用

- 🔴 **必須**: すべての開発段階でMCPツール使用
- 🔴 **必須**: コード理解・パターン調査・影響範囲確認
- 🔴 **必須**: 実装前の既存パターン研究

## 📊 現在の状況・優先事項

### 最高優先度（Critical）

1. **AglaError型システム完成**: 型安全性・整合性向上
2. **テスト最適化**: 実行時間短縮・カバレッジ向上

### 完了済み主要マイルストーン ✅

- AglaError基本実装完了
- ドキュメント体系化完了（13ファイル作成）
- 品質保証システム確立
- パッケージ構造の最適化（@aglabo統一）

## 🔍 詳細情報へのアクセス

各トピックの詳細は対応するドキュメントファイルを参照してください：

- **開発を始める前** → [MCPツール必須要件](docs/claude/12-mcp-tools-mandatory.md)
- **プロジェクト全体を理解したい** → [プロジェクト概要](docs/claude/01-project-overview.md)
- **実装を始める** → [開発ワークフロー](docs/claude/03-development-workflow.md)
- **品質を確保したい** → [品質保証システム](docs/claude/06-quality-assurance.md)
- **コマンドを確認したい** → [コマンドリファレンス](docs/claude/05-command-reference.md)
- **コード規約を確認したい** → [コーディング規約](docs/claude/04-coding-conventions.md)
- **高度な機能を使いたい** → [プラグインシステム](docs/claude/08-plugin-system-guide.md)
- **型システムを理解したい** → [型システムリファレンス](docs/claude/09-type-system-reference.md)
- **効率的にナビゲートしたい** → [シンボルマップ](docs/claude/10-symbol-map-navigation.md)
- **タスクを確認したい** → [プロジェクトロードマップ](docs/claude/07-project-roadmap.md)

---

**🎯 開発成功の鍵**: MCPツールの活用 + 体系化されたドキュメントの参照 + 品質ゲートの遵守
