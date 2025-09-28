import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

// 查询表单配置
export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'product_model',
    label: '产品型号',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入产品型号',
    },
  },
  {
    component: 'Input',
    fieldName: 'component_name',
    label: '部件名称',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入部件名称',
    },
  },
  {
    component: 'Input',
    fieldName: 'component_material_code',
    label: '零部件物料编码',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入零部件物料编码',
    },
  },
  {
    component: 'Input',
    fieldName: 'final_result',
    label: '最终计算结果',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入最终计算结果',
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
  { field: 'id', title: '结果ID', width: 80 },
  { field: 'base_data_id', title: '基础数据ID', width: 100 },
  { field: 'product_model', title: '产品型号', width: 120 },
  { field: 'component_name', title: '部件名称', width: 150 },
  { field: 'component_material_code', title: '零部件物料编码', width: 150 },
  { field: 'failure_mode', title: '故障模式', width: 150 },
  { field: 'final_result', title: '最终计算结果', width: 150 },
  {
    field: 'calculation_status',
    title: '计算状态',
    width: 120,
    cellRender: {
      name: 'VbenTag',
      props: ({ row }: any) => {
        const status = row.calculation_status;
        const statusMap: Record<string, { color: string; text: string }> = {
          success: { color: 'success', text: '成功' },
          failed: { color: 'error', text: '失败' },
          processing: { color: 'processing', text: '计算中' },
          pending: { color: 'default', text: '待计算' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return {
          color: config.color,
          content: config.text,
        };
      },
    },
  },
  {
    field: 'calculation_process',
    title: '计算过程记录',
    width: 200,
    showOverflow: 'tooltip',
  },
  {
    field: 'error_message',
    title: '错误信息',
    width: 200,
    showOverflow: 'tooltip',
    cellRender: {
      name: 'VbenTag',
      props: ({ row }: any) => {
        if (!row.error_message) {
          return null;
        }
        return {
          color: 'error',
          content: row.error_message,
        };
      },
    },
  },
  { field: 'calculation_time', title: '计算时间', width: 150 },
  { field: 'created_time', title: '创建时间', width: 150 },
  { field: 'updated_time', title: '更新时间', width: 150 },
];
