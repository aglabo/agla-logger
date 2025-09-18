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

// 外部ライブラリ - VitestのBDDスタイルAPI
import { describe, expect, it } from 'vitest';

// 型定義・インターフェース - ログレベル型エイリアス
import type { AgLogLevel } from '../../../shared/types';

// 定数・設定 - ログレベル列挙体
import { AG_LOGLEVEL } from '../../../shared/types';

// エラーモデル - ロガー専用エラークラス
import { AgLoggerError } from '../../../shared/types/AgLoggerError.types';

// 内部実装 - 検証対象ユーティリティ
import { validateLogLevel } from '../AgLogValidators';

/**
 * @suite Validate LogLevel Happy Path | Utility Validation
 * @description 有効なログレベル値がvalidateLogLevelでそのまま受理されるかを確認する
 * @testType unit
 * Scenarios: 標準レベル受理, 特殊レベル受理, 列挙網羅性
 */
describe('Given: valid LogLevel values are provided for validation', () => {
  /**
   * @context When
   * @scenario 標準ログレベル値を検証する
   * @description OFFからTRACEまでの標準ログレベルをvalidateLogLevelで検証した際の受理挙動を確認する
   */
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

  /**
   * @context When
   * @scenario 特殊ログレベル値を検証する
   * @description VERBOSE/LOG/DEFAULTといった特殊レベルの受理可否を確認する
   */
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

/**
 * @suite Invalid Type Handling | validateLogLevel
 * @description 非数値型入力に対してAgLoggerErrorが発生するかを検証する
 * @testType unit
 * Scenarios: undefined/null, 文字列, 真偽値, オブジェクト
 */
describe('Feature: invalid type value handling', () => {
  /**
   * @context When
   * @scenario undefinedやnullを検証する
   * @description undefined/null入力時にエラーが発生するかを確認する
   */
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

  /**
   * @context When
   * @scenario 文字列型の値を検証する
   * @description 文字列入力に対して数値期待のエラーメッセージが返るかを確認する
   */
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

  /**
   * @context When
   * @scenario 真偽値を検証する
   * @description 真偽値入力時にエラーが投げられるかを確認する
   */
  describe('When: validating boolean type values', () => {
    [true, false].forEach((value) => {
      it(`Then: [異常] - should throw AgLoggerError when validating ${value}`, () => {
        expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*expected number/);
      });
    });
  });

  /**
   * @context When
   * @scenario オブジェクト型の値を検証する
   * @description オブジェクトや配列など非プリミティブ入力に対するエラー挙動を確認する
   */
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

/**
 * @suite Numeric Invalid Handling | validateLogLevel
 * @description 数値型であっても不正な値に対して正しくエラーが発生するかを検証する
 * @testType unit
 * Scenarios: 小数, 特殊数値, 範囲外整数
 */
describe('Feature: numeric but invalid value handling', () => {
  /**
   * @context When
   * @scenario 小数値を検証する
   * @description 整数以外の数値入力をvalidateLogLevelが拒否するかを確認する
   */
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

  /**
   * @context When
   * @scenario 特殊数値を検証する
   * @description NaNやInfinityなどの特殊数値に対するエラー挙動を確認する
   */
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

  /**
   * @context When
   * @scenario 範囲外の整数を検証する
   * @description 許容範囲外の整数値に対するエラー発生を検証する
   */
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

/**
 * @suite Detailed Error Message Generation | validateLogLevel
 * @description エラーメッセージが入力タイプごとに期待通りの詳細を含むかを検証する
 * @testType unit
 * Scenarios: undefined/null, 型不一致, 範囲外値, 特殊数値
 */
describe('Feature: detailed error message generation', () => {
  /**
   * @context When
   * @scenario 多様な不正入力に対して詳細情報を提供する
   * @description 各種不正入力時のエラーメッセージ内容を確認する
   */
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

/**
 * @suite Boundary Value Validation | validateLogLevel
 * @description 境界値やエッジケースを扱った際の受理と拒否が正しいかを確認する
 * @testType unit
 * Scenarios: 標準境界値受理, 範囲外境界拒否, 下限上限検証
 */
describe('Given: boundary and edge case values for validation', () => {
  /**
   * @context When
   * @scenario 境界値を適切に処理する
   * @description 境界上と境界外の値に対する挙動を検証する
   */
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

/**
 * @suite Whitespace Edge Case Handling | validateLogLevel
 * @description 空白を含む文字列ケースが正しく拒否されるかを検証する
 * @testType unit
 * Scenarios: 空白のみ, パディング文字列, 混在ホワイトスペース
 */
describe('Feature: integrated whitespace and edge case handling', () => {
  /**
   * @context When
   * @scenario ホワイトスペースを含む文字列を検証する
   * @description 空白やタブなどを含む入力でのエラー発生を確認する
   */
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

/**
 * @suite AgToLogLevel Integration | validateLogLevel
 * @description AgToLogLevelとの連携時に変換された値が正しく検証されるかを確認する
 * @testType unit
 * Scenarios: 文字列変換受理, 列挙一括検証, 正常系連携
 */
describe('Feature: integration with AgToLogLevel conversion function', () => {
  /**
   * @context When
   * @scenario 文字列レベルを変換して検証する
   * @description 文字列入力をAgToLogLevelで変換しvalidateLogLevelが受理するかを確認する
   */
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

  /**
   * @context When
   * @scenario AG_LOGLEVEL列挙をすべて検証する
   * @description 列挙される各ログレベル値がvalidateLogLevelで受理されるかを確認する
   */
  describe('When: validating all AG_LOGLEVEL enumeration values', () => {
    it('Then: [正常] - should accept all when all AG_LOGLEVEL values are validated', () => {
      const allLevels = Object.values(AG_LOGLEVEL) as number[];
      allLevels.forEach((level) => {
        expect(validateLogLevel(level)).toBe(level);
      });
    });
  });
});
