import type { PaginationResult } from '#/types';

import { requestClient } from './request';

export interface LccAssignParams {
  items?: string;
  items1?: string;
  items2?: string;
  fpmh_user?: number;
  yan_cost?: number;
  shou_cost?: number;
  lirun_ratio?: number;
  reserved_value?: number;
  order?: number;
}

export interface lccAssignResult {
  model: string;
  part: string;
  part_name: string;
  quantity: number;
  fpmh: number;
}

export interface LccAssignRes {
  fpmh_pre: number;
  fpmh_result: boolean;
  n1: number;
  n2: number;
  parts_detail: lccAssignResult[];
  lirun_ratio: number;
}

export interface LccAssignCompareRes {
  plan?: number;
  fpmh_pre?: string;
  fpmh_result?: boolean;
  lcc_ratio?: string;
  fpmh_user?: number;
  sort?: number;
}

export interface LccCycleLifeParams {
  items?: string;
}

export interface LccCycleLifeRes {
  model: string;
  part: string;
  part_name: string;
  part_number: number;
  falut_number: number;
  replace_number?: number;
  build_repair_retio?: string;
  totle_number?: number;
  router?: string;
}

export interface lccRepairPlanParams {
  model?: string;
  parts?: string[];
  is_ai?: boolean;
}

export interface LccRepairPlanRes {
  model: string;
  result: string[];
  ratio: number;
}

export interface DmLCCParams {
  model?: string;
}

export function getRessignListApi(params: LccAssignParams) {
  return requestClient.get<LccAssignRes>('/api/v1/lcc/assign', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmLccRessignByModelApi(params: DmLCCParams) {
  return requestClient.get(`/api/v1/lcc/assign/get_parts`, {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getRessignCompareListApi(params: LccAssignParams) {
  return requestClient.get<LccAssignCompareRes>(
    '/api/v1/lcc/assign/assign_compare',
    {
      params,
      paramsSerializer: 'repeat',
    },
  );
}

export function getCycleLifeListApi(params: LccCycleLifeParams) {
  return requestClient.get<PaginationResult<LccCycleLifeRes>>(
    '/api/v1/lcc/cycle_life',
    {
      params,
      paramsSerializer: 'repeat',
    },
  );
}

export function getDmLccCycleLifeByModelApi(params: DmLCCParams) {
  return requestClient.get(`/api/v1/lcc/cycle_life/get_parts`, {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getRepairPlanApi(params: lccRepairPlanParams) {
  return requestClient.get<LccRepairPlanRes>('/api/v1/lcc/repair_plan', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmLccRepairPlanByModelApi(params: DmLCCParams) {
  return requestClient.get(`/api/v1/lcc/repair_plan/get_parts`, {
    params,
    paramsSerializer: 'repeat',
  });
}
