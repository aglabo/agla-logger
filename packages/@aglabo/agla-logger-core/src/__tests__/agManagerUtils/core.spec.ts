// src/__tests__/agManagerUtils/AgManagerUtils.spec.ts
// @(#) : Unit tests for AgManagerUtils (atsushifx-style BDD)
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ（Vitest）
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// 型定義・インターフェース
import type { AgLoggerOptions } from '../../../shared/types/AgLogger.interface';

// 内部実装・コアクラス
import { AgLogger } from '../../AgLogger.class';
import { AgLoggerManager } from '../../AgLoggerManager.class';

// ユーティリティ・ヘルパー関数
import { AgManager, createManager, getLogger } from '../../index';

/**
 * @suite AgManagerUtils Utility Functions | Unit Tests
 * @description Testing createManager and getLogger utility functions with AgManager global variable integration
 * @testType unit
 * Scenarios: createManager utility function, getLogger utility function, createManager and getLogger together
 */
describe('Feature: AgManagerUtils utility functions', () => {
  /**
   * テスト前の初期化 - シングルトンリセット
   */
  beforeEach(() => {
    AgLoggerManager.resetSingleton();
  });

  /**
   * テスト後のクリーンアップ - シングルトンリセット
   */
  afterEach(() => {
    AgLoggerManager.resetSingleton();
  });

  /**
   * @context When
   * @scenario createManager utility function usage
   * @description Testing createManager utility function behavior and integration
   */
  describe('When using createManager utility function', () => {
    it('Then: [正常] - should return AgLoggerManager instance when called for the first time', () => {
      const manager = createManager();
      expect(manager).toBeInstanceOf(AgLoggerManager);
    });

    it('Then: [正常] - should set AgManager global variable when called for the first time', () => {
      expect(AgManager).toBeUndefined();
      createManager();
      expect(AgManager).toBeInstanceOf(AgLoggerManager);
    });

    it('Then: [正常] - should accept optional AgLoggerOptions parameter', () => {
      const options: AgLoggerOptions = { logLevel: 4 };
      expect(() => createManager(options)).not.toThrow();
    });

    /**
     * @context When
     * @scenario 回目以降の呼び出し制御
     * @description 二回目以降の呼び出しでエラーを投げる動作をテスト
     */
    describe('Then: [異常] - subsequent calls should be controlled with errors', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('Then: [異常] - should throw error when called for the second time', () => {
        createManager();
        expect(() => createManager()).toThrow(/already created/i);
      });

      // 2番目のテスト追加
      it('Then: [異常] - should throw error when called after AgLoggerManager.createManager', () => {
        AgLoggerManager.createManager();
        expect(() => createManager()).toThrow(/already created/i);
      });

      // 3番目のテスト追加（BDDカテゴリ2完了）
      it('Then: [異常] - should not update AgManager global variable on second call', () => {
        const firstManager = createManager();
        try {
          createManager();
        } catch {
          // エラーは期待される
        }
        expect(AgManager).toBe(firstManager);
      });
    });

    /**
     * @description AgManagerグローバル変数が正しく管理されることをテスト
     */
    describe('Then: [正常] - AgManager global variable consistency is maintained', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('Then: [正常] - should maintain same reference between createManager return value and AgManager', () => {
        const manager = createManager();
        expect(AgManager).toBe(manager);
      });

      // 2番目のテスト追加
      it('Then: [正常] - should provide same reference as AgLoggerManager.getManager', () => {
        createManager();
        const staticManager = AgLoggerManager.getManager();
        expect(AgManager).toBe(staticManager);
      });

      // 3番目のテスト追加（BDDカテゴリ3完了）
      it('Then: [正常] - should reset AgManager to undefined after resetSingleton', () => {
        createManager();
        expect(AgManager).toBeDefined();
        AgLoggerManager.resetSingleton();
        expect(AgManager).toBeUndefined();
      });
    });
  });

  /**
   * @description getLoggerユーティリティ関数の動作をテスト
   */
  describe('When using getLogger utility function', () => {
    /**
     * @description AgManagerが初期化済みの場合のAgLoggerインスタンス取得をテスト
     */
    describe('Then: [正常] - works correctly when AgManager is initialized', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('Then: [正常] - should return AgLogger instance when AgManager is initialized', () => {
        createManager();
        const logger = getLogger();
        expect(logger).toBeInstanceOf(AgLogger);
      });

      // 2番目のテスト追加
      it('Then: [正常] - should return same AgLogger instance as AgManager.getLogger()', () => {
        const manager = createManager();
        const managerLogger = manager.getLogger();
        const utilityLogger = getLogger();
        expect(utilityLogger).toBe(managerLogger);
      });

      // 3番目のテスト追加（BDDカテゴリ1完了）
      it('Then: [正常] - should work after AgLoggerManager.createManager without createManager utility', () => {
        AgLoggerManager.createManager();
        const logger = getLogger();
        expect(logger).toBeInstanceOf(AgLogger);
      });
    });

    /**
     * @description AgManagerが未初期化の場合にエラーを投げる動作をテスト
     */
    describe('Then: [異常] - is controlled with errors when AgManager is uninitialized', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('Then: [異常] - should throw error when AgManager is undefined', () => {
        expect(() => getLogger()).toThrow(/not created/i);
      });

      // 2番目のテスト追加
      it('Then: [異常] - should throw error with appropriate error message', () => {
        expect(() => getLogger()).toThrow(/Logger instance not created/i);
      });

      // 3番目のテスト追加（BDDカテゴリ2完了）
      it('Then: [異常] - should throw error after resetSingleton', () => {
        createManager();
        AgLoggerManager.resetSingleton();
        expect(() => getLogger()).toThrow(/not created/i);
      });
    });

    /**
     * @description 既存のAgLoggerManager APIとの一貫性をテスト
     */
    describe('Then: [正常] - consistency with existing APIs is maintained', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('Then: [正常] - should provide same interface as AgLoggerManager.getManager().getLogger()', () => {
        createManager();
        const managerLogger = AgLoggerManager.getManager().getLogger();
        const utilityLogger = getLogger();
        expect(typeof utilityLogger.log).toBe(typeof managerLogger.log);
        expect(typeof utilityLogger.setLoggerConfig).toBe(typeof managerLogger.setLoggerConfig);
      });

      // 2番目のテスト追加
      it('Then: [正常] - should work consistently with AgManager global variable', () => {
        createManager();
        const logger = getLogger();
        expect(logger).toBeInstanceOf(AgLogger);
        expect(logger.log).toBeDefined();
      });

      // 3番目のテスト追加（BDDカテゴリ3完了）
      it('Then: [異常] - should throw same error type as AgLoggerManager methods when uninitialized', () => {
        let managerError: unknown;
        let utilityError: unknown;

        try {
          AgLoggerManager.getManager();
        } catch (error) {
          managerError = error;
        }

        try {
          getLogger();
        } catch (error) {
          utilityError = error;
        }

        expect(managerError).toBeDefined();
        expect(utilityError).toBeDefined();
        expect(utilityError?.constructor.name).toBe(managerError?.constructor.name);
      });
    });
  });

  /**
   * @description createManagerとgetLoggerの連携動作をテスト
   */
  describe('When using createManager and getLogger together', () => {
    /**
     * @description 典型的な使用パターンでの動作をテスト
     */
    describe('Then: [正常] - createManager to getLogger flow works correctly', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('Then: [正常] - should work in typical usage pattern', () => {
        const manager = createManager();
        const logger = getLogger();
        expect(manager).toBeInstanceOf(AgLoggerManager);
        expect(logger).toBeInstanceOf(AgLogger);
      });

      // 2番目のテスト追加
      it('Then: [正常] - should provide consistent logger instance across multiple getLogger calls', () => {
        createManager();
        const logger1 = getLogger();
        const logger2 = getLogger();
        expect(logger1).toBe(logger2);
      });

      // 3番目のテスト追加（BDDカテゴリ1完了）
      it('Then: [正常] - should maintain manager and logger consistency with options', () => {
        const options: AgLoggerOptions = { logLevel: 2 };
        const manager = createManager(options);
        const logger = getLogger();
        expect(manager.getLogger()).toBe(logger);
      });
    });

    /**
     * @description エラー条件下での両関数の一貫した動作をテスト
     */
    describe('Then: [異常] - consistency in error states is maintained', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('Then: [異常] - should both fail consistently when manager is not created', () => {
        expect(() => createManager()).not.toThrow(); // 初回は成功
        expect(() => createManager()).toThrow(); // 二回目は失敗
        expect(() => getLogger()).not.toThrow(); // getLoggerは成功（既に作成済み）
      });

      // 2番目のテスト追加
      it('Then: [異常] - should both fail consistently after resetSingleton', () => {
        createManager();
        AgLoggerManager.resetSingleton();
        expect(() => getLogger()).toThrow(/not created/i);
        expect(() => createManager()).not.toThrow(); // 再作成は成功
      });

      // 3番目のテスト追加（BDDカテゴリ2完了）
      it('Then: [正常] - should handle multiple reset and recreation cycles', () => {
        // 最初のサイクル
        createManager();
        expect(getLogger()).toBeInstanceOf(AgLogger);

        // リセット
        AgLoggerManager.resetSingleton();
        expect(() => getLogger()).toThrow();

        // 二回目のサイクル
        createManager();
        expect(getLogger()).toBeInstanceOf(AgLogger);
      });
    });
  });
});
