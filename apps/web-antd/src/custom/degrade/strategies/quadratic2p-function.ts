import type { DegradeFunctionStrategy } from './types';

/**
 * 二次多项式函数策略
 * y = a * x^2 + b * x + c
 */
export default class Quadratic2P implements DegradeFunctionStrategy {
  private readonly a: number;
  private readonly b: number;
  private readonly c: number;
  private readonly ci: number;

  constructor(params: number[], ci: number) {
    // 二次多项式函数参数: y = a * x^2 + b * x + c
    if (params[1] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[2] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[3] === undefined) {
      throw new Error('params[0] is undefined');
    }
    this.a = params[2];
    this.b = params[1];
    this.c = params[3];
    this.ci = ci;
  }

  calculate(x: number): number {
    return this.a * x ** 2 + this.b * x + this.c;
  }

  getCI(): number {
    return this.ci;
  }

  getName(): string {
    return 'quadratic';
  }

  getParams(): number[] {
    return [this.a, this.b, this.c];
  }
}

export { Quadratic2P };
