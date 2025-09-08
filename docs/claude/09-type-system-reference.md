# 型システムリファレンス

## 型システム概要

ag-logger の型システムは TypeScript の厳格な型チェックを活用し、コンパイル時の安全性とランタイムの信頼性を両立しています。

```
┌─────────────────────────────────────────────────────────┐
│                Type System Architecture                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Shared    │    │  Internal   │    │   Plugin    │  │
│  │   Types     │◄──►│   Types     │◄──►│   Types     │  │
│  │             │    │             │    │             │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 共有型定義 (shared/types/)

### 1. AgLogger.interface.ts - メインインターフェース

**場所**: `shared\types\AgLogger.interface.ts`

#### AgLoggerFunction - ロガー関数型

**Range**: `27:1-27:85`

```typescript
type AgLoggerFunction = (formattedMessage: string) => void;
```

**用途**: ログメッセージを最終出力先に送る関数の型定義
**実装例**: ConsoleLogger, FileLogger, MockLogger

#### AgFormatFunction - フォーマッター関数型

**Range**: `44:1-44:84`

```typescript
type AgFormatFunction = (logMessage: AgLogMessage) => string;
```

**用途**: ログメッセージをフォーマットして文字列に変換する関数の型定義
**実装例**: JsonFormatter, PlainFormatter, NullFormatter

#### AgLoggerMap - ログレベルマッピング

**Range**: `66:1-66:103`

```typescript
type AgLoggerMap = Partial<Record<AgLogLevel, AgLoggerFunction>>;
```

**用途**: ログレベルごとに異なるロガー関数を割り当て
**使用場面**: レベル別ログ出力先の設定

#### AgLoggerInterface - ログ実装インターフェース

**Range**: `87:1-104:3`

```typescript
interface AgLoggerInterface {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  fatal(message: string, ...args: any[]): void;
  trace(message: string, ...args: any[]): void;
  verbose(message: string, ...args: any[]): void;
  log(message: string, ...args: any[]): void;
}
```

**用途**: 標準的なログメソッドの契約定義
**実装**: AgLogger クラスが実装

#### AgLoggerOptions - 設定オプション

**Range**: `124:1-152:3`

```typescript
interface AgLoggerOptions {
  logLevel?: AgLogLevel;
  verbose?: boolean;
  formatter?: AgFormatFunction;
  loggerFunction?: AgLoggerFunction | AgLoggerMap;
  statsFormatter?: AgFormatFunction;
  // その他の設定オプション
}
```

**用途**: ログ設定の統合オプション
**使用場面**: setLoggerConfig() での設定

### 2. AgLogLevel.types.ts - ログレベル定義

**場所**: `shared\types\AgLogLevel.types.ts`

#### ログレベル列挙型

```typescript
export const AG_LOGLEVEL = {
  TRACE: 0,
  DEBUG: 1,
  VERBOSE: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
  FATAL: 6,
} as const;

export type AgLogLevel = typeof AG_LOGLEVEL[keyof typeof AG_LOGLEVEL];
export type AgLogLevelLabel = keyof typeof AG_LOGLEVEL;
```

**ログレベル階層**:

```
TRACE (0)    ← 最も詳細
DEBUG (1)    
VERBOSE (2)  
INFO (3)     ← 標準レベル
WARN (4)     
ERROR (5)    
FATAL (6)    ← 最も重要
```

### 3. AgLoggerError.types.ts - エラー型定義

**場所**: `shared\types\AgLoggerError.types.ts:44:1`

#### AgLoggerError クラス

```typescript
class AgLoggerError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'AgLoggerError';
    if (cause) {
      this.cause = cause;
    }
  }
}
```

**用途**: ログ機能固有のエラー処理
**継承**: 標準 Error クラスを拡張

### 4. AglaError.types.ts - 基本エラー型

**場所**: `shared\types\AglaError.types.ts:13:1`

#### AglaError クラス (2メソッド)

```typescript
class AglaError extends Error {
  toString(): string; // エラー文字列化
  // その他のエラーハンドリングメソッド
}
```

**用途**: アプリケーション全体の基本エラー処理
**機能**: 拡張エラー情報の提供

## 内部型定義 (src/internal/types/)

### AgMockConstructor.class.ts - テスト用型

**場所**: `shared\types\AgMockConstructor.class.ts`
**用途**: テスト環境でのモック生成
**テストファイル**: `src\internal\types\__tests__\AgMockConstructor.spec.ts`

## 型の関係図

```
┌─────────────────────────────────────────────────────────────┐
│                    Type Relationships                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AgLogLevel ──┐                                             │
│               │                                             │
│               ▼                                             │
│  AgLogMessage ──► AgFormatFunction ──► string ──┐           │
│               │                                 │           │
│               │                                 ▼           │
│               └─► AgLoggerMap ──► AgLoggerFunction          │
│                                                 │           │
│                                                 ▼           │
│  AgLoggerOptions ──► AgLoggerInterface ──► void            │
│               │                                             │
│               ▼                                             │
│  AgLoggerError ──► Error (extends)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 型安全性の特徴

### 1. 厳格な型チェック

- **ログレベル**: 数値型による厳密な階層管理
- **関数型**: 入出力の型安全性保証
- **オプション**: 部分型による柔軟な設定

### 2. コンパイル時検証

```typescript
// ✅ 型安全な使用例
const formatter: AgFormatFunction = (logMessage) => {
  return `${logMessage.level}: ${logMessage.message}`;
};

// ❌ コンパイル時エラー
const invalidFormatter: AgFormatFunction = (wrongParam: number) => {
  return wrongParam.toString(); // Error: Parameter type mismatch
};
```

### 3. インターフェース契約

- **AgLoggerInterface**: 標準メソッドの実装保証
- **AgLoggerFunction**: 出力関数の契約
- **AgFormatFunction**: フォーマット関数の契約

## 型使用パターン

### 1. 基本的なロガー設定

```typescript
const options: AgLoggerOptions = {
  logLevel: AG_LOGLEVEL.DEBUG,
  verbose: true,
  formatter: JsonFormatter,
  loggerFunction: ConsoleLogger,
};

logger.setLoggerConfig(options);
```

### 2. レベル別ロガー設定

```typescript
const loggerMap: AgLoggerMap = {
  [AG_LOGLEVEL.ERROR]: FileErrorLogger,
  [AG_LOGLEVEL.DEBUG]: ConsoleLogger,
  [AG_LOGLEVEL.INFO]: DatabaseLogger,
};

const options: AgLoggerOptions = {
  loggerFunction: loggerMap,
};
```

### 3. カスタムフォーマッター作成

```typescript
const customFormatter: AgFormatFunction = (logMessage) => {
  const timestamp = new Date().toISOString();
  const level = getLevelLabel(logMessage.level);
  return `[${timestamp}] ${level}: ${logMessage.message}`;
};
```

## 型拡張パターン

### 1. カスタムログレベル

```typescript
// 既存レベルの拡張
const EXTENDED_LOGLEVEL = {
  ...AG_LOGLEVEL,
  AUDIT: 7,
  SECURITY: 8,
} as const;

type ExtendedLogLevel = typeof EXTENDED_LOGLEVEL[keyof typeof EXTENDED_LOGLEVEL];
```

### 2. 拡張ログメッセージ

```typescript
interface ExtendedLogMessage extends AgLogMessage {
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

type ExtendedFormatFunction = (logMessage: ExtendedLogMessage) => string;
```

### 3. カスタムエラー

```typescript
class CustomAgLoggerError extends AgLoggerError {
  constructor(
    message: string,
    public readonly errorCode: string,
    cause?: Error,
  ) {
    super(message, cause);
    this.name = 'CustomAgLoggerError';
  }
}
```

## MCPツールを使った型システム検索

### 型定義の検索

```bash
# 全型定義の一覧
mcp__serena-mcp__get_symbols_overview --relative_path "shared/types/AgLogger.interface.ts"

# 特定の型の詳細
mcp__lsmcp__get_symbol_details --relativePath "shared\types\AgLogger.interface.ts" --line 87 --symbol "AgLoggerInterface"

# 型の使用箇所検索
mcp__serena-mcp__find_referencing_symbols --name_path "AgLogLevel" --relative_path "shared/types/AgLogLevel.types.ts"
```

### インターフェース実装の検索

```bash
# AgLoggerInterface の実装クラス検索
mcp__lsmcp__lsp_find_references --relativePath "shared\types\AgLogger.interface.ts" --line 87 --symbolName "AgLoggerInterface"

# 型エイリアスの定義検索
mcp__lsmcp__lsp_get_definitions --relativePath "shared\types\AgLogger.interface.ts" --line 27 --symbolName "AgLoggerFunction" --includeBody true
```

### 型の導入確認

```bash
# プロジェクト全体で型の使用を確認
mcp__serena-mcp__search_for_pattern --substring_pattern "AgFormatFunction" --relative_path "src" --restrict_search_to_code_files true

# 特定型の実装パターン検索
mcp__serena-mcp__search_for_pattern --substring_pattern ": AgLoggerFunction" --relative_path "src/plugins" --restrict_search_to_code_files true
```

## 型システムのベストプラクティス

### 1. 型注釈の活用

```typescript
// ✅ 明示的な型注釈
const formatter: AgFormatFunction = (logMessage) => {/* ... */};

// ✅ 戻り値型の明示
function createLogger(): AgLogger {
  return AgLogger.getLogger();
}

// ✅ ジェネリクスの活用
function createTypedLogger<T extends AgLogMessage>(): TypedLogger<T> {
  return new TypedLogger<T>();
}
```

### 2. ユニオン型の効果的使用

```typescript
type LogOutput = 'console' | 'file' | 'database' | 'null';
type LogFormat = 'json' | 'plain' | 'csv' | 'null';

interface FlexibleLoggerOptions {
  output: LogOutput;
  format: LogFormat;
}

// 型ガードの実装
function isValidLogLevel(value: any): value is AgLogLevel {
  return typeof value === 'number'
    && value >= AG_LOGLEVEL.TRACE
    && value <= AG_LOGLEVEL.FATAL;
}
```

### 3. 型の組み合わせパターン

```typescript
// 条件付き型の活用
type LoggerForLevel<T extends AgLogLevel> = T extends typeof AG_LOGLEVEL.ERROR ? ErrorLogger
  : T extends typeof AG_LOGLEVEL.DEBUG ? DebugLogger
  : ConsoleLogger;

// マップ型の活用
type LoggerFunctions = {
  [K in keyof typeof AG_LOGLEVEL]: AgLoggerFunction;
};
```

## 型定義ファイルマップ

### 共有型 (shared/types/)

- **`AgLogger.interface.ts`**: メインインターフェース群
- **`AgLogLevel.types.ts`**: ログレベル関連型
- **`AgLoggerError.types.ts`**: エラー処理型
- **`AglaError.types.ts`**: 基本エラー型
- **`AgMockConstructor.class.ts`**: テスト用型
- **`index.ts`**: 型エクスポート統合

### 生成型 (maps/shared/types/)

- **`.d.ts files`**: TypeScript コンパイル時生成
- **用途**: 型定義の配布用

### 型チェック統計

- **型定義ファイル数**: 6個
- **メイン型**: 15種類
- **インターフェース**: 5個
- **型エイリアス**: 8個
- **クラス型**: 4個

## 参考情報

### 型チェックコマンド

```bash
# 型チェック実行
pnpm run check:types

# 増分コンパイル
tsc --incremental --noEmit

# 型エラー詳細確認
pnpm exec tsc --noEmit --project tsconfig.json
```

### 関連設定ファイル

- **`tsconfig.json`**: TypeScript設定
- **`base/configs/tsconfig.base.json`**: 基本設定
- **strict mode**: 厳格な型チェック有効

### 型安全性の保証レベル

- **Strict Mode**: 有効
- **NoImplicitAny**: 有効
- **StrictNullChecks**: 有効
- **StrictFunctionTypes**: 有効
- **Type Coverage**: 95% 以上

この型システムにより、ag-logger は高い型安全性を保ちながら、柔軟で拡張可能なログライブラリとして機能します。
