import type { NodeValidationResult, RBDGraphData } from '../types';

import { NODE_TYPE_COLORS, NODE_TYPE_NAMES, NODE_TYPES } from '../constants';

// 获取节点类型名称
export function getNodeTypeName(type: string, properties?: any): string {
  if (type === NODE_TYPES.KN && properties) {
    const k = properties.k || 2;
    const n = properties.n || 3;
    return `${n}选${k}系统`;
  }
  return NODE_TYPE_NAMES[type] || '未知节点';
}

// 获取节点类型颜色
export function getNodeTypeColor(type: string): string {
  return NODE_TYPE_COLORS[type] || 'default';
}

// 验证节点约束
export function validateNodeConstraints(
  type: string,
  graphData: RBDGraphData,
): NodeValidationResult {
  const nodes = graphData.nodes || [];

  if (type === NODE_TYPES.START) {
    const startNodes = nodes.filter(
      (n) => n.properties?.nodeType === NODE_TYPES.START,
    );
    if (startNodes.length > 0) {
      return {
        valid: false,
        message: '每个项目只能有一个开始节点',
      };
    }
  }

  if (type === NODE_TYPES.END) {
    const endNodes = nodes.filter(
      (n) => n.properties?.nodeType === NODE_TYPES.END,
    );
    if (endNodes.length > 0) {
      return {
        valid: false,
        message: '每个项目只能有一个结束节点',
      };
    }
  }

  return {
    valid: true,
    message: '验证通过',
  };
}

// 计算图形统计信息
export function calculateGraphStats(graphData: RBDGraphData) {
  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];

  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const startNodeCount = nodes.filter(
    (n) => n.properties?.nodeType === NODE_TYPES.START,
  ).length;
  const endNodeCount = nodes.filter(
    (n) => n.properties?.nodeType === NODE_TYPES.END,
  ).length;

  // 简单计算路径数：从开始节点到结束节点的路径数
  const pathCount = Math.min(startNodeCount, endNodeCount);

  return {
    nodeCount,
    edgeCount,
    pathCount,
    startNodeCount,
    endNodeCount,
  };
}

// 检查是否为控制节点
export function isControlNode(nodeType: string): boolean {
  return [NODE_TYPES.END, NODE_TYPES.START].includes(nodeType as any);
}

// 生成唯一ID
export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
