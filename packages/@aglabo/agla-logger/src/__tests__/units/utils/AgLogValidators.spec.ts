// src/utils/__tests__/AgLogValidators.spec.ts
// @(#) : Consolidated validation tests following atsushifx式BDD
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ（Vitest）
import { describe, expect, it } from 'vitest';

// 型定義・インターフェース
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgLogMessage } from '../../../../shared/types';
import { AgLoggerError } from '../../../../shared/types/AgLoggerError.types';
import type { AgFormatRoutine } from '../../../../shared/types/AgMockConstructor.class';

// プラグインシステム
import { AgMockFormatter } from '../../../plugins/formatter/AgMockFormatter';

// ユーティリティ・ヘルパー関数
import { isAgMockConstructor, isValidLogLevel, validateLogLevel } from '../../../utils/AgLogValidators';

/**
 * @suite AgLogValidators Utilities | Unit
 * @description Comprehensive unit tests for AgLogValidators utility functions
 * @testType unit
 * Scenarios: Runtime validation, Boolean validation, Standard level restrictions, Error messaging, Mock constructor detection
 */
describe('Given: validateLogLevel runtime validation utility', () => {
  /**
   * @context When
   * @scenario Valid log level validation
   * @description Test validation acceptance of all valid log level values
   */
  describe('When: validating valid log levels', () => {
    const validStandardLevels = [
      { name: 'OFF', value: AG_LOGLEVEL.OFF },
      { name: 'FATAL', value: AG_LOGLEVEL.FATAL },
      { name: 'ERROR', value: AG_LOGLEVEL.ERROR },
      { name: 'WARN', value: AG_LOGLEVEL.WARN },
      { name: 'INFO', value: AG_LOGLEVEL.INFO },
      { name: 'DEBUG', value: AG_LOGLEVEL.DEBUG },
      { name: 'TRACE', value: AG_LOGLEVEL.TRACE },
    ];

    validStandardLevels.forEach(({ name, value }) => {
      it(`Then: [正常] - should accept standard ${name} level (${value})`, () => {
        expect(validateLogLevel(value)).toBe(value);
      });
    });

    const validSpecialLevels = [
      { name: 'VERBOSE', value: AG_LOGLEVEL.VERBOSE },
      { name: 'LOG', value: AG_LOGLEVEL.LOG },
      { name: 'DEFAULT', value: AG_LOGLEVEL.DEFAULT },
    ];

    validSpecialLevels.forEach(({ name, value }) => {
      it(`Then: [正常] - should accept special ${name} level (${value})`, () => {
        expect(validateLogLevel(value)).toBe(value);
      });
    });
  });

  /**
   * @context When
   * @scenario Invalid type validation
   * @description Test validation rejection of non-numeric types
   */
  describe('When: validating invalid types', () => {
    const invalidTypeTests = [
      { name: 'undefined', value: undefined },
      { name: 'null', value: null },
      { name: 'string', value: 'invalid' },
      { name: 'boolean', value: true },
      { name: 'object', value: {} },
      { name: 'array', value: [] },
      { name: 'function', value: () => {} },
    ];

    invalidTypeTests.forEach(({ name, value }) => {
      it(`Then: [異常] - should throw AgLoggerError for ${name} type`, () => {
        expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(value)).toThrow(/Invalid log level/);
      });
    });
  });

  /**
   * @context When
   * @scenario Invalid numeric range validation
   * @description Test validation rejection of out-of-range numeric values
   */
  describe('When: validating invalid numeric ranges', () => {
    const invalidRangeTests = [
      { name: 'negative out of range', value: -1000 },
      { name: 'positive out of range', value: 1000 },
      { name: 'decimal number', value: 3.5 },
      { name: 'NaN', value: NaN },
      { name: 'Infinity', value: Infinity },
      { name: '-Infinity', value: -Infinity },
    ];

    invalidRangeTests.forEach(({ name, value }) => {
      it(`Then: [異常] - should throw AgLoggerError for ${name} (${value})`, () => {
        expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(value)).toThrow(/Invalid log level/);
      });
    });
  });
});

describe('Given: isValidLogLevel boolean validation utility', () => {
  /**
   * @context When
   * @scenario Boolean validity checking
   * @description Test boolean validation of log level values
   */
  describe('When: checking validity', () => {
    it('Then: [正常] - should return true for all valid standard log levels', () => {
      const validLevels = [
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
        expect(isValidLogLevel(level)).toBe(true);
      });
    });

    it('Then: [正常] - should return false for invalid types', () => {
      const invalidInputs = [
        undefined,
        null,
        'string',
        true,
        false,
        {},
        [],
        () => {},
      ];

      invalidInputs.forEach((input) => {
        expect(isValidLogLevel(input)).toBe(false);
      });
    });

    it('Then: [正常] - should return false for invalid numeric ranges', () => {
      const invalidNumbers = [-1000, 1000, 3.5, NaN, Infinity, -Infinity];

      invalidNumbers.forEach((num) => {
        expect(isValidLogLevel(num)).toBe(false);
      });
    });
  });
});

describe('Given: standard level restriction scenarios', () => {
  /**
   * @context When
   * @scenario Standard level restriction validation
   * @description Test handling of special levels in restricted contexts
   */
  describe('When: validating standard level restrictions', () => {
    it('Then: [正常] - should identify VERBOSE as non-standard level', () => {
      expect(isValidLogLevel(AG_LOGLEVEL.VERBOSE)).toBe(true);
      // Note: In contexts where VERBOSE is restricted, additional validation should occur
      // This test confirms VERBOSE is a valid log level but may be restricted in certain contexts
    });

    it('Then: [正常] - should identify LOG as special level', () => {
      expect(isValidLogLevel(AG_LOGLEVEL.LOG)).toBe(true);
      // LOG level bypasses normal level filtering
    });
  });
});

describe('Given: error message validation scenarios', () => {
  /**
   * @context When
   * @scenario Error message validation
   * @description Test proper error messaging for validation failures
   */
  describe('When: validating error messages', () => {
    it('Then: [正常] - should provide descriptive error for undefined input', () => {
      expect(() => validateLogLevel(undefined)).toThrow(/Invalid log level.*undefined/);
    });

    it('Then: [正常] - should provide descriptive error for null input', () => {
      expect(() => validateLogLevel(null)).toThrow(/Invalid log level.*null/);
    });

    it('Then: [正常] - should provide descriptive error for string input', () => {
      expect(() => validateLogLevel('invalid')).toThrow(/Invalid log level.*invalid/);
    });

    it('Then: [正常] - should provide descriptive error for out-of-range numbers', () => {
      expect(() => validateLogLevel(999)).toThrow(/Invalid log level.*999/);
      expect(() => validateLogLevel(-999)).toThrow(/Invalid log level.*-999/);
    });
  });
});

describe('Given: isAgMockConstructor detection utility', () => {
  /**
   * @context When
   * @scenario Mock constructor detection (truthy cases)
   * @description Test detection of valid mock constructor types
   */
  describe('When: checking truthy cases', () => {
    it('Then: [正常] - should return true when passed AgMockFormatter class', () => {
      expect(isAgMockConstructor(AgMockFormatter)).toBe(true);
    });

    it('Then: [正常] - should return true for custom class that meets mock signature', () => {
      class TestMockConstructor {
        static readonly __isMockConstructor = true as const;
        constructor(_routine: AgFormatRoutine) {}
        execute = (msg: AgLogMessage): string => msg.message;
        getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({
          callCount: 0,
          lastMessage: null as AgLogMessage | null,
        });
        reset = (): void => {};
      }

      expect(isAgMockConstructor(TestMockConstructor)).toBe(true);
    });

    it('Then: [正常] - should return true when function has __isMockConstructor=true', () => {
      // 通常の関数（クラスではない）にマーカーを付与
      type MockCtorLike = ((...args: unknown[]) => void) & { __isMockConstructor?: boolean };
      const fn: MockCtorLike = function() {/* noop */};
      fn.__isMockConstructor = true;
      expect(isAgMockConstructor(fn)).toBe(true);
    });
  });

  /**
   * @context When
   * @scenario Mock constructor detection (falsy cases)
   * @description Test rejection of invalid mock constructor types
   */
  describe('When: checking falsy cases', () => {
    it('Then: [正常] - should return false for regular function without marker', () => {
      const fn: () => void = () => {};
      expect(isAgMockConstructor(fn)).toBe(false);
    });

    it('Then: [正常] - should return false for class without __isMockConstructor or when it is false', () => {
      class NoMarker {}
      class FalseMarker {
        static readonly __isMockConstructor = false as unknown as true;
      }
      expect(isAgMockConstructor(NoMarker)).toBe(false);
      expect(isAgMockConstructor(FalseMarker)).toBe(false);
    });

    it('Then: [正常] - should return false for object with __isMockConstructor=true when it is not function', () => {
      const obj = { __isMockConstructor: true };
      expect(isAgMockConstructor(obj)).toBe(false);
    });

    it('Then: [正常] - should return false for primitive values (null/undefined/number/string/boolean)', () => {
      const cases: unknown[] = [null, undefined, 0, 1, 'x', true, false];
      cases.forEach((c) => expect(isAgMockConstructor(c)).toBe(false));
    });
  });
});
