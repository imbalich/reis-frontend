import type { RBDGraphData, RBDNode } from '../../types';
import type { RBDNodeCalculator } from '../calculators/NodeCalculator';

/**
 * Factoring算法分析器 - 使用Shannon分解处理复杂RBD拓扑
 *
 * 核心思想：
 * 1. 选择一个关键节点(pivotal node)
 * 2. 使用Shannon分解：R_system = P(K) × R_system|K工作 + P(K̄) × R_system|K失效
 * 3. 递归简化直到拓扑变为纯串联或并联
 * 4. 处理K/N表决节点和共享节点
 */
export class FactoringAnalyzer {
  private adjacencyList: Map<string, Set<string>>;
  private nodeCalculator: RBDNodeCalculator;
  private nodeMap: Map<string, RBDNode>;
  private reverseAdjacencyList: Map<string, Set<string>>;

  constructor(nodeCalculator: RBDNodeCalculator) {
    this.nodeCalculator = nodeCalculator;
    this.nodeMap = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjacencyList = new Map();
  }

  /**
   * 使用Factoring算法计算系统可靠度
   */
  public calculateReliability(graphData: RBDGraphData, time: number): number {
    this.buildGraphStructures(graphData);

    // 验证拓扑
    const validation = this.validateGraph();
    if (!validation.isValid) {
      throw new Error(`拓扑验证失败: ${validation.error}`);
    }

    // 找到开始和结束节点
    const startNode = this.findStartNode();
    const endNode = this.findEndNode();

    // 创建子图进行Factoring计算
    const subGraph = this.createSubGraph(startNode.id, endNode.id);

    return this.factoringDecomposition(subGraph, time);
  }

  /**
   * 构建图结构
   */
  private buildGraphStructures(graphData: RBDGraphData): void {
    // 构建节点映射
    this.nodeMap.clear();
    for (const node of graphData.nodes) {
      this.nodeMap.set(node.id, node);
    }

    // 构建邻接表
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();

    for (const edge of graphData.edges) {
      // 正向邻接表
      if (!this.adjacencyList.has(edge.sourceNodeId)) {
        this.adjacencyList.set(edge.sourceNodeId, new Set());
      }
      this.adjacencyList.get(edge.sourceNodeId)!.add(edge.targetNodeId);

      // 反向邻接表
      if (!this.reverseAdjacencyList.has(edge.targetNodeId)) {
        this.reverseAdjacencyList.set(edge.targetNodeId, new Set());
      }
      this.reverseAdjacencyList.get(edge.targetNodeId)!.add(edge.sourceNodeId);
    }
  }

  private calculateCombination(n: number, r: number): number {
    if (r > n || r < 0) return 0;
    if (r === 0 || r === n) return 1;

    let result = 1;
    for (let i = 1; i <= r; i++) {
      result *= (n - r + i) / i;
    }
    return result;
  }

  private calculateKNReliability(
    k: number,
    n: number,
    reliabilities: number[],
  ): number {
    // 使用二项分布计算K/N可靠度
    let knReliability = 0;

    for (let i = k; i <= n; i++) {
      const combination = this.calculateCombination(n, i);
      let probability = 0;

      // 计算恰好i个成功的概率（简化：假设所有路径可靠度相同）
      if (reliabilities.length > 0) {
        const avgReliability =
          reliabilities.reduce((sum, r) => sum + r, 0) / reliabilities.length;
        probability =
          combination * avgReliability ** i * (1 - avgReliability) ** (n - i);
      }

      knReliability += probability;
    }

    return knReliability;
  }

  /**
   * 创建子图
   */
  private createSubGraph(startNodeId: string, endNodeId: string): SubGraph {
    const nodes = new Set<string>();
    const edges = new Map<string, Set<string>>();

    // 使用BFS找到从start到end的所有可达节点
    const queue = [startNodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;

      visited.add(current);
      nodes.add(current);

      const successors = this.adjacencyList.get(current) || new Set();
      for (const successor of successors) {
        if (!visited.has(successor)) {
          queue.push(successor);
        }

        // 构建边
        if (!edges.has(current)) {
          edges.set(current, new Set());
        }
        edges.get(current)!.add(successor);
      }
    }

    return {
      nodes,
      edges,
      startNode: startNodeId,
      endNode: endNodeId,
    };
  }

  /**
   * Shannon分解的核心算法
   */
  private factoringDecomposition(subGraph: SubGraph, time: number): number {
    // 防护：避免无限递归
    if (subGraph.nodes.size === 0) {
      console.warn('⚠️ 子图为空，返回0');
      return 0;
    }

    // 终止条件1：单节点
    if (subGraph.nodes.size === 1) {
      const nodeId = [...subGraph.nodes][0];
      const node = this.nodeMap.get(nodeId);
      if (!node) {
        console.warn(`⚠️ 找不到节点 ${nodeId}`);
        return 0;
      }
      const result = this.nodeCalculator.calculateReliability(node, time);
      console.log(`📊 单节点计算: ${nodeId} = ${result}`);
      return result;
    }

    console.log(
      `🔄 Factoring分解: 节点数=${subGraph.nodes.size}, 边数=${subGraph.edges.size}`,
    );

    // 终止条件2：纯串联结构
    const seriesResult = this.trySeriesCalculation(subGraph, time);
    if (seriesResult !== null) {
      return seriesResult;
    }

    // 终止条件3：纯并联结构
    const parallelResult = this.tryParallelCalculation(subGraph, time);
    if (parallelResult !== null) {
      return parallelResult;
    }

    // 终止条件4：K/N表决结构
    const knResult = this.tryKNCalculation(subGraph, time);
    if (knResult !== null) {
      return knResult;
    }

    // 递归分解：选择关键节点
    const pivotalNode = this.selectPivotalNode(subGraph);
    if (!pivotalNode) {
      console.warn('⚠️ 无法选择关键节点，返回0');
      return 0;
    }

    const node = this.nodeMap.get(pivotalNode);
    if (!node) {
      console.warn(`⚠️ 找不到关键节点 ${pivotalNode}`);
      return 0;
    }

    // 特殊处理K/N节点：K/N节点本身可靠度为1，但会影响拓扑结构
    let nodeReliability: number;
    if (node.properties?.nodeType === 'kn') {
      nodeReliability = 1; // K/N节点是逻辑节点，可靠度为1
      console.log(`🔗 K/N节点 ${pivotalNode} 可靠度设为1`);
    } else {
      nodeReliability = this.nodeCalculator.calculateReliability(node, time);
      console.log(`🔗 节点 ${pivotalNode} 可靠度: ${nodeReliability}`);
    }

    // 创建两个子图：节点工作 vs 节点失效
    const workingGraph = this.shortCircuitNode(subGraph, pivotalNode);
    const failedGraph = this.removeNode(subGraph, pivotalNode);

    console.log(
      `🔄 分解节点 ${pivotalNode}: 工作图节点数=${workingGraph.nodes.size}, 失效图节点数=${failedGraph.nodes.size}`,
    );

    // 递归计算
    const workingReliability = this.factoringDecomposition(workingGraph, time);
    const failedReliability = this.factoringDecomposition(failedGraph, time);

    // Shannon分解公式
    const result =
      nodeReliability * workingReliability +
      (1 - nodeReliability) * failedReliability;
    console.log(
      `📊 Shannon分解结果: ${nodeReliability} × ${workingReliability} + ${1 - nodeReliability} × ${failedReliability} = ${result}`,
    );

    return result;
  }

  /**
   * 查找结束节点
   */
  private findEndNode(): RBDNode {
    const endNodes = [...this.nodeMap.values()].filter(
      (node) => node.properties?.nodeType === 'end',
    );
    if (endNodes.length === 0) {
      throw new Error('未找到结束节点');
    }
    return endNodes[0];
  }

  private findKNNode(subGraph: SubGraph): null | RBDNode {
    for (const nodeId of subGraph.nodes) {
      const node = this.nodeMap.get(nodeId);
      if (node && node.properties?.nodeType === 'kn') {
        return node;
      }
    }
    return null;
  }

  /**
   * 查找开始节点
   */
  private findStartNode(): RBDNode {
    const startNodes = [...this.nodeMap.values()].filter(
      (node) => node.properties?.nodeType === 'start',
    );
    if (startNodes.length === 0) {
      throw new Error('未找到开始节点');
    }
    return startNodes[0];
  }

  private getLinearPath(subGraph: SubGraph): string[] {
    // 实现获取线性路径的逻辑
    return []; // 简化实现
  }

  private getParallelPaths(subGraph: SubGraph): string[][] {
    // 实现获取并联路径的逻辑
    return []; // 简化实现
  }

  private getPathsToNode(subGraph: SubGraph, nodeId: string): string[][] {
    // 使用BFS找到所有到指定节点的路径
    const paths: string[][] = [];
    const queue: { current: string; path: string[] }[] = [];

    // 从开始节点开始搜索
    queue.push({ path: [subGraph.startNode], current: subGraph.startNode });

    while (queue.length > 0) {
      const { path, current } = queue.shift()!;

      // 如果到达目标节点，记录路径
      if (current === nodeId) {
        paths.push([...path]);
        continue;
      }

      // 避免循环
      if (path.length > subGraph.nodes.size) {
        continue;
      }

      // 获取当前节点的所有后继
      const successors = subGraph.edges.get(current) || new Set();
      for (const successor of successors) {
        if (!path.includes(successor)) {
          queue.push({
            path: [...path, successor],
            current: successor,
          });
        }
      }
    }

    console.log(`🔍 找到到节点 ${nodeId} 的路径:`, paths);
    return paths;
  }

  // 辅助方法实现...
  private isLinearSeries(subGraph: SubGraph): boolean {
    // 实现线性串联检测逻辑
    return false; // 简化实现
  }

  private isPureParallel(subGraph: SubGraph): boolean {
    // 实现纯并联检测逻辑
    return false; // 简化实现
  }

  /**
   * 移除节点（节点失效的情况）
   */
  private removeNode(subGraph: SubGraph, nodeId: string): SubGraph {
    const newGraph: SubGraph = {
      nodes: new Set(subGraph.nodes),
      edges: new Map(),
      startNode: subGraph.startNode === nodeId ? '' : subGraph.startNode,
      endNode: subGraph.endNode === nodeId ? '' : subGraph.endNode,
    };

    // 复制所有边，除了涉及该节点的边
    for (const [source, targets] of subGraph.edges) {
      if (source === nodeId) continue;

      const newTargets = new Set<string>();
      for (const target of targets) {
        if (target !== nodeId) {
          newTargets.add(target);
        }
      }

      if (newTargets.size > 0) {
        newGraph.edges.set(source, newTargets);
      }
    }

    // 移除该节点
    newGraph.nodes.delete(nodeId);

    return newGraph;
  }

  /**
   * 选择关键节点（pivotal node）
   * 策略：优先选择K/N节点，否则选择连接度最大的节点
   */
  private selectPivotalNode(subGraph: SubGraph): null | string {
    // 优先选择K/N节点
    const knNode = this.findKNNode(subGraph);
    if (knNode) {
      console.log(`🎯 选择K/N节点作为关键节点: ${knNode.id}`);
      return knNode.id;
    }

    // 否则选择连接度最大的节点
    let maxConnections = 0;
    let selectedNode: null | string = null;

    for (const nodeId of subGraph.nodes) {
      const node = this.nodeMap.get(nodeId);
      if (!node) continue;

      // 跳过控制节点
      if (
        node.properties?.nodeType === 'start' ||
        node.properties?.nodeType === 'end'
      ) {
        continue;
      }

      const connections =
        (this.adjacencyList.get(nodeId)?.size || 0) +
        (this.reverseAdjacencyList.get(nodeId)?.size || 0);

      if (connections > maxConnections) {
        maxConnections = connections;
        selectedNode = nodeId;
      }
    }

    console.log(`🎯 选择关键节点: ${selectedNode}, 连接度: ${maxConnections}`);
    return selectedNode;
  }

  /**
   * 短路节点（节点工作的情况）
   */
  private shortCircuitNode(subGraph: SubGraph, nodeId: string): SubGraph {
    const newGraph: SubGraph = {
      nodes: new Set(subGraph.nodes),
      edges: new Map(),
      startNode: subGraph.startNode,
      endNode: subGraph.endNode,
    };

    // 复制所有边，除了涉及该节点的边
    for (const [source, targets] of subGraph.edges) {
      const newTargets = new Set<string>();
      for (const target of targets) {
        if (source === nodeId || target === nodeId) {
          // 跳过涉及该节点的边
          continue;
        }
        newTargets.add(target);
      }
      if (newTargets.size > 0) {
        newGraph.edges.set(source, newTargets);
      }
    }

    // 如果节点是中间节点，需要连接其前驱和后继
    const predecessors = this.reverseAdjacencyList.get(nodeId) || new Set();
    const successors = this.adjacencyList.get(nodeId) || new Set();

    for (const pred of predecessors) {
      if (!newGraph.edges.has(pred)) {
        newGraph.edges.set(pred, new Set());
      }
      for (const succ of successors) {
        newGraph.edges.get(pred)!.add(succ);
      }
    }

    // 移除该节点
    newGraph.nodes.delete(nodeId);

    return newGraph;
  }

  /**
   * 尝试识别并计算K/N表决结构
   */
  private tryKNCalculation(subGraph: SubGraph, time: number): null | number {
    // 查找K/N节点
    const knNode = this.findKNNode(subGraph);
    if (!knNode) {
      return null;
    }

    // 获取K/N参数
    const knProps = knNode.properties as any;
    const k = knProps.k || 2;
    const n = knProps.n || 3;

    console.log(`🔍 处理K/N节点: ${knNode.id}, 参数: k=${k}, n=${n}`);

    // 获取输入路径（连接到K/N节点的路径）
    const inputPaths = this.getPathsToNode(subGraph, knNode.id);

    if (inputPaths.length !== n) {
      console.warn(`K/N节点期望${n}个输入，实际找到${inputPaths.length}个`);
      // 如果找不到足够的输入路径，跳过K/N计算，继续分解
      return null;
    }

    // 计算每条输入路径的可靠度
    const pathReliabilities: number[] = [];
    for (const path of inputPaths.slice(0, n)) {
      let pathReliability = 1;
      for (const nodeId of path) {
        const node = this.nodeMap.get(nodeId);
        if (!node) continue;

        const nodeReliability = this.nodeCalculator.calculateReliability(
          node,
          time,
        );
        pathReliability *= nodeReliability;
      }
      pathReliabilities.push(pathReliability);
    }

    // 计算K/N表决可靠度
    const knResult = this.calculateKNReliability(k, n, pathReliabilities);
    console.log(`✅ K/N计算完成: ${knResult}`);
    return knResult;
  }

  /**
   * 尝试识别并计算纯并联结构
   */
  private tryParallelCalculation(
    subGraph: SubGraph,
    time: number,
  ): null | number {
    // 检查是否为纯并联
    if (!this.isPureParallel(subGraph)) {
      return null;
    }

    // 获取所有并联路径
    const parallelPaths = this.getParallelPaths(subGraph);
    if (parallelPaths.length === 0) {
      return 0;
    }

    // 计算每条路径的可靠度
    const pathReliabilities: number[] = [];
    for (const path of parallelPaths) {
      let pathReliability = 1;
      for (const nodeId of path) {
        const node = this.nodeMap.get(nodeId);
        if (!node) continue;

        const nodeReliability = this.nodeCalculator.calculateReliability(
          node,
          time,
        );
        pathReliability *= nodeReliability;
      }
      pathReliabilities.push(pathReliability);
    }

    // 并联公式：至少一条路径工作
    let parallelReliability = 1;
    for (const pathRel of pathReliabilities) {
      parallelReliability *= 1 - pathRel;
    }
    return 1 - parallelReliability;
  }

  /**
   * 尝试识别并计算纯串联结构
   */
  private trySeriesCalculation(
    subGraph: SubGraph,
    time: number,
  ): null | number {
    // 检查是否为线性串联
    if (!this.isLinearSeries(subGraph)) {
      return null;
    }

    // 计算串联可靠度
    let seriesReliability = 1;
    const path = this.getLinearPath(subGraph);

    for (const nodeId of path) {
      const node = this.nodeMap.get(nodeId);
      if (!node) continue;

      const nodeReliability = this.nodeCalculator.calculateReliability(
        node,
        time,
      );
      seriesReliability *= nodeReliability;
    }

    return seriesReliability;
  }

  /**
   * 验证图结构
   */
  private validateGraph(): { error?: string; isValid: boolean } {
    const startNodes = [...this.nodeMap.values()].filter(
      (node) => node.properties?.nodeType === 'start',
    );
    const endNodes = [...this.nodeMap.values()].filter(
      (node) => node.properties?.nodeType === 'end',
    );

    if (startNodes.length !== 1) {
      return { isValid: false, error: '必须有且仅有一个开始节点' };
    }

    if (endNodes.length !== 1) {
      return { isValid: false, error: '必须有且仅有一个结束节点' };
    }

    return { isValid: true };
  }
}

/**
 * 子图数据结构
 */
interface SubGraph {
  nodes: Set<string>;
  edges: Map<string, Set<string>>;
  startNode: string;
  endNode: string;
}
