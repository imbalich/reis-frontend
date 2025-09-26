import type { DegradeFunctionStrategy } from './types';

/**
 * 三次多项式函数策略
 * y = a * x^3 + b * x^2 + c * x + d
 */
export default class Quadratic3P implements DegradeFunctionStrategy {
  private readonly a: number;
  private readonly b: number;
  private readonly c: number;
  private readonly ci: number;
  private readonly d: number;

  constructor(params: number[], ci: number) {
    // 三次多项式函数参数: y = a * x^3 + b * x^2 + c * x + d
    if (params[1] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[2] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[3] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[4] === undefined) {
      throw new Error('params[0] is undefined');
    }
    this.a = params[3];
    this.b = params[2];
    this.c = params[1];
    this.d = params[4];
    this.ci = ci;
  }

  calculate(x: number): number {
    return this.a * x ** 3 + this.b * x ** 2 + this.c * x + this.d;
  }

  getCI(): number {
    return this.ci;
  }

  getName(): string {
    return 'cubic';
  }

  getParams(): number[] {
    return [this.a, this.b, this.c, this.d];
  }
}

export { Quadratic3P };
