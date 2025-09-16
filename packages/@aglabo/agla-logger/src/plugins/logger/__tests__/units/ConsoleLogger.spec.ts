// src/plugins/logger/__tests__/ConsoleLogger.spec.ts
// @(#) : Unit tests for ConsoleLogger plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Node.js標準モジュール
import type { Console } from 'node:console';

// 外部ライブラリ（Vitest）
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 型定義・インターフェース
import { AG_LOGLEVEL } from '../../../../../shared/types';

// プラグインシステム
import { ConsoleLogger, ConsoleLoggerMap } from '../../../../plugins/logger/ConsoleLogger';

// テスト用Console型定義 - console オブジェクトのプロパティを安全に変更するため
type _TTestableConsole = {
  [K in keyof Console]: Console[K] | undefined | unknown;
};

// mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

/**
 * ConsoleLoggerプラグインの包括的ユニットテストスイート（Given/When/Then形式）
 *
 * @description ConsoleLoggerの全機能をBDD形式で体系的に検証
 * デフォルトロガー、レベル別マッピング、エラー処理を包括的にテスト
 *
 * @testType Unit Test
 * @testTarget ConsoleLogger Plugin
 * @coverage
 * - 正常系: 基本動作、レベルマッピング
 * - 異常系: エラー処理、例外ハンドリング
 * - エッジケース: 境界値、特殊入力、状態不整合
 */
describe('Given: ConsoleLogger plugin is available', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  /**
   * 正常系テスト: 基本機能
   *
   * @description ConsoleLoggerの基本機能が正常に動作することを検証
   */
  /**
   * デフォルトConsoleLogger関数のテスト
   *
   * @description console.logへの引数委譲を検証
   */
  describe('When: using default ConsoleLogger function', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('Then: [正常] - should delegate to console.log correctly', () => {
      const testCases = [
        'test message',
        '',
        'single message',
        'multiple word message',
      ];

      testCases.forEach((message) => {
        ConsoleLogger(message);
        expect(console.log).toHaveBeenCalledWith(message);
      });

      expect(console.log).toHaveBeenCalledTimes(testCases.length);
    });
  });

  /**
   * ConsoleLoggerMapのテスト
   *
   * @description ログレベルとconsoleメソッドのマッピングを検証
   */
  describe('When: using ConsoleLoggerMap for level mapping', () => {
    it('Then: [正常] - should map log levels to correct console methods', () => {
      const testCases = [
        { level: AG_LOGLEVEL.OFF, expectFunction: true }, // NullLogger
        { level: AG_LOGLEVEL.FATAL, method: 'error' },
        { level: AG_LOGLEVEL.ERROR, method: 'error' },
        { level: AG_LOGLEVEL.WARN, method: 'warn' },
        { level: AG_LOGLEVEL.INFO, method: 'info' },
        { level: AG_LOGLEVEL.DEBUG, method: 'debug' },
        { level: AG_LOGLEVEL.TRACE, method: 'debug' },
      ];

      testCases.forEach(({ level, method }) => {
        const logFunction = ConsoleLoggerMap[level];
        expect(logFunction).toBeDefined();
        expect(typeof logFunction).toBe('function');

        if (method) {
          logFunction!(`test ${method} message`);
          expect(mockConsole[method as keyof typeof mockConsole]).toHaveBeenCalledTimes(1);
          vi.clearAllMocks();
        }
      });
    });

    it('Then: [正常] - should handle formatted messages correctly', () => {
      const testMessage = 'formatted log message';
      const infoLogger = ConsoleLoggerMap[AG_LOGLEVEL.INFO];

      infoLogger!(testMessage);
      expect(mockConsole.info).toHaveBeenCalledWith(testMessage);
    });
  });

  /**
   * 異常系テスト: エラー処理・例外ハンドリング
   *
   * @description エラー状況での動作を検証
   */
  describe('When: console methods encounter exceptions', () => {
    it('Then: [異常] - should handle console method throwing errors', () => {
      const throwingConsole = vi.spyOn(console, 'error').mockImplementation(() => {
        throw new Error('Console error');
      });

      const errorLogger = ConsoleLoggerMap[AG_LOGLEVEL.ERROR];
      expect(() => errorLogger!('test')).toThrow('Console error');

      throwingConsole.mockRestore();
    });

    it('Then: [異常] - should handle console.log throwing errors', () => {
      const throwingConsole = vi.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Console.log error');
      });

      expect(() => ConsoleLogger('test message')).toThrow('Console.log error');
      throwingConsole.mockRestore();
    });

    it('Then: [異常] - should handle multiple console methods throwing errors', () => {
      const throwingInfo = vi.spyOn(console, 'info').mockImplementation(() => {
        throw new Error('Info error');
      });
      const throwingWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
        throw new Error('Warn error');
      });

      const infoLogger = ConsoleLoggerMap[AG_LOGLEVEL.INFO];
      const warnLogger = ConsoleLoggerMap[AG_LOGLEVEL.WARN];

      expect(() => infoLogger!('test')).toThrow('Info error');
      expect(() => warnLogger!('test')).toThrow('Warn error');

      throwingInfo.mockRestore();
      throwingWarn.mockRestore();
    });

    it('Then: [異常] - should handle console method returning unexpected values', () => {
      const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {
        return 'unexpected return value' as unknown;
      });

      // Should not throw even if console.log returns unexpected value
      expect(() => ConsoleLogger('test message')).not.toThrow();
      expect(mockConsoleLog).toHaveBeenCalledWith('test message');

      mockConsoleLog.mockRestore();
    });
  });

  /**
   * エッジケース: 境界値と特殊条件
   *
   * @description 境界値や特殊な入力での動作を検証
   */
  describe('When: handling edge cases and boundary conditions', () => {
    it('Then: [エッジケース] - should handle undefined and null messages', () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});

      ConsoleLogger(undefined as unknown as string);
      ConsoleLogger(null as unknown as string);

      expect(console.log).toHaveBeenCalledWith(undefined);
      expect(console.log).toHaveBeenCalledWith(null);
    });

    it('Then: [エッジケース] - should handle very long messages', () => {
      vi.spyOn(console, 'info').mockImplementation(() => {});

      const longMessage = 'a'.repeat(10000);
      const infoLogger = ConsoleLoggerMap[AG_LOGLEVEL.INFO];

      infoLogger!(longMessage);
      expect(console.info).toHaveBeenCalledWith(longMessage);
    });

    it('Then: [エッジケース] - should handle special characters in messages', () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});

      const specialMessage = '\n\t\r\\"\'';
      ConsoleLogger(specialMessage);

      expect(console.log).toHaveBeenCalledWith(specialMessage);
    });

    it('Then: [エッジケース] - should handle empty string messages', () => {
      vi.spyOn(console, 'debug').mockImplementation(() => {});

      const debugLogger = ConsoleLoggerMap[AG_LOGLEVEL.DEBUG];
      debugLogger!('');

      expect(console.debug).toHaveBeenCalledWith('');
    });

    it('Then: [エッジケース] - should handle extremely large messages without memory issues', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const extremelyLongMessage = 'x'.repeat(1000000); // 1MB of 'x'
      const errorLogger = ConsoleLoggerMap[AG_LOGLEVEL.ERROR];

      expect(() => errorLogger!(extremelyLongMessage)).not.toThrow();
      expect(console.error).toHaveBeenCalledWith(extremelyLongMessage);
    });

    it('Then: [エッジケース] - should handle console method being undefined', () => {
      const originalDebug = console.debug;
      (console as _TTestableConsole).debug = undefined;

      const debugLogger = ConsoleLoggerMap[AG_LOGLEVEL.DEBUG];
      expect(() => debugLogger!('test')).toThrow();

      console.debug = originalDebug;
    });

    it('Then: [エッジケース] - should handle console object being partially corrupted', () => {
      const originalWarn = console.warn;
      (console as _TTestableConsole).warn = 'not a function';

      const warnLogger = ConsoleLoggerMap[AG_LOGLEVEL.WARN];
      expect(() => warnLogger!('test')).toThrow();

      console.warn = originalWarn;
    });
  });
});
