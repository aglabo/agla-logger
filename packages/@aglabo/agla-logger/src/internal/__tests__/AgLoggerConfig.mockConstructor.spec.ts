// src/internal/__tests__/AgLoggerConfig.mockConstructor.spec.ts
// @(#) : AgLoggerConfig AgMockConstructor対応のBDDテスト
//
// 目的:
// - setLoggerConfig(options) に AgMockConstructor を渡した場合、
//   自動的にインスタンス化され、formatter に instance.execute が設定されることを検証する。
// - 既存の関数フォーマッタ（AgFormatFunction）は従来通り設定されることを確認する。
//
// スタイル: atsushifx式BDD (1 it/1 expect を基本に、分岐ごとに最小限の期待を積み上げ)

// 外部ライブラリ (Vitest)
import { beforeEach, describe, expect, it } from 'vitest';

// 型定義・インターフェース - ログメッセージおよびフォーマッタ関数型
import type { AgLogMessage } from '../../../shared/types';
import type { AgFormatFunction } from '../../../shared/types/AgLogger.interface';

// 定数・設定・エラーメッセージ - ログレベル列挙体
import { AG_LOGLEVEL } from '../../../shared/types';

// 内部実装・コアクラス - AgLoggerConfig本体
import { AgLoggerConfig } from '../AgLoggerConfig.class';

// プラグインシステム - AgMockFormatter実体
import { AgMockFormatter } from '../../plugins/formatter/AgMockFormatter';

// AgMockFormatterを直接使用することで、AgMockConstructor経由のセットアップを明示的に再現する
/**
 * @suite AgMockConstructor Integration | AgLoggerConfig
 * @description AgMockConstructorをformatterに指定した際の自動インスタンス化と既存関数フォーマッターの保持を確認する
 * @testType unit
 * Scenarios: インスタンス化, execute適用, 既存関数保持
 */
describe('Feature: AgLoggerConfig AgMockConstructor integration', () => {
  /**
   * @context When
   * @scenario AgMockConstructorをformatterに設定する
   * @description setLoggerConfigにAgMockConstructorを渡した際の自動インスタンス化とformatter差し替えを検証する
   */
  describe('When: configuring AgMockConstructor as formatter', () => {
    let config: AgLoggerConfig;

    beforeEach(() => {
      config = new AgLoggerConfig();
    });

    it('Then: [正常] - should resolve AgMockConstructor to function when specified as formatter', () => {
      config.setLoggerConfig({ formatter: AgMockFormatter as unknown as AgFormatFunction });
      expect(typeof config.formatter).toBe('function');
    });

    it('Then: [正常] - should auto-instantiate AgMockConstructor and use execute method', () => {
      config.setLoggerConfig({ formatter: AgMockFormatter as unknown as AgFormatFunction });

      const msg: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T00:00:00Z'),
        message: 'hello',
        args: [],
      };
      const result = config.formatter(msg);
      // デフォルトルーチンは透過（msg自体を返す）であることを期待
      expect(result).toBe(msg);
    });

    it('Then: [正常] - should auto-instantiate AgMockFormatter', () => {
      config.setLoggerConfig({ formatter: AgMockFormatter as unknown as AgFormatFunction });

      // formatterInstanceが設定されることを確認
      expect(config.hasStatsFormatter()).toBe(true);
    });

    it('Then: [正常] - should set execute method from auto-generated instance as formatter', () => {
      config.setLoggerConfig({ formatter: AgMockFormatter as unknown as AgFormatFunction });

      const msg: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-01-01T00:00:00Z'),
        message: 'payload',
        args: [{ k: 'v' }],
      };
      const out = config.formatter(msg);
      // 透過ルーチンが設定されていれば out === msg になる
      expect(out).toBe(msg);
    });
  });

  /**
   * @context When
   * @scenario 既存の関数フォーマッターを渡す
   * @description 既存のAgFormatFunctionを指定した場合に上書きされないことを確認する
   */
  describe('When: providing existing function formatter', () => {
    it('Then: [正常] - should preserve existing function formatter when provided', () => {
      const config = new AgLoggerConfig();
      const fn: AgFormatFunction = (m) => m.message;
      config.setLoggerConfig({ formatter: fn });
      expect(config.formatter).toBe(fn);
    });
  });
});
