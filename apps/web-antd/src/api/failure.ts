import type { PaginationResult } from '#/types';

import { requestClient } from './request';

export interface DmFailureParams {
  product_model?: string;
  fault_location?: string;
  fault_material_code?: string;
  product_lifetime_stage?: string;
  product_number?: string;
  fault_mode?: string;
  time_range?: Array<string>;
  is_zero_distance?: number;
  page?: number;
  size?: number;
}

export interface DmFailureRes {
  report_id: string;
  product_model: string;
  fault_location: string;
  fault_material_code: string;
  product_lifetime_stage: string;
  product_number: string;
  fault_type: string;
  fault_mode: string;
  discovery_date: string;
  manufacturing_date?: string;
  last_maintenance_date?: string;
  fault_interval_start?: string;
  fault_interval_end?: string;
  fault_part_number?: string;
  replacement_part_number?: string;
  disposal_end_date?: string;
  impact_level?: string;
  maintenance_location?: string;
  allotment_status?: string;
  final_fault_responsibility?: string;
  supplier?: string;
  is_zero_distance?: number;
  is_online?: string;
}

export interface DmFaultLocationByModelParams {
  product_model?: string;
}

export function getDmFailureListApi(params: DmFailureParams) {
  return requestClient.get<PaginationResult>('/api/v1/datamanage/failure', {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmFailureModelApi() {
  return requestClient.get(`/api/v1/datamanage/failure/product_model`);
}

export function getDmFaultLocationByModelApi(
  params: DmFaultLocationByModelParams,
) {
  return requestClient.get(`/api/v1/datamanage/failure/fault_location`, {
    params,
    paramsSerializer: 'repeat',
  });
}

export function getDmLifetimeStageApi() {
  return requestClient.get(`/api/v1/datamanage/failure/product_lifetime_stage`);
}

export function getDmFaultModeApi() {
  return requestClient.get(`/api/v1/datamanage/failure/fault_mode`);
}
