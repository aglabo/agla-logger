---
# Claude Code 必須要素
allowed-tools: Bash(*), Task(*)
argument-hint: [subcommand] [additional args]
description: Spec-Driven-Development主要コマンド - init/req/spec/task/code サブコマンドで要件定義から実装まで一貫した開発支援

# ag-logger プロジェクト要素
title: agla-logger
version: 1.0.0
created: 2025-09-28
authors:
  - atsushifx
changes:
  - 2025-09-28: 初版作成
---

## Quick Reference

### Usage

```bash
/sdd [subcommand] [args]
```

### Subcommands

- `/sdd init <namespace>/<module>` - Initialize project structure
- `/sdd req` - Requirements definition through user interaction
- `/sdd spec` - Design phase creating functional specifications
- `/sdd task` - Task breakdown following BDD hierarchy
- `/sdd code [task-group]` - Implementation with strict BDD process

### Examples

```bash
# Initialize new module
/sdd init core/logger

# Run requirements definition phase
/sdd req

# Execute design phase with MCP tools
/sdd spec

# Break down tasks following BDD hierarchy
/sdd task

# Implement specific task group
/sdd code DOC-01-01-01

# Implement all task groups
/sdd code
```

<!-- markdownlint-disable no-duplicate-heading -->

## Help Display

```python
print("sdd (Spec-Driven-Development) - 要件定義から実装まで一貫した開発支援")
print("")
print("Usage: /sdd [subcommand] [args]")
print("")
print("Subcommands:")
print(" init <namespace>/<module>  Initialize project structure")
print(" req                        Requirements definition phase")
print(" spec                       Design phase with MCP tools")
print(" task                       Task breakdown following BDD")
print(" code [task-group]          Implementation with strict BDD")
print("")
print("Examples:")
print(" /sdd init core/logger")
print(" /sdd req")
print(" /sdd spec")
print(" /sdd task")
print(" /sdd code DOC-01-01-01")
```

## Init Handler

```python
import os

namespace_module = input("Enter namespace/module (e.g., core/logger): ")
if not namespace_module or '/' not in namespace_module:
    print("Error: Invalid format. Use namespace/module")
    exit(1)

base_path = f"./docs/.cc-sdd/{namespace_module}"
subdirs = ["requirements", "specifications", "tasks", "implementation"]

try:
    for subdir in subdirs:
        full_path = f"{base_path}/{subdir}"
        os.makedirs(full_path, exist_ok=True)
        print(f"Created: {full_path}")

    print(f"Success: SDD structure initialized for {namespace_module}")
except Exception as e:
    print(f"Error: {e}")
```

## Requirements Handler

```python
print("Requirements Definition Phase")
print("===========================================")
print("Interactive approach to clarify requirements")
print("")
print("Steps:")
print("1. Analyze user's basic request")
print("2. Ask clarifying questions about:")
print("   - Target users/agents")
print("   - Document structure preferences")
print("   - Content scope and detail level")
print("   - Integration requirements")
print("3. Create comprehensive requirements document")
print("")
print("Output: requirements/ directory with detailed specifications")
```

## Specification Handler

```python
print("Design Specification Phase")
print("===========================================")
print("Create functional .spec.md files based on requirements")
print("")
print("Steps:")
print("1. Review requirements document")
print("2. Ask user about:")
print("   - Functional grouping strategy")
print("   - Specification detail level")
print("   - Template specificity requirements")
print("3. Create functional .spec.md files with:")
print("   - Interface specifications")
print("   - Behavior specifications")
print("   - Validation criteria")
print("   - Implementation templates")
print("")
print("Output: specifications/ directory with .spec.md files")
```

## Task Handler

<!--markdownlint-disable line-length -->

```python
from subprocess import run
import sys

try:
    # BDD階層準拠のタスク分解を実行
    result = run([
        "claude", "task",
        "--subagent_type", "general-purpose",
        "--prompt", "Break down tasks following BDD hierarchy as defined in docs/rules/07-bdd-test-hierarchy.md. Use TodoWrite tool following docs/rules/09-todo-task-management.md for task management."
    ], capture_output=True, text=True)

    if result.returnCode == 0:
        print("Success: Task breakdown completed")
        print(result.stdout)
    else:
        print(f"Error: Task breakdown failed - {result.stderr}")

except Exception as e:
    print(f"Error: {e}")
```

## Code Handler

```python
from subprocess import run
import sys

# 特定タスクグループまたは全実装の実行
task_group = input("Enter task group (or press Enter for full implementation): ").strip()

if task_group:
    prompt = f"""Execute implementation for specific task group: {task_group}

Follow atsushifx-style BDD with strict Red-Green-Refactor cycle:
1. RED: Implement failing tests for {task_group} task group
2. GREEN: Implement minimal code to make tests pass
3. REFACTOR: Optimize both documentation and code

Requirements:
- Maintain Red-Green-Refactor cycle per task group
- Use 1 message = 1 test principle
- Reference todo.md for specific task details

Target: docs/for-ai/atsushifx-bdd-implementation.md"""
else:
    prompt = "Execute full implementation phase with strict BDD compliance. Follow Red-Green-Refactor cycle for each task group. Use 1 message = 1 test principle."

try:
    result = run([
        "claude", "task",
        "--subagent_type", "typescript-bdd-coder",
        "--prompt", prompt
    ], capture_output=True, text=True)

    if result.returnCode == 0:
        print("Success: Implementation completed")
        print(result.stdout)
    else:
        print(f"Error: Implementation failed - {result.stderr}")

except Exception as e:
    print(f"Error: {e}")
```

## Examples

### 使用例 1: プロジェクト初期化

**実行**: `Init Handler のコードを実行して`

**入力**: `core/logger`

**期待出力**:

```text
Created: ./docs/.cc-sdd/core/logger/requirements
Created: ./docs/.cc-sdd/core/logger/specifications
Created: ./docs/.cc-sdd/core/logger/tasks
Created: ./docs/.cc-sdd/core/logger/implementation
Success: SDD structure initialized for core/logger
```

### 使用例 2: 要件定義フェーズ

**実行**: `Requirements Handler のコードを実行して`

**期待出力**:

```text
Requirements Definition Phase
===========================================
Interactive approach to clarify requirements

Steps:
1. Analyze user's basic request
2. Ask clarifying questions about:
   - Target users/agents
   - Document structure preferences
   - Content scope and detail level
   - Integration requirements
3. Create comprehensive requirements document

Output: requirements/ directory with detailed specifications
```

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
