import type { PaginationResult } from '#/types';
import { requestClient } from '#/api/request';

// 库房备品清单数据模型
export interface WarehouseInventorySchemaBase {
  warehouse_code?: string; // 库房编号
  warehouse_name?: string; // 库房名称
  part_code?: string; // 零部件物料编码
  part_name?: string; // 零部件名称
  default_quantity?: number; // 默认数量
  created_by?: string; // 创建人
  changed_time?: string; // 更新时间
}

export interface GetWarehouseInventoryDetails
  extends WarehouseInventorySchemaBase {
  id: number;
  created_time?: string; // 创建时间
  updated_time?: string; // 更新时间
}

// 查询参数
export interface WarehouseInventoryQueryParams {
  page: number;
  size: number;
  warehouse_code?: string;
  warehouse_name?: string;
  part_code?: string;
  part_name?: string;
}

// 批量导入参数
export interface WarehouseInventoryImportParams {
  file: File;
}

// 表单导入参数（包含fileList）
export interface WarehouseInventoryFormImportParams {
  fileList: any[];
}

// 导入响应
export interface WarehouseInventoryImportResponse {
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  errors: string[];
}

// 获取库房备品清单列表
export const getWarehouseInventoryListApi = (
  params: WarehouseInventoryQueryParams,
): Promise<PaginationResult<GetWarehouseInventoryDetails>> => {
  return requestClient.get('/api/v1/datamanage/warehouse-inventory', {
    params,
  });
};

// 批量导入库房备品清单数据
export const importWarehouseInventoryDataApi = (
  data: WarehouseInventoryImportParams,
): Promise<WarehouseInventoryImportResponse> => {
  // 验证文件对象
  if (!data.file || !(data.file instanceof File)) {
    throw new Error('无效的文件对象');
  }

  const formData = new FormData();
  formData.append('file', data.file);

  return requestClient.post(
    '/api/v1/datamanage/warehouse-inventory/import',
    formData,
    {
      headers: {
        'Content-Type': undefined, // 删除默认的Content-Type，让浏览器自动设置
      },
    },
  );
};
