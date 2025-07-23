import type { VbenFormSchema } from '#/adapter/form';

import { getOptModelApi, getOptPartsApi } from '#/api';

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
        const res = await getOptModelApi();
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
        api: async (params: any) => {
          // params.model 就是依赖字段
          if (!params?.model) return [];
          const res = await getOptPartsApi({
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
    component: 'Input',
    fieldName: 'pm_price',
    label: 'PM价格',
  },
  {
    component: 'Input',
    fieldName: 'cm_price',
    label: 'CM价格',
  },
];
