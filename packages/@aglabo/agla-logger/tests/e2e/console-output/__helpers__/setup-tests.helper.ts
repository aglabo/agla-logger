// src: /tests/e2e/console-output/__helpers__/setup-tests.helper.ts
// @(#) : E2E Console Output Test Setup Helper
//
// Console mock setup utilities for E2E testing with automatic cleanup
// Provides ConsoleMock type and setupTest function for console output verification
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { type MockInstance, vi } from 'vitest';
import type { TestContext } from 'vitest';

export type ConsoleMock = {
  error: MockInstance;
  warn: MockInstance;
  info: MockInstance;
  debug: MockInstance;
  log: MockInstance;
};

export const setupTest = (_ctx?: TestContext): { mockConsole: ConsoleMock } => {
  // Store original console methods for restoration
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
    log: console.log,
  };

  // Clear all existing mocks
  vi.clearAllMocks();

  // Create fresh mock instances
  const mockConsole: ConsoleMock = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
  };

  // Replace console methods with mocks
  Object.assign(console, mockConsole);

  // Set up cleanup when test finishes
  _ctx?.onTestFinished(() => {
    // Restore original console methods
    Object.assign(console, originalConsole);
    // Clear all mocks
    vi.clearAllMocks();
  });

  return { mockConsole };
};
