import type { RBDGraphData, RBDNode } from '../../types';
import type { RBDNodeCalculator } from '../calculators/NodeCalculator';

/**
 * 简化版Factoring算法
 * 专门处理包含K/N节点的复杂拓扑
 */
export class SimpleFactoringAnalyzer {
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
   * 使用简化Factoring算法计算系统可靠度
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

    console.log(`🚀 开始简化Factoring计算: ${startNode.id} -> ${endNode.id}`);

    // 使用简化的分解策略
    return this.simpleFactoring(startNode.id, endNode.id, time);
  }

  /**
   * 分析分支结构（支持多层共同前缀）
   */
  private analyzeBranchStructure(
    paths: string[][],
    commonPrefix: string[],
    time: number,
  ): number[] {
    console.log(`\n🔍 === 开始分析分支结构 ===`);

    // 移除共同前缀，得到分支路径
    const branchPaths = paths
      .map((path) => path.filter((nodeId) => !commonPrefix.includes(nodeId)))
      .filter((path) => path.length > 0);

    console.log(`📊 移除共同前缀后的分支路径数量: ${branchPaths.length}`);
    for (const [i, branchPath] of branchPaths.entries()) {
      console.log(`  分支${i + 1}: [${branchPath?.join('->')}]`);
    }

    if (branchPaths.length === 0) {
      console.log(`⚠️ 没有找到有效的分支路径`);
      return [];
    }

    // 检查是否还有嵌套的共同前缀
    const nestedCommonPrefix = this.findCommonPrefix(branchPaths);
    if (nestedCommonPrefix.length > 0) {
      console.log(`🔍 发现嵌套共同前缀: [${nestedCommonPrefix.join('->')}]`);

      // 计算嵌套共同前缀的可靠度
      let nestedPrefixReliability = 1;
      for (const nodeId of nestedCommonPrefix) {
        const node = this.nodeMap.get(nodeId);
        if (!node) continue;

        const nodeReliability =
          this.nodeCalculator.calculateNodeReliabilityWithCount(node, time);
        nestedPrefixReliability *= nodeReliability;
        console.log(`📊 嵌套前缀节点 ${nodeId} 可靠度: ${nodeReliability}`);
      }
      console.log(`📊 嵌套共同前缀可靠度: ${nestedPrefixReliability}`);

      // 递归分析更深层的分支
      const deeperBranches = branchPaths
        .map((path) =>
          path.filter((nodeId) => !nestedCommonPrefix.includes(nodeId)),
        )
        .filter((path) => path.length > 0);

      const deeperBranchReliabilities: number[] = [];
      for (const [i, branchPath] of deeperBranches.entries()) {
        if (!branchPath) continue;

        const branchReliability = this.calculatePathReliability(
          branchPath,
          time,
        );
        deeperBranchReliabilities.push(branchReliability);
        console.log(
          `📊 深层分支${i + 1}可靠度: [${branchPath.join('->')}] = ${branchReliability}`,
        );
      }

      // 返回：嵌套前缀可靠度 × 深层分支可靠度
      return deeperBranchReliabilities.map(
        (reliability) => nestedPrefixReliability * reliability,
      );
    } else {
      // 没有嵌套共同前缀，直接计算各分支的可靠度
      const branchReliabilities: number[] = [];
      for (const [i, branchPath] of branchPaths.entries()) {
        if (!branchPath) continue;

        const branchReliability = this.calculatePathReliability(
          branchPath,
          time,
        );
        branchReliabilities.push(branchReliability);
        console.log(
          `📊 分支${i + 1}可靠度: [${branchPath.join('->')}] = ${branchReliability}`,
        );
      }

      return branchReliabilities;
    }
  }

  /**
   * 构建图结构
   */
  private buildGraphStructures(graphData: RBDGraphData): void {
    this.nodeMap.clear();
    for (const node of graphData.nodes) {
      this.nodeMap.set(node.id, node);
    }

    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();

    for (const edge of graphData.edges) {
      if (!this.adjacencyList.has(edge.sourceNodeId)) {
        this.adjacencyList.set(edge.sourceNodeId, new Set());
      }
      this.adjacencyList.get(edge.sourceNodeId)!.add(edge.targetNodeId);

      if (!this.reverseAdjacencyList.has(edge.targetNodeId)) {
        this.reverseAdjacencyList.set(edge.targetNodeId, new Set());
      }
      this.reverseAdjacencyList.get(edge.targetNodeId)!.add(edge.sourceNodeId);
    }
  }

  /**
   * 计算组合数
   */
  private calculateCombination(n: number, r: number): number {
    if (r > n || r < 0) return 0;
    if (r === 0 || r === n) return 1;

    let result = 1;
    for (let i = 1; i <= r; i++) {
      result *= (n - r + i) / i;
    }
    return result;
  }

  /**
   * 计算下游可靠度
   */
  private calculateDownstreamReliability(
    knNode: RBDNode,
    endNodeId: string,
    time: number,
  ): number {
    // 找到从K/N节点到结束节点的路径
    const knOutgoingEdges =
      this.adjacencyList.get(knNode.id) || new Set<string>();
    console.log(`🔍 K/N节点 ${knNode.id} 的出边:`, {
      出边数量: knOutgoingEdges.size,
      目标节点: [...knOutgoingEdges],
    });

    const pathsFromKN = this.findAllPaths(knNode.id, endNodeId);
    console.log(`📊 找到 ${pathsFromKN.length} 条从K/N节点的路径`);

    if (pathsFromKN.length === 0) {
      console.warn('⚠️ 没有找到从K/N节点的路径，返回0');
      return 0;
    }

    // 计算从K/N节点到结束的路径可靠度
    const downstreamReliabilities: number[] = [];
    console.log(`\n🔍 === 开始计算下游路径 ===`);
    for (let i = 0; i < pathsFromKN.length; i++) {
      const path = pathsFromKN[i];
      if (!path) continue;

      console.log(`\n📍 下游路径${i + 1}/${pathsFromKN.length}:`, path);
      const pathReliability = this.calculatePathReliability(path, time);
      downstreamReliabilities.push(pathReliability);
      console.log(
        `📊 下游路径${i + 1}可靠度: [${path.join('->')}] = ${pathReliability}`,
      );
    }
    console.log(`\n🔍 === 下游路径计算完成，准备并联 ===\n`);

    // 并联下游路径
    const downstreamReliability = this.calculateParallelReliability(
      downstreamReliabilities,
    );
    console.log(`📊 下游并联可靠度: ${downstreamReliability}`);

    return downstreamReliability;
  }

  /**
   * 计算K/N可靠度
   */
  private calculateKNReliability(
    k: number,
    n: number,
    reliabilities: number[],
  ): number {
    if (k > n || k <= 0) return 0;
    if (k === n) {
      // 所有都必须工作
      return reliabilities.reduce((prod, rel) => prod * rel, 1);
    }

    // 使用二项分布
    let knReliability = 0;
    for (let i = k; i <= n; i++) {
      const combination = this.calculateCombination(n, i);
      const avgReliability =
        reliabilities.reduce((sum, r) => sum + r, 0) / reliabilities.length;
      const probability =
        combination * avgReliability ** i * (1 - avgReliability) ** (n - i);
      knReliability += probability;
    }

    return knReliability;
  }

  /**
   * 计算并联可靠度
   */
  private calculateParallelReliability(reliabilities: number[]): number {
    if (reliabilities.length === 0) return 0;
    if (reliabilities.length === 1) return reliabilities[0] || 0;

    console.log(`🔧 计算并联可靠度:`, {
      路径数量: reliabilities.length,
      各路径可靠度: reliabilities,
    });

    // 并联公式：R_parallel = 1 - ∏(1 - R_i)
    // 至少一条路径工作即可
    let failureProbability = 1; // 所有路径都失败的概率
    const failureDetails: any[] = [];

    for (const [i, rel] of reliabilities.entries()) {
      if (rel === undefined) continue;

      const pathFailure = 1 - rel;
      failureDetails.push({
        路径: i + 1,
        可靠度: rel,
        失败概率: pathFailure,
      });
      console.log(`  路径${i + 1} 失败概率: 1 - ${rel} = ${pathFailure}`);
      failureProbability *= pathFailure;
    }

    const parallelReliability = 1 - failureProbability;

    console.log(`🔧 并联公式详细计算:`, {
      步骤1_各路径失败概率: failureDetails,
      步骤2_所有路径都失败的概率: `∏(失败概率) = ${failureProbability}`,
      步骤3_系统可靠度: `1 - ${failureProbability} = ${parallelReliability}`,
    });

    // 手动验证计算
    if (reliabilities.length === 2) {
      const manualCheck = 1 - (1 - reliabilities[0]!) * (1 - reliabilities[1]!);
      console.log(
        `✅ 手动验证（2路径）: 1 - (1-${reliabilities[0]}) × (1-${reliabilities[1]}) = ${manualCheck}`,
      );
      console.log(
        `   计算一致性检查: ${Math.abs(manualCheck - parallelReliability) < 0.0001 ? '✅ 一致' : '❌ 不一致'}`,
      );
    }

    return parallelReliability;
  }

  /**
   * 计算路径可靠度
   */
  private calculatePathReliability(path: string[], time: number): number {
    let reliability = 1;

    for (const nodeId of path) {
      const node = this.nodeMap.get(nodeId);
      if (!node) {
        console.warn(`⚠️ 找不到节点: ${nodeId}`);
        continue;
      }

      // 跳过控制节点
      if (
        node.properties?.nodeType === 'start' ||
        node.properties?.nodeType === 'end'
      ) {
        continue;
      }

      // 跳过K/N节点（单独处理）
      if (node.properties?.nodeType === 'kn') {
        continue;
      }

      console.log(
        `🔍 计算节点 ${nodeId} (${node.properties?.nodeType}) 在时间 ${time} 的可靠度:`,
        {
          节点属性: node.properties,
          分布参数: (node.properties as any)?.distribution,
          k_n参数:
            node.properties?.nodeType === 'parallel'
              ? {
                  k: (node.properties as any)?.k,
                  n: (node.properties as any)?.n,
                }
              : undefined,
        },
      );

      try {
        // 🔧 重要：使用 calculateNodeReliabilityWithCount 来处理冗余系统
        // - 串联节点：考虑 componentCount
        // - 并联节点：考虑 k/n 冗余（k-out-of-n 系统）
        const nodeReliability =
          this.nodeCalculator.calculateNodeReliabilityWithCount(node, time);
        console.log(
          `📊 节点 ${nodeId} 可靠度: ${nodeReliability}`,
          node.properties?.nodeType === 'parallel'
            ? `(k=${(node.properties as any)?.k}/n=${(node.properties as any)?.n} 冗余系统)`
            : '',
        );
        reliability *= nodeReliability;
      } catch (error) {
        console.error(`❌ 计算节点 ${nodeId} 可靠度失败:`, error);
        return 0;
      }
    }

    console.log(`📊 路径 [${path.join('->')}] 总可靠度: ${reliability}`);
    return reliability;
  }

  /**
   * 简单的路径计算（无K/N节点）
   */
  private calculateSimplePath(
    startNodeId: string,
    endNodeId: string,
    time: number,
  ): number {
    const paths = this.findAllPaths(startNodeId, endNodeId);
    console.log(`📊 简单路径计算: 找到 ${paths.length} 条路径`);

    if (paths.length === 0) {
      console.warn('⚠️ 没有找到路径，返回0');
      return 0;
    }

    const pathReliabilities: number[] = [];
    for (const path of paths) {
      const pathReliability = this.calculatePathReliability(path, time);
      pathReliabilities.push(pathReliability);
      console.log(`📊 路径可靠度: [${path.join('->')}] = ${pathReliability}`);
    }

    return this.calculateParallelReliability(pathReliabilities);
  }

  /**
   * 基于K/N节点的分解
   */
  private factorWithKNNode(
    knNode: RBDNode,
    startNodeId: string,
    endNodeId: string,
    time: number,
  ): number {
    const knProps = knNode.properties as any;
    const k = knProps.k || 2;
    const n = knProps.n || 3;

    console.log(`🔍 处理K/N节点: ${knNode.id}, k=${k}, n=${n}`);

    // 第一步：分析到K/N节点的路径结构
    const pathsToKN = this.findAllPaths(startNodeId, knNode.id);
    console.log(`📊 找到 ${pathsToKN.length} 条到K/N节点的路径`);

    if (pathsToKN.length === 0) {
      console.warn('⚠️ 没有找到到K/N节点的路径，返回0');
      return 0;
    }

    // 第二步：识别共同前缀（串联部分）
    const commonPrefix = this.findCommonPrefix(pathsToKN);
    console.log(`📊 共同前缀: [${commonPrefix.join('->')}]`);

    // 第三步：计算共同前缀的可靠度
    let prefixReliability = 1;
    if (commonPrefix.length > 0) {
      for (const nodeId of commonPrefix) {
        const node = this.nodeMap.get(nodeId);
        if (!node) continue;

        const nodeReliability =
          this.nodeCalculator.calculateNodeReliabilityWithCount(node, time);
        prefixReliability *= nodeReliability;
        console.log(`📊 前缀节点 ${nodeId} 可靠度: ${nodeReliability}`);
      }
    }
    console.log(`📊 共同前缀可靠度: ${prefixReliability}`);

    // 第四步：分析分支结构（支持多层共同前缀）
    const branchReliabilities = this.analyzeBranchStructure(
      pathsToKN,
      commonPrefix,
      time,
    );
    console.log(`📊 分支可靠度分析完成，共${branchReliabilities.length}个分支`);

    // 第五步：计算K/N表决可靠度
    const knReliability = this.calculateKNReliability(
      k,
      Math.min(n, branchReliabilities.length),
      branchReliabilities,
    );
    console.log(`📊 K/N表决可靠度: ${knReliability}`);

    // 第六步：计算下游可靠度
    const downstreamReliability = this.calculateDownstreamReliability(
      knNode,
      endNodeId,
      time,
    );
    console.log(`📊 下游可靠度: ${downstreamReliability}`);

    // 第七步：最终结果 = 共同前缀 × K/N表决 × 下游
    const finalResult =
      prefixReliability * knReliability * downstreamReliability;
    console.log(
      `✅ 最终结果: ${prefixReliability} × ${knReliability} × ${downstreamReliability} = ${finalResult}`,
    );

    return finalResult;
  }

  /**
   * 使用BFS找到所有路径
   */
  private findAllPaths(startId: string, endId: string): string[][] {
    const paths: string[][] = [];
    const queue: { current: string; path: string[] }[] = [];

    queue.push({ path: [startId], current: startId });

    while (queue.length > 0) {
      const { path, current } = queue.shift()!;

      if (current === endId) {
        paths.push([...path]);
        continue;
      }

      // 避免循环
      if (path.length > this.nodeMap.size) {
        continue;
      }

      const successors = this.adjacencyList.get(current) || new Set();
      for (const successor of successors) {
        if (!path.includes(successor)) {
          queue.push({
            path: [...path, successor],
            current: successor,
          });
        }
      }
    }

    return paths;
  }

  /**
   * 查找路径的共同前缀
   */
  private findCommonPrefix(paths: string[][]): string[] {
    if (paths.length <= 1) return [];

    const firstPath = paths[0];
    if (!firstPath || firstPath.length === 0) return [];

    const commonPrefix: string[] = [];

    for (const [i, nodeAtPosition] of firstPath.entries()) {
      if (!nodeAtPosition) continue;

      const isCommon = paths.every((path) => path[i] === nodeAtPosition);
      if (isCommon) {
        commonPrefix.push(nodeAtPosition);
      } else {
        break;
      }
    }

    // 过滤掉起始节点
    return commonPrefix.filter((nodeId) => {
      const node = this.nodeMap.get(nodeId);
      return node && node.properties?.nodeType !== 'start';
    });
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
    const endNode = endNodes[0];
    if (!endNode) {
      throw new Error('结束节点无效');
    }
    return endNode;
  }

  /**
   * 查找所有K/N节点
   */
  private findKNNodes(): RBDNode[] {
    return [...this.nodeMap.values()].filter(
      (node) => node.properties?.nodeType === 'kn',
    );
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
    const startNode = startNodes[0];
    if (!startNode) {
      throw new Error('开始节点无效');
    }
    return startNode;
  }

  /**
   * 简化的Factoring算法
   * 策略：直接处理K/N节点，然后处理其他节点
   */
  private simpleFactoring(
    startNodeId: string,
    endNodeId: string,
    time: number,
  ): number {
    // 第一步：处理K/N节点
    const knNodes = this.findKNNodes();
    if (knNodes.length > 0) {
      console.log(`🔍 发现 ${knNodes.length} 个K/N节点`);

      // 选择第一个K/N节点进行处理
      const knNode = knNodes[0];
      if (!knNode) {
        throw new Error('未找到有效的K/N节点');
      }
      return this.factorWithKNNode(knNode, startNodeId, endNodeId, time);
    }

    // 第二步：如果没有K/N节点，使用简单的路径计算
    return this.calculateSimplePath(startNodeId, endNodeId, time);
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
