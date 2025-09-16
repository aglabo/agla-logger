// src: /src/plugins/formatter/__tests__/MockFormatter.errorThrow.spec.ts
// @(#) : MockFormatter Error Throwing Test Suite
//
// BDD tests for MockFormatter error handling scenarios with ErrorThrowFormatter
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
import type { AgFormatRoutine } from '../../../../shared/types/AgMockConstructor.class';

// プラグインシステム
import { MockFormatter } from '../MockFormatter';

/**
 * @suite MockFormatter.errorThrow | Unit
 * @description MockFormatter.errorThrow包括テストスイート - 基本動作・エッジケース・エラーハンドリングを統合した包括的テスト
 * @testType unit
 * Scenarios: 基本操作, エッジケース処理, 型強制変換, ユーティリティ操作
 */
describe('Feature: MockFormatter.errorThrow functionality', () => {
  // 共通テストデータ
  const createTestMessage = (message = 'Test message'): AgLogMessage => ({
    timestamp: new Date('2025-01-01T00:00:00.000Z'),
    logLevel: AG_LOGLEVEL.INFO,
    message,
    args: [],
  });

  const dummyRoutine: AgFormatRoutine = (msg) => msg;

  /**
   * @context When
   * @scenario 基本操作処理
   * @description MockFormatter.errorThrowの基本的な動作確認とエラースロー機能のテスト
   */
  describe('When: performing basic operations with MockFormatter.errorThrow', () => {
    it('Then: [正常] - should throw default mock error', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      expect(() => instance.execute(testMessage)).toThrow('Default mock error');
    });

    it('Then: [正常] - should throw custom default error', () => {
      const customMessage = 'Custom initialization error';
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine, customMessage);
      const testMessage = createTestMessage();

      expect(() => instance.execute(testMessage)).toThrow(customMessage);
    });

    it('Then: [正常] - should have AgMockConstructor marker', () => {
      const FormatterClass = MockFormatter.errorThrow;
      expect(FormatterClass.__isMockConstructor).toBe(true);
    });

    it('Then: [正常] - should update error message dynamically', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const newErrorMessage = 'Runtime changed error';

      expect(() => instance.execute(testMessage)).toThrow('Default mock error');

      instance.setErrorMessage(newErrorMessage);
      expect(() => instance.execute(testMessage)).toThrow(newErrorMessage);
    });

    it('Then: [異常] - should maintain statistics even when throwing', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      expect(instance.getStats().callCount).toBe(0);
      expect(() => instance.execute(testMessage)).toThrow();
      expect(instance.getStats().callCount).toBe(1);
      expect(instance.getStats().lastMessage).toEqual(testMessage);
    });
  });

  /**
   * @context When
   * @scenario エッジケース処理
   * @description 各種エッジケース入力に対するMockFormatter.errorThrowの動作確認
   */
  describe('When: handling edge case inputs with MockFormatter.errorThrow', () => {
    it('Then: [エッジケース] - should handle empty string message', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      instance.setErrorMessage('');
      expect(() => instance.execute(testMessage)).toThrow('');
    });

    it('Then: [エッジケース] - should handle very long messages', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const longMessage = 'A'.repeat(1000);

      instance.setErrorMessage(longMessage);
      expect(() => instance.execute(testMessage)).toThrow(longMessage);
    });

    it('Then: [エッジケース] - should handle multiline messages', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const multilineMessage = 'Line 1\nLine 2\nLine 3';

      instance.setErrorMessage(multilineMessage);
      expect(() => instance.execute(testMessage)).toThrow(multilineMessage);
    });

    it('Then: [エッジケース] - should handle Unicode characters', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const unicodeMessage = '🚨 エラーが発生しました 💥';

      instance.setErrorMessage(unicodeMessage);
      expect(() => instance.execute(testMessage)).toThrow(unicodeMessage);
    });

    it('Then: [エッジケース] - should handle special format strings', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const jsonMessage = '{"error": "Database failed", "code": 500}';

      instance.setErrorMessage(jsonMessage);
      expect(() => instance.execute(testMessage)).toThrow(jsonMessage);
    });
  });

  /**
   * @context When
   * @scenario 型強制変換処理
   * @description 型強制変換シナリオでのMockFormatter.errorThrowの動作確認
   */
  describe('When: handling type coercion scenarios with MockFormatter.errorThrow', () => {
    it('Then: [エッジケース] - should stringify null to "null"', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      instance.setErrorMessage(null as unknown as string);
      expect(() => instance.execute(testMessage)).toThrow('null');
    });

    it('Then: [エッジケース] - should stringify undefined to empty string', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      instance.setErrorMessage(undefined as unknown as string);
      expect(() => instance.execute(testMessage)).toThrow('');
    });

    it('Then: [エッジケース] - should stringify numbers', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      instance.setErrorMessage(12345 as unknown as string);
      expect(() => instance.execute(testMessage)).toThrow('12345');
    });

    it('Then: [エッジケース] - should stringify booleans', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      instance.setErrorMessage(true as unknown as string);
      expect(() => instance.execute(testMessage)).toThrow('true');
    });

    it('Then: [エッジケース] - should stringify objects as [object Object]', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const objectMessage = { error: 'test error', code: 500 };

      instance.setErrorMessage(objectMessage as unknown as string);
      expect(() => instance.execute(testMessage)).toThrow('[object Object]');
    });
  });

  /**
   * @context When
   * @scenario ユーティリティ操作
   * @description MockFormatter.errorThrowのユーティリティメソッド動作確認
   */
  describe('When: performing utility operations with MockFormatter.errorThrow', () => {
    it('Then: [正常] - should reset statistics correctly', () => {
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      // Execute multiple times to accumulate stats
      expect(() => instance.execute(testMessage)).toThrow();
      expect(() => instance.execute(testMessage)).toThrow();
      expect(instance.getStats().callCount).toBe(2);

      // Reset and verify
      instance.reset();
      expect(instance.getStats().callCount).toBe(0);
      expect(instance.getStats().lastMessage).toBeNull();
    });

    it('Then: [正常] - should return current error message via getter', () => {
      const customMessage = 'Initial custom message';
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine, customMessage);

      expect(instance.getErrorMessage()).toBe(customMessage);

      const newMessage = 'Changed message';
      instance.setErrorMessage(newMessage);
      expect(instance.getErrorMessage()).toBe(newMessage);
    });
  });
});
