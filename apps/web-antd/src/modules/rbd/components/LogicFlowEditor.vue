<script setup lang="ts">
import type { RBDEdge, RBDGraphData, RBDNode } from '../types';

import {
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';

import LogicFlow from '@logicflow/core';
// 引入扩展插件
import { Control, MiniMap } from '@logicflow/extension';

import { getLogicFlowType, registerRBDNodes } from '../logicflow/nodes';

import '@logicflow/core/lib/index.css';
import '@logicflow/extension/lib/style/index.css';

// Props
interface Props {
  graphData: RBDGraphData;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600,
});

// Events  
const emit = defineEmits<{
  'connection-warning': [
    warning: { edgeId: string; message: string; type: string },
  ];
  edgeAdd: [edge: RBDEdge];
  edgeDelete: [edgeId: string];
  graphChange: [graphData: RBDGraphData];
  nodeAdd: [node: RBDNode];
  nodeClick: [node: RBDNode];
  nodeDelete: [nodeId: string];
  nodeMove: [nodeId: string, x: number, y: number];
  'validation-error': [message: string];
}>();

// Refs
const containerRef = ref<HTMLDivElement>();
let lf: LogicFlow | null = null;

// 全局变量声明
declare global {
  interface Window {
    copiedNodeData?: any;
  }
}

// 全局键盘事件处理函数
const handleGlobalKeyDown = (e: KeyboardEvent) => {
  // 检查是否在LogicFlow容器内
  const target = e.target as HTMLElement;
  const isInLogicFlow = target?.closest('.logicflow-container');

  if (isInLogicFlow) {
    console.log(
      '全局键盘事件捕获:',
      e.key,
      'Ctrl:',
      e.ctrlKey,
      '目标元素:',
      target,
    );
    handleKeyDown(e);
  }
};

// LogicFlow实例初始化
const initLogicFlow = () => {
  // 开始初始化LogicFlow

  if (!containerRef.value) {
    console.error('容器元素不存在!');
    return;
  }

  // 获取容器的实际尺寸
  const containerRect = containerRef.value.getBoundingClientRect();
  const containerWidth = Math.floor(containerRect.width);
  const containerHeight = Math.floor(containerRect.height);

  // 使用容器实际尺寸，但不超过props传入的尺寸
  const finalWidth = Math.min(containerWidth, props.width);
  const finalHeight = Math.min(containerHeight, props.height);

  // 开始创建LogicFlow实例

  lf = new LogicFlow({
    container: containerRef.value,
    width: finalWidth,
    height: finalHeight,
    // 注册插件
    plugins: [MiniMap, Control],
    // 插件配置 - 重新启用边线显示
    pluginsOptions: {
      MiniMap: {
        width: 200,
        height: 120,
        showEdge: true, // 重新启用边线显示
        isShowHeader: true,
        headerTitle: '导航',
        isShowCloseIcon: true,
        rightPosition: 10,
        bottomPosition: 10,
      },
      Control: {
        // 确保控制面板功能正常
      },
    },
    grid: {
      size: 20,
      visible: true,
      type: 'dot',
      config: {
        color: '#ababab',
        thickness: 1,
      },
    },
    background: {
      backgroundColor: '#f8f8f8',
    },
    // 启用连接线创建和重新连接
    edgeType: 'line',
    allowAutoRoute: true,
    // 启用连接线调整功能
    adjustEdge: true,
    adjustEdgeStartAndEnd: true,
    // 启用连接线选择和删除
    allowResize: false,
    multipleSelectKey: 'ctrl',
    // 键盘功能配置 - 使用LogicFlow内置键盘系统
    keyboard: {
      enabled: true,
    },
    // 启用LogicFlow内置复制粘贴功能
    copyPaste: true,
    // 启用节点选择功能
    enableSelect: true,
    // 启用删除功能
    enableDelete: true,
    // 启用多选功能
    multipleSelect: true,
    // 禁用拖拽复制
    allowDragEdge: false,
    allowDragNode: true, // 允许拖拽移动节点
    allowAddEdge: true, // 允许添加连接线
    // 禁用所有可能的自动复制功能
    allowClone: false, // 禁用克隆功能
    // 严格控制节点创建
    allowCreate: false, // 禁用直接创建节点
    // 启用历史记录以支持撤销/重做功能
    history: true,
    style: {
      text: {
        color: '#333',
        fontSize: 12,
        fontWeight: 'bold',
      },
      // 连接线样式增强
      line: {
        stroke: '#666',
        strokeWidth: 2,
        strokeDasharray: 'none',
        // 鼠标悬停效果
        hoverStroke: '#1890ff',
        hoverStrokeWidth: 3,
        // 选中状态效果
        selectedStroke: '#ff4d4f',
        selectedStrokeWidth: 3,
      },
      arrow: {
        offset: 4,
        verticalLength: 3,
        fill: '#666',
        stroke: '#666',
      },
      // 锚点样式（连接点）
      anchor: {
        r: 3,
        fill: '#1890ff',
        stroke: '#fff',
        strokeWidth: 1,
        // 悬停时显示
        hover: {
          r: 5,
          fill: '#ff4d4f',
          stroke: '#fff',
          strokeWidth: 2,
        },
      },
    },
  });

  // LogicFlow实例创建完成

  // 注册RBD专用节点类型
  registerRBDNodes(lf);

  // 渲染画布
  // 开始渲染LogicFlow画布
  lf.render({});
  // LogicFlow画布渲染完成

  // 延迟设置LogicFlow内置复制粘贴功能，确保实例完全初始化
  setTimeout(() => {
    if (lf) {
      try {
        setupLogicFlowCopyPaste(lf);
      } catch (error) {
        console.warn('设置复制粘贴功能失败:', error);
      }
    }
  }, 100);

  // 显示小地图 - 延迟初始化确保节点数据已加载
  setTimeout(() => {
    if (lf && lf.extension && lf.extension.miniMap) {
      const miniMapExtension = lf.extension.miniMap as any;
      try {
        // 强制刷新小地图内容
        miniMapExtension.show();
        // 确保小地图显示所有节点
        miniMapExtension.setShowEdge(true);
        // console.log('小地图已显示，节点应该可见')
      } catch (error) {
        console.error('小地图初始化失败:', error);
      }
    }
  }, 500);

  // 注册事件监听器
  registerEventListeners();

  // 设置键盘事件处理 - 重新启用自定义处理
  setupKeyboardHandlers();

  // LogicFlow初始化完成

  // 初始化数据
  if (
    props.graphData &&
    (props.graphData.nodes.length > 0 || props.graphData.edges.length > 0)
  ) {
    loadGraphDataFromProps();
  }

  // 画布初始化完成
};

// 注册事件监听器
const registerEventListeners = () => {
  if (!lf) {
    console.warn('LogicFlow实例不存在，无法注册事件监听器');
    return;
  }

  // 开始注册LogicFlow事件监听器

  // 节点点击事件
  lf.on('node:click', ({ data }: any) => {
    console.log('节点点击事件触发:', data);
    const node = convertToRBDNode(data);
    console.log('转换后的节点数据:', node);
    emit('nodeClick', node);

    // 确保容器获得焦点，以便接收键盘事件
    if (containerRef.value) {
      containerRef.value.focus();
    }
  });

  // 节点添加事件
  lf.on('node:add', ({ data }: any) => {
    const node = convertToRBDNode(data);
    emit('nodeAdd', node);
    emitGraphChange();

    // 刷新小地图以显示新节点
    refreshMiniMap();
  });

  // 节点删除事件
  lf.on('node:delete', ({ data }: any) => {
    emit('nodeDelete', data.id);
    emitGraphChange();
    // 延迟刷新小地图以避免频繁更新
    setTimeout(() => refreshMiniMap(), 200);
  });

  // 节点移动事件 - 减少频繁刷新
  lf.on('node:drag', ({ data }: any) => {
    emit('nodeMove', data.id, data.x, data.y);
    emitGraphChange();
  });

  // 连接线添加事件 - 简化处理（连接规则由节点模型处理）
  lf.on('edge:add', ({ data }: any) => {
    const edge: RBDEdge = {
      id: data.id,
      sourceNodeId: data.sourceNodeId,
      targetNodeId: data.targetNodeId,
      type: 'polyline',
    };
    emit('edgeAdd', edge);
    emitGraphChange();

    // 立即刷新小地图以显示新连线
    setTimeout(() => {
      refreshMiniMap();
      // 额外确保边线显示
      if (lf && lf.extension && lf.extension.miniMap) {
        const miniMapExtension = lf.extension.miniMap as any;
        miniMapExtension.setShowEdge(true);
      }
    }, 100);
  });

  // 连接线删除事件
  lf.on('edge:delete', ({ data }: any) => {
    emit('edgeDelete', data.id);
    emitGraphChange();

    // 立即刷新小地图以同步删除
    setTimeout(() => {
      refreshMiniMap();
    }, 100);
  });

  // 连接验证失败事件
  lf.on('connection:not-allowed', ({ data, msg }: any) => {
    console.warn('连接规则验证失败:', msg, data);
    emit('validation-error', msg || '连接不被允许');
  });

  // 连接线点击事件
  lf.on('edge:click', ({ data, e }: any) => {
    // 选中连接线
    lf?.selectElementById(data.id, true);
    e.stopPropagation();
  });

  // 画布点击清除选择
  lf.on('blank:click', () => {
    // 清除所有选择
    lf?.clearSelectElements();

    // 确保容器获得焦点，以便接收键盘事件
    if (containerRef.value) {
      containerRef.value.focus();
    }
  });

  // 连接线调整事件
  lf.on('edge:adjust', ({ data }: any) => {
    // 刷新小地图以同步调整操作
    refreshMiniMap();
  });

  // 添加更多实时更新事件
  lf.on('node:move', () => {
    // 节点移动结束时刷新小地图
    refreshMiniMap();
  });

  lf.on('graph:transform', () => {
    // 画布变换时更新小地图视口
    updateMiniMapViewport();
  });

  // 移除重复的键盘事件处理调用
};

// 转换节点数据格式
const convertToRBDNode = (lfNode: any): RBDNode => {
  return {
    id: lfNode.id,
    type: lfNode.type,
    x: lfNode.x,
    y: lfNode.y,
    properties: lfNode.properties || {
      nodeType: lfNode.type,
      name: `节点${lfNode.id.slice(-4)}`,
      reliability: 0.95,
      mtbf: 1000,
      mttr: 24,
    },
  };
};

// 发出图形变化事件
const emitGraphChange = () => {
  if (!lf) return;

  const lfGraphData: any = lf.getGraphData();
  const rbdGraphData: RBDGraphData = {
    nodes: lfGraphData.nodes?.map(convertToRBDNode) || [],
    edges:
      lfGraphData.edges?.map((edge: any) => ({
        id: edge.id,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        type: 'polyline',
      })) || [],
  };

  emit('graphChange', rbdGraphData);
};

// 加载图形数据（从props）
const loadGraphDataFromProps = () => {
  if (!lf || !props.graphData) return;

  // 转换数据格式为LogicFlow格式
  const lfData = {
    nodes: props.graphData.nodes.map((node) => ({
      id: node.id,
      type: node.type || 'rect',
      x: node.x,
      y: node.y,
      text: (node.properties as any)?.name || '节点',
      properties: node.properties,
    })),
    edges: props.graphData.edges.map((edge) => ({
      id: edge.id,
      type: 'polyline',
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
    })),
  };

  lf.render(lfData);
};

// 暴露给父组件的方法
const addNode = (nodeType: string, x: number, y: number) => {
  if (!lf) return;

  const nodeId = `${nodeType}_${Date.now()}`;
  let nodeConfig: any = {
    id: nodeId,
    x,
    y,
  };

  // 根据节点类型设置不同的配置（参考demo）
  switch (nodeType) {
    case 'end': {
      nodeConfig = {
        ...nodeConfig,
        type: 'rbd-end', // 使用自定义节点类型
        text: '结束',
        properties: {
          nodeType: 'end',
          name: '结束节点',
          style: {
            fill: '#ff4d4f',
            stroke: '#cf1322',
            r: 25,
          },
        },
      };
      break;
    }

    case 'kn': {
      const k = 2;
      const n = 3;
      nodeConfig = {
        ...nodeConfig,
        type: 'rbd-kn',
        text: `${k}/${n}`,
        properties: {
          nodeType: 'kn',
          k, // 维持数量
          n, // 总数量
          // K/N逻辑节点不需要name和distribution
          style: {
            fill: '#1890ff',
            stroke: '#096dd9',
            r: 30,
          },
        },
      };
      break;
    }

    case 'parallel': {
      nodeConfig = {
        ...nodeConfig,
        type: 'rbd-parallel',
        text: '并联组件\n2/3系统',
        properties: {
          nodeType: 'parallel',
          name: '并联组件',
          k: 2, // 默认维持数量
          n: 3, // 默认总数量
          distribution: {
            type: 'exponential',
            lambda: 0.000_001, // 默认故障率 (1/小时) - 对应MTBF约100万小时
          },
          maintenance: {
            maintenanceTime: 2, // 默认维修时间 2小时
            logisticTime: 1, // 默认后勤保障时间 1小时
          },
          style: {
            fill: '#b7eb8f',
            stroke: '#52c41a',
          },
        },
      };
      break;
    }

    case 'series': {
      nodeConfig = {
        ...nodeConfig,
        type: 'rbd-series',
        text: '串联组件 × 1',
        properties: {
          nodeType: 'series',
          name: '串联组件',
          componentCount: 1, // 默认1个组件
          distribution: {
            type: 'exponential',
            lambda: 0.000_001, // 默认故障率 (1/小时) - 对应MTBF约100万小时
          },
          maintenance: {
            maintenanceTime: 2, // 默认维修时间 2小时
            logisticTime: 1, // 默认后勤保障时间 1小时
          },
          style: {
            fill: '#bae0ff',
            stroke: '#1890ff',
          },
        },
      };
      break;
    }

    case 'start': {
      nodeConfig = {
        ...nodeConfig,
        type: 'rbd-start', // 使用自定义节点类型
        text: '开始',
        properties: {
          nodeType: 'start',
          name: '开始节点',
          style: {
            fill: '#52c41a',
            stroke: '#389e0d',
            r: 25,
          },
        },
      };
      break;
    }
  }

  lf.addNode(nodeConfig);

  // 立即更新节点显示文本以确保正确显示
  nextTick(() => {
    if (nodeConfig.properties) {
      updateNodeText(
        nodeConfig.id,
        nodeConfig.properties.nodeType,
        nodeConfig.properties,
      );
    }
  });

  return nodeConfig;
};

const clearCanvas = () => {
  if (!lf) return;
  lf.clearData();
  emitGraphChange();
  // 清空后刷新小地图
  refreshMiniMap();
};

const fitView = () => {
  if (!lf) return;
  try {
    lf.fitView();
    // 适应后刷新小地图
    refreshMiniMap();
  } catch (error) {
    console.error('适应视图失败:', error);
  }
};

const getSnapshot = () => {
  if (!lf) return null;
  return lf.getSnapshot();
};

// 监听props变化
watch(
  () => props.graphData,
  () => {
    loadGraphDataFromProps();
  },
  { deep: true },
);

watch([() => props.width, () => props.height], () => {
  if (lf) {
    lf.resize();
  }
});

// 容器尺寸观察器
let resizeObserver: null | ResizeObserver = null;

// 生命周期
onMounted(() => {
  // 延迟初始化，确保DOM已完全渲染
  nextTick(() => {
    initLogicFlow();

    // 移除重复的setupKeyboardHandlers调用

    // 设置容器尺寸观察器
    if (containerRef.value) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;

          // 如果LogicFlow实例存在，调整尺寸
          if (lf) {
            const finalWidth = Math.min(width, props.width);
            const finalHeight = Math.min(height, props.height);
            lf.resize(finalWidth, finalHeight);
          }
        }
      });
      resizeObserver.observe(containerRef.value);
    }
  });
});

// KeepAlive激活/停用处理
onActivated(() => {
  // 如果LogicFlow实例不存在，重新初始化
  if (!lf && containerRef.value) {
    nextTick(() => {
      initLogicFlow();
      // 移除重复的setupKeyboardHandlers调用
    });
  } else if (lf && containerRef.value) {
    // 移除重复的setupKeyboardHandlers调用
  }

  // LogicFlow内置键盘系统会自动处理快捷键
});

onDeactivated(() => {
  // 不销毁LogicFlow实例，保持状态
});

onUnmounted(() => {
  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // 清理事件监听器
  if (containerRef.value) {
    containerRef.value.removeEventListener('keydown', handleKeyDown);
  }
  document.removeEventListener('keydown', handleGlobalKeyDown);

  // 清理LogicFlow实例
  if (lf) {
    try {
      lf.destroy();
    } catch (error) {
      console.warn('LogicFlow销毁时出现错误:', error);
    }
    lf = null;
  }
});

// 监听画布尺寸变化
watch([() => props.width, () => props.height], ([newWidth, newHeight]) => {
  if (lf && containerRef.value) {
    // 获取容器实际尺寸
    const containerRect = containerRef.value.getBoundingClientRect();
    const containerWidth = Math.floor(containerRect.width);
    const containerHeight = Math.floor(containerRect.height);

    // 使用较小的尺寸，确保不超出容器
    const finalWidth = Math.min(containerWidth, newWidth);
    const finalHeight = Math.min(containerHeight, newHeight);

    lf.resize(finalWidth, finalHeight);

    // 尺寸变化后重新显示小地图确保位置正确
    nextTick(() => {
      if (lf?.extension?.miniMap) {
        const miniMapExtension = lf.extension.miniMap as any;
        miniMapExtension.show();
      }
    });
  }
});

// 自动布局功能
const performAutoLayout = () => {
  if (!lf) {
    console.warn('LogicFlow实例不存在');
    return;
  }

  const graphData = lf.getGraphData() as any;
  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];

  if (nodes.length === 0) {
    console.warn('没有节点需要布局');
    return;
  }

  // RBD专用的层次化布局算法
  const layoutNodes = performRBDLayout(nodes, edges);

  // 应用新的位置
  layoutNodes.forEach((layoutNode) => {
    const nodeModel = lf!.getNodeModelById(layoutNode.id);
    if (nodeModel) {
      nodeModel.moveText(
        layoutNode.x - nodeModel.x,
        layoutNode.y - nodeModel.y,
      );
      nodeModel.x = layoutNode.x;
      nodeModel.y = layoutNode.y;
    }
  });

  // 布局完成后自动适应屏幕
  setTimeout(() => {
    lf!.fitView(50, 50);
  }, 100);
};

// RBD专用布局算法
const performRBDLayout = (nodes: any[], edges: any[]) => {
  // 1. 分析节点层级结构
  const { layers, nodeMap } = analyzeRBDHierarchy(nodes, edges);

  // 2. 计算每层的布局
  const layoutNodes: any[] = [];
  const layerHeight = 150; // 层间距
  const nodeSpacing = 200; // 节点间距
  const startY = 100; // 起始Y位置

  layers.forEach((layer, layerIndex) => {
    const y = startY + layerIndex * layerHeight;
    const layerWidth = (layer.length - 1) * nodeSpacing;
    const startX = props.width ? (props.width - layerWidth) / 2 : 200;

    layer.forEach((nodeId, nodeIndex) => {
      const node = nodeMap[nodeId];
      if (node) {
        layoutNodes.push({
          ...node,
          x:
            layer.length === 1
              ? (props.width || 800) / 2
              : startX + nodeIndex * nodeSpacing,
          y,
        });
      }
    });
  });

  return layoutNodes;
};

// 分析RBD层次结构
const analyzeRBDHierarchy = (nodes: any[], edges: any[]) => {
  const nodeMap: { [key: string]: any } = {};
  nodes.forEach((node) => {
    nodeMap[node.id] = node;
  });

  // 构建连接关系
  const incoming: { [key: string]: Set<string> } = {};
  const outgoing: { [key: string]: Set<string> } = {};

  nodes.forEach((node) => {
    incoming[node.id] = new Set();
    outgoing[node.id] = new Set();
  });

  edges.forEach((edge) => {
    if (incoming[edge.targetNodeId] && outgoing[edge.sourceNodeId]) {
      incoming[edge.targetNodeId]!.add(edge.sourceNodeId);
      outgoing[edge.sourceNodeId]!.add(edge.targetNodeId);
    }
  });

  // 找到开始节点（start节点或者没有前驱的节点）
  const startNodes = nodes.filter((node) => {
    const nodeType = node.properties?.nodeType;
    return nodeType === 'start' || incoming[node.id]?.size === 0;
  });

  // 拓扑排序生成层级
  const layers: string[][] = [];
  const visited = new Set<string>();
  const currentLayer = new Set<string>();

  // 第一层：开始节点
  if (startNodes.length > 0) {
    startNodes.forEach((node) => currentLayer.add(node.id));
    layers.push([...currentLayer]);
    currentLayer.forEach((id) => visited.add(id));
    currentLayer.clear();
  }

  // 逐层展开
  let hasNewNodes = true;
  while (hasNewNodes && visited.size < nodes.length) {
    hasNewNodes = false;

    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        // 检查所有前驱是否都已访问
        const allPredecessorsVisited = [...(incoming[node.id] || [])].every(
          (predId) => visited.has(predId),
        );

        if (allPredecessorsVisited) {
          currentLayer.add(node.id);
          hasNewNodes = true;
        }
      }
    });

    if (currentLayer.size > 0) {
      layers.push([...currentLayer]);
      currentLayer.forEach((id) => visited.add(id));
      currentLayer.clear();
    }
  }

  // 处理剩余的孤立节点
  const remaining = nodes.filter((node) => !visited.has(node.id));
  if (remaining.length > 0) {
    layers.push(remaining.map((node) => node.id));
  }

  return { layers, nodeMap };
};

// 小地图控制 - 节点和连接线都显示
const showMiniMap = () => {
  if (!lf || !lf.extension || !lf.extension.miniMap) {
    console.warn('小地图功能不可用');
    return;
  }

  const miniMapExtension = lf.extension.miniMap as any;
  try {
    // 显示小地图
    miniMapExtension.show();
    // 启用边线显示
    miniMapExtension.setShowEdge(true);

    console.log('小地图已显示（节点和连线都显示）');
  } catch (error) {
    console.error('显示小地图失败:', error);
  }
};

const hideMiniMap = () => {
  if (!lf || !lf.extension || !lf.extension.miniMap) {
    console.warn('小地图功能不可用');
    return;
  }

  const miniMapExtension = lf.extension.miniMap as any;
  try {
    miniMapExtension.hide();
    console.log('小地图已隐藏');
  } catch (error) {
    console.error('隐藏小地图失败:', error);
  }
};

// 重置小地图（这会重置画布的缩放和平移）
const resetMiniMap = () => {
  if (!lf || !lf.extension || !lf.extension.miniMap) {
    console.warn('小地图功能不可用');
    return;
  }

  const miniMapExtension = lf.extension.miniMap as any;
  try {
    miniMapExtension.reset();
    console.log('小地图已重置');
  } catch (error) {
    console.error('重置小地图失败:', error);
  }
};

// 刷新小地图内容 - 包含节点和连接线，使用双重策略
const refreshMiniMap = () => {
  if (!lf || !lf.extension || !lf.extension.miniMap) {
    return;
  }

  const miniMapExtension = lf.extension.miniMap as any;
  try {
    // 策略1：直接更新miniMap
    miniMapExtension.setShowEdge(true);

    // 策略2：强制重绘（隐藏/显示）
    setTimeout(() => {
      miniMapExtension.hide();
      setTimeout(() => {
        miniMapExtension.show();
        miniMapExtension.setShowEdge(true);

        // 策略3：确保数据同步
        setTimeout(() => {
          // 数据同步完成
        }, 100);
      }, 50);
    }, 10);
  } catch (error) {
    console.error('刷新小地图失败:', error);
  }
};

// 更新小地图视口
const updateMiniMapViewport = () => {
  if (!lf || !lf.extension || !lf.extension.miniMap) {
    return;
  }

  const miniMapExtension = lf.extension.miniMap as any;
  try {
    // 更新小地图的视口位置
    if (miniMapExtension.updateViewport) {
      miniMapExtension.updateViewport();
    }
  } catch (error) {
    console.error('更新小地图视口失败:', error);
  }
};

// 重置缩放级别
const resetZoom = () => {
  if (!lf) return;
  try {
    lf.resetZoom();
    refreshMiniMap();
  } catch (error) {
    console.error('重置缩放失败:', error);
  }
};

// 居中画布
const centerCanvas = () => {
  if (!lf) return;
  try {
    lf.translateCenter();
    refreshMiniMap();
  } catch (error) {
    console.error('居中画布失败:', error);
  }
};

// 更新节点显示文本 - 通过更新properties触发节点模型的动态文本计算
const updateNodeText = (nodeId: string, _nodeType: string, properties: any) => {
  if (!lf) return;

  try {
    // 更新节点的properties，这会触发自定义节点模型的updateText方法
    const nodeModel = lf.getNodeModelById(nodeId);
    if (nodeModel) {
      // 更新节点的properties
      nodeModel.properties = { ...nodeModel.properties, ...properties };

      // 对于自定义节点类型，调用updateText触发动态文本计算
      if (['rbd-kn', 'rbd-parallel', 'rbd-series'].includes(nodeModel.type)) {
        nodeModel.updateText(''); // 传入空值，让节点模型自己计算
      }
    }
  } catch (error) {
    console.error('更新节点文本失败:', error);
  }
};

// 加载图形数据到LogicFlow
const loadGraphData = (graphData: RBDGraphData) => {
  if (!lf) {
    console.warn('LogicFlow实例不存在，无法加载数据');
    return;
  }

  // 确保容器存在
  if (!containerRef.value) {
    console.warn('LogicFlow容器不存在，无法加载数据');
    return;
  }

  // 确保LogicFlow实例已完全初始化
  if (typeof lf.getGraphData !== 'function') {
    console.warn('LogicFlow实例未完全初始化，延迟加载数据');
    setTimeout(() => {
      loadGraphData(graphData);
    }, 100);
    return;
  }

  try {
    // 开始加载图形数据到LogicFlow

    // 清空当前画布
    lf.clearData();

    // 添加节点
    if (graphData.nodes && graphData.nodes.length > 0) {
      graphData.nodes.forEach((node) => {
        const nodeType = node.properties?.nodeType;
        if (nodeType) {
          // 直接使用现有节点数据创建节点
          const nodeConfig = {
            id: node.id,
            type: node.type || getLogicFlowType(nodeType),
            x: node.x,
            y: node.y,
            text: '',
            properties: node.properties,
          };

          lf!.addNode(nodeConfig);
        }
      });
    }

    // 添加边（连接线）
    if (graphData.edges && graphData.edges.length > 0) {
      graphData.edges.forEach((edge) => {
        const edgeConfig = {
          id: edge.id,
          sourceNodeId: edge.sourceNodeId,
          targetNodeId: edge.targetNodeId,
          type: edge.type || 'line',
        };

        lf!.addEdge(edgeConfig);
      });
    }

    // 图形数据加载完成

    // 更新所有节点的显示文本
    setTimeout(() => {
      if (graphData.nodes && graphData.nodes.length > 0) {
        graphData.nodes.forEach((node) => {
          const nodeModel = lf!.getNodeModelById(node.id);
          if (
            nodeModel &&
            ['rbd-kn', 'rbd-parallel', 'rbd-series'].includes(nodeModel.type)
          ) {
            nodeModel.updateText('');
          }
        });
      }
    }, 200);

    // 刷新小地图
    setTimeout(() => {
      refreshMiniMap();
    }, 100);
  } catch (error) {
    console.error('加载图形数据失败:', error);
  }
};

// 获取图形数据
const getGraphData = (): RBDGraphData => {
  if (!lf) {
    return { nodes: [], edges: [] };
  }

  const lfGraphData: any = lf.getGraphData();
  const rbdGraphData: RBDGraphData = {
    nodes: lfGraphData.nodes?.map(convertToRBDNode) || [],
    edges:
      lfGraphData.edges?.map((edge: any) => ({
        id: edge.id,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        type: 'polyline',
      })) || [],
  };

  return rbdGraphData;
};

// 暴露方法给父组件
defineExpose({
  addNode,
  clearCanvas,
  fitView,
  getSnapshot,
  performAutoLayout,
  showMiniMap,
  hideMiniMap,
  resetMiniMap,
  refreshMiniMap,
  resetZoom,
  centerCanvas,
  updateNodeText,
  loadGraphData,
  getGraphData,
});

// 连接验证现在由节点模型的连接规则处理，不需要额外的验证逻辑

// LogicFlow内置复制粘贴功能设置
const setupLogicFlowCopyPaste = (lf: LogicFlow) => {
  // 检查LogicFlow实例是否有效
  if (!lf || typeof lf.on !== 'function') {
    console.warn('LogicFlow实例无效，跳过复制粘贴设置');
    return;
  }

  // 设置LogicFlow复制粘贴功能

  // 监听复制事件
  lf.on('copy', (data: any) => {
    console.log('LogicFlow复制事件:', data);

    // 过滤掉开始/结束节点
    if (data.nodes && data.nodes.length > 0) {
      const node = data.nodes[0];
      const nodeType = node.properties?.nodeType;

      if (nodeType === 'start' || nodeType === 'end') {
        console.log('控制节点不能复制:', nodeType);
        // 阻止复制
        return false;
      }
    }

    return data;
  });

  // 监听粘贴事件
  lf.on('paste', (data: any) => {
    console.log('LogicFlow粘贴事件:', data);

    // 处理粘贴的节点 - 简化处理，避免重复创建
    if (data.nodes && data.nodes.length > 0) {
      // 延迟更新节点显示文本，避免干扰LogicFlow的节点创建
      setTimeout(() => {
        data.nodes.forEach((node: any) => {
          const nodeModel = lf.getNodeModelById(node.id);
          if (
            nodeModel &&
            ['rbd-kn', 'rbd-parallel', 'rbd-series'].includes(nodeModel.type)
          ) {
            nodeModel.updateText('');
          }
        });
      }, 200);
    }

    return data;
  });

  // 监听删除事件
  lf.on('delete', (data: any) => {
    console.log('LogicFlow删除事件:', data);

    // 过滤掉开始/结束节点
    if (data.nodes && data.nodes.length > 0) {
      const filteredNodes = data.nodes.filter((node: any) => {
        const nodeType = node.properties?.nodeType;
        return nodeType !== 'start' && nodeType !== 'end';
      });

      if (filteredNodes.length !== data.nodes.length) {
        console.log('过滤掉控制节点，只删除普通节点');
        return { ...data, nodes: filteredNodes };
      }
    }

    // 确保删除事件正常执行
    return data;
  });

  // 尝试启用LogicFlow 2.x的复制粘贴功能
  try {
    // 检查是否有setCopyPaste方法
    if (typeof lf.setCopyPaste === 'function') {
      lf.setCopyPaste(true);
      console.log('使用setCopyPaste方法启用复制粘贴');
    } else {
      console.log('LogicFlow 2.x通过配置启用复制粘贴功能');
    }
  } catch (error) {
    console.warn('启用复制粘贴功能失败:', error);
  }

  // LogicFlow复制粘贴功能设置完成
};

// 键盘事件处理函数 - 实现自定义复制粘贴删除功能
const handleKeyDown = (e: KeyboardEvent) => {
  // 检查LogicFlow实例是否存在
  if (!lf) {
    console.log('LogicFlow实例不存在，忽略键盘事件');
    return;
  }

  console.log(
    '键盘事件触发:',
    e.key,
    'Ctrl:',
    e.ctrlKey,
    '目标元素:',
    e.target,
  );

  // 处理复制操作 (Ctrl+C)
  if (e.ctrlKey && e.key === 'c') {
    e.preventDefault();
    console.log('Ctrl+C 复制操作');

    const selectedElements = lf.getSelectElements
      ? lf.getSelectElements()
      : { nodes: [], edges: [] };
    console.log('复制操作 - 选中元素:', selectedElements);

    if (selectedElements.nodes && selectedElements.nodes.length > 0) {
      const node = selectedElements.nodes[0];
      if (node) {
        const nodeType = node.properties?.nodeType;

        if (nodeType === 'start' || nodeType === 'end') {
          console.log('控制节点不能复制:', nodeType);
          return;
        }

        // 存储复制的节点数据
        window.copiedNodeData = JSON.parse(JSON.stringify(node));
        console.log('节点已复制:', window.copiedNodeData);
      }
    } else {
      console.log('没有选中的节点');
    }
    return;
  }

  // 处理粘贴操作 (Ctrl+V)
  if (e.ctrlKey && e.key === 'v') {
    e.preventDefault();
    e.stopPropagation();
    // Ctrl+V 粘贴操作 - 开始处理

    if (window.copiedNodeData) {
      console.log('找到复制的节点数据:', window.copiedNodeData);

      // 创建新的节点ID
      const newNodeId = `${window.copiedNodeData.properties?.nodeType || 'node'}_${Date.now()}`;

      // 计算新位置（稍微偏移）
      const offset = 50;
      const newNodeData = {
        ...window.copiedNodeData,
        id: newNodeId,
        x: window.copiedNodeData.x + offset,
        y: window.copiedNodeData.y + offset,
      };

      console.log('准备粘贴节点:', newNodeData);

      // 添加新节点
      if (lf) {
        try {
          lf.addNode(newNodeData);
          console.log('节点添加成功:', newNodeId);

          // 更新节点显示文本
          setTimeout(() => {
            if (lf) {
              const nodeModel = lf.getNodeModelById(newNodeId);
              if (
                nodeModel &&
                ['rbd-kn', 'rbd-parallel', 'rbd-series'].includes(
                  nodeModel.type,
                )
              ) {
                nodeModel.updateText('');
                console.log('节点文本已更新');
              }
            }
          }, 100);
        } catch (error) {
          console.error('添加节点失败:', error);
        }
      } else {
        console.error('LogicFlow实例不存在，无法添加节点');
      }
    } else {
      console.log('没有可粘贴的节点数据');
    }
    return;
  }

  // 处理删除操作 (Delete)
  if (e.key === 'Delete') {
    e.preventDefault();
    console.log('Delete 删除操作');

    // 获取选中的元素
    const selectedElements = lf.getSelectElements
      ? lf.getSelectElements()
      : { nodes: [], edges: [] };
    console.log('删除操作 - 选中元素:', selectedElements);

    if (selectedElements.nodes && selectedElements.nodes.length > 0) {
      const nodesToDelete = selectedElements.nodes.filter((node: any) => {
        const nodeType = node.properties?.nodeType;
        return nodeType !== 'start' && nodeType !== 'end';
      });

      if (nodesToDelete.length > 0) {
        console.log('删除节点:', nodesToDelete);
        if (lf) {
          nodesToDelete.forEach((node: any) => {
            // 使用LogicFlow的删除方法
            try {
              lf.deleteNode(node.id);
            } catch (error) {
              console.warn('删除节点失败:', error);
            }
          });
        }
      } else {
        console.log('没有可删除的节点（控制节点不能删除）');
      }
    } else {
      console.log('没有选中的节点');
    }
  }
};

// 设置键盘事件处理 - 增强版本
const setupKeyboardHandlers = () => {
  if (!lf || !containerRef.value) {
    console.warn('LogicFlow实例或容器不存在');
    return;
  }

  // 移除之前的事件监听器，避免重复绑定
  containerRef.value.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keydown', handleGlobalKeyDown);

  // 添加容器级别的事件监听器
  containerRef.value.addEventListener('keydown', handleKeyDown, {
    passive: false,
  });

  // 同时添加全局事件监听器，确保能捕获到所有键盘事件
  document.addEventListener('keydown', handleGlobalKeyDown, { passive: false });

  // 确保容器获得焦点，以便接收键盘事件
  containerRef.value.focus();

  // 键盘事件监听器已设置，容器已获得焦点

  // 添加点击事件来确保容器保持焦点
  containerRef.value.addEventListener('click', () => {
    containerRef.value?.focus();
  });
};

// generateNodeText函数已移除，节点文本由addNode方法直接处理
</script>

<template>
  <div class="logicflow-editor">
    <div ref="containerRef" class="logicflow-container" tabindex="0"></div>
  </div>
</template>

<style scoped>
.logicflow-editor {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-height: 100%;
  overflow: hidden;
}

.logicflow-container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-height: 100%;
  overflow: hidden;
  background: #f8f8f8;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}
</style>
