# ユーティリティ関数カタログ

## 概要

ag-logger の `src/utils/` ディレクトリには5つの重要なユーティリティファイルが含まれており、ログ機能の中核を支える汎用関数群を提供しています。

```
src/utils/
├── AgLoggerGetMessage.ts    # メッセージ抽出ユーティリティ
├── AgLoggerMethod.ts        # ログメソッドヘルパー
├── AgLogHelpers.ts          # 汎用ヘルパー関数
├── AgLogValidators.ts       # ログレベル検証
├── testIdUtils.ts          # テストID生成
└── __tests__/              # ユーティリティテスト
    ├── AgLoggerGetMessage.spec.ts
    └── validateLogLevel.spec.ts
```

## 1. AgLoggerGetMessage.ts - メッセージ抽出

**場所**: `src\utils\AgLoggerGetMessage.ts`
**目的**: 可変引数からログメッセージを抽出し、構造化する

### 主要機能

- 複数の引数形式に対応したメッセージ抽出
- オブジェクトと文字列の混在引数処理
- ログメッセージの正規化

### 使用場面

```typescript
// 様々な引数パターンに対応
logger.info('Simple message');
logger.info('Message with', { context: 'data' });
logger.info({ message: 'Object message', userId: 123 });
```

### MCPツールでの確認

```bash
# メッセージ抽出ユーティリティの詳細
mcp__serena-mcp__get_symbols_overview --relative_path "src/utils/AgLoggerGetMessage.ts"

# テストファイルの確認
mcp__serena-mcp__find_file --file_mask "AgLoggerGetMessage.spec.ts" --relative_path "src/utils/__tests__"
```

### 関連テスト

- **テストファイル**: `src\utils\__tests__\AgLoggerGetMessage.spec.ts`
- **検証項目**: 引数解析、メッセージ抽出、エラーハンドリング

## 2. AgLoggerMethod.ts - ログメソッドヘルパー

**場所**: `src\utils\AgLoggerMethod.ts`
**目的**: ログメソッドの共通処理とヘルパー機能

### 主要機能

- ログメソッドの共通ロジック
- メソッド呼び出しの最適化
- ログレベル判定のサポート

### 設計パターン

- **Template Method Pattern**: 共通処理テンプレートを提供
- **Strategy Pattern**: レベル別処理の切り替え

### 使用例

```typescript
// 内部的にAgLoggerMethodが使用される
logger.debug('Debug message'); // → AgLoggerMethod経由で処理
logger.error('Error message'); // → レベル判定後に実行
```

## 3. AgLogHelpers.ts - 汎用ヘルパー関数

**場所**: `src\utils\AgLogHelpers.ts`
**目的**: ログ機能全般で使用される汎用ヘルパー関数

### 主要機能

- 文字列操作ユーティリティ
- オブジェクト変換ユーティリティ
- 共通処理の抽象化

### 関連テスト

- **テストファイル**: `src\__tests__\units\utils\AgLogHelpers.spec.ts`
- **テスト階層**: Units → Utils → AgLogHelpers

### MCPツール検索コマンド

```bash
# AgLogHelpers の詳細確認
mcp__serena-mcp__get_symbols_overview --relative_path "src/utils/AgLogHelpers.ts"

# テストファイルの確認
mcp__serena-mcp__find_symbol --name_path "AgLogHelpers" --relative_path "src/__tests__/units/utils"
```

## 4. AgLogValidators.ts - ログレベル検証

**場所**: `src\utils\AgLogValidators.ts`
**目的**: ログレベルの妥当性検証とバリデーション

### 主要機能

#### validateLogLevel 関数

- ログレベル値の妥当性確認
- 不正値の検出とエラー処理
- 型安全性の保証

### 検証パターン

```typescript
// 有効なログレベル
validateLogLevel(AG_LOGLEVEL.INFO); // ✅ 有効
validateLogLevel(AG_LOGLEVEL.ERROR); // ✅ 有効

// 無効なログレベル
validateLogLevel(-1); // ❌ 無効
validateLogLevel(999); // ❌ 無効
validateLogLevel('invalid'); // ❌ 型エラー
```

### 関連テスト

- **テストファイル**: `src\utils\__tests__\validateLogLevel.spec.ts`
- **単体テスト**: `src\__tests__\units\utils\AgLogValidators.spec.ts`

### 使用場面

- ログレベル設定時の検証
- 実行時のレベル判定
- 設定値の妥当性確認

### MCPツール確認

```bash
# バリデーター関数の詳細
mcp__lsmcp__search_symbols --query "validateLogLevel" --root "$ROOT"

# 使用箇所の確認
mcp__serena-mcp__find_referencing_symbols --name_path "validateLogLevel" --relative_path "src/utils/AgLogValidators.ts"
```

## 5. testIdUtils.ts - テストID生成

**場所**: `src\utils\testIdUtils.ts`
**目的**: テスト環境でのユニークID生成とテストサポート

### 主要機能

#### createTestId 関数

- テスト用ユニークID生成
- テストケースの識別
- モック・スタブでの使用

### 使用例

```typescript
// テストでのID生成
const testId = createTestId();
const mockLogger = new MockLogger(testId);

// テストアサーション
expect(mockLogger.getTestId()).toBe(testId);
```

### 関連機能

- **Mock システム**: MockFormatter, MockLogger との連携
- **E2E テスト**: E2eMockLogger での識別
- **テスト分離**: テストケース間の独立性保証

## ユーティリティ間の関係図

```
┌─────────────────────────────────────────────────────────────┐
│                  Utility Functions                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AgLoggerGetMessage ──┐                                     │
│                       │                                     │
│                       ▼                                     │
│  AgLoggerMethod ──► Core Logging Process ◄── AgLogHelpers  │
│                       ▲                                     │
│                       │                                     │
│  AgLogValidators ─────┘                                     │
│                                                             │
│  testIdUtils ─────► Test Support System                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 使用パターン分析

### 1. ログメッセージ処理フロー

```typescript
// 1. 引数受け取り (AgLoggerGetMessage)
const args = ['message', { context: 'data' }];

// 2. メッセージ抽出と構造化
const logMessage = AgLoggerGetMessage.extract(args);

// 3. レベル検証 (AgLogValidators)
validateLogLevel(logMessage.level);

// 4. 共通処理実行 (AgLoggerMethod)
AgLoggerMethod.execute(logMessage);

// 5. ヘルパー関数使用 (AgLogHelpers)
const formattedMessage = AgLogHelpers.format(logMessage);
```

### 2. テスト支援フロー

```typescript
// 1. テストID生成 (testIdUtils)
const testId = createTestId();

// 2. モックロガー作成
const mockLogger = new MockLogger(testId);

// 3. テスト実行とアサーション
logger.info('test message');
expect(mockLogger.getCapturedLogs()).toContain('test message');
```

## パフォーマンス最適化

### 1. 遅延評価

```typescript
// ログレベルチェック後に処理実行
if (shouldOutput(level)) {
  const message = AgLoggerGetMessage.extract(args); // 必要時のみ実行
  executeLog(level, message);
}
```

### 2. キャッシュ活用

```typescript
// バリデーション結果のキャッシュ
const validatedLevels = new Set();
function validateLogLevel(level) {
  if (validatedLevels.has(level)) { return true; }
  // バリデーション処理
  validatedLevels.add(level);
}
```

### 3. 最小限の処理

```typescript
// NullLogger使用時は最小処理
if (logger instanceof NullLogger) {
  return; // 早期リターンで処理スキップ
}
```

## エラーハンドリングパターン

### 1. Graceful Degradation

```typescript
try {
  validateLogLevel(level);
} catch (error) {
  // フォールバック: INFOレベルで継続
  level = AG_LOGLEVEL.INFO;
}
```

### 2. エラー情報の保持

```typescript
const logMessage = {
  originalArgs: args,
  extractedMessage: extractMessage(args),
  errors: extractionErrors, // エラー情報も保持
};
```

## テスト戦略

### 1. 単体テスト構造

```
src/utils/__tests__/
├── AgLoggerGetMessage.spec.ts    # メッセージ抽出テスト
└── validateLogLevel.spec.ts      # レベル検証テスト

src/__tests__/units/utils/
├── AgLogHelpers.spec.ts         # ヘルパー関数テスト
└── AgLogValidators.spec.ts      # バリデーターテスト
```

### 2. テストカバレッジ

- **境界値テスト**: ログレベルの最小・最大値
- **異常系テスト**: 不正な引数、null/undefined
- **統合テスト**: ユーティリティ間の連携

## MCPツールを使った検索とナビゲーション

### ユーティリティ関数の検索

```bash
# 全ユーティリティファイル一覧
mcp__serena-mcp__list_dir --relative_path "src/utils" --recursive false

# 特定ユーティリティの詳細
mcp__serena-mcp__get_symbols_overview --relative_path "src/utils/AgLogValidators.ts"

# テストファイルの検索
mcp__serena-mcp__find_symbol --name_path "validateLogLevel" --relative_path "src/utils/__tests__" --substring_matching true
```

### 関数の使用箇所検索

```bash
# validateLogLevel の使用箇所
mcp__serena-mcp__find_referencing_symbols --name_path "validateLogLevel" --relative_path "src/utils/AgLogValidators.ts"

# createTestId の使用箇所  
mcp__serena-mcp__find_referencing_symbols --name_path "createTestId" --relative_path "src/utils/testIdUtils.ts"

# パターン検索での関数発見
mcp__serena-mcp__search_for_pattern --substring_pattern "validate" --relative_path "src/utils" --restrict_search_to_code_files true
```

### テスト関連の検索

```bash
# ユーティリティテストの検索
mcp__serena-mcp__find_file --file_mask "*utils*.spec.ts" --relative_path "src"

# 特定ユーティリティのテスト
mcp__serena-mcp__find_file --file_mask "*validateLogLevel*.spec.ts" --relative_path "src/utils/__tests__"
```

## ベストプラクティス

### 1. 関数の単一責任

- 各ユーティリティは明確な責任範囲を持つ
- 関数間の結合度を最小化
- テスタビリティを重視

### 2. 型安全性の確保

```typescript
// 型ガードの活用
function isValidLogLevel(value: any): value is AgLogLevel {
  return typeof value === 'number'
    && value >= AG_LOGLEVEL.TRACE
    && value <= AG_LOGLEVEL.FATAL;
}
```

### 3. エラー処理の統一

```typescript
// 共通エラー形式
class UtilityError extends AgLoggerError {
  constructor(utility: string, operation: string, cause?: Error) {
    super(`${utility}.${operation} failed`, cause);
  }
}
```

## 拡張ポイント

### 1. 新しいバリデーター追加

```typescript
// カスタムバリデーター例
export function validateLogMessage(message: any): message is AgLogMessage {
  return message
    && typeof message.level === 'number'
    && typeof message.message === 'string';
}
```

### 2. 追加ヘルパー関数

```typescript
// フォーマット関連ヘルパー
export function truncateMessage(message: string, maxLength: number): string {
  return message.length > maxLength
    ? message.substring(0, maxLength) + '...'
    : message;
}
```

### 3. テストユーティリティ拡張

```typescript
// パフォーマンステスト用
export function createBenchmarkId(scenario: string): string {
  return `benchmark_${scenario}_${Date.now()}`;
}
```

## 参考情報

### 関連ファイル

- **Source**: `src/utils/` (5ファイル)
- **Tests**: `src/utils/__tests__/` + `src/__tests__/units/utils/`
- **Types**: `shared/types/` (型定義参照)

### 統計情報

- **ユーティリティファイル数**: 5個
- **ユーティリティテストファイル数**: 約8個
- **主要関数数**: 約15個
- **総行数**: 約400行

### 依存関係

- **Core Classes**: AgLogger, AgLoggerConfig との密接な連携
- **Plugin System**: Formatter, Logger プラグインとの統合
- **Test Framework**: Mock システムとの連携

この包括的なユーティリティシステムにより、ag-logger は高い保守性と拡張性を持つ設計を実現しています。
