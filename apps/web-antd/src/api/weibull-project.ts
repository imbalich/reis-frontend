import type { PaginationResult } from '#/types/pagination';

import { requestClient } from '#/api/request';

export interface WeibullProjectParams {
  model?: string;
  task_type?: string;
  created_by?: string;
  page?: number;
  size?: number;
}

export interface WeibullProjectResult {
  id: number;
  name: string;
  description?: string;
  model: string;
  task_type: string;
  created_by?: string;
  created_time: string;
  updated_time?: string;
}

export interface WeibullProjectListResult
  extends PaginationResult<WeibullProjectResult> {}

export interface CreateWeibullProjectParams {
  name: string;
  description?: string;
  model: string;
  task_type: string;
}

export interface UpdateWeibullProjectBasicInfoParams {
  name?: string;
  description?: string;
  model?: string;
  task_type?: string;
}

export interface DeleteWeibullProjectsParam {
  pks: number[];
}

export interface WeibullCensoredImportParams {
  file: File;
}

export interface WeibullCensoredFormImportParams {
  fileList: any[];
}

/** 与库房导入等模块一致的分行结果 */
export interface WeibullCensoredImportResponse {
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  errors: string[];
}

export async function getWeibullProjectsApi(params: WeibullProjectParams) {
  return requestClient.get<WeibullProjectListResult>(
    '/api/v1/fitting/weibull-projects',
    { params },
  );
}

export async function getWeibullProjectDetailApi(id: number | string) {
  return requestClient.get<WeibullProjectResult>(
    `/api/v1/fitting/weibull-projects/${id}`,
  );
}

export async function createWeibullProjectApi(data: CreateWeibullProjectParams) {
  return requestClient.post<string>('/api/v1/fitting/weibull-projects', data);
}

export async function updateWeibullProjectBasicInfoApi(
  id: number | string,
  data: UpdateWeibullProjectBasicInfoParams,
) {
  return requestClient.put(
    `/api/v1/fitting/weibull-projects/${id}/basic-info`,
    data,
  );
}

export async function deleteWeibullProjectsApi(data: DeleteWeibullProjectsParam) {
  return requestClient.delete('/api/v1/fitting/weibull-projects', { data });
}

export async function importWeibullCensoredDataApi(
  projectId: number | string,
  data: WeibullCensoredImportParams,
): Promise<WeibullCensoredImportResponse> {
  if (!data.file || !(data.file instanceof File)) {
    throw new Error('无效的文件对象');
  }
  const formData = new FormData();
  formData.append('file', data.file);
  return requestClient.post(
    `/api/v1/fitting/weibull-projects/${projectId}/import`,
    formData,
    {
      headers: {
        'Content-Type': undefined,
      },
    },
  );
}
