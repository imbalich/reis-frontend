import { baseMS } from '#/custom/weibull/strategies';

export default class Lognormal3P extends baseMS {
  private gamma: number;

  constructor(mu: number, sigma: number, gamma: number) {
    super(mu, sigma);
    this.gamma = gamma;
  }

  // 构造函数
  calculateCDF(x: number): number {
    if (x <= this.gamma) return 0;
    const z = (Math.log(x - this.gamma) - this.mu) / this.sigma;
    return baseMS.standardNormalCDF(z);
  }

  calculatePDF(x: number): number {
    if (x <= this.gamma) return 0; // x 必须大于 gamma
    const z = (Math.log(x - this.gamma) - this.mu) / this.sigma;
    return (
      (1 / (this.sigma * Math.log(x - this.gamma) * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * z * z)
    );
  }

  calculateSF(x: number): number {
    return 1 - this.calculateCDF(x);
  }

  // 获取参数（显示当前设置的α和β）
  getParams() {
    return { mu: this.mu, sigma: this.sigma, gamma: this.gamma };
  }
}

export { Lognormal3P };
