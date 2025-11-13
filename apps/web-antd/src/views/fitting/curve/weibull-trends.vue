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

// 根据 funcType 计算 Y 轴标题
const yAxisName = computed(() => {
  switch (props.funcType.toUpperCase()) {
    case 'CDF': {
      return '不可靠度';
    }
    case 'PDF': {
      return 'λ(t)×10⁶';
    }
    case 'SF': {
      return '可靠度';
    }
    default: {
      return '';
    }
  }
});

const renderChart = () => {
  renderEcharts({
    grid: {
      bottom: 30,
      containLabel: true,
      left: '2%',
      right: '1%',
      top: '7%',
    },
    series: [
      {
        // areaStyle: {},
        data: yData.value,
        itemStyle: {
          color: '#5ab1ef',
        },
        lineStyle: {
          width: 3,
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
      name: '累计运行时间（小时）',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#333',
        fontSize: 14,
      },
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
        name: yAxisName.value,
        nameLocation: 'start',
        nameGap: -300,
        nameTextStyle: {
          color: '#333',
          fontSize: 14,
        },
      },
    ],
  });
};
onMounted(renderChart);
watch([() => props.strategy, () => props.funcType], renderChart);
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
