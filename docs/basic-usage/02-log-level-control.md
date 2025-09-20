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

### 必要要件

- Node.js: v20 以上 (ESM サポートのため)
- TypeScript: v5.0 以上推奨
- パッケージインストール済み: `@aglabo/agla-logger-core`

---

## ログレベルの基本概念

### ログレベル階層

agla-logger では以下の6つのログレベルが定義されています（重要度順）：

```typescript
import { AG_LOGLEVEL } from '@aglabo/agla-logger-core';

// ログレベル階層（低い → 高い重要度）
const logLevels = [
  AG_LOGLEVEL.TRACE, // 0 - 最も詳細なデバッグ情報
  AG_LOGLEVEL.DEBUG, // 1 - デバッグ情報
  AG_LOGLEVEL.INFO, // 2 - 一般的な情報（デフォルト）
  AG_LOGLEVEL.WARN, // 3 - 警告
  AG_LOGLEVEL.ERROR, // 4 - エラー
  AG_LOGLEVEL.FATAL, // 5 - 致命的エラー
];

// 文字列での指定も可能
const stringLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
```

### ログレベルフィルタリングの仕組み

```typescript
const logger = new AgLogger({ logLevel: AG_LOGLEVEL.WARN });

// WARN レベル設定時の出力例
logger.trace('出力されない'); // ❌ TRACE < WARN
logger.debug('出力されない'); // ❌ DEBUG < WARN
logger.info('出力されない'); // ❌ INFO < WARN
logger.warn('出力される'); // ✅ WARN = WARN
logger.error('出力される'); // ✅ ERROR > WARN
logger.fatal('出力される'); // ✅ FATAL > WARN
```

---

## ログレベルの設定と変更

### 作成時のログレベル指定

```typescript
import { AG_LOGLEVEL, AgLogger } from '@aglabo/agla-logger-core';

// 定数を使用した指定
const debugLogger = new AgLogger({ logLevel: AG_LOGLEVEL.DEBUG });

// 文字列を使用した指定
const infoLogger = new AgLogger({ logLevel: 'info' });

// 数値を使用した指定
const warnLogger = new AgLogger({ logLevel: 3 }); // WARN レベル
```

### 実行時のログレベル変更

```typescript
const logger = new AgLogger();

// 現在のログレベル確認
console.log('初期ログレベル:', logger.getLogLevel()); // 'info'

// ログレベルを変更
logger.setLogLevel(AG_LOGLEVEL.DEBUG);
console.log('変更後ログレベル:', logger.getLogLevel()); // 'debug'

// 文字列でも変更可能
logger.setLogLevel('error');
console.log('再変更後ログレベル:', logger.getLogLevel()); // 'error'
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

const logger = new AgLogger({
  logLevel: getLogLevelFromEnvironment(),
});

// 実行時の動的変更
function adjustLogLevel() {
  if (process.env.NODE_ENV === 'development') {
    logger.setLogLevel(AG_LOGLEVEL.DEBUG);
    logger.debug('開発環境: デバッグレベル有効');
  } else if (process.env.NODE_ENV === 'production') {
    logger.setLogLevel(AG_LOGLEVEL.WARN);
    logger.warn('本番環境: 警告レベル以上のみ');
  } else {
    logger.setLogLevel(AG_LOGLEVEL.INFO);
    logger.info('その他環境: 情報レベル有効');
  }
}
```

---

## 条件付きログ出力

### ログレベル判定メソッド

```typescript
const logger = new AgLogger({ logLevel: 'debug' });

// 各ログレベルの有効性確認
const levelChecks = {
  trace: logger.isTraceEnabled(), // false (DEBUG > TRACE)
  debug: logger.isDebugEnabled(), // true  (DEBUG = DEBUG)
  info: logger.isInfoEnabled(), // true  (DEBUG < INFO)
  warn: logger.isWarnEnabled(), // true  (DEBUG < WARN)
  error: logger.isErrorEnabled(), // true  (DEBUG < ERROR)
  fatal: logger.isFatalEnabled(), // true  (DEBUG < FATAL)
};

console.log('ログレベル有効性:', levelChecks);
```

### 効率的な条件付きログ

```typescript
// 重い処理を含む場合の最適化
function processComplexData(data: ComplexData[]) {
  logger.info('複雑データ処理開始:', data.length, '件');

  // デバッグレベルが有効な場合のみ詳細分析実行
  if (logger.isDebugEnabled()) {
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
    if (logger.isTraceEnabled()) {
      logger.trace(`処理進捗: [${index + 1}/${data.length}] ${item.id}`);
    }

    try {
      const result = processItem(item);

      // デバッグレベルでの処理結果
      if (logger.isDebugEnabled()) {
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
    this.logger = new AgLogger({ logLevel: 'info' });
  }

  enableDebugMode(): void {
    this.isDebugMode = true;
    this.logger.setLogLevel(AG_LOGLEVEL.DEBUG);
    this.logger.debug('デバッグモード有効化');
  }

  disableDebugMode(): void {
    this.isDebugMode = false;
    this.logger.setLogLevel(AG_LOGLEVEL.INFO);
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
        return new AgLogger({
          logLevel: AG_LOGLEVEL.TRACE,
          formatter: 'plain', // 開発時は読みやすい形式
        });

      case 'test':
        return new AgLogger({
          logLevel: AG_LOGLEVEL.WARN, // テスト時は警告以上のみ
          formatter: 'plain',
        });

      case 'staging':
        return new AgLogger({
          logLevel: AG_LOGLEVEL.INFO,
          formatter: 'json', // ステージングでは JSON 形式
        });

      case 'production':
        return new AgLogger({
          logLevel: AG_LOGLEVEL.WARN, // 本番は警告以上のみ
          formatter: 'json', // ログ収集に適した JSON 形式
        });

      default:
        return new AgLogger({
          logLevel: AG_LOGLEVEL.INFO,
          formatter: 'plain',
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
    this.logger = new AgLogger({ logLevel: baseLogLevel });
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
    this.logger = new AgLogger();
    this.adjustLogLevelByTime();
    this.startScheduler();
  }

  private adjustLogLevelByTime(): void {
    const hour = new Date().getHours();

    if (hour >= 22 || hour < 6) {
      // 夜間：重要なログのみ
      this.logger.setLogLevel(AG_LOGLEVEL.WARN);
      this.logger.warn('夜間モード: 警告レベル以上のみ出力');
    } else if (hour >= 9 && hour < 18) {
      // 業務時間：詳細ログ
      this.logger.setLogLevel(AG_LOGLEVEL.DEBUG);
      this.logger.debug('業務時間: デバッグレベル有効');
    } else {
      // その他：標準ログ
      this.logger.setLogLevel(AG_LOGLEVEL.INFO);
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

- [基本的なロガー操作](01-basic-logger-operations.md) - ロガーの基本的な使用方法
- [フォーマッター活用](03-formatter-usage.md) - 出力形式のカスタマイズ
- [エラーハンドリング](04-error-handling.md) - エラーログの効果的な活用
- [Basic Usage Guide](README.md) - 目次に戻る

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
