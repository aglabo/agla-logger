// src: /src/plugins/formatter/__tests__/MockFormatter.spec.ts
// @(#) : MockFormatter Unit Test Suite
//
// BDD tests for MockFormatter plugin functionality and behavior
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// types
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgFormatFunction, AgLogMessage } from '../../../../shared/types';
import type { AgFormatRoutine } from '../../../../shared/types/AgMockConstructor.class';

// target
import { createMockFormatter, MockFormatter } from '../MockFormatter';

// test with AgLoggerConfig
import { AgLoggerConfig } from '../../../internal/AgLoggerConfig.class';

/**
 * MockFormatter Test Suite
 *
 * atsushifx式BDD厳格プロセスに従い、it/expect単位でテストケースを分割
 * Red-Green-Refactorサイクルを維持した実装
 */
describe('Feature: createMockFormatter function basic behavior', () => {
  describe('When: providing custom routine to createMockFormatter', () => {
    it('Then: [正常] - should return class constructor when custom routine is provided', () => {
      const customRoutine: AgFormatRoutine = (msg) => `custom: ${msg.message}`;
      const FormatterClass = createMockFormatter(customRoutine);

      expect(typeof FormatterClass).toBe('function');
    });

    it('Then: [正常] - should have __isMockConstructor marker in returned class', () => {
      const customRoutine: AgFormatRoutine = (msg) => `custom: ${msg.message}`;
      const FormatterClass = createMockFormatter(customRoutine);

      expect(FormatterClass.__isMockConstructor).toBe(true);
    });

    it('Then: [正常] - should bind custom routine during instantiation', () => {
      const customRoutine: AgFormatRoutine = (msg) => `custom: ${msg.message}`;
      const FormatterClass = createMockFormatter(customRoutine);
      const instance = new FormatterClass(customRoutine);

      // インスタンスにexecuteメソッドが存在することを確認
      expect(instance.execute).toBeDefined();
      expect(typeof instance.execute).toBe('function');
    });

    it('Then: [正常] - should call custom routine via execute method', () => {
      const customRoutine: AgFormatRoutine = (msg) => `custom: ${msg.message}`;
      const FormatterClass = createMockFormatter(customRoutine);
      const instance = new FormatterClass(customRoutine);

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Test message',
        args: [],
      };

      const result = instance.execute(testMessage);
      expect(result).toBe('custom: Test message');
    });

    it('Then: [正常] - should inherit getStats and reset methods', () => {
      const customRoutine: AgFormatRoutine = (msg) => `custom: ${msg.message}`;
      const FormatterClass = createMockFormatter(customRoutine);
      const instance = new FormatterClass(customRoutine);

      // getStats と reset メソッドが存在することを確認
      expect(instance.getStats).toBeDefined();
      expect(typeof instance.getStats).toBe('function');
      expect(instance.reset).toBeDefined();
      expect(typeof instance.reset).toBe('function');

      // getStatsが適切な形式のオブジェクトを返すことを確認
      const stats = instance.getStats();
      expect(stats).toHaveProperty('callCount');
      expect(stats).toHaveProperty('lastMessage');
      expect(typeof stats.callCount).toBe('number');
    });
  });
});

describe('Feature: MockFormatter static methods', () => {
  describe('When: using withRoutine method', () => {
    it('Then: [正常] - should behave same as createMockFormatter', () => {
      const customRoutine: AgFormatRoutine = (msg) => `factory: ${msg.message}`;
      const FormatterClass = MockFormatter.withRoutine(customRoutine);

      // クラス（コンストラクタ関数）を返すことを確認
      expect(typeof FormatterClass).toBe('function');
      expect(FormatterClass.__isMockConstructor).toBe(true);

      // インスタンス化して動作確認
      const instance = new FormatterClass(customRoutine);
      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Test message',
        args: [],
      };

      const result = instance.execute(testMessage);
      expect(result).toBe('factory: Test message');
    });
  });

  describe('When: using json preset', () => {
    it('Then: [正常] - should output message in JSON format', () => {
      const FormatterClass = MockFormatter.json;
      const dummyRoutine: AgFormatRoutine = (msg) => msg;
      const instance = new FormatterClass(dummyRoutine);

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Test message',
        args: [],
      };

      const result = instance.execute(testMessage);
      const parsed = JSON.parse(result as string);

      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('logLevel', AG_LOGLEVEL.INFO);
      expect(parsed).toHaveProperty('message', 'Test message');
    });
  });

  describe('When: using messageOnly preset', () => {
    it('Then: [正常] - should output message part only', () => {
      const FormatterClass = MockFormatter.messageOnly;
      const dummyRoutine: AgFormatRoutine = (msg) => msg;
      const instance = new FormatterClass(dummyRoutine);

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Test message',
        args: [],
      };

      const result = instance.execute(testMessage);
      expect(result).toBe('Test message');
    });
  });

  describe('When: using timestamped preset', () => {
    it('Then: [正常] - should output message with timestamp', () => {
      const FormatterClass = MockFormatter.timestamped;
      const dummyRoutine: AgFormatRoutine = (msg) => msg;
      const instance = new FormatterClass(dummyRoutine);

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Test message',
        args: [],
      };

      const result = instance.execute(testMessage);
      // タイムスタンプ付きフォーマットの確認（正確なタイムスタンプは動的なので、形式のみチェック）
      expect(typeof result).toBe('string');
      expect(result as string).toContain('Test message');
      expect(result as string).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });
  });

  describe('When: using prefixed factory', () => {
    it('Then: [正常] - should output message with specified prefix', () => {
      const FormatterClass = MockFormatter.prefixed('DEBUG');
      const dummyRoutine: AgFormatRoutine = (msg) => msg;
      const instance = new FormatterClass(dummyRoutine);

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Test message',
        args: [],
      };

      const result = instance.execute(testMessage);
      expect(result).toBe('DEBUG: Test message');
    });
  });

  describe('When: using errorThrow dynamic error message formatter', () => {
    it('Then: [異常] - should throw Error with default error message', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const dummyRoutine: AgFormatRoutine = (msg) => msg;
      const instance = new FormatterClass(dummyRoutine);

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Test message',
        args: [],
      };

      // デフォルトエラーメッセージでErrorを投げることを確認
      expect(() => instance.execute(testMessage)).toThrow('Default mock error');
    });

    it('Then: [正常] - should set custom default error message', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const customDefaultMessage = 'Custom default error';
      const dummyRoutine: AgFormatRoutine = (msg) => msg;
      const instance = new FormatterClass(dummyRoutine, customDefaultMessage);

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Test message',
        args: [],
      };

      // カスタムデフォルトエラーメッセージでErrorを投げることを確認
      expect(() => instance.execute(testMessage)).toThrow(customDefaultMessage);
    });

    it('Then: [正常] - should change error message at runtime with setErrorMessage', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const dummyRoutine: AgFormatRoutine = (msg) => msg;
      const instance = new FormatterClass(dummyRoutine);

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Test message',
        args: [],
      };

      // 初期メッセージで確認
      expect(() => instance.execute(testMessage)).toThrow('Default mock error');

      // エラーメッセージを変更
      const newErrorMessage = 'Updated error message';
      instance.setErrorMessage(newErrorMessage);

      // 変更後のメッセージで確認
      expect(() => instance.execute(testMessage)).toThrow(newErrorMessage);

      // さらに変更
      const anotherErrorMessage = 'Another error message';
      instance.setErrorMessage(anotherErrorMessage);

      // 再度変更後のメッセージで確認
      expect(() => instance.execute(testMessage)).toThrow(anotherErrorMessage);
    });

    it('Then: [正常] - should get current error message with getErrorMessage', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const customDefault = 'Initial error message';
      const dummyRoutine: AgFormatRoutine = (msg) => msg;
      const instance = new FormatterClass(dummyRoutine, customDefault);

      // 初期メッセージの確認
      expect(instance.getErrorMessage()).toBe(customDefault);

      // メッセージ変更後の確認
      const newMessage = 'Changed error message';
      instance.setErrorMessage(newMessage);
      expect(instance.getErrorMessage()).toBe(newMessage);
    });

    it('Then: [正常] - should have statistics feature for errorThrow', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const dummyRoutine: AgFormatRoutine = (msg) => msg;
      const instance = new FormatterClass(dummyRoutine);

      // 初期状態の統計を確認
      const initialStats = instance.getStats();
      expect(initialStats.callCount).toBe(0);
      expect(initialStats.lastMessage).toBeNull();

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Test message',
        args: [],
      };

      // executeでエラーが投げられても統計は更新される
      expect(() => instance.execute(testMessage)).toThrow();

      const statsAfterExecution = instance.getStats();
      expect(statsAfterExecution.callCount).toBe(1);
      expect(statsAfterExecution.lastMessage).toEqual(testMessage);

      // エラーメッセージ変更後も統計は継続
      instance.setErrorMessage('New error');
      expect(() => instance.execute(testMessage)).toThrow('New error');

      const statsAfterChange = instance.getStats();
      expect(statsAfterChange.callCount).toBe(2);
      expect(statsAfterChange.lastMessage).toEqual(testMessage);

      // resetで統計をクリアできる
      instance.reset();
      const statsAfterReset = instance.getStats();
      expect(statsAfterReset.callCount).toBe(0);
      expect(statsAfterReset.lastMessage).toBeNull();
    });
  });
});

describe('Feature: AgLoggerConfig integration', () => {
  describe('When: integrating with AgLoggerConfig', () => {
    it('Then: [正常] - should auto-instantiate createFormatter in AgLoggerConfig', () => {
      const config = new AgLoggerConfig();
      const customRoutine: AgFormatRoutine = (msg) => `config-test: ${msg.message}`;
      const FormatterClass = createMockFormatter(customRoutine);

      // AgLoggerConfigに設定（FormatterClassはAgMockConstructorなので、anyでキャスト）
      const result = config.setLoggerConfig({
        formatter: FormatterClass as unknown as AgFormatFunction,
      });

      expect(result).toBe(true);

      // formatterが自動インスタンス化されて設定されることを確認
      const formatter = config.formatter;
      expect(typeof formatter).toBe('function');

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Integration test',
        args: [],
      };

      const formatted = formatter(testMessage);
      expect(formatted).toBe('config-test: Integration test');
    });

    it('Then: [正常] - should auto-instantiate MockFormatter.json in AgLoggerConfig', () => {
      const config = new AgLoggerConfig();

      const result = config.setLoggerConfig({
        formatter: MockFormatter.json as unknown as AgFormatFunction,
      });

      expect(result).toBe(true);

      const formatter = config.formatter;
      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'JSON test',
        args: [],
      };

      const formatted = formatter(testMessage);
      const parsed = JSON.parse(formatted as string);
      expect(parsed).toHaveProperty('message', 'JSON test');
      expect(parsed).toHaveProperty('logLevel', AG_LOGLEVEL.INFO);
    });
  });
});
