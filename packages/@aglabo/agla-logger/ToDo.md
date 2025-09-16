# テストスイート3層BDD構造再構成 - 1フェーズ・1ファイル修正ToDo

## 📚 必須参照ドキュメント

**作業開始前に以下を必ず参照してください：**

### 🔴 最重要：引き継ぎ資料

- **[handover.md](./handover.md)** - 完全な作業仕様・実装パターン・品質基準
- **[temp/ドキュメント]** - 最新の技術情報・更新内容

### 🛠️ MCPツール必須使用によるトークン削減

**すべての作業でlsmcp・serena-mcpツールを活用してください：**

```bash
# コード理解・構造分析（トークン削減）
mcp__serena-mcp__get_symbols_overview --relative_path "[ファイルパス]"
mcp__serena-mcp__find_symbol --name_path "[シンボル名]"

# パターン検索（効率的調査）
mcp__serena-mcp__search_for_pattern --substring_pattern "[パターン]"

# LSP活用（詳細分析）
mcp__lsmcp__search_symbols --query "[検索語]"
mcp__lsmcp__get_symbol_details --relativePath "[ファイル]" --symbol "[シンボル]"
```

**トークン削減効果：**

- 既存コード読み込み回数削減（MCPツール活用）
- 重複調査回避（ドキュメント参照）
- 段階的アプローチによる効率化

---

## 📊 進捗概要 - 1フェーズ・1ファイル単位

**実行方針**: 1フェーズ = 1ファイルの完全修正（構造再構成 + it()タイトル書き換え）

**全体対象**: 24個のテストファイル（Unit/Functional/Integration/E2E）

---

## 🔧 Subphase 1: テスト構造再構成（最優先）

**1-1. 最優先ファイル群（高頻度・クリティカル）- 1ファイル単位で完全修正**

### Phase 1-1: AgTypes.spec.ts 完全修正

- **修正内容**: TOPクラス名削除 + 型定義別Given分割 + 15個it()タイトルのテストタイプタグ付け
- **構造**: `Given(型定義) → When(検証条件) → Then: [正常|異常|エッジ]`
- **詳細**: src/**tests**/AgTypes.spec.ts (15 it文)
- **it()書き換え例**:
  - `"should have all expected log level values"` → `"Then: [正常] - should have all expected log level values"`
  - `"should handle numeric and enum type compatibility"` → `"Then: [正常] - should handle numeric and enum type compatibility"`
  - `"should extend standard Error interface correctly"` → `"Then: [正常] - should extend standard Error interface correctly"`

### Phase 1-2: agManagerUtils/core.spec.ts 完全修正

- **修正内容**: 機能別Given分割 + Given-When-Then 3層BDD + 24個it()タイトル書き換え
- **構造**: `Given(機能別) → When(実行条件) → Then: [正常|異常|エッジ]`
- **詳細**: src/**tests**/agManagerUtils/core.spec.ts (24 it文)
- **it()書き換え例**:
  - utility関数テスト → `"Then: [正常] - utility関数名 should work correctly"`
  - エラー処理テスト → `"Then: [異常] - should handle error case properly"`

### Phase 1-3: MockFormatter.spec.ts 完全修正

- **修正内容**: エラー処理・基本機能別Given分割 + 17個it()タイトル書き換え
- **構造**: `Given(機能観点) → When(実行) → Then: [正常|異常|エッジ]`
- **詳細**: src/plugins/formatter/**tests**/MockFormatter.spec.ts (17 it文)
- **it()書き換え例**:
  - 基本フォーマット → `"Then: [正常] - should format message correctly"`
  - エラー処理 → `"Then: [異常] - should handle formatting errors"`

### Phase 1-4: E2eMockLogger.spec.ts 完全修正

- **修正内容**: MockLogger動作別Given分割 + 9個it()タイトル書き換え
- **構造**: `Given(動作パターン) → When(実行) → Then: [正常|異常|エッジ]`
- **詳細**: src/plugins/logger/**tests**/E2eMockLogger.spec.ts (9 it文)
- **it()書き換え例**:
  - ログ出力 → `"Then: [正常] - should log message to mock output"`
  - 状態管理 → `"Then: [正常] - should maintain proper state"`

### Phase 1-5: parseArgsToAgLogMessage.spec.ts 完全修正

- **修正内容**: データ型別Given統合・2層BDD化 + 38個it()タイトル書き換え
- **構造**: `Given(データ型) → When(パース処理) → Then: [正常|異常|エッジ]`
- **詳細**: src/functional/core/**tests**/parseArgsToAgLogMessage.spec.ts (38 it文)
- **it()書き換え例**:
  - 文字列パース → `"Then: [正常] - should parse string arguments correctly"`
  - 配列パース → `"Then: [正常] - should parse array arguments correctly"`
  - エラーケース → `"Then: [異常] - should handle invalid arguments"`

## 🔧 Subphase 2: 中優先度・大規模ファイルグループ

### Phase 2-1: AgLoggerConfig.functional.spec.ts 完全修正

- **修正内容**: 機能別Given分割 + TOPクラス名削除 + 51個it()タイトル書き換え
- **構造**: `Given(機能別) → When(実行) → Then: [正常|異常|エッジ]`
- **詳細**: src/**tests**/functional/internal/AgLoggerConfig.functional.spec.ts (51 it文)
- **it()書き換え例**:
  - 設定管理 → `"Then: [正常] - should manage configuration correctly"`
  - 検証処理 → `"Then: [正常] - should validate options properly"`
  - エラーケース → `"Then: [異常] - should handle invalid configuration"`

### Phase 2-2: MockLogger.spec.ts 完全修正

- **修正内容**: 動作パターン別Given分割 + 35個it()タイトル書き換え
- **構造**: `Given(動作パターン) → When(実行) → Then: [正常|異常|エッジ]`
- **詳細**: src/plugins/logger/**tests**/units/MockLogger.spec.ts (35 it文)
- **it()書き換え例**:
  - メッセージ処理 → `"Then: [正常] - should process message correctly"`
  - クエリ処理 → `"Then: [正常] - should handle query operations"`
  - 状態管理 → `"Then: [正常] - should maintain state properly"`

## 🔧 Subphase 3: 優良実装・軽微修正グループ

### Phase 3-1: AgLogger.functional.spec.ts 軽微修正

- **修正内容**: 既存3層BDD構造維持 + 37個it()タイトルのテストタイプタグ付けのみ
- **構造**: 既存構造維持（Given-When-Then 3層BDD）
- **詳細**: src/**tests**/functional/AgLogger.functional.spec.ts (37 it文)
- **it()書き換え例**:
  - `"should log message at INFO level"` → `"Then: [正常] - should log message at INFO level"`
  - `"should handle error logging"` → `"Then: [異常] - should handle error logging"`

### Phase 3-2: AgLoggerManager.functional.spec.ts 軽微修正

- **修正内容**: 既存3層BDD構造維持 + 23個it()タイトルのテストタイプタグ付けのみ
- **構造**: 既存構造維持（Given-When-Then 3層BDD）
- **詳細**: src/**tests**/functional/AgLoggerManager.functional.spec.ts (23 it文)
- **it()書き換え例**:
  - `"should initialize manager correctly"` → `"Then: [正常] - should initialize manager correctly"`
  - `"should handle manager errors"` → `"Then: [異常] - should handle manager errors"`

## 🔧 Subphase 4: Integration Tests - Featureパターン適用

### Phase 4-1: console-plugin-combinations.integration.spec.ts 完全修正

- **修正内容**: Feature-When-Then構造 + 1個it()タイトル書き換え
- **構造**: `Feature(統合機能) → When(統合実行) → Then: [正常|異常|エッジ]`
- **詳細**: tests/integration/console-output/combinations/console-plugin-combinations.integration.spec.ts (1 it文)
- **it()書き換え例**:
  - `"should work with console combinations"` → `"Then: [正常] - should work with console combinations"`

### Phase 4-2: comprehensive-integration.integration.spec.ts 完全修正

- **修正内容**: Feature-When-Then構造 + 6個it()タイトル書き換え
- **構造**: `Feature(包括的統合) → When(統合実行) → Then: [正常|異常|エッジ]`
- **詳細**: tests/integration/mock-output/plugins/combinations/comprehensive-integration.integration.spec.ts (6 it文)
- **it()書き換え例**:
  - 統合テスト → `"Then: [正常] - should handle comprehensive integration"`

### Phase 4-3: singleton-management.integration.spec.ts 軽微修正

- **修正内容**: 既存Given-When-Then構造維持 + 5個it()タイトルのテストタイプタグ付けのみ
- **構造**: 既存構造維持（Given-When-Then 3層BDD）
- **詳細**: tests/integration/mock-output/manager/singleton-management.integration.spec.ts (5 it文)
- **it()書き換え例**:
  - `"should manage singleton correctly"` → `"Then: [正常] - should manage singleton correctly"`

## 🔧 Subphase 5: E2E Tests - 大規模Featureパターン適用

### Phase 5-1: integration-workflows.e2e.spec.ts 完全修正

- **修正内容**: ワークフロー別Feature分割 + Feature-When-Then構造 + 72個it()タイトル書き換え
- **構造**: `Feature(ワークフロー別) → When(E2E実行) → Then: [正常|異常|エッジ]`
- **詳細**: tests/e2e/integration-workflows.e2e.spec.ts (72 it文)
- **it()書き換え例**:
  - ワークフロー実行 → `"Then: [正常] - should execute workflow correctly"`
  - エラーハンドリング → `"Then: [異常] - should handle workflow errors"`

### Phase 5-2: monitoring-scenarios.e2e.spec.ts 完全修正

- **修正内容**: シナリオ別Feature分割 + Feature-When-Then構造 + 66個it()タイトル書き換え
- **構造**: `Feature(シナリオ別) → When(E2E実行) → Then: [正常|異常|エッジ]`
- **詳細**: tests/e2e/monitoring-scenarios.e2e.spec.ts (66 it文)
- **it()書き換え例**:
  - モニタリング実行 → `"Then: [正常] - should execute monitoring correctly"`
  - シナリオ処理 → `"Then: [正常] - should handle scenario properly"`

---

## 📋 実行ガイドライン

### 各フェーズの実行順序

**Phase 1-1 → Phase 1-2 → Phase 1-3 → Phase 1-4 → Phase 1-5**
↓
**Phase 2-1 → Phase 2-2**
↓\
**Phase 3-1 → Phase 3-2**
↓
**Phase 4-1 → Phase 4-2 → Phase 4-3**
↓
**Phase 5-1 → Phase 5-2**

### 各フェーズでの作業内容

1. **MCPツールによる現在構造分析**
   ```bash
   mcp__serena-mcp__get_symbols_overview --relative_path "[対象ファイル]"
   ```

2. **構造変更実装**（該当する場合）
   - TOPクラス名削除
   - Given/Feature直接TOP配置
   - BDD階層整理

3. **it()タイトル一括書き換え**
   - `"テスト内容"` → `"Then: [正常|異常|エッジ] - テスト内容"`

4. **品質確認**
   ```bash
   pnpm run check:types
   pnpm run test:unit # または該当テスト種別
   ```

### 共通it()書き換えパターン

- **正常系**: `"Then: [正常] - should [期待動作]"`
- **異常系**: `"Then: [異常] - should handle [エラー条件]"`
- **エッジケース**: `"Then: [エッジ] - should handle [境界条件]"`

---

## 📂 修正対象ファイル一覧 (46ファイル・881 it()文)

### 📊 BDD構造現状分析結果

- **Given/When/Then構造**: 10ファイル ✅
- **Feature/When/Then構造**: 5ファイル ✅
- **従来describe()構造**: 31ファイル 🔄 (要変換)

### 🔴 完全再構築必要（18ファイル）

#### Unit Tests (src/**tests**/)

1. **src/**tests**/units/utils/AgLogHelpers.spec.ts**
   - 現状: クラス名describe使用、従来型構造
   - 計画: Feature開始パターンで各ユーティリティ関数をBDD化

2. **src/**tests**/units/utils/AgLogValidators.spec.ts**
   - 現状: バリデーション機能のシンプル構造
   - 計画: Given/When/Thenパターンでバリデーションロジック整理

3. **src/**tests**/AgTypes.spec.ts**
   - 現状: 型テストの基本構造
   - 計画: Feature/When/Thenで型システムテスト統一

#### Functional Tests

4. **src/**tests**/functional/features/plainOutput.functional.spec.ts**
   - 計画: 既存のGiven構造を最適化・深層ネスト解消

#### Integration Tests (tests/integration/)

5-18. **全Integration Tests（14ファイル）**

- `console-output/` 配下: Given/When/Then統一
- `mock-output/core/` 配下: 統合テスト最適パターン適用
- `mock-output/plugins/` 配下: プラグイン組み合わせテスト構造化

#### E2E Tests (tests/e2e/)

19-26. **全E2E Tests（8ファイル）**

- アプリケーションライフサイクルテスト: Feature/When/Then
- シナリオベーステスト: Given/When/Then

### ⚠️ 部分修正必要（25ファイル）

#### Formatter Plugin Tests

19-23. **src/plugins/formatter/**tests**/（5ファイル）**

- 現状: 部分的BDD構造
- 計画: 4階層ネスト解消、Then:タグ化

#### Logger Plugin Tests

24-26. **src/plugins/logger/**tests**/（3ファイル）**

- 現状: ユニットテスト基本構造
- 計画: Given/When/Then統一

#### Internal Tests

27-30. **src/internal/**tests**/（4ファイル）**

- 現状: 一部BDD採用済み
- 計画: 構造最適化・深層ネスト解消

#### その他Unit Tests

31-35. **残りUnit Tests（13ファイル）**

- 各種ユーティリティ・機能テスト
- 計画: 個別最適パターン適用

## 🛠️ 実装手順

### Step 1: 分析・準備

```bash
# 4階層以上ネスト検索
mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*describe.*describe.*describe" --paths_include_glob "*.spec.ts"

# クラス名describe検索
mcp__serena-mcp__search_for_pattern --substring_pattern "^describe\\('[A-Z]" --paths_include_glob "*.spec.ts"
```

### Step 2: Phase 1実装（最高優先度）

1. 4階層以上ネスト問題の完全解消
2. 最大3階層への制限徹底

### Step 3: Phase 2実装（高優先度）

1. トップレベルクラス名describe削除
2. Given/Feature開始パターンへの変換

### Step 4: Phase 3-4実装（中・低優先度）

1. 全it文のThen:タグ化
2. 分類タグ（正常・異常・エッジケース）追加
3. 最適パターン選択・適用

---

## 🧭 サブフェーズ計画（R-G-Rで安全進行）

目的: 影響度（テスト件数・依存度）に応じてフェーズを小さなサブフェーズに分割し、Red-Green-Refactorを維持しながら常にグリーンを保つ。

### 共通運用ルール

- 変更単位（WIP上限）: 1サブフェーズ = 1〜3ファイル、最大50 it()まで
- サイクル順序（R-G-R）:
  1. Red: 着手前に現状テストを実行してグリーン確認・ベースライン確立
  2. Green: 構造リファクタ（describe入替・階層削減）のみを先に実施（期待値・実装は不変）→ 直後にテスト実行でグリーン復帰確認
  3. Refactor: itタイトルのThenタグ化・文言整形を実施 → 再テストでグリーン確認
- 検証粒度: Unit → Integration → E2E の順で段階的に広げる（必要最小限を実行）
- 失敗時のロールバック: サブフェーズ単位で差分を戻せるようにコミットを細分化

### Phase 1 サブフェーズ（完全再構築・低リスクから高影響へ）

- P1-S1（小規模/安全パイロット）
  - 対象: T-1-04（9件）, T-1-03（17件）
  - 検証: `pnpm run test:unit`
- P1-S2（中規模）
  - 対象: T-1-02（24件）
  - 検証: `pnpm run test:unit`
- P1-S3（最大規模/高影響）
  - 対象: T-1-01（29件）
  - 検証: `pnpm run test:unit` → `pnpm run check:types`

チェックポイント（各サブフェーズ完了条件）

- [ ] 構造変更後にグリーン復帰（Unit）
- [ ] Thenタグ化後にグリーン維持
- [ ] 4階層以上ネストゼロを確認

### Phase 2 サブフェーズ（部分修正・スイープ）

- P2-S1（個別対応）
  - 対象: T-2-01（JsonFormatter 12件）
  - 検証: `pnpm run test:unit`
- P2-S2（横断スイープ：クラス名describe）
  - 対象: 全体検索で検出した該当箇所をディレクトリ単位で小分け（src/plugins → src/internal → その他）
  - 検証: ディレクトリごとに `pnpm run test:unit`

チェックポイント

- [ ] 最大3階層ルール順守
- [ ] トップレベルクラス名describeの全廃

### Phase 3 サブフェーズ（Integration：ディレクトリ分割）

- P3-S1（console-output）
  - 対象: T-3-01, T-3-02
- P3-S2（manager）
  - 対象: T-3-06, T-3-07, T-3-08
- P3-S3（data-processing）
  - 対象: T-3-04, T-3-05
- P3-S4（plugins/formatters）
  - 対象: T-3-12, T-3-13
- P3-S5（plugins/combinations）
  - 対象: T-3-10, T-3-11
- P3-S6（core + utils + performance）
  - 対象: T-3-03, T-3-09, T-3-14

検証

- 各サブフェーズごとに `pnpm run test:develop`（Integration含む）
- 必要に応じてパターン指定で対象ファイルのみ実行（テストランナー対応時）

### Phase 4 サブフェーズ（E2E：領域分割）

- P4-S1（console-output 一式）
  - 対象: T-4-01〜T-4-04
- P4-S2（mock-output 一式）
  - 対象: T-4-05〜T-4-08

検証

- 各サブフェーズごとに `pnpm run test:develop`（E2E含む）
- 実行時間に応じて1〜2ファイルずつ（WIP上限内）に更に小分け可能

---

## 🎯 品質ゲート

### 必須チェックポイント

- [ ] **4階層以上ネスト完全排除**
- [ ] **TOPレベルクラス名describe完全削除**
- [ ] **全it文でThen:タグ形式適用**
- [ ] **分類タグ（正常・異常・エッジケース）必須適用**
- [ ] **Given/Feature開始パターン適切選択**

### 検証コマンド

```bash
# 構造検証
pnpm run test:develop  # 全テスト通過確認
pnpm run check:types   # 型チェック
pnpm run lint:all      # コード品質確認
```

## 📊 期待効果

### 品質向上

- テスト構造の一貫性確立
- 仕様理解の向上

---

## ✅ Task Breakdown（チェックリスト統合）

### 📋 概要

53テストファイルの完全なBDD構造統一のための詳細タスク分割。各ファイルをタスクID付きで管理し、構造変更からit文修正まで段階的に実行。

### 🎯 タスク命名規則

#### ファイルレベルタスクID

- T-[Phase]-[FileNumber]: 例）`T-1-01`（Phase 1の1番目のファイル）

#### サブフェーズタスクID

- T-[Phase]-[FileNumber]-A: BDD構造変更
- T-[Phase]-[FileNumber]-B: it文言修正
- T-[Phase]-[FileNumber]-C: 品質確認

#### 詳細タスクID

- T-[Phase]-[FileNumber]-[Sub]-[Number]: 例）`T-1-01-A-01`

---

### 🚨 Phase 1: 最高優先度（完全再構築必要）

#### T-1-01: AgLogHelpers.spec.ts（29個のit文）

現状: 従来型クラス名describe構造、29個のit文が6個のdescribeブロックに分散

##### T-1-01-A: BDD構造変更

- [x] T-1-01-A-01: トップレベル`describe('AgLogHelpers', () => {`を削除
  - 編集方法: 行27の`describe('AgLogHelpers', () => {`と対応する最後の`});`（行262）を削除し、インデントを1段階左にシフト

- [x] T-1-01-A-02: 6個のメイン機能ブロックをFeature/When/Then構造に変換
  - 編集方法:
    1. `describe('valueToString: Value conversion utility', () => {` → `describe('Feature: valueToString value conversion utility', () => {`
    2. `describe('createLoggerFunction: Logger function factory', () => {` → `describe('Feature: createLoggerFunction logger function factory', () => {`
    3. `describe('isValidLogLevel: LogLevel validation utility', () => {` → `describe('Feature: isValidLogLevel log level validation utility', () => {`
    4. `describe('argsToString: Arguments string conversion', () => {` → `describe('Feature: argsToString arguments string conversion', () => {`
    5. `describe('Log Level Conversion', () => {` → `describe('Feature: Log level conversion utilities', () => {`

- [x] T-1-01-A-03: 各機能の日本語サブdescribeをWhen句に変換
  - 編集方法:
    1. `describe('基本データタイプの変換', () => {` → `describe('When: converting basic data types', () => {`
    2. `describe('配列の変換', () => {` → `describe('When: converting arrays', () => {`
    3. `describe('関数の変換', () => {` → `describe('When: converting functions', () => {`
    4. `describe('オブジェクトの変換', () => {` → `describe('When: converting objects', () => {`
    5. `describe('ロガー関数の生成', () => {` → `describe('When: creating logger functions', () => {`
    6. `describe('有効なログレベルの検証', () => {` → `describe('When: validating valid log levels', () => {`
    7. `describe('無効なログレベルの検証', () => {` → `describe('When: validating invalid log levels', () => {`
    8. `describe('引数の文字列変換', () => {` → `describe('When: converting arguments to string', () => {`
    9. `describe('AgToLabel: ログレベルからラベルへの変換', () => {` → `describe('When: converting log levels to labels with AgToLabel', () => {`
    10. `describe('AgToLogLevel: ラベルからログレベルへの変換', () => {` → `describe('When: converting labels to log levels with AgToLogLevel', () => {`

##### T-1-01-B: it文言修正（29個）

基本データタイプ変換グループ（5個）:

- [x] T-1-01-B-01: `'should return string representation of null'` → `Then: [正常] - should return string representation of null`
- [x] T-1-01-B-02: `'should return string representation of undefined'` → `Then: [正常] - should return string representation of undefined`
- [x] T-1-01-B-03: `'should return quoted string for string values'` → `Then: [正常] - should return quoted string for string values`
- [x] T-1-01-B-04: `'should return string representation of numbers'` → `Then: [正常] - should return string representation of numbers`
- [x] T-1-01-B-05: `'should return string representation of booleans'` → `Then: [正常] - should return string representation of booleans`

配列変換グループ（5個）:

- [x] T-1-01-B-06: `'should return "array" for empty arrays'` → `Then: [エッジケース] - should return "array" for empty arrays`
- [x] T-1-01-B-07: `'should return bracketed string representation for non-empty arrays'` → `Then: [正常] - should return bracketed string representation for non-empty arrays`
- [x] T-1-01-B-08: `'should handle arrays with mixed types'` → `Then: [正常] - should handle arrays with mixed types`
- [x] T-1-01-B-09: `'should handle nested arrays'` → `Then: [エッジケース] - should handle nested arrays`
- [x] T-1-01-B-10: `'should handle arrays with null and undefined'` → `Then: [エッジケース] - should handle arrays with null and undefined`

関数変換グループ（3個）:

- [x] T-1-01-B-11: `'should return "function" for anonymous functions'` → `Then: [正常] - should return "function" for anonymous functions`
- [x] T-1-01-B-12: `'should return function name for named functions'` → `Then: [正常] - should return function name for named functions`
- [x] T-1-01-B-13: `'should handle bound functions'` → `Then: [正常] - should handle bound functions`

オブジェクト変換グループ（6個）:

- [x] T-1-01-B-14: `'should return class name for class instances'` → `Then: [正常] - should return class name for class instances`
- [x] T-1-01-B-15: `'should return "object" for plain objects'` → `Then: [正常] - should return "object" for plain objects`
- [x] T-1-01-B-16: `'should handle null and undefined properties'` → `Then: [エッジケース] - should handle null and undefined properties`
- [x] T-1-01-B-17: `'should handle circular references with placeholder'` → `Then: [エッジケース] - should handle circular references with placeholder`
- [x] T-1-01-B-18: `'should handle Map and Set objects'` → `Then: [正常] - should handle Map and Set objects`
- [x] T-1-01-B-19: `'should handle Date and RegExp objects'` → `Then: [正常] - should handle Date and RegExp objects`

ログレベル変換グループ（10個）:

- [x] T-1-01-B-20: `'should convert log level to label correctly'` → `Then: [正常] - should convert log level to label correctly`
- [x] T-1-01-B-21: `'should convert label to log level correctly'` → `Then: [正常] - should convert label to log level correctly`
- [x] T-1-01-B-22: `'should handle invalid log level input'` → `Then: [異常] - should handle invalid log level input`
- [x] T-1-01-B-23: `'should handle case-insensitive labels'` → `Then: [エッジケース] - should handle case-insensitive labels`
- [x] T-1-01-B-24: `'should handle custom label mapping'` → `Then: [正常] - should handle custom label mapping`
- [x] T-1-01-B-25: `'should validate valid log levels'` → `Then: [正常] - should validate valid log levels`
- [x] T-1-01-B-26: `'should invalidate invalid log levels'` → `Then: [正常] - should invalidate invalid log levels`
- [x] T-1-01-B-27: `'should support extended log levels'` → `Then: [エッジケース] - should support extended log levels`
- [x] T-1-01-B-28: `'should support localized labels'` → `Then: [エッジケース] - should support localized labels`
- [x] T-1-01-B-29: `'should maintain bidirectional consistency between level and label'` → `Then: [正常] - should maintain bidirectional consistency between level and label`

##### T-1-01-C: 品質確認

- [x] T-1-01-C-01: 型チェック実行成功（`pnpm run check:types`）
- [x] T-1-01-C-02: 単体テスト実行成功（`pnpm run test:unit`）

---

#### T-1-02: agManagerUtils/core.spec.ts（24個のit文）

現状: 従来型クラス名describe構造、24個のit文が複数のdescribeブロックに分散

##### T-1-02-A: BDD構造変更

- [x] T-1-02-A-01: MCPツール使用での現在構造分析
  - 実行コマンド: `mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/agManagerUtils/core.spec.ts"`

- [x] T-1-02-A-02: トップレベルクラス名describe削除とFeature構造への変換
  - 編集方法: メインのクラス名describeを削除し、機能単位でFeature/When/Then構造に変換

- [x] T-1-02-A-03: 階層最適化（3階層以内に制限）
  - 編集方法: 深すぎる階層を統合し、Given/When/Then構造に適合

##### T-1-02-B: it文言修正（24個）

- [x] T-1-02-B-01: `'should return AgLoggerManager instance when called for the first time'` → `Then: [正常] - should return AgLoggerManager instance when called for the first time`
- [x] T-1-02-B-02: `'should set AgManager global variable when called for the first time'` → `Then: [正常] - should set AgManager global variable when called for the first time`
- [x] T-1-02-B-03: `'should accept optional AgLoggerOptions parameter'` → `Then: [正常] - should accept optional AgLoggerOptions parameter`
- [x] T-1-02-B-04: `'should throw error when called for the second time'` → `Then: [異常] - should throw error when called for the second time`
- [x] T-1-02-B-05: `'should throw error when called after AgLoggerManager.createManager'` → `Then: [異常] - should throw error when called after AgLoggerManager.createManager`
- [x] T-1-02-B-06: `'should not update AgManager global variable on second call'` → `Then: [異常] - should not update AgManager global variable on second call`
- [x] T-1-02-B-07: `'should maintain same reference between createManager return value and AgManager'` → `Then: [正常] - should maintain same reference between createManager return value and AgManager`
- [x] T-1-02-B-08: `'should provide same reference as AgLoggerManager.getManager'` → `Then: [正常] - should provide same reference as AgLoggerManager.getManager`
- [x] T-1-02-B-09: `'should reset AgManager to undefined after resetSingleton'` → `Then: [正常] - should reset AgManager to undefined after resetSingleton`
- [x] T-1-02-B-10: `'should return AgLogger instance when AgManager is initialized'` → `Then: [正常] - should return AgLogger instance when AgManager is initialized`
- [x] T-1-02-B-11: `'should return same AgLogger instance as AgManager.getLogger()'` → `Then: [正常] - should return same AgLogger instance as AgManager.getLogger()`
- [x] T-1-02-B-12: `'should work after AgLoggerManager.createManager without createManager utility'` → `Then: [正常] - should work after AgLoggerManager.createManager without createManager utility`
- [x] T-1-02-B-13: `'should throw error when AgManager is undefined'` → `Then: [異常] - should throw error when AgManager is undefined`
- [x] T-1-02-B-14: `'should throw error with appropriate error message'` → `Then: [異常] - should throw error with appropriate error message`
- [x] T-1-02-B-15: `'should provide same interface as AgLoggerManager.getManager().getLogger()'` → `Then: [正常] - should provide same interface as AgLoggerManager.getManager().getLogger()`
- [x] T-1-02-B-16: `'should work consistently with AgManager global variable'` → `Then: [正常] - should work consistently with AgManager global variable`
- [x] T-1-02-B-17: `'should throw same error type as AgLoggerManager methods when uninitialized'` → `Then: [異常] - should throw same error type as AgLoggerManager methods when uninitialized`
- [x] T-1-02-B-18: `'should work in typical usage pattern'` → `Then: [正常] - should work in typical usage pattern`
- [x] T-1-02-B-19: `'should provide consistent logger instance across multiple getLogger calls'` → `Then: [正常] - should provide consistent logger instance across multiple getLogger calls`
- [x] T-1-02-B-20: `'should maintain manager and logger consistency with options'` → `Then: [正常] - should maintain manager and logger consistency with options`
- [x] T-1-02-B-21: `'should both fail consistently when manager is not created'` → `Then: [異常] - should both fail consistently when manager is not created`
- [x] T-1-02-B-22: `'should both fail consistently after resetSingleton'` → `Then: [異常] - should both fail consistently after resetSingleton`
- [x] T-1-02-B-23: `'should handle multiple reset and recreation cycles'` → `Then: [正常] - should handle multiple reset and recreation cycles`

##### T-1-02-C: 品質確認

- [x] T-1-02-C-01: 型チェック実行成功（`pnpm run check:types`）
- [x] T-1-02-C-02: 単体テスト実行成功（`pnpm run test:develop`）

---

#### T-1-03: plugins/formatter/MockFormatter.spec.ts（17個のit文）

現状: 従来型クラス名describe構造、日本語it文を含む17個のテスト

##### T-1-03-A: BDD構造変更

- [x] T-1-03-A-01: MCPツール使用での現在構造分析
- [x] T-1-03-A-02: トップレベルクラス名describe削除とFeature/When/Then構造への変換
- [x] T-1-03-A-03: 日本語describe句の英語化とWhen句への統一

##### T-1-03-B: it文言修正（17個）

日本語it文の英語化 + Then:タグ付与:

- [x] T-1-03-B-01: `'カスタムルーチンを渡すとクラス（コンストラクタ関数）を返す'` → `Then: [正常] - should return class constructor when custom routine is provided`
- [x] T-1-03-B-02: `'返されたクラスは __isMockConstructor マーカーを持つ'` → `Then: [正常] - should have __isMockConstructor marker in returned class`
- [x] T-1-03-B-03: `'インスタンス化時にカスタムルーチンがbindされる'` → `Then: [正常] - should bind custom routine during instantiation`
- [x] T-1-03-B-04: `'executeメソッドがカスタムルーチンを呼び出す'` → `Then: [正常] - should call custom routine via execute method`
- [x] T-1-03-B-05: `'getStatsとresetメソッドが継承される'` → `Then: [正常] - should inherit getStats and reset methods`
- [x] T-1-03-B-06: `'createMockFormatterと同じ動作をする'` → `Then: [正常] - should behave same as createMockFormatter`
- [x] T-1-03-B-07: `'JSONフォーマットでメッセージを出力する'` → `Then: [正常] - should output message in JSON format`
- [x] T-1-03-B-08: `'メッセージ部分のみを出力する'` → `Then: [正常] - should output message part only`
- [x] T-1-03-B-09: `'タイムスタンプ付きでメッセージを出力する'` → `Then: [正常] - should output message with timestamp`
- [x] T-1-03-B-10: `'指定したプレフィックス付きでメッセージを出力する'` → `Then: [正常] - should output message with specified prefix`
- [x] T-1-03-B-11: `'デフォルトエラーメッセージでErrorを投げる'` → `Then: [異常] - should throw Error with default error message`
- [x] T-1-03-B-12: `'カスタムデフォルトエラーメッセージを設定できる'` → `Then: [正常] - should set custom default error message`
- [x] T-1-03-B-13: `'setErrorMessageで実行時にエラーメッセージを変更できる'` → `Then: [正常] - should change error message at runtime with setErrorMessage`
- [x] T-1-03-B-14: `'getErrorMessageで現在のエラーメッセージを取得できる'` → `Then: [正常] - should get current error message with getErrorMessage`
- [x] T-1-03-B-15: `'errorThrowも統計機能を持つ'` → `Then: [正常] - should have statistics feature for errorThrow`
- [x] T-1-03-B-16: `'AgLoggerConfigでcreateFormatterを自動インスタンス化できる'` → `Then: [正常] - should auto-instantiate createFormatter in AgLoggerConfig`
- [x] T-1-03-B-17: `'MockFormatter.jsonもAgLoggerConfigで自動インスタンス化できる'` → `Then: [正常] - should auto-instantiate MockFormatter.json in AgLoggerConfig`

##### T-1-03-C: 品質確認

- [x] T-1-03-C-01: 型チェック実行成功（`pnpm run check:types`）
- [x] T-1-03-C-02: 単体テスト実行成功（`pnpm run test:develop`）

---

#### T-1-04: plugins/logger/E2eMockLogger.spec.ts（9個のit文）

現状: 従来型クラス名describe構造、9個のit文

##### T-1-04-A: BDD構造変更

- [x] T-1-04-A-01: MCPツール使用での現在構造分析
- [x] T-1-04-A-02: トップレベルクラス名describe削除とFeature/When/Then構造への変換

##### T-1-04-B: it文言修正（9個）

- [x] T-1-04-B-01: `'should allow switching to different test ID after construction'` → `Then: [正常] - should allow switching to different test ID after construction`
- [x] T-1-04-B-02: `'should throw error when trying to log after ending current test'` → `Then: [異常] - should throw error when trying to log after ending current test`
- [x] T-1-04-B-03: `'should store error messages in array'` → `Then: [正常] - should store error messages in array`
- [x] T-1-04-B-04: `'should return last error message'` → `Then: [正常] - should return last error message`
- [x] T-1-04-B-05: `'should return null when no error messages'` → `Then: [エッジケース] - should return null when no error messages`
- [x] T-1-04-B-06: `'should clear error messages'` → `Then: [正常] - should clear error messages`
- [x] T-1-04-B-07: `'should get last message for each level using unified method'` → `Then: [正常] - should get last message for each level using unified method`
- [x] T-1-04-B-08: `'should get messages for each level using unified method'` → `Then: [正常] - should get messages for each level using unified method`
- [x] T-1-04-B-09: `'should clear messages for specific level using unified method'` → `Then: [正常] - should clear messages for specific level using unified method`

##### T-1-04-C: 品質確認

- [x] T-1-04-C-01: 型チェック実行成功（`pnpm run check:types`）
- [x] T-1-04-C-02: 単体テスト実行成功（`pnpm run test:develop`）

---

### 🔧 Phase 2: 高優先度（部分修正）

#### T-2-01: plugins/formatter/**tests**/JsonFormatter.spec.ts（12個のit文）

現状: Given/When/Then構造だが4階層ネスト問題あり

##### T-2-01-A: BDD構造最適化

- [ ] T-2-01-A-01: 4階層ネスト解消（最大3階層に制限）
  - 編集方法: `Given: JsonFormatter with valid log message structures`配下の4つのWhen句を統合し、階層を削減

- [ ] T-2-01-A-02: Then句がdescribeレベルにある構造の最適化

##### T-2-01-B: it文言修正（12個）

- [ ] T-2-01-B-01: `'should format basic log message as JSON - 正常系'` → `Then: [正常] - should format basic log message as JSON`
- [ ] T-2-01-B-02: `'should format log message with arguments as JSON - 正常系'` → `Then: [正常] - should format log message with arguments as JSON`
- [ ] T-2-01-B-03: `'should format multiple arguments as JSON array - 正常系'` → `Then: [正常] - should format multiple arguments as JSON array`
- [ ] T-2-01-B-04: `'should format correctly for all standard log levels - 正常系'` → `Then: [正常] - should format correctly for all standard log levels`
- [ ] T-2-01-B-05: `'should format LOG level without level field - エッジケース'` → `Then: [エッジケース] - should format LOG level without level field`
- [ ] T-2-01-B-06: `'should format correctly with empty message - エッジケース'` → `Then: [エッジケース] - should format correctly with empty message`
- [ ] T-2-01-B-07: `'should output valid JSON string without newlines - 正常系'` → `Then: [正常] - should output valid JSON string without newlines`
- [ ] T-2-01-B-08: `'should throw Converting circular structure to JSON error - 異常系'` → `Then: [異常] - should throw Converting circular structure to JSON error`
- [ ] T-2-01-B-09: `'should handle null arguments correctly - エッジケース'` → `Then: [エッジケース] - should handle null arguments correctly`
- [ ] T-2-01-B-10: `'should handle undefined properties in objects - エッジケース'` → `Then: [エッジケース] - should handle undefined properties in objects`
- [ ] T-2-01-B-11: `'should handle deeply nested objects without error - エッジケース'` → `Then: [エッジケース] - should handle deeply nested objects without error`
- [ ] T-2-01-B-12: `'should handle large arrays without performance issues - エッジケース'` → `Then: [エッジケース] - should handle large arrays without performance issues`

##### T-2-01-C: 品質確認

- [ ] T-2-01-C-01: 型チェック実行成功（`pnpm run check:types`）
- [ ] T-2-01-C-02: 単体テスト実行成功（`pnpm run test:unit`）

---

### 📋 続行パターン（Phase 3-4）

#### Phase 3: 中優先度（Integration Tests）

【詳細チェックリスト】

（方針）Integrationは原則 Feature/When/Then で最大3階層に統一

- T-3-01: tests/integration/console-output/combinations/console-plugin-combinations.integration.spec.ts
  - T-3-01-A: 構造変更・最適化
    - [ ] T-3-01-A-01: 現状構造分析（深いネストの洗い出し）
    - [ ] T-3-01-A-02: Feature/When/Then化（3階層以内）
    - [ ] T-3-01-A-03: Then句の記述位置最適化
  - T-3-01-B: it文言修正
    - [ ] T-3-01-B-01: 全itに Then: [正常/異常/エッジケース] を付与
  - T-3-01-C: 品質確認
    - [ ] T-3-01-C-01: 型チェック（pnpm run check:types）
    - [ ] T-3-01-C-02: テスト実行（pnpm run test:develop）

- T-3-02: tests/integration/console-output/loggers/console-logger-behavior.integration.spec.ts
  - T-3-02-A: 構造変更・最適化（A-01〜A-03 同上）
  - T-3-02-B: it文言修正（B-01 同上）
  - T-3-02-C: 品質確認（C-01, C-02 同上）

- T-3-03: tests/integration/mock-output/core/configuration-behavior.integration.spec.ts
  - T-3-03-A/B/C: 上記と同様

- T-3-04: tests/integration/mock-output/data-processing/complex-data-handling.integration.spec.ts
  - T-3-04-A/B/C: 上記と同様

- T-3-05: tests/integration/mock-output/data-processing/filtering-behavior.integration.spec.ts
  - T-3-05-A/B/C: 上記と同様

- T-3-06: tests/integration/mock-output/manager/error-handling.integration.spec.ts
  - T-3-06-A/B/C: 上記と同様

- T-3-07: tests/integration/mock-output/manager/logger-map-management.integration.spec.ts
  - T-3-07-A/B/C: 上記と同様

- T-3-08: tests/integration/mock-output/manager/singleton-management.integration.spec.ts
  - T-3-08-A/B/C: 上記と同様

- T-3-09: tests/integration/mock-output/performance/high-load-behavior.integration.spec.ts
  - T-3-09-A/B/C: 上記と同様

- T-3-10: tests/integration/mock-output/plugins/combinations/comprehensive-integration.integration.spec.ts
  - T-3-10-A/B/C: 上記と同様

- T-3-11: tests/integration/mock-output/plugins/combinations/mock-plugin-combinations.integration.spec.ts
  - T-3-11-A/B/C: 上記と同様

- T-3-12: tests/integration/mock-output/plugins/formatters/error-handling-behavior.integration.spec.ts
  - T-3-12-A/B/C: 上記と同様

- T-3-13: tests/integration/mock-output/plugins/formatters/formatter-types-behavior.integration.spec.ts
  - T-3-13-A/B/C: 上記と同様

- T-3-14: tests/integration/mock-output/utils/test-isolation-patterns.integration.spec.ts
  - T-3-14-A/B/C: 上記と同様

#### Phase 4: 低優先度（E2E Tests）

【詳細チェックリスト】

（方針）E2Eはシナリオに応じて Feature/When/Then または Given/When/Then を採用（最大3階層）

- T-4-01: tests/e2e/console-output/application-lifecycle.e2e.spec.ts
  - T-4-01-A: 構造変更・最適化
    - [ ] T-4-01-A-01: 現状構造分析（深いネストの洗い出し）
    - [ ] T-4-01-A-02: 適切な開始句選定（Feature/Given）と3階層化
    - [ ] T-4-01-A-03: Then句の記述位置最適化
  - T-4-01-B: it文言修正
    - [ ] T-4-01-B-01: 全itに Then: [正常/異常/エッジケース] を付与
  - T-4-01-C: 品質確認
    - [ ] T-4-01-C-01: 型チェック（pnpm run check:types）
    - [ ] T-4-01-C-02: テスト実行（pnpm run test:develop）

- T-4-02: tests/e2e/console-output/logger-configuration.e2e.spec.ts
  - T-4-02-A/B/C: 上記と同様

- T-4-03: tests/e2e/console-output/log-level-filtering.e2e.spec.ts
  - T-4-03-A/B/C: 上記と同様

- T-4-04: tests/e2e/console-output/output-formatting.e2e.spec.ts
  - T-4-04-A/B/C: 上記と同様

- T-4-05: tests/e2e/mock-output/debugging-scenarios.e2e.spec.ts
  - T-4-05-A/B/C: 上記と同様

- T-4-06: tests/e2e/mock-output/integration-workflows.e2e.spec.ts
  - T-4-06-A/B/C: 上記と同様

- T-4-07: tests/e2e/mock-output/monitoring-scenarios.e2e.spec.ts
  - T-4-07-A/B/C: 上記と同様

- T-4-08: tests/e2e/mock-output/test-automation-scenarios.e2e.spec.ts
  - T-4-08-A/B/C: 上記と同様

---

### ⚡ 実行手順テンプレート

#### 各タスクの実行順序

1. MCPツール分析: `mcp__serena-mcp__get_symbols_overview --relative_path "[ファイルパス]"`
2. 構造変更: describe階層の変更（Edit/MultiEditツール使用）
3. 文言修正: 全it文の一括置換（Edit/MultiEditツール使用）
4. 品質確認: テスト実行・型チェック

#### 編集作業の具体的方法

- MultiEditツール: 複数箇所の同時編集に使用
- Editツール: 単一箇所の編集に使用
- 正規表現パターン: `it\('([^']+)'\)` → `it\('Then: \[正常\] - $1'\)`

---

🎯 成功の鍵: タスクID管理 + 段階的実行 + MCPツール活用による効率化

- メンテナンス性の大幅改善

### 開発効率向上

- 新規テスト作成時のパターン統一
- レビュー効率の向上
- デバッグ時間の短縮

### ドキュメント価値向上

- テストコードが生きた仕様書として機能
- BDD形式による自然言語的な仕様記述

---

**🎯 成功の鍵**: MCPツール活用 + 段階的リファクタリング + 品質ゲート遵守
