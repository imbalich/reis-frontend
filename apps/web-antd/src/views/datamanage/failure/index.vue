<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DmFailureRes } from '#/api';

import { ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDmFailureListApi, getDmFaultLocationByModelApi } from '#/api';

import { columns, querySchema } from './data';

const formModel = ref({ product_model: '', fault_location: '' });
const faultLocationOptions = ref([]);

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<DmFailureRes> = {
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
  scrollX: {
    enabled: true,
  },
  columns: (columns ?? []).map((col) => ({
    ...col,
    width: col.width || 180, // 给每列设置宽度，防止自动收缩
  })),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getDmFailureListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });

watch(
  () => formModel.value.product_model,
  async (val) => {
    if (!val) {
      faultLocationOptions.value = [];
      formModel.value.fault_location = '';
      return;
    }
    const res = await getDmFaultLocationByModelApi({ product_model: val });
    faultLocationOptions.value = res.map((item: string) => ({
      label: item,
      value: item,
    }));
    formModel.value.fault_location = '';
  },
);
</script>

<template>
  <Page auto-content-height>
    <Grid />
  </Page>
</template>
