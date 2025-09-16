// src: /src/utils/__tests__/validateLogLevel.spec.ts
// @(#) : LogLevel Validation BDD Test Suite
//
// atsushifx式BDD厳格プロセスによるvalidateLogLevel関数のテスト
//
// Requirements from CLAUDE.md:
// LogLevelが invalid (undefined, null, 文字列などの数字ではない型、範囲外の数値) なら、
// 全てエラーを投げる
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';
import { AgLoggerError } from '../../../shared/types/AgLoggerError.types';
import { validateLogLevel } from '../AgLogValidators';

/**
 * validateLogLevel BDD Test Suite
 * atsushifx式BDD: 自然言語的な記述によるBehavior-Driven Development
 */
describe('Given: valid LogLevel values are provided for validation', () => {
  describe('When: validating standard LogLevel values (0-6)', () => {
    const standardLevels = [
      { name: 'OFF', value: AG_LOGLEVEL.OFF },
      { name: 'FATAL', value: AG_LOGLEVEL.FATAL },
      { name: 'ERROR', value: AG_LOGLEVEL.ERROR },
      { name: 'WARN', value: AG_LOGLEVEL.WARN },
      { name: 'INFO', value: AG_LOGLEVEL.INFO },
      { name: 'DEBUG', value: AG_LOGLEVEL.DEBUG },
      { name: 'TRACE', value: AG_LOGLEVEL.TRACE },
    ] as const;

    standardLevels.forEach(({ name, value }) => {
      it(`Then: [正常] - should return same ${name} level value (${value})`, () => {
        const result = validateLogLevel(value);
        expect(result).toBe(value);
        expect(result).toEqual(value as AgLogLevel);
      });
    });
  });

  describe('When: validating special LogLevel values', () => {
    const specialLevels = [
      { name: 'VERBOSE', value: AG_LOGLEVEL.VERBOSE },
      { name: 'LOG', value: AG_LOGLEVEL.LOG },
      { name: 'DEFAULT', value: AG_LOGLEVEL.DEFAULT },
    ] as const;

    specialLevels.forEach(({ name, value }) => {
      it(`Then: [正常] - should return same ${name} level value (${value})`, () => {
        const result = validateLogLevel(value);
        expect(result).toBe(value);
        expect(result).toEqual(value as AgLogLevel);
      });
    });
  });
});

describe('Feature: invalid type value handling', () => {
  describe('When: validating undefined or null values', () => {
    it('Then: [異常] - should throw AgLoggerError when validating undefined', () => {
      expect(() => validateLogLevel(undefined)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(undefined)).toThrow(/Invalid log level.*undefined/);
    });

    it('Then: [異常] - should throw AgLoggerError when validating null', () => {
      expect(() => validateLogLevel(null)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(null)).toThrow(/Invalid log level.*null/);
    });
  });

  describe('When: validating string type values', () => {
    const stringValues = [
      { name: 'empty string', value: '' },
      { name: 'numeric string', value: '3' },
      { name: 'alphabetic string', value: 'invalid' },
      { name: 'LogLevel name', value: 'ERROR' },
    ];

    stringValues.forEach(({ name, value }) => {
      it(`Then: [異常] - should throw AgLoggerError when validating ${name} (${JSON.stringify(value)})`, () => {
        expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*expected number/);
      });
    });
  });

  describe('When: validating boolean type values', () => {
    [true, false].forEach((value) => {
      it(`Then: [異常] - should throw AgLoggerError when validating ${value}`, () => {
        expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*expected number/);
      });
    });
  });

  describe('When: validating object type values', () => {
    const objectValues = [
      { name: 'empty object', value: {} },
      { name: 'object', value: { level: 3 } },
      { name: 'array', value: [] },
      { name: 'numeric array', value: [3] },
      { name: 'function', value: () => {} },
    ];

    objectValues.forEach(({ name, value }) => {
      it(`Then: [異常] - should throw AgLoggerError when validating ${name}`, () => {
        expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*expected number/);
      });
    });
  });
});

describe('Feature: numeric but invalid value handling', () => {
  describe('When: validating decimal values', () => {
    const decimalValues = [
      { name: 'positive decimal', value: 3.5 },
      { name: 'negative decimal', value: -1.5 },
      { name: 'near zero value', value: 0.1 },
      { name: 'large decimal', value: 999.999 },
    ];

    decimalValues.forEach(({ name, value }) => {
      it(`Then: [異常] - should throw AgLoggerError when validating ${name} (${value})`, () => {
        expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*must be integer/);
      });
    });
  });

  describe('When: validating special numeric values', () => {
    const specialNumbers = [
      { name: 'NaN', value: NaN },
      { name: 'Infinity', value: Infinity },
      { name: '-Infinity', value: -Infinity },
    ];

    specialNumbers.forEach(({ name, value }) => {
      it(`Then: [異常] - should throw AgLoggerError when validating ${name}`, () => {
        expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*must be finite number/);
      });
    });
  });

  describe('When: validating out of range integer values', () => {
    const outOfRangeValues = [
      { name: 'large negative value', value: -1000 },
      { name: 'small negative value', value: -1 },
      { name: 'small positive out of range', value: 7 },
      { name: 'large positive value', value: 1000 },
      { name: 'intermediate invalid value', value: 50 },
    ];

    outOfRangeValues.forEach(({ name, value }) => {
      it(`Then: [異常] - should throw AgLoggerError when validating ${name} (${value})`, () => {
        expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*out of valid range/);
      });
    });
  });
});

describe('Feature: detailed error message generation', () => {
  describe('When: providing specific error details for various invalid input types', () => {
    it('Then: [異常] - should throw message containing undefined when validating undefined', () => {
      expect(() => validateLogLevel(undefined)).toThrow(/undefined/);
    });

    it('Then: [異常] - should throw message containing null when validating null', () => {
      expect(() => validateLogLevel(null)).toThrow(/null/);
    });

    it('Then: [異常] - should throw message containing expected number when validating string', () => {
      expect(() => validateLogLevel('invalid')).toThrow(/expected number/);
    });

    it('Then: [異常] - should throw message containing must be integer when validating decimal', () => {
      expect(() => validateLogLevel(3.5)).toThrow(/must be integer/);
    });

    it('Then: [異常] - should throw message containing out of valid range when validating out of range value', () => {
      expect(() => validateLogLevel(999)).toThrow(/out of valid range/);
    });

    it('Then: [異常] - should throw message containing must be finite number when validating special numeric value', () => {
      expect(() => validateLogLevel(Infinity)).toThrow(/must be finite number/);
    });
  });
});

describe('Given: boundary and edge case values for validation', () => {
  describe('When: handling boundary values properly', () => {
    it('Then: [正常] - should return correctly when validating minimum standard value (0)', () => {
      expect(validateLogLevel(0)).toBe(AG_LOGLEVEL.OFF);
    });

    it('Then: [正常] - should return correctly when validating maximum standard value (6)', () => {
      expect(validateLogLevel(6)).toBe(AG_LOGLEVEL.TRACE);
    });

    it('Then: [正常] - should return correctly when validating minimum special value (-99)', () => {
      expect(validateLogLevel(-99)).toBe(AG_LOGLEVEL.DEFAULT);
    });

    it('Then: [異常] - should throw error when validating just outside boundary (-1)', () => {
      expect(() => validateLogLevel(-1)).toThrow(/out of valid range/);
    });

    it('Then: [異常] - should throw error when validating just outside boundary (7)', () => {
      expect(() => validateLogLevel(7)).toThrow(/out of valid range/);
    });
  });
});

import { AgToLogLevel } from '../AgLogHelpers';

describe('Feature: integrated whitespace and edge case handling', () => {
  describe('When: validating enhanced string cases with whitespace', () => {
    const whitespaceValues = [
      { name: 'spaces only', value: '   ' },
      { name: 'tab only', value: '\t' },
      { name: 'newline only', value: '\n' },
      { name: 'mixed whitespace', value: '  \t\n  ' },
      { name: 'padded number', value: ' 0 ' },
      { name: 'tab padded', value: '\t1\t' },
      { name: 'newline padded', value: '\n2\n' },
    ];

    whitespaceValues.forEach(({ name, value }) => {
      it(`Then: [エッジケース] - should throw AgLoggerError when ${name} is validated`, () => {
        expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(value)).toThrow(/expected number/);
      });
    });
  });
});

describe('Feature: integration with AgToLogLevel conversion function', () => {
  describe('When: converting and validating string level inputs', () => {
    const validStringLevels = [
      { name: 'uppercase ERROR', input: 'ERROR', expected: AG_LOGLEVEL.ERROR },
      { name: 'lowercase warn', input: 'warn', expected: AG_LOGLEVEL.WARN },
      { name: 'spaced INFO', input: ' INFO ', expected: AG_LOGLEVEL.INFO },
      { name: 'lowercase debug', input: 'debug', expected: AG_LOGLEVEL.DEBUG },
    ];

    validStringLevels.forEach(({ name, input, expected }) => {
      it(`Then: [正常] - should validate correctly when ${name}(${input}) via AgToLogLevel`, () => {
        const level = AgToLogLevel(input);
        expect(level).toBeTypeOf('number');
        expect(level).toBe(expected);
        expect(validateLogLevel(level as number)).toBe(level);
      });
    });
  });

  describe('When: validating all AG_LOGLEVEL enumeration values', () => {
    it('Then: [正常] - should accept all when all AG_LOGLEVEL values are validated', () => {
      const allLevels = Object.values(AG_LOGLEVEL) as number[];
      allLevels.forEach((level) => {
        expect(validateLogLevel(level)).toBe(level);
      });
    });
  });
});
