import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Sense',
    path: '/sense',
    meta: {
      title: '敏感因素分析',
      icon: 'ant-design:medium-circle-filled',
      order: 7,
    },
    children: [
      {
        name: 'SortSense',
        path: '/sense/sort',
        component: () => import('#/views/sense/sort/index.vue'),
        meta: {
          title: '故障影响要素',
          icon: 'ant-design:signal-filled',
        },
      },
    ],
  },
];
export default routes;
