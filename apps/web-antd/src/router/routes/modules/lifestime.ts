import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Lifetime',
    path: '/lifetime',
    meta: {
      title: '等寿命设计',
      icon: 'ant-design:dot-chart-outlined',
      order: 9,
    },
    children: [
      {
        name: 'equal_lifetime',
        path: '/lifetime/equal_lifetime',
        component: () => import('#/views/lifetime/equal_lifetime/index.vue'),
        meta: {
          title: '部件等寿命优化',
          icon: 'ant-design:line-chart-outlined',
        },
      },
    ],
  },
];

export default routes;
