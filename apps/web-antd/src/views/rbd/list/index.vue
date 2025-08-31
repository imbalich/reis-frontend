<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { CreateRbdProjectParams, RbdProjectResult } from '#/api';

import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createRbdProjectApi,
  deleteRbdProjectsApi,
  getRbdProjectsApi,
} from '#/api';

import { createProjectSchema, querySchema, useColumns } from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<RbdProjectResult> = {
  rowConfig: {
    keyField: 'id',
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
  columns: useColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getRbdProjectsApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const router = useRouter();

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function onRefresh() {
  gridApi.query();
}

function onActionClick({ code, row }: OnActionClickParams<RbdProjectResult>) {
  switch (code) {
    case 'delete': {
      deleteRbdProjectsApi({ pks: [row.id] }).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'edit': {
      // TODO: 实现编辑逻辑
      message.info('编辑功能待实现');
      break;
    }
  }
}

function onProjectNameClick(row: RbdProjectResult) {
  router.push(`/rbd/detail/${row.id}`).catch((error) => {
    console.error('路由跳转失败:', error);
    message.error('页面跳转失败');
  });
}

// 新建项目表单
const [CreateForm, createFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: createProjectSchema,
});

const modalTitle = computed(() => {
  return '新建项目';
});

// 新建项目模态框
const [CreateModal, createModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await createFormApi.validate();
    if (valid) {
      createModalApi.lock();
      const data = await createFormApi.getValues<CreateRbdProjectParams>();
      try {
        await createRbdProjectApi(data);
        message.success('项目创建成功');
        await createModalApi.close();
        onRefresh();
      } catch {
        message.error('项目创建失败');
      } finally {
        createModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      createFormApi.resetForm();
    }
  },
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => createModalApi.open()">
          <MaterialSymbolsAdd class="size-5" />
          新建项目
        </VbenButton>
      </template>
      <template #name_default="{ row }">
        <a
          @click="onProjectNameClick(row)"
          class="text-primary hover:text-primary-dark cursor-pointer"
        >
          {{ row.name }}
        </a>
      </template>
    </Grid>
    <CreateModal :title="modalTitle">
      <CreateForm />
    </CreateModal>
  </Page>
</template>
