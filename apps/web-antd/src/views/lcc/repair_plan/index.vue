<script setup lang="ts">
import { ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRepairPlanApi } from '#/api';

import { columns, schema } from './data';

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema,
  wrapperClass: 'grid grid-cols-3 gap-4',
});

// 数据
const tableData = ref();
const ratio = ref();
const loading = ref(false);
const model = ref();

// 处理提交逻辑
const handleSubmit = async () => {
  loading.value = true;
  try {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const formValues = await formApi.getValues();
    if (formValues.parts) {
      formValues.parts = Object.values(formValues.parts);
    }

    const res = await getRepairPlanApi(formValues);
    tableData.value = res.result;
    ratio.value = res.ratio;
    model.value = formValues.model;
    message.success('数据请求成功');
  } catch {
    message.error('数据请求失败');
  } finally {
    loading.value = false;
  }
};

// 处理重置表单
const handleReset = () => {
  formApi.resetForm();
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
  height: 350,
  // maxHeight: 200,
  exportConfig: {},
  printConfig: {},
  scrollX: {
    enabled: true,
  },
  columns,
  data: tableData.value,
  loading: loading.value,
};
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 监听数据变化
watch([tableData, loading], () => {
  gridApi?.setState?.({
    gridOptions: {
      ...gridApi?.state?.gridOptions,
      data: tableData.value,
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
        <Form />
        <a-button
          type="primary"
          @click="handleSubmit"
          style="position: absolute; right: 40px; bottom: 5px"
        >
          提交
        </a-button>
        <a-button
          type="default"
          @click="handleReset"
          style="position: absolute; right: 120px; bottom: 5px"
        >
          重置
        </a-button>
      </a-card>
    </div>
    <!-- 表格 -->
    <div class="mt-4 w-full">
      <Grid />
    </div>
    <!-- 图形展示区 -->
    <div class="mt-4 flex w-full space-x-4">
      <a-card style="flex: 1; min-width: 0">
        与现行维修方案相比，{{ model }}最优维修方案下，经济指标提升
        <b>{{ ratio }}</b> %。
      </a-card>
    </div>
  </div>
</template>
