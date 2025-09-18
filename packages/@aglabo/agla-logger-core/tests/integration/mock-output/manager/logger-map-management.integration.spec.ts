// tests/integration/agLoggerManager/management/loggerMap.integration.spec.ts
// @(#) : AgLoggerManager Management Logger Map Integration Tests - Logger map management
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';

// 共有型・定数: ログレベル定義と型
import { AG_LOGLEVEL } from '@shared/types';
import type { AgLoggerFunction, AgLogLevel } from '@shared/types';
import type { AgLoggerMap } from '@shared/types';
import type { AgMockConstructor } from '@shared/types';

// テスト対象: マネージャ本体
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// プラグイン（ロガー）: 出力先実装とダミー
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import { NullLogger } from '@/plugins/logger/NullLogger';

/**
 * @suite Mock Output Logger Map Management Integration | Integration
 * @description ロガーマップ管理機能の統合動作を保証するテスト
 * @testType integration
 * Scenarios: ロガーマップ設定変更, 設定エッジケース, 動的ロガーマップ更新
 */
describe('Mock Output Logger Map Management Integration', () => {
  /**
   * テスト回使用setup
   *
   * @returns {{ mockLogger: AgMockBufferLogger; mockFormatter: typeof MockFormatter.passthrough }}
   */
  const setupTestContext = (): { mockLogger: AgMockBufferLogger; mockFormatter: AgMockConstructor } => {
    vi.clearAllMocks();
    // Reset singleton instance for clean test state
    AgLoggerManager.resetSingleton();

    return {
      mockLogger: new MockLogger.buffer(),
      mockFormatter: MockFormatter.passthrough,
    };
  };

  /**
   * @context Given
   * @scenario ロガーマップ設定変更
   * @description ロガーマップ設定変更が存在する環境での複雑なロガーマップ設定の完全上書きと部分更新を検証
   */
  describe('Given: logger map configuration changes', () => {
    /**
     * @context When
     * @scenario 完全マップ上書き実行
     * @description 完全マップ上書きを実行した時のロガーマップ全面上書きの適用を検証
     */
    describe('When: performing complete map override', () => {
      // 目的: ロガーマップ全面上書きの適用確認
      it('Then: [正常] - should replace entire configuration cleanly', () => {
        setupTestContext();

        // Given: レベル別の専用ロガー
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance) as AgLoggerFunction;
        const errorLoggerInstance = new MockLogger.buffer();
        const errorLogger = errorLoggerInstance.error.bind(errorLoggerInstance) as AgLoggerFunction;
        const debugLoggerInstance = new MockLogger.buffer();
        const debugLogger = debugLoggerInstance.debug.bind(debugLoggerInstance) as AgLoggerFunction;

        const loggerMap: Partial<AgLoggerMap> = {
          [AG_LOGLEVEL.OFF]: NullLogger,
          [AG_LOGLEVEL.FATAL]: errorLogger,
          [AG_LOGLEVEL.ERROR]: errorLogger,
          [AG_LOGLEVEL.WARN]: NullLogger, // return default logger
          [AG_LOGLEVEL.INFO]: NullLogger, // return default logger
          [AG_LOGLEVEL.DEBUG]: debugLogger,
          [AG_LOGLEVEL.TRACE]: debugLogger,
        };

        // When: 完全なロガーマップで設定
        const manager = AgLoggerManager.createManager({
          defaultLogger: defaultLogger,
          formatter: PlainFormatter,
          loggerMap: loggerMap,
        });
        const logger = manager.getLogger();

        // Then: 各レベルで適切なロガーが使用される
        expect(logger.getLoggerFunction(AG_LOGLEVEL.OFF)).toBe(NullLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.FATAL)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(defaultLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(defaultLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.TRACE)).toBe(debugLogger);
      });
    });

    /**
     * @context When
     * @scenario 部分的設定更新適用
     * @description 部分的設定更新を適用した時の部分的なロガーマップ適用時のフォールバックを検証
     */
    describe('When: applying partial configuration updates', () => {
      // 目的: 部分的なロガーマップ適用時のフォールバック確認
      it('Then: [正常] - should merge new settings with existing configuration', () => {
        setupTestContext();

        // Given: 部分的なロガーマップ設定
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        const errorLoggerInstance = new MockLogger.buffer();
        const errorLogger = errorLoggerInstance.error.bind(errorLoggerInstance);
        const debugLoggerInstance = new MockLogger.buffer();
        const debugLogger = debugLoggerInstance.debug.bind(debugLoggerInstance);

        const partialLoggerMap = {
          [AG_LOGLEVEL.ERROR]: errorLogger,
          [AG_LOGLEVEL.DEBUG]: debugLogger,
        };

        // When: 部分的なマップで設定
        AgLoggerManager.createManager({
          defaultLogger: defaultLogger,
          formatter: PlainFormatter,
          loggerMap: partialLoggerMap,
        });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // Then: 指定されたレベルは専用ロガー使用
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);

        // Then: 未指定レベルはデフォルトロガー使用
        expect(logger.getLoggerFunction(AG_LOGLEVEL.FATAL)).toBe(defaultLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(defaultLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(defaultLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.TRACE)).toBe(defaultLogger);
      });
    });
  });

  /**
   * @context Given
   * @scenario 設定エッジケース
   * @description 設定エッジケースが存在する環境でのロガーマップ未設定や空設定時のデフォルトロガーフォールバックを検証
   */
  describe('Given: configuration edge cases', () => {
    /**
     * @context When
     * @scenario 設定エントリ缺損処理
     * @description 設定エントリが缺損した時のマップ未設定レベルでのdefaultロガーフォールバックを検証
     */
    describe('When: handling missing configuration entries', () => {
      // 目的: マップ未設定レベルでのdefaultロガーへのフォールバック
      it('Then: [正常] - should provide appropriate fallback behavior', () => {
        setupTestContext();

        // Given: マップ未設定の環境
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: defaultLogger, formatter: PlainFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: 全レベルにアクセス（OFF以外）
        // Then: 全てデフォルトロガーを返す
        Object.values(AG_LOGLEVEL)
          .filter((level) => level !== AG_LOGLEVEL.OFF) // off: NullLogger
          .filter((level) => typeof level === 'number')
          .forEach((level) => {
            expect(logger.getLoggerFunction(level as AgLogLevel)).toBe(defaultLogger);
          });
      });
    });

    /**
     * @context When
     * @scenario 空ロガーマップ設定処理
     * @description 空ロガーマップ設定を処理した時の空のロガーマップ指定時の適切な処理を検証
     */
    describe('When: processing empty logger map configuration', () => {
      // 目的: 空のロガーマップ指定時の挙動確認
      it('Then: [エッジケース] - should manage empty configurations without system failure', () => {
        setupTestContext();

        // Given: 空のロガーマップ設定
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        AgLoggerManager.createManager({
          defaultLogger: defaultLogger,
          formatter: PlainFormatter,
          loggerMap: {},
        });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: 全レベルにアクセス
        // Then: 全てデフォルトロガーを使用
        Object.values(AG_LOGLEVEL)
          .filter((level) => level !== AG_LOGLEVEL.OFF)
          .filter((level) => typeof level === 'number')
          .forEach((level) => {
            expect(logger.getLoggerFunction(level as AgLogLevel)).toBe(defaultLogger);
          });
      });
    });
  });

  /**
   * @context Given
   * @scenario 設定エッジケース
   * @description 設定エッジケースが存在する環境でのundefined値を含むロガーマップの安全なフォールバックを検証
   */
  describe('Given: configuration edge cases', () => {
    /**
     * @context When
     * @scenario undefined値処理
     * @description undefined値を処理した時のロガーマップにundefinedを含む場合の安定性を検証
     */
    describe('When: processing undefined values', () => {
      // 目的: ロガーマップにundefinedを含む場合の安定性
      it('Then: [エッジケース] - should handle undefined inputs gracefully', () => {
        setupTestContext();

        // Given: undefined値を含むマップ設定
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger, formatter: PlainFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: undefined値を含むマップで設定更新
        manager.setLoggerConfig({
          defaultLogger,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: undefined,
          },
        });

        // Then: undefined値の場合はデフォルトロガーにフォールバック
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(defaultLogger);
      });
    });
  });

  /**
   * @context Given
   * @scenario 動的ロガーマップ更新
   * @description 動的ロガーマップ更新が必要な環境での実行時ロガーマップ更新の即座反映と継続更新を検証
   */
  describe('Given: dynamic logger map updates are required', () => {
    /**
     * @context When
     * @scenario 実行時ロガーマップ更新
     * @description 実行時にロガーマップを更新した時の動的なロガーマップ更新の即時反映を検証
     */
    describe('When: updating logger map at runtime', () => {
      // 目的: 動的なロガーマップ更新の即時反映
      it('Then: [正常] - should immediately apply logger map updates to existing instances', () => {
        setupTestContext();

        // Given: 初期設定のマネージャー
        const initialDefaultLoggerInstance = new MockLogger.buffer();
        const initialDefaultLogger = initialDefaultLoggerInstance.info.bind(initialDefaultLoggerInstance);
        const manager = AgLoggerManager.createManager({
          defaultLogger: initialDefaultLogger,
          formatter: PlainFormatter,
        });
        const logger = manager.getLogger();

        // When: ロガーマップの動的更新
        const errorLoggerInstance = new MockLogger.buffer();
        const errorLogger = errorLoggerInstance.error.bind(errorLoggerInstance);
        const debugLoggerInstance = new MockLogger.buffer();
        const debugLogger = debugLoggerInstance.debug.bind(debugLoggerInstance);
        manager.setLoggerConfig({
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger,
            [AG_LOGLEVEL.DEBUG]: debugLogger,
          },
        });

        // Then: 既存インスタンスに変更が即座に反映
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(initialDefaultLogger); // 未変更
      });
    });

    /**
     * @context When
     * @scenario 複数連続ロガーマップ更新実行
     * @description 複数連続ロガーマップ更新を実行した時の連続的なマップ更新の累積効果を検証
     */
    describe('When: performing multiple sequential logger map updates', () => {
      // 目的: 連続的なマップ更新の累積効果
      it('Then: [正常] - should handle sequential map updates with cumulative effects', () => {
        setupTestContext();

        // Given: 基本設定のマネージャー
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        const manager = AgLoggerManager.createManager({
          defaultLogger: defaultLogger,
          formatter: PlainFormatter,
        });
        const logger = manager.getLogger();

        // When: 段階的なマップ更新（各回で全マップを設定）
        const errorLoggerInstance = new MockLogger.buffer();
        const errorLogger = errorLoggerInstance.error.bind(errorLoggerInstance);
        manager.setLoggerConfig({
          loggerMap: { [AG_LOGLEVEL.ERROR]: errorLogger },
        });

        const warnLoggerInstance = new MockLogger.buffer();
        const warnLogger = warnLoggerInstance.warn.bind(warnLoggerInstance);
        manager.setLoggerConfig({
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger, // 既存設定を保持
            [AG_LOGLEVEL.WARN]: warnLogger,
          },
        });

        const debugLoggerInstance = new MockLogger.buffer();
        const debugLogger = debugLoggerInstance.debug.bind(debugLoggerInstance);
        manager.setLoggerConfig({
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger, // 既存設定を保持
            [AG_LOGLEVEL.WARN]: warnLogger, // 既存設定を保持
            [AG_LOGLEVEL.DEBUG]: debugLogger,
          },
        });

        // Then: 最終的な設定が適用される
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(warnLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(defaultLogger); // 未変更
      });
    });
  });
});
