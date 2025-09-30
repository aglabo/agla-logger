---
# Claude Code 必須要素
allowed-tools: Bash(git:*), Bash(gh:*), Write(*), Read(*)
argument-hint: [--edit] [--output=file]
description: Pull Request自動生成コマンド - git/gh情報から完全自動でPRドラフト作成

# ag-logger プロジェクト要素
title: agla-logger
version: 1.0.0
created: 2025-09-30
authors:
  - atsushifx
changes:
  - 2025-09-30: 初版作成
---

## Quick Reference

<!-- markdownlint-disable no-duplicate-heading -->

### Usage

```bash
# Main command (generate draft)
/create-pr [options]

# Subcommands
/create-pr <subcommand> [args]
```

### Main Options

- `--edit`: Generate draft and open in editor (default: true)
- `--no-edit`: Skip editor, save directly
- `--lang=<code>`: Language for PR content (ja/en, default: system locale)
- `--dry-run`: Show information only, don't save

### Subcommands

- `view`: View current PR draft
- `edit`: Edit current PR draft
- `review`: Review draft with detailed analysis
- `push`: Push current draft as PR to GitHub

### Examples

```bash
# Generate PR draft in Japanese (default for ja locale)
/create-pr

# Generate PR draft in English
/create-pr --lang=en

# Generate without editing
/create-pr --no-edit

# View current draft
/create-pr view

# Edit current draft
/create-pr edit

# Review current draft
/create-pr review

# Push current draft as PR to GitHub
/create-pr push
```

## Main Dispatcher

````python
#!/usr/bin/env python3
"""
Create-PR Command - Main Dispatcher
Simple router that executes appropriate subcommand or main functionality
"""

import sys
import subprocess

def show_help():
    """Display help information"""
    print("""create-pr - Automatic Pull Request draft generation

Usage: /create-pr [options]
       /create-pr <subcommand>

Options:
  --edit           Generate draft and open in editor (default)
  --no-edit        Skip editor, save directly
  --lang=<code>    Language for PR content (ja/en, default: system)
  --dry-run        Show info gathering only
  -h, --help       Show this help

Subcommands:
  view             View current PR draft
  edit             Edit current PR draft
  review           Review draft with analysis
  push             Push current draft as PR to GitHub

Examples:
  /create-pr                 # Generate draft (Japanese)
  /create-pr --lang=en       # Generate draft (English)
  /create-pr view            # View current draft
  /create-pr push            # Push draft as PR to GitHub""")

def main():
    """Main dispatcher logic"""
    # Check for help
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help']:
        show_help()
        return

    # Check for subcommands
    if len(sys.argv) > 1 and sys.argv[1] in ['view', 'edit', 'review', 'push']:
        subcommand = sys.argv[1]

        # Execute appropriate subcommand section below
        file_content = open(__file__).read()
        if subcommand == 'view':
            section = file_content.split('## Subcommand: view')[1]
            code = section.split('```python')[1].split('```')[0]
            exec(compile(code, '<string>', 'exec'))
        elif subcommand == 'edit':
            section = file_content.split('## Subcommand: edit')[1]
            code = section.split('```python')[1].split('```')[0]
            exec(compile(code, '<string>', 'exec'))
        elif subcommand == 'review':
            section = file_content.split('## Subcommand: review')[1]
            code = section.split('```python')[1].split('```')[0]
            exec(compile(code, '<string>', 'exec'))
        elif subcommand == 'push':
            section = file_content.split('## Subcommand: push')[1]
            code = section.split('```python')[1].split('```')[0]
            exec(compile(code, '<string>', 'exec'))
        return

    # Default: Execute main PR generation
    file_content = open(__file__).read()
    main_section = file_content.split('## Main Command: Generate PR')[1]
    main_code = main_section.split('```python')[1].split('```')[0]
    exec(compile(main_code, '<string>', 'exec'))

if __name__ == "__main__":
    main()
````

## Common Utilities

```python
"""
Common utility functions used by all subcommands
"""

import os
import subprocess
import tempfile
import locale
import json
import re
from pathlib import Path

# Global constants
DRAFT_FILE_NAME = "pr_draft_current.md"

def get_draft_path():
    """Get standardized path for PR draft file in repository temp/pr/ directory"""
    # Get git repository root
    git_root = run_command('git rev-parse --show-toplevel')
    if not git_root:
        # Fallback to system temp if not in git repo
        temp_dir = Path(tempfile.gettempdir())
        return temp_dir / DRAFT_FILE_NAME

    # Use repo temp/pr/ directory
    repo_root = Path(git_root)
    temp_pr_dir = repo_root / 'temp' / 'pr'
    return temp_pr_dir / DRAFT_FILE_NAME

def run_command(command, timeout=30):
    """Execute shell command safely and return output"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True,
                              text=True, timeout=timeout)
        if result.returncode == 0:
            return result.stdout.strip()
        return ""
    except subprocess.TimeoutExpired:
        print(f"⚠️  Command timed out: {command}")
        return ""
    except Exception as e:
        print(f"⚠️  Command failed: {e}")
        return ""

def get_system_language():
    """Get system default language"""
    try:
        system_locale = locale.getdefaultlocale()[0]
        if system_locale and system_locale.startswith('ja'):
            return 'ja'
        return 'en'
    except:
        return 'en'

def read_draft():
    """Read current draft file"""
    draft_path = get_draft_path()
    if not draft_path.exists():
        return None

    try:
        with open(draft_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"❌ Failed to read draft: {e}")
        return None

def save_draft(content):
    """Save PR draft to file"""
    draft_path = get_draft_path()
    try:
        # Create directory if it doesn't exist
        draft_path.parent.mkdir(parents=True, exist_ok=True)

        with open(draft_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"💾 Draft saved: {draft_path}")
        return draft_path
    except Exception as e:
        print(f"❌ Failed to save draft: {e}")
        return None

def open_in_editor(file_path):
    """Open file in user's preferred editor"""
    editor = os.environ.get('EDITOR', 'code')
    try:
        print(f"📝 Opening in editor: {editor}")
        subprocess.run([editor, str(file_path)], check=True)
        return True
    except FileNotFoundError:
        print(f"❌ Editor '{editor}' not found. Set EDITOR environment variable.")
        return False
    except Exception as e:
        print(f"❌ Editor error: {e}")
        return False

def parse_args():
    """Parse command line arguments for main command"""
    args = {
        'edit': True,
        'lang': get_system_language(),
        'dry_run': False
    }

    if '--no-edit' in sys.argv:
        args['edit'] = False
    if '--dry-run' in sys.argv:
        args['dry_run'] = True

    # Parse language option
    for arg in sys.argv:
        if arg.startswith('--lang='):
            lang_code = arg.split('=', 1)[1].lower()
            if lang_code in ['ja', 'en']:
                args['lang'] = lang_code

    return args
```

## Main Command: Generate PR

```python
"""
Main PR generation functionality
"""

print("🔍 Collecting repository information...")

# Parse arguments
args = parse_args()

# Collect Git information
print("📊 Analyzing git repository...")
git_info = {}
git_info['current_branch'] = run_command('git branch --show-current')
git_info['base_branch'] = 'main'
git_info['latest_commit_msg'] = run_command('git log -1 --pretty=format:"%s"')
git_info['latest_commit_body'] = run_command('git log -1 --pretty=format:"%b"')

# Count commits and get file changes
commit_count_cmd = f'git rev-list --count {git_info["base_branch"]}..HEAD'
git_info['commit_count'] = run_command(commit_count_cmd) or "0"

changed_files_cmd = f'git diff --name-only {git_info["base_branch"]}..HEAD'
changed_files_output = run_command(changed_files_cmd)
git_info['changed_files'] = changed_files_output.split('\n') if changed_files_output else []

# Extract related issues from commit messages
commit_messages = run_command(f'git log {git_info["base_branch"]}..HEAD --pretty=format:"%s %b"')
issues = re.findall(r'#(\d+)', commit_messages) if commit_messages else []
git_info['related_issues'] = list(set(issues))

print(f"✅ Found {len(git_info['changed_files'])} files, {git_info['commit_count']} commits")

# Handle dry run
if args['dry_run']:
    print("🏃 DRY RUN - Information collected successfully")
    exit(0)

# Generate PR title
def generate_title(branch_name, commit_msg):
    branch_patterns = {
        'feat/': 'feat', 'feature/': 'feat', 'fix/': 'fix',
        'docs/': 'docs', 'style/': 'style', 'refactor/': 'refactor',
        'test/': 'test', 'chore/': 'chore'
    }

    commit_type = 'feat'
    description = branch_name

    for pattern, type_name in branch_patterns.items():
        if branch_name.startswith(pattern):
            commit_type = type_name
            description = branch_name[len(pattern):].replace('-', ' ').replace('_', ' ')
            break

    conventional_types = ['feat:', 'fix:', 'docs:', 'style:', 'refactor:', 'test:', 'chore:']
    if commit_msg and ':' in commit_msg and any(commit_msg.startswith(t) for t in conventional_types):
        return commit_msg

    return f"{commit_type}: {description}"

title = generate_title(git_info['current_branch'], git_info['latest_commit_msg'])

# Analyze file changes
changes = []
for file in git_info['changed_files'][:10]:
    if not file:
        continue
    if any(test_pattern in file for test_pattern in ['/test', '.test.', '.spec.']):
        changes.append(f"📝 Updated tests: `{file}`")
    elif file.endswith('.md'):
        changes.append(f"📚 Updated documentation: `{file}`")
    elif file.endswith(('.ts', '.js', '.tsx', '.jsx')):
        changes.append(f"💻 Updated code: `{file}`")
    elif file.endswith(('.json', '.yaml', '.yml')):
        changes.append(f"⚙️ Updated configuration: `{file}`")
    else:
        changes.append(f"📄 Modified: `{file}`")

changes_text = '\n'.join(changes) if changes else "変更内容の詳細を記述してください。"

# Generate template based on language
if args['lang'] == 'ja':
    template = {
        'overview_header': '## ✨ 概要',
        'changes_header': '## 🔧 変更内容',
        'issues_header': '## 📂 関連Issue',
        'checklist_header': '## ✅ チェックリスト',
        'notes_header': '## 💬 補足事項',
        'overview_placeholder': 'このPRで実装した変更内容の概要を記述します。',
        'issues_placeholder': 'このPRが解決または関連するIssueをリンク:',
        'checklist_placeholder': 'レビュー依頼前に以下を確認してください:',
        'notes_placeholder': '*オプション: スクリーンショット、設計メモ、レビュー時の注意点など*',
        'checklist_items': [
            '- [ ] リントチェックが通る (`pnpm lint`)',
            '- [ ] テストが通る (`pnpm test`)',
            '- [ ] ドキュメントが更新されている (該当する場合)',
            '- [ ] PRタイトルが [Conventional Commits](https://www.conventionalcommits.org/) に準拠している',
            '- [ ] 説明と例が明確である'
        ]
    }
else:
    template = {
        'overview_header': '## ✨ Overview',
        'changes_header': '## 🔧 Changes',
        'issues_header': '## 📂 Related Issues',
        'checklist_header': '## ✅ Checklist',
        'notes_header': '## 💬 Additional Notes',
        'overview_placeholder': 'Brief explanation of changes implemented in this PR.',
        'issues_placeholder': 'Link any issues this PR closes or relates to:',
        'checklist_placeholder': 'Please confirm the following before requesting review:',
        'notes_placeholder': '*Optional: add screenshots, design notes, or concerns for reviewers.*',
        'checklist_items': [
            '- [ ] Lint checks pass (`pnpm lint`)',
            '- [ ] Tests pass (`pnpm test`)',
            '- [ ] Documentation is updated (if applicable)',
            '- [ ] PR title follows [Conventional Commits](https://www.conventionalcommits.org/)',
            '- [ ] Descriptions and examples are clear'
        ]
    }

# Generate overview
commit_body = git_info.get('latest_commit_body', '')
if commit_body and len(commit_body.strip()) > 10:
    overview = commit_body[:200] + "..." if len(commit_body) > 200 else commit_body
else:
    overview = template['overview_placeholder']

# Handle related issues
if git_info['related_issues']:
    issues_text = '\n'.join([f"Closes #{issue}" for issue in git_info['related_issues'][:3]])
else:
    issues_text = template['issues_placeholder']

# Generate checklist
checklist = '\n'.join(template['checklist_items'])

# Build complete PR draft
pr_draft = f'''---
name: Pull Request Template
description: Pull Request format for contributing changes
title: "{title}"
labels: ["pull request"]
assignees: ["atsushifx"]
---

{template['overview_header']}

{overview}

---

{template['changes_header']}

{changes_text}

---

{template['issues_header']}

{issues_text}

---

{template['checklist_header']}

{template['checklist_placeholder']}

{checklist}

---

{template['notes_header']}

{template['notes_placeholder']}
'''

print(f"📝 Generating PR draft in {args['lang']}...")

# Save draft
draft_path = save_draft(pr_draft)
if not draft_path:
    exit(1)

# Open in editor if requested
if args['edit']:
    success = open_in_editor(draft_path)
    if not success:
        print(f"💡 Draft saved to: {draft_path}")
else:
    print(f"✅ Draft ready: {draft_path}")

print("🎉 PR draft generation completed!")
```

## Subcommand: view

```python
"""
View current PR draft
"""

content = read_draft()
if content:
    print("📄 Current PR Draft:")
    print("=" * 50)
    print(content)
else:
    print("❌ No current PR draft found. Run '/create-pr' to generate one.")
```

## Subcommand: edit

```python
"""
Edit current PR draft in editor
"""

draft_path = get_draft_path()
if draft_path.exists():
    success = open_in_editor(draft_path)
    if success:
        print("✅ Draft opened in editor")
    else:
        print(f"💡 Draft location: {draft_path}")
else:
    print("❌ No current PR draft found. Run '/create-pr' to generate one.")
```

## Subcommand: review

```python
"""
Review current PR draft with detailed analysis
"""

content = read_draft()
if not content:
    print("❌ No current PR draft found. Run '/create-pr' to generate one.")
    exit(1)

print("🔍 PR Draft Analysis:")
print("=" * 50)

lines = content.split('\n')
word_count = len(content.split())

print(f"📊 Statistics:")
print(f"  Lines: {len(lines)}")
print(f"  Words: {word_count}")
print(f"  Characters: {len(content)}")

# Analyze sections
sections = ['概要', 'Overview', '変更内容', 'Changes', 'Issue', 'Checklist']
found_sections = [s for s in sections if s in content]
print(f"  Sections: {', '.join(found_sections)}")

# Count checklist items
checkboxes = [line for line in lines if '- [ ]' in line or '- [x]' in line]
print(f"  Checklist items: {len(checkboxes)}")

# Check for important keywords
keywords = ['feat:', 'fix:', 'docs:', 'test:', 'closes', 'fixes']
found_keywords = [kw for kw in keywords if kw.lower() in content.lower()]
print(f"  Keywords: {', '.join(found_keywords)}")

print(f"\n📋 Content Preview:")
print("-" * 30)
preview = content[:300] + "..." if len(content) > 300 else content
print(preview)

print(f"\n💡 Recommendations:")
if len(checkboxes) < 3:
    print("  - Consider adding more checklist items")
if word_count < 50:
    print("  - Consider adding more detailed description")
if not any(kw in content.lower() for kw in ['closes', 'fixes', 'resolves']):
    print("  - Consider linking related issues")
```

## Subcommand: push

```python
"""
Push current PR draft to GitHub as actual PR
"""

content = read_draft()
if not content:
    print("❌ No current PR draft found. Run '/create-pr' to generate one.")
    exit(1)

def extract_title_and_body(content):
    """Extract title and body from markdown frontmatter"""
    lines = content.split('\n')
    title = ""
    body_lines = []
    in_frontmatter = False
    frontmatter_ended = False

    for line in lines:
        if line.strip() == '---':
            if not in_frontmatter:
                in_frontmatter = True
                continue
            else:
                frontmatter_ended = True
                continue

        if in_frontmatter and not frontmatter_ended:
            if line.startswith('title:'):
                title = line.split(':', 1)[1].strip().strip('"')
        elif frontmatter_ended:
            body_lines.append(line)

    return title, '\n'.join(body_lines).strip()

# Extract title and body
title, body = extract_title_and_body(content)
if not title:
    print("❌ Could not extract title from draft")
    exit(1)

print(f"🚀 Creating PR: {title}")

# Create PR using GitHub CLI
try:
    cmd = f'''gh pr create --title "{title}" --body "$(cat <<'EOF'
{body}
EOF
)"'''

    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)

    if result.returncode == 0:
        print("🎉 PR successfully created!")
        print(result.stdout)

        # Clean up draft after successful push
        draft_path = get_draft_path()
        if draft_path.exists():
            draft_path.unlink()
            print("🗑️ Draft file cleaned up")
    else:
        print(f"❌ GitHub CLI error: {result.stderr}")
        print("💡 Tip: Make sure you have push permissions and gh CLI is authenticated")

except subprocess.TimeoutExpired:
    print("❌ GitHub CLI command timed out")
except Exception as e:
    print(f"❌ Error creating PR: {e}")
```

## Usage Examples

### 基本的なPR生成

```bash
# デフォルト（日本語、エディタで開く）
/create-pr

# 英語版生成
/create-pr --lang=en

# エディタを開かずに保存のみ
/create-pr --no-edit

# 情報収集のみ（ドライラン）
/create-pr --dry-run
```

### サブコマンド使用

```bash
# 現在のドラフトを表示
/create-pr view

# ドラフトをエディタで編集
/create-pr edit

# ドラフトの詳細分析
/create-pr review

# GitHubにPRを作成
/create-pr push
```

## Benefits of Hybrid Architecture

✅ **超シンプル**: 各機能が20-80行の独立スクリプト
✅ **理解しやすい**: マークダウンセクションで機能が明確に分離
✅ **保守しやすい**: 特定機能の修正時に該当セクションのみ変更
✅ **テストしやすい**: 各サブコマンドを個別にテスト可能
✅ **拡張しやすい**: 新サブコマンドは新セクション追加のみ
✅ **ドキュメント一体型**: 説明とコードが同じファイル内に共存

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
