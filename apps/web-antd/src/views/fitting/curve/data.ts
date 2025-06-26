import type { VbenFormSchema } from '#/adapter/form';

import { getDmFailureModelApi, getDmFaultLocationByModelApi } from '#/api';

export const schema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'model',
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
    fieldName: 'part',
    label: '零部件',
    dependencies: {
      triggerFields: ['model'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        filterOption: (input: string, option: any) => {
          // 支持用名称或编码搜索
          return (
            option.label?.toLowerCase().includes(input.toLowerCase()) ||
            option.value?.toLowerCase().includes(input.toLowerCase())
          );
        },
        api: async (params: any) => {
          if (!params?.model) return [];
          const res = await getDmFaultLocationByModelApi({
            product_model: params.model,
          });
          return res.map((item: string) => {
            const match = item.match(/（(.*?)）/);
            const part = match ? match[1] : '';
            return {
              label: item,
              value: part,
            };
          });
        },
        params: {
          model: values.model,
        },
      }),
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'input_date',
    label: '截止日期',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      allowClear: true,
      class: 'w-full',
    },
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      options: [
        { label: '极大似然估计(MLE)', value: 'MLE' },
        { label: '最小二乘估计(LS)', value: 'LS' },
        { label: 'X轴回归(RRX)', value: 'RRX' },
        { label: 'Y轴回归(RRY)', value: 'RRY' },
      ],
    },
    fieldName: 'method',
    label: '计算方法',
  },
];

export const Queryschema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'model',
    label: '产品型号',
  },
  {
    component: 'Input',
    fieldName: 'part',
    label: '零部件',
  },
  {
    component: 'Input',
    fieldName: 'input_date',
    label: '截止时间',
  },
  {
    component: 'Input',
    fieldName: 'method',
    label: '计算方法',
  },
];
