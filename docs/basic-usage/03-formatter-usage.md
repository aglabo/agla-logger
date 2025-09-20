---
header:
  - src: 03-formatter-usage.md
  - @(#): Formatter Usage
title: agla-logger
description: フォーマッターの活用とカスタムフォーマッターの実装ガイド
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

## フォーマッター活用

このセクションでは、`agla-logger` のフォーマッター機能について詳しく解説します。
組み込みフォーマッターの使い分けから、カスタムフォーマッターの実装、動的なフォーマッター切り替えまで、実践的な活用方法を学べます。

---

## 組み込みフォーマッター

### Plain フォーマッター

```typescript
import { AgLogger, PlainFormatter } from '@aglabo/agla-logger-core';

// Plain フォーマッターの使用
const plainLogger = new AgLogger({
  formatter: new PlainFormatter(),
});

plainLogger.info('ユーザーログイン', { userId: '12345', timestamp: new Date() });
// 出力例: [2025-09-20T10:30:15Z] INFO: ユーザーログイン {"userId":"12345","timestamp":"2025-09-20T10:30:15.123Z"}

plainLogger.error('データベース接続エラー', { host: 'localhost', port: 5432 });
// 出力例: [2025-09-20T10:30:15Z] ERROR: データベース接続エラー {"host":"localhost","port":5432}
```

### JSON フォーマッター

```typescript
import { AgLogger, JsonFormatter } from '@aglabo/agla-logger-core';

// JSON フォーマッターの使用
const jsonLogger = new AgLogger({
  formatter: new JsonFormatter(),
});

jsonLogger.info('ユーザーログイン', { userId: '12345', sessionId: 'abc123' });
// 出力例: {"level":"info","message":"ユーザーログイン","timestamp":"2025-09-20T10:30:15Z","data":{"userId":"12345","sessionId":"abc123"}}

jsonLogger.warn('メモリ使用量警告', { usage: '85%', threshold: '80%' });
// 出力例: {"level":"warn","message":"メモリ使用量警告","timestamp":"2025-09-20T10:30:15Z","data":{"usage":"85%","threshold":"80%"}}
```

### フォーマッター比較

```typescript
// 同じログを異なるフォーマッターで出力
const logData = {
  userId: '12345',
  action: 'file_upload',
  filename: 'document.pdf',
  size: 2048576,
};

// シングルトンロガーでフォーマッターを動的に変更
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
});

// Plain フォーマッターを設定
logger.setFormatter(PlainFormatter);

console.log('=== Plain フォーマッター ===');
logger.info('ファイルアップロード完了', logData);

// フォーマッターを JSON に変更
logger.setFormatter(JsonFormatter);

console.log('=== JSON フォーマッター ===');
logger.info('ファイルアップロード完了', logData);
```

---

## カスタムフォーマッターの実装

### 基本的なカスタムフォーマッター

```typescript
import type { AgFormatFunction, AgLogMessage } from '@aglabo/agla-logger-core';

// シンプルなカスタムフォーマッター
const simpleFormatter: AgFormatFunction = (logMessage: AgLogMessage) => {
  const timestamp = logMessage.timestamp.toISOString();
  const level = logMessage.logLevel;
  const message = logMessage.message;
  const args = logMessage.args;
  const argsStr = args.length > 0
    ? ' | ' + args.map((arg) => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
    : '';

  return `${timestamp} [${level.toString().toUpperCase()}] ${message}${argsStr}`;
};

// カスタムフォーマッターを適用
const customLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: simpleFormatter,
});

customLogger.info('カスタムフォーマット例', { data: 'test', count: 42 });
// 出力例: 2025-09-20T10:30:15.123Z [INFO] カスタムフォーマット例 | {"data":"test","count":42}
```

### 色付きフォーマッター

```typescript
// ANSI カラーコードを使用した色付きフォーマッター
const colorFormatter: AgFormatFunction = (logMessage: AgLogMessage) => {
  const timestamp = logMessage.timestamp.toISOString();
  const level = logMessage.logLevel;
  const message = logMessage.message;
  const args = logMessage.args;
  const argsStr = args.length > 0
    ? ' ' + args.map((arg) => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ')
    : '';

  // レベル別カラーコード
  const colors = {
    trace: '\x1b[90m', // グレー
    debug: '\x1b[36m', // シアン
    info: '\x1b[32m', // グリーン
    warn: '\x1b[33m', // イエロー
    error: '\x1b[31m', // レッド
    fatal: '\x1b[35m', // マゼンタ
  };

  const reset = '\x1b[0m';
  const levelString = level.toString();
  const color = colors[levelString as keyof typeof colors] || '';

  return `\x1b[90m${timestamp}${reset} ${color}[${levelString.toUpperCase()}]${reset} ${message}${argsStr}`;
};

// 開発環境での使用例
const colorLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: colorFormatter,
});

colorLogger.debug('デバッグ情報', { step: 1 });
colorLogger.info('処理開始', { timestamp: Date.now() });
colorLogger.warn('警告メッセージ', { threshold: '80%' });
colorLogger.error('エラーが発生', { code: 'ERR001' });
```

### 構造化フォーマッター

```typescript
// 構造化ログ専用フォーマッター
const structuredFormatter: AgFormatFunction = (logMessage: AgLogMessage) => {
  const logEntry = {
    '@timestamp': logMessage.timestamp.toISOString(),
    '@level': logMessage.logLevel.toString(),
    '@message': logMessage.message,
    '@version': '1.0',
    fields: {},
  };

  // 引数を構造化データに変換
  logMessage.args.forEach((arg, index) => {
    if (typeof arg === 'object' && arg !== null) {
      Object.assign(logEntry.fields, arg);
    } else {
      (logEntry.fields as any)[`arg${index}`] = arg;
    }
  });

  return JSON.stringify(logEntry);
};

// ELK Stack やその他のログ収集システム向け
const structuredLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: structuredFormatter,
});

structuredLogger.info('API リクエスト', {
  method: 'POST',
  url: '/api/users',
  statusCode: 201,
  duration: 150,
  userId: '12345',
});
// 出力例: {"@timestamp":"2025-09-20T10:30:15.123Z","@level":"info","@message":"API リクエスト","@version":"1.0","fields":{"method":"POST","url":"/api/users","statusCode":201,"duration":150,"userId":"12345"}}
```

### CSV フォーマッター

```typescript
// CSV 形式フォーマッター（データ分析用）
const csvFormatter: AgFormatFunction = (logMessage: AgLogMessage) => {
  const timestamp = logMessage.timestamp.toISOString();
  const level = logMessage.logLevel.toString();
  const message = logMessage.message;
  const args = logMessage.args;

  // CSV エスケープ処理
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const argsStr = args.map((arg) => {
    if (typeof arg === 'object') {
      return escapeCSV(JSON.stringify(arg));
    }
    return escapeCSV(String(arg));
  }).join('|');

  return [
    escapeCSV(timestamp),
    escapeCSV(level),
    escapeCSV(message),
    escapeCSV(argsStr),
  ].join(',');
};

// ヘッダー付きの CSV ログ
console.log('timestamp,level,message,args'); // CSV ヘッダー

const csvLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: csvFormatter,
});
csvLogger.info('ユーザー操作', { action: 'login', userId: '12345' });
csvLogger.error('エラー発生', { code: 'ERR001', message: 'Connection failed' });
```

---

## フォーマッター設定の動的変更

### 実行時フォーマッター切り替え

```typescript
const logger = new AgLogger();

// 初期状態は Plain フォーマッター
logger.setFormatter(new PlainFormatter());
logger.info('Plain 形式でのログ出力');

// JSON フォーマッターに切り替え
logger.setFormatter(new JsonFormatter());
logger.info('JSON 形式でのログ出力');

// カスタムフォーマッターに切り替え
logger.setFormatter(simpleFormatter);
logger.info('カスタム形式でのログ出力');
```

### 環境に応じたフォーマッター選択

```typescript
// 環境別フォーマッター設定
function getFormatterForEnvironment(): AgFormatFunction {
  const environment = process.env.NODE_ENV || 'development';

  switch (environment) {
    case 'development':
      return colorFormatter; // 開発時は色付きで見やすく

    case 'test':
      return PlainFormatter; // テスト時はシンプルに

    case 'production':
      return JsonFormatter; // 本番は JSON でログ収集

    case 'analytics':
      return csvFormatter; // 分析環境では CSV

    default:
      return PlainFormatter;
  }
}

// 環境に応じたロガー作成
const logger = new AgLogger({
  formatter: getFormatterForEnvironment(),
});
```

### 条件付きフォーマッター

```typescript
// 条件に応じてフォーマッターを切り替える関数
const conditionalFormatter: AgFormatFunction = (logMessage: AgLogMessage) => {
  const level = logMessage.logLevel.toString();

  // エラーレベル以上は詳細な JSON 形式
  if (level === 'error' || level === 'fatal') {
    return JsonFormatter(logMessage);
  }

  // その他は簡潔な Plain 形式
  return PlainFormatter(logMessage);
};

const adaptiveLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: conditionalFormatter,
});

adaptiveLogger.info('通常の情報ログ'); // Plain 形式
adaptiveLogger.error('エラーログ', { code: 'ERR001' }); // JSON 形式
```

---

## 高度なフォーマッター活用

### テンプレートベースフォーマッター

```typescript
// テンプレート文字列を使用したフォーマッター
class TemplateFormatter {
  constructor(private template: string) {}

  format: AgFormatFunction = (logMessage: AgLogMessage) => {
    const timestamp = logMessage.timestamp.toISOString();
    const level = logMessage.logLevel.toString();
    const message = logMessage.message;
    const args = logMessage.args;

    const argsData = args.reduce((acc, arg, index) => {
      if (typeof arg === 'object' && arg !== null) {
        return { ...acc, ...arg };
      }
      acc[`arg${index}`] = arg;
      return acc;
    }, {} as Record<string, any>);

    // テンプレート変数を置換
    return this.template
      .replace(/\{timestamp\}/g, timestamp)
      .replace(/\{level\}/g, level)
      .replace(/\{message\}/g, message)
      .replace(/\{(\w+)\}/g, (match, key) => {
        return argsData[key] !== undefined ? String(argsData[key]) : match;
      });
  };
}

// 使用例
const templateFormatter = new TemplateFormatter(
  '[{timestamp}] {level}: {message} | User: {userId} | Action: {action}',
);

const templateLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: templateFormatter.format,
});

templateLogger.info('ユーザー操作記録', { userId: '12345', action: 'login' });
// 出力例: [2025-09-20T10:30:15.123Z] info: ユーザー操作記録 | User: 12345 | Action: login
```

### フィルタリングフォーマッター

```typescript
// 機密情報をマスクするフォーマッター
const secureFormatter: AgFormatFunction = (logMessage: AgLogMessage) => {
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'ssn'];

  // 機密情報をマスクする関数
  const maskSensitiveData = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(maskSensitiveData);
    }

    const masked = { ...obj };
    Object.keys(masked).forEach((key) => {
      if (sensitiveKeys.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey.toLowerCase()))) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = maskSensitiveData(masked[key]);
      }
    });

    return masked;
  };

  // 引数をマスク処理
  const maskedArgs = logMessage.args.map(maskSensitiveData);

  // マスク処理済みのログメッセージを作成
  const maskedLogMessage: AgLogMessage = {
    ...logMessage,
    args: maskedArgs,
  };

  // JSON フォーマッターで出力
  return JsonFormatter(maskedLogMessage);
};

// セキュアロガーの使用
const secureLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: secureFormatter,
});

secureLogger.info('ユーザー登録', {
  userId: '12345',
  email: 'user@example.com',
  password: 'secret123', // マスクされる
  apiKey: 'abc123xyz', // マスクされる
});
// 出力: {"level":"info","message":"ユーザー登録","timestamp":"...","data":{"userId":"12345","email":"user@example.com","password":"***MASKED***","apiKey":"***MASKED***"}}
```

### パフォーマンス監視フォーマッター

```typescript
// パフォーマンス情報を自動付与するフォーマッター
class PerformanceFormatter {
  private startTime = Date.now();

  format: AgFormatFunction = (logMessage: AgLogMessage) => {
    const timestamp = logMessage.timestamp.toISOString();
    const level = logMessage.logLevel.toString();
    const message = logMessage.message;
    const args = logMessage.args;
    const uptime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage();

    const logEntry = {
      timestamp,
      level,
      message,
      uptime: `${uptime}ms`,
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      data: args.length > 0 ? args : undefined,
    };

    return JSON.stringify(logEntry);
  };
}

// パフォーマンス監視ロガー
const perfFormatter = new PerformanceFormatter();
const perfLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: perfFormatter.format,
});

perfLogger.info('アプリケーション開始');
// 重い処理をシミュレート
setTimeout(() => {
  perfLogger.info('処理完了', { result: 'success' });
}, 1000);
```

---

### See Also

- [基本的なロガー操作](01-basic-logger-operations.md)
- [フォーマッタ活用](03-formatter-usage.md)
- [目次](README.md)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
