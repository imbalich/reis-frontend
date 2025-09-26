import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Degrade',
    path: '/degrade',
    meta: {
      title: '参数退化评估',
      icon: 'ant-design:dot-chart-outlined',
      order: 9,
    },
    children: [
      {
        name: 'DegradeFit',
        path: '/degrade/fit',
        component: () => import('#/views/degrade/fit/index.vue'),
        meta: {
          title: '退化曲线拟合',
          icon: 'ant-design:line-chart-outlined',
        },
      },
    ],
  },
];

export default routes;
