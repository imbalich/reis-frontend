import type { PaginationResult } from '#/types';

import { requestClient } from './request';

export interface DmReplaceParams {
  model?: string;
  state_now?: boolean;
  page?: number;
  size?: number;
}

export interface DmReplaceRes {
  id: number;
  model: string;
  state_now: boolean;
  part_name: string;
  part_code: string;
  replace_level: string;
  replace_cycle: string;
  replace_num: string;
  replace_unit: string;
  material_code: string;
  mark: string;
}

export function getDmReplaceListApi(params: DmReplaceParams) {
  return requestClient.get<PaginationResult>('/api/v1/datamanage/replace', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmReplaceModelApi() {
  return requestClient.get(`/api/v1/datamanage/replace/models`);
}
