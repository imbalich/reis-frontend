<script setup lang="ts">
import type { AnalysisResult, RBDGraphData, RBDNode } from '../types';

import type { RbdProjectResult, UpdateRbdProjectParams } from '#/api/rbd';

import {
  computed,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue';

import { message } from 'ant-design-vue';

import { updateRbdProjectApi } from '#/api/rbd';

import { validateNodeConstraints } from '../utils';
import AnalysisPanel from './AnalysisPanel.vue';
// import { getLogicFlowType } from '../logicflow/nodes' // 不再使用
// import { NODE_TYPE_NAMES } from '../constants' // 改为使用utils中的函数
import LogicFlowEditor from './LogicFlowEditor.vue';
import NodePalette from './NodePalette.vue';
import ProjectCalculationPanel from './ProjectCalculationPanel.vue';
import PropertyPanel from './PropertyPanel.vue';

// Props
interface Props {
  projectInfo?: RbdProjectResult;
}

// 设置组件名称，确保KeepAlive正常工作
defineOptions({
  name: 'RBDEditor',
});

const props = withDefaults(defineProps<Props>(), {
  projectInfo: undefined,
});

// 引用
const logicFlowRef = ref();
const canvasWrapperRef = ref<HTMLDivElement>();

// 右侧面板选项卡状态
const activeTab = ref('nodeProps');

// 项目计算配置
const projectConfig = ref({
  reliability: {
    startTime: 0, // 时间起点(小时)
    duration: 8760, // 持续时间(小时) - 默认一年
    dataPoints: 100, // 数据点数量
    displayTime: 4380, // 显示时间点(小时) - 默认半年
  },
  reliabilityCalc: {
    reliability: true, // 计算可靠度
    mttf: true, // 计算MTTF
    considerMaintenance: false, // 考虑维修
  },
  availabilityCalc: {
    mtbf: true, // 计算MTBF
    mttr: true, // 计算MTTR
  },
});

// 响应式窗口尺寸
const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

// 画布尺寸计算
const canvasWidth = computed(() => {
  // 计算可用宽度：窗口宽度 - 左侧面板(280) - 右侧面板(320) - padding(32)
  const width = windowWidth.value - 280 - 320 - 32;
  // 确保不超过容器实际宽度
  return Math.max(Math.min(width, 1200), 400);
});

const canvasHeight = computed(() => {
  // 计算可用高度：100vh - header(64px) - padding(32px)
  const height = windowHeight.value - 64 - 32;
  // 确保不超过容器实际高度
  return Math.max(Math.min(height, 800), 400);
});

// 窗口resize事件处理
const handleWindowResize = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
};

// 添加窗口resize监听器
onMounted(() => {
  window.addEventListener('resize', handleWindowResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize);
});

// 选中的节点
const selectedNode = ref<null | RBDNode>(null);

// 图形数据
const graphData = ref<RBDGraphData>({ nodes: [], edges: [] });

// 分析面板状态
const analysisPanelVisible = ref(false);
const analysisResult = ref<AnalysisResult | null>(null);

// 计算结果
const result = reactive({
  reliability: 0.9999,
  availability: 0.9998,
  mtbf: 8760,
  mttr: 2,
});

// 拖拽放置
const onDrop = (event: DragEvent) => {
  event.preventDefault();
  const nodeType = event.dataTransfer?.getData('text/plain');
  if (!nodeType) return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  createNode(nodeType, x, y);
};

// 拖拽悬停
const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};

// 创建节点
const createNode = (type: string, x: number, y: number) => {
  // 验证节点约束
  const validation = validateNodeConstraints(type, graphData.value);
  if (!validation.valid) {
    message.error(validation.message);
    return;
  }

  // 调用LogicFlowEditor的addNode方法（参考demo方式）
  const logicFlowEditor = logicFlowRef.value;
  if (logicFlowEditor) {
    const newNode = logicFlowEditor.addNode(type, x, y);
    if (newNode) {
      // 静默创建，不显示提示
    }
  }
};

// 加载项目数据到编辑器
const loadProjectData = (projectInfo: RbdProjectResult) => {
  // 开始加载项目数据

  // 加载图形数据
  if (projectInfo.graph_data) {
    try {
      // 确保graph_data是有效的RBDGraphData格式
      const loadedData = projectInfo.graph_data as RBDGraphData;
      // 加载的图形数据

      graphData.value = {
        nodes: loadedData.nodes || [],
        edges: loadedData.edges || [],
      };
      // 设置graphData

      // 检查是否有本地备份数据
      const backupKey = `rbd_project_backup_${projectInfo.id}`;
      const backupData = localStorage.getItem(backupKey);

      if (backupData) {
        try {
          const backup = JSON.parse(backupData);
          // 如果备份数据比服务器数据更新，询问用户是否恢复
          if (
            backup.graph_data &&
            backup.graph_data.nodes.length > loadedData.nodes.length
          ) {
            const shouldRestore = confirm('检测到本地备份数据，是否恢复？');
            if (shouldRestore) {
              graphData.value = backup.graph_data;
              if (backup.project_metadata) {
                projectConfig.value = {
                  ...projectConfig.value,
                  ...backup.project_metadata,
                };
              }
            }
          }
        } catch (error) {
          console.warn('解析备份数据失败:', error);
        }
      }

      // 通知LogicFlowEditor加载数据
      nextTick(() => {
        // 准备加载数据到LogicFlow
        if (logicFlowRef.value && logicFlowRef.value.loadGraphData) {
          try {
            console.log('调用loadGraphData...');
            logicFlowRef.value.loadGraphData(graphData.value);
            // LogicFlow数据加载完成
            // 移除频繁的成功提示，只保留异常提示
          } catch (error) {
            console.warn('加载图形数据失败:', error);
            message.error('项目数据加载失败');
          }
        } else {
          console.warn('LogicFlow实例未准备好，延迟加载');
          // 延迟重试
          setTimeout(() => {
            if (logicFlowRef.value && logicFlowRef.value.loadGraphData) {
              try {
                logicFlowRef.value.loadGraphData(graphData.value);
                // LogicFlow数据延迟加载完成
                // 移除频繁的成功提示，只保留异常提示
              } catch (error) {
                console.warn('延迟加载图形数据失败:', error);
                message.error('项目数据加载失败');
              }
            }
          }, 1000);
        }
      });
    } catch (error) {
      console.error('加载项目图形数据失败:', error);
      message.error('加载项目图形数据失败');
    }
  }

  // 加载项目元数据（如果有）
  if (projectInfo.project_metadata) {
    // 加载项目元数据
    projectConfig.value = {
      ...projectConfig.value,
      ...projectInfo.project_metadata,
    };
  }
};

// 监听项目信息变化
watch(
  () => props.projectInfo,
  (newProjectInfo) => {
    if (newProjectInfo) {
      loadProjectData(newProjectInfo);
    }
  },
  { immediate: true },
);

// 键盘快捷键处理
const handleKeydown = (event: KeyboardEvent) => {
  // Delete键 - 删除选中元素
  if (event.key === 'Delete') {
    event.preventDefault();
    if (selectedNode.value) {
      deleteNode();
    }
  }

  // 其他快捷键处理...
};

// 组件挂载时添加键盘监听
onMounted(() => {
  // 如果有项目信息，立即加载
  if (props.projectInfo) {
    loadProjectData(props.projectInfo);
  }
});

// KeepAlive激活/停用处理
onActivated(() => {
  // 如果LogicFlow实例不存在，重新加载项目数据
  if (props.projectInfo && (!logicFlowRef.value || !logicFlowRef.value.lf)) {
    loadProjectData(props.projectInfo);
  }
});

onDeactivated(() => {
  // 保持状态，不清理数据
});

// 组件卸载时清理资源
onUnmounted(() => {
  // 清理自动保存定时器
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
});

// 窗口大小变化处理
const handleResize = () => {
  // 触发画布重新计算尺寸
};

// LogicFlow事件处理方法
const onNodeClick = (node: RBDNode) => {
  selectedNode.value = node;
};

const onNodeAdd = (node: RBDNode) => {
  // 静默添加，不显示提示
};

const onNodeDelete = (nodeId: string) => {
  if (selectedNode.value?.id === nodeId) {
    selectedNode.value = null;
  }
  // 静默删除，不显示提示
};

const onNodeMove = (nodeId: string, x: number, y: number) => {
  // 节点移动处理
};

const onEdgeAdd = (edge: any) => {
  // 静默添加，不显示提示
};

const onEdgeDelete = (edgeId: string) => {
  // 静默删除，不显示提示
};

const onGraphChange = (newGraphData: RBDGraphData) => {
  graphData.value = newGraphData;

  // 自动保存到localStorage
  autoSaveProject();
};

// 处理节点属性更新
const onNodePropertiesUpdate = (nodeId: string) => {
  console.log('节点属性更新触发:', nodeId);

  if (!selectedNode.value || selectedNode.value.id !== nodeId) {
    console.warn('节点属性更新失败: 选中的节点不匹配');
    return;
  }

  // 更新graphData中的节点属性
  const nodeIndex = graphData.value.nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) {
    console.warn('节点属性更新失败: 在graphData中找不到节点');
  } else {
    graphData.value.nodes[nodeIndex] = { ...selectedNode.value };
    console.log('节点属性已更新到graphData:', selectedNode.value.properties);

    // 更新LogicFlow中的节点显示文本
    if (logicFlowRef.value) {
      logicFlowRef.value.updateNodeText(
        nodeId,
        selectedNode.value.properties.nodeType,
        selectedNode.value.properties,
      );
    }

    // 触发自动保存
    console.log('触发自动保存...');
    autoSaveProject();
  }
};

// 处理项目计算配置更新
const onProjectConfigUpdate = (config: any) => {
  projectConfig.value = { ...config };
  // 触发自动保存
  autoSaveProject();
};

// 删除节点
const deleteNode = () => {
  if (selectedNode.value) {
    // 检查是否为控制节点
    if (['end', 'start'].includes(selectedNode.value.properties.nodeType)) {
      message.error('开始节点和结束节点不能删除');
      return;
    }

    const index = graphData.value.nodes.findIndex(
      (n) => n.id === selectedNode.value!.id,
    );
    if (index !== -1) {
      graphData.value.nodes.splice(index, 1);
      selectedNode.value = null;
      // 静默删除，不显示提示
    }
  }
};

// 自动保存项目（防抖处理）
let autoSaveTimer: NodeJS.Timeout | null = null;
const autoSaveProject = async () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }

  autoSaveTimer = setTimeout(async () => {
    try {
      // 安全检查LogicFlow实例
      if (!logicFlowRef.value || !logicFlowRef.value.getGraphData) {
        console.warn('LogicFlow实例未准备好，跳过自动保存');
        return;
      }

      // 获取当前图形数据
      const currentGraphData = logicFlowRef.value.getGraphData();

      // 构建更新数据 - 包含所有必填字段
      const updateData: UpdateRbdProjectParams = {
        name: props.projectInfo?.name || '',
        model: props.projectInfo?.model || '',
        task_type: props.projectInfo?.task_type || '',
        status: props.projectInfo?.status || '',
        description: props.projectInfo?.description,
        graph_data: currentGraphData,
        project_metadata: projectConfig.value,
      };

      // 调用API更新项目
      if (props.projectInfo?.id) {
        await updateRbdProjectApi(props.projectInfo.id, updateData);
        console.log('项目已自动保存');
      }
    } catch (error) {
      console.error('自动保存失败:', error);
      message.error(
        `保存失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }, 3000); // 3秒防抖
};

// 保存项目
const saveProject = async () => {
  try {
    // 安全检查LogicFlow实例
    if (!logicFlowRef.value || !logicFlowRef.value.getGraphData) {
      message.error('LogicFlow实例未准备好，无法保存');
      return;
    }

    // 获取当前图形数据
    const currentGraphData = logicFlowRef.value.getGraphData();

    // 构建更新数据 - 包含所有必填字段
    const updateData: UpdateRbdProjectParams = {
      name: props.projectInfo?.name || '',
      model: props.projectInfo?.model || '',
      task_type: props.projectInfo?.task_type || '',
      status: props.projectInfo?.status || '',
      description: props.projectInfo?.description,
      graph_data: currentGraphData,
      project_metadata: projectConfig.value,
    };

    // 调用API更新项目
    if (props.projectInfo?.id) {
      await updateRbdProjectApi(props.projectInfo.id, updateData);
      // 移除频繁的成功提示，只保留异常提示
    } else {
      message.error('项目ID不存在，无法保存');
    }
  } catch (error) {
    console.error('保存项目失败:', error);
    message.error(
      `保存失败: ${error instanceof Error ? error.message : '未知错误'}`,
    );
  }
};

// 导出模型
const exportModel = () => {
  const blob = new Blob([JSON.stringify(graphData.value, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rbd-model.json';
  a.click();
  URL.revokeObjectURL(url);
  message.success('模型已导出');
};

// 清空画布
const clearCanvas = () => {
  graphData.value = { nodes: [], edges: [] };
  selectedNode.value = null;
  if (logicFlowRef.value) {
    logicFlowRef.value.clearCanvas();
  }
  message.success('画布已清空');
};

// 居中显示
const centerView = () => {
  if (logicFlowRef.value) {
    logicFlowRef.value.centerCanvas();
    // 静默操作，不显示提示
  } else {
    message.error('画布未初始化');
  }
};

// 重置缩放
const resetZoom = () => {
  if (logicFlowRef.value) {
    logicFlowRef.value.resetZoom();
    // 静默操作，不显示提示
  } else {
    message.error('画布未初始化');
  }
};

// 自动布局
const autoLayout = () => {
  if (logicFlowRef.value) {
    logicFlowRef.value.performAutoLayout();
    // 静默操作，不显示提示
  } else {
    message.error('画布未初始化');
  }
};

// 小地图控制
const showMiniMap = () => {
  if (logicFlowRef.value) {
    logicFlowRef.value.showMiniMap();
    // 静默操作，不显示提示
  } else {
    message.error('画布未初始化');
  }
};

const hideMiniMap = () => {
  if (logicFlowRef.value) {
    logicFlowRef.value.hideMiniMap();
    // 静默操作，不显示提示
  } else {
    message.error('画布未初始化');
  }
};

const resetMiniMap = () => {
  if (logicFlowRef.value) {
    logicFlowRef.value.resetMiniMap();
    // 静默操作，不显示提示
  } else {
    message.error('画布未初始化');
  }
};

const refreshMiniMap = () => {
  if (logicFlowRef.value) {
    logicFlowRef.value.refreshMiniMap();
    // 静默操作，不显示提示
  } else {
    message.error('画布未初始化');
  }
};

// 计算RAM
const calculateRAM = () => {
  if (!graphData.value.nodes || graphData.value.nodes.length === 0) {
    message.warning('请先创建RBD模型');
    return;
  }

  try {
    // 这里将来会调用实际的计算算法
    result.reliability = 0.9999;
    result.availability = 0.9998;
    result.mtbf = 8760;
    result.mttr = 2;

    message.success('RAM计算完成');
  } catch (error) {
    console.error('RAM计算失败:', error);
    message.error('RAM计算失败，请检查模型结构');
  }
};
</script>

<template>
  <div class="rbd-editor">
    <a-layout style="height: 100vh">
      <!-- 顶部工具栏 -->
      <a-layout-header class="header">
        <div class="header-content">
          <h3 style="margin: 0; color: white">RBD建模工具</h3>
          <a-space>
            <a-button type="primary" @click="saveProject">保存项目</a-button>
            <a-button @click="exportModel">导出模型</a-button>
            <a-button type="primary" ghost @click="calculateRAM">
              计算RAM
            </a-button>
            <a-button danger @click="clearCanvas">清空画布</a-button>
          </a-space>
        </div>
      </a-layout-header>

      <a-layout>
        <!-- 左侧组件面板 -->
        <a-layout-sider width="280" style="background: #fff">
          <NodePalette
            :graph-data="graphData"
            @clear-canvas="clearCanvas"
            @auto-layout="autoLayout"
            @center-view="centerView"
            @reset-zoom="resetZoom"
            @show-mini-map="showMiniMap"
            @hide-mini-map="hideMiniMap"
            @reset-mini-map="resetMiniMap"
            @refresh-mini-map="refreshMiniMap"
          />
        </a-layout-sider>

        <!-- 中间画布区域 -->
        <a-layout-content style="padding: 16px">
          <div
            ref="canvasWrapperRef"
            class="canvas-wrapper"
            @drop="onDrop"
            @dragover="onDragOver"
          >
            <LogicFlowEditor
              ref="logicFlowRef"
              :graph-data="graphData"
              :width="canvasWidth"
              :height="canvasHeight"
              @node-click="onNodeClick"
              @node-add="onNodeAdd"
              @node-delete="onNodeDelete"
              @node-move="onNodeMove"
              @edge-add="onEdgeAdd"
              @edge-delete="onEdgeDelete"
              @graph-change="onGraphChange"
            />
          </div>
        </a-layout-content>

        <!-- 右侧面板 -->
        <a-layout-sider width="320" style="background: #fff">
          <a-tabs
            v-model:active-key="activeTab"
            type="card"
            style="height: 100%; padding: 8px"
          >
            <a-tab-pane key="nodeProps" tab="节点属性" class="rbd-tab-pane">
              <PropertyPanel
                :selected-node="selectedNode"
                @node-properties-update="onNodePropertiesUpdate"
              />
            </a-tab-pane>
            <a-tab-pane key="projectCalc" tab="项目计算" class="rbd-tab-pane">
              <ProjectCalculationPanel
                :project-config="projectConfig"
                :graph-data="graphData"
                @config-update="onProjectConfigUpdate"
              />
            </a-tab-pane>
          </a-tabs>
        </a-layout-sider>
      </a-layout>
    </a-layout>

    <!-- RBD分析面板 -->
    <AnalysisPanel
      :visible="analysisPanelVisible"
      :analysis-result="analysisResult"
      @close="analysisPanelVisible = false"
    />
  </div>
</template>

<style scoped>
.rbd-editor {
  height: 100vh;
  overflow: hidden;
}

.header {
  background: #001529;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.canvas-wrapper {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-height: calc(100vh - 120px);
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

/* RBD专用标签页样式 */
:deep(.rbd-tab-pane) {
  height: calc(100vh - 120px);
  overflow-y: auto;
}
</style>
