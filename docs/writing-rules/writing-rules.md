---
header:
  - src: writing-rules.md
  - @(#): Writing Rules
title: agla-logger
description: Claude 向け執筆禁則事項とプロジェクト固有記法ルール
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

## Claude 向け執筆ルール

この文書は **Claude が agla-logger プロジェクトで文書作成する際**の禁則事項とプロジェクト固有の記法ルールを定義します。
textlint では検出されない、プロジェクト特有のスタイル統一を目的とします。

## 禁則事項 (絶対に避ける)

### 1. 箇条書き + 強調構文の使用

**禁止パターン**:

```markdown
- **重要項目1**: 説明文
- **重要項目2**: 説明文
- **重要項目3**: 説明文
```

**推奨パターン**:

```markdown
### 重要項目1

説明文

### 重要項目2

説明文

### 重要項目3

説明文
```

次のような形式も使用できます。

```markdown
- 重要項目1: 説明文
- 重要項目2: 説明文
- 重要項目3: 説明文
```

**理由**: 過度な強調は可読性を損ない、重要度の区別を曖昧にします。

### 2. 過剰な装飾・絵文字使用

**禁止パターン**:

```markdown
## 🎯 重要な機能 ✨

**⚡ 高速処理** で **🔒 セキュア** な **📊 ログ** を実現！
```

**推奨パターン**:

```markdown
## 重要な機能

高速処理でセキュアなログを実現
```

**例外**: README.md の概要セクションのみ、適度な絵文字使用を許可。

### 3. 冗長な前置き・まとめ

**禁止パターン**:

```markdown
以下に詳細を説明します。

[本文]

以上が詳細説明でした。
```

**推奨パターン**:

```markdown
[本文]
```

## プロジェクト固有記法ルール

### 1. 括弧は半角統一

**間違いパターン**:

```markdown
必要要件 (Node.js v20以上)
設定ファイル (package.json)
```

**正しいパターン**:

```markdown
必要要件 (Node.js v20 以上)。
設定ファイル (package.json)。
```

### 2. 技術用語の統一表記

#### パッケージ名・ツール名

```markdown
agla-logger # プロジェクト名
@aglabo/agla-logger-core # パッケージ名
textlint # ツール名
markdownlint # ツール名
pnpm # パッケージマネージャ
```

#### クラス名・型名

```markdown
AgLogger # メインクラス
AgLoggerManager # マネージャクラス
AglaError # エラークラス
AgLogMessage # 型名
```

#### ファイル名・パス

```markdown
`AgLogger.class.ts` # バッククォートで囲む
`src/plugins/formatter/` # ディレクトリパス
`docs/rules/01-development-workflow.md` # ドキュメントパス。
```

### 3. バージョン・数値表記

```markdown
v20 以上 # バージョン (v + 数値 + スペース)
5.0 以上 # 小数点バージョン
TypeScript 5.0 # ツール名 + スペース + バージョン
Node.js v20 # ツール名 + スペース + v + バージョン
```

### 4. コマンド表記

#### シェルコマンド

```bash
pnpm run test # pnpm 推奨
npm run test # npm 対応
yarn test # yarn 対応
```

#### ファイル操作

```bash
`ls -la` # バッククォート
`mkdir -p docs/writing` # オプション含む。
```

### 5. リンク表記統一

#### プロジェクト内リンク

```markdown
[開発ワークフロー](../rules/01-development-workflow.md)
[プロジェクト概要](../projects/00-project-overview.md)
```

#### 外部リンク

```markdown
[MIT License](https://opensource.org/licenses/MIT)
[GitHub リポジトリ](https://github.com/atsushifx/agla-logger)。
```

## Claude 特有の注意事項

### 1. 簡潔性の維持

**冗長パターン**:

```markdown
この機能について詳しく説明いたします。まず最初に、基本的な概念から始めて、段階的に詳細な内容に進んでいきます。
```

**簡潔パターン**:

```markdown
## 機能概要
```

### 2. 技術文書の客観性

**主観的パターン**:

```markdown
素晴らしい機能です！
とても便利な機能だと思います。
```

**客観的パターン**:

```markdown
高性能ログ機能を提供します。
効率的なデバッグを支援します。
```

### 3. 構造化の徹底

**平坦な構造パターン**:

```markdown
項目1について説明します。項目2も重要です。項目3の注意点があります。
```

**構造化パターン**:

```markdown
### 項目1

説明内容

### 項目2

説明内容

### 項目3

注意点
```

## 文章パターン集

### 1. 機能説明パターン

```markdown
## [機能名]

[機能の目的・概要を1-2文で]

### 基本的な使い方

'''typescript
// サンプルコード
'''
```

### 設定オプション

- `option1`: 説明
- `option2`: 説明

### 2. インストール手順パターン

```markdown
## インストール

### パッケージマネージャ別

'''bash

# pnpm (推奨)

pnpm add @aglabo/agla-logger-core

# npm

npm install @aglabo/agla-logger-core

# yarn

yarn add @aglabo/agla-logger-core
'''

### 要件確認

- Node.js v20 以上
- TypeScript 5.0 以上推奨
```

### 3. エラー対処パターン

```markdown
## よくあるエラー

### Error: [エラーメッセージ]

**原因**: エラーの原因説明

**解決方法**:

1. 手順1
2. 手順2
3. 手順3

**確認コマンド**:

'''bash
pnpm run check:types。
'''
```

## textlint では検出されない注意点

### 1. 日本語と英語の混在

**避けるパターン**:

```markdown
ログgerシステム
TypeScriptタイプ
```

**推奨パターン**:

```markdown
ロガーシステム
TypeScript 型。
```

### 2. カタカナ表記統一

```markdown
ロガー # logger
エラー # error
プラグイン # plugin
フォーマッター # formatter
マネージャー # manager
```

### 3. 助詞の適切な使用

**不自然パターン**:

```markdown
ファイルを読み込みを行います
```

**自然パターン**:

```markdown
ファイルの読み込みを行います。
ファイルを読み込みます。
```

## チェックリスト

### 作成時確認項目

- [ ] 箇条書き + 強調構文の多用回避
- [ ] 括弧は半角統一 `()`
- [ ] 技術用語の表記統一
- [ ] バージョン表記の形式統一
- [ ] リンク形式の統一
- [ ] 冗長な表現の排除
- [ ] 客観的な文体維持
- [ ] 明確で理解しやすい見出し階層

### レビュー時確認項目

- [ ] textlint エラー 0 件
- [ ] markdownlint エラー 0 件
- [ ] プロジェクト固有ルール準拠
- [ ] 既存文書との一貫性
- [ ] 読みやすさ・理解しやすさ

---

### See Also

- [ドキュメントテンプレート](document-template.md) - 基本構造
- [フロントマターガイド](frontmatter-guide.md) - メタデータ記入
- [ドキュメント作成ガイドライン](README.md) - 全体概要

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
