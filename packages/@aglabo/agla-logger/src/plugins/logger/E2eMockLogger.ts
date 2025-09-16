// src/plugins/logger/E2eMockLogger.ts
// @(#) : E2E Mock Logger Implementation with Test ID Encapsulation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 型定義・インターフェース
import type {
  AgFormattedLogMessage,
  AgLoggerFunction,
  AgLoggerInterface,
  AgLoggerMap,
  AgLogLevel,
  AgLogMessage,
} from '../../../shared/types';
import type { AgMockBufferLogger } from './MockLogger';

// 定数・設定・エラーメッセージ
import { AG_LOGLEVEL } from '../../../shared/types';

// プラグインシステム
import { MockLogger } from './MockLogger';

// ユーティリティ・ヘルパー関数
import { createTestId, getNormalizedBasename } from '../../utils/testIdUtils';

/**
 * Mock logger for E2E testing that supports parallel test execution.
 * Uses a Map to bind testId to MockLogger instances for complete isolation.
 * Each test gets its own MockLogger instance for thread-safe parallel execution.
 */
export class E2eMockLogger implements AgLoggerInterface {
  private _testIdentifier: string;
  private _currentTestId: string | null;
  private _mockLoggers: Map<string, AgMockBufferLogger>;
  private _defaultLoggerMap: AgLoggerMap | undefined;

  /**
   * E2eMockLoggerコンストラクタ
   *
   * 並列テスト実行対応のモックロガーを初期化します。
   * テスト識別子の正規化、内部状態の初期化、testId-MockLoggerマップの設定を行います。
   *
   * @param identifier - テスト識別子（省略時は'e2e-default'を使用）
   */
  constructor(identifier?: string) {
    const trimmedIdentifier = typeof identifier === 'string' ? identifier.trim() : '';
    this._testIdentifier = trimmedIdentifier ? getNormalizedBasename(trimmedIdentifier) : 'e2e-default';
    this._currentTestId = null;
    this._mockLoggers = new Map<string, AgMockBufferLogger>();
  }

  /**
   * Get the default logger map.
   */
  get defaultLoggerMap(): AgLoggerMap {
    if (!this._defaultLoggerMap) {
      const _mockLogger = this.getCurrentMockLogger();
      this._defaultLoggerMap = _mockLogger.defaultLoggerMap;
    }
    return this._defaultLoggerMap;
  }
  /**
   * Set the default logger map.
   */
  set defaultLoggerMap(value: AgLoggerMap | undefined) {
    this._defaultLoggerMap = value;
  }

  /**
   * Get the current test ID for this logger instance.
   */
  getCurrentTestId(): string | AgLogMessage | null {
    return this._currentTestId;
  }

  /**
   * Get the test identifier for this logger instance.
   */
  getTestIdentifier(): string {
    return this._testIdentifier;
  }

  /**
   * 新しいテストを開始
   *
   * 指定されたtestIDで新しいテストを開始し、専用のMockLoggerインスタンスを作成します。
   * testID未指定の場合は自動生成されたIDを使用します。並列テスト実行において
   * テスト間の完全な分離を実現します。
   *
   * @param testId - テストID（省略時は自動生成）
   */
  startTest(testId: string = ''): void {
    const trimmedTestId = testId.trim();
    const finalTestId = trimmedTestId === ''
      ? createTestId(this._testIdentifier)
      : trimmedTestId;

    // Create new MockLogger instance for this test
    this._mockLoggers.set(finalTestId, new MockLogger.buffer());
    this._currentTestId = finalTestId;
  }

  /**
   * 現在のテストを終了
   *
   * 指定されたtestIDまたは現在アクティブなテストを終了し、対応するMockLoggerインスタンスを
   * マップから削除してリソースを解放します。testID指定がない場合は現在のテストを終了します。
   *
   * @param testId - 終了するテストID（省略時は現在のテストを終了）
   * @throws Error 指定されたtestIDが現在のテストと異なる場合
   */
  endTest(testId?: string): void {
    if (testId) {
      if (testId !== this._currentTestId) {
        throw new Error(`Cannot end test '${testId}': current test is '${this._currentTestId}'`);
      }
      // Remove MockLogger instance from map
      this._mockLoggers.delete(testId);
      this._currentTestId = null;
    } else {
      // End current test if no specific testId provided
      if (this._currentTestId) {
        this._mockLoggers.delete(this._currentTestId);
        this._currentTestId = null;
      }
    }
  }

  // Logger methods
  /**
   * FATALレベルログメッセージを記録
   *
   * 最高重要度のFATALレベルログメッセージを現在のテスト用MockLoggerに記録します。
   * E2E並列テスト環境でのtestId分離により、テスト間の干渉を防止します。
   *
   * @param message - フォーマット済みログメッセージ
   */
  fatal(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.FATAL, message);
  }

  /**
   * ERRORレベルログメッセージを記録
   *
   * ERRORレベルログメッセージを現在のテスト用MockLoggerに記録します。
   * E2E並列テスト環境でのtestId分離により、テスト間の干渉を防止します。
   *
   * @param message - フォーマット済みログメッセージ
   */
  error(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.ERROR, message);
  }

  /**
   * WARNレベルログメッセージを記録
   *
   * WARNレベルログメッセージを現在のテスト用MockLoggerに記録します。
   * E2E並列テスト環境でのtestId分離により、テスト間の干渉を防止します。
   *
   * @param message - フォーマット済みログメッセージ
   */
  warn(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.WARN, message);
  }

  /**
   * INFOレベルログメッセージを記録
   *
   * INFOレベルログメッセージを現在のテスト用MockLoggerに記録します。
   * E2E並列テスト環境でのtestId分離により、テスト間の干渉を防止します。
   *
   * @param message - フォーマット済みログメッセージ
   */
  info(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.INFO, message);
  }

  /**
   * DEBUGレベルログメッセージを記録
   *
   * DEBUGレベルログメッセージを現在のテスト用MockLoggerに記録します。
   * E2E並列テスト環境でのtestId分離により、テスト間の干渉を防止します。
   *
   * @param message - フォーマット済みログメッセージ
   */
  debug(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.DEBUG, message);
  }

  /**
   * TRACEレベルログメッセージを記録
   *
   * TRACEレベルログメッセージを現在のテスト用MockLoggerに記録します。
   * E2E並列テスト環境でのtestId分離により、テスト間の干渉を防止します。
   *
   * @param message - フォーマット済みログメッセージ
   */
  trace(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.TRACE, message);
  }

  /**
   * VERBOSEレベルログメッセージを記録
   *
   * VERBOSEレベルログメッセージを現在のテスト用MockLoggerに記録します。
   * E2E並列テスト環境でのtestId分離により、テスト間の干渉を防止します。
   *
   * @param message - フォーマット済みログメッセージ
   */
  verbose(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.VERBOSE, message);
  }

  /**
   * LOGレベルログメッセージを記録
   *
   * LOGレベルログメッセージを現在のテスト用MockLoggerに記録します。
   * E2E並列テスト環境でのtestId分離により、テスト間の干渉を防止します。
   *
   * @param message - フォーマット済みログメッセージ
   */
  log(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.LOG, message);
  }

  /**
   * Default level logger method for special DEFAULT level (-99).
   * Provided for API parity and completeness.
   */
  default(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.DEFAULT, message);
  }

  // Query methods
  /**
   * 指定ログレベルのメッセージ一覧を取得
   *
   * 現在のテスト用MockLoggerから指定されたログレベルの全メッセージを取得します。
   * E2E並列テスト環境でのtestId分離により、テスト固有のログを取得します。
   *
   * @param logLevel - 取得対象のログレベル
   * @returns フォーマット済みログメッセージの配列
   */
  getMessages(logLevel: AgLogLevel): AgFormattedLogMessage[] {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getMessages(logLevel);
  }

  /**
   * 指定ログレベルの最新メッセージを取得
   *
   * 現在のテスト用MockLoggerから指定されたログレベルの最新メッセージを取得します。
   * E2E並列テスト環境でのtestId分離により、テスト固有の最新ログを取得します。
   *
   * @param logLevel - 取得対象のログレベル
   * @returns 最新のメッセージ、または存在しない場合はnull
   */
  getLastMessage(logLevel: AgLogLevel): string | AgLogMessage | null {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getLastMessage(logLevel);
  }

  /**
   * 指定ログレベルのメッセージをクリア
   *
   * 現在のテスト用MockLoggerから指定されたログレベルの全メッセージを削除します。
   * E2E並列テスト環境でのtestId分離により、テスト固有のログをクリアします。
   *
   * @param logLevel - クリア対象のログレベル
   */
  clearMessages(logLevel: AgLogLevel): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.clearMessages(logLevel);
  }

  /**
   * Get all messages for all log levels.
   */
  getAllMessages(): { [K in keyof typeof AG_LOGLEVEL]: AgFormattedLogMessage[] } {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getAllMessages();
  }

  /**
   * Clean up all messages for the current test.
   */
  cleanup(): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.clearAllMessages();
  }

  /**
   * Get the total message count for the current test.
   */
  getTotalMessageCount(): number {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getTotalMessageCount();
  }

  /**
   * Get the message count for a specific log level.
   */
  getMessageCount(logLevel: AgLogLevel): number {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getMessageCount(logLevel);
  }

  /**
   * Check if there are any messages for a specific log level.
   */
  hasMessages(logLevel: AgLogLevel): boolean {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.hasMessages(logLevel);
  }

  /**
   * Check if there are any messages for any log level.
   */
  hasAnyMessages(): boolean {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.hasAnyMessages();
  }

  /**
   * Clear all messages for the current test.
   */
  clearAllMessages(): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.clearAllMessages();
  }

  /**
   * Get the logger function for a specific log level.
   */
  getLoggerFunction(logLevel: AgLogLevel = AG_LOGLEVEL.DEFAULT): AgLoggerFunction {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getLoggerFunction(logLevel);
  }

  /**
   * 現在アクティブなテスト用モックロガーを取得
   *
   * E2E並列テスト対応のため、testId分離による個別モックロガーインスタンスを
   * 取得します。アクティブなテストが存在しない場合やモックロガーが見つからない
   * 場合はエラーを投げます。
   *
   * @returns 現在のテストID用のAgMockBufferLoggerインスタンス
   * @throws Error アクティブテストがない場合、またはモックロガーが見つからない場合
   */
  private getCurrentMockLogger(): AgMockBufferLogger {
    if (!this._currentTestId) {
      throw new Error('No active test. Call startTest() before logging.');
    }

    const mockLogger = this._mockLoggers.get(this._currentTestId);
    if (!mockLogger) {
      throw new Error(`MockLogger not found for test ID: ${this._currentTestId}`);
    }

    return mockLogger;
  }

  /**
   * フォーマット済みメッセージからログレベルを解析
   *
   * E2E並列テスト環境でのログレベル判定のため、フォーマット済みメッセージから
   * ログレベル情報を抽出します。メッセージ内のラベル（[LABEL]形式）を解析し、
   * 対応するAG_LOGLEVELの値を返します。testId分離されたログ処理をサポートします。
   *
   * @param formattedMessage - 解析対象のフォーマット済みログメッセージ
   * @returns 解析されたログレベル、解析できない場合はDEFAULTレベル
   */
  private parseLogLevelFromFormattedMessage(formattedMessage: AgFormattedLogMessage): AgLogLevel {
    // Convert to string if it's not already a string
    const messageStr = typeof formattedMessage === 'string' ? formattedMessage : String(formattedMessage);

    // Extract label from format: "timestamp [LABEL] message"
    const labelMatch = messageStr.match(/\[([A-Z]+)\]/);
    if (!labelMatch) {
      return AG_LOGLEVEL.DEFAULT;
    }

    const label = labelMatch[1] as keyof typeof AG_LOGLEVEL;

    // Check if the label exists in AG_LOGLEVEL enum
    if (label in AG_LOGLEVEL) {
      return AG_LOGLEVEL[label];
    }

    return AG_LOGLEVEL.DEFAULT;
  }

  /**
   * 現在のテスト用AgLoggerFunction生成
   *
   * ag-loggerのプラグインとして使用可能なAgLoggerFunctionを生成します。
   * フォーマット済みメッセージからログレベルを解析し、適切なレベルでログを記録します。
   * E2E並列テスト環境での動的ログ処理をサポートします。
   *
   * @returns フォーマット済みメッセージを受け取るロガー関数
   */
  createLoggerFunction(): AgLoggerFunction {
    return (formattedLogMessage: AgFormattedLogMessage): void => {
      const mockLogger = this.getCurrentMockLogger();

      // Parse log level from formatted message
      // Format: "timestamp [LABEL] message" where LABEL is the log level
      const logLevel = this.parseLogLevelFromFormattedMessage(formattedLogMessage);

      mockLogger.executeLog(logLevel, formattedLogMessage);
    };
  }

  /**
   * 現在のテスト用AgLoggerMap生成
   *
   * レベル別のログ関数を含むAgLoggerMapを生成します。
   * 各ログレベルに対応した専用関数を提供し、E2E並列テスト環境での
   * レベル別ログ処理を可能にします。
   *
   * @returns ログレベル別の関数マップ
   */
  createLoggerMap(): Partial<AgLoggerMap> {
    return {
      [AG_LOGLEVEL.OFF]: () => {},
      [AG_LOGLEVEL.FATAL]: (message: AgFormattedLogMessage) => this.fatal(message),
      [AG_LOGLEVEL.ERROR]: (message: AgFormattedLogMessage) => this.error(message),
      [AG_LOGLEVEL.WARN]: (message: AgFormattedLogMessage) => this.warn(message),
      [AG_LOGLEVEL.INFO]: (message: AgFormattedLogMessage) => this.info(message),
      [AG_LOGLEVEL.DEBUG]: (message: AgFormattedLogMessage) => this.debug(message),
      [AG_LOGLEVEL.TRACE]: (message: AgFormattedLogMessage) => this.trace(message),
      // logger for special log level
      [AG_LOGLEVEL.VERBOSE]: (message: AgFormattedLogMessage) => this.verbose(message),
      [AG_LOGLEVEL.LOG]: (message: AgFormattedLogMessage) => this.log(message),
      [AG_LOGLEVEL.DEFAULT]: (message: AgFormattedLogMessage) => this.default(message),
    };
  }
}
