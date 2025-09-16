// src/internal/__tests__/AgLoggerConfig.mockConstructor.spec.ts
// @(#) : AgLoggerConfig AgMockConstructor対応のBDDテスト
//
// 目的:
// - setLoggerConfig(options) に AgMockConstructor を渡した場合、
//   自動的にインスタンス化され、formatter に instance.execute が設定されることを検証する。
// - 既存の関数フォーマッタ（AgFormatFunction）は従来通り設定されることを確認する。
//
// スタイル: atsushifx式BDD (1 it/1 expect を基本に、分岐ごとに最小限の期待を積み上げ)

import { describe, expect, it } from 'vitest';

import type { AgLogMessage } from '../../../shared/types';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgFormatFunction } from '../../../shared/types/AgLogger.interface';

import { AgMockFormatter } from '../../plugins/formatter/AgMockFormatter';
import { AgLoggerConfig } from '../AgLoggerConfig.class';

// AgMockFormatterを直接使用

describe('Feature: AgLoggerConfig AgMockConstructor integration', () => {
  it('Then: [正常] - should resolve AgMockConstructor to function when specified as formatter', () => {
    const config = new AgLoggerConfig();
    config.setLoggerConfig({ formatter: AgMockFormatter as unknown as AgFormatFunction });
    expect(typeof config.formatter).toBe('function');
  });

  it('Then: [正常] - should auto-instantiate AgMockConstructor and use execute method', () => {
    const config = new AgLoggerConfig();
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
    const config = new AgLoggerConfig();
    config.setLoggerConfig({ formatter: AgMockFormatter as unknown as AgFormatFunction });

    // formatterInstanceが設定されることを確認
    expect(config.hasStatsFormatter()).toBe(true);
  });

  it('Then: [正常] - should set execute method from auto-generated instance as formatter', () => {
    const config = new AgLoggerConfig();
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

  it('Then: [正常] - should preserve existing function formatter when provided', () => {
    const config = new AgLoggerConfig();
    const fn: AgFormatFunction = (m) => m.message;
    config.setLoggerConfig({ formatter: fn });
    expect(config.formatter).toBe(fn);
  });
});
