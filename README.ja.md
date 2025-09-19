---
header:
  - src: README.ja.md
  - @(#): TypeScript用軽量・プラガブル構造化ロガー
title: agla-logger
description: ログレベル管理、柔軟なフォーマット設定、プラグインシステムを備えたTypeScript用軽量・プラガブル構造化ロガー
version: 1.0.0
created: 2025-09-19
authors:
  - atsushifx
changes:
  - 2025-09-19: 実際の内容に合わせてフロントマターを更新
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

<!-- textlint-disable ja-spacing/ja-no-space-around-parentheses -->
<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->

[English](README.md) | [日本語]

[![npm version](https://badge.fury.io/js/%40aglabo%2Fagla-logger-core.svg)](https://www.npmjs.com/package/@aglabo/agla-logger-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)

TypeScript 用の軽量・プラガブルな構造化ロガーです。ログレベル管理、柔軟なフォーマット設定、プラグインシステムを提供します。

<!-- textlint-enable -->

## 📦 パッケージ

このリポジトリには、以下のパッケージがあります。

- **[@aglabo/agla-logger-core](https://github.com/aglabo/agla-logger/packages/@aglabo/agla-logger-core)** - メインのロガーパッケージ
- **[@aglabo/agla-error-core](https://github.com/aglabo/agla-logger/packages/@aglabo/agla-error-core)** - 標準化されたエラーハンドリング

## 🚀 クイックスタート

### インストール

```bash
# npm
npm install @aglabo/agla-logger-core

# pnpm
pnpm add @aglabo/agla-logger-core

# yarn
yarn add @aglabo/agla-logger-core

# deno (後で実装予定)
# deno add @aglabo/agla-logger-core

# bun (後で実装予定)
# bun add @aglabo/agla-logger-core
```

### 基本的な使い方

```typescript
import { AgLogger, ConsoleLogger, PlaintFormatter } from '@aglabo/agla-logger-core';

// ロガー作成、取得
AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});
logger = AgLogger.getLogger();

// 基本的なログ出力
logger.info('アプリケーションが開始されました');
logger.debug('デバッグ情報', { userId: 123 });
```

## ✨ 主な機能

<!-- textlint-disable ja-technical-writing/max-comma  -->

- ログレベル管理: TRACE, DEBUG, VERBOSE, INFO, WARN, ERROR, FATAL
- プラガブル設計: フォーマッターとロガーのプラグインシステム
- 構造化ログ: JSON やプレーンテキストでの出力
- TypeScript: 完全な型安全性
- 軽量: 最小限の依存関係
- デュアルサポート: ESM と CommonJS の両方に対応

<!-- textlint-enable -->

## 📚 ドキュメント

### 👥 使用者向け

- [入門ガイド](https://github.com/aglabo/agla-logger/docs/getting-started/) - インストールから最初の実行まで
- [基本的な使い方](https://github.com/aglabo/agla-logger/docs/basic-usage/) - 日常的な使い方
- [ユーザーガイド](https://github.com/aglabo/agla-logger/docs/user-guides/) - 応用例・ベストプラクティス
- [APIリファレンス](https://github.com/aglabo/agla-logger/docs/api-reference/) - 詳細な仕様
- [実装例](https://github.com/aglabo/agla-logger/docs/examples/) - サンプルコード集

### 🔧 開発者向け

- [プロジェクト情報](https://github.com/aglabo/agla-logger/docs/projects/) - アーキテクチャ・ロードマップ
- [開発ルール](https://github.com/aglabo/agla-logger/docs/rules/) - コーディング規約・ワークフロー

## 📄 ライセンス

MIT License - 詳細は [LICENSE](https://github.com/aglabo/agla-logger/LICENSE) ファイルをご覧ください。

## 🤝 貢献

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->

プルリクエストや Issue の報告をお待ちしています！

<!-- textlint-disable @textlint-ja/ai-writing/no-ai-list-formatting -->

- [🐛 バグ報告](https://github.com/aglabo/agla-logger/issues) - バグや問題を見つけた場合
- [✨ 機能提案](https://github.com/aglabo/agla-logger/issues) - 新機能のアイデアがある場合
- [💬 質問・相談](https://github.com/aglabo/agla-logger/discussions) - 使い方の質問や相談
- [🔀 プルリクエスト](https://github.com/aglabo/agla-logger/compare) - コードの改善や新機能の実装

<!-- textlint-enable -->

詳細については [CONTRIBUTING.ja.md](CONTRIBUTING.ja.md) をご覧ください。

## 📮 作者

**atsushifx** - [GitHub](https://github.com/atsushifx)
