---
header:
  - src: 04-examples.md
  - @(#): Examples Guide
title: `agla-logger`
description: `JSON`ログとログ収集基盤、カスタムフォーマッターの実用例
version: 1.0.0
created: 2025-09-22
authors:
  - atsushifx
changes:
  - 2025-09-22: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## ロガーの実践例

このページでは、`agla-logger` をより実践的なシナリオで活用する方法を紹介します。
JSON ログ収集基盤との連携、カスタムフォーマッターの作成、実際のアプリケーション統合例を学べます。

---

## ログレベルフィルタリングの動作

### 標準ログレベルのフィルタリング

ログレベル設定による出力制御の基本動作を確認します。設定されたレベルよりも重要度が高いログのみが出力され、重要度が低いログは非表示となります。

```typescript
import {
  AG_LOGLEVEL,
  AgLogger,
  ConsoleLogger,
  PlainFormatter,
} from '@aglabo/agla-logger';

// 標準ログレベルのフィルタリング例
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});

// 通常の動作 (INFO レベル設定)
logger.error('ERROR: 表示されます'); // 表示
logger.warn('WARN: 表示されます'); // 表示
logger.info('INFO: 表示されます'); // 表示
logger.debug('DEBUG: 表示されません'); // 非表示 (重要度がINFOより低い)

/* 出力例 (LogLevel = INFO):
2025-09-22T10:30:45Z [ERROR] ERROR: 表示されます
2025-09-22T10:30:45Z [WARN] WARN: 表示されます
2025-09-22T10:30:45Z [INFO] INFO: 表示されます
*/

// LogLevel = OFF の場合 (標準ロガーは全て非表示)
logger.logLevel = AG_LOGLEVEL.OFF;
logger.error('ERROR: 表示されません'); // 非表示
logger.warn('WARN: 表示されません'); // 非表示
logger.info('INFO: 表示されません'); // 非表示
logger.debug('DEBUG: 表示されません'); // 非表示

/* 出力例 (LogLevel = OFF) :
 (何も表示されない)
*/
```

### 特殊ロガーの動作 (フィルタリング回避)

`verbose` と `log` は標準のログレベルフィルタリングを回避する特殊な動作を持ちます。`verbose` は `setVerbose` フラグによる制御、`log` は常時強制出力されます。

```typescript
// 特殊レベルは LogLevel = OFF でも独自の制御ロジックを持つ
logger.logLevel = AG_LOGLEVEL.OFF;

// verbose レベルのテスト
logger.setVerbose = true; // verboseモード有効化が必要
logger.verbose('VERBOSE: フィルタリング回避'); // 表示 (verboseモード有効時)
logger.log('LOG: 強制出力'); // 表示 (常に強制出力)

/* 出力例 (LogLevel = OFF, setVerbose = true) :
2025-09-22T10:30:45Z [LOG] LOG: 強制出力
2025-09-22T10:30:45Z [VERBOSE] VERBOSE: フィルタリング回避
*/

// setVerbose = false の場合
logger.setVerbose = false;
logger.verbose('VERBOSE: 表示されません'); // 非表示 (verboseモード無効時)
logger.log('LOG: 強制出力'); // 表示 (常に強制出力)

/* 出力例 (LogLevel = OFF, setVerbose = false) :
2025-09-22T10:30:45Z [LOG] LOG: 強制出力
*/
```

---

## `JSON` ログとログ収集基盤

### `JSON` ログの基本設定

JSON フォーマッターを使用して構造化されたログデータを出力します。メタデータやコンテキスト情報を含む複雑なデータを効率的にログ化できます。

```typescript
import {
  AG_LOGLEVEL,
  AgLogger,
  ConsoleLogger,
  JsonFormatter,
} from '@aglabo/agla-logger';

// `JSON` 形式でのログ出力設定
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
});

// 構造化されたログデータ
logger.info('ユーザーログイン', {
  userId: 'user_123',
  sessionId: 'session_abc789',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
});

/* 出力例:
{
  "timestamp": "2025-09-22T10:30:45.123Z",
  "level": "INFO",
  "message": "ユーザーログイン",
  "args": [
    {
      "userId": "user_123",
      "sessionId": "session_abc789",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
    }
  ]
}
*/
```

### `ELK Stack` (`Elasticsearch` + `Logstash` + `Kibana`) 連携

Elasticsearch、Logstash、Kibana を組み合わせたログ収集基盤向けに最適化された構造化ログ出力の実装例です。アプリケーションメトリクス、API リクエスト、エラートラッキングを統一形式で記録します。

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, JsonFormatter } from '@aglabo/agla-logger';

// `ELK Stack` 用の標準化されたログ形式
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
});

// アプリケーションメトリクス
function logApplicationMetrics() {
  logger.info('application_metrics', {
    service: 'user-service',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    metrics: {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
    },
  });
}

// API リクエストログ
function logApiRequest(req: any, res: any, duration: number) {
  logger.info('api_request', {
    service: 'api-gateway',
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    },
    response: {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    },
    trace: {
      requestId: req.headers['x-request-id'],
      userId: req.user?.id,
    },
  });
}

// エラートラッキング
function logError(error: Error, context: any) {
  logger.error('application_error', {
    service: 'error-handler',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    environment: process.env.NODE_ENV,
  });
}
```

### `Fluentd` 連携例

Fluentd のタグベースログ形式に対応したカスタムロガークラスの実装例です。ログデータにタグ情報と Unix タイムスタンプを付与して出力します。

```typescript
// `Fluentd` 形式のログ(`tag` ベース)
class FluentdLogger {
  private logger = AgLogger.createLogger({
    logLevel: AG_LOGLEVEL.INFO,
    defaultLogger: ConsoleLogger,
    formatter: JsonFormatter,
  });

  logWithTag(tag: string, data: any) {
    this.logger.info(`fluentd.${tag}`, {
      tag,
      record: data,
      time: Math.floor(Date.now() / 1000), // Unix timestamp
    });
  }
}

const fluentdLogger = new FluentdLogger();

// 使用例
fluentdLogger.logWithTag('user.action', {
  userId: 'user_123',
  action: 'login',
  result: 'success',
});

fluentdLogger.logWithTag('system.performance', {
  cpu: 45.2,
  memory: 78.5,
  disk: 23.1,
});
```

---

## カスタムフォーマッターの作成

### 基本的なカスタムフォーマッター

CSV 形式でログを出力するカスタムフォーマッターの作成例です。スプレッドシートでの分析や外部システムへの取り込みに適したデータ形式を生成します。

```typescript
import { AgFormatFunction, AgLogMessage } from '@aglabo/agla-logger';

// カスタムフォーマッター: `CSV` 形式
const CsvFormatter: AgFormatFunction = (logMessage: AgLogMessage): string => {
  const timestamp = logMessage.timestamp;
  const level = logMessage.level;
  const message = logMessage.message.replace(/"/g, '""'); // CSV エスケープ
  const args = JSON.stringify(logMessage.args || []).replace(/"/g, '""');

  return `"${timestamp}","${level}","${message}","${args}"`;
};

// 使用例
import { AG_LOGLEVEL, AgLogger, ConsoleLogger } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: CsvFormatter,
});

logger.info('CSV形式のログ', { userId: 123, action: 'test' });
// 出力例: "2025-09-22T10:30:45.123Z","INFO","CSV形式のログ","{\"userId\":123,\"action\":\"test\"}"
```

### 高度なカスタムフォーマッター

開発環境でのデバッグを効率化する色付きコンソール出力フォーマッターです。ログレベルに応じた色分け表示とメタデータの整形表示を提供します。

```typescript
import { AG_LOGLEVEL, AgFormatFunction, AgLogMessage } from '@aglabo/agla-logger';

// 色付きコンソール出力フォーマッター
const ColoredConsoleFormatter: AgFormatFunction = (logMessage: AgLogMessage): string => {
  const colors = {
    [AG_LOGLEVEL.TRACE]: '\x1b[90m', // 灰色
    [AG_LOGLEVEL.DEBUG]: '\x1b[36m', // シアン
    [AG_LOGLEVEL.VERBOSE]: '\x1b[35m', // マゼンタ
    [AG_LOGLEVEL.INFO]: '\x1b[32m', // 緑
    [AG_LOGLEVEL.WARN]: '\x1b[33m', // 黄色
    [AG_LOGLEVEL.ERROR]: '\x1b[31m', // 赤
    [AG_LOGLEVEL.FATAL]: '\x1b[41m', // 赤背景
  };

  const reset = '\x1b[0m';
  const color = colors[logMessage.level] || '';
  const timestamp = new Date().toISOString();

  let output = `${color}[${timestamp}] [${AG_LOGLEVEL[logMessage.level]}] ${logMessage.message}${reset}`;

  if (logMessage.args && logMessage.args.length > 0) {
    output += `\n${color}  Args: ${JSON.stringify(logMessage.args, null, 2)}${reset}`;
  }

  return output;
};

// 使用例
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.DEBUG,
  defaultLogger: ConsoleLogger,
  formatter: ColoredConsoleFormatter,
});

logger.info('色付きログメッセージ', { feature: 'custom-formatter' });
```

### `Slack` 通知フォーマッター

Slack Webhook API 向けの JSON ペイロードを生成するフォーマッターです。ログレベルに応じた色分け表示と構造化されたメッセージフォーマットを提供します。

````typescript
import { AG_LOGLEVEL, AgFormatFunction, AgLogMessage } from '@aglabo/agla-logger';

// `Slack` 通知用フォーマッター
const SlackFormatter: AgFormatFunction = (logMessage: AgLogMessage): string => {
  const emojis = {
    [AG_LOGLEVEL.TRACE]: 'TRACE',
    [AG_LOGLEVEL.DEBUG]: 'DEBUG',
    [AG_LOGLEVEL.VERBOSE]: 'VERBOSE',
    [AG_LOGLEVEL.INFO]: 'INFO',
    [AG_LOGLEVEL.WARN]: 'WARN',
    [AG_LOGLEVEL.ERROR]: 'ERROR',
    [AG_LOGLEVEL.FATAL]: 'FATAL',
  };

  const colors = {
    [AG_LOGLEVEL.TRACE]: '#808080',
    [AG_LOGLEVEL.DEBUG]: '#00FFFF',
    [AG_LOGLEVEL.VERBOSE]: '#FF00FF',
    [AG_LOGLEVEL.INFO]: '#00FF00',
    [AG_LOGLEVEL.WARN]: '#FFFF00',
    [AG_LOGLEVEL.ERROR]: '#FF0000',
    [AG_LOGLEVEL.FATAL]: '#8B0000',
  };

  const slackPayload = {
    attachments: [
      {
        color: colors[logMessage.level],
        fields: [
          {
            title: `${emojis[logMessage.level]} Log`,
            value: logMessage.message,
            short: false,
          },
        ],
        footer: 'agla-logger',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  if (logMessage.args && logMessage.args.length > 0) {
    slackPayload.attachments[0].fields.push({
      title: 'Args',
      value: '```' + JSON.stringify(logMessage.args, null, 2) + '```',
      short: false,
    });
  }

  return JSON.stringify(slackPayload);
};
````

---

## 実際のアプリケーション統合例

### `Express.js` アプリケーション

Express.js アプリケーションでの実用的なログ連携例です。リクエストログミドルウェア、API エンドポイントでのユーザー処理、エラーハンドリングの包括的なログ記録を実現します。

```typescript
import {
  AG_LOGLEVEL,
  AgLogger,
  ConsoleLogger,
  JsonFormatter,
} from '@aglabo/agla-logger';
import express from 'express';

const app = express();
const logger = AgLogger.createLogger({
  logLevel: process.env.NODE_ENV === 'production' ? AG_LOGLEVEL.INFO : AG_LOGLEVEL.DEBUG,
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
});

// リクエストログミドルウェア
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  req.requestId = requestId;

  logger.info('request_start', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('request_end', {
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
});

// API エンドポイント
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  logger.debug('user_fetch_start', { userId: id, requestId: req.requestId });

  try {
    // ユーザー取得処理
    const user = await getUserById(id);

    logger.info('user_fetch_success', { userId: id, requestId: req.requestId });
    res.json(user);
  } catch (error) {
    logger.error('user_fetch_error', {
      userId: id,
      requestId: req.requestId,
      error: error.message,
    });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function getUserById(id: string) {
  // データベース処理のシミュレーション
  if (id === '999') {
    throw new Error('User not found');
  }
  return { id, name: `User ${id}` };
}

app.listen(3000, () => {
  logger.info('server_start', { port: 3000 });
});
```

### `Next.js` アプリケーション

Next.js 環境でのロガー設定と API ルートでの活用例です。サーバーサイドとクライアントサイド、本番環境と開発環境で異なるフォーマッターを自動選択します。

```typescript
// lib/logger.ts
import {
  AG_LOGLEVEL,
  AgLogger,
  ConsoleLogger,
  JsonFormatter,
  PlainFormatter,
} from '@aglabo/agla-logger';

export const createAppLogger = () => {
  const isServer = typeof window === 'undefined';
  const isProduction = process.env.NODE_ENV === 'production';

  return AgLogger.createLogger({
    logLevel: isProduction ? AG_LOGLEVEL.INFO : AG_LOGLEVEL.DEBUG,
    defaultLogger: ConsoleLogger,
    formatter: isServer && isProduction
      ? JsonFormatter // サーバーサイド本番環境
      : PlainFormatter, // クライアントサイドまたは開発環境
  });
};

// pages/api/example.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createAppLogger } from '../../lib/logger';

const logger = createAppLogger();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = req.headers['x-request-id'] || Math.random().toString(36);

  logger.info('api_request', {
    endpoint: '/api/example',
    method: req.method,
    requestId,
  });

  try {
    // API 処理
    const result = await processRequest(req);

    logger.info('api_success', { requestId, result });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error('api_error', { requestId, error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

async function processRequest(req: NextApiRequest) {
  return { message: 'Hello from API' };
}
```

### テスト環境での活用

MockLogger を使用したテスト用ログ検証の実装例です。ログ出力の内容、回数、形式をアサーションで検証し、アプリケーションのログ処理が正常に動作していることを確認します。

```typescript
// tests/helpers/logger.helper.ts
import {
  AG_LOGLEVEL,
  AgLogger,
  MockLogger,
  PlainFormatter,
} from '@aglabo/agla-logger';

export function setupTestLogger() {
  const mockLogger = MockLogger.buffer;

  AgLogger.createLogger({
    logLevel: AG_LOGLEVEL.TRACE, // テストでは全レベル記録
    defaultLogger: mockLogger,
    formatter: PlainFormatter,
  });

  return {
    getLogs: () => mockLogger.getLogs(),
    clearLogs: () => mockLogger.clearLogs(),
    getLogCount: () => mockLogger.getLogs().length,
  };
}

// tests/example.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { myFunction } from '../src/myFunction';
import { setupTestLogger } from './helpers/logger.helper';

describe('myFunction', () => {
  const testLogger = setupTestLogger();

  beforeEach(() => {
    testLogger.clearLogs();
  });

  it('should log the correct messages', async () => {
    await myFunction();

    const logs = testLogger.getLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0]).toContain('[INFO] Processing started');
    expect(logs[1]).toContain('[INFO] Processing completed');
  });
});
```

---

## パフォーマンス最適化例

### バッチログ処理

大量のログを効率的に処理するパフォーマンス最適化の実装例です。指定した件数または時間間隔でログをまとめて出力し、システムの負荷を軽減します。

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, JsonFormatter } from '@aglabo/agla-logger';

class BatchLogger {
  private logs: any[] = [];
  private batchSize = 100;
  private flushInterval = 5000; // 5秒
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.startTimer();
  }

  log(level: AG_LOGLEVEL, message: string, args?: any) {
    this.logs.push({
      level: AG_LOGLEVEL[level],
      message,
      args,
    });

    if (this.logs.length >= this.batchSize) {
      this.flush();
    }
  }

  private flush() {
    if (this.logs.length === 0) { return; }

    const logger = AgLogger.getLogger();

    logger.info('batch_logs', {
      count: this.logs.length,
      logs: this.logs,
    });

    this.logs = [];
  }

  private startTimer() {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.flush(); // 残りのログを出力
  }
}
```

---

## See Also

- [基本的な使い方](03-basic-usage.md)
- [トラブルシューティング](05-troubleshooting.md)

---

## 関連ドキュメント

- [基本的な使い方](../basic-usage/) - より詳細な API 使用方法
- [ユーザーガイド](../user-guides/) - 実践的な使用例とベストプラクティス
- [APIリファレンス](../api-reference/) - 完全な API 仕様

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
