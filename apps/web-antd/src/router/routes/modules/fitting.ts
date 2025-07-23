import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Fitting',
    path: '/fitting',
    meta: {
      title: 'Weibull',
      icon: 'ant-design:dot-chart-outlined',
      order: 6,
    },
    children: [
      {
        name: 'CurveFit',
        path: '/fitting/curve',
        component: () => import('#/views/fitting/curve/index.vue'),
        meta: {
          title: '寿命曲线拟合',
          icon: 'ant-design:line-chart-outlined',
        },
      },
      {
        name: 'OptFit',
        path: '/fitting/opt',
        component: () => import('#/views/fitting/opt/index.vue'),
        meta: {
          title: '最佳维护周期',
          icon: 'ant-design:line-chart-outlined',
        },
      },
    ],
  },
];

export default routes;
