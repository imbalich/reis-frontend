<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  GetWarehouseInventoryDetails,
  WarehouseInventoryFormImportParams,
} from '#/api/warehouse-inventory';

import { Page, useVbenForm, useVbenModal, VbenButton } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getWarehouseInventoryListApi,
  importWarehouseInventoryDataApi,
} from '#/api/warehouse-inventory';

import { columns, importSchema, querySchema } from './data';

const formOptions: any = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<GetWarehouseInventoryDetails> = {
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
          warehouse_code: formValues.warehouse_code || undefined,
          warehouse_name: formValues.warehouse_name || undefined,
          part_code: formValues.part_code || undefined,
          part_name: formValues.part_name || undefined,
        };

        return await getWarehouseInventoryListApi(params);
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

// 导入表单
const [ImportForm, importFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: importSchema,
});

// 导入弹窗
const [ImportModal, importModalApi] = useVbenModal({
  title: '批量导入库房备品清单数据',
  class: 'w-1/2', // 调整宽度，因为现在有更丰富的说明内容
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await importFormApi.validate();
    if (!valid) return;

    importModalApi.lock();
    try {
      const formValues =
        await importFormApi.getValues<WarehouseInventoryFormImportParams>();

      // 根据表单组件配置，Upload组件绑定到fileList字段
      let file: File | null = null;

      // 从fileList字段获取文件对象
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

      // 验证文件对象
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

      // 验证文件格式
      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name
        .toLowerCase()
        .slice(Math.max(0, file.name.lastIndexOf('.')));
      if (!allowedExtensions.includes(fileExtension)) {
        message.error('请选择Excel文件（.xlsx或.xls格式）');
        return;
      }

      // 显示确认提示
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: '确认导入',
          content: '导入将覆盖现有数据，确定要继续吗？',
          okText: '确定导入',
          cancelText: '取消',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      if (!confirmed) {
        return;
      }

      const result = await importWarehouseInventoryDataApi({
        file, // 直接传递File对象，而不是整个参数对象
      });

      // 根据后端响应格式显示结果
      if (result.failed_rows > 0) {
        message.warning(
          `导入完成，但有${result.failed_rows}行数据失败。成功：${result.success_rows}行，总计：${result.total_rows}行`,
        );
      } else {
        message.success(`导入成功！共处理${result.success_rows}行数据`);
      }

      // 关闭弹窗并刷新数据
      await importModalApi.close();
      gridApi.query();

      // 重置表单
      importFormApi.resetForm();
    } catch (error: any) {
      message.error(`导入失败：${error.message || '未知错误'}`);
    } finally {
      importModalApi.unlock();
    }
  },
});

// 下载模板
async function downloadTemplate() {
  try {
    // 直接下载预置的XLSX模板文件
    const templateUrl = '/库房备品清单配置.xlsx';
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = '库房备品清单配置.xlsx';
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
  <Page auto-content-height>
    <Grid>
      <!-- 使用插槽添加导入按钮 -->
      <template #toolbar-actions>
        <VbenButton @click="downloadTemplate" class="mr-2">
          下载模板
        </VbenButton>
        <VbenButton @click="importModalApi.open()"> 批量导入 </VbenButton>
      </template>
    </Grid>

    <!-- 导入弹窗 -->
    <ImportModal>
      <ImportForm />
    </ImportModal>
  </Page>
</template>
