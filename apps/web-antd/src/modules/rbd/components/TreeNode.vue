<script setup lang="ts">
import type { TreeNode as TreeNodeType } from '../types';

import { ref } from 'vue';

interface Props {
  node: TreeNodeType;
  level: number;
}

const props = defineProps<Props>();

const expanded = ref(true);

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

const getNodeIcon = (type: string, isParallel: boolean) => {
  if (type === 'start') return '▶';
  if (type === 'end') return '⏹';
  if (isParallel) return '◇';
  return '□';
};

const getNodeColor = (type: string) => {
  if (type === 'start') return 'green';
  if (type === 'end') return 'red';
  if (type === 'kn') return 'blue';
  return 'default';
};
</script>

<template>
  <div class="tree-node">
    <div class="tree-node-header" :style="{ paddingLeft: `${level * 20}px` }">
      <!-- 展开/折叠按钮 -->
      <span
        v-if="node.children && node.children.length > 0"
        @click="toggleExpanded"
        style="margin-right: 8px; cursor: pointer"
      >
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span v-else style="margin-right: 8px">•</span>

      <!-- 节点图标 -->
      <span style="font-size: 16px">{{
        getNodeIcon(node.type, node.isParallel)
      }}</span>

      <!-- 节点名称 -->
      <span style="font-weight: bold">{{ node.name }}</span>

      <!-- 节点类型标签 -->
      <a-tag :color="getNodeColor(node.type)" size="small">
        {{ node.isParallel ? '并联' : '串联' }}
      </a-tag>

      <!-- 可靠度 -->
      <span style="margin-left: auto; color: #666">
        R={{ node.reliability?.toFixed(4) || 'N/A' }}
      </span>
    </div>

    <!-- 子节点 -->
    <div
      v-if="expanded && node.children && node.children.length > 0"
      class="tree-node-children"
    >
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-node {
  border-bottom: 1px solid #f0f0f0;
}

.tree-node:last-child {
  border-bottom: none;
}

.tree-node-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.tree-node-header:hover {
  background-color: #f5f5f5;
}

.tree-node-children {
  background-color: #fafafa;
}

.tree-node-children .tree-node {
  margin-left: 16px;
  border-left: 2px solid #e6f7ff;
}
</style>
