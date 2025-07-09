import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Sense',
    path: '/sense',
    meta: {
      title: '敏感因素分析',
      icon: 'ant-design:medium-circle-filed',
      order: 7,
    },
    children: [
      {
        name: 'Sort',
        path: 'sort',
        component: () => import('#/views/sense/sort/index.vue'),
        meta: {
          title: '故障关键影响要素',
          icon: 'ant-design:line-chart-outlined',
        },
      },
    ],
  },
];
export default routes;
