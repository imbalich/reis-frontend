<script setup lang="ts">
import type { RBDGraphData } from '../types';

import { computed, ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { calculateRBDReliability, validateRBDTopology } from '../calculation';

// 定义props
interface ProjectCalculationConfig {
  reliability: {
    dataPoints: number;
    displayTime: number;
    duration: number;
    startTime: number;
  };
  reliabilityCalc: {
    considerMaintenance: boolean;
    mttf: boolean;
    reliability: boolean;
  };
  availabilityCalc: {
    mtbf: boolean;
    mttr: boolean;
  };
}

interface Props {
  projectConfig: ProjectCalculationConfig;
  graphData?: RBDGraphData;
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  configUpdate: [config: ProjectCalculationConfig];
}>();

// 本地配置状态
const localConfig = ref<ProjectCalculationConfig>({ ...props.projectConfig });

// 验证状态
const validationErrors = ref<Record<string, string>>({});

// 计算状态
const calculating = ref(false);
const hasResults = ref(false);
const calculationError = ref('');

// 计算结果
const calculationResults = ref<{
  calculationTime: number;
  error?: string;
  nodeResults: Map<string, any>;
  systemReliability: number[];
  totalTime: number;
}>({
  systemReliability: [],
  nodeResults: new Map(),
  calculationTime: 0,
  totalTime: 0,
});

// 时间序列数据
const timeSeriesData = ref<any[]>([]);

// 模拟计算结果（用于未实现的功能）
const mockResults = ref({
  reliability: 0.9512,
  mttf: 10_000,
  mtbf: 8760,
  mttr: 24,
});

// 表格列定义
const tableColumns = computed(() => {
  const columns = [
    {
      title: '时间 (小时)',
      key: 'time',
      dataIndex: 'time',
      width: 120,
      sorter: true,
    },
    {
      title: '可靠度 R(t)',
      key: 'reliability',
      dataIndex: 'reliability',
      width: 120,
      sorter: true,
    },
    {
      title: 'MTBF (小时)',
      key: 'mtbf',
      dataIndex: 'mtbf',
      width: 120,
      sorter: true,
    },
  ];

  return columns;
});

// 配置是否有效
const isConfigValid = computed(() => {
  const hasValidConfig = validateConfig();
  return hasValidConfig;
});

// 是否有图形数据
const hasGraphData = computed(() => {
  return (
    props.graphData &&
    props.graphData.nodes &&
    props.graphData.nodes.length > 0 &&
    props.graphData.edges &&
    props.graphData.edges.length > 0
  );
});

// 显示时间点索引
const displayTimeIndex = computed(() => {
  if (calculationResults.value.systemReliability.length === 0) return 0;

  const { startTime, duration, dataPoints, displayTime } =
    localConfig.value.reliability;
  const timeStep = (duration - startTime) / (dataPoints - 1);
  const index = Math.round((displayTime - startTime) / timeStep);

  return Math.max(
    0,
    Math.min(index, calculationResults.value.systemReliability.length - 1),
  );
});

// 计算属性：动态边界值
const computedMaxStartTime = computed(() => {
  return Math.max(0, localConfig.value.reliability.duration - 1);
});

const computedMinDuration = computed(() => {
  return localConfig.value.reliability.startTime + 1;
});

// 验证规则
const validationRules = {
  startTime: [
    { required: true, message: '时间起点不能为空', trigger: 'change' },
    { type: 'number', min: 0, message: '时间起点不能小于0', trigger: 'change' },
  ],
  duration: [
    { required: true, message: '持续时间不能为空', trigger: 'change' },
    { type: 'number', min: 1, message: '持续时间必须大于0', trigger: 'change' },
  ],
  dataPoints: [
    { required: true, message: '数据点数量不能为空', trigger: 'change' },
    {
      type: 'number',
      min: 2,
      max: 1000,
      message: '数据点数量应在2-1000之间',
      trigger: 'change',
    },
  ],
  displayTime: [
    { required: true, message: '显示时间点不能为空', trigger: 'change' },
  ],
};

// 获取验证状态
const getValidateStatus = (field: string) => {
  return validationErrors.value[field] ? 'error' : '';
};

// 获取验证消息
const getValidateMessage = (field: string) => {
  return validationErrors.value[field] || '';
};

// 验证函数
const validateConfig = () => {
  const errors: Record<string, string> = {};

  // 时间起点验证
  if (localConfig.value.reliability.startTime < 0) {
    errors.startTime = '时间起点不能小于0';
  }
  if (
    localConfig.value.reliability.startTime >=
    localConfig.value.reliability.duration
  ) {
    errors.startTime = '时间起点必须小于持续时间';
  }

  // 持续时间验证
  if (
    localConfig.value.reliability.duration <=
    localConfig.value.reliability.startTime
  ) {
    errors.duration = '持续时间必须大于时间起点';
  }
  if (localConfig.value.reliability.duration <= 0) {
    errors.duration = '持续时间必须大于0';
  }

  // 数据点数量验证
  if (localConfig.value.reliability.dataPoints < 2) {
    errors.dataPoints = '数据点数量至少为2';
  }
  if (localConfig.value.reliability.dataPoints > 1000) {
    errors.dataPoints = '数据点数量不能超过1000';
  }

  // 显示时间点验证
  if (
    localConfig.value.reliability.displayTime <
    localConfig.value.reliability.startTime
  ) {
    errors.displayTime = '显示时间点不能小于时间起点';
  }
  if (
    localConfig.value.reliability.displayTime >
    localConfig.value.reliability.duration
  ) {
    errors.displayTime = '显示时间点不能大于持续时间';
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// 验证并更新配置
const validateAndUpdate = () => {
  // 自动修正边界值冲突
  if (
    localConfig.value.reliability.startTime >=
    localConfig.value.reliability.duration
  ) {
    localConfig.value.reliability.duration =
      localConfig.value.reliability.startTime + 1;
  }

  if (
    localConfig.value.reliability.displayTime <
    localConfig.value.reliability.startTime
  ) {
    localConfig.value.reliability.displayTime =
      localConfig.value.reliability.startTime;
  }
  if (
    localConfig.value.reliability.displayTime >
    localConfig.value.reliability.duration
  ) {
    localConfig.value.reliability.displayTime =
      localConfig.value.reliability.duration;
  }

  // 验证配置
  const isValid = validateConfig();

  // 如果验证通过，更新配置
  if (isValid) {
    updateConfig();
  }
};

// 监听props变化
watch(
  () => props.projectConfig,
  (newConfig) => {
    localConfig.value = { ...newConfig };
  },
  { immediate: true, deep: true },
);

// 更新配置
const updateConfig = () => {
  emit('configUpdate', { ...localConfig.value });
};

// 生成时间序列数据
const generateTimeSeriesData = () => {
  const data = [];
  const { startTime, duration, dataPoints } = localConfig.value.reliability;
  const timeStep = (duration - startTime) / (dataPoints - 1);

  for (let i = 0; i < dataPoints; i++) {
    const time = startTime + i * timeStep;

    const record: any = {
      key: i,
      time,
    };

    // 使用真实计算结果
    record.reliability = calculationResults.value.systemReliability[i] || 0;

    // MTBF使用模拟数据（基于系统可靠度计算）
    const reliability = record.reliability;
    if (reliability > 0) {
      // 基于可靠度估算MTBF：MTBF = -t / ln(R(t))
      record.mtbf = time > 0 ? -time / Math.log(reliability) : 0;
    } else {
      record.mtbf = 0;
    }

    data.push(record);
  }

  return data;
};

// 触发计算
const triggerCalculation = async () => {
  // 先验证配置
  const isValid = validateConfig();

  if (!isValid) {
    message.error('配置验证失败，请检查输入参数');
    return;
  }

  // 检查是否选择了计算参数
  if (!isConfigValid.value) {
    message.error('请至少选择一个计算参数');
    return;
  }

  // 检查图形数据
  if (!hasGraphData.value) {
    message.error('请先创建RBD模型，至少需要开始节点、结束节点和连接路径');
    return;
  }

  console.log('触发项目级可靠性计算，配置:', localConfig.value);

  // 开始计算
  calculating.value = true;
  hasResults.value = false;
  calculationError.value = '';

  try {
    // 验证拓扑结构
    const topologyResult = validateRBDTopology(props.graphData!);
    if (!topologyResult.isValid) {
      throw new Error(topologyResult.error || '拓扑结构验证失败');
    }

    // 执行可靠性计算
    const result = await calculateRBDReliability(
      props.graphData!,
      {
        start: localConfig.value.reliability.startTime,
        end: localConfig.value.reliability.duration,
        points: localConfig.value.reliability.dataPoints,
      },
      {
        includeMaintenance:
          localConfig.value.reliabilityCalc.considerMaintenance,
        calculationTypes: ['reliability'], // 目前只支持可靠度计算
      },
    );

    if (result.error) {
      throw new Error(result.error);
    }

    // 保存计算结果
    calculationResults.value = result;

    // 生成时间序列数据
    timeSeriesData.value = generateTimeSeriesData();

    hasResults.value = true;
    message.success('计算完成！');
    // 计算完成
  } catch (error) {
    console.error('计算过程出错:', error);
    calculationError.value =
      error instanceof Error ? error.message : '计算过程中发生未知错误';
    message.error(calculationError.value);
  } finally {
    calculating.value = false;
  }
};
</script>

<template>
  <div
    class="project-calculation-panel"
    style="height: 100%; padding: 16px; overflow-y: auto"
  >
    <!-- 可靠度/可用度计算栏目 -->
    <a-divider orientation="left">可靠度/可用度计算</a-divider>

    <a-form layout="vertical" :model="localConfig" :rules="validationRules">
      <!-- 时间起点 -->
      <a-form-item
        label="时间起点 (小时)"
        name="startTime"
        :validate-status="getValidateStatus('startTime')"
        :help="getValidateMessage('startTime')"
      >
        <a-input-number
          v-model:value="localConfig.reliability.startTime"
          :min="0"
          :max="computedMaxStartTime"
          :step="1"
          style="width: 100%"
          placeholder="输入时间起点"
          @change="validateAndUpdate"
        />
        <div style="margin-top: 4px; font-size: 12px; color: #666">
          计算的起始时间点，必须小于持续时间
        </div>
      </a-form-item>

      <!-- 持续时间 -->
      <a-form-item
        label="持续时间 (小时)"
        name="duration"
        :validate-status="getValidateStatus('duration')"
        :help="getValidateMessage('duration')"
      >
        <a-input-number
          v-model:value="localConfig.reliability.duration"
          :min="computedMinDuration"
          :max="100000"
          :step="1"
          style="width: 100%"
          placeholder="输入持续时间"
          @change="validateAndUpdate"
        />
        <div style="margin-top: 4px; font-size: 12px; color: #666">
          计算的总时间长度，默认8760小时(一年)
        </div>
      </a-form-item>

      <!-- 数据点数量 -->
      <a-form-item
        label="数据点数量"
        name="dataPoints"
        :validate-status="getValidateStatus('dataPoints')"
        :help="getValidateMessage('dataPoints')"
      >
        <a-input-number
          v-model:value="localConfig.reliability.dataPoints"
          :min="2"
          :max="1000"
          :step="1"
          style="width: 100%"
          placeholder="输入数据点数量"
          @change="validateAndUpdate"
        />
        <div style="margin-top: 4px; font-size: 12px; color: #666">
          时间轴上的切片数量，用于生成详细计算结果
        </div>
      </a-form-item>

      <!-- 显示输入时间 -->
      <a-form-item
        label="显示时间点 (小时)"
        name="displayTime"
        :validate-status="getValidateStatus('displayTime')"
        :help="getValidateMessage('displayTime')"
      >
        <a-input-number
          v-model:value="localConfig.reliability.displayTime"
          :min="localConfig.reliability.startTime"
          :max="localConfig.reliability.duration"
          :step="1"
          style="width: 100%"
          placeholder="输入要显示的时间点"
          @change="validateAndUpdate"
        />
        <div style="margin-top: 4px; font-size: 12px; color: #666">
          重点显示的时间点，结果将以卡片形式展示
        </div>
      </a-form-item>
    </a-form>

    <!-- 计算设置栏目 -->
    <a-divider orientation="left">计算设置</a-divider>

    <a-form layout="vertical">
      <a-form-item label="计算参数">
        <div style="margin-top: 8px; font-size: 12px; color: #666">
          <div>• 可靠度 R(t)：系统在指定时间内正常工作的概率</div>
          <div>• MTBF：平均故障间隔时间，基于可靠度计算得出</div>
        </div>
      </a-form-item>
    </a-form>

    <!-- 计算结果展示区域 -->
    <a-divider orientation="left">计算结果</a-divider>

    <!-- 计算控制区域 -->
    <div style="margin-bottom: 16px; text-align: center">
      <a-button
        type="primary"
        size="large"
        :disabled="!isConfigValid || !hasGraphData"
        :loading="calculating"
        @click="triggerCalculation"
      >
        <template #icon>
          <span>📊</span>
        </template>
        {{ calculating ? '计算中...' : '开始计算' }}
      </a-button>

      <div
        v-if="!isConfigValid"
        style="margin-top: 8px; font-size: 12px; color: #ff4d4f"
      >
        请完善配置参数并选择计算选项
      </div>

      <div
        v-if="!hasGraphData"
        style="margin-top: 8px; font-size: 12px; color: #ff4d4f"
      >
        请先创建RBD模型，至少需要开始节点、结束节点和连接路径
      </div>
    </div>

    <!-- 结果展示区域 -->
    <div
      v-if="!hasResults && !calculating"
      style="
        min-height: 200px;
        padding: 32px;
        color: #666;
        text-align: center;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
      "
    >
      <div style="margin-bottom: 16px; font-size: 48px">📈</div>
      <div style="margin-bottom: 8px; font-size: 16px">暂无计算结果</div>
      <div style="font-size: 14px">配置参数后点击"开始计算"查看结果</div>
    </div>

    <!-- 错误信息展示 -->
    <div v-if="calculationError" style="margin-bottom: 16px">
      <a-alert
        :message="calculationError"
        type="error"
        show-icon
        closable
        @close="calculationError = ''"
      />
    </div>

    <!-- 指定时间点结果卡片 -->
    <div v-if="hasResults">
      <a-card
        :title="`时间点 ${localConfig.reliability.displayTime} 小时的计算结果`"
        size="small"
        style="margin-bottom: 16px"
      >
        <div class="result-grid">
          <div class="result-item">
            <div class="result-label">可靠度 R(t)</div>
            <div class="result-value">
              {{
                calculationResults.systemReliability[displayTimeIndex]?.toFixed(
                  4,
                ) || 'N/A'
              }}
            </div>
          </div>

          <div class="result-item">
            <div class="result-label">MTBF (小时)</div>
            <div class="result-value">
              {{ timeSeriesData[displayTimeIndex]?.mtbf?.toFixed(4) || 'N/A' }}
            </div>
          </div>
        </div>
      </a-card>

      <!-- 时间序列结果列表 -->
      <a-card title="时间序列详细结果" size="small">
        <a-table
          :data-source="timeSeriesData"
          :columns="tableColumns"
          :pagination="{ pageSize: 10, showSizeChanger: true }"
          size="small"
          :scroll="{ x: 600 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'time'">
              {{ (record.time || 0).toFixed(1) }}
            </template>
            <template v-else-if="column.key === 'reliability'">
              {{ (record.reliability || 0).toFixed(4) }}
            </template>
            <template v-else-if="column.key === 'mtbf'">
              {{ (record.mtbf || 0).toFixed(4) }}
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<style scoped>
.project-calculation-panel {
  font-size: 14px;
}

.project-calculation-panel
  .ant-divider-horizontal.ant-divider-with-text-left::before {
  width: 5%;
}

.project-calculation-panel
  .ant-divider-horizontal.ant-divider-with-text-left::after {
  width: 95%;
}

.project-calculation-panel .ant-form-item {
  margin-bottom: 16px;
}

.project-calculation-panel .ant-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-calculation-panel .ant-checkbox-wrapper {
  margin: 0;
}

/* 结果展示样式 */
.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.result-item {
  padding: 12px;
  text-align: center;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.result-label {
  margin-bottom: 4px;
  font-size: 12px;
  color: #666;
}

.result-value {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
}
</style>
