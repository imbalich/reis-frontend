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

  // 抽象方法强制子类实现：基础三条曲线
  abstract calculateCDF(x: number): number;

  calculateCHF(x: number): number {
    const sf = this.calculateSF(x);
    if (sf <= 0) {
      return Number.POSITIVE_INFINITY;
    }
    return -Math.log(sf);
  }

  // 默认基于 PDF/SF 组合推导 HF/CHF，具体分布如有需要可在子类中覆写
  calculateHF(x: number): number {
    const pdf = this.calculatePDF(x);
    const sf = this.calculateSF(x);
    if (sf <= 0) {
      return Number.POSITIVE_INFINITY;
    }
    return pdf / sf;
  }

  abstract calculatePDF(x: number): number;

  abstract calculateSF(x: number): number;

  abstract getParams(): Record<string, number>;
}

export { baseExp };
