// tests/integration/mock-output/utils/test-isolation-patterns.integration.spec.ts
// @(#) : Test Isolation Patterns Integration Tests - Test isolation, lifecycle, and concurrent access patterns
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// constants
import { AG_LOGLEVEL } from '@/index';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（ロガー）: E2E実装
import { MockFormatter } from '@/index';
import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';

// Test Utilities
/**
 * テスト初期化用setup
 *
 * @param _ctx  テストコンテキスト
 * @returns mockLogger: E2eMockLogger
 */
const testSetup = (_ctx: TestContext): { mockLogger: E2eMockLogger } => {
  const _mockLogger = new E2eMockLogger(_ctx.task.id);
  // 初期設定
  vi.clearAllMocks();
  AgLogger.resetSingleton();
  vi.clearAllMocks();
  // テスト開始時にロガーを初期化

  // 終了設定
  _ctx.onTestFinished(() => {
    _mockLogger.endTest();
    AgLogger.resetSingleton();
    vi.clearAllMocks();
  });

  return { mockLogger: _mockLogger };
};

/**
 * @suite E2E Test Isolation Integration | Integration
 * @description E2Eテスト分離とライフサイクル管理、並行アクセスパターンの統合動作を保証するテスト
 * @testType integration
 * Scenarios: テストID分離, インスタンス分離, 複数インスタンス管理, ライフサイクル管理, 並行アクセス
 */
describe('E2E Test Isolation Integration', () => {
  /**
   * @context Given
   * @scenario テストID分離シナリオ
   * @description テストID分離シナリオが存在する場合のテスト
   */
  describe('Given test ID isolation scenarios exist', () => {
    /**
     * @context When
     * @scenario テストID分離複数ケース適用
     * @description 複数ケースでテストIDベースの分離が適用される時のテスト
     */
    describe('When test ID-based isolation is applied across multiple cases', () => {
      it('Then: [正常] - should isolate messages correctly by test ID across multiple cases', (_ctx) => {
        const { mockLogger } = testSetup(_ctx);

        const logger = AgLogger.createLogger({
          // E2eMockLoggerのレベル別ロガーを使う（AgLogger側のレベルで正しく振り分け）
          loggerMap: mockLogger.createLoggerMap(),
          // メッセージ本文のみを格納（期待値の生文字列に整合）
          formatter: MockFormatter.messageOnly,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // test-1: INFO/ERROR を記録
        mockLogger.startTest('test-1');
        logger.info('message from test 1');
        logger.error('error from test 1');
        expect(mockLogger.getMessages(4)).toEqual(['message from test 1']);
        expect(mockLogger.getMessages(2)).toEqual(['error from test 1']);
        mockLogger.endTest('test-1');

        // test-2: INFO/WARN を記録（ERRORは0件）
        mockLogger.startTest('test-2');
        logger.info('message from test 2');
        logger.warn('warning from test 2');
        expect(mockLogger.getMessages(4)).toEqual(['message from test 2']);
        expect(mockLogger.getMessages(3)).toEqual(['warning from test 2']);
        expect(mockLogger.getMessages(2)).toHaveLength(0);

        mockLogger.endTest('test-2');
      });
    });
  });

  /**
   * @context Given
   * @scenario インスタンス分離シナリオ
   * @description インスタンス分離シナリオが存在する場合のテスト
   */
  describe('Given instance isolation scenarios exist', () => {
    /**
     * @context When
     * @scenario 異なるロガーインスタンス分離
     * @description 異なるロガーインスタンス間で分離が適用される時のテスト
     */
    describe('When isolation is applied between different logger instances', () => {
      it('Then: [正常] - should isolate messages between different logger instances', (ctx) => {
        vi.clearAllMocks();
        AgLogger.resetSingleton();

        const mockLogger1 = new E2eMockLogger('instance-1');
        const mockLogger2 = new E2eMockLogger('instance-2');
        mockLogger1.startTest(`${ctx.task.id}-1`);
        mockLogger2.startTest(`${ctx.task.id}-2`);

        const logger = AgLogger.createLogger({
          loggerMap: mockLogger1.createLoggerMap(),
          formatter: (log) => String(log.message),
        });
        logger.logLevel = 4; // INFO

        // インスタンス1へ出力
        logger.info('message from instance 1');
        // 宛先をインスタンス2へ切替
        logger.setLoggerConfig({ loggerMap: mockLogger2.createLoggerMap() });
        logger.info('message from instance 2');

        expect(mockLogger1.getMessages(4)).toEqual(['message from instance 1']);
        expect(mockLogger2.getMessages(4)).toEqual(['message from instance 2']);

        mockLogger1.endTest(`${ctx.task.id}-1`);
        mockLogger2.endTest(`${ctx.task.id}-2`);
        AgLogger.resetSingleton();
        vi.clearAllMocks();
      });
    });
  });

  /**
   * @context Given
   * @scenario 複数インスタンス管理シナリオ
   * @description 複数インスタンス管理シナリオが存在する場合のテスト
   */
  describe('Given multiple instance management scenarios exist', () => {
    /**
     * @context When
     * @scenario 複数インスタンス同時管理
     * @description 複数インスタンスを同時に管理する時のテスト
     */
    describe('When managing multiple instances concurrently', () => {
      it('Then: [正常] - should manage multiple instances without message mixing', (ctx) => {
        vi.clearAllMocks();
        AgLogger.resetSingleton();

        const count = 6;
        const mocks = Array.from({ length: count }, (_, i) => new E2eMockLogger(`mgr-${i}`));
        const testIds = mocks.map((m, i) => `${ctx.task.id}-${i}`);
        testIds.forEach((id, i) => mocks[i].startTest(id));

        const logger = AgLogger.createLogger({
          loggerMap: mocks[0].createLoggerMap(),
          formatter: (log) => String(log.message),
        });
        logger.logLevel = 4; // INFO

        // 各インスタンスに固有メッセージを書き込む
        for (let i = 0; i < count; i++) {
          logger.setLoggerConfig({ loggerMap: mocks[i].createLoggerMap() });
          logger.info(`message from logger ${i}`);
          logger.warn(`warning from logger ${i}`);
        }

        // 混在せず各インスタンスに格納されていることを確認
        for (let i = 0; i < count; i++) {
          expect(mocks[i].getMessages(4)).toEqual([`message from logger ${i}`]);
          expect(mocks[i].getMessages(3)).toEqual([`warning from logger ${i}`]);
        }

        testIds.forEach((id, i) => mocks[i].endTest(id));
        AgLogger.resetSingleton();
        vi.clearAllMocks();
      });
    });
  });

  /**
   * @context Given
   * @scenario テストライフサイクル管理シナリオ
   * @description テストライフサイクル管理シナリオが存在する場合のテスト
   */
  describe('Given test lifecycle management scenarios exist', () => {
    /**
     * @context When
     * @scenario ライフサイクル管理適用
     * @description ライフサイクル管理が適用される時のテスト
     */
    describe('When lifecycle management is applied', () => {
      it('Then: [正常] - should enforce proper test lifecycle with comprehensive error handling', (ctx) => {
        vi.clearAllMocks();
        AgLogger.resetSingleton();

        const mockLogger = new E2eMockLogger('lifecycle');
        const logger = AgLogger.createLogger({
          loggerMap: mockLogger.createLoggerMap(),
          formatter: (log) => String(log.message),
        });
        logger.logLevel = 4; // INFO

        // start前は例外
        expect(() => logger.info('before start')).toThrow(/No active test\./);

        // start後は記録できる
        mockLogger.startTest(`${ctx.task.id}-life-1`);
        logger.info('after start');
        expect(mockLogger.getMessages(4)).toEqual(['after start']);

        // end後は再び例外
        mockLogger.endTest(`${ctx.task.id}-life-1`);
        expect(() => logger.info('after end')).toThrow(/No active test\./);

        // 2回目のstart後も正常に記録できる
        mockLogger.startTest(`${ctx.task.id}-life-2`);
        logger.info('second test message');
        expect(mockLogger.getMessages(4)).toEqual(['second test message']);

        mockLogger.endTest(`${ctx.task.id}-life-2`);
        AgLogger.resetSingleton();
        vi.clearAllMocks();
      });
    });
  });

  /**
   * @context Given
   * @scenario 並行アクセスシナリオ
   * @description 並行アクセスシナリオが存在する場合のテスト
   */
  describe('Given concurrent access scenarios exist', () => {
    /**
     * @context When
     * @scenario 並行アクセスパターン実行
     * @description 並行アクセスパターンが実行される時のテスト
     */
    describe('When concurrent access patterns are executed', () => {
      it('Then: [正常] - should handle concurrent access patterns safely and efficiently', (ctx) => {
        vi.clearAllMocks();
        AgLogger.resetSingleton();

        const mockLogger1 = new E2eMockLogger('concurrent-1');
        const mockLogger2 = new E2eMockLogger('concurrent-2');
        mockLogger1.startTest(`${ctx.task.id}-c1`);
        mockLogger2.startTest(`${ctx.task.id}-c2`);

        const logger = AgLogger.createLogger({
          loggerMap: mockLogger1.createLoggerMap(),
          formatter: (log) => String(log.message),
        });
        logger.logLevel = 4; // INFO

        const iterations = 10;
        for (let i = 0; i < iterations; i++) {
          logger.setLoggerConfig({ loggerMap: mockLogger1.createLoggerMap() });
          logger.info(`concurrent message 1-${i}`);
          logger.setLoggerConfig({ loggerMap: mockLogger2.createLoggerMap() });
          logger.info(`concurrent message 2-${i}`);
        }

        const messages1 = mockLogger1.getMessages(4);
        const messages2 = mockLogger2.getMessages(4);
        expect(messages1).toHaveLength(iterations);
        expect(messages2).toHaveLength(iterations);
        messages1.forEach((message, index) => {
          expect(message).toBe(`concurrent message 1-${index}`);
        });
        messages2.forEach((message, index) => {
          expect(message).toBe(`concurrent message 2-${index}`);
        });

        mockLogger1.endTest(`${ctx.task.id}-c1`);
        mockLogger2.endTest(`${ctx.task.id}-c2`);
        AgLogger.resetSingleton();
        vi.clearAllMocks();
      });
    });
  });
});
