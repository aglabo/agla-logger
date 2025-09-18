// src/plugins/logger/__tests__/MockLogger.spec.ts
// @(#) : Unit tests for MockLogger plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ（Vitest）
import { beforeEach, describe, expect, it } from 'vitest';

// 型定義・インターフェース
import { AG_LOGLEVEL } from '../../../../../shared/types';
import type { AgFormattedLogMessage, AgLogLevel, AgLogMessage } from '../../../../../shared/types';
import type { AgMockBufferLogger } from '../../MockLogger';

// プラグインシステム
import { MockLogger } from '../../MockLogger';

/**
 * @suite MockLogger Message Capture | Unit
 * @description Tests for MockLogger message capture behavior across all log levels
 * @testType unit
 * Scenarios: Standard levels, Special levels, Multiple messages, Data types
 */
describe('Feature: MockLogger message capture behavior', () => {
  let mockLogger: AgMockBufferLogger;

  beforeEach(() => {
    mockLogger = new MockLogger.buffer();
  });

  /**
   * @context When
   * @scenario Standard level capture
   * @description Test message capture for standard log levels (FATAL/ERROR/WARN/INFO/DEBUG/TRACE)
   */
  describe('When: capturing messages for standard log levels', () => {
    // 全ての標準ログレベルでメッセージキャプチャ機能が正常に動作することを検証
    // 各レベル（FATAL/ERROR/WARN/INFO/DEBUG/TRACE）でメッセージを送信し、
    // 対応するレベルで正確にメッセージが保存されることを確認
    it('Then: [正常] - should capture messages for all standard log levels', () => {
      const testCases = [
        { level: AG_LOGLEVEL.FATAL, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.FATAL), message: 'fatal error' },
        { level: AG_LOGLEVEL.ERROR, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.ERROR), message: 'error message' },
        { level: AG_LOGLEVEL.WARN, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.WARN), message: 'warning message' },
        { level: AG_LOGLEVEL.INFO, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.INFO), message: 'info message' },
        { level: AG_LOGLEVEL.DEBUG, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.DEBUG), message: 'debug message' },
        { level: AG_LOGLEVEL.TRACE, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.TRACE), message: 'trace message' },
      ];

      testCases.forEach(({ level, method, message }) => {
        method(message);
        expect(mockLogger.getMessages(level)).toEqual([message]);
        mockLogger.clearMessages(level);
      });
    });
  });

  /**
   * @context When
   * @scenario Special level capture
   * @description Test message capture for special log levels (VERBOSE/LOG)
   */
  describe('When: capturing messages for special log levels', () => {
    // VERBOSE レベル(-99)でのメッセージキャプチャ機能を検証
    // verbose()メソッドで送信したメッセージが正しくVERBOSEレベルで保存されることを確認
    // 特殊レベルの基本的なメッセージ保存機能をテスト
    it('Then: [正常] - should capture VERBOSE level messages correctly', () => {
      const verboseMessage = 'verbose diagnostic message';

      mockLogger.verbose(verboseMessage);

      expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual([verboseMessage]);
    });

    // LOG レベル(-12)でのメッセージキャプチャ機能を検証
    // getLoggerFunction()で取得した動的関数を使用してLOGレベルでメッセージを送信
    // 動的に生成された関数が正しく動作することを確認
    it('Then: [正常] - should capture LOG level messages correctly', () => {
      const logMessage = 'force output message';
      const logFunction = mockLogger.getLoggerFunction(AG_LOGLEVEL.LOG);

      logFunction(logMessage);

      expect(mockLogger.getMessages(AG_LOGLEVEL.LOG)).toEqual([logMessage]);
    });

    // LOG レベル(-12)でのメッセージキャプチャ機能を検証
    // getLoggerFunction()で取得した動的関数を使用してLOGレベルでメッセージを送信
    // 特殊レベルの動的関数生成とメッセージ保存が正常に動作することを確認
    it('Then: [正常] - should capture LOG level messages correctly', () => {
      const forceMessage = 'forced output message';
      const forceFunction = mockLogger.getLoggerFunction(AG_LOGLEVEL.LOG);

      forceFunction(forceMessage);

      expect(mockLogger.getMessages(AG_LOGLEVEL.LOG)).toEqual([forceMessage]);
    });

    // 特殊レベルと標準レベルの独立性を検証
    // 複数の異なるレベル（VERBOSE/INFO/LOG）に同時にメッセージを送信し、
    // 各レベルが独立して正しくメッセージを保存することを確認
    it('Then: [正常] - should handle special levels independently from standard levels', () => {
      mockLogger.verbose('verbose msg');
      mockLogger.info('info msg');
      const logFunction = mockLogger.getLoggerFunction(AG_LOGLEVEL.LOG);
      logFunction('log msg');

      expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual(['verbose msg']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info msg']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.LOG)).toEqual(['log msg']);
    });
  });

  /**
   * @context When
   * @scenario Multiple message handling
   * @description Test multiple message accumulation and various data type support
   */
  describe('When: handling multiple messages and data types', () => {
    // 同一レベルでの複数メッセージ蓄積機能を検証
    // 同じレベル（ERROR）に複数のメッセージを連続送信し、全てが順序通りに保存されることを確認
    // 異なるレベル（INFO）が影響を受けないことも検証
    it('Then: [正常] - should handle multiple messages per level', () => {
      mockLogger.error('first error');
      mockLogger.error('second error');
      mockLogger.info('info message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['first error', 'second error']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);
    });

    // AgLogMessageオブジェクトと文字列の両方の入力形式に対応することを検証
    // 構造化されたAgLogMessage型と単純な文字列メッセージの両方が正しく保存されることを確認
    // 異なる入力形式が混在しても適切に処理されることをテスト
    it('Then: [正常] - should accept AgLogMessage objects as well as strings', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2023-12-01T10:30:00Z'),
        message: 'Structured log message',
        args: [{ userId: 123, action: 'login' }],
      };
      const stringMessage = 'Simple string message';

      mockLogger.info(logMessage);
      mockLogger.info(stringMessage);

      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual(logMessage);
      expect(messages[1]).toEqual(stringMessage);
    });

    // 全ロガーメソッドでAgLogMessageオブジェクトが正しく処理されることを検証
    // 標準レベル（FATAL/ERROR/WARN/INFO/DEBUG/TRACE）と特殊レベル（VERBOSE/LOG/LOG）の両方で
    // 構造化されたAgLogMessageオブジェクトが適切に受け入れられ保存されることを確認
    it('Then: [正常] - should accept AgLogMessage objects in all logger methods including special levels', () => {
      const createLogMessage = (level: AgLogLevel, msg: string): AgLogMessage => ({
        logLevel: level,
        timestamp: new Date('2023-12-01T10:30:00Z'),
        message: msg,
        args: [],
      });

      const createTestMethod = (level: AgLogLevel) => (msg: AgFormattedLogMessage) => mockLogger.executeLog(level, msg);

      const testCases = [
        { method: createTestMethod(AG_LOGLEVEL.FATAL), name: 'fatal', level: AG_LOGLEVEL.FATAL },
        { method: createTestMethod(AG_LOGLEVEL.ERROR), name: 'error', level: AG_LOGLEVEL.ERROR },
        { method: createTestMethod(AG_LOGLEVEL.WARN), name: 'warn', level: AG_LOGLEVEL.WARN },
        { method: createTestMethod(AG_LOGLEVEL.INFO), name: 'info', level: AG_LOGLEVEL.INFO },
        { method: createTestMethod(AG_LOGLEVEL.DEBUG), name: 'debug', level: AG_LOGLEVEL.DEBUG },
        { method: createTestMethod(AG_LOGLEVEL.TRACE), name: 'trace', level: AG_LOGLEVEL.TRACE },
        { method: createTestMethod(AG_LOGLEVEL.VERBOSE), name: 'verbose', level: AG_LOGLEVEL.VERBOSE },
        { method: createTestMethod(AG_LOGLEVEL.LOG), name: 'log', level: AG_LOGLEVEL.LOG },
        { method: createTestMethod(AG_LOGLEVEL.LOG), name: 'log', level: AG_LOGLEVEL.LOG },
      ];

      testCases.forEach(({ method, name, level }) => {
        const logMessage = createLogMessage(level, `${name} structured message`);
        method(logMessage);
        expect(mockLogger.getMessages(level)).toContain(logMessage);
        mockLogger.clearMessages(level);
      });
    });
  });
});

/**
 * @suite MockLogger Message Query | Unit
 * @description Tests for MockLogger message query and retrieval behavior
 * @testType unit
 * Scenarios: Individual queries, Message overview, Count verification
 */
describe('Feature: MockLogger message query behavior', () => {
  let mockLogger: AgMockBufferLogger;

  beforeEach(() => {
    mockLogger = new MockLogger.buffer();
    // テスト用メッセージを事前設定
    mockLogger.error('error1');
    mockLogger.error('error2');
    mockLogger.info('info1');
    mockLogger.warn('warn1');
  });

  /**
   * @context When
   * @scenario Individual message queries
   * @description Test specific level, last message, count, and existence queries
   */
  describe('When: querying individual messages', () => {
    // MockLoggerの包括的なクエリ機能を検証
    // 特定レベルのメッセージ取得、最新メッセージ取得、メッセージ数確認、存在確認など
    // 全てのクエリ機能が正しく動作することを一括でテスト
    it('Then: [正常] - should provide comprehensive query capabilities', () => {
      // 特定レベルのメッセージ取得
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error1', 'error2']);
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('error2');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.DEBUG)).toBeNull();

      // メッセージ数の確認
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(2);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(1);
      expect(mockLogger.getTotalMessageCount()).toBe(4);

      // メッセージ存在確認
      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(true);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.DEBUG)).toBe(false);
      expect(mockLogger.hasAnyMessages()).toBe(true);
    });
  });

  /**
   * @context When
   * @scenario Complete message overview
   * @description Test comprehensive message overview retrieval across all levels
   */
  describe('When: retrieving complete message overview', () => {
    // 全レベルメッセージの包括的な概要取得機能を検証
    // getAllMessages()メソッドで全ログレベルのメッセージを一括取得し、
    // 各レベルのメッセージが正しく分類されて返されることを確認
    it('Then: [正常] - should provide complete message overview', () => {
      const allMessages = mockLogger.getAllMessages();
      expect(allMessages.ERROR).toEqual(['error1', 'error2']);
      expect(allMessages.INFO).toEqual(['info1']);
      expect(allMessages.WARN).toEqual(['warn1']);
      expect(allMessages.DEBUG).toEqual([]);
    });

    // 特殊レベルメッセージが正しいキーで個別に返されることを検証
    // VERBOSE、LOG、LOGなどの特殊レベルメッセージがgetAllMessages()で
    // 適切なキー名で分類され、他のレベルと混在しないことを確認
    it('Then: [正常] - should return special level messages in correct keys separately', () => {
      // 特殊レベルのメッセージを追加
      mockLogger.verbose('verbose message 1');
      mockLogger.verbose('verbose message 2');
      mockLogger.trace('trace message 1');

      const logFunction = mockLogger.getLoggerFunction(AG_LOGLEVEL.LOG);
      logFunction('log message 1');
      logFunction('force message 1');

      const allMessages = mockLogger.getAllMessages();

      expect(allMessages.VERBOSE).toEqual(['verbose message 1', 'verbose message 2']);
      expect(allMessages.TRACE).toEqual(['trace message 1']);
      expect(allMessages.LOG).toEqual(['log message 1', 'force message 1']);
    });
  });
});

/**
 * @suite MockLogger Message Management | Unit
 * @description Tests for MockLogger message management and clearing behavior
 * @testType unit
 * Scenarios: Selective clearing, Complete clearing, Management workflows
 */
describe('Feature: MockLogger message management behavior', () => {
  let mockLogger: AgMockBufferLogger;

  beforeEach(() => {
    mockLogger = new MockLogger.buffer();
    // テスト用メッセージを事前設定
    mockLogger.error('error message');
    mockLogger.info('info message');
    mockLogger.warn('warn message');
  });

  /**
   * @context When
   * @scenario Selective message clearing
   * @description Test selective message clearing for specific levels
   */
  describe('When: clearing messages selectively', () => {
    // 特定レベルのメッセージを選択的にクリアする機能を検証
    // 指定したレベル（ERROR）のメッセージのみがクリアされ、
    // 他のレベル（INFO、WARN）のメッセージが影響を受けないことを確認
    it('Then: [正常] - should clear messages selectively without affecting other levels', () => {
      // 特定レベルのクリア
      mockLogger.clearMessages(AG_LOGLEVEL.ERROR);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual([]);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn message']);
    });

    // 特殊レベルメッセージの選択的クリア機能を検証
    // VERBOSE、LOG、LOGなどの特殊レベルでも選択的クリアが正常に動作し、
    // 指定したレベルのみがクリアされて他は保持されることを確認
    it('Then: [正常] - should clear special level messages correctly', () => {
      // 特殊レベルのメッセージを追加
      mockLogger.verbose('verbose message');
      const logFunction = mockLogger.getLoggerFunction(AG_LOGLEVEL.LOG);
      logFunction('log message');
      logFunction('force message');

      // 特殊レベルのクリア
      mockLogger.clearMessages(AG_LOGLEVEL.VERBOSE);
      mockLogger.clearMessages(AG_LOGLEVEL.LOG);

      expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual([]);
      expect(mockLogger.getMessages(AG_LOGLEVEL.LOG)).toEqual([]);
    });
  });

  /**
   * @context When
   * @scenario Complete message clearing
   * @description Test complete message clearing across all levels
   */
  describe('When: clearing all messages', () => {
    // 全レベルのメッセージを一括クリアする機能を検証
    // clearAllMessages()メソッドで標準レベルと特殊レベルの全メッセージが削除され、
    // すべてのクエリ機能が空状態を正しく報告することを確認
    it('Then: [正常] - should clear all messages completely', () => {
      // 特殊レベルのメッセージも追加
      mockLogger.verbose('verbose message');
      const logFunction = mockLogger.getLoggerFunction(AG_LOGLEVEL.LOG);
      logFunction('log message');

      // 全メッセージクリア
      mockLogger.clearAllMessages();
      expect(mockLogger.hasAnyMessages()).toBe(false);
      expect(mockLogger.getTotalMessageCount()).toBe(0);
      expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual([]);
      expect(mockLogger.getMessages(AG_LOGLEVEL.LOG)).toEqual([]);
    });

    // 新しいメソッドによるエラーメッセージ管理機能を検証
    // 新しいMockLoggerインスタンスでエラーメッセージの追加、取得、クリアが
    // 正常に動作することを基本的なワークフローで確認
    it('Then: [正常] - should support error message management with new methods', () => {
      const testLogger = new MockLogger.buffer();
      testLogger.error('error message');

      expect(testLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error message']);
      expect(testLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('error message');

      testLogger.clearMessages(AG_LOGLEVEL.ERROR);
      expect(testLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual([]);
    });
  });
});

/**
 * @suite MockLogger Function Generation | Unit
 * @description Tests for MockLogger dynamic logger function generation
 * @testType unit
 * Scenarios: Default logger maps, Dynamic map creation, Function validation
 */
describe('Feature: MockLogger logger function generation', () => {
  let mockLogger: AgMockBufferLogger;

  beforeEach(() => {
    mockLogger = new MockLogger.buffer();
  });

  /**
   * @context When
   * @scenario Default logger map creation
   * @description Test default logger map creation and basic operation
   */
  describe('When: creating default logger maps', () => {
    // デフォルトロガーマップの作成と基本動作を検証
    // defaultLoggerMapプロパティから取得した関数が正しく動作し、
    // OFFレベルが何もしないことも含めて適切にメッセージが処理されることを確認
    it('Then: [正常] - should create functional logger maps', () => {
      const loggerMap = mockLogger.defaultLoggerMap;
      loggerMap[AG_LOGLEVEL.ERROR]?.('error via map');
      loggerMap[AG_LOGLEVEL.WARN]?.('warn via map');

      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error via map']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn via map']);

      // OFFレベルは何もしない
      loggerMap[AG_LOGLEVEL.OFF]?.('should not log');
      expect(mockLogger.hasMessages(AG_LOGLEVEL.OFF)).toBe(false);
    });
  });

  /**
   * @context When
   * @scenario Dynamic logger map creation
   * @description Test createLoggerMap method for dynamic logger function mapping
   */
  describe('When: creating dynamic logger maps', () => {
    // createLoggerMapで全標準レベルが含まれることを検証
    // 動的に生成されたロガーマップに全ての標準レベル（FATAL/ERROR/WARN/INFO/DEBUG/TRACE）が
    // 含まれ、各レベルの関数が正しくメッセージを保存することを確認
    it('Then: [正常] - should include all standard levels in createLoggerMap', () => {
      const loggerMap = mockLogger.createLoggerMap();

      // 標準レベルの確認
      loggerMap[AG_LOGLEVEL.FATAL]?.('fatal via map');
      loggerMap[AG_LOGLEVEL.ERROR]?.('error via map');
      loggerMap[AG_LOGLEVEL.WARN]?.('warn via map');
      loggerMap[AG_LOGLEVEL.INFO]?.('info via map');
      loggerMap[AG_LOGLEVEL.DEBUG]?.('debug via map');
      loggerMap[AG_LOGLEVEL.TRACE]?.('trace via map');

      expect(mockLogger.getMessages(AG_LOGLEVEL.FATAL)).toEqual(['fatal via map']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error via map']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn via map']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info via map']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toEqual(['debug via map']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.TRACE)).toEqual(['trace via map']);
    });

    // createLoggerMapで特殊レベルが正しくマッピングされることを検証
    // 動的に生成されたロガーマップにVERBOSE、LOG、LOGなどの特殊レベルが
    // 含まれ、各特殊レベルの関数が適切にメッセージを保存することを確認
    it('Then: [正常] - should include special levels in createLoggerMap with correct mapping', () => {
      const loggerMap = mockLogger.createLoggerMap();

      // 特殊レベルのテスト
      loggerMap[AG_LOGLEVEL.VERBOSE]?.('verbose message via map');
      loggerMap[AG_LOGLEVEL.LOG]?.('log message via map');
      loggerMap[AG_LOGLEVEL.LOG]?.('force output message via map');

      expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual(['verbose message via map']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.LOG)).toEqual(['log message via map', 'force output message via map']);
    });
  });
});

/**
 * @suite MockLogger Input Validation | Unit
 * @description Tests for MockLogger input validation and error handling
 * @testType unit
 * Scenarios: Type validation, Range validation, Consistency validation
 */
describe('Feature: MockLogger input validation', () => {
  let mockLogger: AgMockBufferLogger;

  beforeEach(() => {
    mockLogger = new MockLogger.buffer();
  });

  /**
   * @context When
   * @scenario Type validation
   * @description Test error handling for invalid log level types
   */
  describe('When: validating input types', () => {
    // 文字列型ログレベルに対する厳密なエラー処理を検証
    // 数値でない文字列（'DEBUG'）がログレベルとして渡された際に、
    // 適切なエラーメッセージと共に例外が投げられることを確認
    it('Then: [異常] - should throw error for string log levels with exact format', () => {
      const stringLevel = 'DEBUG' as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(stringLevel))
        .toThrow('MockLogger: Invalid log level: DEBUG');
    });

    // ブール型ログレベルに対する厳密なエラー処理を検証
    // 真偽値（true）がログレベルとして渡された際に、
    // 適切なエラーメッセージと共に例外が投げられることを確認
    it('Then: [異常] - should throw error for boolean log levels with exact format', () => {
      const booleanLevel = true as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(booleanLevel))
        .toThrow('MockLogger: Invalid log level: true');
    });

    // オブジェクト型ログレベルに対する厳密なエラー処理を検証
    // オブジェクト（{level: 1}）がログレベルとして渡された際に、
    // 適切なエラーメッセージと共に例外が投げられることを確認
    it('Then: [異常] - should throw error for object log levels with exact format', () => {
      const objectLevel = { level: 1 } as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(objectLevel))
        .toThrow('MockLogger: Invalid log level: [object Object]');
    });

    // 配列型ログレベルに対する厳密なエラー処理を検証
    // 配列（[1, 2, 3]）がログレベルとして渡された際に、
    // 適切なエラーメッセージと共に例外が投げられることを確認
    it('Then: [異常] - should throw error for array log levels with exact format', () => {
      const arrayLevel = [1, 2, 3] as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(arrayLevel))
        .toThrow('MockLogger: Invalid log level: 1,2,3');
    });

    // null/undefined型ログレベルに対する厳密なエラー処理を検証
    // null値やundefined値がログレベルとして渡された際に、
    // それぞれ適切なエラーメッセージと共に例外が投げられることを確認
    it('Then: [異常] - should throw error for null and undefined log levels with exact format', () => {
      expect(() => mockLogger.getMessages(null as unknown as AgLogLevel))
        .toThrow('MockLogger: Invalid log level: null');
      expect(() => mockLogger.getMessages(undefined as unknown as AgLogLevel))
        .toThrow('MockLogger: Invalid log level: undefined');
    });
  });

  /**
   * @context When
   * @scenario Range validation
   * @description Test error handling for out-of-range numeric log levels
   */
  describe('When: validating input ranges', () => {
    // 範囲外の正数に対する厳密なエラー処理を検証
    // 有効範囲を超える正の数値（7）がログレベルとして渡された際に、
    // 適切なエラーメッセージと共に例外が投げられることを確認
    it('Then: [異常] - should throw error for out-of-range positive numbers with exact format', () => {
      const outOfRangeLevel = 7 as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(outOfRangeLevel))
        .toThrow('MockLogger: Invalid log level: 7');
    });

    // 範囲外の負数に対する厳密なエラー処理を検証
    // 有効範囲外の負の数値（-1）がログレベルとして渡された際に、
    // 適切なエラーメッセージと共に例外が投げられることを確認
    it('Then: [異常] - should throw error for out-of-range negative numbers with exact format', () => {
      const negativeLevel = -1 as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(negativeLevel))
        .toThrow('MockLogger: Invalid log level: -1');
    });

    // VERBOSE範囲近辺の無効な負数に対する厳密なエラー処理を検証
    // VERBOSE(-99)に近いが無効な負の数値（-97）がログレベルとして渡された際に、
    // 適切なエラーメッセージと共に例外が投げられることを確認
    it('Then: [異常] - should throw error for invalid negative numbers near VERBOSE range with exact format', () => {
      const nearVerboseLevel = -97 as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(nearVerboseLevel))
        .toThrow(`MockLogger: Invalid log level: ${nearVerboseLevel}`);
    });

    // 小数点数に対する厳密なエラー処理を検証
    // 整数でない小数点数値（1.5）がログレベルとして渡された際に、
    // 適切なエラーメッセージと共に例外が投げられることを確認
    it('Then: [異常] - should throw error for decimal numbers with exact format', () => {
      const decimalLevel = 1.5 as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(decimalLevel))
        .toThrow('MockLogger: Invalid log level: 1.5');
    });

    // 大きな範囲外数値に対する厳密なエラー処理を検証
    // 大幅に範囲を超える大きな数値（999）がログレベルとして渡された際に、
    // 適切なエラーメッセージと共に例外が投げられることを確認
    it('Then: [異常] - should throw error for large out-of-range numbers with exact format', () => {
      const largeLevel = 999 as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(largeLevel))
        .toThrow('MockLogger: Invalid log level: 999');
    });
  });

  /**
   * Method Consistency - 全メソッド一貫性検証
   *
   * @description 全クエリメソッドでの一貫したバリデーション動作を検証
   */
  describe('When: ensuring method consistency', () => {
    const invalidLevel = 999 as unknown as AgLogLevel;

    // 全クエリメソッドでのログレベル検証の一貫性を確認
    // getMessages、clearMessages、hasMessages、getMessageCount、getLastMessageの
    // 全てのメソッドで無効なログレベルに対して同じエラー処理が行われることを検証
    it('Then: [異常] - should validate log levels consistently in all query methods', () => {
      expect(() => mockLogger.getMessages(invalidLevel))
        .toThrow('MockLogger: Invalid log level: 999');
      expect(() => mockLogger.clearMessages(invalidLevel))
        .toThrow('MockLogger: Invalid log level: 999');
      expect(() => mockLogger.hasMessages(invalidLevel))
        .toThrow('MockLogger: Invalid log level: 999');
      expect(() => mockLogger.getMessageCount(invalidLevel))
        .toThrow('MockLogger: Invalid log level: 999');
      expect(() => mockLogger.getLastMessage(invalidLevel))
        .toThrow('MockLogger: Invalid log level: 999');
    });
  });

  /**
   * Empty State Safety - 空状態安全性
   *
   * @description 空状態での安全な操作を確認
   */
  describe('When: handling empty states safely', () => {
    // 空状態での安全な操作処理を検証
    // 新しいMockLoggerインスタンス（メッセージが何もない状態）で各種クエリ操作が
    // 例外を投げることなく適切なデフォルト値を返すことを確認
    it('Then: [エッジケース] - should handle empty state operations safely', () => {
      const emptyLogger = new MockLogger.buffer();

      expect(emptyLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBeNull();
      expect(emptyLogger.getTotalMessageCount()).toBe(0);
      expect(emptyLogger.hasAnyMessages()).toBe(false);
      expect(() => emptyLogger.clearAllMessages()).not.toThrow();
    });
  });
});

/**
 * @suite MockLogger Edge Cases | Unit
 * @description Tests for MockLogger edge cases and boundary conditions
 * @testType unit
 * Scenarios: Data integrity, Special inputs, Boundary conditions
 */
describe('Feature: MockLogger edge cases and boundary conditions', () => {
  let mockLogger: AgMockBufferLogger;

  beforeEach(() => {
    mockLogger = new MockLogger.buffer();
  });

  type TestNestedData = {
    user: {
      id: number;
      profile: {
        name: string;
      };
    };
  };

  /**
   * @context When
   * @scenario Data integrity maintenance
   * @description Test message data immutability and reference consistency
   */
  describe('When: maintaining data integrity', () => {
    // データの不変性保証機能を検証
    // getMessages()やgetAllMessages()で返された配列を外部で変更しても、
    // MockLogger内部の状態が影響を受けず保護されることを確認
    it('Then: [正常] - should maintain data immutability', () => {
      mockLogger.error('original error');

      // 返された配列を変更しても内部状態は保護される
      const messages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      messages.push('external modification');
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['original error']);

      // getAllMessagesでも同様
      const allMessages = mockLogger.getAllMessages();
      allMessages.ERROR.push('external modification');
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['original error']);
    });

    // AgLogMessageオブジェクトの参照一貫性を検証
    // 構造化されたAgLogMessageオブジェクトが正しく保存され、取得時に同じ参照を返すことを確認
    // ネストしたオブジェクト構造も含めて参照整合性が保たれることをテスト
    it('Then: [正常] - should return same object references for AgLogMessage objects', () => {
      const nestedLogMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2023-12-01T10:30:00Z'),
        message: 'Nested object test',
        args: [{ user: { id: 123, profile: { name: 'test' } } }],
      };

      mockLogger.info(nestedLogMessage);
      const retrievedMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      const allMessages = mockLogger.getAllMessages();

      // should return same object references (JavaScript standard behavior)
      expect(retrievedMessages[0]).toBe(nestedLogMessage);
      expect(allMessages.INFO[0]).toBe(nestedLogMessage);

      // Verify object structure is preserved
      if (typeof retrievedMessages[0] === 'object' && 'args' in retrievedMessages[0]) {
        const args = retrievedMessages[0].args;
        const testData = args[0] as TestNestedData;
        expect(testData.user.id).toBe(123);
        expect(testData.user.profile.name).toBe('test');
      }
    });
  });

  /**
   * @context When
   * @scenario Special input handling
   * @description Test robust handling of special input values
   */
  describe('When: handling special inputs', () => {
    // 特殊なメッセージ型に対する堅牢な処理を検証
    // 空文字列、大量空白、改行、Unicode、undefined、null、数値、オブジェクト、配列など
    // 様々な特殊入力がエラーを起こすことなく適切に処理されることを確認
    it('Then: [エッジケース] - should handle special message types', () => {
      const specialCases = [
        '', // 空文字列
        ' '.repeat(1000), // 大量の空白
        'multi\nline\nmessage', // 改行を含む
        'unicode: 🚀 テスト 中文', // Unicode文字
        undefined, // undefined
        null, // null
        123, // 数値
        { object: 'value' }, // オブジェクト
        ['array', 'values'], // 配列
      ];

      specialCases.forEach((testCase, _index) => {
        mockLogger.info(testCase as string);
        const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
        expect(messages).toContain(testCase);
        mockLogger.clearMessages(AG_LOGLEVEL.INFO);
      });
    });
  });

  /**
   * @context When
   * @scenario Boundary condition testing
   * @description Test safety under boundary conditions and concurrent operations
   */
  describe('When: testing boundary conditions', () => {
    // 並行操作の安全性を検証
    // 複数の操作（メッセージ追加、取得、カウント、クリア）を連続実行しても
    // 状態の整合性が保たれ、各操作が期待通りの結果を返すことを確認
    it('Then: [エッジケース] - should handle concurrent operations safely', () => {
      // 複数の操作を連続実行
      mockLogger.error('error1');
      const count1 = mockLogger.getMessageCount(AG_LOGLEVEL.ERROR);
      mockLogger.info('info1');
      const hasError = mockLogger.hasMessages(AG_LOGLEVEL.ERROR);
      mockLogger.clearMessages(AG_LOGLEVEL.ERROR);
      const count2 = mockLogger.getMessageCount(AG_LOGLEVEL.ERROR);

      expect(count1).toBe(1);
      expect(hasError).toBe(true);
      expect(count2).toBe(0);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
    });

    // 特殊レベルでの境界条件処理を検証
    // VERBOSE、LOG、LOGなどの特殊レベルを含む複合操作で
    // 総メッセージ数管理、選択的クリア、残存確認が正しく動作することを確認
    it('Then: [エッジケース] - should handle special levels in boundary conditions', () => {
      // 特殊レベルでの境界条件テスト
      mockLogger.verbose('verbose1');
      const logFunction = mockLogger.getLoggerFunction(AG_LOGLEVEL.LOG);
      logFunction('log1');
      const forceFunction = mockLogger.getLoggerFunction(AG_LOGLEVEL.LOG);
      forceFunction('force1');

      expect(mockLogger.getTotalMessageCount()).toBe(3);
      expect(mockLogger.hasAnyMessages()).toBe(true);

      mockLogger.clearMessages(AG_LOGLEVEL.VERBOSE);
      expect(mockLogger.getTotalMessageCount()).toBe(2);
      expect(mockLogger.getMessages(AG_LOGLEVEL.LOG)).toEqual(['log1', 'force1']);
    });
  });
});
