---
header:
  - src: 07-advanced-usage.md
  - @(#): Advanced API Usage
title: 高度なAPI活用
description: AgLogger 拡張開発のための高度な設計・運用ガイド
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

このページは **agla-logger を拡張運用するための実践的なパターン集**です。
カスタムプラグイン開発、内部構造の理解、パフォーマンス最適化、複雑な設定レシピを一括で参照できます。

## 🎯 対象読者

- 既存の API を基にカスタムフォーマッター・ロガーを実装したいアーキテクト
- 本番環境での性能チューニングやログ制御を担当する SRE
- 並列テストや A/B テレメトリなど高度なユースケースに agla-logger を適用したい開発者
- プラグイン間の依存関係やデータフローを把握したいモノレポメンテナ

---

## 🧭 ログパイプラインの全体像

1. **エントリポイント**: `AgLogger.method` (`info`, `error`, `trace` など) が呼ばれる
2. **メッセージ整形**: `AgLoggerGetMessage` が `AgLogMessage` に正規化
3. **フォーマッター層**: `AgLoggerConfig.formatter` が `AgFormatFunction` または `AgMockConstructor` を実行
4. **ロガー選択**: `AgLoggerConfig.getLoggerFunction(level)` が `loggerMap` から戦略を決定
5. **出力実行**: `AgLoggerConfig.defaultLogger` もしくはレベル別ロガーが実際の I/O を担当
6. **統計取得 (任意)**: `AgLogger.hasStatsFormatter()` が真なら `getStatsFormatter()` でフォーマッター統計を取得

> **Tip:** `setLoggerConfig({ defaultLogger: ConsoleLogger })` を呼び出すと自動で `ConsoleLoggerMap` が補完され、STEP4 が最適化されます。

---

## 🏗 カスタムプラグイン実装ガイド

### 1. フォーマッターを設計する

- 実装パターン: `AgFormatFunction`（純関数）または `AgMockConstructor`（ステートフル）
- `AgMockFormatter` を継承またはインスタンス化すれば `getStats()` と `reset()` を活用可能
- 構造化 JSON 例:

```typescript
import type { AgFormatFunction } from '@aglabo/agla-logger-core';
import { AgToLabel } from '@aglabo/agla-logger-core/utils/AgLogHelpers';

export const JsonFormatter: AgFormatFunction = (log) =>
  JSON.stringify({
    timestamp: log.timestamp ?? new Date().toISOString(),
    level: AgToLabel(log.logLevel),
    message: log.message,
    args: log.args,
  });
```

### 2. ロガーを実装する

- `AgLoggerFunction` を実装し、必要であれば `Partial<AgLoggerMap>` を提供
- `bindLoggerMethods` を利用すると、クラスメソッドに自動で `this` がバインドされる
- 例: ElasticSearch 送信用ロガー

```typescript
import type { AgLoggerFunction } from '@aglabo/agla-logger-core';
import { AG_LOGLEVEL } from '@aglabo/agla-logger-core';

export const ElasticLogger: AgLoggerFunction = async (formatted) => {
  await sendToElastic(formatted);
};

export const ElasticLoggerMap = {
  [AG_LOGLEVEL.ERROR]: ElasticLogger,
  [AG_LOGLEVEL.FATAL]: ElasticLogger,
};
```

### 3. 設定へ組み込む

```typescript
AgLogger.createLogger({
  formatter: new AgMockFormatter((log) => `[${log.logLevel}] ${log.message}`),
  defaultLogger: ElasticLogger,
  loggerMap: {
    ...ElasticLoggerMap,
    [AG_LOGLEVEL.INFO]: ConsoleLogger,
  },
  logLevel: AG_LOGLEVEL.INFO,
  verbose: false,
});
```

---

## 📈 パフォーマンス最適化と監視

- ログレベルゲートでは `AgLoggerConfig.logLevel` をデフォルトの `OFF` から必要なレベルへ引き上げてから稼働させる
- Verbose モードは `isVerbose`/`setVerbose` を利用し、開発時のみ詳細出力を有効化する
- 遅延初期化では `setLoggerFunction` を活用し、必要なレベルだけロガー関数を割り当て、未使用レベルは `NullLogger` にフォールバックさせる
- フォーマッター統計は `AgLogger.hasStatsFormatter()` と `getStatsFormatter()` を組み合わせて活用する。収集した `callCount` や `lastMessage` を監視基盤へ送信する
- バッチ出力はカスタムロガー内でキューを構築し、`flush()` 時にまとめてストリームへ書き出す
- エラー優先度制御では `ErrorSeverity` をログ閾値へマッピングし、`FATAL` のみ同期送信するなどの制御を実施する

---

## 🧰 高度な設定レシピ

### マルチシンク構成（例: Console + ファイル）

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, ConsoleLoggerMap } from '@aglabo/agla-logger-core';

const fileLogger: AgLoggerFunction = (formatted) => fileTransport.write(formatted + '\n');

AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  loggerMap: {
    ...ConsoleLoggerMap,
    [AG_LOGLEVEL.INFO]: (message) => {
      ConsoleLogger(message);
      fileLogger(message);
    },
  },
});
```

### 依存性注入とテスト切り替え

- `AgLoggerManager.setLogger(customLogger)` で DI コンテナからインスタンス注入
- `AgManagerUtils.setupManager()` をテストセットアップで呼び、`createManager()` → `resetSingleton()` の副作用を自動管理
- `MockLogger` と `E2eMockLogger` を環境変数で切り替えることで、同一コードパスを維持しながら検証が可能

### 特殊フォーマットの扱い

- `AgLogHelpers.AgToLabel` と `AgToLogLevel` でラベル↔数値変換を統一
- フォーマッターを `AgMockConstructor` として渡すと `isAgMockConstructor` が検出し、自動で統計インスタンス化
- `createLoggerMap()` に特殊レベル `VERBOSE`, `LOG`, `DEFAULT` を含めると `AgLoggerConfig` が安全にフォールバック

---

## 🧪 運用・テスト戦略

- Contract テストではプラグインを単体テストする際に `AgMockBufferLogger` を使い、期待するメッセージがバッファへ蓄積されるか確認する
- E2E 分離では `E2eMockLogger` の `startTest()`/`endTest()` を CI の `beforeAll`/`afterAll` に対応付け、並列ジョブでのメッセージ混在を防止する
- エラーパス確認では `validateFormatter` や `validateLogLevel` を意図的に失敗させ、`AgLoggerError` のメッセージ変更がないかスナップショットで検証する
- メトリクス連携では `getStatsFormatter()` の結果をメトリクスバックエンドへ送信し、フォーマッター負荷やメッセージサイズを可視化する

---

## ✅ 導入チェックリスト

- [ ] フォーマッターは `AgFormatFunction` もしくは `AgMockConstructor` を満たしているか
- [ ] `loggerMap` に未定義レベルがある場合のフォールバックを確認したか
- [ ] `setupManager()` を通じてテスト／本番のマネージャー状態を同期させたか
- [ ] `ErrorSeverity` とログ出力ポリシーの対応表を運用チームと共有したか

---

## 📚 関連情報

- [フォーマッタープラグイン API](02-plugin-formatters.md) - 標準フォーマッターとモックの仕様
- [ロガープラグイン API](03-plugin-loggers.md) - ログ出力戦略の詳細
- [ユーティリティ関数 API](05-utility-functions.md) - カスタムプラグインで再利用するヘルパー
- [エラーハンドリング API](06-error-handling.md) - `AgLoggerError` と `ErrorSeverity` のマッピング

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
