import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Rcm',
    path: '/rcm',
    meta: {
      title: 'RCM管理',
      icon: 'material-symbols:engineering',
      order: 6,
    },
    children: [
      {
        name: 'RcmBaseData',
        path: '/rcm/base-data',
        component: () => import('#/views/rcm/base-data/index.vue'),
        meta: {
          title: 'RCM基础数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'RcmCalculation',
        path: '/rcm/calculation',
        component: () => import('#/views/rcm/calculation/index.vue'),
        meta: {
          title: 'RCM计算结果',
          icon: 'material-symbols:analytics',
        },
      },
    ],
  },
];

export default routes;
