<script setup lang="ts">
import { ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCycleLifeListApi } from '#/api';

import { columns, generateBatchFormItems, querySchema } from './data';

// 表单配置
const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema: querySchema,
  wrapperClass: 'grid grid-cols-2 gap-0',
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

// 数据
const tableData = ref();
const loading = ref(false);

// 处理查询
const handleSubmit = async () => {
  loading.value = true;
  try {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const formValues = await formApi.getValues();

    // 处理表单数据，将其转换为结构化格式
    const structuredData = processFormData(formValues);

    const res = await getCycleLifeListApi(structuredData);
    tableData.value = res;
    message.success('数据请求成功');
  } catch {
    message.error('数据请求失败');
  } finally {
    loading.value = false;
  }
};

// 处理表单数据，将其转换为结构化格式
const processFormData = (formValues: Record<string, any>) => {
  const itemsList = [] as Array<{ model: string; part: string }>;

  // 处理原始的产品型号和零部件
  if (formValues.model || formValues.part) {
    itemsList.push({
      model: formValues.model,
      part: formValues.part || '',
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
      });
    }
  });

  // 将对象数组转换为JSON字符串
  return {
    items: JSON.stringify(itemsList),
  };
};

// 处理重置表单
const handleReset = () => {
  formApi.resetForm(); // 重置表单字段
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
  height: 450,
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
      data: tableData.value?.result || [],
      loading: loading.value,
    },
  });
});
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <!-- 顶部参数输入区 -->
    <div class="mt-4 w-full">
      <a-card>
        <div
          class="flex space-x-2"
          style="position: absolute; top: 20px; right: 35px"
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
        <div style="margin-top: 30px; margin-bottom: 10px">
          <Form />
        </div>
        <a-button
          type="primary"
          @click="handleSubmit"
          style="position: absolute; right: 40px; bottom: 10px"
        >
          提交
        </a-button>
        <a-button
          type="default"
          @click="handleReset"
          style="position: absolute; right: 120px; bottom: 10px"
        >
          重置
        </a-button>
      </a-card>
    </div>
    <!-- 底部表格结果 -->
    <div class="mt-4 w-full">
      <Grid />
    </div>
    <div class="mt-4 w-full"></div>
  </div>
</template>
