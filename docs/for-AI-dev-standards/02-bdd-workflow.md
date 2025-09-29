---
header:
  - src: 02-bdd-workflow.md
  - @(#): BDD Development Workflow
title: agla-logger
description: AIコーディングエージェント向けBDD開発フロー・Red-Green-Refactorサイクル
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

## BDD開発フロー詳細

このドキュメントはAIコーディングエージェントがagla-loggerプロジェクトでBDD (Behavior-Driven Development) 開発を実行する際の詳細手順を定義します。
Red-Green-Refactorサイクルの厳格遵守とMCPツール活用を基盤とします。

## BDD開発手法 (atsushifx式)

### 基本原則

🔴 **必須**: コーディングエージェントに対応した具体的かつ詳細なBDDによって、高い品質を保持して開発

- 1 message = 1 test の原則厳守
- MCP ツールによる既存パターン理解・実装
- RED/GREEN 確認: 次のステップに進む前の必須確認

#### BDDサイクル

```
1. 失敗するテスト記述 (RED)
   ↓
2. テスト通過する最小コード実装 (GREEN)
   ↓
3. コード品質向上・最適化 (REFACTOR)
   ↓
4. 次のテストで繰り返し
```

### MCPツール活用による効率化

🔴 **必須**: 全フェーズでMCPツール (lsmcp, serena-mcp) を積極活用

```bash
# Phase 0: 既存コード理解 (MCPツール必須)
mcp__lsmcp__get_project_overview --root "$ROOT"
mcp__serena-mcp__find_symbol --name_path "関連機能" --include_body false
mcp__serena-mcp__search_for_pattern --substring_pattern "テストパターン"
```

## 実装フロー詳細

### Phase 1: テスト駆動設計 (RED)

#### 1.1. 既存パターン調査

```bash
# 関連テストファイルの検索
mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*機能名"
mcp__serena-mcp__find_symbol --name_path "テストスイート名" --depth 1
```

#### 1.2. テスト記述

🔴 **必須**: 3階層BDD構造の厳格適用

```typescript
// Given/Feature レベル (describe)
describe('機能名', () => {
  // When レベル (describe)
  describe('条件・操作', () => {
    // Then レベル (it/test)
    test('期待結果', () => {
      // テスト実装
    });
  });
});
```

#### 1.3. RED確認

```bash
# テスト実行でRED状態確認
pnpm run test:develop [テストファイル名]
```

### Phase 2: 最小実装 (GREEN)

#### 2.1. 実装パターン調査

```bash
# 類似実装の検索
mcp__serena-mcp__find_symbol --name_path "類似機能" --include_body true
mcp__lsmcp__lsp_find_references --symbolName "参考関数"
```

#### 2.2. 最小コード実装

- テスト通過に必要な最小限の実装
- エラーハンドリングは後回し
- パフォーマンス最適化は後回し

#### 2.3. GREEN確認

```bash
# テスト通過確認
pnpm run test:develop [テストファイル名]
```

### Phase 3: リファクタリング・品質確認

#### 3.1. コード品質向上

```bash
# 影響範囲確認
mcp__serena-mcp__find_referencing_symbols --name_path "変更シンボル"
mcp__lsmcp__lsp_get_diagnostics --relativePath "実装ファイル"
```

#### 3.2. 品質ゲート実行

```bash
pnpm run check:types      # 型安全性確認
pnpm run lint:all         # コード品質確認
pnpm run check:dprint     # フォーマット確認
pnpm run test:develop     # テスト確認
pnpm run build            # ビルド確認
```

## 4層テスト戦略

### テスト階層アーキテクチャ

```bash
__tests__/
├── unit/           # Unit tests (27ファイル)
├── functional/     # Functional tests (4ファイル)
├── integration/    # Integration tests (14ファイル)
└── e2e/           # E2E tests (8ファイル)
```

### テスト実行コマンド体系

```bash
# 開発用高速テスト
pnpm run test:develop     # Unit + Functional (重点)

# 包括的テスト
pnpm run test:ci          # Integration含む全テスト
pnpm run test:e2e         # E2Eテスト個別実行

# 対象別テスト
pnpm run test:unit        # Unitテスト専用
pnpm run test:functional  # Functionalテスト専用
pnpm run test:integration # Integrationテスト専用
```

## BDD階層構造統一ルール

### 3階層BDD構造の厳格遵守

🔴 **必須**: 以下の階層構造を必ず適用

```typescript
describe('Given: 前提条件/Feature', () => {
  describe('When: 条件/動作', () => {
    test('Then: 期待結果', () => {
      // Arrange (Given詳細)
      // Act (When詳細)
      // Assert (Then詳細)
    });
  });
});
```

### 階層命名規則

- **Level 1 (Feature)**: `"機能名"` または `"Given: 前提条件"`
- **Level 2 (Context)**: `"When: 動作・条件"`
- **Level 3 (Specification)**: `"Then: 期待結果"`

### JSDoc必須記述

```typescript
/**
 * @fileoverview 機能名のテストスイート
 * @context Given - 前提条件の説明
 */

describe('機能名', () => {
  /**
   * @context When - 動作・条件の説明
   */
  describe('When: 動作', () => {
    /**
     * @context Then - 期待結果の説明
     */
    test('Then: 結果', () => {
      // テスト実装
    });
  });
});
```

## MCPツール活用パターン

### 開発開始時

```bash
# プロジェクト理解
mcp__lsmcp__get_project_overview --root "$ROOT"
mcp__lsmcp__search_symbols --query "関連機能名"

# 既存パターン調査
mcp__serena-mcp__get_symbols_overview --relative_path "src/対象ディレクトリ"
mcp__serena-mcp__find_symbol --name_path "関連クラス" --depth 1
```

### 実装中

```bash
# 参考実装検索
mcp__serena-mcp__search_for_pattern --substring_pattern "実装パターン"
mcp__lsmcp__lsp_get_definitions --symbolName "参照シンボル"

# 型情報確認
mcp__lsmcp__lsp_get_hover --textTarget "型名"
```

### 完了前

```bash
# 影響範囲確認
mcp__serena-mcp__find_referencing_symbols --name_path "変更シンボル"
mcp__lsmcp__lsp_get_diagnostics --relativePath "変更ファイル"

# 品質確認
mcp__lsmcp__lsp_format_document --relativePath "変更ファイル"
```

## 開発ベストプラクティス

### 実装時の推奨パターン

```bash
1. 既存コード理解 → MCPツールで構造・パターン分析
2. テスト作成 → 既存テストパターンを参考にBDD構造で記述
3. 最小実装 → テスト通過に必要な最小限のコード実装
4. リファクタリング → コード品質向上・パフォーマンス改善
5. 影響範囲確認 → MCPツールで参照先・依存関係チェック
```

### 品質保証必須事項

- TypeScript型エラーの完全解決
- テスト失敗時の原因分析・修正
- リント警告の修正またはルール除外理由の明記
- 実装変更時の既存機能への影響確認

---

### See Also

- [01-core-principles.md](01-core-principles.md) - AI開発核心原則
- [03-mcp-tools-usage.md](03-mcp-tools-usage.md) - MCPツール完全ガイド
- [05-quality-assurance.md](05-quality-assurance.md) - 品質ゲート詳細

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
