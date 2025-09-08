# 完全アーキテクチャ設計

## システム全体図

```
┌─────────────────────────────────────────────────────────────┐
│                    ag-logger Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   AgLogger      │◄──►│ AgLoggerManager │                │
│  │  (Core Logger)  │    │   (Singleton)   │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                         │
│           ▼                       ▼                         │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ AgLoggerConfig  │    │   Plugin System │                │
│  │ (Configuration) │    │                 │                │
│  └─────────────────┘    └─────────────────┘                │
│                                   │                         │
│        ┌─────────────────────────┼─────────────────────────┐│
│        │                         │                         ││
│        ▼                         ▼                         ││
│ ┌─────────────┐          ┌─────────────┐                  ││
│ │ Formatters  │          │   Loggers   │                  ││
│ │  - Json     │          │ - Console   │                  ││
│ │  - Plain    │          │ - Mock      │                  ││
│ │  - Mock     │          │ - Null      │                  ││
│ │  - Null     │          │ - E2eMock   │                  ││
│ └─────────────┘          └─────────────┘                  ││
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

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

## コア3クラス詳細分析

### 1. AgLogger - メインログクラス

**場所**: `src\AgLogger.class.ts:32:1`
**責任**: ログ機能の中核、シングルトンパターン実装

#### アーキテクチャ特徴:

- **シングルトンパターン**: `_instance` プロパティでインスタンス管理
- **設定の委譲**: `_config` プロパティで AgLoggerConfig に設定を委譲
- **プラガブル設計**: フォーマッターとロガーを動的に切り替え可能

#### 主要責任と関連メソッド:

**1. インスタンス管理 (Singleton Pattern)**

```typescript
// シングルトン管理
static _instance: AgLogger | null     // Range: 33:3-33:50
static createLogger(): AgLogger       // Range: 57:3-66:4
static getLogger(): AgLogger          // Range: 74:3-82:4
static resetSingleton(): void         // Range: 324:3-326:4
```

**2. ログ実行エンジン**

```typescript
executeLog(level, args)               // Range: 250:3-278:4
// ├─ formatter取得                    // Range: 260:11-260:42
// ├─ logger取得                       // Range: 261:11-261:49  
// ├─ メッセージ構築                   // Range: 263:11-263:58
// └─ フォーマット実行                 // Range: 270:11-270:51

shouldOutput(level): boolean          // Range: 239:3-241:4
```

**3. ログレベル別メソッド (24メソッド)**

```typescript
// 標準ログレベル
debug(args); // Range: 301:3-303:4 → executeLog(LOGLEVEL.DEBUG, args)
info(args); // Range: 296:3-298:4 → executeLog(LOGLEVEL.INFO, args)
warn(args); // Range: 291:3-293:4 → executeLog(LOGLEVEL.WARN, args)
error(args); // Range: 286:3-288:4 → executeLog(LOGLEVEL.ERROR, args)
fatal(args); // Range: 281:3-283:4 → executeLog(LOGLEVEL.FATAL, args)

// 拡張ログレベル
trace(args); // Range: 306:3-308:4 → executeLog(LOGLEVEL.TRACE, args)
verbose(args); // Range: 316:3-318:4 → executeLog(LOGLEVEL.VERBOSE, args)
log(args); // Range: 311:3-313:4 → executeLog(LOGLEVEL.INFO, args)
```

### 2. AgLoggerManager - システム管理

**場所**: `src\AgLoggerManager.class.ts:27:1`
**責任**: ログ実装の統合管理、関数バインド、グローバル設定

#### アーキテクチャ特徴:

- **ファサードパターン**: 複雑な設定を簡単なAPIに集約
- **関数バインド**: グローバル関数としてログメソッドを提供
- **設定の統一管理**: AgLogger と AgLoggerConfig を橋渡し

#### 主要責任 (9メソッド):

**1. マネージャー管理 (Singleton)**

```typescript
static instance: AgLoggerManager      // Range: 28:3-28:56
static createManager()                // Range: 43:3-55:4
static getManager()                   // Range: 64:3-73:4
static resetSingleton()               // Range: 198:3-203:4
```

**2. ログ実装統合**

```typescript
getLogger(): AgLogger                 // Range: 81:3-89:4
setLogger(logger: AgLogger)           // Range: 98:3-107:4
setLoggerConfig(options)              // Range: 121:3-130:4
```

**3. グローバル関数バインド**

```typescript
bindLoggerFunction(); // Range: 140:3-150:4
removeLoggerFunction(); // Range: 186:3-196:4
updateLoggerMap(); // Range: 158:3-167:4
// └─ loggerMap管理                   // Range: 166:35-166:49
```

### 3. AgLoggerConfig - 設定管理中枢

**場所**: `src\internal\AgLoggerConfig.class.ts:49:1`
**責任**: ログ設定の詳細管理、フォーマッター/ロガー管理、統計情報

#### アーキテクチャ特徴:

- **設定の中央集権化**: 全てのログ設定を一元管理
- **プラグイン管理**: フォーマッターとロガーの動的切り替え
- **統計機能**: ログ出力の統計情報収集

#### 主要責任 (19メソッド):

**1. フォーマッター管理**

```typescript
formatter(): AgFormatFunction         // フォーマッター取得
setFormatter(formatter)               // フォーマッター設定
getStatsFormatter()                   // 統計フォーマッター取得
hasStatsFormatter(): boolean          // 統計フォーマッター存在確認
```

**2. ログレベル制御**

```typescript
logLevel(): AgLogLevel               // 現在のログレベル取得
logLevel(level: AgLogLevel)          // ログレベル設定
isVerbose(): boolean                 // 詳細ログ確認
setVerbose(verbose: boolean)         // 詳細ログ設定
```

**3. ロガー実装管理**

```typescript
defaultLogger(): AgLoggerFunction    // デフォルトロガー取得
clearLoggerMap(): void              // ログマップクリア
```

## データフロー図

```
User Code
    │
    ▼
┌─────────────────┐
│   Log Method    │ ← debug(), info(), warn(), error(), etc.
│   (AgLogger)    │
└─────────────────┘
    │ executeLog()
    ▼
┌─────────────────┐
│ AgLoggerConfig  │ ← shouldOutput(), getFormatter(), etc.
│  (Settings)     │
└─────────────────┘
    │
    ├── formatter() ──→ ┌─────────────────┐
    │                   │   Formatters    │ ← JsonFormatter, PlainFormatter
    │                   │   (Plugins)     │
    │                   └─────────────────┘
    │                           │
    └── defaultLogger() ──→ ┌─────────────────┐
                            │    Loggers      │ ← ConsoleLogger, MockLogger
                            │   (Plugins)     │
                            └─────────────────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │     Output      │ ← Console, File, Mock, etc.
                            └─────────────────┘
```

## 設計パターンの活用

### 1. Singleton Pattern

- **AgLogger**: `_instance` による単一インスタンス管理
- **AgLoggerManager**: `instance` によるマネージャー統一
- **目的**: グローバル状態の一貫性保証

### 2. Strategy Pattern

- **Formatter戦略**: JsonFormatter, PlainFormatter, NullFormatter
- **Logger戦略**: ConsoleLogger, MockLogger, NullLogger
- **目的**: 実行時の動的切り替え

### 3. Facade Pattern

- **AgLoggerManager**: 複雑な内部構造を単純なAPIで提供
- **目的**: 利用者からの複雑性隠蔽

### 4. Template Method Pattern

- **executeLog()**: 共通のログ実行テンプレート
- **各ログレベルメソッド**: テンプレートを特定レベルで実行
- **目的**: ログ実行フローの統一

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
  clean: true,
});
```

#### ESM 設定（tsup.config.module.ts）

```typescript
// ESM ビルド設定
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'module',
  dts: true,
  clean: true,
});
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
      "@aglabo/*": ["packages/@aglabo/*"]
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
@aglabo/* packages (主要フォーカス)
@agla-* packages (移行中)
     ↓
@shared/types (型定義)
@shared/constants (定数)
```

## MCPツール統合アーキテクチャ

### 検索とナビゲーション

#### アーキテクチャ理解のためのコマンド

```bash
# コア3クラスの関係性確認
mcp__lsmcp__lsp_find_references --relativePath "src\AgLogger.class.ts" --line 32 --symbolName "AgLogger"

# executeLogメソッドの詳細分析
mcp__lsmcp__get_symbol_details --relativePath "src\AgLogger.class.ts" --line 250 --symbol "executeLog"

# 設定管理の流れ確認
mcp__serena-mcp__find_referencing_symbols --name_path "AgLoggerConfig" --relative_path "src/internal/AgLoggerConfig.class.ts"
```

#### 効率的な解析戦略

```bash
# 1. 全体構造の把握
mcp__lsmcp__get_project_overview --root "C:\Users\atsushifx\workspaces\develop\ag-logger\packages\@aglabo\ag-logger"

# 2. クラス一覧の確認
mcp__lsmcp__search_symbols --kind ["Class"] --root "$ROOT"

# 3. 詳細シンボル解析
mcp__lsmcp__get_symbol_details --relativePath "src\AgLogger.class.ts" --line 32 --symbol "AgLogger" --root "$ROOT"
```

## 拡張ポイント

### 1. 新しいFormatter追加

```typescript
// 新しいフォーマッターの作成例
const CustomFormatter: AgFormatFunction = (logMessage) => {
  // カスタムフォーマット処理
  return `[CUSTOM] ${logMessage.message}`;
};

// 設定への追加
logger.setFormatter(CustomFormatter);
```

### 2. 新しいLogger追加

```typescript
// 新しいロガーの作成例
const CustomLogger: AgLoggerFunction = (formattedMessage) => {
  // カスタム出力処理
  writeToCustomDestination(formattedMessage);
};

// 設定への追加
config.setLoggerFunction(LOGLEVEL.INFO, CustomLogger);
```

## パフォーマンス考慮点

### 1. ログレベルフィルタリング

- `shouldOutput()` による事前フィルタリング
- 不要なフォーマット処理を回避

### 2. シングルトン最適化

- インスタンス生成コストの削減
- メモリ使用量の最適化

### 3. 遅延評価

- フォーマッター/ロガーの実行時取得
- 未使用プラグインの初期化回避

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

このアーキテクチャにより、ag-logger は高い拡張性と保守性を持つモダンなログライブラリとして設計されています。
