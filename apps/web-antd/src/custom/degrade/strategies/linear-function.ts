import type { DegradeFunctionStrategy } from './types';

/**
 * 线性函数策略
 * y = a * x + b
 */

export default class Linear implements DegradeFunctionStrategy {
  private readonly a: number;
  private readonly b: number;
  private readonly ci: number;

  constructor(params: number[], ci: number) {
    // 线性函数参数: y = a * x + b
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
    return this.a * x + this.b;
  }

  getCI(): number {
    return this.ci;
  }

  getName(): string {
    return 'linear';
  }

  getParams(): number[] {
    return [this.a, this.b];
  }
}

export { Linear };
