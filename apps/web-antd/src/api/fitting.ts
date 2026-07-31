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
  product_config_code?: string;
  part?: string;
  input_date?: string;
  method?: string;
  source?: number; // 0:自动,1:手动
}

export interface fitCalculateParams {
  model: string;
  product_config_code?: string;
  part: string;
  input_time1: string;
  input_time2: string;
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

export function queryPartCalculateApi(params: fitCalculateParams) {
  return requestClient.get('/api/v1/fit/part/fit/equivalent_lamda', {
    params,
    paramsSerializer: 'repeat',
  });
}


// Aaron于2026-07-31新增：Aaron版本拟合接口
// 新增原因：新增寿命曲线拟合-Aaron页面，需要调用后端fit-aaron分支
// 新增作用：前端Aaron页面和旧寿命曲线拟合页面接口隔离
export function createProductFittingAaronApi(params: fitmodelParams) {
  return requestClient.post('/api/v1/fit-aaron/product/fit', params, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function queryProductFittingAaronApi(params: fitmodelParams) {
  return requestClient.get('/api/v1/fit-aaron/product/fit', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function createPartFittingAaronApi(params: fitmodelParams) {
  return requestClient.post('/api/v1/fit-aaron/part/fit', params, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function queryPartFittingAaronApi(params: fitmodelParams) {
  return requestClient.get('/api/v1/fit-aaron/part/fit', {
    params,
    paramsSerializer: 'repeat',
  });
}
