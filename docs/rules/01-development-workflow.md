# 開発ワークフロー完全ガイド

## 概要

ag-logger プロジェクトの包括的な開発ワークフロー。BDD（Behavior-Driven Development）手法を基盤とし、厳格な品質ゲートとMCPツール活用による効率的な開発を実現します。

## BDD開発手法（atsushifx式）

### 基本原則

**厳密なBDD実践による高品質開発**

#### 核となる原則

- **1 message = 1 test**: 実装サイクルごとに単一の `it()` テスト
- **RED/GREEN確認**: 次のステップに進む前の必須確認
- **最小実装**: テスト通過に必要な最小限のコードのみ実装
- **自然言語記述**: 明確で記述的なテスト名

#### BDDサイクル

```
1. 失敗するテスト記述（RED）
   ↓
2. テスト通過する最小コード実装（GREEN）
   ↓  
3. 必要に応じてリファクタリング
   ↓
4. 次のテストで繰り返し
```

### MCPツール活用による効率化

#### コード理解フェーズでの必須MCP使用

```bash
# Phase 0: 既存コード理解（MCPツール必須）
# プロジェクト構造の把握
mcp__lsmcp__get_project_overview --root "$ROOT"

# 関連シンボルの検索
mcp__lsmcp__search_symbols --query "関連機能名" --root "$ROOT"

# 実装詳細の確認
mcp__lsmcp__get_symbol_details --relativePath "ファイルパス" --line "行" --symbol "シンボル名"
```

## 実装フロー詳細

### Phase 1: テスト駆動設計（RED）

```bash
# 新機能テスト作成
cd packages/@aglabo/ag-logger

# 既存テストパターンの研究（MCPツール使用）
mcp__serena-mcp__find_file --file_mask "*.spec.ts" --relative_path "src/__tests__"
mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/AgLogger.spec.ts"

# 新機能テスト作成
vi src/__tests__/NewFeature.spec.ts

# テスト実行（失敗確認）
pnpm exec vitest run src/__tests__/NewFeature.spec.ts
```

#### テスト記述例

```typescript
describe('NewFeature', () => {
  it('should handle basic error case', () => {
    // Given - 前提条件
    const input = createTestInput();

    // When - 実行
    const result = newFeature(input);

    // Then - 検証
    expect(result).toMatchExpectedBehavior();
  });
});
```

### テスト階層統一ルール（必須遵守）

#### 3階層BDD構造の厳格適用

**すべてのテストファイルで以下の統一形式を遵守:**

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
```

#### Then句の分類タグ（必須）

- **[正常]**: 期待された入力・条件での正常動作確認
- **[異常]**: エラー入力・異常条件での適切なエラー処理確認
- **[エッジケース]**: 境界値・特殊条件・極端な状況での動作確認

#### DescribeにThen句がある場合の特別ルール

```typescript
// Describe句自体でThen句を使用する場合
describe('Then: [正常]/[異常]/[エッジケース] - [詳細な期待結果の記述]', () => {
  // テスト実装またはネストしたテストグループ
});
```

#### 複数TOPレベルdescribe許可構造

```typescript
// 同一ファイル内で複数のGiven/Featureを直接TOPレベルに配置可能
describe('Given: ログマネージャーが初期化済み', () => {
  describe('When: ログレベルを変更', () => {
    it('Then: [正常] - should apply new log level immediately', () => {});
  });
});

describe('Given: 無効な設定ファイル', () => {
  describe('When: ロガー初期化試行', () => {
    it('Then: [異常] - should throw configuration error', () => {});
  });
});

describe('Feature: 高負荷シナリオ処理', () => {
  describe('When: 1000件の同時ログ出力', () => {
    it('Then: [エッジケース] - should complete within time limit', () => {});
  });
});
```

#### 実装パターン例（実際の使用例）

```typescript
// Unit Test例
describe('Given: AgLogger singleton instance', () => {
  describe('When: calling info() with string message', () => {
    it('Then: [正常] - should output formatted message to console', () => {
      const logger = AgLogger.getInstance();
      const spy = vi.spyOn(console, 'log');

      logger.info('test message');

      expect(spy).toHaveBeenCalledWith(expect.stringContaining('test message'));
    });
  });
});

// E2E Test例
describe('Feature: Application Lifecycle Management', () => {
  describe('When: initializing logger with custom configuration', () => {
    it('Then: [正常] - should setup logger with specified formatters and loggers', () => {
      // E2E implementation
    });

    it('Then: [異常] - should handle invalid configuration gracefully', () => {
      // Error scenario implementation
    });
  });
});
```

### Phase 2: 最小実装（GREEN）

#### MCPツールによる既存パターン調査

```bash
# 類似実装の検索
mcp__serena-mcp__search_for_pattern --substring_pattern "類似機能キーワード" --relative_path "src" --restrict_search_to_code_files true

# 既存クラス構造の確認
mcp__serena-mcp__find_symbol --name_path "関連クラス" --include_body false --depth 1

# インポートパターンの調査
mcp__lsmcp__parse_imports --filePath "src/関連ファイル.ts" --root "$ROOT"
```

#### 実装とテスト

```bash
# 実装ファイル作成・編集
vi src/NewFeature.ts

# テスト実行（成功確認）
pnpm exec vitest run src/__tests__/NewFeature.spec.ts

# 型チェック（MCPツール活用）
pnpm run check:types

# 実装後のシンボル確認
mcp__lsmcp__get_symbol_details --relativePath "src/NewFeature.ts" --line "1" --symbol "NewFeature"
```

### Phase 3: リファクタリング・品質確認

#### 統合確認フロー

```bash
# コード品質チェック
pnpm run lint:all

# 全テスト実行
pnpm run test:develop

# フォーマット適用
pnpm run format:dprint

# 影響範囲確認（MCPツール使用）
mcp__serena-mcp__find_referencing_symbols --name_path "変更したシンボル" --relative_path "src/変更したファイル.ts"
```

## 4層テスト戦略

### テスト階層アーキテクチャ

**包括的テスト戦略による品質保証**

```
1. Unit Tests      (単体テスト)     - 個別コンポーネント・関数
2. Functional Tests (機能テスト)     - フィーチャーレベル
3. Integration Tests(統合テスト)     - パッケージ間連携
4. E2E Tests       (エンドツーエンド) - 実際の使用シナリオ
```

### Vitest設定システム

#### 階層別設定ファイル

```
configs/
├── vitest.config.unit.ts         # 単体テスト設定
├── vitest.config.functional.ts   # 機能テスト設定  
├── vitest.config.integration.ts  # 統合テスト設定
├── vitest.config.e2e.ts         # E2E テスト設定
└── vitest.config.gha.ts         # GitHub Actions 用設定
```

#### MCPツールによるテスト調査

```bash
# 既存テスト構造の理解
mcp__lsmcp__list_dir --relativePath "src/__tests__" --recursive true

# テストファイルの詳細分析
mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/AgLogger.spec.ts"

# テストパターンの検索
mcp__serena-mcp__search_for_pattern --substring_pattern "describe|it\\(" --relative_path "src/__tests__" --context_lines_after 5
```

### テスト実行コマンド体系

#### 開発用テストコマンド

```bash
# 全パッケージ開発テスト（高速、主に unit）
pnpm run test:develop
pnpm -r run test:develop

# 個別パッケージ開発テスト  
cd packages/@aglabo/ag-logger
pnpm run test:develop
```

#### CI用テストコマンド

```bash
# 全パッケージ包括テスト（全階層）
pnpm run test:ci
pnpm -r run test:ci

# 個別パッケージ包括テスト
cd packages/@aglabo/ag-logger
pnpm run test:ci
```

#### 階層別テスト実行

```bash
# 単体テスト
pnpm run test:unit
pnpm exec vitest --config ./configs/vitest.config.unit.ts

# 機能テスト
pnpm run test:functional
pnpm exec vitest --config ./configs/vitest.config.functional.ts

# 統合テスト
pnpm run test:integration
pnpm exec vitest --config ./configs/vitest.config.integration.ts

# E2E テスト
pnpm run test:e2e
pnpm exec vitest --config ./configs/vitest.config.e2e.ts
```

## 開発環境ワークフロー

### グローバル開発（ルートレベル）

#### モノレポ全体での作業

```bash
# 全パッケージビルド
pnpm run build

# 全パッケージテスト
pnpm run test:develop
pnpm run test:ci

# 全体品質チェック
pnpm run lint:all
pnpm run check:types
pnpm run check:spells
```

#### MCPツールによる全体把握

```bash
# プロジェクト全体の理解
mcp__lsmcp__get_project_overview --root "C:\Users\atsushifx\workspaces\develop\ag-logger"

# パッケージ構造の把握
mcp__lsmcp__list_dir --relativePath "packages" --recursive false

# 依存関係の確認
mcp__lsmcp__get_typescript_dependencies --root "$ROOT"
```

### パッケージ個別開発

#### 特定パッケージでの集中作業

```bash
# パッケージディレクトリに移動
cd packages/@aglabo/ag-logger

# パッケージ固有コマンド実行
pnpm run build           # パッケージビルド
pnpm run test:develop    # 単体テスト
pnpm run test:e2e        # E2E テスト
pnpm run lint:all        # 全リント
pnpm run check:types     # 型チェック
```

#### MCPツールによるパッケージ分析

```bash
# パッケージ構造の理解
mcp__lsmcp__get_symbols_overview --relativePath "src"

# 主要クラスの確認
mcp__lsmcp__search_symbols --query "AgLogger" --kind ["Class"] --root "$ROOT"

# プラグインシステムの理解
mcp__serena-mcp__list_dir --relative_path "src/plugins" --recursive true
```

## Pre-commitプロセス

### lefthookによる自動品質チェック

#### 自動実行チェック（コミット時）

- **secretlint**: 機密情報漏洩防止
- **ESLint**: コード品質（基本 + TypeScript 対応）
- **ls-lint**: ファイル名規約確認
- **cspell**: スペルチェック
- **dprint**: コードフォーマット
- **codegpt**: コミットメッセージ自動改善

#### 手動実行推奨チェック

- **型チェック**: `pnpm run check:types`
- **全テストスイート**: `pnpm run test:develop` / `pnpm run test:ci`

### コミット前チェックリスト

#### 必須チェック（自動実行されない項目）

```bash
pnpm run check:types
pnpm run test:develop

# MCPツールによる影響範囲確認
mcp__serena-mcp__find_referencing_symbols --name_path "変更したシンボル" --relative_path "変更したファイル"
```

#### 推奨チェック（時間に余裕がある場合）

```bash
pnpm run test:ci
pnpm run build

# MCPツールによる全体整合性確認
mcp__lsmcp__lsp_get_diagnostics --relativePath "変更したファイル" --root "$ROOT"
```

## 開発ベストプラクティス

### 1. コンテキスト理解（MCPツール必須）

#### ファイル変更前の必須作業

```bash
# 既存コード規約の理解
mcp__serena-mcp__get_symbols_overview --relative_path "対象ファイル"

# 周辺コンテキスト（特にインポート）の確認  
mcp__lsmcp__parse_imports --filePath "対象ファイル" --root "$ROOT"

# フレームワーク・ライブラリ選択の理解
mcp__serena-mcp__search_for_pattern --substring_pattern "import.*from" --relative_path "src" --context_lines_after 1
```

### 2. 既存パターン踏襲

#### パターン調査プロセス

```bash
# 既存コードスタイルの模倣
mcp__serena-mcp__find_symbol --name_path "類似クラス" --include_body true

# 既存ライブラリ・ユーティリティの活用
mcp__lsmcp__search_symbols --query "Utility" --root "$ROOT"

# 確立されたパターン・規約の遵守
mcp__serena-mcp__search_for_pattern --substring_pattern "パターンキーワード" --relative_path "src" --restrict_search_to_code_files true
```

### 3. ライブラリ検証（MCPツール活用）

#### 依存関係確認プロセス

```bash
# 著名ライブラリでも使用前に存在確認必須
mcp__lsmcp__get_typescript_dependencies --root "$ROOT"

# 隣接ファイル・package.json での使用状況確認
mcp__serena-mcp__find_file --file_mask "package.json" --relative_path "."

# コードベース全体での一貫したライブラリ使用
mcp__serena-mcp__search_for_pattern --substring_pattern "import.*ライブラリ名" --relative_path "." --restrict_search_to_code_files true
```

### 4. セキュリティプラクティス

- **セキュリティベストプラクティス**: 常時遵守
- **秘匿情報排除**: シークレット・キーの露出・ログ出力禁止
- **コミット安全性**: シークレット・キーのリポジトリコミット禁止

## パッケージ開発ワークフロー

### 新規パッケージ作成

#### 基本構造セットアップ

```bash
# パッケージディレクトリ作成
mkdir -p packages/@aglabo/new-package

# 既存パッケージをテンプレートとして活用（MCPツール使用）
cd packages/@aglabo/new-package
mcp__serena-mcp__find_file --file_mask "package.json" --relative_path "../ag-logger"

# 基本ファイル複製・調整
cp -r ../ag-logger/configs ./configs
cp ../ag-logger/package.json ./package.json
# package.json の name, description 編集

# TypeScript設定
cp ../ag-logger/tsconfig.json ./tsconfig.json

# ソース構造作成
mkdir -p src/__tests__
mkdir -p tests/{integration,e2e}
mkdir -p shared/{types,constants}
```

### 既存パッケージ拡張

#### MCPツール活用による機能拡張

```bash
cd packages/@aglabo/ag-logger

# 拡張対象の理解
mcp__lsmcp__get_symbol_details --relativePath "src/AgLogger.class.ts" --line "32" --symbol "AgLogger"

# BDDサイクルで機能追加
# 1. テスト作成
vi src/__tests__/NewFeature.spec.ts

# 2. 実装
vi src/NewFeature.ts

# 3. 確認
pnpm run test:develop
pnpm run check:types
pnpm run lint:all

# 4. 影響範囲確認
mcp__serena-mcp__find_referencing_symbols --name_path "NewFeature" --relative_path "src/NewFeature.ts"
```

## 設定管理ワークフロー

### 中央集約設定

#### 設定更新とパッケージ同期

```bash
# 中央設定の理解
mcp__serena-mcp__get_symbols_overview --relative_path "configs/eslint.config.all.js"

# 中央設定更新
vi configs/eslint.config.all.js

# 全パッケージに同期
pnpm run sync:configs

# 同期結果確認
git status
git diff
```

### パッケージ固有設定

#### 設定調整プロセス

```bash
cd packages/@aglabo/ag-logger

# 既存設定の理解
mcp__serena-mcp__get_symbols_overview --relative_path "configs/vitest.config.unit.ts"

# パッケージ固有設定の調整
vi configs/vitest.config.unit.ts

# 設定検証
pnpm run test:develop
```

## デュアルビルドプロセス

### ビルド戦略

- **ESM**: 主要モジュール形式
- **CommonJS**: 後方互換性
- **型定義**: TypeScript宣言ファイル自動生成

### ビルドワークフロー

#### 開発中のビルド管理

```bash
# 開発中ビルド確認
pnpm run build

# 個別ターゲットビルド
pnpm run build:esm    # ESM のみ
pnpm run build:cjs    # CommonJS のみ
pnpm run build:types  # 型定義のみ

# ビルド結果確認（MCPツール使用）
mcp__lsmcp__list_dir --relativePath "lib" --recursive false
mcp__lsmcp__list_dir --relativePath "module" --recursive false
```

## 品質ゲートワークフロー

### 開発完了前必須チェック

#### 品質保証プロセス

1. `pnpm run check:types` - 型安全性確認
2. `pnpm run lint:all` - コード品質確認
3. `pnpm run check:dprint` - フォーマット確認
4. `pnpm run test:develop` - 基本テスト確認
5. `pnpm run build` - ビルド成功確認

#### MCPツールによる最終確認

```bash
# 実装の完全性確認
mcp__lsmcp__lsp_get_diagnostics --relativePath "実装ファイル" --root "$ROOT"

# 型定義の整合性確認
mcp__lsmcp__get_symbol_details --relativePath "実装ファイル" --line "1" --symbol "実装シンボル"

# テストカバレッジ確認
mcp__serena-mcp__find_file --file_mask "*実装名*.spec.ts" --relative_path "src/__tests__"
```

### リリース前包括チェック

#### 包括的品質保証

1. `pnpm run test:ci` - 全テスト実行
2. `pnpm run build` - ビルド確認
3. `pnpm run check:spells` - スペルチェック
4. `pnpm run lint:secrets` - セキュリティチェック

## MCPツール使用の必須化

### 開発プロセス全体でのMCPツール活用

#### 必須使用場面

- **コード理解**: 既存コード構造の把握
- **パターン調査**: 実装パターンの研究
- **影響範囲分析**: 変更の影響確認
- **依存関係確認**: ライブラリ・モジュールの使用状況確認
- **テスト戦略立案**: 既存テストパターンの研究

#### 推奨使用パターン

```bash
# 作業開始時の理解フェーズ
mcp__lsmcp__get_project_overview --root "$ROOT"
mcp__lsmcp__search_symbols --query "対象機能" --root "$ROOT"

# 実装中の調査フェーズ
mcp__serena-mcp__find_symbol --name_path "関連シンボル" --include_body true
mcp__serena-mcp__search_for_pattern --substring_pattern "パターン" --relative_path "src"

# 完了前の確認フェーズ
mcp__serena-mcp__find_referencing_symbols --name_path "変更シンボル" --relative_path "ファイル"
mcp__lsmcp__lsp_get_diagnostics --relativePath "ファイル" --root "$ROOT"
```

このワークフローに従うことで、ag-loggerプロジェクトの品質と開発効率を最大化できます。
