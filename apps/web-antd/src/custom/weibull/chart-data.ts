import type { DistributionStrategy } from './strategies/types';

const START_HOURS = 1_000;
const TOTAL_YEARS = 30;
const MONTH_DAYS = 30;
const HOURS_PER_DAY = 24;
const HOURS_PER_MONTH = MONTH_DAYS * HOURS_PER_DAY; // 720
const TOTAL_HOURS = 365 * TOTAL_YEARS * HOURS_PER_DAY; // 30 年（按 365 天）总小时数

export interface ChartPoint {
  hours: number;
  value: number;
  monthIndex: number;
}

const ChartData = {
  // 获取PDF数据
  getChartData(strategy: DistributionStrategy, funcType: string): ChartPoint[] {
    const points: ChartPoint[] = [];
    let monthIndex = 0;
    let hours = START_HOURS;

    while (hours <= TOTAL_HOURS) {
      let y = this.calculateFunction(strategy, funcType, hours);
      if (funcType === 'PDF') {
        y *= 1_000_000;
      }
      points.push({
        hours,
        value: y,
        monthIndex,
      });
      monthIndex += 1;
      hours = START_HOURS + monthIndex * HOURS_PER_MONTH;
    }

    const lastPoint = points[points.length - 1];
    if (!lastPoint || lastPoint.hours < TOTAL_HOURS) {
      let y = this.calculateFunction(strategy, funcType, TOTAL_HOURS);
      if (funcType === 'PDF') {
        y *= 1_000_000;
      }
      points.push({
        hours: TOTAL_HOURS,
        value: y,
        monthIndex,
      });
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
