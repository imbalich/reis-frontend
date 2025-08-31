// RBD与LogicFlow集成 - 带连接规则的节点定义
import type LogicFlow from '@logicflow/core';

import {
  CircleNode,
  CircleNodeModel,
  RectNode,
  RectNodeModel,
} from '@logicflow/core';

import { NODE_TYPES } from '../constants';

// RBD专用节点类型映射 - 使用自定义类型支持动态文本
export const LOGICFLOW_TYPE_MAP = {
  [NODE_TYPES.START]: 'rbd-start',
  [NODE_TYPES.END]: 'rbd-end',
  [NODE_TYPES.SERIES]: 'rbd-series',
  [NODE_TYPES.PARALLEL]: 'rbd-parallel',
  [NODE_TYPES.KN]: 'rbd-kn',
} as const;

// 获取LogicFlow类型
export function getLogicFlowType(nodeType: string): string {
  return (
    LOGICFLOW_TYPE_MAP[nodeType as keyof typeof LOGICFLOW_TYPE_MAP] || 'rect'
  );
}

// 设置RBD节点样式 - 使用setTheme方法（官方推荐）
export function setupRBDTheme(lf: LogicFlow) {
  console.log('设置RBD节点主题样式...');

  // 使用官方推荐的setTheme方法
  lf.setTheme({
    // 圆形节点基础样式（开始、结束、K/N节点）
    circle: {
      r: 25,
      fill: '#52c41a', // 默认绿色（开始节点）
      stroke: '#389e0d',
      strokeWidth: 2,
    },
    // 矩形节点基础样式（串联、并联节点）
    rect: {
      width: 120,
      height: 60,
      fill: '#bae0ff', // 默认淡蓝色（串联节点）
      stroke: '#1890ff',
      strokeWidth: 2,
      rx: 5,
      ry: 5,
    },
    // 文本样式
    text: {
      fontSize: 12,
      fill: '#333',
      fontWeight: 'bold',
    },
    // 连接线样式
    line: {
      stroke: '#666',
      strokeWidth: 2,
    },
    // 锚点样式
    anchor: {
      r: 3,
      fill: '#1890ff',
      stroke: '#fff',
      strokeWidth: 1,
    },
  });

  console.log('RBD主题样式设置完成');
}

// 串联节点模型 - 动态计算显示文本
class SeriesNodeModel extends RectNodeModel {
  override initNodeData(data: any) {
    super.initNodeData(data);
    // 初始化时设置正确的文本
    this.updateText('');
  }

  override setAttributes() {
    super.setAttributes();
    this.width = 120;
    this.height = 60;
    this.fill = '#bae0ff';
    this.stroke = '#1890ff';
    this.strokeWidth = 2;
    this.rx = 5;
    this.ry = 5;
  }

  override updateText(_value: string) {
    // 动态计算显示文本
    const properties = this.properties || {};
    const name = properties.name || '串联组件';
    const count = properties.componentCount || 1;
    const newText = `${name} × ${count}`;
    super.updateText(newText);
  }
}

// 并联节点模型 - 动态计算显示文本
class ParallelNodeModel extends RectNodeModel {
  override initNodeData(data: any) {
    super.initNodeData(data);
    // 初始化时设置正确的文本
    this.updateText('');
  }

  override setAttributes() {
    super.setAttributes();
    this.width = 120;
    this.height = 60;
    this.fill = '#b7eb8f';
    this.stroke = '#52c41a';
    this.strokeWidth = 2;
    this.rx = 5;
    this.ry = 5;
  }

  override updateText(_value: string) {
    // 动态计算显示文本
    const properties = this.properties || {};
    const name = properties.name || '并联组件';
    const k = properties.k || 2;
    const n = properties.n || 3;
    const newText = `${name}\n${k}/${n}系统`;
    super.updateText(newText);
  }
}

// K/N节点模型 - 动态计算显示文本
class KNNodeModel extends CircleNodeModel {
  override initNodeData(data: any) {
    super.initNodeData(data);
    // 初始化时设置正确的文本
    this.updateText('');
  }

  override setAttributes() {
    super.setAttributes();
    this.r = 30;
    this.fill = '#1890ff';
    this.stroke = '#096dd9';
    this.strokeWidth = 2;
  }

  override updateText(_value: string) {
    // 动态计算显示文本
    const properties = this.properties || {};
    const k = properties.k || 2;
    const n = properties.n || 3;
    const newText = `${k}/${n}`;
    super.updateText(newText);
  }
}

// 注册RBD节点类型和连接规则
export function registerRBDNodes(lf: LogicFlow) {
  // 设置基础主题样式
  setupRBDTheme(lf);

  // 注册带有连接规则的开始节点
  lf.register({
    type: 'rbd-start',
    view: CircleNode,
    model: class extends CircleNodeModel {
      override getConnectedTargetRules() {
        return []; // 不允许作为target（只能有出边）
      }

      override setAttributes() {
        super.setAttributes();
        this.r = 25;
        this.fill = '#52c41a';
        this.stroke = '#389e0d';
        this.strokeWidth = 2;
      }
    },
  });

  // 注册带有连接规则的结束节点
  lf.register({
    type: 'rbd-end',
    view: CircleNode,
    model: class extends CircleNodeModel {
      override getConnectedSourceRules() {
        return []; // 不允许作为source（只能有入边）
      }

      override setAttributes() {
        super.setAttributes();
        this.r = 25;
        this.fill = '#ff4d4f';
        this.stroke = '#cf1322';
        this.strokeWidth = 2;
      }
    },
  });

  // 注册串联节点 - 动态文本
  lf.register({
    type: 'rbd-series',
    view: RectNode,
    model: SeriesNodeModel,
  });

  // 注册并联节点 - 动态文本
  lf.register({
    type: 'rbd-parallel',
    view: RectNode,
    model: ParallelNodeModel,
  });

  // 注册K/N节点 - 动态文本
  lf.register({
    type: 'rbd-kn',
    view: CircleNode,
    model: KNNodeModel,
  });

  console.log('RBD节点类型和连接规则注册完成（包含动态文本支持）');
}
