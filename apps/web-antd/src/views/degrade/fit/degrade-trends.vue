<script setup lang="ts">
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { DegradeFunctionData } from '#/custom/degrade/strategies/types';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import DegradeChartData from '#/custom/degrade/chart-data';
import { DegradeFunctionFactory } from '#/custom/degrade/factories/function-factory';
import {
  getFunctionExpression,
  getFunctionType,
} from '#/custom/degrade/function-express';

// 接收父组件传递的参数
const props = defineProps<{
  currentFunction: DegradeFunctionData;
  loading?: boolean;
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 渲染图表
const renderChart = () => {
  const ciDataUpper = chartOptions.value.ciData?.upper ?? [];
  const ciDataLower = chartOptions.value.ciData?.lower ?? [];

  const ciArea = [
    ...ciDataUpper,
    ...[...ciDataLower].reverse(), // 下界反向拼接
  ];
  renderEcharts({
    title: {
      text: `参数退化曲线 - ${props.currentFunction?.product_model} - ${props.currentFunction?.check_bezier}`,
      left: 'center',
    },
    legend: {
      data: [
        '拟合曲线',
        '置信区间上界',
        '置信区间下界',
        '峰值点',
        '失效阈值',
        '当前阈值',
      ],
      bottom: '8%',
      right: '5%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      top: '16%',
      containLabel: true,
    },
    graphic: [
      {
        type: 'text',
        left: '2%',
        top: '8%',
        style: {
          text: chartOptions.value.functionText,
          fontSize: 15,
          fill: '#666',
        },
        z: 100,
      },
    ],
    series: [
      {
        name: '拟合曲线',
        type: 'line',
        smooth: true,
        data: chartOptions.value.chartData?.map(([x, y]) => [
          x,
          Number(y.toFixed(2)),
        ]),
        itemStyle: { color: '#5470C6' },
        markPoint: {
          symbolSize: 1,
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' },
          ],
        },
      },
      {
        name: '置信区间上界',
        type: 'line',
        smooth: true,
        data: ciDataUpper.map(([x, y]) => [x, Number(y.toFixed(2))]),
        lineStyle: { opacity: 0.5, type: 'dashed' },
        itemStyle: { color: 'rgba(10, 87, 179, 0.5)' },
        showSymbol: false,
      },
      {
        name: '置信区间下界',
        type: 'line',
        smooth: true,
        data: ciDataLower.map(([x, y]) => [x, Number(y.toFixed(2))]),
        lineStyle: { opacity: 0.5, type: 'dashed' },
        itemStyle: { color: 'rgba(10, 87, 179, 0.5)' },
        showSymbol: false,
      },
      {
        name: '置信区间',
        type: 'line',
        data: ciArea,
        areaStyle: {
          color: 'rgba(90, 177, 239, 0.2)', // 浅蓝色
        },
        lineStyle: { opacity: 0 }, // 不显示边界线
        symbol: 'none',
        silent: true,
        tooltip: { trigger: 'none' },
      },
      {
        name: '峰值点',
        type: 'scatter',
        data: chartOptions.value.peakData,
        symbolSize: 10,
        // symbol: 'circle',
        itemStyle: { color: '#EE6666', borderColor: '#fff' },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) =>
            `(${params.value[0].toFixed(3)}, ${params.value[1].toFixed(2)})`,
        },
        emphasis: {
          // 悬停状态
          label: {
            show: true,
            fontSize: 14, // 加大字号
            fontWeight: 'bold', // 加粗
            color: '#000', // 变黑更清晰
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // 添加背景白底
            padding: [2, 4],
            borderRadius: 3,
            shadowBlur: 3,
            shadowColor: '#000',
          },
          itemStyle: {
            color: '#FF0000', // 悬停时点变红
            borderColor: '#000',
            borderWidth: 3,
          },
        },
        z: 5,
      },
      {
        name: '失效阈值',
        type: 'line',
        data: chartOptions.value.failureThresholdLineData,
        lineStyle: { opacity: 1, type: 'dashed' },
        itemStyle: { color: '#FF0000' },
        showSymbol: false,
        z: 3,
      },
      {
        name: '当前阈值',
        type: 'line',
        data: chartOptions.value.currentThresholdLineData,
        lineStyle: { opacity: 1, type: 'dashed' },
        itemStyle: { color: '#91CC75' },
        showSymbol: false,
        z: 3,
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
      type: 'value',
      name: '累计运行时间(万小时)',
      nameLocation: 'middle',
      nameGap: 30,
      splitNumber: 10,
      nameTextStyle: {
        fontSize: 14,
      },
    },
    yAxis: {
      type: 'value',
      name: props.currentFunction?.check_bezier,
      nameLocation: 'middle',
      nameGap: 48,
      min: chartOptions.value.yMin,
      // max: chartOptions.value.yMax,
      splitNumber: 10,
      axisLabel: {
        formatter: (value: number) => {
          // 保留 2 位小数，避免过长
          return value.toFixed(2);
        },
      },
      nameTextStyle: {
        fontSize: 14,
      },
    },
  });
};

// 图表数据
const getChartOptions = () => {
  if (!props.currentFunction) return {};

  try {
    // 1. 数据准备
    const strategy = DegradeFunctionFactory.createStrategy(
      props.currentFunction,
    );
    const chartData = DegradeChartData.getChartData(
      strategy,
      props.currentFunction.x_peaks,
    );
    const ciData = DegradeChartData.getConfidenceIntervalData(
      strategy,
      props.currentFunction.x_peaks,
    );
    const peakData = props.currentFunction?.x_peaks.map((x, index) => [
      x,
      props.currentFunction?.y_peaks[index],
    ]);
    const xMax = chartData?.[chartData.length - 1]?.[0];
    const failureThreshold = props.currentFunction?.failure_threshold;
    const failureThresholdLineData = failureThreshold
      ? [
          [0, failureThreshold],
          [xMax, failureThreshold],
        ]
      : [];
    const currentThreshold = props.currentFunction?.current_threshold;
    const currentThresholdLineData = currentThreshold
      ? [
          [0, currentThreshold],
          [xMax, currentThreshold],
        ]
      : [];

    // 2. 函数表达式
    const { name, params } = props.currentFunction;
    const functionType = getFunctionType(name);
    const paramInfo = getFunctionExpression(name, params);
    const functionText = `${functionType}: ${paramInfo}`;

    // 3. y轴范围
    let yMin = 0;
    let yMax = 1;
    if (props.currentFunction.all_negative === true) {
      yMin = Math.max(...props.currentFunction.y_peaks) * 6.5;
      yMax = 0;
    }
    if (props.currentFunction.all_negative === false) {
      yMin = Math.min(...props.currentFunction.y_peaks) * 0.5;
      yMax = Math.max(...props.currentFunction.y_peaks) * 1.5;
    }
    // const yMin = Math.min(...props.currentFunction.y_peaks) * 0.5;
    // const yMax = Math.max(...props.currentFunction.y_peaks) * 1.5;

    return {
      chartData,
      ciData,
      failureThresholdLineData,
      currentThresholdLineData,
      functionText,
      peakData,
      yMin,
      yMax,
    };
  } catch (error) {
    console.error('生成图表配置失败', error);
    return {};
  }
};
const chartOptions = computed(() => getChartOptions());

// 监听数据变化自动渲染
onMounted(renderChart);
watch(() => props.currentFunction, renderChart, { deep: true });
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
