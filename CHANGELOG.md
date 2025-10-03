# Changelog

All notable changes to this project will be documented in this file.

## [2.2.0] - 2025-10-03

### Added

- `/idd-issue branch`サブコマンド: Issue からブランチ名を自動提案・作成
  - codex-mcp による commitlint 準拠のブランチ名生成 (`<type>-<issue-no>/<scope>/<title-slug>`)
  - `-c`オプションでブランチ作成・切り替え (`git switch -c`)
  - セッションへのブランチ名保存・再利用機能
- ヘルパー関数の追加:
  - `analyze_issue_for_branch()`: codex-mcp による Issue 分析
  - `switch_to_existing_branch()`: 既存ブランチへの切り替え
  - `create_branch_from_suggestion()`: 新規ブランチ作成
  - `extract_issue_metadata()`: Issue メタデータ一括抽出
  - `update_issue_session()`: セッション更新の統一インターフェース

### Changed

- セッションファイルに`LAST_BRANCH_NAME`フィールドを追加
- view/edit/push/branch サブコマンドでメタデータ抽出処理を関数化
- `git checkout`から`git switch`へ移行

### Improved

- コードの重複削減 (約 20行削減)
- サブコマンドの可読性向上
- メンテナンス性向上 (共通処理の一元化)
