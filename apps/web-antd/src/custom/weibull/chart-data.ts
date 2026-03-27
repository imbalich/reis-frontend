import type { DistributionStrategy } from './strategies/types';

const START_HOURS = 1000;
const TOTAL_YEARS = 30;
const DEFAULT_HOURS_PER_DAY = 24;
const DEFAULT_DAYS_PER_YEAR = 365;

export interface ChartPoint {
  hours: number;
  value: number;
  monthIndex: number;
}

export interface TimeParams {
  hoursPerDay?: number;
  daysPerYear?: number;
}

const ChartData = {
  // 获取PDF数据
  getChartData(
    strategy: DistributionStrategy,
    funcType: string,
    timeParams?: TimeParams,
  ): ChartPoint[] {
    // 使用传入的时间参数，如果没有则使用默认值
    const hoursPerDay = timeParams?.hoursPerDay ?? DEFAULT_HOURS_PER_DAY;
    const daysPerYear = timeParams?.daysPerYear ?? DEFAULT_DAYS_PER_YEAR;
    const totalHours = daysPerYear * TOTAL_YEARS * hoursPerDay; // 30 年总小时数
    const hoursPerMonth = totalHours / (TOTAL_YEARS * 12);

    const points: ChartPoint[] = [];
    let hours = START_HOURS;
    let monthIndex = 0;

    while (hours <= totalHours) {
      let y = this.calculateFunction(strategy, funcType, hours);
      // 对数值量级较小的密度/失效率类曲线做放大，便于展示
      if (funcType === 'PDF' || funcType === 'HF') {
        y *= 1_000_000;
      }
      points.push({
        hours,
        value: y,
        monthIndex,
      });
      monthIndex += 1;
      hours = START_HOURS + monthIndex * hoursPerMonth;
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
      case 'CHF': {
        return strategy.calculateCHF(x);
      }
      case 'HF': {
        return strategy.calculateHF(x);
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
