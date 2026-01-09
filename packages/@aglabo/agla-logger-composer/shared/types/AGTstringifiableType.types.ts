// src: packages/@aglabo/agla-logger-composer/shared/types/stringifiableType.ts
// @(#) Stringifiable type definitions for logging utilities
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Enum for stringifiable object types.
 * Defines special object types that require custom string formatting.
 */
export enum AGTStringifiableType {
  Date = 'Date',
  RegExp = 'RegExp',
  Error = 'Error',
  URL = 'URL',
  URLSearchParams = 'URLSearchParams',
  Map = 'Map',
  Set = 'Set',
  TypedArray = 'TypedArray',
  ArrayBuffer = 'ArrayBuffer',
  DataView = 'DataView',
  CustomClass = 'CustomClass',
}

/**
 * Options for FormatterContext initialization.
 * Controls formatting behavior for recursive object processing.
 */
export type AGTFormatterContextOptions = {
  /** Maximum number of elements to display in Map/Set (default: 100) */
  maxElements?: number;
  /** Maximum nesting depth for recursive formatting (default: 5) */
  maxDepth?: number;
};
