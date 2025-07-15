// 策略接口定义 计算三种曲线(PDF、CDF、SF)并获取参数
export interface DistributionStrategy {
  calculatePDF(x: number): number;
  calculateCDF(x: number): number;
  calculateSF(x: number): number;
}
