import type { DistributionStrategy } from '../types';

export default abstract class baseAB implements DistributionStrategy {
  protected alpha: number;

  protected beta: number;

  constructor(alpha: number, beta: number) {
    baseAB.validatePositive(alpha, beta);
    this.alpha = alpha;
    this.beta = beta;
  }

  protected static factorial(n: number): number {
    if (n === 0 || n === 1) return 1;
    return n * baseAB.factorial(n - 1);
  }

  // 构造gamma函数
  protected static gamma1(x: number): number {
    // 用Lanczos近似的对数版本
    const p = [
      0.999_999_999_999_809_93, 676.520_368_121_885_1, -1259.139_216_722_402_8,
      771.323_428_777_653_13, -176.615_029_162_140_59, 12.507_343_278_686_905,
      -0.138_571_095_265_720_12, 9.984_369_578_019_571_6e-6,
      1.505_632_735_149_311_6e-7,
    ];
    if (x < 0.5) {
      return Math.PI / (Math.sin(Math.PI * x) * baseAB.gamma1(1 - x));
    }
    x -= 1;
    let a: number = p[0] ?? 0;
    const t = x + 7.5;
    for (let i = 1; i < p.length; i += 1) {
      a += p[i] ?? 0 / (x + i);
    }
    // 使用对数避免数值溢出
    return Math.exp(
      (x + 0.5) * Math.log(t) - t + Math.log(Math.sqrt(2 * Math.PI) * a),
    );
  }

  // 下伽马函数
  protected static lowerGamma(a: number, x: number): number {
    if (x < a + 1) {
      // 小x使用级数展开
      let sum = 0;
      let term = 1 / a;
      for (let k = 0; k < 1000; k += 1) {
        sum += term;
        term *= x / (a + k + 1);
        if (term < 1e-15) break;
      }
      return sum * Math.exp(a * Math.log(x) - x);
    }
    // 大x使用互补误差函数
    return baseAB.gamma1(a) - baseAB.upperGamma(a, x);
  }

  // 改用更稳定的不完全伽马函数实现：在lowerGamma中使用级数展开对于大x值收敛较慢，改用连分数展开处理上伽马函数，再通过互补关系计算下伽马函数。
  // 上伽马函数
  protected static upperGamma(a: number, x: number): number {
    // 连分数展开实现上伽马函数
    let b = x + 1 - a;
    let c = 1 / 1e-30;
    let d = 1 / b;
    let h = d;
    for (let i = 1; i <= 100; i += 1) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;
      if (d === 0) d = 1e-30;
      c = b + an / c;
      if (c === 0) c = 1e-30;
      d = 1 / d;
      h *= d * c;
    }
    return h * Math.exp(a * Math.log(x) - x);
  }

  // 公共参数校验
  protected static validatePositive(...values: number[]) {
    if (values.some((v) => v <= 0)) throw new Error('参数必须为正数');
  }

  abstract calculateCDF(x: number): number;

  // 抽象方法强制子类实现
  abstract calculatePDF(x: number): number;

  abstract calculateSF(x: number): number;

  abstract getParams(): Record<string, number>;

  // 公共缩放计算
  protected scaledX(x: number, gamma?: number): number {
    return gamma === undefined ? x / this.alpha : (x - gamma) / this.alpha;
  }
}

export { baseAB };
