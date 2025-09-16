// tests/integration/agLoggerManager/management/singleton.integration.spec.ts
// @(#) : AgLoggerManager Management Singleton Integration Tests - Manager singleton behavior
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Test framework: execution, assertion, mocking
import { describe, expect, it, vi } from 'vitest';

// Shared types and constants: log levels and type definitions
import { AG_LOGLEVEL } from '@shared/types';
import type { AgMockConstructor } from '@shared/types';

// Test targets: main classes under test
import { AgLoggerManager } from '@/AgLoggerManager.class';

// Plugin implementations: formatters and loggers
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';

/**
 * @suite Mock Output Singleton Management Integration | Integration
 * @description マネージャーのシングルトン動作を保証する統合テスト
 * @testType integration
 * Scenarios: 複数アクセスポイント, 初期化競合, シングルトン状態一貫性
 */
describe('Mock Output Singleton Management Integration', () => {
  /**
   * テスト開始用setup
   *
   * @returns {{ mockLogger: AgMockBufferLogger; mockFormatter: AgMockConstructor }}
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
   * @scenario 複数アクセスポイント
   * @description 複数アクセスポイントが存在する環境でのAgLoggerManagerの異なる方法でのアクセス時の同一シングルトンインスタンス取得を検証
   */
  describe('Given: multiple access points to manager', () => {
    /**
     * @context When
     * @scenario 異なるコンテキストからのマネージャーアクセス
     * @description 異なるコンテキストからマネージャーにアクセスした時のgetManager呼び出し間でのシングルトン性維持を検証
     */
    describe('When: accessing manager from different contexts', () => {
      // 目的: getManager呼び出し間でシングルトン性が維持される
      it('Then: [正常] - should return identical singleton instance consistently', () => {
        setupTestContext();

        // When: マネージャーを作成し、複数回取得
        const tempLoggerInstance = new MockLogger.buffer();
        const tempLogger = tempLoggerInstance.info.bind(tempLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: tempLogger, formatter: JsonFormatter });
        const manager1 = AgLoggerManager.getManager();
        const manager2 = AgLoggerManager.getManager();

        // Then: 同一インスタンス
        expect(manager1).toBe(manager2);
      });
    });

    /**
     * @context When
     * @scenario 複数インスタンスからの設定アクセス
     * @description 複数インスタンスから設定にアクセスした時の複数回アクセス時の設定一貫性維持を検証
     */
    describe('When: accessing configuration from multiple instances', () => {
      // 目的: 複数回アクセス時に設定の一貫性が保たれる
      it('Then: [正常] - should maintain consistent configuration across access attempts', () => {
        setupTestContext();

        // Given: 設定済みマネージャー
        const mockLoggerInstance = new MockLogger.buffer();
        const mockLogger = mockLoggerInstance.info.bind(mockLoggerInstance);
        const mockFormatter = vi.fn().mockReturnValue('test output');

        AgLoggerManager.createManager({ defaultLogger: mockLogger, formatter: mockFormatter });

        // When: 複数のインスタンス参照を取得
        const manager1 = AgLoggerManager.getManager();
        const manager2 = AgLoggerManager.getManager();
        const logger1 = manager1.getLogger();
        const logger2 = manager2.getLogger();

        // Then: 両方から取得したロガーが同一の機能を提供
        expect(logger1.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(logger2.getLoggerFunction(AG_LOGLEVEL.INFO));
      });
    });
  });

  /**
   * @context Given
   * @scenario 初期化競合
   * @description 初期化競合シナリオが存在する環境での複数回初期化試行時の最初初期化のみ有効、後続エラー処理を検証
   */
  describe('Given: initialization conflicts', () => {
    /**
     * @context When
     * @scenario 同時初期化試行遇遇
     * @description 同時初期化試行に遷遇した時の複数回初期化パラメータ指定での設定更新適切な処理を検証
     */
    describe('When: encountering concurrent initialization attempts', () => {
      // 目的: 複数回の初期化パラメータ指定で設定が更新される挙動を確認
      it('Then: [異常] - should handle initialization conflicts gracefully', () => {
        setupTestContext();

        // Given: 異なる設定パラメータ
        const firstLoggerInstance = new MockLogger.buffer();
        const firstLogger = firstLoggerInstance.info.bind(firstLoggerInstance);
        const secondLoggerInstance = new MockLogger.buffer();
        const secondLogger = secondLoggerInstance.info.bind(secondLoggerInstance);
        const firstFormatter = vi.fn().mockReturnValue('first');

        // When: 最初の初期化
        AgLoggerManager.createManager({ defaultLogger: firstLogger, formatter: firstFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // Then: 二回目の初期化は失敗
        expect(() => AgLoggerManager.createManager({ defaultLogger: secondLogger }))
          .toThrow();

        // Then: 設定は最初の初期化のまま維持
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(firstLogger);
      });
    });

    /**
     * @context When
     * @scenario シングルトンリセット後の初期化
     * @description シングルトンリセット後に初期化が発生した時のリセット後の再初期化正常動作を検証
     */
    describe('When: initialization occurs after singleton reset', () => {
      // 目的: リセット後の再初期化が正常動作することを確認
      it('Then: [正常] - should allow re-initialization after singleton reset', () => {
        setupTestContext();

        // Given: 初期のマネージャー設定
        const firstLoggerInstance = new MockLogger.buffer();
        const firstLogger = firstLoggerInstance.info.bind(firstLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: firstLogger, formatter: JsonFormatter });
        const firstManager = AgLoggerManager.getManager();

        // When: シングルトンリセット後の再初期化
        AgLoggerManager.resetSingleton();
        const secondLoggerInstance = new MockLogger.buffer();
        const secondLogger = secondLoggerInstance.info.bind(secondLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: secondLogger, formatter: JsonFormatter });
        const secondManager = AgLoggerManager.getManager();

        // Then: 新しいインスタンスが作成される
        expect(firstManager).not.toBe(secondManager);
        expect(secondManager.getLogger().getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(secondLogger);
      });
    });
  });

  /**
   * @context Given
   * @scenario シングルトン状態一貫性要件
   * @description シングルトン状態一貫性要件が重要な環境での状態変更と参照取得並行実行時の状態一貫性維持を検証
   */
  describe('Given: singleton state consistency requirements', () => {
    /**
     * @context When
     * @scenario アクセスポイント間の状態一貫性検証
     * @description アクセスポイント間で状態一貫性を検証した時の並行アクセス時のマネージャー状態一貫性を検証
     */
    describe('When: verifying state consistency across access points', () => {
      // 目的: 並行アクセス時のマネージャー状態一貫性
      it('Then: [エッジケース] - should maintain consistent state regardless of access method', () => {
        setupTestContext();

        // Given: 初期マネージャー
        const initialLoggerInstance = new MockLogger.buffer();
        const initialLogger = initialLoggerInstance.info.bind(initialLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: initialLogger, formatter: JsonFormatter });
        const manager = AgLoggerManager.getManager();

        // When: 状態変更と参照取得を並行実行
        const updatedLoggerInstance = new MockLogger.buffer();
        const updatedLogger = updatedLoggerInstance.info.bind(updatedLoggerInstance);
        manager.setLoggerConfig({ defaultLogger: updatedLogger });

        // 複数の並行アクセス
        const logger1 = manager.getLogger();
        const logger2 = manager.getLogger();
        const logger3 = manager.getLogger();

        // Then: 全ての参照が同一の更新された状態を反映
        expect(logger1.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(updatedLogger);
        expect(logger2.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(updatedLogger);
        expect(logger3.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(updatedLogger);
        expect(logger1.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(logger2.getLoggerFunction(AG_LOGLEVEL.INFO));
      });
    });
  });
});
