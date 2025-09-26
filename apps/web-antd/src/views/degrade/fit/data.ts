import type { VbenFormSchema } from '#/adapter/form';

import {
  getDmCheckBezierByModelApi,
  getDmDegradeModelApi,
  getDmProductNoByModelApi,
} from '#/api';

/**
 * 查询表单配置
 */
export const querySchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'product_model',
    label: '产品型号',
    rules: 'required',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => {
        const res = await getDmDegradeModelApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'check_bezier',
    label: '检测项点',
    rules: 'required',
    dependencies: {
      triggerFields: ['product_model'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        api: async (params: any) => {
          if (!params?.product_model) return [];
          const res = await getDmCheckBezierByModelApi({
            product_model: params.product_model,
          });
          const options = res.map((item: string) => ({
            label: item,
            value: item,
          }));
          return options;
        },
        params: {
          product_model: values.product_model,
        },
      }),
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'product_no',
    label: '产品编号',
    dependencies: {
      triggerFields: ['product_model'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        api: async (params: any) => {
          if (!params?.product_model) return [];
          const res = await getDmProductNoByModelApi({
            product_model: params.product_model,
          });
          const options = res.map((item: string) => ({
            label: item,
            value: item,
          }));
          return options;
        },
        params: {
          product_model: values.product_model,
        },
      }),
    },
  },
  {
    component: 'Input',
    fieldName: 'failure_threshold',
    label: '失效阈值',
    // description: '若选择产品型号，请填入失效阈值',
  },
];

/**
 * 函数类型映射表
 */
export const functionTypeMap: Record<string, string> = {
  linear: '线性函数',
  quadratic: '二次多项式函数',
  cubic: '三次多项式函数',
  power_law: '幂函数',
  logarithmic: '对数函数',
  exponential: '指数函数',
  sigmoid: 'Sigmoid函数',
};
