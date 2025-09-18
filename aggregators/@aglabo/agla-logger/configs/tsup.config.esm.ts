// src: shared/common/configs/tsup.config.module.ts
// @(#) : tsup config for ESM module
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// system config
import { defineConfig } from 'tsup';

// user config
import { baseConfig } from '../../../../base/configs/tsup.config.base';

// configs
export default defineConfig({
  ...baseConfig,

  // entry points
  entry: {
    'index': './src/index.ts',
    'logger': './src/logger.ts',
    'error': './src/error.ts',
  },

  // sub-packages definition
  format: ['esm'],
  outDir: 'dist', // for ESM
  // tsconfig
  tsconfig: './tsconfig.build.json',
  // DTS with incremental build for ESM
  dts: true,

  // 依存を外部化（= core を同梱しない）
  external: [
    '@aglabo/agla-logger-core',
    '@aglabo/agla-error',
  ],

  // （任意）バンドル対象から node_modules を確実に外す
  skipNodeModulesBundle: true,
});
