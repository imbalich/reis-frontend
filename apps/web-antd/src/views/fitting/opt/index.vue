<script setup lang="ts">
import { ref } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createOptApi } from '#/api';

import { schema } from './data';

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema,
  wrapperClass: 'grid grid-cols-4 gap-4',
});

const img1 = ref('');
const img2 = ref('');
const loading = ref(false);
const resultData = ref<[number, number] | null>(null);

const handleSubmit = async () => {
  loading.value = true;
  try {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const formValues = await formApi.getValues();
    // 转为数字
    if (formValues.cm_price !== undefined) {
      formValues.cm_price = Number(formValues.cm_price);
    }
    if (formValues.pm_price !== undefined) {
      formValues.pm_price = Number(formValues.pm_price);
    }
    const res = await createOptApi(formValues); // 这里调用你的后端接口
    // 假设返回格式为 { data: { data: [...], plots: [base641, base642] } }
    resultData.value = res.data;
    img1.value = `data:image/png;base64,${res.plots[0]}`;
    img2.value = `data:image/png;base64,${res.plots[1]}`;
    message.success('数据请求成功');
  } catch {
    message.error('数据请求失败');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <!-- 顶部参数输入区 -->
    <div class="mt-4 w-full">
      <a-card
        title="参数输入区"
        :head-style="{ padding: '8px 16px', minHeight: 'unset' }"
      >
        <Form />
        <a-button
          type="primary"
          style="position: absolute; right: 40px; bottom: 10px"
          @click="handleSubmit"
        >
          提交
        </a-button>
      </a-card>
    </div>
    <!--中间计算结果区-->
    <div class="mt-4 w-full">
      <a-card
        title="计算结果区"
        :body-style="{ padding: '12px 24px' }"
        :head-style="{ padding: '8px 16px', minHeight: 'unset' }"
      >
        <div
          v-if="resultData"
          style="display: flex; align-items: center; padding-left: 42px"
        >
          <span style="min-width: 27%">
            <b>最佳更换时间：</b>{{ Math.round(resultData[0]) }}（小时）
          </span>
          <span style="min-width: 25%">
            <b>单位时间内的最低成本：</b>
            {{ (Math.round(resultData[0]) * resultData[1]).toFixed(1) }}（元）
          </span>
        </div>
        <div v-else style="color: #aaa; text-align: left">
          请提交参数后查看结果
        </div>
      </a-card>
    </div>
    <!-- 下方左右布局 -->
    <div class="mt-4 flex w-full space-x-4">
      <!-- 左侧策略选择表单 -->
      <a-card
        title="最佳更换时间估算"
        :body-style="{ padding: '3px' }"
        :head-style="{ padding: '8px', minHeight: 'unset' }"
        style="flex: 1"
      >
        <template v-if="img1">
          <img
            :src="img1"
            alt="最佳更换时间估算"
            style="display: block; width: 80%; margin: 0 auto"
          />
        </template>
        <template v-else>
          <div style="width: 80%; height: 280px; margin: 15px auto 0"></div>
        </template>
      </a-card>
      <!-- 右侧图形展示区 -->
      <a-card
        title="在一系列CM成本范围内的最佳更换间隔"
        :body-style="{ padding: '3px' }"
        :head-style="{ padding: '8px', minHeight: 'unset' }"
        style="flex: 1"
      >
        <img
          v-if="img2"
          :src="img2"
          alt="在一系列CM成本范围内的最佳更换间隔"
          style="display: block; width: 80%; margin: 0 auto"
        />
      </a-card>
    </div>
  </div>
</template>
