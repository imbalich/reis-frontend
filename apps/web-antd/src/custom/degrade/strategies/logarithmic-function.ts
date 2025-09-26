import type { DegradeFunctionStrategy } from './types';

/**
 * 对数函数策略
 * y = a * ln(x) + b
 */
export default class Logarithmic implements DegradeFunctionStrategy {
  private readonly a: number;
  private readonly b: number;
  private readonly ci: number;

  constructor(params: number[], ci: number) {
    // 对数函数参数: y = a * ln(x + 1) + b
    if (params[0] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[1] === undefined) {
      throw new Error('params[0] is undefined');
    }
    this.a = params[0];
    this.b = params[1];
    this.ci = ci;
  }

  calculate(x: number): number {
    // 防止对数为负或零的情况
    if (x <= 0) return this.b;
    return this.a * Math.log(x + 1) + this.b;
  }

  getCI(): number {
    return this.ci;
  }

  getName(): string {
    return 'logarithmic';
  }

  getParams(): number[] {
    return [this.a, this.b];
  }
}

export { Logarithmic };
