// src/utils/__tests__/AgLogHelpers.spec.ts
// @(#) : Consolidated tests for AgLogHelpers utility functions following atsushifx式BDD
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ（Vitest）
import { describe, expect, it, vi } from 'vitest';

// 型定義・インターフェース
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgLogLevel } from '../../../../shared/types';

// ユーティリティ・ヘルパー関数
import {
  AgToLabel,
  AgToLogLevel,
  argsToString,
  createLoggerFunction,
  valueToString,
} from '../../../utils/AgLogHelpers';
import { isValidLogLevel } from '../../../utils/AgLogValidators';

/**
 * @suite AgLogHelpers Utilities | Unit
 * @description Comprehensive unit tests for AgLogHelpers utility functions
 * @testType unit
 * Scenarios: Value conversion, Logger function creation, Level validation, Arguments processing, Level conversion
 */
describe('Given: valueToString utility function', () => {
  /**
   * @context When
   * @scenario Basic data type conversion
   * @description Test valueToString with primitive data types
   */
  describe('When: converting basic data types', () => {
    it('Then: [正常] - should return string representation of null', () => {
      const result = valueToString(null);
      expect(result).toBe('null');
    });

    it('Then: [正常] - should return string representation of undefined', () => {
      const result = valueToString(undefined);
      expect(result).toBe('undefined');
    });

    it('Then: [正常] - should return quoted string for string values', () => {
      const result = valueToString('test string');
      expect(result).toBe('"test string"');
    });

    it('Then: [正常] - should return string representation of numbers', () => {
      expect(valueToString(42)).toBe('42');
      expect(valueToString(3.14)).toBe('3.14');
      expect(valueToString(0)).toBe('0');
    });

    it('Then: [正常] - should return string representation of booleans', () => {
      expect(valueToString(true)).toBe('true');
      expect(valueToString(false)).toBe('false');
    });
  });

  /**
   * @context When
   * @scenario Array data conversion
   * @description Test valueToString with array structures
   */
  describe('When: converting arrays', () => {
    it('Then: [エッジケース] - should return "array" for empty arrays', () => {
      const result = valueToString([]);
      expect(result).toBe('array');
    });

    it('Then: [正常] - should return bracketed string representation for non-empty arrays', () => {
      const result = valueToString([1, 2, 3]);
      expect(result).toBe('[1,2,3]');
    });

    it('Then: [正常] - should handle arrays with mixed types', () => {
      const result = valueToString(['a', 1, true]);
      expect(result).toBe('[a,1,true]');
    });

    it('Then: [エッジケース] - should handle nested arrays', () => {
      const result = valueToString([[1, 2], [3, 4]]);
      expect(result).toBe('[1,2,3,4]');
    });

    it('Then: [エッジケース] - should handle arrays with null and undefined', () => {
      const result = valueToString([null, undefined, 'test']);
      expect(result).toBe('[,,test]');
    });
  });

  /**
   * @context When
   * @scenario Function conversion
   * @description Test valueToString with function objects
   */
  describe('When: converting functions', () => {
    it('Then: [正常] - should return "function" for anonymous functions', () => {
      const result = valueToString(() => {});
      expect(result).toBe('function');
    });

    it('Then: [正常] - should return function name for named functions', () => {
      const namedFn = function testFunction(): void {};
      const result = valueToString(namedFn);
      expect(result).toBe('function testFunction');
    });

    it('Then: [正常] - should handle arrow functions with names', () => {
      const arrowFn = (): string => 'arrow';
      const result = valueToString(arrowFn);
      expect(result).toBe('function arrowFn');
    });
  });

  /**
   * @context When
   * @scenario Object conversion
   * @description Test valueToString with object structures
   */
  describe('When: converting objects', () => {
    it('Then: [正常] - should return "object" for plain objects', () => {
      const result = valueToString({ key: 'value' });
      expect(result).toBe('object');
    });

    it('Then: [正常] - should return "object" for complex objects', () => {
      const complex = { a: 1, b: { c: 2 }, d: [1, 2, 3] };
      const result = valueToString(complex);
      expect(result).toBe('object');
    });
  });
});

describe('Given: createLoggerFunction factory utility', () => {
  /**
   * @context When
   * @scenario Logger function creation
   * @description Test createLoggerFunction factory behavior
   */
  describe('When: creating logger functions', () => {
    it('Then: [正常] - should create a logger function that calls the provided module function', () => {
      const mockModuleFunc = vi.fn();

      const loggerFn = createLoggerFunction(mockModuleFunc);
      loggerFn('test message');

      expect(mockModuleFunc).toHaveBeenCalledWith(AG_LOGLEVEL.INFO, 'test message');
    });

    it('Then: [正常] - should handle different formatted message types', () => {
      const mockModuleFunc = vi.fn();

      const loggerFn = createLoggerFunction(mockModuleFunc);
      loggerFn('formatted string');

      expect(mockModuleFunc).toHaveBeenCalledWith(AG_LOGLEVEL.INFO, 'formatted string');
    });
  });
});

describe('Given: isValidLogLevel validation utility', () => {
  /**
   * @context When
   * @scenario Valid log level validation
   * @description Test validation of all valid log level values
   */
  describe('When: validating valid log levels', () => {
    const validLogLevels = [
      { name: 'OFF', value: AG_LOGLEVEL.OFF },
      { name: 'FATAL', value: AG_LOGLEVEL.FATAL },
      { name: 'ERROR', value: AG_LOGLEVEL.ERROR },
      { name: 'WARN', value: AG_LOGLEVEL.WARN },
      { name: 'INFO', value: AG_LOGLEVEL.INFO },
      { name: 'DEBUG', value: AG_LOGLEVEL.DEBUG },
      { name: 'TRACE', value: AG_LOGLEVEL.TRACE },
      { name: 'VERBOSE', value: AG_LOGLEVEL.VERBOSE },
      { name: 'LOG', value: AG_LOGLEVEL.LOG },
      { name: 'DEFAULT', value: AG_LOGLEVEL.DEFAULT },
    ];

    validLogLevels.forEach(({ name: _name, value }) => {
      it(`Then: [正常] - should validate \${name} level (\${value}) as valid`, () => {
        expect(isValidLogLevel(value)).toBe(true);
      });
    });
  });

  /**
   * @context When
   * @scenario Invalid log level validation
   * @description Test validation rejection of invalid log level values
   */
  describe('When: validating invalid log levels', () => {
    const invalidValues = [
      { name: 'undefined', value: undefined },
      { name: 'null', value: null },
      { name: 'string', value: 'invalid' },
      { name: 'negative number', value: -1000 },
      { name: 'large positive number', value: 1000 },
      { name: 'decimal number', value: 3.5 },
      { name: 'boolean', value: true },
      { name: 'object', value: {} },
      { name: 'array', value: [] },
    ];

    invalidValues.forEach(({ name: _name, value }) => {
      it(`Then: [異常] - should validate \${name} as invalid`, () => {
        expect(isValidLogLevel(value as unknown)).toBe(false);
      });
    });
  });
});

describe('Given: argsToString conversion utility', () => {
  /**
   * @context When
   * @scenario Arguments string conversion
   * @description Test argsToString processing of argument arrays
   */
  describe('When: converting arguments to string', () => {
    it('Then: [正常] - should format single argument', () => {
      const result = argsToString(['single arg']);
      expect(result).toBe('"single arg"');
    });

    it('Then: [正常] - should format multiple arguments with spaces', () => {
      const result = argsToString(['arg1', 'arg2', 'arg3']);
      expect(result).toBe('"arg1" "arg2" "arg3"');
    });

    it('Then: [エッジケース] - should handle empty arguments array', () => {
      const result = argsToString([]);
      expect(result).toBe('');
    });

    it('Then: [正常] - should handle mixed type arguments', () => {
      const result = argsToString(['string', 42, true, null]);
      expect(result).toBe('"string" 42 true null');
    });

    it('Then: [正常] - should handle object and array arguments', () => {
      const result = argsToString([{ key: 'value' }, [1, 2, 3]]);
      expect(result).toBe('{"key":"value"} [1,2,3]');
    });
  });
});

describe('Given: log level conversion utilities', () => {
  /**
   * @context When
   * @scenario Log level to label conversion
   * @description Test AgToLabel conversion from log levels to string labels
   */
  describe('When: converting log levels to labels with AgToLabel', () => {
    it('Then: [正常] - should convert valid log levels to labels', () => {
      expect(AgToLabel(AG_LOGLEVEL.ERROR)).toBe('ERROR');
      expect(AgToLabel(AG_LOGLEVEL.WARN)).toBe('WARN');
      expect(AgToLabel(AG_LOGLEVEL.INFO)).toBe('INFO');
    });

    it('Then: [エッジケース] - should return empty string for LOG level', () => {
      expect(AgToLabel(AG_LOGLEVEL.LOG)).toBe('');
    });

    it('Then: [エッジケース] - should return empty string for invalid levels', () => {
      expect(AgToLabel(999 as AgLogLevel)).toBe('');
    });
  });

  /**
   * @context When
   * @scenario Label to log level conversion
   * @description Test AgToLogLevel conversion from string labels to log levels
   */
  describe('When: converting labels to log levels with AgToLogLevel', () => {
    it('Then: [正常] - should convert valid labels to log levels', () => {
      expect(AgToLogLevel('ERROR')).toBe(AG_LOGLEVEL.ERROR);
      expect(AgToLogLevel('warn')).toBe(AG_LOGLEVEL.WARN);
      expect(AgToLogLevel(' INFO ')).toBe(AG_LOGLEVEL.INFO);
    });

    it('Then: [異常] - should return undefined for invalid labels', () => {
      expect(AgToLogLevel('INVALID')).toBeUndefined();
      expect(AgToLogLevel('')).toBeUndefined();
      expect(AgToLogLevel(null as unknown as string)).toBeUndefined();
    });
  });
});
