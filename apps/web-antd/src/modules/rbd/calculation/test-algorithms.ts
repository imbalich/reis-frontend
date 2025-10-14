/**
 * 算法测试脚本
 * 用于验证不同算法的计算结果差异
 */

import type { CalculationAlgorithm } from './index';

import {
  calculateRBDReliability,
  getCurrentAlgorithm,
  setCalculationAlgorithm,
} from './index';

/**
 * 测试不同算法的计算结果
 */
export async function testAlgorithms(
  graphData: any,
  timeRange: any,
  options: any,
) {
  console.log('🧪 开始算法对比测试');
  console.log('📊 测试数据:', {
    节点数: graphData.nodes?.length || 0,
    边数: graphData.edges?.length || 0,
    时间范围: `${timeRange.start}-${timeRange.end}小时`,
  });

  const algorithms: CalculationAlgorithm[] = [
    'path-enumeration',
    'factoring',
    'adaptive',
  ];
  const results: any[] = [];

  for (const algorithm of algorithms) {
    console.log(`\n🔄 测试算法: ${algorithm}`);

    try {
      const startTime = Date.now();
      const result = await calculateRBDReliability(
        graphData,
        timeRange,
        options,
        algorithm,
      );
      const endTime = Date.now();

      results.push({
        algorithm,
        result,
        executionTime: endTime - startTime,
        success: !result.error,
        systemReliability: result.systemReliability,
        error: result.error,
      });

      console.log(`✅ ${algorithm} 完成:`, {
        执行时间: `${endTime - startTime}ms`,
        成功: !result.error,
        系统可靠度: result.systemReliability?.slice(0, 3),
        错误: result.error || '无',
      });
    } catch (error) {
      console.error(`❌ ${algorithm} 失败:`, error);
      results.push({
        algorithm,
        result: null,
        executionTime: 0,
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  // 对比分析
  console.log('\n📈 算法对比分析:');
  console.table(
    results.map((r) => ({
      算法: r.algorithm,
      执行时间: `${r.executionTime}ms`,
      成功: r.success ? '✅' : '❌',
      错误: r.error || '无',
    })),
  );

  // 如果有多个成功的结果，比较系统可靠度
  const successfulResults = results.filter(
    (r) => r.success && r.systemReliability,
  );
  if (successfulResults.length > 1) {
    console.log('\n🔍 系统可靠度对比:');

    const firstResult = successfulResults[0];
    const firstReliability = firstResult.systemReliability;

    for (let i = 1; i < successfulResults.length; i++) {
      const currentResult = successfulResults[i];
      const currentReliability = currentResult.systemReliability;

      const differences = firstReliability.map((val: number, index: number) =>
        Math.abs(val - currentReliability[index]),
      );

      const maxDifference = Math.max(...differences);
      const avgDifference =
        differences.reduce((sum: number, diff: number) => sum + diff, 0) /
        differences.length;

      console.log(`${firstResult.algorithm} vs ${currentResult.algorithm}:`, {
        最大差异: maxDifference.toFixed(6),
        平均差异: avgDifference.toFixed(6),
        相对误差: `${((maxDifference / firstReliability[0]) * 100).toFixed(2)}%`,
      });
    }
  }

  return results;
}

/**
 * 快速测试单个算法
 */
export async function quickTest(
  algorithm: CalculationAlgorithm,
  graphData: any,
  timeRange: any,
  options: any,
) {
  console.log(`🚀 快速测试算法: ${algorithm}`);

  try {
    const result = await calculateRBDReliability(
      graphData,
      timeRange,
      options,
      algorithm,
    );
    console.log(`✅ ${algorithm} 测试完成:`, {
      系统可靠度: result.systemReliability?.slice(0, 5),
      计算时间: `${result.calculationTime}ms`,
      错误: result.error || '无',
    });
    return result;
  } catch (error) {
    console.error(`❌ ${algorithm} 测试失败:`, error);
    throw error;
  }
}

/**
 * 在浏览器控制台中暴露测试函数
 */
if (typeof window !== 'undefined') {
  (window as any).testRBDAlgorithms = testAlgorithms;
  (window as any).quickTestRBDAlgorithm = quickTest;
  (window as any).setRBDAlgorithm = setCalculationAlgorithm;
  (window as any).getRBDAlgorithm = getCurrentAlgorithm;

  console.log('🧪 RBD算法测试工具已加载到全局:');
  console.log(
    '  - testRBDAlgorithms(graphData, timeRange, options) // 对比所有算法',
  );
  console.log(
    '  - quickTestRBDAlgorithm(algorithm, graphData, timeRange, options) // 快速测试单个算法',
  );
  console.log('  - setRBDAlgorithm(algorithm) // 设置当前算法');
  console.log('  - getRBDAlgorithm() // 获取当前算法');
}
