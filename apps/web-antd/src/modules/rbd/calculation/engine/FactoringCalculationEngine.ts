import type { RBDGraphData } from '../../types';
import type {
  CalculationEngine,
  CalculationRequest,
  CalculationResult,
  NodeResult,
  TopologyAnalysisResult,
} from '../types';

import { FactoringAnalyzer } from '../analyzers/FactoringAnalyzer';
import { SimpleFactoringAnalyzer } from '../analyzers/SimpleFactoringAnalyzer';
import { RBDNodeCalculator } from '../calculators/NodeCalculator';

/**
 * 基于Factoring算法的计算引擎
 * 专门处理复杂RBD拓扑，包括共享节点和K/N表决节点
 */
export class FactoringCalculationEngine implements CalculationEngine {
  private factoringAnalyzer: FactoringAnalyzer;
  private nodeCalculator: RBDNodeCalculator;
  private simpleFactoringAnalyzer: SimpleFactoringAnalyzer;

  constructor() {
    this.nodeCalculator = new RBDNodeCalculator();
    this.factoringAnalyzer = new FactoringAnalyzer(this.nodeCalculator);
    this.simpleFactoringAnalyzer = new SimpleFactoringAnalyzer(
      this.nodeCalculator,
    );
  }

  /**
   * 分析路径（Factoring算法不需要详细路径分析）
   */
  public analyzePaths(graphData: RBDGraphData): any {
    // Factoring算法不需要路径分析，直接返回成功
    return {
      paths: [],
      isValid: true,
      calculationOrder: [], // Factoring算法使用递归分解，不需要预定义计算顺序
    };
  }

  /**
   * 执行可靠性计算 - 使用Factoring算法
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

      // 2. 生成时间点数组
      const times = this.generateTimePoints(request.timeRange);

      // 3. 计算系统可靠度
      const calculationStartTime = Date.now();
      const systemReliability: number[] = [];

      for (const time of times) {
        try {
          // 先尝试简化版本
          const reliability = this.simpleFactoringAnalyzer.calculateReliability(
            request.graphData,
            time,
          );
          systemReliability.push(reliability);
        } catch (error) {
          console.error(
            `简化Factoring时间点 ${time} 计算失败，尝试原版:`,
            error,
          );
          try {
            // 如果简化版本失败，尝试原版
            const reliability = this.factoringAnalyzer.calculateReliability(
              request.graphData,
              time,
            );
            systemReliability.push(reliability);
          } catch (fallbackError) {
            console.error(`原版Factoring时间点 ${time} 也失败:`, fallbackError);
            systemReliability.push(0);
          }
        }
      }

      const calculationTime = Date.now() - calculationStartTime;

      // 4. 计算各节点可靠度（用于分析）
      const nodeResults = await this.calculateNodeResults(
        request.graphData,
        times,
      );

      // 5. 输出计算结果
      console.log('=== Factoring算法计算完成 ===');
      console.log('系统可靠度结果:', systemReliability.slice(0, 5));
      console.log(
        '计算时间范围:',
        request.timeRange.start,
        '到',
        request.timeRange.end,
        '小时',
      );
      console.log('时间点数量:', times.length);
      console.log('计算耗时:', calculationTime, 'ms');

      return {
        systemReliability,
        nodeResults,
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
        'Factoring算法',
        'Shannon分解',
        '复杂拓扑处理',
        '共享节点处理',
        'K/N表决节点处理',
        '指数分布可靠度计算',
        '递归图简化',
      ],
    };
  }

  /**
   * 验证拓扑结构
   */
  public validateTopology(graphData: RBDGraphData): TopologyAnalysisResult {
    const startNodes = graphData.nodes.filter(
      (node) => node.properties?.nodeType === 'start',
    );
    const endNodes = graphData.nodes.filter(
      (node) => node.properties?.nodeType === 'end',
    );

    // 基本验证
    if (startNodes.length === 0) {
      return {
        startNodes: [],
        endNodes: [],
        connectedPaths: [],
        disconnectedNodes: graphData.nodes,
        isValid: false,
        error: '缺少开始节点',
      };
    }

    if (endNodes.length === 0) {
      return {
        startNodes,
        endNodes: [],
        connectedPaths: [],
        disconnectedNodes: graphData.nodes,
        isValid: false,
        error: '缺少结束节点',
      };
    }

    if (startNodes.length > 1) {
      return {
        startNodes,
        endNodes,
        connectedPaths: [],
        disconnectedNodes: [],
        isValid: false,
        error: '只能有一个开始节点',
      };
    }

    if (endNodes.length > 1) {
      return {
        startNodes,
        endNodes,
        connectedPaths: [],
        disconnectedNodes: [],
        isValid: false,
        error: '只能有一个结束节点',
      };
    }

    // 简化验证：检查是否有从开始到结束的路径
    const hasPath = this.checkConnectivity(
      graphData,
      startNodes[0],
      endNodes[0],
    );

    return {
      startNodes,
      endNodes,
      connectedPaths: [], // Factoring算法不需要路径分析
      disconnectedNodes: [],
      isValid: hasPath,
      error: hasPath ? undefined : '没有从开始节点到结束节点的有效路径',
    };
  }

  /**
   * 计算各节点的可靠度（用于分析展示）
   */
  private async calculateNodeResults(
    graphData: RBDGraphData,
    times: number[],
  ): Promise<Map<string, NodeResult>> {
    const nodeResults = new Map<string, NodeResult>();

    for (const node of graphData.nodes) {
      const startTime = Date.now();
      const reliability: number[] = [];

      try {
        for (const time of times) {
          const nodeReliability = this.nodeCalculator.calculateReliability(
            node,
            time,
          );
          reliability.push(nodeReliability);
        }

        nodeResults.set(node.id, {
          nodeId: node.id,
          reliability,
          times,
          calculationTime: Date.now() - startTime,
        });
      } catch (error) {
        nodeResults.set(node.id, {
          nodeId: node.id,
          reliability: [],
          times,
          calculationTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : '节点计算失败',
        });
      }
    }

    return nodeResults;
  }

  /**
   * 检查连通性（简化实现）
   */
  private checkConnectivity(
    graphData: RBDGraphData,
    startNode: any,
    endNode: any,
  ): boolean {
    // 使用BFS检查连通性
    const visited = new Set<string>();
    const queue = [startNode.id];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;

      visited.add(current);
      if (current === endNode.id) {
        return true;
      }

      // 找到当前节点的所有后继
      const edges = graphData.edges.filter(
        (edge) => edge.sourceNodeId === current,
      );
      for (const edge of edges) {
        if (!visited.has(edge.targetNodeId)) {
          queue.push(edge.targetNodeId);
        }
      }
    }

    return false;
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
}
