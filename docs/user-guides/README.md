---
header:
  - src: README.md
  - @(#): User Guides
title: agla-logger
description: agla-logger の実践的な使い方とシナリオベースの活用ガイド
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

## User Guides

このガイドは **agla-logger の実践的な使い方**をシナリオベースで解説します。
導入済みの開発者が、実際のプロジェクトで agla-logger を効果的に活用するための実用的なリファレンスです。

### 必要要件

- Node.js: v20 以上 (ESM サポートのため)
- ランタイム対応:
  - Node.js: 完全対応 (v20+)
  - Deno: 対応済み (ESM-first 設計)
  - Bun: 対応済み (高速ビルド)
- パッケージマネージャ:
  - pnpm 推奨 (プロジェクト標準)
  - npm/yarn 対応済み
- TypeScript: v5.0 以上推奨

### ガイドの特徴

- シナリオベース: 実際の利用場面に焦点を当てた構成
- 実用性重視: 豊富なコード例と実践的なパターン
- 段階的学習: 基本パターンから高度なテスト技法まで
- 最新機能対応: AgLoggerManager / AgManagerUtils 活用、Mock 系ツール完全対応

### 目次

<!-- markdownlint-disable ol-prefix -->

#### 📋 基本パターン・日常使用

1. [AgLoggerManager ベースの簡単ログ出力](01-manager-based-logging.md)

- **AgLoggerManager** のシングルトンパターン活用
- **AgManagerUtils** による簡易化 (`createManager()`, `getLogger()`)
- 複数ファイル・モジュール間での一貫したログ出力
- どこからでも同じ logger インスタンス使用パターン

2. [シンプルなロギングパターン](02-simple-logging-patterns.md)

- 基本的な使い回しパターンとベストプラクティス
- ファイル別・機能別のログ分類手法
- モジュール間でのログ一貫性確保

3. [よくある使用シーン](03-common-scenarios.md)

- 関数の開始・終了ログパターン
- エラーハンドリングでの効果的なログ出力
- デバッグ情報の効果的な記録方法
- 実際のコード例中心の解説

4. [日常開発での活用](04-daily-development.md)

- 開発中のデバッグログ活用法
- テスト実行時のログ確認テクニック
- 設定変更の簡単な方法とコツ

#### 🧪 テスト環境での活用

5. [MockFormatter によるテスト](05-testing-with-mock-formatters.md)

- **MockFormatter** の豊富なプリセット活用
  - `MockFormatter.json`, `MockFormatter.passthrough`, `MockFormatter.messageOnly`
  - `MockFormatter.timestamped`, `MockFormatter.prefixed()`
- **エラーテスト*+ `MockFormatter.errorThrow` による例外処理テスト
- **カスタムフォーマッター** `MockFormatter.withRoutine()` 活用
- テスト用メッセージ取得・検証パターン

6. [MockLogger によるログテスト](06-testing-with-mock-loggers.md)

- **MockLogger** の基本使用法
  - `MockLogger.buffer` パターン (new キーワード不要)
  - ログ検証・メッセージ取得・カウント確認
- **MockFormatter + MockLogger 組み合わせ**パターン
- ログ出力の期待値検証とアサーション手法
- Unit / Functional テストでの実践的活用

7. [並列テスト環境での活用](07-parallel-testing-patterns.md)

- **E2eMockLogger** による並列テスト対応
  - テスト ID 管理による完全分離
  - `startTest()` / `endTest()` ライフサイクル管理
- **E2E専用テストパターン**
  - 複数サービス間のログ追跡
  - マルチプロセス・並列実行環境での注意点
  - 長時間実行テストでのログ管理

<!-- markdownlint-enable  -->

### 使い分けガイド

#### 開発フェーズ別推奨記事

- 導入・セットアップ: 記事 01 → 記事 02
- 日常開発: 記事 03 → 記事 04
- テスト実装: 記事 05 → 記事 06 → 記事 07

#### 用途別推奨記事

- 簡単にログを使いたい: 記事 01 (AgLoggerManager 活用)
- プロジェクト全体で統一したい: 記事 02 (パターン統一)
- デバッグを効率化したい: 記事 03, 記事 04
- テストでログを検証したい: 記事 05, 記事 06
- E2E テストを強化したい: 記事 07

### 他ドキュメントとの関係

#### このガイドの位置づけ

- [Getting Started](../getting-started/): 初回セットアップ・導入 → User Guides: 実践活用
- [Basic Usage](../basic-usage/): 機能別詳細説明 → User Guides: シナリオ別活用
- User Guides: 実用パターン → [API Reference](../api-reference/): 詳細仕様

#### 学習の流れ

1. 導入: Getting Started で基本セットアップ
2. 理解: Basic Usage で機能を詳しく学習
3. 実践: User Guides で実際のプロジェクトに適用 ←ここ
4. 詳細: API Reference で細かい仕様を確認

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
