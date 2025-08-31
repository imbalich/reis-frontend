// 导入用于实例化
import { RBDCalculationEngine } from './engine/RBDCalculationEngine';

export { RBDAlgorithmAdapter } from './adapters/AlgorithmAdapter';

// 导出核心组件
export { TopologyAnalyzer } from './analyzers/TopologyAnalyzer';
export { RBDNodeCalculator } from './calculators/NodeCalculator';
export { RBDCalculationEngine } from './engine/RBDCalculationEngine';
// 导出类型定义
export * from './types';

// 延迟实例化计算引擎，避免循环依赖
let _calculationEngine: null | RBDCalculationEngine = null;

const getCalculationEngine = (): RBDCalculationEngine => {
  if (!_calculationEngine) {
    _calculationEngine = new RBDCalculationEngine();
  }
  return _calculationEngine;
};

// 导出计算引擎实例访问器
export const calculationEngine = getCalculationEngine();

// 导出便捷函数
export async function calculateRBDReliability(
  graphData: any,
  timeRange: { end: number; points: number; start: number },
  options: {
    calculationTypes: ('availability' | 'mttf' | 'reliability')[];
    includeMaintenance: boolean;
  },
) {
  return getCalculationEngine().calculate({
    graphData,
    timeRange,
    options,
  });
}

export function validateRBDTopology(graphData: any) {
  return getCalculationEngine().validateTopology(graphData);
}

export function analyzeRBDPaths(graphData: any) {
  return getCalculationEngine().analyzePaths(graphData);
}
