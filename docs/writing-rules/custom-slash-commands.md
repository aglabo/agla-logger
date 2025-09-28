---
header:
  - src: custom-slash-commands.md
  - @(#): Claude カスタムスラッシュコマンド記述ルール
title: agla-logger
description: Claude Code 向けカスタムスラッシュコマンド記述統一ルール - AI エージェント向けガイド
version: 1.0.0
created: 2025-01-15
authors:
  - atsushifx
changes:
  - 2025-01-15: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

このドキュメントは、Claude Code 向けのカスタムスラッシュコマンドを記述するための統一ルールを定義します。
AI エージェントがコマンド構文を正確に理解し、一貫性のあるコマンドを作成することを目的とします。

## 目次

1. [統合フロントマター仕様](#統合フロントマター仕様)
2. [Python スニペット実行方式](#python-スニペット実行方式)
3. [コマンド構造標準](#コマンド構造標準)
4. [品質検証ワークフロー](#品質検証ワークフロー)
5. [実践的活用例](#実践的活用例)

## 統合フロントマター仕様

### 基本構成

Claude Code 公式要素と ag-logger プロジェクト要素を統合した統一フロントマター形式を使用します。

#### 標準テンプレート

```yaml
---
# Claude Code 必須要素
allowed-tools: Bash(*), Task(*)
argument-hint: [subcommand] [args]
description: [AI エージェント向けコマンド説明]

# ag-logger プロジェクト要素
title: agla-logger
version: 1.0.0
created: YYYY-MM-DD
authors:
  - atsushifx
changes:
  - YYYY-MM-DD: 初版作成
---
```

### Claude Code 必須要素

#### allowed-tools フィールド

**目的**: コマンドが使用できるツールのリスト指定。
**形式**: `[tool-name]([pattern])` 形式。

使用例:

- `Bash(*)`: すべての Bash コマンド許可
- `Task(*)`: すべての Task ツール許可
- `Read(*), Write(*)`: ファイル操作ツール許可

#### argument-hint フィールド

**目的**: スラッシュコマンドの引数ヒント表示 (自動補完機能用)。
**形式**: `[subcommand] [args]` 形式。

パターン例:

- `[subcommand] [args]`: 汎用パターン
- `init <namespace>/<module>`: 具体的引数指定
- `add [tagId] | remove [tagId] | list`: 複数選択肢

#### description フィールド

**目的**: AI エージェント向けコマンド説明。
**要件**: 日本語での簡潔な説明文 (50-100 文字程度)。

記述例:

- `Claude カスタムスラッシュコマンド記述ルール - AI エージェント向け統一ガイド`
- `BDD開発フロー実行コマンド - 要件定義から実装まで`

### ag-logger プロジェクト要素

#### 統一要素

- title: `agla-logger` (プロジェクト名統一)
- version: セマンティックバージョニング形式
- created: 初回作成日 (YYYY-MM-DD 形式)
- authors: 作成者リスト
- changes: 変更履歴

#### 要素分離ルール

必須: コメント区分により Claude Code 要素と ag-logger 要素を明確に分離。

```yaml
---
# Claude Code 必須要素
[claude-code-elements]

# ag-logger プロジェクト要素
[ag-logger-elements]
---
```

## Python スニペット実行方式

### 基本実行パターン

#### セクション別コードブロック構造

````markdown
## [Section Name]

```python
# Python コード
print("実行結果")
```
````

#### Claude 実行指示形式

```text
[Section Name]のコードを実行して。
```

### 標準実行パターン

#### Pattern 1: Help Display (ヘルプ表示)

```python
print("[command-name] - [Brief description]")
print("")
print("Usage: /[command-name] [subcommand] [args]")
print("")
print("Subcommands:")
print(" [sub1]    [Description]")
print(" [sub2]    [Description]")
print("")
print("Examples:")
print(" /[command-name] [example1]")
print(" /[command-name] [example2]")
```

#### Pattern 2: Directory Creation (ディレクトリ作成)

```python
import os

base_path = "[target-directory]"
subdirs = ["[subdir1]", "[subdir2]", "[subdir3]"]

try:
    # ベースディレクトリ作成
    os.makedirs(base_path, exist_ok=True)
    print(f"Created: {base_path}")

    # サブディレクトリ作成
    for subdir in subdirs:
        full_path = f"{base_path}/{subdir}"
        os.makedirs(full_path, exist_ok=True)
        print(f"Created: {full_path}")

except Exception as e:
    print(f"Error: {e}")
```

#### Pattern 3: File Creation (ファイル作成)

```python
import os

file_path = "[target-file.ext]"
content = """[file-content]
"""

try:
    # ディレクトリ存在確認・作成
    dir_path = os.path.dirname(file_path)
    if dir_path:
        os.makedirs(dir_path, exist_ok=True)

    # ファイル作成
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Created: {file_path}")

except Exception as e:
    print(f"Error: {e}")
```

### 処理制約・要件

#### 技術制約

- Python バージョン: Python 3.x (Claude Code 環境準拠)
- ライブラリ: 標準ライブラリ (os, sys, json, datetime) のみ使用
- 実行時間: 即座完了 (5秒以内)
- 処理複雑度: シンプルな処理 (クラス定義・複雑なロジック禁止)

#### エラーハンドリング

基本パターン:

```python
try:
    # 処理
    print("Success: 処理完了")
except Exception as e:
    print(f"Error: {e}")
```

メッセージ形式:

- `Error: [Specific error description]`
- `Success: [成功メッセージ]`
- `Created: [作成されたファイル/ディレクトリ]`

## コマンド構造標準

### ファイル配置・命名

#### ディレクトリ構造

```text
.claude/
└── commands/
    ├── [command-name].md
    ├── [command-name-2].md
    └── ...
```

#### 命名規則

**形式**: `[command-name].md`

**要件**:

- 小文字のみ使用
- ハイフン区切り (`command-name`)
- 拡張子は `.md`
- スペース・アンダースコア禁止

**パターン例**:

- `commit-message.md` (action-target)
- `validate-debug.md` (action-target)
- `project-init.md` (target-action)

### ドキュメント構造標準

#### 必須セクション構成

````markdown
---
[Frontmatter]
---

## Quick Reference

[使用方法概要]

## Help Display

```python
[Help display code]
```
````

## [Function] Handler

```python
[Implementation code]
```

## Examples

[使用例と期待される出力]。

### セクション階層ルール

- Level 1: `# [Command Name]` (通常省略、ファイル名で代替)
- Level 2: `## [Major Section]`
- Level 3: `### [Sub Section]` (必要時のみ)

#### セクション命名規約

**基本機能セクション**:

- `Help Display`: ヘルプ表示
- `Version Info`: バージョン情報表示
- `Quick Setup`: 初期設定

**処理機能セクション**:

- `[Command] Handler`: 各コマンド処理
- `Initialize [Target]`: 初期化処理
- `Create [Resource]`: リソース作成
- `Update [Configuration]`: 設定更新

**命名ルール**:

- 英語での記述 (Claude 認識確実性)
- 具体的で明確な表現
- 一貫した語順: `[Action] [Object]` または `[Object] [Action]`

## 品質検証ワークフロー

### 検証フェーズ

#### Phase 1: 基本検証

**ファイル存在確認**:

```python
import os
file_path = ".claude/commands/[command-file].md"
if not os.path.exists(file_path):
    print("Error: Command file not found")
```

**フロントマター確認**:

```python
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()
if not content.startswith('---'):
    print("Error: Frontmatter not found")
```

### Phase 2: フロントマター検証

**YAML 構文検証**:

```python
import yaml
try:
    frontmatter = yaml.safe_load(frontmatter_content)
except yaml.YAMLError as e:
    print(f"Error: Invalid YAML syntax - {e}")
```

**必須フィールド確認**:

```python
required_claude_fields = ['allowed-tools', 'argument-hint', 'description']
required_project_fields = ['title', 'version', 'created', 'authors']

for field in required_claude_fields:
    if field not in frontmatter:
        print(f"Error: Missing Claude Code field: {field}")
```

### Phase 3: Python コード検証

**構文正確性確認**:

```python
import ast
try:
    ast.parse(python_code)
    print("Success: Python syntax valid")
except SyntaxError as e:
    print(f"Error: Python syntax error - {e}")
```

**実行テスト**:

```python
try:
    exec(python_code)
    print("Success: Code execution completed")
except Exception as e:
    print(f"Error: Runtime error - {e}")
```

### 品質基準

#### 検証レポート形式

```text
=== Quality Validation Report ===
File: [command-file].md
Date: YYYY-MM-DD HH:MM:SS

[✓/✗] Frontmatter Validation
[✓/✗] Structure Validation
[✓/✗] Python Code Validation
[✓/✗] Integration Validation
[✓/✗] Project Compliance Validation

Overall Status: [PASS/FAIL]
Issues Found: [N]
Warnings: [N]
```

#### ag-logger 準拠チェック

- `pnpm run lint:text docs/writing-rules/custom-slash-commands.md` エラー 0 件
- `pnpm run lint:markdown docs/writing-rules/custom-slash-commands.md` エラー 0 件
- Claude Code 公式仕様との完全互換性確保

## 実践的活用例

### 基本コマンド例

#### コマンドファイル: `sample-command.md`

````markdown
---
# Claude Code 必須要素
allowed-tools: Bash(*), Task(*)
argument-hint: [subcommand] [args]
description: サンプルコマンド - 基本的な使用方法デモ

# ag-logger プロジェクト要素
title: agla-logger
version: 1.0.0
created: 2025-01-15
authors:
  - atsushifx
changes:
  - 2025-01-15: 初版作成
---

## Quick Reference

基本的なサンプルコマンドの使用方法:

```text
/sample-command help       # ヘルプ表示。
/sample-command init       # 初期化実行。
/sample-command status     # 状態確認。
```
````

## Help Display

```python
print("sample-command - Basic sample command demonstration")
print("")
print("Usage: /sample-command [subcommand] [args]")
print("")
print("Subcommands:")
print(" help      Show this help message")
print(" init      Initialize sample configuration")
print(" status    Show current status")
print("")
print("Examples:")
print(" /sample-command help")
print(" /sample-command init")
```

## Initialize Handler

```python
import os

config_dir = "./sample-config"
config_file = f"{config_dir}/sample.json"

try:
    # 設定ディレクトリ作成
    os.makedirs(config_dir, exist_ok=True)
    print(f"Created: {config_dir}")

    # 設定ファイル作成
    config_content = """{
  "version": "1.0.0",
  "initialized": true,
  "created": "2025-01-15"
}"""

    with open(config_file, "w", encoding="utf-8") as f:
        f.write(config_content)

    print(f"Created: {config_file}")
    print("Success: Sample command initialized")

except Exception as e:
    print(f"Error: {e}")
```

## 使用例

### 使用例 1: ヘルプ表示

**実行**: `Help Display のコードを実行して`

**期待出力**:

```text
sample-command - Basic sample command demonstration

Usage: /sample-command [subcommand] [args]

Subcommands:
 help      Show this help message
 init      Initialize sample configuration
 status    Show current status

Examples:
 /sample-command help
 /sample-command init
```

### 使用例 2: 初期化実行

**実行**: `Initialize Handler のコードを実行して`

**期待出力**:

```text
Created: ./sample-config
Created: ./sample-config/sample.json
Success: Sample command initialized
```

### 複雑なコマンド例 (参考)

より複雑な機能を持つコマンドの場合:

```yaml
---
# Claude Code 必須要素
allowed-tools: Bash(*), Task(*), Read(*), Write(*)
argument-hint: <command> [subcommand] [args...]
description: [詳細なコマンド機能説明]
model: claude-3-5-sonnet-20241022
disable-model-invocation: false

# ag-logger プロジェクト要素
title: agla-logger
version: 1.1.0
created: YYYY-MM-DD
authors:
  - atsushifx
changes:
  - YYYY-MM-DD: 初版作成
  - YYYY-MM-DD: [機能追加・修正内容]
---
```

## See Also

- [カスタムエージェント](custom-agents.md): エージェント記述ルール
- [フロントマターガイド](frontmatter-guide.md): フロントマター統一ルール
- [執筆ルール](writing-rules.md): Claude 向け執筆禁則事項
- [ドキュメントテンプレート](document-template.md): 標準テンプレート

## 注意事項・制約

### 絶対遵守事項

1. **フロントマター統一**: Claude Code 公式要素の厳格遵守
2. **Python 制約**: 標準ライブラリのみ使用、シンプル処理原則
3. **セキュリティ**: 機密情報のコード記述・ログ出力禁止
4. **ファイル配置**: `.claude/commands/` 直下の配置厳守

### 品質保証要件

- textlint・markdownlint 準拠
- Claude Code 自動補完機能との互換性確保
- ag-logger プロジェクト体系との整合性維持
- 実際に動作するサンプルコードの提供

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx

---

このルールは AI エージェントによるコマンド作成の品質・一貫性・実用性確保のため必須遵守。
