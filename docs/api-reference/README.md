---
header:
  - src: README.md
  - @(#): API Reference
title: agla-logger
description: agla-logger の完全なAPI技術仕様書とリファレンス
version: 1.0.0
created: 2025-09-21
authors:
  - atsushifx
changes:
  - 2025-09-21: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## API Reference

このリファレンスは **agla-logger の完全なAPI技術仕様書**です。
すべてのエクスポート API、型定義、プラグインインターフェースの詳細仕様を提供します。

### 対象読者

- agla-logger の詳細な仕様を知りたい開発者
- カスタムプラグインを開発したい開発者
- 内部アーキテクチャを理解したい開発者
- TypeScript 型情報を詳しく確認したい開発者

### パッケージ構成

#### @aglabo/agla-logger-core

メインロガーパッケージ - 構造化ログ出力とプラグインシステム。

#### @aglabo/agla-error-core

エラーハンドリングフレームワーク - AglaError システム。

### 目次

<!-- markdownlint-disable ol-prefix -->

#### 📋 コアAPI

1. [コアクラス API](01-core-api.md)

##### AgLogger クラス

メインロガー (26 メソッド + 2 プロパティ)

- ログ出力メソッド群: `info()`, `error()`, `debug()` 等
- 設定メソッド: `setLogLevel()`, `setFormatter()` 等
- 状態管理: `getLogLevel()`, `isVerbose()` 等
- プロパティ: `logLevel`, `verbose` (getter/setter アクセス)

##### AgLoggerManager クラス

シングルトン管理 (9 メソッド)

- インスタンス管理: `createManager()`, `getManager()`
- 設定委譲: `setLoggerConfig()`, `bindLoggerFunction()`

##### AgLoggerConfig クラス

内部設定管理 (20 メソッド + 4 プロパティ)

- フォーマッター管理: `setFormatter()`, `getFormatter()`
- ロガー管理: `setLoggerFunction()`, `getLoggerFunction()`
- プロパティ: `formatter`, `logLevel`, `defaultLogger`, `verbose` (getter/setter アクセス)

#### 🔌 プラグインシステムAPI

2. [フォーマッタープラグイン API](02-plugin-formatters.md)

##### JsonFormatter

JSON 形式構造化出力。

##### PlainFormatter

人間可読プレーンテキスト。

##### MockFormatter

テスト用フォーマッター (8 プリセット/メソッド)

- プリセット集: `json`, `passthrough`, `messageOnly`, `timestamped`
- カスタム作成: `withRoutine`, `prefixed()`, `returnValue()`
- エラーテスト: `errorThrow`

##### NullFormatter

出力無効化。

##### AgMockFormatter

統計追跡付き Mock。

3. [ロガープラグイン API](03-plugin-loggers.md)

##### ConsoleLogger

コンソール出力 (console.log/error/warn)

##### MockLogger

テスト用ログ収集。

- `buffer()` - バッファ型ロガー
- メッセージ管理: `getMessages()`, `getLastMessage()` 等

##### E2eMockLogger

E2E テスト用 Mock、並列対応。

- テスト分離: `startTest()`, `endTest()`
- ID 管理による完全分離

##### NullLogger

出力無効化。

#### 📊 型定義・ユーティリティAPI

4. [型定義・定数 API](04-type-definitions.md)

##### AG_LOGLEVEL

ログレベル定数。

- `TRACE(0)` → `DEBUG(1)` → `VERBOSE(2)` → `INFO(3)` → `WARN(4)` → `ERROR(5)` → `FATAL(6)`

##### AgLogLevel

ログレベル型 (number 型)

##### AgLogLevelLabel

ログレベルラベル型 (string 型)

##### AgLogMessage

ログメッセージ構造体。

##### AgLoggerOptions

設定オプション型。

##### Plugin Interfaces

プラグイン実装型。

5. [ユーティリティ関数 API](05-utility-functions.md)

##### AgManagerUtils

マネージャー便利関数 (3 関数 + 1 変数)

- `createManager()` - マネージャー作成ヘルパー
- `getLogger()` - ロガー取得ヘルパー (エラーハンドリング付き)
- `setupManager()` - 自動初期化・フック設定
- `AgManager` - グローバルマネージャー変数 (AgLoggerManager | undefined)

##### AgLoggerGetMessage

メッセージ取得ユーティリティ。

##### createTestId

テスト ID 生成関数。

#### 🚨 エラーハンドリング・高度なAPI

6. [エラーハンドリング API](06-error-handling.md)

##### AglaError システム

(@aglabo/agla-error-core)

- エラー分類・重要度システム
- ログ出力との統合仕様
- 構造化エラー情報

7. [高度なAPI活用](07-advanced-usage.md)

##### カスタムプラグイン実装ガイド

- Strategy Pattern 実装詳細
- プラグインインターフェース仕様

##### 内部アーキテクチャー API

データフロー詳細。

- パフォーマンス最適化 API

##### アドバンスト設定

- 複雑な設定パターン
- メモリ管理・リソース管理

<!-- markdownlint-enable -->

### API分類ガイド

#### 使用頻度別

- 高頻度利用 - コアクラス API (AgLogger, AgLoggerManager)
- 中頻度利用 - プラグイン API (JsonFormatter, ConsoleLogger)
- 低頻度利用 - ユーティリティ・型定義 API
- 開発時専用 - エラーハンドリング・高度な API

#### 開発段階別

- 導入・基本実装 - 記事 01, 04
- カスタマイズ - 記事 02, 03, 05
- テスト実装 - 記事 02, 03 (Mock 系)
- プラグイン開発 - 記事 07
- トラブルシューティング - 記事 06, 07

### 他ドキュメントとの関係

#### 学習フロー

1. [Getting Started](../getting-started/) - 初回セットアップ
2. [Basic Usage](../basic-usage/) - 基本的な使い方 (6 記事)
3. [User Guides](../user-guides/) - 実践的な活用 (7 記事)
4. API Reference - 詳細な技術仕様 ←ここ

#### 参照パターン

- 実装中の詳細確認 - API Reference でメソッド仕様確認
- カスタマイズ - User Guides で手順 → API Reference で詳細
- トラブルシューティング - Basic Usage で基本確認 → API Reference で仕様確認

### API Reference の使い方

#### 効率的な検索方法

1. 目的別: 目次の分類から該当記事を選択
2. クラス別: 01-03 記事でクラス・プラグイン別に検索
3. 型別: 04 記事で型定義・インターフェース確認
4. 問題解決: 06-07 記事で高度な問題解決

#### TypeScript 開発者向け

- 型情報 - 04 記事で完全な型定義
- インターフェース - 02-03 記事でプラグインインターフェース
- カスタム実装 - 07 記事で実装パターン

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
