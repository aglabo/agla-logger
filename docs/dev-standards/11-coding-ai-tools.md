---
header:
  - src: 11-coding-ai-tools.md
  - @(#): AI Tools Overview for Developers
title: agla-logger
description: 開発者向けAIツール概要・基本的な活用方針
version: 1.0.0
created: 2025-09-22
updated: 2025-09-27
authors:
  - atsushifx
changes:
  - 2025-09-22: 初版作成
  - 2025-09-27: AI専用ガイドを分離、開発者向け概要に変更
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 開発者向けAIツール概要

このドキュメントは、agla-loggerプロジェクトで利用可能なAIツールの概要と基本的な活用方針を開発者向けに説明します。

## 利用可能なAIツール

### Claude Code (推奨)

- **概要**: Anthropic公式のコーディング支援AI
- **特徴**: プロジェクト理解、コード生成、リファクタリング支援
- **活用場面**: 機能実装、バグ修正、コードレビュー、ドキュメント作成

### その他のツール

- **GitHub Copilot**: コード補完、関数生成
- **ChatGPT**: アーキテクチャ相談、技術調査
- **Codex エージェント**: 大規模なリファクタリング、自動化タスク

## 基本的な活用方針

### AI活用のベストプラクティス

1. **段階的なアプローチ**: 複雑なタスクは段階的に分割して依頼
2. **具体的な指示**: 対象ファイル名、期待する動作を明確に指定
3. **品質確認**: AI生成コードの必須レビューと検証
4. **セキュリティ配慮**: 機密情報の含まれるコードの取り扱い注意

### 効果的な指示パターン

- 分析・理解: 「[対象]の構造と実装パターンを分析」
- 実装: 「[機能名]をテスト駆動で実装」
- 修正: 「[エラー内容]を修正し、影響範囲も確認」
- 検証: 「実装の品質ゲートをすべてチェック」

AI支援開発に関する詳細な情報は、以下の専用ドキュメントを参照してください:

### 開発者向け詳細ガイド

- **[AI支援開発ガイド](16-ai-assisted-development.md)** - 開発者がAIツールを効果的に活用するための実践ガイド
  - 効果的な指示方法とパターン
  - 段階的アプローチの実践
  - 品質保証とセキュリティ配慮
  - 開発フロー統合方法

### AIエージェント向け専用標準

- **[for-AI-dev-standards/](../for-AI-dev-standards/)** - AIコーディングエージェント専用の開発標準
  - MCPツール活用の必須ルール
  - BDD開発プロセスの詳細手順
  - コード品質・テスト実装ガイド
  - 実装テンプレート・規約

### 専用スラッシュコマンド

agla-loggerプロジェクトでは以下のスラッシュコマンドが利用可能です:

#### /kiro コマンド

- **概要**: Spec-Driven Development対応の実装エージェント
- **用途**: 仕様書作成から実装まで一貫した開発支援

#### /serena コマンド

- **概要**: 効率的なプロジェクト分析・開発支援エージェント
- **用途**: プロジェクト構造理解、アーキテクチャ分析

#### /commit-message コマンド

- **概要**: Git コミットメッセージ生成専用エージェント
- **用途**: ステージングされたファイルから適切なコミットメッセージを自動生成

## 関連ドキュメント

- [開発ワークフロー](02-development-workflow.md) - 基本的な開発フロー
- [品質保証システム](06-quality-assurance.md) - コード品質管理

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx

- コード品質向上支援

使用例:

```bash
# プロジェクト構造の包括的分析
/serena "AgLoggerアーキテクチャの全体俯瞰"

# 特定機能の依存関係分析
/serena "executeLogメソッドの影響範囲調査"
```

## 4. 📋 Spec-Driven Development ワークフロー

### 基本プロセス

1. **仕様定義段階**
   ```bash
   # /kiro による仕様ベース実装
   /kiro "機能仕様を基にしたコード生成"
   ```

2. **実装生成段階**
   ```bash
   # lsmcp による実装検証
   mcp__lsmcp__lsp_get_diagnostics --relativePath "実装ファイル" --root "$ROOT"
   ```

3. **テスト実行段階**
   ```bash
   # serena-mcp による分析
   mcp__serena-mcp__find_referencing_symbols --name_path "実装シンボル"
   ```

4. **最適化段階**
   ```bash
   # codex による最適化提案
   mcp__codex__codex --prompt "実装の最適化とリファクタリング提案"
   ```

### 統合ワークフローの利点

- 効率性: 各ツールの特性を活かした最適な役割分担
- 品質: 多段階検証による高品質なコード生成
- 保守性: 仕様ドリブンによる明確な実装根拠
- スケーラビリティ: 大規模プロジェクトでの一貫した開発手法

## 5. ⚠️ 重要: 必須使用要件

**Claude Code でのコード操作時は、必ず MCP ツールを経由してください。**

### 禁止事項

❌ 直接的なファイル読み取り: `Read` ツールでのソースコード読み込み
❌ 直接的なファイル編集: `Edit` や `Write` ツールでの直接編集
❌ 非効率な検索: `Bash` や `Grep` での手動検索
❌ 非MCPツールの単独使用: MCP連携なしでのコード操作
❌ スラッシュコマンドの無計画使用: /kiro, /serena の適用場面を考慮しない実行

## 6. 必須使用シナリオ

### 1. コード理解・読み取り時

```bash
# ✅ 必須: MCPツールを使用
mcp__lsmcp__get_project_overview --root "C:\Users\atsushifx\workspaces\develop\ag-logger\packages\@aglabo\ag-logger"
mcp__serena-mcp__get_symbols_overview --relative_path "src/AgLogger.class.ts"

# ❌ 禁止: 直接読み取り
# Read --file_path "C:\Users\...\AgLogger.class.ts"
```

### 2. シンボル検索時

```bash
# ✅ 必須: MCPツールを使用
mcp__lsmcp__search_symbols --query "AgLogger" --root "$ROOT"
mcp__serena-mcp__find_symbol --name_path "AgLogger/executeLog" --include_body true

# ❌ 禁止: 手動検索
# Grep --pattern "class AgLogger"
```

### 3. コード編集・リファクタリング時

```bash
# ✅ 必須: MCPツールで位置特定後に編集
mcp__lsmcp__get_symbol_details --relativePath "src\AgLogger.class.ts" --line 32 --symbol "AgLogger"
# その後、特定された範囲でのみ Edit ツール使用

# ❌ 禁止: 直接編集
# Edit --file_path "..." --old_string "..." --new_string "..."
```

## 7. プロジェクト基本情報

```bash
# プロジェクトルート
ROOT="C:\Users\atsushifx\workspaces\develop\ag-logger\packages\@aglabo\ag-logger"

# 統計情報
- 総ファイル数: 49
- 総シンボル数: 126
- クラス数: 10
- メソッド数: 79
```

## 8. プロジェクト概観 (必須開始手順)

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

## 9. 効率的シンボル検索戦略

### クラス検索 (最優先)

```bash
# 全クラス一覧 (10個のクラス) 
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

## 10. 詳細シンボル解析コマンド

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
# executeLog メソッド (核心処理) 
mcp__lsmcp__lsp_get_definitions --relativePath "src\AgLogger.class.ts" --line 250 --symbolName "executeLog" --includeBody true --root "$ROOT"

# createLogger メソッド
mcp__lsmcp__lsp_get_definitions --relativePath "src\AgLogger.class.ts" --line 57 --symbolName "createLogger" --includeBody true --root "$ROOT"

# setLoggerConfig メソッド
mcp__lsmcp__lsp_get_definitions --relativePath "src\AgLogger.class.ts" --line 91 --symbolName "setLoggerConfig" --includeBody true --root "$ROOT"
```

## 11. プラグイン専用ナビゲーション

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

## 12. ユーティリティ関数ナビゲーション

### 主要ユーティリティ

```bash
# AgLogValidators (よく使用される) 
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

## 13. 依存関係とリファレンス分析

### シンボル使用箇所の特定

```bash
# AgLogger の全参照箇所 (21箇所) 
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

## 14. テスト関連ナビゲーション

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

## 15. 設定・ビルド関連

### 設定ファイル確認

```bash
# TypeScript 設定
mcp__serena-mcp__get_symbols_overview --relative_path "tsconfig.json"

# Vitest 設定 (4種類) 
mcp__serena-mcp__get_symbols_overview --relative_path "configs/vitest.config.unit.ts"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/vitest.config.functional.ts"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/vitest.config.integration.ts"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/vitest.config.e2e.ts"

# ESLint 設定 (2種類) 
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

## 16. 効率的な解析ワークフロー

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

## 17. トークン最適化戦略

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

## 18. よく使用されるコマンドセット

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

## 19. 違反時の対処

### 直接読み取り・編集の検出

Claude Code が直接読み取りや編集を試みた場合：

1. 即座に停止: 処理を中断する
2. MCPツール使用要請: 適切なMCPツールでの代替を求める
3. 効率的手順の提示: 正しいワークフローを示す

### 正しい修正手順例

```bash
# ❌ 検出された違反例
# Read --file_path "src/AgLogger.class.ts"
# Edit --file_path "src/AgLogger.class.ts" --old_string "..." --new_string "..."

# ✅ 正しい修正手順
# 1. シンボル概要の確認
mcp__serena-mcp__get_symbols_overview --relative_path "src/AgLogger.class.ts"

# 2. 特定シンボルの詳細確認
mcp__lsmcp__get_symbol_details --relativePath "src\AgLogger.class.ts" --line 32 --symbol "AgLogger" --root "$ROOT"

# 3. 必要に応じて実装詳細確認
mcp__lsmcp__lsp_get_definitions --relativePath "src\AgLogger.class.ts" --line 250 --symbolName "executeLog" --includeBody true --root "$ROOT"

# 4. 位置特定後に限定的編集
Edit --file_path "src/AgLogger.class.ts" --old_string "特定された範囲" --new_string "修正内容"
```

## 20. 参考情報

### プロジェクト内の重要ファイル

- エントリーポイント: `src/index.ts`
- メインクラス: `src/AgLogger.class.ts`
- 設定管理: `src/internal/AgLoggerConfig.class.ts`
- 型定義: `shared/types/AgLogger.interface.ts`
