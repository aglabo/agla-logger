---
header:
  - src: 03-commit-message-conventions.md
  - @(#): Commit Message Conventions
title: agla-logger
description: Conventional Commits 準拠のコミットメッセージ規約
version: 1.0.0
created: 2025-09-27
authors:
  - atsushifx
changes:
  - 2025-09-27: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## コミットメッセージ規約

このドキュメントでは、ag-logger プロジェクトで使用するコミットメッセージの規約を定義します。
一貫したコミットメッセージにより、変更履歴の追跡、自動化ツールとの連携、チーム間のコミュニケーションを向上させます。

## コミットメッセージ形式

### 基本形式

```markdown
<type>(<scope>): <subject>

<body>

<footer>
```

### 必須要素

- type: コミットの種類 (必須)
- subject: 変更の簡潔な説明 (必須)

### オプション要素

- scope: 変更の影響範囲
- body: 詳細な説明
- footer: 破壊的変更や課題への参照

## コミットタイプ

### 主要タイプ

| タイプ     | 説明                                 | 例                                                |
| ---------- | ------------------------------------ | ------------------------------------------------- |
| `feat`     | 新機能の追加                         | `feat(logger): add structured logging support`    |
| `fix`      | バグ修正                             | `fix(core): resolve memory leak in event handler` |
| `docs`     | ドキュメントのみの変更               | `docs(readme): update installation instructions`  |
| `style`    | コードの意味に影響しない変更         | `style(format): apply prettier formatting`        |
| `refactor` | バグ修正も機能追加もしないコード変更 | `refactor(utils): simplify date formatting logic` |
| `test`     | テストの追加や修正                   | `test(core): add unit tests for logger factory`   |
| `chore`    | ビルドプロセスや補助ツールの変更     | `chore(deps): update typescript to v5.0`          |

### 特殊タイプ

| タイプ   | 説明                     | 使用場面                                       |
| -------- | ------------------------ | ---------------------------------------------- |
| `perf`   | パフォーマンス改善       | 処理速度やメモリ使用量の最適化                 |
| `ci`     | CI設定の変更             | GitHub Actions、テスト設定の変更               |
| `build`  | ビルドシステムの変更     | webpack、rollup、package.json の変更           |
| `revert` | 以前のコミットの取り消し | `revert: feat(logger): add structured logging` |

## スコープ

### パッケージベースのスコープ

```bash
core        # @aglabo/agla-logger-core
error       # @aglabo/agla-error-core
types       # 型定義
utils       # ユーティリティ
```

### 機能ベースのスコープ

```bash
logger      # ロガー機能
formatter   # フォーマッター
transport   # トランスポート
plugin      # プラグインシステム
config      # 設定管理
```

### 開発ツールのスコープ

```bash
build       # ビルド設定
test        # テスト設定
docs        # ドキュメント
ci          # CI/CD設定
deps        # 依存関係
```

## サブジェクト (件名)

### ルール

1. 50 文字以内に収める
2. 現在形の動詞で始める
3. 最初の文字は小文字にする
4. 末尾にピリオドを付けない
5. 何を変更したかを明確に表現する

### よい例

```
feat(logger): add structured logging support
fix(core): resolve memory leak in event handler
docs(api): update logger configuration examples
test(utils): add edge case tests for date formatter
```

### 悪い例

```
✗ Added new feature         # 過去形
✗ Fix bug                   # 具体性に欠ける
✗ Update documentation.     # ピリオドが不要
✗ FEAT: Add logging         # 大文字で開始
```

## ボディ (本文)

### 使用する場合

- なぜその変更が必要だったか
- どのように問題を解決したか
- 影響範囲や注意点がある場合

### 形式

- 72 文字で改行
- 現在形で記述
- 箇条書きも可 (- または * を使用)

### 例

```
feat(logger): add structured logging support

- Implement JSON formatter for structured output
- Add support for custom field mappings
- Ensure backward compatibility with existing loggers

This change enables users to output logs in structured JSON format,
making it easier to integrate with log aggregation systems like ELK stack.
```

## フッター

### 破壊的変更

```
BREAKING CHANGE: remove deprecated setLevel method

The setLevel method has been removed. Use updateConfig({ level: 'info' }) instead.
```

### 課題への参照

```
Fixes #123
Closes #456, #789
Related to #101
```

## 実用例

### 機能追加

```
feat(core): add plugin system for custom formatters

Implement a plugin architecture that allows users to register
custom formatters at runtime. This enables extension of logging
capabilities without modifying core code.

- Add PluginManager class for plugin registration
- Define Formatter interface for plugin implementations
- Include example custom formatter in documentation

Closes #234
```

### バグ修正

```
fix(transport): prevent duplicate log entries in file transport

The file transport was writing duplicate entries when multiple
loggers used the same output file. Fixed by implementing proper
file handle sharing and write coordination.

Fixes #567
```

### ドキュメント更新

```
docs(dev-standards): add commit convention guidelines

Create comprehensive commit message standards to improve
project maintainability and enable automated tooling.
```

### 破壊的変更

````
feat(core)!: redesign logger configuration API

BREAKING CHANGE: Logger constructor now requires configuration object

Before:
```javascript
const logger = new Logger('myapp', 'info');
````

After:

```javascript
const logger = new Logger({ name: 'myapp', level: 'info' });
```

This change provides better flexibility for future configuration options.

Closes #890

````
## 自動化ツールとの連携

### Conventional Commits

このプロジェクトは [Conventional Commits](https://www.conventionalcommits.org/) 仕様に準拠しています。

### 自動バージョニング

- `feat`: MINOR バージョンアップ
- `fix`: PATCH バージョンアップ
- `BREAKING CHANGE`: MAJOR バージョンアップ

### チェンジログ生成

コミットメッセージから自動的にチェンジログが生成されます。

## 検証ツール

### commitlint

```bash
# コミットメッセージの検証
pnpm commitlint --from HEAD~1 --to HEAD
````

### lefthook

プリコミットフックでコミットメッセージが自動検証されます。

## ベストプラクティス

### 推奨事項

1. 小さく論理的な単位でコミットする
2. 関連する変更は 1つのコミットにまとめる
3. 無関係な変更は分離してコミットする
4. テストの追加/修正は別コミットにする
5. WIP (Work In Progress) コミットは避ける

### 原子性の原則

各コミットは以下の条件を満たすべきです:

- 単一の責任を持つ
- ビルドが通る状態を保つ
- テストが成功する
- 機能的に完結している

### コミット分割の例

悪い例 (複数の関心事が混在):

```
feat: add logging and fix formatter and update docs
```

よい例 (関心事ごとに分離):

```
feat(core): add structured logging support
fix(formatter): resolve timestamp formatting issue
docs(api): update logging configuration examples
```

---

### See Also

- [開発ワークフロー](02-development-workflow.md) - BDD 開発フロー
- [ブランチ戦略](04-branch-strategy.md) - Git Flow ベースの運用
- [プルリクエスト作成ルール](05-pull-request-rules.md) - PR 作成・レビュー
- [品質保証システム](06-quality-assurance.md) - 品質管理ルール

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
