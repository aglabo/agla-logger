# ソースコードテンプレート統一ルール

このドキュメントは、ag-loggerプロジェクトにおけるソースコードテンプレートの統一ルールを定義します。

## 🎯 基本方針

### コード統一性の確保

**全ソースファイルで統一されたヘッダー・import・型定義・定数定義パターンを使用し、保守性・可読性を最大化する。**

- **ファイルヘッダー**: 機能説明・著作権・ライセンスの統一形式
- **import分類**: 7グループ分類による明確な依存関係表現
- **型定義**: 内部型・外部型の明確な分離
- **定数定義**: const assertions・readonly使用の徹底

## 📝 ファイルヘッダーテンプレート

### クラス定義ファイル（*.class.ts）

```typescript
// src: /src/[ファイルパス]
// @(#) : [クラス名] [機能概要説明]
//
// [詳細説明（複数行可）]
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
```

### ユーティリティ関数ファイル（utils/*.ts）

```typescript
// src: /src/utils/[ファイル名]
// @(#) : [機能名] [機能概要]
//
// [詳細説明]
// [主要機能リスト]
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
```

### 型定義ファイル（*.types.ts）

```typescript
// src: /shared/types/[ファイル名]
// @(#) : [型名] Type Definitions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
```

### 定数定義ファイル（*.constants.ts）

```typescript
// src: /shared/constants/[ファイル名]
// @(#) : [定数グループ名] Constants for [用途]
//
// [定数の目的・用途説明]
// [利用シーン説明]
//
// Exports:
// - [定数1]: [説明]
// - [定数2]: [説明]
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
```

## 📦 import文統一ルール（7グループ分類）

### 基本構造

**全TypeScriptファイルでimport文を以下の7グループに分類し、日本語説明コメントを必ず付与:**

```typescript
// グループ1: Node.js標準モジュール
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';

// グループ2: 外部ライブラリ
import { ErrorSeverity } from '@aglabo/agla-error';
import { describe, expect, it, vi } from 'vitest';

// グループ3: 型定義・インターフェース
import { AG_LOGLEVEL } from '../shared/types';
import type { AgLogLevel } from '../shared/types';
import type { AgFormatFunction, AgLoggerOptions } from '../shared/types/AgLogger.interface';
import { AgLoggerError } from '../shared/types/AgLoggerError.types';

// グループ4: 定数・設定・エラーメッセージ
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../shared/constants/agErrorMessages';
import { DISABLE, ENABLE } from '../shared/constants/common.constants';

// グループ5: 内部実装・コアクラス
import { AgLogger } from './AgLogger.class';
import { AgLoggerManager } from './AgLoggerManager.class';
import { AgLoggerConfig } from './internal/AgLoggerConfig.class';

// グループ6: プラグインシステム
import type { AgMockFormatter } from './plugins/formatter/AgMockFormatter';
import { JsonFormatter } from './plugins/formatter/JsonFormatter';
import { ConsoleLogger, ConsoleLoggerMap } from './plugins/logger/ConsoleLogger';
import { MockLogger } from './plugins/logger/MockLogger';

// グループ7: ユーティリティ・ヘルパー関数
import { AgLoggerGetMessage } from './utils/AgLoggerGetMessage';
import { AgToLabel, argsToString } from './utils/AgLogHelpers';
import { isStandardLogLevel, validateFormatter, validateLogLevel } from './utils/AgLogValidators';
```

### グループ分類詳細

#### グループ1: Node.js標準モジュール

```typescript
// Node.js標準モジュール: ランタイム組み込み機能
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
```

#### グループ2: 外部ライブラリ

```typescript
// 外部ライブラリ: npm/pnpmパッケージ
import { ErrorSeverity } from '@aglabo/agla-error';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
```

#### グループ3: 型定義・インターフェース

```typescript
// 型定義・インターフェース: TypeScript型システム
import { AG_LOGLEVEL } from '../shared/types';
import type { AgFormatFunction, AgLoggerOptions } from '../shared/types/AgLogger.interface';
import { AgLoggerError } from '../shared/types/AgLoggerError.types';
import type { AgLogLevel } from '../shared/types/AgLogLevel.types';
```

**重要ルール:**

- `import type` を優先使用
- 型のみ使用の場合は `type` キーワード必須
- `types` ディレクトリからのインポートをこのグループに集約

#### グループ4: 定数・設定・エラーメッセージ

```typescript
// 定数・設定・エラーメッセージ: 設定値・定数定義
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../shared/constants/agErrorMessages';
import { DISABLE, ENABLE } from '../shared/constants/common.constants';
import { CONFIG_DEFAULTS } from '../shared/constants/config.constants';
```

#### グループ5: 内部実装・コアクラス

```typescript
// 内部実装・コアクラス: プロジェクト中核機能
import { AgLogger } from './AgLogger.class';
import { AgLoggerManager } from './AgLoggerManager.class';
import { AgLoggerConfig } from './internal/AgLoggerConfig.class';
```

#### グループ6: プラグインシステム

```typescript
// プラグインシステム: 拡張可能機能・Strategy Pattern実装
import type { AgMockFormatter } from './plugins/formatter/AgMockFormatter';
import { JsonFormatter, PlainFormatter } from './plugins/formatter/JsonFormatter';
import { ConsoleLogger, ConsoleLoggerMap } from './plugins/logger/ConsoleLogger';
import { MockLogger, NullLogger } from './plugins/logger/MockLogger';
```

#### グループ7: ユーティリティ・ヘルパー関数

```typescript
// ユーティリティ・ヘルパー関数: 汎用機能・補助関数
import { AgLoggerGetMessage } from './utils/AgLoggerGetMessage';
import { AgToLabel, argsToString } from './utils/AgLogHelpers';
import { isStandardLogLevel, validateFormatter, validateLogLevel } from './utils/AgLogValidators';
```

### テストファイル特有パターン

```typescript
// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '@shared/types';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';

// プラグイン（ロガー）: 出力先実装
import { MockLogger } from '@/plugins/logger/MockLogger';

// テストヘルパー: テスト支援機能
import { createTestId, resetTestState } from '@/utils/testHelpers';
```

### import文重要ルール

1. **各グループ間に空行必須**
2. **日本語コメント必須** - 各グループの目的明確化
3. **type import優先** - 型のみ使用時は `import type` 使用
4. **相対パス統一** - `../shared/`, `./plugins/` 等の一貫性
5. **アルファベット順** - 同一グループ内では名前順ソート

## 🏷️ 内部型定義テンプレート

### インターフェース定義

````typescript
/**
 * [インターフェース名]の説明
 *
 * @description [詳細説明]
 * @example
 * ```typescript
 * const example: InterfaceName = {
 *   property: 'value'
 * };
 * ```
 */
interface InternalInterface {
  readonly property: string;
  optionalProperty?: number;
  method(param: string): boolean;
}
````

### 型エイリアス

```typescript
/**
 * [型名]の型エイリアス定義
 *
 * @description [用途・制約説明]
 */
type InternalType = string | number | boolean;

/**
 * 条件付き型の例
 */
type ConditionalType<T> = T extends string ? StringHandler : DefaultHandler;
```

### ジェネリック型パラメータ

```typescript
/**
 * ジェネリック関数・クラスの型パラメータ定義
 *
 * @template T - [T型パラメータの説明]
 * @template K - [K型パラメータの説明・制約]
 */
interface GenericInterface<T, K extends keyof T> {
  data: T;
  key: K;
  getValue(): T[K];
}
```

### ユニオン型・リテラル型

```typescript
/**
 * 文字列リテラル型の定義
 */
type LogLevelString = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * 複雑なユニオン型
 */
type ConfigValue =
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean };
```

## 🔢 定数定義テンプレート

### const assertions使用

```typescript
/**
 * const assertionを使用した不変オブジェクト定義
 */
const CONFIG_DEFAULTS = {
  logLevel: AG_LOGLEVEL.INFO,
  enabled: true,
  format: 'json',
} as const;

/**
 * const assertionを使用した配列定義
 */
const SUPPORTED_FORMATS = ['json', 'plain', 'xml'] as const;
```

### readonly配列・オブジェクト

```typescript
/**
 * readonly配列の定義
 */
const LOG_LEVELS: readonly AgLogLevel[] = [
  AG_LOGLEVEL.TRACE,
  AG_LOGLEVEL.DEBUG,
  AG_LOGLEVEL.INFO,
  AG_LOGLEVEL.WARN,
  AG_LOGLEVEL.ERROR,
  AG_LOGLEVEL.FATAL,
] as const;

/**
 * 深いreadonlyオブジェクト
 */
interface ReadonlyConfig {
  readonly database: {
    readonly host: string;
    readonly port: number;
    readonly options: readonly string[];
  };
}
```

### 列挙型的定数オブジェクト

```typescript
/**
 * 列挙型代替の定数オブジェクト定義
 *
 * @description TypeScript enumより型安全な定数定義パターン
 */
const ERROR_TYPES = {
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
} as const;

type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];
```

### マジックナンバー/文字列の定数化

```typescript
/**
 * マジックナンバーの定数化
 */
const CONSTANTS = {
  DEFAULT_TIMEOUT: 5000,
  MAX_RETRY_COUNT: 3,
  BUFFER_SIZE: 1024,
} as const;

/**
 * マジック文字列の定数化
 */
const MESSAGE_TEMPLATES = {
  USER_LOGIN: 'User {userId} logged in from {ip}',
  ERROR_OCCURRED: 'Error occurred in {module}: {message}',
  SYSTEM_READY: 'System initialized successfully',
} as const;
```

## 📚 クラス/関数ヘッダーコメント

### クラスヘッダー

````typescript
/**
 * [クラス名] - [一行概要]
 *
 * @description [詳細説明・責務・使用パターン]
 *
 * @template T - [型パラメータ説明]
 *
 * @example
 * ```typescript
 * const instance = new ClassName(options);
 * const result = instance.method();
 * ```
 *
 * @see [関連クラス・ドキュメント]
 */
export class ClassName<T> {
````

### 関数ヘッダー

````typescript
/**
 * [関数名] - [一行概要]
 *
 * @description [詳細説明・アルゴリズム・注意点]
 *
 * @param param1 - [パラメータ1の説明]
 * @param param2 - [パラメータ2の説明・制約]
 * @returns [戻り値の説明・型]
 *
 * @throws {AgLoggerError} [例外発生条件]
 *
 * @example
 * ```typescript
 * const result = functionName(value1, value2);
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 *
 * @since [バージョン情報]
 */
export function functionName(param1: string, param2?: number): Result<Data> {
````

### メソッドヘッダー

````typescript
/**
 * [メソッド名] - [一行概要]
 *
 * @description [詳細説明・副作用・状態変更]
 *
 * @param param - [パラメータ説明]
 * @returns [戻り値説明]
 *
 * @throws {AgLoggerError} [例外条件]
 *
 * @example
 * ```typescript
 * const logger = AgLogger.getInstance();
 * logger.methodName(value);
 * ```
 */
public methodName(param: Type): ReturnType {
````

## ⚠️ 重要ルール・制約事項

### 必須遵守事項

1. **ファイルヘッダー必須**
   - 全ソースファイルで機能説明・著作権・ライセンス表示必須
   - 著作権年は 2025、ライセンスは MIT で統一

2. **import分類厳守**
   - 7グループ分類の完全遵守
   - グループ間空行・日本語コメント必須
   - `type import` の優先使用

3. **型定義の明確化**
   - `readonly`, `const assertions` の積極活用
   - ジェネリック型パラメータの詳細説明
   - ユニオン型の明確な用途説明

4. **JSDoc完全性**
   - 全public関数・クラス・メソッドにJSDoc必須
   - 例外処理・使用例の記述必須

### 禁止事項

1. **ヘッダー省略** - 全ファイルで必須
2. **import順序違反** - 7グループ分類以外での整理
3. **型安全性違反** - `any` 使用・型ガード省略
4. **マジックナンバー使用** - 定数定義せずの直接使用

## 🔧 実装確認コマンド

### テンプレート準拠確認

```bash
# ファイルヘッダー確認
mcp__serena-mcp__search_for_pattern --substring_pattern "// src:.*@\\(#\\)" --relative_path "src" --restrict_search_to_code_files true

# import分類確認
mcp__serena-mcp__search_for_pattern --substring_pattern "// グループ\\d+:" --relative_path "src" --restrict_search_to_code_files true

# 型定義パターン確認
mcp__serena-mcp__search_for_pattern --substring_pattern "as const|readonly|import type" --relative_path "src" --restrict_search_to_code_files true
```

### 品質チェック

```bash
# TypeScript型チェック
pnpm run check:types

# ESLint品質チェック
pnpm run lint:all

# フォーマットチェック
pnpm run check:dprint
```

---

**重要**: このテンプレートはag-loggerプロジェクトの**コード品質・一貫性・保守性**確保のため必須遵守。

**参照**:

- [BDD階層構造ルール](./bdd-test-hierarchy.md)
- [JSDoc describeブロックルール](./jsdoc-describe-blocks.md)
- [todo.md タスク管理ルール](./todo-task-management.md)
