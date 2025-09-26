import type {
  DegradeFunctionData,
  DegradeFunctionStrategy,
} from '../strategies/types';

import {
  Exponential,
  Linear,
  Logarithmic,
  PowerLaw,
  Quadratic2P,
  Quadratic3P,
  Sigmoid,
} from '../strategies';

/**
 * 退化函数工厂类
 * 根据函数名称创建对应的函数策略
 */
export const DegradeFunctionFactory = {
  /**
   * 创建函数策略
   * @param data 函数数据
   * @returns 函数策略
   */
  createStrategy(data: DegradeFunctionData): DegradeFunctionStrategy {
    const { name, params, ci } = data;

    switch (name) {
      case 'exponential': {
        return new Exponential(params, ci);
      }
      case 'linear': {
        return new Linear(params, ci);
      }
      case 'logarithmic': {
        return new Logarithmic(params, ci);
      }
      case 'power_law': {
        return new PowerLaw(params, ci);
      }
      case 'quadratic2p': {
        return new Quadratic2P(params, ci);
      }
      case 'quadratic3p': {
        return new Quadratic3P(params, ci);
      }
      case 'sigmoid': {
        return new Sigmoid(params, ci);
      }
      default: {
        throw new Error(`不支持的函数类型: ${name}`);
      }
    }
  },
};
