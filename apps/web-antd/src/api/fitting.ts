import { requestClient } from './request';

export interface fitParams {
  id: number;
  model: number;
  distribution: number;
  alpha: number;
  beta: number;
  gamma: number;
  alpha_1: number;
  beta_1: number;
  alpha_2: number;
  beta_2: number;
  proportion_1: number;
  ds: number;
  mu: number;
  sigma: number;
  lambda_: number;
}

export interface fitmodelParams {
  model: string;
  part?: string;
  input_date?: string;
  method?: string;
  source?: number; // 0:自动,1:手动
}

export function createProductFittingApi(params: fitmodelParams) {
  return requestClient.post('/api/v1/fit/product/fit', params, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function queryProductFittingApi(params: fitmodelParams) {
  return requestClient.get('/api/v1/fit/product/fit', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function createPartFittingApi(params: fitmodelParams) {
  return requestClient.post('/api/v1/fit/part/fit', params, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function queryPartFittingApi(params: fitmodelParams) {
  return requestClient.get('/api/v1/fit/part/fit', {
    params,
    paramsSerializer: 'repeat',
  });
}
