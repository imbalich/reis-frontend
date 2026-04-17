<script setup lang="ts">
import type { fitmodelParams } from '#/api';
import type { TimeParams } from '#/custom/weibull/chart-data';

import { computed, ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createPartFittingApi,
  createProductFittingApi,
  getProductRunTimeParamsApi,
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
  handleValuesChange: async (_, fieldsChanged) => {
    if (fieldsChanged.includes('model')) {
      await formApi.setValues({
        product_config_code: undefined,
        part: undefined,
      });
      return;
    }

    if (fieldsChanged.includes('product_config_code')) {
      await formApi.setValues({
        part: undefined,
      });
    }
  },
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
const timeParams = ref<TimeParams | undefined>(undefined);

const handleSubmit = async () => {
  const { valid } = await formApi.validate();
  if (!valid) return;

  const createData = (await formApi.getValues()) as fitmodelParams;
  const queryData = (await formApi.getValues()) as fitmodelParams;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  let source = 1;
  if (
    (!queryData.input_date || queryData.input_date === todayStr) &&
    (!queryData.method || queryData.method === 'MLE')
  ) {
    source = 0;
  }
  queryData.source = source;

  try {
    loading.value = true;
    const res = queryData.part
      ? await queryPartFittingApi(queryData)
      : await queryProductFittingApi(queryData);

    if (res && res.length > 0) {
      fittingData.value = res;

      try {
        const runTimeParams = await getProductRunTimeParamsApi(
          queryData.model,
          queryData.product_config_code,
        );
        timeParams.value = {
          daysPerYear: runTimeParams.year_days ?? undefined,
          hoursPerDay: runTimeParams.avg_worktime ?? undefined,
        };
      } catch {
        timeParams.value = undefined;
        message.warn('获取产品运行参数失败，已使用默认值');
      }

      message.success('查询成功，已获取到拟合结果');
      return;
    }

    await (queryData.part
      ? createPartFittingApi(createData)
      : createProductFittingApi(createData));
    message.info('拟合任务已提交，请稍后重新查询');
  } catch {
    message.error('操作失败');
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  formApi.resetForm();
  fittingData.value = [];
  timeParams.value = undefined;
  calculateResult.value = [];
};

const handleCalculateQuery = async () => {
  const mainValues = (await formApi.getValues()) as fitmodelParams;
  if (!mainValues.part) {
    message.warning('请先选择零部件后再进行计算查询');
    return;
  }

  const { valid } = await calculateFormApi.validate();
  if (!valid) return;

  const calculateValues = await calculateFormApi.getValues();
  const params = {
    model: mainValues.model,
    product_config_code: mainValues.product_config_code,
    part: mainValues.part,
    input_time1: calculateValues.input_time1,
    input_time2: calculateValues.input_time2,
  };

  try {
    const res = await queryPartCalculateApi(params);
    calculateResult.value = res;
    message.success('计算查询成功');
  } catch {
    message.error('计算查询失败');
  }
};

const activeFuncType = ref('PDF');
const funcTypeOptions = [
  { label: 'PDF(密度)', value: 'PDF' },
  { label: 'CDF(累计失效概率)', value: 'CDF' },
  { label: 'SF(可靠度)', value: 'SF' },
  { label: 'HF(瞬时失效率)', value: 'HF' },
  { label: 'CHF(累计失效率)', value: 'CHF' },
];

const goodnessOptions = [
  { label: 'BIC', value: 'bic' },
  { label: 'AICc', value: 'aicc' },
  { label: 'AD', value: 'ad' },
  { label: 'Log-likelihood', value: 'log_likelihood' },
];
const selectedGoodness = ref('bic');

const sortedData = computed(() => {
  const key = selectedGoodness.value;
  if (key === 'log_likelihood') {
    return [...fittingData.value].sort((a, b) => b[key] - a[key]);
  }
  return [...fittingData.value].sort((a, b) => a[key] - b[key]);
});

const distributionOptions = computed(() =>
  sortedData.value.map((item) => ({
    label: item.distribution,
    value: item.distribution,
  })),
);

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

const currentDistData = computed(() =>
  fittingData.value.find(
    (item) => item.distribution === selectedDistribution.value,
  ),
);

watch(fittingData, (data) => {
  selectedDistribution.value = data.length > 0 ? data[0].distribution : '';
});

const chartStrategy = computed(() =>
  currentDistData.value
    ? DistributionFactory.createStrategy(currentDistData.value)
    : undefined,
);
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <div class="mt-4 w-full">
      <a-card title="参数输入区">
        <Form />
        <a-button
          :loading="loading"
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

    <div class="mt-4 flex w-full space-x-4" style="height: 440px">
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

      <a-card title="图形展示区" style="flex: 1; min-width: 0">
        <WeibullTrends
          v-if="chartStrategy"
          :func-type="activeFuncType"
          :strategy="chartStrategy"
          :time-params="timeParams"
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
          <a-form-item label="涨幅">{{ calculateResult[2] }}%</a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>
