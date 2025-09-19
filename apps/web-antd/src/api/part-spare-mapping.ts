import type { PaginationResult } from '#/types';
import { requestClient } from '#/api/request';

// 部件与备品映射关系数据模型
export interface PartSpareMappingSchemaBase {
  product_model?: string; // 产品型号
  derived_code?: string; // 派生码
  original_part_name?: string; // 零部件名称（原装）
  original_part_code?: string; // 零部件物料编码（原装）
  spare_part_name?: string; // 零部件名称（备品）
  spare_part_code?: string; // 零部件物料编码（备品）
  created_by?: string; // 创建人
  changed_time?: string; // 更新时间
}

export interface GetPartSpareMappingDetails extends PartSpareMappingSchemaBase {
  id: number;
  created_time?: string; // 创建时间
  updated_time?: string; // 更新时间
}

// 查询参数
export interface PartSpareMappingQueryParams {
  page: number;
  size: number;
  product_model?: string;
  derived_code?: string;
  original_part_name?: string;
  original_part_code?: string;
  spare_part_name?: string;
  spare_part_code?: string;
}

// 批量导入参数
export interface PartSpareMappingImportParams {
  file: File;
}

// 表单导入参数（包含fileList）
export interface PartSpareMappingFormImportParams {
  fileList: any[];
}

// 导入响应
export interface PartSpareMappingImportResponse {
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  errors: string[];
}

// 获取部件与备品映射关系列表
export const getPartSpareMappingListApi = (
  params: PartSpareMappingQueryParams,
): Promise<PaginationResult<GetPartSpareMappingDetails>> => {
  return requestClient.get('/api/v1/datamanage/part-spare-mapping', {
    params,
  });
};

// 批量导入部件与备品映射关系数据
export const importPartSpareMappingDataApi = (
  data: PartSpareMappingImportParams,
): Promise<PartSpareMappingImportResponse> => {
  // 验证文件对象
  if (!data.file || !(data.file instanceof File)) {
    throw new Error('无效的文件对象');
  }

  const formData = new FormData();
  formData.append('file', data.file);

  return requestClient.post(
    '/api/v1/datamanage/part-spare-mapping/import',
    formData,
    {
      headers: {
        'Content-Type': undefined, // 删除默认的Content-Type，让浏览器自动设置
      },
    },
  );
};
