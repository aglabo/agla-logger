// src: /src/internal/__tests__/AgLoggerConfig.spec.ts
// @(#) : AgLoggerConfig Functional Tests - Configuration Management Functionality
//
// Comprehensive test suite covering AgLoggerConfig functionality with BDD structure:
// - Instance creation and initialization with secure defaults
// - Logger function retrieval and validation with error handling
// - Configuration getter/setter methods with type safety
// - Log output decision logic with level hierarchy
// - Bulk configuration application via setLoggerConfig
// - Individual logger assignment with validation
// - Comprehensive error handling for invalid inputs
//
// Tests follow BDD (Behavior-Driven Development) approach with Given/When/Then structure.
// Each test group focuses on specific functionality to ensure clarity and maintainability.
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ（Vitest）
import { describe, expect, it } from 'vitest';

// 型定義・インターフェース
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgLogLevel, AgLogMessage } from '../../../../shared/types';
import type { AgLoggerOptions } from '../../../../shared/types/AgLogger.interface';
import { AgLoggerError } from '../../../../shared/types/AgLoggerError.types';

// 定数・設定・エラーメッセージ
import { ERROR_TYPES } from 'shared/constants';
import { DISABLE, ENABLE } from '../../../../shared/constants/common.constants';

// 内部実装・コアクラス
import { AgLoggerConfig } from '../../../internal/AgLoggerConfig.class';

// プラグインシステム
import { NullFormatter } from '../../../plugins/formatter/NullFormatter';
import { NullLogger } from '../../../plugins/logger/NullLogger';

// ユーティリティ・ヘルパー関数
import { validateLogLevel } from '../../../utils/AgLogValidators';

/**
 * @suite AgLoggerConfig Configuration Management | Functional Tests
 * @description Comprehensive configuration management functionality testing with secure defaults, validation, and bulk configuration application
 * @testType functional
 * Scenarios: Instance creation, Logger retrieval, Configuration updates, Output decision logic, Bulk configuration, Individual logger assignment
 */
describe('Feature: AgLoggerConfig configuration management functionality', () => {
  // ============================================================================
  // Feature: Initial configuration and default values
  // ============================================================================
  /**
   * @context When
   * @scenario Instance creation
   * @description Testing AgLoggerConfig instance creation and initialization
   */
  describe('When: creating new AgLoggerConfig instance', () => {
    it('Then: [正常] - should create instance successfully', () => {
      const config = new AgLoggerConfig();
      expect(config).toBeInstanceOf(AgLoggerConfig);
    });
  });

  /**
   * @context When
   * @scenario Default configuration values
   * @description Testing access to default configuration values (NullLogger, NullFormatter, OFF level, verbose false)
   */
  describe('When: accessing default configuration values', () => {
    it('Then: [正常] - should return NullLogger as default logger', () => {
      const config = new AgLoggerConfig();
      // Test through public interface by checking fallback behavior
      // When loggerMap has NullLogger, getLoggerFunction should return defaultLogger (which is NullLogger initially)
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
    });

    it('Then: [正常] - should return NullFormatter as default formatter', () => {
      const config = new AgLoggerConfig();
      expect(config.formatter).toBe(NullFormatter);
    });

    it('Then: [正常] - should return AG_LOGLEVEL.OFF as default log level', () => {
      const config = new AgLoggerConfig();
      expect(config.logLevel).toBe(AG_LOGLEVEL.OFF);
    });

    it('Then: [正常] - should return false as default verbose setting', () => {
      const config = new AgLoggerConfig();
      expect(config.isVerbose).toBe(DISABLE);
    });

    it('Then: [正常] - should initialize all log levels with NullLogger', () => {
      const config = new AgLoggerConfig();
      const loggerMap = config.getLoggerMap();

      // Test that all log levels are mapped to NullLogger
      expect(loggerMap.get(AG_LOGLEVEL.OFF)).toBe(NullLogger);
      expect(loggerMap.get(AG_LOGLEVEL.FATAL)).toBe(NullLogger);
      expect(loggerMap.get(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
      expect(loggerMap.get(AG_LOGLEVEL.WARN)).toBe(NullLogger);
      expect(loggerMap.get(AG_LOGLEVEL.INFO)).toBe(NullLogger);
      expect(loggerMap.get(AG_LOGLEVEL.DEBUG)).toBe(NullLogger);
      expect(loggerMap.get(AG_LOGLEVEL.TRACE)).toBe(NullLogger);
    });
  });

  // ============================================================================
  // Feature: Logger function retrieval functionality
  // ============================================================================
  /**
   * @context When
   * @scenario Valid logger retrieval
   * @description Testing logger function retrieval for valid log levels
   */
  describe('When: requesting logger for valid log levels', () => {
    it('Then: [正常] - should return configured logger for each level', () => {
      const config = new AgLoggerConfig();

      // Test that getLoggerFunction returns the correct logger for each level
      expect(config.getLoggerFunction(AG_LOGLEVEL.OFF)).toBe(NullLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.FATAL)).toBe(NullLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(NullLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(NullLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(NullLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.TRACE)).toBe(NullLogger);
    });
  });

  /**
   * @context When
   * @scenario Invalid logger retrieval
   * @description Testing logger function retrieval for invalid log levels with graceful fallback
   */
  describe('When: requesting logger for invalid log levels', () => {
    it('Then: [異常] - should return NullLogger for boundary violations', () => {
      const config = new AgLoggerConfig();

      // Test boundary values outside valid range
      const invalidHighLevel = 7;
      const invalidLowLevel = -1;

      // Verify that NullLogger is returned for out-of-bounds values
      expect(config.getLoggerFunction(invalidHighLevel as AgLogLevel))
        .toBe(NullLogger);
      expect(config.getLoggerFunction(invalidLowLevel as AgLogLevel))
        .toBe(NullLogger);
    });

    it('Then: [異常] - should return NullLogger for type violations', () => {
      const config = new AgLoggerConfig();

      // Test runtime type violations (when TypeScript type checking fails)
      const stringValue = 'INVALID' as unknown as AgLogLevel;
      const nullValue = null as unknown as AgLogLevel;
      const undefinedValue = undefined as unknown as AgLogLevel;

      // Verify NullLogger is returned for invalid type values
      expect(config.getLoggerFunction(stringValue)).toBe(NullLogger);
      expect(config.getLoggerFunction(nullValue)).toBe(NullLogger);
      expect(config.getLoggerFunction(undefinedValue)).toBe(NullLogger);
    });
  });

  // ============================================================================
  // Feature: Configuration getter functionality
  // ============================================================================
  /**
   * @context When
   * @scenario Configuration property access
   * @description Testing access to configuration properties (formatter, logLevel, verbose)
   */
  describe('When: accessing configuration properties', () => {
    it('Then: [正常] - should return configured formatter', () => {
      const config = new AgLoggerConfig();
      expect(config.formatter).toBe(NullFormatter);
    });

    it('Then: [正常] - should return configured log level', () => {
      const config = new AgLoggerConfig();
      expect(config.logLevel).toBe(AG_LOGLEVEL.OFF);
    });

    it('Then: [正常] - should return verbose setting as boolean', () => {
      const config = new AgLoggerConfig();
      expect(config.isVerbose).toBe(DISABLE);
      expect(typeof config.isVerbose).toBe('boolean');
    });
  });

  // ============================================================================
  // Feature: Configuration update functionality
  // ============================================================================
  /**
   * @context When
   * @scenario Log level configuration updates
   * @description Testing log level configuration updates with validation
   */
  describe('When: updating log level configuration', () => {
    it('Then: [正常] - should update to valid log levels', () => {
      const config = new AgLoggerConfig();

      // Test setting one log level first (t-wada style - one expect at a time)
      config.logLevel = AG_LOGLEVEL.DEBUG;
      expect(config.logLevel).toBe(AG_LOGLEVEL.DEBUG);
    });

    it('Then: [異常] - should reject invalid numeric values', () => {
      const config = new AgLoggerConfig();
      const originalLevel = config.logLevel;

      // Attempt to set invalid log level
      config.logLevel = 999 as AgLogLevel;

      // Verify log level remains unchanged
      expect(config.logLevel).toBe(originalLevel);
    });

    it('Then: [異常] - should reject null values', () => {
      const config = new AgLoggerConfig();
      const originalLevel = config.logLevel;

      // Attempt to set null log level
      config.logLevel = null as unknown as AgLogLevel;

      // Verify log level remains unchanged
      expect(config.logLevel).toBe(originalLevel);
    });

    it('Then: [異常] - should reject undefined values', () => {
      const config = new AgLoggerConfig();
      const originalLevel = config.logLevel;

      // Attempt to set undefined log level
      config.logLevel = undefined as unknown as AgLogLevel;

      // Verify log level remains unchanged
      expect(config.logLevel).toBe(originalLevel);
    });

    it('Then: [異常] - should reject string values', () => {
      const config = new AgLoggerConfig();
      const originalLevel = config.logLevel;

      // Attempt to set string log level
      config.logLevel = 'INVALID' as unknown as AgLogLevel;

      // Verify log level remains unchanged
      expect(config.logLevel).toBe(originalLevel);
    });
  });

  /**
   * @context When
   * @scenario Verbose configuration updates
   * @description Testing verbose flag configuration updates and state management
   */
  describe('When: updating verbose configuration', () => {
    it('Then: [正常] - should update verbose flag correctly', () => {
      const config = new AgLoggerConfig();

      // Test enabling verbose mode (t-wada style - one expect at a time)
      config.setVerbose = ENABLE;
      expect(config.isVerbose).toBe(ENABLE);
    });

    it('Then: [正常] - should return set verbose value', () => {
      const config = new AgLoggerConfig();

      // Test that setVerbose returns the set verbose value
      const result = config.setVerbose = DISABLE;
      expect(result).toBe(DISABLE);
    });

    it('Then: [正常] - should properly toggle verbose states', () => {
      const config = new AgLoggerConfig();

      // Test enabling verbose
      config.setVerbose = ENABLE;
      expect(config.isVerbose).toBe(true);

      // Test disabling verbose
      config.setVerbose = DISABLE;
      expect(config.isVerbose).toBe(false);
    });
  });

  // ============================================================================
  // Feature: Log output decision functionality
  // ============================================================================
  /**
   * @context When
   * @scenario Log level output eligibility
   * @description Testing log output decision logic based on level hierarchy
   */
  describe('When: checking output eligibility by log level', () => {
    it('Then: [正常] - should respect log level hierarchy', () => {
      const config = new AgLoggerConfig();

      // Set log level to WARN
      config.logLevel = AG_LOGLEVEL.WARN;

      // Test that levels below WARN return false
      expect(config.shouldOutput(AG_LOGLEVEL.DEBUG)).toBe(false);
      expect(config.shouldOutput(AG_LOGLEVEL.INFO)).toBe(false);

      // Test that levels at or above WARN return true
      expect(config.shouldOutput(AG_LOGLEVEL.WARN)).toBe(true);
      expect(config.shouldOutput(AG_LOGLEVEL.ERROR)).toBe(true);
    });

    it('Then: [エッジケース] - should handle boundary log level values correctly', () => {
      const config = new AgLoggerConfig();

      // Test minimum log level (FATAL = 1)
      config.logLevel = AG_LOGLEVEL.FATAL;
      expect(config.shouldOutput(AG_LOGLEVEL.FATAL)).toBe(true); // 1 <= 1
      expect(config.shouldOutput(AG_LOGLEVEL.ERROR)).toBe(false); // 2 > 1

      // Test maximum log level (TRACE = 6)
      config.logLevel = AG_LOGLEVEL.TRACE;
      expect(config.shouldOutput(AG_LOGLEVEL.TRACE)).toBe(true); // 6 <= 6
      expect(config.shouldOutput(AG_LOGLEVEL.DEBUG)).toBe(true); // 5 <= 6
      expect(config.shouldOutput(AG_LOGLEVEL.FATAL)).toBe(true); // 1 <= 6
    });

    it('Then: [異常] - should reject invalid log levels in shouldOutput', () => {
      const config = new AgLoggerConfig();

      // Test that shouldOutput returns false for invalid log levels
      expect(config.shouldOutput(999 as AgLogLevel)).toBe(false);
      expect(config.shouldOutput(-1 as AgLogLevel)).toBe(false);
      expect(config.shouldOutput('INVALID' as unknown as AgLogLevel)).toBe(false);
      expect(config.shouldOutput(null as unknown as AgLogLevel)).toBe(false);
      expect(config.shouldOutput(undefined as unknown as AgLogLevel)).toBe(false);
    });
  });

  /**
   * @context When
   * @scenario Verbose output eligibility
   * @description Testing verbose output decision logic
   */
  describe('When: checking verbose output eligibility', () => {
    it('Then: [正常] - should return true when verbose enabled', () => {
      const config = new AgLoggerConfig();

      // Enable verbose mode
      config.setVerbose = ENABLE;

      // Test that shouldOutputVerbose returns true when verbose is enabled
      expect(config.shouldOutputVerbose()).toBe(true);
    });

    it('Then: [正常] - should return false when verbose disabled', () => {
      const config = new AgLoggerConfig();

      // Ensure verbose is disabled (default state)
      expect(config.isVerbose).toBe(DISABLE);

      // Test that shouldOutputVerbose returns false when verbose is disabled
      expect(config.shouldOutputVerbose()).toBe(false);

      // Explicitly disable verbose and test again
      config.setVerbose = DISABLE;
      expect(config.shouldOutputVerbose()).toBe(false);
    });
  });

  // ============================================================================
  // Feature: Bulk configuration application functionality
  // ============================================================================
  /**
   * @context When
   * @scenario Bulk configuration application
   * @description Testing bulk configuration application via setLoggerConfig method
   */
  describe('When: applying configuration via setLoggerConfig', () => {
    it('Then: [正常] - should handle empty options gracefully', () => {
      const config = new AgLoggerConfig();

      // Test with empty options (should not throw error)
      const emptyOptions: AgLoggerOptions = {};
      expect(() => config.setLoggerConfig(emptyOptions)).not.toThrow();
    });

    it('Then: [正常] - should apply defaultLogger setting', () => {
      const config = new AgLoggerConfig();

      // Create a test logger function
      const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};

      // Apply configuration with defaultLogger
      const options: AgLoggerOptions = {
        defaultLogger: testLogger,
      };
      config.setLoggerConfig(options);

      // Verify defaultLogger was applied by checking fallback behavior
      const loggerMap = config.getLoggerMap();
      loggerMap.clear();
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testLogger);
    });

    it('Then: [正常] - should apply formatter setting', () => {
      const config = new AgLoggerConfig();

      // Create a test formatter function
      const testFormatter = (_logMessage: AgLogMessage): string => 'test formatted message';

      // Apply configuration with formatter
      const options: AgLoggerOptions = {
        formatter: testFormatter,
      };
      config.setLoggerConfig(options);

      // Verify formatter was applied
      expect(config.formatter).toBe(testFormatter);
    });

    it('Then: [正常] - should apply logLevel setting', () => {
      const config = new AgLoggerConfig();

      // Apply configuration with logLevel
      const options: AgLoggerOptions = {
        logLevel: AG_LOGLEVEL.DEBUG,
      };
      config.setLoggerConfig(options);

      // Verify logLevel was applied
      expect(config.logLevel).toBe(AG_LOGLEVEL.DEBUG);
    });

    it('Then: [正常] - should apply verbose setting', () => {
      const config = new AgLoggerConfig();

      // Apply configuration with verbose
      const options: AgLoggerOptions = {
        verbose: ENABLE,
      };
      config.setLoggerConfig(options);

      // Verify verbose was applied
      expect(config.isVerbose).toBe(ENABLE);
    });

    it('Then: [正常] - should apply loggerMap setting', () => {
      const config = new AgLoggerConfig();

      // Create test loggers
      const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};
      const testWarnLogger = (_message: string | AgLogMessage): void => {/* test warn logger */};

      // Verify initial state
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(NullLogger);

      // Apply configuration with loggerMap
      const options: AgLoggerOptions = {
        loggerMap: {
          [AG_LOGLEVEL.ERROR]: testErrorLogger,
          [AG_LOGLEVEL.WARN]: testWarnLogger,
        },
      };
      config.setLoggerConfig(options);

      // Verify loggerMap was applied via setLoggerConfig
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testWarnLogger);
      // Verify unspecified levels remain unchanged
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(NullLogger);
    });
  });

  /**
   * @context When
   * @scenario Complex configuration combinations
   * @description Testing complex configuration scenarios with defaultLogger and loggerMap interactions
   */
  describe('When: applying complex configuration combinations', () => {
    it('Then: [正常] - should allow loggerMap to override defaultLogger for specified levels', () => {
      const config = new AgLoggerConfig();

      // Create test loggers
      const testDefaultLogger = (_message: string | AgLogMessage): void => {/* test default logger */};
      const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};

      // Set a default logger via setLoggerConfig - this initializes all loggerMap entries
      const options: AgLoggerOptions = {
        defaultLogger: testDefaultLogger,
      };
      config.setLoggerConfig(options);

      // All levels should now use the default logger
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testDefaultLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger);

      // Apply loggerMap that overrides ERROR level only
      config.setLogger(AG_LOGLEVEL.ERROR, testErrorLogger);

      // Verify ERROR level uses the specific logger from loggerMap
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
      // Verify other levels still use the default logger
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger);
    });

    it('Then: [正常] - should use defaultLogger for levels not explicitly overridden', () => {
      const config = new AgLoggerConfig();

      // Create test loggers
      const testDefaultLogger = (_message: string | AgLogMessage): void => {/* test default logger */};
      const testSpecificLogger = (_message: string | AgLogMessage): void => {/* test specific logger */};

      // Set defaultLogger via setLoggerConfig which initializes all levels
      const options: AgLoggerOptions = {
        defaultLogger: testDefaultLogger,
      };
      config.setLoggerConfig(options);

      // All levels should use the default logger initially
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testDefaultLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger);

      // Override one specific level
      config.setLogger(AG_LOGLEVEL.ERROR, testSpecificLogger);

      // Verify ERROR level uses the specific logger
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testSpecificLogger);
      // Verify other levels still use the default logger
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger);
    });

    it('Then: [正常] - should properly handle defaultLogger changes via setLoggerConfig', () => {
      const config = new AgLoggerConfig();

      // Create test loggers
      const testDefaultLogger1 = (_message: string | AgLogMessage): void => {/* test default logger 1 */};
      const testDefaultLogger2 = (_message: string | AgLogMessage): void => {/* test default logger 2 */};

      // Set first defaultLogger
      const options1: AgLoggerOptions = {
        defaultLogger: testDefaultLogger1,
      };
      config.setLoggerConfig(options1);

      // All levels should use first defaultLogger
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testDefaultLogger1);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger1);
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger1);

      // Change defaultLogger via setLoggerConfig
      const options2: AgLoggerOptions = {
        defaultLogger: testDefaultLogger2,
      };
      config.setLoggerConfig(options2);

      // All levels should now use second defaultLogger
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testDefaultLogger2);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger2);
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger2);
    });

    it('Then: [正常] - should apply both defaultLogger and loggerMap together', () => {
      const config = new AgLoggerConfig();

      // Create test loggers
      const testDefaultLogger = (_message: string | AgLogMessage): void => {/* test default logger */};
      const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};
      const testWarnLogger = (_message: string | AgLogMessage): void => {/* test warn logger */};

      // Apply configuration with both defaultLogger and loggerMap
      const options: AgLoggerOptions = {
        defaultLogger: testDefaultLogger,
        loggerMap: {
          [AG_LOGLEVEL.ERROR]: testErrorLogger,
          [AG_LOGLEVEL.WARN]: testWarnLogger,
        },
      };
      config.setLoggerConfig(options);

      // Verify explicitly mapped levels use loggerMap (override defaultLogger)
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testWarnLogger);

      // Verify non-mapped levels use defaultLogger (from initialization step)
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(testDefaultLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.FATAL)).toBe(testDefaultLogger);
    });
  });

  // ============================================================================
  // Feature: Log level validation functionality
  // ============================================================================
  /**
   * @context When
   * @scenario Log level validation
   * @description Testing log level validation functionality with error handling
   */
  describe('When: validating log levels', () => {
    it('Then: [正常] - should accept valid log levels', () => {
      // Test all valid log levels
      expect(() => validateLogLevel(AG_LOGLEVEL.OFF)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.FATAL)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.ERROR)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.WARN)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.INFO)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.DEBUG)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.TRACE)).not.toThrow();
    });

    it('Then: [異常] - should throw AgLoggerError for invalid log levels', () => {
      // Test invalid log levels (out of range numbers)
      expect(() => validateLogLevel(999 as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(-1 as unknown as AgLogLevel)).toThrow(AgLoggerError);
    });

    it('Then: [異常] - should throw error with correct error category', () => {
      try {
        validateLogLevel(999 as unknown as AgLogLevel);
      } catch (error) {
        expect(error).toBeInstanceOf(AgLoggerError);
        expect((error as AgLoggerError).errorType).toBe(ERROR_TYPES.VALIDATION);
      }
    });
  });

  // ============================================================================
  // Feature: Individual logger configuration functionality
  // ============================================================================
  /**
   * @context When
   * @scenario Individual logger configuration
   * @description Testing individual logger assignment for specific levels
   */
  describe('When: setting logger for specific levels', () => {
    it('Then: [正常] - should have setLogger method that can be called', () => {
      const config = new AgLoggerConfig();
      const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};

      // Test that setLogger method exists and can be called
      expect(typeof config.setLogger).toBe('function');

      // Test that it can be called without throwing error
      expect(() => config.setLogger(AG_LOGLEVEL.ERROR, testLogger)).not.toThrow();
    });

    it('Then: [正常] - should update single logger successfully', () => {
      const config = new AgLoggerConfig();

      // Create test logger
      const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};

      // Verify initial state is NullLogger
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);

      // Update single logger in map
      config.setLogger(AG_LOGLEVEL.ERROR, testErrorLogger);

      // Verify the logger was updated
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
      // Verify other levels remain unchanged
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(NullLogger);
    });

    it('Then: [正常] - should update multiple loggers independently', () => {
      const config = new AgLoggerConfig();

      // Create test loggers
      const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};
      const testWarnLogger = (_message: string | AgLogMessage): void => {/* test warn logger */};
      const testInfoLogger = (_message: string | AgLogMessage): void => {/* test info logger */};

      // Verify initial state
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(NullLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(NullLogger);

      // Update multiple loggers in map
      config.setLogger(AG_LOGLEVEL.ERROR, testErrorLogger);
      config.setLogger(AG_LOGLEVEL.WARN, testWarnLogger);
      config.setLogger(AG_LOGLEVEL.INFO, testInfoLogger);

      // Verify all specified loggers were updated
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testWarnLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testInfoLogger);
      // Verify unspecified levels remain unchanged
      expect(config.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(NullLogger);
    });

    it('Then: [正常] - should allow overwriting existing logger for same level', () => {
      const config = new AgLoggerConfig();
      const firstLogger = (_message: string | AgLogMessage): void => {/* first logger */};
      const secondLogger = (_message: string | AgLogMessage): void => {/* second logger */};

      config.setLogger(AG_LOGLEVEL.ERROR, firstLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(firstLogger);

      config.setLogger(AG_LOGLEVEL.ERROR, secondLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(secondLogger);
    });

    it('Then: [正常] - should return success status for valid operations', () => {
      const config = new AgLoggerConfig();
      const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};

      expect(config.setLogger(AG_LOGLEVEL.ERROR, testLogger)).toBe(true);
      expect(config.setLogger(AG_LOGLEVEL.WARN, testLogger)).toBe(true);
      expect(config.setLogger(AG_LOGLEVEL.INFO, testLogger)).toBe(true);
    });
  });

  /**
   * @context When
   * @scenario Invalid logger configuration
   * @description Testing error handling for invalid logger configuration parameters
   */
  describe('When: attempting to set logger with invalid parameters', () => {
    it('Then: [異常] - should reject invalid log levels', () => {
      const config = new AgLoggerConfig();
      const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};

      expect(config.setLogger(999 as AgLogLevel, testLogger)).toBe(false);
      expect(config.setLogger(-1 as AgLogLevel, testLogger)).toBe(false);
      expect(config.setLogger('INVALID' as unknown as AgLogLevel, testLogger)).toBe(false);
      expect(config.setLogger(null as unknown as AgLogLevel, testLogger)).toBe(false);
      expect(config.setLogger(undefined as unknown as AgLogLevel, testLogger)).toBe(false);
    });

    it('Then: [異常] - should not modify logger map when invalid log level provided', () => {
      const config = new AgLoggerConfig();
      const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};
      const originalLoggerFunction = config.getLoggerFunction(AG_LOGLEVEL.ERROR);

      // Attempt to set logger with invalid level
      config.setLogger(999 as AgLogLevel, testLogger);

      // Verify logger map remains unchanged
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(originalLoggerFunction);
    });
  });
});
