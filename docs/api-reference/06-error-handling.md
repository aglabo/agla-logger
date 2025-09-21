---
header:
  - src: 06-error-handling.md
  - @(#): Error Handling API
title: エラーハンドリング API
description: AglaError フレームワークと AgLoggerError の統合仕様
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

このページは **AglaError フレームワークと agla-logger の統合メカニズム**を解説します。
エラー分類、重大度管理、ログ出力との連携方法を体系化し、堅牢なロギング基盤を構築するための指針を提供します。

## 🎯 対象読者

- AglaError を活用した型安全な例外処理を実装したいアプリケーション開発者
- `AgLoggerError` のカテゴリ設計を理解し、エラーテンプレートを整備したいアーキテクト
- ログ出力とエラーセマンティクスを同期させたい SRE / QA チーム
- 既存コードで発生する `AgLoggerError` の扱い方を把握したいメンテナ

---

## 🧱 基本コンポーネント

### `AglaError` (packages/@aglabo/agla-error-core)

- すべてのエラークラスの基底。保持するプロパティは `message`・`code`・`severity`・`timestamp`・`context`・`cause`
- `toJSON()` でシリアライズ可能。監査ログや API レスポンスに直接利用できる形式を返却
- `chain(cause: Error)` で原因例外を連結し、`context` にスタック情報を保存
- `guardAglaErrorContext(value)` や `isValidAglaErrorContext(value)` で型安全なコンテキスト操作を提供

### `ErrorSeverity`

| 値        | 説明                       | 典型的なログレベル |
| --------- | -------------------------- | ------------------ |
| `FATAL`   | システム停止級の致命的障害 | `FATAL`            |
| `ERROR`   | 業務継続は可能だが異常     | `ERROR`            |
| `WARNING` | 注意を促す警戒レベル       | `WARN`             |
| `INFO`    | 状況確認や診断用の情報     | `INFO`             |

---

## 🚨 AgLoggerError

`AgLoggerError` は `AglaError` を拡張し、ロガー固有の `errorType` と `message` を統一フォーマットで扱います。

### コンストラクタ

```typescript
new AgLoggerError(
  severity: ErrorSeverity,
  errorType: TErrorType,
  message: string,
  context?: AglaErrorContext,
);
```

- `severity`: `ErrorSeverity` のいずれか。ログ側の閾値と揃えることが推奨
- `errorType`: `ERROR_TYPES` のキー（例: `VALIDATION` や `CONFIG` など）
- `message`: 人間が読める説明文
- `context`: 省略可能な追加情報。`AglaError` が JSON 化時に埋め込む

### 使用例

```typescript
import { ErrorSeverity } from '@aglabo/agla-error-core';
import { ERROR_TYPES } from '@aglabo/agla-logger-core/shared/constants/agErrorMessages';
import { AgLoggerError } from '@aglabo/agla-logger-core/shared/types';

throw new AgLoggerError(
  ErrorSeverity.ERROR,
  ERROR_TYPES.CONFIG,
  'formatter must be a valid function',
  { provided: 'null' },
);
```

---

## 🗂 エラーカテゴリとメッセージ

### `ERROR_TYPES`

- `VALIDATION`: ログレベルや引数の検証失敗 (`INVALID_LOG_LEVEL`, `NULL_CONFIGURATION` など)
- `CONFIG`: フォーマッターやロガーの設定エラー (`INVALID_FORMATTER`, `INVALID_DEFAULT_LOGGER`)
- `INITIALIZATION`: シングルトン未初期化・多重初期化 (`LOGGER_NOT_CREATED`, `LOGGER_ALREADY_CREATED`)
- `STATE`: ロガー内部状態の不整合 (`BUFFER_NOT_FOUND`)
- `RESOURCE`: バッファやメモリ資源の不足 (`BUFFER_OVERFLOW`)

### `AG_LOGGER_ERROR_MESSAGES`

- 各カテゴリ配下の定型メッセージを提供
- `AgLogger`, `AgLoggerManager`, `AgManagerUtils`, `MockLogger` など全レイヤーで共有
- カスタムメッセージ追加時は `TMessageId` が型安全性を担保

### 型サポート

- `TErrorType`: `ERROR_TYPES` のキー型
- `TMessageId`: 全メッセージキーの集合。定義済み以外を使うと TypeScript が警告

---

## 🔄 ログシステムとの連携

### `AgLogger`

- `createLogger()`／`getLogger()` が `INITIALIZATION` カテゴリのエラーを発生
- `setLoggerConfig()` は `VALIDATION`／`CONFIG` エラーを使い分け、詳細な文脈を提供
- ログレベル設定時に `isStandardLogLevel` が `SPECIAL_LOG_LEVEL_NOT_ALLOWED` を利用

### `AgLoggerManager`

- シングルトン管理 (`createManager`, `getManager`, `setLogger`) で `ErrorSeverity.FATAL` を採用
- ロガー未初期化の状態は即時に検出し、アプリケーション起動時に問題を可視化

### `AgManagerUtils`

- `getLogger()` が内部で `AgLoggerManager.getManager()` を呼び出し、すべての例外を `AgLoggerError` へ変換
- 呼び出し側は `try/catch` で `severity` や `code` を参照しログレベルに応じた処理分岐が可能

### ログ出力とのマッピング

| ErrorSeverity | 推奨ログレベル | 備考                                                    |
| ------------- | -------------- | ------------------------------------------------------- |
| `FATAL`       | `FATAL`        | 即時アラート対象。`AgLogger` では例外発生と同時に throw |
| `ERROR`       | `ERROR`        | 運用監視のトリガー。再試行可否をメッセージで明示        |
| `WARNING`     | `WARN`         | 自動復旧可能。定常監視ダッシュボードの対象              |
| `INFO`        | `INFO`         | 事象ログ。`AgLogger` 側で `verbose` と組み合わせる      |

---

## 🧪 検証テクニック

- `AgLoggerError` を `instanceof` で判定し、`severity` に応じた `AgLogger` メソッドへ委譲
- `error.toJSON()` をスナップショットテストに利用し、メッセージ変更が検出できるようにする
- `AglaError.guardAglaErrorContext(value)` で外部入力から来るコンテキストを防御
- `AglaError.chain(cause)` でエラー連鎖を明示し、デバッグ時に元例外を追跡

```typescript
try {
  getLogger().setLoggerConfig({ defaultLogger: undefined as unknown as Function });
} catch (error) {
  if (error instanceof AgLoggerError) {
    logger.error('Logger configuration error', error.toJSON());
    if (error.severity === ErrorSeverity.FATAL) {
      process.exit(1);
    }
  }
}
```

---

## ✅ 実装チェックリスト

- [ ] 新しいエラーカテゴリを定義するときは `ERROR_TYPES` と `AG_LOGGER_ERROR_MESSAGES` をセットで更新したか
- [ ] 例外送出時に `ErrorSeverity` と `TErrorType` を必ず指定したか
- [ ] 外部公開 API では `toJSON()` を使って機密情報を含まない形式で返却しているか
- [ ] テストで `guardAglaErrorContext` を通し、意図しない形のコンテキストを検出しているか

---

## 📚 関連情報

- [コアクラス API](01-core-api.md) - `AgLogger` と `AgLoggerManager` がエラーをどのように発生させるか
- [ロガープラグイン API](03-plugin-loggers.md) - モックロガー内でのエラー管理
- [ユーティリティ関数 API](05-utility-functions.md) - `validateLogLevel` などエラー送出ユーティリティ

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
