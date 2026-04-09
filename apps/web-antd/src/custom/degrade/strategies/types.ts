/**
 * 退化函数策略接口定义
 */
export interface DegradeFunctionStrategy {
  /**
   * 计算函数值
   * @param x 自变量
   * @returns 函数值
   */
  calculate(x: number): number;

  /**
   * 获取函数名称
   */
  getName(): string;

  getCI(): number;

  /**
   * 获取函数参数
   */
  getParams(): number[];
}
/**
 * 退化函数数据接口
 */
export interface DegradeFunctionData {
  product_model: string;
  check_bezier: string;
  x_peaks: number[];
  y_peaks: number[];
  name: string;
  params: number[];
  ci: number;
  failure_threshold: null | number;
  t_failure: null | number;
  failure_interval: null | number[];
  current_threshold: null | number;
  x_current: null | number;
  difference: null | number;
  all_negative?: boolean;
}
