import { baseAB } from '#/custom/weibull/strategies';

export default class Loglogistic2P extends baseAB {
  // 构造函数
  calculateCDF(x: number): number {
    return 1 / (1 + this.scaledX(x) ** -this.beta);
  }

  calculatePDF(x: number): number {
    const z = this.scaledX(x);
    return (
      ((this.beta / this.alpha) * z ** (this.beta - 1)) /
      (1 + z ** this.beta) ** 2
    );
  }

  calculateSF(x: number): number {
    return 1 - this.calculateCDF(x);
  }

  // 获取参数（显示当前设置的α和β）
  getParams() {
    return { alpha: this.alpha, beta: this.beta };
  }
}

export { Loglogistic2P };
