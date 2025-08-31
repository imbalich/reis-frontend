// 节点类型常量
export const NODE_TYPES = {
  START: 'start',
  END: 'end',
  SERIES: 'series',
  PARALLEL: 'parallel',
  KN: 'kn',
} as const;

export const NODE_TYPE_NAMES: Record<string, string> = {
  [NODE_TYPES.START]: '开始节点',
  [NODE_TYPES.END]: '结束节点',
  [NODE_TYPES.SERIES]: '串联节点',
  [NODE_TYPES.PARALLEL]: '并联节点',
  [NODE_TYPES.KN]: 'k/n节点',
};

export const NODE_TYPE_COLORS: Record<string, string> = {
  [NODE_TYPES.START]: '#52c41a', // 绿色
  [NODE_TYPES.END]: '#ff4d4f', // 红色
  [NODE_TYPES.SERIES]: '#bae0ff', // 淡蓝色
  [NODE_TYPES.PARALLEL]: '#b7eb8f', // 淡绿色
  [NODE_TYPES.KN]: '#1890ff', // 蓝色
};

export const NODE_ICONS: Record<string, string> = {
  [NODE_TYPES.START]: '▶',
  [NODE_TYPES.END]: '⏹',
  [NODE_TYPES.SERIES]: '□',
  [NODE_TYPES.PARALLEL]: '□',
  [NODE_TYPES.KN]: '◇',
};

export const CONTROL_NODE_DESCRIPTIONS: Record<string, string> = {
  [NODE_TYPES.START]:
    '开始节点是RBD模型的起点，代表系统开始工作的状态。每个RBD模型有且仅有一个开始节点，所有的可靠性分析都从此节点开始。',
  [NODE_TYPES.END]:
    '结束节点是RBD模型的终点，代表系统成功完成任务的状态。每个RBD模型有且仅有一个结束节点，系统可靠性计算以到达此节点为目标。',
};

export const CONTROL_NODE_ALERTS: Record<string, string> = {
  [NODE_TYPES.START]:
    '开始节点只能有输出连接，不能有输入连接。它是整个RBD模型的唯一入口点。',
  [NODE_TYPES.END]:
    '结束节点只能有输入连接，不能有输出连接。它是整个RBD模型的唯一出口点。',
};
