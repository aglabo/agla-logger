# 品質保証・コード品質チェック

## 品質保証システム概要

**ag-logger** プロジェクトは多層的な品質保証システムにより、コード品質、セキュリティ、保守性を確保しています。

### 品質ゲート構成
```
1. 静的解析     - ESLint, TypeScript コンパイラ
2. フォーマット  - dprint による統一書式
3. セキュリティ  - secretlint, gitleaks による機密情報検出
4. 文書品質     - textlint, markdownlint, cspell
5. 規約遵守     - commitlint, ls-lint
6. 自動化      - lefthook による Pre-commit hooks
```

## ESLint 設定システム

### 二段階 ESLint 設定
プロジェクトは基本設定と TypeScript 特化設定の二段階構成を採用:

#### 基本 ESLint 設定
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

#### TypeScript 特化 ESLint 設定
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

#### 統合リント実行
```bash
# 基本 + TypeScript リント
pnpm run lint:all

# 自動修正付きリント
pnpm run lint -- --fix
```

### ESLint ルール構成
```javascript
// configs/eslint.config.all.typed.js
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    parser: tsParser,
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  }
]
```

## コードフォーマットシステム

### dprint による統一書式
**dprint** を使用した一貫性のあるコードフォーマット:

```bash
# コードフォーマット実行
pnpm run format:dprint

# フォーマットチェック（CI 用）
pnpm run check:dprint
```

#### dprint 設定
```json
// dprint.jsonc
{
  "includes": ["**/*.{ts,tsx,js,jsx,json,md}"],
  "excludes": ["**/node_modules", "**/lib", "**/module"],
  "plugins": [
    "https://plugins.dprint.dev/typescript-0.88.0.wasm",
    "https://plugins.dprint.dev/json-0.17.4.wasm",
    "https://plugins.dprint.dev/markdown-0.15.0.wasm"
  ],
  "typescript": {
    "indentWidth": 2,
    "lineWidth": 100,
    "semiColons": "asi"
  }
}
```

## セキュリティチェックシステム

### secretlint による機密情報検出
コミット前の機密情報漏洩防止:

```bash
# シークレット検出実行
pnpm run lint:secrets
```

#### secretlint 設定
```yaml
# configs/secretlint.config.yaml
rules:
  - id: "@secretlint/secretlint-rule-preset-recommend"
    options:
      allows:
        - "/test/"
        - "/example/"
```

### gitleaks による追加セキュリティ
```toml
# configs/gitleaks.toml
[extend]
useDefault = true

[[rules]]
description = "Generic API Key"
id = "generic-api-key"
regex = '''(?i)(?:key|api|token|secret|password)[:=]\s*['"]?[0-9a-z\-_.]{10,}['"]?'''
tags = ["key", "API", "generic"]
```

## TypeScript 型チェック

### 厳密な型チェック設定
```bash
# 全パッケージ型チェック
pnpm run check:types
pnpm -r run check:types

# 個別パッケージ型チェック
cd packages/@agla-utils/ag-logger
pnpm run check:types
```

#### TypeScript 厳密設定
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitThis": true
  }
}
```

## 文書品質チェック

### スペルチェック（cspell）
```bash
# 全プロジェクトスペルチェック
pnpm run check:spells
```

#### cspell 設定
```json
// .vscode/cspell.json
{
  "version": "0.2",
  "language": "en",
  "dictionaries": ["project-words", "typescript", "node"],
  "dictionaryDefinitions": [
    {
      "name": "project-words",
      "path": "./.vscode/cspell/dicts/project.dic"
    }
  ]
}
```

### Markdown リント
```bash
# Markdown 構文チェック
pnpm run lint:markdown
```

#### markdownlint 設定
```yaml
# configs/.markdownlint.yaml
default: true
MD013:
  line_length: 120
MD033: false  # HTML タグ許可
MD041: false  # 最初の見出しレベル自由
```

### テキストリント（textlint）
```bash
# 文書品質チェック
pnpm run lint:text
```

#### textlint 設定
```yaml
# configs/textlintrc.yaml
rules:
  preset-ja-technical-writing: true
  preset-jtf-style: true
  spellcheck-tech-word: true
```

## ファイル名・構造規約

### ls-lint によるファイル名チェック
```bash
# ファイル名規約チェック
pnpm run lint:filenames
```

#### ls-lint 設定
```yaml
# configs/ls-lint.yaml
ls:
  ".ts": "kebab-case | camelCase | PascalCase"
  ".js": "kebab-case | camelCase"
  ".json": "kebab-case"
  ".md": "kebab-case"

ignore:
  - node_modules
  - lib
  - module
  - .cache
```

## コミット品質管理

### commitlint による規約遵守
```bash
# コミットメッセージ検証（lefthook により自動実行）
pnpm exec commitlint --from HEAD~1 --to HEAD --verbose
```

#### commitlint 設定
```typescript
// configs/commitlint.config.ts
import { RulesConfig } from '@commitlint/types'

const rules: RulesConfig = {
  'type-enum': [
    2,
    'always',
    ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']
  ],
  'type-case': [2, 'always', 'lowerCase'],
  'subject-case': [2, 'always', 'sentence-case']
}

export default {
  extends: ['@commitlint/config-conventional'],
  rules
}
```

### codegpt による自動改善
```yaml
# configs/codegpt.config.yaml
commit:
  template: |
    {type}({scope}): {description}
    
    {body}
    
    {footer}
  max_length: 72
  auto_improve: true
```

## Pre-commit フック（lefthook）

### 自動品質ゲート
コミット時に自動実行される品質チェック:

```yaml
# lefthook.yml
pre-commit:
  commands:
    lint-secrets:
      run: pnpm run lint:secrets
    lint-filenames:
      run: pnpm run lint:filenames  
    spell-check:
      run: pnpm run check:spells
    format-check:
      run: pnpm run check:dprint
    
commit-msg:
  commands:
    commitlint:
      run: pnpm exec commitlint --edit {1}
    codegpt-improve:
      run: pnpm exec codegpt commit --improve
```

### フック実行フロー
1. **pre-commit**: ファイル変更時の品質チェック
2. **commit-msg**: コミットメッセージの検証・改善

## キャッシュシステム

### 品質チェックキャッシュ
パフォーマンス向上のための各種キャッシュ:

```
.cache/
├── eslint-cache/           # ESLint キャッシュ
├── textlint-cache/         # textlint キャッシュ  
├── cspell/                # cSpell キャッシュ
└── dprint-cache/          # dprint キャッシュ
```

### キャッシュ活用コマンド
```bash
# キャッシュ付き ESLint 実行
pnpm exec eslint --cache --cache-location .cache/eslint-cache/ src/

# キャッシュ付きスペルチェック
pnpm exec cspell --cache --cache-location .cache/cspell/ "src/**/*.ts"
```

## 品質メトリクス

### コード品質指標
- **ESLint エラー数**: 0 を維持
- **TypeScript エラー数**: 0 を維持
- **テストカバレッジ**: 90%+ を目標
- **セキュリティ警告**: 0 を維持

### 品質レポート生成
```bash
# ESLint レポート生成
pnpm exec eslint --format json --output-file reports/eslint-report.json src/

# TypeScript 診断レポート
pnpm exec tsc --noEmit --listFiles > reports/typescript-report.txt
```

## CI/CD 品質ゲート

### GitHub Actions 統合
```bash
# CI 用品質チェック実行
pnpm run lint:all
pnpm run check:types  
pnpm run check:dprint
pnpm run check:spells
pnpm run lint:secrets
```

### 品質ゲート失敗時の対処
```bash
# 問題特定・修正フロー
pnpm run lint:all -- --fix     # 自動修正可能な問題
pnpm run format:dprint          # フォーマット修正
pnpm run check:types           # 型エラー確認
```

## 包括的品質チェック

### 開発完了前チェックリスト
```bash
# 必須品質チェック（順序重要）
pnpm run check:types      # 1. 型安全性
pnpm run lint:all         # 2. コード品質  
pnpm run check:dprint     # 3. フォーマット
pnpm run test:develop     # 4. 基本テスト
pnpm run build           # 5. ビルド成功
```

### リリース前包括チェック
```bash
# 完全品質検証
pnpm run check:types
pnpm run lint:all  
pnpm run check:dprint
pnpm run check:spells
pnpm run lint:secrets
pnpm run test:ci
pnpm run build
```

## トラブルシューティング

### 品質チェック問題解決
```bash
# キャッシュクリア
rm -rf .cache
pnpm install

# 段階的問題特定
pnpm run check:types      # 型エラー特定
pnpm run lint -- --fix   # リント自動修正
pnpm run format:dprint    # フォーマット修正
```

### よくある問題と解決策
1. **ESLint 設定競合**: `configs/` の設定確認・同期
2. **型エラー**: `tsconfig.json` の継承関係確認  
3. **フォーマット問題**: `dprint.jsonc` の設定確認
4. **テスト失敗**: テスト環境の依存関係確認