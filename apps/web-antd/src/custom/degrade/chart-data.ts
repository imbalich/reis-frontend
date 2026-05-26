import type { DegradeFunctionStrategy } from './strategies/types';

// 退化函数图表数据生成工具
const DegradeChartData = {
  /**
   * 获取函数曲线数据
   * @param strategy 函数策略
   * @param xPeaks x轴峰值点
   * @param pointCount 生成的点数量
   * @returns 曲线数据点 [[x, y], ...]
   */
  getChartData(
    strategy: DegradeFunctionStrategy,
    xPeaks: number[],
    pointCount = 5000,
  ): [number, number][] {
    const points: [number, number][] = [];

    // 确定x轴范围
    const xMin = Math.min(...xPeaks) * 0.5; // 稍微扩展一点范围
    const xMax = 26;

    // 生成均匀分布的点
    const step = (xMax - xMin) / (pointCount - 1);

    for (let i = 0; i < pointCount; i++) {
      const x = xMin + step * i;
      const y = strategy.calculate(x);
      points.push([x, y]);
    }
    return points;
  },

  /**
   * 获取置信区间数据
   * @param strategy 函数策略
   * @param xPeaks x轴峰值点
   * @param pointCount 生成的点数量
   * @returns 上下置信区间数据 {upper: [[x, y], ...], lower: [[x, y], ...]}
   */
  getConfidenceIntervalData(
    strategy: DegradeFunctionStrategy,
    xPeaks: number[],
    pointCount = 5000,
  ): {
    lower: [number, number][];
    upper: [number, number][];
  } {
    const ci = strategy.getCI();
    const points = this.getChartData(strategy, xPeaks, pointCount);

    // 计算置信区间
    const upper: [number, number][] = [];
    const lower: [number, number][] = [];

    points.forEach(([x, y]) => {
      upper.push([x, y + ci]);
      lower.push([x, y - ci]);
    });

    return { upper, lower };
  },
};

export default DegradeChartData;
