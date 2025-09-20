---
header:
  - src: 01-basic-logger-operations.md
  - @(#): Basic Logger Operations
title: agla-logger
description: ロガーインスタンスの作成と基本的なログ出力方法
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

## 基本的なロガー操作

このセクションでは、agla-logger の最も基本的な操作について解説します。
ロガーインスタンスの作成から、各ログレベルでの出力、基本的な使用方法まで、実用的なコード例とともに学べます。

---

## ロガーインスタンスの作成

### デフォルト設定でのロガー作成

```typescript
import { AgLogger } from '@aglabo/agla-logger-core';

// 最もシンプルなロガーの作成 (シングルトンパターン)
const logger = AgLogger.createLogger();

// ⚠️ 注意: デフォルト設定では安全のため空文字列を返す NullFormatter, 何も出力しない NullLoggerを設定します。
logger.info('このメッセージは出力されません'); // NullFormatter + NUllLogger のため
```

> 重要
>
> AgLoggerはデフォルトで`NullLogger`と`NullFormatter`を使用し、意図しないログ出力を防ぐ安全な設計になっています。
> 実際にログを出力するには明示的な設定が必要です。

### 実際にログを出力するための設定

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger-core';

// ログを出力するには defaultLogger と formatter の両方が必要
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger, // 出力先を指定 (重要)
  formatter: PlainFormatter, // フォーマッターを指定 (重要)
  logLevel: AG_LOGLEVEL.DEBUG, // ログレベルを DEBUG に設定
});

logger.debug('これで実際にログが出力されます');
logger.info('アプリケーション開始');
```

### 設定オプションの詳細

```typescript
interface AgLoggerOptions {
  defaultLogger?: AgLoggerFunction; // デフォルト出力先 (デフォルト: NullLogger)
  formatter?: AgFormatterInput; // フォーマッター (デフォルト: NullFormatter)
  logLevel?: AgLogLevel; // ログレベル (デフォルト: AG_LOGLEVEL.OFF)
  verbose?: boolean; // verboseモード (デフォルト: false)
  loggerMap?: Partial<AgLoggerMap>; // レベル別ロガー設定 (デフォルト: {})
}

// 各オプションの使用例
const productionLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger, // 出力先を指定
  formatter: JsonFormatter, // JSON形式で出力
  logLevel: AG_LOGLEVEL.WARN, // 警告レベル以上のみ出力
  verbose: false, // verbose無効
});

const developmentLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger, // 出力先を指定
  formatter: PlainFormatter, // 読みやすいプレーン形式
  logLevel: AG_LOGLEVEL.TRACE, // 全レベル出力
  verbose: true, // verbose有効
});
```

---

## 基本的なログ出力

### 各ログレベルでの出力

```typescript
// ログを出力するための設定
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.TRACE,
});

// 各ログレベルでの基本的な出力
logger.trace('最も詳細なデバッグ情報');
logger.debug('デバッグ情報: 変数の状態確認');
logger.info('一般的な情報: アプリケーション開始');
logger.warn('警告: 設定ファイルが見つかりません');
logger.error('エラー: データベース接続失敗');
logger.fatal('致命的エラー: システム停止が必要');
```

### 複数の引数を渡すログ出力

```typescript
// 複数の値を同時にログ出力
const userId = '12345';
const timestamp = new Date();
const requestData = { action: 'login', ip: '192.168.1.1' };

logger.info('ユーザーログイン:', userId, timestamp, requestData);

// 計算結果と実行時間をログ出力
const startTime = Date.now();
const result = performCalculation();
const elapsedTime = Date.now() - startTime;

logger.debug('処理結果:', result, '実行時間:', elapsedTime, 'ms');
```

### 構造化データのログ出力

```typescript
// オブジェクトを含む構造化ログ
const userActivity = {
  userId: '12345',
  action: 'file_upload',
  filename: 'document.pdf',
  fileSize: 2048576,
  timestamp: new Date().toISOString(),
  metadata: {
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
  },
};

logger.info('ユーザー活動記録:', userActivity);

// 配列データのログ出力
const processedItems = ['item1', 'item2', 'item3'];
const errors = [
  { id: 1, message: 'Validation failed' },
  { id: 2, message: 'Network timeout' },
];

logger.info('処理完了アイテム:', processedItems);
logger.warn('処理中のエラー:', errors);
```

---

## ログレベル別出力

### 現在のログレベル確認

````typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
});

// 現在のログレベルを確認
console.log('現在のログレベル:', logger.logLevel);
// 出力: 現在のログレベル: 5 (= AG_LOGLEVEL.DEBUG)

### ログレベル設定

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

// ログレベルを動的に変更
logger.logLevel = AG_LOGLEVEL.DEBUG;
console.log('変更後のログレベル:', logger.logLevel); // 5 (= AG_LOGLEVEL.DEBUG)

// 設定したレベル以上のログが出力される
logger.trace('このメッセージは出力されます');     // TRACE = 6: DEBUG(5) 以上のため出力される
logger.debug('このメッセージは出力されます');     // DEBUG = 5: 設定レベルと同じため出力される
logger.info('このメッセージは出力されません');    // INFO  = 4: DEBUG(5) より低いため出力されない
````

### 条件付きログ出力の活用

```typescript
// 重い処理を含む場合の効率的なログ出力
function processLargeDataset(data: unknown[]) {
  const logger = AgLogger.createLogger({
    defaultLogger: ConsoleLogger,
    formatter: PlainFormatter,
    logLevel: AG_LOGLEVEL.DEBUG,
  });

  logger.info('大容量データ処理開始:', data.length, '件');

  // デバッグレベルが有効な場合のみ詳細情報を生成
  // (TRACE=6, DEBUG=5, INFO=4なので、DEBUG以下なら詳細ログを出力)
  if (logger.logLevel <= AG_LOGLEVEL.DEBUG) {
    const memoryUsage = process.memoryUsage();
    const detailedInfo = {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
    };
    logger.debug('処理開始時メモリ使用量:', detailedInfo);
  }

  data.forEach((item, index) => {
    // トレースレベルが有効な場合のみ各アイテムをログ
    if (logger.logLevel <= AG_LOGLEVEL.TRACE) {
      logger.trace(`処理中 [${index}/${data.length}]:`, item);
    }

    try {
      processItem(item);
    } catch (error) {
      logger.error(`データ処理エラー [${index}]:`, error);
    }
  });

  logger.info('大容量データ処理完了');
}
```

### 実践的な使用例

```typescript
// アプリケーション起動時のログ
function initializeApplication() {
  // ログを出力するための設定
  const logger = AgLogger.createLogger({
    defaultLogger: ConsoleLogger,
    formatter: PlainFormatter,
    logLevel: AG_LOGLEVEL.INFO,
  });

  logger.info('=== アプリケーション起動 ===');

  try {
    // 設定ファイル読み込み
    const config = loadConfiguration();
    logger.info('設定ファイル読み込み完了:', config.version);

    // データベース接続
    const db = connectToDatabase();
    logger.info('データベース接続確立:', db.host);

    // 外部API接続確認
    const apiStatus = checkExternalAPI();
    if (apiStatus.available) {
      logger.info('外部API接続確認完了:', apiStatus.endpoint);
    } else {
      logger.warn('外部API接続失敗:', apiStatus.error);
    }

    logger.info('=== アプリケーション起動完了 ===');
  } catch (error) {
    logger.fatal('アプリケーション起動失敗:', error);
    process.exit(1);
  }
}

// API リクエスト処理のログ
function handleAPIRequest(request: Request) {
  const requestId = generateRequestId();

  logger.info('API リクエスト開始:', {
    requestId,
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
  });

  try {
    const result = processRequest(request);

    logger.info('API リクエスト成功:', {
      requestId,
      statusCode: 200,
      responseTime: result.processingTime,
    });

    return result;
  } catch (error) {
    logger.error('API リクエストエラー:', {
      requestId,
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
}
```

---

### See Also

- [ログレベル制御](02-log-level-control.md)
- [目次](README.md)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
