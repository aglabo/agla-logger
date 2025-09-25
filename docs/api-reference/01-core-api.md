---
header:
  - src: 01-core-api.md
  - @(#): Core Classes API
title: コアクラス API
description: AgLogger、AgLoggerManager、AgLoggerConfig コアクラス仕様書
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

## コアクラスAPI

このページは **agla-logger の3つのコアクラス**の完全な API リファレンスです。
メインとなる AgLogger クラス、管理クラスの AgLoggerManager、設定クラスの AgLoggerConfig の詳細仕様を解説します。

## 📋 AgLogger クラス

AgLogger は実際のログ出力を担うメインクラスであり、Singleton パターンで実装している。

### 基本仕様 (AgLogger)

- 総メソッド数は 26 メソッド
- プロパティは 2つ (`logLevel`, `verbose`)
- 採用パターンは Singleton Pattern
- 主な責務はログ実行エンジンとログレベル別メソッドの提供

### インスタンス作成・取得

#### AgLogger.createLogger()

新しく AgLogger インスタンスを作成する (Singleton)。
すでに`logger`インスタンスが作成済みの場合は、エラーとなる。

- シグネチャ: `(options?: AgLoggerOptions): AgLogger`
  - パラメーター
    `options?: AgLoggerOptions` - 設定オプション (省略可)

  - 戻り値
    `AgLogger` - シングルトンインスタンス

- サンプルコード:

  ```typescript
  import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

  // 基本的な作成
  const logger = AgLogger.createLogger();

  // 詳細オプション指定
  const logger = AgLogger.createLogger({
    logLevel: AG_LOGLEVEL.INFO,
    defaultLogger: ConsoleLogger,
    formatter: PlainFormatter,
    verbose: true,
  });
  ```

#### AgLogger.getLogger()

既存の AgLogger インスタンスを取得する。
`createLogger`で`logger`を作製していない場合は、エラーとなる。

- シグネチャ: `(): AgLogger`
  - パラメータ: なし
  - 戻り値
    `AgLogger` - 既存のロガーインスタンス

- サンプルコード:

  ```typescript
  const logger = AgLogger.getLogger();
  ```

#### AgLogger.resetSingleton()

Singleton インスタンスをリセットする (テスト用)。
テスト終了時に呼び出し、他のテストが`createLogger`で新しいロガーを取得できるようにする。

- シグネチャ: `(): void`
  - パラメータ: なし
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  // テスト前後のクリーンアップ
  AgLogger.resetSingleton();
  ```

### ログ出力メソッド

#### 標準ログメソッド (レベル別)

指定されたログレベル以上の場合にログを出力する。

- シグネチャ: `(...args: Unknown[]): void`
  - パラメータ
    `...args: Unknown[]` - ログ出力する任意の引数
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  // 基本的なログ出力
  logger.info('ユーザーがログインしました');
  logger.error('データベース接続エラー');

  // 構造化ログ
  logger.info('処理完了', { userId: 123, duration: '2.3s' });

  // エラーオブジェクト
  logger.error('予期しないエラー', new Error('Connection failed'));

  // タイムスタンプ指定
  logger.info(new Date(), 'カスタム時刻のログ');
  ```

利用可能なメソッド:

- `fatal(...args: Unknown[]): void` - 致命的エラー (Level 1)
- `error(...args: Unknown[]): void` - エラー (Level 2)
- `warn(...args: Unknown[]): void` - 警告 (Level 3)
- `info(...args: Unknown[]): void` - 情報 (Level 4)
- `debug(...args: Unknown[]): void` - デバッグ (Level 5)
- `trace(...args: Unknown[]): void` - トレース (Level 6)

#### AgLogger.verbose()

ログレベルではなく、verbose モード On 時にログを出力する。

- シグネチャ: `(...args: unknown[]): void`
  - パラメータ
    `...args: unknown[]` - ログ出力する任意の引数
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  // ログレベルに関係なく出力
  logger.verbose('verbose: enable');
  ```

#### AgLogger.log()

レベルフィルタリングを無視して強制出力する。

- シグネチャ: `(...args: Unknown[]): void`
  - パラメータ
    `...args: Unknown[]` - ログ出力する任意の引数
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  // ログレベルに関係なく強制出力
  logger.log('システム起動完了'); // 常に出力される
  ```

### 設定・状態管理メソッド

#### AgLogger.logLevel

現在のログレベルを取得または設定する。

- シグネチャ (Getter): `get logLevel(): AgLogLevel`
  - パラメータ: なし
  - 戻り値
    `AgLogLevel` - 現在のログレベル

- シグネチャ (Setter): `set logLevel(level: AgLogLevel)`
  - パラメータ
    `level: AgLogLevel` - 設定するログレベル
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  // ログレベル設定
  logger.logLevel = AG_LOGLEVEL.DEBUG;

  // 現在のログレベル確認
  console.log(`Current level: ${logger.logLevel}`);
  ```

#### AgLogger.shouldOutput()

指定レベルが出力対象かをチェックする。

- シグネチャ: `(level: AgLogLevel): boolean`
  - パラメータ
    `level: AgLogLevel` - チェック対象のログレベル
  - 戻り値
    `boolean` - 出力対象の場合は `true`

- サンプルコード:

  ```typescript
  // 条件付きログ出力
  if (logger.shouldOutput(AG_LOGLEVEL.DEBUG)) { // logger.debugを出力 → true
    const debugInfo = expensiveDebugOperation();
    logger.debug('詳細情報', debugInfo);
  }
  ```

### フォーマッター・ロガー設定

#### AgLogger.setFormatter()

フォーマッターを設定する。

- シグネチャ: `(formatter: AgFormatterInput): void`
  - パラメータ
    `formatter: AgFormatterInput` - 設定するフォーマッター
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  import { JsonFormatter, PlainFormatter } from '@aglabo/agla-logger';

  // JSON形式に変更
  logger.setFormatter(JsonFormatter);

  // プレーンテキストに変更
  logger.setFormatter(PlainFormatter);
  ```

#### AgLogger.getFormatter()

現在のフォーマッターを取得する。

- シグネチャ: `(): AgFormatFunction`
  - パラメータ: なし
  - 戻り値
    `AgFormatFunction` - 現在のフォーマッター関数

- サンプルコード:

  ```typescript
  const currentFormatter = logger.getFormatter();
  ```

#### AgLogger.setLoggerFunction()

特定レベル用のロガー関数を設定する。

- シグネチャ: `(level: AgLogLevel, loggerFunc: AgLoggerFunction): void`
  - パラメータ
    `level: AgLogLevel` - 対象ログレベル
    `loggerFunc: AgLoggerFunction` - 設定するロガー関数
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  // エラーレベルのみファイル出力
  logger.setLoggerFunction(AG_LOGLEVEL.ERROR, (message) => {
    fs.appendFileSync('error.log', message + '\n');
  });
  ```

#### AgLogger.getLoggerFunction()

指定レベルのロガー関数を取得する。

- シグネチャ: `(level: AgLogLevel): AgLoggerFunction`
  - パラメータ
    `level: AgLogLevel` - 取得対象のログレベル
  - 戻り値
    `AgLoggerFunction` - 指定レベルのロガー関数

- サンプルコード:

  ```typescript
  const errorLogger = logger.getLoggerFunction(AG_LOGLEVEL.ERROR);
  ```

### Verbose モード

#### AgLogger.isVerbose (プロパティ)

詳細モードの状態を確認する。
(`verbose`がログメソッドで使用されているため、`isVerbose`で代用する)

- シグネチャ: `get isVerbose(): boolean`
  - パラメータ: なし
  - 戻り値
    `boolean` - 詳細モードが有効な場合は `true`

- サンプルコード:

  ```typescript
  // 詳細モード確認
  if (logger.isVerbose) {
    logger.verbose('詳細な診断情報');
  }
  ```

#### AgLogger.setVerbose (プロパティ)

詳細モードを設定する。
(`verbose`がログメソッドで使用されているため、`setVerbose`で代用する)

- シグネチャ: `set setVerbose(): boolean`
  - パラメータ
    `verbose: boolean` - 詳細モードの有効/無効
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  // 詳細モード有効化
  logger.setVerbose = true;
  ```

### 統計機能

#### AgLogger.getStatsFormatter()

統計機能付きフォーマッターを取得する。
(`createLogger` で統計機能付きフォーマッタを設定する必要がある)

- シグネチャ: `(): AgStatsFormatter | null`
  - パラメータ: なし
  - 戻り値
    `AgStatsFormatter | null` - 統計フォーマッター (存在しない場合は `null`)

- サンプルコード:

  ```typescript
  const statsFormatter = logger.getStatsFormatter();
  if (statsFormatter) {
    const stats = statsFormatter.getStats();
    console.log('ログ統計:', stats);
  }
  ```

#### AgLogger.hasStatsFormatter()

統計機能の有無を確認する。

- シグネチャ: `(): boolean`
  - パラメータ: なし
  - 戻り値
    `boolean` - 統計機能が有効な場合は `true`

- サンプルコード:

  ```typescript
  if (logger.hasStatsFormatter()) {
    console.log('統計機能が有効です');
  }
  ```

---

## 🏢 AgLoggerManager クラス

AgLoggerManager は AgLogger のライフサイクルを管理するファサード実装です。

### 基本仕様 (AgLoggerManager)

- 総メソッド数は 9 メソッド
- 採用パターンは Facade Pattern と Singleton の組み合わせ
- 主な責務はインスタンス管理、設定委譲、グローバル関数バインド

### インスタンス管理

#### AgLoggerManager.createManager()

新しいマネージャーインスタンスを作成する。
(新しくロガーインスタンスも作成する)

- シグネチャ: `(options?: AgLoggerOptions): AgLoggerManager`
  - パラメーター
    `options?: AgLoggerOptions` - 設定オプション (省略可)
  - 戻り値
    `AgLoggerManager` - マネージャーインスタンス

- サンプルコード:

  ```typescript
  import { AgLoggerManager } from '@aglabo/agla-logger';

  const manager = AgLoggerManager.createManager({
    logLevel: AG_LOGLEVEL.INFO,
    defaultLogger: ConsoleLogger,
  });
  ```

#### AgLoggerManager.getManager()

既存マネージャーを取得する。

- シグネチャ: `(): AgLoggerManager`
  - パラメーター: なし
  - 戻り値
    `AgLoggerManager` - 既存のマネージャーインスタンス

- サンプルコード:

  ```typescript
  const manager = AgLoggerManager.getManager();
  ```

#### AgLoggerManager.resetSingleton()

マネージャーをリセットする。
(管理下のロガーもリセットする)

- シグネチャ: `(): void`
  - パラメーター: なし
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  AgLoggerManager.resetSingleton();
  ```

### ロガー管理

#### AgLoggerManager.getLogger()

管理下の AgLogger を取得する。

- シグネチャ: `(): AgLogger`
  - パラメーター: なし
  - 戻り値
    `AgLogger` - 管理下のロガーインスタンス

- サンプルコード:

  ```typescript
  const logger = manager.getLogger();
  ```

#### AgLoggerManager.setLogger()

管理する AgLogger を設定する。

- シグネチャ: `(logger: AgLogger): void`
  - パラメーター
    `logger: AgLogger` - 設定するロガーインスタンス
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  const customLogger = AgLogger.createLogger({ logLevel: AG_LOGLEVEL.DEBUG });
  manager.setLogger(customLogger);
  ```

#### AgLoggerManager.setLoggerConfig()

ロガーの設定を更新する。

- シグネチャ: `(options: AgLoggerOptions): void`
  - パラメーター
    `options: AgLoggerOptions` - 更新する設定オプション
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  manager.setLoggerConfig({
    logLevel: AG_LOGLEVEL.WARN,
    verbose: false,
  });
  ```

### グローバル関数バインド

#### AgLoggerManager.bindLoggerFunction()

指定したログレベルに、ロガーをバインドする。

- シグネチャ: `(level: AgLogLevel, fn: AgLoggerFunction): boolean`
  - パラメーター
    'level': ロガーを設定するログレベル
    `loggerFunction: AgLoggerFunction` - バインドするロガー関数
  - 戻り値
    `boolean`: true - バインド成功

- サンプルコード:

  ```typescript
  // グローバル関数をログ対応に
  const originalFunction = globalThis.someFunction;
  manager.bindLoggerFunction(
    AG_LOGLEVEL.INFO,
    (message) => {
      console.log(`[LOG] ${message}`);
      originalFunction();
    },
  );
  ```

#### AgLoggerManager.updateLoggerMap()

ロガーマップを部分更新する。

- シグネチャ: `(loggerMap: Partial<AgLoggerMap<AgLoggerFunction>>): void`
  - パラメーター
    `loggerMap: Partial<AgLoggerMap<AgLoggerFunction>>` - 更新するロガーマップ
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  manager.updateLoggerMap({
    [AG_LOGLEVEL.ERROR]: (message) => fs.appendFileSync('error.log', message),
    [AG_LOGLEVEL.WARN]: (message) => fs.appendFileSync('warn.log', message),
  });
  ```

#### AgLoggerManager.removeLoggerFunction()

指定レベルのロガー関数を削除する。
(削除したログレベルでは、代わりに`defaultLogger`でログを出力する)

- シグネチャ: `(level: AgLogLevel): void`
  - パラメーター
    `level: AgLogLevel` - 削除対象のロガーレベル
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  manager.removeLoggerFunction(AG_LOGLEVEL.DEBUG);
  ```

---

## ⚙️ AgLoggerConfig クラス

AgLoggerConfig は AgLogger の設定と状態を管理する内部実装クラスです。

### 基本仕様 (AgLoggerConfig)

- 総メソッド数は 20 メソッド
- プロパティは 4 つ (getter/setter 形式)
- 主な責務は設定管理、ログレベル制御、プラグイン管理

### プロパティ (Getter/Setter)

#### AgLoggerConfig.formatter

フォーマッターを取得および設定する。

- シグネチャ (Getter): `get formatter(): AgFormatterInput`
  - パラメーター: なし
  - 戻り値
    `AgFormatterInput` - 現在のフォーマッター

- シグネチャ (Setter): `set formatter(formatter: AgFormatterInput)`
  - パラメーター
    `formatter: AgFormatterInput` - 設定するフォーマッター
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  // 設定
  _config.formatter = JsonFormatter;

  // 取得
  const formatter = _config.formatter;
  ```

#### AgLoggerConfig.logLevel

ログレベルを取得および設定する。

- シグネチャ (Getter): `get logLevel(): AgLogLevel`
  - パラメーター: なし
  - 戻り値
    `AgLogLevel` - 現在のログレベル

- シグネチャ (Setter): `set logLevel(level: AgLogLevel)`
  - パラメーター
    `level: AgLogLevel` - 設定するログレベル
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  // 設定
  _config.logLevel = AG_LOGLEVEL.INFO;

  // 取得
  const level = _config.logLevel;
  ```

#### AgLoggerConfig.defaultLogger

デフォルトロガーを取得する。

- シグネチャ: `get defaultLogger(): AgLoggerFunction`
  - パラメーター: なし
  - 戻り値
    `AgLoggerFunction` - デフォルトロガー関数

- サンプルコード:

  ```typescript
  const defaultLogger = _config.defaultLogger;
  ```

#### AgLoggerConfig.isVerbose / setVerbose

Verbose モードを取得および設定する。

- シグネチャ (Getter): `get isVerbose(): boolean`
  - パラメーター: なし
  - 戻り値
    `boolean` - Verbose モード

- シグネチャ (Setter): `set setVerbose(boolean: verboseMode)`
  - パラメーター
    `boolean` - 設定する Verbose モード
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  // 取得
  const isVerbose = _config.isVerbose;
  // 設定
  _config.setVerbose = ENABLE (=true: Verboseモード On)
  ```

### ロガーマップ管理

#### AgLoggerConfig.getLoggerMap()

完全なロガーマップを取得する。

- シグネチャ: `(): AgLoggerMap<AgLoggerFunction>`
  - パラメーター: なし
  - 戻り値
    `AgLoggerMap<AgLoggerFunction>` - 完全なロガーマップ

- サンプルコード:

  ```typescript
  const loggerMap = _config.getLoggerMap();
  ```

#### AgLoggerConfig.clearLoggerMap()

ロガーマップをクリアする。

- シグネチャ: `(): void`
  - パラメーター: なし
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  _config.clearLoggerMap();
  ```

#### AgLoggerConfig.updateLoggerMap()

ロガーマップを部分更新する。

- シグネチャ: `(loggerMap: Partial<AgLoggerMap<AgLoggerFunction>>): void`
  - パラメーター
    `loggerMap: Partial<AgLoggerMap<AgLoggerFunction>>` - 更新するロガーマップ
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  _config.updateLoggerMap({
    [AG_LOGLEVEL.ERROR]: customErrorLogger,
    [AG_LOGLEVEL.INFO]: customInfoLogger,
  });
  ```

#### AgLoggerConfig.getLoggerFunction()

指定レベルのロガー関数を取得する。

- シグネチャ: `(level: AgLogLevel): AgLoggerFunction`
  - パラメーター
    `level: AgLogLevel` - 取得対象のログレベル
  - 戻り値
    `AgLoggerFunction` - 指定レベルのロガー関数

- サンプルコード:

  ```typescript
  const errorLogger = _config.getLoggerFunction(AG_LOGLEVEL.ERROR);
  ```

### 出力制御

#### AgLoggerConfig.shouldOutput()

指定レベルが出力対象かをチェックする。

- シグネチャ: `(level: AgLogLevel): boolean`
  - パラメーター
    `level: AgLogLevel` - チェック対象のログレベル
  - 戻り値
    `boolean` - 出力対象の場合は `true`

- サンプルコード:

  ```typescript
  if (_config.shouldOutput(AG_LOGLEVEL.DEBUG)) {
    // DEBUG レベルの処理
  }
  ```

#### AgLoggerConfig.shouldOutputVerbose()

Verbose モードの出力可否をチェックする。

- シグネチャ: `(): boolean`
  - パラメーター: なし
  - 戻り値
    `boolean` - Verbose モードが有効な場合は `true`

- サンプルコード:

  ```typescript
  if (_config.shouldOutputVerbose()) {
    // Verbose 出力処理
  }
  ```

### 統計機能管理

#### AgLoggerConfig.getFormatterStats()

フォーマッター統計を取得する。
(`formatter`に統計機能付きフォーマッタを設定する必要がある)

- シグネチャ: `(): AgLogStatistics`
  - パラメーター: なし
  - 戻り値
    `AgLogStatistics` - フォーマッター統計情報

- サンプルコード:

  ```typescript
  const stats = _config.getFormatterStats();
  console.log('フォーマット回数:', stats.formatCount);
  ```

#### AgLoggerConfig.resetFormatterStats()

フォーマッター統計をリセットする。

- シグネチャ: `(): void`
  - パラメーター: なし
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  _config.resetFormatterStats();
  ```

#### AgLoggerConfig.getStatsFormatter()

統計機能付きフォーマッターを取得する。

- シグネチャ: `(): AgStatsFormatter | null`
  - パラメーター: なし
  - 戻り値
    `AgStatsFormatter | null` - 統計フォーマッター (存在しない場合は `null`)

- サンプルコード:

  ```typescript
  const statsFormatter = _config.getStatsFormatter();
  ```

#### AgLoggerConfig.hasStatsFormatter()

統計機能の有無を確認する。

- シグネチャ: `(): boolean`
  - パラメーター: なし
  - 戻り値
    `boolean` - 統計機能が有効な場合は `true`

- サンプルコード:

  ```typescript
  if (_config.hasStatsFormatter()) {
    // 統計機能を活用した処理
  }
  ```

### 設定管理

#### AgLoggerConfig.setLoggerConfig()

設定オプションを一括更新する。

- シグネチャ: `(options: AgLoggerOptions): void`
  - パラメーター
    `options: AgLoggerOptions` - 更新する設定オプション
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  _config.setLoggerConfig({
    logLevel: AG_LOGLEVEL.WARN,
    formatter: JsonFormatter,
    verbose: false,
  });
  ```

#### AgLoggerConfig.setLogger()

指定したログレベルに、ロガー関数を設定する。

- シグネチャ: `(level: AgLogLevel, logger: AgLoggerFunction): boolean`
  - パラメーター
    `level: AgLogLevel` - ロガーを設定するログレベル
    `logger: AgLoggerFunction` - 設定するロガー関数
  - 戻り値
    `void`

- サンプルコード:

  ```typescript
  _config.setLogger((message) => {
    console.log(AG_LOGLEVEL.DEBUG, `[CUSTOM] ${message}`);
  });
  ```

---

## 🔄 クラス間の関係

### 依存関係フロー

```text
AgLoggerManager (Facade)
    ↓ 管理
AgLogger (Main Logger)
    ↓ 使用
AgLoggerConfig (Internal Config)
```

### 協調動作パターン

#### 1. 標準的な初期化フロー

```typescript
// 1. マネージャー作成
const manager = AgLoggerManager.createManager({
  logLevel: AG_LOGLEVEL.INFO,
});

// 2. ロガー取得
const logger = manager.getLogger();

// 3. 設定変更
manager.setLoggerConfig({
  formatter: JsonFormatter,
  verbose: true,
});

// 4. ログ出力
logger.info('初期化完了');
```

#### 2. 直接操作パターン

```typescript
// 1. ロガー直接作成
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.DEBUG,
});

// 2. 直接設定変更
logger.setFormatter(PlainFormatter);
logger.setVerbose(true);

// 3. ログ出力
logger.debug('直接操作によるログ');
```

#### 3. テスト時のリセットパターン

```typescript
beforeEach(() => {
  // シングルトンリセット
  AgLoggerManager.resetSingleton();
  AgLogger.resetSingleton();
});
```

---

## 🔍 高度な活用例

### カスタムプラグイン統合

```typescript
import { AgFormatFunction, AgLogger, AgLoggerFunction } from '@aglabo/agla-logger';

// カスタムフォーマッター
const structuredFormatter: AgFormatFunction = (logMessage) => {
  return JSON.stringify({
    timestamp: logMessage.timestamp,
    level: logMessage.logLevel,
    message: logMessage.message,
    context: logMessage.args,
  });
};

// カスタムロガー
const fileLogger: AgLoggerFunction = (formattedMessage) => {
  fs.appendFileSync('app.log', formattedMessage + '\n');
};

// 統合設定
const logger = AgLogger.createLogger({
  formatter: structuredFormatter,
  defaultLogger: fileLogger,
  logLevel: AG_LOGLEVEL.INFO,
});
```

### 動的レベル制御

```typescript
// 環境に応じた動的レベル設定
function setupLogger(): AgLogger {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  const logger = AgLogger.createLogger({
    logLevel: isDevelopment
      ? AG_LOGLEVEL.DEBUG
      : isProduction
      ? AG_LOGLEVEL.WARN
      : AG_LOGLEVEL.INFO,
    verbose: isDevelopment,
  });

  return logger;
}
```

---

## 📚 関連情報

- [型定義・定数 API](04-type-definitions.md) - コアクラスで使用される型
- [フォーマッタープラグイン API](02-plugin-formatters.md) - フォーマッター詳細
- [ロガープラグイン API](03-plugin-loggers.md) - ロガー詳細
- [ユーティリティ関数 API](05-utility-functions.md) - 便利関数

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
