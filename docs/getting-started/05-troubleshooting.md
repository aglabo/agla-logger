---
header:
  - src: 05-troubleshooting.md
  - @(#): Troubleshooting Guide
title: `agla-logger`
description: よくあるエラーと対処法、tsconfig設定の注意点
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

## トラブルシューティング

このページでは、`agla-logger` を使用する際によく発生する問題とその解決方法を説明します。

---

## よくあるエラーと対処法

<!-- markdownlint-disable no-duplicate-heading -->

### 1. ログが出力されない

#### 問題: ロガーを作成したがログが表示されない

基本的なロガーを作成したが、期待されるログメッセージが一切出力されない。

```typescript
import { AgLogger } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger();
logger.info('このメッセージが表示されません');
```

#### 原因と解決法

**原因**: `agla-logger` はデフォルトで以下の 3つの安全設定を使用し、ログを出力しない。

1. `NullLogger` (出力先なし)
2. `NullFormatter` (フォーマッターなし)
3. `logLevel = AG_LOGLEVEL.OFF` (=0: 出力なし)

**解決法**: 明示的にロガー、フォーマッター、ログレベルを設定する。

```typescript
import {
  AG_LOGLEVEL,
  AgLogger,
  ConsoleLogger,
  PlainFormatter,
} from '@aglabo/agla-logger';

// ✅ 正しい設定 (3つの設定すべてを明示的に指定)
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO, // ログレベルを有効に設定
  defaultLogger: ConsoleLogger, // 明示的な出力先
  formatter: PlainFormatter, // 明示的なフォーマッター
});

logger.info('このメッセージは表示されます');
```

### 2. ログレベルフィルタリングの問題

#### 問題: DEBUG ログが表示されない

ログレベル設定により、ログが意図せず非表示になってしまう。

```typescript
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.INFO, // INFO レベル設定
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});

logger.debug('このデバッグメッセージが表示されません');
```

#### 原因

`loglevel` が表示したいログ未満のレベル。

#### 解決法

`loglevel` を適切に設定する。

```typescript
// ✅ DEBUG レベル以上を表示する場合
const logger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.DEBUG, // DEBUG レベルに変更
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});

logger.debug('このデバッグメッセージは表示されます');
```

#### ログレベル階層の確認

```text
OFF (0) → FATAL (1) → ERROR (2) → WARN (3) → INFO (4) → DEBUG (5) → TRACE (6)
   ↑                                   ↑                            ↑
出力なし                            一般的な設定                  最も詳細
```

### 3. TypeScript 型エラー

#### 問題: `Cannot find module` エラー

```typescript
error TS2307: Cannot find module '@aglabo/agla-logger' or its corresponding type declarations.
```

#### 解決法

1. パッケージのインストール確認:

   ```bash
   npm list @aglabo/agla-logger
   ```

2. node_modules の再インストール:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. TypeScript 設定の確認: `tsconfig.json` で `moduleResolution` を適切に設定

   ```json
   {
     "compilerOptions": {
       "moduleResolution": "bundler" // または "node"
     }
   }
   ```

### 4. ESM/CommonJS 互換性の問題

#### 問題: `require()` で読み込めない

ESM 形式のパッケージを CommonJS 形式で読み込もうとした際に発生するモジュール解決エラー。

```javascript
// ❌ ESM パッケージを CommonJS で読み込むとエラー
const { AgLogger } = require('@aglabo/agla-logger');
```

#### 解決法

方法 1: ESM 形式を使用 (推奨):

```javascript
// package.json に "type": "module" を追加
import { AgLogger } from '@aglabo/agla-logger';
```

方法 2: CommonJS ビルドを使用:

```javascript
// CommonJS でも利用可能(デュアルビルド対応)
const { AgLogger } = require('@aglabo/agla-logger');
```

方法 3: 動的インポート:

```javascript
async function createLogger() {
  const { AgLogger } = await import('@aglabo/agla-logger');
  return AgLogger.createLogger();
}
```

---

## TypeScript 設定の注意点

### 推奨 tsconfig.json 設定

agla-logger を使用する際に推奨される TypeScript 設定です。モジュール解決と ESM 互換性を最適化します。

```json
{
  "compilerOptions": {
    // ES モジュール関連
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",

    // 互換性
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    // 型チェック
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,

    // パフォーマンス
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Node.js 環境での設定

Node.js 環境特有の型定義とモジュール解決設定です。サーバーサイド開発で推奨される構成です。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "types": ["node"]
  }
}
```

### Webpack/Vite 使用時の設定

モダンビルドツールと組み合わせた際の最適化設定です。バンドルサイズの最小化とビルドパフォーマンスの向上を図ります。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

---

## パフォーマンスの問題

### 1. ログ出力が遅い

#### 問題: 大量のログ出力でアプリケーションが重くなる

#### 解決法

方法 1: ログレベルを適切に設定する。

```typescript
// 本番環境では不要なログを除外
const logger = AgLogger.createLogger({
  logLevel: process.env.NODE_ENV === 'production'
    ? AG_LOGLEVEL.WARN // 本番: 警告以上のみ
    : AG_LOGLEVEL.DEBUG, // 開発: デバッグレベルまで
});
```

方法 2: 条件付きでログを出力する。

動作が重いログを出力する場合、ログ出力必要が無ければロガーを呼ばないようにする。

```typescript
// 重い処理を条件分岐で回避
if (logger.shouldOutput(AG_LOGLEVEL.DEBUG)) {
  logger.debug('重い処理の結果: ' + expensiveOperation());
}
```

方法 3: 非同期でログを出力する。

```typescript
import { AgLogger, MockLogger } from '@aglabo/agla-logger';

// メモリバッファリング + 非同期出力
const logger = AgLogger.createLogger({
  defaultLogger: MockLogger.buffer,
});

const mockLogger = logger.getDefaultLogger();

// 定期的にバッチ処理
setInterval(() => {
  const logs = mockLogger.getAllMessages();
  const allLogMessages = Object.values(logs).flat();
  if (allLogMessages.length > 0) {
    console.log(allLogMessages.join('\n'));
    mockLogger.clearAllMessages();
  }
}, 1000);
```

### 2. メモリリークの問題

#### 問題: MockLogger でログが蓄積し続ける

MockLogger を使用した際に、ログがメモリ内で無制限に蓄積され、メモリリークを引き起こすコード。

```typescript
// ❌ ログが無制限に蓄積される
const logger = AgLogger.createLogger({
  defaultLogger: new MockLogger(),
});

// 大量のログ出力
for (let i = 0; i < 10000; i++) {
  logger.info(`Log ${i}`);
}
```

#### 解決法

```typescript
// ✅ 定期的にログをクリア
const mockLogger = new MockLogger();
const logger = AgLogger.createLogger({
  defaultLogger: mockLogger,
});

// 定期クリア
setInterval(() => {
  mockLogger.clearLogs();
}, 60000); // 1分ごと

// または手動クリア
function processLogs() {
  const logs = mockLogger.getLogs();
  // ログ処理
  mockLogger.clearLogs(); // 処理後にクリア
}
```

---

## テスト環境での問題

### 1. テスト間でログが混在する

#### 問題: 複数のテストでログ状態が共有される

AgLogger のシングルトンパターンにより、テスト間でロガーインスタンスが共有され、意図しない影響が発生する問題例です。

```typescript
// ❌ シングルトンのため状態が残る
describe('Test 1', () => {
  it('should log message', () => {
    const logger = AgLogger.createLogger();
    logger.info('Test 1 message');
  });
});

describe('Test 2', () => {
  it('should have clean logger', () => {
    const logger = AgLogger.createLogger(); // 同じインスタンス
    // Test 1 の状態が残っている
  });
});
```

#### 解決法

テスト実行前に、`AgLogger` のシングルトンをリセットする。

```typescript
import { AgLoggerManager } from '@aglabo/agla-logger';

describe('Test with clean logger', () => {
  beforeEach(() => {
    // ✅ 各テスト前にシングルトンをリセット
    AgLoggerManager.resetSingleton();
  });

  it('should have fresh logger instance', () => {
    const logger = AgLogger.createLogger({ // リセットされているので、新規ロガーを作成できる
      defaultLogger: new MockLogger(),
    });
    // クリーンな状態からスタート
  });
});
```

### 2. テスト出力でのログノイズ

#### 問題: テスト実行時にログが大量出力される

#### 解決法

```typescript
// テスト用の静かなロガー設定
import { NullLogger, PlainFormatter } from '@aglabo/agla-logger';

const testLogger = AgLogger.createLogger({
  logLevel: AG_LOGLEVEL.FATAL, // 致命的エラーのみ
  defaultLogger: NullLogger, // または出力を無効化
  formatter: PlainFormatter,
});
```

---

## 環境固有の問題

### Browser 環境

#### 問題: ブラウザで `process` が未定義

```typescript
// ❌ Node.js 固有のオブジェクトを使用
const logger = AgLogger.createLogger({
  logLevel: process.env.NODE_ENV === 'production'
    ? AG_LOGLEVEL.WARN
    : AG_LOGLEVEL.DEBUG,
});
```

#### 解決法

```typescript
// ✅ ブラウザ互換性を考慮
const logger = AgLogger.createLogger({
  logLevel: (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production')
    ? AG_LOGLEVEL.WARN
    : AG_LOGLEVEL.DEBUG,
});
```

### Deno 環境

#### 問題: インポートパスの問題

```typescript
// ❌ Node.js スタイルのインポート
import { AgLogger } from '@aglabo/agla-logger';
```

#### 解決法

```typescript
// ✅ Deno でのインポート(npm: プレフィックス)
import { AgLogger } from 'npm:@aglabo/agla-logger';
```

---

## デバッグのヒント

### 1. ロガー設定の確認

現在のロガーに設定されているログレベル、フォーマッター、出力先を確認するデバッグ用コードです。

```typescript
const logger = AgLogger.createLogger();

console.log('Current log level:', logger.logLevel);
console.log('Current formatter:', logger.getFormatter().name);
console.log('Current logger:', logger.getDefaultLogger().constructor.name);
```

### 2. ログレベルテスト

各ログレベルが期待通りに動作しているかを確認するテスト関数です。フィルタリングの動作を視覚的に検証できます。

```typescript
function testLogLevels() {
  const logger = AgLogger.createLogger({
    logLevel: AG_LOGLEVEL.INFO,
    defaultLogger: ConsoleLogger,
    formatter: PlainFormatter,
  });

  console.log('Testing log levels (from highest to lowest priority):');
  logger.fatal('FATAL - Should appear (Highest priority)');
  logger.error('ERROR - Should appear');
  logger.warn('WARN - Should appear');
  logger.info('INFO - Should appear');
  logger.debug('DEBUG - Should not appear');
  logger.verbose('VERBOSE - Should not appear');
  logger.trace('TRACE - Should not appear (Lowest priority)');
}
```

### 3. MockLogger での検証

MockLogger を使用してログ出力を詳細に検証する方法です。テスト環境でのログ動作確認や問題の特定に有効です。

```typescript
import { AG_LOGLEVEL, AgLogger, MockLogger } from '@aglabo/agla-logger';

const logger = AgLogger.createLogger({
  defaultLogger: MockLogger.buffer,
});

logger.info('Test message');
logger.error('Error message');
logger.warn('Warning message');

// MockLoggerインスタンスを取得
const mockLogger = logger.getDefaultLogger();

// レベル別ログの取得
const infoLogs = mockLogger.getMessages(AG_LOGLEVEL.INFO);
const errorLogs = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
const allLogs = mockLogger.getAllMessages();

console.log('INFO logs:', infoLogs);
console.log('ERROR logs:', errorLogs);
console.log('All logs:', allLogs);

// ログ数の確認
console.log('Total log count:', mockLogger.getTotalMessageCount());
console.log('INFO count:', mockLogger.getMessageCount(AG_LOGLEVEL.INFO));

// 最新メッセージの取得
console.log('Last INFO message:', mockLogger.getLastMessage(AG_LOGLEVEL.INFO));

// ログの存在確認
console.log('Has ERROR logs:', mockLogger.hasMessages(AG_LOGLEVEL.ERROR));
console.log('Has any logs:', mockLogger.hasAnyMessages());
```

---

## サポートとコミュニティ

問題が解決しない場合は、以下のリソースを活用してください:

### ドキュメント

- [基本的な使い方](../basic-usage/) - 詳細な API 使用方法
- [ユーザーガイド](../user-guides/) - 実践的な使用例
- [APIリファレンス](../api-reference/) - 完全な API 仕様

### 開発者情報

- リポジトリ: [GitHub](https://github.com/atsushifx/`agla-logger`)
- 作者: atsushifx
- ライセンス: MIT License

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
