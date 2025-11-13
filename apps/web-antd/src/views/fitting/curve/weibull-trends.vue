<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { ChartPoint } from '#/custom/weibull/chart-data';
import type { DistributionStrategy } from '#/custom/weibull/strategies/types';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import chartData from '#/custom/weibull/chart-data';

const TOTAL_YEARS = 30;
const MONTHS_PER_YEAR = 12;
const TOTAL_MONTHS = TOTAL_YEARS * MONTHS_PER_YEAR;

const props = defineProps<{
  funcType: string;
  strategy: DistributionStrategy;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const chartPoints = computed<ChartPoint[]>(() =>
  chartData.getChartData(props.strategy, props.funcType.toUpperCase()),
);

const formatYearMonth = (monthIndex: number) => {
  if (monthIndex >= TOTAL_MONTHS) {
    return `第${TOTAL_YEARS}年12月`;
  }
  const year = Math.floor(monthIndex / MONTHS_PER_YEAR) + 1;
  const month = (monthIndex % MONTHS_PER_YEAR) + 1;
  return `第${year}年${month}月`;
};

const xLabels = computed(() =>
  chartPoints.value.map((point) => formatYearMonth(point.monthIndex)),
);

const seriesData = computed(() =>
  chartPoints.value.map((point) => ({
    value: point.value,
    hours: point.hours,
  })),
);

const yAxisName = computed(() => {
  switch (props.funcType.toUpperCase()) {
    case 'CDF':
      return '不可靠度';
    case 'PDF':
      return 'λ(t)×10⁶';
    case 'SF':
      return '可靠度';
    default:
      return '';
  }
});

const renderChart = () => {
  renderEcharts({
    grid: {
      bottom: 30,
      containLabel: true,
      left: '3%',
      right: '3%',
      top: '8%',
    },
    series: [
      {
        data: seriesData.value,
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
      formatter: (params: any) => {
        const point = params?.[0];
        if (!point) {
          return '';
        }
        const hours = point?.data?.hours ?? '';
        const label = xLabels.value?.[point.dataIndex] ?? '';
        const value = point?.data?.value ?? '';
        return `${label}<br/>累计运行时间：${hours} 小时<br/>${yAxisName.value}：${value}`;
      },
    },
    xAxis: {
      axisLabel: {
        formatter: (_: string, index: number) => xLabels.value[index] ?? '',
        rotate: 45,
      },
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: xLabels.value,
      splitLine: {
        lineStyle: {
          type: 'solid',
          width: 1,
        },
        show: true,
      },
      type: 'category',
      name: '累计运行时间（第 x 年 y 月）',
      nameLocation: 'middle',
      nameGap: 40,
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
        nameGap: -260,
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

