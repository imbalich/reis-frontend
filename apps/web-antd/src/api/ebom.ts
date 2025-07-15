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
  y8_knowledgeno?: string;
  attach_dept?: string;
  y8_configurationcode?: string;
  y8_isbh?: string;
  y8_matdescs: string;
  item_id: string;
  state_now?: string;
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
