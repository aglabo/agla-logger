// src/__tests__/agManagerUtils/AgManagerUtils.methodReplacement.spec.ts
// @(#) : AgManagerUtils Method Replacement Tests - Ensures AgManager automatic management
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 外部ライブラリ（Vitest）
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// 定数・設定・エラーメッセージ
import { AG_LOGLEVEL } from '../../../shared/types';

// ユーティリティ・ヘルパー関数
import { AgLoggerManager, AgManager, createManager } from '../../index';

/**
 * AgManagerUtils Method Replacement Tests
 *
 * @description setupManagerによるメソッド置き換えでAgManagerが自動管理されることをテスト
 * atsushifx式BDD構造でメソッド置き換え機能の正確性を検証
 */
describe('Feature: AgLoggerManager method replacement with automatic AgManager integration', () => {
  beforeEach(() => {
    // 各テスト前にシングルトンをリセット
    AgLoggerManager.resetSingleton();
  });

  afterEach(() => {
    // 各テスト後にシングルトンをリセット
    AgLoggerManager.resetSingleton();
  });

  describe('When AgLoggerManager.createManager is called', () => {
    it('Then: [Normal] - should automatically configure AgManager in addition to original functionality', () => {
      // Arrange: 初期状態の確認
      expect(AgManager).toBeUndefined();

      // Act: createManagerを呼び出し
      const manager = AgLoggerManager.createManager();

      // Assert: AgManagerが設定されていることを確認
      expect(AgManager).toBeDefined();
      expect(AgManager).toBe(manager);
      expect(AgManager).toBeInstanceOf(AgLoggerManager);
    });

    it('Then: [Normal] - should return the same AgLoggerManager instance as original createManager', () => {
      // Act: createManagerを呼び出し
      const manager = AgLoggerManager.createManager();

      // Assert: 戻り値が正しいAgLoggerManagerインスタンスであることを確認
      expect(manager).toBeInstanceOf(AgLoggerManager);
      expect(manager).toBe(AgManager);
      expect(() => manager.getLogger()).not.toThrow();
    });

    it('Then: [Normal] - should properly initialize AgManager with custom settings', () => {
      // Arrange: カスタム設定を準備
      const customOptions = {
        logLevel: AG_LOGLEVEL.DEBUG,
      };

      // Act: カスタム設定でcreateManagerを呼び出し
      const manager = AgLoggerManager.createManager(customOptions);

      // Assert: AgManagerが設定され、設定が反映されていることを確認
      expect(AgManager).toBeDefined();
      expect(AgManager).toBe(manager);

      const logger = AgManager!.getLogger();
      expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);
    });
  });

  describe('When AgLoggerManager.resetSingleton is called', () => {
    it('Then: [Normal] - should automatically clear AgManager in addition to original functionality', () => {
      // Arrange: managerを作成してAgManagerを設定
      AgLoggerManager.createManager();
      expect(AgManager).toBeDefined();

      // Act: resetSingletonを呼び出し
      AgLoggerManager.resetSingleton();

      // Assert: AgManagerがundefinedになることを確認
      expect(AgManager).toBeUndefined();
    });

    it('Then: [Normal] - should properly reset singleton instance', () => {
      // Arrange: managerを作成
      AgLoggerManager.createManager();
      expect(AgManager).toBeDefined();

      // Act: resetSingletonを呼び出し
      AgLoggerManager.resetSingleton();

      // Assert: シングルトンもリセットされることを確認
      expect(() => AgLoggerManager.getManager()).toThrow();
      expect(AgManager).toBeUndefined();
    });

    it('Then: [Normal] - should properly initialize when createManager is called again after resetSingleton', () => {
      // Arrange: 一度managerを作成後リセット
      AgLoggerManager.createManager();
      AgLoggerManager.resetSingleton();
      expect(AgManager).toBeUndefined();

      // Act: 再度createManagerを呼び出し
      const newManager = AgLoggerManager.createManager();

      // Assert: 新しいAgManagerが設定されることを確認
      expect(AgManager).toBeDefined();
      expect(AgManager).toBe(newManager);
      expect(AgManager).toBeInstanceOf(AgLoggerManager);
    });
  });

  describe('When comparing behavior before and after method replacement', () => {
    it('Then: [Normal] - should preserve basic functionality of createManager', () => {
      // Act: createManagerを呼び出し
      const manager = AgLoggerManager.createManager();

      // Assert: 基本機能が維持されていることを確認
      expect(manager).toBeInstanceOf(AgLoggerManager);
      expect(() => manager.getLogger()).not.toThrow();
      expect(typeof manager.getLogger().info).toBe('function');
    });

    it('Then: [Normal] - should preserve basic functionality of resetSingleton', () => {
      // Arrange: managerを作成
      AgLoggerManager.createManager();
      expect(() => AgLoggerManager.getManager()).not.toThrow();

      // Act: resetSingletonを呼び出し
      AgLoggerManager.resetSingleton();

      // Assert: 基本機能が維持されていることを確認
      expect(() => AgLoggerManager.getManager()).toThrow();
    });

    it('Then: [Normal] - should only add AgManager management functionality', () => {
      // Act: createManagerを呼び出し
      const manager = AgLoggerManager.createManager();

      // Assert: AgManager管理機能が追加されていることを確認
      expect(AgManager).toBe(manager);

      // Act: resetSingletonを呼び出し
      AgLoggerManager.resetSingleton();

      // Assert: AgManager管理機能が動作していることを確認
      expect(AgManager).toBeUndefined();
    });
  });

  describe('When utility function createManager() is called', () => {
    it('Then: [Normal] - should automatically configure AgManager', () => {
      // Arrange: 初期状態の確認
      expect(AgManager).toBeUndefined();

      // Act: ユーティリティ関数createManagerを呼び出し
      const manager = createManager();

      // Assert: AgManagerが設定されることを確認
      expect(AgManager).toBeDefined();
      expect(AgManager).toBe(manager);
      expect(AgManager).toBeInstanceOf(AgLoggerManager);
    });

    it('Then: [Normal] - should have AgManager and createManager return value as same instance', () => {
      // Act: ユーティリティ関数createManagerを呼び出し
      const manager = createManager();

      // Assert: AgManagerと戻り値が同じインスタンスであることを確認
      expect(AgManager).toBe(manager);
      expect(AgManager === manager).toBe(true);
    });
  });

  describe('When testing error cases', () => {
    it('Then: [Error] - should throw error but maintain AgManager state', () => {
      // Arrange: 最初のmanagerを作成
      const firstManager = AgLoggerManager.createManager();
      expect(AgManager).toBe(firstManager);

      // Act & Assert: 二度目のcreateManagerはエラーを投げる
      expect(() => AgLoggerManager.createManager()).toThrow();

      // Assert: AgManagerは最初のmanagerのままであることを確認
      expect(AgManager).toBe(firstManager);
      expect(AgManager).toBeInstanceOf(AgLoggerManager);
    });
  });
});
