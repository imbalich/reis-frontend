import type { PaginationResult } from '#/types';

import { requestClient } from '#/api/request';

// RCM基础数据模型
export interface RcmBaseDataSchemaBase {
  // 基础信息字段
  product_model?: string; // 产品型号
  derivative_code?: string; // 派生码
  component_name?: string; // 部件名称
  component_material_code?: string; // 零部件物料编码
  failure_mode?: string; // 故障模式

  // 关键信息字段
  source?: string; // 来源
  is_key_component?: boolean; // 是否关键部件
  is_consumable_part?: boolean; // 是否耗损型部件

  // 计算参数字段
  estimated_failure_rate?: number; // 故障率预计值(FPMH)

  // 预防性维修字段
  preventive_maintenance_cost?: number; // 增加预防性维修的(万元)

  // LCC成本字段
  lcc_before_improvement?: number; // 改进前LCC(万元)
  lcc_after_improvement?: number; // 改进后LCC(万元)

  // 状态字段
  is_online_status?: boolean; // 状态是否可在线
  is_trend_rate_limit?: boolean; // 故障率变化趋势是否达到预警值

  // 系统管理字段
  created_by?: string; // 创建人
  changed_time?: string; // 表格修改时间
}

export interface GetRcmBaseDataDetails extends RcmBaseDataSchemaBase {
  id: number;
  created_time?: string; // 创建时间
  updated_time?: string; // 更新时间
}

// 查询参数
export interface RcmBaseDataQueryParams {
  page: number;
  size: number;
  product_model?: string;
  component_name?: string;
  component_material_code?: string;
  failure_mode?: string;
  is_key_component?: boolean;
  is_consumable_part?: boolean;
}

// 批量导入参数
export interface RcmBaseDataImportParams {
  file: File;
}

// 表单导入参数（包含fileList字段）
export interface RcmBaseDataFormImportParams {
  fileList?: any[];
  divider1?: any;
  usage_guide?: any;
}

// 批量导入响应类型 - 匹配后端响应格式
export interface RcmBaseDataImportResponse {
  total_rows: number; // 总行数
  success_rows: number; // 成功行数
  failed_rows: number; // 失败行数
  errors: string[]; // 错误信息
}

// 产品型号列表响应 - 后端直接返回数组
export type RcmProductModelsResponse = string[];

// 部件名称列表响应 - 后端直接返回数组
export type RcmComponentNamesResponse = string[];

// 故障模式列表响应 - 后端直接返回数组
export type RcmFailureModesResponse = string[];

// API响应类型
export type RcmBaseDataListResponse = PaginationResult<GetRcmBaseDataDetails>;

// API函数
export const getRcmBaseDataListApi = (
  params: RcmBaseDataQueryParams,
): Promise<RcmBaseDataListResponse> => {
  return requestClient.get('/api/v1/rcm/base-data', { params });
};

// 注意：后端只提供分页查询和导入功能，不提供单个数据的CRUD操作
// 如需单个数据操作，请通过分页查询获取数据，或通过Excel导入进行数据管理

// export const getRcmBaseDataDetailApi = (
//   id: number,
// ): Promise<GetRcmBaseDataDetails> => {
//   return requestClient.get(`/api/v1/rcm/base-data/${id}`);
// };

// export const createRcmBaseDataApi = (
//   data: RcmBaseDataSchemaBase,
// ): Promise<GetRcmBaseDataDetails> => {
//   return requestClient.post('/api/v1/rcm/base-data', data);
// };

// export const updateRcmBaseDataApi = (
//   id: number,
//   data: RcmBaseDataSchemaBase,
// ): Promise<GetRcmBaseDataDetails> => {
//   return requestClient.put(`/api/v1/rcm/base-data/${id}`, data);
// };

// export const deleteRcmBaseDataApi = (id: number): Promise<null> => {
//   return requestClient.delete(`/api/v1/rcm/base-data/${id}`);
// };

// 批量导入覆盖API
export const importRcmBaseDataApi = (
  data: RcmBaseDataImportParams,
): Promise<RcmBaseDataImportResponse> => {
  // 验证文件对象
  if (!data.file || !(data.file instanceof File)) {
    throw new Error('无效的文件对象');
  }

  const formData = new FormData();
  formData.append('file', data.file);

  return requestClient.post('/api/v1/rcm/base-data/import', formData, {
    headers: {
      'Content-Type': undefined, // 删除默认的Content-Type，让浏览器自动设置
    },
  });
};

// 获取产品型号列表
export const getRcmProductModelsApi = (): Promise<RcmProductModelsResponse> => {
  return requestClient.get('/api/v1/rcm/base-data/product-models');
};

// 根据产品型号获取部件名称列表
export const getRcmComponentNamesByModelApi = (
  product_model: string,
): Promise<RcmComponentNamesResponse> => {
  return requestClient.get('/api/v1/rcm/base-data/component-names', {
    params: { product_model },
  });
};

// 根据产品型号获取故障模式列表
export const getRcmFailureModesByModelApi = (
  product_model: string,
): Promise<RcmFailureModesResponse> => {
  return requestClient.get('/api/v1/rcm/base-data/failure-modes', {
    params: { product_model },
  });
};
