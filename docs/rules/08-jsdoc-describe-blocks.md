# JSDoc describeブロック統一ルール

このドキュメントは、ag-loggerプロジェクトにおけるdescribeブロックのJSDoc統一ルールを定義します。

## 🎯 統一目標

**全テストファイルのdescribeブロックにJSDocを付与し、テストの目的・構造・シナリオを明確化する。**

- **総対象**: 44ファイル・約315個のdescribeブロック
- **現状**: Phase 1（E2Eテスト8ファイル）完了
- **残作業**: Phase 2-4（36ファイル）進行中

## 📝 JSDocテンプレート

### TOPレベル（Suite）

```typescript
/**
 * @suite [Suite Name] | [Category]
 * @description [詳細説明]
 * @testType [unit|functional|integration|e2e]
 * Scenarios: [シナリオ1], [シナリオ2], [シナリオ3]
 */
describe('[Suite Name]', () => {
  // テスト実装
});
```

#### JSDocタグ詳細

| タグ           | 必須 | 説明                     | 例                                                 |
| -------------- | ---- | ------------------------ | -------------------------------------------------- |
| `@suite`       | ✅   | スイート名とカテゴリ     | `AgLogger Configuration \| Core`                   |
| `@description` | ✅   | テストスイートの詳細説明 | `AgLoggerの設定機能をテストする統合テストスイート` |
| `@testType`    | ✅   | テスト層の種別           | `unit`, `functional`, `integration`, `e2e`         |
| `Scenarios:`   | ✅   | 主要テストシナリオリスト | `正常設定, 不正設定, 境界値処理`                   |

### セカンドレベル（Context）

```typescript
/**
 * @context [Given|When|Then]
 * @scenario [シナリオ名]
 * @description [コンテキスト詳細説明]
 */
describe('[Given|When]: [説明]', () => {
  // テスト実装
});
```

#### JSDocタグ詳細

| タグ           | 必須 | 説明                   | 例                                           |
| -------------- | ---- | ---------------------- | -------------------------------------------- |
| `@context`     | ✅   | BDD文脈の種別          | `Given`, `When`, `Then`                      |
| `@scenario`    | ✅   | 具体的なシナリオ名     | `ユーザー認証処理`                           |
| `@description` | ✅   | コンテキストの詳細説明 | `有効な認証情報でログイン処理を実行する場合` |

## 💡 実装パターン

### パターンA: Given開始スイート

```typescript
/**
 * @suite AgLogger State Management | Core
 * @description AgLoggerのシングルトン状態管理機能をテストするスイート
 * @testType unit
 * Scenarios: 初期化前アクセス, 正常初期化, リセット後状態
 */
describe('Given: uninitialized AgLogger state', () => {
  /**
   * @context When
   * @scenario インスタンス生成処理
   * @description createLogger()メソッドを呼び出してインスタンス生成を試行
   */
  describe('When: calling createLogger', () => {
    it('Then: [正常] - should create singleton instance', () => {
      // テスト実装
    });
  });
});
```

### パターンB: Feature開始スイート

```typescript
/**
 * @suite MockLogger Plugin System | Plugins
 * @description MockLoggerプラグインシステムの機能をテストするスイート
 * @testType integration
 * Scenarios: メッセージキャプチャ, 統計取得, エラーハンドリング
 */
describe('Feature: MockLogger message capture behavior', () => {
  /**
   * @context When
   * @scenario 標準ログレベルでの出力
   * @description 各種ログレベルでのメッセージキャプチャ動作を検証
   */
  describe('When: capturing messages for standard log levels', () => {
    it('Then: [正常] - should capture all level messages correctly', () => {
      // テスト実装
    });
  });
});
```

### パターンC: Then開始スイート

```typescript
/**
 * @suite Error Handling Validation | Error Management
 * @description エラーハンドリング機能の検証を行うスイート
 * @testType functional
 * Scenarios: 例外キャッチ, エラー伝播, 復旧処理
 */
describe('Then: [異常] - error conditions are handled properly', () => {
  /**
   * @context When
   * @scenario 不正な設定値での初期化
   * @description 不正な設定値を用いた初期化処理でのエラーハンドリング
   */
  describe('When: initializing with invalid configuration', () => {
    it('should throw configuration error', () => {
      // テスト実装
    });
  });
});
```

## 🔧 @testType分類

### 定義

| testType      | 対象ファイル                            | 説明                               |
| ------------- | --------------------------------------- | ---------------------------------- |
| `unit`        | `src/__tests__/**/*.spec.ts`            | 単体テスト・関数/クラス単位        |
| `functional`  | `src/__tests__/functional/**/*.spec.ts` | 機能テスト・コンポーネント単位     |
| `integration` | `tests/integration/**/*.spec.ts`        | 統合テスト・システム間連携         |
| `e2e`         | `tests/e2e/**/*.spec.ts`                | エンドツーエンド・全体ワークフロー |

### 選択基準

```typescript
// Unit Test例
/**
 * @testType unit
 */
describe('Feature: validateLogLevel function', () => {

// Functional Test例
/**
 * @testType functional
 */
describe('Feature: AgLogger configuration management', () => {

// Integration Test例
/**
 * @testType integration
 */
describe('Feature: Console Plugin Combinations Integration', () => {

// E2E Test例
/**
 * @testType e2e
 */
describe('Feature: Complete logging workflow', () => {
```

## 📊 Scenariosガイドライン

### シナリオ記述ルール

1. **3-5個程度**の主要シナリオを列挙
2. **簡潔な名詞句**で記述
3. **正常・異常・エッジケース**をバランス良く含める

### 良い例

```typescript
// ✅ 推奨
Scenarios: 正常設定, 不正値エラー, 境界値処理, 設定変更, リセット動作;

// ✅ 推奨
Scenarios: メッセージ形式化, レベルフィルタリング, 循環参照処理;

// ✅ 推奨
Scenarios: プラグイン組み合わせ, 高負荷処理, エラー回復;
```

### 避けるべき例

```typescript
// ❌ 冗長
Scenarios: 正常な設定値を使用した場合の動作確認, 不正な設定値でエラーが発生する場合の動作確認

// ❌ 具体的すぎ
Scenarios: level=3の場合, level=4の場合, level=5の場合

// ❌ 少なすぎ
Scenarios: 正常動作
```

## 🛠️ 実装フロー

### Step 1: ファイル分析

```bash
# MCPツールでテストファイル構造分析
mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/[対象ファイル]"
```

### Step 2: JSDoc追加

1. **TOPレベルdescribe**にSuite JSDocを追加
2. **セカンドレベルdescribe**にContext JSDocを追加
3. **@testType**を適切に設定
4. **Scenarios**を3-5個程度で設定

### Step 3: 検証

```bash
# TypeScript型チェック
pnpm run check:types

# ESLint検証
pnpm run lint:all

# フォーマットチェック
pnpm run check:dprint
```

## ⚠️ 注意事項

### 必須ルール

1. **すべてのdescribeブロック**にJSDocを付与
2. **@testType**は必ず正確に設定
3. **Scenarios**は具体的かつ簡潔に記述
4. **BDD階層構造ルール**との整合性を保持

### 禁止事項

1. **JSDocの省略** - すべてのdescribeで必須
2. **不正確な@testType** - ファイル配置と一致させる
3. **冗長なScenarios** - 簡潔性を保つ

## 📈 進捗管理

### 現在の状況

- **Phase 1**: E2Eテスト（8ファイル）- ✅ JSDoc統一完了
- **Phase 2a**: Console Output（2ファイル）- 🔄 実行中
- **Phase 2b-4d**: 残り34ファイル - ⏳ 待機中

### 完了基準

1. **すべてのdescribeブロック**にJSDoc付与完了
2. **品質チェック**全項目PASS
3. **BDD階層構造ルール**遵守
4. **プロジェクト全体**の一貫性確保

---

**重要**: JSDoc統一は、テストコードの**可読性・保守性・ドキュメント品質**向上のため必須実装。

**参照**:

- [BDD階層構造ルール](./bdd-test-hierarchy.md)
- [todo.md作業進捗](../../packages/@aglabo/agla-logger/todo.md)
