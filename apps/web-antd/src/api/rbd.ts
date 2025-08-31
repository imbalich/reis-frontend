import type { PaginationResult } from '#/types/pagination';

import { requestClient } from '#/api/request';

export interface RbdProjectParams {
  model?: string;
  task_type?: string;
  version?: number;
  status?: string;
  created_by?: string;
  page?: number;
  size?: number;
}

export interface RbdProjectResult {
  id: number;
  name: string;
  description?: string;
  model: string;
  graph_data: Record<string, any>;
  project_metadata?: Record<string, any>;
  task_type: string;
  status: string;
  version: number;
  created_by?: string;
  created_time: string;
  updated_time?: string;
}

export interface RbdProjectListResult
  extends PaginationResult<RbdProjectResult> {}

export interface CreateRbdProjectParams {
  name: string;
  description?: string;
  model: string;
  task_type: string;
}

export interface UpdateRbdProjectParams {
  name?: string;
  description?: string;
  model?: string;
  graph_data?: Record<string, any>;
  project_metadata?: Record<string, any>;
  task_type?: string;
  status?: string;
  version?: number;
}

export interface DeleteProjectsParam {
  pks: number[];
}

/**
 * 分页获取RBD项目列表
 */
export async function getRbdProjectsApi(params: RbdProjectParams) {
  return requestClient.get<RbdProjectListResult>('/api/v1/rbd/projects', {
    params,
  });
}

/**
 * 获取RBD项目详情
 */
export async function getRbdProjectDetailApi(id: number | string) {
  return requestClient.get<RbdProjectResult>(`/api/v1/rbd/projects/${id}`);
}

/**
 * 创建RBD项目
 */
export async function createRbdProjectApi(data: CreateRbdProjectParams) {
  return requestClient.post<string>('/api/v1/rbd/projects', data);
}

/**
 * 更新RBD项目
 */
export async function updateRbdProjectApi(
  id: number | string,
  data: UpdateRbdProjectParams,
) {
  return requestClient.put(`/api/v1/rbd/projects/${id}`, data);
}

/**
 * 批量删除RBD项目
 */
export async function deleteRbdProjectsApi(data: DeleteProjectsParam) {
  return requestClient.delete('/api/v1/rbd/projects', { data });
}
