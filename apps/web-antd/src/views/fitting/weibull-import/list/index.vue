<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { OnActionClickParams } from '#/adapter/vxe-table';
import type {
  CreateWeibullProjectParams,
  UpdateWeibullProjectBasicInfoParams,
  WeibullProjectResult,
} from '#/api/weibull-project';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createWeibullProjectApi,
  deleteWeibullProjectsApi,
  getWeibullProjectsApi,
  updateWeibullProjectBasicInfoApi,
} from '#/api/weibull-project';

import {
  createProjectSchema,
  editProjectSchema,
  querySchema,
  useColumns,
} from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<WeibullProjectResult> = {
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
        return await getWeibullProjectsApi({
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

function onActionClick({
  code,
  row,
}: OnActionClickParams<WeibullProjectResult>) {
  switch (code) {
    case 'delete': {
      deleteWeibullProjectsApi({ pks: [row.id] }).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'edit': {
      editModalApi.setData(row).open();
      break;
    }
  }
}

function onProjectNameClick(row: WeibullProjectResult) {
  router
    .push({
      name: 'WeibullImportDetail',
      params: { id: String(row.id) },
    })
    .catch((error) => {
      console.error('路由跳转失败:', error);
      message.error('页面跳转失败');
    });
}

const [CreateForm, createFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: createProjectSchema,
});

const createModalTitle = computed(() => '新建项目');

const [CreateModal, createModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await createFormApi.validate();
    if (valid) {
      createModalApi.lock();
      const data = await createFormApi.getValues<CreateWeibullProjectParams>();
      try {
        await createWeibullProjectApi(data);
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

const [EditForm, editFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: editProjectSchema,
});

interface FormWeibullProjectData extends UpdateWeibullProjectBasicInfoParams {
  id?: number;
}

const editProjectData = ref<FormWeibullProjectData>();

const editModalTitle = computed(() => {
  return editProjectData.value?.id
    ? $t('ui.actionTitle.edit', ['项目'])
    : $t('ui.actionTitle.create', ['项目']);
});

const [EditModal, editModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await editFormApi.validate();
    if (valid) {
      editModalApi.lock();
      const data =
        await editFormApi.getValues<UpdateWeibullProjectBasicInfoParams>();
      try {
        if (editProjectData.value?.id) {
          await updateWeibullProjectBasicInfoApi(
            editProjectData.value.id,
            data,
          );
          message.success($t('ui.actionMessage.operationSuccess'));
        }
        await editModalApi.close();
        onRefresh();
      } catch {
        message.error('项目更新失败');
      } finally {
        editModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = editModalApi.getData<FormWeibullProjectData>();
      editFormApi.resetForm();
      if (data) {
        editProjectData.value = data;
        editFormApi.setValues(data);
      }
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
    <CreateModal :title="createModalTitle">
      <CreateForm />
    </CreateModal>
    <EditModal :title="editModalTitle">
      <EditForm />
    </EditModal>
  </Page>
</template>
