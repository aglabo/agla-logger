// src: /src/__tests__/AgTypes.spec.ts
// @(#) : Consolidated Type Tests Following atsushifx式BDD
//
// Comprehensive tests for all type definitions and interfaces
// Organized by type category with behavioral testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ
import { type AglaError, ErrorSeverity } from '@aglabo/agla-error-core';

// 外部ライブラリ（Vitest）
import { describe, expect, it } from 'vitest';

// 型定義・インターフェース
import { AG_LOGLEVEL } from '../../shared/types';
import type { AgFormatFunction, AgLoggerOptions, AgLogLevel, AgLogMessage } from '../../shared/types';
import { AgLoggerError } from '../../shared/types';

/**
 * @suite AgLogger Type System | Unit Tests
 * @description Comprehensive testing of AgLogger type definitions, interfaces, and type compatibility
 * @testType unit
 * Scenarios: LogLevel types, LogMessage types, LoggerOptions types, LoggerError types, Error base interface, Type integration
 */
describe('Given AgLogLevel type definitions', () => {
  /**
   * @context When
   * @scenario Enum values verification
   * @description Testing AgLogLevel enum values and their numeric mappings
   */
  describe('When verifying enum values', () => {
    it('Then: [正常] - should have all expected log level values', () => {
      const expectedLogLevels = [
        { level: AG_LOGLEVEL.OFF, expected: 0 },
        { level: AG_LOGLEVEL.FATAL, expected: 1 },
        { level: AG_LOGLEVEL.ERROR, expected: 2 },
        { level: AG_LOGLEVEL.WARN, expected: 3 },
        { level: AG_LOGLEVEL.INFO, expected: 4 },
        { level: AG_LOGLEVEL.DEBUG, expected: 5 },
        { level: AG_LOGLEVEL.TRACE, expected: 6 },
      ] as const;

      expectedLogLevels.forEach(({ level, expected }) => {
        expect(level).toBe(expected);
      });
    });

    it('Then: [正常] - should have special log level values', () => {
      expect(AG_LOGLEVEL.VERBOSE).toBe(-11);
      expect(AG_LOGLEVEL.LOG).toBe(-12);
      expect(AG_LOGLEVEL.DEFAULT).toBe(-99);
    });

    it('Then: [正常] - should maintain proper log level hierarchy', () => {
      const hierarchyTests = [
        { lower: AG_LOGLEVEL.FATAL, higher: AG_LOGLEVEL.ERROR },
        { lower: AG_LOGLEVEL.ERROR, higher: AG_LOGLEVEL.WARN },
        { lower: AG_LOGLEVEL.WARN, higher: AG_LOGLEVEL.INFO },
        { lower: AG_LOGLEVEL.INFO, higher: AG_LOGLEVEL.DEBUG },
        { lower: AG_LOGLEVEL.DEBUG, higher: AG_LOGLEVEL.TRACE },
      ] as const;

      hierarchyTests.forEach(({ lower, higher }) => {
        expect(lower).toBeLessThan(higher);
      });
    });
  });

  /**
   * @context When
   * @scenario Type compatibility verification
   * @description Testing AgLogLevel type compatibility and usage patterns
   */
  describe('When verifying type compatibility', () => {
    it('Then: [正常] - should accept valid AgLogLevel values', () => {
      const validLevels: AgLogLevel[] = [
        AG_LOGLEVEL.OFF,
        AG_LOGLEVEL.FATAL,
        AG_LOGLEVEL.ERROR,
        AG_LOGLEVEL.WARN,
        AG_LOGLEVEL.INFO,
        AG_LOGLEVEL.DEBUG,
        AG_LOGLEVEL.TRACE,
        AG_LOGLEVEL.VERBOSE,
        AG_LOGLEVEL.LOG,
        AG_LOGLEVEL.DEFAULT,
      ];

      validLevels.forEach((level) => {
        expect(typeof level).toBe('number');
      });
    });
  });
});

/**
 * Given: AgLogMessage type definitions
 */
/**
 * @suite AgLogMessage Type Definitions | Unit Tests
 * @description Testing AgLogMessage interface structure and property validation
 * @testType unit
 * Scenarios: Message structure verification
 */
describe('Given AgLogMessage type definitions', () => {
  /**
   * @context When
   * @scenario Message structure verification
   * @description Testing AgLogMessage interface properties and structure validation
   */
  describe('When verifying message structure', () => {
    it('Then: [正常] - should create valid AgLogMessage with required properties', () => {
      const logMessage: AgLogMessage = {
        message: 'test message',
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date(),
        args: [],
      };

      expect(logMessage.message).toBe('test message');
      expect(logMessage.logLevel).toBe(AG_LOGLEVEL.INFO);
      expect(logMessage.timestamp).toBeInstanceOf(Date);
    });

    it('Then: [エッジ] - should handle empty message', () => {
      const logMessage: AgLogMessage = {
        message: '',
        logLevel: AG_LOGLEVEL.ERROR,
        timestamp: new Date(),
        args: [],
      };

      expect(logMessage.message).toBe('');
      expect(typeof logMessage.message).toBe('string');
    });

    it('Then: [正常] - should handle all log levels in message', () => {
      const levels = [
        AG_LOGLEVEL.OFF,
        AG_LOGLEVEL.FATAL,
        AG_LOGLEVEL.ERROR,
        AG_LOGLEVEL.WARN,
        AG_LOGLEVEL.INFO,
        AG_LOGLEVEL.DEBUG,
        AG_LOGLEVEL.TRACE,
      ];

      levels.forEach((level) => {
        const message: AgLogMessage = {
          message: `test for level ${level}`,
          logLevel: level,
          timestamp: new Date(),
          args: [],
        };
        expect(message.logLevel).toBe(level);
      });
    });
  });
});

/**
 * Given: AgLoggerOptions type definitions
 */
/**
 * @suite AgLoggerOptions Type Definitions | Unit Tests
 * @description Testing AgLoggerOptions interface structure and configuration validation
 * @testType unit
 * Scenarios: Option structure verification
 */
describe('Given AgLoggerOptions type definitions', () => {
  /**
   * @context When
   * @scenario Option structure verification
   * @description Testing AgLoggerOptions interface properties and configuration validation
   */
  describe('When verifying option structure', () => {
    it('Then: [正常] - should accept minimal valid options', () => {
      const options: AgLoggerOptions = {};
      expect(typeof options).toBe('object');
    });

    it('Then: [正常] - should accept full options configuration', () => {
      const mockLogger = (): void => {};
      const mockFormatter = (msg: AgLogMessage): string => msg.message;

      const options: AgLoggerOptions = {
        logLevel: AG_LOGLEVEL.DEBUG,
        defaultLogger: mockLogger,
        formatter: mockFormatter,
      };

      expect(options.logLevel).toBe(AG_LOGLEVEL.DEBUG);
      expect(typeof options.defaultLogger).toBe('function');
      expect(typeof options.formatter).toBe('function');
    });

    it('Then: [正常] - should handle partial options', () => {
      const options1: AgLoggerOptions = {
        logLevel: AG_LOGLEVEL.WARN,
      };

      const options2: AgLoggerOptions = {
        defaultLogger: (): void => {},
      };

      const options3: AgLoggerOptions = {
        formatter: (msg: AgLogMessage): string => msg.message,
      };

      expect(options1.logLevel).toBe(AG_LOGLEVEL.WARN);
      expect(typeof options2.defaultLogger).toBe('function');
      expect(typeof options3.formatter).toBe('function');
    });
  });
});

/**
 * Given: AgLoggerError type definitions
 */
/**
 * @suite AgLoggerError Type Definitions | Unit Tests
 * @description Testing AgLoggerError interface structure and error handling validation
 * @testType unit
 * Scenarios: Error structure verification
 */
describe('Given AgLoggerError type definitions', () => {
  /**
   * @context When
   * @scenario Error structure verification
   * @description Testing AgLoggerError interface properties and error handling validation
   */
  describe('When verifying error structure', () => {
    it('Then: [正常] - should create AgLoggerError with stack trace', () => {
      const error = new AgLoggerError(ErrorSeverity.ERROR, 'VALIDATION', 'Test error');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });
});

/**
 * Given: AgError base interface definitions
 */
/**
 * @suite AgError Base Interface Definitions | Unit Tests
 * @description Testing AgError base interface structure and inheritance validation
 * @testType unit
 * Scenarios: Base error interface verification
 */
describe('Given AgError base interface definitions', () => {
  /**
   * @context When
   * @scenario Base error interface verification
   * @description Testing AgError base interface properties and inheritance structure
   */
  describe('When verifying base error interface', () => {
    it('Then: [正常] - should define proper error structure', () => {
      const error: AglaError = {
        message: 'Base error message',
        errorType: 'VALIDATION',
        name: 'BaseError',
      } as unknown as AglaError;

      expect(error.message).toBe('Base error message');
      expect(error.errorType).toBe('VALIDATION');
      expect(error.name).toBe('BaseError');
    });

    it('Then: [正常] - should be compatible with AgLoggerError', () => {
      const agLoggerError = new AgLoggerError(ErrorSeverity.ERROR, 'RESOURCE', 'Logger error');
      const agError: AglaError = agLoggerError;

      expect(agError.message).toBe('Logger error');
      expect(agError.errorType).toBe('RESOURCE');
      expect(agError.name).toBe('AgLoggerError');
    });
  });
});

/**
 * Given: Type integration scenarios
 */
/**
 * @suite Type Integration Scenarios | Unit Tests
 * @description Testing type system integration and cross-type compatibility
 * @testType unit
 * Scenarios: Type interoperability verification
 */
describe('Given type integration scenarios', () => {
  /**
   * @context When
   * @scenario Type interoperability verification
   * @description Testing cross-type compatibility and integration patterns
   */
  describe('When verifying type interoperability', () => {
    it('Then: [正常] - should work together in realistic scenarios', () => {
      const logLevel: AgLogLevel = AG_LOGLEVEL.INFO;

      const message: AgLogMessage = {
        message: 'Integration test message',
        logLevel: logLevel,
        timestamp: new Date(),
        args: [],
      };

      const options: AgLoggerOptions = {
        logLevel,
        defaultLogger: (): void => {},
        formatter: (msg: AgLogMessage): string => `[${msg.logLevel}] ${msg.message}`,
      };

      expect(message.logLevel).toBe(options.logLevel);
      expect((options.formatter as AgFormatFunction)(message)).toBe(`[${AG_LOGLEVEL.INFO}] Integration test message`);
    });

    it('Then: [異常] - should handle error scenarios with proper typing', () => {
      const createTypedError = (level: unknown): AgLoggerError | null => {
        if (typeof level !== 'number') {
          return new AgLoggerError(ErrorSeverity.ERROR, 'VALIDATION', `Invalid log level: ${String(level)}`);
        }
        return null;
      };

      const error = createTypedError('invalid');
      expect(error).toBeInstanceOf(AgLoggerError);
      expect(error?.errorType).toBe('VALIDATION');

      const noError = createTypedError(AG_LOGLEVEL.INFO);
      expect(noError).toBeNull();
    });
  });
});
