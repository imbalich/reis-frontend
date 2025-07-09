import type { VbenFormSchema } from '#/adapter/form';

export const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'model',
    label: '产品型号',
  },
  {
    component: 'Input',
    fieldName: 'part',
    label: '零部件',
  },
  {
    component: 'Input',
    fieldName: 'input_date',
    label: 'PM价格',
  },
  {
    component: 'Input',
    fieldName: 'method',
    label: 'CM价格',
  },
];
