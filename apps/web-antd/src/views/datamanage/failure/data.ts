import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import {
  getDmFailureModelApi,
  getDmFaultLocationByModelApi,
  getDmFaultModeApi,
  getDmLifetimeStageApi,
} from '#/api';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'product_model',
    label: '产品型号',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => {
        const res = await getDmFailureModelApi();
        // console.log(res);
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'fault_location',
    label: '终判故障部位',
    dependencies: {
      triggerFields: ['product_model'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        api: async (params: any) => {
          // params.product_model 就是依赖字段
          if (!params?.product_model) return [];
          const res = await getDmFaultLocationByModelApi({
            product_model: params.product_model,
          });
          return res.map((item: string) => ({
            label: item,
            value: item.split('（')[0],
          }));
        },
        params: {
          product_model: values.product_model,
        },
      }),
    },
  },
  {
    component: 'Input',
    fieldName: 'fault_material_code',
    label: '故障物料编码',
  },
  {
    component: 'ApiSelect',
    fieldName: 'product_lifetime_stage',
    label: '产品寿命阶段',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      api: async () => {
        const res = await getDmLifetimeStageApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'Input',
    fieldName: 'product_number',
    label: '产品编号',
  },
  {
    component: 'ApiSelect',
    fieldName: 'fault_mode',
    label: '终判故障模式',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      api: async () => {
        const res = await getDmFaultModeApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'RangePicker',
    fieldName: 'time_range',
    label: '故障发现时间',
    componentProps: {
      format: 'YYYY-MM-DD',
      showTime: true,
      valueFormat: 'YYYY-MM-DD', // 关键属性
    },
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      showSearch: true,
      options: [
        {
          label: '是',
          value: 1,
        },
        {
          label: '否',
          value: 0,
        },
      ],
    },
    fieldName: 'is_zero_distance',
    label: '是否零公里',
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
  { field: 'product_model', title: '产品型号', width: 150 },
  { field: 'fault_location', title: '终判故障部位' },
  { field: 'fault_material_code', title: '故障物料编码' },
  { field: 'product_lifetime_stage', title: '产品寿命阶段' },
  { field: 'product_number', title: '产品编号' },
  { field: 'fault_type', title: '终判故障类型' },
  { field: 'fault_mode', title: '终判故障模式' },
  { field: 'discovery_date', title: '故障发现时间' },
  { field: 'manufacturing_date', title: '新造出厂日期' },
  { field: 'last_maintenance_date', title: '最近检修出厂日期' },
  { field: 'fault_interval_start', title: '故障区间（起点）' },
  { field: 'fault_interval_end', title: '故障区间（终点）' },
  { field: 'fault_part_number', title: '故障件编号' },
  { field: 'replacement_part_number', title: '更换件编号' },
  { field: 'disposal_end_date', title: '处置完成日期' },
  { field: 'impact_level', title: '影响级别' },
  { field: 'maintenance_location', title: '检修地点' },
  { field: 'allotment_status', title: '配属状态' },
  { field: 'final_fault_responsibility', title: '最终判责' },
  { field: 'supplier', title: '供应商' },
  { field: 'is_zero_distance', title: '是否零公里' },
  { field: 'is_online', title: '在线/返修' },
];
