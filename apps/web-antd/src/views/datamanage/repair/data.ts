import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDmRepairModelApi } from '#/api';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'model',
    label: '修理车型',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => {
        const res = await getDmRepairModelApi();
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
  { field: 'id_repair', title: '修级顺序' },
  { field: 'repair_levels', title: '造修阶段' },
  { field: 'creator', title: '创建人' },
  { field: 'create_time', title: '创建时间' },
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
