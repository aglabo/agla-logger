---
header:
  - src: 02-plugin-formatters.md
  - @(#): Formatter Plugins API
title: フォーマッタープラグイン API
description: フォーマッタープラグイン実装とカスタムフォーマッター開発ガイド
version: 1.0.0
created: 2025-01-25
authors:
  - atsushifx
changes:
  - 2025-01-25: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## フォーマッタプラグイン API

このページは **agla-logger のフォーマッタープラグインシステム**の完全な API リファレンスです。
標準提供されるフォーマッターの詳細仕様と、カスタムフォーマッター実装方法を解説します。

## 🎯 対象読者

- 標準フォーマッターの詳細仕様確認
- カスタムフォーマッター開発者
- テスト用フォーマッターの活用
- 統計機能付きフォーマッターの実装

---

## 🔌 フォーマッタープラグインシステム

### 基本インターフェース

フォーマッターは `AgFormatFunction` インターフェースを実装します。次のシグネチャで定義されています。

> 通常は文字列を返しますが、Mock によるテスト用に`logMessage`が返せるようにしています。

```typescript
export type AgFormatFunction = (logMessage: AgLogMessage) => AgFormattedLogMessage;

// 実際の型展開
export type AgFormatFunction = (logMessage: AgLogMessage) => string;
```

### 使用方法

```typescript
import { AgLogger, JsonFormatter, PlainFormatter } from '@aglabo/agla-logger-core';

// ロガー作成時に指定
const logger = AgLogger.createLogger({
  formatter: JsonFormatter,
});

// 後から変更
logger.setFormatter(PlainFormatter);
```

---

<!-- markdownlint-disable no-duplicate-heading -->

## 📄 JsonFormatter

JsonFormatter は JSON 構造化出力フォーマッターであり、ログメッセージを JSON 形式で構造化します。

### JsonFormatter の基本仕様

- 出力形式は JSON 形式の構造化ログである
- タイムスタンプは ISO 8601 形式である
- レベルはラベル形式 (FATAL, ERROR, WARN, etc.) で表現する
- 引数は `args` フィールドに配列として格納する

### JsonFormatter の実装

```typescript
const JsonFormatter = (logMessage: AgLogMessage): string => {
  const levelLabel = AgToLabel(logMessage.logLevel);
  const logEntry = {
    timestamp: logMessage.timestamp.toISOString(),
    ...(levelLabel && { level: levelLabel }),
    message: logMessage.message,
    ...(logMessage.args.length > 0 && { args: logMessage.args }),
  };

  return JSON.stringify(logEntry);
};
```

### JsonFormatter の出力例

#### 基本的なログ

```typescript
logger.info('ユーザーがログインしました');
```

出力:

```json
{
  "timestamp": "2025-01-25T10:30:00.000Z",
  "level": "INFO",
  "message": "ユーザーがログインしました"
}
```

#### 構造化ログ

```typescript
logger.error('データベースエラー', {
  userId: 123,
  query: 'SELECT * FROM users',
  error: new Error('Connection timeout'),
});
```

出力:

```json
{
  "timestamp": "2025-01-25T10:30:00.000Z",
  "level": "ERROR",
  "message": "データベースエラー",
  "args": [
    {
      "userId": 123,
      "query": "SELECT * FROM users",
      "error": {}
    }
  ]
}
```

### 活用場面

- 本番環境ではログ分析ツールとの連携に適する
- 監視システムでは構造化データによる検索やフィルタリングが容易になる
- API サーバーではリクエストとレスポンス情報を構造化できる
- マイクロサービスではサービス間で統一したログ形式を維持しやすい

---

## 📝 PlainFormatter

PlainFormatter はプレーンテキスト型式のフォーマッターであり、読みやすい形式でログを出力します。

### PlainFormatter の基本仕様

- 出力形式は人間が読みやすいプレーンテキストである
- タイムスタンプは ISO 8601 形式 (ミリ秒なし) である
- レベルは `[LEVEL]` 形式で表現する
- 引数は文字列として連結する

### PlainFormatter の実装

```typescript
const PlainFormatter: AgFormatFunction = (logMessage: AgLogMessage): string => {
  const timestamp = logMessage.timestamp.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const levelLabel = AgToLabel(logMessage.logLevel);
  const messagePart = `${logMessage.message} ${argsToString(logMessage.args)}`.trim();
  const labelPart = levelLabel ? `[${levelLabel}] ` : '';
  return `${timestamp} ${labelPart}${messagePart}`.trim();
};
```

### PlainFormatter の出力例

#### PlainFormatter: 基本的なログ

```typescript
logger.info('アプリケーション開始');
```

出力:

```text
2025-01-25T10:30:00Z [INFO] アプリケーション開始
```

#### PlainFormatter: エラーログ

```typescript
logger.error('処理失敗', { userId: 123, action: 'login' });
```

出力:

```text
2025-01-25T10:30:00Z [ERROR] 処理失敗 {"userId":123,"action":"login"}
```

### 活用場面

- 開発環境では開発中のデバッグと動作確認に活用できる
- コンソール出力ではターミナルでの視認性を高められる
- ローカルファイルではシンプルなログファイルを作成できる
- デバッグ用途では人間の目による問題特定を支援する

---

## 🧪 MockFormatter

MockFormatter はテスト用マルチプリセットフォーマッターであり、テストで使用する多様なフォーマット機能を提供します。

### MockFormatter の基本仕様

- 8 つのプリセットで様々なテストシナリオに対応する
- `withRoutine`・`prefixed`・`returnValue` などのメソッドでカスタムフォーマッターを生成できる
- `errorThrow` を利用して例外動作のテストが可能である

### MockFormatter のプリセット一覧

#### MockFormatter: `MockFormatter.json`

JSON 形式の出力 (JsonFormatter と同等)

```typescript
const logger = AgLogger.createLogger({
  formatter: MockFormatter.json,
});

logger.info('テストメッセージ');
// 出力: {"timestamp":"2025-01-25T10:30:00.000Z","level":"INFO","message":"テストメッセージ"}
```

#### MockFormatter: `MockFormatter.passthrough`

ログメッセージをそのまま返す。

> 正確には、パラメータである`AgLogMessage`を返す

```typescript
const logger = AgLogger.createLogger({
  formatter: MockFormatter.passthrough,
});

logger.info('そのままのメッセージ');
// {
//   logLevel: AG_LOGLEVEL.INFO,
//   timestamp: 2025-01-25T10:30:00.000Z
//   message: 'そのままのメッセージ
//  }
```

#### MockFormatter: `MockFormatter.messageOnly`

メッセージのみを出力する (タイムスタンプ・レベルなし) 。

```typescript
const logger = AgLogger.createLogger({
  formatter: MockFormatter.messageOnly,
});

logger.warn('警告メッセージ');
// 出力:
// 警告メッセージ
```

#### MockFormatter: `MockFormatter.timestamped`

タイムスタンプ付きメッセージを生成する。

```typescript
const logger = AgLogger.createLogger({
  formatter: MockFormatter.timestamped,
});

logger.debug('デバッグ情報');
// 出力: 2025-01-25T10:30:00.000Z デバッグ情報
```

### MockFormatter のカスタム作成メソッド

#### MockFormatter: `MockFormatter.withRoutine(routine: AgFormatFunction)`

カスタムフォーマット関数を指定する。

```typescript
const customRoutine = (logMessage) => `CUSTOM: ${logMessage.message}`;
const formatter = MockFormatter.withRoutine(customRoutine);

const logger = AgLogger.createLogger({
  formatter: formatter,
});

logger.info('カスタムログ');
// 出力: CUSTOM: カスタムログ
```

#### MockFormatter: `MockFormatter.prefixed(prefix: string)`

指定プレフィックス付きフォーマッターを生成する。

```typescript
const prefixedFormatter = MockFormatter.prefixed('[TEST]');

const logger = AgLogger.createLogger({
  formatter: prefixedFormatter,
});

logger.info('プレフィックステスト');
// 出力: [TEST] プレフィックステスト
```

#### MockFormatter: `MockFormatter.returnValue(value: string)`

常に同じ値を返すフォーマッター。

```typescript
const staticFormatter = MockFormatter.returnValue('STATIC_OUTPUT');

const logger = AgLogger.createLogger({
  formatter: staticFormatter,
});

logger.info('任意のメッセージ');
// 出力: STATIC_OUTPUT
```

### MockFormatter のエラーテスト

#### MockFormatter: `MockFormatter.errorThrow`

例外をスローするフォーマッター (エラーハンドリングテスト用)

```typescript
const logger = AgLogger.createLogger({
  formatter: MockFormatter.errorThrow,
});

try {
  logger.info('エラーテスト');
} catch (error) {
  console.log('フォーマッターエラーをキャッチ');
}
```

### テストシナリオ例

```typescript
describe('フォーマッターテスト', () => {
  it('JSON形式での出力確認', () => {
    const logger = AgLogger.createLogger({
      formatter: MockFormatter.json,
      defaultLogger: MockLogger.buffer,
    });

    logger.info('テストメッセージ');

    const output = logger.getDefaultLogger().getLastMessage();
    const parsed = JSON.parse(output);

    expect(parsed.message).toBe('テストメッセージ');
    expect(parsed.level).toBe('INFO');
  });

  it('プレフィックス付きフォーマットテスト', () => {
    const logger = AgLogger.createLogger({
      formatter: MockFormatter.prefixed('[DEBUG]'),
      defaultLogger: MockLogger.buffer,
    });

    logger.info('プレフィックステスト');

    const output = logger.getDefaultLogger().getLastMessage();
    expect(output).toBe('[DEBUG] プレフィックステスト');
  });
});
```

---

## 🚫 NullFormatter

NullFormatter は出力無効化フォーマッターであり、ログ出力を行わない設定を提供します。

### NullFormatter の基本仕様

- 出力は常に空文字列である
- 用途はログ出力の停止やパフォーマンステストである

### NullFormatter の実装

```typescript
const NullFormatter: AgFormatFunction = (
  _logMessage: AgLogMessage,
): string => {
  return '';
};
```

### 使用例

```typescript
const logger = AgLogger.createLogger({
  formatter: NullFormatter,
});

logger.info('このメッセージは出力されません');
// 出力:  (空文字列)
```

### NullFormatter の活用場面

- パフォーマンステストではログ処理オーバーヘッドの測定に利用する
- 本番環境では特定条件下でログ出力を停止したい場合に使う
- テストではログ出力を無効化したいケースに適する

---

## 📊 AgMockFormatter

AgMockFormatter は統計追跡付き Mock フォーマッターであり、ログ処理統計を追跡できる高度なテスト用ツールです。

### AgMockFormatter の基本仕様

- 統計追跡として呼び出し回数や最後のメッセージを記録する
- カスタムルーチンを設定してフォーマット処理を調整できる
- リセット機能で統計情報を初期化できる

### クラス構造

```typescript
class AgMockFormatter {
  public callCount: number = 0;
  public lastMessage: AgLogMessage | null = null;
  private formatRoutine: AgFormatFunction;

  constructor(formatRoutine?: AgFormatFunction);
  execute: AgFormatFunction;
  getStats(): AgLogStatistics;
  reset(): void;
}
```

### AgMockFormatter の基本使用法

```typescript
import { AgMockFormatter } from '@aglabo/agla-logger-core';

// デフォルト (パススルー) で作成
const mockFormatter = new AgMockFormatter();

const logger = AgLogger.createLogger({
  formatter: mockFormatter,
});

logger.info('テストメッセージ1');
logger.error('テストメッセージ2');

// 統計確認
const stats = mockFormatter.getStats();
console.log(`呼び出し回数: ${stats.formatCount}`);
console.log(`最後のメッセージ: ${stats.lastMessage?.message}`);
```

### AgMockFormatter のカスタムルーチン指定

```typescript
// カスタムフォーマット処理
const customRoutine = (logMessage: AgLogMessage) => {
  return `[CUSTOM] ${logMessage.message}`;
};

const mockFormatter = new AgMockFormatter(customRoutine);

const logger = AgLogger.createLogger({
  formatter: mockFormatter,
});

logger.info('カスタムテスト');
// 出力: [CUSTOM] カスタムテスト

// 統計確認
console.log(`処理回数: ${mockFormatter.callCount}`);
```

### AgMockFormatter の統計情報

#### AgMockFormatter: `getStats(): AgLogStatistics`

フォーマッター統計を取得します。

```typescript
interface AgLogStatistics {
  formatCount: number; // フォーマット実行回数
  lastMessage: AgLogMessage | null; // 最後に処理したメッセージ
  lastTimestamp: Date | null; // 最後の処理時刻
}

const stats = mockFormatter.getStats();
```

#### AgMockFormatter: `reset(): void`

統計情報をリセットします。

```typescript
mockFormatter.reset();
console.log(mockFormatter.callCount); // 0
```

### AgMockFormatter のテスト活用例

```typescript
describe('ログ統計テスト', () => {
  let mockFormatter: AgMockFormatter;
  let logger: AgLogger;

  beforeEach(() => {
    mockFormatter = new AgMockFormatter();
    logger = AgLogger.createLogger({
      formatter: mockFormatter,
    });
  });

  it('ログ呼び出し回数を正確に追跡する', () => {
    logger.info('テスト1');
    logger.error('テスト2');
    logger.warn('テスト3');

    expect(mockFormatter.callCount).toBe(3);
  });

  it('最後のメッセージを記録する', () => {
    logger.info('最初のメッセージ');
    logger.error('最後のメッセージ');

    const stats = mockFormatter.getStats();
    expect(stats.lastMessage?.message).toBe('最後のメッセージ');
  });

  it('統計リセット機能', () => {
    logger.info('テストメッセージ');
    expect(mockFormatter.callCount).toBe(1);

    mockFormatter.reset();
    expect(mockFormatter.callCount).toBe(0);
  });
});
```

---

## 🛠️ カスタムフォーマッター開発

### 基本実装パターン

```typescript
import { AgFormatFunction, AgLogMessage } from '@aglabo/agla-logger-core';

// 基本的なカスタムフォーマッター
const MyCustomFormatter: AgFormatFunction = (logMessage: AgLogMessage): string => {
  // 1. タイムスタンプ処理
  const timestamp = logMessage.timestamp.toISOString();

  // 2. レベル処理
  const level = AgToLabel(logMessage.logLevel);

  // 3. メッセージ処理
  const message = logMessage.message;

  // 4. 引数処理
  const args = logMessage.args.length > 0
    ? ` | ${JSON.stringify(logMessage.args)}`
    : '';

  // 5. 最終フォーマット
  return `${timestamp} | ${level} | ${message}${args}`;
};
```

### 高度な実装例

#### カスタムフォーマッター開発: XML形式フォーマッター

```typescript
const XmlFormatter: AgFormatFunction = (logMessage) => {
  const levelLabel = AgToLabel(logMessage.logLevel);
  const timestamp = logMessage.timestamp.toISOString();

  let xml = `<log timestamp="${timestamp}"`;
  if (levelLabel) { xml += ` level="${levelLabel}"`; }
  xml += `>`;

  xml += `<message>${escapeXml(logMessage.message)}</message>`;

  if (logMessage.args.length > 0) {
    xml += `<args>`;
    logMessage.args.forEach((arg, index) => {
      xml += `<arg index="${index}">${escapeXml(JSON.stringify(arg))}</arg>`;
    });
    xml += `</args>`;
  }

  xml += `</log>`;
  return xml;
};

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

#### カスタムフォーマッター開発: 色付きコンソールフォーマッター

```typescript
const ColoredFormatter: AgFormatFunction = (logMessage) => {
  const colors = {
    [AG_LOGLEVEL.FATAL]: '\x1b[41m', // 赤背景
    [AG_LOGLEVEL.ERROR]: '\x1b[31m', // 赤文字
    [AG_LOGLEVEL.WARN]: '\x1b[33m', // 黄色文字
    [AG_LOGLEVEL.INFO]: '\x1b[32m', // 緑文字
    [AG_LOGLEVEL.DEBUG]: '\x1b[36m', // シアン文字
    [AG_LOGLEVEL.TRACE]: '\x1b[90m', // グレー文字
  };

  const reset = '\x1b[0m';
  const color = colors[logMessage.logLevel] || '';
  const levelLabel = AgToLabel(logMessage.logLevel);

  const timestamp = logMessage.timestamp.toISOString();
  const message = logMessage.message;

  return `${timestamp} ${color}[${levelLabel}]${reset} ${message}`;
};
```

### カスタムフォーマッター開発 のパフォーマンス考慮点

#### カスタムフォーマッター開発: 効率的な実装

```typescript
// ❌ 非効率：毎回新しいオブジェクトを作成
const InefficientFormatter: AgFormatFunction = (logMessage) => {
  const logEntry = {
    timestamp: new Date().toISOString(), // 不要な Date 作成
    level: AgToLabel(logMessage.logLevel),
    message: logMessage.message,
  };
  return JSON.stringify(logEntry);
};

// ✅ 効率的：必要最小限の処理
const EfficientFormatter: AgFormatFunction = (logMessage) => {
  const levelLabel = AgToLabel(logMessage.logLevel);
  const timestamp = logMessage.timestamp.toISOString();

  // 直接文字列構築 (JSONよりも高速)
  return `${timestamp}|${levelLabel}|${logMessage.message}`;
};
```

#### カスタムフォーマッター開発: キャッシュ活用

```typescript
// レベルラベルキャッシュ
const labelCache = new Map<number, string>();

const CachedFormatter: AgFormatFunction = (logMessage) => {
  let levelLabel = labelCache.get(logMessage.logLevel);
  if (!levelLabel) {
    levelLabel = AgToLabel(logMessage.logLevel);
    labelCache.set(logMessage.logLevel, levelLabel);
  }

  return `[${levelLabel}] ${logMessage.message}`;
};
```

---

## 🔗 プラグイン統合パターン

### プラグイン統合パターン 条件付きフォーマッター

```typescript
const ConditionalFormatter: AgFormatFunction = (logMessage) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // 本番環境：構造化JSON
    return JsonFormatter(logMessage);
  } else {
    // 開発環境：読みやすいプレーンテキスト
    return PlainFormatter(logMessage);
  }
};
```

### プラグイン統合パターン 複数フォーマッター組み合わせ

```typescript
const CompositeFormatter: AgFormatFunction = (logMessage) => {
  const baseFormat = PlainFormatter(logMessage);
  const jsonFormat = JsonFormatter(logMessage);

  // プレーンテキスト + 詳細JSON
  return `${baseFormat}\nDETAIL: ${jsonFormat}`;
};
```

### プラグイン統合パターン フィルタリング付きフォーマッター

```typescript
const FilteredFormatter: AgFormatFunction = (logMessage) => {
  // 機密情報をフィルタリング
  const sanitizedArgs = logMessage.args.map((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      const sanitized = { ...arg };
      delete sanitized.password;
      delete sanitized.token;
      return sanitized;
    }
    return arg;
  });

  const sanitizedMessage: AgLogMessage = {
    ...logMessage,
    args: sanitizedArgs,
  };

  return JsonFormatter(sanitizedMessage);
};
```

---

## 📚 関連情報

- [型定義・定数 API](04-type-definitions.md) - フォーマッター関連型
- [コアクラス API](01-core-api.md) - フォーマッター設定方法
- [ロガープラグイン API](03-plugin-loggers.md) - 出力先プラグイン
- [高度なAPI活用](07-advanced-usage.md) - 高度なカスタム実装

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
