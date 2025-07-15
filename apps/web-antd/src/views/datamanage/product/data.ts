import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDmProductModelApi } from '#/api';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'model',
    label: '产品型号',
    componentProps: {
      allowClear: true,
      showSearch: true, // 显示搜索框
      class: 'w-full', // w-full 表示组件宽度 100% 铺满容器
      api: async () => {
        const res = await getDmProductModelApi();
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
  { field: 'model', title: '产品型号' },
  { field: 'sub_saet', title: '产品系列' },
  { field: 'repair_priod', title: '修理周期' },
  { field: 'repair_times', title: '修级间隔天数' },
  { field: 'avg_worktime', title: '日均工作小时' },
  { field: 'avg_speed', title: '平均时速' },
  { field: 'year_days', title: '年运行天数' },
  { field: 'large_class', title: '大类' },
  { field: 'product_type', title: '产品类型' },
  { field: 'apply_area', title: '应用领域' },
  { field: 'apply_area_desc', title: '应用领域（细分）' },
  { field: 'product_sub', title: '产品子类' },
  { field: 'sub_name', title: '产品名称' },
  { field: 'attach_train', title: '配属车型' },
  { field: 'update_time', title: '变更时间' },
  { field: 'mark', title: '备注' },
  { field: 'prd_big_type', title: '自定义类别' },
];
