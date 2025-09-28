import type { PaginationResult } from '#/types';

import { requestClient } from '#/api/request';

// RCM计算结果模型
export interface RcmCalculationListDetails {
  id: number; // 结果ID
  base_data_id: number; // RCM基础数据ID
  product_model: string; // 产品型号
  component_name: string; // 部件名称
  component_material_code: string; // 零部件物料编码
  failure_mode?: string; // 故障模式
  final_result: string; // 最终计算结果
  calculation_status: string; // 计算状态
  calculation_process?: string; // 计算过程记录
  error_message?: string; // 错误信息
  calculation_time: string; // 计算时间
  created_time: string; // 创建时间
  updated_time: string; // 更新时间
}

// 查询参数
export interface RcmCalculationQueryParams {
  page: number;
  size: number;
  product_model?: string;
  component_name?: string;
  component_material_code?: string;
  final_result?: string;
}

// API响应类型
export type RcmCalculationListResponse =
  PaginationResult<RcmCalculationListDetails>;

// 任务状态相关类型
export interface RcmCalculationTaskStatus {
  task_id: string;
  task_name: string;
  message: string;
  status:
    | 'failed'
    | 'FAILED'
    | 'pending'
    | 'PENDING'
    | 'running'
    | 'STARTED'
    | 'submitted'
    | 'success'
    | 'SUCCESS';
  is_duplicate?: boolean;
  result?: any;
  error?: string;
  ready?: boolean;
}

export interface RcmCalculationGlobalStatus {
  can_submit: boolean;
  current_task?: {
    status: 'pending' | 'PENDING' | 'running' | 'RUNNING';
    task_id: string;
    worker: string;
  };
  message: string;
}

// API函数
export const getRcmCalculationListApi = (
  params: RcmCalculationQueryParams,
): Promise<RcmCalculationListResponse> => {
  return requestClient.get('/api/v1/rcm/calculation', { params });
};

// 提交批量计算任务
export const submitRcmBatchCalculationApi =
  (): Promise<RcmCalculationTaskStatus> => {
    return requestClient.post('/api/v1/rcm/calculation/batch-calculate');
  };

// 查询任务状态
export const getRcmCalculationTaskStatusApi = (
  taskId: string,
): Promise<RcmCalculationTaskStatus> => {
  return requestClient.get(`/api/v1/rcm/calculation/task-status/${taskId}`);
};

// 检查全局状态
export const getRcmCalculationGlobalStatusApi =
  (): Promise<RcmCalculationGlobalStatus> => {
    return requestClient.get('/api/v1/rcm/calculation/calculation-status');
  };
