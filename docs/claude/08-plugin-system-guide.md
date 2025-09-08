# プラグインシステムガイド

## プラグインアーキテクチャ概要

ag-logger のプラグインシステムは **Strategy Pattern** を採用し、フォーマッターとロガーを動的に切り替え可能な設計になっています。

```
┌─────────────────────────────────────────────────────────┐
│                Plugin Architecture                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│     ┌─────────────┐              ┌─────────────┐        │
│     │   AgLogger  │◄────────────►│AgLoggerConfig│       │
│     │             │              │             │        │
│     └─────────────┘              └─────────────┘        │
│            │                            │                │
│            │                            │                │
│     ┌──────▼──────┐              ┌──────▼──────┐        │
│     │  Formatters │              │   Loggers   │        │
│     │  (Strategy) │              │ (Strategy)  │        │
│     └─────────────┘              └─────────────┘        │
│            │                            │                │
│     ┌──────▼──────────────────────────────────▼──────┐  │
│     │              Plugin Implementations            │  │
│     └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Formatter プラグイン (5種類)

### 1. JsonFormatter - 構造化JSON出力

**場所**: `src\plugins\formatter\JsonFormatter.ts:21:14`
**目的**: ログデータを構造化JSONとして出力

```typescript
// 実装構造
const JsonFormatter: AgFormatFunction = (logMessage) => {
  const levelLabel = getLevelLabel(logMessage.level); // Range: 22:9-22:52
  const logEntry = { // Range: 23:9-28:4
    timestamp: new Date().toISOString(), // Range: 24:5-24:50
    level: levelLabel, // Range: 25:5-25:45
    message: logMessage.message, // Range: 26:5-26:32
    ...logMessage.context && { context: logMessage.context }, // Range: 27:5-27:65
  };
  return JSON.stringify(logEntry); // Range: 30:3-30:35
};
```

**利用場面**:

- 構造化ログが必要な本番環境
- ログ解析システムとの連携
- JSON形式でのログ保存

**MCPツール検索コマンド**:

```bash
mcp__lsmcp__get_symbol_details --relativePath "src\plugins\formatter\JsonFormatter.ts" --line 21 --symbol "JsonFormatter"
```

### 2. PlainFormatter - シンプルテキスト出力

**場所**: `src\plugins\formatter\PlainFormatter.ts`
**目的**: 人間が読みやすいプレーンテキスト出力

**特徴**:

- タイムスタンプ付き
- ログレベル表示
- シンプルな1行形式

**利用場面**:

- 開発時のデバッグ
- コンソール出力
- シンプルなログファイル

### 3. NullFormatter - 無処理フォーマッター

**場所**: `src\plugins\formatter\NullFormatter.ts`
**目的**: フォーマット処理を行わない

**特徴**:

- パフォーマンス最適化
- テスト時のオーバーヘッド削減
- 無効化されたログ出力

**利用場面**:

- 本番環境でのログ無効化
- パフォーマンステスト
- ログ出力の無効化

### 4. MockFormatter - テスト用モック

**場所**: `src\plugins\formatter\MockFormatter.ts`
**目的**: テスト用のモックフォーマッター

**特徴**:

- 設定可能な動作
- エラー投入機能
- テストアサーション支援

**関連クラス**:

- **ErrorThrowFormatter** (Range: 19:1) - エラー投入専用フォーマッター
- **createMockFormatter** - モック生成ヘルパー関数

### 5. AgMockFormatter - 高度なモック

**場所**: `src\plugins\formatter\AgMockFormatter.ts:35:1`\
**目的**: 高度なテストシナリオ対応

**特徴**:

- より複雑なモック機能
- 統計情報の収集
- カスタマイズ可能な応答

## Logger プラグイン (4種類)

### 1. ConsoleLogger - 標準コンソール出力

**場所**: `src\plugins\logger\ConsoleLogger.ts`
**目的**: 標準的なコンソール出力

**特徴**:

- console.log, console.warn, console.error の使い分け
- ログレベルに応じた出力先選択
- 開発環境での標準ロガー

**利用場面**:

- 開発時のリアルタイムデバッグ
- ブラウザでのログ確認
- Node.js アプリケーションのログ出力

### 2. NullLogger - 無出力ロガー

**場所**: `src\plugins\logger\NullLogger.ts`\
**目的**: ログ出力を行わない

**特徴**:

- 完全な無出力
- パフォーマンス最適化
- 本番環境での無効化

**利用場面**:

- 本番環境でのログ無効化
- パフォーマンステスト
- ログ出力のオーバーヘッド削減

### 3. MockLogger - 基本テストロガー

**場所**: `src\plugins\logger\MockLogger.ts`
**目的**: テスト用の基本モックロガー

**関連クラス**:

- **AgMockBufferLogger** (Range: 38:1, 23メソッド) - バッファ付きモックロガー

**特徴**:

- ログ内容のキャプチャ
- テストアサーション支援
- 出力内容の検証機能

### 4. E2eMockLogger - E2Eテスト専用

**場所**: `src\plugins\logger\E2eMockLogger.ts`
**目的**: エンドツーエンドテスト専用のロガー

**特徴**:

- 統合テストシナリオ対応
- より複雑なテスト状況の再現
- E2Eテストでの動作検証

## プラグイン型定義

### AgFormatFunction - フォーマッター型

**場所**: `shared\types\AgLogger.interface.ts:44:1-44:84`

```typescript
type AgFormatFunction = (logMessage: AgLogMessage) => string;
```

### AgLoggerFunction - ロガー型

**場所**: `shared\types\AgLogger.interface.ts:27:1-27:85`

```typescript
type AgLoggerFunction = (formattedMessage: string) => void;
```

## プラグイン使用パターン

### 1. 基本的な設定

```typescript
// JsonFormatterとConsoleLoggerの組み合わせ
const logger = AgLogger.getLogger();
logger.setFormatter(JsonFormatter);
// ConsoleLoggerはデフォルト設定
```

### 2. レベル別ロガー設定

```typescript
// レベルごとに異なるロガーを設定
const config = logger.getConfig();
config.setLoggerFunction(LOGLEVEL.ERROR, CustomErrorLogger);
config.setLoggerFunction(LOGLEVEL.DEBUG, ConsoleLogger);
```

### 3. テスト環境設定

```typescript
// テスト用の組み合わせ
logger.setFormatter(NullFormatter); // フォーマット無効
config.defaultLogger(MockLogger); // モックロガー使用
```

## カスタムプラグイン作成

### 1. カスタムFormatter作成

```typescript
// カスタムフォーマッターの実装例
const TimestampFormatter: AgFormatFunction = (logMessage) => {
  const timestamp = new Date().toLocaleTimeString();
  return `[${timestamp}] ${logMessage.level}: ${logMessage.message}`;
};

// 設定への適用
logger.setFormatter(TimestampFormatter);
```

### 2. カスタムLogger作成

```typescript
// ファイル出力ロガーの実装例
const FileLogger: AgLoggerFunction = (formattedMessage) => {
  fs.appendFileSync('app.log', formattedMessage + '\n');
};

// レベル別設定
config.setLoggerFunction(LOGLEVEL.ERROR, FileLogger);
```

## プラグイン組み合わせパターン

### 1. 開発環境パターン

```typescript
Formatter: PlainFormatter; // 読みやすいテキスト
Logger: ConsoleLogger; // コンソール出力
```

### 2. 本番環境パターン

```typescript
Formatter: JsonFormatter; // 構造化データ
Logger: FileLogger; // ファイル出力
```

### 3. テスト環境パターン

```typescript
Formatter: MockFormatter; // テスト用モック
Logger: MockLogger; // アサーション用
```

### 4. 無効化パターン

```typescript
Formatter: NullFormatter; // 無処理
Logger: NullLogger; // 無出力
```

## MCPツールを使ったプラグインナビゲーション

### Formatter 検索

```bash
# 全フォーマッター一覧
mcp__serena-mcp__find_symbol --name_path "Formatter" --relative_path "src/plugins/formatter" --substring_matching true

# 特定フォーマッターの詳細
mcp__lsmcp__get_symbol_details --relativePath "src\plugins\formatter\JsonFormatter.ts" --line 21 --symbol "JsonFormatter"

# フォーマッター実装の確認
mcp__serena-mcp__get_symbols_overview --relative_path "src/plugins/formatter/PlainFormatter.ts"
```

### Logger 検索

```bash
# 全ロガー一覧
mcp__serena-mcp__find_symbol --name_path "Logger" --relative_path "src/plugins/logger" --substring_matching true

# MockLoggerの詳細
mcp__lsmcp__get_symbol_details --relativePath "src\plugins\logger\MockLogger.ts" --line 38 --symbol "AgMockBufferLogger"

# ロガー構造確認
mcp__serena-mcp__get_symbols_overview --relative_path "src/plugins/logger/E2eMockLogger.ts"
```

### プラグインテストの検索

```bash
# プラグインテストファイル
mcp__serena-mcp__find_file --file_mask "*.spec.ts" --relative_path "src/plugins"

# 特定プラグインのテスト
mcp__serena-mcp__find_file --file_mask "*JsonFormatter*.spec.ts" --relative_path "src/plugins/formatter/__tests__"
```

## プラグイン拡張のベストプラクティス

### 1. 型安全性の確保

- AgFormatFunction, AgLoggerFunction 型を厳密に実装
- TypeScript の型チェックを活用

```typescript
// ✅ 型安全な実装
const safeFormatter: AgFormatFunction = (logMessage: AgLogMessage): string => {
  return `${logMessage.level}: ${logMessage.message}`;
};

// ❌ 型不安全な実装
const unsafeFormatter = (wrongParam: any) => {
  return wrongParam.toString(); // 型エラー
};
```

### 2. エラーハンドリング

- フォーマッター/ロガーでの例外処理
- 障害時のフォールバック機能

```typescript
const robustFormatter: AgFormatFunction = (logMessage) => {
  try {
    return JSON.stringify(logMessage);
  } catch (error) {
    // フォールバック: プレーンテキスト
    return `${logMessage.level}: ${logMessage.message}`;
  }
};
```

### 3. パフォーマンス考慮

- 不要な処理の回避
- 遅延評価の活用

```typescript
const optimizedFormatter: AgFormatFunction = (logMessage) => {
  // 重い処理は必要時のみ実行
  if (logMessage.level >= LOGLEVEL.ERROR) {
    return expensiveFormatting(logMessage);
  }
  return simpleFormatting(logMessage);
};
```

### 4. テスタビリティ

- モック可能な設計
- 単体テストの容易性

```typescript
// テストしやすいプラグイン設計
export class ConfigurableFormatter implements AgFormatFunction {
  constructor(private config: FormatterConfig) {}

  format(logMessage: AgLogMessage): string {
    return this.config.template
      .replace('{level}', logMessage.level)
      .replace('{message}', logMessage.message);
  }
}
```

### 5. 設定の分離

- 環境ごとの設定分離
- 実行時の動的切り替え

```typescript
// 環境別設定例
const createEnvironmentConfig = (env: string): AgLoggerOptions => {
  switch (env) {
    case 'production':
      return {
        formatter: JsonFormatter,
        loggerFunction: FileLogger,
      };
    case 'development':
      return {
        formatter: PlainFormatter,
        loggerFunction: ConsoleLogger,
      };
    case 'test':
      return {
        formatter: MockFormatter,
        loggerFunction: MockLogger,
      };
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
};
```

## 参考情報

### プラグイン関連ファイル

- **Formatters**: `src/plugins/formatter/` (5ファイル)
- **Loggers**: `src/plugins/logger/` (4ファイル)
- **Types**: `shared/types/AgLogger.interface.ts`
- **Tests**: `src/plugins/*//__tests__/` (各プラグインテスト)

### プラグインテストファイル数

- **Formatter Tests**: 約10ファイル
- **Logger Tests**: 約8ファイル
- **総プラグインテスト**: 約18ファイル

### 主要プラグイン統計

- **Formatter プラグイン**: 5種類
- **Logger プラグイン**: 4種類
- **Mock プラグイン**: 4種類（テスト用）
- **総プラグイン数**: 9種類

このプラグインシステムにより、ag-logger は高い拡張性と柔軟性を持ち、様々な環境や用途に対応できます。
