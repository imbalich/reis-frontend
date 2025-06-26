<script setup lang="ts">
import type { fitmodelParams } from '#/api';

import { computed, ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createPartFittingApi,
  createProductFittingApi,
  queryPartFittingApi,
  queryProductFittingApi,
} from '#/api';
import DistributionFactory from '#/custom/weibull/factories/distrbution-fact';

import { schema } from './data';
import WeibullTrends from './weibull-trends.vue';

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema,
  wrapperClass: 'grid grid-cols-3 gap-4',
});

const fittingData = ref<any[]>([]);
const loading = ref(false);

// 顶部参数输入区的表单

// 处理提交逻辑
const handleSubmit = async () => {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const Createdata = (await formApi.getValues()) as fitmodelParams;
  const Querydata = (await formApi.getValues()) as fitmodelParams;

  // 处理 source 字段
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  let source = 1;
  if (
    (!Querydata.input_date || Querydata.input_date === todayStr) &&
    (!Querydata.method || Querydata.method === 'MLE')
  ) {
    source = 0;
  }
  Querydata.source = source;

  try {
    // 1. 先查库
    loading.value = true;
    const res = Querydata.part
      ? await queryPartFittingApi(Querydata)
      : await queryProductFittingApi(Querydata);
    if (res && res.length > 0) {
      fittingData.value = res;
      message.success('查询成功，已获取到数据');
      return;
    }
    // 2、查不到则创建
    await (Querydata.part
      ? createPartFittingApi(Createdata)
      : createProductFittingApi(Createdata));
    message.info('数据正在生成，请几分钟后再查询');
  } catch {
    message.error('操作失败');
  } finally {
    loading.value = false;
  }
};

// 左侧策略选择表单

// 图表 funcType 可选
const activeFuncType = ref('PDF'); // 默认 PDF
const funcTypeOptions = [
  { label: 'PDF', value: 'PDF' },
  { label: 'CDF', value: 'CDF' },
  { label: 'SF', value: 'SF' },
];

// 优度检验选项
const goodnessOptions = [
  { label: 'BIC', value: 'bic' },
  { label: 'AICc', value: 'aicc' },
  { label: 'AD', value: 'ad' },
  { label: 'Log-likelihood', value: 'log_likelihood' },
];
const selectedGoodness = ref('bic');

// 当前选中的优度检验
const sortedData = computed(() => {
  const key = selectedGoodness.value;
  if (key === 'log_likelihood') {
    return [...fittingData.value].sort((a, b) => b[key] - a[key]);
  }
  return [...fittingData.value].sort((a, b) => a[key] - b[key]);
});

// 按照优度检验对分布类型进行排序后的结果
const distributionOptions = computed(() =>
  sortedData.value.map((item) => ({
    label: item.distribution,
    value: item.distribution,
  })),
);

// 当前选中的分布类型，默认第一个
const selectedDistribution = ref('');
watch(
  distributionOptions,
  (opts) => {
    if (
      opts.length > 0 &&
      !opts.some((opt) => opt.value === selectedDistribution.value)
    ) {
      selectedDistribution.value = opts[0]?.value || '';
    }
  },
  { immediate: true },
);

// 找到当前选中的分布数据对象
const currentDistData = computed(() =>
  fittingData.value.find(
    (item) => item.distribution === selectedDistribution.value,
  ),
);

// 保证每次数据变化都重置分布类型
watch(fittingData, (data) => {
  selectedDistribution.value = data.length > 0 ? data[0].distribution : '';
});

// 右侧图形展示区

// 用工厂函数生成 strategy 对象
const chartStrategy = computed(() =>
  currentDistData.value
    ? DistributionFactory.createStrategy(currentDistData.value)
    : undefined,
);
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <!-- 顶部参数输入区 -->
    <div class="mt-3 w-full">
      <a-card title="参数输入区">
        <Form />
        <a-button
          type="primary"
          @click="handleSubmit"
          style="position: absolute; bottom: 30px; right: 60px"
        >
          提交
        </a-button>
      </a-card>
    </div>
    <!-- 下方左右布局 -->
    <div class="mt-4 flex w-full space-x-4">
      <!-- 左侧策略选择表单 -->
      <a-card title="策略选择区" style="width: 300px">
        <a-form layout="vertical">
          <a-form-item label="优度检验">
            <a-select v-model:value="selectedGoodness" style="width: 100%">
              <a-select-option
                v-for="item in goodnessOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="分布类型">
            <a-select v-model:value="selectedDistribution" style="width: 100%">
              <a-select-option
                v-for="item in distributionOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="函数类型">
            <a-select v-model:value="activeFuncType" style="width: 100%">
              <a-select-option
                v-for="item in funcTypeOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-card>
      <!-- 右侧图形展示区 -->
      <a-card title="图形展示区" style="flex: 1; min-width: 0">
        <WeibullTrends
          v-if="chartStrategy"
          :func-type="activeFuncType"
          :strategy="chartStrategy"
        />
        <div v-else style="text-align: center; color: #aaa; padding: 60px 0">
          请先查询并选择分布类型
        </div>
      </a-card>
    </div>
  </div>
</template>
