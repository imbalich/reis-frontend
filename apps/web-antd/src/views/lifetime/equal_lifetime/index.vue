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

    // 检查返回数据的结构
    const resultData = res?.result;
    const hasValidResult = Array.isArray(resultData) && resultData.length > 0;

    // 检查 equal_lifetime_points 是否有数据（可能是对象或数组）
    const equalLifetimePoints = res?.equal_lifetime_points;
    const hasEqualLifetimePoints =
      equalLifetimePoints &&
      (Array.isArray(equalLifetimePoints)
        ? equalLifetimePoints.length > 0
        : Object.keys(equalLifetimePoints).length > 0);

    // 检查是否有图片数据（说明可能有部分数据已生成）
    const hasImageData = res?.img_original_result || res?.img_optimize_result;

    if (res && hasValidResult) {
      // 有有效的 result 数据
      tableData.value = resultData;
      original_img.value = res.img_original_result
        ? `data:image/png;base64,${res.img_original_result}`
        : '';
      optimize_img.value = res.img_optimize_result
        ? `data:image/png;base64,${res.img_optimize_result}`
        : '';
      equal_lifetime_t.value = res.equal_lifetime_t || 0;
      message.success('成功请求到数据');
    } else if (res && hasEqualLifetimePoints) {
      // result 为空，但 equal_lifetime_points 有数据
      // 尝试将 equal_lifetime_points 转换为表格数据
      let convertedData: any[] = [];

      if (Array.isArray(equalLifetimePoints)) {
        convertedData = equalLifetimePoints;
      } else if (typeof equalLifetimePoints === 'object') {
        // 如果是对象，尝试转换为数组
        convertedData = Object.values(equalLifetimePoints).filter(
          (item) => item && typeof item === 'object',
        ) as any[];
      }

      if (convertedData.length > 0) {
        tableData.value = convertedData;
        original_img.value = res.img_original_result
          ? `data:image/png;base64,${res.img_original_result}`
          : '';
        optimize_img.value = res.img_optimize_result
          ? `data:image/png;base64,${res.img_optimize_result}`
          : '';
        equal_lifetime_t.value = res.equal_lifetime_t || 0;
        message.success('成功请求到数据');
      } else {
        // equal_lifetime_points 无法转换为有效数据
        // 如果有图片数据，说明数据可能正在生成中
        if (hasImageData) {
          message.info('数据正在生成中，请稍后再查询');
        } else {
          // 没有图片数据，触发 POST 生成
          await createEqualLifeApi(formValues);
          message.info('请求已发送，请等待几分钟再查询');
        }
        tableData.value = [];
        original_img.value = res.img_original_result
          ? `data:image/png;base64,${res.img_original_result}`
          : '';
        optimize_img.value = res.img_optimize_result
          ? `data:image/png;base64,${res.img_optimize_result}`
          : '';
        equal_lifetime_t.value = res.equal_lifetime_t || 0;
      }
    } else if (res && hasImageData) {
      // result 为空，但有图片数据，说明数据可能正在生成中
      message.info('数据正在生成中，请稍后再查询');
      tableData.value = [];
      original_img.value = res.img_original_result
        ? `data:image/png;base64,${res.img_original_result}`
        : '';
      optimize_img.value = res.img_optimize_result
        ? `data:image/png;base64,${res.img_optimize_result}`
        : '';
      equal_lifetime_t.value = res.equal_lifetime_t || 0;
    } else {
      // result 为空且没有其他数据，触发 POST 生成
      await createEqualLifeApi(formValues);
      message.info('请求已发送，请等待几分钟再查询');
      tableData.value = [];
      original_img.value = '';
      optimize_img.value = '';
      equal_lifetime_t.value = 0;
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
