import { baseAB } from '#/custom/weibull/strategies';

export default class Gamma2P extends baseAB {
  // 构造函数
  calculateCDF(x: number): number {
    const z = this.scaledX(x);
    return baseAB.lowerGamma(this.beta, z) / baseAB.gamma1(this.beta);
  }

  calculatePDF(x: number): number {
    const z = this.scaledX(x);
    const numerator = z ** (this.beta - 1) * Math.exp(-z);
    const denominator = this.alpha * baseAB.gamma1(this.beta);
    return numerator / denominator;
  }

  calculateSF(x: number): number {
    return 1 - this.calculateCDF(x);
  }

  // 获取参数（显示当前设置的α和β）
  getParams() {
    return { alpha: this.alpha, beta: this.beta };
  }
}

export { Gamma2P };
