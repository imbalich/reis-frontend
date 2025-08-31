import type { RBDNode } from '../../types';
import type { AlgorithmAdapter } from '../types';

import DistributionFactory from '#/custom/weibull/factories/distrbution-fact';

export class RBDAlgorithmAdapter implements AlgorithmAdapter {
  /**
   * 计算节点可靠度
   */
  public calculateNodeReliability(node: RBDNode, time: number): number {
    if (!this.validateNodeParameters(node)) {
      throw new Error(`节点 ${node.id} 参数验证失败`);
    }

    const { nodeType } = node.properties!;

    // 控制节点的可靠度为1
    if (nodeType === 'start' || nodeType === 'end') {
      return 1;
    }

    // 获取分布策略
    const strategy = this.createDistributionStrategy(node);

    if (!strategy) {
      throw new Error(`无法为节点 ${node.id} 创建分布策略`);
    }

    try {
      // 使用生存函数计算可靠度 R(t) = SF(t)
      return strategy.calculateSF(time);
    } catch (error) {
      throw new Error(`计算节点可靠度失败: ${error}`);
    }
  }

  /**
   * 创建分布策略实例
   */
  public createDistributionStrategy(node: RBDNode): any {
    if (!node.properties) {
      throw new Error(`节点 ${node.id} 缺少属性定义`);
    }

    const { nodeType } = node.properties;

    // 控制节点不需要分布策略
    if (nodeType === 'start' || nodeType === 'end') {
      return null;
    }

    // 获取分布参数
    const distributionParams = this.extractDistributionParameters(node);

    if (!distributionParams) {
      throw new Error(`节点 ${node.id} 缺少有效的分布参数`);
    }

    try {
      return DistributionFactory.createStrategy(distributionParams);
    } catch (error) {
      throw new Error(`创建分布策略失败: ${error}`);
    }
  }

  /**
   * 获取支持的分布类型
   */
  public getSupportedDistributions(): string[] {
    return [
      'Exponential_1P',
      'Exponential_2P',
      'Weibull_2P',
      'Weibull_3P',
      'Normal_2P',
      'Lognormal_2P',
    ];
  }

  /**
   * 检查分布类型是否支持
   */
  public isDistributionSupported(distributionType: string): boolean {
    return this.getSupportedDistributions().includes(distributionType);
  }

  /**
   * 验证节点参数
   */
  public validateNodeParameters(node: RBDNode): boolean {
    if (!node.properties) {
      return false;
    }

    const { nodeType } = node.properties;

    // 控制节点不需要验证分布参数
    if (nodeType === 'start' || nodeType === 'end') {
      return true;
    }

    // 检查分布参数
    const distributionParams = this.extractDistributionParameters(node);
    if (!distributionParams) {
      return false;
    }

    // 验证必要参数
    return this.validateDistributionParameters(distributionParams);
  }

  /**
   * 提取分布参数
   */
  private extractDistributionParameters(node: RBDNode): any {
    if (!node.properties) {
      return null;
    }

    const { nodeType } = node.properties;

    // 串联节点
    if (nodeType === 'series') {
      const seriesProps = node.properties as any;
      const distribution = seriesProps.distribution;

      if (!distribution || distribution.type !== 'exponential') {
        return null;
      }

      return {
        distribution: 'Exponential_1P',
        lambda_: distribution.lambda || 0,
      };
    }

    // 并联节点
    if (nodeType === 'parallel') {
      const parallelProps = node.properties as any;
      const distribution = parallelProps.distribution;

      if (!distribution || distribution.type !== 'exponential') {
        return null;
      }

      return {
        distribution: 'Exponential_1P',
        lambda_: distribution.lambda || 0,
      };
    }

    // k/n节点（逻辑节点，不需要分布参数）
    if (nodeType === 'kn') {
      return null;
    }

    return null;
  }

  /**
   * 验证分布参数
   */
  private validateDistributionParameters(params: any): boolean {
    if (!params.distribution) {
      return false;
    }

    switch (params.distribution) {
      case 'Exponential_1P': {
        return typeof params.lambda_ === 'number' && params.lambda_ > 0;
      }

      case 'Exponential_2P': {
        return (
          typeof params.lambda_ === 'number' &&
          params.lambda_ > 0 &&
          typeof params.gamma === 'number' &&
          params.gamma >= 0
        );
      }

      case 'Lognormal_2P': {
        return (
          typeof params.mu === 'number' &&
          typeof params.sigma === 'number' &&
          params.sigma > 0
        );
      }

      case 'Normal_2P': {
        return (
          typeof params.mu === 'number' &&
          typeof params.sigma === 'number' &&
          params.sigma > 0
        );
      }

      case 'Weibull_2P': {
        return (
          typeof params.alpha === 'number' &&
          params.alpha > 0 &&
          typeof params.beta === 'number' &&
          params.beta > 0
        );
      }

      case 'Weibull_3P': {
        return (
          typeof params.alpha === 'number' &&
          params.alpha > 0 &&
          typeof params.beta === 'number' &&
          params.beta > 0 &&
          typeof params.gamma === 'number' &&
          params.gamma >= 0
        );
      }

      default: {
        return false;
      }
    }
  }
}
