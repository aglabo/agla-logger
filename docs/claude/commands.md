# 開発コマンド総覧

## ビルドコマンド

### 全パッケージビルド
```bash
# 全パッケージの ESM + CommonJS ビルド
pnpm run build

# ESM のみビルド
pnpm run build:esm

# CommonJS のみビルド
pnpm run build:cjs

# 型定義ファイルのみビルド
pnpm run build:types
```

### 個別パッケージビルド
```bash
# 特定パッケージに移動してビルド
cd packages/@agla-utils/ag-logger
pnpm run build
```

### ビルドクリーンアップ
```bash
# 全パッケージのビルド出力を削除
pnpm run clean
```

## テストコマンド

### 全パッケージテスト
```bash
# 開発用テスト（高速、主に unit テスト）
pnpm run test:develop
pnpm -r run test:develop

# CI 用テスト（包括的、全テスト層）
pnpm run test:ci
pnpm -r run test:ci
```

### 個別パッケージテスト
```bash
cd packages/@agla-utils/ag-logger

# 開発用テスト
pnpm run test:develop

# CI 用テスト
pnpm run test:ci

# 特定テスト層
pnpm run test:unit        # 単体テスト
pnpm run test:functional  # 機能テスト
pnpm run test:integration # 統合テスト
pnpm run test:e2e        # E2E テスト
```

### 特定ファイルテスト
```bash
# 特定テストファイルの実行
pnpm exec vitest run --config ./configs/vitest.config.unit.ts src/__tests__/AglaError.spec.ts

# テスト監視モード
pnpm exec vitest watch --config ./configs/vitest.config.unit.ts
```

## リント・フォーマットコマンド

### ESLint
```bash
# 全パッケージ基本リント
pnpm run lint
pnpm -r run lint

# 全パッケージ TypeScript 対応リント
pnpm run lint:types
pnpm -r run lint:types

# 基本 + TypeScript リント
pnpm run lint:all

# 自動修正
pnpm run lint -- --fix
```

### 中央集約リント（ルートレベル）
```bash
# 基本 ESLint（全ファイル）
pnpm run lint-all

# TypeScript 対応 ESLint（全ファイル）
pnpm run lint-all:types
```

### コードフォーマット
```bash
# dprint フォーマット実行
pnpm run format:dprint

# dprint フォーマットチェック
pnpm run check:dprint
```

### その他リント
```bash
# ファイル名規約チェック
pnpm run lint:filenames

# テキストリント
pnpm run lint:text

# Markdown リント
pnpm run lint:markdown

# シークレット検出
pnpm run lint:secrets
```

## 品質チェックコマンド

### TypeScript 型チェック
```bash
# 全パッケージ型チェック
pnpm run check:types
pnpm -r run check:types
```

### スペルチェック
```bash
# 全プロジェクトスペルチェック
pnpm run check:spells
```

### 包括的品質チェック
```bash
# 開発完了前チェックリスト
pnpm run check:types && pnpm run lint:all && pnpm run check:dprint && pnpm run test:develop
```

## 文書作成コマンド

### ドキュメント生成
```bash
# 新規ドキュメント作成
pnpm run new:doc

# ドキュメント前書き（YAML front matter）チェック
pnpm run lint:docs
```

## 設定管理コマンド

### 設定同期
```bash
# 中央設定をパッケージレベルに同期
pnpm run sync:configs
```

## パッケージレベルコマンド

### 典型的なパッケージ内作業フロー
```bash
cd packages/@esta-core/error-handler

# パッケージ固有コマンド
pnpm run build           # 当該パッケージビルド
pnpm run test:develop    # 単体テスト実行
pnpm run test:e2e        # E2E テスト実行
pnpm run lint:all        # 全リント実行
pnpm run check:types     # 型チェック
```

### 使用可能なパッケージレベルスクリプト
大部分のパッケージで利用可能:
- `build` / `build:esm` / `build:cjs`
- `test:develop` / `test:ci`
- `test:unit` / `test:functional` / `test:integration` / `test:e2e`
- `lint` / `lint:types` / `lint:all`
- `check:types`
- `clean`

## CI/CD コマンド

### GitHub Actions 対応
```bash
# GitHub Actions 用設定
pnpm exec vitest --config ./configs/vitest.config.gha.ts
```

## 高度なコマンド使用例

### 開発サイクル（BDD アプローチ）
```bash
# 1. テスト作成・実行（RED）
pnpm exec vitest run src/__tests__/NewFeature.spec.ts

# 2. 最小実装（GREEN）
pnpm run check:types

# 3. リファクタリング
pnpm run lint:all
pnpm run test:develop
```

### パフォーマンス計測
```bash
# テスト実行時間計測
pnpm test --reporter=verbose

# カバレッジ測定
pnpm test --coverage
```

### デバッグ用コマンド
```bash
# 依存関係確認
pnpm list --depth=0

# ワークスペース確認
pnpm list --recursive --depth=0

# パッケージ設定確認
cat package.json | grep -A 20 "scripts"
```

### クリーンビルド
```bash
# 完全クリーンビルド
pnpm run clean
rm -rf node_modules .cache
pnpm install
pnpm run build
```

## エラー対処コマンド

### 一般的な問題解決
```bash
# キャッシュクリア
rm -rf .cache node_modules
pnpm install

# 設定再同期
pnpm run sync:configs

# 段階的チェック
pnpm run check:types
pnpm run lint:all
pnpm run test:develop
pnpm run build
```

### Windows 特有の注意
- パス区切りは `/` を使用（`\` ではない）
- 一部コマンドで `cmd /c` プレフィックスが必要な場合あり
- Git Bash または PowerShell 推奨

## 推奨開発フロー

### 日常開発
1. `pnpm run check:types` - 型安全性確認
2. `pnpm run test:develop` - 基本テスト実行
3. `pnpm run lint:all` - コード品質チェック
4. `pnpm run format:dprint` - コードフォーマット

### リリース前
1. `pnpm run test:ci` - 全テスト実行
2. `pnpm run build` - ビルド確認
3. `pnpm run check:spells` - スペルチェック
4. `pnpm run lint:secrets` - セキュリティチェック