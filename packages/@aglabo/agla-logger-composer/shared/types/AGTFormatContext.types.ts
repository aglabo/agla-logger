// src: packages/@aglabo/agla-logger-composer/shared/types/AGTFormatContext.types.ts
// @(#) Immutable format context type and utility functions for formatting operations
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Immutable format context type for tracking recursion depth during formatting.
 * Used by stringify functions to manage depth-first traversal state.
 *
 * @example
 * ```typescript
 * const ctx: AGTFormatContext = agFormat.createContext();
 * console.log(ctx.depth); // 0
 * ```
 */
export type AGTFormatContext = {
  /**
   * Current recursion depth (immutable).
   * Starts at 0 and increases with each nested level during formatting.
   */
  readonly depth: number;
};

/**
 * Internal function to normalize depth value.
 * Invalid values (negative, NaN, Infinity) are normalized to 0.
 * @param depth - Raw depth value
 * @returns Normalized depth value (non-negative finite integer)
 */
const _normalizeDepth = (depth: number): number => {
  // Handle NaN, Infinity, -Infinity, and negative numbers
  if (!Number.isFinite(depth) || depth < 0) {
    return 0;
  }
  return Math.floor(depth);
};

/**
 * Internal factory function to create a format context.
 * @param depth - Initial depth value (defaults to 0)
 * @returns New immutable format context
 */
const _createContext = (depth: number = 0): AGTFormatContext => {
  return { depth: _normalizeDepth(depth) };
};

/**
 * Internal function to create the next format context with increased depth.
 * @param context - Current format context
 * @returns New format context with depth increased by 1
 */
const _nextContext = (context: AGTFormatContext): AGTFormatContext => {
  return _createContext(context.depth + 1);
};

/**
 * Internal function to ensure a valid format context.
 * If no context is provided, a new one is created.
 * @param context
 * @returns
 */
const _ensureContext = (context?: AGTFormatContext): AGTFormatContext => {
  return context ?? _createContext();
};

/**
 * Utility namespace for format context operations.
 * Provides factory functions for creating and manipulating immutable contexts.
 */
export const agFormat = {
  /**
   * Creates a new format context.
   * @param depth - Initial depth value (defaults to 0)
   * @returns New immutable format context
   */
  createContext: _createContext,
  /**
   * Generates the next format context with increased depth.
   * @param context - Current format context
   * @returns New format context with depth increased by 1
   */
  nextContext: _nextContext,
  /**
   * Ensures a valid format context is provided.
   * If no context is given, a new one is created.
   * @param context - Optional existing format context
   * @returns Valid format context
   */
  ensureContext: _ensureContext,
} as const;
