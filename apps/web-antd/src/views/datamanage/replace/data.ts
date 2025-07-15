import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDmReplaceModelApi } from '#/api';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'model',
    label: '产品型号',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      api: async () => {
        const res = await getDmReplaceModelApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'state_now',
    label: '启用状态',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => [
        { label: '启用', value: true },
        { label: '禁用', value: false },
      ],
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
  { field: 'model', title: '产品型号' },
  { field: 'part_name', title: '零部件名称' },
  { field: 'part_code', title: '零部件物料编码' },
  { field: 'replace_level', title: '修造级别' },
  { field: 'replace_cycle', title: '必换周期' },
  { field: 'replace_num', title: '必换数量' },
  { field: 'replace_unit', title: '必换数量单位' },
  { field: 'material_code', title: '物料编码' },
  { field: 'mark', title: '备注' },
  {
    field: 'state_now',
    title: '当前是否启用',
    cellRender: {
      name: 'CellTag',
      options: [
        { color: 'success', label: '启用', value: true },
        { color: 'error', label: '禁用', value: false },
      ],
    },
  },
];
