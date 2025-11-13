import { requestClient } from './request';

export interface DmEbomParams {
  id?: string;
  partid?: string;
  level1?: number;
  prd_no?: string;
  item_id?: string;
  hasChild?: boolean;
  children?: DmEbomRes[];
}

export interface DmEbomRes {
  id: string;
  partid: string;
  level1: number;
  prd_no?: string;
  prd_name?: string;
  bl_quantity?: string;
  prd_level?: string;
  y8_matname: string;
  y8_matbnum1: string;
  state_now?: string;
  sync_time?: string;
  prd_code?: string;
  prd_vision?: string;
}

export function getDmEbomListApi(params: DmEbomParams) {
  return requestClient.get('/api/v1/datamanage/ebom', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmDmEbomModelApi() {
  return requestClient.get(`/api/v1/datamanage/ebom/models`);
}
