import type { DegradeFunctionStrategy } from './types';

/**
 * 幂函数策略
 * y = a * x^b + c
 */
export default class PowerLaw implements DegradeFunctionStrategy {
  private readonly a: number;
  private readonly b: number;
  private readonly c: number;
  private readonly ci: number;

  constructor(params: number[], ci: number) {
    // 幂函数参数: y = a * x^b + c
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
    return this.a * x ** this.b + this.c;
  }

  getCI(): number {
    return this.ci;
  }

  getName(): string {
    return 'power_law';
  }

  getParams(): number[] {
    return [this.a, this.b, this.c];
  }
}

export { PowerLaw };
