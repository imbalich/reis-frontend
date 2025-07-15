import { baseAB } from '#/custom/weibull/strategies';

export default class Weibull2P extends baseAB {
  calculateCDF(x: number): number {
    return 1 - Math.exp(-(this.scaledX(x) ** this.beta));
  }

  // 构造函数
  calculatePDF(x: number): number {
    const z = this.scaledX(x);
    return (
      (this.beta / this.alpha) *
      z ** (this.beta - 1) *
      Math.exp(-(z ** this.beta))
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

export { Weibull2P };
