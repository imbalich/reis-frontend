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
    component: 'ApiSelect',
    fieldName: 'warehouse',
    label: '库房',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      placeholder: '请选择库房',
      showSearch: true,
      filterOption: true,
      api: () => import('#/api/scientific-inventory').then(({ getWarehouseOptionsApi }) =>
        getWarehouseOptionsApi().then(res => res.data)
      ),
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'spare_part',
    label: '备品',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      placeholder: '请选择备品',
      showSearch: true,
      filterOption: true,
      api: ({ formValues }: any) => {
        const warehouseCode = formValues?.warehouse;
        return import('#/api/scientific-inventory').then(({ getSparePartOptionsApi }) =>
          getSparePartOptionsApi(warehouseCode).then(res => res.data)
        );
      },
      dependencies: ['warehouse'], // 依赖库房字段变化
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'calculation_method',
    label: '计算方法',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      placeholder: '请选择计算方法',
      showSearch: true,
      filterOption: true,
      api: () => import('#/api/scientific-inventory').then(({ getCalculationMethodOptionsApi }) =>
        getCalculationMethodOptionsApi().then(res => res.data)
      ),
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
