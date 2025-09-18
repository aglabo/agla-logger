// src: /src/functional/core/parseArgsToAgLogMessage.ts
// @(#) : Pure function for formatting log messages
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 型定義・インターフェース
import type { AgLogLevel, AgLogMessage } from '../../../shared/types';

// ユーティリティ・ヘルパー関数
import { extractMessage } from '../../utils/AgLogHelpers';
import { AgToLabel } from '../../utils/AgLogHelpers';

// 内部型
type _TLogMessage = AgLogMessage & {
  readonly level: string;
};

/**
 * メッセージ引数判定の説明
 *
 * 未知の値がログメッセージの引数として適切かどうかを判定します。
 * プリミティブ型（string、number、boolean、symbol）のフィルタリングを行い、
 * 複雑なオブジェクトや関数を除外してログメッセージの品質を保持します。
 *
 * @param arg - 判定対象の値
 * @returns プリミティブ型として有効な場合true、それ以外はfalse
 */
const isMessageArgument = (arg: unknown): arg is string | number | boolean | symbol => {
  const argType = typeof arg;
  return ['string', 'number', 'boolean', 'symbol'].includes(argType);
};

/**
 * タイムスタンプ検証の説明
 *
 * 未知の値が有効なタイムスタンプ文字列かどうかを検証します。
 * ISO8601形式（YYYY-MM-DDTHH:MM:SS.sssZ）とカスタム形式
 * （YYYY-MM-DD HH:MM:SS）の両方に対応し、実際のDate変換による
 * 有効性チェックも実行します。
 *
 * @param arg - 検証対象の値
 * @returns 有効なタイムスタンプ文字列の場合true、それ以外はfalse
 */
const isTimestamp = (arg: unknown): arg is string => {
  if (typeof arg !== 'string') { return false; }

  // Check for ISO timestamp format (strict)
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)$/;

  // Check for 'yyyy-mm-dd HH:MM:SS' format
  const standardPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

  if (!isoPattern.test(arg) && !standardPattern.test(arg)) { return false; }

  const timestamp = new Date(arg);
  return !isNaN(timestamp.getTime());
};

/**
 * Extracts non-message arguments for structured data storage.
 *
 * @param args - Array of arguments to process
 * @returns Array of complex arguments that don't belong in the message text (objects, arrays, etc.)
 */
const extractArgs = (args: readonly unknown[]): readonly unknown[] => {
  return args.filter((arg) => !isMessageArgument(arg));
};

/**
 * Parses timestamp from the first argument if present, otherwise uses current time.
 *
 * @param args - Array of arguments to check for timestamp
 * @returns Tuple of [timestamp, remaining arguments]
 */
const parseTimestamp = (args: readonly unknown[]): [Date, readonly unknown[]] => {
  if (args.length > 0 && isTimestamp(args[0])) {
    return [new Date(args[0]), args.slice(1)];
  }
  return [new Date(), args];
};

/**
 * Pure function to parse arguments into structured log message.
 * Converts AgLogLevel to string labels, handles optional timestamp,
 * and separates message from structured arguments.
 *
 * @param level - The log level
 * @param args - Variable arguments to be processed (optional timestamp first)
 * @returns Immutable LogMessage object
 */
export const parseArgsToAgLogMessage = (
  level: AgLogLevel,
  ...args: readonly unknown[]
): _TLogMessage => {
  const [timestamp, remainingArgs] = parseTimestamp(args);

  const result: _TLogMessage = {
    logLevel: level,
    level: AgToLabel(level),
    message: extractMessage(remainingArgs),
    timestamp,
    args: Object.freeze([...extractArgs(remainingArgs)]),
  };

  return Object.freeze(result);
};
