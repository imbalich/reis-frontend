import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Datamanage',
    path: '/datamanage',
    meta: {
      title: '基础数据管理',
      icon: 'material-symbols:dataset',
      order: 6,
    },
    children: [
      {
        name: 'Despatch',
        path: 'despatch',
        component: () => import('#/views/datamanage/despatch/index.vue'),
        meta: {
          title: '发运数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'Failure',
        path: 'failure',
        component: () => import('#/views/datamanage/failure/index.vue'),
        meta: {
          title: '故障数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'Ebom',
        path: 'ebom',
        component: () => import('#/views/datamanage/ebom/index.vue'),
        meta: {
          title: 'Ebom数据管理',
          icon: 'material-symbols:table-view',
        },
      },
    ],
  },
];

export default routes;
