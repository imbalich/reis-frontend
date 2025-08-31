import type { RBDGraphData, RBDNode } from '../../types';

// 计算请求接口
export interface CalculationRequest {
  graphData: RBDGraphData;
  timeRange: {
    end: number;
    points: number;
    start: number;
  };
  options: CalculationOptions;
}

// 计算选项
export interface CalculationOptions {
  includeMaintenance: boolean;
  calculationTypes: ('availability' | 'mttf' | 'reliability')[];
}

// 节点计算结果
export interface NodeResult {
  nodeId: string;
  reliability: number[];
  times: number[];
  calculationTime: number;
  error?: string;
}

// 系统计算结果
export interface CalculationResult {
  systemReliability: number[];
  nodeResults: Map<string, NodeResult>;
  calculationTime: number;
  totalTime: number;
  error?: string;
}

// 路径树节点
export interface PathTreeNode {
  nodeId: string;
  nodeType: string;
  children: PathTreeNode[];
  isParallel: boolean;
  k?: number;
  n?: number;
}

// 路径分析结果
export interface PathAnalysisResult {
  paths: PathTreeNode[];
  isValid: boolean;
  error?: string;
  calculationOrder: string[];
}

// 拓扑分析结果
export interface TopologyAnalysisResult {
  startNodes: RBDNode[];
  endNodes: RBDNode[];
  connectedPaths: PathTreeNode[];
  disconnectedNodes: RBDNode[];
  isValid: boolean;
  error?: string;
}

// 计算引擎接口
export interface CalculationEngine {
  calculate(request: CalculationRequest): Promise<CalculationResult>;
  validateTopology(graphData: RBDGraphData): TopologyAnalysisResult;
  analyzePaths(graphData: RBDGraphData): PathAnalysisResult;
}

// 节点计算器接口
export interface NodeCalculator {
  calculateReliability(node: RBDNode, time: number): number;
  calculateSeriesReliability(nodes: RBDNode[], time: number): number;
  calculateParallelReliability(
    nodes: RBDNode[],
    k: number,
    n: number,
    time: number,
  ): number;
  calculateKNReliability(k: number, n: number, reliability: number): number;
}

// 算法适配器接口
export interface AlgorithmAdapter {
  createDistributionStrategy(node: RBDNode): any;
  calculateNodeReliability(node: RBDNode, time: number): number;
  validateNodeParameters(node: RBDNode): boolean;
}
