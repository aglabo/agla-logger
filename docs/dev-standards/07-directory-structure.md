---
header:
  - src: 04-directory-structure.md
  - @(#): Directory Structure
title: agla-logger
description: モノレポのディレクトリ構成と責務分離ルール
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

## ディレクトリ構成スタンダード

## 1. 目的

ag-logger モノレポ内のソース配置を統一し、ドメイン境界と共有資産の責務を明確化するためのルールを定義する。

## 2. 適用範囲

- `packages/@aglabo/agla-logger-core/`
- `packages/@aglabo/agla-error-core/`
- 両パッケージ配下の `src/`, `shared/`, `tests/` ディレクトリ

## 3. 基本原則

- ドメイン優先: クラスやビジネスロジックは必ず該当ドメイン配下 (`src/{domain}/`) に配置する。
- 共有資産の明確化: 横断的に利用する型・定数・基底クラスのみを `shared/` に置き、責務を曖昧にしない。
- 命名規約との整合: ファイル名は `{domain}.types.ts`, `{domain}.interfaces.ts`, `{ClassName}.class.ts` など既定のテンプレートに従う。
- テストは鏡写し: `tests/` は対象コードと同じ階層構造を保ち、`Given/When/Then` のテスト設計を崩さない。

## 4. 標準ディレクトリツリー

```bash
packages/@aglabo/agla-logger-core/
├── src/
│   ├── log/
│   │   ├── AgLogger.class.ts
│   │   ├── log.types.ts
│   │   └── log.interfaces.ts
│   ├── error/
│   │   └── ...
│   └── plugin/
├── shared/
│   ├── types/
│   │   ├── common.types.ts
│   │   └── logging.interfaces.ts
│   ├── base/
│   │   ├── AgBaseLogger.class.ts
│   │   └── AgAbstractPlugin.class.ts
│   └── constants/
└── tests/
    └── log/
        └── AgLogger.spec.ts
```

## 5. shared ディレクトリの責務分離

- `shared/types/`: 型エイリアス・インターフェースのみを配置。クラスや具象ロジックは禁止。
- `shared/base/`: 各ドメインで再利用する抽象/基底クラスを配置。ファイル名は `Ag*.class.ts` を必須とし、JSDoc で責務を明記する。
- `shared/constants/`: ログレベルやエラーコード等の共通定数を集約。命名は `AG_` プレフィックスを徹底。

## 6. ドメイン配下の構成ルール

- クラス実装 (`*.class.ts`) は必ず該当ドメインのサブディレクトリに置き、`shared/base` からの継承で統一感を保つ。
- ドメイン固有の型・インターフェースは `src/{domain}/` に置きつつ、複数ドメインで共有する場合のみ `shared/types/` に抽出する。
- ドメインごとに `index.ts` を置き、外部公開シンボルを明示する。

## 7. テスト構造の写経ルール

- `tests/{domain}/` は `src/{domain}/` をミラーし、テストファイル名は対象クラス + `.spec.ts` を基本とする。
- BDD 三階層 (`Given`/`When`/`Then`) を破らないよう、ディレクトリ名と describe ブロックの表現を揃える。

## 8. 運用チェックリスト

1. 新しいクラスを追加する際は、まず配置先ドメインと `shared` への切り出し可否をレビューする。
2. 共有化を判断した場合、`shared/base` もしくは `shared/types` に格納し、既存利用箇所を洗い出す。
3. Pull Request の記述には、追加/変更したファイルの配置判断理由を一行で添える。
4. 既存構成と異なる配置を採用する場合は、本ドキュメントの改訂をセットで行う。

---

## 9. License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
