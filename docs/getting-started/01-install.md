---
header:
  - src: 01-install.md
  - @(#): Installation Guide
title: `agla-logger`
description: パッケージのインストール方法と必要要件
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

## インストール

このページでは、`agla-logger` をプロジェクトに導入するための手順を説明します。

---

## 必要要件

### `Node.js` 環境

- `Node.js`: v20 以上 (`ESM` サポートのため)
- `TypeScript`: v5.0 以上推奨
- パッケージマネージャ: `pnpm` 推奨、`npm`/`yarn` 対応済み

### ランタイム対応

| ランタイム | 対応状況    | 備考                          |
| ---------- | ----------- | ----------------------------- |
| `Node.js`  | ✅ 完全対応 | v20+ で推奨、`ESM`-first 設計 |
| `Deno`     | ✅ 対応済み | `ESM` ネイティブサポート      |
| `Bun`      | ✅ 対応済み | 高速ビルド・実行対応          |

---

## パッケージインストール

### `pnpm` (推奨)

```bash
# メインパッケージのインストール
pnpm add @aglabo/agla-logger

# TypeScript 開発環境の場合 (型定義含む)
pnpm add @aglabo/agla-logger
pnpm add -D typescript@^5.0.0
```

### `npm`

```bash
# メインパッケージのインストール
npm install @aglabo/agla-logger

# TypeScript 開発環境の場合
npm install @aglabo/agla-logger
npm install --save-dev typescript@^5.0.0
```

### `yarn`

```bash
# メインパッケージのインストール
yarn add @aglabo/agla-logger

# TypeScript 開発環境の場合
yarn add @aglabo/agla-logger
yarn add --dev typescript@^5.0.0
```

---

## プロジェクト設定

### `TypeScript` 設定 (`tsconfig.json`)

`agla-logger` は `ESM`-first で設計されているため、以下のように `TypeScript` に対応した設定が必要です。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### `package.json` 設定

`ESM` を使用する場合 (推奨):

```json
{
  "type": "module",
  "engines": {
    "node": ">=20"
  }
}
```

### `CommonJS` プロジェクトでの使用

`agla-logger` はデュアルビルド対応のため、`CommonJS` でも使用できます。

```javascript
// `CommonJS` でのインポート
const { AgLogger } = require('@aglabo/agla-logger');
```

---

## インストール確認

### 基本インポートテスト

```typescript
// `ESM` でのインポート
import { AgLogger } from '@aglabo/agla-logger';

// ロガーインスタンス作成(最小限)
const logger = AgLogger.createLogger();

console.log('`agla-logger` がインストールされました！');
```

### バージョン確認

```bash
# インストールされたバージョンの確認
npm list @aglabo/agla-logger

# または
pnpm list @aglabo/agla-logger
```

---

## 追加パッケージ (オプション)

### `AglaError` フレームワーク

`agla-logger`パッケージに含まれているため、追加インストール不要です。

```typescript
// エラーハンドリング用クラス (AgLoggerError) が利用可能
import { AgLoggerError } from '@aglabo/agla-logger';
```

詳細な使用方法については、[基本的な使い方](03-basic-usage.md)を参照してください。

---

## 次のステップ

インストールが完了したら、実際にログを出力してみます。

- [Quick Start](02-quickstart.md) - 最小のサンプルコードでロガーを試す
- [基本的な使い方](03-basic-usage.md) - より詳細な使用方法

---

## トラブルシューティング

インストール時に問題が発生した場合は、[トラブルシューティングガイド](05-troubleshooting.md)を参照してください。

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
