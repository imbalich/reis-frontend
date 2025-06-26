<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DmEbomParams, DmEbomRes } from '#/api';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDmEbomListApi } from '#/api';

import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('page.form.query'),
  },
  schema: querySchema,
};

// 懒加载子节点方法
const loadChildren = async ({ row }: { row: any }) => {
  const params: DmEbomParams = {
    partid: row.id,
    level1: (row.level1 ?? 0) + 1,
  };
  const res = await getDmEbomListApi(params);
  res.items.forEach((item: any) => {
    item.hasChild = true;
    item.prd_no = '';
  });
  return res.items;
};

const gridOptions: VxeTableGridOptions<DmEbomRes> = {
  rowConfig: {
    keyField: 'id',
  },
  treeConfig: {
    rowField: 'id',
    parentField: 'partid',
    lazy: true,
    hasChild: 'hasChild',
    loadMethod: loadChildren,
  },
  checkboxConfig: {
    highlight: true,
  },
  height: 'auto',
  exportConfig: {},
  printConfig: {},
  toolbarConfig: {
    export: true,
    print: true,
    refresh: { code: 'query' },
    custom: true,
    zoom: true,
  },
  scrollX: {
    enabled: true,
  },
  columns: (columns ?? []).map((col) => ({
    ...col,
    width: col.width || 180,
  })),
  proxyConfig: {
    ajax: {
      query: async (_params, formValues) => {
        const params: DmEbomParams = {
          level1: 0,
          prd_no: formValues.prd_no,
        };
        const res = await getDmEbomListApi(params);
        res.items.forEach((item: any) => {
          item.hasChild = true;
        });
        return res;
      },
    },
  },
};

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <Page auto-content-height>
    <Grid />
  </Page>
</template>
