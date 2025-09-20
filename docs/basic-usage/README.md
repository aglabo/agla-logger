---
header:
  - src: README.md
  - @(#): Basic Usage Guide
title: agla-logger
description: agla-logger の基本的な使い方とコード例を示す実践ガイド
version: 1.0.0
created: 2025-09-20
authors:
  - atsushifx
changes:
  - 2025-09-20: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## Basic Usage Guide

このガイドは **agla-logger の基本的な使い方**を豊富なコード例とともに解説します。
インストール済みの開発者が、実際のプロジェクトで agla-logger を効果的に活用するための実践的なリファレンスです。

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

### 目次

1. [基本的なロガー操作](01-basic-logger-operations.md)
   - ロガーインスタンスの作成
   - 基本的なログ出力
   - ログレベル別出力

2. [ログレベル制御](02-log-level-control.md)
   - ログレベルの設定と変更
   - 条件付きログ出力
   - ログレベル判定

3. [フォーマッター活用](03-formatter-usage.md)
   - JSON/Plain フォーマッター切り替え
   - カスタムフォーマッターの実装
   - フォーマッター設定の動的変更

4. [エラーハンドリング](04-error-handling.md)
   - AglaError フレームワークとの連携
   - 構造化エラーログ
   - エラー分類とログレベル自動選択

5. [プラグインシステム](05-plugin-system.md)
   - カスタムフォーマッターの作成
   - カスタムロガーの実装
   - プラグイン登録と切り替え

---

### See Also

- [Getting Started](../getting-started/) - 初回セットアップと導入
- [ユーザーガイド](../user-guides/)
- [APIリファレンス](../api-reference/)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
