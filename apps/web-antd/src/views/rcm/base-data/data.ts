import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Button } from 'ant-design-vue';

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
    fieldName: 'failure_mode',
    label: '故障模式',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入故障模式',
    },
  },
  {
    component: 'Select',
    fieldName: 'is_key_component',
    label: '是否关键部件',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      placeholder: '请选择是否关键部件',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'is_consumable_part',
    label: '是否耗损型部件',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      placeholder: '请选择是否耗损型部件',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
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
  // { field: 'id', title: 'RCM基础数据ID' },
  { field: 'product_model', title: '产品型号', width: 120 },
  { field: 'derivative_code', title: '派生码', width: 100 },
  { field: 'component_name', title: '部件名称', width: 150 },
  { field: 'component_material_code', title: '零部件物料编码', width: 150 },
  { field: 'failure_mode', title: '故障模式', width: 150 },
  { field: 'source', title: '来源', width: 100 },
  { field: 'is_key_component', title: '是否关键部件', width: 120 },
  { field: 'is_consumable_part', title: '是否耗损型部件', width: 120 },
  { field: 'estimated_failure_rate', title: '故障率预计值(FPMH)', width: 150 },
  {
    field: 'preventive_maintenance_cost',
    title: '增加预防性维修的(万元)',
    width: 150,
  },
  { field: 'lcc_before_improvement', title: '改进前LCC(万元)', width: 150 },
  { field: 'lcc_after_improvement', title: '改进后LCC(万元)', width: 150 },
  { field: 'is_online_status', title: '状态是否可在线', width: 120 },
  {
    field: 'is_trend_rate_limit',
    title: '故障率变化趋势是否达到预警值',
    width: 180,
  },
  { field: 'created_by', title: '创建人', width: 100 },
  { field: 'changed_time', title: '表格修改时间', width: 150 },
  { field: 'created_time', title: '创建时间', width: 150 },
  { field: 'updated_time', title: '更新时间', width: 150 },
];

// 导入表单配置
export const importSchema: VbenFormSchema[] = [
  {
    component: 'Upload',
    fieldName: 'fileList', // 修改为fileList以匹配表单组件的modelPropName配置
    label: '选择文件',
    componentProps: {
      accept: '.xlsx,.xls',
      maxCount: 1,
      multiple: false,
      showUploadList: true,
      beforeUpload: (_file: File) => {
        // 阻止自动上传，由表单提交时处理
        return false;
      },
      onChange: (_info: any) => {
        // 处理文件变化，确保fileList正确更新
      },
    },
    renderComponentContent: () => ({
      default: () => {
        return h(Button, { type: 'primary' }, { default: () => '选择文件' });
      },
    }),
    rules: 'required',
    help: '仅支持 Excel (.xlsx, .xls) 格式，请使用我们提供的导入模板',
  },
  {
    component: 'Divider',
    fieldName: 'divider1',
    componentProps: { orientation: 'left', plain: true },
  },
  {
    component: 'div',
    fieldName: 'usage_guide',
    label:
      '📋 使用步骤：\n1. 点击上方"选择文件"按钮，选择Excel文件\n2. 确保文件格式为.xlsx或.xls，第一行为表头\n3. 必填字段：产品型号、部件名称、零部件物料编码、故障模式\n4. 可选字段：派生码、来源、是否关键部件、是否耗损型部件、故障率预计值、增加预防性维修的、改进前LCC、改进后LCC、状态是否可在线、故障率变化趋势是否达到预警值、创建人、更新时间\n5. 导入将完全覆盖现有数据，请确保数据准确性\n6. 建议在导入前备份现有数据\n\n💡 温馨提示：请使用我们提供的导入模板，避免格式错误',
  },
];
