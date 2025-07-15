import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Fitting',
    path: '/fitting',
    meta: {
      title: '寿命统计推断',
      icon: 'ant-design:dot-chart-outlined',
      order: 6,
    },
    children: [
      {
        name: 'Curve',
        path: 'curve',
        component: () => import('#/views/fitting/curve/index.vue'),
        meta: {
          title: '曲线拟合',
          icon: 'ant-design:line-chart-outlined',
        },
      },
    ],
  },
];

export default routes;
