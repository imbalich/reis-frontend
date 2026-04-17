import type { PaginationResult } from '#/types';

import { requestClient } from './request';

export interface DmProductParams {
  model?: string;
  page?: number;
  size?: number;
}

export interface DmProductRes {
  id: number;
  large_class: string;
  product_type?: string;
  apply_area?: string;
  apply_area_desc?: string;
  product_sub?: string;
  sub_name?: string;
  sub_saet?: string;
  model?: string;
  repair_priod?: string;
  attach_train?: string;
  repair_times?: number;
  avg_worktime?: number;
  avg_speed?: number;
  year_days?: number;
  update_time?: string;
  mark?: string;
  prd_big_type?: string;
}

export function getDmProductListApi(params: DmProductParams) {
  return requestClient.get<PaginationResult<DmProductRes>>(
    '/api/v1/datamanage/product',
    {
      params,
      paramsSerializer: 'repeat',
    },
  );
}

export function getDmProductModelApi() {
  return requestClient.get(`/api/v1/datamanage/product/models`);
}

export interface GetProductRunTimeParams {
  year_days?: number;
  avg_worktime?: number;
  avg_speed?: number;
}

export function getProductRunTimeParamsApi(
  model: string,
  product_config_code?: string,
) {
  return requestClient.get<GetProductRunTimeParams>(
    `/api/v1/datamanage/product/by-model/${model}`,
    {
      params: {
        product_config_code,
      },
    },
  );
}
