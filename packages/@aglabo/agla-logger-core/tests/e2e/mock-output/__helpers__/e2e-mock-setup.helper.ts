// src: /tests/e2e/mock-output/__helpers__/e2e-mock-setup.helper.ts
// @(#) : E2E Mock Output Test Setup Helper
//
// E2eMockLogger setup utilities with automatic test lifecycle management
// Provides setupE2eMockLogger function for mock output testing with AgLogger reset
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AgLogger } from '@/AgLogger.class';
import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';
import type { TestContext } from 'vitest';

/**
 * Setup E2E mock logger with automatic test lifecycle management and AgLogger reset
 * @param identifier - Test identifier for the mock logger
 * @param ctx - Vitest test context for cleanup registration
 * @returns Configured E2eMockLogger instance
 */
export const setupE2eMockLogger = (identifier: string, ctx: TestContext): E2eMockLogger => {
  const mockLogger = new E2eMockLogger(identifier);

  // startTest前にリセット - テスト開始前にクリーンな状態にする
  AgLogger.resetSingleton();
  mockLogger.startTest(ctx.task.id);

  ctx.onTestFinished(() => {
    mockLogger.endTest();
    // endTest後にリセット - テスト終了後にクリーンアップ
    AgLogger.resetSingleton();
  });

  return mockLogger;
};
