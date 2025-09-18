// src: /src/plugins/format/__tests__/JsonFormatter.spec.ts
// @(#) : JUnit tests for JsonFormatter plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ（Vitest）
import { describe, expect, it } from 'vitest';

// 型定義・インターフェース
import { AG_LOGLEVEL } from '../../../../../shared/types';
import type { AgLogMessage } from '../../../../../shared/types/AgLogger.types';

// プラグインシステム
import { JsonFormatter } from '../../../../plugins/formatter/JsonFormatter';

// test main

/**
 * @suite JsonFormatter Valid Structures | Unit
 * @description Tests for JsonFormatter with valid log message structures
 * @testType unit
 * Scenarios: Basic formatting, All log levels, Edge case inputs
 */
describe('Given: JsonFormatter with valid log message structures', () => {
  /**
   * @context When
   * @scenario Basic message formatting
   * @description Test basic log message formatting to JSON
   */
  describe('When: formatting basic log messages', () => {
    it('Then: [正常] - should format basic log message as JSON', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test message',
        args: [],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBe('2025-01-01T12:00:00.000Z');
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test message');
      expect(parsed.args).toBeUndefined();
    });

    it('Then: [正常] - should format log message with arguments as JSON', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.ERROR,
        timestamp: new Date('2025-06-22T15:30:45.123Z'),
        message: 'An error occurred',
        args: [{ userId: 123, action: 'login' }],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBe('2025-06-22T15:30:45.123Z');
      expect(parsed.level).toBe('ERROR');
      expect(parsed.message).toBe('An error occurred');
      expect(parsed.args).toEqual([{ userId: 123, action: 'login' }]);
    });

    it('Then: [正常] - should format multiple arguments as JSON array', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-03-15T09:15:30.500Z'),
        message: 'Debug info',
        args: [
          { name: 'John Doe' },
          { age: 30 },
          ['item1', 'item2'],
        ],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBe('2025-03-15T09:15:30.500Z');
      expect(parsed.level).toBe('DEBUG');
      expect(parsed.message).toBe('Debug info');
      expect(parsed.args).toEqual([
        { name: 'John Doe' },
        { age: 30 },
        ['item1', 'item2'],
      ]);
    });
  });

  /**
   * @context When
   * @scenario All log level formatting
   * @description Test formatting across all standard log levels
   */
  describe('When: formatting with all log levels', () => {
    it('Then: [正常] - should format correctly for all standard log levels', () => {
      const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        message: 'Test',
        args: [],
      };

      const testCases = [
        { level: AG_LOGLEVEL.FATAL, expected: 'FATAL' },
        { level: AG_LOGLEVEL.ERROR, expected: 'ERROR' },
        { level: AG_LOGLEVEL.WARN, expected: 'WARN' },
        { level: AG_LOGLEVEL.INFO, expected: 'INFO' },
        { level: AG_LOGLEVEL.DEBUG, expected: 'DEBUG' },
        { level: AG_LOGLEVEL.TRACE, expected: 'TRACE' },
      ];

      testCases.forEach(({ level, expected }) => {
        const result = JsonFormatter({ ...baseMessage, logLevel: level });
        const parsed = JSON.parse(result);
        expect(parsed.level).toBe(expected);
      });
    });

    it('Then: [エッジケース] - should format LOG level without level field', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.LOG,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Force output message',
        args: [],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBe('2025-01-01T12:00:00.000Z');
      expect(parsed.level).toBeUndefined();
      expect(parsed.message).toBe('Force output message');
      expect(parsed.args).toBeUndefined();
    });
  });

  /**
   * @context When
   * @scenario Edge case input formatting
   * @description Test formatting with edge case inputs and validation
   */
  describe('When: formatting edge case inputs', () => {
    it('Then: [エッジケース] - should format correctly with empty message', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.WARN,
        timestamp: new Date('2025-12-31T23:59:59.999Z'),
        message: '',
        args: [{ warning: 'empty message' }],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBe('2025-12-31T23:59:59.999Z');
      expect(parsed.level).toBe('WARN');
      expect(parsed.message).toBe('');
      expect(parsed.args).toEqual([{ warning: 'empty message' }]);
    });

    it('Then: [正常] - should output valid JSON string without newlines', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test',
        args: [{ key: 'value' }],
      };

      const result = JsonFormatter(logMessage);

      expect(() => JSON.parse(result)).not.toThrow();
      expect(result).not.toContain('\n');
    });
  });
});

/**
 * @suite JsonFormatter Problematic Inputs | Unit
 * @description Tests for JsonFormatter with problematic input handling
 * @testType unit
 * Scenarios: Circular references, Null/undefined handling, Large data structures
 */
describe('Given: JsonFormatter with problematic inputs', () => {
  /**
   * @context When
   * @scenario Circular reference processing
   * @description Test handling of circular reference structures
   */
  describe('When: processing circular references', () => {
    it('Then: [異常] - should throw Converting circular structure to JSON error', () => {
      const circularObj: { name: string; self?: unknown } = { name: 'test' };
      circularObj.self = circularObj;

      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'circular reference test',
        args: [circularObj],
      };

      expect(() => JsonFormatter(logMessage)).toThrow('Converting circular structure to JSON');
    });
  });

  /**
   * @context When
   * @scenario Null/undefined argument processing
   * @description Test handling of null and undefined values
   */
  describe('When: processing null/undefined arguments', () => {
    it('Then: [エッジケース] - should handle null arguments correctly', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'null test',
        args: [null, undefined, { prop: null }],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.args).toEqual([null, null, { prop: null }]);
    });

    it('Then: [エッジケース] - should handle undefined properties in objects', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'undefined properties test',
        args: [{ defined: 'value', undefined: undefined, nullValue: null }],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.args[0]).toEqual({ defined: 'value', nullValue: null });
      expect(parsed.args[0]).not.toHaveProperty('undefined');
    });
  });

  /**
   * @context When
   * @scenario Large data structure processing
   * @description Test handling of large and deeply nested data structures
   */
  describe('When: processing large data structures', () => {
    it('Then: [エッジケース] - should handle deeply nested objects without error', () => {
      const createDeepObject = (depth: number): unknown => {
        if (depth === 0) { return { leaf: 'value' }; }
        return { level: depth, child: createDeepObject(depth - 1) };
      };

      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'deep object test',
        args: [createDeepObject(10)],
      };

      expect(() => JsonFormatter(logMessage)).not.toThrow();
      const result = JsonFormatter(logMessage);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('Then: [エッジケース] - should handle large arrays without performance issues', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item-${i}` }));

      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'large array test',
        args: [largeArray],
      };

      expect(() => JsonFormatter(logMessage)).not.toThrow();
      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);
      expect(parsed.args[0]).toHaveLength(1000);
    });
  });
});
