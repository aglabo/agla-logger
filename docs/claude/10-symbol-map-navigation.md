# シンボルマップとナビゲーション

## 概要

このドキュメントは ag-logger パッケージの全126シンボルを効率的にナビゲートするためのマップです。
lsmcp と serena-mcp でのトークン使用量を最適化し、必要なシンボルに直接アクセスできるように設計されています。

## プロジェクト統計

- **総ファイル数**: 49
- **総シンボル数**: 126
- **クラス数**: 10
- **メソッド数**: 79
- **プロパティ数**: 26
- **関数数**: 1

## コアクラス詳細マップ

### 1. AgLogger (24メソッド) - `src\AgLogger.class.ts:32:1`

**責任**: 抽象ログクラス、シングルトンインスタンス管理、ログレベルフィルタリング

**主要メソッド**:

```typescript
// インスタンス管理
createLogger(): AgLogger          // Range: 57:3-66:4
getLogger(): AgLogger            // Range: 74:3-82:4
resetSingleton(): void           // Range: 324:3-326:4

// 設定管理
setLoggerConfig()                // Range: 91:3-135:4
setFormatter()                   // Range: 158:3-161:4
setLoggerFunction()              // Range: 143:3-146:4

// ログ出力メソッド
debug()                          // Range: 301:3-303:4
info()                           // Range: 296:3-298:4
warn()                           // Range: 291:3-293:4
error()                          // Range: 286:3-288:4
fatal()                          // Range: 281:3-283:4
trace()                          // Range: 306:3-308:4
verbose()                        // Range: 316:3-318:4
log()                            // Range: 311:3-313:4

// 内部処理
executeLog()                     // Range: 250:3-278:4
shouldOutput()                   // Range: 239:3-241:4
```

**MCPツール検索コマンド例**:

```bash
# AgLoggerクラスの詳細取得
mcp__lsmcp__get_symbol_details --relativePath "src\AgLogger.class.ts" --line 32 --symbol "AgLogger"

# executeLogメソッドの詳細
mcp__lsmcp__lsp_get_definitions --relativePath "src\AgLogger.class.ts" --line 250 --symbolName "executeLog" --includeBody true
```

### 2. AgLoggerManager (9メソッド) - `src\AgLoggerManager.class.ts:27:1`

**責任**: ログ実装の管理、ログ関数のバインド、設定の統合管理

**主要メソッド**:

```typescript
// インスタンス管理
createManager(); // Range: 43:3-55:4
getManager(); // Range: 64:3-73:4
resetSingleton(); // Range: 198:3-203:4

// ログ管理
getLogger(); // Range: 81:3-89:4
setLogger(); // Range: 98:3-107:4
setLoggerConfig(); // Range: 121:3-130:4

// 関数バインド
bindLoggerFunction(); // Range: 140:3-150:4
removeLoggerFunction(); // Range: 186:3-196:4
updateLoggerMap(); // Range: 158:3-167:4
```

### 3. AgLoggerConfig (19メソッド) - `src\internal\AgLoggerConfig.class.ts:49:1`

**責任**: ログ設定の管理、フォーマッター/ロガー設定、統計情報管理

**主要メソッド**:

```typescript
// 設定取得・設定
defaultLogger(); // フォーマッター取得
formatter(); // フォーマッター設定
getStatsFormatter(); // 統計フォーマッター取得
hasStatsFormatter(); // 統計フォーマッター存在確認

// ログレベル管理
logLevel(); // ログレベル取得・設定
isVerbose(); // 詳細ログ確認
setVerbose(); // 詳細ログ設定

// マップ管理
clearLoggerMap(); // ログマップクリア
```

## プラグインクラス

### Formatter プラグイン

1. **JsonFormatter** - `src\plugins\formatter\JsonFormatter.ts:21:14`
2. **PlainFormatter** - `src\plugins\formatter\PlainFormatter.ts`
3. **NullFormatter** - `src\plugins\formatter\NullFormatter.ts`
4. **MockFormatter** - `src\plugins\formatter\MockFormatter.ts`
5. **AgMockFormatter** - `src\plugins\formatter\AgMockFormatter.ts:35:1`

### Logger プラグイン

1. **ConsoleLogger** - `src\plugins\logger\ConsoleLogger.ts`
2. **NullLogger** - `src\plugins\logger\NullLogger.ts`
3. **MockLogger** - `src\plugins\logger\MockLogger.ts`
4. **E2eMockLogger** - `src\plugins\logger\E2eMockLogger.ts`
5. **AgMockBufferLogger** - `src\plugins\logger\MockLogger.ts:38:1` (23メソッド)

## エラー処理クラス

### AglaError - `shared\types\AglaError.types.ts:13:1`

**責任**: 基本エラーハンドリング

```typescript
toString(); // エラーメッセージ文字列化
```

### AgLoggerError - `shared\types\AgLoggerError.types.ts:44:1`

**責任**: ログ固有エラー処理

## ユーティリティ関数

### 主要ユーティリティファイル

- **AgLoggerGetMessage.ts**: メッセージ抽出ユーティリティ
- **AgLoggerMethod.ts**: ログメソッドヘルパー
- **AgLogHelpers.ts**: 汎用ヘルパー関数
- **AgLogValidators.ts**: ログレベル検証
- **testIdUtils.ts**: テストID生成

## 型定義とインターフェース

### 主要型定義 - `shared\types\AgLogger.interface.ts`

```typescript
AgLoggerFunction; // Range: 27:1-27:85
AgFormatFunction; // Range: 44:1-44:84
AgLoggerMap; // Range: 66:1-66:103
AgLoggerInterface; // Range: 87:1-104:3
AgLoggerOptions; // Range: 124:1-152:3
```

## 効率的な検索戦略

### 1. クラス検索

```bash
# 全クラス一覧
mcp__lsmcp__search_symbols --kind ["Class"]

# 特定クラスの詳細
mcp__lsmcp__get_symbol_details --relativePath "src\AgLogger.class.ts" --line 32 --symbol "AgLogger"
```

### 2. メソッド検索

```bash
# 特定メソッドの実装
mcp__serena-mcp__find_symbol --name_path "AgLogger/executeLog" --include_body true

# メソッドの参照箇所
mcp__serena-mcp__find_referencing_symbols --name_path "executeLog" --relative_path "src/AgLogger.class.ts"
```

### 3. プラグイン検索

```bash
# フォーマッタープラグイン
mcp__serena-mcp__find_symbol --name_path "JsonFormatter" --relative_path "src/plugins/formatter"

# ロガープラグイン  
mcp__serena-mcp__find_symbol --name_path "ConsoleLogger" --relative_path "src/plugins/logger"
```

## よく使用されるシンボル

### トップ10使用頻度の高いシンボル

1. **AgLogger** - 21参照箇所
2. **AgLoggerManager** - メイン管理クラス
3. **executeLog** - ログ実行の中核処理
4. **createLogger** - インスタンス生成
5. **setLoggerConfig** - 設定管理
6. **JsonFormatter** - JSON出力フォーマット
7. **ConsoleLogger** - コンソール出力
8. **AgLoggerOptions** - 設定型定義
9. **AgLogLevel** - ログレベル型
10. **validateLogLevel** - ログレベル検証

## MCPツールによる高度な検索パターン

### 1. 階層的検索（推奨）

```bash
# Level 1: プロジェクト概要
mcp__lsmcp__get_project_overview --root "C:\Users\atsushifx\workspaces\develop\ag-logger\packages\@aglabo\ag-logger"

# Level 2: クラス一覧
mcp__lsmcp__search_symbols --kind ["Class"] --root "$ROOT"

# Level 3: 特定クラス詳細
mcp__lsmcp__get_symbol_details --relativePath "src\AgLogger.class.ts" --line 32 --symbol "AgLogger" --root "$ROOT"

# Level 4: 特定メソッド実装
mcp__lsmcp__lsp_get_definitions --relativePath "src\AgLogger.class.ts" --line 250 --symbolName "executeLog" --includeBody true --root "$ROOT"
```

### 2. パターン別検索

```bash
# パターン検索: create で始まる関数
mcp__serena-mcp__search_for_pattern --substring_pattern "create" --relative_path "src" --restrict_search_to_code_files true

# パターン検索: validate で始まる関数
mcp__serena-mcp__search_for_pattern --substring_pattern "validate" --relative_path "src/utils" --restrict_search_to_code_files true

# パターン検索: Mock 関連
mcp__lsmcp__search_symbols --query "Mock" --root "$ROOT"
```

### 3. 依存関係分析

```bash
# AgLogger の全参照箇所（21箇所）
mcp__lsmcp__lsp_find_references --relativePath "src\AgLogger.class.ts" --line 32 --symbolName "AgLogger" --root "$ROOT"

# executeLog メソッドの使用箇所
mcp__serena-mcp__find_referencing_symbols --name_path "executeLog" --relative_path "src/AgLogger.class.ts"

# validateLogLevel の使用箇所
mcp__serena-mcp__find_referencing_symbols --name_path "validateLogLevel" --relative_path "src/utils/AgLogValidators.ts"
```

### 4. テスト関連検索

```bash
# 全テストファイル
mcp__serena-mcp__search_for_pattern --substring_pattern "\.spec\.ts$" --relative_path "src" --restrict_search_to_code_files true

# 特定クラスのテスト
mcp__serena-mcp__find_file --file_mask "*AgLogger*.spec.ts" --relative_path "src"

# プラグインテスト
mcp__serena-mcp__find_file --file_mask "*.spec.ts" --relative_path "src/plugins"
```

## トークン最適化戦略

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
# Stage 1: 概要把握
mcp__lsmcp__get_project_overview --root "$ROOT"

# Stage 2: 目的のシンボル特定
mcp__lsmcp__search_symbols --query "目的のキーワード" --root "$ROOT"

# Stage 3: シンボル詳細
mcp__lsmcp__get_symbol_details --relativePath "ファイルパス" --line "行番号" --symbol "シンボル名" --root "$ROOT"

# Stage 4: 実装確認（必要時のみ）
mcp__lsmcp__lsp_get_definitions --relativePath "ファイルパス" --line "行番号" --symbolName "メソッド名" --includeBody true --root "$ROOT"
```

## 頻繁に使用するコマンドセット

### 日常的な開発作業

```bash
# パターン 1: クラス実装確認
mcp__lsmcp__search_symbols --query "クラス名" --root "$ROOT"
mcp__lsmcp__get_symbol_details --relativePath "パス" --line "行" --symbol "クラス名" --root "$ROOT"

# パターン 2: メソッド実装確認  
mcp__serena-mcp__find_symbol --name_path "クラス名/メソッド名" --include_body true --relative_path "src"

# パターン 3: 使用箇所確認
mcp__serena-mcp__find_referencing_symbols --name_path "シンボル名" --relative_path "ファイルパス"

# パターン 4: テスト確認
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

## シンボル分類

### コア機能シンボル (52個)

- **AgLogger**: 24メソッド
- **AgLoggerManager**: 9メソッド
- **AgLoggerConfig**: 19メソッド

### プラグインシンボル (33個)

- **Formatter**: 5種類のプラグイン
- **Logger**: 4種類のプラグイン
- **Mock**: 4種類のテスト用

### ユーティリティシンボル (25個)

- **5つのユーティリティファイル**
- **バリデーション関数**
- **ヘルパー関数**

### 型定義シンボル (16個)

- **インターフェース**: 5個
- **型エイリアス**: 8個
- **エラークラス**: 3個

## エラー回避のベストプラクティス

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

このシンボルマップを活用することで、ag-logger コードベースを効率的にナビゲートし、必要な情報に最小限のトークンでアクセスできます。
