# 品質保証システム完全ガイド

## 概要

ag-loggerプロジェクトの多層的品質保証システム。静的解析、セキュリティチェック、文書品質、自動化フックを統合した包括的な品質管理を提供します。

## 品質保証システム全体設計

### 6層品質ゲート構成

**包括的品質保証によるコード品質とセキュリティの確保**

```
1. 静的解析     - ESLint, TypeScript コンパイラ
2. フォーマット  - dprint による統一書式
3. セキュリティ  - secretlint, gitleaks による機密情報検出
4. 文書品質     - textlint, markdownlint, cspell
5. 規約遵守     - commitlint, ls-lint
6. 自動化      - lefthook による Pre-commit hooks
```

### MCPツールによる品質システム調査

#### 品質設定の詳細理解

```bash
# 品質設定ファイル群の調査
mcp__lsmcp__list_dir --relativePath "configs" --recursive false

# 個別品質設定の詳細確認
mcp__serena-mcp__get_symbols_overview --relative_path "configs/eslint.config.all.js"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/eslint.config.all.typed.js"

# lefthook設定の確認
mcp__serena-mcp__find_file --file_mask "lefthook.yml" --relative_path "."
```

## ESLint設定システム

### 二段階ESLint設定アーキテクチャ

**基本設定とTypeScript特化設定の戦略的分離**

#### 基本ESLint設定

```bash
# パッケージレベル基本リント
pnpm run lint
pnpm -r run lint

# 中央集約基本リント（全ファイル対象）
pnpm run lint-all
```

**設定ファイル**:

- パッケージレベル: `configs/eslint.config.js`
- 中央集約: `configs/eslint.config.all.js`

#### TypeScript特化ESLint設定

```bash
# パッケージレベル TypeScript リント
pnpm run lint:types
pnpm -r run lint:types

# 中央集約 TypeScript リント（全ファイル対象）
pnpm run lint-all:types
```

**設定ファイル**:

- パッケージレベル: `configs/eslint.config.typed.js`
- 中央集約: `configs/eslint.config.all.typed.js`

#### MCPツールによるESLint設定分析

```bash
# ESLint設定パターンの調査
mcp__serena-mcp__search_for_pattern --substring_pattern "eslint\\.config" --relative_path "configs" --restrict_search_to_code_files true

# ルール適用パターンの確認
mcp__serena-mcp__search_for_pattern --substring_pattern "rules.*:" --relative_path "configs" --context_lines_after 5

# プラグイン使用状況の確認
mcp__serena-mcp__search_for_pattern --substring_pattern "plugins.*:" --relative_path "configs" --context_lines_after 3
```

### 統合リント実行

#### 包括的リントフロー

```bash
# 基本 + TypeScript リント
pnpm run lint:all

# 自動修正付きリント
pnpm run lint -- --fix
pnpm run lint:all -- --fix
```

### ESLint高度ルール構成

```javascript
// configs/eslint.config.all.typed.js
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    parser: tsParser,
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
    },
  },
];
```

## コードフォーマットシステム

### dprint統一フォーマットシステム

**一貫性のあるコードスタイル維持**

#### フォーマット実行コマンド

```bash
# コードフォーマット実行
pnpm run format:dprint

# フォーマットチェック（CI 用）
pnpm run check:dprint
```

#### MCPツールによるフォーマット設定確認

```bash
# dprint設定の詳細確認
mcp__serena-mcp__find_file --file_mask "dprint.json*" --relative_path "."

# フォーマット対象ファイルの確認
mcp__serena-mcp__search_for_pattern --substring_pattern "includes.*excludes" --relative_path "." --context_lines_after 5
```

### dprint詳細設定

```json
// dprint.jsonc
{
  "includes": ["**/*.{ts,tsx,js,jsx,json,md}"],
  "excludes": ["**/node_modules", "**/lib", "**/module", "**/maps"],
  "plugins": [
    "https://plugins.dprint.dev/typescript-0.88.0.wasm",
    "https://plugins.dprint.dev/json-0.17.4.wasm",
    "https://plugins.dprint.dev/markdown-0.15.0.wasm"
  ],
  "typescript": {
    "indentWidth": 2,
    "lineWidth": 100,
    "semiColons": "asi",
    "quoteStyle": "preferSingle",
    "trailingCommas": "es5"
  },
  "json": {
    "indentWidth": 2
  },
  "markdown": {
    "lineWidth": 100,
    "textWrap": "maintain"
  }
}
```

## セキュリティチェックシステム

### secretlint機密情報検出システム

**コミット前機密情報漏洩防止**

#### セキュリティチェック実行

```bash
# シークレット検出実行
pnpm run lint:secrets

# 詳細出力でのセキュリティチェック
pnpm exec secretlint --format detailed "**/*"
```

#### MCPツールによるセキュリティ設定確認

```bash
# secretlint設定の確認
mcp__serena-mcp__find_file --file_mask "*secret*" --relative_path "configs"

# セキュリティルールの詳細確認
mcp__serena-mcp__search_for_pattern --substring_pattern "secretlint.*rule" --relative_path "configs" --context_lines_after 3
```

#### secretlint高度設定

```yaml
# configs/secretlint.config.yaml
rules:
  - id: "@secretlint/secretlint-rule-preset-recommend"
    options:
      allows:
        - "/test/"
        - "/example/"
        - "/mock/"
  - id: "@secretlint/secretlint-rule-aws"
  - id: "@secretlint/secretlint-rule-gcp"
  - id: "@secretlint/secretlint-rule-github"
    options:
      allows:
        - "github_pat_example_*"
```

### gitleaks追加セキュリティ層

```toml
# configs/gitleaks.toml
[extend]
useDefault = true

[[rules]]
description = "Generic API Key"
id = "generic-api-key"
regex = '''(?i)(?:key|api|token|secret|password)[:=]\s*['"]?[0-9a-z\-_.]{10,}['"]?'''
tags = ["key", "API", "generic"]

[[rules]]
description = "JWT Token"
id = "jwt-token"
regex = '''(?i)jwt[:=]\s*['"]?[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*['"]?'''
tags = ["jwt", "token"]

[[rules]]
description = "Database Connection String"
id = "database-connection"
regex = '''(?i)(mysql|postgres|mongodb)://[^\s]+'''
tags = ["database", "connection"]
```

## TypeScript型チェック

### 厳密な型安全性システム

#### 型チェック実行コマンド

```bash
# 全パッケージ型チェック
pnpm run check:types
pnpm -r run check:types

# 個別パッケージ型チェック
cd packages/@aglabo/ag-logger
pnpm run check:types

# 詳細型エラー確認
pnpm exec tsc --noEmit --project tsconfig.json
```

#### MCPツールによる型システム分析

```bash
# 型定義の整合性確認
mcp__lsmcp__get_typescript_dependencies --root "$ROOT"
mcp__lsmcp__lsp_get_diagnostics --relativePath "src/AgLogger.class.ts" --root "$ROOT"

# 型エラーの詳細調査
mcp__serena-mcp__search_for_pattern --substring_pattern "\\berror TS" --relative_path "." --context_lines_after 2
```

### TypeScript厳密設定

```json
// base/configs/tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitThis": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## 文書品質チェック

### cspellスペルチェックシステム

#### スペルチェック実行

```bash
# 全プロジェクトスペルチェック
pnpm run check:spells

# 対象ファイル指定スペルチェック
pnpm exec cspell "src/**/*.ts" "docs/**/*.md"
```

#### MCPツールによるスペルチェック設定確認

```bash
# cspell設定の詳細確認
mcp__serena-mcp__find_file --file_mask "*spell*" --relative_path ".vscode"

# プロジェクト辞書の確認
mcp__serena-mcp__find_file --file_mask "*.dic" --relative_path ".vscode/cspell"
```

#### cspell高度設定

```json
// .vscode/cspell.json
{
  "version": "0.2",
  "language": "en",
  "dictionaries": ["project-words", "typescript", "node", "software-terms"],
  "dictionaryDefinitions": [
    {
      "name": "project-words",
      "path": "./.vscode/cspell/dicts/project.dic"
    },
    {
      "name": "typescript",
      "path": "./.vscode/cspell/dicts/typescript.dic"
    }
  ],
  "ignorePaths": [
    "node_modules",
    "lib",
    "module",
    "maps",
    "*.min.js",
    "coverage"
  ],
  "includeRegExpList": [
    "/\\.(ts|tsx|js|jsx|md)$/",
    "/\\.json$/"
  ]
}
```

### Markdownリント・textlint

#### Markdown品質チェック

```bash
# Markdown 構文チェック
pnpm run lint:markdown

# 文書品質チェック（textlint）
pnpm run lint:text
```

#### MCPツールによる文書設定確認

```bash
# Markdown設定の確認
mcp__serena-mcp__find_file --file_mask ".markdownlint*" --relative_path "configs"

# textlint設定の確認
mcp__serena-mcp__find_file --file_mask "textlintrc*" --relative_path "configs"
```

#### markdownlint・textlint設定

```yaml
# markdown lint rule configs
default: true

# lint rules
whitespace: true

line-length:
  line_length: 120
  code_block_line_length: 120

ol-prefix: true

# styles
emphasis-style:
  style: asterisk
strong-style:
  style: asterisk

# Tabs
no-hard-tabs: true
```

```yaml
# configs/textlintrc.yaml
rules:
  preset-ja-technical-writing:
    sentence-length:
      max: 100
    max-kanji-continuous-len:
      max: 8
      allow: []
    no-mix-dearu-desumasu: true
    ja-no-mixed-period:
      allowPeriodMarks:
        - ":"
        - "✨"
    no-doubled-joshi:
      strict: false
```

## ファイル名・構造規約

### ls-lintファイル名規約システム

#### ファイル名チェック実行

```bash
# ファイル名規約チェック
pnpm run lint:filenames

# 詳細出力でのファイル名チェック
pnpm exec ls-lint --config configs/ls-lint.yaml
```

#### MCPツールによるファイル構造確認

```bash
# プロジェクト全体のファイル命名パターン確認
mcp__serena-mcp__search_for_pattern --substring_pattern "\\.(ts|js|json|md)$" --relative_path "." --restrict_search_to_code_files false

# 特定命名パターンの確認
mcp__serena-mcp__find_file --file_mask "*.class.ts" --relative_path "src"
mcp__serena-mcp__find_file --file_mask "*.types.ts" --relative_path "shared/types"
```

#### ls-lint高度設定

```yaml
# configs/ls-lint.yaml
ls:
  ".ts": "kebab-case | camelCase | PascalCase"
  ".js": "kebab-case | camelCase"
  ".json": "kebab-case"
  ".md": "kebab-case"
  ".spec.ts": "kebab-case | camelCase | PascalCase"
  ".config.ts": "kebab-case | camelCase"

ignore:
  - node_modules
  - lib
  - module
  - maps
  - .cache
  - coverage
  - dist

extensions:
  - ".ts"
  - ".js"
  - ".json"
  - ".md"
  - ".yaml"
  - ".yml"
```

## コミット品質管理

### commitlint規約遵守システム

#### コミットメッセージ検証

```bash
# コミットメッセージ検証（lefthook により自動実行）
pnpm exec commitlint --from HEAD~1 --to HEAD --verbose

# 手動コミットメッセージ確認
echo "feat(logger): add new formatting option" | pnpm exec commitlint
```

#### MCPツールによるコミット設定確認

```bash
# commitlint設定の確認
mcp__serena-mcp__find_file --file_mask "commitlint*" --relative_path "configs"

# コミット規約パターンの確認
mcp__serena-mcp__search_for_pattern --substring_pattern "type-enum|subject-case" --relative_path "configs" --context_lines_after 3
```

#### commitlint高度設定

```typescript
// configs/commitlint.config.ts
import { RulesConfig } from '@commitlint/types';

const rules: RulesConfig = {
  'type-enum': [
    2,
    'always',
    ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert'],
  ],
  'type-case': [2, 'always', 'lowerCase'],
  'type-empty': [2, 'never'],
  'subject-case': [2, 'always', 'sentence-case'],
  'subject-empty': [2, 'never'],
  'subject-max-length': [2, 'always', 50],
  'header-max-length': [2, 'always', 72],
  'body-leading-blank': [1, 'always'],
  'footer-leading-blank': [1, 'always'],
};

export default {
  extends: ['@commitlint/config-conventional'],
  rules,
};
```

### codegpt自動改善システム

```yaml
# configs/codegpt.config.yaml
commit:
  template: |
    {type}({scope}): {description}

    {body}

    {footer}
  max_length: 72
  auto_improve: true
  suggest_scope: true
  enforce_conventional: true
```

## Pre-commitフック（lefthook）

### 自動品質ゲートシステム

**コミット時自動実行による品質保証**

#### MCPツールによるフック設定確認

```bash
# lefthook設定の詳細確認
mcp__serena-mcp__find_file --file_mask "lefthook*" --relative_path "."
mcp__serena-mcp__get_symbols_overview --relative_path "lefthook.yml"

# フック対象コマンドの確認
mcp__serena-mcp__search_for_pattern --substring_pattern "commands:" --relative_path "." --context_lines_after 10
```

### lefthook包括的設定

```yaml
# lefthook.yml
pre-commit:
  commands:
    lint-secrets:
      run: pnpm run lint:secrets
      fail_text: "机密情報が検出されました。コミットを中止します。"
    lint-filenames:
      run: pnpm run lint:filenames
      fail_text: "ファイル名規約違反が検出されました。"
    spell-check:
      run: pnpm run check:spells
      fail_text: "スペルエラーが検出されました。"
    format-check:
      run: pnpm run check:dprint
      fail_text: "フォーマットエラーが検出されました。`pnpm run format:dprint`を実行してください。"
    type-check:
      run: pnpm run check:types
      fail_text: "TypeScript型エラーが検出されました。"
    lint-basic:
      run: pnpm run lint
      fail_text: "ESLintエラーが検出されました。"

pre-push:
  commands:
    comprehensive-test:
      run: pnpm run test:develop
      fail_text: "テストが失敗しました。プッシュを中止します。"
    build-check:
      run: pnpm run build
      fail_text: "ビルドが失敗しました。プッシュを中止します。"

commit-msg:
  commands:
    commitlint:
      run: pnpm exec commitlint --edit {1}
      fail_text: "コミットメッセージが規約に違反しています。"
    codegpt-improve:
      run: pnpm exec codegpt commit --improve
      fail_text: "コミットメッセージの改善に失敗しました。"
```

## キャッシュシステム

### 品質チェック高速化

**パフォーマンス向上のための各種キャッシュ**

#### キャッシュ構造

```
.cache/
├── eslint-cache/           # ESLint キャッシュ
├── textlint-cache/         # textlint キャッシュ
├── cspell-cache/          # cSpell キャッシュ
├── dprint-cache/          # dprint キャッシュ
├── typescript-cache/      # TypeScript キャッシュ
└── vitest-cache/         # Vitest キャッシュ
```

#### MCPツールによるキャッシュ確認

```bash
# キャッシュ構造の確認
mcp__lsmcp__list_dir --relativePath ".cache" --recursive true

# キャッシュサイズの確認
mcp__serena-mcp__search_for_pattern --substring_pattern "cache" --relative_path "package.json" --context_lines_after 2
```

### キャッシュ活用高度コマンド

```bash
# キャッシュ付き ESLint 実行
pnpm exec eslint --cache --cache-location .cache/eslint-cache/ src/

# キャッシュ付きスペルチェック
pnpm exec cspell --cache --cache-location .cache/cspell-cache/ "src/**/*.ts"

# キャッシュ付き TypeScript チェック
pnpm exec tsc --incremental --tsBuildInfoFile .cache/typescript-cache/tsbuildinfo

# キャッシュクリア（問題発生時）
rm -rf .cache
pnpm install
```

## 品質メトリクス・レポーティング

### コード品質指標

#### 品質目標値

- **ESLint エラー数**: 0 を維持
- **TypeScript エラー数**: 0 を維持
- **テストカバレッジ**: 90%+ を目標
- **セキュリティ警告**: 0 を維持
- **スペルエラー**: 0 を維持

#### MCPツールによるメトリクス確認

```bash
# プロジェクトの品質統計確認
mcp__lsmcp__get_project_overview --root "$ROOT"

# エラー・警告パターンの検索
mcp__serena-mcp__search_for_pattern --substring_pattern "error|warning|TODO|FIXME" --relative_path "src" --restrict_search_to_code_files true
```

### 品質レポート生成システム

```bash
# ESLint 詳細レポート生成
pnpm exec eslint --format json --output-file reports/eslint-report.json src/
pnpm exec eslint --format html --output-file reports/eslint-report.html src/

# TypeScript 診断レポート
pnpm exec tsc --noEmit --listFiles > reports/typescript-files.txt
pnpm exec tsc --noEmit --showConfig > reports/typescript-config.json

# テストカバレッジレポート
pnpm test --coverage --reporter=json --outputFile=reports/coverage.json
pnpm test --coverage --reporter=html --outputFile=reports/coverage.html

# セキュリティレポート
pnpm exec secretlint --format json --output reports/security-report.json "**/*"
```

## CI/CD品質ゲート

### GitHub Actions統合

#### CI用品質チェック実行

```bash
# 包括的CI品質チェック
pnpm run check:types
pnpm run lint:all
pnpm run check:dprint
pnpm run check:spells
pnpm run lint:secrets
pnpm run test:ci
pnpm run build

# 品質ゲート失敗時の対処
pnpm run lint:all -- --fix     # 自動修正可能な問題
pnpm run format:dprint          # フォーマット修正
```

#### MCPツールによるCI設定確認

```bash
# GitHub Actions設定の確認
mcp__serena-mcp__find_file --file_mask "*.yml" --relative_path ".github/workflows"

# CI品質チェック設定の詳細確認
mcp__serena-mcp__search_for_pattern --substring_pattern "pnpm run.*check|pnpm run.*lint" --relative_path ".github" --context_lines_after 2
```

## 包括的品質チェック

### 開発完了前必須チェックリスト

#### 段階的品質確認プロセス

```bash
# Phase 1: 基本品質確認
pnpm run check:types      # 1. 型安全性確認
pnpm run lint:all         # 2. コード品質確認
pnpm run check:dprint     # 3. フォーマット確認

# Phase 2: 高度品質確認
pnpm run test:develop     # 4. 基本テスト確認
pnpm run build           # 5. ビルド成功確認

# Phase 3: セキュリティ・文書確認
pnpm run lint:secrets    # 6. セキュリティ確認
pnpm run check:spells    # 7. スペル確認
```

#### MCPツールによる最終品質確認

```bash
# 最終実装品質確認
mcp__lsmcp__lsp_get_diagnostics --relativePath "主要ファイル" --root "$ROOT"

# 全体整合性確認
mcp__serena-mcp__find_referencing_symbols --name_path "主要シンボル" --relative_path "主要ファイル"

# テストカバレッジ確認
mcp__serena-mcp__find_file --file_mask "*.spec.ts" --relative_path "src/__tests__"
```

### リリース前包括品質検証

```bash
# 完全品質検証プロセス
echo "=== Complete Quality Gate ==="
pnpm run check:types && echo "✅ TypeScript" || echo "❌ TypeScript"
pnpm run lint:all && echo "✅ ESLint" || echo "❌ ESLint"
pnpm run check:dprint && echo "✅ Format" || echo "❌ Format"
pnpm run check:spells && echo "✅ Spell" || echo "❌ Spell"
pnpm run lint:secrets && echo "✅ Security" || echo "❌ Security"
pnpm run test:ci && echo "✅ Tests" || echo "❌ Tests"
pnpm run build && echo "✅ Build" || echo "❌ Build"
echo "=== Quality Gate Complete ==="
```

## トラブルシューティング

### 品質チェック問題診断・解決

#### 段階的問題解決フロー

```bash
# Step 1: 環境リセット
rm -rf .cache node_modules
pnpm install

# Step 2: 段階的問題特定
pnpm run check:types      # 型エラー特定
pnpm run lint -- --fix   # リント自動修正
pnpm run format:dprint    # フォーマット修正

# Step 3: 設定同期確認
pnpm run sync:configs

# Step 4: 最終確認
pnpm run lint:all
pnpm run build
```

#### MCPツールによる問題診断

```bash
# 問題箇所の特定
mcp__serena-mcp__search_for_pattern --substring_pattern "error|Error|ERROR" --relative_path "." --context_lines_after 3

# 設定ファイルの整合性確認
mcp__serena-mcp__find_file --file_mask "*.config.*" --relative_path "configs"

# 依存関係の問題調査
mcp__lsmcp__get_typescript_dependencies --root "$ROOT"
```

### よくある問題と解決策

1. **ESLint設定競合**: `configs/` の設定確認・同期 → `pnpm run sync:configs`
2. **型エラー**: `tsconfig.json` の継承関係確認 → MCPツールで型システム調査
3. **フォーマット問題**: `dprint.jsonc` の設定確認 → MCPツールで設定詳細確認
4. **テスト失敗**: テスト環境の依存関係確認 → MCPツールでテスト構造調査
5. **セキュリティ警告**: 機密情報の誤検出 → `secretlint.config.yaml` の除外設定調整

この品質保証システムにより、ag-loggerプロジェクトの高品質とセキュリティを継続的に維持できます。
