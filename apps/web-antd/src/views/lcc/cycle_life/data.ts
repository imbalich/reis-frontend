import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDmFailureModelApi, getDmFaultLocationByModelApi } from '#/api';

/**
 * 查询表单配置
 */
export const querySchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'model',
    label: '产品型号',
    rules: 'required',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      // 添加 filterOption 配置，输入框匹配名称
      filterOption: (input: string, option: any) => {
        return (
          option.label?.toLowerCase().includes(input.toLowerCase()) ||
          option.value?.toLowerCase().includes(input.toLowerCase())
        );
      },
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
          label: `${item[0]}(${item[1]})`,
          value: item[1],
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
];

export const columns: VxeGridProps['columns'] = [
  { field: 'seq', title: '序号', type: 'seq', width: 40 },
  {
    field: 'part_name',
    title: '部件名称',
  },
  {
    field: 'model',
    title: '产品型号',
  },
  {
    field: 'part_number',
    title: '部件数量',
  },
  {
    field: 'falut_number',
    title: '故障次数',
  },
  {
    field: 'replace_number',
    title: '必换次数',
  },
  {
    field: 'totle_number',
    title: '全寿命周期所需部件数量',
    width: 200,
  },
  {
    field: 'build_repair_retio',
    title: '造修比',
  },
  {
    field: 'order',
    title: '排名(按造修比降序)',
    width: 200,
  },
];
