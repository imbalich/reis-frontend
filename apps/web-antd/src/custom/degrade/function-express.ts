import { functionTypeMap } from '../../views/degrade/fit/data';

export function getFunctionExpression(name: string, params: number[]): string {
  switch (name) {
    case 'exponential': {
      return `y = ${params[0]?.toFixed(4)} * e^(${params[1]?.toFixed(4)} * x) + (${params[2]?.toFixed(4)})`;
    }
    case 'linear': {
      return `y = ${params[0]?.toFixed(4)} * x + (${params[1]?.toFixed(4)})`;
    }
    case 'logarithmic': {
      return `y = ${params[0]?.toFixed(4)} * ln(x + 1) + (${params[1]?.toFixed(4)})`;
    }
    case 'polynomial_2': {
      return `y = ${params[2]?.toFixed(4)} * x² + ${params[1]?.toFixed(4)} * x + (${params[3]?.toFixed(4)})`;
    }
    case 'polynomial_3': {
      return `y = ${params[3]?.toFixed(4)} * x³ + ${params[2]?.toFixed(4)} * x² + ${params[1]?.toFixed(4)} * x + (${params[4]?.toFixed(4)})`;
    }
    case 'power_law': {
      return `y = ${params[0]?.toFixed(4)} * x^${params[1]?.toFixed(4)} + (${params[2]?.toFixed(4)})`;
    }
    case 'sigmoid': {
      return `y = ${params[0]?.toFixed(4)} / (1 + e^(-(${params[1]?.toFixed(4)}) * (x - (${params[2]?.toFixed(4)})))) + ${params[3]?.toFixed(4)}`;
    }
    default: {
      return `参数: ${params.map((p) => p.toFixed(4)).join(', ')}`;
    }
  }
}

export function getFunctionType(name: string): string {
  return functionTypeMap[name] || name;
}
