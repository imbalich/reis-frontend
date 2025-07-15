import type { PaginationResult } from '#/types';

import { requestClient } from './request';

export interface DmRepairParams {
  model?: string;
  state_now?: boolean;
  page?: number;
  size?: number;
}

export interface DmRepairRes {
  id: number;
  model: string;
  state_now: boolean;
  id_repair: string;
  repair_levels: string;
  creator: string;
  create_time: string;
}

export function getDmRepairListApi(params: DmRepairParams) {
  return requestClient.get<PaginationResult>('/api/v1/datamanage/repair', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmRepairModelApi() {
  return requestClient.get(`/api/v1/datamanage/repair/models`);
}
