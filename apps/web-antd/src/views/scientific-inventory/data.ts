import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import {
  getCalculationMethodOptionsApi,
  getSparePartOptionsApi,
  getWarehouseOptionsApi,
} from '#/api/scientific-inventory';

// 查询表单配置
export const querySchema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    fieldName: 'warehouse',
    label: '库房',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请选择库房',
      filterOption: (input: string, option: any) => {
        const keyword = (input || '').toLowerCase();
        const label = option?.label?.toLowerCase?.() ?? '';
        const value = option?.value?.toLowerCase?.() ?? '';
        return label.includes(keyword) || value.includes(keyword);
      },
      api: async () => {
        const res = await getWarehouseOptionsApi();
        // 后端返回格式: [['编码', '名称'], ...]
        // res本身就是数组，不是 {data: [...]} 格式
        // 转换为前端需要的格式: [{value: '编码', label: '编码-名称'}]
        return res.map((item: [string, string]) => ({
          value: item[0], // 库房编码
          label: `${item[0]}-${item[1]}`, // 编码-名称格式
        }));
      },
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'spare_part',
    label: '备品',
    dependencies: {
      triggerFields: ['warehouse'],
      componentProps: (values) => ({
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        placeholder: '请选择备品',
        filterOption: (input: string, option: any) => {
          const keyword = (input || '').toLowerCase();
          const label = option?.label?.toLowerCase?.() ?? '';
          const value = option?.value?.toLowerCase?.() ?? '';
          return label.includes(keyword) || value.includes(keyword);
        },
        api: async (params: any) => {
          if (!params?.warehouse) return [];
          const res = await getSparePartOptionsApi(params.warehouse);
          // 后端返回格式: [['编码', '名称'], ...]
          // res本身就是数组，不是 {data: [...]} 格式
          // 转换为前端需要的格式: [{value: '编码', label: '编码-名称'}]
          return res.map((item: [string, string]) => ({
            value: item[0], // 备品编码
            label: `${item[0]}-${item[1]}`, // 编码-名称格式
          }));
        },
        params: {
          warehouse: values.warehouse,
        },
      }),
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'calculation_method',
    label: '计算方法',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请选择计算方法',
      api: async () => {
        const res = await getCalculationMethodOptionsApi();
        // 后端返回格式: ['方法1', '方法2', ...]
        // res本身就是数组，不是 {data: [...]} 格式
        // 转换为前端需要的格式: [{value: '方法1', label: '方法1'}]
        return res.map((item: string) => ({
          value: item,
          label: item,
        }));
      },
    },
  },
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
  { field: 'max_failure_count', title: '库房最小备件数量', width: 150 },
  { field: 'required_quantity', title: '库房未来180天预计值', width: 120 },
  { field: 'calculation_method', title: '计算方法', width: 120 },
  { field: 'time_interval_days', title: '时间间隔（天）', width: 130 },
  { field: 'input_date', title: '计算截止日期', width: 130 },
  { field: 'created_time', title: '创建时间', width: 150 },
];
