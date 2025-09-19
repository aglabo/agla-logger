---
header:
  - src: 03-basic-usage.md
  - @(#): Basic Usage Guide
title: `agla-logger`
description: ロガーの生成、複数インスタンス管理、`AglaError`フレームワークとの連携
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

## 基本的な使い方

このページでは、`agla-logger` のより実践的な使用方法を説明します。
ロガーの複数インスタンス管理、設定の動的変更、`AglaError` フレームワークとの連携について学べます。

---

## 1. ロガーインスタンスの管理

### 1.1 シングルトンパターンによる同一インスタンス

シングルトンパターンによってロガーインスタンスが統一管理され、アプリケーション全体で同一のロガーを使用できます。

```typescript
import { AgLogger } from '@aglabo/agla-logger';

// 最初にロガーを作成
const logger1 = AgLogger.createLogger();
// 2回目以降は getLogger でインスタンスを取得
const logger2 = AgLogger.getLogger();

console.log(logger1 === logger2); // true - 同じインスタンス
```

### 1.2 設定の動的変更

実行時にログレベルやフォーマッターを動的に変更して、柔軟なログ出力制御を実現できます。

```typescript
import {
  AG_LOGLEVEL,
  AgLogger,
  ConsoleLogger,
  JsonFormatter,
  PlainFormatter,
} from '@aglabo/agla-logger';

// 初期設定
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});

logger.info('初期設定でのログ');
// 出力: [`INFO`] 初期設定でのログ

// 実行時にフォーマッターを変更
logger.setFormatter(JsonFormatter);
logger.info('JSON形式でのログ');
// 出力: {"timestamp":"2025-09-23T10:30:45.123Z","level":"INFO","message":"JSON形式でのログ"}

// ログレベルの変更
logger.logLevel = AG_LOGLEVEL.DEBUG;
logger.debug('デバッグレベルのログ');
// 出力: {"timestamp":"2025-09-23T10:30:47.456Z","level":"DEBUG","message":"デバッグレベルのログ"}
```

---

## 2. 複数のロガー設定パターン

### 2.1 開発環境・本番環境の切り替え

環境にあわせて、ロガーの設定 (ログレベル、出力先、フォーマット形式) を自動切り替えできます。

```typescript
import {
  AG_LOGLEVEL,
  AgLogger,
  ConsoleLogger,
  JsonFormatter,
  NullLogger,
  PlainFormatter,
} from '@aglabo/agla-logger';

function createAppLogger() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return AgLogger.createLogger({
    // 環境に応じたログレベル
    logLevel: isProduction
      ? AG_LOGLEVEL.WARN // 本番: 警告以上のみ
      : isDevelopment
      ? AG_LOGLEVEL.DEBUG // 開発: デバッグレベルまで
      : AG_LOGLEVEL.INFO, // その他: 情報レベル

    // 環境に応じた出力先
    defaultLogger: process.env.LOGGER_DISABLED === 'true'
      ? NullLogger // テスト時は出力無効
      : ConsoleLogger,

    // 環境に応じたフォーマット
    formatter: isProduction
      ? JsonFormatter // 本番: 構造化ログ
      : PlainFormatter, // 開発: 読みやすい形式
  });
}

const logger = createAppLogger();
```

### 2.2 機能別ロガーの作成

AglaLogger では、logger は同一のインスタンスになります。
このため、複数のサービス、クラスでログを共有できます。

```typescript
// アプリケーション全体で同じロガーインスタンスを使用
class DatabaseService {
  private logger = AgLogger.getLogger(); // 既に作成されたインスタンスを取得

  async connect() {
    this.logger.info('データベースに接続中...');
    try {
      // 接続処理
      this.logger.info('データベース接続が完了しました');
    } catch (error) {
      this.logger.error('データベース接続に失敗しました', { error });
      throw error;
    }
  }
}

class ApiService {
  private logger = AgLogger.getLogger(); // 同じインスタンス

  async request(url: string) {
    this.logger.debug('API リクエスト開始', { url });
    // リクエスト処理
    this.logger.debug('API リクエスト完了', { url });
  }
}
```

---

## 3. `AglaError` フレームワークとの連携

### 3.1 基本的なエラーログ

標準的な Error オブジェクトを使用した基本的なエラーログの出力方法を説明します。

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, JsonFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
});

// 基本的なエラーログ
try {
  throw new Error('何らかのエラー');
} catch (error) {
  logger.error('処理中にエラーが発生しました', {
    error: error.message,
    stack: error.stack,
  });
}
```

### 3.2 `AglaError` との統合 (オプション)

`AglaLogger`では、`AglaError`エラーフレームワークを使うために`AgLoggerError`具象エラークラスを用意しています。
`AgLoggerError` クラスを使用して、構造化されたエラー情報を含む高度なエラーログを出力できます。

`AgLoggerError`は`@aglabo/agla-logger`にふくまれているため、すぐに利用できます。

```typescript
import { ErrorSeverity } from '@aglabo/agla-error';
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, JsonFormatter } from '@aglabo/agla-logger';
import { AgLoggerError } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
});

// `AgLoggerError` の作成とログ出力
function processData(data: unknown) {
  try {
    if (!data) {
      const error = new AgLoggerError(
        ErrorSeverity.ERROR,
        'INVALID_DATA',
        'データが無効です',
        { providedData: data },
      );

      // `AgLoggerError` をログに出力
      logger.error('データ処理エラー', {
        errorCode: error.code,
        severity: error.severity,
        details: error.details,
        message: error.message,
      });

      throw error;
    }

    logger.info('データ処理が正常に完了しました');
  } catch (error) {
    if (error instanceof AgLoggerError) {
      // `AgLoggerError` の場合は構造化された情報をログ出力
      logger.fatal('致命的なエラーが発生しました', {
        code: error.code,
        severity: error.severity,
        chain: error.toChainArray(),
      });
    } else {
      // 通常のエラーの場合
      logger.error('予期しないエラーが発生しました', { error });
    }
    throw error;
  }
}
```

---

## 4. ロガーマネージャーの活用

### 4.1 システム全体のロガー管理

AgLoggerManager を使用してシステム全体のログ設定を一元管理し、統一的な制御を実現できます。

```typescript
import { AG_LOGLEVEL, AgLoggerManager, ConsoleLogger, JsonFormatter } from '@aglabo/agla-logger';

// マネージャーの初回作成時
const manager = AgLoggerManager.createManager({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
});

// 各モジュールでロガーを取得
const logger = manager.getLogger();

// 2回目以降は getManager() でインスタンスを取得
// const manager = AgLoggerManager.getManager();

// システム全体のログレベルを動的に変更
if (process.env.DEBUG === 'true') {
  manager.setLoggerConfig({ logLevel: AG_LOGLEVEL.DEBUG });
}
```

### 4.2 ロガーの統計情報取得

MockLogger.buffer を使用することで、ログの監視ができます。
ログ出力回数や実際のログメッセージなどの統計情報を取得し、解析できます。

```typescript
import { AG_LOGLEVEL, AgLoggerManager, MockLogger } from '@aglabo/agla-logger';

// 統計情報取得のために MockLogger.buffer を使用
const mockLogger = MockLogger.buffer;
const manager = AgLoggerManager.createManager({
  defaultLogger: mockLogger,
});
const logger = manager.getLogger();

// ログを出力
logger.info('情報ログ');
logger.warn('警告ログ');
logger.error('エラーログ');

// 統計情報の取得
console.log('ログ統計:');
console.log('総メッセージ数:', mockLogger.getTotalMessageCount());
console.log('INFOレベル数:', mockLogger.getMessageCount(AG_LOGLEVEL.INFO));
console.log('最新エラー:', mockLogger.getLastMessage(AG_LOGLEVEL.ERROR));
/* 出力例:
ログ統計:
総メッセージ数: 3
INFOレベル数: 1
最新エラー: 'エラーログ'
*/
```

---

## 5. パフォーマンス考慮事項

### 5.1 効率的なログ出力

ログレベルチェックと遅延評価を活用して、不要な処理を回避し、パフォーマンスを最適化できます。

```typescript
import { AG_LOGLEVEL, AgLogger } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO, // INFO 以上のみ出力
});

// ❌ 悪い例: 不要な計算が実行される
logger.debug('重い処理の結果: ' + expensiveCalculation());

// ✅ 良い例: ログレベルをチェックしてから計算
if (logger.shouldOutput(AG_LOGLEVEL.DEBUG)) {
  logger.debug('重い処理の結果: ' + expensiveCalculation());
}

// ✅ より良い例: 遅延評価を活用
logger.debug(() => '重い処理の結果: ' + expensiveCalculation());
```

### 5.2 メモリ効率的な使用

シングルトンパターンにより同一インスタンスが再利用されるため、ロガー作成によるメモリー消費が起こりません。

```typescript
// ✅ 推奨: 正しい順序でシングルトンを活用
// 最初に一度だけ createLogger() でロガーを作成
const logger1 = AgLogger.createLogger();

// 以降は getLogger() で同一インスタンスを取得
const logger2 = AgLogger.getLogger();
const logger3 = AgLogger.getLogger();

console.log(logger1 === logger2); // true - 同一インスタンス
console.log(logger2 === logger3); // true - 同一インスタンス

// ❌ エラー: createLogger() の重複呼び出し
// const errorLogger = AgLogger.createLogger(); // エラーが発生する
```

---

## 6. See Also

基本的な使い方をマスターしたら、高度な機能を学びましょう。

- [Quick Start](02-quickstart.md)
- [応用例](04-examples.md)
- [トラブルシューティング](05-troubleshooting.md)

---

## 7. 関連ドキュメント

より詳細な情報が必要な場合は、以下を参照してください。

- [基本的な使い方](../basic-usage/) - 詳細な API 使用方法
- [ユーザーガイド](../user-guides/) - 実践的な使用例
- [APIリファレンス](../api-reference/) - 完全な API 仕様

---

## 8. License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
