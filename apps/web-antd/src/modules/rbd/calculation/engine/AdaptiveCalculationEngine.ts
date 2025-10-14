import type { RBDGraphData } from '../../types';
import type {
  CalculationEngine,
  CalculationRequest,
  CalculationResult,
} from '../types';

import { FactoringCalculationEngine } from './FactoringCalculationEngine';
import { RBDCalculationEngine } from './RBDCalculationEngine';

/**
 * 自适应计算引擎
 * 根据拓扑复杂度自动选择合适的算法：
 * - 简单拓扑：使用路径枚举法（快速）
 * - 复杂拓扑：使用Factoring算法（精确）
 */
export class AdaptiveCalculationEngine implements CalculationEngine {
  private factoringEngine: FactoringCalculationEngine;
  private pathEnumerationEngine: RBDCalculationEngine;

  constructor() {
    this.pathEnumerationEngine = new RBDCalculationEngine();
    this.factoringEngine = new FactoringCalculationEngine();
  }

  /**
   * 分析路径（路径枚举法需要）
   */
  public analyzePaths(graphData: RBDGraphData) {
    return this.pathEnumerationEngine.analyzePaths(graphData);
  }

  /**
   * 执行可靠性计算 - 自动选择算法
   */
  public async calculate(
    request: CalculationRequest,
  ): Promise<CalculationResult> {
    // 分析拓扑复杂度
    const complexity = this.analyzeTopologyComplexity(request.graphData);

    console.log('=== 拓扑复杂度分析 ===');
    console.log('复杂度评分:', complexity.score);
    console.log('复杂度级别:', complexity.level);
    console.log('推荐算法:', complexity.recommendedAlgorithm);
    console.log('分析详情:', complexity.details);

    // 根据复杂度选择算法
    if (complexity.recommendedAlgorithm === 'factoring') {
      console.log('使用Factoring算法进行精确计算...');
      return this.factoringEngine.calculate(request);
    } else {
      console.log('使用路径枚举法进行快速计算...');
      return this.pathEnumerationEngine.calculate(request);
    }
  }

  /**
   * 获取计算引擎信息
   */
  public getEngineInfo(): { supportedFeatures: string[]; version: string } {
    return {
      version: '2.0.0',
      supportedFeatures: [
        '自适应算法选择',
        '路径枚举法（快速）',
        'Factoring算法（精确）',
        '拓扑复杂度分析',
        '复杂拓扑处理',
        '共享节点处理',
        'K/N表决节点处理',
      ],
    };
  }

  /**
   * 验证拓扑结构
   */
  public validateTopology(graphData: RBDGraphData) {
    // 两种引擎的验证逻辑应该一致，使用Factoring引擎的验证
    return this.factoringEngine.validateTopology(graphData);
  }

  /**
   * 分析拓扑复杂度
   */
  private analyzeTopologyComplexity(graphData: RBDGraphData): {
    details: string[];
    level: 'complex' | 'medium' | 'simple';
    recommendedAlgorithm: 'factoring' | 'path-enumeration';
    score: number;
  } {
    const details: string[] = [];
    let score = 0;

    // 1. 节点数量分析
    const nodeCount = graphData.nodes.length;
    if (nodeCount > 20) {
      score += 3;
      details.push(`节点数量较多(${nodeCount}个)`);
    } else if (nodeCount > 10) {
      score += 2;
      details.push(`节点数量中等(${nodeCount}个)`);
    } else {
      score += 1;
      details.push(`节点数量较少(${nodeCount}个)`);
    }

    // 2. 边数量分析
    const edgeCount = graphData.edges.length;
    if (edgeCount > 30) {
      score += 3;
      details.push(`连接复杂度高(${edgeCount}条边)`);
    } else if (edgeCount > 15) {
      score += 2;
      details.push(`连接复杂度中等(${edgeCount}条边)`);
    } else {
      score += 1;
      details.push(`连接复杂度低(${edgeCount}条边)`);
    }

    // 3. K/N节点检测
    const knNodes = graphData.nodes.filter(
      (node) => node.properties?.nodeType === 'kn',
    );
    if (knNodes.length > 0) {
      score += 4;
      details.push(`包含${knNodes.length}个K/N表决节点`);
    }

    // 4. 共享节点检测（简化实现）
    const sharedNodes = this.detectSharedNodes(graphData);
    if (sharedNodes.length > 0) {
      score += 5;
      details.push(
        `检测到${sharedNodes.length}个潜在共享节点: ${sharedNodes.join(', ')}`,
      );
    }

    // 5. 并行路径数量分析
    const parallelPaths = this.estimateParallelPaths(graphData);
    if (parallelPaths > 5) {
      score += 3;
      details.push(`可能存在${parallelPaths}条以上并行路径`);
    } else if (parallelPaths > 2) {
      score += 2;
      details.push(`存在${parallelPaths}条并行路径`);
    }

    // 6. 层次深度分析
    const maxDepth = this.calculateMaxDepth(graphData);
    if (maxDepth > 5) {
      score += 2;
      details.push(`拓扑层次较深(深度${maxDepth})`);
    }

    // 确定复杂度级别
    let level: 'complex' | 'medium' | 'simple';
    let recommendedAlgorithm: 'factoring' | 'path-enumeration';

    if (score <= 6) {
      level = 'simple';
      recommendedAlgorithm = 'path-enumeration';
    } else if (score <= 12) {
      level = 'medium';
      recommendedAlgorithm = 'factoring'; // 中等复杂度也建议用Factoring，更安全
    } else {
      level = 'complex';
      recommendedAlgorithm = 'factoring';
    }

    return {
      score,
      level,
      recommendedAlgorithm,
      details,
    };
  }

  /**
   * 计算拓扑最大深度（简化实现）
   */
  private calculateMaxDepth(graphData: RBDGraphData): number {
    const startNode = graphData.nodes.find(
      (n) => n.properties?.nodeType === 'start',
    );
    if (!startNode) return 0;

    // 使用BFS计算最长路径
    const visited = new Map<string, number>();
    const queue = [{ nodeId: startNode.id, depth: 0 }];

    let maxDepth = 0;

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;

      if (visited.has(nodeId) && visited.get(nodeId)! >= depth) {
        continue;
      }

      visited.set(nodeId, depth);
      maxDepth = Math.max(maxDepth, depth);

      // 添加后继节点
      const edges = graphData.edges.filter((e) => e.sourceNodeId === nodeId);
      for (const edge of edges) {
        queue.push({ nodeId: edge.targetNodeId, depth: depth + 1 });
      }
    }

    return maxDepth;
  }

  /**
   * 检测共享节点（简化实现）
   * 通过分析节点的入度和出度来识别可能的共享节点
   */
  private detectSharedNodes(graphData: RBDGraphData): string[] {
    const sharedNodes: string[] = [];
    const nodeConnections = new Map<string, { in: number; out: number }>();

    // 统计每个节点的连接数
    for (const node of graphData.nodes) {
      nodeConnections.set(node.id, { in: 0, out: 0 });
    }

    for (const edge of graphData.edges) {
      const source = nodeConnections.get(edge.sourceNodeId);
      const target = nodeConnections.get(edge.targetNodeId);

      if (source) source.out++;
      if (target) target.in++;
    }

    // 识别可能的共享节点（入度>1或出度>1的节点）
    for (const [nodeId, connections] of nodeConnections) {
      if (connections.in > 1 || connections.out > 1) {
        const node = graphData.nodes.find((n) => n.id === nodeId);
        if (
          node &&
          node.properties?.nodeType !== 'start' &&
          node.properties?.nodeType !== 'end'
        ) {
          sharedNodes.push(nodeId);
        }
      }
    }

    return sharedNodes;
  }

  /**
   * 估算并行路径数量（简化实现）
   */
  private estimateParallelPaths(graphData: RBDGraphData): number {
    const startNode = graphData.nodes.find(
      (n) => n.properties?.nodeType === 'start',
    );
    if (!startNode) return 0;

    const startOutDegree = graphData.edges.filter(
      (e) => e.sourceNodeId === startNode.id,
    ).length;
    return Math.max(1, startOutDegree);
  }
}
