import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

// 查询表单配置
export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'calculation_id',
    label: '计算批次ID',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入计算批次ID',
    },
  },
  {
    component: 'Input',
    fieldName: 'warehouse_code',
    label: '库房编码',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入库房编码',
    },
  },
  {
    component: 'Input',
    fieldName: 'warehouse_name',
    label: '库房名称',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入库房名称',
    },
  },
  {
    component: 'Input',
    fieldName: 'spare_part_code',
    label: '备品编码',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入备品编码',
    },
  },
  {
    component: 'Input',
    fieldName: 'spare_part_name',
    label: '备品名称',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入备品名称',
    },
  },
  {
    component: 'Select',
    fieldName: 'calculation_method',
    label: '计算方法',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      placeholder: '请选择计算方法',
      options: [
        { label: 'fitted - 正常拟合', value: 'fitted' },
        { label: 'exponential_fit - 指数分布拟合', value: 'exponential_fit' },
        {
          label: 'exponential_fit_failed - 指数分布拟合失败',
          value: 'exponential_fit_failed',
        },
        { label: 'insufficient_data - 数据不足', value: 'insufficient_data' },
        { label: 'default - 默认方法', value: 'default' },
      ],
    },
  },
  {
    component: 'RangePicker',
    fieldName: 'time_range',
    label: '创建时间',
    componentProps: {
      format: 'YYYY-MM-DD',
      showTime: true,
      valueFormat: 'YYYY-MM-DD',
    },
  },
];

// 表格列配置
export const columns: VxeGridProps['columns'] = [
  { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
  {
    field: 'seq',
    title: '序号',
    type: 'seq',
    width: 50,
  },
  { field: 'calculation_id', title: '计算批次ID', width: 150 },
  { field: 'warehouse_code', title: '库房编码', width: 120 },
  { field: 'warehouse_name', title: '库房名称', width: 150 },
  { field: 'spare_part_code', title: '备品编码', width: 150 },
  { field: 'spare_part_name', title: '备品名称', width: 150 },
  { field: 'required_quantity', title: '最小备件数量', width: 120 },
  { field: 'calculation_method', title: '计算方法', width: 120 },
  { field: 'time_interval_days', title: '时间间隔（天）', width: 130 },
  { field: 'input_date', title: '计算截止日期', width: 130 },
  { field: 'created_time', title: '创建时间', width: 150 },
];
