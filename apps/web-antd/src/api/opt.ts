import { requestClient } from './request';

export interface OptParams {
  model?: string;
  part?: string;
  cm_price?: number;
  pm_price?: number;
}

export interface OptPartsByModelParams {
  model?: string;
}

export function createOptApi(params: OptParams) {
  return requestClient.post('/api/v1/opt/part', params, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function getOptModelApi() {
  return requestClient.get(`/api/v1/opt/part/models`);
}

export function getOptPartsApi(params: OptPartsByModelParams) {
  return requestClient.get(`/api/v1/opt/part/parts`, {
    params,
    paramsSerializer: 'repeat',
  });
}
