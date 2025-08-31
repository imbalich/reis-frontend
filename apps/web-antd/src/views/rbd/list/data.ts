import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { RbdProjectResult } from '#/api';

import { $t } from '@vben/locales';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'model',
    label: '产品型号',
  },
  {
    component: 'Input',
    fieldName: 'task_type',
    label: '任务类型',
  },
  {
    component: 'InputNumber',
    componentProps: {
      style: { width: '100%' },
    },
    fieldName: 'version',
    label: '版本号',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [
        {
          label: '草稿',
          value: 'draft',
        },
        {
          label: '已发布',
          value: 'published',
        },
        {
          label: '已定版',
          value: 'archived',
        },
      ],
    },
    fieldName: 'status',
    label: '项目状态',
  },
  {
    component: 'Input',
    fieldName: 'created_by',
    label: '创建人',
  },
];

export const createProjectSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '项目名称',
    rules: 'required',
  },
  {
    component: 'Textarea',
    componentProps: {
      rows: 3,
      placeholder: '请输入项目描述（可选）',
    },
    fieldName: 'description',
    label: '项目描述',
  },
  {
    component: 'Input',
    fieldName: 'model',
    label: '产品型号',
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: false,
      options: [
        {
          label: '机破',
          value: 'jp',
        },
        {
          label: '临修',
          value: 'lx',
        },
      ],
    },
    fieldName: 'task_type',
    label: '任务类型',
    rules: 'required',
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<RbdProjectResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 60,
    },
    {
      field: 'name',
      title: '项目名称',
      slots: { default: 'name_default' },
    },
    { field: 'model', title: '产品型号' },
    { field: 'task_type', title: '任务类型' },
    { field: 'version', title: '版本号' },
    {
      field: 'status',
      title: '项目状态',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'processing', label: '草稿', value: 'draft' },
          { color: 'success', label: '已发布', value: 'published' },
          { color: 'warning', label: '已定版', value: 'archived' },
        ],
      },
    },
    { field: 'created_by', title: '创建人' },
    {
      field: 'created_time',
      title: $t('common.table.created_time'),
    },
    {
      field: 'updated_time',
      title: $t('common.table.updated_time'),
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 150,
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit',
          {
            code: 'delete',
            disabled: (row: RbdProjectResult) => {
              return row.status === 'archived';
            },
          },
        ],
      },
    },
  ];
}
