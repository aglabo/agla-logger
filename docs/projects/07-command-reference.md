# 開発コマンド完全リファレンス

## 概要

ag-loggerプロジェクトで使用する全開発コマンドの包括的なリファレンス。BDD開発サイクル、品質保証、デバッグまで網羅的にカバーします。

## ビルドコマンド

### 全パッケージビルド

#### デュアル出力ビルド（ESM + CommonJS）

```bash
# 全パッケージの ESM + CommonJS ビルド
pnpm run build

# ESM のみビルド
pnpm run build:esm

# CommonJS のみビルド
pnpm run build:cjs

# 型定義ファイルのみビルド
pnpm run build:types
```

#### MCPツールによるビルド結果確認

```bash
# ビルド出力確認
mcp__lsmcp__list_dir --relativePath "lib" --recursive false
mcp__lsmcp__list_dir --relativePath "module" --recursive false
mcp__lsmcp__list_dir --relativePath "maps" --recursive false

# ビルド成果物の構造確認
mcp__serena-mcp__find_file --file_mask "*.js" --relative_path "lib"
mcp__serena-mcp__find_file --file_mask "*.mjs" --relative_path "module"
```

### 個別パッケージビルド

#### パッケージレベル操作

```bash
# 特定パッケージに移動してビルド
cd packages/@aglabo/ag-logger
pnpm run build

# MCPツールによるパッケージ構造確認
mcp__lsmcp__get_symbols_overview --relativePath "src"
```

### ビルドクリーンアップ

#### 全クリーンアップフロー

```bash
# 全パッケージのビルド出力を削除
pnpm run clean

# 完全クリーンビルド
pnpm run clean
rm -rf node_modules .cache
pnpm install
pnpm run build
```

## 4層テストコマンド

### 全パッケージテスト

#### 開発用テスト（高速実行）

```bash
# 開発用テスト（高速、主に unit テスト）
pnpm run test:develop
pnpm -r run test:develop

# CI 用テスト（包括的、全テスト層）
pnpm run test:ci
pnpm -r run test:ci
```

#### MCPツールによるテスト構造理解

```bash
# テスト構造の全体把握
mcp__lsmcp__list_dir --relativePath "src/__tests__" --recursive true
mcp__lsmcp__list_dir --relativePath "tests" --recursive true

# 既存テストパターンの研究
mcp__serena-mcp__search_for_pattern --substring_pattern "describe|it\\(" --relative_path "src/__tests__" --context_lines_after 3
```

### 個別パッケージテスト

#### 階層別テスト実行

```bash
cd packages/@aglabo/ag-logger

# 開発用テスト
pnpm run test:develop

# CI 用テスト
pnpm run test:ci

# 特定テスト層（4層テストアーキテクチャ）
pnpm run test:unit        # 単体テスト
pnpm run test:functional  # 機能テスト  
pnpm run test:integration # 統合テスト
pnpm run test:e2e        # E2E テスト
```

#### MCPツールによるテスト詳細分析

```bash
# 特定テスト層の詳細確認
mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/AgLogger.spec.ts"

# テストファイルの検索
mcp__serena-mcp__find_file --file_mask "*.spec.ts" --relative_path "src/__tests__"
mcp__serena-mcp__find_file --file_mask "*.functional.spec.ts" --relative_path "tests"
```

### 特定ファイルテスト

#### ピンポイントテスト実行

```bash
# 特定テストファイルの実行
pnpm exec vitest run --config ./configs/vitest.config.unit.ts src/__tests__/AglaError.spec.ts

# テスト監視モード
pnpm exec vitest watch --config ./configs/vitest.config.unit.ts

# デバッグモード
pnpm exec vitest run --reporter=verbose --timeout=0 src/__tests__/Debug.spec.ts
```

#### MCPツールによるテスト関連調査

```bash
# テスト対象の実装確認
mcp__lsmcp__get_symbol_details --relativePath "src/AgLogger.class.ts" --line "32" --symbol "AgLogger"

# テストで使用されるモックの確認
mcp__serena-mcp__find_symbol --name_path "Mock" --relative_path "src/__tests__" --substring_matching true
```

## リント・フォーマットコマンド

### ESLint（2段階設定）

#### 基本・TypeScript対応リント

```bash
# 全パッケージ基本リント
pnpm run lint
pnpm -r run lint

# 全パッケージ TypeScript 対応リント
pnpm run lint:types
pnpm -r run lint:types

# 基本 + TypeScript リント
pnpm run lint:all

# 自動修正
pnpm run lint -- --fix
pnpm run lint:all -- --fix
```

#### MCPツールによるリント設定確認

```bash
# ESLint設定の詳細確認
mcp__serena-mcp__get_symbols_overview --relative_path "configs/eslint.config.basic.js"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/eslint.config.all.js"

# リント対象ファイルのパターン確認
mcp__serena-mcp__search_for_pattern --substring_pattern "files.*\\[" --relative_path "configs" --context_lines_after 5
```

### 中央集約リント（ルートレベル）

#### プロジェクト全体リント

```bash
# 基本 ESLint（全ファイル）
pnpm run lint-all

# TypeScript 対応 ESLint（全ファイル）
pnpm run lint-all:types
```

### コードフォーマット

#### dprint フォーマットシステム

```bash
# dprint フォーマット実行
pnpm run format:dprint

# dprint フォーマットチェック
pnpm run check:dprint
```

#### MCPツールによるフォーマット設定確認

```bash
# dprint設定の確認
mcp__serena-mcp__find_file --file_mask "dprint.json" --relative_path "."
mcp__serena-mcp__search_for_pattern --substring_pattern "dprint" --relative_path "." --restrict_search_to_code_files false
```

### その他品質チェック

#### 包括的品質ツール

```bash
# ファイル名規約チェック
pnpm run lint:filenames

# テキストリント
pnpm run lint:text

# Markdown リント
pnpm run lint:markdown

# シークレット検出（セキュリティ）
pnpm run lint:secrets
```

## 品質保証コマンド

### TypeScript型チェック

#### 型安全性確認

```bash
# 全パッケージ型チェック
pnpm run check:types
pnpm -r run check:types

# 詳細型エラー確認
pnpm exec tsc --noEmit --project tsconfig.json
```

#### MCPツールによる型システム確認

```bash
# 型定義の詳細確認
mcp__lsmcp__get_typescript_dependencies --root "$ROOT"
mcp__lsmcp__lsp_get_diagnostics --relativePath "src/対象ファイル.ts" --root "$ROOT"

# 型システムの整合性確認
mcp__serena-mcp__get_symbols_overview --relative_path "shared/types/AgLogger.interface.ts"
```

### スペルチェック

#### プロジェクト全体スペルチェック

```bash
# 全プロジェクトスペルチェック
pnpm run check:spells

# cspell設定確認
cat .vscode/cspell/cspell.json
```

#### MCPツールによるスペルチェック設定確認

```bash
# cspell設定ファイルの確認
mcp__serena-mcp__find_file --file_mask "*spell*" --relative_path ".vscode"
mcp__serena-mcp__search_for_pattern --substring_pattern "cspell" --relative_path "." --restrict_search_to_code_files false
```

### 包括的品質チェック

#### 開発完了前チェックリスト

```bash
# 必須品質ゲート（順序重要）
pnpm run check:types
pnpm run lint:all
pnpm run check:dprint
pnpm run test:develop
pnpm run build

# ワンライナー版
pnpm run check:types && pnpm run lint:all && pnpm run check:dprint && pnpm run test:develop && pnpm run build
```

## BDD開発サイクルコマンド

### Red-Green-Refactor サイクル

#### Phase 1: RED（失敗するテスト作成）

```bash
# 新機能テスト作成前の調査（MCPツール必須）
mcp__serena-mcp__find_file --file_mask "*.spec.ts" --relative_path "src/__tests__"
mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/類似テスト.spec.ts"

# テスト実行（失敗確認）
pnpm exec vitest run src/__tests__/NewFeature.spec.ts
```

#### Phase 2: GREEN（最小実装）

```bash
# 既存実装パターンの調査（MCPツール必須）
mcp__serena-mcp__search_for_pattern --substring_pattern "類似機能キーワード" --relative_path "src" --restrict_search_to_code_files true

# 実装後確認
pnpm exec vitest run src/__tests__/NewFeature.spec.ts
pnpm run check:types
```

#### Phase 3: REFACTOR（リファクタリング）

```bash
# 影響範囲確認（MCPツール必須）
mcp__serena-mcp__find_referencing_symbols --name_path "変更シンボル" --relative_path "変更ファイル"

# 品質確認
pnpm run lint:all
pnpm run test:develop
```

## 文書作成コマンド

### ドキュメント生成・管理

#### ドキュメント作成支援

```bash
# 新規ドキュメント作成
pnpm run new:doc

# ドキュメント前書き（YAML front matter）チェック
pnpm run lint:docs
```

#### MCPツールによる文書構造確認

```bash
# 既存ドキュメント構造の確認
mcp__lsmcp__list_dir --relativePath "docs" --recursive true

# ドキュメントパターンの確認
mcp__serena-mcp__find_file --file_mask "*.md" --relative_path "docs"
```

## 設定管理コマンド

### 中央集約設定システム

#### 設定同期・管理

```bash
# 中央設定をパッケージレベルに同期
pnpm run sync:configs

# 設定後の確認
git status
git diff
```

#### MCPツールによる設定確認

```bash
# 中央設定の詳細確認
mcp__serena-mcp__get_symbols_overview --relative_path "configs/設定ファイル"

# パッケージ設定の整合性確認
mcp__serena-mcp__find_file --file_mask "*.config.*" --relative_path "packages/@aglabo/ag-logger/configs"
```

## CI/CDコマンド

### GitHub Actions対応

#### CI環境用コマンド

```bash
# GitHub Actions 用設定
pnpm exec vitest --config ./configs/vitest.config.gha.ts

# 並列実行最適化
pnpm exec vitest --threads=4 --config ./configs/vitest.config.unit.ts
```

#### MCPツールによるCI設定確認

```bash
# GitHub Actions設定確認
mcp__serena-mcp__find_file --file_mask "*.yml" --relative_path ".github"
mcp__serena-mcp__get_symbols_overview --relative_path ".github/workflows/main.yml"
```

## デバッグ・トラブルシューティング

### 問題診断コマンド

#### 依存関係・環境確認

```bash
# 依存関係確認
pnpm list --depth=0
pnpm list --recursive --depth=0

# ワークスペース確認
pnpm ls --recursive

# パッケージ設定確認
cat package.json | grep -A 20 "scripts"
```

#### MCPツールによる問題調査

```bash
# プロジェクト全体の健全性確認
mcp__lsmcp__get_project_overview --root "$ROOT"

# 具体的問題箇所の特定
mcp__lsmcp__lsp_get_diagnostics --relativePath "問題ファイル" --root "$ROOT"

# 関連コードの調査
mcp__serena-mcp__search_for_pattern --substring_pattern "エラーキーワード" --relative_path "src" --restrict_search_to_code_files true
```

### エラー対処フロー

#### 段階的問題解決

```bash
# 1. キャッシュクリア
rm -rf .cache node_modules
pnpm install

# 2. 設定再同期
pnpm run sync:configs

# 3. 段階的チェック（順序重要）
pnpm run check:types
pnpm run lint:all
pnpm run test:develop
pnpm run build

# 4. 完全リセット（最終手段）
git clean -xdf
pnpm install
pnpm run build
```

## 高度な使用例

### パフォーマンス計測

#### 詳細計測コマンド

```bash
# テスト実行時間計測
pnpm test --reporter=verbose | grep "Time:"

# カバレッジ測定
pnpm test --coverage --reporter=html

# ビルド時間計測
time pnpm run build
```

### Windows環境特記事項

#### 環境別注意点

```bash
# Windows固有の注意
# - パス区切りは `/` を使用（`\` ではない）
# - Git Bash または PowerShell 推奨
# - 一部コマンドで `cmd /c` プレフィックス必要

# Windows環境での確認コマンド
echo $SHELL
node --version
pnpm --version
```

## 推奨開発フロー

### 日常開発コマンドセット

#### 標準開発サイクル

```bash
# 1. 作業開始前の理解フェーズ（MCPツール必須）
mcp__lsmcp__get_project_overview --root "$ROOT"
mcp__serena-mcp__search_for_pattern --substring_pattern "対象機能" --relative_path "src"

# 2. 開発中の品質確認
pnpm run check:types        # 型安全性確認
pnpm run test:develop       # 基本テスト実行
pnpm run lint:all          # コード品質チェック
pnpm run format:dprint     # コードフォーマット

# 3. 完了前の最終確認（MCPツール使用）
mcp__serena-mcp__find_referencing_symbols --name_path "変更シンボル" --relative_path "変更ファイル"
pnpm run build             # ビルド確認
```

### リリース前包括チェック

#### 本番環境対応チェック

```bash
# 包括的品質保証（時間をかけた確認）
pnpm run test:ci           # 全テスト実行
pnpm run build             # ビルド確認
pnpm run check:spells      # スペルチェック
pnpm run lint:secrets      # セキュリティチェック

# MCPツールによる最終整合性確認
mcp__lsmcp__lsp_get_diagnostics --relativePath "メインファイル" --root "$ROOT"
```

## MCPツール統合必須化

### すべての開発段階でのMCPツール活用

#### コマンド実行前のMCPツール調査（必須）

```bash
# Before: 既存パターン・構造の理解
mcp__lsmcp__get_project_overview --root "$ROOT"
mcp__serena-mcp__get_symbols_overview --relative_path "対象ファイル"

# During: 実装中の参考情報取得
mcp__serena-mcp__find_symbol --name_path "参考シンボル" --include_body true
mcp__lsmcp__parse_imports --filePath "参考ファイル" --root "$ROOT"

# After: 実装後の影響確認  
mcp__serena-mcp__find_referencing_symbols --name_path "変更シンボル" --relative_path "変更ファイル"
mcp__lsmcp__lsp_get_diagnostics --relativePath "変更ファイル" --root "$ROOT"
```

このコマンドリファレンスを活用することで、ag-loggerプロジェクトの開発効率と品質を最大化できます。
