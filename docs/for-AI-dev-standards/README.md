---
header:
  - src: README.md
  - @(#): AI Development Standards
title: agla-logger
description: AI コーディングエージェント専用開発標準・実装ルール集
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

## AI開発標準ディレクトリ

このディレクトリは Claude Code などのAIコーディングエージェント専用の開発標準・実装ルールを集約しています。
トークン効率的で実践的なAI開発支援を目的とします。

### 重要事項

🔴 **必須**: このディレクトリの内容はAIエージェント専用です
🔴 **必須**: すべての開発段階でMCPツール (lsmcp, serena-mcp) を積極活用
🔴 **必須**: BDD開発プロセス (Red-Green-Refactor) の厳格遵守

### ドキュメント構成

#### 1. 基本原則・開発プロセス

- [01-core-principles.md](01-core-principles.md) - AI開発の核心原則・MCP必須ルール
- [02-bdd-workflow.md](02-bdd-workflow.md) - BDD開発フロー・Red-Green-Refactorサイクル
- [03-bdd-implementation-details.md](03-bdd-implementation-details.md) - atsushifx式BDD実装ガイド詳細

#### 2. ツール・技術活用

- [04-mcp-tools-usage.md](04-mcp-tools-usage.md) - MCPツール完全活用ガイド
- [05-code-navigation.md](05-code-navigation.md) - プロジェクトナビゲーション・コード検索
- [06-quality-assurance.md](06-quality-assurance.md) - AI用品質ゲート・自動チェック

#### 3. 実装・規約

- [07-coding-conventions.md](07-coding-conventions.md) - コーディング規約・MCP活用パターン
- [08-test-implementation.md](08-test-implementation.md) - テスト実装・BDD階層構造
- [09-setup-and-onboarding.md](09-setup-and-onboarding.md) - AI開発環境セットアップ

#### 4. テンプレート・標準

- [10-templates-and-standards.md](10-templates-and-standards.md) - ソースコードテンプレート・JSDocルール

### 使用方法

#### 開発開始前

1. [01-core-principles.md](01-core-principles.md) で基本原則を確認
2. [09-setup-and-onboarding.md](09-setup-and-onboarding.md) で環境セットアップ
3. [04-mcp-tools-usage.md](04-mcp-tools-usage.md) でMCPツール使用法を習得

#### 実装時

1. [02-bdd-workflow.md](02-bdd-workflow.md) でBDDサイクル実行
2. [03-bdd-implementation-details.md](03-bdd-implementation-details.md) で詳細実装ガイド確認
3. [05-code-navigation.md](05-code-navigation.md) でプロジェクト理解
4. [07-coding-conventions.md](07-coding-conventions.md) で規約遵守

#### 品質確認時

1. [06-quality-assurance.md](06-quality-assurance.md) で品質ゲート実行
2. [08-test-implementation.md](08-test-implementation.md) でテスト検証

### プロジェクト理解

agla-logger は TypeScript 用軽量・プラガブルロガーです:

- ESM-first + CommonJS 互換性
- pnpm ワークスペース使用のモノレポ
- 4層テスト戦略 (Unit/Functional/Integration/E2E)
- AglaError フレームワーク統合

### 主要パッケージ

```bash
packages/@aglabo/
├── agla-logger-core/  # 構造化ロガーパッケージ
└── agla-error-core/   # エラーハンドリングフレームワーク
```

### 必須コマンド

```bash
# 型チェック (最優先)
pnpm run check:types

# 4層テストシステム
pnpm run test:develop    # 開発用テスト
pnpm run test:ci         # 全テスト実行

# 品質確認
pnpm run lint:all        # リント
pnpm run check:dprint    # フォーマット
pnpm run build           # ビルド
```

---

### See Also

- [../docs/dev-standards/16-ai-assisted-development.md](../docs/dev-standards/16-ai-assisted-development.md) - 開発者向けAI使用ガイド
- [../docs/projects/00-project-overview.md](../docs/projects/00-project-overview.md) - プロジェクト全体概要
- [../CLAUDE.md](../CLAUDE.md) - 総合開発ガイド

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
