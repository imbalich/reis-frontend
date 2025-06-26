import { baseMS } from '#/custom/weibull/strategies';

export default class Normal2P extends baseMS {
  // 构造函数
  calculateCDF(x: number): number {
    const z = (x - this.mu) / this.sigma;
    return baseMS.standardNormalCDF(z);
  }

  calculatePDF(x: number): number {
    const z = (x - this.mu) / this.sigma;
    return (1 / (this.sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
  }

  calculateSF(x: number): number {
    return 1 - this.calculateCDF(x);
  }

  // 获取参数（显示当前设置的α和β）
  getParams() {
    return { mu: this.mu, sigma: this.sigma };
  }
}

export { Normal2P };
