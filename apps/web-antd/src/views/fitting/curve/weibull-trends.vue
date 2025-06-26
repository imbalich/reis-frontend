<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { DistributionStrategy } from '#/custom/weibull/strategies/types';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

// Update the import path below to the correct relative path if needed
import getChartData from '#/custom/weibull/chart-data';

// 接收父组件传递的参数
const props = defineProps<{
  funcType: string;
  strategy: DistributionStrategy;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 计算数据点
const chartPoints = computed(() => {
  // ChartData.getPDFData 返回 [[x, y], ...]
  return getChartData.getChartData(props.strategy, props.funcType);
});

// 拆分 x、y 数据
const xData = computed(() =>
  chartPoints.value
    .map((item) => item[0])
    .filter((x): x is number => typeof x === 'number'),
);
const yData = computed(() =>
  chartPoints.value
    .map((item) => item[1])
    .filter((y): y is number => typeof y === 'number'),
);

const renderChart = () => {
  renderEcharts({
    grid: {
      bottom: 0,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '2%',
    },
    series: [
      {
        areaStyle: {},
        data: yData.value,
        itemStyle: {
          color: '#5ab1ef',
        },
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#019680',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: xData.value,
      splitLine: {
        lineStyle: {
          type: 'solid',
          width: 1,
        },
        show: true,
      },
      type: 'category',
    },
    yAxis: [
      {
        axisTick: {
          show: false,
        },
        splitArea: {
          show: true,
        },
        splitNumber: 4,
        type: 'value',
      },
    ],
  });
};
// console.log('Weibull Trends Chart Data:', renderChart);
onMounted(renderChart);
watch([() => props.strategy, () => props.funcType], renderChart);
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
