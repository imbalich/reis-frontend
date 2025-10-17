import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'lcc',
    path: '/lcc',
    meta: {
      title: '设计模块',
      icon: 'ant-design:dot-chart-outlined',
      order: 9,
    },
    children: [
      {
        name: 'Assign',
        path: '/lcc/assign',
        component: () => import('#/views/lcc/assign/index.vue'),
        meta: {
          title: '可靠性经济型指标分配',
          icon: 'ant-design:line-chart-outlined',
        },
      },
      {
        name: 'assign_compare',
        path: '/lcc/assign_compare',
        component: () => import('#/views/lcc/assign_compare/index.vue'),
        meta: {
          title: '多设计方案可靠性经济性对比分析',
          icon: 'ant-design:line-chart-outlined',
        },
      },
      {
        name: 'cycle_life',
        path: '/lcc/cycle_life',
        component: () => import('#/views/lcc/cycle_life/index.vue'),
        meta: {
          title: '各部件全寿命周期可靠性经济性评估',
          icon: 'ant-design:line-chart-outlined',
        },
      },
      {
        name: 'repair_plan',
        path: '/lcc/repair_plan',
        component: () => import('#/views/lcc/repair_plan/index.vue'),
        meta: {
          title: '维修方案制定',
          icon: 'ant-design:line-chart-outlined',
        },
      },
    ],
  },
];

export default routes;
