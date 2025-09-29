---
# Claude Code 必須要素
allowed-tools: Bash(git:*), Read(*), Write(*)
argument-hint: [subcommand] [--no-edit] [--lang=ja|en]
description: Git コミットメッセージ自動生成 - Staged changes分析によるConventional Commits準拠メッセージ作成

# ag-logger プロジェクト要素
title: commit-message
version: 2.0.0
created: 2025-09-30
authors:
  - atsushifx
changes:
  - 2025-09-30: サブコマンド機能付きで新規作成
---

## Quick Reference

### Usage

```bash
# Main command (generate and save to temp file)
/commit-message [options]

# Subcommands
/commit-message <subcommand> [options]
```

### Main Options

- `--no-edit`: 編集なしで直接tempファイルに保存
- `--lang=<code>`: メッセージ言語 (ja/en, default: system locale)

### Subcommands

- `create`: コミットメッセージを生成してtempファイルに保存
- `view`: 現在のコミットメッセージを表示
- `edit`: 現在のコミットメッセージをエディタで編集
- `commit`: 現在のコミットメッセージで実際にコミット実行

### Examples

```bash
# コミットメッセージ生成（tempファイルに自動保存）
/commit-message

# サブコマンドで詳細操作
/commit-message view      # 保存されたメッセージ確認
/commit-message edit      # メッセージ編集
/commit-message commit    # コミット実行

# 英語でメッセージ生成
/commit-message --lang=en
```

## Help Display

```python
print("commit-message - Git commit message generator")
print("")
print("Usage: /commit-message [options]")
print("       /commit-message <subcommand> [options]")
print("")
print("Options:")
print("  --no-edit        直接tempファイル保存 (編集なし)")
print("  --lang=<code>    メッセージ言語 (ja/en, default: system)")
print("")
print("Subcommands:")
print("  create           コミットメッセージ生成")
print("  view             現在のメッセージ表示")
print("  edit             メッセージ編集")
print("  commit           実際にコミット実行")
print("")
print("Examples:")
print("  /commit-message              # 生成してtempファイル保存")
print("  /commit-message view         # 保存されたメッセージ確認")
print("  /commit-message edit         # メッセージ編集")
print("  /commit-message commit       # コミット実行")
```

## Language & File Management

```python
import subprocess
import os
import locale
import tempfile
from datetime import datetime

# Global variables for file management
CURRENT_MESSAGE_PATH = None
TEMP_COMMIT_MSG_FILE = "commit_message_current.md"

def get_system_language():
    """Get system default language"""
    try:
        system_locale = locale.getdefaultlocale()[0]
        if system_locale and system_locale.startswith('ja'):
            return 'ja'
        return 'en'
    except:
        return 'en'

def get_message_file_path():
    """Get fixed path for current commit message"""
    global CURRENT_MESSAGE_PATH
    if not CURRENT_MESSAGE_PATH:
        # Use ./temp/ directory (relative to git root)
        try:
            repo_root = subprocess.run(['git', 'rev-parse', '--show-toplevel'],
                                     capture_output=True, text=True, check=True).stdout.strip()
            temp_dir = os.path.join(repo_root, 'temp')
            os.makedirs(temp_dir, exist_ok=True)
            CURRENT_MESSAGE_PATH = os.path.join(temp_dir, TEMP_COMMIT_MSG_FILE)
        except:
            # Fallback to system temp
            temp_dir = tempfile.gettempdir()
            CURRENT_MESSAGE_PATH = os.path.join(temp_dir, TEMP_COMMIT_MSG_FILE)
    return CURRENT_MESSAGE_PATH

def parse_arguments():
    """Parse command line arguments"""
    import sys

    args = {
        'subcommand': None,
        'edit': True,  # Default to edit mode for subcommands
        'lang': get_system_language(),  # Default to system language
        'no_edit': False
    }

    # Parse subcommands first
    subcommands = ['create', 'view', 'edit', 'commit']
    for arg in sys.argv[1:]:
        if arg in subcommands:
            args['subcommand'] = arg
            break

    # Parse options
    if '--no-edit' in sys.argv:
        args['no_edit'] = True
        args['edit'] = False

    # Parse language option
    for arg in sys.argv:
        if arg.startswith('--lang='):
            lang_code = arg.split('=', 1)[1].lower()
            if lang_code in ['ja', 'en']:
                args['lang'] = lang_code
            break

    return args

def run_git_command(command):
    """Execute git command and return output"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
        return ""
    except Exception as e:
        print(f"Git command error: {e}")
        return ""

def collect_git_context():
    """Collect git context (logs and diff)"""
    context = {}

    # Get recent commit logs
    context['logs'] = run_git_command('git log --oneline -10')

    # Get staged changes
    context['staged_diff'] = run_git_command('git diff --cached')

    # Get staged file list
    context['staged_files'] = run_git_command('git diff --cached --name-only').split('\n') if run_git_command('git diff --cached --name-only') else []

    return context

print("Initializing commit message generator...")
```

## Message Generation

```python
def get_message_templates(lang='ja'):
    """Get commit message templates in specified language"""
    templates = {
        'ja': {
            'analysis_prompt': 'Gitのログと差分を分析し、Conventional Commits準拠のコミットメッセージを生成してください。',
            'format_instruction': '形式: type(scope): description',
            'output_marker_start': '=== COMMIT MESSAGE START ===',
            'output_marker_end': '=== COMMIT MESSAGE END ===',
        },
        'en': {
            'analysis_prompt': 'Analyze the Git logs and diff to generate a Conventional Commits compliant commit message.',
            'format_instruction': 'Format: type(scope): description',
            'output_marker_start': '=== COMMIT MESSAGE START ===',
            'output_marker_end': '=== COMMIT MESSAGE END ===',
        }
    }
    return templates.get(lang, templates['en'])

def create_context_block(git_context):
    """Create context block for Codex"""
    context_lines = []

    context_lines.append("----- GIT LOGS -----")
    if git_context['logs']:
        context_lines.append(git_context['logs'])
    else:
        context_lines.append("No logs available.")
    context_lines.append("----- END LOGS -----")
    context_lines.append("")

    context_lines.append("----- GIT DIFF -----")
    if git_context['staged_diff']:
        context_lines.append(git_context['staged_diff'])
    else:
        context_lines.append("No staged changes found.")
    context_lines.append("----- END DIFF -----")

    return '\n'.join(context_lines)

def generate_commit_message_with_agent(lang='ja'):
    """Generate commit message using commit-message agent"""
    try:
        # Use the commit-message agent via SlashCommand
        process = subprocess.Popen(
            ['claude', 'code', '--command', '/commit-message'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        stdout, stderr = process.communicate()

        if process.returncode != 0:
            raise Exception(f"commit-message agent error: {stderr}")

        # The agent should output the commit message directly
        commit_message = stdout.strip()

        if not commit_message:
            raise Exception("Empty commit message from agent")

        return commit_message

    except Exception as e:
        print(f"Error generating commit message: {e}")
        return None

# Generate commit message
print("Collecting Git context...")
git_context = collect_git_context()
print(f"Found {len(git_context['staged_files'])} staged files")
```

## Subcommand Handlers

```python
def handle_create_command(args):
    """Generate and save commit message"""
    message_path = get_message_file_path()

    print("Generating commit message...")
    commit_message = generate_commit_message_with_agent(args['lang'])

    if not commit_message:
        print("❌ Failed to generate commit message")
        return

    try:
        with open(message_path, 'w', encoding='utf-8') as f:
            f.write(commit_message)
        print(f"✅ Commit message saved to: {message_path}")

        # Show generated message
        print("\n📝 Generated commit message:")
        print("-" * 40)
        print(commit_message)

        # Open in editor if edit mode
        if args['edit'] and not args['no_edit']:
            handle_edit_command()

    except Exception as e:
        print(f"❌ Error saving commit message: {e}")

def handle_view_command():
    """View current commit message"""
    message_path = get_message_file_path()

    if not os.path.exists(message_path):
        print("No commit message found. Run '/commit-message create' to generate one.")
        return

    try:
        with open(message_path, 'r', encoding='utf-8') as f:
            content = f.read()

        print(f"Current commit message ({message_path}):")
        print("=" * 50)
        print(content)

        # Show basic analysis
        lines = content.split('\n')
        word_count = len(content.split())
        print(f"\n📊 Stats: {len(lines)} lines, {word_count} words")

    except Exception as e:
        print(f"❌ Error reading commit message: {e}")

def handle_edit_command():
    """Edit current commit message"""
    message_path = get_message_file_path()

    if not os.path.exists(message_path):
        print("No commit message found. Run '/commit-message create' to generate one.")
        return

    editor = os.environ.get('EDITOR', 'code')
    try:
        print(f"Opening commit message in editor: {editor}")
        subprocess.run([editor, message_path], check=True)
        print(f"✅ Commit message edited: {message_path}")
    except FileNotFoundError:
        print(f"❌ Editor '{editor}' not found. Set EDITOR environment variable.")
    except Exception as e:
        print(f"❌ Editor error: {e}")

def handle_commit_command():
    """Execute git commit with current message"""
    message_path = get_message_file_path()

    if not os.path.exists(message_path):
        print("No commit message found. Run '/commit-message create' to generate one.")
        return

    try:
        # Read commit message
        with open(message_path, 'r', encoding='utf-8') as f:
            commit_message = f.read().strip()

        if not commit_message:
            print("❌ Commit message is empty")
            return

        # Check for staged changes
        staged_files = run_git_command('git diff --cached --name-only')
        if not staged_files:
            print("❌ No staged changes found. Stage your changes first with 'git add'.")
            return

        print(f"Committing with message:")
        print("-" * 30)
        print(commit_message)
        print("-" * 30)

        # Execute git commit
        result = subprocess.run(
            ['git', 'commit', '-m', commit_message],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print("🎉 Commit successful!")
            print(result.stdout)

            # Clean up message file after successful commit
            os.remove(message_path)
            print("✅ Message file cleaned up.")
        else:
            print(f"❌ Commit failed: {result.stderr}")

    except Exception as e:
        print(f"❌ Error during commit: {e}")

def save_message_to_file(content):
    """Save commit message to temp file"""
    message_path = get_message_file_path()

    try:
        with open(message_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Message saved to: {message_path}")
        return message_path
    except Exception as e:
        print(f"❌ Error saving message: {e}")
        return None

def main():
    """Main execution logic"""
    args = parse_arguments()

    # Handle subcommands
    if args['subcommand']:
        if args['subcommand'] == 'create':
            handle_create_command(args)
        elif args['subcommand'] == 'view':
            handle_view_command()
        elif args['subcommand'] == 'edit':
            handle_edit_command()
        elif args['subcommand'] == 'commit':
            handle_commit_command()
        return

    # Default behavior: generate and save to temp file, then output
    print("Generating commit message...")
    commit_message = generate_commit_message_with_agent(args['lang'])

    if commit_message:
        # Always save to temp file
        message_path = save_message_to_file(commit_message)

        if message_path:
            print(f"\n📝 Generated and saved commit message:")
            print("-" * 40)
            print(commit_message)
            print("-" * 40)
            print(f"\nSaved to: {message_path}")
            print("\nNext steps:")
            print("  /commit-message view   - View message")
            print("  /commit-message edit   - Edit message")
            print("  /commit-message commit - Commit with message")
        else:
            print("❌ Failed to save commit message to temp file")
    else:
        print("❌ Failed to generate commit message")
        exit(1)

# Execute main function
main()
```

## Examples

### 使用例 1: メインコマンド（tempファイル保存）

**実行**: `/commit-message`

**期待出力**:

```text
Initializing commit message generator...
Collecting Git context...
Found 3 staged files
Generating commit message...
✅ Message saved to: C:\path\to\repo\temp\commit_message_current.md

📝 Generated and saved commit message:
----------------------------------------
docs(commands): commit-message Slashコマンドの詳細仕様とサブコマンド体系
----------------------------------------

Saved to: C:\path\to\repo\temp\commit_message_current.md

Next steps:
  /commit-message view   - View message
  /commit-message edit   - Edit message
  /commit-message commit - Commit with message
```

### 使用例 2: サブコマンドワークフロー

```bash
# 1. コミットメッセージ生成
/commit-message create

# 2. 確認
/commit-message view

# 3. 編集 (必要に応じて)
/commit-message edit

# 4. コミット実行
/commit-message commit
```

### 使用例 3: 編集なしで保存

**実行**: `/commit-message create --no-edit`

**期待動作**: エディタを開かずに直接tempファイルに保存

### 使用例 4: 英語でメッセージ生成

**実行**: `/commit-message create --lang=en`

**期待動作**: 英語でコミットメッセージを生成

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
