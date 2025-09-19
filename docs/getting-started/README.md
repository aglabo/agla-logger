---
header:
  - src: README.md
  - @(#): Getting Started
title: `agla-logger`
description: Getting Started:
version: 1.0.0
created: 2025-09-19
authors:
  - atsushifx
changes:
  - 2025-09-19: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## Getting Started

このディレクトリは **`agla-logger` を初めて利用する開発者**のための入門ガイドです。
順に読めば、インストールから基本的な使い方までを短時間で習得できます。

### 必要要件

- `Node.js`: v20 以上 (`ESM` サポートのため)
- ランタイム対応:
  - `Node.js`: 完全対応 (v20+)
  - `Deno`: 対応済み (`ESM`-first 設計)
  - `Bun`: 対応済み (高速ビルド)
- パッケージマネージャ:
  - `pnpm` 推奨 (プロジェクト標準)
  - `npm`/`yarn` 対応済み
- `TypeScript`: v5.0 以上推奨

### 目次

1. [インストール](01-install.md)
   - パッケージの導入方法(`npm` / `pnpm` / `yarn`)
   - `Node.js` / `TypeScript` の必要要件

2. [Quick Start](02-quickstart.md)
   - 最小のサンプルコード
   - ログレベルの設定方法
   - フォーマッターの切り替え

3. [基本的な使い方](03-basic-usage.md)
   - ロガーの生成と複数インスタンス
   - `AglaError` フレームワークとの連携

4. [応用例](04-examples.md)
   - JSON ログとログ収集基盤
   - カスタムフォーマッターの追加

5. [トラブルシューティング](05-troubleshooting.md)
   - よくあるエラーと対処法
   - `tsconfig` 設定の注意点

---

### See Also

- [基本的な使い方](../basic-usage/)
- [ユーザーガイド](../user-guides/)
- [APIリファレンス](../api-reference/)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
