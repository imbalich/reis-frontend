<script setup lang="ts">
import type { fitmodelParams } from '#/api';

import { computed, ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createPartFittingApi,
  createProductFittingApi,
  queryPartCalculateApi,
  queryPartFittingApi,
  queryProductFittingApi,
} from '#/api';
import DistributionFactory from '#/custom/weibull/factories/distrbution-fact';

import { calculateSchema, schema } from './data';
import WeibullTrends from './weibull-trends.vue';

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema,
  wrapperClass: 'grid grid-cols-4 gap-4',
});

const [CalculateForm, calculateFormApi] = useVbenForm({
  layout: 'horizontal',
  showDefaultActions: false,
  schema: calculateSchema,
  wrapperClass: 'grid-2',
});

const fittingData = ref<any[]>([]);
const loading = ref(false);
const calculateResult = ref<number[]>([]);

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

// 处理重置表单
const handleReset = () => {
  formApi.resetForm();
};

// 处理计算查询逻辑
const handleCalculateQuery = async () => {
  const { valid } = await calculateFormApi.validate();
  if (!valid) return;
  const calculateValues = await calculateFormApi.getValues();
  const mainValues = await formApi.getValues();
  const params = {
    model: mainValues.model,
    part: mainValues.part,
    input_time1: calculateValues.input_time1,
    input_time2: calculateValues.input_time2,
  };
  try {
    const res = await queryPartCalculateApi(params);
    // 这里可以处理返回的结果，例如显示在页面上
    calculateResult.value = res;
    message.success('计算查询成功');
  } catch {
    message.error('计算查询失败');
  }
};

// 左侧策略选择表单

// 图表 funcType 可选
const activeFuncType = ref('PDF'); // 默认 PDF
const funcTypeOptions = [
  { label: 'PDF（密度）', value: 'PDF' },
  { label: 'CDF（累计失效概率）', value: 'CDF' },
  { label: 'SF（可靠度）', value: 'SF' },
  { label: 'HF（瞬时失效率）', value: 'HF' },
  { label: 'CHF（累计失效率）', value: 'CHF' },
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
    <div class="mt-4 w-full">
      <a-card title="参数输入区">
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
    <!-- 下方左右布局 -->
    <div class="mt-4 flex w-full space-x-4" style="height: 440px">
      <!-- 左侧策略选择表单 -->
      <a-card title="策略选择区" style="width: 230px">
        <a-form layout="vertical">
          <a-form-item label="优度检验" style="margin-bottom: 40px">
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
          <a-form-item label="分布类型" style="margin-bottom: 40px">
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
          style="height: 350px"
        />
        <div v-else style="padding: 60px 0; color: #aaa; text-align: center">
          请先查询并选择分布类型
        </div>
      </a-card>
      <a-card title="计算结果区" style="width: 230px">
        <CalculateForm style="margin-left: -50px" />
        <a-button
          type="primary"
          @click="handleCalculateQuery"
          style="position: absolute; right: 10px; top: 10px"
        >
          查询
        </a-button>
        <a-divider />
        <a-form>
          <a-form-item label="基准故障率">
            {{ calculateResult[0] }}
          </a-form-item>
          <a-form-item label="对比故障率">
            {{ calculateResult[1] }}
          </a-form-item>
          <a-form-item label="涨幅"> {{ calculateResult[2] }}% </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>
