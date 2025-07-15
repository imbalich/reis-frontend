import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDmDmEbomModelApi } from '#/api';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'prd_no',
    label: '产品型号',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => {
        const res = await getDmDmEbomModelApi();
        return res.map((item: string) => ({
          label: item,
          value: item,
        }));
      },
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
  { field: 'prd_no', title: '产品型号', treeNode: true },
  { field: 'prd_name', title: '产品名称' },
  { field: 'y8_matdescs', title: '物料名称' },
  { field: 'item_id', title: '物料编码' },
  { field: 'bl_quantity', title: '物料总数量' },
  { field: 'prd_level', title: '修造级别' },
  { field: 'y8_knowledgeno', title: '结构树编码' },
  { field: 'y8_configurationcode', title: '构型编码' },
  { field: 'y8_isbh', title: '比偶换件' },
  { field: 'state_now', title: '当前是否启用' },
  { field: 'sync_time', title: '数据解析入库时间' },
];
