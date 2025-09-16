// src: /src/AgManagerUtils.ts
// @(#) : AgLoggerManager Utility Functions and Initialization
//
// AgLoggerManager 用のユーティリティ関数(createManager, getLogger) と初期化(setupManager)
// シングルトンパターンの管理とLogger インスタンスの生成・取得機能を提供
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ErrorSeverity } from '@aglabo/agla-error';
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../shared/constants/agErrorMessages';
import type { AgLoggerOptions } from '../shared/types/AgLogger.interface';
import { AgLoggerError } from '../shared/types/AgLoggerError.types';
import type { AgLogger } from './AgLogger.class';
import { AgLoggerManager } from './AgLoggerManager.class';

// AgManager をここで一元管理（直接代入で管理）
/**
 * シングルトンAgLoggerManagerインスタンスの一元管理変数
 *
 * アプリケーション全体で共有されるAgLoggerManagerのインスタンスを保持します。
 * setupManager()で初期化され、getLogger()でアクセス可能になります。
 *
 * @example
 * ```typescript
 * import { setupManager, getLogger } from './AgManagerUtils';
 *
 * setupManager(); // AgManagerを初期化
 * const logger = getLogger(); // 初期化済みのロガーを取得
 * ```
 */
export let AgManager: AgLoggerManager | undefined;

export const createManager = (options?: AgLoggerOptions): AgLoggerManager => {
  const manager = AgLoggerManager.createManager(options);
  AgManager = manager; // 直接代入
  return manager;
};

export const getLogger = (): AgLogger => {
  if (AgManager === undefined) {
    try {
      const manager = AgLoggerManager.getManager();
      return manager.getLogger();
    } catch {
      throw new AgLoggerError(
        ErrorSeverity.FATAL,
        ERROR_TYPES.INITIALIZATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
      );
    }
  }

  return AgManager.getLogger();
};

// AgLoggerManager のメソッドをラップして AgManager を自動管理
export const setupManager = (): void => {
  const originalCreateManager = AgLoggerManager.createManager;
  AgLoggerManager.createManager = (options?: AgLoggerOptions): AgLoggerManager => {
    const manager = originalCreateManager.call(AgLoggerManager, options);
    AgManager = manager; // 直接代入
    return manager;
  };

  const originalResetSingleton = AgLoggerManager.resetSingleton;
  AgLoggerManager.resetSingleton = (): void => {
    originalResetSingleton.call(AgLoggerManager);
    AgManager = undefined; // 直接代入でクリア
  };
};
