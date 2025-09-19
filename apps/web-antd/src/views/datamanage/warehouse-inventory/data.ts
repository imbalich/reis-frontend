import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';
import { Button } from 'ant-design-vue';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'warehouse_code',
    label: '库房编号',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入库房编号',
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
    fieldName: 'part_code',
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
    fieldName: 'part_name',
    label: '零部件名称',
    componentProps: {
      allowClear: true,
      showSearch: true,
      class: 'w-full',
      placeholder: '请输入零部件名称',
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
  {
    field: 'seq',
    title: '序号',
    type: 'seq',
    width: 50,
  },
  // { field: 'id', title: '库房备品清单ID' },
  { field: 'warehouse_code', title: '库房编号' },
  { field: 'warehouse_name', title: '库房名称' },
  { field: 'part_code', title: '零部件物料编码' },
  { field: 'part_name', title: '零部件名称' },
  { field: 'default_quantity', title: '默认数量' },
  { field: 'created_by', title: '创建人' },
  { field: 'changed_time', title: '表格修改时间' },
  { field: 'created_time', title: '创建时间' },
  { field: 'updated_time', title: '更新时间' },
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
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },
  {
    component: 'div',
    fieldName: 'usage_guide',
    label:
      '📋 使用步骤：\n1. 点击上方"选择文件"按钮，选择Excel文件\n2. 确保文件格式为.xlsx或.xls，第一行为表头\n3. 必填字段：库房编号、零部件物料编码\n4. 可选字段：库房名称、零部件名称、默认数量、创建人、更新时间\n5. 导入将覆盖现有数据，请确保数据准确性\n6. 建议在导入前备份现有数据\n\n💡 温馨提示：请使用我们提供的导入模板，避免格式错误',
  },
];
