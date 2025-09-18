// tests/integration/console-output/loggers/console-logger-behavior.integration.spec.ts
// @(#) : Console Logger Behavior Integration Tests - Console output behavior verification
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Test framework: execution, assertion, mocking
import { describe, expect, it, vi } from 'vitest';

// Shared types and constants: log levels and type definitions
import { AG_LOGLEVEL } from '@shared/types';

// Test targets: main classes under test
import { AgLogger } from '@/AgLogger.class';

// Plugin implementations: formatters and loggers
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { ConsoleLogger, ConsoleLoggerMap } from '@/plugins/logger/ConsoleLogger';
import { NullLogger } from '@/plugins/logger/NullLogger';

/**
 * @suite Console Logger Behavior Integration | Integration
 * @description Console出力での各種ロガーの振る舞いを保証するテスト
 * @testType integration
 * Scenarios: ConsoleLogger基本動作, ConsoleLoggerMapレベル振り分け, NullLogger出力抑制, モックロガーテスト
 */
describe('Feature: Console Logger Behavior Integration', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  };

  /**
   * @context Given
   * @scenario ConsoleLoggerが使用される環境が存在する場合
   * @description ConsoleLoggerの基本統合動作とconsole呼び出し確認テスト
   */
  describe('Given: ConsoleLogger is used in the environment', () => {
    /**
     * @context When
     * @scenario コンソール出力が要求された時
     * @description コンソール出力要求時の適切なconsole.method呼び出しテスト
     */
    describe('When: console output is requested', () => {
      // ConsoleLoggerの基本統合動作とconsole.methodの呼び出しを確認
      it('Then: [正常] - should output to appropriate console method', () => {
        setupTestContext();

        // Given: コンソール出力監視の設定
        const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
        const logger = AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: ConsoleLoggerでの出力
        logger.info('test message', { data: 'value' });

        // Then: 適切なconsoleメソッドで出力され、有効なJSON形式
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        const [output] = consoleSpy.mock.calls[0];
        const parsed = JSON.parse(output);
        expect(parsed).toMatchObject({
          level: 'INFO',
          message: 'test message',
          args: [{ data: 'value' }],
        });

        consoleSpy.mockRestore();
      });
    });
  });

  /**
   * @context Given
   * @scenario ConsoleLoggerMapが使用される環境が存在する場合
   * @description ConsoleLoggerMapのレベル固有動作統合テスト
   */
  describe('Given: ConsoleLoggerMap is used in the environment', () => {
    /**
     * @context When
     * @scenario レベル固有のコンソール出力が要求された時
     * @description レベル固有コンソール出力要求時の適切なmethod振り分けテスト
     */
    describe('When: level-specific console output is requested', () => {
      // ConsoleLoggerMap×JsonFormatterで適切なconsoleメソッドに振り分けを確認
      it('Then: [正常] - should use correct console methods with JsonFormatter', () => {
        setupTestContext();

        // Given: 全consoleメソッド監視の設定
        const consoleSpies = {
          error: vi.spyOn(console, 'error').mockImplementation(() => {}),
          warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
          info: vi.spyOn(console, 'info').mockImplementation(() => {}),
          debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
          log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        };

        // Given: ConsoleLoggerMap設定
        const logger = AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: JsonFormatter,
          loggerMap: ConsoleLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.TRACE;

        // When: 各レベルでのログ出力
        logger.fatal('fatal message');
        logger.error('error message');
        logger.warn('warn message');
        logger.info('info message');
        logger.debug('debug message');
        logger.trace('trace message');

        // Then: 適切なconsoleメソッドが呼び出される
        expect(consoleSpies.error).toHaveBeenCalledTimes(2); // fatal and error
        expect(consoleSpies.warn).toHaveBeenCalledTimes(1);
        expect(consoleSpies.info).toHaveBeenCalledTimes(1);
        expect(consoleSpies.debug).toHaveBeenCalledTimes(2); // debug and trace both use console.debug
        expect(consoleSpies.log).toHaveBeenCalledTimes(0); // no trace calls to log

        // Then: 各出力が有効なJSON形式
        [consoleSpies.error, consoleSpies.warn, consoleSpies.info, consoleSpies.debug]
          .forEach((spy) => {
            spy.mock.calls.forEach(([output]) => {
              const parsed = JSON.parse(output);
              expect(parsed).toHaveProperty('level');
              expect(parsed).toHaveProperty('message');
            });
          });

        Object.values(consoleSpies).forEach((spy) => spy.mockRestore());
      });
    });
  });

  /**
   * @context Given
   * @scenario NullLoggerが使用される環境が存在する場合
   * @description NullLoggerによるログ出力抑制動作統合テスト
   */
  describe('Given: NullLogger is used in the environment', () => {
    /**
     * @context When
     * @scenario ログ出力抑制が要求された時
     * @description ログ出力抑制要求時の安全な無出力動作テスト
     */
    describe('When: log output suppression is requested', () => {
      // NullLogger使用時の安全な無出力動作を確認
      it('Then: [正常] - should handle NullLogger with any formatter safely', () => {
        setupTestContext();

        // Given: NullLogger設定
        const logger = AgLogger.createLogger({
          defaultLogger: NullLogger,
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: NullLoggerでのログ出力試行
        // Then: エラーが発生せず、サイレントに完了
        expect(() => {
          logger.info('test message');
        }).not.toThrow();
      });
    });

    /**
     * @context When
     * @scenario ロガーマップ内でフォールバックとして使用された時
     * @description ロガーマップ内でのNullLoggerフォールバック使用テスト
     */
    describe('When: used as fallback in logger map', () => {
      // ロガーマップ内でのNullLogger使用時の安定性を確認
      it('Then: [正常] - should work correctly as fallback logger in map configuration', () => {
        setupTestContext();

        // Given: NullLoggerをフォールバックとする設定
        const infoLogger = vi.fn();
        const logger = AgLogger.createLogger({
          defaultLogger: NullLogger, // デフォルトはNullLogger
          formatter: JsonFormatter,
          loggerMap: {
            [AG_LOGLEVEL.INFO]: infoLogger, // INFOのみ専用ロガー
          },
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 専用ロガーがあるレベルと、NullLoggerになるレベルで出力
        logger.info('info message'); // 専用ロガー使用
        logger.debug('debug message'); // NullLogger使用

        // Then: 専用ロガーは呼び出され、NullLoggerは安全に動作
        expect(infoLogger).toHaveBeenCalledTimes(1);
        expect(() => {
          logger.warn('warn message'); // NullLogger使用
          logger.error('error message'); // NullLogger使用
        }).not.toThrow();
      });
    });
  });

  /**
   * @context Given
   * @scenario モックロガーが使用される環境が存在する場合
   * @description モックロガーの統合動作テスト
   */
  describe('Given: mock loggers are used in the environment', () => {
    /**
     * @context When
     * @scenario テスト用のモック動作が要求された時
     * @description テスト用モック動作要求時の適切な処理テスト
     */
    describe('When: test mock behavior is requested', () => {
      // モックロガーの基本統合動作を確認
      it('Then: [正常] - should work correctly with mock loggers', () => {
        setupTestContext();

        // Given: モックロガー設定
        const mockLogger = vi.fn();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: モックロガーでの出力
        logger.debug('debug message', { debug: true });

        // Then: モックロガーが適切に呼び出される
        expect(mockLogger).toHaveBeenCalledTimes(1);
        const [output] = mockLogger.mock.calls[0];

        expect(() => JSON.parse(output)).not.toThrow();
        const parsed = JSON.parse(output);
        expect(parsed).toMatchObject({
          level: 'DEBUG',
          message: 'debug message',
          args: [{ debug: true }],
        });
      });
    });

    /**
     * @context When
     * @scenario モックロガーエラーシナリオが発生した時
     * @description モックロガーエラーシナリオ発生時の処理テスト
     */
    describe('When: mock logger error scenarios occur', () => {
      // モックロガーエラー時の適切な処理を確認
      it('Then: [異常] - should propagate mock logger errors correctly', () => {
        setupTestContext();

        // Given: エラーを投げるモックロガー
        const throwingMockLogger = vi.fn().mockImplementation(() => {
          throw new Error('Mock logger error');
        });

        const logger = AgLogger.createLogger({
          defaultLogger: throwingMockLogger,
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.ERROR;

        // When/Then: モックロガーのエラーが適切にスローされる
        expect(() => logger.error('error message')).toThrow('Mock logger error');
        expect(throwingMockLogger).toHaveBeenCalledTimes(1);
      });
    });
  });
});
