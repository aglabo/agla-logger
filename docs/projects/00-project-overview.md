# プロジェクト概要・パッケージ構成

## プロジェクト基本情報

**ag-logger** は TypeScript 向けの軽量でプラグイン可能なロガーライブラリです。現在は構造化エラーハンドリングシステム（AglaError フレームワーク）への移行に重点を置いています。

### 基本仕様

- **リポジトリタイプ**: TypeScript monorepo
- **パッケージ管理**: pnpm workspaces (v10.17.0)
- **モジュールシステム**: ESM-first（CommonJS 互換性あり）
- **ビルドシステム**: tsup による dual-target ビルド
- **Node.js**: >= 20
- **pnpm**: >= 10

## モノレポ構造

### トップレベル構造

```
ag-logger/
├── .github/              # GitHub Actions & テンプレート
├── .vscode/              # VS Code 設定・拡張機能
├── base/                 # ベース設定・共通ファイル
├── configs/              # 中央集約された設定ファイル
├── docs/                 # プロジェクト文書
├── packages/             # メインパッケージディレクトリ（7カテゴリ）
├── scripts/              # ビルド・ユーティリティスクリプト
├── shared/               # 共有ユーティリティ・型定義
├── package.json          # ルート package.json（workspaces 設定）
├── pnpm-workspace.yaml   # pnpm ワークスペース設定
└── tsconfig.json         # ルート TypeScript 設定
```

## パッケージ分類

### @aglabo/ パッケージ（統一パッケージ群）

`packages/@aglabo/` に配置:

#### @aglabo/agla-logger-core (v0.1.0)

- **メインロガーパッケージ**
  - プラグイン式アーキテクチャ（Strategy Pattern）
  - カスタムフォーマッター・ロガー対応（9種類のプラグイン）
  - 包括的4層テストスイート
  - 完全な型安全設計

#### @aglabo/agla-error-core (v0.1.0)

- **エラーハンドリングフレームワーク**
  - 統一エラーハンドリングシステム
  - `AglaError`: 拡張エラークラス
  - `AglaErrorContext`: 構造化コンテキスト情報
  - `ErrorSeverity`: エラー重要度レベル
  - JSON シリアライゼーション対応

## ag-logger パッケージ詳細

### アーキテクチャ概要

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

### コア3クラス

1. **AgLogger** (24メソッド) - ログ実行エンジン、シングルトンパターン
2. **AgLoggerManager** (9メソッド) - システム管理、ファサードパターン
3. **AgLoggerConfig** (19メソッド) - 設定管理、プラグイン切り替え

### プラグインシステム

- **Formatter プラグイン**: JsonFormatter, PlainFormatter, NullFormatter, MockFormatter, AgMockFormatter
- **Logger プラグイン**: ConsoleLogger, NullLogger, MockLogger, E2eMockLogger

### 4層テスト構造

1. **Unit Tests** (30ファイル) - 個別関数・メソッド
2. **Functional Tests** (8ファイル) - フィーチャーレベル
3. **Integration Tests** (5ファイル) - コンポーネント統合
4. **E2E Tests** (4ファイル) - 完全シナリオ

## TypeScript パスエイリアス

モノレポ全体でクリーンなインポートを実現:

```typescript
// AGLABO パッケージ（統一パッケージ群）
import { AglaError, ErrorSeverity } from '@aglabo/agla-error-core';
import { AgLogger } from '@aglabo/agla-logger-core';
```

## パッケージ構造パターン

各パッケージは以下の構造に従います:

```
packages/@category/package-name/
├── src/                  # ソースコード
├── lib/                  # CommonJS ビルド出力
├── module/               # ESM ビルド出力
├── shared/               # パッケージ内共有リソース
│   ├── types/           # パッケージ固有型定義
│   └── constants/       # パッケージ固有定数
├── tests/               # 高次テスト
│   ├── integration/     # 統合テスト
│   └── e2e/            # E2E テスト
├── configs/             # パッケージ固有設定
├── package.json         # パッケージ仕様
├── tsconfig.json        # TypeScript 設定（ベース継承）
└── README.md           # パッケージドキュメント
```

## 現在の重点分野

### AglaError フレームワーク移行

**優先度: 最高**

1. **統一エラーハンドリング**:
   - `@shared/types` の `AglaError` 型システム
   - エラーチェーン・重要度レベル・構造化コンテキスト
   - JSON シリアライゼーション対応

2. **エラーハンドリング統合**:
   - AglaError 型システムの完全実装
   - 一貫したエラー処理インターフェース

3. **テストカバレッジ**:
   - 4 層テスト戦略（unit/functional/integration/e2e）
   - BDD アプローチによる包括的テスト

### パッケージ整理状況

**完了済みパッケージ統合**

- @aglabo パッケージ群への統一完了
- パッケージ間依存関係の最適化
- 設定の中央集約化

## パッケージ依存関係

### 依存関係フロー

- **@aglabo/agla-logger-core** → **@aglabo/agla-error-core**（依存関係）
- **@aglabo/*** パッケージが主要フォーカス
- 統一されたパッケージアーキテクチャ

### ワークスペース管理

- **pnpm workspaces** によるモノレポ管理
- **pnpm-workspace.yaml** でワークスペースパッケージ定義
- **workspace protocol** による相互パッケージ依存管理

## 開発環境統合

### ツールチェーン

- **ビルド**: tsup（ESM + CommonJS）
- **テスト**: Vitest（複数設定）
- **リント**: ESLint（基本 + TypeScript 対応）
- **フォーマット**: dprint
- **セキュリティ**: secretlint, gitleaks
- **Pre-commit**: lefthook

### IDE 対応

- VS Code 設定・拡張機能推奨
- TypeScript IntelliSense 完全対応
- パス解決・インポート支援

## MCPツール統合

### 必須MCPツール

**Claude Code使用時は必ずMCPツールを経由**:

- **lsmcp**: LSP機能、型情報取得、シンボル操作、リファクタリング
- **serena-mcp**: セマンティックコード分析、シンボル検索、構造理解

### 基本使用例

```bash
# プロジェクト概要の取得
mcp__lsmcp__get_project_overview --root "C:\Users\atsushifx\workspaces\develop\ag-logger\packages\@aglabo\ag-logger"

# シンボル検索
mcp__lsmcp__search_symbols --query "AgLogger" --root "$ROOT"

# コード構造の理解
mcp__serena-mcp__get_symbols_overview --relative_path "src/AgLogger.class.ts"
```

## 統計情報

### ag-logger パッケージ

- **総ファイル数**: 49
- **総シンボル数**: 126
- **クラス数**: 10
- **メソッド数**: 79
- **プロパティ数**: 26
- **関数数**: 1

### テストファイル数

- **Unit Tests**: 約30ファイル
- **Functional Tests**: 約8ファイル
- **Integration Tests**: 約5ファイル
- **E2E Tests**: 約4ファイル
- **総テストファイル**: 約47ファイル

この概要により、プロジェクト全体の構造と ag-logger パッケージの詳細な実装を理解し、効率的な開発作業を開始できます。
