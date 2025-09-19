---
header:
  - src: 02-quickstart.md
  - @(#): Quick Start Guide
title: `agla-logger`
description: 最小のサンプルコードでログレベルとフォーマッターを体験
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

## Quick Start

このページでは、`agla-logger` を最短で動かすための最小限のコード例を紹介します。
ログの出力、レベル設定、フォーマッター切り替えを体験できます。

---

## 1. 最初のログを出力する

### 1.1 デフォルト設定でのログ出力

```typescript
import { AgLogger } from '@aglabo/agla-logger';

// デフォルトロガーの作成
const logger = AgLogger.createLogger();

// 注意: デフォルトでは安全のため何も出力されません
logger.info('このメッセージは表示されません');
```

### 1.2 実際にログを出力する

```typescript
import {
  AG_LOGLEVEL,
  AgLogger,
  ConsoleLogger,
  PlainFormatter,
} from '@aglabo/agla-logger';

// ログを出力するための設定
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO, // INFO レベルまでの重要なログを出力
  defaultLogger: ConsoleLogger, // コンソールにログを出力
  formatter: PlainFormatter, // プレインテキスト形式でログを出力
});

// 初めてのログ出力
logger.info('Hello, agla-logger!');
// 出力例: 2025-09-22T10:30:45Z [INFO] Hello, agla-logger!
```

---

## 2. 標準ログレベルを試す

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.TRACE, // 全レベルを出力
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});

// 標準ログレベルの出力（重要度順）
logger.fatal('致命的メッセージ'); // 最も重要 - アプリ終了レベル
logger.error('エラーメッセージ'); // エラー発生 - 処理は継続
logger.warn('警告メッセージ'); // 注意が必要 - 潜在的問題
logger.info('情報メッセージ'); // 一般的な情報
logger.debug('デバッグメッセージ'); // 開発用詳細情報
logger.trace('トレースメッセージ'); // 最も詳細 - 実行トレース

/* 出力例:
2025-09-22T10:30:45Z [FATAL] 致命的メッセージ
2025-09-22T10:30:45Z [ERROR] エラーメッセージ
2025-09-22T10:30:45Z [WARN] 警告メッセージ
2025-09-22T10:30:45Z [INFO] 情報メッセージ
2025-09-22T10:30:45Z [DEBUG] デバッグメッセージ
2025-09-22T10:30:45Z [TRACE] トレースメッセージ
*/
```

---

## 3. ログレベルフィルタリング

### 3.1 ログレベルによるフィルタリング

```typescript
// INFO重要度以上のみ出力(TRACE、DEBUG は非表示)
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO, // FATAL〜INFOのみ
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});

logger.warn('このメッセージも表示されます'); // 表示
logger.info('このメッセージは表示されます'); // 表示
logger.debug('このメッセージは表示されません'); // 非表示

/* 出力例(重要度順):
2025-09-22T10:30:45Z [WARN] このメッセージも表示されます
2025-09-22T10:30:45Z [INFO] このメッセージは表示されます
*/
```

### 3.2 特殊ロガー（フィルタリング無視）

```typescript
// INFO重要度設定でも特殊レベルは条件次第で出力される
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO, // FATAL〜INFOの設定
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});

// 標準レベルのテスト
logger.debug('DEBUG: 表示されません'); // 非表示（INFO重要度未満）
logger.info('INFO: 表示されます'); // 表示

// 特殊レベルのテスト
logger.setVerbose = true; // verboseモード有効化が必要
logger.verbose('VERBOSE: フィルタリング回避'); // 表示（verboseモード有効時）
logger.log('LOG: 強制出力'); // 表示（常に強制出力）

/* 出力例(重要度順):
2025-09-22T10:30:45Z [LOG] LOG: 強制出力
2025-09-22T10:30:45Z [VERBOSE] VERBOSE: フィルタリング回避
2025-09-22T10:30:45Z [INFO] INFO: 表示されます
*/
```

---

## 4. フォーマッターの切り替え

### 4.1 JsonFormatter

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, JsonFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter, // JSON 形式で出力
});

logger.info('JSON形式のログ', { userId: 123, action: 'login' });

/* 出力例:
{"timestamp":"2025-09-22T10:30:45.123Z","level":"INFO","message":"JSON形式のログ","args":[{"userId":123,"action":"login"}]}
*/
```

### 4.2 PlainFormatter

```typescript
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter, // シンプルなテキスト形式
});

logger.info('シンプルなログ');
// 出力例: 2025-09-22T10:30:45Z [INFO] シンプルなログ
```

### 4.3 NullFormatter（デフォルト）

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, NullFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: NullFormatter, // 出力を無効化（空文字列を返す）
});

logger.info('このログは出力されません');
logger.log('強制出力メソッドも出力されません');
logger.setVerbose = true;
logger.verbose('verboseメソッドも出力されません');
// 出力例: （何も表示されない）

// 注意: NullFormatterは全てのログメソッドの出力を完全に無効化します
// log()やverbose()などの特殊メソッドも含めて一切出力されません
// デバッグやテスト環境でログ出力を一時的に停止したい場合に有効
```

---

## 5. ロガーの切り替え

### 5.1 ConsoleLogger

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger, // 明示的に指定
  formatter: PlainFormatter,
});

logger.info('コンソール出力されます');
// 出力例: 2025-09-22T10:30:45Z [INFO] コンソール出力されます

// ConsoleLoggerはconsole.log()でフォーマット済みメッセージを出力
// 開発環境や本番でのログ出力が必要な場合に使用
```

### 5.2 NullLogger (デフォルト)

```typescript
import { AG_LOGLEVEL, AgLogger, NullLogger, PlainFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: NullLogger, // デフォルト (明示的な指定は不要)
  formatter: PlainFormatter,
});

logger.info('このログは出力されません');
// 出力例: （何も表示されない）

// 注意: NullLoggerはロガーレベルで出力を無効化します
// フォーマッターは動作しますが、最終的に出力されません
// agla-loggerはデフォルトで出力を行わない設計です
```

### 5.3 MockLogger (テスト用)

```typescript
import { AG_LOGLEVEL, AgLogger, AgMockBufferLogger, MockLogger, PlainFormatter } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: MockLogger.buffer, // テスト用バッファリングロガー
  formatter: PlainFormatter,
});

logger.info('テスト用ログ');
logger.warn('警告メッセージ');

// MockLoggerからログを取得・検証
const mockLogger = logger.getDefaultLogger() as AgMockBufferLogger;
const infoLogs = mockLogger.getMessages(AG_LOGLEVEL.INFO);
const allLogs = mockLogger.getAllMessages();

console.log('INFOログ:', infoLogs);
console.log('全ログ:', allLogs);

// ログをクリア
mockLogger.clearAllMessages();
```

### 5.4 ロガーとフォーマッターの関係

```typescript
// 出力制御の2段階構成
// 1. フォーマッター: ログメッセージを文字列に変換
// 2. ロガー: フォーマット済み文字列を実際に出力

// 最初の設定: NullFormatter + ConsoleLogger
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: NullFormatter, // 空文字列を出力
});

// テスト1: NullFormatterによる無効化
logger.info('これは表示されません (NullFormatter)');
logger.log('強制出力も表示されません (NullFormatter)');
// 出力例: （何も表示されない）
// 理由: NullFormatterがフォーマット段階で空文字列を返すため

// 設定を変更: PlainFormatter + NullLogger
logger.setLoggerConfig({
  logLevel: AG_LOGLEVEL.INFO,
  defaultLogger: NullLogger, // 出力を無効化
  formatter: PlainFormatter, // フォーマットは実行される
});

// テスト2: NullLoggerによる無効化
logger.info('これは表示されません (NullLogger)');
logger.log('強制出力も表示されません (NullLogger)');
// 出力例: （何も表示されない）
// 理由: PlainFormatterはメッセージをフォーマットするが、NullLoggerが出力段階で無効化

// 両方とも結果的に何も出力されませんが、無効化される段階が異なります:
// - NullFormatter: フォーマット段階で空文字列に変換
// - NullLogger: ロガー段階でフォーマット済み文字列を破棄
// AgLoggerはシングルトンのため、setLoggerConfigで設定を変更します
```

---

## 6. 開発・テスト環境でのMockの活用

### 6.1 高度なMockLogger活用

```typescript
import { AG_LOGLEVEL, AgLogger, AgMockBufferLogger, MockLogger, PlainFormatter } from '@aglabo/agla-logger';

// 高度なテスト環境での使用例
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.DEBUG,
  defaultLogger: MockLogger.buffer,
  formatter: PlainFormatter,
});

// 複数レベルのログを記録
logger.debug('デバッグ情報');
logger.info('一般情報');
logger.warn('警告');
logger.error('エラー');

// 詳細なログ分析
const mockLogger = logger.getDefaultLogger() as AgMockBufferLogger;

// レベル別ログ取得
const errorLogs = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
const warningCount = mockLogger.getMessageCount(AG_LOGLEVEL.WARN);
const hasErrors = mockLogger.hasMessages(AG_LOGLEVEL.ERROR);

console.log('エラーログ:', errorLogs);
console.log('警告数:', warningCount);
console.log('エラーあり:', hasErrors);

// 最新メッセージ取得
const lastMessage = mockLogger.getLastMessage(AG_LOGLEVEL.INFO);
console.log('最新INFO:', lastMessage);
```

---

## 7. 実際の使用例

### 7.1 アプリケーションの初期化

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger';

// アプリケーション起動時のロガー設定
const logger = AgLogger.createLogger({
  logLevel: process.env.NODE_ENV === 'development'
    ? AG_LOGLEVEL.DEBUG
    : AG_LOGLEVEL.INFO,
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});

// アプリケーション開始
logger.info('アプリケーションを開始します...');

// 設定読み込み
logger.debug('設定ファイルを読み込み中...');

// エラーハンドリング例
try {
  // 何らかの処理
  logger.info('処理が正常に完了しました');
} catch (error) {
  logger.error('処理中にエラーが発生しました', { error: error.message });
}
```

---

## 次のステップ

Quick Start が完了したら、詳細な使い方を学びましょう。

- [基本的な使い方](03-basic-usage.md) - ロガーの複数インスタンス管理
- [応用例](04-examples.md) - カスタムフォーマッターと実際のアプリケーション統合
- [トラブルシューティング](05-troubleshooting.md) - よくある問題と解決法

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
