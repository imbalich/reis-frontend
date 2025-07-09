import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Datamanage',
    path: '/datamanage',
    meta: {
      title: '基础数据管理',
      icon: 'material-symbols:dataset',
      order: 5,
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
      {
        name: 'Product',
        path: 'product',
        component: () => import('#/views/datamanage/product/index.vue'),
        meta: {
          title: '产品信息数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'Repair',
        path: 'repair',
        component: () => import('#/views/datamanage/repair/index.vue'),
        meta: {
          title: '造修阶段数据管理',
          icon: 'material-symbols:table-view',
        },
      },
      {
        name: 'Replace',
        path: 'replace',
        component: () => import('#/views/datamanage/replace/index.vue'),
        meta: {
          title: '必换件数据管理',
          icon: 'material-symbols:table-view',
        },
      },
    ],
  },
];

export default routes;
