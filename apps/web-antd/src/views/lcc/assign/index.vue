<script setup lang="ts">
import type { LccAssignRes, lccAssignResult } from '#/api';

import { ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRessignListApi } from '#/api';

import {
  columns,
  generateBatchFormItems,
  newProductSchema,
  similarProductSchema,
} from './data';

// 当前标签页
const activeTab = ref('similar');

// 切换到指定标签页
const switchToTab = (tabKey: string) => {
  activeTab.value = tabKey;
};

// 表单配置
const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema: similarProductSchema,
  wrapperClass: 'grid grid-cols-2 gap-1',
});

// 批量添加或删除表单项
const handleBatchOperation = (action: 'batchAdd' | 'batchDelete') => {
  switch (action) {
    case 'batchAdd': {
      formApi.setState((prev) => {
        const currentSchema = prev?.schema ?? [];
        const timestamp = Date.now();
        // 使用generateBatchFormItems函数生成批量添加的表单项
        const newSchema = generateBatchFormItems(timestamp);
        return {
          schema: [...currentSchema, ...newSchema],
        };
      });
      break;
    }
    case 'batchDelete': {
      formApi.setState((prev) => {
        const currentSchema = prev?.schema ?? [];
        // 删除最后两个表单项（产品型号和零部件）
        if (currentSchema.length >= 4) {
          // 保留至少一组产品型号和零部件
          return {
            schema: currentSchema.slice(0, -2),
          };
        }
        return { schema: currentSchema };
      });
      break;
    }
  }
};

// 处理表单数据，将其转换为结构化格式
const processFormData = (formValues: Record<string, any>) => {
  const itemsList = [] as Array<{
    model: string;
    part: string;
    part_number: number;
  }>;

  // 处理原始的产品型号和零部件
  if (formValues.model && formValues.part) {
    itemsList.push({
      model: formValues.model,
      part: formValues.part,
      part_number: formValues.model,
    });
  }

  // 处理批量添加的产品型号和零部件
  const keys = Object.keys(formValues);
  const modelKeys = keys.filter((key) => key.startsWith('model_'));

  modelKeys.forEach((modelKey) => {
    const timestamp = modelKey.split('_')[1];
    const partKey = `part_${timestamp}`;

    if (formValues[partKey]) {
      itemsList.push({
        model: formValues[modelKey],
        part: formValues[partKey],
        part_number: formValues.model,
      });
    }
  });

  // 将对象数组转换为JSON字符串
  return {
    items: JSON.stringify(itemsList),
  };
};

// 新产品表单配置
const [NewProductForm, newProductFormApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema: newProductSchema,
  wrapperClass: 'grid grid-cols-5 gap-2',
});

// 数据
const tableData = ref<LccAssignRes>();
const loading = ref(false);

// 处理查询
const handleSubmit = async () => {
  loading.value = true;
  try {
    const { valid } = await formApi.validate();
    if (!valid) return;
    // 验证相似产品表单
    const formValues = await formApi.getValues();
    const structuredData = processFormData(formValues);
    // 验证新产品表单
    const newProductData = await newProductFormApi.getValues();

    // 组装提交数据
    const submitData = {
      ...structuredData,
      ...newProductData,
    };

    const res = await getRessignListApi(submitData);
    tableData.value = res;
    message.success('数据请求成功');
  } catch {
    message.error('数据请求失败');
  } finally {
    loading.value = false;
  }
};

// 表格
const gridOptions = {
  rowConfig: {
    keyField: 'id',
  },
  checkboxConfig: {
    highlight: true,
  },
  pagerConfig: {
    enabled: false,
  },
  height: 370,
  exportConfig: {},
  printConfig: {},
  scrollX: {
    enabled: true,
  },
  columns,
  data: [] as lccAssignResult[],
  loading: loading.value,
};
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 监听数据变化
watch([tableData, loading], () => {
  gridApi?.setState?.({
    gridOptions: {
      ...gridApi?.state?.gridOptions,
      data: tableData.value?.parts_detail || [],
      loading: loading.value,
    },
  });
});
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <!-- 表单区域 -->
    <a-card class="mt-4 w-full">
      <a-tabs v-model:active-key="activeTab" size="large">
        <!-- 相似产品表单区域 -->
        <a-tab-pane key="similar" tab="相似产品-部件信息">
          <div
            class="flex space-x-2"
            style="position: absolute; top: -50px; right: 0"
          >
            <a-button
              type="primary"
              ghost
              shape="round"
              size="small"
              @click="handleBatchOperation('batchAdd')"
            >
              ➕增加
            </a-button>
            <a-button
              type="dashed"
              danger
              shape="round"
              size="small"
              @click="handleBatchOperation('batchDelete')"
            >
              ➖删除
            </a-button>
          </div>
          <Form />
          <!-- 下一步按钮 -->
          <div class="mb-4 flex space-x-4">
            <a-button
              type="primary"
              @click="switchToTab('new')"
              style="position: absolute; right: 40px"
            >
              下一步
            </a-button>
          </div>
        </a-tab-pane>
        <!-- 新产品表单区域 -->
        <a-tab-pane key="new" tab="新产品-计算条件">
          <NewProductForm />
          <div class="mb-4 flex space-x-4">
            <a-button
              type="primary"
              @click="handleSubmit"
              style="position: absolute; right: 40px"
            >
              提交
            </a-button>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
    <!-- 下方展示区保留原有内容 -->
    <div class="mt-4 flex w-full space-x-4" style="height: 450px">
      <!-- 评估结果展示区 -->
      <a-card title="可靠性评估结果" style="width: 450px">
        <a-form>
          <a-form-item label="结论1">
            保质期内故障率最大值为[<b>{{ tableData?.fpmh_pre }} </b>]，
            {{ tableData?.fpmh_result ? '满足用户要求' : '不满足用户要求' }}
          </a-form-item>
          <a-divider />
          <a-form-item label="结论2">
            订单数量大于[<b>{{ tableData?.n1 }} </b>]台才不会亏损
          </a-form-item>
          <a-divider />
          <a-form-item label="结论3">
            订单数量需大于[<b>{{ tableData?.n2 }} </b>]台才能实现利润目标
          </a-form-item>
        </a-form>
        <!-- <div v-else>暂无数据</div> -->
      </a-card>
      <!-- 指标分配区域 -->
      <a-card
        title="基于经济型评估的可靠性指标分配"
        style="flex: 1; min-width: 0"
      >
        <Grid />
      </a-card>
    </div>
  </div>
</template>
