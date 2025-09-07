# 開発フロー・実務手順

## BDD 開発手法（atsushifx式）

### 基本原則
**ag-logger** プロジェクトは厳密な BDD（Behavior-Driven Development）手法に従います。

#### コア原則
- **1 message = 1 test**: 実装サイクルごとに単一の `it()` テスト
- **RED/GREEN 確認**: 次のステップに進む前の必須確認
- **最小実装**: テスト通過に必要な最小限のコードのみ実装
- **自然言語記述**: 明確で記述的なテスト名

### BDD サイクル
```
1. 失敗するテスト記述（RED）
   ↓
2. テスト通過する最小コード実装（GREEN）
   ↓
3. 必要に応じてリファクタリング
   ↓
4. 次のテストで繰り返し
```

## 実装フロー詳細

### Phase 1: テスト駆動設計（RED）
```bash
# 新機能テスト作成
cd packages/@esta-core/error-handler
vi src/__tests__/NewFeature.spec.ts

# テスト実行（失敗確認）
pnpm exec vitest run src/__tests__/NewFeature.spec.ts
```

#### テスト記述例
```typescript
describe('NewFeature', () => {
  it('should handle basic error case', () => {
    // Given - 前提条件
    const input = createTestInput()
    
    // When - 実行
    const result = newFeature(input)
    
    // Then - 検証
    expect(result).toMatchExpectedBehavior()
  })
})
```

### Phase 2: 最小実装（GREEN）
```bash
# 実装ファイル作成・編集
vi src/NewFeature.ts

# テスト実行（成功確認）
pnpm exec vitest run src/__tests__/NewFeature.spec.ts

# 型チェック
pnpm run check:types
```

### Phase 3: リファクタリング・品質確認
```bash
# コード品質チェック
pnpm run lint:all

# 全テスト実行
pnpm run test:develop

# フォーマット適用
pnpm run format:dprint
```

## 開発環境ワークフロー

### グローバル開発（ルートレベル）
モノレポ全体での作業:

```bash
# 全パッケージビルド
pnpm run build

# 全パッケージテスト
pnpm run test:develop
pnpm run test:ci

# 全体品質チェック
pnpm run lint:all
pnpm run check:types
pnpm run check:spells
```

### パッケージ個別開発
特定パッケージでの集中作業:

```bash
# パッケージディレクトリに移動
cd packages/@agla-utils/ag-logger

# パッケージ固有コマンド実行
pnpm run build           # パッケージビルド
pnpm run test:develop    # 単体テスト
pnpm run test:e2e        # E2E テスト
pnpm run lint:all        # 全リント
pnpm run check:types     # 型チェック
```

## Pre-commit プロセス

### lefthook による自動品質チェック
コミット時に自動実行される品質ゲート:

#### 自動実行チェック
- **secretlint**: 機密情報漏洩防止
- **ESLint**: コード品質（基本 + TypeScript 対応）
- **ls-lint**: ファイル名規約確認
- **cspell**: スペルチェック
- **dprint**: コードフォーマット
- **codegpt**: コミットメッセージ自動改善

#### 手動実行推奨チェック
- **型チェック**: `pnpm run check:types`
- **全テストスイート**: `pnpm run test:develop` / `pnpm run test:ci`

### コミット前チェックリスト
```bash
# 必須チェック（自動実行されない項目）
pnpm run check:types
pnpm run test:develop

# 推奨チェック（時間に余裕がある場合）
pnpm run test:ci
pnpm run build
```

## 開発ベストプラクティス

### 1. コンテキスト理解
ファイル変更前の必須作業:
- 既存コード規約の理解
- 周辺コンテキスト（特にインポート）の確認
- フレームワーク・ライブラリ選択の理解

### 2. 既存パターン踏襲
- 既存コードスタイルの模倣
- 既存ライブラリ・ユーティリティの活用
- 確立されたパターン・規約の遵守

### 3. ライブラリ検証
- **前提なし**: 著名ライブラリでも使用前に存在確認必須
- **依存確認**: 隣接ファイル・package.json での使用状況確認
- **整合性**: コードベース全体での一貫したライブラリ使用

### 4. コンポーネント作成
新規コンポーネント作成時:
- 既存コンポーネントのパターン研究
- フレームワーク選択・命名規約・型付けの考慮
- 既存アーキテクチャパターンへの準拠

### 5. セキュリティプラクティス
- **セキュリティベストプラクティス**: 常時遵守
- **秘匿情報排除**: シークレット・キーの露出・ログ出力禁止
- **コミット安全性**: シークレット・キーのリポジトリコミット禁止

## パッケージ開発ワークフロー

### 新規パッケージ作成
```bash
# パッケージディレクトリ作成
mkdir -p packages/@esta-utils/new-package

# 基本構造セットアップ
cd packages/@esta-utils/new-package
cp -r ../config-loader/configs ./configs
cp ../config-loader/package.json ./package.json
# package.json の name, description 編集

# TypeScript 設定
cp ../config-loader/tsconfig.json ./tsconfig.json

# ソース構造作成
mkdir -p src/__tests__
mkdir -p tests/{integration,e2e}
mkdir -p shared/{types,constants}
```

### 既存パッケージ拡張
```bash
cd packages/@esta-core/error-handler

# BDD サイクルで機能追加
# 1. テスト作成
vi src/__tests__/NewFeature.spec.ts

# 2. 実装
vi src/NewFeature.ts

# 3. 確認
pnpm run test:develop
pnpm run check:types
pnpm run lint:all
```

## 設定管理ワークフロー

### 中央集約設定
中央設定の更新とパッケージ同期:

```bash
# 中央設定更新
vi configs/eslint.config.all.js

# 全パッケージに同期
pnpm run sync:configs

# 同期結果確認
git status
git diff
```

### パッケージ固有設定
```bash
cd packages/@esta-core/error-handler

# パッケージ固有設定の調整
vi configs/vitest.config.unit.ts

# 設定検証
pnpm run test:develop
```

## デュアルビルドプロセス

### ビルド戦略
- **ESM**: 主要モジュール形式
- **CommonJS**: 後方互換性
- **型定義**: TypeScript 宣言ファイル自動生成

### ビルドワークフロー
```bash
# 開発中ビルド確認
pnpm run build

# 個別ターゲットビルド
pnpm run build:esm    # ESM のみ
pnpm run build:cjs    # CommonJS のみ
pnpm run build:types  # 型定義のみ
```

## 文書化ワークフロー

### 文書作成標準
```bash
# 新規文書作成
pnpm run new:doc

# 文書前書き検証
pnpm run lint:docs
```

### 文書検証
- `pnpm run lint:docs` で YAML front matter 適合性確認
- プロジェクト規約に従った文書作成
- 適切なメタデータ・説明の含有

## トラブルシューティングワークフロー

### 一般的問題解決
```bash
# 依存関係リセット
rm -rf node_modules .cache
pnpm install

# 設定再同期
pnpm run sync:configs

# 段階的検証
pnpm run check:types
pnpm run lint:all
pnpm run test:develop
pnpm run build
```

### デバッグワークフロー
```bash
# 個別テストデバッグ
pnpm exec vitest run --reporter=verbose src/__tests__/Problem.spec.ts

# 型エラー詳細確認
pnpm exec tsc --noEmit --project tsconfig.json

# 依存関係確認
pnpm list --depth=0
pnpm list --recursive --depth=0
```

## 継続的統合対応

### GitHub Actions ワークフロー
```bash
# CI 用テスト実行
pnpm run test:ci

# CI 用設定テスト
pnpm exec vitest --config ./configs/vitest.config.gha.ts
```

## 品質ゲートワークフロー

### 開発完了前必須チェック
1. `pnpm run check:types` - 型安全性
2. `pnpm run lint:all` - コード品質
3. `pnpm run check:dprint` - フォーマット
4. `pnpm run test:develop` - 基本テスト
5. `pnpm run build` - ビルド成功

### リリース前包括チェック
1. `pnpm run test:ci` - 全テスト実行
2. `pnpm run build` - ビルド確認
3. `pnpm run check:spells` - スペルチェック
4. `pnpm run lint:secrets` - セキュリティチェック