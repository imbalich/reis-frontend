import type { RBDGraphData, RBDNode } from '../../types';
import type {
  CalculationEngine,
  CalculationRequest,
  CalculationResult,
  NodeResult,
  PathAnalysisResult,
  TopologyAnalysisResult,
} from '../types';

import { TopologyAnalyzer } from '../analyzers/TopologyAnalyzer';
import { RBDNodeCalculator } from '../calculators/NodeCalculator';

export class RBDCalculationEngine implements CalculationEngine {
  private nodeCalculator: RBDNodeCalculator;

  constructor() {
    this.nodeCalculator = new RBDNodeCalculator();
  }

  /**
   * 分析计算路径
   */
  public analyzePaths(graphData: RBDGraphData): PathAnalysisResult {
    const analyzer = new TopologyAnalyzer(graphData);
    return analyzer.analyzePaths();
  }

  /**
   * 执行可靠性计算
   */
  public async calculate(
    request: CalculationRequest,
  ): Promise<CalculationResult> {
    const startTime = Date.now();

    try {
      // 1. 验证拓扑结构
      const topologyResult = this.validateTopology(request.graphData);
      if (!topologyResult.isValid) {
        return {
          systemReliability: [],
          nodeResults: new Map(),
          calculationTime: 0,
          totalTime: Date.now() - startTime,
          error: topologyResult.error,
        };
      }

      // 2. 分析计算路径
      const pathResult = this.analyzePaths(request.graphData);
      if (!pathResult.isValid) {
        return {
          systemReliability: [],
          nodeResults: new Map(),
          calculationTime: 0,
          totalTime: Date.now() - startTime,
          error: pathResult.error,
        };
      }

      // 3. 执行计算
      const calculationStartTime = Date.now();
      const result = await this.performCalculation(request, pathResult);
      const calculationTime = Date.now() - calculationStartTime;

      return {
        ...result,
        calculationTime,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        systemReliability: [],
        nodeResults: new Map(),
        calculationTime: 0,
        totalTime: Date.now() - startTime,
        error:
          error instanceof Error ? error.message : '计算过程中发生未知错误',
      };
    }
  }

  /**
   * 获取计算引擎信息
   */
  public getEngineInfo(): { supportedFeatures: string[]; version: string } {
    return {
      version: '1.0.0',
      supportedFeatures: [
        '指数分布可靠度计算',
        '串联系统计算',
        '并联系统计算',
        'k/n系统计算',
        '拓扑分析',
        '路径识别',
      ],
    };
  }

  /**
   * 验证拓扑结构
   */
  public validateTopology(graphData: RBDGraphData): TopologyAnalysisResult {
    const analyzer = new TopologyAnalyzer(graphData);
    return analyzer.validateTopology();
  }

  /**
   * 计算单个节点的可靠度
   */
  private async calculateNodeReliability(
    node: RBDNode,
    times: number[],
  ): Promise<NodeResult> {
    const startTime = Date.now();
    const reliability: number[] = [];

    try {
      for (const time of times) {
        const nodeReliability =
          this.nodeCalculator.calculateNodeReliabilityWithCount(node, time);
        reliability.push(nodeReliability);
      }

      return {
        nodeId: node.id,
        reliability,
        times,
        calculationTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        nodeId: node.id,
        reliability: [],
        times,
        calculationTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '节点计算失败',
      };
    }
  }

  /**
   * 计算并联系统可靠度
   */
  private calculateParallelReliability(
    reliabilities: number[],
    k: number,
    n: number,
  ): number {
    if (k === n) {
      // 标准并联：至少一个正常工作
      let parallelReliability = 1;
      for (const reliability of reliabilities) {
        parallelReliability *= 1 - reliability;
      }
      return 1 - parallelReliability;
    } else {
      // k/n系统
      return this.nodeCalculator.calculateKNReliability(
        k,
        n,
        reliabilities[0] || 0,
      );
    }
  }

  /**
   * 计算单条路径的可靠度
   */
  private calculatePathReliability(
    path: any,
    nodeResults: Map<string, NodeResult>,
    timeIndex: number,
  ): number {
    // 递归计算路径树
    return this.calculatePathTreeNode(path, nodeResults, timeIndex);
  }

  /**
   * 递归计算路径树节点
   */
  private calculatePathTreeNode(
    node: any,
    nodeResults: Map<string, NodeResult>,
    timeIndex: number,
  ): number {
    // 如果是并联节点
    if (node.isParallel) {
      const childReliabilities: number[] = [];

      for (const child of node.children) {
        const childReliability = this.calculatePathTreeNode(
          child,
          nodeResults,
          timeIndex,
        );
        childReliabilities.push(childReliability);
      }

      const k = node.k || 1;
      const n = node.n || childReliabilities.length;

      return this.calculateParallelReliability(childReliabilities, k, n);
    }

    // 如果是普通节点
    const nodeResult = nodeResults.get(node.nodeId);
    if (!nodeResult || nodeResult.reliability.length <= timeIndex) {
      return 0;
    }

    const reliability = nodeResult.reliability[timeIndex];

    // 如果有子节点，需要计算串联关系
    if (node.children && node.children.length > 0) {
      let seriesReliability = reliability;
      for (const child of node.children) {
        const childReliability = this.calculatePathTreeNode(
          child,
          nodeResults,
          timeIndex,
        );
        seriesReliability *= childReliability; // 串联：可靠度相乘
      }
      return seriesReliability;
    }

    return reliability;
  }

  /**
   * 计算系统整体可靠度
   */
  private calculateSystemReliability(
    paths: any[],
    nodeResults: Map<string, NodeResult>,
    timeIndex: number,
  ): number {
    if (paths.length === 0) {
      return 0;
    }

    // 简化处理：如果只有一条路径，直接返回该路径的可靠度
    if (paths.length === 1) {
      return this.calculatePathReliability(paths[0], nodeResults, timeIndex);
    }

    // 多条路径的情况，作为并联处理
    const pathReliabilities: number[] = [];

    for (const path of paths) {
      const pathReliability = this.calculatePathReliability(
        path,
        nodeResults,
        timeIndex,
      );
      pathReliabilities.push(pathReliability);
    }

    // 并联系统：至少需要一条路径正常工作
    return this.calculateParallelReliability(
      pathReliabilities,
      1,
      pathReliabilities.length,
    );
  }

  /**
   * 生成时间点数组
   */
  private generateTimePoints(timeRange: {
    end: number;
    points: number;
    start: number;
  }): number[] {
    const { start, end, points } = timeRange;
    const times: number[] = [];

    for (let i = 0; i < points; i++) {
      const time = start + ((end - start) * i) / (points - 1);
      times.push(time);
    }

    return times;
  }

  /**
   * 执行具体计算
   */
  private async performCalculation(
    request: CalculationRequest,
    pathResult: PathAnalysisResult,
  ): Promise<Omit<CalculationResult, 'calculationTime' | 'totalTime'>> {
    const { timeRange } = request;
    const { paths, calculationOrder } = pathResult;

    // 生成时间点数组
    const times = this.generateTimePoints(timeRange);

    // 存储节点计算结果
    const nodeResults = new Map<string, NodeResult>();

    // 存储系统可靠度结果
    const systemReliability: number[] = [];

    // 按计算顺序处理每个节点
    for (const nodeId of calculationOrder) {
      const node = request.graphData.nodes.find((n) => n.id === nodeId);
      if (!node) {
        continue;
      }

      const nodeResult = await this.calculateNodeReliability(node, times);
      nodeResults.set(nodeId, nodeResult);
    }

    // 计算系统整体可靠度
    for (let i = 0; i < times.length; i++) {
      const systemReliabilityAtTime = this.calculateSystemReliability(
        paths,
        nodeResults,
        i, // 使用时间索引而不是时间值
      );
      systemReliability.push(systemReliabilityAtTime);
    }

    // 输出最终计算结果
    console.log('=== RBD计算完成 ===');
    console.log('系统可靠度结果:', systemReliability.slice(0, 5)); // 显示前5个时间点的结果
    console.log('计算时间范围:', timeRange.start, '到', timeRange.end, '小时');
    console.log('时间点数量:', times.length);
    console.log('参与计算的节点数量:', nodeResults.size);

    return {
      systemReliability,
      nodeResults,
    };
  }
}
