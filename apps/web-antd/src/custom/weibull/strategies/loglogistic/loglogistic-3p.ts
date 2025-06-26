import { baseAB } from '#/custom/weibull/strategies';

export default class Loglogistic3P extends baseAB {
  private gamma: number;

  constructor(alpha: number, beta: number, gamma: number) {
    super(alpha, beta);
    this.gamma = gamma;
  }

  // 构造函数
  calculateCDF(x: number): number {
    if (x <= this.gamma) return 0;
    return 1 / (1 + this.scaledX(x) ** -this.beta);
  }

  calculatePDF(x: number): number {
    if (x <= this.gamma) return 0; // x 必须大于 gamma
    const z = this.scaledX(x);
    // console.log(z);
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
    return { alpha: this.alpha, beta: this.beta, gamma: this.gamma };
  }
}

export { Loglogistic3P };
