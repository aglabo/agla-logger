# JSDoc追加継続作業 - Todo List

## 📋 作業概要

このドキュメントは、@aglabo/agla-loggerパッケージのJSDoc追加作業の継続実施用です。
Codexや他の開発者が引き継ぎ作業を行う際の完全な仕様書として機能します。

## 🚀 基本設定・前提条件

### 必須開発環境

```bash
# MCPツール必須使用（詳細は ../../../docs/claude/12-mcp-tools-mandatory.md 参照）
# - すべての開発段階でlsmcp・serena-mcp使用必須

# 基本開発フロー
pnpm run check:types        # 型チェック（最優先）
pnpm run test:develop       # 単体テスト
pnpm run lint:all          # コード品質チェック
pnpm run build             # デュアルビルド（ESM+CJS+Types）
```

### JSDocスタイルガイド

````typescript
/**
 * 関数・メソッドの簡潔な説明（1行）
 *
 * より詳細な説明が必要な場合はここに記述。
 * 複数行にわたる場合は適切に段落分けする。
 *
 * @param paramName - パラメータの説明
 * @param optionalParam - オプションパラメータの説明 (optional)
 * @returns 戻り値の説明
 * @throws ErrorType エラーの説明
 * @example
 * ```typescript
 * const result = functionName(param1, param2);
 * ```
 */
````

## 🔴 Phase 1: 高優先度タスク（Public Exports）

### Phase 1A: src/AgManagerUtils.ts

- [ ] `JSDoc-001` AgManager変数にJSDoc追加 (line: 27)
  ```typescript
  // 現在: export let AgManager: AgLoggerManager | undefined;
  // 要追加JSDoc: マネージャーインスタンスの一元管理変数の説明
  ```

### Phase 1B: src/utils/AgLogValidators.ts

- [ ] `JSDoc-002` isValidLogLevel関数にJSDoc追加 (line: 27)
  ```typescript
  // 現在: export const isValidLogLevel = (logLevel: unknown): logLevel is AgLogLevel
  // 要追加JSDoc: 型ガード関数の説明、パラメータ・戻り値説明
  ```

- [ ] `JSDoc-003` isAgMockConstructor関数にJSDoc追加 (line: 173)
  ```typescript
  // 現在: export const isAgMockConstructor = (value: unknown): value is AgMockConstructor
  // 要追加JSDoc: モックコンストラクタ判定の説明、型ガード説明
  ```

### Phase 1C: src/plugins/formatter/ErrorThrowFormatter.ts

- [ ] `JSDoc-004` ErrorThrowFormatterクラスにJSDoc追加 (line: 21)
  ```typescript
  // 現在: export class ErrorThrowFormatter extends AgMockFormatter
  // 要追加JSDoc: 動的エラーメッセージ対応フォーマッタの説明、継承関係説明
  ```

### Phase 1D: src/plugins/logger/MockLogger.ts

- [ ] `JSDoc-005` AgMockBufferLoggerクラスにJSDoc追加 (line: 41)
  ```typescript
  // 現在: export class AgMockBufferLogger implements AgLoggerMethodsInterface
  // 要追加JSDoc: ユニバーサルモックロガーの説明、インターフェース実装説明
  ```

- [ ] `JSDoc-006` fatalメソッドにJSDoc追加
  ```typescript
  // 対象: fatal(formattedLogMessage: AgFormattedLogMessage): void
  // 要追加JSDoc: FATALレベルログメッセージの受信処理説明
  ```

- [ ] `JSDoc-007` errorメソッドにJSDoc追加
  ```typescript
  // 対象: error(formattedLogMessage: AgFormattedLogMessage): void
  // 要追加JSDoc: ERRORレベルログメッセージの受信処理説明
  ```

- [ ] `JSDoc-008` warnメソッドにJSDoc追加
  ```typescript
  // 対象: warn(formattedLogMessage: AgFormattedLogMessage): void
  // 要追加JSDoc: WARNレベルログメッセージの受信処理説明
  ```

- [ ] `JSDoc-009` infoメソッドにJSDoc追加
  ```typescript
  // 対象: info(formattedLogMessage: AgFormattedLogMessage): void
  // 要追加JSDoc: INFOレベルログメッセージの受信処理説明
  ```

- [ ] `JSDoc-010` debugメソッドにJSDoc追加
  ```typescript
  // 対象: debug(formattedLogMessage: AgFormattedLogMessage): void
  // 要追加JSDoc: DEBUGレベルログメッセージの受信処理説明
  ```

- [ ] `JSDoc-011` traceメソッドにJSDoc追加
  ```typescript
  // 対象: trace(formattedLogMessage: AgFormattedLogMessage): void
  // 要追加JSDoc: TRACEレベルログメッセージの受信処理説明
  ```

- [ ] `JSDoc-012` logメソッドにJSDoc追加
  ```typescript
  // 対象: log(formattedLogMessage: AgFormattedLogMessage): void
  // 要追加JSDoc: LOGレベルログメッセージの受信処理説明
  ```

- [ ] `JSDoc-013` verboseメソッドにJSDoc追加
  ```typescript
  // 対象: verbose(formattedLogMessage: AgFormattedLogMessage): void
  // 要追加JSDoc: VERBOSEレベルログメッセージの受信処理説明
  ```

**Phase 1 進捗**: 0/13 完了 (0%)

## 🔶 Phase 2: 中優先度タスク（Internal Implementations）

### Phase 2A: src/internal/AgLoggerConfig.class.ts

- [ ] `JSDoc-014` fillNullLoggerメソッドにJSDoc追加 (line: ~100)
  ```typescript
  // 対象: private fillNullLogger(): void
  // 要追加JSDoc: ロガーマップの初期化処理、セキュリティ目的説明
  ```

- [ ] `JSDoc-015` setLoggerMapメソッドにJSDoc追加 (line: ~374)
  ```typescript
  // 対象: setLoggerMap(map: Partial<AgLoggerMap>): void
  // 要追加JSDoc: ロガーマップの部分更新処理、パラメータ検証説明
  ```

- [ ] `JSDoc-016` setLoggerAtメソッドにJSDoc追加 (line: ~402)
  ```typescript
  // 対象: setLoggerAt(level: AgLogLevel, loggerFunction: AgLoggerFunction): void
  // 要追加JSDoc: 特定ログレベルのロガー関数設定、検証処理説明
  ```

### Phase 2B: src/plugins/formatter/MockFormatter.ts

- [ ] `JSDoc-017` createMockFormatterファクトリにJSDoc追加 (line: 28)
  ```typescript
  // 対象: export const createMockFormatter = (formatRoutine: AgFormatRoutine): AgMockConstructor
  // 要追加JSDoc: カリー化されたファクトリ関数の説明、カスタムルーチン説明
  ```

### Phase 2C: src/utils/AgLoggerMethod.ts

- [ ] `JSDoc-018` LoggerMethod型定義にJSDoc追加 (line: 18)
  ```typescript
  // 対象: type LoggerMethod = (message: AgFormattedLogMessage) => void;
  // 要追加JSDoc: ロガーメソッドの型定義、用途説明
  ```

- [ ] `JSDoc-019` bindLoggerMethods関数にJSDoc追加 (line: 59)
  ```typescript
  // 対象: export const bindLoggerMethods = <T extends Partial<AgLoggerMethodsInterface>>(instance: T): T
  // 要追加JSDoc: ロガーメソッドのバインディング処理、ジェネリック説明
  ```

### Phase 2D: src/utils/AgLogHelpers.ts

- [ ] `JSDoc-020` shouldIncludeInMessage関数にJSDoc追加 (line: ~49)
  ```typescript
  // 対象: shouldIncludeInMessage関数（重複チェック要）
  // 要追加JSDoc: メッセージ含有判定の説明、プリミティブ型判定説明
  ```

**Phase 2 進捗**: 0/7 完了 (0%)

## 🔵 Phase 3: 低優先度タスク（Utilities）

### Phase 3A: src/functional/core/parseArgsToAgLogMessage.ts

- [ ] `JSDoc-021` shouldIncludeInMessage関数にJSDoc追加 (line: 21)
  ```typescript
  // 対象: shouldIncludeInMessage(arg: unknown): arg is string | number | boolean
  // 要追加JSDoc: メッセージ引数判定の説明、プリミティブ型フィルタリング説明
  ```

- [ ] `JSDoc-022` isValidTimestamp関数にJSDoc追加 (line: 33)
  ```typescript
  // 対象: isValidTimestamp(arg: unknown): arg is string
  // 要追加JSDoc: タイムスタンプ検証の説明、ISO形式・カスタム形式対応説明
  ```

### Phase 3B: src/plugins/logger/E2eMockLogger.ts

- [ ] `JSDoc-023` protectedメソッド群にJSDoc追加
  ```typescript
  // 対象: 各ログレベル専用のprotectedメソッド群
  // 要追加JSDoc: E2E並列テスト対応の説明、testId分離説明
  ```

**Phase 3 進捗**: 0/3 完了 (0%)

## 📊 総合進捗管理

### 統計情報

- **総タスク数**: 23タスク
- **完了済み**: 0タスク (0%)
- **Phase 1 (高優先度)**: 0/13 完了 (0%)
- **Phase 2 (中優先度)**: 0/7 完了 (0%)
- **Phase 3 (低優先度)**: 0/3 完了 (0%)

### フェーズ別品質ゲート

#### Phase 1 完了後の必須チェック

```bash
pnpm run check:types        # 型チェック（必須）
pnpm run lint:all          # コード品質チェック
pnpm run test:develop       # 単体テスト実行
```

#### Phase 2 完了後の必須チェック

```bash
pnpm run check:types        # 型チェック（必須）
pnpm run test:functional    # 機能テスト実行
```

#### Phase 3 完了後の最終チェック

```bash
pnpm run check:types        # 型チェック（必須）
pnpm run test:all          # 全テスト実行
pnpm run build             # ビルド確認
```

## 🔧 実装ガイドライン

### 1. ファイル編集制限

- ❌ **編集禁止**: `lib/`, `module/`, `maps/`, `.cache/`
- ✅ **編集対象**: `src/`, `configs/`, `__tests__/`, `tests/`

### 2. JSDoc品質基準

- **必須**: 関数・クラスの目的説明
- **必須**: @param, @returns の説明（該当する場合）
- **推奨**: @throws（エラーを投げる場合）
- **オプション**: @example（複雑な関数の場合）

### 3. 作業順序

1. Phase 1（高優先度）から順次実施
2. 各Phase完了後、品質ゲート実行
3. エラーが発生した場合は即座に修正

### 4. MCPツール活用

#### コード分析用コマンド

```bash
# ファイルのシンボル概要確認
mcp__serena-mcp__get_symbols_overview --relative_path "[ファイルパス]"

# 特定シンボルの詳細確認
mcp__serena-mcp__find_symbol --name_path "[シンボルパス]" --relative_path "[ファイルパス]" --include_body true

# JSDocパターン検索
mcp__serena-mcp__search_for_pattern --substring_pattern "\/\*\*" --relative_path "[ファイルパス]"
```

#### 編集用コマンド

```bash
# シンボル置換
mcp__serena-mcp__replace_symbol_body --name_path "[シンボルパス]" --relative_path "[ファイルパス]" --body "[新しいコード]"

# シンボル前に挿入（JSDoc追加）
mcp__serena-mcp__insert_before_symbol --name_path "[シンボルパス]" --relative_path "[ファイルパス]" --body "[JSDocコメント]"
```

## 📝 引き継ぎ情報

### Codex向け設定

- **プロジェクト**: @aglabo/agla-logger JSDoc追加
- **アーキテクチャ**: Strategy Pattern + Singleton Pattern
- **テスト**: 4層テストアーキテクチャ（Unit/Functional/Integration/E2E）
- **ビルド**: デュアルESM/CommonJS対応

### 完了時のアクション

- [ ] 本todo.mdの進捗更新
- [ ] 最終品質チェック実行
- [ ] プルリクエスト作成準備
- [ ] 親プロジェクト文書への反映検討

### 注意事項

- **シングルトンパターン**: AgLogger, AgLoggerManagerでの状態管理
- **プラグインシステム**: Formatter/Logger戦略パターン
- **AglaErrorシステム**: エラーハンドリング統合
- **型安全性**: TypeScript strict mode必須

---

**🎯 継続作業の成功の鍵**: フェーズ別段階実施 + 品質ゲート遵守 + MCPツール活用 + 23タスクの体系的管理
