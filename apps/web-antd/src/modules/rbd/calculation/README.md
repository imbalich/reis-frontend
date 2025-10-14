# RBD计算算法使用指南

## 🎯 概述

本项目现在支持三种RBD可靠性计算算法：

1. **路径枚举法 (Path Enumeration)** - 快速计算简单拓扑
2. **Factoring算法** - 精确处理复杂拓扑，包括共享节点和K/N表决
3. **自适应算法 (Adaptive)** - 根据拓扑复杂度自动选择最佳算法

## 🚀 快速开始

### 在前端界面使用

1. **选择算法**：在计算面板的"计算设置"部分选择算法
2. **点击计算**：
   - **开始计算**：使用选择的算法进行单次计算
   - **算法对比**：同时运行三种算法并对比结果

### 在代码中使用

```typescript
import {
  calculateRBDReliability,
  setCalculationAlgorithm,
  getCurrentAlgorithm,
  testAlgorithms,
} from './calculation';

// 设置算法
setCalculationAlgorithm('factoring');

// 单次计算
const result = await calculateRBDReliability(
  graphData,
  { start: 0, end: 8760, points: 100 },
  { includeMaintenance: false, calculationTypes: ['reliability'] },
  'factoring', // 可选：指定算法
);

// 对比测试所有算法
const results = await testAlgorithms(
  graphData,
  { start: 0, end: 8760, points: 100 },
  { includeMaintenance: false, calculationTypes: ['reliability'] },
);
```

## 📊 算法选择指南

### 何时使用路径枚举法

- ✅ 简单拓扑结构
- ✅ 无共享节点的系统
- ✅ 线性或简单的并联结构
- ✅ 需要快速计算

### 何时使用Factoring算法

- ✅ 复杂拓扑结构
- ✅ 包含共享节点的系统
- ✅ 有K/N表决节点的系统
- ✅ 需要精确计算
- ✅ 混合串联、并联、表决结构

### 何时使用自适应算法

- ✅ 不确定拓扑复杂度
- ✅ 希望自动选择最佳算法
- ✅ 推荐默认选择

## 🔍 控制台调试

### 查看计算过程

打开浏览器开发者工具，在控制台中可以看到：

```
🚀 开始计算 - 使用算法: factoring
📊 图形数据: {节点数: 15, 边数: 18, 时间范围: "0-8760小时", 数据点: 100}
=== 拓扑复杂度分析 ===
复杂度评分: 8
复杂度级别: medium
推荐算法: factoring
分析详情: ["节点数量中等(15个)", "连接复杂度中等(18条边)", "包含1个K/N表决节点"]
使用Factoring算法进行精确计算...
=== Factoring算法计算完成 ===
系统可靠度结果: [0.9999, 0.9998, 0.9997, 0.9996, 0.9995]
计算时间范围: 0 到 8760 小时
时间点数量: 100
计算耗时: 245ms
✅ 计算完成 - 算法: factoring {系统可靠度: Array(5), 计算时间: "245ms", 总时间: "267ms", 错误: "无"}
```

### 全局测试函数

在控制台中可以使用以下函数：

```javascript
// 对比所有算法
testRBDAlgorithms(graphData, timeRange, options);

// 快速测试单个算法
quickTestRBDAlgorithm('factoring', graphData, timeRange, options);

// 设置当前算法
setRBDAlgorithm('factoring');

// 获取当前算法
getRBDAlgorithm();
```

## 🧪 算法对比测试

### 使用界面

1. 点击"算法对比"按钮
2. 查看控制台输出，了解各算法的：
   - 执行时间
   - 计算结果
   - 错误信息
   - 结果差异分析

### 使用代码

```typescript
const results = await testAlgorithms(graphData, timeRange, options);

// results 包含：
// - algorithm: 算法名称
// - result: 计算结果
// - executionTime: 执行时间
// - success: 是否成功
// - systemReliability: 系统可靠度数组
// - error: 错误信息
```

## ⚠️ 注意事项

### 计算精度

- **Factoring算法**：最高精度，适用于复杂拓扑
- **路径枚举法**：简单拓扑精度高，复杂拓扑可能出错
- **自适应算法**：自动选择，通常选择最合适的算法

### 性能考虑

- **路径枚举法**：最快，适合简单拓扑
- **Factoring算法**：较慢，但处理复杂拓扑更准确
- **自适应算法**：需要先分析复杂度，略微增加开销

### 错误处理

- 所有算法都有完整的错误处理
- 控制台会显示详细的错误信息
- 算法对比测试会显示每个算法的成功/失败状态

## 🔧 故障排除

### 常见问题

1. **计算时间过长**
   - 检查拓扑复杂度
   - 减少数据点数量
   - 使用路径枚举法（如果是简单拓扑）

2. **计算结果差异很大**
   - 拓扑可能包含共享节点，应使用Factoring算法
   - 检查K/N表决节点配置
   - 使用算法对比功能验证

3. **算法选择困难**
   - 使用自适应算法（推荐）
   - 运行算法对比测试
   - 查看控制台的复杂度分析

### 调试技巧

1. **查看拓扑复杂度分析**
   - 在控制台查看"拓扑复杂度分析"输出
   - 了解系统特征：节点数、边数、K/N节点等

2. **对比算法结果**
   - 使用"算法对比"功能
   - 查看控制台的结果差异分析
   - 重点关注最大差异和平均差异

3. **检查节点配置**
   - 确保所有节点都有正确的属性配置
   - 检查K/N节点的k和n参数
   - 验证故障分布参数

## 📈 性能基准

基于典型测试案例的性能表现：

| 算法          | 简单拓扑 | 复杂拓扑  | 精度 | 推荐场景 |
| ------------- | -------- | --------- | ---- | -------- |
| 路径枚举法    | 10-50ms  | 可能错误  | 中等 | 简单系统 |
| Factoring算法 | 50-200ms | 200-500ms | 高   | 复杂系统 |
| 自适应算法    | 15-60ms  | 200-500ms | 高   | 通用推荐 |

\*性能数据基于典型硬件配置，实际性能可能因硬件和拓扑复杂度而异。
