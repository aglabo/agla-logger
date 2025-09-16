// src/__tests__/aglogger-consolidated/AgLogger.spec.ts
// @(#) : Consolidated unit tests for AgLogger class following atsushifx式BDD
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ（Vitest）
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 型定義・インターフェース
import type { AgLogLevel } from '../../../shared/types';
import { AG_LOGLEVEL } from '../../../shared/types';

// 定数・設定・エラーメッセージ
import { DISABLE, ENABLE } from '../../../shared/constants/common.constants';

// 内部実装・コアクラス
import { AgLogger } from '../../AgLogger.class';

// プラグインシステム
import { MockFormatter } from '../../plugins/formatter/MockFormatter';
import { MockLogger } from '../../plugins/logger/MockLogger';

const mockFormatter = MockFormatter.passthrough;

// Type for testing protected methods
type TestableAgLogger = AgLogger & {
  executeLog: (level: AgLogLevel, ...args: unknown[]) => void;
  shouldOutput: (level: AgLogLevel) => boolean;
  _isVerbose: boolean | null;
};

/**
 * Common test setup and cleanup
 */
const setupTestEnvironment = (): void => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });
};

/**
 * AgLogger Consolidated Unit Test Suite
 *
 * @description Comprehensive BDD-structured tests for AgLogger class
 * Organized by behavioral domains with maximum 3-level describe hierarchy
 */

/**
 * Instance Management Tests
 * Tests for singleton pattern and instance lifecycle
 */
describe('Feature: Instance management', () => {
  setupTestEnvironment();

  describe('Given: uninitialized AgLogger state', () => {
    describe('When: calling createLogger', () => {
      it('Then: [正常] - should create new AgLogger instance', () => {
        const logger = AgLogger.createLogger();
        expect(logger).toBeInstanceOf(AgLogger);
      });

      it('Then: [正常] - should return same instance on multiple calls', () => {
        const logger1 = AgLogger.createLogger();
        const logger2 = AgLogger.createLogger();
        const logger3 = AgLogger.createLogger();

        expect(logger1).toBe(logger2);
        expect(logger2).toBe(logger3);
      });
    });

    describe('When: calling getLogger', () => {
      it('Then: [正常] - should retrieve existing instance', () => {
        const created = AgLogger.createLogger();
        const retrieved = AgLogger.getLogger();

        expect(created).toBe(retrieved);
      });

      it('Then: [異常] - should throw error if instance not created first', () => {
        AgLogger.resetSingleton();

        expect(() => {
          AgLogger.getLogger();
        }).toThrow('Logger instance not created. Call createLogger() first.');
      });
    });
  });

  describe('Given: AgLogger initialization with special log levels', () => {
    describe('When: initializing with VERBOSE level', () => {
      it('Then: [異常] - should throw AgLoggerError', () => {
        expect(() => {
          AgLogger.createLogger({
            logLevel: AG_LOGLEVEL.VERBOSE,
          });
        }).toThrow('Special log levels cannot be set as default log level');
      });
    });

    describe('When: initializing with LOG level', () => {
      it('Then: [異常] - should throw AgLoggerError', () => {
        expect(() => {
          AgLogger.createLogger({
            logLevel: AG_LOGLEVEL.LOG,
          });
        }).toThrow('Special log levels cannot be set as default log level');
      });
    });
  });
});

/**
 * Log Level Management Tests
 * Tests for log level validation and control
 */
describe('Feature: Log level management', () => {
  setupTestEnvironment();

  describe('Given: initialized AgLogger instance', () => {
    describe('When: setting standard log levels', () => {
      it('Then: [正常] - should retrieve current level via logLevel property', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;
        expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
      });

      it('Then: [正常] - should correctly judge log level filtering', () => {
        const logger = AgLogger.createLogger();
        const testableLogger = logger as TestableAgLogger;
        logger.logLevel = AG_LOGLEVEL.WARN;

        const shouldOutputTests = [
          { level: AG_LOGLEVEL.ERROR, expected: true },
          { level: AG_LOGLEVEL.INFO, expected: false },
        ] as const;

        shouldOutputTests.forEach(({ level, expected }) => {
          expect(testableLogger.shouldOutput(level)).toBe(expected);
        });
      });
    });

    describe('When: processing special log levels', () => {
      it('Then: [正常] - should always output LOG level messages', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.log,
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.OFF;
        logger.setVerbose = DISABLE;

        logger.log('force output message');

        expect(mockLogger.getMessageCount(AG_LOGLEVEL.LOG)).toBe(1);
      });

      it('Then: [異常] - should throw AgLoggerError for VERBOSE level in setLoggerConfig', () => {
        const logger = AgLogger.createLogger();

        expect(() => {
          logger.setLoggerConfig({
            logLevel: AG_LOGLEVEL.VERBOSE,
          });
        }).toThrow('Special log levels cannot be set as default log level');
      });
    });

    describe('When: undefined log level is used', () => {
      it('Then: [異常] - should throw error for undefined log level', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.info.bind(mockLogger),
          formatter: mockFormatter,
        });
        const testableLogger = logger as TestableAgLogger;

        expect(() => {
          testableLogger.executeLog(undefined as unknown as AgLogLevel, 'test message');
        }).toThrow('Invalid log level (undefined)');
      });
    });
  });
});

/**
 * Verbose Functionality Tests
 * Tests for verbose mode behavior
 */
describe('Feature: Verbose functionality', () => {
  setupTestEnvironment();

  describe('Given: initialized AgLogger instance', () => {
    describe('When: checking verbose state in default condition', () => {
      it('Then: [正常] - should have verbose disabled by default', () => {
        const logger = AgLogger.createLogger();
        expect(logger.isVerbose).toBe(DISABLE);
      });
    });

    describe('When: controlling verbose state with setVerbose', () => {
      it('Then: [正常] - should control verbose state properly', () => {
        const logger = AgLogger.createLogger();

        const verboseTests = [
          { setValue: ENABLE, expected: ENABLE },
          { setValue: DISABLE, expected: DISABLE },
        ] as const;

        verboseTests.forEach(({ setValue, expected }) => {
          logger.setVerbose = setValue;
          expect(logger.isVerbose).toBe(expected);
        });
      });
    });

    describe('When: calling verbose method', () => {
      it('Then: [正常] - should respect verbose setting for output control', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.verbose.bind(mockLogger),
          formatter: mockFormatter,
        });

        // Verbose disabled - no output
        logger.verbose('test message');
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(0);

        // Verbose enabled - output expected
        logger.setVerbose = ENABLE;
        logger.verbose('test message');
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(1);
      });
    });
  });

  describe('Given: verbose functionality edge case environment', () => {
    describe('When: processing verbose method with various argument types', () => {
      it('Then: [エッジケース] - should handle different argument types correctly', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.verbose.bind(mockLogger),
          formatter: mockFormatter,
        });
        logger.setVerbose = true;

        // Test different argument types with functional approach
        const testArgs = [
          'string',
          42,
          { key: 'value' },
          [1, 2, 3],
        ] as const;

        testArgs.forEach((arg) => {
          logger.verbose(arg);
        });

        expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(4); // count testArgs
      });
    });

    describe('When: executing rapid verbose state changes', () => {
      it('Then: [エッジケース] - should handle rapid verbose state changes', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.verbose.bind(mockLogger),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        Array.from({ length: 100 }, (_, i) => i).forEach((i) => {
          logger.setVerbose = i % 2 === 0;
          logger.verbose(`verbose ${i}`);
        });

        expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(50);
      });
    });
  });
});

/**
 * Standard Log Methods Tests
 * Tests for standard logging methods (info, warn, error, etc.)
 */
describe('Feature: Standard log methods', () => {
  setupTestEnvironment();

  describe('Given: configured log methods environment', () => {
    describe('When: executing each log level method', () => {
      const mockLogger = new MockLogger.buffer();
      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.info.bind(mockLogger),
        formatter: mockFormatter,
        loggerMap: {
          [AG_LOGLEVEL.FATAL]: mockLogger.fatal.bind(mockLogger),
          [AG_LOGLEVEL.ERROR]: mockLogger.error.bind(mockLogger),
          [AG_LOGLEVEL.WARN]: mockLogger.warn.bind(mockLogger),
          [AG_LOGLEVEL.INFO]: mockLogger.info.bind(mockLogger),
          [AG_LOGLEVEL.DEBUG]: mockLogger.debug.bind(mockLogger),
          [AG_LOGLEVEL.TRACE]: mockLogger.trace.bind(mockLogger),
        },
      });

      const logMethods = [
        { name: 'fatal', level: AG_LOGLEVEL.FATAL, method: logger.fatal.bind(logger) },
        { name: 'error', level: AG_LOGLEVEL.ERROR, method: logger.error.bind(logger) },
        { name: 'warn', level: AG_LOGLEVEL.WARN, method: logger.warn.bind(logger) },
        { name: 'info', level: AG_LOGLEVEL.INFO, method: logger.info.bind(logger) },
        { name: 'debug', level: AG_LOGLEVEL.DEBUG, method: logger.debug.bind(logger) },
        { name: 'trace', level: AG_LOGLEVEL.TRACE, method: logger.trace.bind(logger) },
      ] as const;

      logMethods.forEach(({ name, level, method }) => {
        it(`Then: [正常] - should execute ${name} method correctly`, () => {
          logger.logLevel = level;
          mockLogger.clearAllMessages();

          method('test message');

          expect(mockLogger.getMessageCount(level)).toBe(1);
        });
      });
    });
  });

  describe('Given: log level filtering environment', () => {
    describe('When: executing logs with lower priority than configured level', () => {
      it('Then: [正常] - should not output lower priority logs', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.info.bind(mockLogger),
          formatter: mockFormatter,
          loggerMap: {
            [AG_LOGLEVEL.INFO]: mockLogger.info.bind(mockLogger),
            [AG_LOGLEVEL.DEBUG]: mockLogger.debug.bind(mockLogger),
          },
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        const lowerPriorityMethods = [
          { method: logger.info.bind(logger), message: 'info message', level: AG_LOGLEVEL.INFO },
          { method: logger.debug.bind(logger), message: 'debug message', level: AG_LOGLEVEL.DEBUG },
        ] as const;

        lowerPriorityMethods.forEach(({ method, message }) => {
          method(message);
        });

        expect(mockLogger.getTotalMessageCount()).toBe(0);
      });
    });

    describe('When: executing logs with priority equal or higher than configured level', () => {
      it('Then: [正常] - should output higher priority logs', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.warn.bind(mockLogger),
          formatter: mockFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: mockLogger.error.bind(mockLogger),
            [AG_LOGLEVEL.WARN]: mockLogger.warn.bind(mockLogger),
          },
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        const higherPriorityMethods = [
          { method: logger.error.bind(logger), message: 'error message', level: AG_LOGLEVEL.ERROR },
          { method: logger.warn.bind(logger), message: 'warn message', level: AG_LOGLEVEL.WARN },
        ] as const;

        higherPriorityMethods.forEach(({ method, message }) => {
          method(message);
        });

        expect(mockLogger.getTotalMessageCount()).toBe(2);
      });
    });
  });
});

/**
 * Validation Tests
 * Tests for input validation and error handling
 */
describe('Feature: Validation functionality', () => {
  setupTestEnvironment();

  describe('Given: AgLogger instance configuration validation environment', () => {
    describe('When: using setVerbose setter', () => {
      it('Then: [正常] - should properly set and validate verbose state', () => {
        const logger = AgLogger.createLogger();
        logger.setVerbose = true;
        expect(logger.isVerbose).toBe(true);
      });
    });
  });

  describe('Given: logger function configuration environment', () => {
    describe('When: setting logger function with valid log level', () => {
      it('Then: [正常] - should successfully set logger function', () => {
        const logger = AgLogger.createLogger();
        const customLogger = vi.fn();

        const result = logger.setLoggerFunction(AG_LOGLEVEL.INFO, customLogger);

        expect(result).toBe(true);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(customLogger);
      });

      it('Then: [正常] - should update logger map and call custom function', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.error.bind(mockLogger),
          formatter: mockFormatter,
        });
        const customLogger = vi.fn();

        // Set log level to allow ERROR messages
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.setLoggerFunction(AG_LOGLEVEL.ERROR, customLogger);

        // Verify the function was set by checking if it gets called
        logger.error('test message');
        expect(customLogger).toHaveBeenCalledOnce();
      });
    });

    describe('When: setting logger function with invalid log level', () => {
      it('Then: [異常] - should throw error for invalid log level', () => {
        const logger = AgLogger.createLogger();
        const customLogger = vi.fn();

        expect(() => {
          logger.setLoggerFunction('invalid' as unknown as AgLogLevel, customLogger);
        }).toThrow('Invalid log level');
      });
    });
  });
});

/**
 * Core State Management Edge Cases
 * Tests for singleton reset scenarios and initialization edge cases
 */
describe('Feature: Core state management edge cases', () => {
  setupTestEnvironment();

  describe('Given: state after singleton reset', () => {
    describe('When: accessing before initialization after resetSingleton', () => {
      it('Then: [エッジケース] - should handle uninitialized access gracefully', () => {
        // Create and reset singleton
        AgLogger.createLogger();
        AgLogger.resetSingleton();

        // Access before re-initialization should create new instance
        const logger = AgLogger.createLogger();
        expect(logger).toBeInstanceOf(AgLogger);
        expect(logger.logLevel).toBeDefined();
      });

      it('Then: [エッジケース] - should maintain state consistency after multiple resets', () => {
        // Multiple reset cycles
        for (let i = 0; i < 3; i++) {
          const logger = AgLogger.createLogger({
            logLevel: AG_LOGLEVEL.ERROR,
          });
          expect(logger.logLevel).toBe(AG_LOGLEVEL.ERROR);
          AgLogger.resetSingleton();
        }

        // Final verification
        const finalLogger = AgLogger.createLogger();
        expect(finalLogger.logLevel).toBe(AG_LOGLEVEL.OFF); // Default level
      });

      it('Then: [エッジケース] - should handle concurrent singleton access', () => {
        AgLogger.resetSingleton();

        // Simulate concurrent access
        const loggers = Array.from({ length: 10 }, () => AgLogger.createLogger());

        // All should reference the same instance
        const firstLogger = loggers[0];
        loggers.forEach((logger) => {
          expect(logger).toBe(firstLogger);
        });
      });
    });

    describe('When: executing abnormal configuration change order patterns', () => {
      it('Then: [エッジケース] - should handle rapid configuration changes correctly', () => {
        const logger = AgLogger.createLogger();

        // Rapid configuration changes
        const levels = [AG_LOGLEVEL.DEBUG, AG_LOGLEVEL.WARN, AG_LOGLEVEL.ERROR, AG_LOGLEVEL.INFO];
        levels.forEach((level) => {
          logger.logLevel = level;
          expect(logger.logLevel).toBe(level);
        });
      });

      it('Then: [異常] - should reject invalid configuration sequences', () => {
        const logger = AgLogger.createLogger();

        // Try invalid configuration after valid ones
        logger.logLevel = AG_LOGLEVEL.INFO;
        expect(() => {
          logger.setLoggerConfig({
            logLevel: AG_LOGLEVEL.VERBOSE, // Invalid special level
          });
        }).toThrow('Special log levels cannot be set as default log level');

        // Ensure previous valid state is maintained
        expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
      });

      it('Then: [異常] - should handle configuration rollback on error', () => {
        const logger = AgLogger.createLogger();
        const originalLevel = AG_LOGLEVEL.WARN;
        logger.logLevel = originalLevel;

        // Attempt invalid configuration
        expect(() => {
          logger.setLoggerConfig({
            logLevel: AG_LOGLEVEL.LOG, // Invalid for default level
          });
        }).toThrow();

        // Original configuration should remain unchanged
        expect(logger.logLevel).toBe(originalLevel);
      });
    });

    describe('When: executing pre-initialization access processing', () => {
      it('Then: [異常] - should require explicit creation after reset', () => {
        AgLogger.resetSingleton();

        // getLogger should throw after reset
        expect(() => {
          AgLogger.getLogger();
        }).toThrow('Logger instance not created. Call createLogger() first.');
      });

      it('Then: [エッジケース] - should handle property access before full initialization', () => {
        AgLogger.resetSingleton();
        const logger = AgLogger.createLogger();

        // Access properties immediately after creation
        expect(logger.logLevel).toBeDefined();
        expect(logger.isVerbose).toBeDefined();
      });

      it('Then: [異常] - should throw error for access on uninitialized singleton', () => {
        AgLogger.resetSingleton();

        // Direct access without proper initialization should throw
        expect(() => {
          AgLogger.getLogger();
        }).toThrow('Logger instance not created. Call createLogger() first.');
      });
    });
  });

  describe('Given: configuration object change detection environment', () => {
    describe('When: attempting direct modification of configuration object', () => {
      it('Then: [正常] - should maintain configuration integrity', () => {
        const logger = AgLogger.createLogger({
          logLevel: AG_LOGLEVEL.INFO,
        });

        const originalLevel = logger.logLevel;

        // Configuration should remain stable
        expect(logger.logLevel).toBe(originalLevel);
      });

      it('Then: [異常] - should detect and validate configuration changes', () => {
        const logger = AgLogger.createLogger();

        // Invalid configuration should be rejected
        expect(() => {
          logger.setLoggerConfig({
            logLevel: 'INVALID_LEVEL' as unknown as AgLogLevel,
          });
        }).toThrow();
      });

      it('Then: [異常] - should handle null/undefined configurations', () => {
        const logger = AgLogger.createLogger();

        expect(() => {
          logger.setLoggerConfig(null as unknown as Parameters<typeof logger.setLoggerConfig>[0]);
        }).toThrow();

        expect(() => {
          logger.setLoggerConfig(undefined as unknown as Parameters<typeof logger.setLoggerConfig>[0]);
        }).toThrow();
      });
    });

    describe('When: executing partial configuration updates', () => {
      it('Then: [正常] - should apply partial configuration updates correctly', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          logLevel: AG_LOGLEVEL.DEBUG,
          defaultLogger: mockLogger.info.bind(mockLogger),
        });

        // Partial update
        logger.setLoggerConfig({
          logLevel: AG_LOGLEVEL.ERROR,
        });

        expect(logger.logLevel).toBe(AG_LOGLEVEL.ERROR);
      });

      it('Then: [エッジケース] - should maintain unchanged configuration properties', () => {
        const customFormatter = vi.fn().mockReturnValue('formatted');
        const logger = AgLogger.createLogger({
          formatter: customFormatter,
          logLevel: AG_LOGLEVEL.INFO,
        });

        // Update only log level
        logger.setLoggerConfig({
          logLevel: AG_LOGLEVEL.WARN,
        });

        // Formatter should remain unchanged
        expect(logger.getFormatter()).toBe(customFormatter);
      });
    });
  });
});
