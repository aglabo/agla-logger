---
header:
  - src: 06-naming-standards.md
  - @(#): Naming Standards
title: agla-logger
description: 命名規則とドメイン語彙の統一ガイド
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

## ネーミングスタンダード

## 1. 目的

TypeScript 標準慣習と ag-logger 独自の接頭辞ルールを統一し、識別子から責務が即座に分かる状態を維持する。

## 2. 適用対象

- クラス・抽象クラス
- 型エイリアス・インターフェース・列挙型
- 定数・エラーメッセージキー
- ファイル名・ディレクトリ名

## 3. 接頭辞・パターン

| 種別                | 命名規則                                 | 例                             | 備考                              |
| ------------------- | ---------------------------------------- | ------------------------------ | --------------------------------- |
| 型エイリアス        | `TAg{Domain}{Name}`                      | `TAgLogMessage`                | 基本形。ユニオン型や構造型に適用  |
| インターフェース    | `IAg{Domain}{Name}`                      | `IAgLogger`                    | `I` 接頭辞で契約と識別            |
| 抽象/基底クラス     | `AgBase{Name}` または `AgAbstract{Name}` | `AgBaseLogger`                 | `shared/base` 配置が前提          |
| 具象クラス          | `Ag{Name}`                               | `AgLogger`, `AgErrorFormatter` | ドメイン配下で実装                |
| 列挙型              | `Ag{Name}Enum`                           | `AgLogLevelEnum`               | enum 利用推奨時のみ               |
| 定数                | `AG_{DOMAIN}_{NAME}`                     | `AG_LOG_LEVELS`                | 大文字 + `_` 区切り。複数語は `_` |
| 関数                | lowerCamelCase                           | `formatLogEntry`               | 共通                              |
| ファイル名 (型)     | `{domain}.types.ts`                      | `log.types.ts`                 | ドメイン小文字スネーク            |
| ファイル名 (IF)     | `{domain}.interfaces.ts`                 | `plugin.interfaces.ts`         | 同上                              |
| ファイル名 (クラス) | `{ClassName}.class.ts`                   | `AgLogger.class.ts`            | クラス名と一致                    |

## 4. ドメイン語彙

- `Log`: ログ出力全般 (`log`, `logging`)
- `Error`: エラーハンドリング (`error`, `errorHandling`)
- `Format`: フォーマッタ (`format`, `formatter`)
- `Plugin`: プラグイン (`plugin`, `extension`)
- `Common`: 複数ドメイン横断 (`common`, `shared`)

## 5. 命名チェックリスト

1. まず対象の責務が型かインターフェースかクラスかを判定し、表のプレフィックスに従う。
2. ドメイン名を英語単語で選定し、複合語はパスカルケースで連結する。
3. ファイル名は命名対象と同期し、`index.ts` の再エクスポートで可読性を確保する。
4. 既存命名と食い違う場合、技術的負債ドキュメントに追記し、移行計画を更新する。

## 6. NG パターン例

- `TErrorType`: `TAgErrorType` に改名する。
- `AgLoggerInterface`: インターフェースは `IAgLogger` に統一する。
- `agErrorMessages.ts`: ファイル名はパスカルケースではなく、`error.constants.ts` などドメインプレフィックス + 種別で命名する。
- `AgMockConstructor.class.ts`: クラス名が責務を示していない。`shared/base` へ移動し命名を見直すか、適切なドメインに再配置する。

## 7. 運用ルール

- 新規 PR では、追加・変更した識別子の命名根拠を説明欄に記載する。
- レビュー時は「接頭辞」「ドメイン語彙」「ファイル名」の 3 点セットでチェックする。
- 例外が必要な場合は本ドキュメントを改訂し、理由と影響範囲を明記する。

## 8. 参考リンク

- [03-directory-structure.md](./03-directory-structure.md)
- [06-source-code-template.md](./06-source-code-template.md)

---

## 9. License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
