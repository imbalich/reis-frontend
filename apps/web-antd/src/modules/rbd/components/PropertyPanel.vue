<script setup lang="ts">
import type { RBDNode } from '../types/node';

import { computed } from 'vue';

import { getNodeTypeColor, getNodeTypeName } from '../utils/nodeUtils';

interface Props {
  selectedNode: null | RBDNode;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  nodePropertiesUpdate: [nodeId: string];
  'update:selectedNode': [node: null | RBDNode];
}>();

// 是否为控制节点（开始/结束节点）
const isControlNode = computed(() => {
  return (
    props.selectedNode?.properties?.nodeType === 'start' ||
    props.selectedNode?.properties?.nodeType === 'end'
  );
});

// 更新节点属性
const updateNodeProperties = () => {
  if (props.selectedNode) {
    // 确保维修参数存在（向后兼容）
    if (
      ['parallel', 'series'].includes(props.selectedNode.properties.nodeType)
    ) {
      const properties = props.selectedNode.properties as any;
      if (!properties.maintenance) {
        properties.maintenance = {
          maintenanceTime: 2,
          logisticTime: 1,
        };
      }
    }

    emit('nodePropertiesUpdate', props.selectedNode.id);
  }
};

// 更新K/N节点属性（同时更新显示文本）
const updateKNNodeProperties = () => {
  if (props.selectedNode && props.selectedNode.properties.nodeType === 'kn') {
    // 更新节点显示文本
    // 这里需要通知LogicFlow更新节点的text属性
    emit('nodePropertiesUpdate', props.selectedNode.id);
  }
};

// 控制节点描述
const getControlNodeDescription = (nodeType: string) => {
  switch (nodeType) {
    case 'end': {
      return 'RBD模型的结束节点，表示系统的输出端。每个RBD模型必须且只能有一个结束节点。结束节点只能有输入连接，不能有输出连接。';
    }
    case 'start': {
      return 'RBD模型的开始节点，表示系统的输入端。每个RBD模型必须且只能有一个开始节点。开始节点只能有输出连接，不能有输入连接。';
    }
    default: {
      return '';
    }
  }
};

// 控制节点警告信息
const getControlNodeAlert = (nodeType: string) => {
  switch (nodeType) {
    case 'end': {
      return '结束节点的属性由系统管理，不可编辑。此节点代表可靠性计算的终点。';
    }
    case 'start': {
      return '开始节点的属性由系统管理，不可编辑。此节点代表可靠性计算的起点。';
    }
    default: {
      return '';
    }
  }
};

// 计算MTBF（根据故障率）
const calculateMTBF = (lambda?: number): number => {
  if (!lambda || lambda <= 0) return 0;
  return 1 / lambda;
};

// 格式化MTBF显示
const formatMTBF = (mtbf: number): string => {
  if (mtbf === 0) {
    return '无效';
  }

  if (mtbf >= 1e9) {
    return `${(mtbf / 1e9).toFixed(2)}e+9 (约${(mtbf / 8760 / 1e6).toFixed(1)}百万年)`;
  } else if (mtbf >= 1e6) {
    return `${(mtbf / 1e6).toFixed(2)}e+6 (约${(mtbf / 8760 / 1e3).toFixed(1)}千年)`;
  } else if (mtbf >= 1e3) {
    return `${(mtbf / 1e3).toFixed(2)}e+3 (约${(mtbf / 8760).toFixed(1)}年)`;
  } else {
    return `${mtbf.toFixed(2)} (约${(mtbf / 24).toFixed(1)}天)`;
  }
};

// 设置故障率
const setLambda = (lambda: number) => {
  if (props.selectedNode && props.selectedNode.properties) {
    const properties = props.selectedNode.properties as any;
    if (properties.distribution) {
      properties.distribution.lambda = lambda;
      updateNodeProperties();
    }
  }
};
</script>

<template>
  <div class="property-panel">
    <h4>⚙️ 节点属性</h4>

    <a-form layout="vertical" v-if="selectedNode">
      <!-- 基础属性栏目 -->
      <a-divider orientation="left">基础属性</a-divider>

      <a-form-item label="节点ID">
        <a-input :value="selectedNode.id" disabled />
      </a-form-item>

      <a-form-item label="节点类型">
        <a-tag :color="getNodeTypeColor(selectedNode.properties.nodeType)">
          {{
            getNodeTypeName(
              selectedNode.properties.nodeType,
              selectedNode.properties,
            )
          }}
        </a-tag>
      </a-form-item>

      <!-- 节点名称（K/N逻辑节点除外） -->
      <a-form-item v-if="selectedNode.properties.nodeType !== 'kn'" label="节点名称">
        <a-input v-model:value="selectedNode.properties.name" placeholder="请输入节点名称" :disabled="isControlNode"
          @change="updateNodeProperties" />
        <div v-if="isControlNode" style="margin-top: 4px; font-size: 12px; color: #999">
          控制节点名称不可修改
        </div>
      </a-form-item>

      <!-- 串联节点专用属性 -->
      <template v-if="selectedNode.properties.nodeType === 'series'">
        <a-form-item label="组件数量">
          <a-input-number v-model:value="selectedNode.properties.componentCount" :min="1" :max="1000"
            placeholder="请输入组件数量" style="width: 100%" @change="updateNodeProperties" />
          <div style="margin-top: 4px; font-size: 12px; color: #666">
            串联系统中的相同组件数量
          </div>
        </a-form-item>
      </template>

      <!-- 并联节点专用属性 -->
      <template v-if="selectedNode.properties.nodeType === 'parallel'">
        <a-form-item label="维持数量 (K)">
          <a-input-number v-model:value="selectedNode.properties.k" :min="1" :max="selectedNode.properties.n || 1000"
            placeholder="需要保持工作的组件数量" style="width: 100%" @change="updateNodeProperties" />
        </a-form-item>

        <a-form-item label="总数量 (N)">
          <a-input-number v-model:value="selectedNode.properties.n" :min="selectedNode.properties.k || 1" :max="1000"
            placeholder="总组件数量" style="width: 100%" @change="updateNodeProperties" />
        </a-form-item>

        <div style="margin-bottom: 16px; font-size: 12px; color: #666">
          K/N并联系统：N个相同组件中至少K个正常工作
        </div>
      </template>

      <!-- K/N逻辑节点专用属性 -->
      <template v-if="selectedNode.properties.nodeType === 'kn'">
        <a-form-item label="维持数量 (K)">
          <a-input-number v-model:value="selectedNode.properties.k" :min="1" :max="selectedNode.properties.n || 1000"
            placeholder="需要保持工作的链路数量" style="width: 100%" @change="updateKNNodeProperties" />
        </a-form-item>

        <a-form-item label="总数量 (N)">
          <a-input-number v-model:value="selectedNode.properties.n" :min="selectedNode.properties.k || 1" :max="1000"
            placeholder="总链路数量" style="width: 100%" @change="updateKNNodeProperties" />
        </a-form-item>

        <div style="margin-bottom: 16px; font-size: 12px; color: #666">
          K/N逻辑节点：N条链路中至少K条正常工作
        </div>
      </template>

      <!-- 开始和结束节点的只读属性显示 -->
      <template v-if="isControlNode">
        <a-form-item label="节点描述">
          <a-textarea :value="getControlNodeDescription(selectedNode.properties.nodeType)" disabled :rows="3"
            style="color: #666" />
        </a-form-item>
        <a-alert message="控制节点说明" :description="getControlNodeAlert(selectedNode.properties.nodeType)" type="info"
          show-icon style="margin-bottom: 16px" />
      </template>

      <!-- 故障分布选择栏目（串联和并联节点） -->
      <template v-if="['series', 'parallel'].includes(selectedNode.properties.nodeType)">
        <a-divider orientation="left">故障分布选择</a-divider>

        <a-form-item label="分布类型">
          <a-select v-model:value="(selectedNode.properties as any).distribution.type" placeholder="选择故障分布类型"
            style="width: 100%" @change="updateNodeProperties">
            <a-select-option value="exponential">指数分布</a-select-option>
            <!-- 为未来扩展预留 -->
            <a-select-option value="weibull" disabled>
              Weibull分布（待支持）
            </a-select-option>
            <a-select-option value="normal" disabled>
              正态分布（待支持）
            </a-select-option>
            <a-select-option value="lognormal" disabled>
              对数正态分布（待支持）
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 指数分布参数 -->
        <template v-if="
          (selectedNode.properties as any).distribution.type === 'exponential'
        ">
          <a-form-item label="故障率 λ (1/小时)">
            <a-input-number v-model:value="(selectedNode.properties as any).distribution.lambda
              " :min="0" :max="1" :step="0.000000001" :precision="15" placeholder="输入故障率，支持科学计数法如1e-9"
              style="width: 100%" @change="updateNodeProperties" />
            <div style="margin-top: 4px; font-size: 12px; color: #666">
              λ = 1/MTBF，单位：故障次数/小时
              <br />
              <span style="color: #1890ff">支持范围：1e-15 - 1 (对应MTBF: 1 - 1e+15小时)</span>
              <br />
              <span style="color: #666">示例：0.00000000260564 (极高可靠性组件)</span>
            </div>
            <div style="margin-top: 8px">
              <span style="margin-right: 8px; font-size: 12px; color: #666">快速预设：</span>
              <a-button size="small" @click="setLambda(0.000000001)" style="margin-right: 4px">
                极高可靠性
              </a-button>
              <a-button size="small" @click="setLambda(0.000001)" style="margin-right: 4px">
                高可靠性
              </a-button>
              <a-button size="small" @click="setLambda(0.0001)" style="margin-right: 4px">
                中等可靠性
              </a-button>
              <a-button size="small" @click="setLambda(0.01)" style="margin-right: 4px">
                低可靠性
              </a-button>
            </div>
          </a-form-item>

          <a-form-item label="计算得出的MTBF">
            <a-input :value="formatMTBF(
              calculateMTBF(
                (selectedNode.properties as any).distribution.lambda,
              ),
            )
              " disabled style="font-weight: bold; color: #1890ff" />
            <div style="margin-top: 4px; font-size: 12px; color: #666">
              平均故障间隔时间（小时），自动格式化显示
            </div>
          </a-form-item>
        </template>

        <!-- 未来扩展：Weibull分布参数 -->
        <template v-if="
          (selectedNode.properties as any).distribution.type === 'weibull'
        ">
          <a-alert message="Weibull分布" description="形状参数和尺度参数设置（功能开发中）" type="warning" show-icon />
        </template>
      </template>

      <!-- 可维修性数据栏目（串联和并联节点） -->
      <template v-if="['series', 'parallel'].includes(selectedNode.properties.nodeType)">
        <a-divider orientation="left">可维修性数据</a-divider>

        <a-form-item label="维修时间 (小时)">
          <a-input-number v-model:value="(selectedNode.properties as any).maintenance.maintenanceTime
            " :min="0.1" :max="1000" :step="0.1" :precision="2" placeholder="输入维修时间" style="width: 100%"
            @change="updateNodeProperties" />
        </a-form-item>

        <a-form-item label="后勤保障时间 (小时)">
          <a-input-number v-model:value="(selectedNode.properties as any).maintenance.logisticTime
            " :min="0.1" :max="1000" :step="0.1" :precision="2" placeholder="输入后勤保障时间" style="width: 100%"
            @change="updateNodeProperties" />
        </a-form-item>
      </template>
    </a-form>

    <a-empty v-else description="请选择一个节点查看属性" />
  </div>
</template>

<style scoped>
.property-panel {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
  background: #fafafa;
}

.property-panel h4 {
  margin-bottom: 16px;
  color: #1890ff;
}

.property-panel .ant-form-item {
  margin-bottom: 16px;
}

.property-panel .ant-divider {
  margin: 16px 0 12px;
  font-size: 14px;
  font-weight: bold;
  color: #595959;
}

.property-panel .ant-input-number {
  width: 100%;
}

.property-panel .ant-tag {
  padding: 4px 8px;
  margin: 0;
  font-size: 12px;
}

.property-panel .ant-alert {
  margin-bottom: 16px;
}

.property-panel .ant-empty {
  margin-top: 60px;
}
</style>
