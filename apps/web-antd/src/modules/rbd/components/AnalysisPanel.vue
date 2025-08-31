<script setup lang="ts">
import type { AnalysisResult } from '../types';

import TreeNode from './TreeNode.vue';

interface Props {
  visible: boolean;
  analysisResult: AnalysisResult | null;
}

defineProps<Props>();

defineEmits<{
  close: [];
}>();
</script>

<template>
  <a-drawer
    title="RBD树形结构分析"
    placement="right"
    :width="600"
    :visible="visible"
    @close="$emit('close')"
    :body-style="{ padding: '20px' }"
  >
    <div v-if="analysisResult" class="analysis-panel">
      <!-- 系统概览 -->
      <a-card title="系统概览" size="small" style="margin-bottom: 16px">
        <a-descriptions :column="2" size="small">
          <a-descriptions-item label="系统可靠度">
            <a-tag color="blue">
              {{ analysisResult.systemReliability?.toFixed(4) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="分析状态">
            <a-tag color="green">完成</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 树形结构显示 -->
      <a-card title="RBD结构树" size="small" style="margin-bottom: 16px">
        <div class="tree-structure">
          <TreeNode :node="analysisResult.treeStructure" :level="0" />
        </div>
      </a-card>

      <!-- 计算方法 -->
      <a-card title="计算方法" size="small">
        <pre
          style="
            font-size: 12px;
            line-height: 1.6;
            color: #666;
            white-space: pre-wrap;
          "
          >{{ analysisResult.calculationMethod }}</pre
        >
      </a-card>
    </div>

    <div v-else class="analysis-panel">
      <a-empty description="暂无分析结果" />
    </div>
  </a-drawer>
</template>

<style scoped>
.analysis-panel {
  height: 100%;
  overflow-y: auto;
}

.tree-structure {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}
</style>
