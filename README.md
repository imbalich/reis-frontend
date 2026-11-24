# REIS 前端

可靠性与维修保障分析系统的前端工程。基于 [Vue Vben Admin](https://www.vben.pro/)（Vue 3 + Vite + Ant Design Vue + pnpm monorepo），业务应用在 `apps/web-antd`。接口默认指向本地后端 `http://localhost:8000`。

## 本地运行

需要 Node.js 与 pnpm。

```shell
pnpm install
pnpm dev
```

开发服务默认端口 `5173`（见 `apps/web-antd/.env.development`）。

生产构建：

```shell
pnpm build
```

只构建当前业务应用：

```shell
pnpm build:antd
```

## 目录

| 路径 | 作用 |
| --- | --- |
| `apps/web-antd` | 业务前端，页面、路由、接口封装都在这里 |
| `apps/web-antd/src/views` | 按业务模块划分的页面 |
| `apps/web-antd/src/router/routes/modules` | 菜单与路由 |
| `apps/web-antd/src/api` | 后端接口封装 |
| `apps/web-antd/src/custom/weibull` | Weibull 等寿命分布拟合策略 |
| `apps/web-antd/src/modules/rbd` | 可靠性框图编辑与计算 |
| `packages` | Vben 公共包（布局、请求、组件等） |

## 业务模块

菜单来自 `apps/web-antd/src/router/routes/modules`。

| 模块 | 路由前缀 | 说明 |
| --- | --- | --- |
| 基础数据管理 | `/datamanage` | 发运、故障、EBOM、产品、造修、必换件、仓库、库房备品、部件与备品映射 |
| Weibull | `/fitting` | 导入分析项目、寿命曲线拟合、寿命曲线拟合-Aaron、最佳维护周期 |
| 参数退化评估 | `/degrade` | 退化曲线拟合 |
| 敏感因素分析 | `/sense` | 故障影响要素 |
| RCM 管理 | `/rcm` | RCM 基础数据、计算结果 |
| 科学库存管理 | `/scientific-inventory` | 计算结果展示 |
| 可靠性框图 | `/rbd` | 项目列表、框图编辑与计算 |
| 设计模块 | `/lcc` | 可靠性经济性指标分配、方案对比、全寿命周期评估、维修方案 |
| 等寿命设计 | `/lifetime` | 部件等寿命优化 |
| 系统管理 | `/system` | 部门、用户、角色、菜单、数据权限、插件 |
| 监控 / 日志 / 调度 | `/monitor`、`/log`、`/scheduler` | 在线用户、服务与 Redis、登录与操作日志、定时任务 |

## Weibull 导入分析

页面：

- 项目列表：`/fitting/weibull-import/list`
- 项目详情：`/fitting/weibull-import/:id`（菜单中隐藏）

列表字段与可靠性框图项目对齐：项目名称、产品型号、任务类型、任务描述（接口字段 `description`）、创建人、创建时间、更新时间、操作。导入按钮在项目详情页，上传 Excel 后由后端解析入库。

模板文件：`apps/web-antd/public/删失数据集导入配置.xlsx`

- 「配置表」为数据表，后端只解析这一张
- 「填表说明」不参与解析
- 运行时间：整数或小数
- 状态标签：仅 `failure` 或 `suspension`
- 导入覆盖该项目下已有删失数据

前端接口封装在 `apps/web-antd/src/api/weibull-project.ts`。后端需实现：

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| GET | `/api/v1/fitting/weibull-projects` | 分页列表。查询参数：`page`、`size`，可选 `model`、`task_type`、`created_by` |
| GET | `/api/v1/fitting/weibull-projects/{id}` | 项目详情 |
| POST | `/api/v1/fitting/weibull-projects` | 新建。JSON：`name`、`model`、`task_type` 必填，`description` 可选 |
| PUT | `/api/v1/fitting/weibull-projects/{id}/basic-info` | 更新基本信息 |
| DELETE | `/api/v1/fitting/weibull-projects` | 批量删除。JSON：`{ "pks": [1, 2] }` |
| POST | `/api/v1/fitting/weibull-projects/{id}/import` | 上传 Excel。`multipart/form-data`，字段名 `file` |

列表响应需包含 `items`、`page`、`size`、`total`、`total_pages`。单项字段：`id`、`name`、`description`、`model`、`task_type`、`created_by`、`created_time`、`updated_time`。

导入响应：`total_rows`、`success_rows`、`failed_rows`、`errors`（字符串数组）。

## 技术基线

- Vue 3、TypeScript、Vite、Ant Design Vue、Vben Admin 5.5.9
- 可靠性框图画布使用 LogicFlow
- 包管理：pnpm workspace + Turbo
