import { requestClient } from './request';

export interface EqualLifeParams {
  model?: string;
  parts?: string[];
  target_sf?: number;
  step_start?: number;
  step_end?: number;
}

export interface EqualLifeRes {
  part_name?: string;
  part?: string;
  // time_point?: number;
  // equal_lifetime_point?: string[];
  original_pdf?: number;
  optimized_pdf?: number;
  original_equal_point_pdf: number;
  optimized_equal_point_pdf: number;
  need_optimization: boolean;
  category: string;
  equal_lifetime_t_year: string;
  rapair_plan: string;
}

export interface EqualLifePartsByModelParams {
  model?: string;
}

export function createEqualLifeApi(params: EqualLifeParams) {
  return requestClient.post('/api/v1/lifetime/equal_lifetime', params, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function getEqualLifeApi(params: EqualLifeParams) {
  return requestClient.get('/api/v1/lifetime/equal_lifetime', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getEqualLifetimeModelApi() {
  return requestClient.get(`/api/v1/lifetime/equal_lifetime/models`);
}

export function getEqualLifetimePartsApi(params: EqualLifePartsByModelParams) {
  return requestClient.get(`/api/v1/lifetime/equal_lifetime/parts`, {
    params,
    paramsSerializer: 'repeat',
  });
}
