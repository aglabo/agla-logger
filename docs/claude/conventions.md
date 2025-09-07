# コーディング規約・重要リマインダー

## 基本開発原則

### 実行原則

**重要**: 求められたことを行う。それ以上でも以下でもない。

- **必要最小限**: 目標達成に絶対必要なファイルのみ作成
- **既存優先**: 新規作成より既存ファイル編集を優先
- **文書化制限**: README やドキュメントファイル (*.md) の積極的作成禁止（明示的要求時のみ）

## ファイル操作規約

### 編集対象の制限

**絶対に編集してはいけないファイル**:

- `lib/` ディレクトリ（CommonJS ビルド出力）
- `module/` ディレクトリ（ESM ビルド出力）
- `.cache/` ディレクトリ（各種キャッシュファイル）
- `node_modules/` ディレクトリ（依存関係）

**常に編集すべきファイル**:

- `src/` ディレクトリのソースファイル
- 設定ファイル（`configs/` 内）
- テストファイル（`__tests__/`, `tests/` 内）

### ファイル作成・編集フロー

1. **既存パターン確認**: 類似機能の実装を研究
2. **設定継承**: 既存設定ファイルの拡張・継承
3. **ビルド実行**: 変更後は必ずビルドして検証

## コーディングスタイル規約

### TypeScript コーディング標準

#### 型定義規約

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

#### ファイル命名規約

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

#### インポート・エクスポート規約

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

### JavaScript/Node.js 規約

#### ESM モジュール優先

```javascript
// ✅ 良い例: ESM インポート
import { createLogger } from './logger.js';

// ❌ 悪い例: CommonJS require（レガシー用途以外）
const { createLogger } = require('./logger');
```

## セキュリティ・安全性規約

### セキュリティベストプラクティス（必須）

#### 機密情報管理

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

#### AglaError システム使用

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

## ライブラリ・依存関係規約

### ライブラリ使用前検証（必須）

#### 検証フロー

1. **存在確認**: package.json での使用状況確認
2. **周辺確認**: 隣接ファイルでの使用例研究
3. **整合性確認**: プロジェクト全体での一貫性確認

```bash
# ライブラリ使用前確認コマンド
grep -r "target-library" packages/
cat package.json | grep "target-library"
```

#### 良い例・悪い例

```typescript
// ❌ 悪い例: 確認なしでの有名ライブラリ使用
import lodash from 'lodash'; // プロジェクトで使用されているか未確認

// ✅ 良い例: 既存使用確認後の利用
// 1. package.json で lodash の存在確認
// 2. 他ファイルでの使用パターン確認
// 3. プロジェクト方針に沿った使用
import { isEmpty } from 'lodash';
```

## テスト記述規約

### BDD スタイル記述

#### テスト構造

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

#### テスト命名規約

- **自然言語**: `should + 期待される動作`
- **具体的**: 何をテストしているか明確に
- **実行可能**: テスト名から実装がイメージできる

## コメント記述規約

### コメント制限（重要）

**原則**: 明示的に求められない限り、コメントを追加しない

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

## 開発フロー規約

### コンテキスト理解（必須）

#### ファイル変更前のチェック

```bash
# 1. 既存コード規約の理解
head -50 target-file.ts

# 2. インポート・依存関係の確認
grep -n "import" target-file.ts

# 3. 周辺ファイルのパターン研究
ls -la $(dirname target-file.ts)
```

#### 新規コンポーネント作成時

1. **既存コンポーネント研究**: 類似機能の実装パターン確認
2. **フレームワーク選択**: プロジェクトの技術選択に準拠
3. **命名規約**: 既存の命名パターンに従う
4. **型付け**: プロジェクトの型安全性レベルに準拠

## パッケージ・モジュール規約

### パッケージ構造規約

#### 標準ディレクトリ構造

```
package-name/
├── src/                    # ソースコード
│   ├── index.ts           # パッケージエントリーポイント
│   ├── core/              # コア機能
│   ├── utils/             # ユーティリティ
│   └── __tests__/         # 単体テスト
├── shared/                # パッケージ内共有
│   ├── types/             # パッケージ型定義
│   └── constants/         # パッケージ定数
├── tests/                 # 高次テスト
├── configs/              # 設定ファイル
└── docs/                 # パッケージ文書（最小限）
```

#### インデックスファイル規約

```typescript
// src/index.ts - パッケージのメインエクスポート
export { AglaError, AglaErrorContext } from './core/AglaError';
export { ErrorSeverity } from './enums/ErrorSeverity';
export type { AglaErrorOptions } from './types/AglaError.types';
```

## Git・バージョン管理規約

### コミットメッセージ規約

#### Conventional Commits 準拠

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

- **1 message = 1 test**: BDD サイクルに対応した細かいコミット
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
2. **既存パターン準拠**: 新規作成より既存の拡張・改善を優先
3. **品質維持**: 各変更後の品質チェック実行
4. **最小限実装**: 目標達成に必要な最小限の変更に留める

### 禁止事項（重要）

- 機密情報（API キー、パスワード等）のコード内記述
- 機密情報のログ出力・コンソール出力
- 依存関係存在確認なしでのライブラリ使用
- ビルド出力ディレクトリ（`lib/`, `module/`）の直接編集
- 不要なコメント・文書の積極的作成

### 推奨実践事項

- コードの自己説明性向上
- 型安全性の最大限活用
- BDD サイクルに基づく段階的実装
- 包括的品質チェックの習慣化
