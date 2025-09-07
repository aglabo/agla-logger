# テスト戦略とテスト階層

## テスト階層アーキテクチャ（4層）

**ag-logger** プロジェクトは包括的な4層テスト戦略を採用し、コードの品質と信頼性を確保しています。

### テスト層構成
```
1. Unit Tests      (単体テスト)     - 個別コンポーネント・関数
2. Functional Tests (機能テスト)     - フィーチャーレベル
3. Integration Tests(統合テスト)     - パッケージ間連携
4. E2E Tests       (エンドツーエンド) - 実際の使用シナリオ
```

## Vitest 設定システム

### 階層別設定ファイル
各テスト層に最適化された Vitest 設定:

```
configs/
├── vitest.config.unit.ts         # 単体テスト設定
├── vitest.config.functional.ts   # 機能テスト設定
├── vitest.config.integration.ts  # 統合テスト設定
├── vitest.config.e2e.ts         # E2E テスト設定
└── vitest.config.gha.ts         # GitHub Actions 用設定
```

### 設定例（Unit Test）
```typescript
// configs/vitest.config.unit.ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.{functional,integration,e2e}.spec.ts'],
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['**/__tests__/**']
    }
  }
})
```

## テスト実行コマンド体系

### 開発用テストコマンド
```bash
# 全パッケージ開発テスト（高速、主に unit）
pnpm run test:develop
pnpm -r run test:develop

# 個別パッケージ開発テスト
cd packages/@agla-utils/ag-logger
pnpm run test:develop
```

### CI 用テストコマンド
```bash
# 全パッケージ包括テスト（全階層）
pnpm run test:ci
pnpm -r run test:ci

# 個別パッケージ包括テスト
cd packages/@agla-utils/ag-logger
pnpm run test:ci
```

### 階層別テスト実行
```bash
cd packages/@agla-utils/ag-logger

# 単体テスト
pnpm run test:unit
pnpm exec vitest --config ./configs/vitest.config.unit.ts

# 機能テスト
pnpm run test:functional
pnpm exec vitest --config ./configs/vitest.config.functional.ts

# 統合テスト
pnpm run test:integration
pnpm exec vitest --config ./configs/vitest.config.integration.ts

# E2E テスト
pnpm run test:e2e
pnpm exec vitest --config ./configs/vitest.config.e2e.ts
```

## テスト層詳細仕様

### 1. Unit Tests（単体テスト）

#### 対象・目的
- 個別関数・クラス・コンポーネントの動作確認
- 外部依存なしの純粋な機能テスト
- 高速実行・開発サイクル最適化

#### 配置場所
```
src/__tests__/
├── *.spec.ts              # 単体テスト
├── units/                 # 単体テスト細分化
│   ├── plugins/
│   └── utils/
└── helpers/               # テスト支援ツール
```

#### テスト例
```typescript
// src/__tests__/AglaError.spec.ts
describe('AglaError', () => {
  it('should create error with message', () => {
    const error = new AglaError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.severity).toBe(ErrorSeverity.ERROR)
  })
  
  it('should chain errors properly', () => {
    const cause = new AglaError('Cause error')
    const error = new AglaError('Main error', { cause })
    expect(error.cause).toBe(cause)
  })
})
```

### 2. Functional Tests（機能テスト）

#### 対象・目的
- フィーチャーレベルの動作確認
- 複数コンポーネント連携テスト
- ユーザー視点での機能検証

#### 配置場所
```
src/__tests__/functional/
├── features/              # フィーチャー別テスト
├── internal/              # 内部機能テスト
└── *.functional.spec.ts   # 機能テスト
```

#### テスト例
```typescript
// src/__tests__/functional/AgLogger.functional.spec.ts
describe('AgLogger Functional Tests', () => {
  it('should handle complete logging workflow', () => {
    const logger = new AgLogger({
      formatter: new JsonFormatter(),
      logger: new MockLogger()
    })
    
    logger.info('Test message')
    logger.error('Error message')
    
    expect(logger.getHistory()).toHaveLength(2)
    expect(logger.getHistory()[0]).toMatchObject({
      level: 'info',
      message: 'Test message'
    })
  })
})
```

### 3. Integration Tests（統合テスト）

#### 対象・目的
- パッケージ間連携テスト
- 外部依存を含むシステムテスト
- 設定・データフロー検証

#### 配置場所
```
tests/integration/
├── mock-output/           # モック出力テスト
│   ├── core/             # コア機能統合
│   ├── plugins/          # プラグイン統合
│   └── manager/          # マネージャー統合
└── console-output/       # 実際の出力テスト
```

#### テスト例
```typescript
// tests/integration/mock-output/core/configuration-behavior.integration.spec.ts
describe('Configuration Integration', () => {
  it('should integrate configuration across components', async () => {
    const config = new AgLoggerConfig({
      level: 'debug',
      formatter: 'json'
    })
    
    const manager = new AgLoggerManager(config)
    const logger = manager.createLogger('test')
    
    logger.debug('Debug message')
    
    const history = manager.getGlobalHistory()
    expect(history).toContainEqual(
      expect.objectContaining({
        level: 'debug',
        message: 'Debug message'
      })
    )
  })
})
```

### 4. E2E Tests（エンドツーエンドテスト）

#### 対象・目的
- 実際の使用シナリオテスト
- 外部システム連携テスト
- パフォーマンス・信頼性検証

#### 配置場所
```
tests/e2e/
├── console-output/        # 実コンソール出力テスト
│   └── __helpers__/      # E2E テスト支援
├── mock-output/          # モック環境 E2E
└── application-lifecycle/ # アプリケーションライフサイクル
```

#### テスト例
```typescript
// tests/e2e/console-output/application-lifecycle.e2e.spec.ts
describe('Application Lifecycle E2E', () => {
  it('should handle complete application lifecycle', () => {
    // アプリケーション初期化
    const app = new Application()
    app.initializeLogging({
      level: 'info',
      output: 'console'
    })
    
    // 実際の使用シナリオ
    app.processData()
    app.handleErrors()
    app.shutdown()
    
    // システム全体の動作確認
    expect(app.getLogSummary()).toMatchSnapshot()
  })
})
```

## テスト実行戦略

### 開発時テスト戦略
```bash
# BDD サイクル中の高速テスト
pnpm exec vitest run src/__tests__/NewFeature.spec.ts

# Watch モードでの継続テスト
pnpm exec vitest watch --config ./configs/vitest.config.unit.ts
```

### CI/CD テスト戦略
```bash
# 段階的テスト実行
pnpm run test:unit        # 高速基本テスト
pnpm run test:functional  # フィーチャーテスト
pnpm run test:integration # システム統合テスト
pnpm run test:e2e        # 包括的 E2E テスト
```

## テストカバレッジ戦略

### カバレッジ目標
- **Unit Tests**: 90%+ 行カバレッジ
- **Functional Tests**: 主要フィーチャー 100%
- **Integration Tests**: システム境界 100%
- **E2E Tests**: クリティカルパス 100%

### カバレッジ測定
```bash
# カバレッジ付きテスト実行
pnpm test --coverage

# 詳細カバレッジレポート
pnpm test --coverage --reporter=html
```

## モックとテストダブル

### Mock 実装階層
```
src/__tests__/helpers/
├── TestAglaError.class.ts     # テスト用エラークラス
├── test-types.types.ts        # テスト型定義
└── MockLogger.ts              # ログ出力モック
```

### Mock 使用例
```typescript
// src/__tests__/helpers/MockLogger.ts
export class MockLogger implements AgLoggerInterface {
  private history: LogEntry[] = []
  
  log(level: LogLevel, message: string): void {
    this.history.push({ level, message, timestamp: new Date() })
  }
  
  getHistory(): LogEntry[] {
    return [...this.history]
  }
  
  clearHistory(): void {
    this.history = []
  }
}
```

## パフォーマンステスト

### パフォーマンス測定
```typescript
// tests/integration/mock-output/performance/high-load-behavior.integration.spec.ts
describe('Performance Tests', () => {
  it('should handle high-frequency logging', () => {
    const logger = new AgLogger()
    const startTime = performance.now()
    
    for (let i = 0; i < 10000; i++) {
      logger.info(`Message ${i}`)
    }
    
    const duration = performance.now() - startTime
    expect(duration).toBeLessThan(1000) // 1秒以内
  })
})
```

## テストデバッギング

### デバッグ実行
```bash
# 詳細出力でのテスト実行
pnpm exec vitest run --reporter=verbose src/__tests__/Problem.spec.ts

# 単一テストのデバッグ
pnpm exec vitest run --reporter=verbose --timeout=0 src/__tests__/Debug.spec.ts
```

### テストアイソレーション
```typescript
describe('Isolated Test Suite', () => {
  beforeEach(() => {
    // テスト環境初期化
    MockLogger.clearAll()
    AgLoggerConfig.resetDefaults()
  })
  
  afterEach(() => {
    // テスト後クリーンアップ
    MockLogger.clearAll()
  })
})
```

## テストパターン・規約

### Given-When-Then パターン
```typescript
it('should handle error serialization', () => {
  // Given - 前提条件
  const context: AglaErrorContext = {
    timestamp: new Date(),
    source: 'test-module'
  }
  const error = new AglaError('Test error', { context })
  
  // When - 実行
  const serialized = error.toJSON()
  
  // Then - 検証
  expect(serialized).toEqual({
    message: 'Test error',
    context: expect.objectContaining({
      source: 'test-module'
    })
  })
})
```

### テスト命名規約
- **単体テスト**: `should + 期待動作`
- **機能テスト**: `should handle + シナリオ`
- **統合テスト**: `should integrate + システム間連携`
- **E2E テスト**: `should + 完全なワークフロー`

## 継続的テスト実行

### GitHub Actions 統合
```bash
# CI 環境用テスト設定
pnpm exec vitest --config ./configs/vitest.config.gha.ts

# 並列実行最適化
pnpm exec vitest --threads=4 --config ./configs/vitest.config.unit.ts
```

### テスト結果分析
```bash
# テストレポート生成
pnpm test --reporter=json --outputFile=test-results.json

# パフォーマンス分析
pnpm test --reporter=verbose | grep "Time:"
```