<script setup lang="ts">
import type {
  WeibullCensoredFormImportParams,
  WeibullProjectResult,
} from '#/api/weibull-project';

import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, useVbenForm, useVbenModal, VbenButton } from '@vben/common-ui';

import { Descriptions, message, Modal } from 'ant-design-vue';

import {
  getWeibullProjectDetailApi,
  importWeibullCensoredDataApi,
} from '#/api/weibull-project';

import { importSchema } from './data';

defineOptions({
  name: 'WeibullImportDetail',
});

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const project = ref<WeibullProjectResult | null>(null);

async function loadDetail() {
  const id = route.params.id as string;
  if (!id) return;
  loading.value = true;
  try {
    project.value = await getWeibullProjectDetailApi(id);
  } catch {
    message.error('加载项目失败');
    project.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadDetail();
});

watch(
  () => route.params.id,
  () => {
    loadDetail();
  },
);

function goBack() {
  router.push({ name: 'WeibullImportList' }).catch(() => {});
}

const [ImportForm, importFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: importSchema,
});

const [ImportModal, importModalApi] = useVbenModal({
  title: '导入删失数据',
  class: 'w-1/2',
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await importFormApi.validate();
    if (!valid) return;

    const projectId = route.params.id as string;
    if (!projectId) {
      message.error('无效的项目');
      return;
    }

    importModalApi.lock();
    try {
      const formValues =
        await importFormApi.getValues<WeibullCensoredFormImportParams>();

      let file: File | null = null;
      if (
        formValues.fileList &&
        Array.isArray(formValues.fileList) &&
        formValues.fileList.length > 0
      ) {
        const uploadFile = formValues.fileList[0];
        if (uploadFile.originFileObj) {
          file = uploadFile.originFileObj;
        } else if (uploadFile instanceof File) {
          file = uploadFile;
        }
      }

      if (!file || !(file instanceof File) || !file.name || file.size === 0) {
        message.error('请选择有效的 Excel 文件');
        return;
      }

      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name
        .toLowerCase()
        .slice(Math.max(0, file.name.lastIndexOf('.')));
      if (!allowedExtensions.includes(fileExtension)) {
        message.error('请选择 Excel 文件（.xlsx 或 .xls）');
        return;
      }

      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: '确认导入',
          content: '导入将覆盖本项目下已有删失数据集，确定要继续吗？',
          okText: '确定导入',
          cancelText: '取消',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      if (!confirmed) {
        return;
      }

      const result = await importWeibullCensoredDataApi(projectId, { file });

      if (result.failed_rows > 0) {
        message.warning(
          `导入完成，但有 ${result.failed_rows} 行失败。成功：${result.success_rows} 行，总计：${result.total_rows} 行`,
        );
      } else {
        message.success(`导入成功！共处理 ${result.success_rows} 行数据`);
      }

      await importModalApi.close();
      importFormApi.resetForm();
      await loadDetail();
    } catch (error: any) {
      message.error(`导入失败：${error.message || '未知错误'}`);
    } finally {
      importModalApi.unlock();
    }
  },
});

function downloadTemplate() {
  try {
    const name = '删失数据集导入配置.xlsx';
    const link = document.createElement('a');
    link.href = `/${name}`;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    message.success('已开始下载模板');
  } catch (error: any) {
    message.error(`模板下载失败：${error.message || '未知错误'}`);
  }
}
</script>

<template>
  <Page auto-content-height>
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <VbenButton variant="outline" @click="goBack">返回列表</VbenButton>
      <VbenButton @click="downloadTemplate">下载模板</VbenButton>
      <VbenButton type="primary" @click="importModalApi.open()">
        导入删失数据
      </VbenButton>
    </div>

    <div v-if="loading" class="text-muted-foreground py-8 text-center">
      加载中…
    </div>
    <Descriptions
      v-else-if="project"
      bordered
      :column="2"
      size="middle"
      class="bg-background"
    >
      <Descriptions.Item label="项目名称">
        {{ project.name }}
      </Descriptions.Item>
      <Descriptions.Item label="产品型号">
        {{ project.model }}
      </Descriptions.Item>
      <Descriptions.Item label="任务类型">
        {{ project.task_type }}
      </Descriptions.Item>
      <Descriptions.Item label="创建人">
        {{ project.created_by ?? '—' }}
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        {{ project.created_time }}
      </Descriptions.Item>
      <Descriptions.Item label="更新时间">
        {{ project.updated_time ?? '—' }}
      </Descriptions.Item>
      <Descriptions.Item label="任务描述" :span="2">
        {{ project.description ?? '—' }}
      </Descriptions.Item>
    </Descriptions>
    <div v-else class="text-muted-foreground py-8 text-center">
      未找到该项目
    </div>

    <ImportModal>
      <ImportForm />
    </ImportModal>
  </Page>
</template>
