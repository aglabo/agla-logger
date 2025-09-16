// src/plugins/logger/_bufferLogger.ts
// @(#) : Mock Logger for Unit and Integration Testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import type { AgLoggerMethodsInterface } from '../../utils/AgLoggerMethod';
import { bindLoggerMethods } from '../../utils/AgLoggerMethod';
import { isValidLogLevel } from '../../utils/AgLogValidators';

import { NullLogger } from './NullLogger';

// constants
import { AG_LOGLEVEL, AG_LOGLEVEL_KEYS, AG_LOGLEVEL_VALUES } from '../../../shared/types';
// types
import type {
  AgFormattedLogMessage,
  AgLoggerFunction,
  AgLoggerMap,
  AgLogLevel,
  AgLogLevelLabel,
  AgLogMessage,
} from '../../../shared/types';

/**
 * Universal mock logger for unit and integration testing.
 * Provides message capture and verification capabilities for all test types.
 *
 * Features:
 * - Fast execution for unit and integration tests
 * - Component interaction verification
 * - Synchronous operations only
 * - Thread-safe for single-threaded test scenarios
 * - Deep immutability for message objects
 */
/**
 * ユニバーサルモックロガークラス
 *
 * AgLoggerMethodsInterfaceを実装し、全ログレベルのメッセージを内部バッファに保存する
 * テスト用モックロガーです。リアルタイムのログ検証、メッセージ履歴管理、
 * および各種テストシナリオでのロガー動作確認に使用されます。
 *
 * 主要機能:
 * - 全ログレベル(FATAL/ERROR/WARN/INFO/DEBUG/TRACE/LOG/VERBOSE)対応
 * - ログレベル別メッセージ管理とバッファリング
 * - メッセージ履歴の取得・検索・クリア機能
 * - 動的ロガーマップの生成
 *
 * @implements AgLoggerMethodsInterface
 *
 * @example
 * ```typescript
 * import { AgMockBufferLogger } from './MockLogger';
 *
 * const mockLogger = new AgMockBufferLogger();
 * mockLogger.info('Test message');
 *
 * console.log(mockLogger.getMessages('INFO')); // ['Test message']
 * console.log(mockLogger.getTotalMessageCount()); // 1
 * ```
 */

export class AgMockBufferLogger implements AgLoggerMethodsInterface {
  public defaultLoggerMap: AgLoggerMap;
  [key: string]: unknown;

  constructor() {
    this.defaultLoggerMap = this.createLoggerMap();
    bindLoggerMethods(this);
  }

  private messages: Map<AgLogLevel, AgFormattedLogMessage[]> = new Map(
    AG_LOGLEVEL_VALUES.map((level) => [level, []]),
  );

  /**
   * Validates if the provided log level is valid.
   * @param logLevel - The log level to validate
   * @throws {Error} When log level is invalid
   */
  private validateLogLevel(logLevel: AgLogLevel): void {
    if (!isValidLogLevel(logLevel)) {
      throw new Error(`MockLogger: Invalid log level: ${String(logLevel)}`);
    }
  }

  // Logger methods
  public executeLog(level: AgLogLevel, message: AgFormattedLogMessage): void {
    this.validateLogLevel(level);
    this.messages.get(level)!.push(message);
  }

  /**
   * FATALレベルログメッセージの受信処理
   *
   * 最高重要度のFATALレベルログメッセージを内部バッファに保存します。
   * システムの致命的なエラーやクラッシュ情報の記録に使用されます。
   *
   * @param formattedLogMessage - フォーマット済みログメッセージ
   */

  fatal(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.FATAL, message);
  }

  /**
   * ERRORレベルログメッセージの受信処理
   *
   * ERRORレベルログメッセージを内部バッファに保存します。
   * アプリケーションエラーや例外情報の記録に使用されます。
   *
   * @param formattedLogMessage - フォーマット済みログメッセージ
   */

  error(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.ERROR, message);
  }

  /**
   * WARNレベルログメッセージの受信処理
   *
   * WARNレベルログメッセージを内部バッファに保存します。
   * 警告情報や注意喚起メッセージの記録に使用されます。
   *
   * @param formattedLogMessage - フォーマット済みログメッセージ
   */

  warn(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.WARN, message);
  }

  /**
   * INFOレベルログメッセージの受信処理
   *
   * INFOレベルログメッセージを内部バッファに保存します。
   * 一般的な情報メッセージやステータス通知の記録に使用されます。
   *
   * @param formattedLogMessage - フォーマット済みログメッセージ
   */

  info(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.INFO, message);
  }

  /**
   * DEBUGレベルログメッセージの受信処理
   *
   * DEBUGレベルログメッセージを内部バッファに保存します。
   * 開発時のデバッグ情報やトレース情報の記録に使用されます。
   *
   * @param formattedLogMessage - フォーマット済みログメッセージ
   */

  debug(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.DEBUG, message);
  }

  /**
   * TRACEレベルログメッセージの受信処理
   *
   * 最低重要度のTRACEレベルログメッセージを内部バッファに保存します。
   * 詳細なトレース情報や実行フロー追跡の記録に使用されます。
   *
   * @param formattedLogMessage - フォーマット済みログメッセージ
   */

  trace(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.TRACE, message);
  }

  /**
   * VERBOSEレベルログメッセージの受信処理
   *
   * VERBOSEレベルログメッセージを内部バッファに保存します。
   * 詳細な動作ログや冗長な情報の記録に使用されます。
   *
   * @param formattedLogMessage - フォーマット済みログメッセージ
   */

  verbose(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.VERBOSE, message);
  }

  /**
   * LOGレベルログメッセージの受信処理
   *
   * 汎用LOGレベルログメッセージを内部バッファに保存します。
   * 一般的なログ出力や標準的なメッセージ記録に使用されます。
   *
   * @param formattedLogMessage - フォーマット済みログメッセージ
   */

  log(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.LOG, message);
  }

  default(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.DEFAULT, message);
  }

  // Query methods
  getMessages(logLevel?: AgLogLevel): AgFormattedLogMessage[] {
    const levelToUse = (arguments.length === 0)
      ? AG_LOGLEVEL.DEFAULT
      : (logLevel as unknown as AgLogLevel);
    this.validateLogLevel(levelToUse);
    return this.messages.get(levelToUse)?.slice() ?? [];
  }

  getLastMessage(logLevel?: AgLogLevel): AgLogMessage | string | null {
    const levelToUse = (arguments.length === 0)
      ? AG_LOGLEVEL.DEFAULT
      : (logLevel as unknown as AgLogLevel);
    this.validateLogLevel(levelToUse);
    return this.messages.get(levelToUse)?.slice(-1)[0] ?? null;
  }

  getAllMessages(): { [K in AgLogLevelLabel]: AgFormattedLogMessage[] } {
    return AG_LOGLEVEL_KEYS.reduce((acc, key) => ({
      ...acc,
      [key]: this.messages.get(AG_LOGLEVEL[key])?.slice() ?? [],
    }), {} as { [K in AgLogLevelLabel]: AgFormattedLogMessage[] });
  }

  // Utility methods
  clearMessages(logLevel: AgLogLevel): void {
    this.validateLogLevel(logLevel);
    this.messages.set(logLevel, []);
  }

  clearAllMessages(): void {
    (Object.values(AG_LOGLEVEL) as AgLogLevel[]).forEach((level) => {
      this.messages.set(level, []);
    });
  }

  reset(): void {
    this.clearAllMessages();
  }

  getMessageCount(logLevel?: AgLogLevel): number {
    const levelToUse = (arguments.length === 0)
      ? AG_LOGLEVEL.DEFAULT
      : (logLevel as unknown as AgLogLevel);
    this.validateLogLevel(levelToUse);
    return this.messages.get(levelToUse)!.length;
  }

  getTotalMessageCount(): number {
    let total = 0;
    for (const levelMessages of this.messages.values()) {
      total += levelMessages.length;
    }
    return total;
  }

  hasMessages(logLevel?: AgLogLevel): boolean {
    const levelToUse = (arguments.length === 0)
      ? AG_LOGLEVEL.DEFAULT
      : (logLevel as unknown as AgLogLevel);
    this.validateLogLevel(levelToUse);
    return this.messages.get(levelToUse)!.length > 0;
  }

  hasAnyMessages(): boolean {
    for (const levelMessages of this.messages.values()) {
      if (levelMessages.length > 0) { return true; }
    }
    return false;
  }

  /**
   * Gets the logger function for a specific log level.
   * @param logLevel - The log level to get the logger function for
   * @returns The logger function for the specified level
   */
  getLoggerFunction(logLevel?: AgLogLevel): AgLoggerFunction {
    const levelToUse = (arguments.length === 0)
      ? AG_LOGLEVEL.DEFAULT
      : (logLevel as unknown as AgLogLevel);
    this.validateLogLevel(levelToUse);
    return this.defaultLoggerMap[levelToUse] ?? NullLogger;
  }

  /**
   * Create AgLoggerMap for testing.
   * This provides level-specific logging functions.
   */
  createLoggerMap(): AgLoggerMap {
    const _loggerMap = Object.fromEntries(
      (Object.values(AG_LOGLEVEL) as AgLogLevel[]).map((level) => [
        level,
        level === AG_LOGLEVEL.OFF
          ? NullLogger
          : ((message: AgFormattedLogMessage): void => this.executeLog(level, message)).bind(this),
      ]),
    ) as AgLoggerMap;
    _loggerMap[AG_LOGLEVEL.DEFAULT] = this.default.bind(this);
    return _loggerMap;
  }
}
// other functions

// Export for backward compatibility
export const MockLogger = {
  buffer: AgMockBufferLogger,
  throwError: (errorMessage: string): AgLoggerFunction => {
    return () => {
      throw new Error(errorMessage);
    };
  },
} as const;
