import type { PaginationResult } from '#/types';

import { requestClient } from '#/api/request';

// 库房数据模型
export interface WarehouseSchemaBase {
  area?: string;
  code?: string; // 库房编码
  name?: string; // 库房名称
  allotment_two?: string; // 二级配属
  created_by?: string; // 创建人
  changed_time?: string; // 更新时间
}

export interface GetWarehouseDetails extends WarehouseSchemaBase {
  id: number;
  created_time?: string; // 从created_at改为created_time
  updated_time?: string; // 从updated_at改为updated_time
}

// 查询参数
export interface WarehouseQueryParams {
  page: number;
  size: number;
  area?: string;
  name?: string;
  code?: string; // 库房编码查询参数
}

// 批量导入参数
export interface WarehouseImportParams {
  file: File;
  // 移除 overwrite，因为后端固定为覆盖模式
}

// 表单导入参数（包含fileList字段）
export interface WarehouseFormImportParams {
  fileList?: any[];
  divider1?: any;
  usage_guide?: any;
}

// 批量导入响应类型 - 匹配后端响应格式
export interface WarehouseImportResponse {
  total_rows: number; // 总行数
  success_rows: number; // 成功行数
  failed_rows: number; // 失败行数
  errors: string[]; // 错误信息
}

// API响应类型
export type WarehouseListResponse = PaginationResult<GetWarehouseDetails>;

// API函数
export const getWarehouseListApi = (
  params: WarehouseQueryParams,
): Promise<WarehouseListResponse> => {
  return requestClient.get('/api/v1/datamanage/warehouse', { params });
};

export const getWarehouseDetailApi = (
  id: number,
): Promise<GetWarehouseDetails> => {
  return requestClient.get(`/api/v1/datamanage/warehouse/${id}`);
};

export const createWarehouseApi = (
  data: WarehouseSchemaBase,
): Promise<GetWarehouseDetails> => {
  return requestClient.post('/api/v1/datamanage/warehouse', data);
};

export const updateWarehouseApi = (
  id: number,
  data: WarehouseSchemaBase,
): Promise<GetWarehouseDetails> => {
  return requestClient.put(`/api/v1/datamanage/warehouse/${id}`, data);
};

export const deleteWarehouseApi = (id: number): Promise<null> => {
  return requestClient.delete(`/api/v1/datamanage/warehouse/${id}`);
};

// 批量导入覆盖API
export const importWarehouseDataApi = (
  data: WarehouseImportParams,
): Promise<WarehouseImportResponse> => {
  // 验证文件对象
  if (!data.file || !(data.file instanceof File)) {
    throw new Error('无效的文件对象');
  }

  const formData = new FormData();
  formData.append('file', data.file);

  return requestClient.post('/api/v1/datamanage/warehouse/import', formData, {
    headers: {
      'Content-Type': undefined, // 删除默认的Content-Type，让浏览器自动设置
    },
  });
};
