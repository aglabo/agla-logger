---
header:
  - src: 04-code-navigation.md
  - @(#): Code Navigation and Project Understanding
title: agla-logger
description: AIコーディングエージェント向けプロジェクトナビゲーション・コード検索戦略
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

## プロジェクトナビゲーション・コード検索

このドキュメントはAIコーディングエージェントがagla-loggerプロジェクトを効率的にナビゲート・理解するための戦略とMCPコマンド集を提供します。
トークン効率的なコード検索と段階的プロジェクト理解を実現します。

## 必須ナビゲーション戦略

### 段階的理解アプローチ

🔴 **必須**: 以下の順序でプロジェクト理解を進行

```bash
1. プロジェクト概要把握 → 全体構造理解
2. 関連シンボル検索 → 対象機能の特定
3. 詳細コード調査 → 実装パターン理解
4. 影響範囲確認 → 依存関係の把握
```

### トークン効率化原則

- ファイル全体読み込みは最後の手段
- シンボル検索とパターン検索を優先活用
- 必要な部分のみの段階的読み込み

## 基本ナビゲーションコマンド

### プロジェクト全体理解

```bash
# プロジェクト概要とパッケージ構造把握
mcp__lsmcp__get_project_overview --root "$ROOT"

# ディレクトリ構造確認
mcp__serena-mcp__list_dir --relative_path "." --recursive true

# 主要シンボル概要
mcp__serena-mcp__get_symbols_overview --relative_path "src"
```

### 主要クラス・インターフェース検索

```bash
# クラス一覧取得
mcp__lsmcp__search_symbols --kind ["Class"] --root "$ROOT"

# 主要ロガークラス
mcp__lsmcp__search_symbols --query "AgLogger" --root "$ROOT"
mcp__lsmcp__search_symbols --query "AgLoggerManager" --root "$ROOT"
mcp__lsmcp__search_symbols --query "AgLoggerConfig" --root "$ROOT"

# フォーマッター関連
mcp__lsmcp__search_symbols --query "Formatter" --root "$ROOT"

# ロガーインターフェース
mcp__lsmcp__search_symbols --query "Logger" --root "$ROOT"

# テスト・モック関連
mcp__lsmcp__search_symbols --query "Mock" --root "$ROOT"
```

## 機能別検索戦略

### エラーハンドリング調査

```bash
# エラー関連クラス・型検索
mcp__lsmcp__search_symbols --query "Error" --root "$ROOT"

# エラーメッセージパターン検索
mcp__serena-mcp__search_for_pattern --substring_pattern "エラーメッセージ" --relative_path "src" --restrict_search_to_code_files true

# 特定エラー関数の詳細
mcp__serena-mcp__find_symbol --name_path "関数名" --include_body true --relative_path "src"
```

### ユーティリティ機能検索

```bash
# バリデーション関数検索
mcp__serena-mcp__search_for_pattern --substring_pattern "validate" --relative_path "src/utils" --restrict_search_to_code_files true

# 作成系関数検索
mcp__serena-mcp__search_for_pattern --substring_pattern "create" --relative_path "src" --restrict_search_to_code_files true
```

### テストファイル・設定ファイル検索

```bash
# テストファイル検索
mcp__serena-mcp__search_for_pattern --substring_pattern "\.spec\.ts$" --relative_path "src" --restrict_search_to_code_files true

# package.json のスクリプト確認
mcp__serena-mcp__search_for_pattern --substring_pattern "\"scripts\":" --relative_path "." --context_lines_after 20

# 設定ファイル内容検索
mcp__serena-mcp__search_for_pattern --substring_pattern "設定キー" --relative_path "." --context_lines_after 3
```

## 詳細調査コマンド

### シンボル詳細情報取得

```bash
# シンボル詳細とリファレンス
mcp__lsmcp__get_symbol_details --relativePath "ファイルパス" --line "行番号" --symbol "シンボル名"

# 型定義確認
mcp__lsmcp__lsp_get_definitions --symbolName "型名" --relativePath "ファイルパス" --line "行番号"

# 使用箇所確認
mcp__lsmcp__lsp_find_references --symbolName "シンボル名" --relativePath "ファイルパス" --line "行番号"
```

### 実装パターン調査

```bash
# クラス詳細 (メソッド一覧含む)
mcp__serena-mcp__find_symbol --name_path "クラス名" --depth 1 --include_body false

# 特定メソッド実装詳細
mcp__serena-mcp__find_symbol --name_path "クラス名/メソッド名" --include_body true --relative_path "src"

# インターフェース実装パターン
mcp__serena-mcp__search_for_pattern --substring_pattern "implements.*インターフェース名" --relative_path "src" --restrict_search_to_code_files true
```

## プロジェクト特化検索パターン

### agla-logger コア機能

```bash
# ロガーコア実装
mcp__lsmcp__search_symbols --query "AgLogger" --root "$ROOT"

# インターフェース・契約
mcp__lsmcp__search_symbols --query "AgLoggerInterface" --root "$ROOT"

# フォーマッター実装
mcp__lsmcp__search_symbols --query "Formatter" --root "$ROOT"
mcp__lsmcp__search_symbols --query "Logger" --root "$ROOT"

# 作成系メソッド
mcp__lsmcp__search_symbols --kind ["Method"] --query "create" --root "$ROOT"
```

### 型システム調査

```bash
# 型定義検索
mcp__lsmcp__search_symbols --kind ["Class"] --root "$ROOT"

# フォーマッター型
mcp__lsmcp__search_symbols --query "Formatter" --root "$ROOT"

# 型エイリアス・関数型
mcp__serena-mcp__search_for_pattern --substring_pattern "AgFormatFunction" --relative_path "shared/types" --restrict_search_to_code_files true

# エラー型システム
mcp__serena-mcp__search_for_pattern --substring_pattern "Error" --relative_path "src" --restrict_search_to_code_files true
```

## 効率的検索テクニック

### 段階的検索戦略

```bash
# Step 1: 概要把握
mcp__lsmcp__get_project_overview --root "$ROOT"

# Step 2: キーワード検索
mcp__lsmcp__search_symbols --query "関連キーワード" --root "$ROOT"

# Step 3: パターン検索
mcp__serena-mcp__search_for_pattern --substring_pattern "詳細パターン" --relative_path "対象ディレクトリ"

# Step 4: 詳細調査
mcp__serena-mcp__find_symbol --name_path "特定シンボル" --include_body true
```

### 検索結果最適化

- `--kind` パラメータでシンボル種別を限定
- `--relative_path` で検索範囲を限定
- `--restrict_search_to_code_files` でコードファイルのみに限定
- `--context_lines_before/after` でコンテキスト行数を調整

## 実装時の調査フロー

### 新機能実装前

```bash
1. 関連既存機能の検索
   mcp__lsmcp__search_symbols --query "関連機能名"

2. 実装パターンの調査
   mcp__serena-mcp__find_symbol --name_path "参考クラス" --depth 1

3. テストパターンの確認
   mcp__serena-mcp__search_for_pattern --substring_pattern "test.*関連機能"

4. 依存関係の確認
   mcp__lsmcp__lsp_find_references --symbolName "関連シンボル"
```

### バグ修正・改善時

```bash
1. エラー発生箇所の特定
   mcp__serena-mcp__search_for_pattern --substring_pattern "エラーキーワード"

2. 関連コードの調査
   mcp__serena-mcp__find_symbol --name_path "問題シンボル" --include_body true

3. 影響範囲の確認
   mcp__lsmcp__lsp_find_references --symbolName "変更対象"

4. テストの確認
   mcp__serena-mcp__search_for_pattern --substring_pattern "test.*対象機能"
```

## メモリ効率化戦略

### プロジェクトメモリ活用

```bash
# メモリ一覧確認
mcp__lsmcp__list_memories --root "$ROOT"

# 関連メモリ読み込み
mcp__lsmcp__read_memory --memoryName "関連メモリ名" --root "$ROOT"

# 新規メモリ作成
mcp__lsmcp__write_memory --memoryName "調査結果" --content "調査内容" --root "$ROOT"
```

### トークン使用量最小化

- 必要な情報のみを段階的に取得
- ファイル全体読み込み前に概要・シンボル情報で絞り込み
- 検索結果が多い場合は条件を詳細化
- メモリ機能で既知情報を保存・再利用

---

### See Also

- [01-core-principles.md](01-core-principles.md) - AI開発核心原則
- [03-mcp-tools-usage.md](03-mcp-tools-usage.md) - MCPツール完全ガイド
- [05-quality-assurance.md](05-quality-assurance.md) - 品質ゲート詳細

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
