---
header:
  - src: 08-test-implementation.md
  - @(#): Test Implementation and BDD Hierarchy
title: agla-logger
description: AIコーディングエージェント向けテスト実装・BDD階層構造ガイド
version: 1.0.0
created: 2025-09-27
authors:
  - atsushifx
changes:
  - 2025-09-27: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## テスト実装・BDD階層構造

このドキュメントはAIコーディングエージェントがagla-loggerプロジェクトでテスト実装する際のBDD階層構造ガイドを提供します。
一貫したテスト品質と保守性を確保することを目的とします。

## BDD階層構造統一ルール

### 3階層BDD構造の厳格遵守

🔴 **必須**: 以下の階層構造を必ず適用

```typescript
describe('Given: 前提条件/Feature', () => {
  describe('When: 条件/動作', () => {
    test('Then: 期待結果', () => {
      // Arrange (Given詳細)
      // Act (When詳細)
      // Assert (Then詳細)
    });
  });
});
```

### 階層命名規則

- **Level 1 (Feature)**: `"機能名"` または `"Given: 前提条件"`
- **Level 2 (Context)**: `"When: 動作・条件"`
- **Level 3 (Specification)**: `"Then: 期待結果"`

### JSDoc必須記述

```typescript
/**
 * @fileoverview 機能名のテストスイート
 * @context Given - 前提条件の説明
 */

describe('機能名', () => {
  /**
   * @context When - 動作・条件の説明
   */
  describe('When: 動作', () => {
    /**
     * @context Then - 期待結果の説明
     */
    test('Then: 結果', () => {
      // テスト実装
    });
  });
});
```

## 4層テスト戦略実装

### テスト階層アーキテクチャ

```bash
__tests__/          # テストルートディレクトリ
├── unit/          # Unit tests (27ファイル)
│   ├── core/      # コア機能
│   ├── utils/     # ユーティリティ
│   └── types/     # 型定義
├── functional/    # Functional tests (4ファイル)
│   ├── logging/   # ログ機能
│   └── config/    # 設定機能
tests/             # 統合・E2Eテスト
├── integration/   # Integration tests (14ファイル)
│   ├── system/    # システム統合
│   └── external/  # 外部連携
└── e2e/          # E2E tests (8ファイル)
    ├── complete/  # 完全シナリオ
    └── workflow/  # ワークフロー
```

### 各層の実装ガイドライン

#### Unit Test実装

```typescript
/**
 * @fileoverview AgLoggerコアクラスのUnit Test
 * @context Given - AgLoggerクラスの基本機能
 */

describe('AgLogger', () => {
  /**
   * @context When - ログレベル判定
   */
  describe('When: ログレベルを判定', () => {
    /**
     * @context Then - 正しい判定結果を返す
     */
    test('Then: 有効なレベルでtrue', () => {
      // Arrange
      const logger = new AgLogger({ level: LogLevel.INFO });

      // Act
      const result = logger.isLevelEnabled(LogLevel.INFO);

      // Assert
      expect(result).toBe(true);
    });

    test('Then: 無効なレベルでfalse', () => {
      // Arrange
      const logger = new AgLogger({ level: LogLevel.WARN });

      // Act
      const result = logger.isLevelEnabled(LogLevel.DEBUG);

      // Assert
      expect(result).toBe(false);
    });
  });
});
```

#### Functional Test実装

```typescript
/**
 * @fileoverview ログ出力機能のFunctional Test
 * @context Given - ログ出力システム全体
 */

describe('Logging Functionality', () => {
  /**
   * @context When - 複数形式でログ出力
   */
  describe('When: 異なる形式でログ出力', () => {
    /**
     * @context Then - 各出力先に適切に配信
     */
    test('Then: コンソール・ファイル両方に出力', async () => {
      // Arrange
      const consoleOutput = new MockConsoleOutput();
      const fileOutput = new MockFileOutput();
      const logger = new AgLogger({
        outputs: [consoleOutput, fileOutput],
      });

      // Act
      await logger.info('test message');

      // Assert
      expect(consoleOutput.messages).toContain('test message');
      expect(fileOutput.messages).toContain('test message');
    });
  });
});
```

#### Integration Test実装

```typescript
/**
 * @fileoverview システム統合テスト
 * @context Given - agla-loggerとagla-error連携システム
 */

describe('System Integration', () => {
  /**
   * @context When - エラーハンドリングとログの連携
   */
  describe('When: AglaErrorとログシステム連携', () => {
    /**
     * @context Then - エラー情報が適切にログ出力
     */
    test('Then: エラー詳細がストラクチャードログで出力', () => {
      // Arrange
      const logger = createSystemLogger();
      const error = new AglaError('TEST_ERROR', 'Test error message');

      // Act
      logger.error('System error occurred', { error });

      // Assert
      expect(mockOutput.lastMessage).toMatchObject({
        level: 'ERROR',
        message: 'System error occurred',
        error: {
          code: 'TEST_ERROR',
          message: 'Test error message',
        },
      });
    });
  });
});
```

#### E2E Test実装

```typescript
/**
 * @fileoverview 完全ワークフローE2Eテスト
 * @context Given - 本番環境と同等のシステム構成
 */

describe('Complete Workflow E2E', () => {
  /**
   * @context When - アプリケーション起動から終了まで
   */
  describe('When: アプリケーション完全ライフサイクル', () => {
    /**
     * @context Then - 全ログが適切に処理・保存
     */
    test('Then: 起動ログから終了ログまで完全記録', async () => {
      // Arrange
      const app = await createTestApplication();

      // Act
      await app.start();
      await app.processData('test data');
      await app.shutdown();

      // Assert
      const logFile = await readLogFile();
      expect(logFile).toContain('Application started');
      expect(logFile).toContain('Processing: test data');
      expect(logFile).toContain('Application shutdown');
    });
  });
});
```

## テスト実装のMCPツール活用

### 既存テストパターン調査

```bash
# 類似テストの検索
mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*Logger" --relative_path "__tests__" --restrict_search_to_code_files true

# テスト構造の詳細確認
mcp__serena-mcp__find_symbol --name_path "テストスイート名" --include_body true --relative_path "__tests__"

# モックパターンの確認
mcp__serena-mcp__search_for_pattern --substring_pattern "Mock.*Output" --relative_path "__tests__" --restrict_search_to_code_files true
```

### テスト対象の理解

```bash
# 実装クラスの詳細確認
mcp__serena-mcp__find_symbol --name_path "AgLogger" --include_body true --relative_path "src"

# インターフェース・契約の確認
mcp__lsmcp__search_symbols --kind ["Interface"] --query "AgLogger" --root "$ROOT"

# 依存関係の確認
mcp__lsmcp__lsp_find_references --symbolName "AgLogger" --relativePath "src/core/aglogger.ts"
```

## テストユーティリティ・ヘルパー

### 共通テストユーティリティ

```typescript
// __tests__/utils/test-helpers.ts

/**
 * テスト用AgLoggerインスタンス作成
 */
export function createTestLogger(config?: Partial<AgLoggerConfig>): AgLogger {
  return new AgLogger({
    level: LogLevel.DEBUG,
    formatter: new TestFormatter(),
    outputs: [new MockOutput()],
    ...config,
  });
}

/**
 * 非同期ログ出力の完了待機
 */
export async function waitForLogCompletion(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 10));
}

/**
 * ログメッセージ検証ヘルパー
 */
export function expectLogMessage(
  output: MockOutput,
  level: LogLevel,
  message: string,
): void {
  expect(output.messages).toContainEqual(
    expect.objectContaining({
      level: level.toString(),
      message: expect.stringContaining(message),
    }),
  );
}
```

### モック・スタブ実装

```typescript
// __tests__/mocks/mock-output.ts

export class MockOutput implements AgOutput {
  public messages: LogMessage[] = [];

  write(message: LogMessage): void {
    this.messages.push(message);
  }

  clear(): void {
    this.messages = [];
  }

  getLastMessage(): LogMessage | undefined {
    return this.messages[this.messages.length - 1];
  }

  hasMessage(predicate: (msg: LogMessage) => boolean): boolean {
    return this.messages.some(predicate);
  }
}
```

## エラーテスト実装

### AglaError連携テスト

```typescript
describe('Error Handling', () => {
  describe('When: AglaErrorが発生', () => {
    test('Then: エラー詳細がログに記録', () => {
      // Arrange
      const logger = createTestLogger();
      const error = new AglaError('CONFIG_ERROR', 'Invalid configuration');

      // Act
      logger.error('Configuration failed', { error });

      // Assert
      const output = logger.outputs[0] as MockOutput;
      expectLogMessage(output, LogLevel.ERROR, 'Configuration failed');
      expect(output.getLastMessage()).toMatchObject({
        error: {
          code: 'CONFIG_ERROR',
          message: 'Invalid configuration',
        },
      });
    });
  });
});
```

### Result型テスト

```typescript
describe('Result Type Integration', () => {
  describe('When: Result<T, AglaError>を処理', () => {
    test('Then: 成功時は値をログ', () => {
      // Arrange
      const logger = createTestLogger();
      const result = ok('success value');

      // Act
      result.map((value) => logger.info(`Success: ${value}`));

      // Assert
      const output = logger.outputs[0] as MockOutput;
      expectLogMessage(output, LogLevel.INFO, 'Success: success value');
    });

    test('Then: 失敗時はエラーをログ', () => {
      // Arrange
      const logger = createTestLogger();
      const result = err(new AglaError('PROCESS_ERROR', 'Process failed'));

      // Act
      result.mapErr((error) => logger.error('Process error', { error }));

      // Assert
      const output = logger.outputs[0] as MockOutput;
      expectLogMessage(output, LogLevel.ERROR, 'Process error');
    });
  });
});
```

## パフォーマンステスト

### ログ出力性能測定

```typescript
describe('Performance', () => {
  describe('When: 大量ログ出力', () => {
    test('Then: 指定時間内で処理完了', async () => {
      // Arrange
      const logger = createTestLogger();
      const messageCount = 10000;
      const maxDuration = 1000; // 1秒

      // Act
      const startTime = Date.now();
      for (let i = 0; i < messageCount; i++) {
        logger.info(`Message ${i}`);
      }
      await waitForLogCompletion();
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(maxDuration);
      const output = logger.outputs[0] as MockOutput;
      expect(output.messages).toHaveLength(messageCount);
    });
  });
});
```

## テスト実行・品質確認

### テスト実行コマンド

```bash
# 開発用高速テスト
pnpm run test:develop

# 包括的テスト
pnpm run test:ci

# カバレッジ付きテスト
pnpm run test:coverage

# 特定層のテスト
pnpm run test:unit
pnpm run test:functional
pnpm run test:integration
pnpm run test:e2e
```

### テスト品質確認

```bash
# テスト構造確認
mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*When.*Then" --relative_path "__tests__"

# BDD階層構造確認
mcp__serena-mcp__search_for_pattern --substring_pattern "@context" --relative_path "__tests__"
```

---

### See Also

- [01-core-principles.md](01-core-principles.md) - AI開発核心原則
- [02-bdd-workflow.md](02-bdd-workflow.md) - BDD開発フロー詳細
- [05-quality-assurance.md](05-quality-assurance.md) - 品質ゲート詳細

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Copyright (c) 2025 atsushifx
