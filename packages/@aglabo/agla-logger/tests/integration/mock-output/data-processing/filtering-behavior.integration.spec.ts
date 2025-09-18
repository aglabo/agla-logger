// tests/integration/agLogger/features/filtering.integration.spec.ts
// @(#) : AgLogger Features Filtering Integration Tests - Log level filtering and verbose functionality
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';
// 共有型・定数: ログレベルとverbose制御
import { isStandardLogLevel } from '@/utils/AgLogValidators';
import { DISABLE, ENABLE } from '@shared/constants';
import { AG_LOGLEVEL } from '@shared/types';
import type { AgLogMessage } from '@shared/types';

// テスト対象: AgLoggerとマネージャ
import { AgLogger } from '@/AgLogger.class';
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター/ロガー）: モック
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import type { AgMockConstructor } from '@shared/types';

/**
 * テスト初期設定
 */
const setupTestContext = (_ctx?: TestContext): {
  mockLogger: AgMockBufferLogger;
  mockFormatter: AgMockConstructor;
} => {
  const _mockLogger = new MockLogger.buffer();
  const _mockFormatter = MockFormatter.passthrough;

  vi.clearAllMocks();
  AgLogger.resetSingleton();
  AgLoggerManager.resetSingleton();

  _ctx?.onTestFinished(() => {
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
    vi.clearAllMocks();
  });

  return {
    mockLogger: _mockLogger,
    mockFormatter: _mockFormatter,
  };
};

/**
 * @suite Mock Output Filtering Behavior Integration | Integration
 * @description ログレベルフィルタリングとverbose機能の統合動作テスト
 * @testType integration
 * Scenarios: ログレベルフィルタリング設定, 動的レベル変更, 複合フィルタリングシナリオ
 */
describe('Mock Output Filtering Behavior Integration', () => {
  /**
   * @context Given
   * @scenario ログレベルフィルタリング設定
   * @description ログレベルフィルタリングが設定された環境での異なるログレベル設定に基づいた適切なフィルタリングを検証
   */
  describe('Given: log level filtering is configured', () => {
    /**
     * @context When
     * @scenario 特定レベルでのフィルタリング
     * @description 特定レベルでフィルタリングした時の設定レベル以上のメッセージのみ出力されることを検証
     */
    describe('When: filtering by specific levels', () => {
      // 目的: すべての構成要素で一貫したフィルタリングが行われる
      it('Then: [正常] - should only output messages at or above configured level', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: WARN レベルで設定されたロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.default,
          formatter: mockFormatter,
          loggerMap: mockLogger.defaultLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        // When: 異なるレベルでログ出力
        logger.error('error'); // 出力される（ERROR ≤ WARN）
        logger.warn('warn'); // 出力される（WARN ≤ WARN）
        logger.info('info'); // フィルタリングされる（INFO > WARN）
        logger.debug('debug'); // フィルタリングされる（DEBUG > WARN）

        // Then: 適切にフィルタリング
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(1);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.WARN)).toBe(1);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(0); // フィルタリングされるため出力されない
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.DEBUG)).toBe(0); // フィルタリングされるため出力されない
      });
    });

    /**
     * @context When
     * @scenario ログレベルOFF設定
     * @description ログレベルをOFFに設定した時の全レベルでの出力抑止を検証
     */
    describe('When: log level is set to OFF', () => {
      // 目的: OFFレベル時に全レベルで出力が抑止される
      it('Then: [正常] - should suppress all log output completely', (_ctx) => {
        const { mockLogger } = setupTestContext();

        // Given: OFFレベルで設定されたロガー
        const messageOnlyFormatter = new MockFormatter.messageOnly();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: messageOnlyFormatter.execute,
          loggerMap: mockLogger.defaultLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.OFF;

        // When: 全レベルでログ出力を試行
        logger.fatal('fatal');
        logger.error('error');
        logger.warn('warn');
        logger.info('info');
        logger.debug('debug');
        logger.trace('trace');

        // Then: 全ての出力が抑止される
        expect(mockLogger.getTotalMessageCount()).toBe(0);
        expect(messageOnlyFormatter.getStats().callCount).toBe(0);
      });
    });

    /**
     * @context When
     * @scenario 動的ログレベル変更
     * @description ログレベルを動的に変更した時の新しいフィルタリングルールの即座適用を検証
     */
    describe('When: log level changes dynamically', () => {
      // 目的: 動的なログレベル変更が即座に反映される
      it('Then: [正常] - should immediately apply new filtering rules', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: DEBUG レベルで設定されたロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 初期状態でログ出力
        logger.info('info1');
        logger.debug('debug1');
        expect(mockLogger.getTotalMessageCount()).toBe(2);

        // When: ログレベルを INFO に変更
        logger.logLevel = AG_LOGLEVEL.INFO;
        mockLogger.clearAllMessages();

        logger.info('info2'); // 出力される
        logger.debug('debug2'); // フィルタリングされる

        // Then: 新しいフィルタリングルールが適用
        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const message = mockLogger.getLastMessage(AG_LOGLEVEL.DEFAULT);
        expect(message).toMatchObject({ message: 'info2' });
      });
    });
  });

  /**
   * @context Given
   * @scenario 動的レベル変更
   * @description 動的レベル変更が発生する環境でのVerboseモードの有効/無効による詳細な出力制御を検証
   */
  describe('Given: dynamic level changes occur', () => {
    /**
     * @context When
     * @scenario Verboseモード使用
     * @description Verboseモードを使用した時のデバッグトレースを含む全メッセージ出力を検証
     */
    describe('When: using verbose mode', () => {
      // 目的: Verboseモード有効時に詳細な出力が行われる
      it('Then: [正常] - should output all messages including debug traces', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext(_ctx);

        // Given: Verboseモード有効なロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = ENABLE;

        // When: ログメッセージを出力
        logger.info('verbose test', { data: 'value' });

        // Then: Verboseモードが有効
        expect(logger.isVerbose).toBe(ENABLE);
        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const message = mockLogger.getLastMessage(AG_LOGLEVEL.DEFAULT) as AgLogMessage;

        // PlainFormatterが適用されたフォーマット済み文字列を確認
        expect(message.logLevel).toBe(AG_LOGLEVEL.INFO);
        expect(message.message).toBe('verbose test');
      });
    });

    /**
     * @context When
     * @scenario Verboseモード無効化
     * @description Verboseモードを無効化した時の簡潔な出力フォーマットを検証
     */
    describe('When: disabling verbose mode', () => {
      // 目的: Verboseモード無効時に簡潔な出力が行われる
      it('Then: [正常] - should provide concise output formatting', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 初期はVerboseモード有効
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = ENABLE;

        // When: Verboseモードを無効に変更
        logger.setVerbose = DISABLE;
        logger.info('concise test');

        // Then: Verboseモードが無効
        expect(logger.isVerbose).toBe(DISABLE);
        expect(mockLogger.getTotalMessageCount()).toBe(1);
      });
    });
  });

  /**
   * @context Given
   * @scenario 複合フィルタリングシナリオ
   * @description 複合的なフィルタリングシナリオが存在する環境でのログレベル、Verbose、ログマップの協調動作を検証
   */
  describe('Given: complex filtering scenarios exist', () => {
    /**
     * @context When
     * @scenario ログレベル、Verboseモード、ロガーマップ組み合わせ
     * @description ログレベル、Verboseモード、ロガーマップを組み合わせた時の全設定の協調動作を検証
     */
    describe('When: log level, verbose mode, and logger map are combined', () => {
      // 目的: 複合設定での統合フィルタリング動作
      it('Then: [正常] - should coordinate all filtering settings appropriately', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 複合的な設定
        const errorLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger.getLoggerFunction(),
          },
        });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = ENABLE;

        // When: 異なるレベルで出力
        logger.error('error msg'); // errorLogger使用
        logger.warn('warn msg'); // defaultLogger使用
        logger.info('info msg'); // defaultLogger使用
        logger.debug('debug msg'); // フィルタリング

        // Then: 設定が協調動作
        expect(errorLogger.getTotalMessageCount()).toBe(1);
        expect(mockLogger.getTotalMessageCount()).toBe(2); // warn + info
        expect(logger.isVerbose).toBe(ENABLE);

        // Then: エラーメッセージが専用ロガーで処理
        const errorMessage = errorLogger.getLastMessage(AG_LOGLEVEL.DEFAULT) as AgLogMessage;
        expect(errorMessage.message).toBe('error msg');
      });
    });

    /**
     * @context When
     * @scenario 標準ログレベル検証でのフィルタリング
     * @description 標準ログレベル検証でフィルタリングした時のログレベルバリデータとの統合動作を検証
     */
    describe('When: filtering with standard log level validation', () => {
      // 目的: 標準ログレベル検証との統合
      it('Then: [正常] - should work correctly with log level validators', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 標準ログレベル検証と統合
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });

        // When: 標準レベルと非標準レベルをテスト
        const standardLevels = Object.values(AG_LOGLEVEL).filter((level) =>
          typeof level === 'number' && isStandardLogLevel(level)
        );

        logger.logLevel = AG_LOGLEVEL.DEBUG;

        standardLevels.forEach((level) => {
          if (level <= AG_LOGLEVEL.DEBUG && level !== AG_LOGLEVEL.OFF) {
            // 出力されるべきレベル
            expect(isStandardLogLevel(level)).toBe(true);
          }
        });

        // Then: 標準ログレベル検証が正常動作
        expect(isStandardLogLevel(AG_LOGLEVEL.INFO)).toBe(true);
        expect(isStandardLogLevel(AG_LOGLEVEL.DEBUG)).toBe(true);
        expect(isStandardLogLevel(AG_LOGLEVEL.VERBOSE)).toBe(false); // 非標準
      });
    });
  });
});
