import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDmDespatchModelApi, getDmDespatchRepairLevelApi } from '#/api';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'model',
    label: '产品型号',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => {
        const res = await getDmDespatchModelApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'repair_level',
    label: '修理级别',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      api: async () => {
        const res = await getDmDespatchRepairLevelApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'Input',
    fieldName: 'identifier',
    label: '物料编码',
  },
  {
    component: 'RangePicker',
    fieldName: 'time_range',
    label: '出厂时间范围',
    componentProps: {
      format: 'YYYY-MM-DD',
      showTime: true,
      valueFormat: 'YYYY-MM-DD', // 关键属性
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
  {
    field: 'seq',
    title: '序号',
    type: 'seq',
    width: 50,
  },
  { field: 'model', title: '产品型号' },
  { field: 'identifier', title: '物料编码' },
  { field: 'repair_level', title: '修理级别' },
  { field: 'life_cycle_time', title: '出厂日期' },
  { field: 'repair_level_num', title: '修级序号' },
  { field: 'attach_company', title: '配属路局' },
  { field: 'attach_dept', title: '配属路段' },
  { field: 'cust_name', title: '客户名称' },
  { field: 'dopt_name', title: '库房名称' },
  { field: 'factory_name', title: '工厂名称' },
  { field: 'date_source', title: '数据来源' },
  { field: 'sync_time', title: '创建时间' },
];
