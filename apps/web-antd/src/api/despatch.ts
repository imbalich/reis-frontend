import type { PaginationResult } from '#/types';

import { requestClient } from './request';

export interface DmDespatchParams {
  model?: string;
  identifier?: string;
  repair_level?: string;
  time_range?: Array<string>;
  page?: number;
  size?: number;
}

export interface DmDespatchRes {
  id: number;
  model: string;
  identifier: string;
  repair_level: string;
  life_cycle_time: string;
  repair_level_num: number;
  attach_company?: string;
  attach_dept?: string;
  cust_name?: string;
  dopt_name?: string;
  factory_name?: string;
  date_source?: string;
  sync_time?: string;
}

export function getDmDespatchListApi(params: DmDespatchParams) {
  return requestClient.get<PaginationResult>('/api/v1/datamanage/despatch', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmDespatchModelApi() {
  return requestClient.get(`/api/v1/datamanage/despatch/models`);
}

export function getDmDespatchRepairLevelApi() {
  return requestClient.get(`/api/v1/datamanage/despatch/repair-levels`);
}
