# プロジェクト概要・パッケージ構成

## プロジェクト基本情報

**ag-logger** は TypeScript 向けの軽量でプラグイン可能なロガーライブラリです。現在は構造化エラーハンドリングシステム（AglaError フレームワーク）への移行に重点を置いています。

### 基本仕様
- **リポジトリタイプ**: TypeScript monorepo
- **パッケージ管理**: pnpm workspaces
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

### @agla-* パッケージ（レガシー・移行中）
`packages/@agla-*/` に配置:

#### @agla-utils/
- `ag-logger`: メインロガーパッケージ
  - プラグイン式アーキテクチャ
  - カスタムフォーマッター・ロガー対応
  - 包括的テストスイート

#### @agla-e2e/
- `fileio-framework`: E2E テストフレームワーク
  - ファイル I/O テスト支援
  - テスト実行環境の提供

### @esta-* パッケージ（コアプロジェクト）
`packages/@esta-*/` に配置:

#### @esta-actions/
- `tools-installer`: GitHub Actions 用ツールインストーラー
  - eget フレームワーク使用
  - ユニバーサルツールインストール

#### @esta-core/
- `error-handler`: 中央集約エラーハンドリング・終了管理
- `feature-flags`: フィーチャーフラグ管理システム
- `tools-config`: ツール用設定管理
- `esta-config`: 基本設定管理
- `esta-error`: エラー処理・報告（移行中）

#### @esta-error/
- `error-handler`: エラーハンドリング（重複・統合予定）
- `error-result`: Result パターン実装

#### @esta-system/
- `exit-status`: 終了ステータスコード管理
- `runtime`: ランタイム検出ユーティリティ

#### @esta-utils/
- `command-runner`: コマンド実行ユーティリティ
- `config-loader`: 設定ローダーユーティリティ
- `get-platform`: プラットフォーム検出ユーティリティ

### Shared パッケージ
`shared/packages/` に配置:

#### constants/
- 全パッケージ共通の定数
- 終了コード、ディレクトリパス等

#### types/
- 共有 TypeScript 型定義
- **AglaError システム**: 統一エラーハンドリング型
  - `AglaError`: 拡張エラークラス
  - `AglaErrorContext`: 構造化コンテキスト情報
  - `ErrorSeverity`: エラー重要度レベル

## TypeScript パスエイリアス

モノレポ全体でクリーンなインポートを実現:

```typescript
// Shared パッケージ
import { someConstant } from '@shared/constants'
import { SomeType } from '@shared/types'

// AGLA パッケージ
import { AgLogger } from '@agla-utils/ag-logger'
import { FileioFramework } from '@agla-e2e/fileio-framework'

// ESTA パッケージ
import { ErrorHandler } from '@esta-core/error-handler'
import { ToolsInstaller } from '@esta-actions/tools-installer'
import { CommandRunner } from '@esta-utils/command-runner'
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

2. **パッケージ統合**:
   - `@esta-core/error-handler` と `@esta-error/error-handler` の統合
   - 一貫したエラー処理インターフェース

3. **テストカバレッジ**:
   - 4 層テスト戦略（unit/functional/integration/e2e）
   - BDD アプローチによる包括的テスト

### パッケージ整理状況
**現在進行中の大規模リファクタリング**

- 一部パッケージは移行中または最近移動・リネームされた状態
- パッケージ間依存関係の最適化
- 設定の中央集約化

## パッケージ依存関係

### 依存関係フロー
- **特定パッケージ** → **shared パッケージ**
- **@esta-*** パッケージが主要フォーカス
- **@agla-*** パッケージはレガシーまたは移行対象

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