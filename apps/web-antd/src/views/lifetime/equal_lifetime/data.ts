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
      defaultValue: 0.95,
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
      defaultValue: 0.95,
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
  // { field: 'seq', title: '序号', type: 'seq', width: 40 },
  {
    field: 'category',
    title: '类别',
    formatter: ({ cellValue }) => {
      switch (cellValue) {
        case 'A': {
          return '组1';
        }
        case 'B': {
          return '组2';
        }
        case 'C': {
          return '组3';
        }
        case 'D': {
          return '组4';
        }
        default: {
          return cellValue;
        }
      }
    },
  },
  // { field: 'equal_lifetime_t_year', title: '寿命阶段', width: 100 },
  {
    title: '相似产品',
    children: [
      {
        field: 'part_name',
        title: '零部件名称',
      },
      {
        field: 'part',
        title: '物料编码',
      },
      {
        field: 'rapair_plan',
        title: '维修周期',
      },
      {
        field: 'original_pdf',
        title: 'FPMH(维修周期）',
      },
    ],
  },
  // {
  //   field: 'optimized_pdf',
  //   title: '优化后FPMH(t0)',
  //   formatter: ({ cellValue }) => cellValue ?? '---',
  // },
  // {
  //   field: 'original_equal_point_pdf',
  //   title: '相似产品FPMH(t)',
  //   formatter: ({ cellValue }) => cellValue ?? '---',
  // },
  {
    title: '新产品',
    children: [
      {
        field: 'equal_lifetime_t_year',
        title: '推荐维修周期',
      },
      {
        field: 'optimized_equal_point_pdf',
        title: 'FPMH(推荐维修周期)',
        formatter: ({ cellValue }) => cellValue ?? '---',
      },
    ],
  },
  // {
  //   field: 'rapair_plan',
  //   title: '推荐维修周期',
  //   formatter: ({ row }) => {
  //     return `${row.rapair_plan}维护`;
  //   },
  // },
  // {
  //   field: 'need_optimization',
  //   title: '建议',
  //   formatter: ({ row }) => {
  //     return row.need_optimization ? '优化' : '不优化';
  //   },
  // },
];
