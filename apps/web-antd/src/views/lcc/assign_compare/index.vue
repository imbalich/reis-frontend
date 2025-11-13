<script setup lang="ts">
import { ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRessignCompareListApi } from '#/api';

import {
  columns,
  generateBatchFormItems,
  newProductSchema,
  similarProductSchema,
} from './data';

// 当前激活的标签页
const activeTab = ref('planA');

// 切换到指定标签页
const switchToTab = (tabKey: string) => {
  activeTab.value = tabKey;
};

// 方案1表单配置
const [FormA, formApiA] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema: similarProductSchema,
  wrapperClass: 'grid grid-cols-2 gap-1',
});

// 方案2表单配置
const [FormB, formApiB] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema: similarProductSchema,
  wrapperClass: 'grid grid-cols-2 gap-1',
});

// 获取当前激活方案的表单API
const getCurrentFormApi = () => {
  return activeTab.value === 'planA' ? formApiA : formApiB;
};

// 批量添加或删除表单项
const handleBatchOperation = (action: 'batchAdd' | 'batchDelete') => {
  const currentFormApi = getCurrentFormApi();

  switch (action) {
    case 'batchAdd': {
      currentFormApi.setState((prev) => {
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
      currentFormApi.setState((prev) => {
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
const processFormData = (formValues: Record<string, any>, plan: string) => {
  const itemsList = [] as Array<{
    model: string;
    part: string;
    part_number: number;
  }>;

  // 处理原始的产品型号和零部件
  if (formValues.model || formValues.part) {
    itemsList.push({
      model: formValues.model,
      part: formValues.part || '',
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
        part: formValues[partKey] || '',
        part_number: formValues.model,
      });
    }
  });

  // 根据不同方案返回不同格式的数据
  if (plan === 'planA') {
    // 方案1：返回item1
    return {
      items1: JSON.stringify(itemsList),
    };
  } else if (plan === 'planB') {
    // 方案2：返回item2
    return {
      items2: JSON.stringify(itemsList),
    };
  } else {
    return {
      items: JSON.stringify(itemsList),
    };
  }
};

// 用户指标表单配置
const [NewProductForm, newProductFormApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema: newProductSchema,
  wrapperClass: 'grid grid-cols-6 gap-2',
});

// 数据
const tableData = ref();
const loading = ref(false);

// 处理查询
const handleSubmit = async () => {
  loading.value = true;
  try {
    // 验证所有表单
    try {
      // 验证方案1表单
      const { valid: validA } = await formApiA.validate();
      if (!validA) {
        message.error('请完善方案1表单');
        switchToTab('planA');
        loading.value = false;
        return;
      }

      // 验证方案2表单
      const { valid: validB } = await formApiB.validate();
      if (!validB) {
        message.error('请完善方案2表单');
        switchToTab('planB');
        loading.value = false;
        return;
      }

      // 验证用户指标表单
      const { valid: validNew } = await newProductFormApi.validate();
      if (!validNew) {
        message.error('请完善用户指标表单');
        switchToTab('new');
        loading.value = false;
        return;
      }
    } catch (error) {
      console.error('表单验证失败:', error);
      message.error('表单验证失败，请检查所有表单');
      loading.value = false;
      return;
    }

    // 获取所有表单数据
    const formValuesA = await formApiA.getValues();
    const structuredDataA = processFormData(formValuesA, 'planA');
    const formValuesB = await formApiB.getValues();
    const structuredDataB = processFormData(formValuesB, 'planB');
    const newProductData = await newProductFormApi.getValues();

    // 组装提交数据，包含两个方案的数据
    const submitData = {
      ...structuredDataA,
      ...structuredDataB,
      ...newProductData,
    };
    // 请求数据
    const res = await getRessignCompareListApi(submitData);
    tableData.value = res;
    message.success('数据请求成功');
  } catch (error) {
    console.error('请求失败:', error);
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
  data: [],
  loading: loading.value,
};
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 监听数据变化
watch([tableData, loading], () => {
  gridApi?.setState?.({
    gridOptions: {
      ...gridApi?.state?.gridOptions,
      data: tableData.value || [],
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
        <!-- 方案1表单区域 -->
        <a-tab-pane key="planA" tab="方案1">
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
          <FormA />
          <!-- 下一步按钮 -->
          <div class="mb-4 flex space-x-4">
            <a-button
              type="primary"
              @click="switchToTab('planB')"
              style="position: absolute; right: 40px"
            >
              下一步
            </a-button>
          </div>
        </a-tab-pane>
        <!-- 方案2表单区域 -->
        <a-tab-pane key="planB" tab="方案2">
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
          <FormB />
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
        <!-- 用户指标表单区域 -->
        <a-tab-pane key="new" tab="用户指标">
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
    <!-- 下方表格结果 -->
    <div class="mt-4 flex w-full space-x-4" style="height: 450px">
      <a-card
        title="多设计方案可靠性经济性对比分析结果"
        style="flex: 1; min-width: 0"
      >
        <Grid />
      </a-card>
    </div>
    <div class="mt-4 w-full"></div>
  </div>
</template>
