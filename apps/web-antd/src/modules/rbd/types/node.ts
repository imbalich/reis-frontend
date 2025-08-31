// 故障分布类型定义（为未来扩展预留）
export type DistributionType =
  | 'exponential'
  | 'lognormal'
  | 'normal'
  | 'weibull';

// 分布参数接口（可扩展）
export interface DistributionParameters {
  type: DistributionType;
  // 指数分布参数
  lambda?: number; // 故障率 (1/小时)
  // 为未来Weibull、正态分布等预留
  shape?: number; // 形状参数 (Weibull)
  scale?: number; // 尺度参数 (Weibull)
  location?: number; // 位置参数
  // 可以根据需要继续扩展...
}

// 基础节点属性
interface BaseNodeProperties {
  nodeType: 'end' | 'kn' | 'parallel' | 'series' | 'start';
}

// 控制节点属性 (start, end)
interface ControlNodeProperties extends BaseNodeProperties {
  nodeType: 'end' | 'start';
  name: string; // 固定名称，不可编辑
}

// 修复性维修参数
export interface MaintenanceParameters {
  maintenanceTime: number; // 维修时间 (小时)
  logisticTime: number; // 后勤保障时间 (小时)
}

// 串联节点属性
interface SeriesNodeProperties extends BaseNodeProperties {
  nodeType: 'series';
  name: string; // 用户可编辑
  componentCount: number; // 组件数量
  distribution: DistributionParameters; // 故障分布
  maintenance?: MaintenanceParameters; // 修复性维修
}

// 并联节点属性（实际上是K/N组件系统）
interface ParallelNodeProperties extends BaseNodeProperties {
  nodeType: 'parallel';
  name: string; // 用户可编辑
  k: number; // 维持数量（需要保留的数量）
  n: number; // 总数量
  distribution: DistributionParameters; // 故障分布
  maintenance?: MaintenanceParameters; // 修复性维修
}

// K/N逻辑节点属性（链路级别的K/N系统）
interface KNNodeProperties extends BaseNodeProperties {
  nodeType: 'kn';
  k: number; // 维持数量
  n: number; // 总数量
  // 不需要name（显示K/N值）
  // 不需要distribution（逻辑节点）
}

// 联合类型
export type RBDNodeProperties =
  | ControlNodeProperties
  | KNNodeProperties
  | ParallelNodeProperties
  | SeriesNodeProperties;

// 为了向后兼容，保留旧接口（标记为deprecated）
/** @deprecated 请使用新的类型安全的RBDNodeProperties */
export interface LegacyRBDNodeProperties {
  nodeType: 'end' | 'kn' | 'parallel' | 'series' | 'start';
  name: string;
  reliability?: number;
  mtbf?: number;
  mttr?: number;
  k?: number;
  n?: number;
}

export interface RBDNode {
  id: string;
  type: string;
  x: number;
  y: number;
  properties: RBDNodeProperties;
}

export interface RBDEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: string;
}

export interface RBDGraphData {
  nodes: RBDNode[];
  edges: RBDEdge[];
}

export interface NodeValidationResult {
  valid: boolean;
  message: string;
}

export interface AnalysisResult {
  systemReliability: number;
  systemAvailability: number;
  systemMTBF: number;
  systemMTTR: number;
  treeStructure: TreeNode;
  calculationMethod: string;
  error?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  type: string;
  isParallel: boolean;
  reliability: number;
  children: TreeNode[];
}
