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

### 必要要件

- Node.js: v20 以上 (ESM サポートのため)
- TypeScript: v5.0 以上推奨
- パッケージインストール済み: `@aglabo/agla-logger-core`

---

## ロガーインスタンスの作成

### デフォルト設定でのロガー作成

```typescript
import { AgLogger } from '@aglabo/agla-logger-core';

// 最もシンプルなロガーの作成
const logger = new AgLogger();

// すぐに使用可能
logger.info('ロガーが作成されました');
```

### オプション付きでのロガー作成

```typescript
import { AG_LOGLEVEL, AgLogger } from '@aglabo/agla-logger-core';

// 詳細設定でロガーを作成
const customLogger = new AgLogger({
  logLevel: AG_LOGLEVEL.DEBUG, // ログレベルを DEBUG に設定
  enabled: true, // ログ出力を有効化
  formatter: 'json', // JSON形式で出力
});

customLogger.debug('カスタム設定ロガーが作成されました');
```

### 設定オプションの詳細

```typescript
interface AgLoggerOptions {
  logLevel?: AgLogLevel | string; // ログレベル (デフォルト: 'info')
  enabled?: boolean; // ログ出力の有効/無効 (デフォルト: true)
  formatter?: AgFormatFunction | string; // フォーマッター (デフォルト: 'plain')
}

// 各オプションの使用例
const productionLogger = new AgLogger({
  logLevel: 'warn', // 警告レベル以上のみ出力
  enabled: true, // 本番環境でも有効
  formatter: 'json', // ログ収集に適した JSON 形式
});

const developmentLogger = new AgLogger({
  logLevel: 'trace', // 全レベル出力
  enabled: true, // 開発中は有効
  formatter: 'plain', // 読みやすいプレーン形式
});
```

---

## 基本的なログ出力

### 各ログレベルでの出力

```typescript
const logger = new AgLogger();

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

```typescript
const logger = new AgLogger({ logLevel: 'debug' });

// 現在のログレベルを確認
console.log('現在のログレベル:', logger.getLogLevel());
// 出力: 現在のログレベル: debug

// ログレベルの数値表現
console.log('ログレベル数値:', logger.getLogLevelValue());
// 出力: ログレベル数値: 20 (DEBUG レベルの数値)
```

### ログレベル判定メソッド

```typescript
const logger = new AgLogger({ logLevel: 'info' });

// 各ログレベルが有効かどうかを判定
console.log('trace 有効:', logger.isTraceEnabled()); // false
console.log('debug 有効:', logger.isDebugEnabled()); // false
console.log('info 有効:', logger.isInfoEnabled()); // true
console.log('warn 有効:', logger.isWarnEnabled()); // true
console.log('error 有効:', logger.isErrorEnabled()); // true
console.log('fatal 有効:', logger.isFatalEnabled()); // true
```

### 条件付きログ出力の活用

```typescript
// 重い処理を含む場合の効率的なログ出力
function processLargeDataset(data: unknown[]) {
  logger.info('大容量データ処理開始:', data.length, '件');

  // デバッグレベルが有効な場合のみ詳細情報を生成
  if (logger.isDebugEnabled()) {
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
    if (logger.isTraceEnabled()) {
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

- [ログレベル制御](02-log-level-control.md) - ログレベルの詳細設定
- [フォーマッター活用](03-formatter-usage.md) - 出力形式のカスタマイズ
- [エラーハンドリング](04-error-handling.md) - エラーログの効果的な活用
- [Basic Usage Guide](README.md) - 目次に戻る

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
