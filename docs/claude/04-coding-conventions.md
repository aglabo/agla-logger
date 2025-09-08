# コーディング規約・開発ガイドライン

## 概要

ag-loggerプロジェクトにおける包括的なコーディング規約とベストプラクティス。セキュリティ、品質、一貫性を重視した開発標準を提供します。

## 基本開発原則

### 実行原則

**重要**: 求められたことを行う。それ以上でも以下でもない。

- **必要最小限**: 目標達成に絶対必要なファイルのみ作成
- **既存優先**: 新規作成より既存ファイル編集を優先
- **文書化制限**: READMEやドキュメントファイル (*.md) の積極的作成禁止（明示的要求時のみ）

### MCPツール必須活用原則

**すべての開発段階でMCPツールの使用を必須化**

#### 必須使用場面

- **コード理解**: 既存コード構造・パターンの把握
- **パターン調査**: 実装方針・設計パターンの研究
- **影響範囲分析**: 変更による影響の事前確認
- **依存関係確認**: ライブラリ・モジュールの使用状況確認

#### MCPツールによる事前調査

```bash
# プロジェクト理解フェーズ
mcp__lsmcp__get_project_overview --root "$ROOT"

# 既存パターン調査フェーズ
mcp__serena-mcp__search_for_pattern --substring_pattern "対象パターン" --relative_path "src" --restrict_search_to_code_files true

# 実装対象の詳細調査フェーズ
mcp__lsmcp__search_symbols --query "関連シンボル" --root "$ROOT"
mcp__serena-mcp__get_symbols_overview --relative_path "対象ファイル"
```

## ファイル操作規約

### 編集対象の制限

#### 絶対に編集してはいけないファイル

- `lib/` ディレクトリ（CommonJS ビルド出力）
- `module/` ディレクトリ（ESM ビルド出力）
- `maps/` ディレクトリ（TypeScript 宣言ファイル出力）
- `.cache/` ディレクトリ（各種キャッシュファイル）
- `node_modules/` ディレクトリ（依存関係）

#### 常に編集すべきファイル

- `src/` ディレクトリのソースファイル
- `shared/` ディレクトリのソースファイル (型定義、定数定義)
- 設定ファイル（`configs/` 内）
- テストファイル（`__tests__/`, `tests/` 内）

### ファイル作成・編集フロー

#### MCPツールによる事前確認フロー

```bash
# 1. 既存パターン確認（必須）
mcp__serena-mcp__find_symbol --name_path "類似機能" --include_body true --relative_path "src"

# 2. 設定継承パターン研究（必須）
mcp__serena-mcp__get_symbols_overview --relative_path "configs/対象設定ファイル"

# 3. テスト戦略確認（必須）
mcp__serena-mcp__find_file --file_mask "*類似機能*.spec.ts" --relative_path "src/__tests__"
```

#### 実装後検証フロー

```bash
# 4. ビルド実行・検証（必須）
pnpm run build

# 5. 影響範囲確認（MCPツール必須）
mcp__serena-mcp__find_referencing_symbols --name_path "変更シンボル" --relative_path "変更ファイル"
```

## TypeScriptコーディング標準

### 型定義規約

#### 厳格な型定義の実践

```typescript
// ✅ 良い例: 明示的な型定義
interface AglaErrorContext {
  timestamp: Date;
  source: string;
  details?: Record<string, unknown>;
}

// ❌ 悪い例: any の使用
function processError(error: any): any {
  // any は使用禁止
}

// ✅ 良い例: 厳密な型定義
function processError(error: AglaError): AglaErrorResult {
  return error.process();
}
```

#### 型ガードの活用

```typescript
// ✅ 推奨: 型安全な判定
function isValidLogLevel(value: any): value is AgLogLevel {
  return typeof value === 'number'
    && value >= AG_LOGLEVEL.TRACE
    && value <= AG_LOGLEVEL.FATAL;
}

// 使用例
if (isValidLogLevel(inputLevel)) {
  // この時点で inputLevel は AgLogLevel 型として扱われる
  logger.setLevel(inputLevel);
}
```

### ファイル命名規約

#### 拡張子による分類システム

```
# 型定義ファイル
*.types.ts

# インターフェース定義
*.interface.ts

# クラス定義
*.class.ts

# 定数定義
*.constants.ts

# テストファイル
*.spec.ts              # 単体テスト
*.functional.spec.ts   # 機能テスト
*.integration.spec.ts  # 統合テスト
*.e2e.spec.ts         # E2E テスト
```

#### MCPツールによるファイル命名確認

```bash
# 既存命名パターンの確認
mcp__serena-mcp__find_file --file_mask "*.types.ts" --relative_path "shared/types"
mcp__serena-mcp__find_file --file_mask "*.class.ts" --relative_path "src"

# 命名規約準拠の確認
mcp__serena-mcp__search_for_pattern --substring_pattern "\\.(types|interface|class|constants)\\.ts$" --relative_path "." --restrict_search_to_code_files true
```

### インポート・エクスポート規約

#### パスエイリアス使用の徹底

```typescript
// ✅ 良い例: パスエイリアス使用
import { CONFIG_DEFAULTS } from '@shared/constants';
import { AglaError } from '@shared/types';

// ❌ 悪い例: 相対パス使用
import { AglaError } from '../../../shared/packages/types/types/AglaError.types';

// ✅ 良い例: 名前付きエクスポート
export { AglaError, AglaErrorContext } from './AglaError.types';

// ❌ 悪い例: デフォルトエクスポート（混在回避）
export default AglaError;
```

#### MCPツールによるインポートパターン確認

```bash
# プロジェクト全体のインポートパターン調査
mcp__serena-mcp__search_for_pattern --substring_pattern "import.*@shared" --relative_path "." --restrict_search_to_code_files true

# 既存のエクスポートパターン確認
mcp__lsmcp__parse_imports --filePath "src/index.ts" --root "$ROOT"
```

## セキュリティ・安全性規約

### セキュリティベストプラクティス（必須）

#### 機密情報管理の徹底

```typescript
// ❌ 絶対禁止: 機密情報の直接記述
const API_KEY = 'sk-1234567890abcdef';
const PASSWORD = 'password123';

// ✅ 良い例: 環境変数使用
const API_KEY = process.env.API_KEY;
const PASSWORD = process.env.PASSWORD;

// ❌ 絶対禁止: 機密情報のログ出力
console.log('API Key:', API_KEY);
logger.info('User password:', password);

// ✅ 良い例: 機密情報の除外
console.log('API Key: [REDACTED]');
logger.info('Authentication successful for user:', username);
```

#### リポジトリコミット規約

- **secretlint**: 自動スキャンによる機密情報検出
- **gitleaks**: 追加的なセキュリティチェック
- **manual review**: コミット前の手動確認

### エラーハンドリング規約

#### AglaErrorシステムの統一使用

```typescript
// ✅ 良い例: AglaError 使用
import { AglaError, ErrorSeverity } from '@shared/types';

function processData(data: unknown): Result<ProcessedData> {
  try {
    return Ok(transformData(data));
  } catch (error) {
    throw new AglaError('Data processing failed', {
      severity: ErrorSeverity.ERROR,
      context: {
        timestamp: new Date(),
        source: 'processData',
        details: { originalError: error },
      },
    });
  }
}

// ❌ 悪い例: 標準 Error 使用
function processData(data: unknown) {
  throw new Error('Something went wrong');
}
```

#### MCPツールによるエラーハンドリングパターン確認

```bash
# 既存エラーハンドリングパターンの調査
mcp__serena-mcp__search_for_pattern --substring_pattern "AglaError|throw new|try.*catch" --relative_path "src" --context_lines_after 3

# エラークラスの使用状況確認
mcp__serena-mcp__find_referencing_symbols --name_path "AglaError" --relative_path "shared/types/AglaError.types.ts"
```

## ライブラリ・依存関係規約

### ライブラリ使用前検証（必須）

#### MCPツールによる検証フロー

```bash
# 1. 既存使用状況の確認（必須）
mcp__lsmcp__get_typescript_dependencies --root "$ROOT"

# 2. プロジェクト内使用パターンの調査（必須）
mcp__serena-mcp__search_for_pattern --substring_pattern "import.*対象ライブラリ" --relative_path "." --restrict_search_to_code_files true

# 3. package.json での定義確認（必須）
mcp__serena-mcp__find_file --file_mask "package.json" --relative_path "."
```

#### 検証済み使用例

```typescript
// ❌ 悪い例: 確認なしでの有名ライブラリ使用
import lodash from 'lodash'; // プロジェクトで使用されているか未確認

// ✅ 良い例: 既存使用確認後の利用
// 1. MCPツールでpackage.json確認済み
// 2. 他ファイルでの使用パターン調査済み
// 3. プロジェクト方針に沿った使用
import { isEmpty } from 'lodash';
```

## テスト記述規約

### BDDスタイル記述の徹底

#### テスト構造の標準化

```typescript
describe('AglaError', () => {
  describe('when creating with basic message', () => {
    it('should set message and default severity', () => {
      // Given - 前提条件
      const message = 'Test error message';

      // When - 実行
      const error = new AglaError(message);

      // Then - 検証
      expect(error.message).toBe(message);
      expect(error.severity).toBe(ErrorSeverity.ERROR);
    });
  });
});
```

#### MCPツールによるテストパターン研究

```bash
# 既存テストパターンの詳細調査
mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/AgLogger.spec.ts"

# テスト記述スタイルの確認
mcp__serena-mcp__search_for_pattern --substring_pattern "describe|it\\(|Given|When|Then" --relative_path "src/__tests__" --context_lines_after 2

# テストヘルパー・ユーティリティの確認
mcp__serena-mcp__find_symbol --name_path "Mock" --relative_path "src/__tests__" --substring_matching true
```

#### テスト命名規約

- **自然言語**: `should + 期待される動作`
- **具体的**: 何をテストしているか明確に
- **実行可能**: テスト名から実装がイメージできる

## コメント記述規約

### コメント制限（重要）

**原則**: 明示的に求められない限り、コメントを追加しない

#### 自己説明的コード優先

```typescript
// ❌ 悪い例: 不要なコメント
// AglaError クラスを作成する
class AglaError extends Error {
  // コンストラクタ
  constructor(message: string) {
    // 親クラスのコンストラクタを呼び出す
    super(message)
  }
}

// ✅ 良い例: コメントなし、自己説明コード
class AglaError extends Error {
  constructor(message: string) {
    super(message)
    this.severity = ErrorSeverity.ERROR
  }
}

// ✅ 例外: 複雑なビジネスロジックの説明（必要時のみ）
/**
 * Complex error chaining logic for multi-step validation
 * See: https://internal-docs/error-chaining-spec
 */
private chainErrors(errors: AglaError[]): AglaError {
  // Implementation...
}
```

## パッケージ・モジュール規約

### パッケージ構造規約

#### 標準ディレクトリ構造

```
package-name/
├── src/                    # ソースコード
│   ├── index.ts           # パッケージエントリーポイント
│   ├── core/              # コア機能
│   ├── utils/             # ユーティリティ
│   ├── plugins/           # プラガブル機能
│   └── __tests__/         # 単体テスト
├── shared/                # パッケージ内共有
│   ├── types/             # パッケージ型定義
│   └── constants/         # パッケージ定数
├── tests/                 # 高次テスト
│   ├── functional/        # 機能テスト
│   ├── integration/       # 統合テスト
│   └── e2e/              # E2E テスト
├── configs/              # 設定ファイル
├── lib/                  # CommonJS ビルド出力（編集禁止）
├── module/               # ESM ビルド出力（編集禁止）
└── maps/                 # 型定義出力（編集禁止）
```

#### MCPツールによる構造確認

```bash
# パッケージ構造の詳細確認
mcp__lsmcp__list_dir --relativePath "." --recursive true

# 標準構造との比較
mcp__serena-mcp__find_file --file_mask "index.ts" --relative_path "src"
mcp__serena-mcp__find_file --file_mask "*.config.*" --relative_path "configs"
```

#### インデックスファイル規約

```typescript
// src/index.ts - パッケージのメインエクスポート
export { AglaError, AglaErrorContext } from './core/AglaError';
export { ErrorSeverity } from './enums/ErrorSeverity';
export type { AglaErrorOptions } from './types/AglaError.types';

// プラグインシステムのエクスポート
export { JsonFormatter, PlainFormatter } from './plugins/formatter';
export { ConsoleLogger, NullLogger } from './plugins/logger';

// ユーティリティのエクスポート
export { validateLogLevel } from './utils/AgLogValidators';
export { createTestId } from './utils/testIdUtils';
```

## Git・バージョン管理規約

### コミットメッセージ規約

#### Conventional Commits準拠

```bash
# ✅ 良い例
feat(error-handler): add AglaError chaining functionality
fix(logger): resolve memory leak in mock logger
docs(readme): update installation instructions
test(agla-error): add comprehensive error serialization tests

# ❌ 悪い例
Update code
Fix bug
Add stuff
WIP
```

#### コミット粒度

- **1 message = 1 test**: BDDサイクルに対応した細かいコミット
- **機能単位**: 1つの機能追加・修正・テストが1コミット
- **ビルド成功**: 各コミットでビルド・テストが通る状態を維持

### ブランチ戦略

```bash
# メインブランチ
main                    # 本番対応安定版

# 機能ブランチ命名
feat-<issue>/<feature>  # 新機能
fix-<issue>/<bug>       # バグ修正
docs/<update>           # 文書更新
test/<improvement>      # テスト改善
```

## 品質保証規約

### 必須品質チェック（開発完了前）

#### 品質ゲートプロセス

```bash
# 1. 型安全性確認（最優先）
pnpm run check:types

# 2. コード品質確認
pnpm run lint:all

# 3. フォーマット確認
pnpm run check:dprint

# 4. 基本テスト実行
pnpm run test:develop

# 5. ビルド成功確認
pnpm run build
```

#### MCPツールによる最終確認

```bash
# 実装完全性の確認
mcp__lsmcp__lsp_get_diagnostics --relativePath "実装ファイル" --root "$ROOT"

# 型定義整合性の確認
mcp__lsmcp__get_symbol_details --relativePath "実装ファイル" --line "1" --symbol "メインシンボル"

# テストカバレッジ確認
mcp__serena-mcp__find_file --file_mask "*実装名*.spec.ts" --relative_path "src/__tests__"
```

### 例外処理・違反時の対応

```bash
# 段階的問題解決
pnpm run check:types        # 型エラー特定
pnpm run lint:all -- --fix  # 自動修正
pnpm run format:dprint       # フォーマット修正
```

## 重要なリマインダー

### 開発中の常時意識事項

1. **セキュリティファースト**: 機密情報の取り扱いに最大限注意
2. **MCPツール必須活用**: すべての開発段階でMCPツール使用
3. **既存パターン準拠**: 新規作成より既存の拡張・改善を優先
4. **品質維持**: 各変更後の品質チェック実行
5. **最小限実装**: 目標達成に必要な最小限の変更に留める

### 禁止事項（重要）

- 機密情報（APIキー、パスワード等）のコード内記述
- 機密情報のログ出力・コンソール出力
- 依存関係存在確認なしでのライブラリ使用
- ビルド出力ディレクトリ（`lib/`, `module/`, `maps/`）の直接編集
- 不要なコメント・文書の積極的作成
- MCPツールを使わない開発作業

### 推奨実践事項

- コードの自己説明性向上
- 型安全性の最大限活用
- BDDサイクルに基づく段階的実装
- 包括的品質チェックの習慣化
- MCPツールによる効率的なコードナビゲーション

このガイドラインに従うことで、ag-loggerプロジェクトの一貫性、品質、セキュリティを確保できます。
