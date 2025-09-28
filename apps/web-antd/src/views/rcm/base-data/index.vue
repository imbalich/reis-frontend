<script setup lang="ts">
import type { RcmBaseDataFormImportParams } from '#/api/rcm';

import { Page, useVbenForm, useVbenModal, VbenButton } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRcmBaseDataListApi, importRcmBaseDataApi } from '#/api/rcm';

import { columns, importSchema, querySchema } from './data';

// 查询表单配置
const formOptions: any = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  schema: querySchema,
};

// 表格配置
const gridOptions: any = {
  columns,
  height: 'auto',
  border: true,
  stripe: true,
  showOverflow: true,
  showHeaderOverflow: true,
  keepSource: true,
  id: 'RcmBaseDataGrid',
  rowConfig: {
    keyField: 'id',
  },
  columnConfig: {
    resizable: true,
  },
  scrollY: {
    enabled: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any, formValues: any) => {
        const params = {
          page: page.currentPage,
          size: page.pageSize,
          product_model: formValues.product_model || undefined,
          component_name: formValues.component_name || undefined,
          component_material_code:
            formValues.component_material_code || undefined,
          failure_mode: formValues.failure_mode || undefined,
          is_key_component: formValues.is_key_component,
          is_consumable_part: formValues.is_consumable_part,
        };
        return await getRcmBaseDataListApi(params);
      },
    },
  },
  toolbarConfig: {
    refresh: true,
    import: false,
    export: false,
    print: false,
    zoom: true,
    custom: true,
  },
  importConfig: {
    mode: 'covering',
  },
  exportConfig: {},
  printConfig: {},
  menuConfig: {
    body: {
      options: [
        [
          {
            code: 'copy',
            name: '复制',
            prefixIcon: 'vxe-icon-copy',
          },
        ],
      ],
    },
  },
  mouseConfig: {
    selected: true,
  },
  keyboardConfig: {
    isArrow: true,
    isDel: true,
    isEnter: true,
    isTab: true,
    isEsc: true,
  },
  editConfig: {
    trigger: 'click',
    mode: 'row',
    showStatus: true,
  },
  validConfig: {
    autoPos: true,
  },
  editRules: {},
  checkboxConfig: {
    labelField: 'id',
    reserve: true,
    highlight: true,
    range: true,
  },
  radioConfig: {
    labelField: 'id',
    reserve: true,
    highlight: true,
  },
  selectConfig: {
    reserve: true,
    highlight: true,
  },
  sortConfig: {
    trigger: 'cell',
    remote: true,
    multiple: true,
    defaultSort: {
      field: 'created_time',
      order: 'desc',
    },
  },
  filterConfig: {
    remote: true,
    multiple: true,
  },
  expandConfig: {
    trigger: 'row',
    lazy: true,
    reserve: true,
    showIcon: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

// 导入表单配置
const [ImportForm, importFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: importSchema,
});

// 导入模态框配置
const [ImportModal, importModalApi] = useVbenModal({
  title: '批量导入RCM基础数据',
  class: 'w-1/2',
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await importFormApi.validate();
    if (!valid) return;

    importModalApi.lock();
    try {
      const formValues =
        await importFormApi.getValues<RcmBaseDataFormImportParams>();
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
        } else {
          console.error('无法获取有效的文件对象:', uploadFile);
        }
      } else {
        console.error('fileList字段不存在或为空:', formValues.fileList);
      }

      if (!file || !(file instanceof File) || !file.name || file.size === 0) {
        console.error('文件验证失败:', {
          file,
          type: typeof file,
          name: file?.name,
          size: file?.size,
        });
        message.error('请选择有效的Excel文件');
        return;
      }

      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name
        .toLowerCase()
        .slice(Math.max(0, file.name.lastIndexOf('.')));
      if (!allowedExtensions.includes(fileExtension)) {
        message.error('请选择Excel文件（.xlsx或.xls格式）');
        return;
      }

      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: '确认导入',
          content: '导入将完全覆盖现有数据，确定要继续吗？',
          okText: '确定导入',
          cancelText: '取消',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      if (!confirmed) return;

      const result = await importRcmBaseDataApi({
        file,
      });

      if (result.total_rows === 0 && result.errors.length > 0) {
        const errorMsg = result.errors[0] || '文件处理失败';
        message.error(`导入失败：${errorMsg}`);
        if (
          errorMsg.includes('Excel处理失败') ||
          errorMsg.includes('builtins.list')
        ) {
          message.error(
            'Excel文件格式可能有问题，请检查文件是否正确或联系管理员',
          );
        }
      } else if (result.failed_rows > 0) {
        message.warning(
          `导入完成，但有${result.failed_rows}行数据失败。成功：${result.success_rows}行，总计：${result.total_rows}行`,
        );
      } else {
        message.success(`导入成功！共处理${result.success_rows}行数据`);
      }

      await importModalApi.close();
      gridApi.query();
      importFormApi.resetForm();
    } catch (error: any) {
      message.error(`导入失败：${error.message || '未知错误'}`);
    } finally {
      importModalApi.unlock();
    }
  },
});

// 下载模板函数
async function downloadTemplate() {
  try {
    const templateUrl = '/RCM关键部件配置表.xlsx';
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'RCM关键部件配置表.xlsx';
    document.body.append(link);
    link.click();
    link.remove();
    message.success('模板下载成功！');
  } catch (error: any) {
    message.error(`模板下载失败：${error.message || '未知错误'}`);
  }
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <!-- 使用插槽添加导入按钮 -->
        <template #toolbar-actions>
          <VbenButton @click="downloadTemplate" class="mr-2">
            下载模板
          </VbenButton>
          <VbenButton @click="importModalApi.open" type="primary">
            批量导入
          </VbenButton>
        </template>
      </Grid>
    </Page>

    <!-- 导入模态框 -->
    <ImportModal>
      <ImportForm />
    </ImportModal>
  </div>
</template>
