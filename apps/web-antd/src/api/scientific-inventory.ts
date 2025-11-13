import type { PaginationResult } from '#/types';

import { requestClient } from '#/api/request';

// 科学库存计算结果数据模型（基于后端schema）
export interface ScienceWarehouseResultDetails {
  id: number;
  calculation_id: string; // 计算批次ID
  warehouse_code: string; // 库房编码
  warehouse_name: string; // 库房名称
  spare_part_code: string; // 备品编码
  spare_part_name: string; // 备品名称
  required_quantity: number; // 需求数量
  calculation_method: string; // 计算方法
  time_interval_days: number; // 时间间隔（天）
  input_date: string; // 计算截止日期
  created_time: string; // 创建时间
}

// 查询参数
export interface ScienceWarehouseQueryParams {
  page?: number;
  size?: number;
  calculation_id?: string;
  warehouse_code?: string; // 选择的下拉选项中的编码部分
  spare_part_code?: string; // 选择的下拉选项中的编码部分
  calculation_method?: string;
  time_range?: string[]; // 创建时间范围 [开始日期, 结束日期]
}

// 选项数据类型
export interface WarehouseOption {
  value: string; // 库房编码
  label: string; // "编码-名称" 格式
}

export interface SparePartOption {
  value: string; // 备品编码
  label: string; // "编码-名称" 格式
}

export interface CalculationMethodOption {
  value: string;
  label: string;
}

// API响应类型
export type ScienceWarehouseListResponse =
  PaginationResult<ScienceWarehouseResultDetails>;

// 获取库房选项列表
export const getWarehouseOptionsApi = (): Promise<{
  data: WarehouseOption[];
}> => {
  return requestClient.get('/api/v1/calcu/science-warehouse/warehouses');
};

// 获取备品选项列表（支持级联筛选）
export const getSparePartOptionsApi = (
  warehouseCode?: string,
): Promise<{
  data: SparePartOption[];
}> => {
  return requestClient.get('/api/v1/calcu/science-warehouse/spare-parts', {
    params: warehouseCode ? { warehouse_code: warehouseCode } : {},
  });
};

// 获取计算方法选项列表
export const getCalculationMethodOptionsApi = (): Promise<{
  data: CalculationMethodOption[];
}> => {
  return requestClient.get('/api/v1/calcu/science-warehouse/calculation-methods');
};

// API函数
export const getScienceWarehouseListApi = (
  params: ScienceWarehouseQueryParams,
): Promise<ScienceWarehouseListResponse> => {
  return requestClient.get('/api/v1/calcu/science-warehouse/list', {
    params,
    paramsSerializer: 'repeat',
  });
};

export const getScienceWarehouseDetailApi = (
  id: number,
): Promise<ScienceWarehouseResultDetails> => {
  return requestClient.get(`/api/v1/calcu/science-warehouse/${id}`);
};
