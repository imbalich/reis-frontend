import { baseExp } from '#/custom/weibull/strategies';

export default class Exponential2P extends baseExp {
  private gamma: number;

  constructor(lambda_: number, gamma: number) {
    // console.log('Exponential2P:', lambda_, gamma);
    super(lambda_);
    this.gamma = gamma;
  }

  // 构造函数
  calculateCDF(x: number): number {
    if (x <= this.gamma) return 0;

    return 1 - Math.exp(-this.lambda_ * (x - this.gamma));
  }

  calculatePDF(x: number): number {
    if (x <= this.gamma) return 0; // x 必须大于 gamma

    return this.lambda_ * Math.exp(-this.lambda_ * (x - this.gamma));
  }

  calculateSF(x: number): number {
    return 1 - this.calculateCDF(x);
  }

  // 获取参数（显示当前设置的α和β）
  getParams() {
    return { lambda_: this.lambda_, gamma: this.gamma };
  }
}

export { Exponential2P };
