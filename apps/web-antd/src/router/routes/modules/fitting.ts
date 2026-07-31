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
        name: 'WeibullImportList',
        path: '/fitting/weibull-import/list',
        component: () =>
          import('#/views/fitting/weibull-import/list/index.vue'),
        meta: {
          title: '导入分析项目',
          icon: 'ant-design:folder-open-outlined',
        },
      },
      {
        name: 'WeibullImportDetail',
        path: '/fitting/weibull-import/:id',
        component: () =>
          import('#/views/fitting/weibull-import/detail/index.vue'),
        meta: {
          title: '项目详情',
          hideInMenu: true,
          keepAlive: true,
        },
      },
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
        name: 'CurveFitAaron',
        path: '/fitting/curve-aaron',
        component: () => import('#/views/fitting/curve-aaron/index.vue'),
        meta: {
          title: '寿命曲线拟合-Aaron',
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
