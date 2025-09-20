---
header:
  - src: 06-advanced-logging.md
  - @(#): Advanced Logging Features
title: agla-logger
description: 高度なロガー機能と特殊ログレベルの詳細ガイド
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

## 高度なロガー機能

このセクションでは、agla-logger のログ機能について詳しく解説します。
特殊ログメソッド、特殊ログレベル、レベル別出力先設定など、より柔軟なログ制御方法を学べます。

---

## 特殊ログメソッド

### logger.log() - 強制出力

`logger.log()` は特殊なメソッドで、ログレベル設定に関係なく常に出力されます:

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.OFF, // すべてのログを停止
});

// 通常のログは出力されない
logger.fatal('出力されない'); // ❌ OFF(0) で停止
logger.error('出力されない'); // ❌ OFF(0) で停止
logger.info('出力されない'); // ❌ OFF(0) で停止

// logger.log() は強制出力される
logger.log('常に出力される'); // ✅ ログレベルに関係なく出力
```

### logger.log() の活用例

```typescript
// デバッグ用の重要な情報を確実に出力
function criticalOperation() {
  logger.log('=== 重要な処理開始 ==='); // 必ず出力される

  try {
    performCriticalTask();
    logger.log('重要な処理完了'); // 必ず出力される
  } catch (error) {
    logger.log('重要な処理でエラー発生:', error); // 必ず出力される
    throw error;
  }
}

// 本番環境でも残したいシステム情報
logger.log('アプリケーション起動:', {
  version: '1.0.0',
  nodeVersion: process.version,
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
});
```

---

## 特殊ログレベル

AG_LOGLEVEL には負の値を持つ特殊レベルがあります:

```typescript
import { AG_LOGLEVEL } from '@aglabo/agla-logger';

// 特殊レベル（負の値）
const specialLevels = {
  VERBOSE: AG_LOGLEVEL.VERBOSE, // -11: verbose mode用
  LOG: AG_LOGLEVEL.LOG, // -12: logger.log()メソッド用
  DEFAULT: AG_LOGLEVEL.DEFAULT, // -99: デフォルトレベル（INFO相当）
};

console.log('特殊レベル値:', specialLevels);
// 出力: { VERBOSE: -11, LOG: -12, DEFAULT: -99 }
```

### VERBOSE レベルの活用

```typescript
// verbose mode での詳細ログ
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
  verbose: true, // verbose mode 有効
});

// verbose mode 有効時の動作
logger.verbose('詳細な実行情報', {
  step: 'data-processing',
  iteration: 42,
  memoryUsage: process.memoryUsage(),
});
```

### DEFAULT レベルの使用

```typescript
// DEFAULT レベル（INFO相当）の動的設定
function getLogLevelFromConfig(config: AppConfig): AgLogLevel {
  if (config.logLevel === 'default') {
    return AG_LOGLEVEL.DEFAULT; // INFO(4) と同等の動作
  }
  return AG_LOGLEVEL[config.logLevel.toUpperCase()];
}
```

---

## LoggerMap による高度な設定

### レベル別出力先指定

`loggerMap` オプションを使用して、ログレベルごとに異なる出力先を指定できます:

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

// カスタム出力関数
const errorFileLogger = (message: string) => {
  // エラーログをファイルに出力
  console.error(`[ERROR FILE] ${message}`);
};

const auditLogger = (message: string) => {
  // 監査ログを特別な場所に出力
  console.log(`[AUDIT] ${message}`);
};

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.TRACE,
  loggerMap: {
    // レベル別の出力先を指定
    [AG_LOGLEVEL.ERROR]: errorFileLogger, // エラーはファイルへ
    [AG_LOGLEVEL.FATAL]: errorFileLogger, // 致命的エラーもファイルへ
    [AG_LOGLEVEL.INFO]: auditLogger, // 情報ログは監査用
  },
});

// 各ログが指定された出力先に送られる
logger.fatal('システム停止'); // → errorFileLogger
logger.error('データベースエラー'); // → errorFileLogger
logger.info('ユーザーログイン'); // → auditLogger
logger.debug('デバッグ情報'); // → ConsoleLogger (default)
```

### 複数出力先への同時ログ

```typescript
// 複数の出力先を組み合わせる関数
const multiLogger = (message: string) => {
  ConsoleLogger(message); // コンソール出力
  errorFileLogger(message); // ファイル出力
  auditLogger(message); // 監査ログ出力
};

const criticalLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.WARN,
  loggerMap: {
    // 致命的エラーは全ての出力先に
    [AG_LOGLEVEL.FATAL]: multiLogger,
  },
});

criticalLogger.fatal('システム完全停止'); // 3箇所に同時出力
```

### 環境別LoggerMap設定

```typescript
// 環境に応じたLoggerMap設定
function createEnvironmentLogger(): AgLogger {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  const baseConfig = {
    defaultLogger: ConsoleLogger,
    formatter: PlainFormatter,
    logLevel: isProduction ? AG_LOGLEVEL.WARN : AG_LOGLEVEL.DEBUG,
  };

  if (isProduction) {
    // 本番環境: エラーは外部サービスに送信
    return AgLogger.createLogger({
      ...baseConfig,
      loggerMap: {
        [AG_LOGLEVEL.ERROR]: (message) => {
          ConsoleLogger(message);
          sendToExternalService(message); // 外部エラー追跡サービス
        },
        [AG_LOGLEVEL.FATAL]: (message) => {
          ConsoleLogger(message);
          sendToExternalService(message);
          sendToSlack(message); // Slack通知
        },
      },
    });
  } else if (isDevelopment) {
    // 開発環境: 詳細なデバッグ出力
    return AgLogger.createLogger({
      ...baseConfig,
      loggerMap: {
        [AG_LOGLEVEL.TRACE]: (message) => {
          console.log(`🔍 ${message}`); // デバッグ用絵文字
        },
        [AG_LOGLEVEL.DEBUG]: (message) => {
          console.log(`🐛 ${message}`);
        },
      },
    });
  }

  return AgLogger.createLogger(baseConfig);
}

// 使用例
const logger = createEnvironmentLogger();
```

---

## パッケージ選択ガイド

### @aglabo/agla-logger (推奨)

```typescript
// 推奨: aggregator パッケージ
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';
```

**特徴:**

- すべての機能を含む統合パッケージ
- 依存関係が自動で解決される
- 通常の使用ではこちらを選択

**適用場面:**

- 新規プロジェクト
- 一般的なアプリケーション開発
- フル機能が必要な場合

### @aglabo/agla-logger-core

```typescript
// 特別な場合のみ: core パッケージ
import { AG_LOGLEVEL, AgLogger } from '@aglabo/agla-logger-core';
import { ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger-core';
```

**特徴:**

- コア機能のみの軽量パッケージ
- 最小限の依存関係
- バンドルサイズを重視する場合

**適用場面:**

- ライブラリ開発
- バンドルサイズが重要な Web アプリ
- 特定の機能のみ必要な場合

### 選択の指針

```typescript
// プロジェクトタイプ別の推奨
const packageRecommendation = {
  // Web アプリケーション
  webApp: '@aglabo/agla-logger',

  // Node.js サーバー
  nodeServer: '@aglabo/agla-logger',

  // ライブラリ開発
  library: '@aglabo/agla-logger-core', // 軽量性重視

  // React/Vue アプリ
  frontend: '@aglabo/agla-logger', // 機能性重視

  // マイクロサービス
  microservice: '@aglabo/agla-logger-core', // サイズ重視
};
```

---

## 実践的な組み合わせ例

### 本番環境向け高度設定

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, JsonFormatter, PlainFormatter } from '@aglabo/agla-logger';

// 本番環境用の包括的なロガー設定
const productionLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter, // 構造化ログ
  logLevel: AG_LOGLEVEL.WARN,
  verbose: false,
  loggerMap: {
    // 致命的エラー: 複数出力 + アラート
    [AG_LOGLEVEL.FATAL]: (message) => {
      console.error(message); // 標準エラー出力
      writeToErrorFile(message); // エラーファイル
      sendToMonitoringService(message); // 監視サービス
      triggerPagerDuty(message); // 緊急アラート
    },

    // エラー: ファイル + 監視サービス
    [AG_LOGLEVEL.ERROR]: (message) => {
      console.error(message);
      writeToErrorFile(message);
      sendToMonitoringService(message);
    },

    // 警告: 標準出力 + 集計
    [AG_LOGLEVEL.WARN]: (message) => {
      console.warn(message);
      aggregateWarnings(message); // 警告の集計・分析
    },
  },
});

// システム起動時の重要情報は必ず記録
productionLogger.log('Production system started', {
  version: process.env.APP_VERSION,
  nodeVersion: process.version,
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
});
```

---

### See Also

- [フォーマッター活用](03-formatter-usage.md)
- [エラーハンドリング](05-error-handling.md)
- [目次](README.md)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
