import { baseExp } from '#/custom/weibull/strategies';

export default class Exponential1P extends baseExp {
  // 构造函数
  calculateCDF(x: number): number {
    return 1 - Math.exp(-this.lambda_ * x);
  }

  calculatePDF(x: number): number {
    return this.lambda_ * Math.exp(-this.lambda_ * x);
  }

  calculateSF(x: number): number {
    return 1 - this.calculateCDF(x);
  }

  // 获取参数（显示当前设置的α和β）
  getParams() {
    return { lambda_: this.lambda_ };
  }
}

export { Exponential1P };
