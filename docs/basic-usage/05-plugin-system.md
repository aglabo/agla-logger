---
header:
  - src: 05-plugin-system.md
  - @(#): Plugin System
title: agla-logger
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

### 必要要件

- Node.js: v20 以上 (ESM サポートのため)
- TypeScript: v5.0 以上推奨
- パッケージインストール済み: `@aglabo/agla-logger-core`

---

## プラグインシステム概要

### プラグイン型アーキテクチャ

agla-logger は、Strategy パターンベースのプラグイン型アーキテクチャを採用しており、以下の拡張ポイントを提供しています：

```typescript
// プラグイン拡張ポイント
interface AglaLoggerExtensions {
  formatters: AgFormatFunction[]; // カスタムフォーマッター
  loggers: AgLoggerPlugin[]; // カスタム出力先
  filters: AgLogFilter[]; // ログフィルター
  transformers: AgLogTransformer[]; // データ変換
}

// 基本的なプラグインインターフェース
interface AgLoggerPlugin {
  name: string;
  log(formattedMessage: string, level: AgLogLevel, originalArgs: any[]): void;
  destroy?(): void;
}
```

---

## カスタムフォーマッターの作成

### 高度なカスタムフォーマッター

```typescript
import type { AgFormatFunction, AgLogLevel } from '@aglabo/agla-logger-core';

// XML フォーマッター実装
class XMLFormatter {
  constructor(private options: { pretty?: boolean; includeMetadata?: boolean } = {}) {}

  format: AgFormatFunction = (level, message, args) => {
    const timestamp = new Date().toISOString();
    const metadata = this.options.includeMetadata
      ? {
        pid: process.pid,
        hostname: require('os').hostname(),
        nodeVersion: process.version,
      }
      : {};

    const logEntry = {
      '@timestamp': timestamp,
      '@level': level,
      '@message': message,
      '@metadata': metadata,
      data: this.processArgs(args),
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

  format: AgFormatFunction = (level, message, args) => {
    const timestamp = new Date().toISOString();
    const flatData = this.flattenArgs(args);

    const record = {
      timestamp,
      level,
      message,
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
const xmlLogger = new AgLogger({
  formatter: new XMLFormatter({ pretty: true, includeMetadata: true }).format,
});

const csvLogger = new AgLogger({
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

  format: AgFormatFunction = (level, message, args) => {
    for (const { condition, formatter } of this.conditions) {
      if (condition(level, message, args)) {
        return formatter(level, message, args);
      }
    }
    return this.defaultFormatter(level, message, args);
  };
}

// 使用例
const conditionalFormatter = new ConditionalFormatter([
  {
    // エラーレベルは詳細な JSON 形式
    condition: (level) => level === 'error' || level === 'fatal',
    formatter: new JsonFormatter(),
  },
  {
    // 大きなオブジェクトが含まれる場合は構造化形式
    condition: (level, message, args) =>
      args.some((arg) => typeof arg === 'object' && JSON.stringify(arg).length > 1000),
    formatter: new XMLFormatter({ pretty: true }).format,
  },
], new PlainFormatter()); // デフォルトは Plain

const adaptiveLogger = new AgLogger({ formatter: conditionalFormatter.format });
```

---

## カスタムロガープラグインの実装

### ファイルロガープラグイン

```typescript
import { promises as fs } from 'fs';
import { createWriteStream, WriteStream } from 'fs';
import { dirname } from 'path';

// ファイル出力プラグイン
class FileLoggerPlugin implements AgLoggerPlugin {
  name = 'FileLogger';
  private writeStream?: WriteStream;
  private buffer: string[] = [];
  private flushInterval?: NodeJS.Timeout;

  constructor(
    private options: {
      filePath: string;
      maxFileSize?: number; // バイト単位
      maxFiles?: number; // ローテーション保持数
      flushInterval?: number; // バッファフラッシュ間隔（ms）
      bufferSize?: number; // バッファサイズ
    },
  ) {
    this.options.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.options.maxFiles = options.maxFiles || 5;
    this.options.flushInterval = options.flushInterval || 1000; // 1秒
    this.options.bufferSize = options.bufferSize || 100;

    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.ensureDirectory();
    await this.createWriteStream();
    this.startFlushInterval();
  }

  private async ensureDirectory(): Promise<void> {
    const dir = dirname(this.options.filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  private async createWriteStream(): Promise<void> {
    // ファイルサイズチェックとローテーション
    if (await this.shouldRotate()) {
      await this.rotateFile();
    }

    this.writeStream = createWriteStream(this.options.filePath, { flags: 'a' });
  }

  private async shouldRotate(): Promise<boolean> {
    try {
      const stats = await fs.stat(this.options.filePath);
      return stats.size >= this.options.maxFileSize!;
    } catch {
      return false; // ファイルが存在しない場合はローテーション不要
    }
  }

  private async rotateFile(): Promise<void> {
    // 既存ファイルをローテーション
    for (let i = this.options.maxFiles! - 1; i > 0; i--) {
      const oldFile = `${this.options.filePath}.${i}`;
      const newFile = `${this.options.filePath}.${i + 1}`;

      try {
        await fs.rename(oldFile, newFile);
      } catch {
        // ファイルが存在しない場合は無視
      }
    }

    // 現在のファイルを .1 にリネーム
    try {
      await fs.rename(this.options.filePath, `${this.options.filePath}.1`);
    } catch {
      // ファイルが存在しない場合は無視
    }
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.options.flushInterval);
  }

  log(formattedMessage: string): void {
    this.buffer.push(formattedMessage + '\n');

    if (this.buffer.length >= this.options.bufferSize!) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.buffer.length === 0 || !this.writeStream) { return; }

    const data = this.buffer.join('');
    this.buffer = [];

    this.writeStream.write(data, (error) => {
      if (error) {
        console.error('ファイルログ書き込みエラー:', error);
      }
    });
  }

  async destroy(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    this.flush(); // 残りのバッファをフラッシュ

    if (this.writeStream) {
      return new Promise((resolve) => {
        this.writeStream!.end(() => {
          resolve();
        });
      });
    }
  }
}
```

### データベースロガープラグイン

```typescript
// データベース出力プラグイン（例：MongoDB）
class DatabaseLoggerPlugin implements AgLoggerPlugin {
  name = 'DatabaseLogger';
  private buffer: any[] = [];
  private flushInterval?: NodeJS.Timeout;

  constructor(
    private options: {
      connectionString: string;
      collection: string;
      bufferSize?: number;
      flushInterval?: number;
      batchSize?: number;
    },
    private db?: any, // 実際の実装では適切なDBクライアントの型を使用
  ) {
    this.options.bufferSize = options.bufferSize || 50;
    this.options.flushInterval = options.flushInterval || 5000; // 5秒
    this.options.batchSize = options.batchSize || 100;

    this.initialize();
  }

  private async initialize(): Promise<void> {
    // データベース接続の初期化（実際の実装では適切なクライアントを使用）
    this.startFlushInterval();
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.options.flushInterval);
  }

  log(formattedMessage: string, level: AgLogLevel, originalArgs: any[]): void {
    const logEntry = {
      timestamp: new Date(),
      level,
      message: this.extractMessage(formattedMessage),
      formattedMessage,
      args: originalArgs,
      metadata: {
        pid: process.pid,
        hostname: require('os').hostname(),
        nodeVersion: process.version,
      },
    };

    this.buffer.push(logEntry);

    if (this.buffer.length >= this.options.bufferSize!) {
      this.flush();
    }
  }

  private extractMessage(formattedMessage: string): string {
    // フォーマット済みメッセージから元のメッセージを抽出
    // 実際の実装では、フォーマッターの種類に応じて適切に解析
    try {
      const parsed = JSON.parse(formattedMessage);
      return parsed.message || parsed['@message'] || formattedMessage;
    } catch {
      return formattedMessage;
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) { return; }

    const entries = this.buffer.splice(0, this.options.batchSize);

    try {
      // 実際の実装では適切なデータベース操作を行う
      await this.insertLogs(entries);
    } catch (error) {
      console.error('データベースログ挿入エラー:', error);
      // エラー時は元のバッファに戻す（実際の実装では適切なエラー処理が必要）
    }
  }

  private async insertLogs(entries: any[]): Promise<void> {
    // 実装例（実際のデータベースクライアントを使用）
    if (this.db) {
      await this.db.collection(this.options.collection).insertMany(entries);
    }
  }

  async destroy(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    await this.flush(); // 残りのバッファをフラッシュ
  }
}
```

### Webhook ロガープラグイン

```typescript
// Webhook/HTTP エンドポイント出力プラグイン
class WebhookLoggerPlugin implements AgLoggerPlugin {
  name = 'WebhookLogger';
  private buffer: any[] = [];
  private flushInterval?: NodeJS.Timeout;

  constructor(
    private options: {
      webhookUrl: string;
      headers?: Record<string, string>;
      bufferSize?: number;
      flushInterval?: number;
      retryAttempts?: number;
      retryDelay?: number;
    },
  ) {
    this.options.bufferSize = options.bufferSize || 20;
    this.options.flushInterval = options.flushInterval || 10000; // 10秒
    this.options.retryAttempts = options.retryAttempts || 3;
    this.options.retryDelay = options.retryDelay || 1000;

    this.startFlushInterval();
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.options.flushInterval);
  }

  log(formattedMessage: string, level: AgLogLevel, originalArgs: any[]): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: formattedMessage,
      args: originalArgs,
      source: {
        service: process.env.SERVICE_NAME || 'unknown',
        version: process.env.SERVICE_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    };

    this.buffer.push(logEntry);

    if (this.buffer.length >= this.options.bufferSize!) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) { return; }

    const payload = {
      logs: this.buffer.splice(0),
      metadata: {
        timestamp: new Date().toISOString(),
        count: this.buffer.length,
      },
    };

    await this.sendWebhook(payload);
  }

  private async sendWebhook(payload: any, attempt = 1): Promise<void> {
    try {
      const response = await fetch(this.options.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.options.headers,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Webhook送信エラー (試行 ${attempt}):`, error);

      if (attempt < this.options.retryAttempts!) {
        await new Promise((resolve) => setTimeout(resolve, this.options.retryDelay!));
        await this.sendWebhook(payload, attempt + 1);
      } else {
        console.error('Webhook送信失敗: リトライ上限到達');
      }
    }
  }

  async destroy(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    await this.flush();
  }
}
```

---

## プラグイン管理とコンポジション

### マルチプラグインロガー

```typescript
// 複数プラグインを管理するコンポジットロガー
class MultiPluginLogger {
  private plugins: AgLoggerPlugin[] = [];
  private formatter: AgFormatFunction;

  constructor(formatter: AgFormatFunction = new PlainFormatter()) {
    this.formatter = formatter;
  }

  addPlugin(plugin: AgLoggerPlugin): void {
    this.plugins.push(plugin);
  }

  removePlugin(pluginName: string): void {
    const index = this.plugins.findIndex((p) => p.name === pluginName);
    if (index >= 0) {
      const plugin = this.plugins[index];
      if (plugin.destroy) {
        plugin.destroy();
      }
      this.plugins.splice(index, 1);
    }
  }

  log(level: AgLogLevel, message: string, ...args: any[]): void {
    const formattedMessage = this.formatter(level, message, args);

    this.plugins.forEach((plugin) => {
      try {
        plugin.log(formattedMessage, level, args);
      } catch (error) {
        console.error(`プラグイン ${plugin.name} でエラー:`, error);
      }
    });
  }

  async destroy(): Promise<void> {
    await Promise.all(
      this.plugins.map(async (plugin) => {
        if (plugin.destroy) {
          try {
            await plugin.destroy();
          } catch (error) {
            console.error(`プラグイン ${plugin.name} の破棄でエラー:`, error);
          }
        }
      }),
    );
  }
}

// 使用例
const multiLogger = new MultiPluginLogger(new JsonFormatter());

// 各種プラグインを追加
multiLogger.addPlugin(
  new FileLoggerPlugin({
    filePath: './logs/app.log',
    maxFileSize: 50 * 1024 * 1024, // 50MB
  }),
);

multiLogger.addPlugin(
  new WebhookLoggerPlugin({
    webhookUrl: 'https://api.example.com/logs',
    headers: { 'Authorization': 'Bearer token123' },
  }),
);

multiLogger.addPlugin(
  new DatabaseLoggerPlugin({
    connectionString: 'mongodb://localhost:27017/logs',
    collection: 'application_logs',
  }),
);

// ログ出力（全プラグインに送信される）
multiLogger.log('info', 'アプリケーション開始', { version: '1.0.0' });
```

### 環境別プラグイン設定

```typescript
// 環境に応じたプラグイン設定管理
class EnvironmentLoggerFactory {
  static createLogger(): AgLogger {
    const environment = process.env.NODE_ENV || 'development';
    const logger = new AgLogger();

    switch (environment) {
      case 'development':
        return this.createDevelopmentLogger();

      case 'test':
        return this.createTestLogger();

      case 'staging':
        return this.createStagingLogger();

      case 'production':
        return this.createProductionLogger();

      default:
        return logger;
    }
  }

  private static createDevelopmentLogger(): AgLogger {
    // 開発環境：コンソール + ファイル
    const multiLogger = new MultiPluginLogger(
      new ColorFormatter(), // 色付きフォーマッター
    );

    multiLogger.addPlugin(new ConsoleLoggerPlugin());
    multiLogger.addPlugin(
      new FileLoggerPlugin({
        filePath: './logs/dev.log',
      }),
    );

    return new AgLogger({ formatter: multiLogger.log.bind(multiLogger) });
  }

  private static createTestLogger(): AgLogger {
    // テスト環境：ファイルのみ（コンソール出力を抑制）
    const multiLogger = new MultiPluginLogger(new PlainFormatter());

    multiLogger.addPlugin(
      new FileLoggerPlugin({
        filePath: './logs/test.log',
      }),
    );

    return new AgLogger({
      logLevel: 'warn', // テスト中は警告以上のみ
      formatter: multiLogger.log.bind(multiLogger),
    });
  }

  private static createStagingLogger(): AgLogger {
    // ステージング環境：ファイル + Webhook
    const multiLogger = new MultiPluginLogger(new JsonFormatter());

    multiLogger.addPlugin(
      new FileLoggerPlugin({
        filePath: './logs/staging.log',
        maxFileSize: 100 * 1024 * 1024, // 100MB
      }),
    );

    multiLogger.addPlugin(
      new WebhookLoggerPlugin({
        webhookUrl: process.env.STAGING_WEBHOOK_URL || '',
        headers: { 'Authorization': `Bearer ${process.env.LOG_API_TOKEN}` },
      }),
    );

    return new AgLogger({
      logLevel: 'info',
      formatter: multiLogger.log.bind(multiLogger),
    });
  }

  private static createProductionLogger(): AgLogger {
    // 本番環境：ファイル + データベース + Webhook
    const multiLogger = new MultiPluginLogger(new JsonFormatter());

    multiLogger.addPlugin(
      new FileLoggerPlugin({
        filePath: './logs/production.log',
        maxFileSize: 200 * 1024 * 1024, // 200MB
        maxFiles: 10,
      }),
    );

    multiLogger.addPlugin(
      new DatabaseLoggerPlugin({
        connectionString: process.env.LOG_DB_CONNECTION || '',
        collection: 'production_logs',
      }),
    );

    if (process.env.ALERT_WEBHOOK_URL) {
      multiLogger.addPlugin(
        new WebhookLoggerPlugin({
          webhookUrl: process.env.ALERT_WEBHOOK_URL,
          headers: { 'Authorization': `Bearer ${process.env.ALERT_API_TOKEN}` },
        }),
      );
    }

    return new AgLogger({
      logLevel: 'warn', // 本番は警告以上のみ
      formatter: multiLogger.log.bind(multiLogger),
    });
  }
}

// 使用例
const logger = EnvironmentLoggerFactory.createLogger();
logger.info('アプリケーション開始');
```

---

### See Also

- [基本的なロガー操作](01-basic-logger-operations.md) - ロガーの基本的な使用方法
- [ログレベル制御](02-log-level-control.md) - ログレベルの詳細設定
- [フォーマッター活用](03-formatter-usage.md) - 出力形式のカスタマイズ
- [エラーハンドリング](04-error-handling.md) - エラーログの効果的な活用
- [プラグインシステム詳細](../projects/03-plugin-system.md) - プラグインシステム設計仕様
- [Basic Usage Guide](README.md) - 目次に戻る

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
