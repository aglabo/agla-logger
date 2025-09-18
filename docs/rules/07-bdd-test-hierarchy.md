# BDD階層構造統一ルール

このドキュメントは、ag-loggerプロジェクトにおけるBDD（Behavior-Driven Development）テスト階層構造の統一ルールを定義します。

## 🎯 基本原則

### 1. 3階層BDD構造の厳格遵守

**すべてのテストファイルは以下の3階層構造に統一する:**

```typescript
describe('[Level 1: Suite]', () => {
  describe('[Level 2: Context]', () => {
    it('[Level 3: Specification]', () => {
      // テスト実装
    });
  });
});
```

### 2. 4階層以上のネスト完全禁止

- **最高優先事項**: 4階層以上のネストは絶対に禁止
- **検出方法**: MCPツールでパターン検索実行
- **修正方法**: 3階層以下に再構成

```bash
# 4階層以上検出コマンド
mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*describe.*describe.*describe" --paths_include_glob "*.spec.ts"
```

## 📝 階層別構造ルール

### Level 1: Suite（最上位）

**3つのパターンから選択:**

#### パターンA: Given開始（前提条件ベース）

```typescript
describe('Given: [前提条件の詳細記述]', () => {
```

#### パターンB: Feature開始（機能単位テスト）

```typescript
describe('Feature: [機能名・特徴の記述]', () => {
```

#### パターンC: Then開始（期待結果詳細）

```typescript
describe('Then: [正常]/[異常]/[エッジケース] - [詳細な期待結果]', () => {
```

### Level 2: Context（実行条件）

**When開始で統一:**

```typescript
describe('When: [具体的な操作・実行内容]', () => {
```

### Level 3: Specification（検証内容）

**ケース種別タグ必須 + Then形式:**

```typescript
it('Then: [正常]/[異常]/[エッジケース] - should [期待される動作]', () => {
```

## 🏷️ ケース種別タグ（必須）

### 分類タグの定義

| タグ               | 用途        | 説明                         |
| ------------------ | ----------- | ---------------------------- |
| **[正常]**         | Happy Path  | 期待入力での正常動作確認     |
| **[異常]**         | Error Cases | エラー・例外処理の確認       |
| **[エッジケース]** | Edge Cases  | 境界値・特殊条件での動作確認 |

### 適用例

```typescript
describe('Feature: User authentication', () => {
  describe('When: logging in with credentials', () => {
    it('Then: [正常] - should return valid token for correct credentials', () => {
      // 正常系テスト
    });

    it('Then: [異常] - should throw error for invalid password', () => {
      // 異常系テスト
    });

    it('Then: [エッジケース] - should handle empty username gracefully', () => {
      // エッジケーステスト
    });
  });
});
```

## ⚠️ 禁止事項

### 1. TOPレベルクラス名describe削除

```typescript
// ❌ 禁止: クラス名がそのままdescribe
describe('AgLogger', () => {

// ✅ 推奨: 機能・前提条件ベース
describe('Feature: AgLogger instance management', () => {
```

### 2. 4階層以上のネスト

```typescript
// ❌ 禁止: 4階層
describe('Suite', () => {
  describe('Context1', () => {
    describe('Context2', () => { // 3階層
      describe('Context3', () => { // 4階層 ← 禁止
        it('test', () => {});
      });
    });
  });
});
```

### 3. ケース種別タグの省略

```typescript
// ❌ 禁止: タグなし
it('should return user data', () => {});

// ✅ 推奨: タグ付き
it('Then: [正常] - should return user data', () => {});
```

## 🔧 修正優先順位

### 最高優先（Critical）

1. **4階層以上のネスト問題修正**
   - 即座に3階層以下に再構成
   - プロジェクト全体の構造整合性に影響

### 高優先（High）

2. **TOPレベルクラス名describeの削除**
   - 機能ベースの命名に変更
   - テストの意図を明確化

### 中優先（Medium）

3. **全it文でThen:タグ形式の適用**
   - ケース種別タグの追加
   - 一貫性向上

### 低優先（Low）

4. **Given/Feature開始パターンの適切選択**
   - 最適なパターン選択
   - 可読性向上

## 🛠️ MCPツール活用

### BDD形式調査

```bash
# Given/When/Then形式の調査
mcp__serena-mcp__search_for_pattern --substring_pattern "Given:|When:|Then:" --paths_include_glob "*.spec.ts"

# テストファイル構造分析
mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/[対象ファイル]"
```

### 問題パターン検出

```bash
# 4階層以上検出
mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*describe.*describe.*describe" --paths_include_glob "*.spec.ts"

# クラス名describe検出
mcp__serena-mcp__search_for_pattern --substring_pattern "describe\\('\\w+'" --paths_include_glob "*.spec.ts"
```

## 📊 適用範囲

### 対象ファイル

- **Unit Tests**: `src/__tests__/**/*.spec.ts`
- **Functional Tests**: `src/__tests__/functional/**/*.spec.ts`
- **Integration Tests**: `tests/integration/**/*.spec.ts`
- **E2E Tests**: `tests/e2e/**/*.spec.ts`

### 適用状況

- **Phase 1**: E2Eテスト（8ファイル）- ✅ 完了
- **Phase 2-4**: Integration/Functional/Unit（36ファイル）- 🔄 進行中

---

**重要**: このルールはプロジェクト全体のテスト品質・保守性向上のため、**例外なく遵守**すること。

**参照**: [todo.md作業進捗](../../packages/@aglabo/agla-logger/todo.md)
