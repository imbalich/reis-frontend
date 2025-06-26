import type { DistributionStrategy } from './strategies/types';

const ChartData = {
  // 获取PDF数据
  getChartData(strategy: DistributionStrategy, funcType: string) {
    const points = [];
    const xMax = 400_000;

    for (let x = 0; x <= xMax; x += xMax / 40_000) {
      const y = this.calculateFunction(strategy, funcType, x);
      points.push([x, y]);
    }

    return points;
  },
  calculateFunction(
    strategy: DistributionStrategy,
    funcType: string,
    x: number,
  ): number {
    switch (funcType) {
      case 'CDF': {
        return strategy.calculateCDF(x);
      }
      case 'PDF': {
        return strategy.calculatePDF(x);
      }
      case 'SF': {
        return strategy.calculateSF(x);
      }
      default: {
        throw new Error('Invalid function type');
      }
    }
  },
};

export default ChartData;
