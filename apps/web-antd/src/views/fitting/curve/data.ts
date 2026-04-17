import type { VbenFormSchema } from '#/adapter/form';
import type { DmFailureDimensionPair } from '#/api';

import {
  getDmFailureDimensionPairsApi,
  getDmFailureModelApi,
  getDmFaultLocationByModelApi,
} from '#/api';

export const schema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'model',
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
    fieldName: 'product_config_code',
    label: '派生码',
    rules: 'required',
    dependencies: {
      triggerFields: ['model'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        api: async (params: { model?: string }) => {
          if (!params?.model) return [];
          const res = await getDmFailureDimensionPairsApi();
          return res
            .filter(
              (item: DmFailureDimensionPair) =>
                item[0] === params.model && !!item[1],
            )
            .map((item: DmFailureDimensionPair) => ({
              label: item[1] as string,
              value: item[1] as string,
            }));
        },
        params: {
          model: values.model,
        },
      }),
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'part',
    label: '零部件',
    dependencies: {
      triggerFields: ['model', 'product_config_code'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        filterOption: (input: string, option: any) => {
          return (
            option.label?.toLowerCase().includes(input.toLowerCase()) ||
            option.value?.toLowerCase().includes(input.toLowerCase())
          );
        },
        api: async (params: any) => {
          if (!params?.model || !params?.product_config_code) return [];
          const res = await getDmFaultLocationByModelApi({
            product_model: params.model,
            product_config_code: params.product_config_code,
          });
          return res.map((item: string[]) => ({
            label: `${item[0]}(${item[1]})`,
            value: item[1],
          }));
        },
        params: {
          model: values.model,
          product_config_code: values.product_config_code,
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
    fieldName: 'method',
    label: '计算方法',
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
    fieldName: 'product_config_code',
    label: '派生码',
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

export const calculateSchema: VbenFormSchema[] = [
  {
    component: 'DatePicker',
    fieldName: 'input_time1',
    label: '基准日期',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      allowClear: true,
      class: 'w-full',
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'input_time2',
    label: '对比日期',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      allowClear: true,
      class: 'w-full',
    },
  },
];
