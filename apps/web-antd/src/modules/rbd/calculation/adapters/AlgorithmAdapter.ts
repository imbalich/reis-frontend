import type { RBDNode } from '../../types';
import type { AlgorithmAdapter } from '../types';

import DistributionFactory from '#/custom/weibull/factories/distrbution-fact';

export class RBDAlgorithmAdapter implements AlgorithmAdapter {
  /**
   * 计算节点可靠度
   */
  public calculateNodeReliability(node: RBDNode, time: number): number {
    console.log(`🔍 AlgorithmAdapter计算节点 ${node.id} 可靠度:`, {
      节点类型: node.properties?.nodeType,
      节点属性: node.properties,
      时间: time,
    });

    if (!this.validateNodeParameters(node)) {
      console.error(`❌ 节点 ${node.id} 参数验证失败`);
      throw new Error(`节点 ${node.id} 参数验证失败`);
    }

    const { nodeType } = node.properties!;

    // 控制节点的可靠度为1
    if (nodeType === 'start' || nodeType === 'end') {
      console.log(`✅ 控制节点 ${node.id} 可靠度: 1`);
      return 1;
    }

    // K/N节点是逻辑节点，由NodeCalculator处理其子节点的组合可靠度
    // 这里不应该直接计算，应该抛出错误或返回1（表示逻辑节点本身不影响可靠度）
    if (nodeType === 'kn') {
      console.log(`⚠️ K/N节点 ${node.id} 应由NodeCalculator处理，这里返回1`);
      return 1;
    }

    // 获取分布策略
    const strategy = this.createDistributionStrategy(node);

    if (!strategy) {
      console.error(`❌ 无法为节点 ${node.id} 创建分布策略`);
      throw new Error(`无法为节点 ${node.id} 创建分布策略`);
    }

    try {
      // 使用生存函数计算可靠度 R(t) = SF(t)
      console.log(`🧮 调用calculateSF:`, {
        节点: node.id,
        时间: time,
        策略参数: (strategy as any).getParams(),
      });
      const reliability = strategy.calculateSF(time);
      console.log(
        `✅ 节点 ${node.id} 可靠度计算结果: ${reliability} (时间=${time})`,
      );

      // 额外验证：手动计算指数分布的可靠度来对比
      const params = (strategy as any).getParams();
      if (params.lambda_) {
        const manualReliability = Math.exp(-params.lambda_ * time);
        console.log(`🔬 手动计算验证 (R(t) = e^(-λt)):`, {
          lambda: params.lambda_,
          time,
          'e^(-λt)': manualReliability,
          策略计算结果: reliability,
          是否一致: Math.abs(manualReliability - reliability) < 0.0001,
        });
      }

      return reliability;
    } catch (error) {
      console.error(`❌ 计算节点 ${node.id} 可靠度失败:`, error);
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

    console.log(`📦 为节点 ${node.id} 创建分布策略:`, distributionParams);

    try {
      const strategy = DistributionFactory.createStrategy(distributionParams);
      console.log(`✅ 分布策略创建成功，参数:`, (strategy as any).getParams());
      return strategy;
    } catch (error) {
      console.error(`❌ 创建分布策略失败:`, error);
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

    // K/N节点是逻辑节点，不需要分布参数
    if (nodeType === 'kn') {
      console.log(`✅ K/N节点 ${node.id} 参数验证通过（逻辑节点）`);
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
      console.error(`❌ 节点 ${node.id} 缺少属性`);
      return null;
    }

    const { nodeType } = node.properties;
    console.log(
      `🔍 提取节点 ${node.id} (${nodeType}) 的分布参数:`,
      node.properties,
    );

    // 串联节点
    if (nodeType === 'series') {
      const seriesProps = node.properties as any;
      const distribution = seriesProps.distribution;

      console.log(`📊 串联节点 ${node.id} 分布参数:`, distribution);

      if (!distribution || distribution.type !== 'exponential') {
        console.error(`❌ 串联节点 ${node.id} 分布参数无效:`, distribution);
        return null;
      }

      // 🔄 单位转换：FPMH (Failures Per Million Hours) → 每小时故障率
      // λ_hourly = λ_FPMH / 1,000,000
      const lambdaFPMH = distribution.lambda || 0;
      const lambdaHourly = lambdaFPMH / 1_000_000;

      const params = {
        distribution: 'Exponential_1P',
        lambda_: lambdaHourly,
      };
      console.log(`✅ 串联节点 ${node.id} 提取的参数:`, {
        原始FPMH: lambdaFPMH,
        转换后每小时故障率: lambdaHourly,
        分布类型: params.distribution,
      });
      return params;
    }

    // 并联节点
    if (nodeType === 'parallel') {
      const parallelProps = node.properties as any;
      const distribution = parallelProps.distribution;

      console.log(`📊 并联节点 ${node.id} 分布参数:`, distribution);

      if (!distribution || distribution.type !== 'exponential') {
        console.error(`❌ 并联节点 ${node.id} 分布参数无效:`, distribution);
        return null;
      }

      // 🔄 单位转换：FPMH (Failures Per Million Hours) → 每小时故障率
      // λ_hourly = λ_FPMH / 1,000,000
      const lambdaFPMH = distribution.lambda || 0;
      const lambdaHourly = lambdaFPMH / 1_000_000;

      const params = {
        distribution: 'Exponential_1P',
        lambda_: lambdaHourly,
      };
      console.log(`✅ 并联节点 ${node.id} 提取的参数:`, {
        原始FPMH: lambdaFPMH,
        转换后每小时故障率: lambdaHourly,
        分布类型: params.distribution,
      });
      return params;
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
