// src: /src/__tests__/functional/AgLoggerManager.functional.spec.ts
// @(#) : AgLoggerManager機能テスト AgLoggerManagerクラスの振る舞い検証
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ（Vitest）
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 型定義・インターフェース
import type { AgLoggerFunction, AgLoggerMap, AgLoggerOptions } from '../../../shared/types/AgLogger.interface';
import { AG_LOGLEVEL } from '../../../shared/types/AgLogLevel.types';

// 内部実装・コアクラス
import { AgLogger } from '../../AgLogger.class';
import { AgLoggerManager } from '../../AgLoggerManager.class';

/**
 * AgLoggerManager仕様準拠BDDテストスイート
 *
 * @description atsushifx式BDD厳格プロセスに従った実装
 * 仕様書: docs/specs/refactor-agLoggerManager.spec.md に基づく
 *
 * @testType Unit Test (BDD)
 * @testTarget AgLoggerManager Class
 */
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
 * @suite AgLoggerManager Initialization Guard | Functional
 * @description AgLoggerManagerの初期化前後におけるアクセス制御とエラーハンドリングを検証
 * @testType functional
 * Scenarios: 未初期化アクセス, 二重初期化防止, 初期化後取得
 */
describe('Feature: AgLoggerManager initialization guard', () => {
  /**
   * @context Given
   * @scenario 未初期化のAgLoggerManager
   * @description シングルトン生成前のAPI呼び出し時挙動を確認
   */
  describe('Given: uninitialized AgLoggerManager', () => {
    /**
     * @context When
     * @scenario getManagerを呼び出す
     * @description 未初期化状態でgetManagerを呼んだ際の例外を検証
     */
    describe('When: calling getManager', () => {
      it('Then: [異常] - should throw error for uninitialized access', () => {
        expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
      });
    });
  });

  /**
   * @context Given
   * @scenario 初期化済みのAgLoggerManager
   * @description createManager実行後のAPI呼び出し挙動を確認
   */
  describe('Given: initialized AgLoggerManager', () => {
    /**
     * @context When
     * @scenario createManagerを再度呼び出す
     * @description 二重初期化の禁止を検証
     */
    describe('When: calling createManager again', () => {
      it('Then: [異常] - should throw error for duplicate initialization', () => {
        AgLoggerManager.createManager();
        expect(() => AgLoggerManager.createManager()).toThrow(/already created/i);
      });
    });

    /**
     * @context When
     * @scenario 初期化後にgetManagerを呼び出す
     * @description createManagerとgetManagerの戻り値が一致するか確認
     */
    describe('When: calling getManager after initialization', () => {
      it('Then: [正常] - should return same reference as created manager', () => {
        const manager1 = AgLoggerManager.createManager();
        const manager2 = AgLoggerManager.getManager();
        expect(manager1).toBe(manager2);
      });
    });
  });
});

/**
 * @suite AgLoggerManager Logger Provisioning | Functional
 * @description AgLoggerManagerがAgLoggerインスタンスを生成・提供する挙動を検証
 * @testType functional
 * Scenarios: getLogger正常系, 未初期化アクセス, AgLogger一致性
 */
describe('Feature: AgLogger generation and retrieval', () => {
  /**
   * @context Given
   * @scenario 初期化済みAgLoggerManager
   * @description 正常状態でgetLoggerを利用した場合を検証
   */
  describe('Given: initialized AgLoggerManager', () => {
    /**
     * @context When
     * @scenario getLoggerを呼び出す
     * @description AgLoggerインスタンス取得の可用性を確認
     */
    describe('When: calling getLogger', () => {
      it('Then: [正常] - should return defined logger instance', () => {
        const manager = AgLoggerManager.createManager();
        const logger = manager.getLogger();
        expect(logger).toBeDefined();
      });

      it('Then: [正常] - should return same reference as AgLogger.getLogger', () => {
        AgLoggerManager.createManager();
        const manager = AgLoggerManager.getManager();
        const managerLogger = manager.getLogger();
        const directLogger = AgLogger.getLogger();
        expect(managerLogger).toBe(directLogger);
      });
    });
  });

  /**
   * @context Given
   * @scenario 未初期化のAgLoggerManager
   * @description シングルトン生成前にアクセスした場合の挙動を検証
   */
  describe('Given: uninitialized AgLoggerManager', () => {
    /**
     * @context When
     * @scenario getLoggerへアクセスを試みる
     * @description 未初期化状態で例外が発生することを確認
     */
    describe('When: attempting to access getLogger', () => {
      it('Then: [異常] - should throw error for uninitialized access', () => {
        AgLoggerManager.resetSingleton(); // Ensure no instance exists
        expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
      });
    });
  });
});

/**
 * @suite AgLoggerManager Logger Injection | Functional
 * @description setLoggerやcreateManagerによるロガーインスタンス管理を検証
 * @testType functional
 * Scenarios: createManager正常系, 外部注入拒否, ロガー取得
 */
describe('Feature: Logger instance injection', () => {
  /**
   * @context Given
   * @scenario クリーン状態のAgLoggerManager
   * @description setLoggerやcreateManagerの初期挙動を確認
   */
  describe('Given: AgLoggerManager in clean state', () => {
    /**
     * @context When
     * @scenario createManagerを呼び出す
     * @description シングルトン生成時の例外有無とロガー有無を検証
     */
    describe('When: creating manager with createManager', () => {
      it('Then: [正常] - should successfully create manager with logger', () => {
        AgLoggerManager.resetSingleton(); // Ensure clean state

        expect(() => {
          AgLoggerManager.createManager(); // Creates manager with logger
          // setLogger would throw because manager already has a logger
        }).not.toThrow();
      });

      it('Then: [正常] - should return logger instance after creation', () => {
        AgLoggerManager.resetSingleton(); // Ensure clean state

        const manager = AgLoggerManager.createManager();
        const retrievedLogger = manager.getLogger();
        expect(retrievedLogger).toBeInstanceOf(AgLogger);
      });
    });
  });

  /**
   * @context Given
   * @scenario 初期化済みAgLoggerManager
   * @description すでにロガーを保持している状態での挙動を検証
   */
  describe('Given: initialized AgLoggerManager', () => {
    /**
     * @context When
     * @scenario setLoggerで外部ロガーを注入しようとする
     * @description 二重注入が拒否されるかを確認
     */
    describe('When: attempting to inject external logger with setLogger', () => {
      it('Then: [異常] - should throw error for already initialized manager', () => {
        const externalLogger = AgLogger.createLogger();
        AgLoggerManager.resetSingleton(); // Ensure clean state

        const manager = AgLoggerManager.createManager(); // Initialize manager with logger

        expect(() => manager.setLogger(externalLogger)).toThrow(/already initialized/i);
      });
    });
  });
});

/**
 * @suite AgLoggerManager Disposal APIs | Functional
 * @description resetSingletonなどテスト向けAPIの廃棄挙動を検証
 * @testType functional
 * Scenarios: 廃棄後アクセス, 再初期化, エラー検出
 */
describe('Feature: Disposal test-only APIs', () => {
  /**
   * @context Given
   * @scenario 初期化済みAgLoggerManager
   * @description resetSingleton実行後のAPI挙動を確認
   */
  describe('Given: initialized AgLoggerManager', () => {
    /**
     * @context When
     * @scenario resetSingleton後にgetManagerを呼び出す
     * @description 廃棄後アクセスがエラーとなるか検証
     */
    describe('When: calling getManager after resetSingleton', () => {
      it('Then: [正常] - should throw error for disposed manager access', () => {
        AgLoggerManager.createManager();
        AgLoggerManager.resetSingleton();

        expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
      });
    });

    /**
     * @context When
     * @scenario resetSingleton後にcreateManagerを呼び出す
     * @description 廃棄後に再初期化できるか確認
     */
    describe('When: calling createManager after resetSingleton', () => {
      it('Then: [正常] - should allow new manager creation after disposal', () => {
        AgLoggerManager.createManager();
        AgLoggerManager.resetSingleton();

        expect(() => {
          const manager = AgLoggerManager.createManager();
          expect(manager).toBeDefined();
        }).not.toThrow();
      });
    });
  });
});

/**
 * @suite AgLoggerManager Delegation APIs | Functional
 * @description bindLoggerFunctionやupdateLoggerMap等の委譲メソッド挙動を検証
 * @testType functional
 * Scenarios: ロガー関数委譲, loggerMap更新, 設定委譲
 */
describe('Feature: Delegation establishment and interactions', () => {
  /**
   * @context Given
   * @scenario 委譲対象メソッドを持つ初期化済みAgLoggerManager
   * @description ロガーとの連携機能を確認
   */
  describe('Given: initialized AgLoggerManager with delegation target methods', () => {
    /**
     * @context When
     * @scenario bindLoggerFunctionを呼び出す
     * @description setLoggerFunctionへの委譲が行われるかを検証
     */
    describe('When: calling bindLoggerFunction', () => {
      it('Then: [正常] - should call AgLogger.setLoggerFunction once', () => {
        const manager = AgLoggerManager.createManager();
        const logger = manager.getLogger();
        const mockFunction: AgLoggerFunction = vi.fn();

        // AgLoggerのsetLoggerFunctionメソッドをスパイ
        const setLoggerFunctionSpy = vi.spyOn(logger, 'setLoggerFunction');

        manager.bindLoggerFunction(AG_LOGLEVEL.INFO, mockFunction);

        expect(setLoggerFunctionSpy).toHaveBeenCalledOnce();
        expect(setLoggerFunctionSpy).toHaveBeenCalledWith(AG_LOGLEVEL.INFO, mockFunction);
      });
    });

    /**
     * @context When
     * @scenario updateLoggerMapを呼び出す
     * @description setLoggerConfigにloggerMapが委譲されるかを検証
     */
    describe('When: calling updateLoggerMap', () => {
      it('Then: [正常] - should call AgLogger.setLoggerConfig with loggerMap', () => {
        const manager = AgLoggerManager.createManager();
        const logger = manager.getLogger();
        const mockLoggerMap: Partial<AgLoggerMap<AgLoggerFunction>> = {
          [AG_LOGLEVEL.ERROR]: vi.fn(),
          [AG_LOGLEVEL.WARN]: vi.fn(),
        };

        // AgLoggerのsetLoggerConfigメソッドをスパイ
        const setLoggerConfigSpy = vi.spyOn(logger, 'setLoggerConfig');

        manager.updateLoggerMap(mockLoggerMap);

        expect(setLoggerConfigSpy).toHaveBeenCalledOnce();
        expect(setLoggerConfigSpy).toHaveBeenCalledWith({ loggerMap: mockLoggerMap });
      });
    });

    /**
     * @context When
     * @scenario setLoggerConfigを呼び出す
     * @description AgLogger.setLoggerConfigへの委譲を検証
     */
    describe('When: calling setLoggerConfig', () => {
      it('Then: [正常] - should delegate to AgLogger.setLoggerConfig', () => {
        const manager = AgLoggerManager.createManager();
        const logger = manager.getLogger();
        const mockOptions = { logLevel: AG_LOGLEVEL.DEBUG };

        // AgLoggerのsetLoggerConfigメソッドをスパイ
        const setLoggerConfigSpy = vi.spyOn(logger, 'setLoggerConfig');

        manager.setLoggerConfig(mockOptions);

        expect(setLoggerConfigSpy).toHaveBeenCalledOnce();
        expect(setLoggerConfigSpy).toHaveBeenCalledWith(mockOptions);
      });
    });

    /**
     * @context When
     * @scenario removeLoggerFunctionを呼び出す
     * @description NullLoggerによる置換が行われるかを検証
     */
    describe('When: calling removeLoggerFunction', () => {
      it('Then: [正常] - should call AgLogger.setLoggerFunction with NullLogger', () => {
        const manager = AgLoggerManager.createManager();
        const logger = manager.getLogger();

        // AgLoggerのsetLoggerFunctionメソッドをスパイ
        const setLoggerFunctionSpy = vi.spyOn(logger, 'setLoggerFunction');

        manager.removeLoggerFunction(AG_LOGLEVEL.INFO);

        expect(setLoggerFunctionSpy).toHaveBeenCalledOnce();
        // NullLoggerで置換されることを確認
        expect(setLoggerFunctionSpy).toHaveBeenCalledWith(AG_LOGLEVEL.INFO, expect.any(Function));
      });
    });
  });
});

/**
 * @suite AgLoggerManager Error Threshold | Functional
 * @description 例外メッセージに対する閾値バリデーションを正規表現で検証
 * @testType functional
 * Scenarios: 未初期化アクセス, 例外メッセージ検証
 */
describe('Feature: AgLoggerManager error threshold validation', () => {
  /**
   * @context Given
   * @scenario 未初期化のAgLoggerManager
   * @description getManager呼び出し時のエラー文言を検証
   */
  describe('Given: uninitialized AgLoggerManager', () => {
    /**
     * @context When
     * @scenario getManagerを呼び出す
     * @description 例外メッセージが正規表現に合致するかを確認
     */
    describe('When: calling getManager', () => {
      it('Then: [異常] - should throw error message matching /not created/i', () => {
        expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
      });
    });
  });
});

/**
 * @suite AgLoggerManager State Edge Cases | Functional
 * @description ManagerとLoggerの状態同期や並列操作時の境界動作を検証
 * @testType functional
 * Scenarios: 複合操作の整合性, 廃棄後参照, 設定変更検知
 */
describe('Feature: Manager state management edge cases', () => {
  /**
   * @context Given
   * @scenario Manager-Logger状態の不整合シナリオ
   * @description 並列操作や廃棄後アクセス時の整合性を検証
   */
  describe('Given: Manager-Logger state inconsistency scenarios', () => {
    /**
     * @context When
     * @scenario 複数マネージャ操作を並列実行
     * @description 連続操作時に例外なく整合性が保たれるか確認
     */
    describe('When: executing multiple manager operations in parallel', () => {
      it('Then: [エッジケース] - should maintain state consistency under concurrent operations', () => {
        const manager = AgLoggerManager.createManager();
        const logger = manager.getLogger();

        // Simulate concurrent state changes
        const operations = [
          () => manager.setLoggerConfig({ logLevel: AG_LOGLEVEL.DEBUG }),
          () => manager.bindLoggerFunction(AG_LOGLEVEL.INFO, vi.fn()),
          () => manager.removeLoggerFunction(AG_LOGLEVEL.WARN),
        ];

        // Execute operations in sequence (simulating concurrent access patterns)
        operations.forEach((op) => {
          expect(() => op()).not.toThrow();
        });

        // Verify final state consistency
        expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);
      });
    });

    /**
     * @context When
     * @scenario マネージャ廃棄後の状態を確認
     * @description resetSingleton後の参照とアクセス挙動を確認
     */
    describe('When: checking state after manager disposal', () => {
      it('Then: [エッジケース] - should handle post-disposal access correctly', () => {
        // Create manager and logger reference
        const manager = AgLoggerManager.createManager();
        const loggerRef = manager.getLogger();

        // Dispose manager
        AgLoggerManager.resetSingleton();

        // Logger reference should still be functional
        expect(() => {
          loggerRef.info('test message after manager disposal');
        }).not.toThrow();

        // But manager access should fail
        expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
      });
    });

    /**
     * @context When
     * @scenario 設定オブジェクト変更を検知する
     * @description 設定変更や参照置換時の影響を検証
     */
    describe('When: detecting configuration object changes', () => {
      it('Then: [エッジケース] - should detect and handle configuration object mutations', () => {
        const manager = AgLoggerManager.createManager();
        const logger = manager.getLogger();

        // Test configuration object mutations
        const config: AgLoggerOptions = { logLevel: AG_LOGLEVEL.WARN };
        manager.setLoggerConfig(config);
        expect(logger.logLevel).toBe(AG_LOGLEVEL.WARN);

        // Mutate original config object (should not affect logger)
        config.logLevel = AG_LOGLEVEL.ERROR;
        expect(logger.logLevel).toBe(AG_LOGLEVEL.WARN); // Should remain unchanged
      });

      it('Then: [エッジケース] - should handle null/undefined config mutations', () => {
        const manager = AgLoggerManager.createManager();
        const logger = manager.getLogger();

        // Set initial config
        const config: AgLoggerOptions = { logLevel: AG_LOGLEVEL.INFO };
        manager.setLoggerConfig(config);
        expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);

        // Attempt to corrupt the config reference
        (config as unknown as { logLevel: null; formatter: undefined }).logLevel = null;
        (config as unknown as { logLevel: null; formatter: undefined }).formatter = undefined;

        // Logger should maintain its state
        expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
        expect(() => logger.info('test after config corruption')).not.toThrow();
      });

      it('Then: [エッジケース] - should handle config reference replacement', () => {
        const manager = AgLoggerManager.createManager();

        // Set initial config
        const config1: AgLoggerOptions = { logLevel: AG_LOGLEVEL.DEBUG };
        manager.setLoggerConfig(config1);
        expect(manager.getLogger().logLevel).toBe(AG_LOGLEVEL.DEBUG);

        // Replace with new config object
        const config2: AgLoggerOptions = { logLevel: AG_LOGLEVEL.ERROR };
        manager.setLoggerConfig(config2);
        expect(manager.getLogger().logLevel).toBe(AG_LOGLEVEL.ERROR);

        // Original config mutations should not affect current state
        config1.logLevel = AG_LOGLEVEL.TRACE;
        expect(manager.getLogger().logLevel).toBe(AG_LOGLEVEL.ERROR);
      });
    });

    /**
     * @context When
     * @scenario Manager-Logger参照の不整合を検証
     * @description 複数回の設定変更や同時アクセス時の参照一致性を確認
     */
    describe('When: Manager-Logger reference inconsistency', () => {
      it('Then: [エッジケース] - should maintain consistent references after multiple operations', () => {
        const manager = AgLoggerManager.createManager();
        const logger1 = manager.getLogger();

        // Perform multiple config changes
        manager.setLoggerConfig({ logLevel: AG_LOGLEVEL.WARN });
        const logger2 = manager.getLogger();

        manager.setLoggerConfig({ logLevel: AG_LOGLEVEL.ERROR });
        const logger3 = manager.getLogger();

        // All logger references should be the same instance
        expect(logger1).toBe(logger2);
        expect(logger2).toBe(logger3);
        expect(logger1.logLevel).toBe(AG_LOGLEVEL.ERROR);
      });

      it('Then: [エッジケース] - should handle concurrent access patterns', () => {
        const manager = AgLoggerManager.createManager();

        // Simulate concurrent access to logger and config changes
        const loggers = Array.from({ length: 5 }, () => manager.getLogger());

        // All should be the same reference
        loggers.forEach((logger, index) => {
          expect(logger).toBe(loggers[0]);
          expect(() => logger.info(`concurrent test ${index}`)).not.toThrow();
        });

        // Config change during concurrent access
        manager.setLoggerConfig({ logLevel: AG_LOGLEVEL.FATAL });

        // All logger references should still work with new config
        loggers.forEach((logger, index) => {
          expect(logger.logLevel).toBe(AG_LOGLEVEL.FATAL);
          expect(() => logger.fatal(`post-config test ${index}`)).not.toThrow();
        });
      });
    });
  });
});
