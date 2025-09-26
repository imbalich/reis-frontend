import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getEqualLifetimeModelApi, getEqualLifetimePartsApi } from '#/api';

export const schema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'model',
    label: '产品型号',
    rules: 'required',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => {
        const res = await getEqualLifetimeModelApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'parts',
    label: '零部件',
    dependencies: {
      triggerFields: ['model'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        mode: 'multiple',
        maxTagCount: 2, // 显示所有选中的值
        // 添加 filterOption 配置，输入框匹配名称
        filterOption: (input: string, option: any) => {
          return (
            option.label?.toLowerCase().includes(input.toLowerCase()) ||
            option.value?.toLowerCase().includes(input.toLowerCase())
          );
        },
        api: async (params: any) => {
          // params.model 就是依赖字段
          if (!params?.model) return [];
          const res = await getEqualLifetimePartsApi({
            model: params.model,
          });
          return res.map((item: string) => ({
            label: `${item[0]}(${item[1]})`,
            value: item[1],
          }));
        },
        params: {
          model: values.model,
        },
      }),
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'target_sf',
    label: '目标值(R(t))',
    componentProps: {
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.9,
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'step_start',
    label: '区间起点(R(t))',
    componentProps: {
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.9,
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'step_end',
    label: '区间终点(R(t))',
    componentProps: {
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.99,
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'seq', title: '序号', type: 'seq', width: 40 },
  {
    field: 'part_name',
    title: '零部件名称',
  },
  {
    field: 'part',
    title: '物料编码',
  },
  {
    field: 'original_pdf',
    title: '优化前FPMH(t0)',
  },
  {
    field: 'optimized_pdf',
    title: '优化后FPMH(t0)',
    formatter: ({ cellValue }) => cellValue ?? '---',
  },
  {
    field: 'original_equal_point_pdf',
    title: '优化前FPMH(t)',
    formatter: ({ cellValue }) => cellValue ?? '---',
  },
  {
    field: 'optimized_equal_point_pdf',
    title: '优化后FPMH(t)',
    formatter: ({ cellValue }) => cellValue ?? '---',
  },
  {
    field: 'need_optimization',
    title: '是否需要优化',
    formatter: ({ row }) => {
      return row.need_optimization ? '是' : '否';
    },
  },
];
