<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ScienceWarehouseResultDetails } from '#/api/scientific-inventory';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getScienceWarehouseListApi } from '#/api/scientific-inventory';

import { columns, querySchema } from './data';

// 查询表单配置
const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  schema: querySchema,
};

// 表格配置
const gridOptions: VxeTableGridOptions<ScienceWarehouseResultDetails> = {
  rowConfig: {
    keyField: 'id',
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
  columns,
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const params = {
          page: page.currentPage,
          size: page.pageSize,
          calculation_id: formValues.calculation_id || undefined,
          warehouse_code: formValues.warehouse || undefined, // 直接使用选中的编码
          spare_part_code: formValues.spare_part || undefined, // 直接使用选中的编码
          calculation_method: formValues.calculation_method || undefined,
          time_range: formValues.time_range || undefined,
        };

        return await getScienceWarehouseListApi(params);
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
