import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDmFailureModelApi, getDmFaultLocationByModelApi } from '#/api';

/**
 * 查询表单配置
 */
export const similarProductSchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'model',
    label: '产品型号',
    rules: 'required',
    componentProps: {
      allowClear: true, // 允许清除
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => {
        const res = await getDmFailureModelApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'part',
    label: '零部件名称',
    rules: 'required',
    dependencies: {
      triggerFields: ['model'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        // 添加 filterOption 配置，输入框匹配名称
        filterOption: (input: string, option: any) => {
          return (
            option.label?.toLowerCase().includes(input.toLowerCase()) ||
            option.value?.toLowerCase().includes(input.toLowerCase())
          );
        },
        api: async (params: any) => {
          // params.product_model 就是依赖字段
          if (!params?.model) return [];
          const res = await getDmFaultLocationByModelApi({
            product_model: params.model,
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
  // {
  //   component: 'Input',
  //   fieldName: `零部件`,
  //   label: '零部件数量',
  //   componentProps: {
  //     placeholder: '请输入数量',
  //   },
  // },
];

/**
 * 生成批量添加的表单项
 * @param timestamp 时间戳，用于生成唯一的字段名
 * @returns 批量添加的表单项配置
 */
export const generateBatchFormItems = (timestamp: number): VbenFormSchema[] => [
  {
    component: 'ApiSelect',
    fieldName: `model_${timestamp}`,
    label: '产品型号',
    rules: 'required',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      api: async () => {
        const res = await getDmFailureModelApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: `part_${timestamp}`,
    label: '零部件名称',
    rules: 'required',
    dependencies: {
      triggerFields: [`model_${timestamp}`],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        // 添加 filterOption 配置，输入框匹配名称
        filterOption: (input: string, option: any) => {
          return (
            option.label?.toLowerCase().includes(input.toLowerCase()) ||
            option.value?.toLowerCase().includes(input.toLowerCase())
          );
        },
        api: async (params: any) => {
          if (!params?.[`model_${timestamp}`]) return [];
          const res = await getDmFaultLocationByModelApi({
            product_model: params[`model_${timestamp}`],
          });
          return res.map((item: string) => ({
            label: `${item[0]}(${item[1]})`,
            value: item[1],
          }));
        },
        params: {
          [`model_${timestamp}`]: values[`model_${timestamp}`],
        },
      }),
    },
  },
  // {
  //   component: 'Input',
  //   fieldName: `part_name_${timestamp}`,
  //   label: '零部件数量',
  //   componentProps: {
  //     placeholder: '请输入零部件数量',
  //   },
  // },
];

// 新产品表单schema
export const newProductSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'lirun_ratio',
    label: '利润率(%)',
    componentProps: {
      min: 0,
      defaultValue: 10,
      placeholder: '请输入利润率',
    },
  },
  {
    component: 'Input',
    fieldName: 'reserved_value',
    label: '预留故障占比',
    componentProps: {
      min: 0,
      defaultValue: 0.2,
      // precision: 2,
      placeholder: '请输入预留故障占比',
    },
  },
  {
    component: 'Input',
    fieldName: 'fpmh_user',
    label: 'FPMH(用户)',
    rules: 'required',
    componentProps: {
      min: 0,
      // precision: 4,
      placeholder: '请输入FPMH值',
    },
  },
  {
    component: 'Input',
    fieldName: 'shou_cost',
    label: '产品售价(元）',
    rules: 'required',
    componentProps: {
      min: 0,
      // precision: 2,
      placeholder: '请输入MTTR值',
    },
  },
  {
    component: 'Input',
    fieldName: 'yan_cost',
    label: '研发费(元)',
    rules: 'required',
    componentProps: {
      min: 0,
      // precision: 2,
      placeholder: '请输入研发费用',
    },
  },
  {
    component: 'Input',
    fieldName: 'order',
    label: '订单数量(个)',
    rules: 'required',
    componentProps: {
      min: 0,
      // precision: 2,
      placeholder: '请输入订单数量',
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'seq', title: '序号', type: 'seq', width: 100 },
  {
    field: 'plan',
    title: '方案',
    formatter: ({ row }) => `方案${row.plan}`,
  },
  {
    field: 'fpmh_pre',
    title: 'FPMH均值',
  },
  {
    field: 'lcc_ratio',
    title: 'LCC评估值',
  },
  {
    field: 'sort',
    title: '最优方案排序',
  },
  {
    field: 'fpmh_result',
    title: '可靠性指标是否满足用户要求',
    width: 200,
    formatter: ({ row }) => {
      // 保留原始值到 data-attr
      return row.fpmh_result ? '满足' : '不满足';
    },
  },
];
