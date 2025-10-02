---
# Claude Code 必須要素
allowed-tools: Bash(git:*, gh:*), Read(*), Write(*), Task(*)
argument-hint: [subcommand] [options]
description: GitHub Issue 作成・管理システム - issue-generatorエージェントによる構造化Issue作成

# 設定変数
config:
  temp_dir: temp/issues
  issue_types:
    - feature
    - bug
    - enhancement
    - task
  default_editor: ${EDITOR:-code}
  default_pager: ${PAGER:-less}

# サブコマンド定義
subcommands:
  new: "issue-generatorエージェントで新規Issue作成 (デフォルト)"
  list: "保存済みIssueドラフト一覧表示"
  view: "特定のIssueドラフト表示"
  edit: "Issueドラフト編集"
  load: "GitHub IssueをローカルにImport"
  push: "ドラフトをGitHubにPush (新規作成または更新)"

# ag-logger プロジェクト要素
title: idd-issue
version: 2.1.0
created: 2025-09-30
authors:
  - atsushifx
changes:
  - 2025-10-03: セッション管理機能追加 - .last-sessionでコマンド間でIssue状態を保持
  - 2025-10-02: フロントマターベース構造に再構築、/idd-issue に名称変更
  - 2025-09-30: 初版作成 - 6サブコマンド体系でIssue管理機能を実装
---

## /idd-issue

issue-generator エージェントを使用して、GitHub Issue を作成・管理するコマンド。

## Bashヘルパーライブラリ

以下のヘルパー関数は各サブコマンドが使用:

```bash
#!/bin/bash
# Issue管理コマンド用ヘルパー関数集

# 設定初期化
setup_issue_env() {
  export REPO_ROOT=$(git rev-parse --show-toplevel)
  export ISSUES_DIR="$REPO_ROOT/temp/issues"
  export SESSION_FILE="$ISSUES_DIR/.last-session"
  export PAGER="${PAGER:-less}"
  export EDITOR="${EDITOR:-code}"
}

# Issue ディレクトリ作成
ensure_issues_dir() {
  mkdir -p "$ISSUES_DIR"
}

# Issue ファイル検索
# 引数: $1 - Issue番号またはファイル名 (省略時はセッションファイル優先、次に最新ファイル)
# 戻り値: グローバル変数 ISSUE_FILE に見つかったファイルパスを設定
find_issue_file() {
  local ISSUE_INPUT="$1"
  ISSUE_FILE=""

  if [ -z "$ISSUE_INPUT" ]; then
    # 引数なし: セッションファイル優先、次に最新ファイル
    if load_session && [ -f "$ISSUES_DIR/$LAST_ISSUE_FILE" ]; then
      ISSUE_FILE="$ISSUES_DIR/$LAST_ISSUE_FILE"
      echo "📄 Using session: $(basename "$ISSUE_FILE" .md)"
      return 0
    fi

    # フォールバック: 最新ファイルを使用
    ISSUE_FILE=$(ls -t "$ISSUES_DIR"/*.md 2>/dev/null | head -1)
    if [ -z "$ISSUE_FILE" ]; then
      echo "❌ No issue drafts found."
      echo "💡 Run '/idd-issue new' to create one."
      return 1
    fi
    echo "📄 Using latest draft: $(basename "$ISSUE_FILE" .md)"
    return 0

  elif [[ "$ISSUE_INPUT" =~ ^[0-9]+$ ]]; then
    # Issue番号: マッチするファイルを検索
    ISSUE_FILE=$(ls "$ISSUES_DIR"/${ISSUE_INPUT}-*.md 2>/dev/null | head -1)
    if [ -z "$ISSUE_FILE" ]; then
      echo "❌ No draft found for issue #$ISSUE_INPUT"
      return 1
    fi
    echo "📄 Found: $(basename "$ISSUE_FILE" .md)"
    return 0

  else
    # ファイル名直接指定
    ISSUE_FILE="$ISSUES_DIR/$ISSUE_INPUT.md"
    if [ ! -f "$ISSUE_FILE" ]; then
      echo "❌ Issue not found: $ISSUE_INPUT"
      return 1
    fi
    return 0
  fi
}

# Issue ファイル一覧表示
list_issue_files() {
  if [ ! -d "$ISSUES_DIR" ] || [ -z "$(ls -A "$ISSUES_DIR"/*.md 2>/dev/null)" ]; then
    echo "📋 No issue drafts found."
    echo "💡 Create one with: /idd-issue new"
    return 0
  fi

  echo "📋 Issue drafts:"
  echo "=================================================="
  echo ""

  for file in "$ISSUES_DIR"/*.md; do
    [ -f "$file" ] || continue

    local filename=$(basename "$file" .md)
    local title=$(extract_title "$file")
    local modified=$(get_modified_time "$file")

    echo "📄 $filename"
    echo "   Title: $title"
    echo "   Modified: $modified"
    echo ""
  done

  echo "Commands:"
  echo "  /idd-issue view <issue-name>  # View issue"
  echo "  /idd-issue edit <issue-name>  # Edit issue"
  echo "  /idd-issue push <issue-name>  # Push to GitHub"
}

# タイトル抽出
# 引数: $1 - ファイルパス
extract_title() {
  local file="$1"
  head -1 "$file" | sed 's/^#[[:space:]]*//'
}

# 修正日時取得
# 引数: $1 - ファイルパス
get_modified_time() {
  local file="$1"
  stat -c %y "$file" 2>/dev/null | cut -d' ' -f1,2 | cut -d: -f1,2 || \
    date -r "$file" '+%Y-%m-%d %H:%M' 2>/dev/null
}

# Issue種別検出
# 引数: $1 - タイトル文字列
detect_issue_type() {
  local title="$1"

  if [[ "$title" =~ ^\[Feature\] ]]; then
    echo "feature"
  elif [[ "$title" =~ ^\[Bug\] ]]; then
    echo "bug"
  elif [[ "$title" =~ ^\[Enhancement\] ]]; then
    echo "enhancement"
  elif [[ "$title" =~ ^\[Task\] ]]; then
    echo "task"
  else
    echo "issue"
  fi
}

# タイトルからスラッグ生成
# 引数: $1 - タイトル文字列
generate_slug() {
  local title="$1"

  echo "$title" | \
    sed 's/\[.*\][[:space:]]*//' | \
    tr '[:upper:]' '[:lower:]' | \
    sed 's/[^a-z0-9[:space:]-]//g' | \
    tr -s '[:space:]' '-' | \
    sed 's/^-\+//; s/-\+$//' | \
    cut -c1-50
}

# Issue番号抽出
# 引数: $1 - ファイル名
extract_issue_number() {
  local filename="$1"
  echo "$filename" | sed 's/-.*//'
}

# Issue種別一覧表示
show_issue_types() {
  cat << 'EOF'
Available issue types:
  1. [Feature] - 新機能追加要求
  2. [Bug] - バグレポート
  3. [Enhancement] - 既存機能改善
  4. [Task] - 開発・メンテナンスタスク
EOF
}

# GitHub Issue取得
# 引数: $1 - Issue番号
# 戻り値: グローバル変数 ISSUE_TITLE, ISSUE_BODY に取得内容を設定
fetch_github_issue() {
  local ISSUE_NUM="$1"

  echo "🔗 Loading issue #$ISSUE_NUM from GitHub..."

  # Fetch issue using gh CLI
  if ! ISSUE_JSON=$(gh issue view "$ISSUE_NUM" --json 'title,body' 2>/dev/null); then
    echo "❌ GitHub CLI error. Make sure 'gh' is installed and authenticated."
    echo "💡 Run: gh auth login"
    return 1
  fi

  # Extract title and body
  if command -v jq >/dev/null 2>&1; then
    ISSUE_TITLE=$(echo "$ISSUE_JSON" | jq -r '.title // "Untitled"')
    ISSUE_BODY=$(echo "$ISSUE_JSON" | jq -r '.body // ""')
  else
    ISSUE_TITLE=$(echo "$ISSUE_JSON" | grep '"title"' | cut -d'"' -f4)
    ISSUE_BODY=$(echo "$ISSUE_JSON" | grep '"body"' | cut -d'"' -f4)
  fi

  return 0
}

# Issue番号検証
# 引数: $1 - Issue番号
validate_issue_number() {
  local ISSUE_NUM="$1"

  if [ -z "$ISSUE_NUM" ]; then
    echo "❌ GitHub issue number is required."
    echo "Usage: /idd-issue load <issue-number>"
    return 1
  fi

  if ! [[ "$ISSUE_NUM" =~ ^[0-9]+$ ]]; then
    echo "❌ Invalid issue number. Must be a number."
    return 1
  fi

  return 0
}

# Issueファイル保存
# 引数: $1 - ファイルパス, $2 - タイトル, $3 - 本文
save_issue_file() {
  local file="$1"
  local title="$2"
  local body="$3"

  cat > "$file" << EOF
# $title

$body
EOF
}

# GitHub Issueプッシュ (新規作成)
# 引数: $1 - タイトル, $2 - 本文ファイル, $3 - 元のファイル名
push_new_issue() {
  local title="$1"
  local body_file="$2"
  local old_name="$3"

  echo "🆕 Creating new issue..."

  if NEW_URL=$(gh issue create --title "$title" --body-file "$body_file"); then
    ISSUE_NUM=$(echo "$NEW_URL" | sed 's/.*\/issues\///')

    echo "✅ New issue #$ISSUE_NUM created successfully!"
    echo "🔗 URL: $NEW_URL"

    # Rename file: new-* → {issue-num}-*
    NEW_FILENAME=$(echo "$old_name" | sed "s/^new-/$ISSUE_NUM-/")
    mv "$ISSUE_FILE" "$ISSUES_DIR/$NEW_FILENAME.md"
    echo "📝 Issue file renamed: $NEW_FILENAME"
    return 0
  else
    echo "❌ Failed to create issue"
    return 1
  fi
}

# GitHub Issueプッシュ (既存更新)
# 引数: $1 - Issue番号, $2 - タイトル, $3 - 本文ファイル
push_existing_issue() {
  local issue_num="$1"
  local title="$2"
  local body_file="$3"

  echo "🔄 Updating existing issue #$issue_num..."

  if gh issue edit "$issue_num" --title "$title" --body-file "$body_file"; then
    echo "✅ Issue #$issue_num updated successfully!"
    return 0
  else
    echo "❌ Failed to update issue"
    return 1
  fi
}

# セッションファイル存在確認
has_session() {
  [ -f "$SESSION_FILE" ]
}

# セッション情報読み込み
# グローバル変数にLAST_*変数を設定
load_session() {
  if has_session; then
    source "$SESSION_FILE"
    return 0
  fi
  return 1
}

# セッション情報保存
# 引数: $1 - ファイル名, $2 - Issue番号, $3 - タイトル, $4 - 種別, $5 - コマンド名
save_session() {
  local filename="$1"
  local issue_num="$2"
  local title="$3"
  local issue_type="$4"
  local command="$5"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  cat > "$SESSION_FILE" << EOF
# Last issue session
LAST_ISSUE_FILE="$filename"
LAST_ISSUE_NUMBER="$issue_num"
LAST_ISSUE_TITLE="$title"
LAST_ISSUE_TYPE="$issue_type"
LAST_TIMESTAMP="$timestamp"
LAST_COMMAND="$command"
EOF
}
```

## 実行フロー

1. **設定読み込み**: メタデータの `config` セクションから設定を取得
2. **パス構築**: `{git_root}/{temp_dir}` で Issue ドラフトディレクトリパスを構築
3. **サブコマンド実行**: 以下のいずれかを実行

### Subcommand: new (デフォルト)

```bash
#!/bin/bash
setup_issue_env
ensure_issues_dir

echo "🚀 Launching issue-generator agent..."
echo ""
show_issue_types
echo ""

# Note: Claude will invoke issue-generator agent via Task tool
# Agent will guide the user through issue creation interactively
# After issue creation, the agent must save session using:
#   save_session "$FILENAME" "$ISSUE_NUM" "$TITLE" "$ISSUE_TYPE" "new"
```

### Subcommand: list

```bash
#!/bin/bash
setup_issue_env
list_issue_files
```

### Subcommand: view

```bash
#!/bin/bash
setup_issue_env

# Get issue name from argument or use latest
if ! find_issue_file "$1"; then
  exit 1
fi

echo "=================================================="
$PAGER "$ISSUE_FILE"
echo "=================================================="
echo "📊 $(wc -l < "$ISSUE_FILE") lines, $(wc -w < "$ISSUE_FILE") words"

# Save session
FILENAME=$(basename "$ISSUE_FILE" .md)
TITLE=$(extract_title "$ISSUE_FILE")
ISSUE_TYPE=$(detect_issue_type "$TITLE")
ISSUE_NUM=$(extract_issue_number "$FILENAME")
save_session "$FILENAME" "$ISSUE_NUM" "$TITLE" "$ISSUE_TYPE" "view"

echo ""
echo "Commands:"
echo "  /idd-issue edit $(basename "$ISSUE_FILE" .md)  # Edit this issue"
echo "  /idd-issue push $(basename "$ISSUE_FILE" .md)  # Push to GitHub"
```

### Subcommand: edit

```bash
#!/bin/bash
setup_issue_env

# Get issue name from argument or use latest
if ! find_issue_file "$1"; then
  exit 1
fi

echo "📝 Opening in $EDITOR..."
$EDITOR "$ISSUE_FILE"
echo "✅ Issue edited"

# Save session
FILENAME=$(basename "$ISSUE_FILE" .md)
TITLE=$(extract_title "$ISSUE_FILE")
ISSUE_TYPE=$(detect_issue_type "$TITLE")
ISSUE_NUM=$(extract_issue_number "$FILENAME")
save_session "$FILENAME" "$ISSUE_NUM" "$TITLE" "$ISSUE_TYPE" "edit"
```

### Subcommand: load

```bash
#!/bin/bash
setup_issue_env
ensure_issues_dir

# Validate issue number
if ! validate_issue_number "$1"; then
  exit 1
fi

ISSUE_NUM="$1"

# Fetch from GitHub
if ! fetch_github_issue "$ISSUE_NUM"; then
  exit 1
fi

# Generate filename
ISSUE_TYPE=$(detect_issue_type "$ISSUE_TITLE")
SLUG=$(generate_slug "$ISSUE_TITLE")
TIMESTAMP=$(date '+%y%m%d-%H%M%S')
FILENAME="${ISSUE_NUM}-${TIMESTAMP}-${ISSUE_TYPE}-${SLUG}.md"
ISSUE_FILE="$ISSUES_DIR/$FILENAME"

# Save issue file
save_issue_file "$ISSUE_FILE" "$ISSUE_TITLE" "$ISSUE_BODY"

# Save session
save_session "$FILENAME" "$ISSUE_NUM" "$ISSUE_TITLE" "$ISSUE_TYPE" "load"

echo "✅ Issue imported successfully!"
echo "📝 Saved as: $FILENAME"
echo ""
echo "Next steps:"
echo "  /idd-issue view $ISSUE_NUM   # View imported issue"
echo "  /idd-issue edit $ISSUE_NUM   # Edit imported issue"
echo "  /idd-issue push $ISSUE_NUM   # Push changes back to GitHub"
```

### Subcommand: push

```bash
#!/bin/bash
setup_issue_env

# Find issue file
if ! find_issue_file "$1"; then
  exit 1
fi

ISSUE_NAME=$(basename "$ISSUE_FILE" .md)

# Extract title
TITLE=$(extract_title "$ISSUE_FILE")
if [ -z "$TITLE" ]; then
  echo "❌ Could not extract title from issue"
  exit 1
fi

echo "📝 Title: $TITLE"

# Create temporary body file without H1 heading
TEMP_BODY=$(mktemp)
tail -n +2 "$ISSUE_FILE" > "$TEMP_BODY"

# Push to GitHub: Create new or update existing
if [[ "$ISSUE_NAME" =~ ^new- ]]; then
  push_new_issue "$TITLE" "$TEMP_BODY" "$ISSUE_NAME"
  RESULT=$?
  # After successful push, update ISSUE_NAME and ISSUE_FILE for session save
  if [ $RESULT -eq 0 ]; then
    ISSUE_NAME=$(basename "$ISSUE_FILE" .md)
  fi
elif [[ "$ISSUE_NAME" =~ ^[0-9]+ ]]; then
  ISSUE_NUM=$(extract_issue_number "$ISSUE_NAME")
  push_existing_issue "$ISSUE_NUM" "$TITLE" "$TEMP_BODY"
  RESULT=$?
else
  echo "❌ Invalid issue name format. Must start with 'new-' or a number."
  RESULT=1
fi

# Cleanup
rm -f "$TEMP_BODY"

if [ $RESULT -ne 0 ]; then
  exit 1
fi

# Save session after successful push
ISSUE_TYPE=$(detect_issue_type "$TITLE")
ISSUE_NUM=$(extract_issue_number "$ISSUE_NAME")
save_session "$ISSUE_NAME" "$ISSUE_NUM" "$TITLE" "$ISSUE_TYPE" "push"

echo ""
echo "🎉 Push completed!"
echo ""
echo "Next steps:"
echo "  /idd-issue list  # List all issues"
```

## アーキテクチャの特徴

- エージェント連携: Issue 生成の複雑なロジックを issue-generator エージェントに委譲
- 関数化設計: 共通ロジックをヘルパー関数に集約し、各サブコマンドは 5-15行程度に簡素化
- 明確な責務分離: 生成 (agent) とユーティリティ (local scripts) を分離
- 設定の一元管理: フロントマターで設定・サブコマンド定義を集約
- 保守しやすい設計: 共通ロジックの修正はヘルパー関数のみで完結
- 拡張しやすい設計: 新サブコマンドはヘルパー関数を組み合わせるだけで実現可能

## issue-generatorエージェントとの連携

`/idd-issue new` コマンドは以下の流れで動作:

1. **コマンド実行**: ユーザーが `/idd-issue new` を実行
2. **Issue種別選択**: 利用可能な Issue 種別を表示
3. **エージェント起動**: Claude が Task tool で issue-generator エージェントを起動
4. **エージェント処理**:
   - Issue 種別とタイトル取得
   - `.github/ISSUE_TEMPLATE/{種別}.yml` 読み込み
   - YML 構造解析
   - 対話的な情報収集
   - Issue ドラフト生成
   - `temp/issues/new-{timestamp}-{type}-{slug}.md` に保存
   - セッション保存: `save_session()` でセッション情報を保存
5. **完了報告**: エージェントが生成結果を報告

### セッション管理

各サブコマンド実行後、`temp/issues/.last-session` にセッション情報を保存:

- 引数なしでコマンド実行時、セッションファイル優先で Issue を選択
- 後方互換性: セッションがない場合は最新ファイルを使用

## ファイル命名規則

Issue ドラフトファイルは決定的な命名規則を使用:

- 新規 Issue: `new-{yymmdd-HHMMSS}-{type}-{slug}.md`
  - 例: `new-251002-143022-feature-user-authentication.md`
- Import 済み Issue: `{issue-num}-{yymmdd-HHMMSS}-{type}-{slug}.md`
  - 例: `123-251002-143500-bug-form-validation.md`

## 使用例

### 新規Issue作成

```bash
/idd-issue new
# → issue-generatorエージェントが起動し、対話的にIssue作成
```

### Issue一覧表示

```bash
/idd-issue list
# → temp/issues/ 内のすべてのIssueドラフトを表示
```

### Issue表示・編集

```bash
/idd-issue view 123           # Issue番号で検索
/idd-issue view new-251002-*  # ファイル名で指定
/idd-issue view               # 最新のIssueを表示

/idd-issue edit 123           # Issue番号で検索して編集
/idd-issue edit               # 最新のIssueを編集
```

### GitHub連携

```bash
/idd-issue load 123           # GitHubからIssue #123をImport
/idd-issue push new-251002-*  # 新規Issueを作成
/idd-issue push 123           # 既存Issue #123を更新
```

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
