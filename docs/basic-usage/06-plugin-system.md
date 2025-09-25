---
header:
  - src: 05-plugin-system.md
  - @(#): Plugin System
title: プラグインシステム
description: プラグインシステムを活用したカスタムフォーマッターとロガーの実装ガイド
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

## プラグインシステム

このセクションでは、agla-logger のプラグインシステムについて詳しく解説します。
カスタムフォーマッターの作成、カスタムロガーの実装、プラグインの登録と切り替えなど、agla-logger を拡張する実践的な方法を学べます。

---

## プラグインシステム概要

### プラグイン型アーキテクチャ

agla-logger は、Strategy パターンベースのプラグイン型アーキテクチャを採用しており、以下のコアインターフェースを提供しています。

```typescript
// フォーマット関数インターフェース
type AgFormatFunction = (logMessage: AgLogMessage) => AgFormattedLogMessage;

// ロガー関数インターフェース
type AgLoggerFunction = (formattedLogMessage: AgFormattedLogMessage) => void;

// ログレベル別のロガーマップ
type AgLoggerMap<T extends AgLoggerFunction = AgLoggerFunction> = Record<AgLogLevel, T | null>;

// ロガー設定オプション
type AgLoggerOptions = {
  defaultLogger?: AgLoggerFunction;
  formatter?: AgFormatterInput;
  logLevel?: AgLogLevel;
  verbose?: boolean;
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
};
```

---

## カスタムフォーマッターの作成

### 高度なカスタムフォーマッター

```typescript
import type { AgFormatFunction, AgLogLevel } from '@aglabo/agla-logger';

// XML フォーマッター実装
class XMLFormatter {
  constructor(private options: { pretty?: boolean; includeMetadata?: boolean } = {}) {}

  format: AgFormatFunction = (logMessage: AgLogMessage) => {
    const metadata = this.options.includeMetadata
      ? {
        pid: process.pid,
        hostname: require('os').hostname(),
        nodeVersion: process.version,
      }
      : {};

    const logEntry = {
      '@timestamp': logMessage.timestamp,
      '@level': logMessage.level,
      '@message': logMessage.message,
      '@metadata': metadata,
      data: this.processArgs(logMessage.args),
    };

    return this.toXML(logEntry);
  };

  private processArgs(args: any[]): any {
    if (args.length === 0) { return undefined; }
    if (args.length === 1) { return args[0]; }
    return args;
  }

  private toXML(obj: any, rootName = 'log'): string {
    const escape = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const objToXML = (data: any, key: string): string => {
      if (data === null || data === undefined) {
        return `<${key} />`;
      }

      if (typeof data === 'object') {
        if (Array.isArray(data)) {
          const items = data.map((item, index) => objToXML(item, `item${index}`)).join('');
          return `<${key}>${items}</${key}>`;
        } else {
          const props = Object.entries(data)
            .map(([k, v]) => objToXML(v, k))
            .join('');
          return `<${key}>${props}</${key}>`;
        }
      }

      return `<${key}>${escape(String(data))}</${key}>`;
    };

    const xml = objToXML(obj, rootName);

    if (this.options.pretty) {
      // 簡易的な pretty-print（実際の実装ではより高度なフォーマットが必要）
      return xml.replace(/></g, '>\n<');
    }

    return xml;
  }
}

// CSV フォーマッター実装
class CSVFormatter {
  private headerWritten = false;

  constructor(
    private options: {
      delimiter?: string;
      includeHeader?: boolean;
      fields?: string[];
    } = {},
  ) {
    this.options.delimiter = options.delimiter || ',';
    this.options.includeHeader = options.includeHeader ?? true;
  }

  format: AgFormatFunction = (logMessage: AgLogMessage) => {
    const flatData = this.flattenArgs(logMessage.args);

    const record = {
      timestamp: logMessage.timestamp,
      level: logMessage.level,
      message: logMessage.message,
      ...flatData,
    };

    // ヘッダー出力（初回のみ）
    let output = '';
    if (this.options.includeHeader && !this.headerWritten) {
      const fields = this.options.fields || Object.keys(record);
      output += fields.join(this.options.delimiter) + '\n';
      this.headerWritten = true;
    }

    // データ行の出力
    const fields = this.options.fields || Object.keys(record);
    const values = fields.map((field) => this.escapeCSVField(String(record[field] || '')));
    output += values.join(this.options.delimiter);

    return output;
  };

  private flattenArgs(args: any[]): Record<string, any> {
    const result: Record<string, any> = {};

    args.forEach((arg, index) => {
      if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
        Object.assign(result, arg);
      } else {
        result[`arg${index}`] = arg;
      }
    });

    return result;
  }

  private escapeCSVField(value: string): string {
    if (value.includes(this.options.delimiter!) || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

// 使用例
const xmlLogger = AgLogger.createLogger({
  formatter: new XMLFormatter({ pretty: true, includeMetadata: true }).format,
});

const csvLogger = AgLogger.createLogger({
  formatter: new CSVFormatter({
    fields: ['timestamp', 'level', 'message', 'userId', 'action'],
    includeHeader: true,
  }).format,
});

xmlLogger.info('ユーザー操作', { userId: '12345', action: 'login' });
csvLogger.info('ユーザー操作', { userId: '12345', action: 'login' });
```

### 条件付きフォーマッター

```typescript
// 環境や条件に応じてフォーマットを変更するフォーマッター
class ConditionalFormatter {
  constructor(
    private conditions: Array<{
      condition: (level: AgLogLevel, message: string, args: any[]) => boolean;
      formatter: AgFormatFunction;
    }>,
    private defaultFormatter: AgFormatFunction,
  ) {}

  format: AgFormatFunction = (logMessage: AgLogMessage) => {
    for (const { condition, formatter } of this.conditions) {
      if (condition(logMessage.level, logMessage.message, logMessage.args)) {
        return formatter(logMessage);
      }
    }
    return this.defaultFormatter(logMessage);
  };
}

// 使用例
const conditionalFormatter = new ConditionalFormatter([
  {
    // エラーレベルが'error', 'fatal'の場合は JsonFormatter
    condition: (level) => level === 'error' || level === 'fatal',
    formatter: JsonFormatter,
  },
  {
    // 大きなオブジェクトが含まれる場合は構造化形式
    condition: (level, message, args) =>
      args.some((arg) => typeof arg === 'object' && JSON.stringify(arg).length > 1000),
    formatter: new XMLFormatter({ pretty: true }).format,
  },
], PlainFormatter); // デフォルトは Plain

const adaptiveLogger = AgLogger.createLogger({ formatter: conditionalFormatter.format });
```

---

## カスタムロガープラグインの実装

### ファイルロガープラグイン

```typescript
import { appendFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// ファイル出力ロガー
class FileLogger {
  constructor(private options: { filePath: string }) {
    const dir = dirname(options.filePath);
    mkdirSync(dir, { recursive: true });
  }

  // AgLoggerFunction に準拠したロガー関数
  log: AgLoggerFunction = (formattedMessage: AgFormattedLogMessage): void => {
    try {
      appendFileSync(this.options.filePath, formattedMessage + '\n');
    } catch (error) {
      console.error('ファイルログ書き込みエラー:', error);
    }
  };
}
```

### データベースロガープラグイン

<!-- markdownlint-disable line-length -->

```typescript
import type {
  AgFormattedLogMessage,
  AgLoggerFunction,
  AgLogMessage,
} from '@aglabo/agla-logger';
import type { Pool } from 'pg';

// データベース出力ロガー（例：PostgreSQL）
class DatabaseLogger {
  constructor(
    private readonly options: {
      client: Pool;
      tableName: string;
    },
  ) {}

  // AgLoggerFunction に準拠したロガー関数
  log: AgLoggerFunction = (formattedMessage: AgFormattedLogMessage): void => {
    if (typeof formattedMessage === 'string') {
      // 構造化フォーマッターを通した AgLogMessage を利用する前提
      return;
    }

    void this.insertLog(formattedMessage);
  };

  private async insertLog(logMessage: AgLogMessage): Promise<void> {
    const payload = this.extractPayload(logMessage.args);
    const sql =
      `INSERT INTO ${this.options.tableName} (timestamp, level, message, payload, args) VALUES ($1, $2, $3, $4, $5)`;
    const parameters = [
      logMessage.timestamp.toISOString(),
      logMessage.logLevel,
      logMessage.message,
      payload ? JSON.stringify(payload) : null,
      JSON.stringify(logMessage.args),
    ];

    try {
      await this.options.client.query(sql, parameters);
    } catch (error) {
      console.error('データベースログ挿入エラー:', error);
    }
  }

  private extractPayload(args: readonly unknown[]): unknown {
    const payloadSource = args.find(
      (arg): arg is { payload: unknown } => typeof arg === 'object' && arg !== null && 'payload' in arg,
    );

    return payloadSource?.payload ?? null;
  }
}
```

<!-- markdownlint-enable -->

### Webhook ロガープラグイン

```typescript
import type { AgFormattedLogMessage, AgLoggerFunction } from '@aglabo/agla-logger';

// Webhook/HTTP エンドポイント出力ロガー
class WebhookLogger {
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor(
    private readonly options: {
      webhookUrl: string;
      headers?: Record<string, string>;
      retryAttempts?: number;
      retryDelay?: number;
    },
  ) {
    this.retryAttempts = this.options.retryAttempts ?? 3;
    this.retryDelay = this.options.retryDelay ?? 1000;
  }

  // AgLoggerFunction に準拠したロガー関数
  log: AgLoggerFunction = (formattedMessage: AgFormattedLogMessage): void => {
    const payload = this.extractPayload(formattedMessage.args);
    const body = {
      timestamp: formattedMessage.timestamp.toISOString(),
      level: formattedMessage.logLevel,
      message: formattedMessage.message,
      payload,
      args: formattedMessage.args,
    };

    void this.sendWebhook(body);
  };

  private extractPayload(args: readonly unknown[]): unknown {
    const payloadSource = args.find(
      (arg): arg is { payload: unknown } => typeof arg === 'object' && arg !== null && 'payload' in arg,
    );

    return payloadSource?.payload ?? null;
  }

  private async sendWebhook(body: Record<string, unknown>, attempt = 1): Promise<void> {
    try {
      const response = await fetch(this.options.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.options.headers,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Webhook送信エラー (試行 ${attempt}):`, error);

      if (attempt < this.retryAttempts) {
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        await this.sendWebhook(body, attempt + 1);
      } else {
        console.error('Webhook送信失敗: リトライ上限到達');
      }
    }
  }
}
```

---

## プラグイン管理とコンポジション

### マルチプラグインロガー

```typescript
import type { AgFormattedLogMessage, AgLoggerFunction } from '@aglabo/agla-logger';
import { Pool } from 'pg';

// 複数のロガーを管理するコンポジットロガー
class MultiLogger {
  private loggers: AgLoggerFunction[] = [];

  addLogger(logger: AgLoggerFunction): void {
    this.loggers.push(logger);
  }

  removeLogger(logger: AgLoggerFunction): void {
    const index = this.loggers.indexOf(logger);
    if (index >= 0) {
      this.loggers.splice(index, 1);
    }
  }

  // AgLoggerFunction に準拠したロガー関数
  log: AgLoggerFunction = (formattedMessage: AgFormattedLogMessage): void => {
    this.loggers.forEach((logger) => {
      try {
        logger(formattedMessage);
      } catch (error) {
        console.error('ロガーでエラー:', error);
      }
    });
  };
}

// 使用例
const postgresPool = new Pool({
  connectionString: process.env.LOG_DB_CONNECTION || 'postgres://localhost:5432/logs',
});

const multiLogger = new MultiLogger();

// 各種ロガーを追加
const fileLogger = new FileLogger({
  filePath: './logs/app.log',
});

const webhookLogger = new WebhookLogger({
  webhookUrl: 'https://api.example.com/logs',
  headers: { 'Authorization': 'Bearer token123' },
});

const databaseLogger = new DatabaseLogger({
  client: postgresPool,
  tableName: 'application_logs',
});

multiLogger.addLogger(fileLogger.log);
multiLogger.addLogger(webhookLogger.log);
multiLogger.addLogger(databaseLogger.log);

// AgLogger に設定してログ出力（全ロガーに送信される）
const logger = AgLogger.createLogger({
  defaultLogger: multiLogger.log,
});

logger.info('アプリケーション開始', { version: '1.0.0' });
```

### 環境別ロガー設定

```typescript
import type { AgFormattedLogMessage, AgLoggerFunction, AgLogLevel } from '@aglabo/agla-logger';
import { AG_LOGLEVEL, AgLogger, JsonFormatter, PlainFormatter } from '@aglabo/agla-logger';
import { Pool } from 'pg';

// 環境に応じたプラグイン設定管理
class EnvironmentLoggerFactory {
  static configureLogger(): AgLogger {
    const environment = process.env.NODE_ENV || 'development';

    // シングルトンのAgLoggerインスタンスを取得（または作成）
    const logger = AgLogger.createLogger();

    switch (environment) {
      case 'development':
        this.configureDevelopmentLogger(logger);
        break;

      case 'test':
        this.configureTestLogger(logger);
        break;

      case 'staging':
        this.configureStagingLogger(logger);
        break;

      case 'production':
        this.configureProductionLogger(logger);
        break;

      default:
        // デフォルト設定はそのまま使用
        break;
    }

    return logger;
  }

  private static configureDevelopmentLogger(logger: AgLogger): void {
    // 開発環境：コンソール出力 + ファイル出力
    const fileLogger = new FileLogger({
      filePath: './logs/dev.log',
    });

    const multiLogger = new MultiLogger();
    multiLogger.addLogger(console.log); // 標準コンソール出力
    multiLogger.addLogger(fileLogger.log);

    logger.setLoggerConfig({
      formatter: PlainFormatter, // 開発環境では読みやすいプレーンフォーマット
      defaultLogger: multiLogger.log,
      logLevel: AG_LOGLEVEL.DEBUG, // 開発環境は詳細ログ
      verbose: true,
    });
  }

  private static configureTestLogger(logger: AgLogger): void {
    // テスト環境：ファイル出力のみ（コンソール出力を抑制）
    const fileLogger = new FileLogger({
      filePath: './logs/test.log',
    });

    logger.setLoggerConfig({
      formatter: JsonFormatter, // テスト結果の解析用にJSON形式
      defaultLogger: fileLogger.log,
      logLevel: AG_LOGLEVEL.WARN, // テスト中は警告以上のみ
      verbose: false,
    });
  }

  private static configureStagingLogger(logger: AgLogger): void {
    // ステージング環境：ファイル + Webhook
    const fileLogger = new FileLogger({
      filePath: './logs/staging.log',
    });

    const webhookLogger = new WebhookLogger({
      webhookUrl: process.env.STAGING_WEBHOOK_URL || '',
      headers: { 'Authorization': `Bearer ${process.env.LOG_API_TOKEN}` },
      retryAttempts: 3,
      retryDelay: 1000,
    });

    const multiLogger = new MultiLogger();
    multiLogger.addLogger(fileLogger.log);

    if (process.env.STAGING_WEBHOOK_URL) {
      multiLogger.addLogger(webhookLogger.log);
    }

    logger.setLoggerConfig({
      formatter: JsonFormatter, // 構造化ログが必要
      defaultLogger: multiLogger.log,
      logLevel: AG_LOGLEVEL.INFO,
      verbose: false,
    });
  }

  private static configureProductionLogger(logger: AgLogger): void {
    // 本番環境：ファイル + データベース + アラート
    const fileLogger = new FileLogger({
      filePath: './logs/production.log',
    });

    const multiLogger = new MultiLogger();
    multiLogger.addLogger(fileLogger.log);

    // データベースログ（PostgreSQL）
    if (process.env.LOG_DB_CONNECTION) {
      const postgresPool = new Pool({
        connectionString: process.env.LOG_DB_CONNECTION,
      });

      const databaseLogger = new DatabaseLogger({
        client: postgresPool,
        tableName: 'application_logs',
      });

      multiLogger.addLogger(databaseLogger.log);
    }

    // 重要なログのアラート用Webhook
    if (process.env.ALERT_WEBHOOK_URL) {
      const alertWebhook = new WebhookLogger({
        webhookUrl: process.env.ALERT_WEBHOOK_URL,
        headers: { 'Authorization': `Bearer ${process.env.ALERT_API_TOKEN}` },
        retryAttempts: 5,
        retryDelay: 2000,
      });

      // ERROR、FATAL レベルのみアラート送信
      logger.setLoggerConfig({
        loggerMap: {
          [AG_LOGLEVEL.ERROR]: alertWebhook.log,
          [AG_LOGLEVEL.FATAL]: alertWebhook.log,
        },
      });
    }

    logger.setLoggerConfig({
      formatter: JsonFormatter, // 本番環境は構造化ログ必須
      defaultLogger: multiLogger.log,
      logLevel: AG_LOGLEVEL.WARN, // 本番は警告以上のみ
      verbose: false,
    });
  }
}

// 開発環境用シンプルロガー設定
class DevelopmentLoggerFactory {
  static configureDevelopmentLogger(): AgLogger {
    const logger = AgLogger.createLogger();

    // 開発環境用ファイルロガー
    const devFileLogger = new FileLogger({
      filePath: './logs/development.log',
    });

    // コンソール + ファイル出力
    const multiLogger = new MultiLogger();
    multiLogger.addLogger(console.log); // コンソール出力
    multiLogger.addLogger(devFileLogger.log); // ファイル出力

    logger.setLoggerConfig({
      formatter: PlainFormatter, // 開発環境では読みやすいプレーン形式
      defaultLogger: multiLogger.log, // 全レベルをコンソール+ファイルに出力
      logLevel: AG_LOGLEVEL.DEBUG, // 開発環境は詳細ログ
      verbose: true,
    });

    return logger;
  }
}

// 高度なレベル別ロガー設定
class AdvancedLoggerFactory {
  static configureAdvancedLogger(): AgLogger {
    const logger = AgLogger.createLogger();

    // 基本設定
    logger.setLoggerConfig({
      formatter: JsonFormatter,
      logLevel: AG_LOGLEVEL.INFO,
    });

    // ファイルロガー（通常ログ用）
    const fileLogger = new FileLogger({
      filePath: './logs/app.log',
    });

    // エラー専用ファイルロガー
    const errorFileLogger = new FileLogger({
      filePath: './logs/error.log',
    });

    // アクセスログ専用
    const accessFileLogger = new FileLogger({
      filePath: './logs/access.log',
    });

    // レベル別にロガーを設定
    logger.setLoggerConfig({
      loggerMap: {
        [AG_LOGLEVEL.TRACE]: fileLogger.log,
        [AG_LOGLEVEL.DEBUG]: fileLogger.log,
        [AG_LOGLEVEL.INFO]: accessFileLogger.log, // アクセスログ
        [AG_LOGLEVEL.WARN]: fileLogger.log,
        [AG_LOGLEVEL.ERROR]: errorFileLogger.log, // エラー専用
        [AG_LOGLEVEL.FATAL]: errorFileLogger.log, // エラー専用
      },
    });

    return logger;
  }
}

// 動的設定変更
class DynamicLoggerConfiguration {
  private static logger: AgLogger;

  static initialize(): AgLogger {
    this.logger = EnvironmentLoggerFactory.configureLogger();
    return this.logger;
  }

  // 実行時の設定変更
  static updateLogLevel(level: AgLogLevel): void {
    if (this.logger) {
      this.logger.logLevel = level;
    }
  }

  // 実行時の詳細ログ切り替え
  static toggleVerbose(enabled: boolean): void {
    if (this.logger) {
      this.logger.setVerbose = enabled;
    }
  }

  // 緊急時のアラート専用モード
  static enableEmergencyMode(): void {
    if (!this.logger) { return; }

    // 全てのログをアラート送信に切り替え
    if (process.env.EMERGENCY_WEBHOOK_URL) {
      const emergencyWebhook = new WebhookLogger({
        webhookUrl: process.env.EMERGENCY_WEBHOOK_URL,
        headers: { 'Authorization': `Bearer ${process.env.EMERGENCY_API_TOKEN}` },
        retryAttempts: 10,
        retryDelay: 500,
      });

      this.logger.setLoggerConfig({
        defaultLogger: emergencyWebhook.log,
        logLevel: AG_LOGLEVEL.INFO, // 緊急時は全レベル送信
      });
    }
  }
}

// 使用例 - 用途別のロガー設定

// 1. 開発環境用（シンプル設定）
// コンソール + ファイル出力、読みやすいプレーン形式
if (process.env.NODE_ENV === 'development') {
  const devLogger = DevelopmentLoggerFactory.configureDevelopmentLogger();
  devLogger.debug('開発環境でのデバッグ情報');
  devLogger.info('API呼び出し', { endpoint: '/api/users', method: 'GET' });
}

// 2. 本番環境用（レベル別設定）
// エラーログ分離、アクセスログ分離
if (process.env.NODE_ENV === 'production') {
  const advancedLogger = AdvancedLoggerFactory.configureAdvancedLogger();
  advancedLogger.info('ユーザーアクセス', { userId: '12345', page: '/dashboard' }); // access.log
  advancedLogger.error('データベース接続エラー', { error: 'Connection timeout' }); // error.log
  advancedLogger.warn('リクエスト制限に近づいています', { current: 95, limit: 100 }); // app.log
}

// 3. 環境別自動設定
const logger = EnvironmentLoggerFactory.configureLogger();
logger.info('アプリケーション開始', { version: '1.0.0', environment: process.env.NODE_ENV });

// 4. 動的設定変更
const dynamicLogger = DynamicLoggerConfiguration.initialize();
if (process.env.DEBUG === 'true') {
  DynamicLoggerConfiguration.updateLogLevel(AG_LOGLEVEL.DEBUG);
  DynamicLoggerConfiguration.toggleVerbose(true);
}
```

---

### See Also

- [エラーハンドリング](05-error-handling.md)
- [目次](README.md)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
