# @aglabo/agla-logger パッケージガイド

このファイルは、Claude Code (claude.ai/code) が@aglabo/agla-loggerパッケージでの作業時に参照するガイドです。

## 📋 完全ドキュメント参照

**詳細な情報はプロジェクトルートの体系化されたドキュメントを参照してください：**

### プロジェクトルートのドキュメント体系

プロジェクト全体の詳細情報は `../../../docs/` に体系化されています：

#### 🔴 必須: 開発開始前確認

- **[docs/rules/04-mcp-tools-mandatory.md](../../../docs/rules/04-mcp-tools-mandatory.md)** - **MCPツール必須使用要件**
- **[docs/rules/01-development-workflow.md](../../../docs/rules/01-development-workflow.md)** - BDD開発フロー・実装手順

#### 🚀 基本情報・概要

- **[docs/projects/00-project-overview.md](../../../docs/projects/00-project-overview.md)** - プロジェクト全体概要・パッケージ構造
- **[docs/projects/01-architecture.md](../../../docs/projects/01-architecture.md)** - 技術アーキテクチャ・設計パターン

#### 🛠️ 開発プロセス・手順

- **[docs/rules/02-coding-conventions.md](../../../docs/rules/02-coding-conventions.md)** - コーディング規約・ベストプラクティス
- **[docs/projects/07-command-reference.md](../../../docs/projects/07-command-reference.md)** - 開発コマンド完全リファレンス

#### 🔍 品質保証・テスト

- **[docs/rules/03-quality-assurance.md](../../../docs/rules/03-quality-assurance.md)** - 多層品質保証システム
- **[docs/rules/07-bdd-test-hierarchy.md](../../../docs/rules/07-bdd-test-hierarchy.md)** - BDD階層構造統一ルール
- **[docs/projects/02-roadmap.md](../../../docs/projects/02-roadmap.md)** - プロジェクトロードマップ・未了タスク

#### 🔧 専門技術・高度な機能

- **[docs/projects/03-plugin-system.md](../../../docs/projects/03-plugin-system.md)** - プラグインシステム詳細ガイド
- **[docs/projects/04-type-system.md](../../../docs/projects/04-type-system.md)** - TypeScript型システムリファレンス
- **[docs/projects/05-symbol-navigation.md](../../../docs/projects/05-symbol-navigation.md)** - シンボルマップ・コードナビゲーション

#### 📚 ユーティリティ・ツール・ルール

- **[docs/projects/06-utility-functions.md](../../../docs/projects/06-utility-functions.md)** - ユーティリティ関数カタログ
- **[docs/rules/05-code-navigation-commands.md](../../../docs/rules/05-code-navigation-commands.md)** - コードナビゲーション・MCPコマンド
- **[docs/rules/06-source-code-template.md](../../../docs/rules/06-source-code-template.md)** - ソースコードテンプレート統一ルール
- **[docs/rules/08-jsdoc-describe-blocks.md](../../../docs/rules/08-jsdoc-describe-blocks.md)** - JSDoc describeブロック統一ルール
- **[docs/rules/09-todo-task-management.md](../../../docs/rules/09-todo-task-management.md)** - タスク管理統一ルール

## ⚡ @aglabo/agla-logger クイックリファレンス

### 基本情報

- **パッケージ**: TypeScript用構造化ロガー（プラガブルフォーマッター・ログバックエンド対応）
- **アーキテクチャ**: Strategy Pattern + Singleton Pattern
- **ビルド**: デュアルESM/CommonJS対応
- **テスト**: 4層テストアーキテクチャ

### 必須開発コマンド

```bash
# MCPツール必須使用（詳細は docs/rules/04-mcp-tools-mandatory.md 参照）
# - すべての開発段階でlsmcp・serena-mcp使用必須

# 基本開発フロー
pnpm run check:types        # 型チェック（最優先）
pnpm run test:develop       # 単体テスト
pnpm run lint:all          # コード品質チェック
pnpm run build             # デュアルビルド（ESM+CJS+Types）

# 4層テストシステム
pnpm run test:develop      # 単体テスト（vitest unit config）
pnpm run test:functional   # 機能テスト（vitest functional config）
pnpm run test:ci           # 統合テスト（vitest integration config）
pnpm run test:e2e          # E2Eテスト（vitest e2e config）

# 包括テスト
pnpm run test:all          # 全テスト層実行

# 開発支援コマンド
pnpm run clean             # ビルド成果物削除
pnpm run sync:configs      # 設定ファイル同期
```

### 🏗️ コアアーキテクチャ概要

#### Strategy Pattern設計（3コアクラス連携）

```
AgLoggerManager (Singleton)
    ↓ manages
AgLogger (Singleton)
    ↓ uses
AgLoggerConfig
    ↓ coordinates
[Formatter Plugins] ↔ [Logger Plugins]
```

#### プラグインシステム

**Formatter Plugins**:

- `JsonFormatter`, `PlainFormatter`, `NullFormatter`, `MockFormatter`, `AgMockFormatter`

**Logger Plugins**:

- `ConsoleLogger`, `NullLogger`, `MockLogger`, `E2eMockLogger`

### 📂 ディレクトリ構造

```
src/
├── AgLogger.class.ts           # コアシングルトンロガー（24メソッド）
├── AgLoggerManager.class.ts    # システム管理ファサード（9メソッド）
├── AgManagerUtils.ts           # マネージャーユーティリティ・セットアップ
├── internal/                   # 内部実装
│   └── AgLoggerConfig.class.ts # 設定管理（19メソッド）
├── plugins/                    # Strategy Pattern実装
│   ├── formatter/              # メッセージフォーマット戦略（5プラグイン）
│   └── logger/                # 出力先戦略（4プラグイン）
├── utils/                      # 共有ユーティリティ
└── functional/                # 関数プログラミングユーティリティ

# ビルド出力（編集禁止）
├── lib/                       # CommonJS出力
├── module/                    # ESM出力
└── maps/                      # TypeScript宣言ファイル

# 4層テスト構造
src/__tests__/                 # 単体テスト
tests/functional/              # 機能テスト
tests/integration/             # 統合テスト
tests/e2e/                     # E2Eテスト
```

### 🔧 重要実装詳細

#### シングルトン管理

- `AgLogger`, `AgLoggerManager`でシングルトンパターン使用
- テスト間での`resetSingleton()`による状態リセット必須

#### ログレベル階層

```typescript
TRACE (0) → DEBUG (1) → VERBOSE (2) → INFO (3) → WARN (4) → ERROR (5) → FATAL (6)
```

#### プラグイン登録パターン

```typescript
// Formatters: AgFormatFunction = (logMessage: AgLogMessage) => string
// Loggers: AgLoggerFunction = (formattedMessage: string) => void
```

#### データフロー

```
User Code → logger.info() → executeLog()
    ↓
AgLoggerConfig.shouldOutput() [レベルフィルタリング]
    ↓
AgLoggerConfig.formatter() [メッセージフォーマット]
    ↓
AgLoggerConfig.defaultLogger() [メッセージ出力]
```

#### AglaErrorシステム統合

```typescript
// エラーハンドリング例
try {
  const formatted = this.config.getFormatter()(logMessage);
} catch (error) {
  throw new AgLoggerError(
    ErrorSeverity.HIGH,
    'FORMATTER_ERROR',
    `Formatting failed: ${error.message}`,
    { originalError: error, logMessage },
  );
}
```

### 📋 開発ルール・制限事項

#### ファイル編集制限

- ❌ **編集禁止**: `lib/`, `module/`, `maps/`, `.cache/`, `node_modules/`
- ✅ **編集対象**: `src/`, `configs/`, `__tests__/`, `tests/`

#### 必須プラクティス

- **MCPツール**: すべての開発段階で必須使用
- **BDDサイクル**: Red-Green-Refactor厳格遵守
- **型安全性**: TypeScript strict mode必須
- **テスト**: シーケンシャル実行（シングルトン状態管理）

#### テスト階層統一ルール

**3階層BDD構造の厳格遵守:**

```typescript
// パターンA: Given開始（前提条件ベース）
describe('Given: [前提条件の詳細記述]', () => {
  describe('When: [具体的な操作・実行内容]', () => {
    it('Then: [正常]/[異常]/[エッジケース] - should [期待される動作]', () => {
      // テスト実装
    });
  });
});

// パターンB: Feature開始（機能単位テスト）
describe('Feature: [機能名・特徴の記述]', () => {
  describe('When: [具体的な操作・実行内容]', () => {
    it('Then: [正常]/[異常]/[エッジケース] - should [期待される動作]', () => {
      // テスト実装
    });
  });
});

// パターンC: DescribeにThen句がある場合
describe('Then: [正常]/[異常]/[エッジケース] - [詳細な期待結果]', () => {
  it('should [具体的な動作検証]', () => {});
});
```

**分類タグ必須:**

- **[正常]**: 期待入力での正常動作確認
- **[異常]**: エラー・例外処理の確認
- **[エッジケース]**: 境界値・特殊条件での動作確認

## 🧪 テストスイート引き継ぎ情報（Codex向け）

### 現状テストファイル統計

**全53テストファイルの階層構造統一作業:**

- **Unit Tests**: 27ファイル（51%）
- **Functional Tests**: 4ファイル（8%）
- **Integration Tests**: 14ファイル（26%）
- **E2E Tests**: 8ファイル（15%）

### 🚨 優先修正対象（4階層問題）

**Phase 1（最優先）**: 4階層以上のネスト問題修正

- `src/plugins/formatter/__tests__/MockFormatter.errorThrow.spec.ts`
- その他深層ネスト構造ファイル

### ✅ BDD形式優秀実装例

**模範テストファイル:**

- `src/__tests__/functional/AgLogger.functional.spec.ts` - Given/When/Then形式
- `tests/integration/mock-output/manager/singleton-management.integration.spec.ts`

### 🔧 実装時チェックポイント（必須確認）

- [ ] **4階層以上のネストを完全排除** - 最高優先
- [ ] **TOPレベルクラス名describeの削除** - 高優先
- [ ] **全it文でThen:タグ形式の適用** - 中優先
- [ ] **Given/Feature開始パターンの適切選択** - 低優先

### MCPツール活用コマンド（調査・修正用）

```bash
# 4階層以上パターン検索
mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*describe.*describe.*describe" --paths_include_glob "*.spec.ts"

# BDD形式調査
mcp__serena-mcp__search_for_pattern --substring_pattern "Given:|When:|Then:" --paths_include_glob "*.spec.ts"

# テストファイル構造分析
mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/[対象ファイル]"
```

---

**🎯 成功の鍵**: MCPツール活用 + 親プロジェクト文書の参照 + 4層テスト戦略の遵守
