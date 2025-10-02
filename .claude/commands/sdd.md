---
# Claude Code 必須要素
allowed-tools: Bash(*), Read(*), Write(*), Task(*)
argument-hint: [subcommand] [additional args]
description: Spec-Driven-Development主要コマンド - init/req/spec/task/code サブコマンドで要件定義から実装まで一貫した開発支援

# 設定変数
config:
  base_dir: docs/.cc-sdd
  session_file: .lastSession
  subdirs:
    - requirements
    - specifications
    - tasks
    - implementation

# サブコマンド定義
subcommands:
  init: "プロジェクト構造初期化"
  req: "要件定義フェーズ"
  spec: "設計仕様作成フェーズ"
  task: "タスク分解フェーズ"
  code: "BDD実装フェーズ"

# ユーザー管理ヘッダー
title: sdd
version: 2.0.0
created: 2025-09-28
authors:
  - atsushifx
changes:
  - 2025-10-02: フロントマターベース構造に再構築、Bash実装に変更
  - 2025-09-28: 初版作成
---

## /sdd

Spec-Driven-Development (SDD) の各フェーズを管理するコマンド。

## Bash ヘルパー関数ライブラリ

各サブコマンドで使用する共通関数:

```bash
#!/bin/bash
# SDD コマンド用ヘルパー関数集

# 環境変数設定
setup_sdd_env() {
  REPO_ROOT=$(git rev-parse --show-toplevel)
  SDD_BASE="$REPO_ROOT/docs/.cc-sdd"
  SESSION_FILE="$SDD_BASE/.lastSession"
}

# セッション保存
save_session() {
  local namespace="$1"
  local module="$2"

  mkdir -p "$SDD_BASE"

  cat > "$SESSION_FILE" << EOF
namespace=$namespace
module=$module
timestamp=$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S)
EOF

  echo "💾 Session saved: $namespace/$module"
}

# セッション読み込み
load_session() {
  if [ ! -f "$SESSION_FILE" ]; then
    echo "❌ No active session found."
    echo "💡 Run '/sdd init <namespace>/<module>' first."
    return 1
  fi

  source "$SESSION_FILE"
  echo "📂 Session: $namespace/$module"
  return 0
}

# プロジェクト構造初期化
init_structure() {
  local namespace="$1"
  local module="$2"
  local base_path="$SDD_BASE/$namespace/$module"

  for subdir in requirements specifications tasks implementation; do
    local full_path="$base_path/$subdir"
    mkdir -p "$full_path"
    echo "✅ Created: $full_path"
  done
}
```

## 実行フロー

1. **環境設定**: `setup_sdd_env` でパス設定
2. **セッション管理**: `load_session` または `save_session`
3. **サブコマンド実行**: すべて Bash で統一実装

<!-- markdownlint-disable no-duplicate-heading -->

### Subcommand: init

```bash
#!/bin/bash
# 使用方法: /sdd init <namespace>/<module>

# 引数取得
NAMESPACE_MODULE="$1"

if [ -z "$NAMESPACE_MODULE" ]; then
  echo "❌ Error: namespace/module is required"
  echo "Usage: /sdd init <namespace>/<module>"
  echo "Example: /sdd init core/logger"
  exit 1
fi

if [[ ! "$NAMESPACE_MODULE" =~ ^[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+$ ]]; then
  echo "❌ Error: Invalid format"
  echo "Expected: namespace/module (e.g., core/logger)"
  echo "Received: $NAMESPACE_MODULE"
  exit 1
fi

# namespace/module 分離
NAMESPACE="${NAMESPACE_MODULE%%/*}"
MODULE="${NAMESPACE_MODULE##*/}"

# 構造初期化
REPO_ROOT=$(git rev-parse --show-toplevel)
SDD_BASE="$REPO_ROOT/docs/.cc-sdd"
BASE_PATH="$SDD_BASE/$NAMESPACE/$MODULE"

for subdir in requirements specifications tasks implementation; do
  FULL_PATH="$BASE_PATH/$subdir"
  mkdir -p "$FULL_PATH"
  echo "✅ Created: $FULL_PATH"
done

# セッション保存
SESSION_FILE="$SDD_BASE/.lastSession"
mkdir -p "$SDD_BASE"

cat > "$SESSION_FILE" << EOF
namespace=$NAMESPACE
module=$MODULE
timestamp=$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S)
EOF

echo ""
echo "🎉 SDD structure initialized for $NAMESPACE/$MODULE"
echo "💾 Session saved"
```

### Subcommand: req

```bash
#!/bin/bash
# Requirements definition phase

# 環境設定とセッション読み込み
REPO_ROOT=$(git rev-parse --show-toplevel)
SDD_BASE="$REPO_ROOT/docs/.cc-sdd"
SESSION_FILE="$SDD_BASE/.lastSession"

if [ ! -f "$SESSION_FILE" ]; then
  echo "❌ No active session found."
  echo "💡 Run '/sdd init <namespace>/<module>' first."
  exit 1
fi

source "$SESSION_FILE"
echo "📂 Session: $namespace/$module"
echo ""

# 要件定義フェーズ開始
echo "📋 Requirements Definition Phase"
echo "=================================================="
echo ""
echo "📝 This phase will:"
echo "  1. Analyze your requirements"
echo "  2. Ask clarifying questions"
echo "  3. Create comprehensive requirements document"
echo ""
echo "🚀 Starting interactive requirements gathering..."
echo ""

# Note: Claude will guide interactive requirements definition
```

### Subcommand: spec

```bash
#!/bin/bash
# Design specification phase

# 環境設定とセッション読み込み
REPO_ROOT=$(git rev-parse --show-toplevel)
SDD_BASE="$REPO_ROOT/docs/.cc-sdd"
SESSION_FILE="$SDD_BASE/.lastSession"

if [ ! -f "$SESSION_FILE" ]; then
  echo "❌ No active session found."
  echo "💡 Run '/sdd init <namespace>/<module>' first."
  exit 1
fi

source "$SESSION_FILE"
echo "📂 Session: $namespace/$module"
echo ""

# 設計仕様フェーズ開始
echo "📐 Design Specification Phase"
echo "=================================================="
echo ""
echo "📝 This phase will:"
echo "  1. Review requirements document"
echo "  2. Create functional specifications"
echo "  3. Define interfaces and behaviors"
echo "  4. Generate implementation templates"
echo ""
echo "🚀 Starting spec creation..."
echo ""

# Note: Claude will guide specification creation using MCP tools
```

### Subcommand: task

```bash
#!/bin/bash
# Task breakdown phase

# セッション読み込み
REPO_ROOT=$(git rev-parse --show-toplevel)
SESSION_FILE="$REPO_ROOT/docs/.cc-sdd/.lastSession"

if [ ! -f "$SESSION_FILE" ]; then
  echo "❌ No active session found."
  echo "💡 Run '/sdd init <namespace>/<module>' first."
  exit 1
fi

source "$SESSION_FILE"
echo "📂 Session: $namespace/$module"
echo ""

# タスク分解開始
echo "📋 Task Breakdown Phase"
echo "=================================================="
echo ""
echo "🚀 Launching task breakdown agent..."
echo ""
echo "📝 Agent will:"
echo "  - Break down tasks following BDD hierarchy"
echo "  - Use TodoWrite tool for task management"
echo "  - Follow docs/rules/07-bdd-test-hierarchy.md"
echo ""

# Note: Claude will invoke Task tool with general-purpose agent
```

### Subcommand: code

```bash
#!/bin/bash
# BDD implementation phase

# セッション読み込み
REPO_ROOT=$(git rev-parse --show-toplevel)
SESSION_FILE="$REPO_ROOT/docs/.cc-sdd/.lastSession"

if [ ! -f "$SESSION_FILE" ]; then
  echo "❌ No active session found."
  echo "💡 Run '/sdd init <namespace>/<module>' first."
  exit 1
fi

source "$SESSION_FILE"
echo "📂 Session: $namespace/$module"
echo ""

# タスクグループ指定（オプション）
TASK_GROUP="${1:-}"

# 実装フェーズ開始
echo "💻 BDD Implementation Phase"
echo "=================================================="
echo ""

if [ -n "$TASK_GROUP" ]; then
  echo "📝 Target task group: $TASK_GROUP"
else
  echo "📝 Target: Full implementation"
fi

echo ""
echo "🚀 Launching BDD coder agent..."
echo ""
echo "📋 Agent will follow:"
echo "  - Strict Red-Green-Refactor cycle"
echo "  - 1 message = 1 test principle"
echo "  - BDD hierarchy from todo.md"
echo ""

# Note: Claude will invoke Task tool with typescript-bdd-coder agent
```

## アーキテクチャの特徴

- Bash 統一実装: すべてのサブコマンドと関数を Bash で実装
- セッション管理: `.lastSession` で namespace/module を永続化
- ヘルパー関数: 共通ロジックを関数化して DRY 原則を実現
- シンプルな設計: 各サブコマンドは 15-30行程度
- フロントマター駆動: 設定・サブコマンド定義を一元管理
- 依存最小化: Git のみ必要 (Python/jq 不要)

## 使用例

### 標準ワークフロー

```bash
# 1. プロジェクト初期化
/sdd init core/logger

# 2. 要件定義
/sdd req
# → Claude が対話的に要件を収集

# 3. 設計仕様作成
/sdd spec
# → Claude が MCP ツールで仕様作成

# 4. タスク分解
/sdd task
# → general-purpose エージェントがタスク分解

# 5. 実装
/sdd code
# → typescript-bdd-coder エージェントで BDD 実装

# 6. 部分実装（特定タスクグループ）
/sdd code DOC-01-01-01
```

### セッション管理の例

```bash
# 初期化（セッション自動保存）
/sdd init core/logger
# → .lastSession に保存

# 別のターミナルでも同じセッション使用可能
/sdd req
# → .lastSession から core/logger を読み込み

# 新しいモジュールで初期化（セッション更新）
/sdd init utils/validator
# → .lastSession が utils/validator に更新
```

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
