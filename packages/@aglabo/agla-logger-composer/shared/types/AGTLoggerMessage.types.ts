// src: packages/@aglabo/agla-logger-composer/shared/types/AGTLoggerMessage.types.ts
// @(#) Type definitions for structured log messages
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Parsed result from logging input arguments.
 * Used to separate human-readable message components and structured data objects.
 *
 * The message parser follows these rules:
 * - Primitive values (string, number, boolean, symbol) are concatenated into `messages`
 * - Non-primitive values (objects, arrays, functions) are stored in `objects`
 * - Timestamp can be provided as ISO/Standard format string and converted to Date
 *
 * All properties are immutable (readonly) to ensure data integrity throughout
 * the logging pipeline.
 *
 * @example
 * ```typescript
 * const logMessage: AGTLogMessage = {
 *   logLabel: 'INFO',
 *   timestamp: new Date('2025-12-12T12:00:00Z'),
 *   messages: ['User logged in from 192.168.1.1'],
 *   values: [{ userId: 123, sessionId: 'abc123' }]
 * };
 * ```
 */
export type AGTLogMessage = {
  /**
   * Log level label string (immutable).
   * Must be uppercase letters only. Typically one of: OFF, FATAL, ERROR, WARN, INFO, DEBUG, TRACE, ALL
   *
   * Note: Future extensions may introduce additional custom labels, but all labels must follow
   * the uppercase-only convention.
   *
   * @example "INFO"
   * @constraint Must contain only uppercase letters (A-Z). Invalid: "info", "Info", "DEBUG123"
   */
  readonly logLabel: string;

  /**
   * Timestamp for the log entry (immutable).
   * If the first argument is a valid timestamp string (ISO format with Z-termination
   * or Standard format: YYYY-MM-DDTHH:MM:SS), it will be parsed and used.
   * Otherwise, the current time is used.
   *
   * @example new Date('2025-12-12T12:00:00Z')
   */
  readonly timestamp: Date;

  /**
   * Array of message strings (immutable).
   * Concatenated from primitive arguments (string, number, boolean, symbol).
   * Non-primitive arguments are excluded from the messages and stored in `objects` instead.
   *
   * @example ['User logged in successfully from IP', '192.168.1.1']
   */
  readonly messages: readonly string[];

  /**
   * Array of structured data objects (immutable).
   * Contains non-primitive arguments such as objects, arrays, and other complex types.
   * These can be used by formatters for structured logging or additional context.
   *
   * @example [{ userId: 123, sessionId: 'abc123', metadata: { browser: 'Chrome' } }]
   */
  readonly values: readonly unknown[];
};
