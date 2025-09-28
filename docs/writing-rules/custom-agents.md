---
header:
  - src: custom-agents.md
  - @(#): Claude カスタムエージェント記述ルール
title: agla-logger
description: Claude Code 向けカスタムエージェント記述統一ルール - AI エージェント向けガイド
version: 1.0.0
created: 2025-01-28
authors:
  - atsushifx
changes:
  - 2025-01-28: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

このドキュメントは、Claude Code 向けのカスタムエージェントを記述するための統一ルールを定義します。
AI エージェントがエージェント構文を正確に理解し、一貫性のあるエージェントを作成することを目的とします。

## 目次

1. [統合フロントマター仕様](#統合フロントマター仕様)
2. [エージェント構造標準](#エージェント構造標準)
3. [品質検証ワークフロー](#品質検証ワークフロー)
4. [実践的活用例](#実践的活用例)

## 統合フロントマター仕様

### 基本構成

Claude Code 公式要素と ag-logger プロジェクト要素を統合した統一フロントマター形式を使用します。

#### 標準テンプレート

```yaml
---
# Claude Code 必須要素
name: your-agent-name
description: [エージェントの実行タイミング説明]
tools: tool1, tool2, tool3  # オプション - 省略された場合はすべてのツールを継承
model: inherit  # オプション - モデルエイリアスまたは'inherit'を指定

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

#### name フィールド

**目的**: エージェントの識別名指定。
**形式**: `your-agent-name` 形式 (ハイフン区切り)。

命名規則:

- 小文字のみ使用
- ハイフン区切り (`agent-name`)
- 動詞+目的語または機能名
- 簡潔で明確な命名

使用例:

- `typescript-bdd-coder`: TypeScript BDD コーダー
- `git-commit-generator`: Git コミットメッセージ生成
- `test-suite-runner`: テストスイート実行

#### description フィールド

**目的**: エージェントが呼び出されるべき条件・タイミングの説明。
**要件**: 簡潔で具体的な条件説明 (100-200 文字程度)。

記述パターン:

- `[条件] を [動作] するエージェント`
- `[タイミング] に [機能] を提供`
- `[入力条件] から [出力結果] を生成`

記述例:

- `TypeScript BDD プロセスで要件定義から実装まで一貫した開発を行うエージェント`
- `Git ステージされたファイルから適切なコミットメッセージを生成するエージェント`
- `テスト実行時にカバレッジと品質レポートを統合提供するエージェント`

#### tools フィールド (オプション)

**目的**: エージェントが使用するツールの制限指定。
**形式**: カンマ区切りツールリスト。

使用パターン:

- `*`: すべてのツール継承 (デフォルト)
- `Read, Edit, Bash`: 特定ツールのみ
- `*` (省略): 親エージェントからすべて継承

#### model フィールド (オプション)

**目的**: エージェントが使用するモデル指定。
**形式**: モデルエイリアスまたは継承指定。

**ag-logger プロジェクト標準**: `inherit`

使用パターン:

- `inherit`: 親エージェントのモデル継承 (推奨)
- `sonnet`: Claude 3.5 Sonnet
- `haiku`: Claude 3 Haiku
- `opus`: Claude 3 Opus

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

## エージェント構造標準

### ファイル配置・命名

#### ディレクトリ構造

```text
.claude/
└── agents/
    ├── [agent-name].md
    ├── [agent-name-2].md
    └── ...
```

#### 命名規則

**形式**: `[agent-name].md`

**要件**:

- 小文字のみ使用
- ハイフン区切り (`agent-name`)
- 拡張子は `.md`
- スペース・アンダースコア禁止

**パターン例**:

- `typescript-bdd-coder.md` (language-methodology-role)
- `git-commit-generator.md` (tool-action-type)
- `test-coverage-analyzer.md` (domain-function-role)

### ドキュメント構造標準

#### 必須セクション構成

```markdown
---
[Frontmatter]
---

## Agent Overview

[エージェントの概要説明]

## Activation Conditions

[エージェントが起動される条件]

## Core Functionality

[主要機能の詳細説明]

## Integration Guidelines

[他のエージェントやツールとの連携方法]

## Examples

[使用例と期待される動作]
```

### セクション階層ルール

- Level 1: `# [Agent Name]` (通常省略、ファイル名で代替)
- Level 2: `## [Major Section]`
- Level 3: `### [Sub Section]` (必要時のみ)

#### セクション命名規約

**基本機能セクション**:

- `Agent Overview`: エージェント概要
- `Activation Conditions`: 起動条件
- `Core Functionality`: 核機能
- `Integration Guidelines`: 連携ガイドライン

**詳細機能セクション**:

- `Input Processing`: 入力処理
- `Output Generation`: 出力生成
- `Error Handling`: エラーハンドリング
- `Performance Considerations`: パフォーマンス考慮事項

**命名ルール**:

- 英語での記述 (Claude 認識確実性)
- 具体的で明確な表現
- 一貫した語順: `[Aspect] [Function]` または `[Function] [Aspect]`

## 品質検証ワークフロー

### 検証フェーズ

#### Phase 1: 基本検証

**ファイル存在確認**:

```python
import os
file_path = ".claude/agents/[agent-file].md"
if not os.path.exists(file_path):
    print("Error: Agent file not found")
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
required_claude_fields = ['name', 'description']
required_project_fields = ['title', 'version', 'created', 'authors']

for field in required_claude_fields:
    if field not in frontmatter:
        print(f"Error: Missing Claude Code field: {field}")
```

### Phase 3: エージェント固有検証

**model フィールド検証** (ag-logger 標準):

```python
model_value = frontmatter.get('model', 'inherit')
if model_value != 'inherit':
    print(f"Warning: Model should be 'inherit' for ag-logger project, found: {model_value}")
```

**名前一貫性確認**:

```python
import os
filename = os.path.basename(file_path).replace('.md', '')
agent_name = frontmatter.get('name', '')
if filename != agent_name:
    print(f"Error: Filename '{filename}' does not match agent name '{agent_name}'")
```

### 品質基準

#### 検証レポート形式

```text
=== Agent Quality Validation Report ===
File: [agent-file].md
Date: YYYY-MM-DD HH:MM:SS

[✓/✗] Frontmatter Validation
[✓/✗] Structure Validation
[✓/✗] Naming Convention Validation
[✓/✗] ag-logger Standard Compliance
[✓/✗] Documentation Completeness

Overall Status: [PASS/FAIL]
Issues Found: [N]
Warnings: [N]
```

#### ag-logger 準拠チェック

- `pnpm run lint:text docs/writing-rules/custom-agents.md` エラー 0 件
- `pnpm run lint:markdown docs/writing-rules/custom-agents.md` エラー 0 件
- Claude Code 公式仕様との完全互換性確保
- model フィールドは `inherit` 設定

## 実践的活用例

### 基本エージェント例

#### エージェントファイル: `sample-bdd-agent.md`

```markdown
---
# Claude Code 必須要素
name: sample-bdd-agent
description: BDD 開発プロセスでテスト駆動開発を支援するサンプルエージェント
tools: Read, Edit, Bash, Task
model: inherit

# ag-logger プロジェクト要素
title: agla-logger
version: 1.0.0
created: 2025-01-28
authors:
  - atsushifx
changes:
  - 2025-01-28: 初版作成
---

## Agent Overview

このエージェントは BDD (Behavior-Driven Development) プロセスにおいて、要件定義からテスト実装まで一貫した開発支援を提供します。

## Activation Conditions

- ユーザーが BDD フローでの機能実装を要求した場合
- テスト駆動開発のガイダンスが必要な場合
- 要件定義からコード実装までの一貫した開発支援が必要な場合

## Core Functionality

### Test-First Development

1. 要件分析と理解
2. テストケース設計
3. 実装前テスト作成
4. Red-Green-Refactor サイクル実行

### Code Generation

- TypeScript/JavaScript での実装
- Jest/Vitest を使用したテスト作成
- ESLint/Prettier 対応コード生成

## Integration Guidelines

### 他エージェントとの連携

- `git-commit-generator`: 実装完了後のコミット作成
- `test-coverage-analyzer`: テストカバレッジ分析
- `code-quality-checker`: コード品質確認

### ツール使用パターン

1. Read: 既存コード分析
2. Edit: テスト・実装コード編集
3. Bash: テスト実行・ビルド確認
4. Task: 複雑な作業の並列実行

## Examples

### 使用例 1: 新機能の BDD 実装

**トリガー**: "新しいログフィルタ機能を BDD で実装して"

**期待動作**:

1. 要件分析とテストケース設計
2. 失敗するテストの実装
3. 最小限の実装でテスト通過
4. リファクタリングとコード品質向上

### 使用例 2: 既存機能の拡張

**トリガー**: "エラーハンドリング機能を BDD プロセスで拡張して"

**期待動作**:

1. 既存コードの分析
2. 拡張要件のテストケース追加
3. 段階的な機能実装
4. 回帰テスト確認
```

### 高度なエージェント例

#### エージェントファイル: `typescript-test-optimizer.md`

```markdown
---
# Claude Code 必須要素
name: typescript-test-optimizer
description: TypeScript プロジェクトのテスト最適化とパフォーマンス改善を行うエージェント
tools: *
model: inherit

# ag-logger プロジェクト要素
title: agla-logger
version: 1.1.0
created: 2025-01-28
authors:
  - atsushifx
changes:
  - 2025-01-28: 初版作成
---

## Agent Overview

TypeScript プロジェクトにおけるテストスイートの最適化、実行時間短縮、カバレッジ向上を専門とするエージェントです。

## Activation Conditions

- テスト実行時間が長すぎる場合 (5分以上)
- テストカバレッジが目標値を下回る場合 (80%未満)
- テストの並列実行最適化が必要な場合
- CI/CD パイプラインでのテスト失敗頻発時

## Core Functionality

### Performance Analysis

- テスト実行時間分析
- ボトルネック特定
- 並列実行最適化
- モック・スタブ最適化

### Coverage Optimization

- カバレッジギャップ分析
- 効率的なテストケース設計
- 冗長テスト除去
- エッジケーステスト強化

## Integration Guidelines

### MCP ツール活用

- `mcp__lsmcp__search_symbols`: テスト対象シンボル分析
- `mcp__lsmcp__get_project_overview`: プロジェクト構造理解
- `mcp__serena-mcp__find_referencing_symbols`: 依存関係分析

### ag-logger 品質ゲート

1. `pnpm run test:develop`: 単体テスト実行
2. `pnpm run test:ci`: 統合テスト実行
3. `pnpm run check:types`: 型チェック
4. カバレッジレポート生成

## Examples

### 使用例 1: テスト実行時間最適化

**入力**: テストスイート実行時間 8分

**処理**:

1. 実行時間プロファイリング
2. 並列実行可能テスト特定
3. モック最適化提案
4. 設定調整実装

**期待結果**: 実行時間 3分以下達成

### 使用例 2: カバレッジ向上

**入力**: カバレッジ 75%

**処理**:

1. 未カバー領域特定
2. 効率的テストケース設計
3. エッジケーステスト追加
4. 冗長テスト除去

**期待結果**: カバレッジ 85%以上達成
```

## 関連ドキュメント

### ag-logger プロジェクト体系

- [カスタムスラッシュコマンド](./custom-slash-commands.md): スラッシュコマンド記述ルール
- [執筆ルール](./writing-rules.md): Claude 向け執筆禁則事項
- [ドキュメントテンプレート](./document-template.md): 標準テンプレート
- [フロントマターガイド](./frontmatter-guide.md): フロントマター統一ルール

### 開発関連ルール

- [開発ワークフロー](../rules/01-development-workflow.md): BDD 開発プロセス
- [品質保証システム](../rules/03-quality-assurance.md): 多層品質保証
- [MCP ツール必須要件](../rules/04-mcp-tools-mandatory.md): MCP ツール活用ルール

## 注意事項・制約

### 絶対遵守事項

1. **フロントマター統一**: Claude Code 公式要素の厳格遵守
2. **model フィールド**: ag-logger プロジェクトでは `inherit` 必須
3. **セキュリティ**: 機密情報の処理・ログ出力禁止
4. **ファイル配置**: `.claude/agents/` 直下の配置厳守

### ag-logger 固有制約

- model フィールドは常に `inherit` を指定
- MCP ツール (`lsmcp`, `serena-mcp`) の積極活用
- 4層テスト戦略との整合性確保
- lefthook 品質ゲートとの連携

### 品質保証要件

- textlint・markdownlint 準拠
- Claude Code エージェントシステムとの互換性確保
- ag-logger プロジェクト体系との整合性維持
- 実際に動作する機能仕様の提供

## See Also

- [カスタムスラッシュコマンド](custom-slash-commands.md): スラッシュコマンド記述ルール
- [フロントマターガイド](frontmatter-guide.md): フロントマター統一ルール
- [執筆ルール](writing-rules.md): Claude 向け執筆禁則事項
- [ドキュメントテンプレート](document-template.md): 標準テンプレート

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx

---

このルールは AI エージェントによるエージェント作成の品質・一貫性・実用性確保のため必須遵守。
