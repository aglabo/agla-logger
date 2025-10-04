---
header:
  - src: 04-branch-strategy.md
  - @(#): Branch Strategy
title: agla-logger
description: Git Flow ベースのブランチ戦略と運用ルール
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

## ブランチ戦略

このドキュメントでは、ag-logger プロジェクトで使用するブランチ戦略を定義します。
Git Flow をベースとした戦略により、安定したリリース管理と効率的な並行開発を実現します。

## ブランチ構造

### 永続ブランチ

#### main ブランチ

- 目的: 本番環境にデプロイ可能な安定版コード
- 保護レベル: 最高 (直接プッシュ禁止)
- マージ条件: プルリクエスト + レビュー + CI通過
- タグ: リリース時に version タグを付与

#### develop ブランチ

- 目的: 次期リリースに向けた開発統合
- 保護レベル: 高 (直接プッシュ非推奨)
- マージ条件: プルリクエスト + CI通過
- 特徴: feature ブランチのマージ先

### 一時ブランチ

#### feature ブランチ

- 命名規則: `feature/<issue-number>-<short-description>`
- 作成元: `develop`
- マージ先: `develop`
- ライフサイクル: マージ後削除

例:

```
feature/123-add-structured-logging
feature/456-implement-plugin-system
feature/789-update-error-handling
```

#### bugfix ブランチ

- 命名規則: `bugfix/<issue-number>-<short-description>`
- 作成元: `develop` または `main`
- マージ先: 作成元と同じブランチ
- ライフサイクル: マージ後削除

例:

```
bugfix/101-fix-memory-leak
bugfix/202-resolve-formatting-issue
```

#### hotfix ブランチ

- 命名規則: `hotfix/<version>-<description>`
- 作成元: `main`
- マージ先: `main` と `develop` の両方
- 用途: 緊急の本番環境修正

例:

```
hotfix/1.2.1-security-fix
hotfix/1.3.2-critical-bug
```

#### release ブランチ

- 命名規則: `release/<version>`
- 作成元: `develop`
- マージ先: `main` と `develop` の両方
- 用途: リリース準備とバグ修正

例:

```
release/1.4.0
release/2.0.0-beta.1
```

## ブランチ運用フロー

### 機能開発フロー

1. ブランチ作成
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/123-add-logging
   ```

2. 開発・コミット
   ```bash
   # 開発作業
   git add .
   git commit -m "feat(core): add structured logging support"
   ```

3. プッシュ・プルリクエスト
   ```bash
   git push origin feature/123-add-logging
   # GitHub でプルリクエスト作成
   ```

4. マージ・削除
   ```bash
   # マージ後
   git checkout develop
   git pull origin develop
   git branch -d feature/123-add-logging
   ```

### リリースフロー

1. release ブランチ作成
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/1.4.0
   ```

2. バージョン更新・最終調整
   ```bash
   # package.json のバージョン更新
   # チェンジログ生成
   # ドキュメント更新
   git commit -m "chore(release): prepare version 1.4.0"
   ```

3. main にマージ
   ```bash
   # プルリクエスト経由でマージ
   # タグ作成
   git tag v1.4.0
   git push origin v1.4.0
   ```

4. develop にマージバック
   ```bash
   # release ブランチの変更を develop に反映
   ```

### hotfix フロー

1. hotfix ブランチ作成
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/1.3.1-security-fix
   ```

2. 修正・テスト
   ```bash
   # 緊急修正
   git commit -m "fix(security): resolve vulnerability in auth module"
   ```

3. 両方にマージ
   ```bash
   # main と develop の両方にマージ
   # タグ作成
   git tag v1.3.1
   ```

## ブランチ命名規則

### 一般ルール

- 小文字とハイフンを使用
- スラッシュでカテゴリを分離
- Issue 番号を含める (可能な場合)
- 簡潔で説明的な名前

### カテゴリ別規則

#### feature ブランチ

```
feature/<issue-number>-<feature-name>
feature/<scope>-<feature-name>
```

例:

```
feature/123-structured-logging
feature/core-plugin-system
feature/transport-file-rotation
```

#### bugfix ブランチ

```
bugfix/<issue-number>-<bug-description>
bugfix/<scope>-<bug-description>
```

例:

```
bugfix/456-memory-leak-fix
bugfix/formatter-timestamp-issue
bugfix/core-null-pointer
```

#### docs ブランチ

```
docs/<issue-number>-<doc-type>
docs/<scope>-<content>
```

例:

```
docs/789-api-reference
docs/readme-installation
docs/dev-standards-update
```

#### チーム開発用ブランチ

```
<team>/<feature>-<description>
<username>/<feature>-<description>
```

例:

```
frontend/ui-redesign
backend/api-optimization
alice/experimental-formatter
```

## ブランチ保護ルール

### main ブランチ

- 直接プッシュ禁止
- プルリクエスト必須
- レビュー必須 (最低1名)
- CI通過必須
- 最新状態必須
- 管理者も制限対象

### develop ブランチ

- 直接プッシュ非推奨
- プルリクエスト推奨
- CI通過必須
- 緊急時は直接プッシュ可

### feature ブランチ

- 自由な開発
- 定期的な rebase 推奨
- CI 通過確認

## マージ戦略

### マージ方式の選択

#### Squash Merge (推奨)

- 使用場面: feature → develop
- メリット: クリーンな履歴
- 方法: GitHub の "Squash and merge"

#### Merge Commit

- 使用場面: release → main, hotfix → main/develop
- メリット: 完全な履歴保持
- 方法: GitHub の "Create a merge commit"

#### Rebase and Merge

- 使用場面: 小さな修正やドキュメント更新
- メリット: 線形履歴
- 方法: GitHub の "Rebase and merge"

### マージ前チェックリスト

- CI が全て通過
- コードレビュー完了
- コンフリクト解決済み
- テストカバレッジ維持
- ドキュメント更新済み
- 破壊的変更の影響確認

## バージョン管理

### バージョニング規則

[Semantic Versioning (SemVer)](https://semver.org/) に準拠:

- MAJOR: 破壊的変更
- MINOR: 後方互換性のある機能追加
- PATCH: 後方互換性のあるバグ修正

### タグ付けルール

```bash
# リリースタグ
v1.0.0
v1.2.3
v2.0.0-beta.1

# プレリリースタグ
v1.0.0-alpha.1
v1.0.0-beta.2
v1.0.0-rc.1
```

### 自動バージョニング

コミットメッセージベースの自動バージョン決定:

- `feat`: MINOR アップ
- `fix`: PATCH アップ
- `BREAKING CHANGE`: MAJOR アップ

## ベストプラクティス

### ブランチ管理

1. 定期的な同期
   ```bash
   # 作業前に必ず最新化
   git checkout develop
   git pull origin develop
   ```

2. 小さく頻繁なコミット
   - 論理的な単位でコミット
   - わかりやすいコミットメッセージ

3. 定期的な rebase
   ```bash
   # feature ブランチで develop を取り込み
   git rebase develop
   ```

### コンフリクト対応

1. 早期発見・解決
2. チーム内でのコミュニケーション
3. 複雑な場合はペアプログラミング

### ブランチ削除

```bash
# ローカルブランチ削除
git branch -d feature/123-add-logging

# リモートブランチ削除
git push origin --delete feature/123-add-logging

# リモート追跡ブランチのクリーンアップ
git remote prune origin
```

## 緊急対応フロー

### 重大な本番障害

1. 即座に hotfix ブランチ作成
2. 最小限の修正でクイックフィックス
3. テスト実行
4. main と develop に緊急マージ
5. 緊急リリース

### セキュリティ脆弱性

1. 非公開で hotfix ブランチ作成
2. セキュリティ修正
3. 限定メンバーでのレビュー
4. 調整されたリリース

## ツール連携

### GitHub Actions

- CI/CD パイプラインの自動実行
- ブランチ保護ルールの強制
- 自動テスト実行

### lefthook

- pre-commit: lint, test, format チェック
- pre-push: テストスイート実行
- commit-msg: コミットメッセージ検証

---

### See Also

- [開発ワークフロー](02-development-workflow.md) - BDD 開発フロー
- [コミットメッセージ規約](03-commit-message-conventions.md) - コミット規約
- [プルリクエスト作成ルール](05-pull-request-rules.md) - PR 作成・レビュー
- [品質保証システム](06-quality-assurance.md) - 品質管理ルール

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
