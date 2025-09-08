# プロジェクトロードマップ・未了タスク

## 概要

ag-loggerプロジェクトの現状分析、優先度別タスク管理、および将来的な発展方向を包括的にカバーするロードマップ。MCPツールを活用した効率的なタスク実行戦略を含みます。

## 現在のプロジェクト状況

### 主要フォーカス: AglaError フレームワーク移行

**優先度: 最高（Critical）**

プロジェクトは現在、統一された構造化エラーハンドリングシステムである **AglaError フレームワーク** への移行に重点を置いています。

#### MCPツールによる現状調査

```bash
# プロジェクト全体の現状把握
mcp__lsmcp__get_project_overview --root "$ROOT"

# AglaError実装状況の詳細確認
mcp__lsmcp__search_symbols --query "AglaError" --root "$ROOT"
mcp__serena-mcp__find_referencing_symbols --name_path "AglaError" --relative_path "shared/types/AglaError.types.ts"

# エラーハンドリングパターンの調査
mcp__serena-mcp__search_for_pattern --substring_pattern "Error|throw|catch" --relative_path "src" --restrict_search_to_code_files true
```

## 高優先度タスク（Critical）

### 1. AglaError システム統合作業

#### 対象: AglaError システムの ag-logger 統合

**現在の状況**:

- AglaError システムは完全実装済み
- ag-logger パッケージへの統合が必要
- ユーティリティ機能の整理が必要

#### MCPツールによる統合調査

```bash
# AglaError システムの現状把握
mcp__lsmcp__search_symbols --query "AglaError" --root "$ROOT"
mcp__serena-mcp__get_symbols_overview --relative_path "shared/types/AglaError.types.ts"

# ag-logger との統合点の調査
mcp__lsmcp__search_symbols --query "AgLogger" --root "$ROOT"
mcp__serena-mcp__find_referencing_symbols --name_path "AglaError" --relative_path "packages/@aglabo/ag-logger/src"

# ユーティリティ依存関係の確認
mcp__lsmcp__get_typescript_dependencies --root "$ROOT"
```

#### 必要な作業

```bash
# AglaError 統合計画策定
# 1. ag-logger に AglaError システムを統合
# 2. ユーティリティパッケージの整理
# 3. 統一エラーハンドリングの実装
# 4. 包括的テストの実行
```

**完了基準**:

- [ ] AglaError システムの ag-logger 統合
- [ ] エラーハンドリングの統一インターフェース完成
- [ ] ユーティリティパッケージの整理
- [ ] 全テストスイートの成功

### 2. AglaError型システムの完成

#### 対象: `@shared/types` パッケージ

**現在の実装状況**:
✅ **完了済み**:

- `AglaError` 基本クラス実装
- `ErrorSeverity` 列挙型定義
- `AglaErrorContext` インターフェース実装
- エラーチェーン機能
- JSON シリアライゼーション機能
- 包括的テストスイート（4層）

#### MCPツールによる完成度確認

```bash
# AglaError実装の詳細確認
mcp__lsmcp__get_symbol_details --relativePath "shared/types/AglaError.types.ts" --line "44" --symbol "AglaError"

# テストカバレッジの確認
mcp__serena-mcp__find_file --file_mask "*AglaError*.spec.ts" --relative_path "."

# 型システムの整合性確認
mcp__lsmcp__lsp_get_diagnostics --relativePath "shared/types/AglaError.types.ts" --root "$ROOT"
```

#### 追加検討事項

- [ ] パフォーマンス最適化
- [ ] 外部ログシステム統合
- [ ] 国際化対応検討

### 3. テスト最適化

#### 対象: 全パッケージ

**現在の課題**:

- テスト実行時間の最適化
- テストカバレッジの均一化
- E2E テストの安定化

#### MCPツールによるテスト状況分析

```bash
# テスト構造の全体把握
mcp__lsmcp__list_dir --relativePath "src/__tests__" --recursive true
mcp__lsmcp__list_dir --relativePath "tests" --recursive true

# テストファイルパターンの分析
mcp__serena-mcp__find_file --file_mask "*.spec.ts" --relative_path "."
mcp__serena-mcp__search_for_pattern --substring_pattern "describe\\(|it\\(" --relative_path "src/__tests__" --context_lines_after 1

# 長時間実行テストの特定
mcp__serena-mcp__search_for_pattern --substring_pattern "timeout|slow|performance" --relative_path "tests" --context_lines_after 3
```

#### 必要な作業

- [ ] テスト並列化の改善
- [ ] 重複テストケースの統合
- [ ] テストデータ管理の改善
- [ ] CI/CD での実行時間短縮

## 中優先度タスク（High）

### 4. モノレポ構造最適化

#### 対象: 全体アーキテクチャ

**パッケージ整理状況**:
**進行中の大規模リファクタリング**

- 一部パッケージは移行中または最近移動・リネームされた状態
- パッケージ間依存関係の最適化が必要

#### MCPツールによる構造分析

```bash
# パッケージ構造の全体把握
mcp__lsmcp__list_dir --relativePath "packages" --recursive false

# パッケージ命名パターンの分析
mcp__serena-mcp__search_for_pattern --substring_pattern "@agla-|@aglabo/" --relative_path "packages" --restrict_search_to_code_files false

# 依存関係グラフの構築
mcp__lsmcp__get_typescript_dependencies --root "$ROOT"
mcp__serena-mcp__search_for_pattern --substring_pattern "\"@(agla|esta)-" --relative_path "." --context_lines_after 1
```

#### 必要な作業

- [ ] `@agla-*` パッケージの `@aglabo/` への移行計画
- [ ] パッケージ依存関係グラフの最適化
- [ ] 未使用パッケージの特定・削除
- [ ] ワークスペース設定の最適化

### 5. ドキュメント体系化

#### 対象: プロジェクト文書

**現在の状況**:
✅ **今回完成**:

- `docs/claude/` ディレクトリの体系化
- 13つの主要文書の作成
- MCP ツール対応フォーマット

#### MCPツールによる文書確認

```bash
# 現在の文書構造確認
mcp__lsmcp__list_dir --relativePath "docs/claude" --recursive false

# 文書品質の確認
mcp__serena-mcp__search_for_pattern --substring_pattern "## |### |mcp__" --relative_path "docs/claude" --context_lines_after 1

# 未カバー領域の特定
mcp__serena-mcp__find_file --file_mask "*.md" --relative_path "."
```

#### 追加作業

- [ ] API ドキュメント自動生成
- [ ] ユーザーガイドの充実
- [ ] 開発者オンボーディング改善
- [ ] チュートリアル作成

## 通常優先度タスク（Medium）

### 6. 設定管理改善

#### 対象: 中央集約設定システム

**改善点**:

- [ ] 設定同期スクリプトの自動化
- [ ] パッケージ間設定の一貫性確保
- [ ] VS Code 設定の最適化
- [ ] 開発環境セットアップの簡素化

#### MCPツールによる設定分析

```bash
# 設定ファイルの全体確認
mcp__lsmcp__list_dir --relativePath "configs" --recursive false
mcp__serena-mcp__find_file --file_mask "*.config.*" --relative_path "."

# 設定重複・不整合の確認
mcp__serena-mcp__search_for_pattern --substring_pattern "config|Config" --relative_path "configs" --context_lines_after 2

# VS Code設定の確認
mcp__lsmcp__list_dir --relativePath ".vscode" --recursive true
```

### 7. パフォーマンス最適化

#### 対象: ビルド・テスト実行時間

**最適化領域**:

- [ ] tsup ビルド設定の改善
- [ ] Vitest 実行時間短縮
- [ ] キャッシュ戦略の改善
- [ ] 並列処理の活用

#### MCPツールによる最適化分析

```bash
# ビルド設定の詳細確認
mcp__serena-mcp__find_file --file_mask "*tsup*" --relative_path "configs"
mcp__serena-mcp__get_symbols_overview --relative_path "configs/tsup.config.base.ts"

# テスト設定の分析
mcp__serena-mcp__find_file --file_mask "*vitest*" --relative_path "configs"

# キャッシュ使用状況の確認
mcp__lsmcp__list_dir --relativePath ".cache" --recursive true
```

### 8. GitHub Actions最適化

#### 対象: CI/CD パイプライン

**改善点**:

- [ ] ビルドマトリックスの最適化
- [ ] キャッシュ戦略の改善
- [ ] 失敗通知の改善
- [ ] セキュリティスキャン強化

#### MCPツールによるCI分析

```bash
# GitHub Actions設定の確認
mcp__lsmcp__list_dir --relativePath ".github" --recursive true
mcp__serena-mcp__find_file --file_mask "*.yml" --relative_path ".github/workflows"

# CI設定の詳細分析
mcp__serena-mcp__search_for_pattern --substring_pattern "uses:|run:|with:" --relative_path ".github" --context_lines_after 2
```

## 低優先度タスク（Low）

### 9. ツールチェーン更新

#### 対象: 開発ツール・依存関係

**更新検討**:

- [ ] TypeScript バージョン更新
- [ ] ESLint ルール見直し
- [ ] Vitest 新機能活用
- [ ] pnpm バージョン更新

#### MCPツールによる依存関係確認

```bash
# 現在の依存関係確認
mcp__lsmcp__get_typescript_dependencies --root "$ROOT"

# package.json の詳細確認
mcp__serena-mcp__find_file --file_mask "package.json" --relative_path "."
mcp__serena-mcp__search_for_pattern --substring_pattern "\"typescript\"|\"eslint\"|\"vitest\"|\"pnpm\"" --relative_path "." --context_lines_after 1
```

### 10. 外部統合改善

#### 対象: 外部ツール・サービス統合

**検討事項**:

- [ ] 追加的なリント設定
- [ ] 外部ログサービス統合
- [ ] パフォーマンス監視ツール
- [ ] セキュリティスキャン強化

## 技術的負債（Technical Debt）

### レガシーコード整理

#### 対象: `@agla-*` パッケージ

**対処が必要な項目**:

- [ ] 古い設定ファイルの削除
- [ ] 未使用インポートの削除
- [ ] 重複コードの統合
- [ ] 非推奨 API の更新

#### MCPツールによる技術的負債分析

```bash
# レガシーコードパターンの検索
mcp__serena-mcp__search_for_pattern --substring_pattern "TODO|FIXME|XXX|HACK" --relative_path "." --restrict_search_to_code_files true

# 未使用インポートの検索
mcp__serena-mcp__search_for_pattern --substring_pattern "import.*unused|eslint-disable.*unused" --relative_path "." --restrict_search_to_code_files true

# 重複コード候補の検索
mcp__serena-mcp__search_for_pattern --substring_pattern "function.*duplicate|class.*duplicate" --relative_path "src" --restrict_search_to_code_files true
```

### コード品質改善

#### 対象: 全パッケージ

**改善領域**:

- [ ] 複雑な関数の分割
- [ ] 型安全性の強化
- [ ] エラーハンドリングの統一
- [ ] パフォーマンス改善

#### MCPツールによる品質分析

```bash
# 複雑な関数の特定
mcp__serena-mcp__search_for_pattern --substring_pattern "function.*{[\\s\\S]{200,}" --relative_path "src" --restrict_search_to_code_files true

# 型安全性問題の確認
mcp__lsmcp__lsp_get_diagnostics --relativePath "src/主要ファイル.ts" --root "$ROOT"

# エラーハンドリングパターンの統一確認
mcp__serena-mcp__search_for_pattern --substring_pattern "try.*catch|throw new|Error\\(" --relative_path "src" --context_lines_after 2
```

## 今後の検討事項（Future Considerations）

### 新機能検討

- [ ] プラグインシステム拡張
- [ ] 設定 UI の検討
- [ ] リアルタイムログ監視
- [ ] 分散システム対応

### アーキテクチャ進化

- [ ] マイクロサービス対応
- [ ] クラウドネイティブ対応
- [ ] コンテナ化対応
- [ ] Serverless 対応

## タスク実行戦略

### MCPツールを活用した効率的実行

#### タスク開始前の調査フェーズ（必須）

```bash
# Phase 1: 全体把握
mcp__lsmcp__get_project_overview --root "$ROOT"

# Phase 2: 対象領域の詳細調査
mcp__lsmcp__search_symbols --query "対象機能" --root "$ROOT"
mcp__serena-mcp__get_symbols_overview --relative_path "対象ファイル"

# Phase 3: 依存関係・影響範囲の確認
mcp__serena-mcp__find_referencing_symbols --name_path "対象シンボル" --relative_path "対象ファイル"
```

#### 実装中のパターン調査フェーズ

```bash
# 既存実装パターンの研究
mcp__serena-mcp__search_for_pattern --substring_pattern "類似パターン" --relative_path "src" --restrict_search_to_code_files true

# テスト戦略の調査
mcp__serena-mcp__find_file --file_mask "*類似機能*.spec.ts" --relative_path "src/__tests__"
```

#### 完了確認フェーズ

```bash
# 実装完全性の確認
mcp__lsmcp__lsp_get_diagnostics --relativePath "実装ファイル" --root "$ROOT"

# 影響範囲の最終確認
mcp__serena-mcp__find_referencing_symbols --name_path "変更シンボル" --relative_path "変更ファイル"
```

## タスク管理プロセス

### 進捗確認コマンド（MCPツール統合）

```bash
# 現在のブランチ状況確認
git status
git branch -v

# プロジェクト全体の健全性確認（MCPツール活用）
mcp__lsmcp__get_project_overview --root "$ROOT"

# パッケージ状況確認
pnpm list --recursive --depth=0

# 品質・テスト状況確認
pnpm run test:ci
pnpm run check:types
pnpm run lint:all
```

### 定期レビュー項目

1. **週次**: 高優先度タスクの進捗確認 + MCPツール活用状況確認
2. **月次**: 中・低優先度タスクの見直し + 技術的負債の評価
3. **四半期**: プロジェクト全体の方向性確認 + アーキテクチャ進化の検討

## 重要な意思決定待ち

### アーキテクチャ決定

- [ ] `@agla-*` と `@aglabo/` の最終的な統合方針
- [ ] エラーハンドリングの統一インターフェース
- [ ] テスト戦略の最適化方針

### ツール選択

- [ ] 追加的な品質保証ツール
- [ ] CI/CD プラットフォーム最適化
- [ ] モニタリング・ログ収集ツール

## 完了済みマイルストーン

### 最近完了した主要タスク

✅ **AglaError 基本実装完了** (2024)

- AglaError クラスの完全実装
- 4層テスト戦略の実装
- 包括的なテストカバレッジ達成

✅ **ドキュメント体系化完了** (2024)

- `docs/claude/` 構造の確立
- MCP ツール対応文書作成（13ファイル）
- 開発者ガイド整備

✅ **品質保証システム確立** (2024)

- lefthook による自動化
- 多層品質チェック
- CI/CD パイプライン整備

## 次のマイルストーン目標

### 短期目標（1-2ヶ月）

1. **パッケージ統合の完了**
   - AglaError システムの ag-logger 統合
   - MCPツールによる依存関係の完全把握と更新
2. **テスト最適化の実装**
   - 実行時間30%短縮目標
   - テストカバレッジ95%維持
3. **残存技術的負債の解消**
   - MCPツールによる系統的な負債特定と解決

### 中期目標（3-6ヶ月）

1. **モノレポ構造の最適化完了**
   - `@agla-*` から `@aglabo/` への完全移行
   - パッケージ依存関係の最適化
2. **パフォーマンス目標達成**
   - ビルド時間50%短縮
   - テスト実行時間40%短縮
3. **新機能開発の再開**
   - プラグインシステムの拡張
   - 外部統合機能の強化

### 長期目標（6ヶ月以上）

1. **外部統合の充実**
   - ログ収集・監視システム統合
   - セキュリティ強化
2. **新アーキテクチャの検討・実装**
   - クラウドネイティブ対応
   - 分散システム対応
3. **プロダクション環境での安定運用**
   - 自動化・監視システム完備
   - 継続的改善体制確立

## 重要リマインダー

### MCPツール必須活用

**すべてのタスクでMCPツールの活用を必須とする**

- **タスク開始前**: プロジェクト状況の把握・調査
- **実装中**: 既存パターンの研究・参照
- **完了確認**: 影響範囲・品質の検証

### 品質ゲート遵守

**各タスク完了時の必須チェック**

1. `pnpm run check:types` - 型安全性確認
2. `pnpm run lint:all` - コード品質確認
3. `pnpm run test:develop` - 基本テスト確認
4. `pnpm run build` - ビルド成功確認
5. MCPツールによる影響範囲確認

このロードマップに従って、ag-loggerプロジェクトの継続的な改善と発展を推進できます。
