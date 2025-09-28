---
header:
  - src: validate-debug.md
  - @(#): Validation & Debug Command
title: ag-logger
description: ag-logger 開発時の 6 段階包括的品質検証・デバッグワークフローコマンド
version: 1.0.0
created: 2025-09-28
authors:
  - atsushifx
changes:
  - 2025-09-28: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## /validate-debug Command

ag-logger 開発時のコード品質・テスト・型安全性を包括的に検証するワークフロー。

## Phase 1: Code Quality

### ESLint Code Analysis

- Run `pnpm run lint` - ESLint code analysis
- エラー時の対応:
  - ESLint 出力を解析してエラー分類
  - `--fix` で自動修正可能な項目を処理
  - 残りの問題に対して修正案を提示

### TypeScript ESLint Analysis

- Run `pnpm run lint:types` - TypeScript ESLint analysis
- エラー時の対応:
  - TypeScript ESLint 出力を解析してエラー分類
  - `--fix` で自動修正可能な項目を処理
  - 残りの問題に対して修正案を提示

## Phase 2: Testing

- Run `pnpm run test:develop` - 単体／開発テスト
- Run `pnpm run test:functional` - 機能テスト
- Run `pnpm run test:ci` - CI (インテグレーション) テスト
- Run `pnpm run test:e2e` - E2E テスト
- エラー時の対応:
  - テスト出力を読み取り失敗テストを特定
  - エラーメッセージを解析
  - 一般的な問題 (import・型・async/await・モック) をチェック
  - 具体的な修正案を提示

Note:
`/shared/` パッケージ (定数・型定義のみ) では node_modules 不足・テストファイル不足が予想されます。これは正常であり、エラーとして報告すべきではありません。

## Phase 3: Type Checking

- Run `pnpm run check:types` - TypeScript compiler validation
- エラー時の対応:
  - TypeScript コンパイラエラーを解析
  - 型不足・import 問題・型不一致を特定
  - 各エラーに対する具体的な修正案を提示

## Phase 4: Content Validation

- Run `pnpm run check:spells "**/*.{js,ts,json,md}"` - Spell checking
- エラー時の対応:
  - スペルミスした単語をリスト化
  - 修正候補を提示
  - 辞書への追加要否を確認

## Phase 5: Filename Validation

- Run `pnpm run lint:filenames` - Filename lint
- エラー時の対応:
  - 不正なファイル名をリスト化
  - 修正候補を提示
  - 命名規則への適合要否を確認

## Phase 6: Formatting

- Run `pnpm run check:dprint` - Code formatting validation
- エラー時の対応:
  - `pnpm run format:dprint` を自動実行
  - 再チェックを実行

## Error Analysis Protocol

For each failed command:

1. Capture and parse error output
2. Identify error patterns and root causes
3. Cross-reference with codebase to understand context
4. Provide specific, actionable fix recommendations
5. Offer to implement fixes automatically where safe
6. Track all issues in a summary report

## Final Report

- Passed steps
- Failed steps with detailed analysis
- Suggested fixes (manual and automatic)
- Overall health score

---

### See Also

- [開発ワークフロー](../docs/rules/01-development-workflow.md) - BDD 開発プロセス詳細
- [品質保証システム](../docs/rules/03-quality-assurance.md) - 品質ゲート・テスト戦略
- [コマンドリファレンス](../docs/projects/07-command-reference.md) - 開発コマンド一覧

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
