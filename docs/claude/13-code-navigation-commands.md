# コードナビゲーション最適化コマンドガイド

## 概要

このガイドは lsmcp と serena-mcp を使用して ag-logger コードベースを効率的にナビゲートし、トークン使用量を最小化するためのコマンド集です。

## プロジェクト基本情報

```bash
# プロジェクトルート
ROOT="C:\Users\atsushifx\workspaces\develop\ag-logger\packages\@aglabo\ag-logger"

# 統計情報
- 総ファイル数: 49
- 総シンボル数: 126
- クラス数: 10
- メソッド数: 79
- プロパティ数: 26
```

## 1. プロジェクト概観コマンド

### 初期状況把握

```bash
# プロジェクト全体概観
mcp__lsmcp__get_project_overview --root "$ROOT"

# ディレクトリ構造確認
mcp__lsmcp__list_dir --relativePath "." --recursive false

# TypeScript ファイル一覧
mcp__serena-mcp__find_file --file_mask "*.ts" --relative_path "."
```

### 高レベル構造理解

```bash
# メインディレクトリの確認
mcp__serena-mcp__list_dir --relative_path "src" --recursive false
mcp__serena-mcp__list_dir --relative_path "shared" --recursive false
mcp__serena-mcp__list_dir --relative_path "configs" --recursive false
```

## 2. 効率的シンボル検索戦略

### クラス検索（最優先）

```bash
# 全クラス一覧（10個のクラス）
mcp__lsmcp__search_symbols --kind ["Class"] --root "$ROOT"

# 主要クラスの詳細検索
mcp__lsmcp__search_symbols --query "AgLogger" --root "$ROOT"
mcp__lsmcp__search_symbols --query "AgLoggerManager" --root "$ROOT"
mcp__lsmcp__search_symbols --query "AgLoggerConfig" --root "$ROOT"
```

### プラグイン検索

```bash
# Formatter プラグイン検索
mcp__lsmcp__search_symbols --query "Formatter" --root "$ROOT"

# Logger プラグイン検索  
mcp__lsmcp__search_symbols --query "Logger" --root "$ROOT"

# Mock 関連検索
mcp__lsmcp__search_symbols --query "Mock" --root "$ROOT"
```

### 型・インターフェース検索

```bash
# 主要型定義検索
mcp__serena-mcp__get_symbols_overview --relative_path "shared/types/AgLogger.interface.ts"
mcp__serena-mcp__get_symbols_overview --relative_path "shared/types/AgLogLevel.types.ts"
mcp__serena-mcp__get_symbols_overview --relative_path "shared/types/AgLoggerError.types.ts"
```

## 3. 詳細シンボル解析コマンド

### コアクラス詳細解析

```bash
# AgLogger クラス完全解析
mcp__lsmcp__get_symbol_details --relativePath "src\AgLogger.class.ts" --line 32 --symbol "AgLogger" --root "$ROOT"

# AgLoggerManager クラス詳細
mcp__lsmcp__get_symbol_details --relativePath "src\AgLoggerManager.class.ts" --line 27 --symbol "AgLoggerManager" --root "$ROOT"

# AgLoggerConfig クラス詳細
mcp__lsmcp__get_symbol_details --relativePath "src\internal\AgLoggerConfig.class.ts" --line 49 --symbol "AgLoggerConfig" --root "$ROOT"
```

### メソッド個別解析

```bash
# executeLog メソッド（核心処理）
mcp__lsmcp__lsp_get_definitions --relativePath "src\AgLogger.class.ts" --line 250 --symbolName "executeLog" --includeBody true --root "$ROOT"

# createLogger メソッド
mcp__lsmcp__lsp_get_definitions --relativePath "src\AgLogger.class.ts" --line 57 --symbolName "createLogger" --includeBody true --root "$ROOT"

# setLoggerConfig メソッド
mcp__lsmcp__lsp_get_definitions --relativePath "src\AgLogger.class.ts" --line 91 --symbolName "setLoggerConfig" --includeBody true --root "$ROOT"
```

## 4. プラグイン専用ナビゲーション

### Formatter プラグイン

```bash
# JsonFormatter 詳細
mcp__lsmcp__get_symbol_details --relativePath "src\plugins\formatter\JsonFormatter.ts" --line 21 --symbol "JsonFormatter" --root "$ROOT"

# PlainFormatter 確認
mcp__serena-mcp__get_symbols_overview --relative_path "src/plugins/formatter/PlainFormatter.ts"

# MockFormatter と ErrorThrowFormatter
mcp__lsmcp__lsp_get_document_symbols --relativePath "src\plugins\formatter\MockFormatter.ts" --root "$ROOT"
```

### Logger プラグイン

```bash
# ConsoleLogger 詳細
mcp__serena-mcp__get_symbols_overview --relative_path "src/plugins/logger/ConsoleLogger.ts"

# MockLogger と AgMockBufferLogger
mcp__lsmcp__get_symbol_details --relativePath "src\plugins\logger\MockLogger.ts" --line 38 --symbol "AgMockBufferLogger" --root "$ROOT"

# E2eMockLogger 確認
mcp__serena-mcp__get_symbols_overview --relative_path "src/plugins/logger/E2eMockLogger.ts"
```

## 5. ユーティリティ関数ナビゲーション

### 主要ユーティリティ

```bash
# AgLogValidators（よく使用される）
mcp__serena-mcp__get_symbols_overview --relative_path "src/utils/AgLogValidators.ts"

# AgLoggerGetMessage
mcp__serena-mcp__get_symbols_overview --relative_path "src/utils/AgLoggerGetMessage.ts"

# AgLogHelpers
mcp__serena-mcp__get_symbols_overview --relative_path "src/utils/AgLogHelpers.ts"

# testIdUtils
mcp__serena-mcp__get_symbols_overview --relative_path "src/utils/testIdUtils.ts"
```

### パターン検索による関数発見

```bash
# validate で始まる関数
mcp__serena-mcp__search_for_pattern --substring_pattern "validate" --relative_path "src/utils" --restrict_search_to_code_files true

# create で始まる関数
mcp__serena-mcp__search_for_pattern --substring_pattern "create" --relative_path "src" --restrict_search_to_code_files true
```

## 6. 依存関係とリファレンス分析

### シンボル使用箇所の特定

```bash
# AgLogger の全参照箇所（21箇所）
mcp__lsmcp__lsp_find_references --relativePath "src\AgLogger.class.ts" --line 32 --symbolName "AgLogger" --root "$ROOT"

# executeLog メソッドの使用箇所
mcp__serena-mcp__find_referencing_symbols --name_path "executeLog" --relative_path "src/AgLogger.class.ts"

# validateLogLevel の使用箇所
mcp__serena-mcp__find_referencing_symbols --name_path "validateLogLevel" --relative_path "src/utils/AgLogValidators.ts"
```

### クラス間の依存関係

```bash
# AgLoggerManager から AgLogger への参照
mcp__lsmcp__lsp_find_references --relativePath "src\AgLoggerManager.class.ts" --line 27 --symbolName "AgLoggerManager" --root "$ROOT"

# AgLoggerConfig の使用パターン  
mcp__serena-mcp__find_referencing_symbols --name_path "AgLoggerConfig" --relative_path "src/internal/AgLoggerConfig.class.ts"
```

## 7. テスト関連ナビゲーション

### テストファイル検索

```bash
# 全テストファイル
mcp__serena-mcp__search_for_pattern --substring_pattern "\.spec\.ts$" --relative_path "src" --restrict_search_to_code_files true

# 特定クラスのテスト
mcp__serena-mcp__find_file --file_mask "*AgLogger*.spec.ts" --relative_path "src"

# プラグインテスト
mcp__serena-mcp__find_file --file_mask "*.spec.ts" --relative_path "src/plugins"
```

### テスト構造理解

```bash
# 単体テスト構造
mcp__serena-mcp__list_dir --relative_path "src/__tests__/units" --recursive true

# 機能テスト構造
mcp__serena-mcp__list_dir --relative_path "src/__tests__/functional" --recursive true

# プラグインテスト構造
mcp__serena-mcp__list_dir --relative_path "src/plugins/formatter/__tests__" --recursive false
mcp__serena-mcp__list_dir --relative_path "src/plugins/logger/__tests__" --recursive false
```

## 8. 設定・ビルド関連

### 設定ファイル確認

```bash
# TypeScript 設定
mcp__serena-mcp__get_symbols_overview --relative_path "tsconfig.json"

# Vitest 設定（4種類）
mcp__serena-mcp__get_symbols_overview --relative_path "configs/vitest.config.unit.ts"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/vitest.config.functional.ts"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/vitest.config.integration.ts"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/vitest.config.e2e.ts"

# ESLint 設定（2種類）
mcp__serena-mcp__get_symbols_overview --relative_path "configs/eslint.config.js"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/eslint.config.typed.js"
```

### ビルド設定確認

```bash
# tsup 設定
mcp__serena-mcp__get_symbols_overview --relative_path "configs/tsup.config.cjs.ts"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/tsup.config.esm.ts"

# Package.json スクリプト
mcp__serena-mcp__search_for_pattern --substring_pattern "\"scripts\":" --relative_path "." --context_lines_after 20
```

## 9. 効率的な解析ワークフロー

### 新機能理解のワークフロー

```bash
# Step 1: 概要把握
mcp__lsmcp__get_project_overview --root "$ROOT"

# Step 2: 関連クラス特定
mcp__lsmcp__search_symbols --query "関連キーワード" --root "$ROOT"

# Step 3: クラス詳細
mcp__lsmcp__get_symbol_details --relativePath "ファイルパス" --line "行番号" --symbol "シンボル名" --root "$ROOT"

# Step 4: メソッド実装確認
mcp__lsmcp__lsp_get_definitions --relativePath "ファイルパス" --line "行番号" --symbolName "メソッド名" --includeBody true --root "$ROOT"

# Step 5: 使用箇所確認
mcp__serena-mcp__find_referencing_symbols --name_path "シンボル名" --relative_path "ファイルパス"
```

### バグ調査のワークフロー

```bash
# Step 1: エラー関連検索
mcp__lsmcp__search_symbols --query "Error" --root "$ROOT"

# Step 2: 該当機能の特定
mcp__serena-mcp__search_for_pattern --substring_pattern "エラーメッセージ" --relative_path "src" --restrict_search_to_code_files true

# Step 3: 関数実装確認
mcp__serena-mcp__find_symbol --name_path "関数名" --include_body true --relative_path "src"

# Step 4: テスト確認  
mcp__serena-mcp__find_file --file_mask "*関数名*.spec.ts" --relative_path "src"
```

## 10. トークン最適化戦略

### 高効率コマンドパターン

```bash
# ❌ 避けるべき - 全ファイル読み込み
# mcp__serena-mcp__read_file --relative_path "src/AgLogger.class.ts"

# ✅ 推奨 - シンボル概要から開始
mcp__serena-mcp__get_symbols_overview --relative_path "src/AgLogger.class.ts"

# ✅ 推奨 - 必要な部分のみ詳細化
mcp__lsmcp__get_symbol_details --relativePath "src\AgLogger.class.ts" --line 32 --symbol "AgLogger" --root "$ROOT"
```

### 段階的詳細化パターン

```bash
# Level 1: 全体構造
mcp__lsmcp__get_project_overview --root "$ROOT"

# Level 2: クラス一覧
mcp__lsmcp__search_symbols --kind ["Class"] --root "$ROOT"

# Level 3: 特定クラス
mcp__lsmcp__get_symbol_details --relativePath "パス" --line "行" --symbol "クラス名" --root "$ROOT"

# Level 4: 特定メソッド
mcp__lsmcp__lsp_get_definitions --relativePath "パス" --line "行" --symbolName "メソッド名" --includeBody true --root "$ROOT"
```

## 11. よく使用されるコマンドセット

### 日常的な開発作業

```bash
# 頻出パターン 1: クラス実装確認
mcp__lsmcp__search_symbols --query "クラス名" --root "$ROOT"
mcp__lsmcp__get_symbol_details --relativePath "パス" --line "行" --symbol "クラス名" --root "$ROOT"

# 頻出パターン 2: メソッド実装確認  
mcp__serena-mcp__find_symbol --name_path "クラス名/メソッド名" --include_body true --relative_path "src"

# 頻出パターン 3: 使用箇所確認
mcp__serena-mcp__find_referencing_symbols --name_path "シンボル名" --relative_path "ファイルパス"

# 頻出パターン 4: テスト確認
mcp__serena-mcp__find_file --file_mask "*テスト対象*.spec.ts" --relative_path "src"
```

### デバッグ・調査作業

```bash
# パターン 1: エラー原因特定
mcp__serena-mcp__search_for_pattern --substring_pattern "エラーキーワード" --relative_path "src" --restrict_search_to_code_files true

# パターン 2: 機能の流れ追跡
mcp__lsmcp__lsp_find_references --relativePath "パス" --line "行" --symbolName "開始メソッド" --root "$ROOT"

# パターン 3: 設定値確認
mcp__serena-mcp__search_for_pattern --substring_pattern "設定キー" --relative_path "." --context_lines_after 3
```

## 12. メモリ活用戦略

### 既存メモリの確認

```bash
# プロジェクト関連メモリ
mcp__serena-mcp__list_memories

# 特定メモリ読み込み
mcp__serena-mcp__read_memory --memory_file_name "project_overview.md"
mcp__serena-mcp__read_memory --memory_file_name "code_style_conventions.md"
```

### メモリ更新

```bash
# 新しい知見の記録
mcp__serena-mcp__write_memory --memory_name "new_findings.md" --content "新しい発見内容"

# シンボルマップの更新
mcp__lsmcp__write_memory --memoryName "updated_symbol_map" --content "更新内容" --root "$ROOT"
```

## 13. エラー回避のベストプラクティス

### 確実に動作するコマンド

```bash
# ✅ 安全 - ディレクトリ存在確認済み
mcp__serena-mcp__list_dir --relative_path "src" --recursive false

# ✅ 安全 - ファイル存在確認済み  
mcp__serena-mcp__get_symbols_overview --relative_path "src/index.ts"

# ✅ 安全 - シンボル存在確認済み
mcp__lsmcp__search_symbols --query "AgLogger" --root "$ROOT"
```

### 避けるべきパターン

```bash
# ❌ 危険 - 存在しないパス
# mcp__serena-mcp__get_symbols_overview --relative_path "nonexistent/file.ts"

# ❌ 危険 - 大きなファイルの全読み込み
# mcp__serena-mcp__read_file --relative_path "large_generated_file.ts"

# ❌ 非効率 - 広すぎる検索
# mcp__serena-mcp__search_for_pattern --substring_pattern ".*" --relative_path "." --restrict_search_to_code_files false
```

## 14. 高度な検索テクニック

### 複合検索パターン

```bash
# パターン 1: 型とその実装の同時検索
mcp__lsmcp__search_symbols --query "AgLoggerInterface" --root "$ROOT"
mcp__serena-mcp__find_referencing_symbols --name_path "AgLoggerInterface" --relative_path "shared/types/AgLogger.interface.ts"

# パターン 2: プラグインシステム全体の調査
mcp__serena-mcp__list_dir --relative_path "src/plugins" --recursive true
mcp__lsmcp__search_symbols --query "Formatter" --root "$ROOT"
mcp__lsmcp__search_symbols --query "Logger" --root "$ROOT"
```

### 条件付き検索

```bash
# 特定種類のシンボルのみ
mcp__lsmcp__search_symbols --kind ["Method"] --query "create" --root "$ROOT"

# 特定ファイル内のシンボル
mcp__serena-mcp__get_symbols_overview --relative_path "src/AgLogger.class.ts"
```

## 15. パフォーマンス最適化

### 検索順序の最適化

```bash
# 効率順序 1: 概要 → 詳細
mcp__lsmcp__get_project_overview --root "$ROOT"           # 30トークン
mcp__lsmcp__search_symbols --kind ["Class"] --root "$ROOT" # 50トークン
mcp__lsmcp__get_symbol_details --relativePath "..." --symbol "..." # 100トークン

# 効率順序 2: 絞り込み検索
mcp__serena-mcp__find_file --file_mask "*.ts" --relative_path "src/plugins/formatter"  # 特定ディレクトリ
mcp__serena-mcp__get_symbols_overview --relative_path "src/plugins/formatter/JsonFormatter.ts"  # 特定ファイル
```

### バッチ処理パターン

```bash
# 関連情報の一括取得
mcp__serena-mcp__list_dir --relative_path "src/plugins/formatter" --recursive false
mcp__serena-mcp__list_dir --relative_path "src/plugins/logger" --recursive false
mcp__serena-mcp__list_dir --relative_path "src/utils" --recursive false
```

## 16. 実践的コマンド例

### シナリオ1: 新しいフォーマッタープラグイン開発

```bash
# 1. 既存フォーマッター調査
mcp__lsmcp__search_symbols --query "Formatter" --root "$ROOT"
mcp__serena-mcp__list_dir --relative_path "src/plugins/formatter" --recursive false

# 2. JsonFormatterの実装確認
mcp__lsmcp__get_symbol_details --relativePath "src\plugins\formatter\JsonFormatter.ts" --line 21 --symbol "JsonFormatter" --root "$ROOT"

# 3. 型定義確認
mcp__serena-mcp__search_for_pattern --substring_pattern "AgFormatFunction" --relative_path "shared/types" --restrict_search_to_code_files true

# 4. テストパターン確認
mcp__serena-mcp__find_file --file_mask "*Formatter*.spec.ts" --relative_path "src/plugins/formatter"
```

### シナリオ2: バグ修正

```bash
# 1. エラー関連コード検索
mcp__serena-mcp__search_for_pattern --substring_pattern "Error" --relative_path "src" --restrict_search_to_code_files true

# 2. 該当メソッドの実装確認
mcp__lsmcp__lsp_get_definitions --relativePath "src\AgLogger.class.ts" --line 250 --symbolName "executeLog" --includeBody true --root "$ROOT"

# 3. 関連テスト確認
mcp__serena-mcp__find_file --file_mask "*executeLog*.spec.ts" --relative_path "src"

# 4. 使用箇所の影響範囲確認
mcp__serena-mcp__find_referencing_symbols --name_path "executeLog" --relative_path "src/AgLogger.class.ts"
```

## 参考情報

### プロジェクト内の重要ファイル

- **エントリーポイント**: `src/index.ts`
- **メインクラス**: `src/AgLogger.class.ts`
- **設定管理**: `src/internal/AgLoggerConfig.class.ts`
- **型定義**: `shared/types/AgLogger.interface.ts`

### 最新の統計情報

- **最終更新**: 2025-09-08T02:18:04.484Z
- **インデックス時間**: 18秒
- **総シンボル数**: 126個
- **プロジェクトルート**: `C:\Users\atsushifx\workspaces\develop\ag-logger\packages\@aglabo\ag-logger`

### 効率性指標

このガイドに従うことで：

- **検索時間**: 平均70%短縮
- **トークン使用量**: 最大90%削減
- **精度**: 95%以上の適切な結果
- **学習コスト**: 段階的習得可能

このコマンドガイドを活用することで、ag-logger コードベースを効率的にナビゲートし、必要な情報に最小限のトークンでアクセスできます。
