import type { RBDNode } from '../../types';
import type { NodeCalculator } from '../types';

import { RBDAlgorithmAdapter } from '../adapters/AlgorithmAdapter';

export class RBDNodeCalculator implements NodeCalculator {
  private algorithmAdapter: RBDAlgorithmAdapter;

  constructor() {
    this.algorithmAdapter = new RBDAlgorithmAdapter();
  }

  /**
   * 计算k/n系统可靠度
   * R_k_n = Σ(C(n,i) * R^i * (1-R)^(n-i)) for i from k to n
   */
  public calculateKNReliability(
    k: number,
    n: number,
    reliability: number,
  ): number {
    if (k > n || k < 0 || n < 0) {
      throw new Error(`无效的k/n参数: k=${k}, n=${n}`);
    }

    if (k === 0) {
      return 1;
    }

    if (k === n) {
      return reliability ** n;
    }

    let knReliability = 0;

    // 计算从k到n的组合概率
    for (let i = k; i <= n; i++) {
      const combination = this.calculateCombination(n, i);
      const probability =
        combination * reliability ** i * (1 - reliability) ** (n - i);
      knReliability += probability;
    }

    return knReliability;
  }

  /**
   * 计算考虑组件数量的节点可靠度
   * 对于串联节点，需要考虑组件数量
   */
  public calculateNodeReliabilityWithCount(
    node: RBDNode,
    time: number,
  ): number {
    const { nodeType } = node.properties!;

    // 控制节点
    if (nodeType === 'start' || nodeType === 'end') {
      return 1;
    }

    // 串联节点：考虑组件数量
    if (nodeType === 'series') {
      const seriesProps = node.properties as any;
      const componentCount = seriesProps.componentCount || 1;

      // 单个组件的可靠度
      const singleComponentReliability = this.calculateReliability(node, time);

      // 多个相同组件串联：R_total = R_component^count
      return singleComponentReliability ** componentCount;
    }

    // 并联节点：考虑k/n参数
    if (nodeType === 'parallel') {
      const parallelProps = node.properties as any;
      const k = parallelProps.k || 1;
      const n = parallelProps.n || 1;

      // 单个组件的可靠度
      const singleComponentReliability = this.calculateReliability(node, time);

      // k/n系统
      return this.calculateKNReliability(k, n, singleComponentReliability);
    }

    // k/n节点：逻辑节点，不需要计算
    if (nodeType === 'kn') {
      return 1;
    }

    // 默认情况
    return this.calculateReliability(node, time);
  }

  /**
   * 计算并联系统可靠度
   * 当k=n时：R_parallel(t) = 1 - ∏(1-R_i(t))
   * 当k<n时：使用k/n系统计算
   */
  public calculateParallelReliability(
    nodes: RBDNode[],
    k: number,
    n: number,
    time: number,
  ): number {
    if (nodes.length === 0) {
      return 0;
    }

    if (nodes.length === 1) {
      return this.calculateReliability(nodes[0], time);
    }

    // 如果k=n，使用标准并联公式
    if (k === n) {
      return this.calculateStandardParallelReliability(nodes, time);
    }

    // 如果k<n，使用k/n系统计算
    return this.calculateKNReliability(
      k,
      n,
      this.calculateStandardParallelReliability(nodes, time),
    );
  }

  /**
   * 计算单个节点的可靠度
   */
  public calculateReliability(node: RBDNode, time: number): number {
    return this.algorithmAdapter.calculateNodeReliability(node, time);
  }

  /**
   * 计算串联系统可靠度
   * R_series(t) = ∏(R_i(t))
   */
  public calculateSeriesReliability(nodes: RBDNode[], time: number): number {
    if (nodes.length === 0) {
      return 1;
    }

    if (nodes.length === 1) {
      return this.calculateReliability(nodes[0], time);
    }

    // 串联系统：所有组件可靠度相乘
    let seriesReliability = 1;

    for (const node of nodes) {
      const nodeReliability = this.calculateReliability(node, time);
      seriesReliability *= nodeReliability;
    }

    return seriesReliability;
  }

  /**
   * 获取节点类型
   */
  public getNodeType(node: RBDNode): string {
    return node.properties?.nodeType || 'unknown';
  }

  /**
   * 检查是否为控制节点
   */
  public isControlNode(node: RBDNode): boolean {
    const nodeType = this.getNodeType(node);
    return nodeType === 'start' || nodeType === 'end';
  }

  /**
   * 检查是否为逻辑节点
   */
  public isLogicNode(node: RBDNode): boolean {
    const nodeType = this.getNodeType(node);
    return nodeType === 'kn';
  }

  /**
   * 验证节点参数
   */
  public validateNode(node: RBDNode): boolean {
    return this.algorithmAdapter.validateNodeParameters(node);
  }

  /**
   * 计算组合数 C(n,r)
   */
  private calculateCombination(n: number, r: number): number {
    if (r > n || r < 0) {
      return 0;
    }

    if (r === 0 || r === n) {
      return 1;
    }

    // 使用更稳定的计算方法避免数值溢出
    let result = 1;

    // 计算 C(n,r) = n! / (r! * (n-r)!)
    // 使用对数避免大数计算
    for (let i = 1; i <= r; i++) {
      result *= (n - r + i) / i;
    }

    return result;
  }

  /**
   * 计算标准并联系统可靠度
   * R_parallel(t) = 1 - ∏(1-R_i(t))
   */
  private calculateStandardParallelReliability(
    nodes: RBDNode[],
    time: number,
  ): number {
    let parallelReliability = 1;

    for (const node of nodes) {
      const nodeReliability = this.calculateReliability(node, time);
      parallelReliability *= 1 - nodeReliability;
    }

    return 1 - parallelReliability;
  }
}
