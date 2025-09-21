---
header:
  - src: 05-utility-functions.md
  - @(#): Utility Functions API
title: ユーティリティ関数 API
description: AgLogger 補助ユーティリティとテスト支援関数の詳細仕様
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

このページは **agla-logger の補助ユーティリティ群**を整理したリファレンスです。
マネージャー初期化、メッセージ整形、入力バリデーション、テスト ID 生成など、
プロダクションとテスト双方で利用するファンクションを網羅します。

## 🎯 対象読者

- `AgLoggerManager` を安全に初期化したい開発者
- ログ引数から構造化メッセージを生成したい実装者
- フォーマッター検証やログレベル検証を自動化したい QA エンジニア
- 並列テストの識別子管理を整備したいテストリード

---

## ⚙️ AgManagerUtils

`AgManagerUtils.ts` は `AgLoggerManager` のライフサイクル制御を簡素化するラッパーです。

### `AgManager`

- `AgLoggerManager | undefined` を保持する一元管理用の `let`
- `setupManager()` 実行後は `createManager`/`resetSingleton` にフックし常に最新インスタンスを保持

### `createManager(options?: AgLoggerOptions): AgLoggerManager`

- `AgLoggerManager.createManager` を呼び出しながら `AgManager` を即座に差し替え
- `options` には `defaultLogger`・`formatter`・`loggerMap`・`logLevel`・`verbose` を指定可能

### `getLogger(): AgLogger`

- 既存マネージャーがない場合は `AgLoggerManager.getManager()` を試行
- どちらも失敗した場合は `AgLoggerError`(Severity: `FATAL`, Type: `INITIALIZATION`) を送出

### `setupManager(): void`

- `AgLoggerManager.createManager` と `resetSingleton` をデコレータ化し、`AgManager` を自動メンテナンス
- テストで `resetSingleton()` を多用する場合に必須。グローバル状態が常に同期

#### 使用例

```typescript
import { createManager, getLogger, setupManager } from '@aglabo/agla-logger-core/AgManagerUtils';

setupManager();
createManager({ verbose: true });

const logger = getLogger();
logger.info('AgManagerUtils 初期化完了');
```

---

## 📨 メッセージ変換ユーティリティ

`AgLoggerGetMessage` とヘルパーはログ引数を構造化するための中心的コンポーネントです。

### `AgLoggerGetMessage(level, ...args): AgLogMessage`

- `parseArgsToAgLogMessage` の結果を `AgLogMessage` へ再構成
- 戻り値は `{ logLevel, timestamp, message, args }`
- 文字列引数はスペース区切りで結合し、複雑オブジェクトは `args` 配列に保持

```typescript
import { AG_LOGLEVEL, AgLoggerGetMessage } from '@aglabo/agla-logger-core';

const structured = AgLoggerGetMessage(AG_LOGLEVEL.INFO, 'ユーザー', 42, { status: 'ok' });
// structured.message === 'ユーザー 42'
```

### `AgLogHelpers`

- `AgToLabel(level)` / `AgToLogLevel(label)` でラベル⇔数値変換
- `extractMessage(args)` でプリミティブ引数のみ抽出しメッセージ化
- `argsToString(args)` と `valueToString(value)` はフォーマッター内での安全な文字列化に利用
- `createLoggerFunction(moduleFunc)` でモジュール関数を `AgLoggerFunction` に適合

### `AgLoggerMethod`

- `bindLoggerMethods(instance)` が `fatal`, `error`, `warn` などのメソッドに `this` をバインド
- `AgMockBufferLogger` や独自クラスが `AgLoggerMethodsInterface` を満たすよう自動整備

---

## 🔍 バリデーションユーティリティ

`AgLogValidators.ts` は入力値の健全性と例外メッセージを集約します。

### `isValidLogLevel(value): value is AgLogLevel`

- 数値型・有限・整数・`AG_LOGLEVEL` に含まれることをすべて確認
- フォールバック動作を決める前の軽量チェックに最適

### `validateLogLevel(value): AgLogLevel`

- `isValidLogLevel` が失敗した場合に詳細な `AgLoggerError` を発生
- `undefined` や `null`、型不一致や非整数、範囲外の入力でメッセージが変化

### `isValidFormatter` / `validateFormatter`

- カスタムフォーマッターが `function` であるか判定。`CONFIG.INVALID_FORMATTER` を使用

### `isValidLogger` / `validateLogger`

- ロガー関数の存在と型を検証。`CONFIG.INVALID_LOGGER` を使用

### `isStandardLogLevel(level)`

- `OFF`〜`TRACE` の範囲のみを許可し、`VERBOSE` や `LOG` といった特殊レベルを除外

### `isAgMockConstructor(value)`

- モックフォーマッター判定用のマーカー `__isMockConstructor` をチェック
- 統計付きフォーマッターの初期化前検証に利用

---

## 🧪 テスト ID ユーティリティ

`testIdUtils.ts` は並列テストやリモート実行を前提に、衝突しない識別子を生成します。

### `getNormalizedBasename(identifier)`

- パスや拡張子を含む文字列から小文字のベース名のみを抽出
- CI パスを与えても一定の prefix を得られるため、ログ分離に活用

### `getUniqString(length = 8)`

- `crypto.randomUUID()` を基に 1〜32 文字の小文字英数字を生成
- 長さ 0 以下は既定値 8、32 超は 32 に正規化

### `createTestId(identifier = 'test', length = 8)`

- `{normalizedIdentifier}-{timestamp}-{uniq}` 形式の ID を生成
- `E2eMockLogger` のデフォルト識別子として利用。任意長でカスタマイズ可能

```typescript
import { createTestId } from '@aglabo/agla-logger-core/utils/testIdUtils';

const testId = createTestId('CheckoutFlow', 12);
// 例: "checkoutflow-1737529200000-1a2b3c4d5e6f"
```

---

## ✅ 導入チェックリスト

- [ ] `setupManager()` でマネージャーと `AgManager` を同期したか
- [ ] フォーマッター差し替え前に `validateFormatter` を通したか
- [ ] `E2eMockLogger` 併用時は `createTestId` で一意な識別子を生成したか
- [ ] カスタムロガーに `bindLoggerMethods` を適用して `this` を固定したか

---

## 📚 関連情報

- [コアクラス API](01-core-api.md) - `AgLogger` と `AgLoggerManager` の公開メソッド
- [ロガープラグイン API](03-plugin-loggers.md) - ユーティリティと組み合わせる出力層
- [高度なAPI活用](07-advanced-usage.md) - カスタム実装の戦略とベストプラクティス

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
