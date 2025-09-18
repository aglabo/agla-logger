// tests/integration/console-output/combinations/console-plugin-combinations.integration.spec.ts
// @(#) : Console Plugin Combinations Integration Tests - Console logger and formatter combinations
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '@shared/types';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';

// プラグイン（ロガー）: 出力先実装とマップ
import { ConsoleLogger, ConsoleLoggerMap } from '@/plugins/logger/ConsoleLogger';

/**
 * @suite Console Plugin Combinations Integration | Integration
 * @description Console出力でのフォーマッターとロガーの組み合わせ統合動作を保証するテスト
 * @testType integration
 * Scenarios: ConsoleLoggerMapとフォーマッター組み合わせの実システム統合テスト
 */
describe('Feature: Console Plugin Combinations Integration', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  };

  /**
   * @context Given
   * @scenario 実際のシステム統合環境でプラグイン組み合わせが使用される場合
   * @description 実際のシステム統合環境におけるプラグイン組み合わせの動作テスト
   */
  describe('Given: real system integration uses plugin combinations', () => {
    /**
     * @context When
     * @scenario ConsoleLoggerMapとフォーマッターの実際の組み合わせを使用
     * @description ConsoleLoggerMapとフォーマッター組み合わせの実システム統合テスト
     */
    describe('When: using actual ConsoleLoggerMap with formatter combinations', () => {
      // ConsoleLoggerMap×各フォーマッターの実システム統合を検証
      it('Then: [正常] - should integrate correctly in real system scenarios', () => {
        setupTestContext();

        // Given: 実システム相当の組み合わせ設定
        const consoleSpies = {
          error: vi.spyOn(console, 'error').mockImplementation(() => {}),
          warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
          info: vi.spyOn(console, 'info').mockImplementation(() => {}),
          debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
        };

        const logger = AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: JsonFormatter,
          loggerMap: ConsoleLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 実システム相当の組み合わせ使用
        logger.error('System error occurred', { code: 500, stack: 'error stack' });
        logger.warn('System warning', { resource: 'memory', usage: '90%' });
        logger.info('System info', { status: 'running', uptime: 12345 });
        logger.debug('System debug', { query: 'SELECT * FROM table', time: 45 });

        // Then: 実システム統合での適切な出力先振り分け
        expect(consoleSpies.error).toHaveBeenCalledTimes(1);
        expect(consoleSpies.warn).toHaveBeenCalledTimes(1);
        expect(consoleSpies.info).toHaveBeenCalledTimes(1);
        expect(consoleSpies.debug).toHaveBeenCalledTimes(1);

        // Then: 実システム統合での適切なフォーマット
        consoleSpies.error.mock.calls.forEach(([output]) => {
          expect(() => JSON.parse(output)).not.toThrow();
          const parsed = JSON.parse(output);
          expect(parsed.level).toBe('ERROR');
        });

        Object.values(consoleSpies).forEach((spy) => spy.mockRestore());
      });
    });
  });
});
