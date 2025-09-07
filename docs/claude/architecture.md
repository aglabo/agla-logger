# アーキテクチャとビルド構成

## モジュールシステムアーキテクチャ

### ESM-First アプローチ
**ag-logger** は ES Modules を第一とし、CommonJS 互換性を提供する dual-package 戦略を採用しています。

#### モジュール出力構成
```
package-name/
├── lib/                  # CommonJS ビルド出力
│   ├── index.js         # CJS エントリーポイント
│   └── ...
├── module/              # ESM ビルド出力
│   ├── index.js         # ESM エントリーポイント
│   └── ...
└── package.json         # dual exports 設定
```

#### package.json エクスポート設定
```json
{
  "type": "module",
  "main": "./lib/index.js",
  "module": "./module/index.js",
  "exports": {
    ".": {
      "import": "./module/index.js",
      "require": "./lib/index.js"
    }
  }
}
```

## ビルドシステム（tsup）

### tsup 設定アーキテクチャ
各パッケージは複数の tsup 設定を使用:

#### 基本設定（tsup.config.ts）
```typescript
// CommonJS ビルド設定
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'lib',
  dts: true,
  clean: true
})
```

#### ESM 設定（tsup.config.module.ts）
```typescript
// ESM ビルド設定
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'module',
  dts: true,
  clean: true
})
```

### ビルドプロセスフロー
1. **TypeScript → JavaScript**: ソースコードトランスパイル
2. **型定義生成**: `.d.ts` ファイル自動生成
3. **dual-target 出力**: CJS (`lib/`) と ESM (`module/`) 同時生成
4. **Tree-shaking 対応**: ESM 形式での最適化

## TypeScript 設定階層

### 設定継承アーキテクチャ
```
base/configs/tsconfig.base.json     # ベース設定
└── tsconfig.json                   # ルート設定
    └── packages/*/tsconfig.json    # パッケージ固有設定
```

#### ベース設定（tsconfig.base.json）
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### パス解決設定
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/types": ["shared/packages/types/types"],
      "@shared/constants": ["shared/packages/constants/constants"],
      "@agla-utils/*": ["packages/@agla-utils/*"],
      "@esta-core/*": ["packages/@esta-core/*"],
      "@esta-utils/*": ["packages/@esta-utils/*"]
    }
  }
}
```

## パッケージアーキテクチャパターン

### 標準パッケージ構造
```
packages/@namespace/package-name/
├── src/                    # ソースコード
│   ├── index.ts           # メインエクスポート
│   ├── core/              # コア機能
│   ├── utils/             # ユーティリティ
│   └── __tests__/         # 単体テスト
├── shared/                # パッケージ内共有リソース
│   ├── types/             # パッケージ固有型定義
│   └── constants/         # パッケージ固有定数
├── tests/                 # 高次テスト
│   ├── integration/       # 統合テスト
│   └── e2e/              # E2E テスト
├── configs/              # ビルド・テスト設定
├── lib/                  # CommonJS 出力（自動生成）
├── module/               # ESM 出力（自動生成）
└── package.json          # パッケージ設定
```

### 設定ファイル配置
各パッケージの `configs/` ディレクトリ:
```
configs/
├── commitlint.config.ts      # コミットメッセージ規約
├── eslint.config.js          # ESLint 基本設定
├── eslint.config.typed.js    # ESLint TypeScript 設定
├── secretlint.config.yaml    # シークレット検出設定
├── tsup.config.ts            # CommonJS ビルド設定
├── tsup.config.module.ts     # ESM ビルド設定
└── vitest.config.*.ts        # テスト設定（4種類）
```

## 依存関係管理アーキテクチャ

### Workspace Protocol
pnpm workspace protocol による内部依存管理:
```json
{
  "dependencies": {
    "@shared/types": "workspace:*",
    "@shared/constants": "workspace:*"
  }
}
```

### 依存関係方向
```
Specific Packages → Shared Packages
     ↓
@esta-* packages (主要フォーカス)
@agla-* packages (レガシー・移行中)
     ↓
@shared/types (型定義)
@shared/constants (定数)
```

## 中央集約設定システム

### 設定同期アーキテクチャ
中央設定（`configs/`）からパッケージレベル設定への同期:

```bash
# 設定同期スクリプト
pnpm run sync:configs
```

#### 中央設定ファイル
```
configs/
├── eslint.config.all.js          # 全体 ESLint 基本
├── eslint.config.all.typed.js    # 全体 ESLint TypeScript
├── commitlint.config.ts          # コミット規約
├── secretlint.config.yaml        # シークレット検出
├── .markdownlint.yaml           # Markdown リント
├── textlintrc.yaml              # テキストリント
└── ls-lint.yaml                 # ファイル名規約
```

## パス解決システム

### TypeScript Path Mapping
```typescript
// tsconfig.json での設定
{
  "compilerOptions": {
    "paths": {
      "@shared/types": ["shared/packages/types/types"],
      "@shared/constants": ["shared/packages/constants/constants"],
      "@agla-utils/*": ["packages/@agla-utils/*"],
      "@esta-core/*": ["packages/@esta-core/*"],
      "@esta-utils/*": ["packages/@esta-utils/*"],
      "@esta-error/*": ["packages/@esta-error/*"],
      "@esta-system/*": ["packages/@esta-system/*"],
      "@esta-actions/*": ["packages/@esta-actions/*"]
    }
  }
}
```

### ランタイム解決
- **開発時**: TypeScript コンパイラによる解決
- **テスト時**: Vitest + vite-tsconfig-paths による解決
- **ビルド時**: tsup による解決

## テストアーキテクチャ統合

### Vitest 設定階層
```
configs/vitest.config.*.ts
├── vitest.config.unit.ts         # 単体テスト
├── vitest.config.functional.ts   # 機能テスト
├── vitest.config.integration.ts  # 統合テスト
├── vitest.config.e2e.ts         # E2E テスト
└── vitest.config.gha.ts         # GitHub Actions 用
```

### テスト実行環境
- **Path aliases**: TypeScript パス解決
- **Mock support**: 自動モック生成
- **Coverage**: Istanbul による測定
- **Parallel execution**: 並列テスト実行

## キャッシュ戦略

### ビルドキャッシュ
```
.cache/
├── eslint-cache/           # ESLint キャッシュ
├── textlint-cache/         # textlint キャッシュ
├── cspell/                # cSpell キャッシュ
└── tsup-cache/            # tsup ビルドキャッシュ
```

### パッケージレベルキャッシュ
- **node_modules**: パッケージ固有依存関係
- **.turbo**: Turbo キャッシュ（将来対応）

## 型システム統合

### 共有型定義アーキテクチャ
`@shared/types` パッケージ:
```typescript
// AglaError 型システム
export class AglaError extends Error {
  context?: AglaErrorContext
  severity: ErrorSeverity
  cause?: AglaError
}

export interface AglaErrorContext {
  timestamp: Date
  source: string
  details?: Record<string, unknown>
}

export enum ErrorSeverity {
  FATAL = 'FATAL',
  ERROR = 'ERROR', 
  WARNING = 'WARNING',
  INFO = 'INFO'
}
```

### 型安全性保証
- **strict モード**: 厳密な型チェック
- **noImplicitAny**: 暗黙的 any 禁止
- **strictNullChecks**: null/undefined 厳密チェック
- **noImplicitReturns**: 戻り値必須

## 開発ツール統合

### VS Code 統合
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.import.path": "relative"
}
```

### デバッガー設定
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--config", "configs/vitest.config.unit.ts"]
    }
  ]
}
```

## パフォーマンス最適化

### ビルド最適化
- **Code splitting**: 自動コード分割
- **Tree shaking**: 未使用コード除去
- **Minification**: 本番用最適化
- **Source maps**: デバッグ支援

### 開発時最適化
- **Incremental compilation**: 増分コンパイル
- **Watch mode**: ファイル変更監視
- **Hot module replacement**: 開発サーバー対応