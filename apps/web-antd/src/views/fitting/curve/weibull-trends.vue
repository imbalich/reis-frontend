<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { ChartPoint } from '#/custom/weibull/chart-data';
import type { DistributionStrategy } from '#/custom/weibull/strategies/types';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import chartData from '#/custom/weibull/chart-data';

const props = defineProps<{
  funcType: string;
  strategy: DistributionStrategy;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const chartPoints = computed<ChartPoint[]>(() =>
  chartData.getChartData(props.strategy, props.funcType.toUpperCase()),
);

const formatYearLabel = (monthIndex: number) =>
  `第${Math.floor(monthIndex / 12) + 1}年`;

const formatYearMonth = (monthIndex: number) => {
  const year = Math.floor(monthIndex / 12) + 1;
  const month = (monthIndex % 12) + 1;
  return `第${year}年${month}月`;
};

const xAxisData = computed(() =>
  chartPoints.value.map((point) => point.monthIndex),
);

const seriesData = computed(() =>
  chartPoints.value.map((point) => ({
    value: point.value,
    hours: point.hours,
    monthIndex: point.monthIndex,
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
      bottom: 45,
      containLabel: true,
      left: '4%',
      right: '4%',
      top: 20,
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
        const monthIndex = point?.data?.monthIndex ?? 0;
        const label = formatYearMonth(monthIndex);
        const value = point?.data?.value ?? '';
        return `${label}<br/>累计运行时间：${hours} 小时<br/>${yAxisName.value}：${value}`;
      },
    },
    xAxis: {
      axisLabel: {
        formatter: (_: string, index: number) => {
          const monthIndex = chartPoints.value[index]?.monthIndex ?? 0;
          const month = (monthIndex % 12) + 1;
          if (month === 1 || index === 0) {
            return formatYearLabel(monthIndex);
          }
          return '';
        },
        rotate: 45,
      },
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: xAxisData.value,
      name: '累计运行时间（年）',
      nameGap: 35,
      nameLocation: 'middle',
      splitLine: {
        lineStyle: {
          type: 'solid',
          width: 1,
        },
        show: true,
      },
      type: 'category',
      nameTextStyle: {
        color: '#333',
        fontSize: 14,
        padding: [20, 0, 0, 0],
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
        nameLocation: 'middle',
        nameGap: 35,
        nameRotate: 90,
        nameTextStyle: {
          color: '#333',
          fontSize: 14,
          padding: [0, 0, 0, 30],
        },
      },
    ],
  });
};

onMounted(renderChart);
watch([() => props.strategy, () => props.funcType], renderChart);
</script>

<template>
  <EchartsUI ref="chartRef" style="height: 360px" />
</template>
