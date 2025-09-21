---
header:
  - src: 03-plugin-loggers.md
  - @(#): Logger Plugins API
title: ロガープラグイン API
description: ロガープラグイン実装とテスト向けモックロガーの詳細仕様
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

このページは **agla-logger のロガープラグイン層**の詳細技術リファレンスです。
標準提供されるロガー実装とテスト専用モックを網羅し、運用と自動テストの双方に対応する構成を解説します。

## 🎯 対象読者

- ConsoleLogger を使って即座にログ出力したい開発者
- 単体テストや統合テストでメッセージを検証したい開発者
- 並列 E2E テストでログ隔離を実現したい QA エンジニア
- カスタムロガーを追加するための拡張ポイントを探しているアーキテクト

---

## 🔌 ロガープラグイン概要

agla-logger のロガー実装は Strategy パターンで作られており、`AgLoggerConfig` の `loggerMap` に差し替えて利用します。
標準セットは以下の 4 種類で構成する。

- `ConsoleLogger`: Node.js の `console` API をラップした本番向け実装
- `AgMockBufferLogger`: 単体・機能テスト向けのバッファ型モック
- `E2eMockLogger`: 並列テスト対応の ID 分離型モック
- `NullLogger`: 出力を発生させないサイレント実装

---

## 🖥️ ConsoleLogger

### ConsoleLogger の特徴

- `console.log` など主要 5 メソッドをログレベルへ自動マッピング
- `AG_LOGLEVEL` の全レベルをサポートし、`OFF` は `NullLogger` へフォールバック
- `AgLogger.setLoggerConfig({ defaultLogger: ConsoleLogger })` で自動的に `ConsoleLoggerMap` が適用

### ConsoleLogger の使用例

```typescript
import {
  AG_LOGLEVEL,
  AgLogger,
  ConsoleLogger,
  ConsoleLoggerMap,
} from '@aglabo/agla-logger-core';

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  loggerMap: ConsoleLoggerMap,
  logLevel: AG_LOGLEVEL.INFO,
});

logger.info('起動完了');
logger.error('致命的なエラー', new Error('fatal'));
```

### ConsoleLoggerMap

`ConsoleLoggerMap` はロガーレベルごとに `console` メソッドを割り当てた `Partial<AgLoggerMap>` です。
`AgLoggerConfig` が LOG/VERBOSE を含むレベル別ルーティングを行う際の推奨設定です。

---

## 🧪 AgMockBufferLogger (MockLogger.buffer)

### AgMockBufferLogger の特徴

- すべてのログレベルを内部 `Map<AgLogLevel, AgFormattedLogMessage[]>` に保存
- `getMessages`, `getLastMessage`, `getTotalMessageCount`, `hasAnyMessages` など豊富な検証 API
- `createLoggerMap()` により `AgLoggerConfig` と同じ戦略テーブルを提供
- `NullLogger` をフォールバックに利用しつつ、必要時は `bindLoggerMethods` が `fatal` などのメソッドを自動バインド
- `MockLogger.throwError(message)` で任意の例外発生ロガーも生成可能

### AgMockBufferLogger の使用例

```typescript
import { AG_LOGLEVEL, AgLogger, MockLogger } from '@aglabo/agla-logger-core';

const logger = AgLogger.createLogger({
  defaultLogger: new MockLogger.buffer().createLoggerFunction(),
});

logger.debug('Debug message');

const mock = new MockLogger.buffer();
mock.info('expected message');
expect(mock.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);
```

### AgMockBufferLogger のテストシナリオ例

- 単体テストでは `mock.getLastMessage()` で直近メッセージを検証する
- 統合テストでは `mock.getAllMessages()` を利用し HTTP 層やサービス層からの出力を確認する
- 異常系では `MockLogger.throwError('fail')` を差し込み例外経路を強制する

---

## 🧪 E2eMockLogger

### E2eMockLogger の特徴

- `startTest(testId?)` でテストごとに `AgMockBufferLogger` インスタンスを生成し、メッセージを分離
- `createTestId()` と `getNormalizedBasename()` を利用し、テストファイル名や CI 実行 ID から安定した識別子を生成
- `createLoggerFunction()` はフォーマット済みメッセージから `[LEVEL]` ラベルを解析して自動振り分け
- `createLoggerMap()` は全レベルに対してラップ関数を提供。並列実行時でもメッセージが混ざらない
- `getCurrentTestId`, `getLoggerFunction(level)`, `hasAnyMessages()` など運用監視用の API を提供

### E2eMockLogger の使用例

```typescript
import { AG_LOGLEVEL, AgLogger, E2eMockLogger } from '@aglabo/agla-logger-core';

const e2eLogger = new E2eMockLogger('checkout-flow');
e2eLogger.startTest();

const logger = AgLogger.createLogger({
  defaultLogger: e2eLogger.createLoggerFunction(),
  loggerMap: e2eLogger.createLoggerMap(),
  logLevel: AG_LOGLEVEL.INFO,
});

logger.info('[INFO] 決済APIレスポンス OK');

expect(e2eLogger.hasAnyMessages()).toBe(true);
e2eLogger.endTest(e2eLogger.getCurrentTestId() as string);
```

### E2eMockLogger の運用ヒント

- 並列テスト実行後は `endTest()` を呼び出しメモリを開放
- `parseLogLevelFromFormattedMessage()` が `[LEVEL]` ラベルを基準とするため、フォーマッターをカスタムする際はラベル付与を維持

---

## 🔕 NullLogger

### NullLogger の特徴

- `AgLoggerFunction` を満たす無操作実装
- ログ出力を抑制したい開発環境や特定レベルのミュートに最適
- `AgLoggerConfig` のデフォルト値として利用され、安全な初期状態を構成

### NullLogger の使用例

```typescript
import { AgLogger, NullLogger } from '@aglabo/agla-logger-core';

const logger = AgLogger.createLogger({
  defaultLogger: NullLogger,
});

logger.info('このメッセージは出力されません');
```

---

## ⚙️ カスタムロガー実装ガイド

1. `AgLoggerFunction` を実装する（シグネチャ: `(message: AgFormattedLogMessage) => void`）
2. 出力先をレベル単位で分岐させたい場合は `Partial<AgLoggerMap>` を用意し、`AgLogLevel` ごとの処理を定義する
3. `AgLogger.setLoggerConfig({ defaultLogger, loggerMap })` で登録
4. 例外処理には `AgLoggerError` を利用し、`ERROR_TYPES` と `AG_LOGGER_ERROR_MESSAGES` のカテゴリに従う

### 検証チェックリスト

- [ ] すべてのログレベルで `AgLogLevel` バリデーションを通過するか
- [ ] 例外発生時に `ErrorSeverity` と `TErrorType` を正しく指定しているか
- [ ] テストでは `AgMockBufferLogger` または `E2eMockLogger` で動作確認を行ったか

---

## 📚 関連情報

- [フォーマッタープラグイン API](02-plugin-formatters.md) - `E2eMockLogger` と組み合わせるフォーマッター仕様
- [ユーティリティ関数 API](05-utility-functions.md) - `createTestId` など補助関数
- [エラーハンドリング API](06-error-handling.md) - `AgLoggerError` と `ErrorSeverity` の詳細

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
