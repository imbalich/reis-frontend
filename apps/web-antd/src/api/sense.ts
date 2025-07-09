import { requestClient } from './request';

export interface SenseSortParams {
  model: string;
  part: string;
  stage: string;
  process_name: string;
  check_project: string;
  check_bezier: string;
  extra_material_names: string;
}

export interface SenseSortResult {
  id: number;
  model: string;
  part: string;
  stage: string;
  process_name: string;
  check_project: string;
  check_bezier: string;
  extra_material_names: string;
  rela_self_value: number;
  check_tools_sign: number;
  self_create_by: number;
  extra_source_code: number;
  extra_supplier: number;
  categorical_analysis: string;
}

export interface DmProcessNameByModelParams {
  product_model?: string;
}

export interface DmByProcessNameParams {
  process_name?: string;
}

export interface DmCheckBezierByProjectParams {
  check_project?: string;
}

export function createSenseSortApi(params: SenseSortParams) {
  return requestClient.post<SenseSortResult>(
    '/api/v1/sense/sort/sense',
    params,
    {
      params,
      paramsSerializer: 'repeat',
    },
  );
}

export function getSenseSortApi(params: SenseSortParams) {
  return requestClient.get('/api/v1/sense/sort/sense', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmProcessNameByModelApi(params: DmProcessNameByModelParams) {
  return requestClient.get(`/api/v1/datamanage/configuration/process_name`, {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmMaterialNameByProcessApi(params: DmByProcessNameParams) {
  return requestClient.get(`/api/v1/datamanage/configuration/material_name`, {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmCheckProjectByProcessApi(params: DmByProcessNameParams) {
  return requestClient.get(`/api/v1/datamanage/pc/check_project`, {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmCheckBezierByProjectApi(
  params: DmCheckBezierByProjectParams,
) {
  return requestClient.get(`/api/v1/datamanage/pc/check_bezier`, {
    params,
    paramsSerializer: 'repeat',
  });
}
