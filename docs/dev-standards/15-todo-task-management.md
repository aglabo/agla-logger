---
header:
  - src: 15-todo-task-management.md
  - @(#): TODO Task Management - DEPRECATED
title: agla-logger
description: 【廃止予定】TODO タスク管理ルール - Claude Code内蔵TodoWrite機能に移行
version: 1.0.0
created: 2025-09-22
deprecated: 2025-09-27
authors:
  - atsushifx
changes:
  - 2025-09-22: 初版作成
  - 2025-09-27: 廃止予定、Claude Code TodoWrite機能に移行
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 🚨 廃止予定通知

このドキュメントは **廃止予定** です。

### 移行先

タスク管理機能は以下に移行されました:

- **AIエージェント**: Claude CodeのTodoWriteツール内蔵機能を使用
- **開発者**: 通常のプロジェクト管理ツール (GitHub Issues, Jira等) を使用

### 移行理由

1. **機能の内蔵化**: Claude CodeにTodoWrite機能が標準搭載
2. **リアルタイム性**: セッション内でのタスク追跡が可能
3. **統合性**: 開発フローとの密結合

### AIエージェント向けガイダンス

タスク管理の詳細は以下を参照:

- [for-AI-dev-standards/01-core-principles.md](../for-AI-dev-standards/01-core-principles.md) - タスク完了基準
- Claude Code TodoWriteツールの活用

新しい開発タスクは、上記の方法で管理してください。

## 1. 🎯 基本方針

### サブフェーズ分割原則

**大規模フェーズは2-5ファイル単位のサブフェーズに分割し、管理しやすい作業単位を維持する。**

- 最適サブフェーズサイズ: 2-5ファイル
- 最大許容サイズ: 6ファイル (例外的)
- 分割基準: ファイル種別・機能領域・依存関係

## 2. 📝 サブフェーズ構成テンプレート

### 基本構造

````markdown
#### Phase [番号][サブ記号]: [カテゴリ名] ([ファイル数]ファイル)

**対象ファイル:**

- [ ] `path/to/file1.spec.ts`
- [ ] `path/to/file2.spec.ts`
- [ ] `path/to/file3.spec.ts`

**実装内容:**

-
-

**完了条件:**

- [ ] 全ファイルでBDD階層構造統一完了
- [ ] JSDoc付与完了 (TOPレベル・セカンドレベル)
- [ ] ケース種別タグ付与完了 ([正常]/[異常]/[エッジケース])

**エラーチェック (必須) :**

```bash
pnpm run check:types
pnpm run lint:all
pnpm run test:all
pnpm run check:dprint
```
````

**完了確認:**

- [ ] 全エラーチェックPASS
- [ ] コードレビュー完了

````
### サブフェーズ分類パターン

#### パターンA: ファイル種別分割
```markdown
Phase 2a: Console Output Core (2ファイル)
Phase 2b: Console Output Formatter (3ファイル)
````

#### パターンB: 機能領域分割

```markdown
Phase 3a: Logger Plugins (2ファイル)
Phase 3b: Logger Manager (2ファイル)
```

#### パターンC: 複雑度分割

```markdown
Phase 4a: Simple Utils (3ファイル)
Phase 4b: Complex Components (2ファイル)
```

## 3. 🔧 エラーチェック必須手順

### サブフェーズ完了時の必須実行

**順序厳守で以下4コマンドを実行:**

```bash
# 1. 型チェック (最優先) 
pnpm run check:types

# 2. コード品質チェック
pnpm run lint:all

# 3. テスト実行 (全層) 
pnpm run test:all

# 4. フォーマットチェック
pnpm run check:dprint
```

### エラー処理ルール

```markdown
**エラー発生時の対応:**

1. 型エラー: 即座修正 (作業継続禁止)
2. リントエラー: 次サブフェーズ前に修正
3. テストエラー: 該当ファイル即座修正
4. フォーマットエラー: `pnpm run format:dprint`で自動修正
```

## 4. 📊 進捗管理テンプレート

### 進捗トラッキング

```markdown
## 📈 進捗管理

### 全体進捗

- Phase 1: E2Eテスト (8ファイル) - ✅ 完了
- Phase 2: Console Output (6ファイル)
  - Phase 2a: Core (2ファイル) - 🔄 実行中
  - Phase 2b: Formatter (3ファイル) - ⏳ 待機中
  - Phase 2c: Advanced (1ファイル) - ⏳ 待機中
- Phase 3: [詳細]
- Phase 4: [詳細]

### 品質メトリクス

| フェーズ | ファイル数 | JSDoc付与率 | BDD形式率 | エラー数 |
| -------- | ---------- | ----------- | --------- | -------- |
| Phase 1  | 8          | 100%        | 100%      | 0        |
| Phase 2a | 2          | 50%         | 75%       | 3        |

### 完了基準チェックリスト

#### Phase [番号] 完了確認

- [ ] BDD階層構造: 3階層厳守・4階層完全排除
- [ ] JSDoc統一: TOPレベル (@suite) ・セカンドレベル (@context) 完了
- [ ] ケース種別タグ: 全it文で[正常]/[異常]/[エッジケース]付与
- [ ] 品質ゲート: 4コマンド全てPASS
- [ ] コードレビュー: 品質・一貫性確認完了
```

## 5. ⚠️ 重要ルール・制約事項

### 必須遵守事項

1. **サブフェーズ完了時のエラーチェック必須実行**
   - 4コマンド (check:types, lint:all, test:all, check:dprint)
   - エラー発生時の即座対応

2. **ファイル数制限**
   - 2-5ファイル/サブフェーズ (最適)
   - 6ファイル超過禁止

3. **階層構造厳守**
   - BDD 3階層 (Suite → Context → Specification)
   - 4階層以上完全禁止

### 禁止事項

1. **エラーチェック省略** - サブフェーズ完了時必須
2. **大規模サブフェーズ作成** - 管理困難・品質低下
3. **BDD階層ルール違反** - プロジェクト一貫性破綻

## 6. 🛠️ 実装フロー

### Step 1: サブフェーズ設計

```bash
# ファイル調査
mcp__serena-mcp__list_dir --relative_path "[対象ディレクトリ]" --recursive true

# ファイル分析
mcp__serena-mcp__get_symbols_overview --relative_path "[対象ファイル]"
```

### Step 2: 作業実行

1. **BDD階層構造統一**
2. **JSDoc付与** (@suite, @context)
3. **ケース種別タグ付与** ([正常]/[異常]/[エッジケース])

### Step 3: 品質確認

```bash
# 必須4コマンド実行
pnpm run check:types && \
pnpm run lint:all && \
pnpm run test:all && \
pnpm run check:dprint
```

### Step 4: 進捗更新

- [ ] 進捗チェックリスト更新
- [ ] 品質メトリクス記録
- [ ] 次サブフェーズ準備

## 7. 📝 ドキュメント統合

### 関連ルール文書

- **[BDD階層構造ルール](./bdd-test-hierarchy.md)** - テスト階層・Given/When/Then形式
- **[JSDoc describeブロックルール](./jsdoc-describe-blocks.md)** - JSDocテンプレート・タグ定義

### 品質保証システム

- 型安全性: TypeScript strict mode
- コード品質: ESLint + dprint
- テスト品質: 4層テスト戦略
- 構造品質: BDD階層統一

---

重要: このルールはプロジェクトの**効率性・品質・一貫性**確保のため必須遵守。

参照: [AGENTS.md コードックス開発者ガイド](../AGENTS.md)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
