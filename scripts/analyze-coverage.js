#!/usr/bin/env node
// scripts/analyze-coverage.js
// @(#) 関数型プログラミングによる統合カバレッジ分析

import fs from 'fs';
import path from 'path';

// パッケージとテストレイヤーの定義
const PACKAGES = ['agla-logger-core', 'agla-error-core'];
const TEST_LAYERS = ['unit', 'functional', 'integration', 'e2e'];

// 関数型ユーティリティ
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);
const map = (fn) => (array) => array.map(fn);
const filter = (predicate) => (array) => array.filter(predicate);
const reduce = (fn, initial) => (array) => array.reduce(fn, initial);
const flatMap = (fn) => (array) => array.flatMap(fn);

// カバレッジファイルパス生成
const generateCoveragePaths = () =>
  pipe(
    () => PACKAGES,
    flatMap((pkg) =>
      TEST_LAYERS.map((layer) => ({
        package: pkg,
        layer,
        path: `packages/@aglabo/${pkg}/coverage/${layer}/coverage-final.json`,
      }))
    ),
  )();

// ファイル存在確認とデータ読み込み
const loadCoverageData = (pathInfo) => {
  try {
    if (!fs.existsSync(pathInfo.path)) {
      console.warn(`⚠️  Missing: ${pathInfo.path}`);
      return null;
    }

    const data = JSON.parse(fs.readFileSync(pathInfo.path, 'utf8'));
    return { ...pathInfo, data };
  } catch (error) {
    console.error(`❌ Error loading ${pathInfo.path}:`, error.message);
    return null;
  }
};

// カバレッジ統計計算（純粋関数）
const calculateStats = (coverageData) => {
  const stats = Object.values(coverageData).reduce((acc, file) => {
    // Statements
    if (file.s) {
      const statements = Object.values(file.s);
      acc.statements.total += statements.length;
      acc.statements.covered += statements.filter((count) => count > 0).length;
    }

    // Functions
    if (file.f) {
      const functions = Object.values(file.f);
      acc.functions.total += functions.length;
      acc.functions.covered += functions.filter((count) => count > 0).length;
    }

    // Branches
    if (file.b) {
      Object.values(file.b).forEach((branchData) => {
        if (Array.isArray(branchData)) {
          acc.branches.total += branchData.length;
          acc.branches.covered += branchData.filter((count) => count > 0).length;
        }
      });
    }

    // Lines (v8形式の場合はstatementMapから推定)
    if (file.l) {
      const lines = Object.entries(file.l);
      acc.lines.total += lines.length;
      acc.lines.covered += lines.filter(([, count]) => count > 0).length;
    } else if (file.statementMap && file.s) {
      // v8形式: statementMapから行番号を抽出し、実行カウントとマッピング
      const lineHits = new Map();
      Object.entries(file.statementMap).forEach(([stmtId, location]) => {
        if (location && location.start && typeof location.start.line === 'number') {
          const line = location.start.line;
          const count = file.s[stmtId] || 0;
          lineHits.set(line, Math.max(lineHits.get(line) || 0, count));
        }
      });

      acc.lines.total += lineHits.size;
      acc.lines.covered += Array.from(lineHits.values()).filter((count) => count > 0).length;
    }

    return acc;
  }, {
    statements: { total: 0, covered: 0 },
    functions: { total: 0, covered: 0 },
    branches: { total: 0, covered: 0 },
    lines: { total: 0, covered: 0 },
  });

  // パーセンテージ計算
  const addPercentage = (metric) => ({
    ...metric,
    pct: metric.total > 0 ? ((metric.covered / metric.total) * 100).toFixed(2) : '0.00',
  });

  return {
    statements: addPercentage(stats.statements),
    functions: addPercentage(stats.functions),
    branches: addPercentage(stats.branches),
    lines: addPercentage(stats.lines),
  };
};

// カバレッジマージ（純粋関数）
const mergeCoverage = (coverageList) =>
  coverageList.reduce((merged, coverage) => {
    Object.entries(coverage).forEach(([filePath, fileData]) => {
      if (!merged[filePath]) {
        merged[filePath] = JSON.parse(JSON.stringify(fileData));
        return;
      }

      const existing = merged[filePath];

      // Statements
      if (fileData.s) {
        existing.s = existing.s || {};
        Object.entries(fileData.s).forEach(([key, value]) => {
          existing.s[key] = Math.max(existing.s[key] || 0, value || 0);
        });
      }

      // Functions
      if (fileData.f) {
        existing.f = existing.f || {};
        Object.entries(fileData.f).forEach(([key, value]) => {
          existing.f[key] = Math.max(existing.f[key] || 0, value || 0);
        });
      }

      // Branches
      if (fileData.b) {
        existing.b = existing.b || {};
        Object.entries(fileData.b).forEach(([key, branchArray]) => {
          if (!existing.b[key]) { existing.b[key] = []; }
          if (Array.isArray(branchArray)) {
            branchArray.forEach((value, index) => {
              existing.b[key][index] = Math.max(existing.b[key][index] || 0, value || 0);
            });
          }
        });
      }

      // Lines (v8対応：statementMapベースでマージ)
      if (fileData.l) {
        existing.l = existing.l || {};
        Object.entries(fileData.l).forEach(([key, value]) => {
          existing.l[key] = Math.max(existing.l[key] || 0, value || 0);
        });
      } else if (fileData.statementMap) {
        // v8形式の場合はstatementMapとsデータも保持
        existing.statementMap = existing.statementMap || {};
        Object.assign(existing.statementMap, fileData.statementMap);
      }
    });

    return merged;
  }, {});

// レポート表示
const displayReport = (layerStats, totalStats) => {
  console.log('📊 agla モノレポ 統合カバレッジ分析\n');
  console.log('='.repeat(80));

  // パッケージ別・レイヤー別表示
  PACKAGES.forEach((pkg) => {
    console.log(`\n🎯 ${pkg}:`);
    TEST_LAYERS.forEach((layer) => {
      const key = `${pkg}-${layer}`;
      const stats = layerStats.get(key);
      if (stats) {
        console.log(
          `   ${
            layer.padEnd(12)
          }: ${stats.statements.pct}% stmt, ${stats.functions.pct}% func, ${stats.branches.pct}% branch, ${stats.lines.pct}% line`,
        );
      } else {
        console.log(`   ${layer.padEnd(12)}: データなし`);
      }
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log('🏆 **統合カバレッジ** (全パッケージ・全レイヤー統合):');
  console.log(
    `   Statements: ${totalStats.statements.covered}/${totalStats.statements.total} (${totalStats.statements.pct}%)`,
  );
  console.log(
    `   Functions:  ${totalStats.functions.covered}/${totalStats.functions.total} (${totalStats.functions.pct}%)`,
  );
  console.log(
    `   Branches:   ${totalStats.branches.covered}/${totalStats.branches.total} (${totalStats.branches.pct}%)`,
  );
  console.log(`   Lines:      ${totalStats.lines.covered}/${totalStats.lines.total} (${totalStats.lines.pct}%)`);
  console.log('='.repeat(80));

  // 要約テーブル
  console.log('\n📈 要約:');
  console.log(`   🎯 統合文カバレッジ:     ${totalStats.statements.pct}%`);
  console.log(`   🎯 統合関数カバレッジ:   ${totalStats.functions.pct}%`);
  console.log(`   🎯 統合分岐カバレッジ:   ${totalStats.branches.pct}%`);
  console.log(`   🎯 統合行カバレッジ:     ${totalStats.lines.pct}%`);
};

// メイン処理パイプライン
const main = () => {
  try {
    const results = pipe(
      generateCoveragePaths,
      map(loadCoverageData),
      filter((result) => result !== null),
    )();

    if (results.length === 0) {
      console.error('❌ カバレッジファイルが見つかりませんでした');
      process.exit(1);
    }

    // レイヤー別統計
    const layerStats = new Map();
    results.forEach((result) => {
      const key = `${result.package}-${result.layer}`;
      const stats = calculateStats(result.data);
      layerStats.set(key, stats);
    });

    // 統合カバレッジ計算
    const allCoverageData = results.map((result) => result.data);
    const mergedCoverage = mergeCoverage(allCoverageData);
    const totalStats = calculateStats(mergedCoverage);

    // レポート表示
    displayReport(layerStats, totalStats);

    console.log('\n✅ カバレッジ分析完了');
  } catch (error) {
    console.error('❌ カバレッジ分析エラー:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// 実行
main();
