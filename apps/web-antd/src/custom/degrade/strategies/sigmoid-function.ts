import type { DegradeFunctionStrategy } from './types';

/**
 * Sigmoid函数策略
 * y = a / (1 + e^(-b * (x - c))) + d
 */
export default class Sigmoid implements DegradeFunctionStrategy {
  private readonly a: number;
  private readonly b: number;
  private readonly c: number;
  private readonly ci: number;
  private readonly d: number;

  constructor(params: number[], ci: number) {
    // Sigmoid函数参数: y = a / (1 + e^(-b * (x - c))) + d
    if (params[0] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[1] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[2] === undefined) {
      throw new Error('params[0] is undefined');
    }
    if (params[3] === undefined) {
      throw new Error('params[0] is undefined');
    }
    this.a = params[0];
    this.b = params[1];
    this.c = params[2];
    this.d = params[3];
    this.ci = ci;
  }

  calculate(x: number): number {
    return this.a / (1 + Math.exp(-this.b * (x - this.c))) + this.d;
  }

  getCI(): number {
    return this.ci;
  }

  getName(): string {
    return 'sigmoid';
  }

  getParams(): number[] {
    return [this.a, this.b, this.c, this.d];
  }
}

export { Sigmoid };
