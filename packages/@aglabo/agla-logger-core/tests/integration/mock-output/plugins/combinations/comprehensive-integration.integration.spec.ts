// tests/integration/mock-output/plugins/combinations/aglogger-e2e-integration.integration.spec.ts
// @(#) : AgLogger E2eMockLogger Integration Tests - AgLogger and E2eMockLogger system integration
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '@shared/types';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// プラグイン（ロガー）: E2E実装
import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';

// Test Utilities

/**
 * テストモックを作成 - E2eMockLogger使用
 */
const setupTest = (ctx: TestContext): { mockLogger: E2eMockLogger } => {
  vi.clearAllMocks();
  AgLogger.resetSingleton();

  const mockLogger = new E2eMockLogger('aglogger-e2e-integration');
  mockLogger.startTest(ctx.task.id);

  ctx.onTestFinished(() => {
    mockLogger.endTest();
    AgLogger.resetSingleton();
    vi.clearAllMocks();
  });

  return {
    mockLogger,
  };
};

/**
 * @suite Mock Output Comprehensive Integration | Integration
 * @description AgLoggerとE2eMockLoggerのシステム間連携統合動作を保証するテスト
 * @testType integration
 * Scenarios: システム統合基本操作, 複雑データ処理, JSON出力統合, 高負荷処理, ログレベル管理
 */
describe('Mock Output Comprehensive Integration', () => {
  /**
   * @context Given
   * @scenario システム統合基本操作
   * @description 完全なシステム統合シナリオが存在する場合のテスト
   */
  describe('Given complete system integration scenarios', () => {
    /**
     * @context When
     * @scenario PlainFormatter基本操作統合
     * @description PlainFormatterを使用した基本操作実行時のテスト
     */
    describe('When using plain formatter with basic operations', () => {
      it('Then: [正常] - should integrate formatting with data handling seamlessly', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Act
        logger.info('Integration test message');
        logger.warn('Warning message');
        logger.error('Error message');

        // Assert - counts
        const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
        const warnMessages = mockLogger.getMessages(AG_LOGLEVEL.WARN);
        const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);

        expect(infoMessages).toHaveLength(1);
        expect(warnMessages).toHaveLength(1);
        expect(errorMessages).toHaveLength(1);

        // Assert - contents
        expect(infoMessages[0]).toMatch(/\[INFO\] Integration test message$/);
        expect(warnMessages[0]).toMatch(/\[WARN\] Warning message$/);
        expect(errorMessages[0]).toMatch(/\[ERROR\] Error message$/);
      });
    });

    /**
     * @context When
     * @scenario 複雑データ処理統合
     * @description 複雑なデータオブジェクトを処理する時のテスト
     */
    describe('When processing complex data objects', () => {
      it('Then: [正常] - should integrate formatting with complex data correctly', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // Arrange
        const complexArg = { user: { id: 123, roles: ['admin', 'editor'] }, meta: { requestId: 'req-xyz' } };

        // Act
        logger.info('Complex data', complexArg);

        // Assert
        const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
        expect(messages).toHaveLength(1);
        const messageText = String(messages[0]);
        expect(messageText).toMatch(/\[INFO\] Complex data/);
        expect(messageText).toContain(JSON.stringify(complexArg));
      });
    });
  });

  /**
   * @context Given
   * @scenario フォーマッターとロガー組み合わせ
   * @description フォーマッターとロガーの組み合わせが存在する場合のテスト
   */
  describe('Given formatter and logger combinations', () => {
    /**
     * @context When
     * @scenario JSON出力統合処理
     * @description JSON出力とモックロガーの連携処理時のテスト
     */
    describe('When coordinating JSON output with mock logger', () => {
      it('Then: [正常] - should produce structured output correctly', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // Act
        const args = { userId: 123, action: 'login' };
        logger.info('JSON test message', args);

        // Assert
        const messages = mockLogger.getMessages(AG_LOGLEVEL.DEFAULT);
        expect(messages).toHaveLength(1);
        const parsedMessage = JSON.parse(String(messages[0]));
        expect(parsedMessage.level).toBe('INFO');
        expect(parsedMessage.message).toBe('JSON test message');
        expect(parsedMessage.args).toEqual([args]);
      });
    });

    /**
     * @context When
     * @scenario 高負荷ログ処理
     * @description 大容量ログ操作を処理する時のテスト
     */
    describe('When processing high-volume logging operations', () => {
      it('Then: [エッジケース] - should maintain performance under load conditions', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        const logCount = 50;
        for (let i = 0; i < logCount; i++) {
          logger.info('Perf iteration', { iteration: i });
        }

        const messages = mockLogger.getMessages(AG_LOGLEVEL.DEFAULT);
        expect(messages).toHaveLength(logCount);

        const firstMessage = JSON.parse(String(messages[0]));
        const lastMessage = JSON.parse(String(messages[messages.length - 1]));
        expect(firstMessage.args[0].iteration).toBe(0);
        expect(lastMessage.args[0].iteration).toBe(logCount - 1);
      });
    });
  });

  /**
   * @context Given
   * @scenario ログレベル管理統合
   * @description ログレベル管理シナリオが存在する場合のテスト
   */
  describe('Given log level management scenarios', () => {
    /**
     * @context When
     * @scenario レベル変更とフォーマッター連携
     * @description アクティブなフォーマッターでログレベル変更を管理する時のテスト
     */
    describe('When managing log level changes with active formatters', () => {
      it('Then: [正常] - should synchronize level changes across components', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        logger.debug('debug suppressed');
        logger.info('info suppressed');
        logger.warn('warn shown');
        logger.error('error shown');

        expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toHaveLength(0);
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(0);
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);
        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toHaveLength(1);
      });
    });

    /**
     * @context When
     * @scenario 動的レベル変更処理
     * @description 動的レベル変更が発生する時のテスト
     */
    describe('When dynamic level changes occur', () => {
      it('Then: [正常] - should handle runtime level changes correctly', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: PlainFormatter,
        });

        // Start with WARN: INFO/DEBUG suppressed
        logger.logLevel = AG_LOGLEVEL.WARN;
        logger.debug('debug suppressed');
        logger.info('info suppressed');
        logger.warn('warn shown 1');
        expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toHaveLength(0);
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(0);
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);

        // Change to INFO: INFO allowed
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.info('info shown 1');
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);

        // Change to ERROR: WARN now suppressed, ERROR allowed
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.warn('warn suppressed 2');
        logger.error('error shown 1');
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);
        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toHaveLength(1);
      });
    });
  });
});
