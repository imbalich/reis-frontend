// 分布函数中均有lambda_基本类，包括Exponential
import type { DistributionStrategy } from '../types';

export default abstract class baseExp implements DistributionStrategy {
  protected lambda_: number;

  constructor(lambda_: number) {
    // console.log('BaseAB参数:', lambda);
    baseExp.validatePositive(lambda_);

    this.lambda_ = lambda_;
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

export { baseExp };
