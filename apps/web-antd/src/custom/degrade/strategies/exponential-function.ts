import type { DegradeFunctionStrategy } from './types';

/**
 * 指数函数策略
 * y = a * e^(b * x) + c
 */
export default class Exponential implements DegradeFunctionStrategy {
  private readonly a: number;
  private readonly b: number;
  private readonly c: number;
  private readonly ci: number;

  constructor(params: number[], ci: number) {
    // 指数函数参数: y = a * e^(b * x) + c
    if (params[0] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[1] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[2] === undefined) {
      throw new Error('params[0] is undefined');
    }
    this.a = params[0];
    this.b = params[1];
    this.c = params[2];
    this.ci = ci;
  }

  calculate(x: number): number {
    return this.a * Math.exp(this.b * x) + this.c;
  }

  getCI(): number {
    return this.ci;
  }

  getName(): string {
    return 'exponential';
  }

  getParams(): number[] {
    return [this.a, this.b, this.c];
  }
}
export { Exponential };
