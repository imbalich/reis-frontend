import type { DegradeFunctionData } from '#/custom/degrade/strategies/types';

import { requestClient } from './request';

export interface DegradeParams {
  product_model?: string;
  check_bezier?: string;
  product_no?: string;
  x_peaks?: string[];
  y_peaks?: string[];
  name?: string;
  params?: string[];
  ci?: string;
  all_negative?: boolean;
}

export interface QueryDegradeFunctionParams {
  product_model?: string;
  check_bezier?: string;
  failure_threshold?: number;
  product_no?: string;
}

export interface QueryDegradeFunctionRes {
  results: DegradeFunctionData[];
}

export interface DmCheckBezierByModelParams {
  product_model?: string;
}

export async function queryDegradeFunctionApi(
  params: QueryDegradeFunctionParams,
) {
  return requestClient.get('/api/v1/degrade/product/degrade', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmDegradeModelApi() {
  return requestClient.get(`/api/v1/datamanage/overhaul/product_model`);
}

export function getDmCheckBezierByModelApi(params: DmCheckBezierByModelParams) {
  return requestClient.get(`/api/v1/datamanage/overhaul/check_bezier`, {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmProductNoByModelApi(params: DmCheckBezierByModelParams) {
  return requestClient.get(`/api/v1/datamanage/overhaul/product_no`, {
    params,
    paramsSerializer: 'repeat',
  });
}
