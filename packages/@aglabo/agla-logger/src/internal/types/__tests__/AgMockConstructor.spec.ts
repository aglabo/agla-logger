// src/internal/types/__tests__/AgMockConstructor.spec.ts
// @(#) : BDD Tests for AgMockConstructor type definitions
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// Import types for testing
import type { AgFormattedLogMessage, AgLogLevel, AgLogMessage } from '../../../../shared/types';
import type {
  AgFormatRoutine,
  AgFormatterInput,
  AgMockConstructor,
} from '../../../../shared/types';

/**
 * @suite AgMockConstructor Type Definitions | Unit Tests
 * @description Testing AgMockConstructor type system with format routines, mock constructors, and type compatibility
 * @testType unit
 * Scenarios: Format routine types, Mock constructor interface, Formatter input types, Type compatibility integration
 */
describe('AgMockConstructor type definitions', () => {
  /**
   * @context Feature
   * @scenario AgFormatRoutine type validation
   * @description Testing AgFormatRoutine type validation and function signatures
   */
  describe('Feature: AgFormatRoutine type validation', () => {
    /**
     * @context When
     * @scenario Creating AgFormatRoutine function instances
     * @description Testing function signature compliance and behavior
     */
    describe('When creating AgFormatRoutine function instances', () => {
      it('Then: [正常] - should accept AgLogMessage and return AgFormattedLogMessage', () => {
        // Type validation: AgFormatRoutine function signature
        const mockMessage: AgLogMessage = {
          logLevel: 4 as AgLogLevel, // AG_LOGLEVEL.INFO
          timestamp: new Date(),
          message: 'test message',
          args: [],
        };

        // AgFormatRoutine should be a function type
        const formatRoutine: AgFormatRoutine = (msg: AgLogMessage): AgFormattedLogMessage => {
          return msg.message;
        };

        const result = formatRoutine(mockMessage);
        expect(result).toBe('test message');
      });

      it('Then: [異常] - should accept AgLogMessage and throw error when specified', () => {
        const mockMessage: AgLogMessage = {
          logLevel: 2 as AgLogLevel, // AG_LOGLEVEL.ERROR
          timestamp: new Date(),
          message: 'error message',
          args: [],
        };

        const errorRoutine: AgFormatRoutine = (_msg: AgLogMessage): never => {
          throw new Error('Test error');
        };

        expect(() => errorRoutine(mockMessage)).toThrow('Test error');
      });
    });
  });

  /**
   * @context Feature
   * @scenario AgMockConstructor interface validation
   * @description Testing AgMockConstructor interface structure and method signatures
   */
  describe('Feature: AgMockConstructor interface validation', () => {
    /**
     * @context When
     * @scenario Implementing AgMockConstructor interface
     * @description Testing interface compliance and required properties
     */
    describe('When implementing AgMockConstructor interface', () => {
      it('Then: [正常] - should have __isMockConstructor property as true', () => {
        // Type validation: AgMockConstructor interface structure
        class TestMockConstructor {
          static readonly __isMockConstructor = true as const;

          constructor(_routine?: AgFormatRoutine) {}

          execute = (_msg: AgLogMessage): AgFormattedLogMessage => 'test';
          getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({
            callCount: 0,
            lastMessage: null,
          });
          reset = (): void => {};
        }

        // Type check - should be assignable to AgMockConstructor
        const mockConstructor: AgMockConstructor = TestMockConstructor;
        expect(mockConstructor.__isMockConstructor).toBe(true);
      });

      it('Then: [正常] - should accept required AgFormatRoutine in constructor', () => {
        class TestMockConstructor {
          static readonly __isMockConstructor = true as const;
          private routine: AgFormatRoutine;

          constructor(_routine?: AgFormatRoutine) {
            this.routine = _routine!;
          }

          execute = (msg: AgLogMessage): AgFormattedLogMessage => {
            return this.routine(msg);
          };
          getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({
            callCount: 0,
            lastMessage: null,
          });
          reset = (): void => {};
        }

        // Type check
        const mockConstructor: AgMockConstructor = TestMockConstructor;

        const customRoutine: AgFormatRoutine = (msg) => `CUSTOM: ${msg.message}`;
        const instance = new mockConstructor(customRoutine);

        const mockMessage: AgLogMessage = {
          logLevel: 4,
          timestamp: new Date(),
          message: 'test',
          args: [],
        };

        expect(instance.execute(mockMessage)).toBe('CUSTOM: test');
      });

      it('Then: [正常] - should have execute method returning AgFormattedLogMessage', () => {
        class TestMockConstructor {
          static readonly __isMockConstructor = true as const;

          constructor(_routine?: AgFormatRoutine) {}

          execute = (msg: AgLogMessage): AgFormattedLogMessage => {
            return `[${msg.logLevel}] ${msg.message}`;
          };
          getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({
            callCount: 0,
            lastMessage: null,
          });
          reset = (): void => {};
        }

        // Type check
        const mockConstructor: AgMockConstructor = TestMockConstructor;
        const dummyRoutine: AgFormatRoutine = (msg) => msg.message;
        const instance = new mockConstructor(dummyRoutine);

        const mockMessage: AgLogMessage = {
          logLevel: 3, // AG_LOGLEVEL.WARN
          timestamp: new Date(),
          message: 'warning',
          args: [],
        };

        const result = instance.execute(mockMessage);
        expect(result).toBe('[3] warning');
      });

      it('Then: [正常] - should have getStats method returning statistics object', () => {
        class TestMockConstructor {
          static readonly __isMockConstructor = true as const;

          constructor(_routine?: AgFormatRoutine) {}

          execute = (_msg: AgLogMessage): AgFormattedLogMessage => 'test';
          getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({
            callCount: 5,
            lastMessage: { logLevel: 4 as AgLogLevel, timestamp: new Date(), message: 'last', args: [] },
          });
          reset = (): void => {};
        }

        // Type check
        const mockConstructor: AgMockConstructor = TestMockConstructor;
        const dummyRoutine: AgFormatRoutine = (msg) => msg.message;
        const instance = new mockConstructor(dummyRoutine);
        const stats = instance.getStats();

        expect(stats).toHaveProperty('callCount');
        expect(stats).toHaveProperty('lastMessage');
        expect(stats.callCount).toBe(5);
      });

      it('Then: [正常] - should have reset method for clearing statistics', () => {
        class TestMockConstructor {
          static readonly __isMockConstructor = true as const;

          constructor(_routine?: AgFormatRoutine) {}

          execute = (_msg: AgLogMessage): AgFormattedLogMessage => 'test';
          getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({
            callCount: 0,
            lastMessage: null,
          });
          reset = (): void => {/* reset implementation */};
        }

        // Type check
        const mockConstructor: AgMockConstructor = TestMockConstructor;
        const dummyRoutine: AgFormatRoutine = (msg) => msg.message;
        const instance = new mockConstructor(dummyRoutine);

        // Should have reset method without error
        expect(() => instance.reset()).not.toThrow();
      });
    });
  });

  /**
   * @context Feature
   * @scenario AgFormatterInput union type validation
   * @description Testing AgFormatterInput union type validation and type compatibility
   */
  describe('Feature: AgFormatterInput union type validation', () => {
    /**
     * @context When
     * @scenario Using AgFormatterInput union type
     * @description Testing type compatibility with both function and constructor variants
     */
    describe('When using AgFormatterInput union type', () => {
      it('Then: [正常] - should accept AgFormatFunction as valid input', () => {
        const formatFunction: AgFormatterInput = (msg: AgLogMessage): AgFormattedLogMessage => {
          return msg.message;
        };

        const mockMessage: AgLogMessage = {
          logLevel: 4,
          timestamp: new Date(),
          message: 'test function',
          args: [],
        };

        // AgFormatterInput should work as function
        if (typeof formatFunction === 'function') {
          const result = formatFunction(mockMessage);
          expect(result).toBe('test function');
        }
      });

      it('Then: [正常] - should accept AgMockConstructor as valid input', () => {
        class TestMockConstructor {
          static readonly __isMockConstructor = true as const;

          constructor(_routine?: AgFormatRoutine) {}

          execute = (msg: AgLogMessage): AgFormattedLogMessage => msg.message;
          getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({
            callCount: 0,
            lastMessage: null,
          });
          reset = (): void => {};
        }

        // AgFormatterInput should accept AgMockConstructor
        const formatterInput: AgFormatterInput = TestMockConstructor;

        // Type guard to check if it's a mock constructor
        if ('__isMockConstructor' in formatterInput) {
          expect(formatterInput.__isMockConstructor).toBe(true);
        }
      });
    });
  });

  /**
   * @context Feature
   * @scenario Type compatibility validation
   * @description Testing integration and compatibility with existing type system
   */
  describe('Feature: Type compatibility validation', () => {
    /**
     * @context When
     * @scenario Integrating with existing type system
     * @description Testing cross-type interactions and compatibility
     */
    describe('When integrating with existing type system', () => {
      it('Then: [正常] - should work with existing AgLogMessage type', () => {
        const mockMessage: AgLogMessage = {
          logLevel: 4,
          timestamp: new Date(),
          message: 'compatibility test',
          args: [{ key: 'value' }],
        };

        const routine: AgFormatRoutine = (msg: AgLogMessage): string => {
          return `${msg.message} - args: ${msg.args.length}`;
        };

        const result = routine(mockMessage);
        expect(result).toBe('compatibility test - args: 1');
      });

      it('Then: [正常] - should work with existing AgFormattedLogMessage type', () => {
        // Test string return
        const stringRoutine: AgFormatRoutine = (_msg: AgLogMessage): string => 'string result';

        // Test AgLogMessage return
        const objectRoutine: AgFormatRoutine = (msg: AgLogMessage): AgLogMessage => msg;

        const mockMessage: AgLogMessage = {
          logLevel: 4,
          timestamp: new Date(),
          message: 'test',
          args: [],
        };

        expect(stringRoutine(mockMessage)).toBe('string result');
        expect(objectRoutine(mockMessage)).toEqual(mockMessage);
      });
    });
  });
});
