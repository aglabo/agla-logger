---
header:
  - src: 05-pull-request-rules.md
  - @(#): Pull Request Rules
title: agla-logger
description: プルリクエスト作成・レビュー・マージの詳細ルール
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

## プルリクエスト作成ルール

このドキュメントでは、ag-logger プロジェクトにおけるプルリクエスト (PR) の作成、レビュー、マージに関するルールを定義します。
一貫したプルリクエストプロセスにより、コード品質の向上、知識共有、プロジェクトの安定性を確保します。

## プルリクエストの種類

### 機能追加 (Feature)

- 目的: 新機能の実装
- 対象ブランチ: `feature/*` → `develop`
- レビュー要件: 必須 (最低 1 名)
- CI 要件: 全テスト通過

### バグ修正 (Bugfix)

- 目的: 既存機能の不具合修正
- 対象ブランチ: `bugfix/*` → `develop` または `main`
- レビュー要件: 必須 (最低 1 名)
- CI 要件: 全テスト通過

### ドキュメント更新 (Documentation)

- 目的: ドキュメントの追加・修正
- 対象ブランチ: `docs/*` → `develop`
- レビュー要件: 推奨 (1 名)
- CI 要件: lint チェック通過

### リファクタリング (Refactoring)

- 目的: 機能を変えずにコード改善
- 対象ブランチ: `refactor/*` → `develop`
- レビュー要件: 必須 (最低 2 名)
- CI 要件: 全テスト通過 + カバレッジ維持

### 緊急修正 (Hotfix)

- 目的: 本番環境の緊急修正
- 対象ブランチ: `hotfix/*` → `main` + `develop`
- レビュー要件: 必須 (最低 1 名、可能であれば 2 名)
- CI 要件: 全テスト通過

## プルリクエストテンプレート

### 基本テンプレート

```markdown
## 概要

<!-- 変更内容の簡潔な説明 -->

## 変更の種類

- [ ] 新機能 (feature)
- [ ] バグ修正 (bugfix)
- [ ] ドキュメント (docs)
- [ ] リファクタリング (refactor)
- [ ] パフォーマンス改善 (perf)
- [ ] テスト (test)
- [ ] ビルド・設定 (chore)
- [ ] 緊急修正 (hotfix)

## 関連Issue

<!-- 関連するIssue番号 -->

Closes #<issue-number>
Related to #<issue-number>

## 変更内容

<!-- 詳細な変更内容 -->

- 変更点1
- 変更点2
- 変更点3

## テスト

<!-- テスト内容と結果 -->

- [ ] 新しいテストを追加した
- [ ] 既存のテストを更新した
- [ ] 手動テストを実行した
- [ ] すべてのテストが通過することを確認した

## 破壊的変更

<!-- 破壊的変更がある場合の詳細 -->

- [ ] 破壊的変更はありません
- [ ] 破壊的変更があります（下記に詳細を記載）

## チェックリスト

- [ ] コードレビューを受ける準備ができている
- [ ] 自分でコードレビューを実施した
- [ ] 適切なラベルを設定した
- [ ] ドキュメントを更新した（必要に応じて）
- [ ] テストが追加・更新されている
- [ ] CI/CDが通過している

## スクリーンショット・ログ

<!-- UI変更や実行結果がある場合 -->

## 追加情報

<!-- その他の補足情報 -->
```

### 機能追加専用テンプレート

````markdown
## 新機能: [機能名]

### 概要

<!-- 実装した機能の説明 -->

### 動機・背景

<!-- なぜこの機能が必要か -->

### 実装詳細

<!-- 技術的な実装内容 -->

- コア機能の実装
- API の設計
- テストの追加

### 使用例

```typescript
// 使用例のコード
```
````

### 影響範囲

- [ ] 既存 API に影響なし
- [ ] 新しい依存関係なし
- [ ] 設定ファイルの変更なし
- [ ] データベーススキーマの変更なし

### テスト戦略

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual tests

### パフォーマンス

<!-- パフォーマンスへの影響 -->

### ドキュメント更新

- [ ] API ドキュメント
- [ ] README
- [ ] 使用例
- [ ] 移行ガイド

```
## タイトル規則

### 形式
```

<type>(<scope>): <description>

```
### 例
```

feat(logger): add structured logging support
fix(core): resolve memory leak in event handler
docs(api): update configuration examples
refactor(utils): simplify date formatting logic
test(core): add unit tests for plugin system

````
### ベストプラクティス

- 50文字以内で簡潔に
- 現在形の動詞を使用
- 最初の文字は小文字
- 末尾にピリオドは不要

## ラベル運用

### 必須ラベル

| ラベル | 説明 | 色 |
|--------|------|-----|
| `type: feature` | 新機能 | `#0075ca` |
| `type: bugfix` | バグ修正 | `#d73a4a` |
| `type: docs` | ドキュメント | `#0075ca` |
| `type: refactor` | リファクタリング | `#fbca04` |
| `type: test` | テスト | `#1d76db` |
| `type: chore` | その他 | `#fef2c0` |

### 優先度ラベル

| ラベル | 説明 | 使用場面 |
|--------|------|----------|
| `priority: critical` | 緊急 | セキュリティ、本番障害 |
| `priority: high` | 高 | 重要な機能、主要バグ |
| `priority: medium` | 中 | 通常の機能、改善 |
| `priority: low` | 低 | 小さな改善、ドキュメント |

### 状態ラベル

| ラベル | 説明 | 使用場面 |
|--------|------|----------|
| `status: ready` | レビュー準備完了 | レビュー依頼時 |
| `status: draft` | 作業中 | WIP状態 |
| `status: blocked` | ブロック中 | 依存関係で待機 |
| `status: needs-review` | レビュー必要 | レビューワー募集 |

### 影響範囲ラベル

| ラベル | 説明 |
|--------|------|
| `scope: core` | コア機能 |
| `scope: api` | API関連 |
| `scope: ui` | UI関連 |
| `scope: docs` | ドキュメント |
| `scope: test` | テスト |
| `scope: ci` | CI/CD |

## レビュープロセス

### レビューワーの指定

#### 自動指定

- Code Owners による自動アサイン
- ファイル変更パターンベースの指定

#### 手動指定

- 専門知識が必要な場合
- クリティカルな変更の場合
- 学習目的での指定

### レビュー基準

#### 必須チェック項目

- コードが要件を満たしている
- バグやロジックエラーがない
- セキュリティ上の問題がない
- パフォーマンスへの悪影響がない
- テストが適切に追加されている
- ドキュメントが更新されている
- コーディング規約に準拠している

#### コード品質チェック

- 可読性が高い
- 保守性が考慮されている
- 再利用性が適切
- SOLID原則に準拠
- DRY原則に準拠

### レビューコメント

#### 承認レベル

| レベル | 意味 | コメント例 |
|--------|------|-----------|
| `Approve` | 承認 | "LGTM! 素晴らしい実装です" |
| `Request Changes` | 修正必要 | "セキュリティ上の懸念があります" |
| `Comment` | コメントのみ | "提案: この部分は...できそうです" |

#### コメントの種類

```markdown
Nit: 軽微な指摘
Question: 質問
Suggestion: 提案
Issue: 修正が必要な問題
Praise: 良い点への評価
Learning: 学習のための質問
````

### レビュー後の対応

#### 修正対応

1. レビューコメントを確認
2. 修正または回答
3. レビューワーに再確認を依頼
4. 解決済みコメントをマーク

#### 議論が必要な場合

1. GitHub Discussion での議論
2. ミーティングでの検討
3. チーム内での合意形成

## マージ条件

### 必須条件

- すべての CI チェックが通過
- 最低 1 名のレビューワーが承認
- コンフリクトが解決済み
- レビューコメントが解決済み
- ブランチが最新状態

### 推奨条件

- カバレッジが維持されている
- パフォーマンステストが通過
- セキュリティスキャンが通過
- ドキュメントが更新されている

## マージ戦略

### feature → develop

- 推奨: Squash and Merge
- 理由: クリーンな履歴維持

### release → main

- 推奨: Merge Commit
- 理由: リリース履歴の明確化

### hotfix → main/develop

- 推奨: Merge Commit
- 理由: 緊急修正の追跡

## 自動化機能

### GitHub Actions 連携

#### PR作成時

- CI/CD パイプライン実行
- 自動ラベル付与
- レビューワー自動アサイン

#### コミット時

- 追加 CI 実行
- カバレッジ計測
- セキュリティスキャン

#### マージ時

- 自動デプロイ (develop)
- チェンジログ更新
- 通知送信

### lefthook 連携

#### pre-push

```bash
# テスト実行
pnpm run test:ci
# リントチェック
pnpm run lint:all
# 型チェック
pnpm run check:types
```

## ベストプラクティス

### PR作成前

1. 最新の develop を取り込み
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-branch
   git rebase develop
   ```

2. 自己レビュー実施
   - コード品質チェック
   - テスト実行
   - ドキュメント確認

3. 小さく論理的な単位に分割

### PR作成時

1. わかりやすいタイトル
2. 詳細な説明
3. 適切なラベル設定
4. 関連 Issue への参照

### レビュー依頼

1. レビューワーの明確な指定
2. レビューポイントの説明
3. 期限の明示 (急ぎの場合)

### レビュー実施

1. 建設的なフィードバック
2. 具体的な改善提案
3. 迅速な対応

## トラブルシューティング

### よくある問題

#### CI が失敗する

```bash
# ローカルで CI と同じチェックを実行
pnpm run test:ci
pnpm run lint:all
pnpm run check:types
pnpm run build
```

#### コンフリクト発生

```bash
# develop の最新を取り込み
git checkout develop
git pull origin develop
git checkout feature/your-branch
git rebase develop
# コンフリクト解決後
git rebase --continue
```

#### レビューが進まない

1. レビューワーに直接連絡
2. レビューポイントの明確化
3. 複数のレビューワーを指定

---

### See Also

- [開発ワークフロー](02-development-workflow.md) - BDD 開発フロー
- [コミットメッセージ規約](03-commit-message-conventions.md) - コミット規約
- [ブランチ戦略](04-branch-strategy.md) - Git Flow ベースの運用
- [品質保証システム](06-quality-assurance.md) - 品質管理ルール
- [コーディング規約](08-coding-conventions.md) - コード規約

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
