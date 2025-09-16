// tests/utils/__tests__/E2eMockLogger.spec.ts
// @(#) : E2eMockLogger Unit Test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ（Vitest）
import { describe, expect, it } from 'vitest';

// 型定義・インターフェース
import { AG_LOGLEVEL } from '../../../../shared/types';

// プラグインシステム
import { E2eMockLogger } from '../E2eMockLogger';

describe('Feature: E2eMockLogger test ID management and basic functionality', () => {
  let mockLogger: E2eMockLogger;

  // Initialize mockLogger for tests
  mockLogger = new E2eMockLogger('test-id');

  describe('When: managing test IDs and their switching', () => {
    it('Then: [正常] - should allow switching to different test ID after construction', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      expect(() => mockLogger.info('test message')).not.toThrow();
      expect(mockLogger.getCurrentTestId()).toBe(ctx.task.id);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['test message']);
    });

    it('Then: [異常] - should throw error when trying to log after ending current test', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      mockLogger.endTest(); // End test manually to test error condition
      ctx.onTestFinished(() => {
        // No need to call endTest again since already called
      });

      expect(() => mockLogger.info('test message')).toThrow('No active test. Call startTest() before logging.');
      expect(mockLogger.getCurrentTestId()).toBeNull();
    });
  });

  describe('When: storing error messages in array', () => {
    it('Then: [正常] - should store error messages in array', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.error('First error');
      mockLogger.error('Second error');

      const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      expect(errorMessages).toEqual(['First error', 'Second error']);
    });
  });

  describe('When: retrieving last error message', () => {
    it('Then: [正常] - should return last error message', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.error('First error');
      mockLogger.error('Second error');

      const lastError = mockLogger.getLastMessage(AG_LOGLEVEL.ERROR);
      expect(lastError).toBe('Second error');
    });

    it('Then: [エッジケース] - should return null when no error messages', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      const lastError = mockLogger.getLastMessage(AG_LOGLEVEL.ERROR);
      expect(lastError).toBeNull();
    });
  });

  describe('When: clearing error messages', () => {
    it('Then: [正常] - should clear error messages', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.error('First error');
      mockLogger.error('Second error');

      mockLogger.clearMessages(AG_LOGLEVEL.ERROR);

      const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      expect(errorMessages).toEqual([]);
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBeNull();
    });
  });

  describe('When: using unified API design with getLastMessage(logLevel)', () => {
    it('Then: [正常] - should get last message for each level using unified method', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.fatal('Fatal 1');
      mockLogger.fatal('Fatal 2');
      mockLogger.error('Error 1');
      mockLogger.error('Error 2');

      expect(mockLogger.getLastMessage(AG_LOGLEVEL.FATAL)).toBe('Fatal 2');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('Error 2');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.WARN)).toBeNull();
    });

    it('Then: [正常] - should get messages for each level using unified method', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.fatal('Fatal message');
      mockLogger.error('Error message');
      mockLogger.warn('Warn message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.FATAL)).toEqual(['Fatal message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['Error message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['Warn message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual([]);
    });

    it('Then: [正常] - should clear messages for specific level using unified method', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.fatal('Fatal message');
      mockLogger.error('Error message');

      mockLogger.clearMessages(AG_LOGLEVEL.FATAL);

      expect(mockLogger.getMessages(AG_LOGLEVEL.FATAL)).toEqual([]);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['Error message']);
    });
  });
});
