<script setup lang="ts">
import { ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createEqualLifeApi, getEqualLifeApi } from '#/api';

import { columns, schema } from './data';

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema,
  wrapperClass: 'grid grid-cols-5 gap-4',
});

// 数据
const original_img = ref('');
const optimize_img = ref('');
const tableData = ref();
const equal_lifetime_t = ref(0);
const loading = ref(false);

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
    // 提交查询
    const res = await getEqualLifeApi(formValues);
    if (res && res.result && res.result.length > 0) {
      tableData.value = res.result;
      original_img.value = `data:image/png;base64,${res.img_original_result}`;
      optimize_img.value = `data:image/png;base64,${res.img_optimize_result}`;
      equal_lifetime_t.value = res.equal_lifetime_t;
      // if (!equal_lifetime_t.value) {
      //   Modal.info({
      //     title: '提示',
      //     content: '未找到等寿命点，保证所有部件在t0时刻均大于目标值R(t)',
      //     okText: '确定',
      //     centered: true, // 居中显示
      //     onOk() {},
      //   });
      // }
      message.success('成功请求到数据');
    } else {
      // 数据不匹配，触发POST生成
      await createEqualLifeApi(formValues);
      message.info('请求已发送，请等待几分钟再查询');
      tableData.value = [];
    }
  } catch {
    tableData.value = [];
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
  height: 800,
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
      <span>
        说明：组1：在维修周期处SF≥0.99；组2：在维修周期处
        0.95＜SF＜0.99,；组3：在维修周期处；SF≤0.95；组4：必换件。
      </span>
      <Grid />
    </div>
    <!-- 图形展示区 -->
    <div class="mt-4 flex w-full space-x-4" style="height: 600px">
      <a-card style="flex: 1; min-width: 0">
        <img
          v-if="original_img"
          :src="original_img"
          alt="优化前各部件寿命曲线图"
          style="display: block; width: 90%; margin: 0 auto"
        />
      </a-card>
      <a-card style="flex: 1; min-width: 0">
        <img
          v-if="optimize_img"
          :src="optimize_img"
          alt="优化后各部件寿命曲线图"
          style="display: block; width: 90%; margin: 0 auto"
        />
      </a-card>
    </div>
    <div class="mt-4 w-full"></div>
  </div>
</template>
