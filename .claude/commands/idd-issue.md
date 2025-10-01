---
# Claude Code 必須要素
allowed-tools: Bash(git:*, gh:*), Read(*), Write(*)
argument-hint: [subcommand] [options]
description: GitHub Issue 作成・管理システム - 5つのサブコマンドでFeature/Bug/Enhancement/Taskの構造化Issue作成からGitHub連携まで

# ag-logger プロジェクト要素
title: new-issue
version: 1.0.0
created: 2025-09-30
authors:
  - atsushifx
changes:
  - 2025-09-30: 初版作成 - 5サブコマンド体系でIssue管理機能を実装
---

## /new-issue

AI を使用して、新規に issue を作成し登録する。あるいは、ロードした issue をレビュー、編集して登録しなおすコマンド。

<!-- markdownlint-disable no-duplicate-heading -->

## Utility Functions

### generate_issue_filename - 決定的なファイル名生成関数

```bash
#!/usr/bin/env bash
# generate_issue_filename - Deterministic issue filename generator
# Usage: generate_issue_filename <issue_type> <title> [issue_number]
# Format: [new/123]-yymmdd-hhmmss-<type>-<title-slug>.md
#
# Examples:
#   generate_issue_filename feature "Add logging" new
#   -> new-251002-143022-feature-add-logging.md
#
#   generate_issue_filename bug "Fix error" 123
#   -> 123-251002-143022-bug-fix-error.md

generate_issue_filename() {
  local issue_type="$1"
  local title="$2"
  local issue_number="${3:-new}"

  # Generate timestamp: yymmdd-hhmmss
  local timestamp
  timestamp=$(date '+%y%m%d-%H%M%S')

  # Slugify title: lowercase, remove special chars, replace spaces with hyphens
  local title_slug
  title_slug=$(echo "$title" | \
    sed 's/\[.*\][[:space:]]*//' | \
    tr '[:upper:]' '[:lower:]' | \
    sed 's/[^a-z0-9[:space:]-]//g' | \
    tr -s '[:space:]' '-' | \
    sed 's/^-\+//; s/-\+$//' | \
    cut -c1-50)

  # Normalize issue type
  local type_prefix
  case "$issue_type" in
    feature|Feature) type_prefix="feature" ;;
    bug|Bug) type_prefix="bug" ;;
    enhancement|Enhancement) type_prefix="enhancement" ;;
    task|Task) type_prefix="task" ;;
    *) type_prefix="issue" ;;
  esac

  # Build filename: [new/123]-yymmdd-hhmmss-type-title.md
  local filename="${issue_number}-${timestamp}-${type_prefix}-${title_slug}.md"

  echo "$filename"
}
```

## Quick Reference

### Usage

```bash
# Main command (interactive issue creation)
/new-issue [options]

# Subcommands
/new-issue <subcommand> [options]
```

### Subcommands

- `create`: 新しい Issue 作成（対話型）
- `list`: 保存済み Issue ドラフト一覧表示
- `view <issue-name>`: 特定の Issue ドラフト表示
- `edit <issue-name>`: Issue ドラフトをエディタで編集
- `load <issue-number>`: GitHub Issue 番号でローカルにインポート
- `push [issue-name]`: ドラフトを GitHub に push（新規作成または既存更新）

### Issue Types

- `[Feature]`: 新機能追加要求
- `[Bug]`: バグレポート
- `[Enhancement]`: 既存機能改善
- `[Task]`: 開発・メンテナンスタスク

### Examples

```bash
# 対話型でIssue作成
/new-issue create

# 保存済みIssue一覧
/new-issue list

# 特定のIssue表示
/new-issue view feature-user-auth

# Issue編集
/new-issue edit bug-form-validation

# GitHub IssueをローカルにImport
/new-issue load 123

# ドラフトをGitHubにpush
/new-issue push feature-user-auth
```

## Help Display

```python
print("new-issue - GitHub Issue 作成・管理システム")
print("")
print("Usage: /new-issue [subcommand] [options]")
print("")
print("Subcommands:")
print("  create                新しいIssue作成（対話型）")
print("  list                  保存済みIssueドラフト一覧")
print("  view <issue-name>     特定のIssueドラフト表示")
print("  edit <issue-name>     Issueドラフトをエディタで編集")
print("  load <issue-number>   GitHub Issue番号でローカルにImport")
print("  push [issue-name]     ドラフトをGitHubにpush（新規作成または既存更新）")
print("")
print("Issue Types:")
print("  [Feature]             新機能追加要求")
print("  [Bug]                 バグレポート")
print("  [Enhancement]         既存機能改善")
print("  [Task]                開発・メンテナンスタスク")
print("")
print("Examples:")
print("  /new-issue create            # 対話型でIssue作成")
print("  /new-issue list              # 保存済みIssue一覧")
print("  /new-issue view feature-auth # 特定のIssue表示")
print("  /new-issue edit bug-form     # Issue編集")
print("  /new-issue load 123          # GitHub Import")
print("  /new-issue push feature-auth # GitHub Push")
```

## Simple Setup

```python
import sys
import os
import subprocess

# Simple setup - Claude handles all complex logic
subcommand = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else None
issue_name = sys.argv[2] if len(sys.argv) > 2 else None

# Help display
if '--help' in sys.argv or '-h' in sys.argv or (not subcommand and len(sys.argv) == 1):
    print("new-issue - GitHub Issue 作成・管理システム")
    print("Usage: /new-issue [subcommand] [options]")
    print("Subcommands: create, list, view, edit, load, push")
    exit(0)

# Basic path setup
try:
    repo_root = subprocess.run(['git', 'rev-parse', '--show-toplevel'],
                             capture_output=True, text=True, check=True).stdout.strip()
except:
    repo_root = "."

issues_dir = os.path.join(repo_root, 'temp', 'issues')
os.makedirs(issues_dir, exist_ok=True)

print(f"Subcommand: {subcommand or 'create'}")
print(f"Issues directory: {issues_dir}")

# Issue types - new-issue-creator agent will generate detailed templates
ISSUE_TYPES = {
    'feature': '[Feature] - 新機能追加要求',
    'bug': '[Bug] - バグレポート',
    'enhancement': '[Enhancement] - 既存機能改善',
    'task': '[Task] - 開発・メンテナンスタスク'
}

# new-issue-creator agent will handle all template generation and processing logic
```

## Subcommand Execution

### Subcommand: create

```bash
#!/bin/bash
set -e

# Setup paths
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
ISSUES_DIR="$REPO_ROOT/temp/issues"
mkdir -p "$ISSUES_DIR"

echo "🔧 Creating new issue..."
echo "Available issue types:"
echo "  1. [Feature] - 新機能追加要求"
echo "  2. [Bug] - バグレポート"
echo "  3. [Enhancement] - 既存機能改善"
echo "  4. [Task] - 開発・メンテナンスタスク"
echo ""

# Get issue type
ISSUE_TYPE=""
if [[ "$*" == *"--type="* ]]; then
    ISSUE_TYPE=$(echo "$*" | grep -o -- '--type=[^[:space:]]*' | cut -d= -f2)
fi

if [ -z "$ISSUE_TYPE" ]; then
    read -p "Select issue type (1-4): " choice
    case $choice in
        1) ISSUE_TYPE="feature" ;;
        2) ISSUE_TYPE="bug" ;;
        3) ISSUE_TYPE="enhancement" ;;
        4) ISSUE_TYPE="task" ;;
        *) echo "❌ Invalid choice. Please select 1-4."; exit 1 ;;
    esac
fi

# Get issue title
read -p "Enter [$(echo ${ISSUE_TYPE^})] title: " title
if [ -z "$title" ]; then
    echo "❌ Title is required."
    exit 1
fi

# Generate deterministic filename using utility function
ISSUE_FILENAME=$(generate_issue_filename "$ISSUE_TYPE" "$title" "new")
ISSUE_FILE="$ISSUES_DIR/$ISSUE_FILENAME"

echo ""
echo "🤖 Generating issue with new-issue-creator agent..."
echo "Issue type: $ISSUE_TYPE"
echo "Title: $title"
echo "File: $ISSUE_FILE"
echo ""
echo "Claude will now use the new-issue-creator agent to generate detailed issue content."
echo ""

# Agent will create the file with proper template
echo "✅ Issue metadata prepared: $ISSUE_FILE"
echo "📝 Issue filename: $ISSUE_FILENAME"
echo ""
echo "Next steps:"
echo "  /new-issue view $ISSUE_FILENAME  # View content"
echo "  /new-issue edit $ISSUE_FILENAME  # Edit in editor"
echo "  /new-issue push $ISSUE_FILENAME  # Push to GitHub"
echo "  /new-issue list                  # List all issues"
```

### Subcommand: list

```bash
#!/bin/bash
set -e

# Setup paths
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
ISSUES_DIR="$REPO_ROOT/temp/issues"

if [ ! -d "$ISSUES_DIR" ]; then
    echo "No issues directory found. Create an issue first with '/new-issue create'"
    exit 1
fi

# Count markdown files
FILE_COUNT=$(ls -1 "$ISSUES_DIR"/*.md 2>/dev/null | wc -l)

if [ "$FILE_COUNT" -eq 0 ]; then
    echo "No issue drafts found."
    echo "Create one with: /new-issue create"
    exit 0
fi

echo "📋 Issue drafts in $ISSUES_DIR:"
echo "=================================================="

i=1
for file in "$ISSUES_DIR"/*.md; do
    if [ -f "$file" ]; then
        issue_name=$(basename "$file" .md)

        # Extract title from first line
        title=$(head -1 "$file" | sed 's/^#[[:space:]]*//' || echo "No title")

        # Get modification time
        modified=$(date -r "$file" '+%Y-%m-%d %H:%M' 2>/dev/null || stat -c %y "$file" | cut -d' ' -f1,2 | cut -d: -f1,2)

        printf "%2d. %s\n" "$i" "$issue_name"
        echo "    Title: $title"
        echo "    Modified: $modified"
        echo ""

        i=$((i + 1))
    fi
done

echo "Commands:"
echo "  /new-issue view <issue-name>  # View specific issue"
echo "  /new-issue edit <issue-name>  # Edit specific issue"
echo "  /new-issue push <issue-name>  # Push to GitHub"
```

### Subcommand: view

```bash
#!/bin/bash
set -e

# Setup paths
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
ISSUES_DIR="$REPO_ROOT/temp/issues"

# Function: Select issue using fzf
select_issue_with_fzf() {
    if ! command -v fzf >/dev/null 2>&1; then
        return 1
    fi

    cd "$ISSUES_DIR"
    local selected=$(ls -t *.md 2>/dev/null | fzf \
        --height=40% \
        --layout=reverse \
        --preview='head -20 {}' \
        --preview-window='right:60%:wrap' \
        --header='Select issue to view (ESC to cancel)')

    if [ -n "$selected" ]; then
        basename "$selected" .md
    else
        echo ""
    fi
}

# Function: Get latest (current) draft
get_current_draft() {
    local latest_file=$(ls -t "$ISSUES_DIR"/*.md 2>/dev/null | head -1)
    if [ -n "$latest_file" ]; then
        basename "$latest_file" .md
    else
        echo ""
    fi
}

# Function: Find draft by issue number
find_draft_by_number() {
    local issue_num="$1"
    local matching_file=$(ls "$ISSUES_DIR"/${issue_num}-*.md 2>/dev/null | head -1)
    if [ -n "$matching_file" ]; then
        basename "$matching_file" .md
    else
        echo ""
    fi
}

# Function: List available drafts
list_available_drafts() {
    ls -1 "$ISSUES_DIR"/*.md 2>/dev/null | sed 's/.*\///' | sed 's/\.md$//'
}

# Main: Resolve issue name from input
ISSUE_INPUT="$2"
ISSUE_NAME=""

if [ -z "$ISSUE_INPUT" ]; then
    # Case 1: No argument → try fzf selection, fallback to current draft
    if command -v fzf >/dev/null 2>&1; then
        ISSUE_NAME=$(select_issue_with_fzf)
        if [ -z "$ISSUE_NAME" ]; then
            echo "⚠️  Selection cancelled"
            exit 0
        fi
        echo "📄 Selected: $ISSUE_NAME"
    else
        ISSUE_NAME=$(get_current_draft)
        if [ -z "$ISSUE_NAME" ]; then
            echo "❌ No issue drafts found."
            exit 1
        fi
        echo "📄 Viewing current draft: $ISSUE_NAME"
    fi

elif [[ "$ISSUE_INPUT" =~ ^[0-9]+$ ]]; then
    # Case 2: Issue number only → find matching draft
    ISSUE_NAME=$(find_draft_by_number "$ISSUE_INPUT")
    if [ -z "$ISSUE_NAME" ]; then
        echo "❌ No draft found for issue #$ISSUE_INPUT"
        echo ""
        echo "Available drafts:"
        list_available_drafts
        exit 1
    fi
    echo "📄 Found draft: $ISSUE_NAME"

else
    # Case 3: Full issue name provided
    ISSUE_NAME="$ISSUE_INPUT"
fi

# Validate file exists
ISSUE_FILE="$ISSUES_DIR/$ISSUE_NAME.md"
if [ ! -f "$ISSUE_FILE" ]; then
    echo "❌ Issue not found: $ISSUE_NAME"
    exit 1
fi

# Display issue with pager
PAGER="${PAGER:-less}"
echo "📁 File: $ISSUE_FILE"
echo "============================================================"

if command -v "$PAGER" >/dev/null 2>&1; then
    cat "$ISSUE_FILE" | "$PAGER"
else
    cat "$ISSUE_FILE"
fi

# Show file stats
LINES=$(wc -l < "$ISSUE_FILE")
WORDS=$(wc -w < "$ISSUE_FILE")
echo "============================================================"
echo "📊 Stats: $LINES lines, $WORDS words"

echo ""
echo "Commands:"
echo "  /new-issue edit $ISSUE_NAME  # Edit this issue"
echo "  /new-issue push $ISSUE_NAME  # Push to GitHub"
echo "  /new-issue list              # List all issues"
```

### Subcommand: edit

```bash
#!/bin/bash
set -e

# Setup paths
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
ISSUES_DIR="$REPO_ROOT/temp/issues"

# Function: Select issue using fzf
select_issue_with_fzf() {
    if ! command -v fzf >/dev/null 2>&1; then
        return 1
    fi

    cd "$ISSUES_DIR"
    local selected=$(ls -t *.md 2>/dev/null | fzf \
        --height=40% \
        --layout=reverse \
        --preview='head -20 {}' \
        --preview-window='right:60%:wrap' \
        --header='Select issue to edit (ESC to cancel)')

    if [ -n "$selected" ]; then
        basename "$selected" .md
    else
        echo ""
    fi
}

# Function: Get latest (current) draft
get_current_draft() {
    local latest_file=$(ls -t "$ISSUES_DIR"/*.md 2>/dev/null | head -1)
    if [ -n "$latest_file" ]; then
        basename "$latest_file" .md
    else
        echo ""
    fi
}

# Function: Find draft by issue number
find_draft_by_number() {
    local issue_num="$1"
    local matching_file=$(ls "$ISSUES_DIR"/${issue_num}-*.md 2>/dev/null | head -1)
    if [ -n "$matching_file" ]; then
        basename "$matching_file" .md
    else
        echo ""
    fi
}

# Function: List available drafts
list_available_drafts() {
    ls -1 "$ISSUES_DIR"/*.md 2>/dev/null | sed 's/.*\///' | sed 's/\.md$//'
}

# Main: Resolve issue name from input
ISSUE_INPUT="$2"
ISSUE_NAME=""

if [ -z "$ISSUE_INPUT" ]; then
    # Case 1: No argument → try fzf selection, fallback to current draft
    if command -v fzf >/dev/null 2>&1; then
        ISSUE_NAME=$(select_issue_with_fzf)
        if [ -z "$ISSUE_NAME" ]; then
            echo "⚠️  Selection cancelled"
            exit 0
        fi
        echo "📝 Selected: $ISSUE_NAME"
    else
        ISSUE_NAME=$(get_current_draft)
        if [ -z "$ISSUE_NAME" ]; then
            echo "❌ No issue drafts found."
            exit 1
        fi
        echo "📝 Editing current draft: $ISSUE_NAME"
    fi

elif [[ "$ISSUE_INPUT" =~ ^[0-9]+$ ]]; then
    # Case 2: Issue number only → find matching draft
    ISSUE_NAME=$(find_draft_by_number "$ISSUE_INPUT")
    if [ -z "$ISSUE_NAME" ]; then
        echo "❌ No draft found for issue #$ISSUE_INPUT"
        echo ""
        echo "Available drafts:"
        list_available_drafts
        exit 1
    fi
    echo "📝 Found draft: $ISSUE_NAME"

else
    # Case 3: Full issue name provided
    ISSUE_NAME="$ISSUE_INPUT"
fi

# Validate file exists
ISSUE_FILE="$ISSUES_DIR/$ISSUE_NAME.md"
if [ ! -f "$ISSUE_FILE" ]; then
    echo "❌ Issue not found: $ISSUE_NAME"
    exit 1
fi

# Open in editor
EDITOR="${EDITOR:-code}"
echo "📝 Opening $ISSUE_NAME in $EDITOR..."
if command -v "$EDITOR" >/dev/null 2>&1; then
    "$EDITOR" "$ISSUE_FILE"
    echo "✅ Issue edited: $ISSUE_FILE"
else
    echo "❌ Editor '$EDITOR' not found."
    echo "Set EDITOR environment variable or install VS Code."
    exit 1
fi
```

### Subcommand: load

```bash
#!/bin/bash
set -e

# Setup paths
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
ISSUES_DIR="$REPO_ROOT/temp/issues"
mkdir -p "$ISSUES_DIR"

# Get issue number from command line
ISSUE_NUM="$2"

if [ -z "$ISSUE_NUM" ]; then
    echo "❌ GitHub issue number is required."
    echo "Usage: /new-issue load 123"
    exit 1
fi

# Validate issue number format
if ! [[ "$ISSUE_NUM" =~ ^[0-9]+$ ]]; then
    echo "❌ Invalid issue number. Must be a number."
    echo "Usage: /new-issue load 123"
    exit 1
fi

# Get repository info from git remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo "❌ Could not determine repository. No git remote 'origin' found."
    exit 1
fi

# Extract owner/repo from remote URL
REPO_INFO=$(echo "$REMOTE_URL" | sed 's/.*github\.com[:/]\(.*\)\.git$/\1/' | sed 's/.*github\.com[:/]\(.*\)$/\1/')

echo "🔗 Loading issue from GitHub..."
echo "Repository: $REPO_INFO"
echo "Issue: #$ISSUE_NUM"

# Fetch issue data using gh CLI
if ! ISSUE_JSON=$(gh issue view "$ISSUE_NUM" --json 'title,body' 2>/dev/null); then
    echo "❌ GitHub CLI error. Make sure 'gh' is installed and you're authenticated."
    echo "Run: gh auth login"
    exit 1
fi

# Extract data using jq or simple parsing
if command -v jq >/dev/null 2>&1; then
    TITLE=$(echo "$ISSUE_JSON" | jq -r '.title // "Untitled"')
    BODY=$(echo "$ISSUE_JSON" | jq -r '.body // "No content available"')
else
    # Fallback parsing without jq
    TITLE=$(echo "$ISSUE_JSON" | grep '"title"' | cut -d'"' -f4)
    BODY=$(echo "$ISSUE_JSON" | grep '"body"' | cut -d'"' -f4)
fi

# Detect issue type from title tags
ISSUE_TYPE="issue"
if [[ "$TITLE" =~ ^\[Feature\] ]]; then
    ISSUE_TYPE="feature"
elif [[ "$TITLE" =~ ^\[Bug\] ]]; then
    ISSUE_TYPE="bug"
elif [[ "$TITLE" =~ ^\[Enhancement\] ]]; then
    ISSUE_TYPE="enhancement"
elif [[ "$TITLE" =~ ^\[Task\] ]]; then
    ISSUE_TYPE="task"
fi

# Generate deterministic filename using utility function
ISSUE_FILENAME=$(generate_issue_filename "$ISSUE_TYPE" "$TITLE" "$ISSUE_NUM")
ISSUE_FILE="$ISSUES_DIR/$ISSUE_FILENAME"

# Create markdown content (simple format: title + body only)
cat > "$ISSUE_FILE" << EOF
# $TITLE

$BODY
EOF

echo "✅ Issue imported successfully!"
echo "📝 Saved as: $ISSUE_FILENAME"
echo "📁 File: $ISSUE_FILE"
echo ""
echo "Next steps:"
echo "  /new-issue view $ISSUE_FILENAME  # View imported issue"
echo "  /new-issue edit $ISSUE_FILENAME  # Edit imported issue"
echo "  /new-issue push $ISSUE_FILENAME  # Push changes back to GitHub"
```

### Subcommand: push

```bash
#!/bin/bash
set -e

# Setup paths
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
ISSUES_DIR="$REPO_ROOT/temp/issues"

# Function: Get latest (current) draft
get_current_draft() {
    local latest_file=$(ls -t "$ISSUES_DIR"/*.md 2>/dev/null | head -1)
    if [ -n "$latest_file" ]; then
        basename "$latest_file" .md
    else
        echo ""
    fi
}

# Function: Find draft by issue number
find_draft_by_number() {
    local issue_num="$1"
    local matching_file=$(ls "$ISSUES_DIR"/${issue_num}-*.md 2>/dev/null | head -1)
    if [ -n "$matching_file" ]; then
        basename "$matching_file" .md
    else
        echo ""
    fi
}

# Function: List available drafts
list_available_drafts() {
    ls -1 "$ISSUES_DIR"/*.md 2>/dev/null | sed 's/.*\///' | sed 's/\.md$//'
}

# Main: Resolve issue name from input
ISSUE_INPUT="$2"
ISSUE_NAME=""

if [ -z "$ISSUE_INPUT" ]; then
    # Case 1: No argument → use current (latest) draft
    ISSUE_NAME=$(get_current_draft)
    if [ -z "$ISSUE_NAME" ]; then
        echo "❌ No issue drafts found."
        exit 1
    fi
    echo "📤 Pushing current draft: $ISSUE_NAME"

elif [[ "$ISSUE_INPUT" =~ ^[0-9]+$ ]]; then
    # Case 2: Issue number only → find matching draft
    ISSUE_NAME=$(find_draft_by_number "$ISSUE_INPUT")
    if [ -z "$ISSUE_NAME" ]; then
        echo "❌ No draft found for issue #$ISSUE_INPUT"
        echo ""
        echo "Available drafts:"
        list_available_drafts
        exit 1
    fi
    echo "📤 Found draft: $ISSUE_NAME"

else
    # Case 3: Full issue name provided
    ISSUE_NAME="$ISSUE_INPUT"
fi

# Validate file exists
ISSUE_FILE="$ISSUES_DIR/$ISSUE_NAME.md"
if [ ! -f "$ISSUE_FILE" ]; then
    echo "❌ Issue not found: $ISSUE_NAME"
    exit 1
fi

# Extract title from first heading (preserve [Feature]/[Bug]/[Enhancement]/[Task] tags)
TITLE=$(head -20 "$ISSUE_FILE" | grep "^#[^#]" | head -1 | sed 's/^#[[:space:]]*//')
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
    # Create new issue
    echo "🆕 Creating new issue..."

    if NEW_URL=$(gh issue create --title "$TITLE" --body-file "$TEMP_BODY"); then
        ISSUE_NUM=$(echo "$NEW_URL" | sed 's/.*\/issues\///')

        echo "✅ New issue #$ISSUE_NUM created successfully!"
        echo "🔗 URL: $NEW_URL"

        # Rename file: new-yymmdd-hhmmss-type-title.md → 123-yymmdd-hhmmss-type-title.md
        NEW_ISSUE_NAME=$(echo "$ISSUE_NAME" | sed "s/^new-/$ISSUE_NUM-/")
        NEW_ISSUE_FILE="$ISSUES_DIR/$NEW_ISSUE_NAME"

        mv "$ISSUE_FILE" "$NEW_ISSUE_FILE"
        echo "📝 Issue file renamed: $NEW_ISSUE_NAME"
        ISSUE_NAME="$NEW_ISSUE_NAME"
    else
        echo "❌ Failed to create issue"
        exit 1
    fi

    # Clean up temporary file
    rm -f "$TEMP_BODY"

elif [[ "$ISSUE_NAME" =~ ^[0-9]+ ]]; then
    # Update existing issue
    ISSUE_NUM=$(echo "$ISSUE_NAME" | sed 's/-.*//')
    echo "🔄 Updating existing issue #$ISSUE_NUM"

    if gh issue edit "$ISSUE_NUM" --title "$TITLE" --body-file "$TEMP_BODY"; then
        echo "✅ Issue #$ISSUE_NUM updated successfully!"
    else
        echo "❌ Failed to update issue"
        exit 1
    fi

    # Clean up temporary file
    rm -f "$TEMP_BODY"

else
    echo "❌ Invalid issue name format. Must start with 'new-' or a number."
    exit 1
fi

echo ""
echo "🎉 Push completed for $ISSUE_NAME"
echo ""
echo "Next steps:"
echo "  /new-issue view $ISSUE_NAME  # View updated issue"
echo "  /new-issue list              # List all issues"
```

## Examples

### 使用例 1: 対話型Issue作成

**実行**: `/new-issue create`

**期待出力**:

```text
Initializing new-issue command...
🔧 Creating new issue...
Available issue types:
  1. [Feature] - 新機能追加要求
  2. [Bug] - バグレポート
  3. [Enhancement] - 既存機能改善
  4. [Task] - 開発・メンテナンスタスク

Select issue type (1-4): 1
Enter [Feature] title: User Authentication System

🤖 Generating issue with new-issue-creator agent...
Issue type: feature
Title: User Authentication System
File: C:\path\to\repo\temp\issues\new-feature-user-authentication-system.md

Claude will now use the new-issue-creator agent to generate detailed issue content.

✅ Issue metadata prepared: C:\path\to\repo\temp\issues\new-feature-user-authentication-system.md
📝 Issue name: new-feature-user-authentication-system

Next steps:
  /new-issue view new-feature-user-authentication-system  # View content
  /new-issue edit new-feature-user-authentication-system  # Edit in editor
  /new-issue list                                          # List all issues
```

### 使用例 2: Issue一覧表示

**実行**: `/new-issue list`

**期待出力**:

```text
📋 Issue drafts in C:\path\to\repo\temp\issues:
==================================================
 1. bug-form-validation
    Title: [Bug] Form validation not working
    Modified: 2025-09-30 14:30

 2. feature-user-authentication-system
    Title: [Feature] User Authentication System
    Modified: 2025-09-30 14:25

Commands:
  /new-issue view <issue-name>  # View specific issue
  /new-issue edit <issue-name>  # Edit specific issue
```

### 使用例 3: GitHub Issue Import

**実行**: `/new-issue load 123`

**期待出力**:

```text
🔗 Loading issue from GitHub...
Repository: atsushifx/agla-logger
Issue: #123
✅ Issue imported successfully!
📝 Saved as: 123-improve-error-handling
📁 File: C:\path\to\repo\temp\issues\123-improve-error-handling.md

Next steps:
  /new-issue view 123-improve-error-handling  # View imported issue
  /new-issue edit 123-improve-error-handling  # Edit imported issue
  /new-issue push 123-improve-error-handling  # Push changes back to GitHub
```

### 使用例 4: 新規IssueをGitHubにPush

**実行**: `/new-issue push new-feature-user-auth`

**期待出力**:

```text
📤 Pushing new-feature-user-auth to GitHub...
📝 Title: User Authentication System
🆕 Creating new issue...
✅ New issue #124 created successfully!
🔗 URL: https://github.com/atsushifx/agla-logger/issues/124
📝 Issue file renamed: 124-user-auth

🎉 Push completed for 124-user-auth

Next steps:
  /new-issue view 124-user-auth  # View updated issue
  /new-issue list                # List all issues
```

### 使用例 5: 既存Issueの更新

**実行**: `/new-issue push 123-improve-error-handling`

**期待出力**:

```text
📤 Pushing 123-improve-error-handling to GitHub...
📝 Title: Improve error handling
🔄 Updating existing issue #123
✅ Issue #123 updated successfully!

🎉 Push completed for 123-improve-error-handling

Next steps:
  /new-issue view 123-improve-error-handling  # View updated issue
  /new-issue list                             # List all issues
```

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
