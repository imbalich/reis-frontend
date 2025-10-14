import { AdaptiveCalculationEngine } from './engine/AdaptiveCalculationEngine';
import { FactoringCalculationEngine } from './engine/FactoringCalculationEngine';
// 导入用于实例化
import { RBDCalculationEngine } from './engine/RBDCalculationEngine';

export { RBDAlgorithmAdapter } from './adapters/AlgorithmAdapter';

export { FactoringAnalyzer } from './analyzers/FactoringAnalyzer';
// 导出核心组件
export { TopologyAnalyzer } from './analyzers/TopologyAnalyzer';
export { RBDNodeCalculator } from './calculators/NodeCalculator';
export { AdaptiveCalculationEngine } from './engine/AdaptiveCalculationEngine';
export { FactoringCalculationEngine } from './engine/FactoringCalculationEngine';
export { RBDCalculationEngine } from './engine/RBDCalculationEngine';
// 导出测试工具（开发环境）
export { quickTest, testAlgorithms } from './test-algorithms';

// 计算算法类型
export type CalculationAlgorithm =
  | 'adaptive'
  | 'factoring'
  | 'path-enumeration';

// 延迟实例化计算引擎，避免循环依赖
let _pathEnumerationEngine: null | RBDCalculationEngine = null;
let _factoringEngine: FactoringCalculationEngine | null = null;
let _adaptiveEngine: AdaptiveCalculationEngine | null = null;

const getCalculationEngine = (algorithm: CalculationAlgorithm = 'adaptive') => {
  switch (algorithm) {
    case 'factoring': {
      if (!_factoringEngine) {
        _factoringEngine = new FactoringCalculationEngine();
      }
      return _factoringEngine;
    }

    case 'path-enumeration': {
      if (!_pathEnumerationEngine) {
        _pathEnumerationEngine = new RBDCalculationEngine();
      }
      return _pathEnumerationEngine;
    }

    case 'adaptive':
    default: {
      if (!_adaptiveEngine) {
        _adaptiveEngine = new AdaptiveCalculationEngine();
      }
      return _adaptiveEngine;
    }
  }
};

// 导出计算引擎实例访问器（默认使用自适应引擎）
export const calculationEngine = getCalculationEngine('adaptive');

// 全局算法选择变量
let currentAlgorithm: CalculationAlgorithm = 'adaptive';

/**
 * 设置计算算法
 */
export function setCalculationAlgorithm(algorithm: CalculationAlgorithm) {
  currentAlgorithm = algorithm;
  console.log(`🔄 计算算法已切换到: ${algorithm}`);
}

/**
 * 获取当前计算算法
 */
export function getCurrentAlgorithm(): CalculationAlgorithm {
  return currentAlgorithm;
}

// 导出便捷函数
export async function calculateRBDReliability(
  graphData: any,
  timeRange: { end: number; points: number; start: number },
  options: {
    calculationTypes: ('availability' | 'mttf' | 'reliability')[];
    includeMaintenance: boolean;
  },
  algorithm?: CalculationAlgorithm,
) {
  // 使用指定的算法或当前设置的算法
  const selectedAlgorithm = algorithm || currentAlgorithm;
  const engine = getCalculationEngine(selectedAlgorithm);

  console.log(`🚀 开始计算 - 使用算法: ${selectedAlgorithm}`);
  console.log(`📊 图形数据:`, {
    节点数: graphData.nodes?.length || 0,
    边数: graphData.edges?.length || 0,
    时间范围: `${timeRange.start}-${timeRange.end}小时`,
    数据点: timeRange.points,
  });

  const result = await engine.calculate({
    graphData,
    timeRange,
    options,
  });

  console.log(`✅ 计算完成 - 算法: ${selectedAlgorithm}`, {
    系统可靠度: result.systemReliability?.slice(0, 5),
    计算时间: `${result.calculationTime}ms`,
    总时间: `${result.totalTime}ms`,
    错误: result.error || '无',
  });

  return result;
}

export function validateRBDTopology(
  graphData: any,
  algorithm?: CalculationAlgorithm,
) {
  const selectedAlgorithm = algorithm || currentAlgorithm;
  return getCalculationEngine(selectedAlgorithm).validateTopology(graphData);
}

export function analyzeRBDPaths(
  graphData: any,
  algorithm?: CalculationAlgorithm,
) {
  const selectedAlgorithm = algorithm || currentAlgorithm;
  return getCalculationEngine(selectedAlgorithm).analyzePaths(graphData);
}

// 导出类型定义
export * from './types';
