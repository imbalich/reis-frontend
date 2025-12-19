// 策略接口定义 计算五种曲线(PDF、CDF、SF、HF、CHF)并获取参数
export interface DistributionStrategy {
  calculatePDF(x: number): number;
  calculateCDF(x: number): number;
  calculateSF(x: number): number;
  // 瞬时失效率 h(t) = f(t) / S(t)
  calculateHF(x: number): number;
  // 累计失效率 H(t) = -ln S(t)
  calculateCHF(x: number): number;
  getParams(): Record<string, number>;
}
