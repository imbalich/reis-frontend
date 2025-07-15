// 分布函数中均有mu和sigma基本类，包括Normal，Lognormal，Gumbel
import type { DistributionStrategy } from '../types';

export default abstract class baseMS implements DistributionStrategy {
  protected mu: number;

  protected sigma: number;

  constructor(mu: number, sigma: number) {
    baseMS.validatePositive(mu, sigma);
    this.mu = mu;
    this.sigma = sigma;
  }

  // 误差函数（erf）的近似实现
  protected static erf(x: number): number {
    const a1 = 0.254_829_592;
    const a2 = -0.284_496_736;
    const a3 = 1.421_413_741;
    const a4 = -1.453_152_027;
    const a5 = 1.061_405_429;
    const p = 0.327_591_1;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1 / (1 + p * x);
    const y =
      1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  // 标准正态分布的 CDF（使用误差函数）
  protected static standardNormalCDF(x: number): number {
    return 0.5 * (1 + baseMS.erf(x / Math.sqrt(2)));
  }

  // 公共参数校验
  protected static validatePositive(...values: number[]) {
    if (values.some((v) => v <= 0)) throw new Error('参数必须为正数');
  }

  // 抽象方法强制子类实现
  abstract calculateCDF(x: number): number;

  abstract calculatePDF(x: number): number;

  abstract calculateSF(x: number): number;

  abstract getParams(): Record<string, number>;
}

export { baseMS };
