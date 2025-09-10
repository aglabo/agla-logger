// src/plugins/formatter/__tests__/AgMockFormatter.spec.ts
// @(#) : BDD Tests for AgMockFormatter implementation
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { beforeEach, describe, expect, it } from 'vitest';

// Import types and modules
import type { AgLogLevel, AgLogMessage } from '../../../../shared/types';
import type { AgFormatRoutine } from '../../../../shared/types/AgMockConstructor.class';
import { AgMockFormatter } from '../AgMockFormatter';

/**
 * BDD Tests for AgMockFormatter class implementation
 * Following atsushifx式BDD with Red-Green-Refactor cycles
 */
describe('Feature: AgMockFormatter statistics functionality', () => {
  let mockMessage: AgLogMessage;

  beforeEach(() => {
    mockMessage = {
      logLevel: 4 as AgLogLevel, // AG_LOGLEVEL.INFO
      timestamp: new Date('2025-01-01T12:00:00Z'),
      message: 'test message',
      args: [],
    };
  });

  describe('When: tracking formatter call count', () => {
    it('Then: [正常] - should increment callCount when execute is called', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);

      // Act
      formatter.execute(mockMessage);
      formatter.execute(mockMessage);

      // Assert
      const stats = formatter.getStats();
      expect(stats.callCount).toBe(2);
    });

    it('Then: [正常] - should start with callCount as 0', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);

      // Assert
      const stats = formatter.getStats();
      expect(stats.callCount).toBe(0);
    });
  });

  describe('When: tracking last message', () => {
    it('Then: [正常] - should store lastMessage when execute is called', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);

      // Act
      formatter.execute(mockMessage);

      // Assert
      const stats = formatter.getStats();
      expect(stats.lastMessage).toEqual(mockMessage);
    });

    it('Then: [正常] - should update lastMessage with the most recent message', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);
      const firstMessage = { ...mockMessage, message: 'first message' };
      const secondMessage = { ...mockMessage, message: 'second message' };

      // Act
      formatter.execute(firstMessage);
      formatter.execute(secondMessage);

      // Assert
      const stats = formatter.getStats();
      expect(stats.lastMessage).toEqual(secondMessage);
    });

    it('Then: [正常] - should start with lastMessage as null', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);

      // Assert
      const stats = formatter.getStats();
      expect(stats.lastMessage).toBeNull();
    });
  });

  describe('When: executing format routines', () => {
    it('Then: [正常] - should call the provided format routine and return its result', () => {
      // Arrange
      const customRoutine: AgFormatRoutine = (msg) => `CUSTOM: ${msg.message}`;
      const formatter = new AgMockFormatter(customRoutine);

      // Act
      const result = formatter.execute(mockMessage);

      // Assert
      expect(result).toBe('CUSTOM: test message');
    });

    it('Then: [正常] - should pass the correct message to the format routine', () => {
      // Arrange
      let receivedMessage: AgLogMessage | null = null;
      const spyRoutine: AgFormatRoutine = (msg) => {
        receivedMessage = msg;
        return msg.message;
      };
      const formatter = new AgMockFormatter(spyRoutine);

      // Act
      formatter.execute(mockMessage);

      // Assert
      expect(receivedMessage).toEqual(mockMessage);
    });

    it('Then: [正常] - should handle JSON format routine correctly', () => {
      // Arrange
      const jsonRoutine: AgFormatRoutine = (msg) =>
        JSON.stringify({
          timestamp: msg.timestamp.toISOString(),
          logLevel: msg.logLevel,
          message: msg.message,
          ...(msg.args.length > 0 && { args: msg.args }),
        });
      const formatter = new AgMockFormatter(jsonRoutine);

      // Act
      const result = formatter.execute(mockMessage);

      // Assert
      const parsed = JSON.parse(result as string);
      expect(parsed.message).toBe('test message');
      expect(parsed.logLevel).toBe(4);
      expect(parsed.timestamp).toBe('2025-01-01T12:00:00.000Z');
    });

    it('Then: [正常] - should handle passthrough routine correctly', () => {
      // Arrange
      const passthroughRoutine: AgFormatRoutine = (msg) => msg;
      const formatter = new AgMockFormatter(passthroughRoutine);

      // Act
      const result = formatter.execute(mockMessage);

      // Assert
      expect(result).toEqual(mockMessage);
    });
  });

  describe('When: resetting statistics', () => {
    it('Then: [正常] - should reset callCount to 0', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);
      formatter.execute(mockMessage);
      formatter.execute(mockMessage);

      // Act
      formatter.reset();

      // Assert
      const stats = formatter.getStats();
      expect(stats.callCount).toBe(0);
    });

    it('Then: [正常] - should reset lastMessage to null', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);
      formatter.execute(mockMessage);

      // Act
      formatter.reset();

      // Assert
      const stats = formatter.getStats();
      expect(stats.lastMessage).toBeNull();
    });
  });

  describe('When: validating AgMockConstructor interface compliance', () => {
    it('Then: [正常] - should have __isMockConstructor property set to true', () => {
      // Assert
      expect(AgMockFormatter.__isMockConstructor).toBe(true);
    });

    it('Then: [正常] - should be instantiable with AgFormatRoutine', () => {
      // Arrange
      const routine: AgFormatRoutine = (msg) => msg.message;

      // Act & Assert
      expect(() => new AgMockFormatter(routine)).not.toThrow();
    });

    it('Then: [正常] - should provide execute method that returns formatted message', () => {
      // Arrange
      const routine: AgFormatRoutine = (msg) => `formatted: ${msg.message}`;
      const formatter = new AgMockFormatter(routine);

      // Act
      const result = formatter.execute(mockMessage);

      // Assert
      expect(typeof formatter.execute).toBe('function');
      expect(result).toBe('formatted: test message');
    });

    it('Then: [正常] - should provide getStats method that returns statistics object', () => {
      // Arrange
      const routine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(routine);

      // Act
      const stats = formatter.getStats();

      // Assert
      expect(typeof formatter.getStats).toBe('function');
      expect(stats).toHaveProperty('callCount');
      expect(stats).toHaveProperty('lastMessage');
      expect(typeof stats.callCount).toBe('number');
    });

    it('Then: [正常] - should provide reset method', () => {
      // Arrange
      const routine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(routine);

      // Assert
      expect(typeof formatter.reset).toBe('function');
      expect(() => formatter.reset()).not.toThrow();
    });
  });

  describe('When: handling error throw routines', () => {
    it('Then: [異常] - should throw error when error routine is provided', () => {
      // Arrange
      const errorRoutine: AgFormatRoutine = (_msg): never => {
        throw new Error('Test error from routine');
      };
      const formatter = new AgMockFormatter(errorRoutine);

      // Act & Assert
      expect(() => formatter.execute(mockMessage)).toThrow('Test error from routine');
    });

    it('Then: [エッジケース] - should still increment callCount even when error is thrown', () => {
      // Arrange
      const errorRoutine: AgFormatRoutine = (_msg): never => {
        throw new Error('Test error');
      };
      const formatter = new AgMockFormatter(errorRoutine);

      // Act
      try {
        formatter.execute(mockMessage);
      } catch {
        // Expected error
      }

      // Assert
      const stats = formatter.getStats();
      expect(stats.callCount).toBe(1);
    });

    it('Then: [エッジケース] - should still store lastMessage even when error is thrown', () => {
      // Arrange
      const errorRoutine: AgFormatRoutine = (_msg): never => {
        throw new Error('Test error');
      };
      const formatter = new AgMockFormatter(errorRoutine);

      // Act
      try {
        formatter.execute(mockMessage);
      } catch {
        // Expected error
      }

      // Assert
      const stats = formatter.getStats();
      expect(stats.lastMessage).toEqual(mockMessage);
    });
  });
});
