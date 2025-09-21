---
header:
  - src: 04-type-definitions.md
  - @(#): Type Definitions & Constants API
title: 型定義・定数 API
description: TypeScript型定義・定数・インターフェース仕様書
version: 1.0.0
created: 2025-01-25
authors:
  - atsushifx
changes:
  - 2025-01-25: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

このページは **agla-logger の TypeScript 型システム**の完全なリファレンスです。
型安全なログ実装に必要なすべての型定義、定数、インターフェースを詳細に解説します。

## 🎯 対象読者

- TypeScript でのタイプセーフなログ実装
- カスタムプラグイン開発時の型制約理解
- ログレベル制御の詳細仕様確認
- プラグインインターフェース実装

---

## 📊 ログレベル定数

### AG_LOGLEVEL

ログレベルを定義する基本定数。AWS CloudWatch Logs 準拠の数値レベル。

```typescript
const AG_LOGLEVEL = {
  /** No logging output. */
  OFF: 0,
  /** Fatal errors that cause application termination. */
  FATAL: 1,
  /** Error conditions that don't stop the application. */
  ERROR: 2,
  /** Warning messages for potentially harmful situations. */
  WARN: 3,
  /** General informational messages. */
  INFO: 4,
  /** Detailed information for debugging. */
  DEBUG: 5,
  /** Very detailed tracing information. */
  TRACE: 6,
  // special level
  /** special level: verbose mode */
  VERBOSE: -11,
  /** special level: LOG output (force output) */
  LOG: -12,
  /** Special level: default (defaultLogger: LogLevel  is same for INFO) */
  DEFAULT: -99,
} as const;
```

#### 使用例 (AG_LOGLEVEL)

```typescript
import { AG_LOGLEVEL, AgLogger } from '@aglabo/agla-logger-core';

// 基本的なログレベル設定
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO, // INFO レベル以上を出力
});

// 特殊レベルの使用
logger.setLogLevel(AG_LOGLEVEL.VERBOSE); // 詳細モード
```

---

## 🔢 型定義

### AgLogLevel

ログレベルの型定義。AG_LOGLEVEL 定数から生成される union type。

```typescript
export type AgLogLevel = typeof AG_LOGLEVEL[keyof typeof AG_LOGLEVEL];
// 実際の型: 0 | 1 | 2 | 3 | 4 | 5 | 6 | -11 | -12 | -99
```

### AgLogLevelLabel

ログレベルラベルの文字列型。

```typescript
export type AgLogLevelLabel =
  | 'OFF'
  | 'FATAL'
  | 'ERROR'
  | 'WARN'
  | 'INFO'
  | 'DEBUG'
  | 'TRACE'
  | 'VERBOSE'
  | 'LOG'
  | 'DEFAULT';
```

---

## 📄 ログメッセージ構造

### AgLogMessage

内部で使用されるログメッセージの構造体。

```typescript
export type AgLogMessage = {
  /**
   * Log level indicating the severity of the log entry.
   * Uses numeric levels based on AWS CloudWatch Logs convention:
   * OFF (0), FATAL (1), ERROR (2), WARN (3), INFO (4), DEBUG (5), TRACE (6).
   *
   * @example AG_LOGLEVEL.INFO (4)
   */
  readonly logLevel: AgLogLevel;

  /**
   * Timestamp for the log entry.
   * If provided as first argument, uses that timestamp; otherwise uses current time.
   *
   * @example new Date('2023-12-01T10:30:00Z')
   */
  readonly timestamp: Date;

  /**
   * Formatted log message string.
   * Concatenated from primitive arguments such as strings, numbers, booleans.
   * Non-primitive arguments are stored in the args array instead.
   *
   * @example "User logged in successfully"
   */
  readonly message: string;

  /**
   * Structured arguments excluded from message output.
   * Typically includes object-like context (e.g. user info, metadata).
   * These are not included in the message string but can be used by formatters.
   *
   * @example [{ userId: 123, sessionId: 'abc123' }]
   */
  readonly args: readonly unknown[];
};
```

#### 使用例 (AgLogMessage)

```typescript
// AgLogMessage は内部的に生成されますが、カスタムフォーマッター開発時に使用
function customFormatter(logMessage: AgLogMessage): string {
  return `[${logMessage.timestamp.toISOString()}] ${logMessage.message}`;
}
```

### AgFormattedLogMessage

フォーマット済みログメッセージ。

```typescript
export type AgFormattedLogMessage = string;
```

---

## ⚙️ 設定オプション型

### AgLoggerOptions

AgLogger 作成時の設定オプション。

```typescript
export type AgLoggerOptions = {
  /**
   * Default logger function to use for all log levels unless overridden by loggerMap.
   */
  defaultLogger?: AgLoggerFunction;

  /**
   * Formatter function to format log messages before passing to logger functions.
   */
  formatter?: AgFormatterInput;

  /**
   * Log level setting that controls which log messages are output.
   * Messages at or above this level will be processed.
   */
  logLevel?: AgLogLevel;

  /**
   * Verbose mode setting that controls additional diagnostic output.
   * When enabled, verbose() method calls will produce output.
   */
  verbose?: boolean;

  /**
   * Partial map of logger functions for specific log levels.
   * Overrides defaultLogger for specified levels.
   */
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
};
```

#### 使用例 (AgLoggerOptions)

```typescript
import { AG_LOGLEVEL, AgLoggerOptions, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger-core';

const options: AgLoggerOptions = {
  logLevel: AG_LOGLEVEL.DEBUG,
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  verbose: true,
};

const logger = AgLogger.createLogger(options);
```

---

## 🔌 プラグインインターフェース

### AgFormatFunction

フォーマッター関数の型定義。

```typescript
export type AgFormatFunction = (logMessage: AgLogMessage) => AgFormattedLogMessage;
```

#### 実装例 (AgFormatFunction)

```typescript
const customFormatter: AgFormatFunction = (logMessage) => {
  const level = Object.keys(AG_LOGLEVEL).find(
    (key) => AG_LOGLEVEL[key as keyof typeof AG_LOGLEVEL] === logMessage.logLevel,
  );
  return `${level}: ${logMessage.message}`;
};
```

### AgLoggerFunction

ロガー関数の型定義。

```typescript
export type AgLoggerFunction = (formattedLogMessage: AgFormattedLogMessage) => void;
```

#### 実装例 (AgLoggerFunction)

```typescript
const customLogger: AgLoggerFunction = (formattedMessage) => {
  // カスタム出力処理
  process.stdout.write(formattedMessage + '\n');
};
```

### AgFormatterInput

フォーマッター入力の共用型。

```typescript
export type AgFormatterInput = AgFormatFunction | AgMockConstructor;
```

---

## 🗺️ ロガーマップ型

### AgLoggerMap

レベル別ロガー関数のマッピング。

```typescript
export type AgLoggerMap<T> = {
  [AG_LOGLEVEL.OFF]: T;
  [AG_LOGLEVEL.FATAL]: T;
  [AG_LOGLEVEL.ERROR]: T;
  [AG_LOGLEVEL.WARN]: T;
  [AG_LOGLEVEL.INFO]: T;
  [AG_LOGLEVEL.DEBUG]: T;
  [AG_LOGLEVEL.TRACE]: T;
  [AG_LOGLEVEL.VERBOSE]: T;
  [AG_LOGLEVEL.LOG]: T;
  [AG_LOGLEVEL.DEFAULT]: T;
};
```

---

## 🔍 型ガード関数

### isValidLogLevel

ログレベル値の妥当性検証。

```typescript
function isValidLogLevel(value: unknown): value is AgLogLevel {
  return typeof value === 'number'
    && Object.values(AG_LOGLEVEL).includes(value as AgLogLevel);
}
```

### isLogMessage

ログメッセージ構造体の妥当性検証。

```typescript
function isLogMessage(obj: unknown): obj is AgLogMessage {
  return obj !== null
    && typeof obj === 'object'
    && 'logLevel' in obj
    && 'timestamp' in obj
    && 'message' in obj
    && 'args' in obj;
}
```

---

## 💡 型システム活用例

### カスタムプラグイン開発

```typescript
import {
  AG_LOGLEVEL,
  AgFormatFunction,
  AgLoggerFunction,
  AgLogMessage,
} from '@aglabo/agla-logger-core';

// カスタムJSONフォーマッター
const jsonFormatter: AgFormatFunction = (logMessage: AgLogMessage) => {
  return JSON.stringify({
    level: logMessage.logLevel,
    time: logMessage.timestamp.toISOString(),
    msg: logMessage.message,
    extra: logMessage.args,
  });
};

// カスタムファイルロガー
const fileLogger: AgLoggerFunction = (formattedMessage) => {
  // ファイル出力実装
  fs.appendFileSync('app.log', formattedMessage + '\n');
};
```

### 型安全な設定

```typescript
// 型安全な設定関数
function createProductionLogger(): AgLogger {
  const options: AgLoggerOptions = {
    logLevel: AG_LOGLEVEL.WARN, // 本番環境では警告以上のみ
    formatter: jsonFormatter,
    defaultLogger: fileLogger,
    verbose: false,
  };

  return AgLogger.createLogger(options);
}
```

---

## 📚 関連情報

- [コアクラス API](01-core-api.md) - 型を使用するメインクラス
- [フォーマッタープラグイン API](02-plugin-formatters.md) - 型実装例
- [ロガープラグイン API](03-plugin-loggers.md) - ロガー型実装例
- [高度なAPI活用](07-advanced-usage.md) - カスタム型実装

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
