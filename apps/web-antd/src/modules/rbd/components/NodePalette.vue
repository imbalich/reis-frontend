<script setup lang="ts">
import type { RBDGraphData } from '../types';

import { computed } from 'vue';

import { calculateGraphStats } from '../utils';

interface Props {
  graphData: RBDGraphData;
}

const props = defineProps<Props>();

defineEmits<{
  autoLayout: [];
  centerView: [];
  clearCanvas: [];
  hideMiniMap: [];
  refreshMiniMap: [];
  resetMiniMap: [];
  resetZoom: [];
  showMiniMap: [];
}>();

// 计算统计信息
const stats = computed(() => calculateGraphStats(props.graphData));

// 拖拽开始
const onDragStart = (event: DragEvent, nodeType: string) => {
  // 开始拖拽
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', nodeType);
  }
};
</script>

<template>
  <div class="component-panel">
    <h4>🔧 RBD节点库</h4>

    <!-- RBD节点拖拽区域 -->
    <div class="node-palette">
      <div class="node-category">
        <h5>控制节点</h5>
        <div class="node-group">
          <div
            class="node-item start-node"
            draggable="true"
            @dragstart="onDragStart($event, 'start')"
          >
            <div class="node-icon start-icon">▶</div>
            <span>开始节点</span>
          </div>
          <div
            class="node-item end-node"
            draggable="true"
            @dragstart="onDragStart($event, 'end')"
          >
            <div class="node-icon end-icon">⏹</div>
            <span>结束节点</span>
          </div>
        </div>
      </div>

      <div class="node-category">
        <h5>逻辑节点</h5>
        <div class="node-group">
          <div
            class="node-item series-node"
            draggable="true"
            @dragstart="onDragStart($event, 'series')"
          >
            <div class="node-icon series-icon">□</div>
            <span>串联节点</span>
          </div>
          <div
            class="node-item parallel-node"
            draggable="true"
            @dragstart="onDragStart($event, 'parallel')"
          >
            <div class="node-icon parallel-icon">□</div>
            <span>并联节点</span>
          </div>
          <div
            class="node-item kn-node"
            draggable="true"
            @dragstart="onDragStart($event, 'kn')"
          >
            <div class="node-icon kn-icon">◇</div>
            <span>k/n节点</span>
          </div>
        </div>
      </div>
    </div>

    <a-divider />

    <h4>📊 项目统计</h4>
    <a-descriptions :column="1" size="small" bordered>
      <a-descriptions-item label="节点数">
        <a-tag color="blue">{{ stats.nodeCount }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="连接数">
        <a-tag color="green">{{ stats.edgeCount }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="路径数">
        <a-tag color="orange">{{ stats.pathCount }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="开始节点">
        <a-tag color="green">{{ stats.startNodeCount }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="结束节点">
        <a-tag color="red">{{ stats.endNodeCount }}</a-tag>
      </a-descriptions-item>
    </a-descriptions>

    <a-divider />

    <h4>⌨️ 快捷键</h4>
    <div style="font-size: 12px; line-height: 1.8; color: #666">
      <p><code>Delete</code> - 删除选中元素</p>
      <p><code>Ctrl+C</code> - 复制选中节点（除开始/结束节点）</p>
      <p><code>Ctrl+V</code> - 粘贴节点</p>
      <p><code>Ctrl+点击</code> - 多选</p>
      <!-- <p><code>鼠标右键</code> - 右键菜单（已简化）</p> -->
      <p><code>拖拽</code> - 移动节点/调整连接线</p>
    </div>

    <a-divider />

    <h4>🔗 建模规则</h4>
    <a-alert message="节点约束和连接规则" type="info" size="small" show-icon>
      <template #description>
        <div style="font-size: 12px; line-height: 1.6">
          <p><strong>节点约束：</strong></p>
          <p>• 每个项目必须且只能有一个开始节点</p>
          <p>• 每个项目必须且只能有一个结束节点</p>
          <p>• 其他节点可以复制粘贴</p>
          <p><strong>连接操作：</strong></p>
          <p>• 拖拽节点连接点创建连接线</p>
          <p>• 拖拽连接线两端重新连接到其他节点</p>
          <p>• 点击连接线选中，按Delete键删除</p>
          <p><strong>连接规则：</strong></p>
          <p>• 开始节点只能向外连接，结束节点只能向内连接</p>
        </div>
      </template>
    </a-alert>

    <a-divider />

    <h4>🚀 快速操作</h4>
    <a-space direction="vertical" style="width: 100%">
      <a-button size="small" block @click="$emit('clearCanvas')">
        清空画布
      </a-button>
      <a-button size="small" block @click="$emit('autoLayout')">
        自动布局
      </a-button>
      <a-button size="small" block @click="$emit('centerView')">
        居中显示
      </a-button>
      <a-button size="small" block @click="$emit('resetZoom')">
        重置缩放
      </a-button>
    </a-space>

    <a-divider />

    <h4>🗺️ 小地图控制</h4>
    <a-space direction="vertical" style="width: 100%">
      <a-button size="small" block @click="$emit('showMiniMap')">
        显示小地图
      </a-button>
      <a-button size="small" block @click="$emit('hideMiniMap')">
        隐藏小地图
      </a-button>
      <a-button size="small" block @click="$emit('resetMiniMap')">
        重置小地图
      </a-button>
      <a-button
        type="primary"
        size="small"
        block
        @click="$emit('refreshMiniMap')"
      >
        强制刷新
      </a-button>
    </a-space>
  </div>
</template>

<style scoped>
.component-panel {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}

.node-palette {
  margin-bottom: 16px;
}

.node-category {
  margin-bottom: 16px;
}

.node-category h5 {
  margin: 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.node-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: grab;
  background: #fafafa;
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  transition: all 0.2s;
}

.node-item:hover {
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  transform: translateY(-1px);
}

.node-item:active {
  cursor: grabbing;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 4px;
}

.start-icon {
  color: white;
  background: #52c41a;
}

.end-icon {
  color: white;
  background: #ff4d4f;
}

.series-icon {
  color: white;
  background: #1890ff;
}

.parallel-icon {
  color: white;
  background: #52c41a;
}

.kn-icon {
  color: white;
  background: #1890ff;
}
</style>
