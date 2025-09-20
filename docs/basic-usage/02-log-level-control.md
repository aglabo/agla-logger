---
header:
  - src: 02-log-level-control.md
  - @(#): Log Level Control
title: agla-logger
description: ログレベルの設定・変更と条件付きログ出力の詳細ガイド
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

## ログレベル制御

このセクションでは、agla-logger のログレベル制御について詳しく解説します。
ログレベルの設定・変更方法、条件付きログ出力、環境に応じたログレベル管理など、実践的な使用方法を学べます。

---

## ログレベルの基本概念

### ログレベル階層

AG_LOGLEVEL では以下の 7 つのログレベルが定義されています (重要度順):

```typescript
import { AG_LOGLEVEL } from '@aglabo/agla-logger';

// ログレベル階層 (数値が小さいほど重要、大きいほど詳細、0=出力なし)
const logLevels = [
  AG_LOGLEVEL.OFF, // 0 - 出力なし
  AG_LOGLEVEL.FATAL, // 1 - 致命的エラー
  AG_LOGLEVEL.ERROR, // 2 - エラー
  AG_LOGLEVEL.WARN, // 3 - 警告
  AG_LOGLEVEL.INFO, // 4 - 一般的な情報
  AG_LOGLEVEL.DEBUG, // 5 - デバッグ情報
  AG_LOGLEVEL.TRACE, // 6 - 最も詳細なデバッグ情報
];
```

### ログレベルフィルタリングの仕組み

```typescript
import { AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.WARN, // 3
});

// WARN レベル設定時の出力例
logger.fatal('出力される'); // ✅ FATAL(1) < WARN(3) でより重要
logger.error('出力される'); // ✅ ERROR(2) < WARN(3) でより重要
logger.warn('出力される'); // ✅ WARN(3) = WARN(3) で一致
logger.info('出力されない'); // ❌ INFO(4) > WARN(3) で詳細すぎる
logger.debug('出力されない'); // ❌ DEBUG(5) > WARN(3) で詳細すぎる
logger.trace('出力されない'); // ❌ TRACE(6) > WARN(3) で詳細すぎる
```

---

## ログレベルの設定と変更

### 作成時のログレベル指定

```typescript
import { AG_LOGLEVEL, AgLogger, AgToLogLevel, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

// 定数を使用した指定
const debugLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG, // 5
});

// 文字列を使用した指定（AgToLogLevel関数で変換）
const infoLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AgToLogLevel('info'), // 'info' → 4
});
```

### 実行時のログレベル変更

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

// 現在のログレベル確認
console.log('初期ログレベル:', logger.logLevel); // 4 (= AG_LOGLEVEL.INFO)

// ログレベルを変更
logger.logLevel = AG_LOGLEVEL.DEBUG;
console.log('変更後ログレベル:', logger.logLevel); // 5 (= AG_LOGLEVEL.DEBUG)

// 別のレベルに変更
logger.logLevel = AG_LOGLEVEL.ERROR;
console.log('再変更後ログレベル:', logger.logLevel); // 2 (= AG_LOGLEVEL.ERROR)
```

### 動的ログレベル制御

```typescript
// 環境変数に基づくログレベル設定
function getLogLevelFromEnvironment(): AgLogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();

  switch (envLevel) {
    case 'trace':
      return AG_LOGLEVEL.TRACE;
    case 'debug':
      return AG_LOGLEVEL.DEBUG;
    case 'info':
      return AG_LOGLEVEL.INFO;
    case 'warn':
      return AG_LOGLEVEL.WARN;
    case 'error':
      return AG_LOGLEVEL.ERROR;
    case 'fatal':
      return AG_LOGLEVEL.FATAL;
    default:
      return AG_LOGLEVEL.INFO; // デフォルト
  }
}

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: getLogLevelFromEnvironment(),
});

// 実行時の動的変更
function adjustLogLevel() {
  if (process.env.NODE_ENV === 'development') {
    logger.logLevel = AG_LOGLEVEL.DEBUG;
    logger.debug('開発環境: デバッグレベル有効');
  } else if (process.env.NODE_ENV === 'production') {
    logger.logLevel = AG_LOGLEVEL.WARN;
    logger.warn('本番環境: 警告レベル以上のみ');
  } else {
    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.info('その他環境: 情報レベル有効');
  }
}
```

---

## 条件付きログ出力

### ログレベル確認

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG, // 5
});

// 現在のログレベル確認
console.log('現在のログレベル:', logger.logLevel); // 5 (= AG_LOGLEVEL.DEBUG)

// 手動でのレベル比較（必要な場合）
const currentLevel = logger.logLevel;
const isTraceOutput = currentLevel >= AG_LOGLEVEL.TRACE; // false (5 < 6)
const isDebugOutput = currentLevel >= AG_LOGLEVEL.DEBUG; // true (5 >= 5)
const isInfoOutput = currentLevel >= AG_LOGLEVEL.INFO; // true (5 >= 4)

console.log('出力レベル確認:', { isTraceOutput, isDebugOutput, isInfoOutput });
```

### 効率的な条件付きログ

```typescript
// 重い処理を含む場合の最適化
function processComplexData(data: ComplexData[]) {
  const logger = AgLogger.createLogger({
    defaultLogger: ConsoleLogger,
    formatter: PlainFormatter,
    logLevel: AG_LOGLEVEL.DEBUG, // 5
  });

  logger.info('複雑データ処理開始:', data.length, '件');

  // デバッグレベルが有効な場合のみ詳細分析実行
  if (logger.logLevel >= AG_LOGLEVEL.DEBUG) {
    const analysisStart = Date.now();
    const detailedAnalysis = performExpensiveAnalysis(data);
    const analysisTime = Date.now() - analysisStart;

    logger.debug('詳細分析結果:', {
      totalItems: detailedAnalysis.totalItems,
      averageComplexity: detailedAnalysis.averageComplexity,
      analysisTime: `${analysisTime}ms`,
    });
  }

  data.forEach((item, index) => {
    // トレースレベルでの詳細進捗
    if (logger.logLevel >= AG_LOGLEVEL.TRACE) {
      logger.trace(`処理進捗: [${index + 1}/${data.length}] ${item.id}`);
    }

    try {
      const result = processItem(item);

      // デバッグレベルでの処理結果
      if (logger.logLevel >= AG_LOGLEVEL.DEBUG) {
        logger.debug(`アイテム処理完了: ${item.id}`, {
          processingTime: result.processingTime,
          memoryUsage: result.memoryUsage,
        });
      }
    } catch (error) {
      logger.error(`アイテム処理エラー: ${item.id}`, error);
    }
  });

  logger.info('複雑データ処理完了');
}
```

### 条件分岐による出力制御

```typescript
// アプリケーション状態に応じたログレベル調整
class ApplicationManager {
  private logger: AgLogger;
  private isDebugMode: boolean = false;

  constructor() {
    this.logger = AgLogger.createLogger({
      defaultLogger: ConsoleLogger,
      formatter: PlainFormatter,
      logLevel: AG_LOGLEVEL.INFO,
    });
  }

  enableDebugMode(): void {
    this.isDebugMode = true;
    this.logger.logLevel = AG_LOGLEVEL.DEBUG;
    this.logger.debug('デバッグモード有効化');
  }

  disableDebugMode(): void {
    this.isDebugMode = false;
    this.logger.logLevel = AG_LOGLEVEL.INFO;
    this.logger.info('デバッグモード無効化');
  }

  performOperation(operation: string): void {
    this.logger.info('操作開始:', operation);

    if (this.isDebugMode) {
      const startTime = Date.now();
      const memoryBefore = process.memoryUsage();

      try {
        this.executeOperation(operation);

        const endTime = Date.now();
        const memoryAfter = process.memoryUsage();

        this.logger.debug('操作完了:', {
          operation,
          duration: `${endTime - startTime}ms`,
          memoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
        });
      } catch (error) {
        this.logger.error('操作エラー:', { operation, error });
        throw error;
      }
    } else {
      try {
        this.executeOperation(operation);
        this.logger.info('操作完了:', operation);
      } catch (error) {
        this.logger.error('操作エラー:', operation, error);
        throw error;
      }
    }
  }
}
```

---

## 実践的なログレベル管理

### 環境別ログレベル設定

```typescript
// 設定管理クラス
class LoggerConfig {
  static getLoggerForEnvironment(): AgLogger {
    const environment = process.env.NODE_ENV || 'development';

    switch (environment) {
      case 'development':
        return AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: PlainFormatter, // 開発時は読みやすい形式
          logLevel: AG_LOGLEVEL.TRACE,
        });

      case 'test':
        return AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: PlainFormatter,
          logLevel: AG_LOGLEVEL.WARN, // テスト時は警告以上のみ
        });

      case 'staging':
        return AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: JsonFormatter, // ステージングでは JSON 形式
          logLevel: AG_LOGLEVEL.INFO,
        });

      case 'production':
        return AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: JsonFormatter, // ログ収集に適した JSON 形式
          logLevel: AG_LOGLEVEL.WARN, // 本番は警告以上のみ
        });

      default:
        return AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: PlainFormatter,
          logLevel: AG_LOGLEVEL.INFO,
        });
    }
  }
}

// 使用例
const logger = LoggerConfig.getLoggerForEnvironment();
```

### フィーチャーフラグによるログ制御

```typescript
// フィーチャーフラグベースのログ制御
class FeatureLogger {
  private logger: AgLogger;
  private features: Map<string, boolean>;

  constructor(baseLogLevel: AgLogLevel = AG_LOGLEVEL.INFO) {
    this.logger = AgLogger.createLogger({
      defaultLogger: ConsoleLogger,
      formatter: PlainFormatter,
      logLevel: baseLogLevel,
    });
    this.features = new Map();
  }

  enableFeature(feature: string): void {
    this.features.set(feature, true);
    this.logger.info(`フィーチャー有効化: ${feature}`);
  }

  disableFeature(feature: string): void {
    this.features.set(feature, false);
    this.logger.info(`フィーチャー無効化: ${feature}`);
  }

  logWithFeature(feature: string, level: AgLogLevel, message: string, ...args: unknown[]): void {
    if (!this.features.get(feature)) {
      return; // フィーチャーが無効な場合はログしない
    }

    switch (level) {
      case AG_LOGLEVEL.TRACE:
        this.logger.trace(`[${feature}] ${message}`, ...args);
        break;
      case AG_LOGLEVEL.DEBUG:
        this.logger.debug(`[${feature}] ${message}`, ...args);
        break;
      case AG_LOGLEVEL.INFO:
        this.logger.info(`[${feature}] ${message}`, ...args);
        break;
      case AG_LOGLEVEL.WARN:
        this.logger.warn(`[${feature}] ${message}`, ...args);
        break;
      case AG_LOGLEVEL.ERROR:
        this.logger.error(`[${feature}] ${message}`, ...args);
        break;
      case AG_LOGLEVEL.FATAL:
        this.logger.fatal(`[${feature}] ${message}`, ...args);
        break;
    }
  }
}

// 使用例
const featureLogger = new FeatureLogger();
featureLogger.enableFeature('USER_ANALYTICS');
featureLogger.enableFeature('PERFORMANCE_MONITORING');

featureLogger.logWithFeature('USER_ANALYTICS', AG_LOGLEVEL.INFO, 'ユーザー行動記録', { userId: '12345' });
featureLogger.logWithFeature('PERFORMANCE_MONITORING', AG_LOGLEVEL.DEBUG, 'パフォーマンス測定', { loadTime: 150 });
```

### 時間ベースのログレベル調整

```typescript
// 時間帯に応じたログレベル自動調整
class TimeBasedLogger {
  private logger: AgLogger;
  private scheduleTimer?: NodeJS.Timeout;

  constructor() {
    this.logger = AgLogger.createLogger({
      defaultLogger: ConsoleLogger,
      formatter: PlainFormatter,
      logLevel: AG_LOGLEVEL.INFO,
    });
    this.adjustLogLevelByTime();
    this.startScheduler();
  }

  private adjustLogLevelByTime(): void {
    const hour = new Date().getHours();

    if (hour >= 22 || hour < 6) {
      // 夜間：重要なログのみ
      this.logger.logLevel = AG_LOGLEVEL.WARN;
      this.logger.warn('夜間モード: 警告レベル以上のみ出力');
    } else if (hour >= 9 && hour < 18) {
      // 業務時間：詳細ログ
      this.logger.logLevel = AG_LOGLEVEL.DEBUG;
      this.logger.debug('業務時間: デバッグレベル有効');
    } else {
      // その他：標準ログ
      this.logger.logLevel = AG_LOGLEVEL.INFO;
      this.logger.info('標準時間: 情報レベル有効');
    }
  }

  private startScheduler(): void {
    // 1時間ごとにログレベルを再評価
    this.scheduleTimer = setInterval(() => {
      this.adjustLogLevelByTime();
    }, 60 * 60 * 1000); // 1時間
  }

  getLogger(): AgLogger {
    return this.logger;
  }

  destroy(): void {
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer);
    }
  }
}
```

---

### See Also

- [ログレベルの設定・変更](02-log-level-control.md)
- [ロガー詳細](04-logger-details.md)
- [目次](README.md)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
