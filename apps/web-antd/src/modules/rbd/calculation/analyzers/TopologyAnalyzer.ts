import type { RBDEdge, RBDGraphData, RBDNode } from '../../types';
import type {
  PathAnalysisResult,
  PathTreeNode,
  TopologyAnalysisResult,
} from '../types';

export class TopologyAnalyzer {
  private edgeMap: Map<string, RBDEdge[]>;
  private graphData: RBDGraphData;
  private nodeMap: Map<string, RBDNode>;

  constructor(graphData: RBDGraphData) {
    this.graphData = graphData;
    this.nodeMap = new Map();
    this.edgeMap = new Map();
    this.buildMaps();
  }

  /**
   * 分析从开始到结束的所有路径
   */
  public analyzePaths(): PathAnalysisResult {
    const topologyResult = this.validateTopology();

    if (!topologyResult.isValid) {
      return {
        paths: [],
        isValid: false,
        error: topologyResult.error,
        calculationOrder: [],
      };
    }

    const startNode = topologyResult.startNodes[0];
    const endNode = topologyResult.endNodes[0];

    // 使用深度优先搜索找到所有路径
    const allPaths = this.findAllPaths(startNode.id, endNode.id);

    if (allPaths.length === 0) {
      return {
        paths: [],
        isValid: false,
        error: '无法找到从开始节点到结束节点的路径',
        calculationOrder: [],
      };
    }

    // 构建路径树
    const pathTree = this.buildPathTree(allPaths);

    // 确定计算顺序（拓扑排序）
    const calculationOrder = this.determineCalculationOrder(pathTree);

    return {
      paths: pathTree,
      isValid: true,
      calculationOrder,
    };
  }

  /**
   * 验证拓扑结构
   */
  public validateTopology(): TopologyAnalysisResult {
    const startNodes = this.graphData.nodes.filter(
      (node) => node.properties?.nodeType === 'start',
    );
    const endNodes = this.graphData.nodes.filter(
      (node) => node.properties?.nodeType === 'end',
    );

    // 检查开始和结束节点数量
    if (startNodes.length === 0) {
      return {
        startNodes: [],
        endNodes: [],
        connectedPaths: [],
        disconnectedNodes: this.graphData.nodes,
        isValid: false,
        error: '缺少开始节点',
      };
    }

    if (endNodes.length === 0) {
      return {
        startNodes,
        endNodes: [],
        connectedPaths: [],
        disconnectedNodes: this.graphData.nodes,
        isValid: false,
        error: '缺少结束节点',
      };
    }

    if (startNodes.length > 1) {
      return {
        startNodes,
        endNodes,
        connectedPaths: [],
        disconnectedNodes: [],
        isValid: false,
        error: '只能有一个开始节点',
      };
    }

    if (endNodes.length > 1) {
      return {
        startNodes,
        endNodes,
        connectedPaths: [],
        disconnectedNodes: [],
        isValid: false,
        error: '只能有一个结束节点',
      };
    }

    // 分析连接路径
    const connectedPaths = this.analyzeConnectedPaths(
      startNodes[0],
      endNodes[0],
    );
    const disconnectedNodes = this.findDisconnectedNodes(connectedPaths);

    return {
      startNodes,
      endNodes,
      connectedPaths,
      disconnectedNodes,
      isValid: connectedPaths.length > 0,
      error:
        connectedPaths.length === 0
          ? '没有从开始节点到结束节点的有效路径'
          : undefined,
    };
  }

  /**
   * 分析连接路径
   */
  private analyzeConnectedPaths(
    startNode: RBDNode,
    endNode: RBDNode,
  ): PathTreeNode[] {
    const paths = this.findAllPaths(startNode.id, endNode.id);
    return this.buildPathTree(paths);
  }

  /**
   * 构建线性路径树
   */
  private buildLinearPathTree(path: string[]): PathTreeNode[] {
    const tree: PathTreeNode[] = [];

    for (const [i, nodeId] of path.entries()) {
      const node = this.nodeMap.get(nodeId);

      if (!node) {
        continue;
      }

      const treeNode: PathTreeNode = {
        nodeId,
        nodeType: node.properties?.nodeType || 'unknown',
        children: [],
        isParallel: false,
      };

      // 为并联节点添加k/n参数
      if (node.properties?.nodeType === 'parallel') {
        treeNode.k = (node.properties as any).k;
        treeNode.n = (node.properties as any).n;
      }

      // 建立串联关系：每个节点都是前一个节点的子节点
      if (i > 0 && tree.length > 0) {
        tree[tree.length - 1].children.push(treeNode);
      }

      tree.push(treeNode);
    }

    return tree;
  }

  /**
   * 构建节点和边的映射关系
   */
  private buildMaps(): void {
    // 构建节点映射
    this.graphData.nodes.forEach((node) => {
      this.nodeMap.set(node.id, node);
    });

    // 构建边映射（按源节点分组）
    this.graphData.edges.forEach((edge) => {
      if (!this.edgeMap.has(edge.sourceNodeId)) {
        this.edgeMap.set(edge.sourceNodeId, []);
      }
      this.edgeMap.get(edge.sourceNodeId)!.push(edge);
    });
  }

  /**
   * 构建并联路径树（简化版本）
   */
  private buildParallelPathTree(paths: string[][]): PathTreeNode[] {
    // 简化实现：将多条路径作为并联结构处理
    const parallelNode: PathTreeNode = {
      nodeId: 'parallel_group',
      nodeType: 'parallel',
      children: [],
      isParallel: true,
      k: 1, // 至少需要一条路径
      n: paths.length,
    };

    paths.forEach((path) => {
      const linearTree = this.buildLinearPathTree(path);
      if (linearTree.length > 0) {
        // 使用完整的路径树，而不是只取第一个节点
        parallelNode.children.push(linearTree[0]);
      }
    });

    return [parallelNode];
  }

  /**
   * 构建路径树结构
   */
  private buildPathTree(paths: string[][]): PathTreeNode[] {
    if (paths.length === 0) return [];

    // 简化处理：如果只有一条路径，直接构建线性树
    if (paths.length === 1) {
      return this.buildLinearPathTree(paths[0]);
    }

    // 多条路径的情况，需要识别并联结构
    return this.buildParallelPathTree(paths);
  }

  /**
   * 确定计算顺序（拓扑排序）
   */
  private determineCalculationOrder(pathTree: PathTreeNode[]): string[] {
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = (node: PathTreeNode): void => {
      if (visited.has(node.nodeId)) return;

      // 先访问子节点
      node.children.forEach((child) => visit(child));

      visited.add(node.nodeId);
      order.push(node.nodeId);
    };

    pathTree.forEach((node) => visit(node));
    return order.reverse(); // 反转得到正确的计算顺序
  }

  /**
   * 使用深度优先搜索找到所有路径
   */
  private findAllPaths(startId: string, endId: string): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, path: string[]): void => {
      if (visited.has(currentId)) return;

      visited.add(currentId);
      path.push(currentId);

      if (currentId === endId) {
        paths.push([...path]);
      } else {
        const edges = this.edgeMap.get(currentId) || [];
        for (const edge of edges) {
          dfs(edge.targetNodeId, path);
        }
      }

      visited.delete(currentId);
      path.pop();
    };

    dfs(startId, []);
    return paths;
  }

  /**
   * 查找未连接的节点
   */
  private findDisconnectedNodes(connectedPaths: PathTreeNode[]): RBDNode[] {
    const connectedNodeIds = new Set<string>();

    const collectNodeIds = (nodes: PathTreeNode[]): void => {
      nodes.forEach((node) => {
        connectedNodeIds.add(node.nodeId);
        collectNodeIds(node.children);
      });
    };

    collectNodeIds(connectedPaths);

    return this.graphData.nodes.filter(
      (node) => !connectedNodeIds.has(node.id),
    );
  }
}
