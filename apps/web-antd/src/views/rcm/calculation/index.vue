<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  RcmCalculationGlobalStatus,
  RcmCalculationListDetails,
  RcmCalculationQueryParams,
  RcmCalculationTaskStatus,
} from '#/api/rcm-calculation';

import { onMounted, onUnmounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getRcmCalculationGlobalStatusApi,
  getRcmCalculationListApi,
  getRcmCalculationTaskStatusApi,
  submitRcmBatchCalculationApi,
} from '#/api/rcm-calculation';

import { columns, querySchema } from './data';

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
const gridOptions: VxeTableGridOptions<RcmCalculationListDetails> = {
  rowConfig: {
    keyField: 'id',
  },
  checkboxConfig: {
    highlight: true,
  },
  height: 'auto',
  border: true,
  stripe: true,
  showOverflow: true,
  showHeaderOverflow: true,
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
        const params: RcmCalculationQueryParams = {
          page: page.currentPage,
          size: page.pageSize,
          product_model: formValues.product_model || undefined,
          component_name: formValues.component_name || undefined,
          component_material_code:
            formValues.component_material_code || undefined,
          final_result: formValues.final_result || undefined,
        };

        return await getRcmCalculationListApi(params);
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

// 计算任务相关状态
const isCalculating = ref(false);
const currentTaskId = ref<null | string>(null);
const taskStatus = ref<null | RcmCalculationTaskStatus>(null);
const globalStatus = ref<null | RcmCalculationGlobalStatus>(null);
const statusPollingTimer = ref<NodeJS.Timeout | null>(null);
const backendAvailable = ref(true); // 后端服务是否可用

// 检查全局状态
async function checkGlobalStatus() {
  try {
    const response = await getRcmCalculationGlobalStatusApi();
    console.log('全局状态响应:', response); // 调试日志

    if (!response) {
      console.warn('全局状态响应数据为空，使用默认状态');
      globalStatus.value = {
        can_submit: true,
        message: '可以提交新的RCM计算任务',
      };
      return;
    }

    globalStatus.value = response;

    if (!response.can_submit && response.current_task) {
      currentTaskId.value = response.current_task.task_id;
      isCalculating.value = true;
      startStatusPolling();
    }
  } catch (error: any) {
    console.error('检查全局状态失败:', error);

    // 检查是否是网络连接问题
    if (
      error.code === 'ECONNREFUSED' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error')
    ) {
      backendAvailable.value = false;
      globalStatus.value = {
        can_submit: false,
        message: '后端服务不可用，请检查服务是否启动',
      };
    } else {
      // 设置默认状态，允许用户尝试提交
      globalStatus.value = {
        can_submit: true,
        message: '状态检查失败，可以尝试提交计算任务',
      };
    }
  }
}

// 提交计算任务
async function submitCalculation() {
  try {
    // 先检查全局状态
    await checkGlobalStatus();

    if (!globalStatus.value?.can_submit) {
      message.warning(
        globalStatus.value?.message || '当前有任务正在执行，请等待完成',
      );
      return;
    }

    // 显示确认对话框
    const confirmed = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: '确认提交计算任务',
        content:
          '将基于当前RCM基础数据进行批量计算，此操作可能需要较长时间，确定要继续吗？',
        okText: '确定提交',
        cancelText: '取消',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (!confirmed) return;

    isCalculating.value = true;
    const response = await submitRcmBatchCalculationApi();
    console.log('提交任务响应:', response); // 调试日志

    if (!response) {
      throw new Error('服务器响应数据格式错误');
    }

    taskStatus.value = response;
    currentTaskId.value = response.task_id;

    if (response.is_duplicate) {
      message.warning(response.message);
    } else {
      message.success(response.message);
    }

    // 开始状态轮询
    startStatusPolling();
  } catch (error: any) {
    isCalculating.value = false;
    console.error('提交计算任务失败:', error);

    // 根据错误类型显示不同的提示
    if (error.response?.status === 404) {
      message.error('计算接口不存在，请检查后端服务是否正常');
    } else if (error.response?.status >= 500) {
      message.error('服务器内部错误，请稍后重试');
    } else if (error.message?.includes('timeout')) {
      message.error('请求超时，请检查网络连接');
    } else {
      message.error(`提交计算任务失败：${error.message || '未知错误'}`);
    }
  }
}

// 开始状态轮询
function startStatusPolling() {
  if (statusPollingTimer.value) {
    clearInterval(statusPollingTimer.value);
  }

  statusPollingTimer.value = setInterval(async () => {
    if (!currentTaskId.value) return;

    try {
      const response = await getRcmCalculationTaskStatusApi(
        currentTaskId.value,
      );
      console.log('任务状态响应:', response); // 调试日志

      if (!response) {
        console.warn('任务状态响应数据为空');
        return;
      }

      taskStatus.value = response;

      if (response.ready) {
        // 任务完成
        isCalculating.value = false;
        currentTaskId.value = null;
        clearInterval(statusPollingTimer.value!);
        statusPollingTimer.value = null;

        // 后端返回的状态可能是 'SUCCESS' 或 'success'，统一处理
        const isSuccess =
          response.status === 'SUCCESS' || response.status === 'success';

        if (isSuccess) {
          message.success('RCM计算任务执行完成！');
          // 刷新结果列表
          gridApi.query();
        } else {
          message.error(
            `RCM计算任务执行失败：${response.error || response.message || '未知错误'}`,
          );
        }
      }
    } catch (error: any) {
      console.error('查询任务状态失败:', error);
      // 如果连续多次查询失败，停止轮询
      // 这里可以添加失败计数器逻辑
    }
  }, 2000); // 每2秒查询一次
}

// 注意：如果需要停止计算任务的功能，可以取消注释下面的函数
// function stopCalculation() {
//   if (statusPollingTimer.value) {
//     clearInterval(statusPollingTimer.value);
//     statusPollingTimer.value = null;
//   }
//   isCalculating.value = false;
//   currentTaskId.value = null;
//   taskStatus.value = null;
// }

// 获取计算按钮文本
function getCalculationButtonText() {
  if (isCalculating.value) {
    const status = taskStatus.value?.status?.toLowerCase();
    return status === 'running' || status === 'started'
      ? '计算中...'
      : '任务排队中...';
  }
  return '开始计算';
}

// 获取计算按钮状态
function getCalculationButtonProps() {
  return {
    type: isCalculating.value ? 'default' : 'primary',
    loading: isCalculating.value,
    disabled: isCalculating.value || !backendAvailable.value,
  };
}

// 组件挂载时检查状态
onMounted(() => {
  // 延迟检查状态，避免页面加载时的频繁错误
  setTimeout(() => {
    checkGlobalStatus();
  }, 1000);
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (statusPollingTimer.value) {
    clearInterval(statusPollingTimer.value);
  }
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <!-- 使用插槽添加计算按钮 -->
      <template #toolbar-actions>
        <VbenButton
          v-bind="getCalculationButtonProps()"
          @click="submitCalculation"
        >
          {{ getCalculationButtonText() }}
        </VbenButton>
      </template>
    </Grid>

    <!-- 后端服务状态提示 -->
    <div
      v-if="!backendAvailable"
      class="mt-4 rounded-lg border border-red-200 bg-red-50 p-4"
    >
      <div class="flex items-center">
        <div class="mr-3 text-red-600">⚠️</div>
        <div>
          <div class="font-medium text-red-800">后端服务不可用</div>
          <div class="text-sm text-red-600">
            请检查后端服务是否启动，或联系系统管理员
          </div>
        </div>
      </div>
    </div>

    <!-- 计算状态提示 -->
    <div
      v-else-if="isCalculating && taskStatus"
      class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4"
    >
      <div class="flex items-center">
        <div
          class="mr-3 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"
        ></div>
        <div>
          <div class="font-medium text-blue-800">RCM计算任务执行中</div>
          <div class="text-sm text-blue-600">{{ taskStatus.message }}</div>
          <div class="mt-1 text-xs text-blue-500">
            任务ID: {{ taskStatus.task_id }}
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>
