import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDmLccRepairPlanByModelApi, getEqualLifetimeModelApi } from '#/api';

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
    rules: 'required',
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
          const res = await getDmLccRepairPlanByModelApi({
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
    component: 'ApiSelect',
    fieldName: 'is_ai',
    label: '是否考虑可用度',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      defaultValue: false,
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
    field: 'level_old',
    title: '原维修周期',
  },
  {
    field: 'year_new',
    title: '推荐维修周期（年）',
  },
  {
    field: 'level_new',
    title: '推荐维修周期',
  },
  {
    field: 'sf',
    title: '对应可靠度/可靠寿命',
  },
  {
    field: 'lcc_result',
    title: '建议',
  },
];
