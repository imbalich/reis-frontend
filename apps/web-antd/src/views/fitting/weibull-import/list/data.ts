import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { WeibullProjectResult } from '#/api/weibull-project';

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
      placeholder: '请输入任务描述（可选）',
    },
    fieldName: 'description',
    label: '任务描述',
  },
  {
    component: 'Input',
    fieldName: 'model',
    label: '产品型号',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: '如：机破、临修、大修等',
    },
    fieldName: 'task_type',
    label: '任务类型',
    rules: 'required',
  },
];

export const editProjectSchema: VbenFormSchema[] = [
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
      placeholder: '请输入任务描述（可选）',
    },
    fieldName: 'description',
    label: '任务描述',
  },
  {
    component: 'Input',
    fieldName: 'model',
    label: '产品型号',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: '如：机破、临修、大修等',
    },
    fieldName: 'task_type',
    label: '任务类型',
    rules: 'required',
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<WeibullProjectResult>,
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
    {
      field: 'description',
      title: '任务描述',
      showOverflow: 'tooltip',
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
        options: ['edit', 'delete'],
      },
    },
  ];
}
