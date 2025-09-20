---
header:
  - src: 04-logger-details.md
  - @(#): Logger Details
title: ログ機能詳細
description: agla-logger の基本ログ機能の詳細解説と内部動作の理解
version: 1.0.0
created: 2025-09-20
authors:
  - atsushifx
changes:
  - 2025-09-20: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## ログ機能詳細

このセクションでは、agla-logger の基本ログ機能の詳細について解説します。
各ログメソッドの詳細な動作、ログレベルフィルタリングの仕組み、特殊機能の内部動作を理解できます。

---

## 基本ログメソッドの詳細

### 標準ログメソッド一覧

agla-logger では、6 レベルの標準ログレベルが利用できます。

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.TRACE, // 全レベル出力
});

// 標準ログメソッド（重要度順）
logger.fatal('致命的エラー - システム停止が必要'); // 1 - 最重要
logger.error('エラー - 処理失敗'); // 2
logger.warn('警告 - 注意が必要'); // 3
logger.info('情報 - 通常の動作'); // 4
logger.debug('デバッグ - 開発時の詳細情報'); // 5
logger.trace('トレース - 最詳細な実行情報'); // 6 - 最詳細
```

### 各ログレベルの使用場面

```typescript
// FATAL (1) - システム停止レベルの重大問題
logger.fatal('データベース接続完全失敗 - サービス停止', {
  database: 'primary',
  connectionPool: 'exhausted',
  uptime: process.uptime(),
});

// ERROR (2) - 処理失敗だがシステム継続可能
logger.error('ユーザー認証失敗', {
  userId: 'user123',
  attemptCount: 3,
  lastAttempt: new Date().toISOString(),
});

// WARN (3) - 潜在的な問題や注意事項
logger.warn('メモリ使用量が閾値を超過', {
  currentUsage: '85%',
  threshold: '80%',
  recommendation: 'memory_cleanup',
});

// INFO (4) - 通常の動作状況
logger.info('ユーザーセッション開始', {
  userId: 'user123',
  sessionId: 'sess_abc123',
  loginMethod: 'oauth',
});

// DEBUG (5) - 開発・運用時のデバッグ情報
logger.debug('キャッシュヒット率', {
  hitRate: 0.85,
  totalRequests: 1000,
  cacheSize: '256MB',
});

// TRACE (6) - 関数・処理の詳細な実行情報
logger.trace('関数実行', {
  function: 'processUserData',
  parameters: { userId: 'user123' },
  executionTime: '15ms',
});
```

---

## ログレベルフィルタリングの詳細

### フィルタリングの仕組み

ログレベルフィルタリングは数値比較で動作します。

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.WARN, // 3
});

// フィルタリング動作の詳細
console.log('設定レベル:', AG_LOGLEVEL.WARN); // 3

// 出力される（設定レベル以下）
logger.fatal('出力される'); // 1 ≤ 3 ✅
logger.error('出力される'); // 2 ≤ 3 ✅
logger.warn('出力される'); // 3 ≤ 3 ✅

// 出力されない（設定レベルより大きい）
logger.info('出力されない'); // 4 > 3 ❌
logger.debug('出力されない'); // 5 > 3 ❌
logger.trace('出力されない'); // 6 > 3 ❌
```

### 動的レベル変更の影響

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.ERROR, // 初期設定: 2
});

logger.info('出力されない'); // 4 > 2

// ログレベルを動的に変更
logger.logLevel = AG_LOGLEVEL.INFO; // 4 に変更

logger.info('今度は出力される'); // 4 ≤ 4 ✅
logger.debug('まだ出力されない'); // 5 > 4 ❌
```

### ログレベル確認

```typescript
// 現在のログレベル確認
console.log('現在のレベル:', logger.logLevel);
console.log('DEBUG出力?:', logger.logLevel >= AG_LOGLEVEL.DEBUG);

// レベル別出力判定の実装例
function shouldLog(targetLevel: number, currentLevel: number): boolean {
  return targetLevel <= currentLevel;
}

console.log('ERROR出力?:', shouldLog(AG_LOGLEVEL.ERROR, logger.logLevel));
```

---

## 特殊ログメソッド

### logger.log() - 強制ログ出力メソッド

`logger.log()` はログレベル設定を無視して常に出力される特殊メソッドです。

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.OFF, // 0 - 全ログ停止
});

// 通常メソッドは全て出力されない
logger.fatal('出力されない');
logger.error('出力されない');

// logger.log() だけは出力される
logger.log('システム起動完了'); // ✅ 必ず出力
logger.log('設定情報:', { version: '1.0.0', env: 'production' }); // ✅ 必ず出力
```

### logger.log() の内部動作

```typescript
// logger.log() の使用場面
function criticalSystemInfo() {
  // システム起動時の重要情報
  logger.log('=== システム起動ログ ===');
  logger.log('Node.js:', process.version);
  logger.log('アプリバージョン:', process.env.npm_package_version);
  logger.log('起動時刻:', new Date().toISOString());

  // デバッグ時の確実な出力
  logger.log('デバッグポイント A 通過');

  // 本番環境でも記録したい情報
  logger.log('ライセンス情報確認済み');
}
```

### verbose メソッド

verbose モードが有効な場合にのみ出力される詳細ログです。重要な特徴として、**verbose=true の場合は logLevel 設定を無視して強制出力されます**。

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG, // 通常ログは出力される
  verbose: true, // verbose モード有効
});

// 通常メソッドは出力される（logLevel=DEBUG）
logger.error('エラーログ出力'); // ✅ 出力される
logger.warn('警告ログ出力'); // ✅ 出力される
logger.info('情報ログ出力'); // ✅ 出力される
logger.debug('デバッグログ出力'); // ✅ 出力される

// verbose メソッドは logLevel を無視して出力される
logger.verbose('詳細実行情報', {
  functionName: 'processData',
  parameters: { count: 100 },
  memoryBefore: process.memoryUsage().heapUsed,
  timestamp: Date.now(),
}); // ✅ verbose=true なので出力される

// verbose設定を動的に変更
logger.setVerbose = false;

// 通常ログは出力されるが、verboseは出力されない
logger.info('通常の情報ログ'); // ✅ 出力される（logLevel設定に従う）
logger.verbose('出力されない'); // ❌ verbose=false なので出力されない

// verbose設定の確認と再有効化
console.log('verbose有効?:', logger.isVerbose); // false
logger.setVerbose = true;
console.log('verbose有効?:', logger.isVerbose); // true
logger.verbose('再び出力される'); // ✅ verbose=true なので出力される
```

### verbose と logger.log() の比較

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG, // 通常ログは出力される
  verbose: true,
});

// 各メソッドの動作確認
logger.info('通常の情報ログ'); // ✅ logLevel=DEBUGなので出力される
logger.log('システム起動'); // ✅ 常に出力
logger.verbose('デバッグ情報'); // ✅ verbose=true なので出力

// verbose を無効にした場合の動作
logger.setVerbose = false;

logger.info('通常の情報ログ'); // ✅ 出力される（logLevel設定に従う）
logger.log('システム状態'); // ✅ 常に出力（verbose設定に関係なし）
logger.verbose('デバッグ情報'); // ❌ verbose=false なので出力されない

// 違い：
// - logger.log() は常に出力（無条件・全設定無視）
// - logger.verbose() は verbose=true の場合のみ出力（条件付き・logLevel無視）
// - 通常ログ（info等）は logLevel 設定に従って出力（条件付き・verbose設定無関係）
```

---

## LoggerMap による出力先制御

### 基本的な LoggerMap 設定

LoggerMap は、各ログレベルに対して個別の出力先関数を指定できる機能です。

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

// レベル別の出力先関数
const errorLogger = (message: string) => {
  console.error(`[ERR] ${message}`);
};

const infoLogger = (message: string) => {
  console.info(`[INFO] ${message}`);
};

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger, // デフォルト出力先
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.TRACE,
  loggerMap: {
    [AG_LOGLEVEL.ERROR]: errorLogger, // ERROR は特別な出力先
    [AG_LOGLEVEL.INFO]: infoLogger, // INFO も特別な出力先
    // その他のレベルは defaultLogger を使用
  },
});

// 動作確認
logger.fatal('致命的エラー'); // → ConsoleLogger (default)
logger.error('エラー'); // → errorLogger
logger.warn('警告'); // → ConsoleLogger (default)
logger.info('情報'); // → infoLogger
logger.debug('デバッグ'); // → ConsoleLogger (default)
```

### LoggerMap の優先順位

loggerMap が指定された場合の出力先決定ロジックです。

```typescript
// LoggerMap の動作原理
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.TRACE,
  loggerMap: {
    [AG_LOGLEVEL.ERROR]: (msg) => console.error(`[CUSTOM ERROR] ${msg}`),
  },
});

// 出力先の決定ロジック:
// 1. loggerMap に該当レベルの設定があるか確認
// 2. あれば loggerMap の関数を使用
// 3. なければ defaultLogger を使用

logger.error('エラーメッセージ'); // loggerMap[ERROR] を使用
logger.warn('警告メッセージ'); // defaultLogger を使用
```

### デフォルトロガーマップ（明示的な指定）

標準的なログレベルに対応した出力先を明示的に設定するパターンです。

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

// 標準的な明示指定パターン
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.TRACE,
  loggerMap: {
    [AG_LOGLEVEL.FATAL]: (msg) => console.error(`[FATAL] ${msg}`),
    [AG_LOGLEVEL.ERROR]: (msg) => console.error(`[ERROR] ${msg}`),
    [AG_LOGLEVEL.WARN]: (msg) => console.warn(`[WARN] ${msg}`),
    [AG_LOGLEVEL.INFO]: (msg) => console.info(`[INFO] ${msg}`),
    [AG_LOGLEVEL.DEBUG]: (msg) => console.debug(`[DEBUG] ${msg}`),
    [AG_LOGLEVEL.TRACE]: (msg) => console.debug(`[TRACE] ${msg}`),
    // その他はdefaultLoggerを使用
  },
});

// 各レベルが対応するコンソールメソッドで出力される
logger.error('エラーが発生しました'); // console.error で [ERROR] プレフィックス付き
logger.info('処理が完了しました'); // console.info で [INFO] プレフィックス付き
```

### ConsoleLogger での暗黙的なデフォルトロガーマップ指定

defaultLogger に ConsoleLogger を指定し、loggerMap を指定しない場合、自動的に `ConsoleLoggerMap` が適用されます。

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

// loggerMap未指定でConsoleLoggerを使用
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.TRACE,
  // loggerMapは未指定 → 自動的にConsoleLoggerMapが適用
});

// ConsoleLoggerMapによる自動マッピング:
logger.fatal('致命的エラー'); // → console.error()
logger.error('エラー'); // → console.error()
logger.warn('警告'); // → console.warn()
logger.info('情報'); // → console.info()
logger.debug('デバッグ'); // → console.debug()
logger.trace('トレース'); // → console.debug()
logger.verbose('詳細'); // → console.debug()
logger.log('ログ'); // → console.log()
```

### ConsoleLoggerMap の詳細説明

実際に自動適用される ConsoleLoggerMap の技術的詳細です。

```typescript
// ConsoleLoggerMap の実装内容
const ConsoleLoggerMap = {
  [AG_LOGLEVEL.OFF]: NullLogger, // 出力なし
  [AG_LOGLEVEL.FATAL]: console.error, // エラー出力
  [AG_LOGLEVEL.ERROR]: console.error, // エラー出力
  [AG_LOGLEVEL.WARN]: console.warn, // 警告出力
  [AG_LOGLEVEL.INFO]: console.info, // 情報出力
  [AG_LOGLEVEL.DEBUG]: console.debug, // デバッグ出力
  [AG_LOGLEVEL.TRACE]: console.debug, // デバッグ出力
  [AG_LOGLEVEL.VERBOSE]: console.debug, // デバッグ出力
  [AG_LOGLEVEL.LOG]: console.log, // 標準出力
};

// 自動適用の条件:
// 1. defaultLogger が ConsoleLogger である
// 2. loggerMap が未指定（undefined）である
// 3. 上記両方の条件を満たす場合のみ自動適用
```

---

## 内部動作とパフォーマンス

### ログ出力の処理フロー

```typescript
// agla-logger の内部処理概要:
// 1. ログレベル判定 (フィルタリング)
// 2. メッセージとデータの結合
// 3. フォーマッター適用
// 4. 出力先関数実行

function demonstrateInternalFlow() {
  const logger = AgLogger.createLogger({
    defaultLogger: ConsoleLogger,
    formatter: PlainFormatter,
    logLevel: AG_LOGLEVEL.INFO, // 4
  });

  // 以下のログはレベル判定で除外される (DEBUG=5 > INFO=4)
  logger.debug('この処理は早期リターンされる'); // フォーマッター処理なし

  // 以下のログは完全に処理される (INFO=4 ≤ INFO=4)
  logger.info('完全に処理される', { data: 'example' }); // 全処理実行
}
```

### パフォーマンス考慮事項

```typescript
// 効率的なログ使用パターン
function efficientLogging() {
  const logger = AgLogger.createLogger({
    defaultLogger: ConsoleLogger,
    formatter: PlainFormatter,
    logLevel: AG_LOGLEVEL.WARN,
  });

  // ❌ 非効率: 重い処理が無駄に実行される
  logger.debug('重いデータ:', expensiveDataGeneration()); // レベル判定で除外されるが処理済み

  // ✅ 効率的: レベル確認してから重い処理
  if (logger.logLevel >= AG_LOGLEVEL.DEBUG) {
    logger.debug('重いデータ:', expensiveDataGeneration());
  }

  // ✅ 効率的: logger.log() で確実に出力が必要な場合
  logger.log('システム状態:', getSystemStatus()); // 必要な時のみ
}

function expensiveDataGeneration() {
  // 重い処理のシミュレーション
  return { timestamp: Date.now(), complexData: '...' };
}

function getSystemStatus() {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  };
}
```

---

### See Also

- [基本的なロガー操作](01-basic-logger-operations.md) - ロガーの基本的な使用方法
- [ログレベル制御](02-log-level-control.md) - ログレベルの詳細設定
- [フォーマッター活用](03-formatter-usage.md) - 出力形式のカスタマイズ
- [エラーハンドリング](05-error-handling.md) - エラーログの効果的な活用
- [目次](README.md) - 目次に戻る

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
